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
  { id: "opioid-response", label: "Opioid Response & Harm Reduction" },
  { id: "telehealth-equity", label: "Telehealth Equity" },
];

const ENTRIES = [
  {
    id: "2026-01",
    title: "New York State Bill Tracker",
    campaign: "nys-legislature",
    type: "dashboard",
    date: "2026-03",
    summary:
      "Developed a State Legislation Tracker, using JS code and Open Legislation v2.0 API data, to help the team and other stakeholders track bills and policies.",
    tags: ["Data visualization", "Website", "State legislature"],
    file: "bill-tracker.js",
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
    tags: ["State legislature", "Published"],
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
      "Updating consumers, who receives coverages on the Marketplace, on how cost-sharing reductions are changing due to the State's Transition back to the Basic Health Plan.",
    tags: ["Published"],
    file: "",
    url: "https://hcfany.org/free-insulin-program-in-new-york-remains-amidst-state-transition-back-to-the-basic-health-plan/",
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
