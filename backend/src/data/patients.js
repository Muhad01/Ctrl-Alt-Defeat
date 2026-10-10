// Synthetic patients and clinical documents (no real PHI). Several charts contain
// deliberately planted documentation gaps so the copilot has something to catch.
//
// available:false documents are "outside records" that are not in the chart yet;
// the demo can pull them in from the Gap panel (or they arrive after a denial).

const KHAN = { name: "Imran Khan, MD", specialty: "Orthopedics", npi: "1457382910" };
const ORTIZ = { name: "Daniel Ortiz, MD", specialty: "Spine Surgery", npi: "1639204857" };
const MITCHELL = { name: "Sarah Mitchell, MD", specialty: "Family Medicine", npi: "1982736450" };

const AZIZ = { name: "Farhan Aziz, MD", specialty: "Cardiology", npi: "1720394856" };
const SIDDIQUI = { name: "Ayesha Siddiqui, MD", specialty: "Cardiothoracic Surgery", npi: "1386029475" };
const RAUF = { name: "Nida Rauf, MD", specialty: "Bariatric Surgery", npi: "1593847201" };

export const PATIENTS = [
  {
    id: "P001", mrn: "MRN-100231", name: "Maria Lopez", dob: "1972-03-14", sex: "F", age: 54,
    payer: "BlueRiver Health", planId: "BRH-PPO-GOLD", memberId: "BRH-448812", provider: KHAN,
    defaultOrder: { cpt: "73721", side: "right", reason: "Suspected medial meniscal tear, right knee" },
    scenario: "Strong case: all criteria documented",
  },
  {
    id: "P002", mrn: "MRN-100458", name: "James Carter", dob: "1965-07-02", sex: "M", age: 61,
    payer: "Medicare", planId: "MEDICARE-B", memberId: "1EG4-TE5-MK72", provider: KHAN,
    defaultOrder: { cpt: "73721", side: "left", reason: "Left knee instability, suspected internal derangement" },
    scenario: "Planted gap: physical therapy not documented (record exists outside the chart)",
  },
  {
    id: "P003", mrn: "MRN-100777", name: "Aisha Rahman", dob: "1981-11-23", sex: "F", age: 45,
    payer: "Northstar Insurance", planId: "NSI-HMO-SILVER", memberId: "NSI-220934", provider: ORTIZ,
    defaultOrder: { cpt: "72148", side: null, reason: "Left lumbar radiculopathy" },
    scenario: "Strong lumbar case via failed conservative therapy",
  },
  {
    id: "P004", mrn: "MRN-100912", name: "Robert Chen", dob: "1988-01-30", sex: "M", age: 38,
    payer: "Medicare", planId: "MEDICARE-B", memberId: "4TR2-KL9-QA31", provider: ORTIZ,
    defaultOrder: { cpt: "72148", side: null, reason: "Right foot drop, suspected disc herniation" },
    scenario: "Red-flag pathway: progressive neurological deficit bypasses therapy requirement",
  },
  {
    id: "P005", mrn: "MRN-101045", name: "Fatima Malik", dob: "1959-05-08", sex: "F", age: 67,
    payer: "BlueRiver Health", planId: "BRH-PPO-GOLD", memberId: "BRH-551207", provider: MITCHELL,
    defaultOrder: { cpt: "72148", side: null, reason: "Chronic low back pain" },
    scenario: "Unclear PT duration and missing lumbar X-ray",
  },
  {
    id: "P006", mrn: "MRN-101190", name: "David Okafor", dob: "1976-09-17", sex: "M", age: 50,
    payer: "Northstar Insurance", planId: "NSI-HMO-SILVER", memberId: "NSI-310078", provider: KHAN,
    defaultOrder: { cpt: "73721", side: "right", reason: "Right knee pain, rule out meniscal tear" },
    scenario: "Only 6 of 8 required PT weeks and no knee X-ray",
  },
  {
    id: "P007", mrn: "MRN-101322", name: "Linda Park", dob: "1954-02-11", sex: "F", age: 72,
    payer: "Medicare", planId: "MEDICARE-B", memberId: "7HJ3-WE2-PL56", provider: KHAN,
    defaultOrder: { cpt: "73721", side: "right", reason: "Right knee pain with mechanical symptoms" },
    scenario: "Seeded denial: PT records arrived after submission (appeal demo)",
  },
  {
    id: "P008", mrn: "MRN-101487", name: "Omar Siddiqui", dob: "1968-06-25", sex: "M", age: 58,
    payer: "BlueRiver Health", planId: "BRH-PPO-GOLD", memberId: "BRH-602914", provider: ORTIZ,
    defaultOrder: { cpt: "72148", side: null, reason: "Right lumbar radiculopathy" },
    scenario: "Seeded approved case",
  },
  {
    id: "P009", mrn: "MRN-101533", name: "Hamza Qureshi", dob: "1979-04-19", sex: "M", age: 47,
    payer: "BlueRiver Health", planId: "BRH-PPO-GOLD", memberId: "BRH-713380", provider: KHAN,
    defaultOrder: { cpt: "73721", side: "right", reason: "Suspected medial meniscal tear, right knee" },
    scenario: "Insurer comparison: 4 weeks of physiotherapy fails BlueRiver (6 wks) but passes Indus Health (4 wks)",
  },

  // ── Edge cases ──
  {
    id: "P010", mrn: "MRN-101610", name: "Sana Javed", dob: "1990-08-14", sex: "F", age: 36,
    payer: "Medicare", planId: "MEDICARE-B", memberId: "9QK2-HN4-RT18", provider: KHAN,
    defaultOrder: { cpt: "73721", side: "left", reason: "Left knee instability, suspected lateral meniscal tear" },
    scenario: "Edge: tricky negation ('No improvement despite 8 weeks of physiotherapy' must count as MET) and 'Denies prior imaging' (no X-ray)",
  },
  {
    id: "P011", mrn: "MRN-101722", name: "Bilal Ahmed", dob: "1997-12-03", sex: "M", age: 29,
    payer: "Indus Health", planId: "IHL-CORP-PANEL", memberId: "IHL-480215", provider: ORTIZ,
    defaultOrder: { cpt: "72148", side: null, reason: "Right lumbar radiculopathy" },
    scenario: "Edge: therapy duration written in months ('three months' = 12 weeks); Pakistani mock insurer",
  },
  {
    id: "P012", mrn: "MRN-101834", name: "Ghulam Rasool", dob: "1963-02-27", sex: "M", age: 63,
    payer: "Adamjee Insurance (Health)", planId: "ADAMJEE-GOLD", memberId: "AIC-H-772041", provider: KHAN,
    defaultOrder: { cpt: "73721", side: "right", reason: "Suspected medial meniscal tear, right knee" },
    scenario: "Edge: perfect documentation but real plan says NO: outpatient MRI excluded and age 63 is over Adamjee's limit of 60",
  },
  {
    id: "P013", mrn: "MRN-101946", name: "Nadia Hussain", dob: "1974-06-09", sex: "F", age: 52,
    payer: "EFU Life (Mukammal Sehat)", planId: "EFU-MUKAMMAL-GOLD", memberId: "EFU-MS-330918", provider: ORTIZ,
    defaultOrder: { cpt: "72148", side: null, reason: "Low back pain with red flag features" },
    scenario: "Edge: red flags (history of cancer, weight loss) meet the clinical criterion, but EFU lists pre-existing cancer as inadmissible, so coverage is CONDITIONAL",
  },
  {
    id: "P014", mrn: "MRN-102058", name: "Kamran Ali", dob: "1982-10-21", sex: "M", age: 44,
    payer: "Medicare", planId: "MEDICARE-B", memberId: "2PX7-LM3-ZD90", provider: KHAN,
    defaultOrder: { cpt: "73721", side: "right", reason: "Suspected medial meniscal tear, right knee" },
    scenario: "Edge: a misfiled physio note belongs to 'Kamran Alvi'; the verifier must catch the identity mismatch",
  },
  {
    id: "P015", mrn: "MRN-102170", name: "Zainab Bibi", dob: "1968-03-30", sex: "F", age: 58,
    payer: "Northstar Insurance", planId: "NSI-HMO-SILVER", memberId: "NSI-418822", provider: KHAN,
    defaultOrder: { cpt: "73721", side: "right", reason: "Right knee osteoarthritis, rule out meniscal tear" },
    scenario: "Edge: 8 weeks of PT but the outcome is never stated (UNCLEAR), and only negative exam tests (weak supporting evidence)",
  },
  {
    id: "P016", mrn: "MRN-102282", name: "Usman Tariq", dob: "1985-01-12", sex: "M", age: 41,
    payer: "BlueRiver Health", planId: "BRH-PPO-GOLD", memberId: "BRH-905126", provider: ORTIZ,
    defaultOrder: { cpt: "72148", side: null, reason: "Mechanical backache" },
    scenario: "Edge: every criterion documented, but the diagnosis wording maps to no ICD-10 code; the verifier must flag the coding problem",
  },
  // ───────── Beyond imaging: cardiac, joint replacement and bariatric surgery ─────────
  {
    id: "P017", mrn: "MRN-102117", name: "Tariq Mehmood", dob: "1968-04-11", sex: "M", age: 58,
    payer: "BlueRiver Health", planId: "BRH-PPO-GOLD", memberId: "BRH-603318", provider: SIDDIQUI,
    defaultOrder: { cpt: "33533", side: null, reason: "Three-vessel coronary artery disease with left main stenosis" },
    scenario: "Heart surgery (CABG): complete work-up, all criteria documented",
  },
  {
    id: "P018", mrn: "MRN-102245", name: "Rubina Akhtar", dob: "1974-02-19", sex: "F", age: 52,
    payer: "Northstar Insurance", planId: "NSI-HMO-SILVER", memberId: "NSI-318840", provider: AZIZ,
    defaultOrder: { cpt: "92928", side: null, reason: "Exertional chest pain, suspected coronary artery disease" },
    scenario: "Angioplasty (PCI): no stress test in the chart (report arrives as an outside record), only 3 weeks of medication",
  },
  {
    id: "P019", mrn: "MRN-102388", name: "Saima Khan", dob: "1960-08-27", sex: "F", age: 66,
    payer: "Medicare", planId: "MEDICARE-B", memberId: "7HK2-PL4-RT19", provider: KHAN,
    defaultOrder: { cpt: "27447", side: "right", reason: "Severe primary osteoarthritis of the right knee" },
    scenario: "Knee replacement: 8 weeks of physio fails Medicare (12) but passes Indus Health (6)",
  },
  {
    id: "P020", mrn: "MRN-102461", name: "Imran Butt", dob: "1985-06-03", sex: "M", age: 41,
    payer: "Indus Health", planId: "IHL-CORP-PLUS", memberId: "IHL-772015", provider: RAUF,
    defaultOrder: { cpt: "43644", side: null, reason: "Severe obesity with type 2 diabetes and sleep apnea" },
    scenario: "Gastric bypass: BMI 38.5 passes Indus Health (37.5) but fails BlueRiver (40); Jubilee excludes obesity surgery",
  },
];

export const DOCUMENTS = [
  // ───────── P001 Maria Lopez ─────────
  {
    id: "D001-1", patientId: "P001", type: "progress_note", title: "Orthopedic Progress Note", date: "2026-09-22", available: true,
    text: `ORTHOPEDIC PROGRESS NOTE
Patient: Maria Lopez   DOB: 03/14/1972   Date of visit: 09/22/2026
Provider: Imran Khan, MD (Orthopedics)

Chief complaint: Right knee pain for 4 months.

History of present illness: 54-year-old female with right knee pain for 4 months, worse on stairs and with pivoting. She reports episodes of locking and catching in the right knee about twice a week. Pain is rated 7/10. She completed 8 weeks of physical therapy with minimal relief. She took ibuprofen 600 mg three times daily for 6 weeks without adequate relief.

Physical exam: Right knee with mild effusion. Medial joint line tenderness is present. McMurray test is positive on the right. Lachman test is negative. Range of motion 0 to 110 degrees with pain at end flexion.

Imaging: Weight-bearing X-ray of the right knee on 09/02/2026 shows mild medial joint space narrowing without fracture.

Assessment: Right knee pain with mechanical symptoms, suspected medial meniscal tear of the right knee.

Plan: Request MRI of the right knee without contrast to evaluate for meniscal tear. Continue home exercise program.`,
  },
  {
    id: "D001-2", patientId: "P001", type: "therapy_note", title: "Physical Therapy Discharge Summary", date: "2026-09-10", available: true,
    text: `PHYSICAL THERAPY DISCHARGE SUMMARY
Patient: Maria Lopez   Therapist: Hannah Reed, DPT
Dates of care: 07/14/2026 to 09/08/2026

Patient attended 16 sessions of physical therapy over 8 weeks for right knee pain. Program included quadriceps strengthening, hamstring flexibility and balance training. Patient reports persistent pain with stairs and continued episodes of catching. Functional score improved only slightly. Discharged with a plateau in progress; orthopedic follow-up recommended.`,
  },

  // ───────── P002 James Carter ─────────
  {
    id: "D002-1", patientId: "P002", type: "progress_note", title: "Orthopedic Consultation", date: "2026-09-29", available: true,
    text: `ORTHOPEDIC CONSULTATION
Patient: James Carter   DOB: 07/02/1965   Date of visit: 09/29/2026
Provider: Imran Khan, MD (Orthopedics)

Chief complaint: Left knee pain and instability for 3 months.

History of present illness: 61-year-old male with left knee pain for 3 months after a twisting injury while gardening. He describes the left knee giving way when stepping off curbs. Pain is 6/10 and limits walking to 2 blocks. He took naproxen 500 mg twice daily for 4 weeks with no relief.

Physical exam: Left knee with trace effusion. Lateral joint line tenderness is present. McMurray test is positive laterally. Mild varus alignment.

Imaging: X-ray of the left knee on 09/15/2026 shows preserved joint spaces and no fracture.

Assessment: Left knee pain with instability and mechanical symptoms, suspected lateral meniscal tear of the left knee.

Plan: MRI of the left knee without contrast.`,
  },
  {
    id: "D002-2", patientId: "P002", type: "therapy_note", title: "Outside Records: Physical Therapy Progress Note (Riverside Rehab)", date: "2026-09-12", available: false,
    text: `PHYSICAL THERAPY PROGRESS NOTE — Riverside Rehab
Patient: James Carter   Therapist: Mark Ellison, PT

Patient completed 7 weeks of physical therapy (2 sessions per week) for left knee pain and instability. Treatment included closed-chain strengthening, proprioception and gait training. Patient reports no meaningful improvement in giving-way episodes. Recommend orthopedic re-evaluation and advanced imaging.`,
  },

  // ───────── P003 Aisha Rahman ─────────
  {
    id: "D003-1", patientId: "P003", type: "progress_note", title: "Spine Clinic Note", date: "2026-10-01", available: true,
    text: `SPINE CLINIC NOTE
Patient: Aisha Rahman   DOB: 11/23/1981   Date of visit: 10/01/2026
Provider: Daniel Ortiz, MD (Spine Surgery)

Chief complaint: Low back pain radiating to the left leg for 10 weeks.

History of present illness: 45-year-old female with low back pain radiating down the posterior left leg to the foot for 10 weeks. She completed 6 weeks of physical therapy with persistent radiating pain. She has taken meloxicam 15 mg daily for 4 weeks with inadequate relief. Denies bowel or bladder dysfunction.

Neurological exam: Straight leg raise is positive on the left at 40 degrees. Left ankle reflex is diminished. Strength is 5/5 in bilateral lower extremities. Sensation is decreased in the left S1 dermatome.

Assessment: Left lumbar radiculopathy with sciatica radiating to the left leg, suspected L5-S1 disc herniation.

Plan: MRI of the lumbar spine without contrast to evaluate for nerve root compression and guide possible epidural injection.`,
  },

  // ───────── P004 Robert Chen ─────────
  {
    id: "D004-1", patientId: "P004", type: "progress_note", title: "Urgent Spine Evaluation", date: "2026-10-05", available: true,
    text: `URGENT SPINE EVALUATION
Patient: Robert Chen   DOB: 01/30/1988   Date of visit: 10/05/2026
Provider: Daniel Ortiz, MD (Spine Surgery)

Chief complaint: Low back pain with right leg weakness for 3 weeks.

History of present illness: 38-year-old male with low back pain radiating to the right leg for 3 weeks after lifting furniture. Over the past week he has developed a right foot drop with progressive weakness of ankle dorsiflexion. He trips over his right foot when walking. Denies saddle anesthesia. Denies bowel or bladder dysfunction.

Neurological exam: Strength 3/5 in right ankle dorsiflexion and 4/5 in right great toe extension. Right straight leg raise is positive at 30 degrees. Sensation is decreased over the dorsum of the right foot.

Assessment: Acute right L5 radiculopathy with right foot drop, suspected lumbar disc herniation.

Plan: Urgent MRI of the lumbar spine without contrast. Surgical consultation depending on findings.`,
  },

  // ───────── P005 Fatima Malik ─────────
  {
    id: "D005-1", patientId: "P005", type: "progress_note", title: "Primary Care Visit", date: "2026-09-25", available: true,
    text: `PRIMARY CARE VISIT
Patient: Fatima Malik   DOB: 05/08/1959   Date of visit: 09/25/2026
Provider: Sarah Mitchell, MD (Family Medicine)

Chief complaint: Low back pain for 5 months.

History of present illness: 67-year-old female with chronic low back pain for 5 months, worse with standing and walking. She tried physical therapy in the spring but does not remember how many sessions she attended. She has been taking acetaminophen 1000 mg twice daily, which has not been helpful. No fever. Denies bowel or bladder dysfunction.

Exam: Tenderness over the lower lumbar paraspinal muscles. Straight leg raise is negative bilaterally. Reflexes are symmetric. Strength is 5/5 in the lower extremities.

Assessment: Chronic low back pain, rule out lumbar spinal stenosis.

Plan: MRI of the lumbar spine without contrast.`,
  },

  // ───────── P006 David Okafor ─────────
  {
    id: "D006-1", patientId: "P006", type: "progress_note", title: "Orthopedic Progress Note", date: "2026-09-30", available: true,
    text: `ORTHOPEDIC PROGRESS NOTE
Patient: David Okafor   DOB: 09/17/1976   Date of visit: 09/30/2026
Provider: Imran Khan, MD (Orthopedics)

Chief complaint: Right knee pain for 3 months.

History of present illness: 50-year-old male with right knee pain for 3 months, with intermittent catching. He completed 6 weeks of physical therapy with no improvement. He took ibuprofen 800 mg three times daily for 3 weeks with minimal relief. He has not had knee imaging so far.

Physical exam: Right knee with medial joint line tenderness. McMurray test is equivocal. No effusion.

Assessment: Right knee pain, suspected meniscal tear of the right knee.

Plan: MRI of the right knee without contrast.`,
  },

  // ───────── P007 Linda Park ─────────
  {
    id: "D007-1", patientId: "P007", type: "progress_note", title: "Orthopedic Progress Note", date: "2026-08-18", available: true,
    text: `ORTHOPEDIC PROGRESS NOTE
Patient: Linda Park   DOB: 02/11/1954   Date of visit: 08/18/2026
Provider: Imran Khan, MD (Orthopedics)

Chief complaint: Right knee pain for 5 months.

History of present illness: 72-year-old female with right knee pain for 5 months with locking episodes. She was referred to physical therapy at an outside clinic and those records are not yet available. She uses acetaminophen 500 mg as needed.

Physical exam: Right knee with moderate effusion. Medial joint line tenderness is present. McMurray test is positive.

Imaging: X-ray of the right knee on 08/04/2026 shows moderate medial compartment osteoarthritis.

Assessment: Right knee pain with mechanical symptoms, suspected degenerative medial meniscal tear of the right knee.

Plan: MRI of the right knee without contrast.`,
  },
  {
    id: "D007-2", patientId: "P007", type: "therapy_note", title: "Outside Records: Physical Therapy Summary (Lakeside Rehab)", date: "2026-08-10", available: false,
    text: `PHYSICAL THERAPY SUMMARY — Lakeside Rehab
Patient: Linda Park   Therapist: Priya Nair, DPT
Dates of care: 05/26/2026 to 08/04/2026

Patient completed 10 weeks of physical therapy for right knee pain, 2 sessions per week. Treatment included strengthening, range-of-motion and aquatic therapy. Patient had minimal relief and continued episodes of locking. Discharged to orthopedic care for further evaluation.`,
  },

  // ───────── P009 Hamza Qureshi ─────────
  {
    id: "D009-1", patientId: "P009", type: "progress_note", title: "Orthopedic Progress Note", date: "2026-10-02", available: true,
    text: `ORTHOPEDIC PROGRESS NOTE
Patient: Hamza Qureshi   DOB: 04/19/1979   Date of visit: 10/02/2026
Provider: Imran Khan, MD (Orthopedics)

Chief complaint: Right knee pain for 3 months after a cricket injury.

History of present illness: 47-year-old male with right knee pain for 3 months, with episodes of catching and swelling after playing cricket. He completed 4 weeks of physiotherapy with minimal relief. He took naproxen 500 mg twice daily for 4 weeks with inadequate relief.

Physical exam: Right knee with small effusion. Medial joint line tenderness is present. McMurray test is positive medially.

Imaging: Weight-bearing X-ray of the right knee on 09/20/2026 shows no fracture and preserved joint spaces.

Assessment: Right knee pain with mechanical symptoms, suspected medial meniscal tear of the right knee.

Plan: MRI of the right knee without contrast.`,
  },
  {
    id: "D009-2", patientId: "P009", type: "therapy_note", title: "Updated Physiotherapy Note (City Physio Clinic)", date: "2026-10-08", available: false,
    text: `PHYSIOTHERAPY PROGRESS NOTE — City Physio Clinic
Patient: Hamza Qureshi   Therapist: Sana Iqbal, DPT

Patient has now completed 7 weeks of physiotherapy for right knee pain, 3 sessions per week. Program included quadriceps strengthening, balance work and sport-specific drills. Patient reports persistent catching and no meaningful improvement. Referred back to orthopedics for imaging.`,
  },

  // ───────── P010 Sana Javed (negation edge) ─────────
  {
    id: "D010-1", patientId: "P010", type: "progress_note", title: "Orthopedic Consultation", date: "2026-10-03", available: true,
    text: `ORTHOPEDIC CONSULTATION
Patient: Sana Javed   DOB: 08/14/1990   Date of visit: 10/03/2026
Provider: Imran Khan, MD (Orthopedics)

Chief complaint: Left knee pain for 4 months.

History of present illness: 36-year-old female with left knee pain and episodes of the knee giving way on stairs. No improvement despite 8 weeks of physiotherapy at a community clinic. She takes ibuprofen 400 mg as needed with little relief. Denies prior imaging of the knee.

Physical exam: Left knee with mild effusion. Lateral joint line tenderness is present. McMurray test is positive laterally.

Assessment: Left knee pain with instability, suspected lateral meniscal tear of the left knee.

Plan: MRI of the left knee without contrast.`,
  },

  // ───────── P011 Bilal Ahmed (duration in months) ─────────
  {
    id: "D011-1", patientId: "P011", type: "progress_note", title: "Spine Clinic Note", date: "2026-10-04", available: true,
    text: `SPINE CLINIC NOTE
Patient: Bilal Ahmed   DOB: 12/03/1997   Date of visit: 10/04/2026
Provider: Daniel Ortiz, MD (Spine Surgery)

Chief complaint: Low back pain radiating to the right leg for 4 months.

History of present illness: 29-year-old male with low back pain radiating to the right leg since a fall during a football match. He attended physiotherapy for three months with persistent radiating pain. He took naproxen 500 mg twice daily for 2 weeks with inadequate relief.

Neurological exam: Right straight leg raise is positive at 50 degrees. Strength is 5/5 in both lower extremities. Reflexes are symmetric.

Assessment: Right lumbar radiculopathy with sciatica radiating to the right leg.

Plan: MRI of the lumbar spine without contrast.`,
  },

  // ───────── P012 Ghulam Rasool (real plan exclusion + age limit) ─────────
  {
    id: "D012-1", patientId: "P012", type: "progress_note", title: "Orthopedic Progress Note", date: "2026-10-01", available: true,
    text: `ORTHOPEDIC PROGRESS NOTE
Patient: Ghulam Rasool   DOB: 02/27/1963   Date of visit: 10/01/2026
Provider: Imran Khan, MD (Orthopedics)

Chief complaint: Right knee pain for 5 months.

History of present illness: 63-year-old male with right knee pain and locking episodes for 5 months. He completed 9 weeks of physiotherapy with minimal relief. He took diclofenac 50 mg twice daily for 6 weeks without adequate relief.

Physical exam: Right knee with mild effusion. Medial joint line tenderness is present. McMurray test is positive medially.

Imaging: Weight-bearing X-ray of the right knee on 09/18/2026 shows mild medial joint space narrowing.

Assessment: Right knee pain with mechanical symptoms, suspected medial meniscal tear of the right knee.

Plan: MRI of the right knee without contrast.`,
  },

  // ───────── P013 Nadia Hussain (red flag + inadmissible condition) ─────────
  {
    id: "D013-1", patientId: "P013", type: "progress_note", title: "Spine Clinic Note", date: "2026-10-06", available: true,
    text: `SPINE CLINIC NOTE
Patient: Nadia Hussain   DOB: 06/09/1974   Date of visit: 10/06/2026
Provider: Daniel Ortiz, MD (Spine Surgery)

Chief complaint: Low back pain for 6 weeks with night pain.

History of present illness: 52-year-old female with low back pain for 6 weeks that wakes her at night. She reports unexplained weight loss of 5 kg over two months. She has a history of cancer (breast cancer treated in 2019). She took acetaminophen 1000 mg three times daily for 3 weeks with no relief. No fever.

Neurological exam: Strength is 5/5 in both lower extremities. Reflexes are symmetric. Straight leg raise is negative bilaterally.

Assessment: Low back pain with red flag features, rule out spinal metastasis.

Plan: Urgent MRI of the lumbar spine without contrast.`,
  },

  // ───────── P014 Kamran Ali (misfiled record) ─────────
  {
    id: "D014-1", patientId: "P014", type: "progress_note", title: "Orthopedic Progress Note", date: "2026-10-02", available: true,
    text: `ORTHOPEDIC PROGRESS NOTE
Patient: Kamran Ali   DOB: 10/21/1982   Date of visit: 10/02/2026
Provider: Imran Khan, MD (Orthopedics)

Chief complaint: Right knee pain for 4 months.

History of present illness: 44-year-old male with right knee pain and catching for 4 months.

Physical exam: Right knee with trace effusion. Medial joint line tenderness is present. McMurray test is positive medially.

Imaging: X-ray of the right knee on 09/12/2026 shows no fracture.

Assessment: Right knee pain with mechanical symptoms, suspected medial meniscal tear of the right knee.

Plan: MRI of the right knee without contrast.`,
  },
  {
    id: "D014-2", patientId: "P014", type: "therapy_note", title: "Physical Therapy Summary (scanned, misfiled)", date: "2026-09-20", available: true,
    text: `PHYSICAL THERAPY SUMMARY
Patient: Kamran Alvi   Therapist: Hina Shah, DPT

Patient completed 7 weeks of physical therapy for right knee pain with minimal relief. Discharged to orthopedic follow-up.`,
  },

  // ───────── P015 Zainab Bibi (outcome not stated, weak exam) ─────────
  {
    id: "D015-1", patientId: "P015", type: "progress_note", title: "Orthopedic Progress Note", date: "2026-10-05", available: true,
    text: `ORTHOPEDIC PROGRESS NOTE
Patient: Zainab Bibi   DOB: 03/30/1968   Date of visit: 10/05/2026
Provider: Imran Khan, MD (Orthopedics)

Chief complaint: Right knee pain with intermittent swelling for 6 months.

History of present illness: 58-year-old female with right knee pain. She completed 8 weeks of physical therapy. She walks with a cane outdoors. She takes celecoxib 200 mg daily for 5 weeks.

Physical exam: McMurray test is negative. Lachman test is negative.

Imaging: X-ray of the right knee on 09/28/2026 shows moderate osteoarthritis.

Assessment: Right knee osteoarthritis with pain in the right knee.

Plan: MRI of the right knee without contrast.`,
  },

  // ───────── P016 Usman Tariq (no codable diagnosis) ─────────
  {
    id: "D016-1", patientId: "P016", type: "progress_note", title: "Spine Clinic Note", date: "2026-10-07", available: true,
    text: `SPINE CLINIC NOTE
Patient: Usman Tariq   DOB: 01/12/1985   Date of visit: 10/07/2026
Provider: Daniel Ortiz, MD (Spine Surgery)

Chief complaint: Backache radiating into the buttocks for 8 weeks.

History of present illness: 41-year-old male office worker. He completed 6 weeks of physiotherapy without relief. Ibuprofen 400 mg twice daily for 3 weeks did not help.

Neurological exam: Strength is 5/5 and reflexes are symmetric.

Imaging: Lumbar X-ray on 09/10/2026 shows mild spondylosis.

Assessment: Mechanical backache, rule out spinal stenosis.

Plan: MRI of the lumbar spine without contrast.`,
  },

  // ───────── P008 Omar Siddiqui ─────────
  {
    id: "D008-1", patientId: "P008", type: "progress_note", title: "Spine Clinic Note", date: "2026-09-08", available: true,
    text: `SPINE CLINIC NOTE
Patient: Omar Siddiqui   DOB: 06/25/1968   Date of visit: 09/08/2026
Provider: Daniel Ortiz, MD (Spine Surgery)

Chief complaint: Low back pain radiating to the right leg for 4 months.

History of present illness: 58-year-old male with low back pain radiating to the right leg for 4 months. He completed 8 weeks of physical therapy with persistent symptoms. Naproxen 500 mg twice daily for 6 weeks gave little relief. Denies bowel or bladder dysfunction.

Neurological exam: Right straight leg raise is positive at 45 degrees. Right ankle reflex is diminished. Strength is 5/5. Sensation is decreased along the lateral right foot.

Imaging: Lumbar spine X-ray on 08/30/2026 shows mild degenerative disc disease at L5-S1 without instability.

Assessment: Right lumbar radiculopathy with sciatica radiating to the right leg, suspected L5-S1 disc herniation.

Plan: MRI of the lumbar spine without contrast.`,
  },
  // ───────── P017 Tariq Mehmood (CABG) ─────────
  {
    id: "D017-1", patientId: "P017", type: "progress_note", title: "Cardiology Consultation", date: "2026-09-15", available: true,
    text: `CARDIOLOGY CONSULTATION
Patient: Tariq Mehmood   DOB: 04/11/1968   Date of visit: 09/15/2026
Provider: Farhan Aziz, MD (Cardiology)

Chief complaint: Exertional chest pain for 5 months.

History of present illness: 58-year-old male with type 2 diabetes and hypertension who reports chest tightness on walking 200 meters, relieved by rest (CCS class III angina). Angina persists despite aspirin 75 mg, atorvastatin 80 mg, metoprolol 50 mg twice daily and isosorbide mononitrate 30 mg daily for 4 months.

Investigations: Resting ECG shows sinus rhythm with Q waves in the inferior leads. Exercise stress test on 08/20/2026 was strongly positive for ischemia at 4 METs. Echocardiogram shows a left ventricular ejection fraction of 45% with inferior hypokinesia.

Assessment: Stable angina with coronary artery disease.

Plan: Coronary angiography.`,
  },
  {
    id: "D017-2", patientId: "P017", type: "procedure_report", title: "Cardiac Catheterization Report", date: "2026-09-22", available: true,
    text: `CARDIAC CATHETERIZATION REPORT
Patient: Tariq Mehmood   Date of procedure: 09/22/2026
Operator: Farhan Aziz, MD (Cardiology)

Procedure: Left heart catheterization and selective coronary angiography via the right radial artery.

Findings: The left main coronary artery has a 60% stenosis. The proximal LAD has a 90% stenosis. The right coronary artery has an 80% stenosis in the mid segment. The circumflex has mild irregularities.

Impression: Three-vessel coronary artery disease with significant left main stenosis. Referred for surgical revascularization.`,
  },
  {
    id: "D017-3", patientId: "P017", type: "consult_note", title: "Cardiothoracic Surgery Consultation", date: "2026-09-25", available: true,
    text: `CARDIOTHORACIC SURGERY CONSULTATION
Patient: Tariq Mehmood   Date: 09/25/2026
Provider: Ayesha Siddiqui, MD (Cardiothoracic Surgery)

The case was discussed at the heart team meeting on 09/25/2026 with cardiology and cardiac anesthesia. STS predicted risk of mortality is 1.4%. Creatinine is 1.0 mg/dL and hemoglobin is 13.8 g/dL.

Assessment: Left main and three-vessel coronary artery disease with mildly reduced ejection fraction. The patient is a suitable candidate for CABG.

Plan: Elective coronary artery bypass grafting with left internal mammary artery to LAD.`,
  },

  // ───────── P018 Rubina Akhtar (PCI) ─────────
  {
    id: "D018-1", patientId: "P018", type: "progress_note", title: "Cardiology Clinic Note", date: "2026-09-26", available: true,
    text: `CARDIOLOGY CLINIC NOTE
Patient: Rubina Akhtar   DOB: 02/19/1974   Date of visit: 09/26/2026
Provider: Farhan Aziz, MD (Cardiology)

Chief complaint: Chest pain on exertion for 6 weeks.

History of present illness: 52-year-old female with hypertension who reports central chest pain when climbing stairs, lasting about 5 minutes and easing with rest. She was started on aspirin 75 mg and bisoprolol 5 mg three weeks ago with persistent symptoms.

Investigations: Resting ECG shows normal sinus rhythm with nonspecific T wave changes. Creatinine is 0.9 mg/dL.

Assessment: Chest pain, suspected coronary artery disease.

Plan: Request coronary angiography with angioplasty and stenting if a significant lesion is found.`,
  },
  {
    id: "D018-2", patientId: "P018", type: "test_report", title: "Exercise Stress Test Report (outside cardiology lab)", date: "2026-09-30", available: false,
    text: `EXERCISE STRESS TEST REPORT
Patient: Rubina Akhtar   Date: 09/30/2026
Facility: City Heart Diagnostics

Treadmill exercise stress test (Bruce protocol): the patient exercised for 5 minutes 40 seconds and stopped because of typical chest pain. There was 2 mm horizontal ST depression in leads V4 to V6 at 6 METs.

Impression: Positive stress test for inducible myocardial ischemia.`,
  },

  // ───────── P019 Saima Khan (total knee replacement) ─────────
  {
    id: "D019-1", patientId: "P019", type: "progress_note", title: "Orthopedic Surgery Note", date: "2026-09-18", available: true,
    text: `ORTHOPEDIC SURGERY NOTE
Patient: Saima Khan   DOB: 08/27/1960   Date of visit: 09/18/2026
Provider: Imran Khan, MD (Orthopedics)

Chief complaint: Right knee pain for 3 years, worse over the last year.

History of present illness: 66-year-old female with right knee pain that limits walking to 100 meters and makes stairs difficult. She uses a cane. She completed 8 weeks of physiotherapy with no improvement. She took naproxen 500 mg twice daily with minimal relief. An intra-articular steroid injection in June 2026 gave only short-term benefit.

Physical exam: Varus deformity of the right knee with crepitus. Range of motion 5 to 95 degrees. BMI 31.2.

Imaging: Weight-bearing X-ray of the right knee shows bone-on-bone medial joint space with osteophytes (Kellgren-Lawrence grade 4).

Assessment: Severe primary osteoarthritis of the right knee.

Plan: Right total knee replacement. Medical clearance obtained from her internist on 09/16/2026.`,
  },

  // ───────── P020 Imran Butt (gastric bypass) ─────────
  {
    id: "D020-1", patientId: "P020", type: "consult_note", title: "Bariatric Surgery Consultation", date: "2026-09-20", available: true,
    text: `BARIATRIC SURGERY CONSULTATION
Patient: Imran Butt   DOB: 06/03/1985   Date of visit: 09/20/2026
Provider: Nida Rauf, MD (Bariatric Surgery)

Chief complaint: Severe obesity for more than 10 years.

History of present illness: 41-year-old male with severe obesity, type 2 diabetes on metformin, and obstructive sleep apnea using CPAP at night. Weight 118 kg, height 175 cm, BMI 38.5. He completed a 6-month supervised weight-loss program with a dietitian from January to June 2026 and lost 4 kg but regained it, with no significant improvement.

Psychological evaluation on 09/10/2026 found no contraindication to surgery.

Assessment: Severe obesity with type 2 diabetes and sleep apnea.

Plan: Laparoscopic Roux-en-Y gastric bypass.`,
  },
];
