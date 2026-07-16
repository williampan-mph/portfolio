// DO NOT CHANGE
const encoded = "cEZHN0ZmV25iTXM1SDlIZFpRV0RZbVZHOHV0bnhTRHg=";
const billTrackerKey = atob(encoded);
// Change based on what year it is
const year = "2026";

/* ============================================================
   FETCH BILL DATA
============================================================ */
// Date Formating
function formatDate(dateStr) {
    if (!dateStr) return ""; // Handle null/undefined
    const [year, month, day] = dateStr.split("-").map(Number);
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return `${months[month - 1]} ${day}, ${year}`;
}

function checkGovernorMilestones(milestones) {
    let delivered = false;
    let signed = false;
	let veto = false;

    milestones.forEach(m => {
        if (m.statusDesc === "Delivered to Governor") delivered = true;
        if (m.statusDesc === "Signed by Governor") signed = true;
		if (m.statusDesc === "Vetoed") veto = true;
    });

    return { delivered, signed , veto};
}
async function getBillData(billId) {
    // Lock in which chamber we were ASKED about, before substitution can
    // overwrite `bill` with the other chamber's data.
    const requestedChamber = billId.trim().toUpperCase().startsWith("A") ? "ASSEMBLY" : "SENATE";
    const requestedChamberLabel = requestedChamber === "SENATE" ? "Senate" : "Assembly";

    const url = `https://legislation.nysenate.gov/api/3/bills/${year}/${billId}?key=${billTrackerKey}`;
    const raw = await fetch(url).then(r => r.json());
    let bill = raw.result;

    // Latest amendment version
    const amendmentItems = bill?.amendments?.items || {};
    const amendmentKeys = Object.keys(amendmentItems);
    const latestVersionKey = amendmentKeys.length ? amendmentKeys.at(-1) : "";
    const latestAmendment = amendmentItems[latestVersionKey] || null;

    // Build latest print number
    const basePrintNo = bill.basePrintNo;
    const latestPrintNo = latestVersionKey ? basePrintNo + latestVersionKey : basePrintNo;

    // Sponsor name
    const sponsorName = bill?.sponsor?.member?.shortName ?? null;
    const fullSponsor = bill?.sponsor?.member?.fullName ?? null;
    const summary = bill.summary;

    // Bill link
    let webLink = `https://www.nysenate.gov/legislation/bills/2025/${billId}`;
    if (bill.activeVersion) {
        webLink = `https://www.nysenate.gov/legislation/bills/2025/${billId}/amendment/${bill.activeVersion}`;
    }

    // Co-sponsors
    const coList = latestAmendment?.coSponsors?.items || [];
    const cosponsors = coList.length ? coList.map(c => c.fullName).join(", ") : null;

     // If substituted, load the substitute bill instead
    if (bill.substitutedBy) {
        const newUrl = `https://legislation.nysenate.gov/api/3/bills/${year}/${bill.substitutedBy.basePrintNo}?key=${billTrackerKey}`;
        const newRaw = await fetch(newUrl).then(r => r.json());
        bill = newRaw.result;
    }

    // Status is derived purely from this chamber's own milestone history —
    // never from bill.status, which after a substitution reflects whatever
    // the substitute's most recent action was, regardless of chamber.
    const milestones = bill?.milestones?.items || [];
    const status = getChamberProgressLabel(milestones, requestedChamber);

    // Last action
    const actions = bill?.actions?.items || [];
    const lastAction = actions.at(-1);
    const lastActionCombined = lastAction
        ? `${lastAction.text} (${formatDate(lastAction.date)})`
        : null;

    // Gov status
    const govStatus = checkGovernorMilestones(bill.milestones.items);

    return {
        Sponsor: fullSponsor,
        LatestPrintNo: latestPrintNo,
        BillS: sponsorName,
        BillSum: summary,
        Cosponsors: cosponsors,
        CosponsorCount: coList.length,
        Status: status,
        LastAction: lastActionCombined,
        Link: webLink,
        GovStatus: govStatus
    };
}

/* ============================================================
   BILL TRACKER — MAIN FETCH LOOP
============================================================ */

// WHERE TO CHANGE WHICH BILLS ON THE WEBSITE, ensure you have commas after "senate" "assembly" and every bracket
async function fetchBillData(callback) {
    const billsToTrack = [
		{ senate: "S9589", assembly: "A10926",  name: "Protecting Health Coverage" },
        { senate: "S705",   assembly: "A2140", name: "Fair Pricing Act", note: "The FPA needs to pass through the Senate Rules Committee before being scheduled for the Senate Floor" },
        { senate: "S1634",  assembly: "A1915", name: "Primary Care Investment Act" },
        { senate: "S6375",  assembly: "A6773", name: "No Blank Checks" },
        { senate: "S9388",  assembly: "A10736", name: "Local Input for Community Health Care" },
        { senate: "S359",   assembly: "A1356", name: "Stop SUNY Suing" },
        { senate: "S9760",  assembly: "A10182",   name: "Consumer Debt Uniformity Act" },
		{ senate: "S3566", assembly: "A1931", name: "Medicaid Coverage of Dental Services"},
        { senate: "S3602",  assembly: "A5199", name: "TPS Medicaid Coverage" },
        { senate: "S3762",  assembly: "A1710", name: "Coverage4All" },
        { senate: "S3425",  assembly: "A1466", name: "NY Health Act" }
    ];

    const finalBills = [];

    for (const bill of billsToTrack) {
        const senate = await getBillData(bill.senate);
        const assembly = bill.assembly ? await getBillData(bill.assembly) : null;

        finalBills.push({
            name: bill.name,
            senateBill: senate?.LatestPrintNo || "",
            senateLink: senate?.Link || "",
			senateS: senate?.BillS || "",
            senateSponsor: senate?.Sponsor || "",
            senateCosponsor: senate?.CosponsorCount || "",
            senateCosponsorNames: senate?.Cosponsors || "",
            senateAction: senate?.LastAction || "",
            senateProgress: senate?.Status || "",

            assemblyBill: assembly?.LatestPrintNo || "",
            assemblyLink: assembly?.Link || "",
			assemblyS: assembly?.BillS || "",
            assemblySponsor: assembly?.Sponsor || "",
            assemblyCosponsor: assembly?.CosponsorCount || "",
            assemblyCosponsorNames: assembly?.Cosponsors || "",
            assemblyAction: assembly?.LastAction || "",
            assemblyProgress: assembly?.Status || "",
			
			note: bill.note || null,
            billSummary: senate?.BillSum || assembly?.BillSum || "",
			govStatus: senate?.GovStatus || {}
       
        });
    }

    callback(finalBills);
}

/* ============================================================
   PROGRESS BAR UTILITIES
============================================================ */

const stages = ["Introduced", "In Committee", "On Floor Calendar", "Passed"];

const colors = {
    purple: "#58355e",
    orange: "#e76f51",
    title: "#36353a",
    lightBlue: "#ffb1a1",
	red: "#c82a2a",
    lightPurple: "#dba7ff",
    lightOrange: "#ffc96f",
    lightPink: "#db7aba"
};

function formatPercent(value) {
    return typeof value === "number" ? Math.round(value * 100) + "%" : (value || "");
}

// Ensures the milestone is displaying correctly

function getChamberProgressLabel(milestones, chamber) {
    const chamberLabel = chamber === "SENATE" ? "Senate" : "Assembly";

    // Ordered from most advanced to least advanced.
    // The FIRST one found wins — later/other milestones are ignored once
    // a higher stage has been reached, so a chamber can never "un-pass".
    const passed = milestones.find(m => m.statusType === `PASSED_${chamber}`);
    if (passed) return `Passed ${chamberLabel}`;

    const onFloor = milestones.find(m => m.statusType === `${chamber}_FLOOR`);
    if (onFloor) return `${chamberLabel} Floor Calendar`;

    const inComm = milestones.find(m => m.statusType === `IN_${chamber}_COMM`);
    if (inComm) return inComm.committeeName ? `In ${inComm.committeeName} Committee` : "In Committee";

    return "Introduced";
}

/* ============================================================
   CREATE PROGRESS BAR
============================================================ */
function createProgressBar(progressText, type) {
    const stages = ["Introduced", "In Committee", "On Floor Calendar", "Passed"];

    // Determine active index from progressText
    let currentIndex = 0;
    if (!progressText) {
        currentIndex = 0;
    } else if (progressText.includes("Passed")) {
        currentIndex = 3;
    } else if (progressText.includes("Floor Calendar")) {
        currentIndex = 2;
    } else if (progressText.includes("Committee")) {
        currentIndex = 1;
    } else if (progressText.includes("Introduced")) {
        currentIndex = 0;
    }

    const activeColor  = type === "senate" ? "#e76f51" : "#58355e"; // orange / purple
    const inactiveColor = type === "senate" ? "#ffb1a1" : "#dba7ff"; // lightBlue / lightPurple

    const progressContainer = document.createElement("div");
    progressContainer.style.cssText = `
		display: flex;
		width: calc(100% + 36px);
        margin-left: -14px;
		position: relative;
		box-sizing: border-box;
	`;

    stages.forEach((stage, index) => {
        const pentagon = document.createElement("div");

        // Show the raw progressText only on the active stage
        if (index === currentIndex) {
            pentagon.textContent = progressText;
        } else {
            pentagon.textContent = stage;
        }

        pentagon.style.cssText = `
            flex: 1;
            height: 70px;
            margin: 0 -10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
			line-height: 1;
            font-weight: bold;
            color: #fff;
            text-align: center;
            padding: 0 24px;
            background-color: ${index <= currentIndex ? activeColor : inactiveColor};
            clip-path: ${
                index === 0
                    ? "polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)"
                    : index === stages.length - 1
                        ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 15% 50%)"
                        : "polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%, 15% 50%)"
            };
        `;

        progressContainer.appendChild(pentagon);
    });

    return progressContainer;
}

/* ============================================================
   GOVERNOR PROGRESS BAR
============================================================ */
function createGovernorProgressBar(govMilestonesStatus) {
    const isVetoed = govMilestonesStatus.veto === true;

    const stages = [
        "To Governor",
        isVetoed ? "Vetoed by Governor" : "Signed into Law"
    ];

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.margin = "0";

    let activeIndex = -1;

    if (govMilestonesStatus.delivered) activeIndex = 0;

    // VETO overrides signed
    if (isVetoed) {
        activeIndex = 1;
    } else if (govMilestonesStatus.signed) {
        activeIndex = 1;
    }

    stages.forEach((stage, index) => {
        const box = document.createElement("div");
        box.textContent = stage;
        box.style.width = "99%";
        box.style.height = "45px";
        box.style.margin = "0 -20px";
        box.style.display = "flex";
        box.style.alignItems = "center";
        box.style.justifyContent = "center";
        box.style.fontSize = "18px";
        box.style.fontWeight = "bold";
        box.style.color = "#fff";

        // Pentagon shapes
        box.style.clipPath =
            index === 0
                ? "polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)"
                : "polygon(0% 0%, 85% 0%, 100% 0%, 100% 100%, 0% 100%, 15% 50%)";

        // Colors
        if (index <= activeIndex) {
            box.style.backgroundColor = isVetoed
                ? "#c82a2a"   // 🔴 red for veto
                : "#1e555c"; // 🟢 green for signed
        } else {
            box.style.backgroundColor = "#bbbbbb";
        }

        container.appendChild(box);
    });

    return container;
}


/* ============================================================
   CREATE BILL SECTION
============================================================ */
function createBillSection(bill) {
    const section = document.createElement("div");
    section.className = "bill-section";
    section.style.cssText = `
    margin: 20px 0;
	padding: 24px 28px;
    border-radius: 12px;
    background-color: #ffffff;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
	`;

    const name = document.createElement("h2");
    name.textContent = bill.name;
    name.style.cssText = `
        font-weight: 900;
        text-transform: uppercase;
        font-size: 32px;
        color: #002d62;
        margin-bottom: 10px;
    `;

    const senateProgress = createProgressBar(bill.senateProgress, "senate");
    const assemblyProgress = createProgressBar(bill.assemblyProgress, "assembly");

    const billInfo = document.createElement("div");
    billInfo.style.marginBottom = "5px";

	const summaryHTML = bill.billSummary ? bill.billSummary + "<br>" : "";
    const noteHTML = bill.note? `<div style="background-color: #fff8e1; border-left: 4px solid #f0a500; padding: 10px 14px; margin-top: 8px; font-size: 14px; border-radius: 4px; color: #5a4000;">
			   <strong>📌  </strong> ${bill.note}
		   </div>`
		: "";
	billInfo.innerHTML = `<p style="font-size: 14px;">${summaryHTML}</p>${noteHTML}`;

    // Cosponsor toggles
    function createCosponsorToggle(showLabel, hideLabel, namesCSV, color) {
        const container = document.createElement("div");
        const button = document.createElement("button");
        const list = document.createElement("ul");

        button.textContent = showLabel;
        button.style.cssText = `
            margin-top: -5px;
            margin-bottom: 10px;
            padding: 6px 12px;
            background-color: #effbff;
            color: #000;
            cursor: pointer;
            border-radius: 4px;
        `;

        list.style.cssText = `
            display: none;
            margin-left: 5px;
            margin-top: 10px;
            margin-bottom: 10px;
            font-size: 10px;
        `;

        button.addEventListener("click", () => {
			const showing = list.style.display === "block" || list.style.display === "flex";

			// Toggle visibility only
			if (showing) {
				list.style.display = "none";
				button.textContent = showLabel;
			} else {
				list.style.display = "flex";
				button.textContent = hideLabel;
			}

			// Build the list ONLY the first time it is shown (optional)
			if (!list.dataset.built) {
				list.style.flexWrap = "wrap";
				list.style.gap = "1px 25px";

				list.innerHTML = "";
				namesCSV.split(",").map(n => n.trim()).forEach(name => {
					const li = document.createElement("li");
					li.style.width = "165px";
					li.textContent = name;
					list.appendChild(li);
				});

				list.dataset.built = "yes"; // prevents rebuilding every click
			}
		});

        container.appendChild(button);
        container.appendChild(list);
        return container;
    }
	

    // Senate sponsor div
    const senateSponsorDiv = document.createElement("div");
    senateSponsorDiv.style.cssText = `
        margin: 10px 0 0 0;
        font-size: 14px;
    `;
    senateSponsorDiv.innerHTML = `
        <div>
            <strong>Last Action: </strong>${bill.senateAction}<br>
            <strong>Primary Sponsor: </strong>${bill.senateSponsor}<br>
            <strong>Cosponsors: </strong>${bill.senateCosponsor}
        </div>
    `;
    if (bill.senateCosponsor != 0){
		const senateToggle = createCosponsorToggle(
			"Show Senate Cosponsors",
			"Hide Senate Cosponsors",
			bill.senateCosponsorNames,
			colors.lightOrange
		);
		senateSponsorDiv.appendChild(senateToggle);
	}

    // Assembly sponsor div
    const assemblySponsorDiv = document.createElement("div");
    assemblySponsorDiv.style.cssText = `
        margin: 10px 0 0 0;
        font-size: 14px;
    `;
    assemblySponsorDiv.innerHTML = `
        <div>
            <strong>Last Action: </strong>${bill.assemblyAction}<br>
            <strong>Primary Sponsor: </strong>${bill.assemblySponsor}<br>
            <strong>Cosponsors: </strong>${bill.assemblyCosponsor}
        </div>
    `;
    
	
	if (bill.assemblyCosponsor != 0){
		const assemblyToggle = createCosponsorToggle(
			"Show Assembly Cosponsors",
			"Hide Assembly Cosponsors",
			bill.assemblyCosponsorNames,
			colors.lightOrange
		);
		assemblySponsorDiv.appendChild(assemblyToggle);
	}


    // Senate bill label
    const senateLabel = document.createElement("div");
    senateLabel.style.cssText = `
        color: ${colors.orange};
        font-weight: bold;
        font-size: 24px;
        margin-bottom: 0;
    `;
    senateLabel.innerHTML = bill.senateBill
        ? `<p><a href="${bill.senateLink}" target="_blank" class="custom-SbillName">${bill.senateBill} (${bill.senateS})</a></p>`
        : `<p><span style="font-size: 24px;">No Senate Bill Yet</span></p>`;

    // Assembly bill label
    const assemblyLabel = document.createElement("div");
    assemblyLabel.style.cssText = `
        color: ${colors.purple};
        font-weight: bold;
        font-size: 24px;
        margin-bottom: 0;
    `;
    assemblyLabel.innerHTML = bill.assemblyBill
        ? `<p><a href="${bill.assemblyLink}" target="_blank" class="custom-AbillName">${bill.assemblyBill} (${bill.assemblyS})</a></p>`
        : `<p><span style="font-size: 24px;">No Assembly Bill Yet</span></p>`;

    // Append
    section.appendChild(name);
    section.appendChild(billInfo);

    section.appendChild(senateLabel);
    if (bill.senateBill) {
        section.appendChild(senateProgress);
        section.appendChild(senateSponsorDiv);
    }

    section.appendChild(assemblyLabel);
    if (bill.assemblyBill) {
        section.appendChild(assemblyProgress);
        section.appendChild(assemblySponsorDiv);
    }
//Condition for adding Governor Bar, only if sent to gov, vetoed, or signed
    const { delivered, signed, veto } = bill.govStatus;

	if (delivered || signed || veto) {
		const governorProgressBar = createGovernorProgressBar(bill.govStatus);
		section.appendChild(governorProgressBar);
	}

    return section;
}

/* ============================================================
   ON PAGE LOAD
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    fetchBillData((bills) => {
        const container = document.getElementById("bill-tracker-container");
        if (!container) return;

        /* ------------------------------------------
           CREATE FILTER DROPDOWN + RESET BUTTON
        ------------------------------------------ */
        const filterBox = document.createElement("div");
        filterBox.style.cssText = `
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
            align-items: center;
        `;

        const dropdown = document.createElement("select");
        dropdown.style.cssText = `
            padding: 6px 10px;
            font-size: 16px;
        `;

        // Default option
        const defaultOption = document.createElement("option");
        defaultOption.textContent = "Select a Bill";
        defaultOption.value = "";
        dropdown.appendChild(defaultOption);

        // Populate with bill names
        bills.forEach(bill => {
            const opt = document.createElement("option");
            opt.value = bill.name;
            opt.textContent = bill.name;
            dropdown.appendChild(opt);
        });

        // Reset button
        const resetButton = document.createElement("button");
        resetButton.textContent = "Show All Bills";
        resetButton.style.cssText = `
            padding: 6px 12px;
            background-color: #ddd;
            cursor: pointer;
            border-radius: 4px;
        `;

        filterBox.appendChild(dropdown);
        filterBox.appendChild(resetButton);

        // Insert at the top of the container
        container.appendChild(filterBox);

        /* ------------------------------------------
           RENDER BILL SECTIONS
        ------------------------------------------ */
        const billSections = []; // keep references for filtering

        bills.forEach(bill => {
            const section = createBillSection(bill);
            container.appendChild(section);
            billSections.push({ name: bill.name, element: section });
        });

        /* ------------------------------------------
           DROPDOWN FILTER LOGIC
        ------------------------------------------ */
        dropdown.addEventListener("change", () => {
            const selected = dropdown.value;

            billSections.forEach(item => {
                item.element.style.display =
                    selected === "" || item.name === selected
                        ? "block"
                        : "none";
            });
        });

        /* ------------------------------------------
           RESET BUTTON LOGIC
        ------------------------------------------ */
        resetButton.addEventListener("click", () => {
            dropdown.value = "";

            billSections.forEach(item => {
                item.element.style.display = "block";
            });
        });
    });
});

