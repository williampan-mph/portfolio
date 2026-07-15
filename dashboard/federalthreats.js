document.addEventListener("DOMContentLoaded", function () {

  /* ============================================================
     SHARED STYLES
  ============================================================ */
  const defaultStyle = {
    color: "#fff",
    fillColor: "#1e555c",
    fillOpacity: 0.7,
    weight: 1
  };

  const highlightStyle = {
    fillColor: "#58355e",
    weight: 3
  };

  /* ============================================================
     ===================== MAP 1 — DISTRICTS =====================
  ============================================================ */

  const map1 = L.map("map").setView([42.9543, -75.8262], 7);
  L.tileLayer("", { attribution: "" }).addTo(map1);

  let selectedLayer1 = null;
  let statewideData1 = null;
  let currentCategory = "medicaid";

  const districtLookup1 = {};
  const districtFeatures1 = {};

  const sheetUrl1 = "NY-Federal-Threats-to-Health-Care.csv";
  const geoJsonUrl1 = "https://raw.githubusercontent.com/HCFANY/ny-congressional-districts/ac573ceb2a46b4268404b06cc0c3313da807ddef/NYS_Congressional_Districts_1248143431698889131.geojson";


  /* ------------------------------------------------------------
     UPDATE STATEWIDE DASHBOARD
  ------------------------------------------------------------ */
  function updateStateDashboard1(category) {
    const content = document.getElementById("state-dashboard-content");
    if (!statewideData1) {
      content.innerHTML = `<div class="metric-value">Statewide data not available</div>`;
      return;
    }

    const val = key => statewideData1[key] || "N/A";
    let html = "";

    if (category === "medicaid") {
      html = `
        <div class="state-metric"><div class="metric-label">Medicaid Enrollees</div><div class="metric-value">${val('num of Medicaid Enrollees')}</div></div>
        <div class="state-metric"><div class="metric-label">Medicaid Enrollees Losing Coverage</div><div class="metric-value">${val('uninsured Medicaid')}</div></div>`;
    } else if (category === 'ep') {
      html = `
        <div class="state-metric"><div class="metric-label">Essential Plan Enrollees</div><div class="metric-value">${val('num of EP Enrollees')}</div></div>
        <div class="state-metric"><div class="metric-label">Essential Plan Enrollees Losing Coverage</div><div class="metric-value">${val('EP constituents losing coverage')}</div></div>`;
    } else if (category === 'funding') {
      html = `
        <div class="state-metric"><div class="metric-label">Hospital Funding Loss</div><div class="metric-value">${val('Total Hospital Loss')}</div></div>
        <div class="state-metric"><div class="metric-label">Statewide Fiscal Impact Anually</div><div class="metric-value">$${val('Total Cost to the District Annually')}</div></div>`;
    } else if (category === 'hp') {
  html = `
    <div class="state-metric"><div class="metric-label">Hospital Employment Losses</div><div class="metric-value">${val('Hospital Employment Losses')}</div></div>
    <div class="state-metric"><div class="metric-label">Total Employment Losses</div><div class="metric-value">${val('Total Employment Losses')}</div></div>
    <div class="state-metric"><div class="metric-label">Lost Economic Activity</div><div class="metric-value">${val('Lost Economic Activity ($)')}</div></div>
  `;
}  else if (category === 'premium') {
  html = `
    <p style="flex-basis: 100%; font-size: 15px; color: #333; margin: 0 0 10px 0;">
      *Due to the elimination of American Rescue Plan enhanced premium tax credits, which expired in 2025. Enrollees who receive these credits will.. 
    </p>
    <div class="state-metric"><div class="metric-label">Average Monthly Increase for a Couple ($)</div><div class="metric-value">${val('Average Monthly Cost Increase For a Couple')}</div></div>
    <div class="state-metric"><div class="metric-label">Average Monthly Increase for a Couple (%)</div><div class="metric-value">${val('percentage dollar increase')}</div></div>
	<div class="state-metric"><div class="metric-label">Lose Subsidized Coverage</div><div class="metric-value">${val('loss in sub cov')}</div></div>
    <div class="state-metric"><div class="metric-label">Become Uninsured</div><div class="metric-value">${val('ePTC uninsured')}</div></div>`;
    }
    content.innerHTML = html;
  }



/* ------------------------------------------------------------
   TAB ACTIVATION (MAP 1 ONLY)
------------------------------------------------------------ */
window.activateCategoryTab = function (category) {
  currentCategory = category;

  // Highlight dashboard tab buttons
  document.querySelectorAll(".dashboard-tab-btn").forEach(btn => {
    btn.classList.toggle(
      "active",
      btn.getAttribute("data-category") === category
    );
  });

  // Update statewide dashboard
  updateStateDashboard1(category);

  // Update district popup tabs (if visible)
  const popup = document.querySelector("#district-info .district-popup");
  if (popup) {
    popup.querySelectorAll(".tab-content").forEach(tab => {
      const isActive = tab.id === `${category}-tab`;
      tab.style.display = isActive ? "block" : "none";
    });
  }
};

/* ------------------------------------------------------------
   TAB BUTTON CLICK HANDLERS — YOU WERE MISSING THIS
------------------------------------------------------------ */
document.querySelectorAll(".dashboard-tab-btn").forEach(btn => {
  btn.addEventListener("click", function () {
    activateCategoryTab(this.getAttribute("data-category"));
  });
});


  /* ------------------------------------------------------------
     DISTRICT SELECT + CONTROL
  ------------------------------------------------------------ */
  const DistrictControl1 = L.Control.extend({
    onAdd: function () {
      const container = L.DomUtil.create("div", "leaflet-custom-ui");

      const select = L.DomUtil.create("select", "", container);
      select.id = "district-select";
      select.innerHTML = `<option value="">Select a District</option>`;

      const btn = L.DomUtil.create("button", "", container);
      btn.id = "reset-view-btn";
      btn.innerText = "Reset View";

      btn.onclick = () => {
        map1.setView([42.9543, -75.8262], 7);
        document.getElementById("district-info1").style.display = "none";

        if (selectedLayer1) selectedLayer1.setStyle(defaultStyle);
        selectedLayer1 = null;

        select.value = "";
      };

      L.DomEvent.disableClickPropagation(container);
      return container;
    }
  });

  map1.addControl(new DistrictControl1({ position: "topright" }));

  /* ------------------------------------------------------------
     LOAD DISTRICT DATA
  ------------------------------------------------------------ */
  Papa.parse(sheetUrl1, {
    download: true,
    header: true,
    complete: function (results) {
      const data = results.data;

      data.forEach(r => {
        if (!r.District) return;

        const key = r.District.trim();

        if (key.toLowerCase() === "statewide") statewideData1 = r;
        else districtLookup1[key] = r;
      });

      updateStateDashboard1("medicaid");

      fetch(geoJsonUrl1)
        .then(res => res.json())
        .then(geojson => {
          L.geoJSON(geojson, {
            style: defaultStyle,
            onEachFeature: function (feature, layer) {
              const num = feature.properties.District?.toString().trim();
              const d = districtLookup1[num];

              /* ------------------------------
                 POPUP HTML — MAP 1
              ------------------------------ */
              let html = `
                <div class="district-popup">
                  <div class="district-container">
                    <span class="district-title">District ${num}</span>
                    <span class="district-member"> — ${d?.['Congressmember'] || 'N/A'}</span>
						${d?.['PDF Link'] ? `<a href="${d['PDF Link']}" target="_blank" rel="noopener noreferrer"
						   style="font-size:14px;display:inline-block;background:#58355e;color:#fff;padding:4px 8px;border-radius:3px;text-decoration:none;">
						  📄 Download District One‑Pager
						</a>` : ''}
					  </div>


                  <div class="tab-container">
					  <div id="medicaid-tab" class="tab-content" style="display:${currentCategory === 'medicaid' ? 'block' : 'none'}">
						<div class="district-data-row">
						<div class="data-block"><div class="data-value">${d?.['num of Medicaid Enrollees']||'N/A'}</div><div class="data-label">Medicaid Enrollees</div></div>
						<div class="data-block"><div class="data-value">${d?.['uninsured Medicaid']||'N/A'}</div><div class="data-label">Will Lose Their Current Coverage</div></div>
						<div class="data-block"><div class="data-value">${d?.['Proportion of Constituents on Medicaid']||'N/A'}</div><div class="data-label">Coverage Loss</div></div>
					  </div></div>
					  <div id="ep-tab" class="tab-content" style="display:${currentCategory === 'ep' ? 'block' : 'none'}">
						<div class="district-data-row">
						<div class="data-block"><div class="data-value">${d?.['num of EP Enrollees']||'N/A'}</div><div class="data-label">EP Enrollees</div></div>
						<div class="data-block"><div class="data-value">${d?.['EP constituents losing coverage']||'N/A'}</div><div class="data-label">Will Lose Their Current Coverage</div></div>
						<div class="data-block"><div class="data-value">${d?.['Proportion of Consituents on EP']||'N/A'}</div><div class="data-label">Coverage Loss</div></div>
					  </div></div>
					  <div id="funding-tab" class="tab-content" style="display:${currentCategory === 'funding' ? 'block' : 'none'}">
						<div class="district-data-row">
						<div class="data-block"><div class="data-value">${d?.['Total Hospital Loss']||'N/A'}</div><div class="data-label">Hospital Funding Loss</div></div>
						<div class="data-block"><div class="data-value">${d?.['Total Cost to the District Annually']||'N/A'}</div><div class="data-label">District Fiscal Cost</div></div>
					  </div></div>
					  <div id="hp-tab" class="tab-content" style="display:${currentCategory === 'hp' ? 'block' : 'none'}">
						<div class="district-data-row">
						<div class="data-block"><div class="data-value">${d?.['Hospital Employment Losses']||'N/A'}</div><div class="data-label">Hospital Employment Losses</div></div>
						<div class="data-block"><div class="data-value">${d?.['Total Employment Losses']||'N/A'}</div><div class="data-label">Total Employment Losses</div></div>
						<div class="data-block"><div class="data-value">${d?.['Lost Economic Activity ($)']||'N/A'}</div><div class="data-label">Lost Economic Activity</div></div>
					  </div></div>
					  <div id="premium-tab" class="tab-content" style="display:${currentCategory === 'premium' ? 'block' : 'none'}">
						  <div class="district-data-row">
							<div class="data-block"><div class="data-value">${d?.['Average Monthly Cost Increase For a Couple']||'N/A'}</div><div class="data-label">Monthly Increase for a Couple ($)</div></div>
							<div class="data-block"><div class="data-value">${d?.['percentage dollar increase']||'N/A'}</div><div class="data-label">Monthly Increase for a Couple (%)</div></div>
							<div class="data-block"><div class="data-value">${d?.['loss in sub cov']||'N/A'}</div><div class="data-label">Will Lose Subsidized Coverage</div></div>
							<div class="data-block"><div class="data-value">${d?.['ePTC uninsured']||'N/A'}</div><div class="data-label">Will Become Uninsured</div></div>
						  </div>
						</div>
				</div>
				`;


              districtFeatures1[num] = { layer, content: html };

              layer.on("click", () => {
                if (selectedLayer1 && selectedLayer1 !== layer)
                  selectedLayer1.setStyle(defaultStyle);

                selectedLayer1 = layer;
                layer.setStyle(highlightStyle);

                map1.fitBounds(layer.getBounds(), {
                  paddingBottomRight: [0, 250],
                  maxZoom: 10
                });

                const info = document.getElementById("district-info");
                info.innerHTML = html;
                info.style.display = "block";

                document.getElementById("district-select").value = num;
                activateCategoryTab(currentCategory);
              });
            }
          }).addTo(map1);

          const select = document.getElementById("district-select");
          Object.keys(districtFeatures1)
            .sort((a, b) => +a - +b)
            .forEach(num => {
              const o = document.createElement("option");
              o.value = num;
              o.text = `District ${num}`;
              select.appendChild(o);
            });

          select.addEventListener("change", function () {
            const sel = this.value;
            if (!sel || !districtFeatures1[sel]) return;

            const { layer, content } = districtFeatures1[sel];

            if (selectedLayer1 && selectedLayer1 !== layer)
              selectedLayer1.setStyle(defaultStyle);

            selectedLayer1 = layer;
            layer.setStyle(highlightStyle);

            map1.fitBounds(layer.getBounds(), {
              paddingBottomRight: [0, 250],
              maxZoom: 10
            });

            const info = document.getElementById("district-info");
            info.innerHTML = content;
            info.style.display = "block";
          });
        });
    }
  });
  /* ============================================================
     ====================== MAP 2 — COUNTIES ======================
  ============================================================ */

  const map2 = L.map("map2").setView([42.9543, -75.8262], 6.7);
  L.tileLayer("", { attribution: "" }).addTo(map2);

  let selectedLayer2 = null;
  const countyLookup2 = {};
  const countyFeatures2 = {};

  const sheetUrl2 = "cms-guidelines.csv";
  const geoJsonUrl2 = "https://raw.githubusercontent.com/HCFANY/ny-counties/main/NYS_Civil_Boundaries_2455759864913236436%20(1).geojson";


  Papa.parse(sheetUrl2, {
    download: true,
    header: true,
    complete: function (results) {
      const data = results.data;

      data.forEach(row => {
        const county = row.COUNTY?.trim();
        if (county) countyLookup2[county] = row;
      });

      fetch(geoJsonUrl2)
        .then(res => res.json())
        .then(geojson => {
          L.geoJSON(geojson, {
            style: defaultStyle,
            onEachFeature: function (feature, layer) {
              const countyName = feature.properties.NAME?.trim();
              const countyData = countyLookup2[countyName];

              let html = `
                <div class="district-popup">
                  <div class="district-container">
                    <span class="district-title">${countyName} County</span>
                  </div>
                  <div class="tab-container">
                    <div class="district-data-row">
                      <div class="data-block"><div class="data-value">${countyData.MEDICAID}</div><div class="district-label">Children Will Lose Medicaid</div></div>
                      <div class="data-block"><div class="data-value">${countyData.CHP}</div><div class="district-label">Children Will Lose CHP</div></div>
                      <div class="data-block"><div class="data-value">${countyData.TOTAL}</div><div class="district-label">Total</div></div>
                    </div>
                  </div></div>`;
				
              countyFeatures2[countyName] = { layer, content: html };

              layer.on("click", () => {
                if (selectedLayer2 && selectedLayer2 !== layer)
                  selectedLayer2.setStyle(defaultStyle);

                selectedLayer2 = layer;
                layer.setStyle(highlightStyle);

                map2.fitBounds(layer.getBounds(), {
                  padding: [20, 20],
                  maxZoom: 10
                });

                const info = document.getElementById("district-info2");
                info.innerHTML = html;
                info.style.display = "block";

                document.getElementById("district-select2").value = countyName;
              });
            }
          }).addTo(map2);
		  
 /* ------------------------------------------------------------
   COUNTY SELECT + CONTROL (MAP 2)
------------------------------------------------------------ */
const CountyControl = L.Control.extend({
  onAdd: function () {
    const container = L.DomUtil.create("div", "leaflet-custom-ui-2");

    // Dropdown
    const select = L.DomUtil.create("select", "", container);
    select.id = "county-select";
    select.innerHTML = `<option value="">Select a County</option>`;

    // Reset Button
    const btn = L.DomUtil.create("button", "", container);
    btn.id = "reset-view-btn-2";
    btn.innerText = "Reset View";

    // Reset behavior
    btn.onclick = () => {
      map2.setView([42.9543, -75.8262], 7);
      document.getElementById("district-info2").style.display = "none";

      if (selectedCountyLayer) selectedCountyLayer.setStyle(defaultStyle2);
      selectedCountyLayer = null;

      select.value = "";
    };

    return container;
  }
});
    map2.addControl(new CountyControl({ position: "topright" }));
   		  
    const select2 = document.getElementById("county-select2");
          Object.keys(countyFeatures2).sort().forEach(county => {
            const o = document.createElement("option");
            o.value = county;
            o.text = `${county} County`;
            select2.appendChild(o);
          });

          select2.addEventListener("change", function () {
            const sel = this.value;
            if (!sel || !countyFeatures2[sel]) return;

            const { layer, content } = countyFeatures2[sel];

            if (selectedLayer2 && selectedLayer2 !== layer)
              selectedLayer2.setStyle(defaultStyle);

            selectedLayer2 = layer;
            layer.setStyle(highlightStyle);

            map2.fitBounds(layer.getBounds(), {
              padding: [20, 20],
              maxZoom: 10
            });

            const info = document.getElementById("district-info2");
            info.innerHTML = content;
            info.style.display = "block";
      
          });
        });
    }
  });


});


