/*
  ============================================================
  DATA FILE — this is the only file you need to edit to add
  new work to your portfolio.
  ============================================================

  HOW TO ADD A CAMPAIGN
  ----------------------
  Add an object to the CAMPAIGNS array:
    { id: "short-slug", label: "Human readable name" }

  The "id" is used internally to link entries to a campaign.
  Keep it lowercase with hyphens, no spaces.

  HOW TO ADD AN ENTRY (a piece of work)
  ----------------------
  Add an object to the ENTRIES array. Fields:

    id        - unique string, e.g. "2026-01". Shows as the record
                number. Suggest YEAR-SEQUENCE.
    title     - the name of the project/document.
    campaign  - must match a campaign "id" above.
    type      - one of: "dashboard" | "toolkit" | "link" | "onepager"
    date      - "YYYY-MM", used for sorting.
    summary   - 1-3 sentences describing the work and your role.
    tags      - optional array of short keyword strings.

  Depending on "type", fill in these fields:

    dashboard  -> file: "assets/dashboards/your-file.html"
                  (a JS/HTML dashboard you upload into that folder;
                  it will be embedded directly on the page)
                  optional: url (external link, e.g. if hosted elsewhere)

    toolkit    -> file: "assets/toolkits/your-file.pdf" (or .zip)
                  optional: url (if hosted externally, e.g. Google Drive)

    onepager   -> file: "assets/onepagers/your-file.pdf"

    link       -> url: "https://..." (external website you're linking to)

  You only need to fill in "file" OR "url" depending on where the
  content lives — you don't need both unless you want a local copy
  AND an external mirror.
  ============================================================
*/

const CAMPAIGNS = [
  { id: "nys-legislature", label: "New York Legislation" },
  { id: "nys-marketplace", label: "New York State of Health Marketplace" },
  { id: "aca-changes", label: "Federal Changes to the Affordable Care Act" },
  { id: "hc-affordability", label: "Healthcare Affordability" },
  { id: "emd", label: "Medical Debt" },
];

const ENTRIES = [
  {
    id: "2026-01",
    title: "New York State Bill Tracker",
    campaign: "nys-legislature",
    type: "dashboard",
    date: "2025-11",
    summary:
      "Built a JavaScript-based legislative tracker dashboard using API data that monitors bill status, committee activity, co-sponsorship changes, and legislative actions.",
    tags: ["Data visualization", "State Legislation"],
    file: "dashboard/bt-index.html",
    url: "https://hcfany.org/bill-tracker/",
  },
  {
    id: "2026-02",
    title: "Analysis of New York's Fiscal 2026-2027 Budget",
    campaign: "nys-legislature",
    type: "link",
    date: "2026-06",
    summary:
      "Analyzed how New York's Fiscal Year 2026-27 Budget has changed since the Governor's Executive Budget and its implicaiton for New York conusmers on access to health care and coverage.",
    tags: ["State legislature", "Policy Writing"],
    file: "",
    url: "https://hcfany.org/hcfany-on-new-yorks-fy2026-2027-final-budget/",
  },
  {
    id: "2026-03",
    title: "Marketplace Changes due to the State's Return to the Basic Health Plan",
    campaign: "nys-marketplace",
    type: "link",
    date: "2026-05",
    summary:
      "Updating consumers on how cost-sharing reductions are changing due to the State's Transition back to the Basic Health Plan.",
    tags: ["State Marketplace","Affordable Care Act"],
    file: "",
    url: "https://hcfany.org/free-insulin-program-in-new-york-remains-amidst-state-transition-back-to-the-basic-health-plan/",
  },
  {
    id: "2026-04",
    title: "The impact of Federal Changes to the ACA on New Yorkers and the State Budget",
    campaign: "aca-changes",
    type: "onepager",
    date: "2025-01",
    summary:
      "Develop policy briefs on Congressional District-Level and Statewide-Level Impacts of HR1.",
    tags: ["Affordable Care Act","Policy Briefs"],
    files: "",
    url: "https://hcfany.org/resources/the-impact-of-federal-threats-to-new-yorks-health-care-system-by-district/",
  },
  {
    id: "2026-05",
    title: "Dashboard on the impact of Federal Changes to the ACA on New Yorkers and the State Budget",
    campaign: "aca-changes",
    type: "dashboard",
    date: "2025-01",
    summary:
      "Developed a data dashboard, using external data, to inform policymakers and consumers on how federal cuts to the ACA affects New Yorkers by County and Congressional District.",
    tags: ["Dashboard", "Published"],
    file: "dashboard/ft-index.html",
    url: "https://hcfany.org/federal-threats-to-health-coverage/",
  },
  {
    id: "2026-06",
    title: "Rate-Review",
    campaign: "nys-legislature",
    type: "dashboard",
    date: "2026-03",
    summary:
      "Developed a State Legislation Tracker, using JS code and Open Legislation v2.0 API data, to help the team and other stakeholders track bills and policies on our agenda.",
    tags: ["Data visualization", "State legislature"],
    file: "dashboard/rr-index.html",
    url: "https://hcfany.org/rate-review/",
  },
  {
    id: "2026-07",
    title: "Healthcare Affordability Dashboard",
    campaign: "hc-affordability",
    type: "dashboard",
    date: "2026-03",
    summary:
      "Developed a State Legislation Tracker, using JS code and Open Legislation v2.0 API data, to help the team and other stakeholders track bills and policies on our agenda.",
    tags: ["Data visualization", "State legislature"],
    file: "dashboard/hc-index.html",
    url: "https://wethepatientsny.org/health-care-affordability/",
  },
   {
    id: "2026-08",
    title: "Healthcare Affordability Trifold",
    campaign: "hc-affordability",
    type: "onepager",
    date: "2026-03",
    summary:
      "Developed a State Legislation Tracker, using JS code and Open Legislation v2.0 API data, to help the team and other stakeholders track bills and policies on our agenda.",
    tags: ["Data visualization", "State legislature"],
    files: [{ path: "pdfs/Healthcare Affordability Trifold FINAL.pdf", label: "Fig. 1 — Enrollment trend" },
    { path: "pdfs/NYC Regional Brief FINAL.pdf", label: "Fig. 2 — Coverage by state" },
           { path: "pdfs/Statewide Regional Brief FINAL.pdf", label: "Fig. 2 — Coverage by state" },],
    url: "",
  },
  {
    id: "2026-09",
    title: "Analysis of Governor Hochul’s 2026 State of the State Initiatives",
    campaign: "nys-legislature",
    type: "link",
    date: "2026-01",
    summary:
      "Updating consumers, who receives coverages on the Marketplace, on how cost-sharing reductions are changing due to the State's Transition back to the Basic Health Plan.",
    tags: ["Policy Writing"],
    file: "",
    url: "https://hcfany.org/hcfany-on-governor-hochuls-2026-state-of-the-state-initiatives/",
  },
  {
    id: "2026-10",
    title: "Campaign Ending Medical Debt in New York",
    campaign: "emd",
    type: "link",
    date: "2026-06",
    summary:
      "Summarizing the advocacy and policy work of the campaign describing the policy victories in nearly ending all medical debt in New York",
    tags: ["Policy Writing"],
    file: "",
    url: "https://hcfany.org/ending-medical-debt/",
  },
  {
    id: "2026-11",
    title: "Updates to Hospital Financial Assistance Law",
    campaign: "emd",
    type: "link",
    date: "2024-10",
    summary:
      "Summarizing policy wins in Hospital Financial Asssitance Law",
    tags: ["Policy Writing"],
    file: "",
    url: "hhttps://hcfany.org/new-yorkers-will-have-an-easier-time-applying-and-finding-affordable-hospital-care/",
  },
];
