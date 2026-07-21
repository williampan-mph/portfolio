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
    date: "2026-5",
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
      "Updated consumers on how cost-sharing reductions are changing due to the State's transition back to the Basic Health Plan.",
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
      "Policy briefs on Congressional District-Level and Statewide-Level Impacts of federal changes to the ACA in New York.",
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
      "Developed a data dashboard, using external data, to inform policymakers and consumers on how federal cuts to the ACA affects New Yorkers by Congressional District.",
    tags: ["Dashboard", "Published"],
    file: "dashboard/ft-index.html",
    url: "https://hcfany.org/federal-threats-to-health-coverage/",
  },
  {
    id: "2026-06",
    title: "Rate-Review",
    campaign: "nys-legislature",
    type: "dashboard",
    date: "2026-06",
    summary:
      "Built a dashbaord on the prior approval process of health plans on the Marketplace and their approved rates by the Department of Financial Services.",
    tags: ["Data visualization", "State Marketplace"],
    file: "dashboard/rr-index.html",
    url: "https://hcfany.org/rate-review/",
  },
  {
    id: "2026-07",
    title: "Healthcare Affordability Dashboard",
    campaign: "hc-affordability",
    type: "dashboard",
    date: "2024-11",
    summary:
      "Developed a dashboard to disseminate regional briefs on heatlh care affordability.",
    tags: ["Data visualization"],
    file: "dashboard/hc-index.html",
    url: "https://wethepatientsny.org/health-care-affordability/",
  },
   {
    id: "2026-08",
    title: "Healthcare Affordability Trifold and Policy Briefs",
    campaign: "hc-affordability",
    type: "onepager",
    date: "2025-10",
    summary:
      "Led an exhibit on the organization's analysis on health care affordability in New York and developed all hand-out materials.",
    tags: ["Policy Writing"],
    files: [{ path: "pdfs/Healthcare Affordability Trifold FINAL.pdf", label: "Trifold" },
    { path: "pdfs/NYC Regional Brief FINAL.pdf", label: "NYC Policy Brief" },
           { path: "pdfs/Statewide Regional Brief FINAL.pdf", label: "NYS Policy Brief" },],
    url: "",
  },
  {
    id: "2026-09",
    title: "Analysis of Governor Hochul’s 2026 State of the State Initiatives",
    campaign: "nys-legislature",
    type: "link",
    date: "2026-01",
    summary:
      "Analyzing the Governor's intent on the FY2026-27 Fiscal Budget.",
    tags: ["Policy Writing"],
    file: "",
    url: "https://hcfany.org/hcfany-on-governor-hochuls-2026-state-of-the-state-initiatives/",
  },
  {
    id: "2026-10",
    title: "Campaign Ending Medical Debt in New York",
    campaign: "emd",
    type: "link",
    date: "2026-05",
    summary:
      "Summarizing the advocacy and policy work of the campaign describing the policy victories that lead to the elimination of nearly all medical debt lawsuits.",
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
      "Summarizing policy wins in Hospital Financial Asssitance Law.",
    tags: ["Policy Writing"],
    file: "",
    url: "hhttps://hcfany.org/new-yorkers-will-have-an-easier-time-applying-and-finding-affordable-hospital-care/",
  },
  {
    id: "2026-12",
    title: "Understanding how the Fair Pricing Act",
    campaign: "hc-affordability",
    type: "toolkit",
    date: "2026-01",
    summary:
      "Figure depicting how the Fair Pricing Act would benefit New Yorkers.",
    tags: ["Data Visualization"],
     files: [{ path: "png/FPA/1.png", label: "Cover" },
    { path: "png/FPA/2.png", label: "1" },
           { path: "png/FPA/3.png", label: "2" },],
    url: "",
  },
  {
    id: "2026-13",
    title: "Toolkit promoting Bill to Protect Health Coverage",
    campaign: "aca-changes",
    type: "toolkit",
    date: "2026-03",
    summary:
      "Utilizing data to develop a social mmedia toolkit for coalition members to push S9589/A10926.",
    tags: ["Data Visualization"],
     files: [{ path: "png/FT/Cover.png", label: "Cover" },
    { path: "png/FT/Brooklyn.png", label: "1" },
           { path: "png/FT/3.Queens", label: "2" },],
    url: "",
  },
   {
    id: "2026-14",
    title: "Know Your Rights - Medical Debt",
    campaign: "emd",
    type: "onepager",
    date: "2025-07",
    summary:
      "Developed consumer brief on new Hospital Financial Assistance and Medical Debt policies.",
    tags: ["Data Visualization","Policy Writing"],
     files: [{ path: "pdfs/Medical-Debts-KYR.pdf", label: "Open" },],
    url: "",
  },
   {
    id: "2026-15",
    title: "Health Coverage Eligibility due to Federal Changes",
    campaign: "aca-cahnges",
    type: "onepager",
    date: "2025-07",
    summary:
      "Policy brief informing how federal changes to the ACA will affect coverage for certain immigrant groups in New York.",
    tags: ["Data Visualization","Policy Writing"],
     files: [{ path: "pdfs/4_6-NYS-Immigrant-Health-Coverage.pdf", label: "Open" },],
    url: "",
  },
    {
    id: "2026-16",
    title: "Proposals on how to mitigate coverage losses form federal changes",
    campaign: "aca-cahnges",
    type: "link",
    date: "2026-04",
    summary:
      "Page for stakeholders and consumers to understand what they can do to mitigate coverage losses from federal changes to the ACA.",
    tags: ["Policy Writing"],
     file: "",
    url: "https://hcfany.org/protecting-health-coverage-for-new-yorkers/",
  },
   {
    id: "2026-17",
    title: "HCFANY 2026 Legislative Agenda",
    campaign: "aca-cahnges",
    type: "onepager",
    date: "2026-02",
    summary:
      "Developed Legislative Agenda for a coalition of 170+ organizations.",
    tags: ["Policy Writing"],
     files: [{ path: "pdfs/2026-HCFANY-Legislative-Agenda-1.pdf", label: "Open" },],
    url: "",
  },
];
