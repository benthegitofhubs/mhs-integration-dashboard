export const LAST_SYNCED = "Jul 10, 2026, 2:45 PM ET";

export type Status100 = "Not Started" | "In Progress" | "At Risk" | "Blocked" | "Complete";

export interface Task100 {
  id: string;
  description: string;
  dueDate: string;
  startDate?: string;
  percentComplete?: number;
  lastUpdatedPercent?: number;
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
  { label: "Day 30",            date: "Jul 23, 2026" },
  { label: "Next Board Meeting", date: "Aug 7, 2026" },
  { label: "Day 60",            date: "Aug 22, 2026" },
  { label: "Day 90",            date: "Sep 21, 2026" },
  { label: "Day 100",           date: "Oct 1, 2026" },
];

export const FLAGSHIP_GOALS = [
  { id: "growth",    label: "1 · Growth" },
  { id: "one-team",  label: "2 · One Team" },
  { id: "remission", label: "3 · Remission" },
  { id: "mso",       label: "4 · MSO" },
  { id: "category",  label: "5 · Category Leadership" },
];

export const WORKSTREAMS_100: Workstream100[] = [
  // ── 1. GROWTH ────────────────────────────────────────────────────────────
  {
    id: "ai-brain-medicine",
    name: "AI-native Brain Medicine Operating Model",
    leader: "Carlene / Steph / John / Leah",
    flagshipGoal: "1 · Growth",
    goal: "We have become an AI-native Brain Medicine platform — centralizing data, defining deployment safeguards, and deploying our first cohort of ≥3 production AI agents to drive improvement across named KPIs.",
    tasks: [
      { id: "ai-1", description: "Centralize 100% of clinical/operational data into a single data store to establish context for AI transformation", dueDate: "Aug 15, 2026", owner: "", status: "Not Started", notes: "" },
      { id: "ai-2", description: "Develop clinical and operational safeguards/process for secure, safe AI deployment (data access controls, clinical oversight, escalation paths)", dueDate: "TBD", owner: "", status: "Not Started", notes: "" },
      { id: "ai-3", description: "Identify 5 functional leaders to own ongoing testing and deployment of AI infrastructure/tooling", dueDate: "TBD", owner: "", status: "Not Started", notes: "" },
      { id: "ai-4", description: "Define 5 AI agents across those functional areas, each with explicit success KPIs", dueDate: "TBD", owner: "", status: "Not Started", notes: "" },
      { id: "ai-5", description: "Deploy the 5 agents into production and begin measuring against defined KPIs", dueDate: "TBD", owner: "", status: "Not Started", notes: "" },
      { id: "ai-6", description: "Build a culture/change-management plan for how teams engage with the AI toolkit, so adoption scales beyond the initial 5 agents", dueDate: "TBD", owner: "", status: "Not Started", notes: "" },
    ],
  },
  {
    id: "dtc",
    name: "Growth — DTC",
    leader: "Derek",
    flagshipGoal: "1 · Growth",
    goal: "Our combined network is acquiring ≥550 new customers/month by Day 100 (≥20 per clinic/month) while holding blended CAC ≤$450 and LTV:CAC ≥3:1, with >70% of new customer cohorts interventional.",
    tasks: [
      { id: "dtc-1",  description: "Complete evaluation of MHS growth-engine and deliver written diagnosis", dueDate: "Jul 10, 2026", owner: "Derek", status: "In Progress", notes: "DF: Substantially done, sharing soon." },
      { id: "dtc-2",  description: "Fix SMS/email opt-in capture across all MHS forms & intake", dueDate: "ASAP", owner: "Jen / Sydney", status: "In Progress", notes: "" },
      { id: "dtc-3",  description: "Exit Strategy Collective (after account ownership verified, continuity re: LegitScript + Ours Privacy, etc.) and transition to Matchnode for one unified approach", dueDate: "Aug 15, 2026", owner: "Derek / Emery", status: "In Progress", notes: "DF: Meeting w/ Matchnode to understand ramp up options + will need to give notice to Strategy Collective by July 15th (30-day notice)." },
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
    leader: "Sydney / Jonathan",
    flagshipGoal: "1 · Growth",
    goal: "Our combined BD team is unified under one leader with one compensation program, with all BD activity tracked in a single CRM instance and with a consolidated performance dashboard in place.",
    tasks: [
      { id: "b2b-1",  description: "Consolidate two legacy BD sales teams under 1 leader", dueDate: "Aug 3, 2026", owner: "Sydney / Jonathan", status: "Not Started", notes: "Define reporting cadence, owners, review forums, source of truth, and how performance will be managed." },
      { id: "b2b-2",  description: "Consolidate all BD activity into legacy MHS HubSpot CRM", dueDate: "Aug 3, 2026", owner: "Sydney / Jonathan", status: "Not Started", notes: "" },
      { id: "b2b-3",  description: "Implement Regional Market Strategy Growth Forum to identify and implement local market growth plans (BD, Marketing, RVP, PL, RMDs)", dueDate: "Aug 3, 2026", owner: "Sydney", status: "Not Started", notes: "Already established for MHS clinics." },
      { id: "b2b-4",  description: "Integrate compensation and incentive programs (Base/Variable); goal is to move to cash collections from new referrals commission program", dueDate: "TBD", owner: "", status: "Not Started", notes: "" },
      { id: "b2b-5",  description: "Create budget and financial projections for the BD function", dueDate: "Aug 14, 2026", owner: "Sydney / Jonathan", status: "Not Started", notes: "Establish cost of BD function (salaries, travel, marketing materials, CRM, tech) weighted against projected patient volume and revenue generated from referrals." },
      { id: "b2b-6",  description: "Create one referral-to-scheduling process across both organizations so referring providers experience a consistent, white-glove process", dueDate: "Sep 15, 2026", owner: "Sydney / Jonathan", status: "Not Started", notes: "" },
      { id: "b2b-7",  description: "Define ideal BD rep territory size, target referrer segmentation, and prioritized criteria based on volume potential, geography, and specialty fit", dueDate: "Sep 15, 2026", owner: "Sydney / Jonathan", status: "Not Started", notes: "" },
      { id: "b2b-8",  description: "Define sales/outreach process and cadence — from prospecting to first visit to ongoing relationship management, including call/visit frequency benchmarks", dueDate: "Sep 15, 2026", owner: "Sydney / Jonathan", status: "Not Started", notes: "" },
      { id: "b2b-9",  description: "Build combined KPI and reporting dashboards — standardize metrics (referral volume, conversion rates, time-to-intake) across both legacy pipelines", dueDate: "Sep 30, 2026", owner: "Natalie / Accordion / Cascade", status: "In Progress", notes: "Mindful uses HubSpot for referral reporting; Radial uses RadialOS. Need to assess LOE to send RadialOS data to HubSpot for unified reporting." },
      { id: "b2b-10", description: "Consolidate marketing collateral and branding — merge brochures, one-pagers, and digital assets", dueDate: "Sep 30, 2026", owner: "Sydney / Jonathan", status: "Not Started", notes: "Partner with Derek and Jen to understand agency and vendor capabilities." },
      { id: "b2b-11", description: "Sales training — gap analysis and education roadmap", dueDate: "Sep 30, 2026", owner: "Sydney / Jonathan", status: "Not Started", notes: "" },
      { id: "b2b-12", description: "Communicate the MHS acquisition to referral sources — draft a phased communication plan (letter, email, in-person visits)", dueDate: "ASAP — in line with press release", owner: "Sydney / Jonathan", status: "Not Started", notes: "Work with Derek and PR agency to have consistent language." },
      { id: "b2b-13", description: "Retain key referral relationships during transition — identify top 20% referral sources by volume from each legacy org and prioritize personal outreach/retention visits in first 2–4 weeks", dueDate: "Aug 14, 2026", owner: "BD teammates", status: "Not Started", notes: "" },
    ],
  },
  {
    id: "ltc",
    name: "Growth — Lead to Consult Conversion",
    leader: "Dulce / Sydney",
    flagshipGoal: "1 · Growth",
    goal: "Our combined network is converting completed discovery calls to completed intake at ≥60% and completed intake to interventional treatment start at ≥65%, driven by clearer post-intake workflows and more transparent customer-facing information on benefits, pricing, and next steps.",
    tasks: [
      { id: "ltc-1",  description: "Remi evaluation for legacy MHS", dueDate: "Jul 17, 2026", owner: "Sydney / Dulce", status: "In Progress", notes: "Dulce/Sydney demo on 7/8; meeting again with MDHub on 7/10 to discuss next steps." },
      { id: "ltc-2",  description: "RadialOS evaluation for legacy MHS", dueDate: "Jul 17, 2026", owner: "Sydney / Dulce", status: "In Progress", notes: "Meeting scheduled with Carlene to review functionality on 7/10." },
      { id: "ltc-3",  description: "Map the end-to-end customer journey from discovery call through intake scheduling and treatment start", dueDate: "Jul 24, 2026", owner: "Leah / Dulce / Sydney / Ryan", status: "In Progress", notes: "Include all customer touchpoints, handoffs, and drop-off points." },
      { id: "ltc-4",  description: "Evaluate Mindful and Radial Care Navigation playbooks, workflows, scripts, tools, roles, and handoff points", dueDate: "Jul 31, 2026", owner: "Leah / Dulce / Ryan", status: "Not Started", notes: "Evaluate then document current-state assessment across both teams." },
      { id: "ltc-5",  description: "Identify strengths, gaps, and areas of overlap across both Care Navigation models", dueDate: "Jul 31, 2026", owner: "Leah / Dulce / Sydney", status: "Not Started", notes: "Highlight what should be kept, standardized, or improved." },
      { id: "ltc-6",  description: "Define Care Navigation role ownership across new and existing customer workflows", dueDate: "Aug 14, 2026", owner: "Leah / Dulce / Sydney", status: "Not Started", notes: "Clarify responsibilities by customer stage: new lead follow-up, discovery calls, intake scheduling, existing customer support, rescheduling, benefits/pricing questions, PAs and reauthorizations, clinic handoffs, and escalations." },
      { id: "ltc-7",  description: "Standardize discovery call processes and intake scheduling workflows across both teams", dueDate: "Aug 21, 2026", owner: "Leah / Dulce / Sydney", status: "Not Started", notes: "Align on how discovery calls are scheduled, how intake scheduling is completed, and where Remi is integrated." },
      { id: "ltc-8",  description: "Standardize follow-up cadence for customers who do not schedule or complete intake", dueDate: "Aug 28, 2026", owner: "Leah / Dulce / Sydney", status: "Not Started", notes: "Define timing, channel, ownership, and escalation paths; partner with Jen and Derek to evaluate remarketing opportunities." },
      { id: "ltc-9",  description: "Align on written, verbal, and SMS scripts, talk tracks, and templates", dueDate: "Sep 4, 2026", owner: "Leah / Dulce / Sydney", status: "Not Started", notes: "Ensure consistent customer messaging across discovery, scheduling, follow-up, rescheduling, and escalations." },
      { id: "ltc-10", description: "Standardize benefits verification and customer pricing handoffs", dueDate: "Sep 4, 2026", owner: "Leah / Dulce / Sydney", status: "Not Started", notes: "Clarify when BV begins, who communicates updates, and how issues are escalated; explore utilizing Sohar for benefits investigation flow." },
      { id: "ltc-11", description: "Align on unified Care Navigation reporting structure across both organizations", dueDate: "Sep 11, 2026", owner: "Leah / Dulce / Sydney", status: "Not Started", notes: "Define reporting cadence, owners, review forums, source of truth, and how performance will be managed." },
      { id: "ltc-12", description: "Build unified KPI dashboard", dueDate: "Sep 18, 2026", owner: "Leah / Dulce / Sydney", status: "Not Started", notes: "Align on shared metrics, source of truth, ownership, and visibility into funnel performance." },
      { id: "ltc-13", description: "Align cross-functional teams on integration and change management process", dueDate: "Sep 25, 2026", owner: "Leah / Dulce / Sydney / Ryan", status: "Not Started", notes: "Ensure workflow changes are coordinated across Clinic Operations, Clinical, Growth, RCM, Product, and clinic-level teams." },
      { id: "ltc-14", description: "Launch updated care navigation playbook and team training", dueDate: "Sep 25, 2026", owner: "Leah / Dulce / Sydney / Ryan", status: "Not Started", notes: "Ensure both teams are trained on the unified model and have ongoing individual and team-level performance metrics." },
    ],
  },
  {
    id: "ops-excellence",
    name: "Growth — Operational Excellence",
    leader: "Mark",
    flagshipGoal: "1 · Growth",
    goal: "All clinics are managed under one governance process with a single clinic-level ops/financial analytics and monitoring dashboard across the network, and a growth/profitability plan in place for every clinic.",
    tasks: [
      { id: "oe-1", description: "Evaluate Radial RCM and create plan for transition to Arietis RCM vendor", dueDate: "Sep 1, 2026", owner: "", status: "In Progress", notes: "" },
      { id: "oe-2", description: "Transition Radial Clinics into Daily Demand vs Capacity (Sales/Ops)", dueDate: "Jul 10, 2026", owner: "Sydney", status: "In Progress", notes: "" },
      { id: "oe-3", description: "Transition Radial Clinics into Weekly Clinic Profitability Improvement Forum", dueDate: "Jul 9, 2026", owner: "Leah", status: "In Progress", notes: "" },
      { id: "oe-4", description: "Transition Radial Clinic Leadership into Service Line Product Review Forums", dueDate: "Jul 14, 2026", owner: "Sydney", status: "Not Started", notes: "" },
      { id: "oe-5", description: "Transition Radial Practice Leaders into Weekly RVP Call", dueDate: "Jul 21, 2026", owner: "Leah / Brenda / Kyle", status: "Not Started", notes: "" },
      { id: "oe-6", description: "Transition Radial Key Leadership to Real Estate Review Meeting", dueDate: "Aug 3, 2026", owner: "Leah / Josh", status: "Not Started", notes: "" },
    ],
  },
  {
    id: "product-data",
    name: "Product, Data & Clinical Innovation",
    leader: "Carlene",
    flagshipGoal: "1 · Growth",
    goal: "Both organizations are consolidated onto RadialOS — covering discovery, interventional procedure ordering, AI Scribe, and measurement-informed care in an EHR-agnostic fashion — with consolidated analytics and agentic worklist dashboards live across RCM, ClinOps, and clinical care.",
    tasks: [
      { id: "pd-1", description: "Deploy RadialOS at MHS clinics, prioritizing onboarding sequence (target time-to-intake <48 hrs, care journey NPS >80)", dueDate: "Sep 1, 2026", owner: "Carlene", status: "In Progress", notes: "Consolidate HubSpot to MHS's enterprise HIPAA-compliant version and connect to our ecosystem; set up REMI and mdHub scribe workflow for MHS. Working with Elliot and Will on sequencing 'Where is my TMS Tracker' beginning with order entry." },
      { id: "pd-2", description: "Build data infrastructure to enable rapid AI agent development across clinical and operational workflows", dueDate: "Sep 30, 2026", owner: "Steph / Carlene / Mark", status: "In Progress", notes: "Steph built out desired future state for architecture. Will launch RadialMCP for RadialOS mid-July for Radial sites and expand from there. Interim step: ingest spreadsheets/flatfiles from MHS to perform agentic analysis (e.g. their RCM reports)." },
      { id: "pd-3", description: "Define target-state application portfolio and integration roadmap to reduce manual handoffs across systems", dueDate: "Jul 20, 2026", owner: "Carlene / Jordan", status: "In Progress", notes: "MHS currently runs NextGen, Arietis (RCM), and internally-built custom apps (Patient Portal, ClickLocate, ClickPrepare, ClickCredential) alongside Microsoft Great Plains as ERP. Prerequisite to the ERP decision." },
      { id: "pd-4", description: "Map clinic-level P&L / utilization dashboard requirements into the RadialOS analytics roadmap", dueDate: "TBD", owner: "Leah / Steph / Mark / Carlene", status: "Not Started", notes: "Joint item with Operations & Shared Services. Cascade heavily involved." },
      { id: "pd-5", description: "RCM tech stack consolidation", dueDate: "Sep 30, 2026", owner: "Carlene / Steph / Sydney", status: "In Progress", notes: "Ongoing assessment of MHS processes and tools in parallel with launching pilot for PAs and BI/BV with Foresight (built on Stedi) for Radial sites. If pilot goes well, expand to Radial claims processing → MHS claims processing (full clearinghouse migrations for both orgs)." },
    ],
  },

  // ── 2. ONE TEAM ──────────────────────────────────────────────────────────
  {
    id: "finance",
    name: "Finance & Accounting",
    leader: "Mark / Chris / John",
    flagshipGoal: "2 · One Team",
    goal: "We have hired a permanent CFO and built a full financial consolidation roadmap through EOY '26 covering budget, model, unified reporting, treasury, accounting, and tax.",
    tasks: [
      { id: "fin-1", description: "Interim CFO: identified and onboarded", dueDate: "TBD", owner: "Mark / John", status: "Complete", notes: "" },
      { id: "fin-2", description: "Hire permanent CFO", dueDate: "Sep 30, 2026", owner: "Mark / John", status: "In Progress", notes: "Need to identify candidate, conduct interview process (recommend a case study), negotiate contract, and allow for adequate notice/onboarding time." },
      { id: "fin-3", description: "Centralize treasury and cash forecasting", dueDate: "Oct 1, 2026", owner: "Chris", status: "In Progress", notes: "Map out bank accounts; evaluate banking institutions; open accounts at the TIN level; send notices to commercial payors; update POS deposit info; conduct AP out of main central operating account; produce combined 13-week cash forecast." },
      { id: "fin-4", description: "Integrate and consolidate general ledger — move QuickBooks to Great Plains", dueDate: "Sep Close", owner: "Chris", status: "In Progress", notes: "June month-end will be two separate closes done concurrently; goal is July to be consolidated at the Radial level. Legacy Radial Clinics revenue to be restated after cash testing." },
      { id: "fin-5", description: "Convert legacy Radial RCM function to Arietis", dueDate: "Sep 1, 2026", owner: "Katie / Chris", status: "In Progress", notes: "Keep legacy Radial AR worked by RCM team for 90 days. Proposed method: amendment to existing contract at 2.2% variable cost." },
      { id: "fin-6", description: "Consolidate payroll", dueDate: "TBD", owner: "", status: "Not Started", notes: "Payroll needs to be consolidated and handled by Shelby. Recommendation is to truly centralize payroll utilizing MSA agreement (vs. having multiple payrolls for TMS and MHS)." },
      { id: "fin-7", description: "Build consolidated budget through EOY '26 and 2027", dueDate: "Dec 1, 2026", owner: "Chris / CFO", status: "Not Started", notes: "Create consolidated 3-statement budget using bottoms-up, clinic-level approach. Most important output is the cash forecast derived via indirect approach from P&L and BS." },
      { id: "fin-8", description: "Tax: finalize 2025 returns; get landscape of total tax exposure", dueDate: "Q3 2026", owner: "Chris / Pete / WP", status: "Not Started", notes: "Leverage Whitley Penn to assist." },
    ],
  },
  {
    id: "it-security",
    name: "IT & Security",
    leader: "Elliot",
    flagshipGoal: "2 · One Team",
    goal: "We have fully assessed MHS/Radial IT infrastructure with a prioritized remediation roadmap for hardware/software/security; all low-hanging-fruit security items are resolved.",
    tasks: [
      { id: "it-1", description: "Evaluate MHS IT team (4 FTE, operating near capacity) and determine combined leadership structure", dueDate: "Jul 31, 2026", owner: "Elliot", status: "In Progress", notes: "" },
      { id: "it-2", description: "Engage RSM for tactical IT support", dueDate: "Jul 20, 2026", owner: "John / Elliot", status: "Not Started", notes: "" },
      { id: "it-3", description: "Resolve February 2026 phishing-related email compromise incident; determine OCR reporting obligation", dueDate: "TBD", owner: "Elliot / John / Legal", status: "In Progress", notes: "" },
      { id: "it-4", description: "Execute quick-win security items: penetration testing, data privacy remediation, domain/ownership cleanup", dueDate: "TBD", owner: "Elliot / Jordan", status: "Not Started", notes: "" },
      { id: "it-5", description: "Assess end-of-life hardware/software and build a device management / enrollment plan", dueDate: "TBD", owner: "Elliot / Jordan", status: "Not Started", notes: "" },
      { id: "it-6", description: "Replace end-of-life network hardware (~11 Meraki switches, 12 access points, 1 firewall); add backup internet at 16 of 22 locations", dueDate: "TBD", owner: "Elliot / Jordan", status: "Not Started", notes: "" },
      { id: "it-7", description: "Define target-state application portfolio and integration roadmap (joint with Product, Data & Clinical Innovation)", dueDate: "TBD", owner: "Elliot / Jordan", status: "Not Started", notes: "" },
      { id: "it-8", description: "Establish a HIPAA security risk-management program, including obtaining missing BAAs not provided in diligence", dueDate: "TBD", owner: "Elliot / Jordan / Dan", status: "Not Started", notes: "" },
      { id: "it-9", description: "Develop a formal IT strategy, roadmap, and budget for the combined entity", dueDate: "TBD", owner: "Elliot / John / RSM", status: "In Progress", notes: "" },
    ],
  },
  {
    id: "people",
    name: "People Services",
    leader: "Abbe",
    flagshipGoal: "2 · One Team",
    goal: "We have built a unified people and organization foundation — org design, recruiting, policies, and performance management standardized across entities — with total rewards parity underway, benefits renewal in motion for both entities, and a baseline employee NPS for both entities in place.",
    tasks: [
      { id: "ppl-1", description: "Remediate I-9 compliance gaps (21 of 25 forms reviewed had errors or missing documentation); require new I-9s Day 1", dueDate: "Jun 26, 2026", owner: "Abbe", status: "In Progress", notes: "Audit in process with outside counsel for all active MHS teammates." },
      { id: "ppl-2", description: "Verify and resolve active work-authorization lapse (one employee unauthorized since 2023; two permits expiring Nov 2026)", dueDate: "May 8, 2026", owner: "Abbe", status: "Complete", notes: "The individual with the lapse was terminated May 8, 2026. No action needed on those with still-valid permits." },
      { id: "ppl-3", description: "File delinquent TMS 2024 Form 5500 via the DOL Delinquent Filer Voluntary Compliance Program", dueDate: "Jun 30, 2026", owner: "Abbe", status: "Complete", notes: "The form is not delinquent. It was due June 30, 2026 and was filed." },
      { id: "ppl-4", description: "Audit FLSA exempt/non-exempt classifications network-wide and correct misclassifications", dueDate: "Jul 30, 2026", owner: "Abbe", status: "In Progress", notes: "MHS has reviewed 1099 status and has documents prepared to adjust as necessary for physicians. Was on-hold due to the diligence process." },
      { id: "ppl-5", description: "Consolidate Rippling / payroll across entities", dueDate: "Sep 1, 2026", owner: "Abbe", status: "In Progress", notes: "Reviewing both instances of Rippling to understand the appropriate consolidation timeline and mechanism to minimize UX issues for both entities. Reviewing potential cost savings with Rippling contract consolidation." },
      { id: "ppl-6", description: "Consolidate benefits programs and plan for next renewal cycle", dueDate: "Sep 30, 2026", owner: "Abbe", status: "In Progress", notes: "Benefits will remain separate for the 2026–2027 plan year given the timeline of Radial's renewal and the substantial plan differences. Pre-renewal for both entities is in process." },
      { id: "ppl-7", description: "Build a unified employee handbook (merge MHS handbook + TMS Code of Conduct) with CA/WA-specific provisions", dueDate: "Sep 30, 2026", owner: "Abbe", status: "In Progress", notes: "The current handbook has all necessary state-specific provisions for all states where TMS/MHS operate, updated in April. Radial handbook with state-specific policies is in process." },
      { id: "ppl-8", description: "Establish baseline employee eNPS measurement (target >80 eNPS)", dueDate: "Jul 31, 2026", owner: "Abbe", status: "In Progress", notes: "eNPS should be pushed out to Radial; already done for MHS in April. Goal is 7% increase org-wide (by entity initially) with refinement by role ongoing." },
      { id: "ppl-9", description: "Support resolution of outstanding employment litigation jointly with Legal & Regulatory (2 CA wage-and-hour class actions; individual claims)", dueDate: "TBD", owner: "Abbe", status: "In Progress", notes: "In process on all matters; timeline is not easily determined given how litigation progresses." },
    ],
  },
  {
    id: "legal",
    name: "Legal & Regulatory",
    leader: "Dan / Abbe",
    flagshipGoal: "2 · One Team",
    goal: "We have reviewed all identified diligence issues to identify an assigned owner, a remediation plan, a cost estimate and a target resolution date. We have evaluated legal, regulatory and compliance priorities for the combined entities.",
    tasks: [
      { id: "leg-1",  description: "Build master diligence-issue tracker (owner, plan, cost estimate, target date) across tax / labor / privacy / regulatory findings", dueDate: "TBD", owner: "Dan", status: "In Progress", notes: "" },
      { id: "leg-2",  description: "Audit and remediate PC/MSO agreement structure (friendly-PC / CPOM model across CA, TX, WA professional corporations)", dueDate: "TBD", owner: "Dan / Betsey", status: "Not Started", notes: "MSAs prohibit the PC from contracting with other management companies and don't provide a no-cause termination right for the PC — worth revisiting post-close." },
      { id: "leg-3",  description: "Complete billing/claims audit follow-up: claims-level reconciliation of Arietis-identified errors; confirm overpayment refund/recoupment disposition", dueDate: "TBD", owner: "Dan / Sean", status: "Not Started", notes: "Coding error rates ran 1.8%–7.2% across reviewed months. Exposure exists under the ACA 60-day overpayment-return rule and False Claims Act." },
      { id: "leg-4",  description: "Clarify incident-to billing practices and confirm CPT/HCPCS compliance for supervised technician/RN services", dueDate: "TBD", owner: "Dan", status: "Not Started", notes: "Company's stated understanding of 'incident-to' billing appears incomplete." },
      { id: "leg-5",  description: "Investigate and remediate the open ketamine theft / controlled-substance handling matter; reinforce two-person loading/waste protocols", dueDate: "TBD", owner: "Dan / Toby", status: "Not Started", notes: "Flagged as an open item in the Mindful 90-Day Goals doc." },
      { id: "leg-6",  description: "Rebuild a formal healthcare regulatory compliance program with a named owner and recurring review cadence", dueDate: "TBD", owner: "Dan", status: "Not Started", notes: "Company acknowledged it does not have 6 years of audit records and that past reviews were 'not standardized.'" },
      { id: "leg-7",  description: "Document a written PDMP / controlled-substance prescribing policy (currently informal/verbal only)", dueDate: "TBD", owner: "Dan / Toby", status: "Not Started", notes: "" },
      { id: "leg-8",  description: "Resolve CCPA compliance gaps and HIPAA documentation deficiencies (missing BAAs, no written de-identification policy)", dueDate: "TBD", owner: "Dan / Jordan", status: "Not Started", notes: "Joint item with IT & Security and Product, Data & Clinical Innovation workstreams." },
      { id: "leg-9",  description: "Engage RSM and outside counsel for targeted tax and regulatory remediation support", dueDate: "TBD", owner: "Dan / Sean", status: "In Progress", notes: "" },
      { id: "leg-10", description: "Confirm legacy litigation insurance coverage (D&O/EPLI policies) for pending and settled wage-hour and discrimination claims", dueDate: "TBD", owner: "Dan / Betsey", status: "Not Started", notes: "Company has not provided evidence of policy coverage for the period the 2023 claim was filed." },
    ],
  },
  {
    id: "comms",
    name: "Communications",
    leader: "John / Derek",
    flagshipGoal: "2 · One Team",
    goal: "The acquisition announcement launches Brain Medicine as a category — not a roll-up — with Tier 1 exclusive secured (STAT target) and ≥3 Tier 1 placements carrying the Brain Medicine framing with Owen/John as the category voice.",
    tasks: [
      { id: "com-1", description: "Finalize Day-1 internal messaging (shared mission, leadership structure, no-surprises commitments) and proactive FAQ", dueDate: "Jun 24, 2026", owner: "John", status: "Complete", notes: "Should have landed before the external announcement — confirm and archive final version." },
      { id: "com-2", description: "Launch July external announcement with Tier 1 press exclusive (WSJ / Bloomberg / CNBC) via 120/80 and GC comms team", dueDate: "TBD", owner: "Derek / John", status: "In Progress", notes: "See Growth/Brand tabs." },
      { id: "com-3", description: "Plan and execute First-30-Days roadshow: town halls + clinician-specific sessions with Toby/Owen across MHS/Radial locations", dueDate: "Sep 15, 2026", owner: "John", status: "In Progress", notes: "Town Hall (individual + combined all hands) are finished as of 7/9/26; Clinic Roadshow ('Triple C') planning in progress & on track for July/Aug '26." },
    ],
  },

  // ── 3. REMISSION ─────────────────────────────────────────────────────────
  {
    id: "clinical-perf",
    name: "Clinical Excellence",
    leader: "Toby",
    flagshipGoal: "3 · Remission",
    goal: "We have launched a combined medical leadership structure, standardized scheduling and recruitment practices across the combined entity, and defined a single set of clinical/clinical-ops KPIs — with accountability built cross-functionally toward a target of 80% mature clinician utilization — alongside a roadmap for new treatment modalities.",
    tasks: [
      { id: "cp-1",  description: "Build and execute clinical team transition plan from Owen to Toby (org chart, RACI, comms timeline)", dueDate: "TBD", owner: "Toby / Owen", status: "In Progress", notes: "Coordinate messaging with Communications workstream's clinician-specific roadshow sessions." },
      { id: "cp-2",  description: "Build network-wide clinician capacity plan (coverage and ramp assumptions through EOY '26)", dueDate: "Aug 1, 2026", owner: "Toby / Leah", status: "In Progress", notes: "Working on this right now." },
      { id: "cp-3",  description: "Evaluate existing performance management and credentialing frameworks across the combined clinical team", dueDate: "Sep 1, 2026", owner: "COO / Mark / Leah / Sydney", status: "Not Started", notes: "We should have a credentialing team for the combined organization. Credentialing should be owned by operations with clinical leadership in support." },
      { id: "cp-4",  description: "Establish network-wide clinical quality & safety SLAs (questionnaire completion, outcome tracking, safety event reporting)", dueDate: "Oct 1, 2026", owner: "Toby / Leah", status: "Not Started", notes: "" },
      { id: "cp-5",  description: "Establish network-wide operational SLAs (clinician utilization, no-show rates, scheduling turnaround)", dueDate: "Sep 1, 2026", owner: "Toby", status: "In Progress", notes: "Finalizing clinician utilization report with Leah. Next steps: understand clinic and clinician-level unit economics. Need to examine how current tech platforms are driving or hindering clinician workflows — identify bottlenecks and align on streamlined, efficient clinician workflows supported by technology." },
      { id: "cp-6",  description: "Build centralized clinical analytics & reporting roadmap (measurement-informed care, real-time outcomes, clinician-level performance)", dueDate: "Oct 1, 2026", owner: "Carlene / Toby", status: "Not Started", notes: "Coordinate with Product, Data & Clinical Innovation workstream." },
      { id: "cp-7",  description: "Remediate absence of formal TMS clinical protocols/SOPs — no overarching clinical policy exists today; providers using individual judgment", dueDate: "Oct 1, 2026", owner: "Toby / Owen", status: "Not Started", notes: "Moderate risk given TMS is billed to federal payors as an interventional procedure." },
      { id: "cp-8",  description: "Confirm esketamine REMS post-dose observation protocol is consistent across SOPs (Driving Restriction Policy states 1.5–2 hrs; REMS requires 2 hrs)", dueDate: "Sep 1, 2026", owner: "Toby", status: "Not Started", notes: "Mindful has established compliant protocols. Next step is to assess Radial's protocols and proceed as indicated." },
      { id: "cp-9",  description: "Implement formal occupational health & safety program (written IIPP, Cal/OSHA training, bloodborne pathogen training) for interventional procedures", dueDate: "TBD", owner: "Toby / Abbe", status: "Not Started", notes: "4 open workers' comp claims (Sep'24–Mar'26); no OSHA 300 logs or prior inspection records provided in diligence." },
      { id: "cp-10", description: "Document and standardize technician training/supervision protocols for TMS and ketamine/esketamine administration", dueDate: "Sep 1, 2026", owner: "Toby", status: "Not Started", notes: "Mindful has established protocols. Mindful training team will spearhead assessing Radial's SOPs and implement as indicated." },
      { id: "cp-11", description: "Transition Radial Medical Team into weekly Toby Grand Rounds meeting", dueDate: "Jul 17, 2026", owner: "Toby", status: "In Progress", notes: "Starting next week." },
      { id: "cp-12", description: "Transition Radial Clinic Leadership into new clinician Provider Training Program led by Alvin Lau", dueDate: "Sep 1, 2026", owner: "Toby / Alvin", status: "In Progress", notes: "Dr. Lau is meeting with Nogga (Radial training) to start information-sharing process." },
      { id: "cp-13", description: "Move towards a common culture across the combined clinical organization", dueDate: "Oct 1, 2026", owner: "Toby", status: "In Progress", notes: "Culture precedes performance. Starting on the Radial side to understand current culture and opportunities, then building into Radial Ops, then combining Mindful+Radial Clinical-Ops teams and meetings hopefully by Q4." },
      { id: "cp-14", description: "Develop, socialize, and launch a common clinician compensation plan for legacy Radial clinicians more aligned with current Mindful comp plan (base + productivity bonus)", dueDate: "Oct 1, 2026", owner: "Toby / Mark", status: "Not Started", notes: "" },
      { id: "cp-15", description: "Transition PC ownership (Radial) to Toby", dueDate: "Sep 1, 2026", owner: "Toby / Owen / John", status: "Not Started", notes: "" },
    ],
  },

  // ── 4. MSO ───────────────────────────────────────────────────────────────
  {
    id: "payer",
    name: "Payer Strategy",
    leader: "Jonathan",
    flagshipGoal: "4 · MSO",
    goal: "We have engaged with five strategic health plans and validated the product-market fit for the MSO Network's aTMS/Spravato repricing/billing solution, with substantive discussions underway on a national contract and/or alternative payment models.",
    tasks: [
      { id: "pay-1", description: "Assess MHS existing strategic payer relationships and contract terms", dueDate: "TBD", owner: "", status: "In Progress", notes: "" },
      { id: "pay-2", description: "Prioritize and schedule meetings with Premera (WA), Anthem Blue Cross of CA, Carelon, and other key payers re: combined network / MSO strategy", dueDate: "Aug 8, 2026", owner: "Jonathan", status: "In Progress", notes: "Met with Premera on 7/7 with follow-up action items. Meeting scheduled with Anthem/Carelon executive leadership on 8/5." },
      { id: "pay-3", description: "Prioritize and schedule meetings with BCBS of SC, Premera and other key payers re: alternative payment models (case rate, bundled payment, VBC)", dueDate: "Aug 8, 2026", owner: "Jonathan", status: "In Progress", notes: "" },
      { id: "pay-4", description: "Finalize network/MSO marketing material including brochure, presentations, and key messaging", dueDate: "Jul 30, 2026", owner: "Jonathan", status: "In Progress", notes: "Working with BFJ marketing firm." },
      { id: "pay-5", description: "Engage Anthem BCBS / Carelon regarding National Contract", dueDate: "Aug 8, 2026", owner: "Jonathan", status: "In Progress", notes: "" },
      { id: "pay-6", description: "Submit network application with short- and long-term disability insurance carriers", dueDate: "TBD", owner: "Jonathan", status: "Not Started", notes: "" },
    ],
  },

  // ── 5. CATEGORY LEADERSHIP ───────────────────────────────────────────────
  {
    id: "brain-medicine",
    name: "Brain Medicine Brand & Research",
    leader: "Owen",
    flagshipGoal: "5 · Category Leadership",
    goal: "We have established Brain Medicine as an externally-facing category for Radial, with a defined mandate and operating model, an aligned research roadmap and budget, and an active 6-protocol research portfolio across our NY flagship, with at minimum 3 additional sites identified.",
    tasks: [
      { id: "bm-1",  description: "Formalize Owen's role as the external face of Brain Medicine (speaking, publishing, payer/partner relationships)", dueDate: "Jul 23, 2026", owner: "Owen / John", status: "In Progress", notes: "Role settled in practice. Remaining work is documenting the mandate and operating model (scope, decision rights, time split vs. the Toby clinical transition). Ratify by Day 30." },
      { id: "bm-2",  description: "Define research roadmap and operating model across the combined network", dueDate: "Jul 10, 2026", owner: "Owen", status: "In Progress", notes: "Kickoff with Ahmed complete. Write up the roadmap covering the NY protocols and the MHS-site research expansion; circulate v1 by Jul 23." },
      { id: "bm-3",  description: "Align on resources and budget required to execute the research roadmap", dueDate: "Aug 7, 2026", owner: "Owen / Chris", status: "Not Started", notes: "Build the clinical-trial team org chart and budget. Tie to the $2.5M ARR / 30% GM year-end target. Bring the resourcing ask to the Q2 board on 8/7." },
      { id: "bm-4",  description: "Resolve brand architecture decision dependency (Mindful vs. Radial brand) — unlocks external announcement and accelerates this entire workstream", dueDate: "TBD", owner: "Derek / Elliot / John / Owen", status: "Not Started", notes: "Cross-linked to Governance & Cadence item." },
      { id: "bm-5",  description: "Finalize external communications plan for the Brain Medicine narrative (Tier 1 press, AI-transformation narrative) jointly with Communications", dueDate: "Aug 7, 2026", owner: "Derek / Owen", status: "In Progress", notes: "Plan mostly in place per Derek. Lock the scientific narrative, AI-transformation framing, and podcast tie-in." },
      { id: "bm-6",  description: "Get acquisition announced publicly and secure top-tier press coverage", dueDate: "Jul 31, 2026", owner: "Derek / Emery", status: "In Progress", notes: "DF: Press release draft getting feedback right now." },
      { id: "bm-7",  description: "Use acquisition announcement to propel sustained coverage — not just a one-off", dueDate: "Aug 30, 2026", owner: "Derek / Emery", status: "Not Started", notes: "" },
      { id: "bm-8",  description: "Launch new Research Hub", dueDate: "TBD", owner: "Derek / Emery", status: "In Progress", notes: "" },
      { id: "bm-9",  description: "Launch success stories from patients and providers on our site", dueDate: "TBD", owner: "Derek / Emery", status: "In Progress", notes: "" },
      { id: "bm-10", description: "Launch insurance coverage checker", dueDate: "TBD", owner: "Derek / Emery", status: "Not Started", notes: "" },
      { id: "bm-11", description: "Build plan to deploy SAINT to ≥3 existing Mindful Health Solutions clinics", dueDate: "Aug 22, 2026", owner: "Owen / Toby", status: "Not Started", notes: "Start with WA/CA sites where SWIFT already runs. Define capex, training, and protocol needs with Toby, then sequence deployment. Coordinate with the TMS SOP work in Clinical Excellence." },
      { id: "bm-12", description: "Continued NY-site enrollment by study: Psyrin ~80 (biomarker, live again); TD Screening 40+ (Videra TDscreen.ai / Teva); PrTMS adolescent depression 3–6 (PeakLogic); Sanmai tFUS PD (NCT07207122); BMS Cobenfy RESKU (CN012-0066, NCT07101094)", dueDate: "Oct 1, 2026", owner: "Owen / Ahmed", status: "In Progress", notes: "Flagship NY research site." },
      { id: "bm-13", description: "Activate AMPA ONE-Z (insomnia) across 3 MHS sites; enroll first 2 patients", dueDate: "Oct 1, 2026", owner: "Owen / Ahmed", status: "In Progress", notes: "First research activation at MHS sites; extends the footprint beyond NY." },
      { id: "bm-14", description: "Net-new Brain Medicine podcast: greenlight with Western Sound (Ben Adair); Brainsway secured as launch sponsor; production Q4 '26 / H1 '27", dueDate: "Aug 22, 2026", owner: "Owen", status: "In Progress", notes: "Pitch deck done; production partner and launch sponsor secured. Gating item is the internal production-budget commitment." },
      { id: "bm-15", description: "Build and budget the clinical trial team", dueDate: "Aug 22, 2026", owner: "Owen / Sean", status: "Not Started", notes: "" },
      { id: "bm-16", description: "Site-network trial product: 2+ Phase II/III trials in contract negotiation with sponsors", dueDate: "Oct 1, 2026", owner: "Owen", status: "Not Started", notes: "" },
      { id: "bm-17", description: "Two publications submitted to IF 3+ journals on Brain Medicine topics", dueDate: "Oct 1, 2026", owner: "Owen", status: "Not Started", notes: "" },
      { id: "bm-18", description: "Data-monetization contracts underway (e.g. Reziliant)", dueDate: "Sep 21, 2026", owner: "Owen / Sean", status: "Not Started", notes: "" },
      { id: "bm-19", description: "Brain Medicine press goals (Tier 1 coverage tied to research and podcast) in collaboration with Derek / PR", dueDate: "Aug 7, 2026", owner: "Owen / Derek", status: "Not Started", notes: "" },
    ],
  },

  // ── SERVICE EXPERIENCE ────────────────────────────────────────────────────
  {
    id: "misc",
    name: "Service Experience",
    leader: "Ben",
    flagshipGoal: "5 · Category Leadership",
    goal: "Every clinic has been visited and assessed against Radial's service experience standards. Gaps are identified, a site improvement plan exists for each location in need, and remediation is underway at ≥50% of those sites.",
    tasks: [
      { id: "misc-2", description: "Conduct in-person clinic aesthetic assessment and audit full customer journey at all 21 MHS locations; score each site on cleanliness, signage, furniture condition, brand alignment, and patient-facing environment quality; develop improvement plan/budget if necessary", dueDate: "TBD", owner: "", status: "Not Started", notes: "" },
    ],
  },
];
