export type Status100 = "Not Started" | "In Progress" | "At Risk" | "Blocked" | "Complete";

export interface Task100 {
  id: string;
  description: string;
  dueDate: string;
  owner: string;
  status: Status100;
  notes: string;
}

export interface Workstream100 {
  id: string;
  name: string;
  leader: string;
  goal: string;
  flagshipGoal: string;
  tasks: Task100[];
}

export const KEY_DATES = [
  { label: "Transaction Close", date: "Jun 23, 2026" },
  { label: "Day 14",            date: "Jul 7, 2026" },
  { label: "Day 30",            date: "Jul 23, 2026" },
  { label: "Q2 Board Meeting",  date: "Aug 7, 2026" },
  { label: "Day 60",            date: "Aug 22, 2026" },
  { label: "Day 90",            date: "Sep 21, 2026" },
  { label: "Day 100",           date: "Oct 1, 2026" },
];

export const FLAGSHIP_GOALS = [
  { id: "growth",    label: "1 · Growth" },
  { id: "one-team",  label: "2 · One Team" },
  { id: "remission", label: "3 · Remission" },
  { id: "category",  label: "4 · Category Leadership" },
  { id: "other",     label: "5 · Other" },
];

export const WORKSTREAMS_100: Workstream100[] = [
  // ── 1. GROWTH ────────────────────────────────────────────────────────────
  {
    id: "dtc",
    name: "Growth — DTC",
    leader: "Derek",
    flagshipGoal: "1 · Growth",
    goal: "The combined network is driving aggressive new customer growth (<$450 CAC, >3:1 LTV:CAC) with interventional mix above 70% across all new customer cohorts as rapidly as possible.",
    tasks: [
      { id: "dtc-1",  description: "Complete evaluation of MHS growth-engine and deliver written diagnosis", dueDate: "Jul 10, 2026", owner: "Derek", status: "In Progress", notes: "DF: Substantially done, sharing soon." },
      { id: "dtc-2",  description: "Fix SMS/email opt-in capture across all MHS forms & intake", dueDate: "ASAP", owner: "Jen / Sydney", status: "In Progress", notes: "" },
      { id: "dtc-3",  description: "Exit Strategy Collective (after account ownership verified, continuity re: LegitScript + Ours Privacy, etc.) and transition to Matchnode for one unified approach", dueDate: "Aug 15, 2026", owner: "Derek / Emery", status: "In Progress", notes: "DF: Meeting w/ Matchnode tomorrow to understand ramp up options + will need to give notice to Strategy Collective by July 15th (30-day notice)." },
      { id: "dtc-4",  description: "Ramp Matchnode spend and optimize for correct endpoint (interventional appointment if possible, consult completed if not — NOT just 'lead')", dueDate: "Aug 15, 2026", owner: "Derek / Emery", status: "Not Started", notes: "" },
      { id: "dtc-5",  description: "Deploy Radial signup & booking flow including supporting infrastructure (benefits verification, AI customer agent) to MHS clinic network — especially booking discovery calls vs. direct calls/follow-ups", dueDate: "TBD", owner: "Carlene / Derek", status: "Not Started", notes: "DF: This likely needs to be piloted first." },
      { id: "dtc-6",  description: "Once NPS measurement is in place (dependency), get review engine going across all clinics", dueDate: "Aug 15, 2026", owner: "Jen / Carlene", status: "Not Started", notes: "" },
      { id: "dtc-7",  description: "Standardize CAC, LTV:CAC, and interventional-mix KPIs by clinic, customer, and channel cohort", dueDate: "Aug 15, 2026", owner: "Mackensie", status: "Not Started", notes: "" },
      { id: "dtc-8",  description: "Create one big trusted dashboard spanning both networks", dueDate: "Aug 15, 2026", owner: "Mackensie", status: "Not Started", notes: "" },
      { id: "dtc-9",  description: "Create and track clinic-by-clinic capacity across all clinics, and increasingly tie that information back automatically into paid spend", dueDate: "Sep 15, 2026", owner: "Mackensie", status: "Not Started", notes: "DF: Could split this one in two." },
      { id: "dtc-10", description: "Resolve HubSpot / Customer.io LCM plans and integration", dueDate: "Sep 15, 2026", owner: "Jen / Mackensie", status: "Not Started", notes: "" },
      { id: "dtc-11", description: "Pending brand decision: update/improve MHS website (also social media)", dueDate: "Sep 15, 2026", owner: "Derek / Jen", status: "Not Started", notes: "" },
      { id: "dtc-12", description: "Pending brand decision: decide on content & SEO/GEO plan for MHS", dueDate: "Sep 15, 2026", owner: "Derek / Emery", status: "Not Started", notes: "" },
      { id: "dtc-13", description: "Pending brand decision: launch MHS lifecycle v1", dueDate: "TBD", owner: "Derek / Mackensie", status: "Not Started", notes: "" },
      { id: "dtc-14", description: "Evaluate low-hanging-fruit opportunities in existing MHS panel (e.g. SAINT deployment, SWIFT protocol scaling in WA/CA, 2x/day TMS)", dueDate: "TBD", owner: "", status: "Not Started", notes: "" },
      { id: "dtc-15", description: "Develop prioritized new intervention roadmap (PRISM, Proliv-Rx, SAINT, COMP360, MDMA) targeting outcome and interventional-mix improvement", dueDate: "TBD", owner: "", status: "Not Started", notes: "" },
    ],
  },
  {
    id: "b2b",
    name: "Growth — B2B Provider Referrals",
    leader: "Jonathan",
    flagshipGoal: "1 · Growth",
    goal: "Be community provider of choice — measured by 25% growth per year in external provider referrals and new patient conversions.",
    tasks: [
      { id: "b2b-1", description: "Implement Regional Market Strategy Growth Forum", dueDate: "", owner: "", status: "Not Started", notes: "" },
    ],
  },
  {
    id: "ltc",
    name: "Growth — Lead to Consult Conversion",
    leader: "Dulce",
    flagshipGoal: "1 · Growth",
    goal: "Lead to scheduled consult conversion rate of 50%+ · Scheduled to kept consult conversion rate of 85%+ · Kept consult to interventional start conversion rate of 80%+ · 70%+ of first appointments are interventional consults",
    tasks: [],
  },
  {
    id: "ops-excellence",
    name: "Growth — Operational Excellence",
    leader: "Mark",
    flagshipGoal: "1 · Growth",
    goal: "Achieve Field CM% ≥30 · Achieve MHS Network EBITDA >$3M · Achieve <35% Clinician Expense / Revenue · Achieve ≥97% Cash to Revenue",
    tasks: [
      { id: "oe-1", description: "Evaluate Radial RCM and create plan for transition to Arietis RCM vendor", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "oe-2", description: "Transition Radial Clinics into Daily Demand vs Capacity (Sales/Ops)", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "oe-3", description: "Transition Radial Clinics into Weekly Clinic Profitability Improvement Forum", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "oe-4", description: "Transition Radial Practice Leaders into Service Line Product Review Forums", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "oe-5", description: "Transition Radial Practice Leaders into Weekly RVP Call", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "oe-6", description: "Transition Radial Key Leadership to Real Estate Review Meeting", dueDate: "", owner: "", status: "Not Started", notes: "" },
    ],
  },
  {
    id: "product-data",
    name: "Product, Data & Clinical Innovation",
    leader: "Carlene",
    flagshipGoal: "1 · Growth",
    goal: "Carlene has a roadmap to deploy RadialOS and deliver a high-quality Brain Medicine intake and care journey network-wide, with the data infrastructure and clinical innovation roadmap in place.",
    tasks: [
      { id: "pd-1", description: "Deploy RadialOS at MHS clinics, prioritizing onboarding sequence (target time-to-intake <48 hrs, care journey NPS >80)", dueDate: "", owner: "Carlene", status: "Not Started", notes: "" },
      { id: "pd-2", description: "Build data infrastructure to enable rapid AI agent development across clinical and operational workflows", dueDate: "", owner: "Carlene / Mark", status: "Not Started", notes: "" },
      { id: "pd-3", description: "Define target-state application portfolio and integration roadmap to reduce manual handoffs across systems", dueDate: "", owner: "Carlene / Jordan", status: "Not Started", notes: "MHS currently runs NextGen, Arietis (RCM), and internally-built custom apps (Patient Portal, ClickLocate, ClickPrepare, ClickCredential) alongside Microsoft Great Plains as ERP. Prerequisite to the ERP decision." },
      { id: "pd-4", description: "Scope ERP modernization plan once combined IT operating model is defined (Microsoft Great Plains is legacy, 2029 end-of-life)", dueDate: "", owner: "Sean / Jordan", status: "Not Started", notes: "Joint item with IT & Security workstream." },
      { id: "pd-5", description: "Map clinic-level P&L / utilization dashboard requirements into the RadialOS analytics roadmap", dueDate: "", owner: "Mark / Carlene", status: "Not Started", notes: "Joint item with Operations & Shared Services workstream." },
    ],
  },

  // ── 2. ONE TEAM ──────────────────────────────────────────────────────────
  {
    id: "governance",
    name: "Governance & Cadence",
    leader: "Integration Lead (TBD)",
    flagshipGoal: "2 · One Team",
    goal: "A single, empowered integration lead is running a structured process with clear owners and dates across every workstream by end of Week 2; full leadership alignment achieved Day 1.",
    tasks: [
      { id: "gov-1", description: "Align unified Radial leadership team on the integration plan and workstream structure", dueDate: "", owner: "", status: "In Progress", notes: "" },
      { id: "gov-2", description: "Stand up weekly Integration Steering Committee + workstream lead operating cadence", dueDate: "", owner: "", status: "In Progress", notes: "" },
      { id: "gov-3", description: "Build and maintain a single cross-workstream RAID log (Risks / Actions / Issues / Decisions)", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "gov-4", description: "Resolve brand architecture decision: Mindful brand vs. Radial brand for MHS locations and future de novos", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "gov-5", description: "Confirm timeline/milestones for combined financial plan through EOY '26, ready for Q3 '26 Board Meeting (Fri 9/25)", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "gov-6", description: "Establish workstream-level success metrics and weekly RAG (red/amber/green) reporting template", dueDate: "", owner: "", status: "In Progress", notes: "" },
    ],
  },
  {
    id: "finance",
    name: "Finance & Accounting",
    leader: "Mark / John",
    flagshipGoal: "2 · One Team",
    goal: "A CFO is in the seat with a full financial consolidation roadmap in place through EOY '26 covering budget, unified reporting, treasury, accounting, and tax.",
    tasks: [
      { id: "fin-1", description: "Confirm CFO leadership for the combined entity", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "fin-2", description: "Build bottoms-up budget through EOY '26 incorporating combined revenue and clinic-level P&Ls", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "fin-3", description: "Consolidate and verify financial reporting, reconciling to FDD quality-of-earnings adjustments", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "fin-4", description: "Centralize treasury and month-end close across the combined entity", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "fin-5", description: "Resolve identified debt-like items (~$840K): deferred physician bonus ($207K), GC retainer ($164K), change-in-control severance ($469K)", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "fin-6", description: "Resolve 401(k) self-correction matters; quantify undocumented close-date transaction bonuses", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "fin-7", description: "Resolve unclaimed property / escheat exposure (~$413K of $1.7M patient refund payables likely escheatable; no filings made historically)", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "fin-8", description: "Confirm resolution of CA income/franchise tax notice and review broader state & local filing gaps", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "fin-9", description: "Address payroll tax / worker misclassification exposure — Regional Medical Directors dual-engaged as 1099 (TMS) and W-2 (MHS)", dueDate: "", owner: "", status: "Not Started", notes: "" },
    ],
  },
  {
    id: "it-security",
    name: "IT & Security",
    leader: "Elliot",
    flagshipGoal: "2 · One Team",
    goal: "MHS IT infrastructure is fully assessed with a prioritized remediation roadmap and cost estimate in place; all low-hanging-fruit security items are executed within the 90-day window.",
    tasks: [
      { id: "it-1", description: "Evaluate MHS IT team (4 FTE, operating near capacity) and determine combined leadership structure", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "it-2", description: "Resolve February 2026 phishing-related email compromise incident; determine OCR reporting obligation", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "it-3", description: "Execute quick-win security items: penetration testing, data privacy remediation, domain/ownership cleanup", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "it-4", description: "Assess end-of-life hardware/software and build a device management / enrollment plan", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "it-5", description: "Replace end-of-life network hardware (~11 Meraki switches, 12 access points, 1 firewall); add backup internet at 16 of 22 locations", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "it-6", description: "Define target-state application portfolio and integration roadmap (joint with Product, Data & Clinical Innovation)", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "it-7", description: "Scope Microsoft Great Plains ERP modernization plan (2029 end-of-life)", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "it-8", description: "Establish a HIPAA security risk-management program, including obtaining missing BAAs not provided in diligence", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "it-9", description: "Develop a formal IT strategy, roadmap, and budget for the combined entity", dueDate: "", owner: "", status: "Not Started", notes: "" },
    ],
  },
  {
    id: "people",
    name: "People Services",
    leader: "Abbe",
    flagshipGoal: "2 · One Team",
    goal: "Abbe has a full people and benefits consolidation roadmap in place through EOY '26, including unified payroll, consolidated benefits, and baseline employee NPS measures.",
    tasks: [
      { id: "ppl-1", description: "Remediate I-9 compliance gaps (21 of 25 forms reviewed had errors or missing documentation); require new I-9s Day 1", dueDate: "", owner: "", status: "In Progress", notes: "Audit in process." },
      { id: "ppl-2", description: "Verify and resolve active work-authorization lapse (one employee unauthorized since 2023; two permits expiring Nov 2026)", dueDate: "", owner: "", status: "In Progress", notes: "The individual with the lapse was terminated May 8, 2026. No action needed on those that are still valid." },
      { id: "ppl-3", description: "File delinquent TMS 2024 Form 5500 via the DOL Delinquent Filer Voluntary Compliance Program", dueDate: "", owner: "", status: "Complete", notes: "The form is not delinquent. It was due on June 30, 2026 and was filed." },
      { id: "ppl-4", description: "Audit FLSA exempt/non-exempt classifications network-wide and correct misclassifications", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "ppl-5", description: "Consolidate Rippling / payroll across entities", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "ppl-6", description: "Consolidate benefits programs and plan for next renewal cycle", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "ppl-7", description: "Build a unified employee handbook (merge MHS handbook + TMS Code of Conduct) with CA/WA-specific provisions", dueDate: "", owner: "", status: "In Progress", notes: "The current handbook has all necessary state-specific provisions. Radial handbook with necessary state-specific policies is in process." },
      { id: "ppl-8", description: "Establish baseline employee eNPS measurement (target >80 eNPS per strategic 90-day goal)", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "ppl-9", description: "Support resolution of outstanding employment litigation jointly with Legal & Regulatory (2 CA wage-and-hour class actions; individual claims)", dueDate: "", owner: "", status: "Not Started", notes: "" },
    ],
  },
  {
    id: "legal",
    name: "Legal & Regulatory",
    leader: "Dan / Abbe",
    flagshipGoal: "2 · One Team",
    goal: "Every identified diligence issue has an assigned owner, a remediation plan, a cost estimate, and a target resolution date. Some items (employment litigation, data privacy, tax) will still be in process at Day 90.",
    tasks: [
      { id: "leg-1",  description: "Build master diligence-issue tracker (owner, plan, cost estimate, target date) across tax / labor / privacy / regulatory findings", dueDate: "", owner: "Dan", status: "In Progress", notes: "This workbook should feed directly into that tracker." },
      { id: "leg-2",  description: "Audit and remediate PC/MSO agreement structure (friendly-PC / CPOM model across CA, TX, WA professional corporations)", dueDate: "", owner: "Dan / Betsey", status: "Not Started", notes: "MSAs prohibit the PC from contracting with other management companies and don't provide a no-cause termination right for the PC — worth revisiting post-close." },
      { id: "leg-3",  description: "Complete billing/claims audit follow-up: claims-level reconciliation of Arietis-identified errors; confirm overpayment refund/recoupment disposition", dueDate: "", owner: "Dan / Sean", status: "Not Started", notes: "Coding error rates ran 1.8%–7.2% across reviewed months. Exposure exists under the ACA 60-day overpayment-return rule and False Claims Act." },
      { id: "leg-4",  description: "Clarify incident-to billing practices and confirm CPT/HCPCS compliance for supervised technician/RN services", dueDate: "", owner: "Dan", status: "Not Started", notes: "Company's stated understanding of 'incident-to' billing appears incomplete." },
      { id: "leg-5",  description: "Investigate and remediate the open ketamine theft / controlled-substance handling matter; reinforce two-person loading/waste protocols", dueDate: "", owner: "Dan / Toby", status: "Not Started", notes: "Flagged as an open item in the Mindful 90-Day Goals doc." },
      { id: "leg-6",  description: "Rebuild a formal healthcare regulatory compliance program with a named owner and recurring review cadence", dueDate: "", owner: "Dan", status: "Not Started", notes: "Company acknowledged it does not have 6 years of audit records and that past reviews were 'not standardized.'" },
      { id: "leg-7",  description: "Document a written PDMP / controlled-substance prescribing policy (currently informal/verbal only)", dueDate: "", owner: "Dan / Toby", status: "Not Started", notes: "" },
      { id: "leg-8",  description: "Resolve CCPA compliance gaps and HIPAA documentation deficiencies (missing BAAs, no written de-identification policy)", dueDate: "", owner: "Dan / Jordan", status: "Not Started", notes: "Joint item with IT & Security and Product, Data & Clinical Innovation workstreams." },
      { id: "leg-9",  description: "Engage RSM and outside counsel for targeted tax and regulatory remediation support", dueDate: "", owner: "Dan / Sean", status: "In Progress", notes: "" },
      { id: "leg-10", description: "Confirm legacy litigation insurance coverage (D&O/EPLI policies) for pending and settled wage-hour and discrimination claims", dueDate: "", owner: "Dan / Betsey", status: "Not Started", notes: "Company has not provided evidence of policy coverage for the period the 2023 claim was filed." },
    ],
  },
  {
    id: "comms",
    name: "Communications",
    leader: "John / Derek",
    flagshipGoal: "2 · One Team",
    goal: "We generate at least one Tier 1 earned media mention of the acquisition and deliver an exciting, inspiring message that lands well internally across both teams.",
    tasks: [
      { id: "com-1", description: "Finalize Day-1 internal messaging (shared mission, leadership structure, no-surprises commitments) and proactive FAQ", dueDate: "Jun 24, 2026", owner: "John", status: "Complete", notes: "Should have landed before the external announcement — confirm and archive final version." },
      { id: "com-2", description: "Launch Week-1 external announcement with Tier 1 press exclusive (WSJ / Bloomberg / CNBC) via 120/80 and GC comms team", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "com-3", description: "Plan and execute First-30-Days roadshow: town halls + clinician-specific sessions with Toby/Owen across MHS/Radial locations", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "com-4", description: "Coordinate external brand-architecture announcement timing with Governance and Brain Medicine Brand workstreams", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "com-5", description: "Track earned media coverage and confirm Tier 1 placement status", dueDate: "", owner: "", status: "Not Started", notes: "" },
    ],
  },
  {
    id: "payer",
    name: "Payer Strategy",
    leader: "Jonathan",
    flagshipGoal: "2 · One Team",
    goal: "Jonathan has mapped the combined payer landscape and has initiated at least 2 conversations with key payers about the broader MSO network strategy.",
    tasks: [
      { id: "pay-1", description: "Assess MHS existing strategic payer relationships and contract terms", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "pay-2", description: "Prioritize and schedule meetings with Premera (WA), BCBS (CA), and other key payers re: combined network / MSO strategy", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "pay-3", description: "Define named owner for contracting and credentialing across the combined network going forward", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "pay-4", description: "Confirm Anthem change-of-control notice obligation is satisfied (Provider Agreement Section 9.3.1.2)", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "pay-5", description: "Obtain missing payor contracts not provided in diligence to confirm reimbursement methodology and change-of-control triggers", dueDate: "", owner: "", status: "Not Started", notes: "" },
    ],
  },

  // ── 3. REMISSION ─────────────────────────────────────────────────────────
  {
    id: "clinical-perf",
    name: "Clinician Performance Management",
    leader: "Toby",
    flagshipGoal: "3 · Remission",
    goal: "Toby is running all clinical ops network-wide with zero clinician churn and has an operating model for scale in hand, including current utilization/capacity view and an updated hiring plan through EOY '26.",
    tasks: [
      { id: "cp-1",  description: "Build and execute clinical team transition plan from Owen to Toby (org chart, RACI, comms timeline)", dueDate: "", owner: "Toby / Owen", status: "In Progress", notes: "Coordinate messaging with Communications workstream's clinician-specific roadshow sessions." },
      { id: "cp-2",  description: "Build network-wide clinician capacity plan (coverage and ramp assumptions through EOY '26)", dueDate: "", owner: "Toby / Leah", status: "In Progress", notes: "" },
      { id: "cp-3",  description: "Evaluate existing performance management and credentialing frameworks across the combined clinical team", dueDate: "", owner: "Toby / Carlene", status: "Not Started", notes: "Credentialing team was reduced from 3 to 1 FTE in Apr '26 and is fully outsourcing to an India-based vendor in May '26 — flag continuity risk during transition." },
      { id: "cp-4",  description: "Establish network-wide clinical quality & safety SLAs (questionnaire completion, outcome tracking, safety event reporting)", dueDate: "", owner: "Toby / Leah", status: "Not Started", notes: "" },
      { id: "cp-5",  description: "Establish network-wide operational SLAs (clinician utilization, no-show rates, scheduling turnaround)", dueDate: "", owner: "Toby", status: "Not Started", notes: "" },
      { id: "cp-6",  description: "Build centralized clinical analytics & reporting roadmap (measurement-informed care, real-time outcomes, clinician-level performance)", dueDate: "", owner: "Carlene / Toby", status: "Not Started", notes: "Coordinate with Product, Data & Clinical Innovation workstream." },
      { id: "cp-7",  description: "Remediate absence of formal TMS clinical protocols/SOPs — no overarching clinical policy exists today; providers using individual judgment", dueDate: "", owner: "Toby / Owen", status: "Not Started", notes: "Moderate risk given TMS is billed to federal payors as an interventional procedure." },
      { id: "cp-8",  description: "Confirm esketamine REMS post-dose observation protocol is consistent across SOPs (Driving Restriction Policy states 1.5–2 hrs; REMS requires 2 hrs)", dueDate: "", owner: "Toby", status: "Not Started", notes: "" },
      { id: "cp-9",  description: "Implement formal occupational health & safety program (written IIPP, Cal/OSHA training, bloodborne pathogen training) for interventional procedures", dueDate: "", owner: "Toby / Abbe", status: "Not Started", notes: "4 open workers' comp claims (Sep'24–Mar'26); no OSHA 300 logs or prior inspection records were provided in diligence." },
      { id: "cp-10", description: "Document and standardize technician training/supervision protocols for TMS and ketamine/esketamine administration", dueDate: "", owner: "Toby", status: "Not Started", notes: "No training documentation currently exists for these procedures." },
    ],
  },

  // ── 4. CATEGORY LEADERSHIP ───────────────────────────────────────────────
  {
    id: "brain-medicine",
    name: "Brain Medicine Brand & Research",
    leader: "Owen",
    flagshipGoal: "4 · Category Leadership",
    goal: "Owen has a clear mandate and operating model for the external Brain Medicine brand and research agenda, with a defined scope and roadmap.",
    tasks: [
      { id: "bm-1",  description: "Formalize Owen's role as the external face of Brain Medicine (speaking, publishing, payer/partner relationships)", dueDate: "", owner: "Owen / John", status: "Not Started", notes: "" },
      { id: "bm-2",  description: "Define research roadmap and operating model across the combined network", dueDate: "Jul 10, 2026", owner: "Owen", status: "In Progress", notes: "Owen + Ahmed had kickoff meeting today." },
      { id: "bm-3",  description: "Align on resources and budget required to execute the research roadmap", dueDate: "", owner: "Owen / Sean", status: "Not Started", notes: "" },
      { id: "bm-4",  description: "Resolve brand architecture decision dependency (Mindful vs. Radial brand) — unlocks external announcement and accelerates this entire workstream", dueDate: "", owner: "Derek / Elliot / John", status: "Not Started", notes: "Cross-linked to Governance & Cadence item." },
      { id: "bm-5",  description: "Finalize external communications plan for the Brain Medicine narrative (Tier 1 press, AI-transformation narrative) jointly with Communications", dueDate: "", owner: "Derek / Owen", status: "In Progress", notes: "DF: Plan mostly in place." },
      { id: "bm-6",  description: "Get acquisition announced publicly and secure top-tier coverage", dueDate: "", owner: "Derek / Emery", status: "In Progress", notes: "DF: Press release draft getting feedback right now." },
      { id: "bm-7",  description: "Use acquisition announcement to propel sustained coverage — not just a one-off", dueDate: "", owner: "Derek / Emery", status: "Not Started", notes: "" },
      { id: "bm-8",  description: "Launch new Research Hub", dueDate: "", owner: "Derek / Emery", status: "In Progress", notes: "" },
      { id: "bm-9",  description: "Launch success stories from patients and providers on our site", dueDate: "", owner: "Derek / Emery", status: "In Progress", notes: "" },
      { id: "bm-10", description: "Launch insurance coverage checker", dueDate: "", owner: "Derek / Emery", status: "Not Started", notes: "" },
      { id: "bm-11", description: "Build plan to deploy SAINT to ≥3 existing Mindful Health Solutions clinics", dueDate: "", owner: "Owen / Toby", status: "Not Started", notes: "" },
    ],
  },

  // ── 5. OTHER ─────────────────────────────────────────────────────────────
  {
    id: "misc",
    name: "Miscellaneous",
    leader: "TBD",
    flagshipGoal: "5 · Other",
    goal: "TBD",
    tasks: [
      { id: "misc-1", description: "Align financial hardship policy across the network", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "misc-2", description: "Culture & change management: identify site-level culture champions, communicate corporate values, create baseline employee sentiment, mitigate resistance, recognize behavior, develop consistent visibility plan", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "misc-3", description: "Audit and unify Care Navigation (inbound calls through ongoing patient management) and Practice Manager/Technician structure across all locations; align with HR on staffing model and recruitment", dueDate: "", owner: "", status: "Not Started", notes: "" },
      { id: "misc-4", description: "Conduct in-person clinic aesthetic assessment and audit full customer journey at all 21 MHS locations; score each site on cleanliness, signage, furniture condition, brand alignment, and patient-facing environment quality; develop improvement plan/budget if necessary", dueDate: "", owner: "", status: "Not Started", notes: "" },
    ],
  },
];
