const API_BASE = "http://localhost:5000/api";

let labRequests = [];


// ===============================
// PAGE NAVIGATION
// ===============================

function showSection(sectionId, button) {

    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    document.getElementById(sectionId).classList.add("active");

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }

    const titles = {
        dashboard: [
            "Laboratory Dashboard",
            "Manage laboratory requests, samples and reports"
        ],

        pending: [
            "Pending Laboratory Requests",
            "Tests waiting for sample collection"
        ],

        samples: [
            "Sample Collection",
            "Collect samples for requested tests"
        ],

        processing: [
            "Processing Tests",
            "Laboratory tests currently being processed"
        ],

        reports: [
            "Report Entry",
            "Enter final laboratory results"
        ],

        completed: [
            "Completed Reports",
            "Finalized laboratory reports"
        ]
    };

    document.getElementById("pageTitle").textContent =
        titles[sectionId][0];

    document.getElementById("pageSubtitle").textContent =
        titles[sectionId][1];
}


// ===============================
// LOAD DATA
// ===============================

async function loadLabData() {

    try {

        const response = await fetch(`${API_BASE}/laboratory`);

        if (!response.ok) {
            throw new Error("Laboratory API failed");
        }

        const data = await response.json();

        labRequests = data.labRequests || [];

        updateDashboard();

        renderRecentRequests();

        renderPending();

        renderSamples();

        renderProcessing();

        renderReports();

        renderCompleted();

    } catch (error) {

        console.error(error);

        showToast(
            "Laboratory API connect nahi ho rahi. Check localhost:5000."
        );
    }
}


// ===============================
// DASHBOARD
// ===============================

function updateDashboard() {

    const total = labRequests.length;

    const requested = labRequests.filter(
        x => x.status === "requested"
    ).length;

    const collected = labRequests.filter(
        x => x.status === "sample_collected"
    ).length;

    const processing = labRequests.filter(
        x => x.status === "processing"
    ).length;

    const completed = labRequests.filter(
        x => x.status === "completed"
    ).length;


    document.getElementById("totalCount").textContent = total;

    document.getElementById("sampleCount").textContent = requested;

    document.getElementById("processingCount").textContent = processing;

    document.getElementById("completedCount").textContent = completed;


    document.getElementById("requestedStatus").textContent =
        requested;

    document.getElementById("collectedStatus").textContent =
        collected;

    document.getElementById("processingStatus").textContent =
        processing;

    document.getElementById("completedStatus").textContent =
        completed;
}


// ===============================
// RECENT REQUESTS
// ===============================

function renderRecentRequests() {

    const container =
        document.getElementById("recentRequests");

    const recent =
        [...labRequests]
        .sort((a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        )
        .slice(0, 8);


    if (!recent.length) {

        container.innerHTML =
            `<div class="empty">
                No laboratory requests found.
            </div>`;

        return;
    }


    container.innerHTML = createTable(recent, "recent");
}


// ===============================
// PENDING
// ===============================

function renderPending() {

    const container =
        document.getElementById("pendingTable");

    const search =
        document.getElementById("pendingSearch")?.value
        ?.toLowerCase() || "";


    let data = labRequests.filter(
        item => item.status === "requested"
    );


    if (search) {

        data = data.filter(item =>

            item.patientName
                .toLowerCase()
                .includes(search)

            ||

            item.testName
                .toLowerCase()
                .includes(search)

        );
    }


    if (!data.length) {

        container.innerHTML =
            `<div class="empty">
                No pending laboratory requests.
            </div>`;

        return;
    }


    container.innerHTML =
        createTable(data, "pending");
}


// ===============================
// SAMPLE COLLECTION
// ===============================

function renderSamples() {

    const container =
        document.getElementById("samplesTable");

    const data =
        labRequests.filter(
            item => item.status === "requested"
        );


    if (!data.length) {

        container.innerHTML =
            `<div class="empty">
                No samples waiting for collection.
            </div>`;

        return;
    }


    container.innerHTML =
        createTable(data, "sample");
}


// ===============================
// PROCESSING
// ===============================

function renderProcessing() {

    const container =
        document.getElementById("processingTable");

    const data =
        labRequests.filter(
            item => item.status === "sample_collected"
        );


    if (!data.length) {

        container.innerHTML =
            `<div class="empty">
                No tests waiting for processing.
            </div>`;

        return;
    }


    container.innerHTML =
        createTable(data, "processing");
}


// ===============================
// REPORT ENTRY
// ===============================

function renderReports() {

    const container =
        document.getElementById("reportCards");

    const data =
        labRequests.filter(
            item => item.status === "processing"
        );


    if (!data.length) {

        container.innerHTML =
            `<div class="empty">
                No tests waiting for report entry.
            </div>`;

        return;
    }


    container.innerHTML =
        data.map(item => `

            <div class="report-card">

                <div class="report-card-top">

                    <div>
                        <div class="test-name">
                            ${escapeHTML(item.testName)}
                        </div>

                        <span class="badge processing">
                            PROCESSING
                        </span>
                    </div>

                    <span class="priority ${item.priority}">
                        ${item.priority === "urgent"
                            ? "URGENT"
                            : "NORMAL"}
                    </span>

                </div>


                <div class="patient">

                    <strong>
                        ${escapeHTML(item.patientName)}
                    </strong>

                    <span>
                        Patient ID: ${escapeHTML(item.patientId)}
                    </span>

                </div>


                <button
                    class="primary-btn"
                    onclick="openReportModal('${item.id}')">

                    Enter Report

                </button>

            </div>

        `).join("");
}


// ===============================
// COMPLETED
// ===============================

function renderCompleted() {

    const container =
        document.getElementById("completedTable");

    const data =
        labRequests.filter(
            item => item.status === "completed"
        );


    if (!data.length) {

        container.innerHTML =
            `<div class="empty">
                No completed reports yet.
            </div>`;

        return;
    }


    container.innerHTML =
        createTable(data, "completed");
}


// ===============================
// TABLE BUILDER
// ===============================

function createTable(data, mode) {

    return `

        <div class="table-wrapper">

            <table class="data-table">

                <thead>

                    <tr>

                        <th>Patient</th>

                        <th>Test</th>

                        <th>Doctor</th>

                        <th>Priority</th>

                        <th>Status</th>

                        <th>Date</th>

                        <th>Action</th>

                    </tr>

                </thead>


                <tbody>

                    ${data.map(item => `

                        <tr>

                            <td>

                                <div class="patient-name">
                                    ${escapeHTML(item.patientName)}
                                </div>

                                <div class="patient-id">
                                    ${escapeHTML(item.patientId)}
                                </div>

                            </td>


                            <td>
                                <strong>
                                    ${escapeHTML(item.testName)}
                                </strong>
                            </td>


                            <td>
                                ${escapeHTML(item.doctorName)}
                            </td>


                            <td>

                                <span class="priority ${item.priority}">
                                    ${item.priority === "urgent"
                                        ? "URGENT"
                                        : "Normal"}
                                </span>

                            </td>


                            <td>
                                ${statusBadge(item.status)}
                            </td>


                            <td>
                                ${formatDate(item.createdAt)}
                            </td>


                            <td>

                                ${getActionButton(item, mode)}

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>

    `;
}


// ===============================
// ACTION BUTTONS
// ===============================

function getActionButton(item, mode) {

    if (item.status === "requested") {

        return `
            <button
                class="action-btn"
                onclick="collectSample('${item.id}')">

                Collect Sample

            </button>
        `;
    }


    if (item.status === "sample_collected") {

        return `
            <button
                class="action-btn purple"
                onclick="startProcessing('${item.id}')">

                Start Processing

            </button>
        `;
    }


    if (item.status === "processing") {

        return `
            <button
                class="action-btn green"
                onclick="openReportModal('${item.id}')">

                Enter Report

            </button>
        `;
    }


    if (item.status === "completed") {

        return `
            <button
                class="action-btn green"
                onclick="viewReport('${item.id}')">

                View Report

            </button>
        `;
    }


    return "-";
}


// ===============================
// COLLECT SAMPLE
// ===============================

async function collectSample(id) {

    try {

        const response = await fetch(
            `${API_BASE}/laboratory/${id}/sample`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Sample collection failed"
            );
        }


        showToast("Sample collected successfully ✅");

        await loadLabData();

    } catch (error) {

        showToast(error.message);
    }
}


// ===============================
// START PROCESSING
// ===============================

async function startProcessing(id) {

    try {

        const response = await fetch(
            `${API_BASE}/laboratory/${id}/process`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Processing start failed"
            );
        }


        showToast("Test processing started ⚙️");

        await loadLabData();

    } catch (error) {

        showToast(error.message);
    }
}


// ===============================
// REPORT MODAL
// ===============================

function openReportModal(id) {

    const item =
        labRequests.find(x => x.id === id);


    if (!item) return;


    document.getElementById("reportId").value =
        item.id;


    document.getElementById("resultInput").value = "";

    document.getElementById("remarksInput").value = "";

    document.getElementById("reportedByInput").value = "";


    document.getElementById("reportPatientInfo").innerHTML = `

        <strong>
            ${escapeHTML(item.patientName)}
        </strong>

        <br>

        Patient ID:
        ${escapeHTML(item.patientId)}

        <br>

        Test:
        <strong>
            ${escapeHTML(item.testName)}
        </strong>

        <br>

        Doctor:
        ${escapeHTML(item.doctorName)}

    `;


    document
        .getElementById("reportModal")
        .classList.add("show");
}


function closeReportModal() {

    document
        .getElementById("reportModal")
        .classList.remove("show");
}


// ===============================
// SUBMIT REPORT
// ===============================

async function submitReport(event) {

    event.preventDefault();


    const id =
        document.getElementById("reportId").value;


    const result =
        document.getElementById("resultInput").value.trim();


    const remarks =
        document.getElementById("remarksInput").value.trim();


    const reportedBy =
        document.getElementById("reportedByInput").value.trim();


    if (!result || !reportedBy) {

        showToast(
            "Result aur reported by required hai."
        );

        return;
    }


    try {

        const response = await fetch(
            `${API_BASE}/laboratory/${id}/report`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    result,
                    remarks,
                    reportedBy
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Report submission failed"
            );
        }


        closeReportModal();

        showToast(
            "Laboratory report completed successfully ✅"
        );


        await loadLabData();


    } catch (error) {

        showToast(error.message);
    }
}


// ===============================
// VIEW COMPLETED REPORT
// ===============================

function viewReport(id) {

    const item =
        labRequests.find(x => x.id === id);


    if (!item || !item.report) return;


    alert(
        `LABORATORY REPORT\n\n` +

        `Patient: ${item.patientName}\n` +

        `Test: ${item.testName}\n\n` +

        `Result:\n${item.report.result}\n\n` +

        `Remarks:\n${item.report.remarks || "None"}\n\n` +

        `Reported By: ${item.report.reportedBy}`
    );
}


// ===============================
// STATUS BADGE
// ===============================

function statusBadge(status) {

    const labels = {

        requested: "REQUESTED",

        sample_collected: "SAMPLE COLLECTED",

        processing: "PROCESSING",

        completed: "COMPLETED"

    };


    return `
        <span class="badge ${status}">
            ${labels[status] || status}
        </span>
    `;
}


// ===============================
// DATE
// ===============================

function formatDate(date) {

    if (!date) return "-";


    return new Date(date).toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// ===============================
// SECURITY
// ===============================

function escapeHTML(value) {

    if (value === undefined || value === null) {
        return "";
    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ===============================
// TOAST
// ===============================

function showToast(message) {

    const toast =
        document.getElementById("toast");


    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);
}


// ===============================
// LOGOUT
// ===============================

function logout() {

    localStorage.removeItem("token");

    window.location.href = "login.html";
}


// ===============================
// INITIAL LOAD
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadLabData();

    }
);