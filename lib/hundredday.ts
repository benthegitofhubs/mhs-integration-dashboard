export const LAST_SYNCED = "Jul 10, 2026, 2:45 PM ET";

export type Status100 = "Not Started" | "In Progress" | "At Risk" | "Blocked" | "Complete";

export interface Subtask {
  text: string;
  done: boolean;
}

export interface Task100 {
  id: string;
  description: string;
  ranking: number | null;
  subtasks: Subtask[];
  dueDate: string;
  startDate?: string;
  percentComplete?: number;
  lastUpdatedPercent?: number;
  accountable: string;
  responsible: string;
  consulted: string;
  informed: string;
  status: Status100;
  notes: string;
  reason: string;
}

export interface Workstream100 {
  id: string;
  name: string;
  leader: string;
  statusOverride: string | null; // manual health override stored in sheet header
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
    leader: "Carlene / Steph / John / Leah", statusOverride: null,
    flagshipGoal: "1 · Growth",
    goal: "We have become an AI-native Brain Medicine platform — centralizing data, defining deployment safeguards, and deploying our first cohort of ≥3 production AI agents to drive improvement across named KPIs.",
    tasks: [
      { id: "ai-1", ranking: null, subtasks: [], description: "Centralize 100% of clinical/operational data into a single data store to establish context for AI transformation", dueDate: "Aug 15, 2026", accountable: "", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "ai-2", ranking: null, subtasks: [], description: "Develop clinical and operational safeguards/process for secure, safe AI deployment (data access controls, clinical oversight, escalation paths)", dueDate: "TBD", accountable: "", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "ai-3", ranking: null, subtasks: [], description: "Identify 5 functional leaders to own ongoing testing and deployment of AI infrastructure/tooling", dueDate: "TBD", accountable: "", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "ai-4", ranking: null, subtasks: [], description: "Define 5 AI agents across those functional areas, each with explicit success KPIs", dueDate: "TBD", accountable: "", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "ai-5", ranking: null, subtasks: [], description: "Deploy the 5 agents into production and begin measuring against defined KPIs", dueDate: "TBD", accountable: "", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "ai-6", ranking: null, subtasks: [], description: "Build a culture/change-management plan for how teams engage with the AI toolkit, so adoption scales beyond the initial 5 agents", dueDate: "TBD", accountable: "", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
    ],
  },
  {
    id: "dtc",
    name: "Growth — DTC",
    leader: "Derek", statusOverride: null,
    flagshipGoal: "1 · Growth",
    goal: "Our combined network is acquiring ≥550 new customers/month by Day 100 (≥20 per clinic/month) while holding blended CAC ≤$450 and LTV:CAC ≥3:1, with >70% of new customer cohorts interventional.",
    tasks: [
      { id: "dtc-1", ranking: null, subtasks: [], description: "Complete evaluation of MHS growth-engine and deliver written diagnosis", dueDate: "Jul 10, 2026", accountable: "Derek", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "DF: Substantially done, sharing soon.", reason: "" },
      { id: "dtc-2", ranking: null, subtasks: [], description: "Fix SMS/email opt-in capture across all MHS forms & intake", dueDate: "ASAP", accountable: "Jen / Sydney", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "", reason: "" },
      { id: "dtc-3", ranking: null, subtasks: [], description: "Exit Strategy Collective (after account ownership verified, continuity re: LegitScript + Ours Privacy, etc.) and transition to Matchnode for one unified approach", dueDate: "Aug 15, 2026", accountable: "Derek / Emery", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "DF: Meeting w/ Matchnode to understand ramp up options + will need to give notice to Strategy Collective by July 15th (30-day notice).", reason: "" },
      { id: "dtc-4", ranking: null, subtasks: [], description: "Ramp Matchnode spend and optimize for correct endpoint (interventional appointment if possible, consult completed if not — NOT just 'lead')", dueDate: "Aug 15, 2026", accountable: "Derek / Emery", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "dtc-5", ranking: null, subtasks: [], description: "Deploy Radial signup & booking flow including supporting infrastructure (benefits verification, AI customer agent) to MHS clinic network — especially booking discovery calls vs. direct calls/follow-ups", dueDate: "TBD", accountable: "Carlene / Derek", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "DF: This likely needs to be piloted first.", reason: "" },
      { id: "dtc-6", ranking: null, subtasks: [], description: "Once NPS measurement is in place (dependency), get review engine going across all clinics", dueDate: "Aug 15, 2026", accountable: "Jen / Carlene", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "dtc-7", ranking: null, subtasks: [], description: "Standardize CAC, LTV:CAC, and interventional-mix KPIs by clinic, customer, and channel cohort", dueDate: "Aug 15, 2026", accountable: "Mackensie", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "dtc-8", ranking: null, subtasks: [], description: "Create one big trusted dashboard spanning both networks", dueDate: "Aug 15, 2026", accountable: "Mackensie", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "dtc-9", ranking: null, subtasks: [], description: "Create and track clinic-by-clinic capacity across all clinics, and increasingly tie that information back automatically into paid spend", dueDate: "Sep 15, 2026", accountable: "Mackensie", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "DF: Could split this one in two.", reason: "" },
      { id: "dtc-10", ranking: null, subtasks: [], description: "Resolve HubSpot / Customer.io LCM plans and integration", dueDate: "Sep 15, 2026", accountable: "Jen / Mackensie", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "dtc-11", ranking: null, subtasks: [], description: "Pending brand decision: update/improve MHS website (also social media)", dueDate: "Sep 15, 2026", accountable: "Derek / Jen", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "dtc-12", ranking: null, subtasks: [], description: "Pending brand decision: decide on content & SEO/GEO plan for MHS", dueDate: "Sep 15, 2026", accountable: "Derek / Emery", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "dtc-13", ranking: null, subtasks: [], description: "Pending brand decision: launch MHS lifecycle v1", dueDate: "TBD", accountable: "Derek / Mackensie", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "dtc-14", ranking: null, subtasks: [], description: "Evaluate low-hanging-fruit opportunities in existing MHS panel (e.g. SAINT deployment, SWIFT protocol scaling in WA/CA, 2x/day TMS)", dueDate: "TBD", accountable: "", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "dtc-15", ranking: null, subtasks: [], description: "Develop prioritized new intervention roadmap (PRISM, Proliv-Rx, SAINT, COMP360, MDMA) targeting outcome and interventional-mix improvement", dueDate: "TBD", accountable: "", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
    ],
  },
  {
    id: "b2b",
    name: "Growth — B2B Provider Referrals",
    leader: "Sydney / Jonathan", statusOverride: null,
    flagshipGoal: "1 · Growth",
    goal: "Our combined BD team is unified under one leader with one compensation program, with all BD activity tracked in a single CRM instance and with a consolidated performance dashboard in place.",
    tasks: [
      { id: "b2b-1", ranking: null, subtasks: [], description: "Consolidate two legacy BD sales teams under 1 leader", dueDate: "Aug 3, 2026", accountable: "Sydney / Jonathan", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Define reporting cadence, owners, review forums, source of truth, and how performance will be managed.", reason: "" },
      { id: "b2b-2", ranking: null, subtasks: [], description: "Consolidate all BD activity into legacy MHS HubSpot CRM", dueDate: "Aug 3, 2026", accountable: "Sydney / Jonathan", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "b2b-3", ranking: null, subtasks: [], description: "Implement Regional Market Strategy Growth Forum to identify and implement local market growth plans (BD, Marketing, RVP, PL, RMDs)", dueDate: "Aug 3, 2026", accountable: "Sydney", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Already established for MHS clinics.", reason: "" },
      { id: "b2b-4", ranking: null, subtasks: [], description: "Integrate compensation and incentive programs (Base/Variable); goal is to move to cash collections from new referrals commission program", dueDate: "TBD", accountable: "", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "b2b-5", ranking: null, subtasks: [], description: "Create budget and financial projections for the BD function", dueDate: "Aug 14, 2026", accountable: "Sydney / Jonathan", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Establish cost of BD function (salaries, travel, marketing materials, CRM, tech) weighted against projected patient volume and revenue generated from referrals.", reason: "" },
      { id: "b2b-6", ranking: null, subtasks: [], description: "Create one referral-to-scheduling process across both organizations so referring providers experience a consistent, white-glove process", dueDate: "Sep 15, 2026", accountable: "Sydney / Jonathan", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "b2b-7", ranking: null, subtasks: [], description: "Define ideal BD rep territory size, target referrer segmentation, and prioritized criteria based on volume potential, geography, and specialty fit", dueDate: "Sep 15, 2026", accountable: "Sydney / Jonathan", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "b2b-8", ranking: null, subtasks: [], description: "Define sales/outreach process and cadence — from prospecting to first visit to ongoing relationship management, including call/visit frequency benchmarks", dueDate: "Sep 15, 2026", accountable: "Sydney / Jonathan", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "b2b-9", ranking: null, subtasks: [], description: "Build combined KPI and reporting dashboards — standardize metrics (referral volume, conversion rates, time-to-intake) across both legacy pipelines", dueDate: "Sep 30, 2026", accountable: "Natalie / Accordion / Cascade", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Mindful uses HubSpot for referral reporting; Radial uses RadialOS. Need to assess LOE to send RadialOS data to HubSpot for unified reporting.", reason: "" },
      { id: "b2b-10", ranking: null, subtasks: [], description: "Consolidate marketing collateral and branding — merge brochures, one-pagers, and digital assets", dueDate: "Sep 30, 2026", accountable: "Sydney / Jonathan", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Partner with Derek and Jen to understand agency and vendor capabilities.", reason: "" },
      { id: "b2b-11", ranking: null, subtasks: [], description: "Sales training — gap analysis and education roadmap", dueDate: "Sep 30, 2026", accountable: "Sydney / Jonathan", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "b2b-12", ranking: null, subtasks: [], description: "Communicate the MHS acquisition to referral sources — draft a phased communication plan (letter, email, in-person visits)", dueDate: "ASAP — in line with press release", accountable: "Sydney / Jonathan", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Work with Derek and PR agency to have consistent language.", reason: "" },
      { id: "b2b-13", ranking: null, subtasks: [], description: "Retain key referral relationships during transition — identify top 20% referral sources by volume from each legacy org and prioritize personal outreach/retention visits in first 2–4 weeks", dueDate: "Aug 14, 2026", accountable: "BD teammates", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
    ],
  },
  {
    id: "ltc",
    name: "Growth — Lead to Consult Conversion",
    leader: "Dulce / Sydney", statusOverride: null,
    flagshipGoal: "1 · Growth",
    goal: "Our combined network is converting completed discovery calls to completed intake at ≥60% and completed intake to interventional treatment start at ≥65%, driven by clearer post-intake workflows and more transparent customer-facing information on benefits, pricing, and next steps.",
    tasks: [
      { id: "ltc-1", ranking: null, subtasks: [], description: "Remi evaluation for legacy MHS", dueDate: "Jul 17, 2026", accountable: "Sydney / Dulce", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Dulce/Sydney demo on 7/8; meeting again with MDHub on 7/10 to discuss next steps.", reason: "" },
      { id: "ltc-2", ranking: null, subtasks: [], description: "RadialOS evaluation for legacy MHS", dueDate: "Jul 17, 2026", accountable: "Sydney / Dulce", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Meeting scheduled with Carlene to review functionality on 7/10.", reason: "" },
      { id: "ltc-3", ranking: null, subtasks: [], description: "Map the end-to-end customer journey from discovery call through intake scheduling and treatment start", dueDate: "Jul 24, 2026", accountable: "Leah / Dulce / Sydney / Ryan", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Include all customer touchpoints, handoffs, and drop-off points.", reason: "" },
      { id: "ltc-4", ranking: null, subtasks: [], description: "Evaluate Mindful and Radial Care Navigation playbooks, workflows, scripts, tools, roles, and handoff points", dueDate: "Jul 31, 2026", accountable: "Leah / Dulce / Ryan", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Evaluate then document current-state assessment across both teams.", reason: "" },
      { id: "ltc-5", ranking: null, subtasks: [], description: "Identify strengths, gaps, and areas of overlap across both Care Navigation models", dueDate: "Jul 31, 2026", accountable: "Leah / Dulce / Sydney", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Highlight what should be kept, standardized, or improved.", reason: "" },
      { id: "ltc-6", ranking: null, subtasks: [], description: "Define Care Navigation role ownership across new and existing customer workflows", dueDate: "Aug 14, 2026", accountable: "Leah / Dulce / Sydney", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Clarify responsibilities by customer stage: new lead follow-up, discovery calls, intake scheduling, existing customer support, rescheduling, benefits/pricing questions, PAs and reauthorizations, clinic handoffs, and escalations.", reason: "" },
      { id: "ltc-7", ranking: null, subtasks: [], description: "Standardize discovery call processes and intake scheduling workflows across both teams", dueDate: "Aug 21, 2026", accountable: "Leah / Dulce / Sydney", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Align on how discovery calls are scheduled, how intake scheduling is completed, and where Remi is integrated.", reason: "" },
      { id: "ltc-8", ranking: null, subtasks: [], description: "Standardize follow-up cadence for customers who do not schedule or complete intake", dueDate: "Aug 28, 2026", accountable: "Leah / Dulce / Sydney", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Define timing, channel, ownership, and escalation paths; partner with Jen and Derek to evaluate remarketing opportunities.", reason: "" },
      { id: "ltc-9", ranking: null, subtasks: [], description: "Align on written, verbal, and SMS scripts, talk tracks, and templates", dueDate: "Sep 4, 2026", accountable: "Leah / Dulce / Sydney", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Ensure consistent customer messaging across discovery, scheduling, follow-up, rescheduling, and escalations.", reason: "" },
      { id: "ltc-10", ranking: null, subtasks: [], description: "Standardize benefits verification and customer pricing handoffs", dueDate: "Sep 4, 2026", accountable: "Leah / Dulce / Sydney", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Clarify when BV begins, who communicates updates, and how issues are escalated; explore utilizing Sohar for benefits investigation flow.", reason: "" },
      { id: "ltc-11", ranking: null, subtasks: [], description: "Align on unified Care Navigation reporting structure across both organizations", dueDate: "Sep 11, 2026", accountable: "Leah / Dulce / Sydney", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Define reporting cadence, owners, review forums, source of truth, and how performance will be managed.", reason: "" },
      { id: "ltc-12", ranking: null, subtasks: [], description: "Build unified KPI dashboard", dueDate: "Sep 18, 2026", accountable: "Leah / Dulce / Sydney", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Align on shared metrics, source of truth, ownership, and visibility into funnel performance.", reason: "" },
      { id: "ltc-13", ranking: null, subtasks: [], description: "Align cross-functional teams on integration and change management process", dueDate: "Sep 25, 2026", accountable: "Leah / Dulce / Sydney / Ryan", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Ensure workflow changes are coordinated across Clinic Operations, Clinical, Growth, RCM, Product, and clinic-level teams.", reason: "" },
      { id: "ltc-14", ranking: null, subtasks: [], description: "Launch updated care navigation playbook and team training", dueDate: "Sep 25, 2026", accountable: "Leah / Dulce / Sydney / Ryan", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Ensure both teams are trained on the unified model and have ongoing individual and team-level performance metrics.", reason: "" },
    ],
  },
  {
    id: "ops-excellence",
    name: "Growth — Operational Excellence",
    leader: "Mark", statusOverride: null,
    flagshipGoal: "1 · Growth",
    goal: "All clinics are managed under one governance process with a single clinic-level ops/financial analytics and monitoring dashboard across the network, and a growth/profitability plan in place for every clinic.",
    tasks: [
      { id: "oe-1", ranking: null, subtasks: [], description: "Evaluate Radial RCM and create plan for transition to Arietis RCM vendor", dueDate: "Sep 1, 2026", accountable: "", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "", reason: "" },
      { id: "oe-2", ranking: null, subtasks: [], description: "Transition Radial Clinics into Daily Demand vs Capacity (Sales/Ops)", dueDate: "Jul 10, 2026", accountable: "Sydney", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "", reason: "" },
      { id: "oe-3", ranking: null, subtasks: [], description: "Transition Radial Clinics into Weekly Clinic Profitability Improvement Forum", dueDate: "Jul 9, 2026", accountable: "Leah", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "", reason: "" },
      { id: "oe-4", ranking: null, subtasks: [], description: "Transition Radial Clinic Leadership into Service Line Product Review Forums", dueDate: "Jul 14, 2026", accountable: "Sydney", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "oe-5", ranking: null, subtasks: [], description: "Transition Radial Practice Leaders into Weekly RVP Call", dueDate: "Jul 21, 2026", accountable: "Leah / Brenda / Kyle", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "oe-6", ranking: null, subtasks: [], description: "Transition Radial Key Leadership to Real Estate Review Meeting", dueDate: "Aug 3, 2026", accountable: "Leah / Josh", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
    ],
  },
  {
    id: "product-data",
    name: "Product, Data & Clinical Innovation",
    leader: "Carlene", statusOverride: null,
    flagshipGoal: "1 · Growth",
    goal: "Both organizations are consolidated onto RadialOS — covering discovery, interventional procedure ordering, AI Scribe, and measurement-informed care in an EHR-agnostic fashion — with consolidated analytics and agentic worklist dashboards live across RCM, ClinOps, and clinical care.",
    tasks: [
      { id: "pd-1", ranking: null, subtasks: [], description: "Deploy RadialOS at MHS clinics, prioritizing onboarding sequence (target time-to-intake <48 hrs, care journey NPS >80)", dueDate: "Sep 1, 2026", accountable: "Carlene", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Consolidate HubSpot to MHS's enterprise HIPAA-compliant version and connect to our ecosystem; set up REMI and mdHub scribe workflow for MHS. Working with Elliot and Will on sequencing 'Where is my TMS Tracker' beginning with order entry.", reason: "" },
      { id: "pd-2", ranking: null, subtasks: [], description: "Build data infrastructure to enable rapid AI agent development across clinical and operational workflows", dueDate: "Sep 30, 2026", accountable: "Steph / Carlene / Mark", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Steph built out desired future state for architecture. Will launch RadialMCP for RadialOS mid-July for Radial sites and expand from there. Interim step: ingest spreadsheets/flatfiles from MHS to perform agentic analysis (e.g. their RCM reports).", reason: "" },
      { id: "pd-3", ranking: null, subtasks: [], description: "Define target-state application portfolio and integration roadmap to reduce manual handoffs across systems", dueDate: "Jul 20, 2026", accountable: "Carlene / Jordan", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "MHS currently runs NextGen, Arietis (RCM), and internally-built custom apps (Patient Portal, ClickLocate, ClickPrepare, ClickCredential) alongside Microsoft Great Plains as ERP. Prerequisite to the ERP decision.", reason: "" },
      { id: "pd-4", ranking: null, subtasks: [], description: "Map clinic-level P&L / utilization dashboard requirements into the RadialOS analytics roadmap", dueDate: "TBD", accountable: "Leah / Steph / Mark / Carlene", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Joint item with Operations & Shared Services. Cascade heavily involved.", reason: "" },
      { id: "pd-5", ranking: null, subtasks: [], description: "RCM tech stack consolidation", dueDate: "Sep 30, 2026", accountable: "Carlene / Steph / Sydney", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Ongoing assessment of MHS processes and tools in parallel with launching pilot for PAs and BI/BV with Foresight (built on Stedi) for Radial sites. If pilot goes well, expand to Radial claims processing → MHS claims processing (full clearinghouse migrations for both orgs).", reason: "" },
    ],
  },

  // ── 2. ONE TEAM ──────────────────────────────────────────────────────────
  {
    id: "finance",
    name: "Finance & Accounting",
    leader: "Mark / Chris / John", statusOverride: null,
    flagshipGoal: "2 · One Team",
    goal: "We have hired a permanent CFO and built a full financial consolidation roadmap through EOY '26 covering budget, model, unified reporting, treasury, accounting, and tax.",
    tasks: [
      { id: "fin-1", ranking: null, subtasks: [], description: "Interim CFO: identified and onboarded", dueDate: "TBD", accountable: "Mark / John", responsible: "", consulted: "", informed: "", status: "Complete", notes: "", reason: "" },
      { id: "fin-2", ranking: null, subtasks: [], description: "Hire permanent CFO", dueDate: "Sep 30, 2026", accountable: "Mark / John", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Need to identify candidate, conduct interview process (recommend a case study), negotiate contract, and allow for adequate notice/onboarding time.", reason: "" },
      { id: "fin-3", ranking: null, subtasks: [], description: "Centralize treasury and cash forecasting", dueDate: "Oct 1, 2026", accountable: "Chris", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Map out bank accounts; evaluate banking institutions; open accounts at the TIN level; send notices to commercial payors; update POS deposit info; conduct AP out of main central operating account; produce combined 13-week cash forecast.", reason: "" },
      { id: "fin-4", ranking: null, subtasks: [], description: "Integrate and consolidate general ledger — move QuickBooks to Great Plains", dueDate: "Sep Close", accountable: "Chris", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "June month-end will be two separate closes done concurrently; goal is July to be consolidated at the Radial level. Legacy Radial Clinics revenue to be restated after cash testing.", reason: "" },
      { id: "fin-5", ranking: null, subtasks: [], description: "Convert legacy Radial RCM function to Arietis", dueDate: "Sep 1, 2026", accountable: "Katie / Chris", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Keep legacy Radial AR worked by RCM team for 90 days. Proposed method: amendment to existing contract at 2.2% variable cost.", reason: "" },
      { id: "fin-6", ranking: null, subtasks: [], description: "Consolidate payroll", dueDate: "TBD", accountable: "", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Payroll needs to be consolidated and handled by Shelby. Recommendation is to truly centralize payroll utilizing MSA agreement (vs. having multiple payrolls for TMS and MHS).", reason: "" },
      { id: "fin-7", ranking: null, subtasks: [], description: "Build consolidated budget through EOY '26 and 2027", dueDate: "Dec 1, 2026", accountable: "Chris / CFO", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Create consolidated 3-statement budget using bottoms-up, clinic-level approach. Most important output is the cash forecast derived via indirect approach from P&L and BS.", reason: "" },
      { id: "fin-8", ranking: null, subtasks: [], description: "Tax: finalize 2025 returns; get landscape of total tax exposure", dueDate: "Q3 2026", accountable: "Chris / Pete / WP", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Leverage Whitley Penn to assist.", reason: "" },
    ],
  },
  {
    id: "it-security",
    name: "IT & Security",
    leader: "Elliot", statusOverride: null,
    flagshipGoal: "2 · One Team",
    goal: "We have fully assessed MHS/Radial IT infrastructure with a prioritized remediation roadmap for hardware/software/security; all low-hanging-fruit security items are resolved.",
    tasks: [
      { id: "it-1", ranking: null, subtasks: [], description: "Evaluate MHS IT team (4 FTE, operating near capacity) and determine combined leadership structure", dueDate: "Jul 31, 2026", accountable: "Elliot", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "", reason: "" },
      { id: "it-2", ranking: null, subtasks: [], description: "Engage RSM for tactical IT support", dueDate: "Jul 20, 2026", accountable: "John / Elliot", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "it-3", ranking: null, subtasks: [], description: "Resolve February 2026 phishing-related email compromise incident; determine OCR reporting obligation", dueDate: "TBD", accountable: "Elliot / John / Legal", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "", reason: "" },
      { id: "it-4", ranking: null, subtasks: [], description: "Execute quick-win security items: penetration testing, data privacy remediation, domain/ownership cleanup", dueDate: "TBD", accountable: "Elliot / Jordan", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "it-5", ranking: null, subtasks: [], description: "Assess end-of-life hardware/software and build a device management / enrollment plan", dueDate: "TBD", accountable: "Elliot / Jordan", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "it-6", ranking: null, subtasks: [], description: "Replace end-of-life network hardware (~11 Meraki switches, 12 access points, 1 firewall); add backup internet at 16 of 22 locations", dueDate: "TBD", accountable: "Elliot / Jordan", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "it-7", ranking: null, subtasks: [], description: "Define target-state application portfolio and integration roadmap (joint with Product, Data & Clinical Innovation)", dueDate: "TBD", accountable: "Elliot / Jordan", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "it-8", ranking: null, subtasks: [], description: "Establish a HIPAA security risk-management program, including obtaining missing BAAs not provided in diligence", dueDate: "TBD", accountable: "Elliot / Jordan / Dan", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "it-9", ranking: null, subtasks: [], description: "Develop a formal IT strategy, roadmap, and budget for the combined entity", dueDate: "TBD", accountable: "Elliot / John / RSM", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "", reason: "" },
    ],
  },
  {
    id: "people",
    name: "People Services",
    leader: "Abbe", statusOverride: null,
    flagshipGoal: "2 · One Team",
    goal: "We have built a unified people and organization foundation — org design, recruiting, policies, and performance management standardized across entities — with total rewards parity underway, benefits renewal in motion for both entities, and a baseline employee NPS for both entities in place.",
    tasks: [
      { id: "ppl-1", ranking: null, subtasks: [], description: "Remediate I-9 compliance gaps (21 of 25 forms reviewed had errors or missing documentation); require new I-9s Day 1", dueDate: "Jun 26, 2026", accountable: "Abbe", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Audit in process with outside counsel for all active MHS teammates.", reason: "" },
      { id: "ppl-2", ranking: null, subtasks: [], description: "Verify and resolve active work-authorization lapse (one employee unauthorized since 2023; two permits expiring Nov 2026)", dueDate: "May 8, 2026", accountable: "Abbe", responsible: "", consulted: "", informed: "", status: "Complete", notes: "The individual with the lapse was terminated May 8, 2026. No action needed on those with still-valid permits.", reason: "" },
      { id: "ppl-3", ranking: null, subtasks: [], description: "File delinquent TMS 2024 Form 5500 via the DOL Delinquent Filer Voluntary Compliance Program", dueDate: "Jun 30, 2026", accountable: "Abbe", responsible: "", consulted: "", informed: "", status: "Complete", notes: "The form is not delinquent. It was due June 30, 2026 and was filed.", reason: "" },
      { id: "ppl-4", ranking: null, subtasks: [], description: "Audit FLSA exempt/non-exempt classifications network-wide and correct misclassifications", dueDate: "Jul 30, 2026", accountable: "Abbe", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "MHS has reviewed 1099 status and has documents prepared to adjust as necessary for physicians. Was on-hold due to the diligence process.", reason: "" },
      { id: "ppl-5", ranking: null, subtasks: [], description: "Consolidate Rippling / payroll across entities", dueDate: "Sep 1, 2026", accountable: "Abbe", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Reviewing both instances of Rippling to understand the appropriate consolidation timeline and mechanism to minimize UX issues for both entities. Reviewing potential cost savings with Rippling contract consolidation.", reason: "" },
      { id: "ppl-6", ranking: null, subtasks: [], description: "Consolidate benefits programs and plan for next renewal cycle", dueDate: "Sep 30, 2026", accountable: "Abbe", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Benefits will remain separate for the 2026–2027 plan year given the timeline of Radial's renewal and the substantial plan differences. Pre-renewal for both entities is in process.", reason: "" },
      { id: "ppl-7", ranking: null, subtasks: [], description: "Build a unified employee handbook (merge MHS handbook + TMS Code of Conduct) with CA/WA-specific provisions", dueDate: "Sep 30, 2026", accountable: "Abbe", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "The current handbook has all necessary state-specific provisions for all states where TMS/MHS operate, updated in April. Radial handbook with state-specific policies is in process.", reason: "" },
      { id: "ppl-8", ranking: null, subtasks: [], description: "Establish baseline employee eNPS measurement (target >80 eNPS)", dueDate: "Jul 31, 2026", accountable: "Abbe", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "eNPS should be pushed out to Radial; already done for MHS in April. Goal is 7% increase org-wide (by entity initially) with refinement by role ongoing.", reason: "" },
      { id: "ppl-9", ranking: null, subtasks: [], description: "Support resolution of outstanding employment litigation jointly with Legal & Regulatory (2 CA wage-and-hour class actions; individual claims)", dueDate: "TBD", accountable: "Abbe", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "In process on all matters; timeline is not easily determined given how litigation progresses.", reason: "" },
    ],
  },
  {
    id: "legal",
    name: "Legal & Regulatory",
    leader: "Dan / Abbe", statusOverride: null,
    flagshipGoal: "2 · One Team",
    goal: "We have reviewed all identified diligence issues to identify an assigned owner, a remediation plan, a cost estimate and a target resolution date. We have evaluated legal, regulatory and compliance priorities for the combined entities.",
    tasks: [
      { id: "leg-1", ranking: null, subtasks: [], description: "Build master diligence-issue tracker (owner, plan, cost estimate, target date) across tax / labor / privacy / regulatory findings", dueDate: "TBD", accountable: "Dan", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "", reason: "" },
      { id: "leg-2", ranking: null, subtasks: [], description: "Audit and remediate PC/MSO agreement structure (friendly-PC / CPOM model across CA, TX, WA professional corporations)", dueDate: "TBD", accountable: "Dan / Betsey", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "MSAs prohibit the PC from contracting with other management companies and don't provide a no-cause termination right for the PC — worth revisiting post-close.", reason: "" },
      { id: "leg-3", ranking: null, subtasks: [], description: "Complete billing/claims audit follow-up: claims-level reconciliation of Arietis-identified errors; confirm overpayment refund/recoupment disposition", dueDate: "TBD", accountable: "Dan / Sean", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Coding error rates ran 1.8%–7.2% across reviewed months. Exposure exists under the ACA 60-day overpayment-return rule and False Claims Act.", reason: "" },
      { id: "leg-4", ranking: null, subtasks: [], description: "Clarify incident-to billing practices and confirm CPT/HCPCS compliance for supervised technician/RN services", dueDate: "TBD", accountable: "Dan", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Company's stated understanding of 'incident-to' billing appears incomplete.", reason: "" },
      { id: "leg-5", ranking: null, subtasks: [], description: "Investigate and remediate the open ketamine theft / controlled-substance handling matter; reinforce two-person loading/waste protocols", dueDate: "TBD", accountable: "Dan / Toby", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Flagged as an open item in the Mindful 90-Day Goals doc.", reason: "" },
      { id: "leg-6", ranking: null, subtasks: [], description: "Rebuild a formal healthcare regulatory compliance program with a named owner and recurring review cadence", dueDate: "TBD", accountable: "Dan", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Company acknowledged it does not have 6 years of audit records and that past reviews were 'not standardized.'", reason: "" },
      { id: "leg-7", ranking: null, subtasks: [], description: "Document a written PDMP / controlled-substance prescribing policy (currently informal/verbal only)", dueDate: "TBD", accountable: "Dan / Toby", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "leg-8", ranking: null, subtasks: [], description: "Resolve CCPA compliance gaps and HIPAA documentation deficiencies (missing BAAs, no written de-identification policy)", dueDate: "TBD", accountable: "Dan / Jordan", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Joint item with IT & Security and Product, Data & Clinical Innovation workstreams.", reason: "" },
      { id: "leg-9", ranking: null, subtasks: [], description: "Engage RSM and outside counsel for targeted tax and regulatory remediation support", dueDate: "TBD", accountable: "Dan / Sean", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "", reason: "" },
      { id: "leg-10", ranking: null, subtasks: [], description: "Confirm legacy litigation insurance coverage (D&O/EPLI policies) for pending and settled wage-hour and discrimination claims", dueDate: "TBD", accountable: "Dan / Betsey", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Company has not provided evidence of policy coverage for the period the 2023 claim was filed.", reason: "" },
    ],
  },
  {
    id: "comms",
    name: "Communications",
    leader: "John / Derek", statusOverride: null,
    flagshipGoal: "2 · One Team",
    goal: "The acquisition announcement launches Brain Medicine as a category — not a roll-up — with Tier 1 exclusive secured (STAT target) and ≥3 Tier 1 placements carrying the Brain Medicine framing with Owen/John as the category voice.",
    tasks: [
      { id: "com-1", ranking: null, subtasks: [], description: "Finalize Day-1 internal messaging (shared mission, leadership structure, no-surprises commitments) and proactive FAQ", dueDate: "Jun 24, 2026", accountable: "John", responsible: "", consulted: "", informed: "", status: "Complete", notes: "Should have landed before the external announcement — confirm and archive final version.", reason: "" },
      { id: "com-2", ranking: null, subtasks: [], description: "Launch July external announcement with Tier 1 press exclusive (WSJ / Bloomberg / CNBC) via 120/80 and GC comms team", dueDate: "TBD", accountable: "Derek / John", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "See Growth/Brand tabs.", reason: "" },
      { id: "com-3", ranking: null, subtasks: [], description: "Plan and execute First-30-Days roadshow: town halls + clinician-specific sessions with Toby/Owen across MHS/Radial locations", dueDate: "Sep 15, 2026", accountable: "John", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Town Hall (individual + combined all hands) are finished as of 7/9/26; Clinic Roadshow ('Triple C') planning in progress & on track for July/Aug '26.", reason: "" },
    ],
  },

  // ── 3. REMISSION ─────────────────────────────────────────────────────────
  {
    id: "clinical-perf",
    name: "Clinical Excellence",
    leader: "Toby", statusOverride: null,
    flagshipGoal: "3 · Remission",
    goal: "We have launched a combined medical leadership structure, standardized scheduling and recruitment practices across the combined entity, and defined a single set of clinical/clinical-ops KPIs — with accountability built cross-functionally toward a target of 80% mature clinician utilization — alongside a roadmap for new treatment modalities.",
    tasks: [
      { id: "cp-1", ranking: null, subtasks: [], description: "Build and execute clinical team transition plan from Owen to Toby (org chart, RACI, comms timeline)", dueDate: "TBD", accountable: "Toby / Owen", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Coordinate messaging with Communications workstream's clinician-specific roadshow sessions.", reason: "" },
      { id: "cp-2", ranking: null, subtasks: [], description: "Build network-wide clinician capacity plan (coverage and ramp assumptions through EOY '26)", dueDate: "Aug 1, 2026", accountable: "Toby / Leah", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Working on this right now.", reason: "" },
      { id: "cp-3", ranking: null, subtasks: [], description: "Evaluate existing performance management and credentialing frameworks across the combined clinical team", dueDate: "Sep 1, 2026", accountable: "COO / Mark / Leah / Sydney", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "We should have a credentialing team for the combined organization. Credentialing should be owned by operations with clinical leadership in support.", reason: "" },
      { id: "cp-4", ranking: null, subtasks: [], description: "Establish network-wide clinical quality & safety SLAs (questionnaire completion, outcome tracking, safety event reporting)", dueDate: "Oct 1, 2026", accountable: "Toby / Leah", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "cp-5", ranking: null, subtasks: [], description: "Establish network-wide operational SLAs (clinician utilization, no-show rates, scheduling turnaround)", dueDate: "Sep 1, 2026", accountable: "Toby", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Finalizing clinician utilization report with Leah. Next steps: understand clinic and clinician-level unit economics. Need to examine how current tech platforms are driving or hindering clinician workflows — identify bottlenecks and align on streamlined, efficient clinician workflows supported by technology.", reason: "" },
      { id: "cp-6", ranking: null, subtasks: [], description: "Build centralized clinical analytics & reporting roadmap (measurement-informed care, real-time outcomes, clinician-level performance)", dueDate: "Oct 1, 2026", accountable: "Carlene / Toby", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Coordinate with Product, Data & Clinical Innovation workstream.", reason: "" },
      { id: "cp-7", ranking: null, subtasks: [], description: "Remediate absence of formal TMS clinical protocols/SOPs — no overarching clinical policy exists today; providers using individual judgment", dueDate: "Oct 1, 2026", accountable: "Toby / Owen", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Moderate risk given TMS is billed to federal payors as an interventional procedure.", reason: "" },
      { id: "cp-8", ranking: null, subtasks: [], description: "Confirm esketamine REMS post-dose observation protocol is consistent across SOPs (Driving Restriction Policy states 1.5–2 hrs; REMS requires 2 hrs)", dueDate: "Sep 1, 2026", accountable: "Toby", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Mindful has established compliant protocols. Next step is to assess Radial's protocols and proceed as indicated.", reason: "" },
      { id: "cp-9", ranking: null, subtasks: [], description: "Implement formal occupational health & safety program (written IIPP, Cal/OSHA training, bloodborne pathogen training) for interventional procedures", dueDate: "TBD", accountable: "Toby / Abbe", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "4 open workers' comp claims (Sep'24–Mar'26); no OSHA 300 logs or prior inspection records provided in diligence.", reason: "" },
      { id: "cp-10", ranking: null, subtasks: [], description: "Document and standardize technician training/supervision protocols for TMS and ketamine/esketamine administration", dueDate: "Sep 1, 2026", accountable: "Toby", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Mindful has established protocols. Mindful training team will spearhead assessing Radial's SOPs and implement as indicated.", reason: "" },
      { id: "cp-11", ranking: null, subtasks: [], description: "Transition Radial Medical Team into weekly Toby Grand Rounds meeting", dueDate: "Jul 17, 2026", accountable: "Toby", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Starting next week.", reason: "" },
      { id: "cp-12", ranking: null, subtasks: [], description: "Transition Radial Clinic Leadership into new clinician Provider Training Program led by Alvin Lau", dueDate: "Sep 1, 2026", accountable: "Toby / Alvin", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Dr. Lau is meeting with Nogga (Radial training) to start information-sharing process.", reason: "" },
      { id: "cp-13", ranking: null, subtasks: [], description: "Move towards a common culture across the combined clinical organization", dueDate: "Oct 1, 2026", accountable: "Toby", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Culture precedes performance. Starting on the Radial side to understand current culture and opportunities, then building into Radial Ops, then combining Mindful+Radial Clinical-Ops teams and meetings hopefully by Q4.", reason: "" },
      { id: "cp-14", ranking: null, subtasks: [], description: "Develop, socialize, and launch a common clinician compensation plan for legacy Radial clinicians more aligned with current Mindful comp plan (base + productivity bonus)", dueDate: "Oct 1, 2026", accountable: "Toby / Mark", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "cp-15", ranking: null, subtasks: [], description: "Transition PC ownership (Radial) to Toby", dueDate: "Sep 1, 2026", accountable: "Toby / Owen / John", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
    ],
  },

  // ── 4. MSO ───────────────────────────────────────────────────────────────
  {
    id: "payer",
    name: "Payer Strategy",
    leader: "Jonathan", statusOverride: null,
    flagshipGoal: "4 · MSO",
    goal: "We have engaged with five strategic health plans and validated the product-market fit for the MSO Network's aTMS/Spravato repricing/billing solution, with substantive discussions underway on a national contract and/or alternative payment models.",
    tasks: [
      { id: "pay-1", ranking: null, subtasks: [], description: "Assess MHS existing strategic payer relationships and contract terms", dueDate: "TBD", accountable: "", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "", reason: "" },
      { id: "pay-2", ranking: null, subtasks: [], description: "Prioritize and schedule meetings with Premera (WA), Anthem Blue Cross of CA, Carelon, and other key payers re: combined network / MSO strategy", dueDate: "Aug 8, 2026", accountable: "Jonathan", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Met with Premera on 7/7 with follow-up action items. Meeting scheduled with Anthem/Carelon executive leadership on 8/5.", reason: "" },
      { id: "pay-3", ranking: null, subtasks: [], description: "Prioritize and schedule meetings with BCBS of SC, Premera and other key payers re: alternative payment models (case rate, bundled payment, VBC)", dueDate: "Aug 8, 2026", accountable: "Jonathan", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "", reason: "" },
      { id: "pay-4", ranking: null, subtasks: [], description: "Finalize network/MSO marketing material including brochure, presentations, and key messaging", dueDate: "Jul 30, 2026", accountable: "Jonathan", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Working with BFJ marketing firm.", reason: "" },
      { id: "pay-5", ranking: null, subtasks: [], description: "Engage Anthem BCBS / Carelon regarding National Contract", dueDate: "Aug 8, 2026", accountable: "Jonathan", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "", reason: "" },
      { id: "pay-6", ranking: null, subtasks: [], description: "Submit network application with short- and long-term disability insurance carriers", dueDate: "TBD", accountable: "Jonathan", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
    ],
  },

  // ── 5. CATEGORY LEADERSHIP ───────────────────────────────────────────────
  {
    id: "brain-medicine",
    name: "Brain Medicine Brand & Research",
    leader: "Owen", statusOverride: null,
    flagshipGoal: "5 · Category Leadership",
    goal: "We have established Brain Medicine as an externally-facing category for Radial, with a defined mandate and operating model, an aligned research roadmap and budget, and an active 6-protocol research portfolio across our NY flagship, with at minimum 3 additional sites identified.",
    tasks: [
      { id: "bm-1", ranking: null, subtasks: [], description: "Formalize Owen's role as the external face of Brain Medicine (speaking, publishing, payer/partner relationships)", dueDate: "Jul 23, 2026", accountable: "Owen / John", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Role settled in practice. Remaining work is documenting the mandate and operating model (scope, decision rights, time split vs. the Toby clinical transition). Ratify by Day 30.", reason: "" },
      { id: "bm-2", ranking: null, subtasks: [], description: "Define research roadmap and operating model across the combined network", dueDate: "Jul 10, 2026", accountable: "Owen", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Kickoff with Ahmed complete. Write up the roadmap covering the NY protocols and the MHS-site research expansion; circulate v1 by Jul 23.", reason: "" },
      { id: "bm-3", ranking: null, subtasks: [], description: "Align on resources and budget required to execute the research roadmap", dueDate: "Aug 7, 2026", accountable: "Owen / Chris", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Build the clinical-trial team org chart and budget. Tie to the $2.5M ARR / 30% GM year-end target. Bring the resourcing ask to the Q2 board on 8/7.", reason: "" },
      { id: "bm-4", ranking: null, subtasks: [], description: "Resolve brand architecture decision dependency (Mindful vs. Radial brand) — unlocks external announcement and accelerates this entire workstream", dueDate: "TBD", accountable: "Derek / Elliot / John / Owen", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Cross-linked to Governance & Cadence item.", reason: "" },
      { id: "bm-5", ranking: null, subtasks: [], description: "Finalize external communications plan for the Brain Medicine narrative (Tier 1 press, AI-transformation narrative) jointly with Communications", dueDate: "Aug 7, 2026", accountable: "Derek / Owen", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Plan mostly in place per Derek. Lock the scientific narrative, AI-transformation framing, and podcast tie-in.", reason: "" },
      { id: "bm-6", ranking: null, subtasks: [], description: "Get acquisition announced publicly and secure top-tier press coverage", dueDate: "Jul 31, 2026", accountable: "Derek / Emery", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "DF: Press release draft getting feedback right now.", reason: "" },
      { id: "bm-7", ranking: null, subtasks: [], description: "Use acquisition announcement to propel sustained coverage — not just a one-off", dueDate: "Aug 30, 2026", accountable: "Derek / Emery", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "bm-8", ranking: null, subtasks: [], description: "Launch new Research Hub", dueDate: "TBD", accountable: "Derek / Emery", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "", reason: "" },
      { id: "bm-9", ranking: null, subtasks: [], description: "Launch success stories from patients and providers on our site", dueDate: "TBD", accountable: "Derek / Emery", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "", reason: "" },
      { id: "bm-10", ranking: null, subtasks: [], description: "Launch insurance coverage checker", dueDate: "TBD", accountable: "Derek / Emery", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "bm-11", ranking: null, subtasks: [], description: "Build plan to deploy SAINT to ≥3 existing Mindful Health Solutions clinics", dueDate: "Aug 22, 2026", accountable: "Owen / Toby", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "Start with WA/CA sites where SWIFT already runs. Define capex, training, and protocol needs with Toby, then sequence deployment. Coordinate with the TMS SOP work in Clinical Excellence.", reason: "" },
      { id: "bm-12", ranking: null, subtasks: [], description: "Continued NY-site enrollment by study: Psyrin ~80 (biomarker, live again); TD Screening 40+ (Videra TDscreen.ai / Teva); PrTMS adolescent depression 3–6 (PeakLogic); Sanmai tFUS PD (NCT07207122); BMS Cobenfy RESKU (CN012-0066, NCT07101094)", dueDate: "Oct 1, 2026", accountable: "Owen / Ahmed", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Flagship NY research site.", reason: "" },
      { id: "bm-13", ranking: null, subtasks: [], description: "Activate AMPA ONE-Z (insomnia) across 3 MHS sites; enroll first 2 patients", dueDate: "Oct 1, 2026", accountable: "Owen / Ahmed", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "First research activation at MHS sites; extends the footprint beyond NY.", reason: "" },
      { id: "bm-14", ranking: null, subtasks: [], description: "Net-new Brain Medicine podcast: greenlight with Western Sound (Ben Adair); Brainsway secured as launch sponsor; production Q4 '26 / H1 '27", dueDate: "Aug 22, 2026", accountable: "Owen", responsible: "", consulted: "", informed: "", status: "In Progress", notes: "Pitch deck done; production partner and launch sponsor secured. Gating item is the internal production-budget commitment.", reason: "" },
      { id: "bm-15", ranking: null, subtasks: [], description: "Build and budget the clinical trial team", dueDate: "Aug 22, 2026", accountable: "Owen / Sean", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "bm-16", ranking: null, subtasks: [], description: "Site-network trial product: 2+ Phase II/III trials in contract negotiation with sponsors", dueDate: "Oct 1, 2026", accountable: "Owen", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "bm-17", ranking: null, subtasks: [], description: "Two publications submitted to IF 3+ journals on Brain Medicine topics", dueDate: "Oct 1, 2026", accountable: "Owen", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "bm-18", ranking: null, subtasks: [], description: "Data-monetization contracts underway (e.g. Reziliant)", dueDate: "Sep 21, 2026", accountable: "Owen / Sean", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
      { id: "bm-19", ranking: null, subtasks: [], description: "Brain Medicine press goals (Tier 1 coverage tied to research and podcast) in collaboration with Derek / PR", dueDate: "Aug 7, 2026", accountable: "Owen / Derek", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
    ],
  },

  // ── SERVICE EXPERIENCE ────────────────────────────────────────────────────
  {
    id: "misc",
    name: "Service Experience",
    leader: "Ben", statusOverride: null,
    flagshipGoal: "5 · Category Leadership",
    goal: "Every clinic has been visited and assessed against Radial's service experience standards. Gaps are identified, a site improvement plan exists for each location in need, and remediation is underway at ≥50% of those sites.",
    tasks: [
      { id: "misc-2", ranking: null, subtasks: [], description: "Conduct in-person clinic aesthetic assessment and audit full customer journey at all 21 MHS locations; score each site on cleanliness, signage, furniture condition, brand alignment, and patient-facing environment quality; develop improvement plan/budget if necessary", dueDate: "TBD", accountable: "", responsible: "", consulted: "", informed: "", status: "Not Started", notes: "", reason: "" },
    ],
  },
];
