// Renders the approval packet (letter + form + citation appendix + verification summary) as a PDF.
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// Standard PDF fonts only cover WinAnsi; map common Unicode punctuation to ASCII.
const ascii = (s = "") =>
  String(s)
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/…/g, "...")
    .replace(/§/g, "Sec. ")
    .replace(/×/g, "x")
    .replace(/Σ\s?/g, "sum of ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");

export async function packetPdf(caseObj, patient) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const W = 595.28;
  const H = 841.89;
  const M = 50;
  let page = pdf.addPage([W, H]);
  let y = H - M;

  const newPage = () => {
    page = pdf.addPage([W, H]);
    y = H - M;
  };
  const write = (text, { font = regular, size = 10, color = rgb(0.12, 0.14, 0.2), indent = 0, gap = 4 } = {}) => {
    const maxWidth = W - 2 * M - indent;
    const words = ascii(text).split(/\s+/);
    let line = "";
    const flush = () => {
      if (y < M + size) newPage();
      page.drawText(line, { x: M + indent, y, size, font, color });
      y -= size + gap;
      line = "";
    };
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
        flush();
        line = w;
      } else line = next;
    }
    if (line) flush();
  };
  const space = (n = 6) => (y -= n);

  // Banner
  page.drawRectangle({ x: 0, y: H - 28, width: W, height: 28, color: rgb(0.15, 0.33, 0.88) });
  page.drawText("AUTHPROOF  |  SYNTHETIC DATA / MOCK POLICY  |  DEMO ONLY", { x: M, y: H - 19, size: 9, font: bold, color: rgb(1, 1, 1) });
  y = H - 60;

  // Letter (markdown subset)
  for (const raw of caseObj.packet.letter.split("\n")) {
    const line = raw.replace(/\*\*/g, "");
    if (!line.trim()) {
      space(4);
      continue;
    }
    if (raw.startsWith("# ")) write(line.slice(2), { font: bold, size: 16, gap: 8 });
    else if (raw.startsWith("## ")) {
      space(6);
      write(line.slice(3).toUpperCase(), { font: bold, size: 10.5, gap: 5 });
    } else if (raw.startsWith("- ")) write(`- ${line.slice(2)}`, { indent: 10 });
    else write(line);
  }

  // Form
  newPage();
  write("Prior Authorization Request Form", { font: bold, size: 14, gap: 10 });
  for (const [k, v] of Object.entries(caseObj.packet.form)) {
    write(`${k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}: ${v}`, { size: 10 });
  }

  // Citations
  space(12);
  write("Evidence Citations (verified verbatim against the chart)", { font: bold, size: 14, gap: 10 });
  for (const c of caseObj.packet.citations) {
    write(`[${c.n}] "${c.quote}"`, { font: italic, size: 9.5, indent: 0, gap: 2 });
    write(`${c.docTitle}, characters ${c.start}-${c.end}`, { size: 8.5, indent: 14, color: rgb(0.45, 0.48, 0.55), gap: 6 });
  }

  // Verification summary
  space(12);
  write("Verification Summary", { font: bold, size: 14, gap: 10 });
  if (caseObj.readiness) write(`Readiness Score: ${caseObj.readiness.score}/100 (${caseObj.readiness.formula})`, { size: 9.5 });
  if (caseObj.verifier) {
    write(`Verifier: ${caseObj.verifier.status}`, { size: 9.5 });
    for (const ch of caseObj.verifier.checks) write(`${ch.pass ? "[PASS]" : "[FAIL]"} ${ch.label} (${ch.detail})`, { size: 9, indent: 10 });
  }
  if (caseObj.adversarial) write(`Simulated payer review: ${caseObj.adversarial.status === "SURVIVED" ? "survived, no valid denial reason left" : "would be denied"}`, { size: 9.5 });
  if (caseObj.approval) write(`Approved by ${caseObj.approval.by} at ${caseObj.approval.at}`, { size: 9.5 });
  else write("Not yet approved by a human reviewer.", { size: 9.5, font: italic });

  // Footer on every page
  const pages = pdf.getPages();
  pages.forEach((p, i) =>
    p.drawText(ascii(`${caseObj.id} | ${patient.name} | Page ${i + 1} of ${pages.length} | Administrative decision support, not a diagnosis`), {
      x: M,
      y: 24,
      size: 7.5,
      font: regular,
      color: rgb(0.5, 0.52, 0.58),
    })
  );
  return pdf.save();
}
