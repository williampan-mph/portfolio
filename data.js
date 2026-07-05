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
  { id: "medicaid-expansion", label: "Medicaid Expansion" },
  { id: "maternal-health", label: "Maternal Health Access" },
  { id: "opioid-response", label: "Opioid Response & Harm Reduction" },
  { id: "telehealth-equity", label: "Telehealth Equity" },
];

const ENTRIES = [
  {
    id: "2026-01",
    title: "State Medicaid Expansion Tracker",
    campaign: "medicaid-expansion",
    type: "dashboard",
    date: "2026-03",
    summary:
      "Developed a Legislative Tracker, using JS code and Open Legislation v2.0 API data, to help the team and other stakeholders track bills and policies.",
    tags: ["Data visualization", "Website"],
    file: "bill-tracker.js",
    url: "",
  },
  {
    id: "2026-02",
    title: "Postpartum Coverage Extension — One-Pager",
    campaign: "maternal-health",
    type: "onepager",
    date: "2026-02",
    summary:
      "Two-page leave-behind for state legislators summarizing the case for extending postpartum Medicaid coverage to 12 months, with district-level impact data.",
    tags: ["Fact sheet", "State legislature"],
    file: "assets/onepagers/postpartum-coverage-onepager.pdf",
    url: "",
  },
  {
    id: "2026-03",
    title: "#CoverThe12Months Social Toolkit",
    campaign: "maternal-health",
    type: "toolkit",
    date: "2026-02",
    summary:
      "Coalition social media toolkit with graphics, sample copy, and a posting calendar distributed to 14 partner organizations for a coordinated advocacy push.",
    tags: ["Coalition coordination", "Social strategy"],
    file: "assets/toolkits/cover-the-12-months-toolkit.zip",
    url: "",
  },
  {
    id: "2026-04",
    title: "Harm Reduction Funding Explainer",
    campaign: "opioid-response",
    type: "link",
    date: "2026-01",
    summary:
      "Public-facing explainer published on our organization's site breaking down state opioid settlement fund allocation and how residents can advocate for local spending priorities.",
    tags: ["Public education", "Published"],
    file: "",
    url: "https://example.org/harm-reduction-funding-explainer",
  },
];
