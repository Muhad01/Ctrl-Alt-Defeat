// 0. Report Reader Agent — turns uploaded reports, scans and photos into chart text, then analyses them.
//
//   .txt/.md/.csv      → read as text
//   .docx              → text via mammoth
//   PDF with text      → text layer via unpdf
//   scanned PDF/images → vision model transcription (Claude reads PDFs natively; other providers get page
//                        images), or offline OCR (Tesseract) when no model is configured
//
// The transcription becomes a normal chart document, so every downstream agent (intake, matcher, letter)
// must still quote it verbatim. The analysis (report type + key findings) keeps only findings whose
// quote is found in the transcribed text.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { callJSON, llmEnabled, aiModeInfo, providerReadsPdf } from "../llm.js";
import { findQuote, splitSentences } from "../utils/text.js";

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "data");
const MAX_PAGES = 8;

const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export function detectMime(name = "", mime = "") {
  const ext = path.extname(name).toLowerCase();
  if (mime && mime !== "application/octet-stream") return mime;
  return { ".pdf": "application/pdf", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".txt": "text/plain", ".md": "text/plain", ".csv": "text/plain", ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }[ext] || "application/octet-stream";
}

export function isSupported(mime) {
  return mime.startsWith("text/") || mime === "application/pdf" || IMAGE_TYPES.has(mime) || mime.includes("wordprocessingml");
}

// ───────────── text extraction ─────────────

async function pdfText(buffer) {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { totalPages, text } = await extractText(pdf, { mergePages: false });
  return { pdf, pages: totalPages, text: text.map((t) => t.trim()).join("\n\n").trim() };
}

async function pdfPageImages(pdf, pages) {
  const { renderPageAsImage } = await import("unpdf");
  const out = [];
  for (let i = 1; i <= Math.min(pages, MAX_PAGES); i++) {
    const png = await renderPageAsImage(pdf, i, { canvasImport: () => import("@napi-rs/canvas"), scale: 2 });
    out.push(Buffer.from(png));
  }
  return out;
}

const TRANSCRIBE_SCHEMA = {
  type: "object",
  properties: {
    document_type: { type: "string" },
    title: { type: "string" },
    report_date: { type: "string" },
    transcription: { type: "string" },
    legibility: { type: "string", enum: ["high", "medium", "low"] },
  },
  required: ["document_type", "title", "report_date", "transcription", "legibility"],
  additionalProperties: false,
};

async function visionTranscribe(images) {
  const out = await callJSON({
    system:
      "You transcribe medical documents (lab reports, imaging reports, ECGs, discharge summaries, prescriptions, handwritten notes) for a prior authorization team. " +
      "Copy the text exactly as written, line by line, including values, units, reference ranges and dates. Do not summarise, correct, translate or add anything. " +
      "Write [illegible] for anything you cannot read. If the document is an image with no text (e.g. an ECG trace or a scan picture), describe only what is printed on it.",
    prompt: "Transcribe this document. report_date is the date printed on it (YYYY-MM-DD) or an empty string.",
    schema: TRANSCRIBE_SCHEMA,
    images,
    maxTokens: 8000,
  });
  return out;
}

let ocrWorker = null;
async function ocr(buffers) {
  const { createWorker } = await import("tesseract.js");
  ocrWorker ??= await createWorker("eng", 1, { cachePath: path.join(DATA_DIR, "tesseract") });
  const texts = [];
  let conf = 0;
  for (const b of buffers) {
    const { data } = await ocrWorker.recognize(b);
    texts.push(data.text.trim());
    conf += data.confidence;
  }
  return { text: texts.join("\n\n"), confidence: Math.round(conf / Math.max(1, buffers.length)) };
}

/** Extract the text of one uploaded file. Returns { text, method, pages?, confidence?, title?, reportDate?, documentType? }. */
export async function extractText({ buffer, name, mime }) {
  const type = detectMime(name, mime);
  if (type.startsWith("text/")) return { text: buffer.toString("utf8").trim(), method: "Plain text" };
  if (type.includes("wordprocessingml")) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer });
    return { text: value.trim(), method: "Word document text" };
  }

  if (type === "application/pdf") {
    const { pdf, pages, text } = await pdfText(buffer);
    if (text.replace(/\s/g, "").length >= 40 * pages) return { text, method: "PDF text layer", pages };
    // Scanned PDF: no usable text layer.
    if (llmEnabled()) {
      const images = providerReadsPdf() ? [{ mime: "application/pdf", data: buffer.toString("base64") }] : (await pdfPageImages(pdf, pages)).map((b) => ({ mime: "image/png", data: b.toString("base64") }));
      const v = await visionTranscribe(images);
      return { text: v.transcription.trim(), method: `Scanned PDF read by ${aiModeInfo().providerLabel} vision (${aiModeInfo().visionModel})`, pages, title: v.title, reportDate: v.report_date, documentType: v.document_type, legibility: v.legibility };
    }
    const o = await ocr(await pdfPageImages(pdf, pages));
    return { text: o.text, method: `Scanned PDF, offline OCR (Tesseract, ${o.confidence}% confidence)`, pages, confidence: o.confidence };
  }

  if (IMAGE_TYPES.has(type)) {
    if (llmEnabled()) {
      const v = await visionTranscribe([{ mime: type, data: buffer.toString("base64") }]);
      return { text: v.transcription.trim(), method: `Image read by ${aiModeInfo().providerLabel} vision (${aiModeInfo().visionModel})`, title: v.title, reportDate: v.report_date, documentType: v.document_type, legibility: v.legibility };
    }
    const o = await ocr([buffer]);
    return { text: o.text, method: `Image, offline OCR (Tesseract, ${o.confidence}% confidence)`, confidence: o.confidence };
  }
  throw new Error(`Unsupported file type: ${type}`);
}

// ───────────── relevance gate: is this a clinical record of THIS patient, relevant to THIS request? ─────────────

const CLINICAL_TERMS = [
  /\bpatient\b/i, /\bdiagnos(is|ed|tic)\b/i, /\bassessment\b/i, /\bimpression\b/i, /\bhistory of\b/i, /\bexamination\b|\bexam\b/i, /\bfindings?\b/i,
  /\btreatment\b/i, /\bmedication\b|\bprescri(bed|ption)\b/i, /\b\d+\s?mg\b/i, /\bblood pressure\b|\bpulse\b|\bheart rate\b/i, /\bhemoglobin\b|\bhaemoglobin\b|\bcreatinine\b|\bglucose\b/i,
  /\bx-ray\b|\bradiograph|\bMRI\b|\bCT\b|\bultrasound\b|\bECG\b|\bEKG\b|\bechocardiogra/i, /\bbiopsy\b|\bpatholog|\bhistolog/i, /\bsurgery\b|\bsurgical\b|\boperation\b/i,
  /\bhospital\b|\bclinic\b|\bward\b/i, /\bsymptoms?\b/i, /\bpain\b/i, /\b(chronic|acute)\b/i, /\btherapy\b/i, /\breference range\b|\bnormal range\b/i,
  /\badmission\b|\bdischarge\b/i, /\bMRN\b|\bDOB\b|date of birth/i, /\bstenosis\b|\bfracture\b|\btumou?r\b|\blesion\b|\binfection\b|\bregurgitation\b/i,
  /\bventricular\b|\bsystolic\b|\bdiastolic\b|\bmitral\b|\baortic\b|\bcoronary\b|\bejection fraction\b/i, /\bmg\/dL\b|\bg\/dL\b|\bmmol\/L\b|\bmmHg\b|\bbpm\b/i,
  /\bphysician\b|\bMD\b|\bDPT\b|\bconsultant\b|\bradiologist\b/i, /\bknee\b|\bhip\b|\bspine\b|\blumbar\b|\babdomen\b|\bchest\b|\bliver\b|\bkidney\b|\brenal\b|\blungs?\b/i,
];
// A clinical record hits at least this many distinct medical term groups (the FYP presentation that
// once slipped through hits 0-1; a five-line echo report hits 5+).
const MIN_CLINICAL_HITS = 3;

/** Name printed on the document ("Patient: Maria Lopez   DOB: …"), or null. */
export function patientNameOnDocument(text) {
  const m = text.match(/\bpatient(?:'s)?(?: name)?\s*[:\-]\s*([A-Za-z][A-Za-z.'\- ]{1,60}?)(?=\s{2,}|\s+(?:DOB|D\.O\.B|Date|Age|MRN|Sex|Gender|ID)\b|[,;\n]|$)/i);
  return m ? m[1].trim() : null;
}

const nameTokens = (n) => new Set(String(n || "").toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter((t) => t.length > 2 && !["mr", "mrs", "ms", "miss", "dr", "the"].includes(t)));

/** true = same person, false = clearly a different name, null = cannot tell. */
export function namesMatch(onDocument, patientName) {
  const a = nameTokens(onDocument);
  const b = nameTokens(patientName);
  if (!a.size || !b.size) return null;
  for (const t of a) if (b.has(t)) return true;
  return false;
}

function ruleRelevance(text, patientName) {
  const hits = CLINICAL_TERMS.filter((re) => re.test(text)).length;
  const clinical = hits >= MIN_CLINICAL_HITS;
  const onDoc = patientNameOnDocument(text);
  const nameOk = namesMatch(onDoc, patientName);
  return {
    clinical,
    patientNameOnDocument: onDoc,
    nameMatches: nameOk,
    relevant: null, // keyword rules cannot judge relevance to the request
    reason: clinical ? `Clinical vocabulary found (${hits} medical term groups).` : `Only ${hits} medical term group(s) found; this does not look like a clinical record.`,
    method: "rules",
  };
}

// ───────────── analysis ─────────────

const DOC_TYPES = [
  ["Lab report", /(hemoglobin|haemoglobin|creatinine|glucose|HbA1c|cholesterol|reference range|platelet|WBC|\bCBC\b|bilirubin|troponin)/i],
  ["ECG", /(\bECG\b|\bEKG\b|electrocardiogra|sinus rhythm|QRS|ST (segment|elevation|depression))/i],
  ["Echocardiogram", /(echocardiogra|ejection fraction|\bLVEF\b|valve area|mean gradient)/i],
  ["Angiography / cath report", /(angiogra|catheteri[sz]ation|\bLAD\b|\bRCA\b|circumflex|stenosis of)/i],
  ["Pathology report", /(biopsy|histopatholog|cytolog|carcinoma|specimen|margins)/i],
  ["Imaging report", /(x-ray|radiograph|\bMRI\b|\bCT\b|ultrasound|impression:|findings:)/i],
  ["Discharge summary", /(discharge summary|date of admission|date of discharge|hospital course)/i],
  ["Prescription", /(\bRx\b|tablet|capsule|once daily|twice daily|\bBD\b|\bTDS\b)/i],
  ["Clinical note", /(history of present illness|chief complaint|assessment|plan:)/i],
];
const ABNORMAL = /(abnormal|elevated|raised|high|low|reduced|decreased|positive|stenosis|occlu|severe|moderate|significant|critical|malignan|carcinoma|fracture|tear|lesion|mass|enlarged|ischemi|infarct|\bH\b|\bL\b|\*)/i;

function ruleAnalysis(text, patientName) {
  const relevance = ruleRelevance(text, patientName);
  if (!relevance.clinical) return { documentType: "Non-clinical document", summary: relevance.reason, keyFindings: [], relevance, method: "rules" };
  const type = DOC_TYPES.find(([, re]) => re.test(text))?.[0] || "Clinical document";
  const findings = splitSentences(text)
    .filter((s) => ABNORMAL.test(s.text) && s.text.length < 260 && !/reference range|^normal range/i.test(s.text))
    .slice(0, 6)
    .map((s) => ({ finding: s.text, quote: s.text, abnormal: true }));
  return { documentType: type, summary: findings.length ? `${findings.length} notable finding(s) flagged by keyword rules.` : "No abnormal findings flagged by keyword rules.", keyFindings: findings, relevance, method: "rules" };
}

const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    is_clinical_document: { type: "boolean" },
    patient_name_on_document: { type: "string" },
    relevant_to_request: { type: "boolean" },
    relevance_reason: { type: "string" },
    document_type: { type: "string" },
    summary: { type: "string" },
    key_findings: {
      type: "array",
      items: {
        type: "object",
        properties: { finding: { type: "string" }, quote: { type: "string" }, abnormal: { type: "boolean" } },
        required: ["finding", "quote", "abnormal"],
        additionalProperties: false,
      },
    },
  },
  required: ["is_clinical_document", "patient_name_on_document", "relevant_to_request", "relevance_reason", "document_type", "summary", "key_findings"],
  additionalProperties: false,
};

async function llmAnalysis(text, procedure, patientName) {
  const out = await callJSON({
    system:
      "You screen one uploaded document for a prior authorization team, then analyse it. " +
      "First decide: is_clinical_document = true only for a medical record (lab or imaging report, ECG, echo, pathology, clinical or discharge note, prescription, referral); false for anything else (presentations, essays, invoices, ID cards, unrelated text). " +
      "patient_name_on_document = the patient name printed on it, or an empty string. " +
      "relevant_to_request = true if the document contains information that bears on whether the requested service is medically necessary for this patient. relevance_reason: one sentence. " +
      "Then give the report type, a two-sentence summary, and up to 8 key findings relevant to the requested service (diagnoses, abnormal values, test results, severity, prior treatments and outcome); none if it is not clinical. " +
      "Each quote must be copied character-for-character from the document. Do not interpret beyond what is written.",
    prompt: `Patient: ${patientName || "unknown"}\nRequested service: ${procedure || "not specified"}\n\n<document>\n${text.slice(0, 30000)}\n</document>`,
    schema: ANALYSIS_SCHEMA,
    effort: "low",
  });
  // Grounding: keep only findings whose quote exists in the report text.
  const keyFindings = out.key_findings.filter((f) => findQuote(text, f.quote)).map((f) => ({ finding: f.finding, quote: findQuote(text, f.quote).quote, abnormal: f.abnormal }));
  // The name check is deterministic when the document prints a "Patient:" line; otherwise use the model's reading.
  const rules = ruleRelevance(text, patientName);
  const onDoc = rules.patientNameOnDocument || out.patient_name_on_document || null;
  const relevance = { clinical: out.is_clinical_document, patientNameOnDocument: onDoc, nameMatches: namesMatch(onDoc, patientName), relevant: out.relevant_to_request, reason: out.relevance_reason, method: aiModeInfo().provider };
  return { documentType: out.document_type, summary: out.summary, keyFindings, dropped: out.key_findings.length - keyFindings.length, relevance, method: aiModeInfo().provider };
}

/** Analyse one extracted document. Returns report type, summary, grounded key findings and a relevance verdict. */
export async function analyseText(text, procedure, patientName) {
  if (!text?.trim()) return { documentType: "Unreadable document", summary: "No text could be extracted.", keyFindings: [], relevance: { clinical: false, reason: "No text could be extracted.", method: "none" }, method: "none" };
  if (llmEnabled()) {
    try {
      return await llmAnalysis(text, procedure, patientName);
    } catch (err) {
      return { ...ruleAnalysis(text, patientName), error: err.message };
    }
  }
  return ruleAnalysis(text, patientName);
}

/** Why an upload must stay out of the chart (null = it can be used as evidence). */
export function exclusionReason(analysis, patientName) {
  const r = analysis.relevance || {};
  if (r.clinical === false) return `Not a clinical record: ${r.reason}`;
  if (r.nameMatches === false) return `The document names "${r.patientNameOnDocument}", not ${patientName}. It may belong to another patient.`;
  return null;
}
