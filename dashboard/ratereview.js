document.addEventListener("DOMContentLoaded", () => {

  // ─── ADD YOUR CSV URLs HERE ───────────────────────────────────────────────
  // Each entry: { label: "Dropdown display name", url: "https://..." }
  const csvSources = [
 { label: "Premiums" , url: "https://hcfany.org/wp-content/uploads/2026/07/premiums.csv", format: "currency"},
 { label: "Rates",   url: "https://hcfany.org/wp-content/uploads/2026/07/ratereview.csv", format: "percentage" }
    // { label: "Loss Ratio",    url: "https://hcfany.org/wp-content/uploads/2025/12/lossratio.csv" },
    // { label: "Market Share",  url: "https://hcfany.org/wp-content/uploads/2025/12/marketshare.csv" },
    // Add more here as needed
  ];
  // ─────────────────────────────────────────────────────────────────────────

  const svg = d3.select("#chart"),
    width   = +svg.attr("width"),
    height  = +svg.attr("height"),
    margin  = { top: 12, right: 40, bottom: 40, left: 60 },
    x0 = d3.scaleBand().range([margin.left, width - margin.right]).paddingInner(0.2),
    x1 = d3.scaleBand().domain(["Requested", "Approved"]).padding(0.1),
    y  = d3.scaleLinear().range([height - margin.bottom, margin.top]),
    color = d3.scaleOrdinal().domain(["Requested", "Approved"]).range(["#262262", "#e9a533"]),
    yAxisGroup = svg.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},0)`);

  svg.append("text")
    .attr("class", "y-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 18)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text("Rate Increases");

  let years            = [];
  let weightedAverage  = null;
  let previousInsurer  = null;
  let selectedInsurer  = null;
  let globalMinY       = -0.1;
  let globalMaxY       = 0.6;
  let activeFormat = "percentage";

  // variableMap: Map<label, { insurers, weightedAverage }>
  const variableMap = new Map();
  let   activeVariable = null;

  // ─── Y axis (based on file) ────────────────────────────────────────────────
function updateYAxis(data) {
  const allValues = data.values.flatMap(d =>
    [d.Requested, d.Approved].filter(v => v != null)
  );
  const minVal = Math.min(0, d3.min(allValues));
  const maxVal = d3.max(allValues);
  const padding = (maxVal - minVal) * 0.15;

  // update the shared globals so the x-axis label offset stays correct
  globalMinY = minVal - padding;
  globalMaxY = maxVal + padding;

  y.domain([globalMinY, globalMaxY]);

  const tickCount = 8;
  yAxisGroup.transition().duration(500).call(
    d3.axisLeft(y)
      .ticks(tickCount)
      .tickFormat(d => formatValue(d))
  );
}

  // ─── Populate the variable dropdown from csvSources ──────────────────────
  function buildDropdown() {
    const select = document.getElementById("variable-select");
    select.innerHTML = "";

    csvSources.forEach(({ label }) => {
      const opt = document.createElement("option");
      opt.value = label;
      opt.textContent = label;
      select.appendChild(opt);
    });

    // Hide the dropdown row entirely if there's only one variable
    const row = document.getElementById("variable-row");
    if (row) row.style.display = csvSources.length <= 1 ? "none" : "";
  }

  // ─── Parse CSV text into { insurers, weightedAverage } ───────────────────
  function parseCSV(text, format) {
    const raw     = d3.csvParse(text);
    const yearSet = new Set();

    Object.keys(raw[0]).forEach(k => {
      const match = k.match(/^(\d{4})\s+(Requested|Approved)$/);
      if (match) yearSet.add(+match[1]);
    });


    // Set shared year domain from the first CSV loaded
    if (years.length === 0) {
      years = Array.from(yearSet).sort();
      x0.domain(years);
      x1.range([0, x0.bandwidth()]);
    }

    const parseData = row => years.map(year => ({
      year,
     Requested: parseValue(
row[`${year} Requested`],
format
),

Approved: parseValue(
row[`${year} Approved`],
format
)
    }));

    return {
      insurers:        raw.slice(0, -1).map(row => ({ insurer: row["Insurer"], values: parseData(row) })),
      weightedAverage: { insurer: "__Weighted Average", values: parseData(raw.at(-1)) }
    };
  }

  // ─── Fetch all CSVs, then activate the first one ──────────────────────────
  function loadAllCSVs() {
    const fetches = csvSources.map(({ label, url, format}) =>
      fetch(url)
        .then(res => res.text())
        .then(text => ({ label, data: parseCSV(text, format) }))
    );

    Promise.all(fetches).then(results => {
      results.forEach(({ label, data }) => variableMap.set(label, data));

      buildDropdown();
      activeVariable = csvSources[0].label;
      document.getElementById("variable-select").value = activeVariable;

      activeFormat = csvSources[0].format;
 switchVariable(csvSources[0].label);
      drawLegend();
    });
  }

  // ─── Switch active variable ───────────────────────────────────────────────
 function switchVariable(label) {
  if (!variableMap.has(label)) return;
  activeFormat = csvSources.find(d => d.label === label).format;
  activeVariable = label;
  weightedAverage = variableMap.get(label).weightedAverage;

  const previouslySelected = selectedInsurer; // ← save current selection

  buildTabs(variableMap.get(label).insurers);

  // ← try to restore previous insurer, fall back to Weighted Average
  const match = variableMap.get(label).insurers.find(d => d.insurer === previouslySelected);
  selectedInsurer = match ? match.insurer : "__Weighted Average";
  previousInsurer = null;

  // ← highlight the correct tab
  d3.selectAll(".tab-button").classed("active", false);
  d3.selectAll(".tab-button").filter(d =>
    d.insurer === selectedInsurer
  ).classed("active", true);

  updateChart();
}


  // ─── Dropdown change handler ──────────────────────────────────────────────
  document.getElementById("variable-select").addEventListener("change", function () {
    switchVariable(this.value);
  });

  // ─── Build insurer tab buttons ────────────────────────────────────────────
  function buildTabs(insurers) {
    const tabsContainer = d3.select("#insurer-tabs");
    tabsContainer.selectAll("button").remove();

    const allTabs = [{ insurer: "__Weighted Average" }, ...insurers];

    tabsContainer.selectAll("button")
      .data(allTabs)
      .enter()
      .append("button")
      .attr("class", "tab-button")
      .text(d => d.insurer === "__Weighted Average" ? "Weighted Average" : d.insurer)
      .on("click", function (event, d) {
        selectedInsurer = d.insurer;
        d3.selectAll(".tab-button").classed("active", false);
        d3.select(this).classed("active", true);
        updateChart();
      });
  }

  // ─── updateChart ──────────────────────────────────────────────────────────
  function updateChart() {
    if (!activeVariable || !selectedInsurer) return;

    const dataset = variableMap.get(activeVariable);
    if (!dataset) return;

    const isWeightedTab = selectedInsurer === "__Weighted Average";
    const data = isWeightedTab
      ? dataset.weightedAverage
      : dataset.insurers.find(d => d.insurer === selectedInsurer);
    if (!data) return;

    const toggleWrapper = document.getElementById("toggle-weighted-average").closest("label");
    if (toggleWrapper) toggleWrapper.style.display = isWeightedTab ? "none" : "";

    const showWeighted   = document.getElementById("toggle-weighted-average").checked;
    const insurerChanged = selectedInsurer !== previousInsurer;
    previousInsurer = selectedInsurer;

    const flattened = data.values.flatMap(d => [
      d.Requested != null ? { year: d.year, type: "Requested", value: d.Requested } : null,
      d.Approved  != null ? { year: d.year, type: "Approved",  value: d.Approved  } : null
    ]).filter(Boolean);

    const grouped = d3.groups(flattened, d => d.year);

    svg.selectAll(".chart-content").remove();
    svg.selectAll(".benchmark-line-group, .benchmark-point").remove();

//y-axis
    updateYAxis(data);
 
    // X axis
    const xAxisG = svg.append("g")
      .attr("class", "x-axis chart-content")
      .attr("transform", `translate(0,${y(0)})`)
      .call(d3.axisBottom(x0).tickFormat(d3.format("d")));

    xAxisG.selectAll(".tick line").attr("y2", 6);

 xAxisG.selectAll("text")
 .style("font-size", "16px")
 .style("font-weight", "bold")
 .attr("transform", `translate(0,${y(globalMinY) - y(0) + 2})`);

    // Bars + value labels
    const yearGroups = svg.selectAll(".year-group")
      .data(grouped)
      .enter()
      .append("g")
      .attr("class", "year-group chart-content")
      .attr("transform", ([year]) => `translate(${x0(year)},0)`)
      .on("mouseenter", function (event, [_, bars]) {
        const r = bars.find(d => d.type === "Requested"),
              a = bars.find(d => d.type === "Approved");
        if (r && a) showDifference(this, r, a);
      })
      .on("mouseleave", function () {
        d3.select(this).selectAll(".difference-line, .difference-label-group").remove();
      });

    yearGroups.each(function ([_, bars]) {
      const g = d3.select(this);
      bars.forEach(d => {
        const rect = g.append("rect")
          .attr("x", x1(d.type))
          .attr("y", insurerChanged ? y(0) : (d.value >= 0 ? y(d.value) : y(0)))
          .attr("width", x1.bandwidth())
          .attr("height", insurerChanged ? 0 : Math.abs(y(d.value) - y(0)))
          .attr("fill", color(d.type));

        if (insurerChanged) {
          rect.transition().duration(750)
            .attr("y", d.value >= 0 ? y(d.value) : y(0))
            .attr("height", Math.abs(y(d.value) - y(0)));
        }

        g.append("text")
          .attr("x", x1(d.type) + x1.bandwidth() / 2)
          .attr("y", d.value >= 0 ? y(d.value) - 5 : y(d.value) + 15)
          .attr("text-anchor", "middle")
          .attr("font-size", "14px")
          .attr("font-weight", "bold")
          .attr("fill", color(d.type))
          .text(formatValue(d.value));
      });
    });

    if (!isWeightedTab && showWeighted) {
      drawBenchmark(dataset.weightedAverage.values);
    }
  }

  // ─── Toggle weighted average overlay ─────────────────────────────────────
  document.getElementById("toggle-weighted-average").addEventListener("change", function () {
    svg.selectAll(".benchmark-line-group, .benchmark-point").remove();
    if (this.checked) {
      const dataset = variableMap.get(activeVariable);
      if (dataset) drawBenchmark(dataset.weightedAverage.values);
    }
  });

  // ─── drawBenchmark (unchanged) ────────────────────────────────────────────
  function drawBenchmark(values) {
    const lineGroup = svg.append("g").attr("class", "benchmark-line-group");

    const lineRequested = d3.line()
      .defined(d => d.Requested != null)
      .x(d => x0(d.year) + x0.bandwidth() / 2)
      .y(d => y(d.Requested));

    const lineApproved = d3.line()
      .defined(d => d.Approved != null)
      .x(d => x0(d.year) + x0.bandwidth() / 2)
      .y(d => y(d.Approved));

    lineGroup.append("path").datum(values)
      .attr("fill", "none").attr("stroke", "#4949a0")
      .attr("stroke-width", 3).attr("stroke-dasharray", "5,3")
      .attr("d", lineRequested);

    lineGroup.append("path").datum(values)
      .attr("fill", "none").attr("stroke", "#e28d40")
      .attr("stroke-width", 3).attr("stroke-dasharray", "5,3")
      .attr("d", lineApproved);

    ["Requested", "Approved"].forEach(type => {
      values.forEach(d => {
        const val = d[type];
        if (val == null) return;
        const cx  = x0(d.year) + x0.bandwidth() / 2;
        const cy  = y(val);
        const col = type === "Requested" ? "#4949a0" : "#e28d40";
        const pg  = svg.append("g").attr("class", "benchmark-point");

        pg.append("circle")
          .attr("cx", cx).attr("cy", cy).attr("r", 4)
          .attr("fill", col).style("cursor", "pointer")
          .on("mouseenter", function () {
            const lg  = pg.append("g").attr("class", "benchmark-label-group");
            const txt = lg.append("text")
              .attr("x", cx).attr("y", cy - 12)
              .attr("text-anchor", "middle").attr("font-size", "13px")
              .attr("font-weight", "bold").attr("fill", col).attr("dy", "0.35em")
              .text(formatValue(val));
            const bb = txt.node().getBBox();
            lg.insert("rect", "text")
              .attr("x", bb.x - 4).attr("y", bb.y - 2)
              .attr("width", bb.width + 8).attr("height", bb.height + 4)
              .attr("rx", 4).attr("ry", 4)
              .attr("fill", "#fff5f0").attr("stroke", col).attr("stroke-width", 1);
          })
          .on("mouseleave", function () { pg.selectAll(".benchmark-label-group").remove(); });
      });
    });
  }

  // ─── showDifference (unchanged) ───────────────────────────────────────────
  function showDifference(group, r, a) {
    const midX  = ((x1("Requested") + x1.bandwidth() / 2) + (x1("Approved") + x1.bandwidth() / 2)) / 2;
    const y1Val = y(r.value), y2Val = y(a.value);
    const diff  = d3.format("+.1%")((a.value - r.value) / Math.abs(r.value));

    d3.select(group).append("line")
      .attr("class", "difference-line")
      .attr("x1", midX).attr("x2", midX)
      .attr("y1", y1Val).attr("y2", y2Val)
      .attr("stroke", "#df6334").attr("stroke-width", 2);

    const lg  = d3.select(group).append("g").attr("class", "difference-label-group");
    const txt = lg.append("text")
      .attr("x", midX + 5).attr("y", y1Val)
      .attr("dy", "0.35em").attr("font-size", "13px")
      .attr("font-weight", "bold").attr("fill", "#df6334")
      .text(diff);
    const bb = txt.node().getBBox();
    lg.insert("rect", "text")
      .attr("x", bb.x - 4).attr("y", bb.y - 2)
      .attr("width", bb.width + 8).attr("height", bb.height + 4)
      .attr("rx", 4).attr("ry", 4)
      .attr("fill", "#fff5f0").attr("stroke", "#df6334").attr("stroke-width", 1);
  }

  // ─── drawLegend (unchanged) ────────────────────────────────────────────────
  function drawLegend() {
    svg.selectAll(".legend").remove();
    const legendData = [
      { label: "Requested", color: "#262262" },
      { label: "Approved",  color: "#e9a533" },
      { label: "Difference",color: "#df6334" }
    ];
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(75, 20)");
    const items = legend.selectAll(".legend-item")
      .data(legendData).enter()
      .append("g").attr("class", "legend-item")
      .attr("transform", (_, i) => `translate(${i * 120}, 0)`);
    items.append("rect")
      .attr("width", 20).attr("height", 20)
      .attr("fill", d => d.color).attr("rx", 3).attr("ry", 3);
    items.append("text")
      .attr("x", 30).attr("y", 15)
      .attr("font-size", "15px").attr("fill", "#333")
      .text(d => d.label);
  }

  // ─── parsePct helper ───────────────────────────────────────────────────────
function parseValue(val, format) {

 if (!val || val.trim() === "") return null;

 val = val.replace(/[$,% ,]/g, "");

 const num = parseFloat(val);

 if (isNaN(num)) return null;

 return format === "percent"
? num / 100
: num;
}
function formatValue(value){

    if(value == null) return "";

    if(activeFormat === "percentage"){
        return d3.format(".0%")(value/100);
    }

    return d3.format("$,.0f")(value);
}

  // ─── Kick everything off ───────────────────────────────────────────────────
  loadAllCSVs();

});
