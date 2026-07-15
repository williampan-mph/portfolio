// ============================================================
// Rendering + filtering logic. You shouldn't need to edit this
// file — add your work in data.js instead.
// ============================================================

const TYPE_LABELS = {
  dashboard: "Dashboard",
  toolkit: "Toolkit",
  link: "Website",
  onepager: "One-pager",
};

const TYPE_ICONS = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="13" rx="1"/><path d="M7 20h10M12 17v3"/><path d="M6 13l3-4 3 3 4-6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  toolkit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="7" width="18" height="13" rx="1"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M10 14a4 4 0 0 0 5.66 0l2.34-2.34a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0L6 12.34a4 4 0 0 0 5.66 5.66l1-1"/></svg>`,
  onepager: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 2h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M14 2v4h4M9 12h6M9 16h6"/></svg>`,
};

const FILE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 2h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M14 2v4h4"/></svg>`;

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "svg"];

const state = {
  campaign: "all",
  type: "all",
};

function campaignLabel(id) {
  const c = CAMPAIGNS.find((c) => c.id === id);
  return c ? c.label : id;
}

function formatDate(ym) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function fileExtension(path) {
  const clean = path.split("?")[0].split("#")[0];
  const parts = clean.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

function isImageFile(path) {
  return IMAGE_EXTENSIONS.includes(fileExtension(path));
}

function fileName(path) {
  return path.split("/").pop();
}

function renderChips() {
  const campaignWrap = document.getElementById("campaign-chips");
  const typeWrap = document.getElementById("type-chips");

  const allCampaignChip = chip("all", "All campaigns", state.campaign === "all", () => {
    state.campaign = "all";
    render();
  });
  campaignWrap.replaceChildren(
    allCampaignChip,
    ...CAMPAIGNS.map((c) =>
      chip(c.id, c.label, state.campaign === c.id, () => {
        state.campaign = c.id;
        render();
      })
    )
  );

  const allTypeChip = chip("all", "All types", state.type === "all", () => {
    state.type = "all";
    render();
  }, true);
  typeWrap.replaceChildren(
    allTypeChip,
    ...Object.keys(TYPE_LABELS).map((t) =>
      chip(t, TYPE_LABELS[t], state.type === t, () => {
        state.type = t;
        render();
      }, true)
    )
  );
}

function chip(id, label, pressed, onClick, isType = false) {
  const btn = document.createElement("button");
  btn.className = "chip" + (isType ? " chip-type" : "");
  btn.type = "button";
  btn.textContent = label;
  btn.setAttribute("aria-pressed", String(pressed));
  btn.addEventListener("click", onClick);
  return btn;
}

function filteredEntries() {
  return ENTRIES.filter((e) => {
    const campaignMatch = state.campaign === "all" || e.campaign === state.campaign;
    const typeMatch = state.type === "all" || e.type === state.type;
    return campaignMatch && typeMatch;
  }).sort((a, b) => b.date.localeCompare(a.date));
}

function renderEntries() {
  const list = document.getElementById("docket-list");
  const countLine = document.getElementById("count-line");
  const entries = filteredEntries();

  countLine.textContent = `${entries.length} record${entries.length === 1 ? "" : "s"}`;

  if (entries.length === 0) {
    list.replaceChildren();
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No records match this filter.";
    list.appendChild(empty);
    return;
  }

  list.replaceChildren(...entries.map(renderEntry));
}

// ---------- Type-specific preview/action renderers ----------

function renderDashboardPreview(entry, body) {
  // Auto-embed a live preview of the dashboard file, no click required.
  if (entry.file) {
    const wrap = document.createElement("div");
    wrap.className = "dashboard-preview-wrap";

    const header = document.createElement("div");
    header.className = "dashboard-preview-header";
    const label = document.createElement("span");
    label.textContent = "Live preview";
    header.appendChild(label);

    if (entry.url || entry.file) {
      const expand = document.createElement("a");
      expand.className = "entry-action";
      expand.href = entry.url || entry.file;
      expand.target = "_blank";
      expand.rel = "noopener noreferrer";
      expand.textContent = "Open full size ↗";
      header.appendChild(expand);
    }

    const iframe = document.createElement("iframe");
    iframe.src = entry.file;
    iframe.title = entry.title;
    iframe.loading = "lazy";

    wrap.append(header, iframe);
    body.appendChild(wrap);
  } else if (entry.url) {
    const a = document.createElement("a");
    a.className = "entry-action";
    a.href = entry.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = "Open dashboard ↗";
    body.appendChild(a);
  }
}

function renderToolkitFiles(entry, body) {
  const files = entry.files && entry.files.length
    ? entry.files
    : entry.file
    ? [{ path: entry.file, label: fileName(entry.file) }]
    : [];

  if (!files.length && entry.url) {
    const a = document.createElement("a");
    a.className = "entry-action";
    a.href = entry.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = "Open toolkit ↗";
    body.appendChild(a);
    return;
  }

  const images = files.filter((f) => isImageFile(f.path));
  const others = files.filter((f) => !isImageFile(f.path));

  if (images.length) {
    const gallery = document.createElement("div");
    gallery.className = "toolkit-gallery";
    images.forEach((f) => {
      const a = document.createElement("a");
      a.className = "toolkit-thumb";
      a.href = f.path;
      a.target = "_blank";
      a.rel = "noopener noreferrer";

      const img = document.createElement("img");
      img.src = f.path;
      img.alt = f.label || fileName(f.path);
      img.loading = "lazy";

      const cap = document.createElement("span");
      cap.className = "toolkit-thumb-label";
      cap.textContent = f.label || fileName(f.path);

      a.append(img, cap);
      gallery.appendChild(a);
    });
    body.appendChild(gallery);
  }

  if (others.length) {
    const fileList = document.createElement("div");
    fileList.className = "toolkit-file-list";
    others.forEach((f) => {
      const a = document.createElement("a");
      a.className = "toolkit-file-link";
      a.href = f.path;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.innerHTML = `<span class="toolkit-file-icon">${FILE_ICON}</span>${f.label || fileName(f.path)}`;
      fileList.appendChild(a);
    });
    body.appendChild(fileList);
  }
}

function renderSimpleLink(entry, body) {
  const href = entry.file || entry.url;
  if (!href) return;
  const a = document.createElement("a");
  a.className = "entry-action";
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = entry.type === "onepager" ? "View one-pager ↗" : "Visit site ↗";
  body.appendChild(a);
}

function renderEntry(entry) {
  const el = document.createElement("article");
  el.className = "entry";

  const body = document.createElement("div");
  body.className = "entry-body";

  const h3 = document.createElement("h3");
  h3.innerHTML = `<span class="entry-type-icon">${TYPE_ICONS[entry.type] || ""}</span>${entry.title}`;

  const meta = document.createElement("div");
  meta.className = "entry-meta";
  meta.innerHTML = `
    <span class="tag-campaign">${campaignLabel(entry.campaign)}</span>
    <span class="tag-type">${TYPE_LABELS[entry.type] || entry.type}</span>
    <span class="tag-date">${formatDate(entry.date)}</span>
  `;

  const summary = document.createElement("p");
  summary.className = "entry-summary";
  summary.textContent = entry.summary;

  body.append(h3, meta, summary);

  if (entry.tags && entry.tags.length) {
    const tagsRow = document.createElement("div");
    tagsRow.className = "entry-tags";
    tagsRow.replaceChildren(
      ...entry.tags.map((t) => {
        const span = document.createElement("span");
        span.textContent = t;
        return span;
      })
    );
    body.appendChild(tagsRow);
  }

  switch (entry.type) {
    case "dashboard":
      renderDashboardPreview(entry, body);
      break;
    case "toolkit":
      renderToolkitFiles(entry, body);
      break;
    case "onepager":
    case "link":
    default:
      renderSimpleLink(entry, body);
      break;
  }

  el.append(body);
  return el;
}

function render() {
  renderChips();
  renderEntries();
}

document.addEventListener("DOMContentLoaded", render);
