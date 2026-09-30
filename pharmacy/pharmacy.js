/* =========================================================
   GOPAL JOSHI HOSPITAL
   PHARMACY MANAGEMENT SYSTEM
   VERSION: PHASE 1 - INVENTORY CORE
========================================================= */

const API = "/api/pharmacy";
const HOSPITAL_ID = "HOSP-TEST-001";

let medicines = [];
let sales = [];
let inventoryTransactions = [];
let selectedStockMedicineId = null;
let selectedEditMedicineId = null;
let prescriptions = [];
const CONSULTATION_API = "/api/consultations";


/* =========================================================
   HELPER
========================================================= */

function $(id) {
    return document.getElementById(id);
}

function money(value) {
    return "â‚¹" + Number(value || 0).toFixed(2);
}

function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-IN");
}

function formatDateTime(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("en-IN");
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   TOAST
========================================================= */

function showToast(message, type = "success") {

    const toast = $("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.classList.remove(
        "show",
        "success",
        "error"
    );

    toast.classList.add(
        "show",
        type
    );

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


/* =========================================================
   API REQUEST
========================================================= */

async function apiRequest(url, options = {}) {

    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            `Server error: ${response.status}`
        );
    }

    return data;
}


/* =========================================================
   NORMALIZE MEDICINE
========================================================= */

function normalizeMedicine(medicine) {

    return {
        ...medicine,

        id: medicine.id,

        hospitalId:
            medicine.hospitalId ||
            HOSPITAL_ID,

        name:
            medicine.name || "",

        genericName:
            medicine.genericName || "",

        category:
            medicine.category || "",

        manufacturer:
            medicine.manufacturer || "",

        batchNumber:
            medicine.batchNumber ||
            medicine.batch ||
            "",

        expiryDate:
            medicine.expiryDate || "",

        purchasePrice:
            Number(
                medicine.purchasePrice || 0
            ),

        sellingPrice:
            Number(
                medicine.sellingPrice || 0
            ),

        stock:
            Number(
                medicine.stock || 0
            ),

        minimumStock:
            Number(
                medicine.minimumStock ??
                medicine.minStock ??
                0
            ),

        supplier:
            medicine.supplier || "",

        location:
            medicine.location ||
            medicine.rack ||
            "",

        status:
            medicine.status || "active"
    };
}


/* =========================================================
   LOAD MEDICINES
========================================================= */

async function loadMedicines() {

    try {

        const data = await apiRequest(
            `${API}?hospitalId=${encodeURIComponent(HOSPITAL_ID)}`
        );

        medicines =
            Array.isArray(data.medicines)
                ? data.medicines.map(normalizeMedicine)
                : [];

        updateDashboard();

        searchMedicines();

        renderInventory();

        populateMedicineDropdowns();

        renderDashboardSearch();

        renderAlerts();

        renderPrescriptionQueue();

        console.log(
            "Medicines loaded:",
            medicines
        );

    } catch (error) {

        console.error(
            "Medicine API Error:",
            error
        );

        showToast(
            "Medicine data load nahi ho raha",
            "error"
        );

        updateDashboard(true);
    }
}


/* =========================================================
   LOAD SALES
========================================================= */

async function loadSales() {

    try {

        const data =
            await apiRequest(
                `${API}/sales/history?hospitalId=${encodeURIComponent(HOSPITAL_ID)}`
            );

        sales =
            Array.isArray(data.sales)
                ? data.sales
                : [];

        updateDashboard();

        renderDispensingRecords();

    } catch (error) {

        console.error(
            "Sales API Error:",
            error
        );

        sales = [];

        renderDispensingRecords();
    }
}


/* =========================================================
   LOAD DOCTOR PRESCRIPTIONS
========================================================= */

async function loadPrescriptions() {

    try {

        const data =
            await apiRequest(
                `${CONSULTATION_API}/prescriptions?hospitalId=${encodeURIComponent(HOSPITAL_ID)}`
            );

        prescriptions =
            Array.isArray(data.prescriptions)
                ? data.prescriptions
                : [];

        renderPrescriptionQueue();

    } catch (error) {

        console.error(
            "Prescription API Error:",
            error
        );

        prescriptions = [];

        renderPrescriptionQueue();
    }
}


function prescriptionMedicineName(item) {

    if (typeof item === "string") {
        return item;
    }

    if (!item || typeof item !== "object") {
        return "Medicine";
    }

    return (
        item.medicineName ||
        item.name ||
        item.medicine ||
        item.drug ||
        "Medicine"
    );
}


function prescriptionMedicineQuantity(item) {

    if (!item || typeof item !== "object") {
        return 1;
    }

    return Number(
        item.quantity ||
        item.qty ||
        item.units ||
        1
    );
}


function prescriptionMedicinePrice(name) {

    const medicine =
        medicines.find(m =>
            m.name.toLowerCase() ===
                String(name).toLowerCase()
            ||
            m.genericName.toLowerCase() ===
                String(name).toLowerCase()
        );

    return medicine
        ? medicine.sellingPrice
        : 0;
}


/* =========================================================
   PRESCRIPTION QUEUE
========================================================= */

function renderPrescriptionQueue() {

    const container =
        $("prescriptionQueue");

    if (!container) return;

    if (!prescriptions.length) {

        container.innerHTML = `
            <div class="empty">
                ðŸ’Š No pending doctor prescriptions found.
            </div>
        `;

        return;
    }

    container.innerHTML =
        prescriptions
            .map(rx => {

                const items =
                    Array.isArray(rx.prescription)
                        ? rx.prescription
                        : [];

                return `
                    <div
                        class="alert-item"
                        style="margin-bottom:12px;"
                    >

                        <div>

                            <strong>
                                ${escapeHtml(
                                    rx.patientName ||
                                    "Patient"
                                )}
                            </strong>

                            <br>

                            <small>
                                Patient ID:
                                ${escapeHtml(
                                    rx.patientId || "-"
                                )}
                            </small>

                            <br>

                            <small>
                                Doctor:
                                ${escapeHtml(
                                    rx.doctorName || "-"
                                )}
                            </small>

                            ${
                                rx.diagnosis
                                    ? `
                                        <br>
                                        <small>
                                            Diagnosis:
                                            ${escapeHtml(
                                                rx.diagnosis
                                            )}
                                        </small>
                                      `
                                    : ""
                            }

                        </div>


                        <div
                            style="
                                margin-top:10px;
                            "
                        >

                            ${
                                items
                                    .map(
                                        (
                                            item,
                                            index
                                        ) => {

                                            const name =
                                                prescriptionMedicineName(
                                                    item
                                                );

                                            const qty =
                                                prescriptionMedicineQuantity(
                                                    item
                                                );

                                            const medicine =
                                                medicines.find(
                                                    m =>
                                                        m.name
                                                            .toLowerCase() ===
                                                        name.toLowerCase()
                                                        ||
                                                        m.genericName
                                                            .toLowerCase() ===
                                                        name.toLowerCase()
                                                );

                                            return `
                                                <div
                                                    style="
                                                        display:flex;
                                                        justify-content:space-between;
                                                        gap:10px;
                                                        align-items:center;
                                                        padding:8px 0;
                                                        border-top:1px solid #eee;
                                                    "
                                                >

                                                    <span>

                                                        <strong>
                                                            ${escapeHtml(
                                                                name
                                                            )}
                                                        </strong>

                                                        Ã— ${qty}

                                                        ${
                                                            medicine
                                                                ? `
                                                                    <small>
                                                                        (Stock:
                                                                        ${medicine.stock})
                                                                    </small>
                                                                  `
                                                                : `
                                                                    <small>
                                                                        (Not matched)
                                                                    </small>
                                                                  `
                                                        }

                                                    </span>


                                                    <button
                                                        class="btn btn-primary"
                                                        onclick="
                                                            usePrescriptionItem(
                                                                ${prescriptions.indexOf(rx)},
                                                                ${index}
                                                            )
                                                        "
                                                    >
                                                        Dispense
                                                    </button>

                                                </div>
                                            `;
                                        }
                                    )
                                    .join("")
                            }

                        </div>

                    </div>
                `;
            })
            .join("");
}/* =========================================================
   USE PRESCRIPTION ITEM
========================================================= */

function usePrescriptionItem(rxIndex, itemIndex) {

    const rx = prescriptions[rxIndex];

    if (!rx || !Array.isArray(rx.prescription)) {
        showToast("Prescription nahi mili", "error");
        return;
    }

    const item = rx.prescription[itemIndex];

    const name = prescriptionMedicineName(item);

    const prescriptionName =
        String(name || "").trim().toLowerCase();

    const medicine = medicines.find(medicine => {

        const medicineName =
            String(medicine.name || "")
                .trim()
                .toLowerCase();

        const genericName =
            String(medicine.genericName || "")
                .trim()
                .toLowerCase();

        return (
            medicineName === prescriptionName ||
            genericName === prescriptionName
        );
    });

    if (!medicine) {

        showToast(
            `Prescription medicine "${name}" inventory me nahi mili`,
            "error"
        );

        return;
    }

    const qty =
        prescriptionMedicineQuantity(item);

    if (!qty || qty <= 0) {

        showToast(
            "Prescription quantity valid nahi hai",
            "error"
        );

        return;
    }

    if (qty > Number(medicine.stock || 0)) {

        showToast(
            `Sirf ${medicine.stock} units ${medicine.name} ki available hain`,
            "error"
        );

        return;
    }

    if ($("dispensePatient")) {
        $("dispensePatient").value =
            rx.patientName || "";
    }

    if ($("dispensePatientId")) {
        $("dispensePatientId").value =
            rx.patientId || "";
    }

    if ($("dispenseMedicine")) {

        $("dispenseMedicine").value =
            medicine.id;

        /*
         * Prescription wali exact medicine ID
         * save kar rahe hain.
         */
        $("dispenseMedicine").dataset.prescriptionMedicineId =
            medicine.id;
    }

    if ($("dispenseQuantity")) {
        $("dispenseQuantity").value =
            qty;
    }

    if ($("prescriptionRef")) {
        $("prescriptionRef").value =
            rx.consultationId ||
            rx.appointmentId ||
            "";
    }

    showPage("dispense");

    showToast(
        `${medicine.name} prescription ke according load ho gayi`
    );
}
/* =========================================================
   LOAD INVENTORY TRANSACTIONS
========================================================= */

async function loadInventoryTransactions() {

    try {

        const data =
            await apiRequest(
                `${API}/transactions?hospitalId=${encodeURIComponent(HOSPITAL_ID)}`
            );

        inventoryTransactions =
            Array.isArray(data.transactions)
                ? data.transactions
                : [];

        saveLocalTransactionBackup();

        renderInventoryHistory();

    } catch (error) {

        console.warn(
            "Transaction API unavailable:",
            error.message
        );

        loadLocalTransactionBackup();

        renderInventoryHistory();
    }
}


/* =========================================================
   LOCAL TRANSACTION BACKUP
========================================================= */

function saveLocalTransactionBackup() {

    try {

        localStorage.setItem(
            "gjh_pharmacy_inventory_transactions",
            JSON.stringify(
                inventoryTransactions
            )
        );

    } catch (error) {

        console.warn(
            "Local transaction backup failed:",
            error
        );
    }
}


function loadLocalTransactionBackup() {

    try {

        inventoryTransactions =
            JSON.parse(
                localStorage.getItem(
                    "gjh_pharmacy_inventory_transactions"
                ) || "[]"
            );

    } catch {

        inventoryTransactions = [];
    }
}


/* =========================================================
   DASHBOARD
========================================================= */
/* =========================================================
   DASHBOARD
========================================================= */

async function updateDashboard(error = false) {

    if (error) {

        if ($("totalMedicines"))
            $("totalMedicines").textContent = "â€”";

        if ($("inventoryCount"))
            $("inventoryCount").textContent = "â€”";

        if ($("lowStockCount"))
            $("lowStockCount").textContent = "â€”";

        if ($("dispensedCount"))
            $("dispensedCount").textContent = "â€”";

        if ($("inventoryValue"))
            $("inventoryValue").textContent = "â€”";

        if ($("expiringCount"))
            $("expiringCount").textContent = "â€”";

        if ($("expiredCount"))
            $("expiredCount").textContent = "â€”";

        if ($("todaySalesCount"))
            $("todaySalesCount").textContent = "â€”";

        if ($("todaySalesAmount"))
            $("todaySalesAmount").textContent = "â€”";

        return;
    }


    try {

        const data = await apiRequest(
            `${API}/summary?hospitalId=${encodeURIComponent(HOSPITAL_ID)}`
        );

        const summary = data.summary || {};


        if ($("totalMedicines"))
            $("totalMedicines").textContent =
                Number(summary.totalMedicines || 0);


        if ($("inventoryCount"))
            $("inventoryCount").textContent =
                Number(summary.totalStockUnits || 0);


        if ($("lowStockCount"))
            $("lowStockCount").textContent =
                Number(summary.lowStockCount || 0);


        if ($("inventoryValue"))
            $("inventoryValue").textContent =
                money(summary.inventoryValue || 0);


        if ($("expiringCount"))
            $("expiringCount").textContent =
                Number(summary.expiringCount || 0);


        if ($("expiredCount"))
            $("expiredCount").textContent =
                Number(summary.expiredCount || 0);


        if ($("todaySalesCount"))
            $("todaySalesCount").textContent =
                Number(summary.salesTodayCount || 0);


        if ($("todaySalesAmount"))
            $("todaySalesAmount").textContent =
                money(summary.todaySalesAmount || 0);


        /*
         * Existing card agar dispensedCount use karti hai
         * to today's sales quantity ke liye fallback
         */

        if ($("dispensedCount")) {

            const totalDispensed =
                sales.reduce(
                    (total, sale) =>
                        total +
                        Number(sale.quantity || 0),
                    0
                );

            $("dispensedCount").textContent =
                totalDispensed;
        }


        console.log(
            "âœ“ Pharmacy dashboard summary loaded:",
            summary
        );


    } catch (error) {

        console.error(
            "Dashboard summary API error:",
            error
        );

        /*
         * Backend summary fail ho to
         * existing local medicines data se dashboard
         * completely blank nahi hoga.
         */

        const totalMedicines =
            medicines.length;


        const inventoryCount =
            medicines.reduce(
                (total, medicine) =>
                    total +
                    Number(medicine.stock || 0),
                0
            );


        const lowStockCount =
            medicines.filter(
                medicine =>
                    Number(medicine.stock || 0) <=
                    Number(medicine.minimumStock || 0)
            ).length;


        if ($("totalMedicines"))
            $("totalMedicines").textContent =
                totalMedicines;


        if ($("inventoryCount"))
            $("inventoryCount").textContent =
                inventoryCount;


        if ($("lowStockCount"))
            $("lowStockCount").textContent =
                lowStockCount;


        if ($("dispensedCount"))
            $("dispensedCount").textContent =
                sales.reduce(
                    (total, sale) =>
                        total +
                        Number(sale.quantity || 0),
                    0
                );


        if ($("inventoryValue"))
            $("inventoryValue").textContent =
                money(
                    medicines.reduce(
                        (total, medicine) =>
                            total +
                            (
                                Number(
                                    medicine.purchasePrice || 0
                                ) *
                                Number(
                                    medicine.stock || 0
                                )
                            ),
                        0
                    )
                );
    }
}

/* =========================================================
   DASHBOARD SEARCH
========================================================= */

function searchDashboardMedicine() {

    renderDashboardSearch();
}


function renderDashboardSearch() {

    const container =
        $("dashboardResults");

    if (!container) return;

    const search =
        ($("dashboardSearch")?.value || "")
            .trim()
            .toLowerCase();

    if (!search) {

        container.innerHTML = `
            <div class="empty">

                <div class="empty-icon">
                    ðŸ’Š
                </div>

                Search for a medicine

            </div>
        `;

        return;
    }

    const results =
        medicines.filter(
            medicine =>

                medicine.name
                    .toLowerCase()
                    .includes(search)

                ||

                medicine.genericName
                    .toLowerCase()
                    .includes(search)

                ||

                medicine.category
                    .toLowerCase()
                    .includes(search)
        );

    if (!results.length) {

        container.innerHTML = `
            <div class="empty">
                No medicine found.
            </div>
        `;

        return;
    }

    container.innerHTML =
        results
            .slice(0, 10)
            .map(
                medicine => `

                    <div
                        class="medicine-card"
                        style="margin-bottom:10px;"
                        onclick="
                            openMedicineModal(
                                '${medicine.id}'
                            )
                        "
                    >

                        <h4>
                            ${escapeHtml(
                                medicine.name
                            )}
                        </h4>

                        <div
                            class="medicine-meta"
                        >

                            Generic:
                            ${escapeHtml(
                                medicine.genericName ||
                                "-"
                            )}

                            <br>

                            Stock:
                            <strong>
                                ${medicine.stock}
                            </strong>

                        </div>

                        <div
                            class="medicine-price"
                        >
                            ${money(
                                medicine.sellingPrice
                            )}
                        </div>

                    </div>

                `
            )
            .join("");
}


/* =========================================================
   MEDICINES SEARCH
========================================================= */

function searchMedicines() {

    const container =
        $("medicineResults");

    if (!container) return;

    const search =
        ($("medicineSearch")?.value || "")
            .trim()
            .toLowerCase();

    const category =
        $("categoryFilter")?.value || "";

    const filtered =
        medicines.filter(
            medicine => {

                const matchesSearch =
                    !search
                    ||

                    medicine.name
                        .toLowerCase()
                        .includes(search)

                    ||

                    medicine.genericName
                        .toLowerCase()
                        .includes(search)

                    ||

                    medicine.category
                        .toLowerCase()
                        .includes(search)

                    ||

                    medicine.batchNumber
                        .toLowerCase()
                        .includes(search);

                const matchesCategory =
                    !category
                    ||
                    medicine.category ===
                        category;

                return (
                    matchesSearch &&
                    matchesCategory
                );
            }
        );

    if (!filtered.length) {

        container.innerHTML = `
            <div class="empty">

                <div class="empty-icon">
                    ðŸ’Š
                </div>

                No medicines found.

            </div>
        `;

        return;
    }

    container.innerHTML =
        filtered
            .map(
                medicine => {

                    const lowStock =
                        medicine.stock <=
                        medicine.minimumStock;

                    const expired =
                        isExpired(
                            medicine.expiryDate
                        );

                    return `
                        <div
                            class="medicine-card"
                            onclick="
                                openMedicineModal(
                                    '${medicine.id}'
                                )
                            "
                            style="
                                cursor:pointer;
                            "
                        >

                            <h4>
                                ${escapeHtml(
                                    medicine.name
                                )}
                            </h4>

                            <div
                                class="medicine-meta"
                            >

                                Generic:
                                ${escapeHtml(
                                    medicine.genericName ||
                                    "-"
                                )}

                                <br>

                                Category:
                                ${escapeHtml(
                                    medicine.category ||
                                    "-"
                                )}

                                <br>

                                Batch:
                                ${escapeHtml(
                                    medicine.batchNumber ||
                                    "-"
                                )}

                                <br>

                                Expiry:
                                ${formatDate(
                                    medicine.expiryDate
                                )}

                                <br>

                                Stock:
                                <strong>
                                    ${medicine.stock}
                                </strong>

                            </div>

                            <div
                                class="medicine-price"
                            >
                                ${money(
                                    medicine.sellingPrice
                                )}
                            </div>

                            ${
                                expired
                                    ? `
                                        <span
                                            class="
                                                badge
                                                badge-danger
                                            "
                                            style="
                                                margin-top:10px;
                                            "
                                        >
                                            âš  Expired
                                        </span>
                                      `
                                    :
                                    lowStock
                                    ? `
                                        <span
                                            class="
                                                badge
                                                badge-danger
                                            "
                                            style="
                                                margin-top:10px;
                                            "
                                        >
                                            âš  Low Stock
                                        </span>
                                      `
                                    : `
                                        <span
                                            class="
                                                badge
                                                badge-success
                                            "
                                            style="
                                                margin-top:10px;
                                            "
                                        >
                                            âœ“ Available
                                        </span>
                                      `
                            }

                        </div>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   INVENTORY
========================================================= */

function renderInventory() {

    const table =
        $("inventoryTable");

    if (!table) return;

    const search =
        ($("inventorySearch")?.value || "")
            .trim()
            .toLowerCase();

    const filtered =
        medicines.filter(
            medicine => {

                if (!search) {
                    return true;
                }

                return (
                    medicine.name
                        .toLowerCase()
                        .includes(search)

                    ||

                    medicine.batchNumber
                        .toLowerCase()
                        .includes(search)

                    ||

                    medicine.category
                        .toLowerCase()
                        .includes(search)

                    ||

                    medicine.location
                        .toLowerCase()
                        .includes(search)
                );
            }
        );

    if (!filtered.length) {

        table.innerHTML = `
            <tr>

                <td
                    colspan="8"
                    style="
                        text-align:center;
                        padding:25px;
                    "
                >
                    No inventory items found.
                </td>

            </tr>
        `;

        return;
    }

    table.innerHTML =
        filtered
            .map(
                medicine => {

                    const lowStock =
                        medicine.stock <=
                        medicine.minimumStock;

                    const expired =
                        isExpired(
                            medicine.expiryDate
                        );

                  
                }
            )
            .join("");
}
/* =========================================================
   LOAD INVENTORY
========================================================= */

async function loadInventory() {

    await loadMedicines();

    await loadInventoryTransactions();

    showToast(
        "Inventory refreshed"
    );
}


/* =========================================================
   DROPDOWNS
========================================================= */

function populateMedicineDropdowns() {

    const selects = [
        $("dispenseMedicine"),
        $("billMedicine")
    ];


    selects.forEach(select => {

        if (!select) return;


        const current =
            select.value;


        select.innerHTML = `
            <option value="">
                Select Medicine
            </option>
        `;


        medicines.forEach(medicine => {

            const option =
                document.createElement("option");

            option.value =
                medicine.id;

            option.textContent =
                `${medicine.name} â€” Stock: ${medicine.stock}`;

            select.appendChild(option);

        });


        if (current) {
            select.value = current;
        }

    });
}


/* =========================================================
   DYNAMIC INVENTORY BUTTONS
========================================================= */

function addPrescriptionControls() {

    const nav =
        document.querySelector(".nav");

    const page =
        document.querySelector("main") ||
        document.body;


    if (
        nav &&
        !$("gjPrescriptionNavButton")
    ) {

        const button =
            document.createElement("button");

        button.id =
            "gjPrescriptionNavButton";

        button.textContent =
            "ðŸ’Š Prescriptions";

        button.onclick =
            function() {

                showPage(
                    "prescriptions",
                    button
                );

                loadPrescriptions();

            };

        nav.appendChild(
            button
        );
    }


    if (!$("prescriptions")) {

        const prescriptionPage =
            document.createElement(
                "section"
            );

        prescriptionPage.id =
            "prescriptions";

        prescriptionPage.className =
            "page";

        prescriptionPage.innerHTML = `

            <div class="page-header">

                <div>

                    <h2>
                        ðŸ’Š Doctor Prescriptions
                    </h2>

                    <p>
                        Doctor consultation se aayi
                        prescriptions yahan se dispense karo.
                    </p>

                </div>

                <button
                    class="btn btn-light"
                    onclick="loadPrescriptions()"
                >
                    Refresh
                </button>

            </div>


            <div
                id="prescriptionQueue"
                class="alert-list"
            >

                <div class="empty">
                    Loading prescriptions...
                </div>

            </div>

        `;

        page.appendChild(
            prescriptionPage
        );
    }
}


/* =========================================================
   ADD MEDICINE BUTTON
========================================================= */

function addInventoryControls() {

    const medicinePage =
        $("medicines");


    if (
        medicinePage &&
        !$("gjAddMedicineButton")
    ) {

        const button =
            document.createElement(
                "button"
            );

        button.id =
            "gjAddMedicineButton";

        button.className =
            "btn btn-primary";

        button.textContent =
            "ï¼‹ Add Medicine";

        button.style.marginBottom =
            "15px";

        button.onclick =
            openAddMedicineModal;

        medicinePage.prepend(
            button
        );
    }


    const inventoryPage =
        $("inventory");


    if (
        inventoryPage &&
        !$("gjInventoryHistory")
    ) {

        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.id =
            "gjInventoryHistory";

        wrapper.style.marginTop =
            "25px";

        wrapper.innerHTML = `

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:12px;
                "
            >

                <h3>
                    ðŸ“œ Inventory History
                </h3>

                <button
                    class="btn btn-light"
                    onclick="loadInventoryTransactions()"
                >
                    Refresh History
                </button>

            </div>


            <div
                id="inventoryHistory"
                class="alert-list"
            >

                <div class="empty">
                    No inventory history yet.
                </div>

            </div>

        `;

        inventoryPage.appendChild(
            wrapper
        );
    }
}


/* =========================================================
   ADD MEDICINE MODAL
========================================================= */

function openAddMedicineModal() {

    selectedEditMedicineId =
        null;

    createMedicineFormModal(
        "Add New Medicine",
        "addMedicine"
    );
}


/* =========================================================
   EDIT MEDICINE
========================================================= */

function openEditMedicineModal(
    medicineId
) {

    const medicine =
        medicines.find(
            item =>
                item.id === medicineId
        );


    if (!medicine) return;


    selectedEditMedicineId =
        medicineId;


    createMedicineFormModal(
        "Edit Medicine",
        "editMedicine",
        medicine
    );
}


/* =========================================================
   MEDICINE FORM MODAL
========================================================= */

function createMedicineFormModal(
    title,
    mode,
    medicine = {}
) {

    let modal =
        $("gjMedicineFormModal");


    if (!modal) {

        modal =
            document.createElement(
                "div"
            );

        modal.id =
            "gjMedicineFormModal";

        modal.className =
            "modal";

        modal.innerHTML = `

            <div
                class="modal-content"
                style="
                    width:min(900px,95%);
                    max-height:90vh;
                    overflow:auto;
                "
            >

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        margin-bottom:20px;
                    "
                >

                    <h2 id="gjMedicineFormTitle">
                        Medicine
                    </h2>

                    <button
                        class="btn btn-light"
                        onclick="
                            closeModal(
                                'gjMedicineFormModal'
                            )
                        "
                    >
                        âœ•
                    </button>

                </div>


                <div class="form-grid">

                    <div class="form-group">

                        <label>
                            Medicine Name *
                        </label>

                        <input
                            id="gjMedName"
                            placeholder="e.g. Paracetamol 500mg"
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Generic Name
                        </label>

                        <input
                            id="gjMedGeneric"
                            placeholder="e.g. Paracetamol"
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Category *
                        </label>

                        <input
                            id="gjMedCategory"
                            placeholder="Tablet / Capsule / Syrup"
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Manufacturer
                        </label>

                        <input
                            id="gjMedManufacturer"
                            placeholder="Manufacturer"
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Batch Number *
                        </label>

                        <input
                            id="gjMedBatch"
                            placeholder="Batch number"
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Expiry Date *
                        </label>

                        <input
                            id="gjMedExpiry"
                            type="date"
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Purchase Price *
                        </label>

                        <input
                            id="gjMedPurchase"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Selling Price *
                        </label>

                        <input
                            id="gjMedSelling"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Initial Stock
                        </label>

                        <input
                            id="gjMedStock"
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Minimum Stock *
                        </label>

                        <input
                            id="gjMedMinimum"
                            type="number"
                            min="0"
                            step="1"
                            placeholder="10"
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Supplier
                        </label>

                        <input
                            id="gjMedSupplier"
                            placeholder="Supplier name"
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Rack / Location
                        </label>

                        <input
                            id="gjMedLocation"
                            placeholder="Rack A1"
                        >

                    </div>

                </div>

            </div>

        `;

        document.body.appendChild(
            modal
        );
    }
    /* =========================================================
   MEDICINE FORM â€” FILL DATA
========================================================= */

    $("gjMedicineFormTitle").textContent =
        title;


    $("gjMedName").value =
        medicine.name || "";

    $("gjMedGeneric").value =
        medicine.genericName || "";

    $("gjMedCategory").value =
        medicine.category || "";

    $("gjMedManufacturer").value =
        medicine.manufacturer || "";

    $("gjMedBatch").value =
        medicine.batchNumber || "";

    $("gjMedExpiry").value =
        medicine.expiryDate || "";

    $("gjMedPurchase").value =
        medicine.purchasePrice || 0;

    $("gjMedSelling").value =
        medicine.sellingPrice || 0;

    $("gjMedStock").value =
        medicine.stock || 0;

    $("gjMedMinimum").value =
        medicine.minimumStock || 0;

    $("gjMedSupplier").value =
        medicine.supplier || "";

    $("gjMedLocation").value =
        medicine.location || "";


    const content =
        modal.querySelector(
            ".modal-content"
        );


    let existingActions =
        $("gjMedicineFormActions");


    if (existingActions) {
        existingActions.remove();
    }


    existingActions =
        document.createElement(
            "div"
        );

    existingActions.id =
        "gjMedicineFormActions";

    existingActions.style.cssText = `
        display:flex;
        justify-content:flex-end;
        gap:10px;
        margin-top:20px;
        padding-top:15px;
        border-top:1px solid #eee;
    `;


    existingActions.innerHTML = `

        <button
            class="btn btn-light"
            onclick="
                closeModal(
                    'gjMedicineFormModal'
                )
            "
        >
            Cancel
        </button>


        <button
            class="btn btn-primary"
            onclick="
                saveMedicineForm(
                    '${mode}'
                )
            "
        >
            ${
                mode === "editMedicine"
                    ? "Save Changes"
                    : "Add Medicine"
            }
        </button>

    `;


    content.appendChild(
        existingActions
    );


    modal.style.display =
        "flex";
}


/* =========================================================
   SAVE MEDICINE
========================================================= */

async function saveMedicineForm(
    mode
) {

    const name =
        $("gjMedName")?.value.trim();

    const genericName =
        $("gjMedGeneric")?.value.trim();

    const category =
        $("gjMedCategory")?.value.trim();

    const manufacturer =
        $("gjMedManufacturer")?.value.trim();

    const batchNumber =
        $("gjMedBatch")?.value.trim();

    const expiryDate =
        $("gjMedExpiry")?.value;

    const purchasePrice =
        Number(
            $("gjMedPurchase")?.value || 0
        );

    const sellingPrice =
        Number(
            $("gjMedSelling")?.value || 0
        );

    const stock =
        Number(
            $("gjMedStock")?.value || 0
        );

    const minimumStock =
        Number(
            $("gjMedMinimum")?.value || 0
        );

    const supplier =
        $("gjMedSupplier")?.value.trim();

    const location =
        $("gjMedLocation")?.value.trim();


    if (
        !name ||
        !category ||
        !batchNumber ||
        !expiryDate
    ) {

        showToast(
            "Medicine Name, Category, Batch aur Expiry required hain",
            "error"
        );

        return;
    }


    if (
        purchasePrice < 0 ||
        sellingPrice < 0 ||
        stock < 0 ||
        minimumStock < 0
    ) {

        showToast(
            "Price aur stock values valid honi chahiye",
            "error"
        );

        return;
    }


    const payload = {

        hospitalId:
            HOSPITAL_ID,

        name,

        genericName,

        category,

        manufacturer,

        batchNumber,

        expiryDate,

        purchasePrice,

        sellingPrice,

        stock,

        minimumStock,

        supplier,

        location

    };


    try {

        let data;


        if (
            mode ===
            "editMedicine"
        ) {

            if (
                !selectedEditMedicineId
            ) {

                showToast(
                    "Medicine select nahi hui",
                    "error"
                );

                return;
            }


            data =
                await apiRequest(
                    `${API}/${encodeURIComponent(
                        selectedEditMedicineId
                    )}`,
                    {
                        method: "PATCH",
                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );

        } else {

            data =
                await apiRequest(
                    API,
                    {
                        method: "POST",
                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );
        }


        if (
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Medicine save failed"
            );
        }


        closeModal(
            "gjMedicineFormModal"
        );


        selectedEditMedicineId =
            null;


        await loadMedicines();


        showToast(
            mode === "editMedicine"
                ? "Medicine updated successfully"
                : "Medicine added successfully"
        );

    } catch (error) {

        console.error(
            "Save medicine error:",
            error
        );

        showToast(
            error.message ||
            "Medicine save nahi hui",
            "error"
        );
    }
}


/* =========================================================
   MEDICINE VIEW MODAL
========================================================= */

function openMedicineModal(
    medicineId
) {

    const medicine =
        medicines.find(
            item =>
                item.id === medicineId
        );


    if (!medicine) {

        showToast(
            "Medicine not found",
            "error"
        );

        return;
    }


    let modal =
        $("gjMedicineViewModal");


    if (!modal) {

        modal =
            document.createElement(
                "div"
            );

        modal.id =
            "gjMedicineViewModal";

        modal.className =
            "modal";

        document.body.appendChild(
            modal
        );
    }


    const lowStock =
        medicine.stock <=
        medicine.minimumStock;

    const expired =
        isExpired(
            medicine.expiryDate
        );


    let status;

    if (expired) {

        status = `
            <span class="badge badge-danger">
                Expired
            </span>
        `;

    } else if (lowStock) {

        status = `
            <span class="badge badge-warning">
                Low Stock
            </span>
        `;

    } else {

        status = `
            <span class="badge badge-success">
                Available
            </span>
        `;
    }


    modal.innerHTML = `

        <div
            class="modal-content"
            style="
                width:min(750px,95%);
                max-height:90vh;
                overflow:auto;
            "
        >

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:20px;
                "
            >

                <div>

                    <h2>
                        ðŸ’Š ${escapeHtml(
                            medicine.name
                        )}
                    </h2>

                    <small>
                        Medicine ID:
                        ${escapeHtml(
                            medicine.id
                        )}
                    </small>

                </div>


                <button
                    class="btn btn-light"
                    onclick="
                        closeModal(
                            'gjMedicineViewModal'
                        )
                    "
                >
                    âœ•
                </button>

            </div>


            <div
                class="form-grid"
            >

                <div class="form-group">

                    <label>
                        Generic Name
                    </label>

                    <div>
                        ${escapeHtml(
                            medicine.genericName ||
                            "-"
                        )}
                    </div>

                </div>


                <div class="form-group">

                    <label>
                        Category
                    </label>

                    <div>
                        ${escapeHtml(
                            medicine.category ||
                            "-"
                        )}
                    </div>

                </div>


                <div class="form-group">

                    <label>
                        Manufacturer
                    </label>

                    <div>
                        ${escapeHtml(
                            medicine.manufacturer ||
                            "-"
                        )}
                    </div>

                </div>


                <div class="form-group">

                    <label>
                        Batch Number
                    </label>

                    <div>
                        ${escapeHtml(
                            medicine.batchNumber ||
                            "-"
                        )}
                    </div>

                </div>


                <div class="form-group">

                    <label>
                        Expiry Date
                    </label>

                    <div>
                        ${formatDate(
                            medicine.expiryDate
                        )}
                    </div>

                </div>


                <div class="form-group">

                    <label>
                        Purchase Price
                    </label>

                    <div>
                        ${money(
                            medicine.purchasePrice
                        )}
                    </div>

                </div>


                <div class="form-group">

                    <label>
                        Selling Price
                    </label>

                    <div>
                        ${money(
                            medicine.sellingPrice
                        )}
                    </div>

                </div>


                <div class="form-group">

                    <label>
                        Current Stock
                    </label>

                    <div>

                        <strong>
                            ${medicine.stock}
                        </strong>

                    </div>

                </div>


                <div class="form-group">

                    <label>
                        Minimum Stock
                    </label>

                    <div>
                        ${medicine.minimumStock}
                    </div>

                </div>


                <div class="form-group">

                    <label>
                        Supplier
                    </label>

                    <div>
                        ${escapeHtml(
                            medicine.supplier ||
                            "-"
                        )}
                    </div>

                </div>


                <div class="form-group">

                    <label>
                        Rack / Location
                    </label>

                    <div>
                        ${escapeHtml(
                            medicine.location ||
                            "-"
                        )}
                    </div>

                </div>


                <div class="form-group">

                    <label>
                        Status
                    </label>

                    <div>
                        ${status}
                    </div>

                </div>

            </div>


            <div
                style="
                    display:flex;
                    gap:10px;
                    justify-content:flex-end;
                    margin-top:20px;
                    padding-top:15px;
                    border-top:1px solid #eee;
                "
            >

                <button
                    class="btn btn-light"
                    onclick="
                        closeModal(
                            'gjMedicineViewModal'
                        )
                    "
                >
                    Close
                </button>


                <button
                    class="btn btn-primary"
                    onclick="
                        closeModal(
                            'gjMedicineViewModal'
                        );
                        openEditMedicineModal(
                            '${medicine.id}'
                        )
                    "
                >
                    âœ Edit
                </button>


                <button
                    class="btn btn-primary"
                    onclick="
                        closeModal(
                            'gjMedicineViewModal'
                        );
                        openStockModal(
                            '${medicine.id}'
                        )
                    "
                >
                    + Stock
                </button>


                <button
                    class="btn btn-light"
                    onclick="
                        closeModal(
                            'gjMedicineViewModal'
                        );
                        openStockOutModal(
                            '${medicine.id}'
                        )
                    "
                >
                    âˆ’ Stock
                </button>

            </div>

        </div>

    `;


    modal.style.display =
        "flex";
}


/* =========================================================
   STOCK IN MODAL
========================================================= */

function openStockModal(
    medicineId
) {

    selectedStockMedicineId =
        medicineId;


    const medicine =
        medicines.find(
            item =>
                item.id === medicineId
        );


    if (!medicine) return;


    let modal =
        $("gjStockModal");


    if (!modal) {

        modal =
            document.createElement(
                "div"
            );

        modal.id =
            "gjStockModal";

        modal.className =
            "modal";

        document.body.appendChild(
            modal
        );
    }


    modal.innerHTML = `

        <div
            class="modal-content"
            style="
                width:min(500px,95%);
            "
        >

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                "
            >

                <h2>
                    ðŸ“¦ Stock In
                </h2>

                <button
                    class="btn btn-light"
                    onclick="
                        closeModal(
                            'gjStockModal'
                        )
                    "
                >
                    âœ•
                </button>

            </div>


            <p>
                Medicine:
                <strong>
                    ${escapeHtml(
                        medicine.name
                    )}
                </strong>
            </p>


            <p>
                Current Stock:
                <strong>
                    ${medicine.stock}
                </strong>
            </p>


            <div class="form-group">

                <label>
                    Quantity *
                </label>

                <input
                    id="gjStockQuantity"
                    type="number"
                    min="1"
                    value="1"
                >

            </div>


            <div class="form-group">

                <label>
                    Reason / Reference
                </label>

                <input
                    id="gjStockReason"
                    placeholder="Purchase / Supplier / Restock"
                >

            </div>


            <div
                style="
                    display:flex;
                    justify-content:flex-end;
                    gap:10px;
                    margin-top:20px;
                "
            >

                <button
                    class="btn btn-light"
                    onclick="
                        closeModal(
                            'gjStockModal'
                        )
                    "
                >
                    Cancel
                </button>


                <button
                    class="btn btn-primary"
                    onclick="
                        stockInMedicine()
                    "
                >
                    Add Stock
                </button>

            </div>

        </div>

    `;


    modal.style.display =
        "flex";
}
/* =========================================================
   STOCK OUT MODAL
========================================================= */

function openStockOutModal(
    medicineId
) {

    selectedStockMedicineId =
        medicineId;


    const medicine =
        medicines.find(
            item =>
                item.id === medicineId
        );


    if (!medicine) {

        showToast(
            "Medicine not found",
            "error"
        );

        return;
    }


    let modal =
        $("gjStockOutModal");


    if (!modal) {

        modal =
            document.createElement(
                "div"
            );

        modal.id =
            "gjStockOutModal";

        modal.className =
            "modal";

        document.body.appendChild(
            modal
        );
    }


    modal.innerHTML = `

        <div
            class="modal-content"
            style="
                width:min(500px,95%);
            "
        >

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                "
            >

                <h2>
                    ðŸ“¤ Stock Out
                </h2>

                <button
                    class="btn btn-light"
                    onclick="
                        closeModal(
                            'gjStockOutModal'
                        )
                    "
                >
                    âœ•
                </button>

            </div>


            <p>
                Medicine:
                <strong>
                    ${escapeHtml(
                        medicine.name
                    )}
                </strong>
            </p>


            <p>
                Available Stock:
                <strong>
                    ${medicine.stock}
                </strong>
            </p>


            <div class="form-group">

                <label>
                    Quantity *
                </label>

                <input
                    id="gjStockOutQuantity"
                    type="number"
                    min="1"
                    max="${medicine.stock}"
                    value="1"
                >

            </div>


            <div class="form-group">

                <label>
                    Reason *
                </label>

                <select
                    id="gjStockOutReason"
                >

                    <option value="">
                        Select Reason
                    </option>

                    <option value="damaged">
                        Damaged
                    </option>

                    <option value="expired">
                        Expired
                    </option>

                    <option value="returned">
                        Returned
                    </option>

                    <option value="manual_adjustment">
                        Manual Adjustment
                    </option>

                    <option value="other">
                        Other
                    </option>

                </select>

            </div>


            <div class="form-group">

                <label>
                    Reference / Note
                </label>

                <input
                    id="gjStockOutReference"
                    placeholder="Optional reference"
                >

            </div>


            <div
                style="
                    display:flex;
                    justify-content:flex-end;
                    gap:10px;
                    margin-top:20px;
                "
            >

                <button
                    class="btn btn-light"
                    onclick="
                        closeModal(
                            'gjStockOutModal'
                        )
                    "
                >
                    Cancel
                </button>


                <button
                    class="btn btn-primary"
                    onclick="
                        stockOutMedicine()
                    "
                >
                    Remove Stock
                </button>

            </div>

        </div>

    `;


    modal.style.display =
        "flex";
}


/* =========================================================
   STOCK IN API
========================================================= */

async function stockInMedicine() {

    if (
        !selectedStockMedicineId
    ) {

        showToast(
            "Medicine select nahi hui",
            "error"
        );

        return;
    }


    const quantity =
        Number(
            $("gjStockQuantity")?.value || 0
        );


    const reason =
        $("gjStockReason")?.value.trim();


    if (
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {

        showToast(
            "Valid quantity enter karo",
            "error"
        );

        return;
    }


    try {

        const data =
            await apiRequest(
                `${API}/${encodeURIComponent(
                    selectedStockMedicineId
                )}/stock-in`,
                {
                    method: "PATCH",

                    body:
                        JSON.stringify({
                            hospitalId:
                                HOSPITAL_ID,

                            quantity,

                            reason:
                                reason ||
                                "Stock replenishment",

                            reference:
                                "",

                            performedBy:
                                "Pharmacy"
                        })
                }
            );


        if (
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Stock update failed"
            );
        }


        closeModal(
            "gjStockModal"
        );


        selectedStockMedicineId =
            null;


        await loadMedicines();

        await loadInventoryTransactions();


        showToast(
            "Stock successfully added"
        );

    } catch (error) {

        console.error(
            "Stock in error:",
            error
        );

        showToast(
            error.message ||
            "Stock add nahi hua",
            "error"
        );
    }
}


/* =========================================================
   STOCK OUT API
========================================================= */

async function stockOutMedicine() {

    if (
        !selectedStockMedicineId
    ) {

        showToast(
            "Medicine select nahi hui",
            "error"
        );

        return;
    }


    const medicine =
        medicines.find(
            item =>
                item.id ===
                selectedStockMedicineId
        );


    if (!medicine) {

        showToast(
            "Medicine not found",
            "error"
        );

        return;
    }


    const quantity =
        Number(
            $("gjStockOutQuantity")?.value || 0
        );


    const reason =
        $("gjStockOutReason")?.value;


    const reference =
        $("gjStockOutReference")?.value.trim();


    if (
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {

        showToast(
            "Valid quantity enter karo",
            "error"
        );

        return;
    }


    if (
        quantity >
        medicine.stock
    ) {

        showToast(
            "Available stock se zyada remove nahi kar sakte",
            "error"
        );

        return;
    }


    if (!reason) {

        showToast(
            "Stock out reason select karo",
            "error"
        );

        return;
    }


    try {

        const data =
            await apiRequest(
                `${API}/${encodeURIComponent(
                    selectedStockMedicineId
                )}/stock-out`,
                {
                    method: "PATCH",

                    body:
                        JSON.stringify({
                            hospitalId:
                                HOSPITAL_ID,

                            quantity,

                            reason,

                            reference:
                                reference ||
                                "",

                            performedBy:
                                "Pharmacy"
                        })
                }
            );


        if (
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Stock update failed"
            );
        }


        closeModal(
            "gjStockOutModal"
        );


        selectedStockMedicineId =
            null;


        await loadMedicines();

        await loadInventoryTransactions();


        showToast(
            "Stock successfully removed"
        );

    } catch (error) {

        console.error(
            "Stock out error:",
            error
        );

        showToast(
            error.message ||
            "Stock remove nahi hua",
            "error"
        );
    }
}


/* =========================================================
   INVENTORY HISTORY
========================================================= */

function renderInventoryHistory() {

    const container =
        $("inventoryHistory");

    if (!container) return;


    if (
        !inventoryTransactions.length
    ) {

        container.innerHTML = `
            <div class="empty">
                ðŸ“œ No inventory transactions found.
            </div>
        `;

        return;
    }


    const sorted =
        [...inventoryTransactions]
            .sort(
                (a, b) =>
                    new Date(
                        b.createdAt ||
                        b.date ||
                        0
                    ) -
                    new Date(
                        a.createdAt ||
                        a.date ||
                        0
                    )
            );


    container.innerHTML =
        sorted
            .map(
                transaction => {

                    const type =
                        transaction.type ||
                        transaction.action ||
                        "transaction";


                    const quantity =
                        Number(
                            transaction.quantity ||
                            0
                        );


                    const medicineName =
                        transaction.medicineName ||
                        transaction.name ||
                        getMedicineName(
                            transaction.medicineId
                        );


                    const sign =
                        type === "stock_in"
                            ? "+"
                            : type === "stock_out"
                                ? "-"
                                : "";


                    return `

                        <div
                            class="alert-item"
                            style="
                                display:flex;
                                justify-content:space-between;
                                gap:15px;
                                align-items:center;
                            "
                        >

                            <div>

                                <strong>
                                    ${escapeHtml(
                                        medicineName
                                    )}
                                </strong>

                                <br>

                                <small>
                                    ${escapeHtml(
                                        formatTransactionType(
                                            type
                                        )
                                    )}
                                </small>

                                <br>

                                <small>
                                    ${escapeHtml(
                                        transaction.reason ||
                                        "-"
                                    )}
                                </small>

                                ${
                                    transaction.reference
                                        ? `
                                            <br>
                                            <small>
                                                Ref:
                                                ${escapeHtml(
                                                    transaction.reference
                                                )}
                                            </small>
                                          `
                                        : ""
                                }

                                <br>

                                <small>
                                    ${formatDateTime(
                                        transaction.createdAt ||
                                        transaction.date
                                    )}
                                </small>

                            </div>


                            <div
                                style="
                                    font-size:18px;
                                    font-weight:700;
                                "
                            >

                                ${sign}
                                ${quantity}

                            </div>

                        </div>

                    `;
                }
            )
            .join("");
}


/* =========================================================
   TRANSACTION HELPERS
========================================================= */

function getMedicineName(
    medicineId
) {

    const medicine =
        medicines.find(
            item =>
                item.id === medicineId
        );


    return medicine
        ? medicine.name
        : medicineId || "Medicine";
}


function formatTransactionType(
    type
) {

    const labels = {

        stock_in:
            "Stock In",

        stock_out:
            "Stock Out",

        dispense:
            "Dispensed",

        sale:
            "Sale",

        adjustment:
            "Adjustment"

    };


    return (
        labels[type] ||
        String(type)
            .replace(/_/g, " ")
            .replace(
                /\b\w/g,
                letter =>
                    letter.toUpperCase()
            )
    );
}


/* =========================================================
   EXPIRY CHECK
========================================================= */

function isExpired(
    expiryDate
) {

    if (!expiryDate) {
        return false;
    }


    const expiry =
        new Date(
            expiryDate
        );


    if (
        isNaN(
            expiry.getTime()
        )
    ) {

        return false;
    }


    expiry.setHours(
        23,
        59,
        59,
        999
    );


    return (
        expiry <
        new Date()
    );
}


/* =========================================================
   EXPIRING SOON
========================================================= */

function isExpiringSoon(
    expiryDate,
    days = 30
) {

    if (!expiryDate) {
        return false;
    }


    const expiry =
        new Date(
            expiryDate
        );


    if (
        isNaN(
            expiry.getTime()
        )
    ) {

        return false;
    }


    const now =
        new Date();


    const limit =
        new Date();


    limit.setDate(
        limit.getDate() +
        days
    );


    return (
        expiry >= now &&
        expiry <= limit
    );
}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal(
    modalId
) {

    const modal =
        $(modalId);

    if (!modal) return;


    modal.style.display =
        "none";
}


/* =========================================================
   MODAL OUTSIDE CLICK
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        if (
            event.target.classList &&
            event.target.classList.contains(
                "modal"
            )
        ) {

            event.target.style.display =
                "none";
        }

    }
);
/* =========================================================
   DISPENSE MEDICINE
========================================================= */

async function dispenseMedicine() {

    const patient =
        $("dispensePatient").value.trim();

    const patientId =
        $("dispensePatientId").value.trim();

    const medicineId =
        $("dispenseMedicine").value;

    const quantity =
        Number(
            $("dispenseQuantity").value
        );

    const prescriptionRef =
        $("prescriptionRef").value.trim();


    if (!patient) {

        showToast(
            "Patient name enter karo",
            "error"
        );

        return;
    }


    if (!patientId) {

        showToast(
            "Patient ID enter karo",
            "error"
        );

        return;
    }


    if (!medicineId) {

        showToast(
            "Medicine select karo",
            "error"
        );

        return;
    }


    if (
        !quantity ||
        quantity <= 0
    ) {

        showToast(
            "Valid quantity enter karo",
            "error"
        );

        return;
    }


    const medicine =
        medicines.find(
            item =>
                item.id === medicineId
        );


    if (!medicine) {

        showToast(
            "Medicine nahi mili",
            "error"
        );

        return;
    }


    if (
        quantity >
        medicine.stock
    ) {

        showToast(
            `Sirf ${medicine.stock} units available hain`,
            "error"
        );

        return;
    }


    try {

        const data =
            await apiRequest(
                `${API}/sales`,
                {
                    method: "POST",

                    body:
                        JSON.stringify({

                            hospitalId:
                                HOSPITAL_ID,

                            medicineId:
                                medicine.id,

                            quantity,

                            patientId,

                            patientName:
                                patient,

                            prescriptionRef,

                            dispensedBy:
                                "Pharmacy Staff"

                        })
                }
            );


        if (
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Medicine dispense failed"
            );
        }


        showToast(
            data.message ||
            "Medicine dispensed successfully"
        );


        if (
            $("dispensePatient")
        ) {
            $("dispensePatient").value =
                "";
        }


        if (
            $("dispensePatientId")
        ) {
            $("dispensePatientId").value =
                "";
        }


        if (
            $("dispenseMedicine")
        ) {
            $("dispenseMedicine").value =
                "";
        }


        if (
            $("dispenseQuantity")
        ) {
            $("dispenseQuantity").value =
                "1";
        }


        if (
            $("prescriptionRef")
        ) {
            $("prescriptionRef").value =
                "";
        }


        await loadMedicines();

        await loadSales();

        await loadInventoryTransactions();

        renderAlerts();

    } catch (error) {

        console.error(
            "Dispense error:",
            error
        );

        showToast(
            error.message ||
            "Medicine dispense failed",
            "error"
        );
    }
}


/* =========================================================
   DISPENSING RECORDS
========================================================= */

function renderDispensingRecords() {

    const container =
        $("dispensingRecords");

    if (!container) return;


    if (!sales.length) {

        container.innerHTML = `
            <div class="empty">
                No dispensing records yet.
            </div>
        `;

        return;
    }


    container.innerHTML =
        sales
            .slice()
            .reverse()
            .slice(0, 20)
            .map(
                sale => {

                    const patient =
                        sale.patientName ||
                        sale.patient ||
                        "Patient";


                    const medicine =
                        sale.medicineName ||
                        sale.medicine ||
                        sale.medicineId ||
                        "Medicine";


                    return `

                        <div
                            class="alert-item"
                        >

                            <strong>
                                ${escapeHtml(
                                    patient
                                )}
                            </strong>

                            <span>

                                ${escapeHtml(
                                    medicine
                                )}

                                Ã—

                                ${Number(
                                    sale.quantity || 0
                                )}

                                <br>

                                ${formatDate(
                                    sale.createdAt
                                )}

                            </span>

                        </div>

                    `;
                }
            )
            .join("");
}


/* =========================================================
   BILLING
========================================================= */

let bills = [];


function formatCurrency(
    value
) {

    return money(value);

}


function updateBillPrice() {

    const medicineId =
        $("billMedicine")?.value;


    const medicine =
        medicines.find(
            item =>
                item.id === medicineId
        );


    const price =
        medicine
            ? Number(
                medicine.sellingPrice || 0
              )
            : 0;


    if (
        $("billPrice")
    ) {

        $("billPrice").value =
            price.toFixed(2);
    }


    updateTotal();
}


function updateTotal() {

    const price =
        Number(
            $("billPrice")?.value || 0
        );


    const quantity =
        Number(
            $("billQuantity")?.value || 0
        );


    if (
        $("billTotal")
    ) {

        $("billTotal").value =
            (
                price *
                quantity
            ).toFixed(2);
    }
}


async function createBill() {

    const patient =
        $("billPatient")?.value.trim() || "";

    const patientId =
        $("billPatientId")?.value.trim() || "";

    const medicineId =
        $("billMedicine")?.value || "";

    const quantity =
        Number($("billQuantity")?.value || 0);


    // ===============================
    // VALIDATION
    // ===============================

    if (!patient) {
        showToast("Patient name enter karo", "error");
        return;
    }

    if (!medicineId) {
        showToast("Medicine select karo", "error");
        return;
    }

    if (!quantity || quantity <= 0) {
        showToast("Valid quantity enter karo", "error");
        return;
    }


    // ===============================
    // FIND MEDICINE
    // ===============================

    const medicine =
        medicines.find(item => item.id === medicineId);

    if (!medicine) {
        showToast("Medicine nahi mili", "error");
        return;
    }


    // ===============================
    // STOCK CHECK
    // ===============================

    if (quantity > medicine.stock) {

        showToast(
            `Sirf ${medicine.stock} units available hain`,
            "error"
        );

        return;
    }


    // ===============================
    // CALCULATE BILL
    // ===============================

    const price =
        Number(medicine.sellingPrice || 0);

    const total =
        price * quantity;


    // ===============================
    // BACKEND BILL DATA
    // ===============================

    const billData = {

        hospitalId: HOSPITAL_ID,

        patientId: patientId,

        patientName: patient,

        items: [
            {
                medicineId: medicine.id,
                medicineName: medicine.name,
                quantity: quantity,
                price: price,
                total: total
            }
        ],

        subtotal: total,

        discount: 0,

        tax: 0,

        total: total,

        paymentMethod: "cash",

        paymentStatus: "pending",

        createdBy: "Pharmacy Staff",

        prescriptionRef: ""

    };


    // ===============================
    // SAVE TO BACKEND
    // ===============================

    try {

        showToast(
            "Bill save ho raha hai..."
        );


        const response =
            await fetch(
                "/api/billing",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(billData)
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            console.error(
                "Billing API Error:",
                data
            );

            showToast(
                data.message ||
                "Bill save nahi ho paya",
                "error"
            );

            return;
        }


        // ===============================
        // BACKEND BILL SUCCESS
        // ===============================

        const bill =
            data.bill;


        // Local array update
        bills.unshift(bill);


        // Render Generated Bills
        renderBills();


        showToast(
            `Bill ${bill.id} generated successfully`
        );


        // ===============================
        // RESET FORM
        // ===============================

        if ($("billPatient")) {
            $("billPatient").value = "";
        }

        if ($("billPatientId")) {
            $("billPatientId").value = "";
        }

        if ($("billMedicine")) {
            $("billMedicine").value = "";
        }

        if ($("billQuantity")) {
            $("billQuantity").value = "1";
        }

        if ($("billPrice")) {
            $("billPrice").value = "0.00";
        }

        if ($("billTotal")) {
            $("billTotal").value = "0.00";
        }


        console.log(
            "âœ“ Bill saved to backend:",
            bill
        );


    } catch (error) {

        console.error(
            "Billing connection error:",
            error
        );

        showToast(
            "Billing server se connection nahi ho raha",
            "error"
        );

    }

}
/* =========================================================
   LOAD BILLS FROM BACKEND
========================================================= */

async function loadBills() {

    const container =
        $("generatedBillsRecords");

    try {

        const response =
            await fetch(
                `/api/billing?hospitalId=${encodeURIComponent(HOSPITAL_ID)}`
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Bills load nahi ho paaye"
            );
        }

        bills =
            Array.isArray(data.bills)
                ? data.bills
                : [];

        console.log(
            "âœ“ Backend bills loaded:",
            bills
        );

        renderBills();

    } catch (error) {

        console.error(
            "Load bills error:",
            error
        );

        if (container) {

            container.innerHTML = `
                <div class="empty">
                    Bills load nahi ho paaye.
                </div>
            `;
        }
    }
}
/* =========================================================
   RENDER GENERATED BILLS
========================================================= */

function renderBills() {

    const container = $("generatedBillsRecords");

    if (!container) {
        return;
    }

    if (!Array.isArray(bills) || bills.length === 0) {

        container.innerHTML = `
            <div class="empty">
                No bills generated yet.
            </div>
        `;

        return;
    }

    container.innerHTML = bills.map(bill => {

        const items = Array.isArray(bill.items)
            ? bill.items
            : [];

        let medicineText = "-";

        if (items.length > 0) {

            medicineText = items
                .map(item => {

                    const medicineName =
                        escapeHtml(item.medicineName || "-");

                    const quantity =
                        Number(item.quantity || 0);

                    return `${medicineName} Ã— ${quantity}`;

                })
                .join("<br>");

        } else if (bill.medicineName) {

            medicineText = `
                ${escapeHtml(bill.medicineName)}
                Ã—
                ${Number(bill.quantity || 0)}
            `;
        }

        const total =
            Number(bill.total || 0);

        const patientName =
            escapeHtml(bill.patientName || "-");

        const patientId =
            escapeHtml(bill.patientId || "-");

        const billDate =
            bill.createdAt
                ? formatDateTime(bill.createdAt)
                : "-";

        return `

            <div
                class="alert-item"
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:20px;
                    padding:18px;
                    margin-bottom:10px;
                "
            >

                <div>

                    <strong style="font-size:16px;">
                        ${patientName}
                    </strong>

                    <br>

                    <small>
                        ${patientId}
                    </small>

                    <br>

                    <small
                        style="
                            display:block;
                            margin-top:5px;
                        "
                    >
                        ${medicineText}
                    </small>

                </div>

                <div
                    style="
                        text-align:right;
                        min-width:130px;
                    "
                >

                    <strong style="font-size:17px;">
                        â‚¹${total.toFixed(2)}
                    </strong>

                    <br>

                    <small>
                        ${billDate}
                    </small>

                    <br>

                    <span class="badge badge-success">
                        Generated
                    </span>

                </div>

            </div>

        `;

    }).join("");
}
/* =========================================================
   BILL PRINT
========================================================= */

function printBill(
    billId
) {

    const bill =
        bills.find(
            item =>
                item.id === billId
        );


    if (!bill) {

        showToast(
            "Bill not found",
            "error"
        );

        return;
    }


    const printWindow =
        window.open(
            "",
            "_blank"
        );


    if (!printWindow) {

        showToast(
            "Popup blocked. Browser popup allow karo.",
            "error"
        );

        return;
    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                ${escapeHtml(
                    bill.id
                )}
            </title>

            <style>

                body {
                    font-family: Arial, sans-serif;
                    padding: 30px;
                }

                .header {
                    text-align:center;
                    margin-bottom:30px;
                }

                table {
                    width:100%;
                    border-collapse:collapse;
                }

                td,
                th {
                    border:1px solid #ddd;
                    padding:10px;
                    text-align:left;
                }

                .total {
                    text-align:right;
                    font-size:20px;
                    font-weight:bold;
                    margin-top:20px;
                }

            </style>

        </head>


        <body>

            <div class="header">

                <h1>
                    GOPAL JOSHI HOSPITAL
                </h1>

                <p>
                    Pharmacy Bill
                </p>

            </div>


            <p>
                <strong>
                    Bill ID:
                </strong>

                ${escapeHtml(
                    bill.id
                )}
            </p>


            <p>
                <strong>
                    Patient:
                </strong>

                ${escapeHtml(
                    bill.patientName
                )}
            </p>


            <p>
                <strong>
                    Patient ID:
                </strong>

                ${escapeHtml(
                    bill.patientId ||
                    "-"
                )}
            </p>


            <table>

                <thead>

                    <tr>

                        <th>
                            Medicine
                        </th>

                        <th>
                            Quantity
                        </th>

                        <th>
                            Price
                        </th>

                        <th>
                            Total
                        </th>

                    </tr>

                </thead>


                <tbody>

                    <tr>

                        <td>
                            ${escapeHtml(
                                bill.medicineName
                            )}
                        </td>

                        <td>
                            ${bill.quantity}
                        </td>

                        <td>
                            ${formatCurrency(
                                bill.price
                            )}
                        </td>

                        <td>
                            ${formatCurrency(
                                bill.total
                            )}
                        </td>

                    </tr>

                </tbody>

            </table>


            <div class="total">

                Grand Total:
                ${formatCurrency(
                    bill.total
                )}

            </div>


            <script>

                window.onload =
                    function() {
                        window.print();
                    };

            <\/script>

        </body>

        </html>

    `);


    printWindow.document.close();
}


/* =========================================================
   BILLING CONTROLS
========================================================= */

/* =========================================================
   BILLING CONTROLS
========================================================= */

function addBillingControls() {

    const billingPage = $("billing");

    if (!billingPage) {
        return;
    }

    if ($("gjBillingRecords")) {
        return;
    }

    const wrapper = document.createElement("div");

    wrapper.id = "gjBillingRecords";

    wrapper.style.marginTop = "25px";

    wrapper.innerHTML = `

        <div
            style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                margin-bottom:12px;
            "
        >

            <h3>
                ðŸ§¾ Generated Bills
            </h3>

            <button
                class="btn btn-light"
                onclick="loadBills()"
            >
                â†» Refresh
            </button>

        </div>

        <div
            id="generatedBillsRecords"
            class="alert-list"
        >

            <div class="empty">
                Loading generated bills...
            </div>

        </div>

    `;

    billingPage.appendChild(wrapper);

    // Backend se bills load honge
    loadBills();
}

/* =========================================================
   BILL MEDICINE QUANTITY LISTENER
========================================================= */

function setupBillingListeners() {

    const medicine =
        $("billMedicine");

    const quantity =
        $("billQuantity");


    if (medicine) {

        medicine.addEventListener(
            "change",
            updateBillPrice
        );
    }


    if (quantity) {

        quantity.addEventListener(
            "input",
            updateTotal
        );
    }
}
/* =========================================================
   ALERTS
========================================================= */

async function renderAlerts() {

    console.log("ðŸ”¥ renderAlerts STARTED");

const container = $("allAlerts");

    if (!container) {
        console.error("âŒ allAlerts element nahi mila");
        return;
    }

    container.innerHTML = `
        <div class="empty">
            Loading alerts...
        </div>
    `;

    try {

        console.log("ðŸ”Ž Checking Low Stock API...");

        const lowStockResponse = await apiRequest(
            `${API}/alerts/low-stock?hospitalId=${encodeURIComponent(HOSPITAL_ID)}`
        );

        console.log("âœ“ Low Stock API:", lowStockResponse);


        console.log("ðŸ”Ž Checking Expiry API...");

        const expiryResponse = await apiRequest(
            `${API}/alerts/expiry?hospitalId=${encodeURIComponent(HOSPITAL_ID)}&days=30`
        );

        console.log("âœ“ Expiry API:", expiryResponse);


        console.log("ðŸ”Ž Checking Expired API...");

        const expiredResponse = await apiRequest(
            `${API}/alerts/expired?hospitalId=${encodeURIComponent(HOSPITAL_ID)}`
        );

        console.log("âœ“ Expired API:", expiredResponse);


        const alerts = [];


        /* =========================
           LOW STOCK
        ========================= */

        const lowStockMedicines =
            Array.isArray(lowStockResponse.medicines)
                ? lowStockResponse.medicines
                : [];

        lowStockMedicines.forEach(medicine => {

            alerts.push({
                type: "low-stock",
                title: "Low Stock",
                message:
                    `${medicine.name} ka stock sirf ${Number(medicine.stock || 0)} hai.`,
                medicineId: medicine.id
            });

        });


        /* =========================
           EXPIRING SOON
        ========================= */

        const expiringMedicines =
            Array.isArray(expiryResponse.medicines)
                ? expiryResponse.medicines
                : [];

        expiringMedicines.forEach(medicine => {

            alerts.push({
                type: "expiry",
                title: "Expiry Soon",
                message:
                    `${medicine.name} (${medicine.batchNumber || "-"}) 30 days ke andar expire ho rahi hai.`,
                medicineId: medicine.id
            });

        });


        /* =========================
           EXPIRED
        ========================= */

        const expiredMedicines =
            Array.isArray(expiredResponse.medicines)
                ? expiredResponse.medicines
                : [];

        expiredMedicines.forEach(medicine => {

            alerts.push({
                type: "expired",
                title: "Medicine Expired",
                message:
                    `${medicine.name} (${medicine.batchNumber || "-"}) expired hai.`,
                medicineId: medicine.id
            });

        });


        console.log("âœ“ Final alerts:", alerts);


        /* =========================
           NO ALERTS
        ========================= */

        if (!alerts.length) {

            container.innerHTML = `
                <div class="empty">
                    <div class="empty-icon">âœ“</div>
                    No active pharmacy alerts.
                </div>
            `;

            return;
        }


        /* =========================
           SHOW ALERTS
        ========================= */

        container.innerHTML = alerts.map(alert => {

            return `
                <div
                    class="alert-item"
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        gap:15px;
                        padding:16px;
                        margin-bottom:10px;
                    "
                >

                    <div>

                        <strong>
                            ${escapeHtml(alert.title)}
                        </strong>

                        <br>

                        <small>
                            ${escapeHtml(alert.message)}
                        </small>

                    </div>

                    ${
                        alert.medicineId
                            ? `
                                <button
                                    class="btn btn-light"
                                    onclick="openMedicineModal('${alert.medicineId}')"
                                >
                                    View
                                </button>
                            `
                            : ""
                    }

                </div>
            `;

        }).join("");


        console.log(
            "âœ… Pharmacy alerts UI rendered successfully"
        );


    } catch (error) {

        console.error(
            "âŒ Pharmacy alerts API error:",
            error
        );

        container.innerHTML = `
            <div class="empty">
                âš ï¸ Pharmacy alerts load nahi ho paaye.
                <br>
                <small>
                    ${escapeHtml(error.message || "Backend error")}
                </small>
            </div>
        `;
    }
}
/* =========================================================
   ALERT SUMMARY
========================================================= */

function getAlertSummary() {

    const lowStock =
        medicines.filter(
            medicine =>
                medicine.stock <=
                medicine.minimumStock
        ).length;


    const expired =
        medicines.filter(
            medicine =>
                isExpired(
                    medicine.expiryDate
                )
        ).length;


    const expiringSoon =
        medicines.filter(
            medicine =>
                !isExpired(
                    medicine.expiryDate
                ) &&
                isExpiringSoon(
                    medicine.expiryDate,
                    30
                )
        ).length;


    return {

        lowStock,

        expired,

        expiringSoon,

        total:
            lowStock +
            expired +
            expiringSoon

    };
}


/* =========================================================
   ALERT BADGE
========================================================= */

function updateAlertBadge() {

    const summary =
        getAlertSummary();


    const badges =
        document.querySelectorAll(
            ".alert-count"
        );


    badges.forEach(
        badge => {

            badge.textContent =
                summary.total;

            badge.style.display =
                summary.total > 0
                    ? "inline-flex"
                    : "none";

        }
    );
}


/* =========================================================
   PAGE SWITCHING
========================================================= */

function showPage(
    pageId,
    clickedButton = null
) {

    const pages =
        document.querySelectorAll(
            ".page"
        );


    pages.forEach(
        page => {

            page.style.display =
                "none";

            page.classList.remove(
                "active"
            );

        }
    );


    const target =
        $(pageId);


    if (!target) {

        console.warn(
            "Page not found:",
            pageId
        );

        return;
    }


    target.style.display =
        "block";

    target.classList.add(
        "active"
    );


    const navButtons =
        document.querySelectorAll(
            ".nav button"
        );


    navButtons.forEach(
        button => {

            button.classList.remove(
                "active"
            );

        }
    );


    if (
        clickedButton
    ) {

        clickedButton.classList.add(
            "active"
        );

    } else {

        navButtons.forEach(
            button => {

                const onclick =
                    button.getAttribute(
                        "onclick"
                    );


                if (
                    onclick &&
                    onclick.includes(
                        `"${pageId}"`
                    )
                ) {

                    button.classList.add(
                        "active"
                    );

                }

            }
        );
    }


    if (
        pageId ===
        "inventory"
    ) {

        renderInventory();

        renderInventoryHistory();

    }


    if (
        pageId ===
        "medicines"
    ) {

        searchMedicines();

    }


    if (
        pageId ===
        "alerts"
    ) {

        renderAlerts();

    }


    if (
        pageId ===
        "dispense"
    ) {

        populateMedicineDropdowns();

    }


    if (
        pageId ===
        "billing"
    ) {

        populateMedicineDropdowns();

        renderBills();

    }


    if (
        pageId ===
        "prescriptions"
    ) {

        loadPrescriptions();

    }

}


/* =========================================================
   SIDEBAR / NAVIGATION
========================================================= */

function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            ".nav button"
        );


    buttons.forEach(
        button => {

            if (
                button.dataset.gjBound
            ) {
                return;
            }


            const onclick =
                button.getAttribute(
                    "onclick"
                );


            if (!onclick) {
                return;
            }


            button.dataset.gjBound =
                "true";

        }
    );

}


/* =========================================================
   PHARMACY QUICK ACTIONS
========================================================= */

function pharmacyQuickAction(
    action
) {

    switch (action) {

        case "add":

            openAddMedicineModal();

            break;


        case "stock":

            showPage(
                "inventory"
            );

            break;


        case "dispense":

            showPage(
                "dispense"
            );

            break;


        case "billing":

            showPage(
                "billing"
            );

            break;


        case "prescriptions":

            showPage(
                "prescriptions"
            );

            break;


        case "alerts":

            showPage(
                "alerts"
            );

            break;


        default:

            console.warn(
                "Unknown pharmacy action:",
                action
            );

    }
}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Escape"
        ) {

            document
                .querySelectorAll(
                    ".modal"
                )
                .forEach(
                    modal => {

                        modal.style.display =
                            "none";

                    }
                );

        }

    }
);


/* =========================================================
   SEARCH EVENT LISTENERS
========================================================= */

function setupSearchListeners() {

    const medicineSearch =
        $("medicineSearch");


    if (
        medicineSearch &&
        !medicineSearch.dataset.bound
    ) {

        medicineSearch.addEventListener(
            "input",
            searchMedicines
        );

        medicineSearch.dataset.bound =
            "true";
    }


    const inventorySearch =
        $("inventorySearch");


    if (
        inventorySearch &&
        !inventorySearch.dataset.bound
    ) {

        inventorySearch.addEventListener(
            "input",
            renderInventory
        );

        inventorySearch.dataset.bound =
            "true";
    }


    const dashboardSearch =
        $("dashboardSearch");


    if (
        dashboardSearch &&
        !dashboardSearch.dataset.bound
    ) {

        dashboardSearch.addEventListener(
            "input",
            renderDashboardSearch
        );

        dashboardSearch.dataset.bound =
            "true";
    }


    const categoryFilter =
        $("categoryFilter");


    if (
        categoryFilter &&
        !categoryFilter.dataset.bound
    ) {

        categoryFilter.addEventListener(
            "change",
            searchMedicines
        );

        categoryFilter.dataset.bound =
            "true";
    }

}


/* =========================================================
   FORM ENTER KEY
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key !==
            "Enter"
        ) {
            return;
        }


        const target =
            event.target;


        if (
            target &&
            target.tagName ===
            "INPUT"
        ) {

            if (
                target.id ===
                "medicineSearch"
            ) {

                searchMedicines();

            }

            if (
                target.id ===
                "inventorySearch"
            ) {

                renderInventory();

            }

        }

    }
);
/* =========================================================
   PART 8 â€” FINAL INITIALIZATION
   GOPAL JOSHI HOSPITAL PHARMACY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "Pharmacy module initializing..."
        );

        try {

            /* -----------------------------------------
               BASIC SETUP
            ----------------------------------------- */

            setupNavigation();

            setupSearchListeners();


            /* -----------------------------------------
               LOAD PHARMACY DATA
            ----------------------------------------- */

            if (
                typeof loadMedicines ===
                "function"
            ) {

                await loadMedicines();

            }


            /* -----------------------------------------
               LOAD PRESCRIPTIONS
            ----------------------------------------- */

            if (
                typeof loadPrescriptions ===
                "function"
            ) {

                await loadPrescriptions();

            }


            /* -----------------------------------------
               RENDER DASHBOARD
            ----------------------------------------- */

            if (
                typeof renderDashboard ===
                "function"
            ) {

                renderDashboard();

            }


            /* -----------------------------------------
               RENDER INVENTORY
            ----------------------------------------- */

            if (
                typeof renderInventory ===
                "function"
            ) {

                renderInventory();

            }


            /* -----------------------------------------
               RENDER ALERTS
            ----------------------------------------- */

            if (
                typeof renderAlerts ===
                "function"
            ) {

                renderAlerts();

            }


            /* -----------------------------------------
               ALERT BADGE
            ----------------------------------------- */

            if (
                typeof updateAlertBadge ===
                "function"
            ) {

                updateAlertBadge();

            }


            /* -----------------------------------------
               MEDICINE DROPDOWNS
            ----------------------------------------- */

            if (
                typeof populateMedicineDropdowns ===
                "function"
            ) {

                populateMedicineDropdowns();

            }


            /* -----------------------------------------
               PRESCRIPTION CONTROLS
            ----------------------------------------- */

            if (
                typeof addPrescriptionControls ===
                "function"
            ) {

                addPrescriptionControls();

            }


            /* -----------------------------------------
               BILLING CONTROLS
            ----------------------------------------- */

            if (
                typeof addBillingControls ===
                "function"
            ) {

                addBillingControls();

            }


            /* -----------------------------------------
               INITIAL PAGE
            ----------------------------------------- */

            const pages =
                document.querySelectorAll(
                    ".page"
                );


            let activePage = null;


            pages.forEach(
                page => {

                    if (
                        page.classList.contains(
                            "active"
                        )
                    ) {

                        activePage = page;

                    }

                }
            );


            if (
                !activePage &&
                pages.length > 0
            ) {

                pages.forEach(
                    page => {

                        page.style.display =
                            "none";

                    }
                );


                const dashboard =
                    $("dashboard");


                if (dashboard) {

                    dashboard.style.display =
                        "block";

                    dashboard.classList.add(
                        "active"
                    );

                }

            }


            /* -----------------------------------------
               FINISH
            ----------------------------------------- */

            console.log(
                "âœ“ Pharmacy module initialized successfully"
            );

        } catch (error) {

            console.error(
                "Pharmacy initialization error:",
                error
            );

        }

    }
);


/* =========================================================
   GLOBAL PHARMACY API
========================================================= */

window.PharmacyApp = {

    loadMedicines:
        typeof loadMedicines ===
        "function"
            ? loadMedicines
            : null,

    loadPrescriptions:
        typeof loadPrescriptions ===
        "function"
            ? loadPrescriptions
            : null,

    renderDashboard:
        typeof renderDashboard ===
        "function"
            ? renderDashboard
            : null,

    renderInventory:
        typeof renderInventory ===
        "function"
            ? renderInventory
            : null,

    renderAlerts:
        typeof renderAlerts ===
        "function"
            ? renderAlerts
            : null,

    renderBills:
        typeof renderBills ===
        "function"
            ? renderBills
            : null,

    createBill:
        typeof createBill ===
        "function"
            ? createBill
            : null,

    dispenseMedicine:
        typeof dispenseMedicine ===
        "function"
            ? dispenseMedicine
            : null,

    pharmacyQuickAction:
        typeof pharmacyQuickAction ===
        "function"
            ? pharmacyQuickAction
            : null,

    getAlertSummary:
        typeof getAlertSummary ===
        "function"
            ? getAlertSummary
            : null

};


/* =========================================================
   ERROR HANDLING
========================================================= */

window.addEventListener(
    "error",
    function (event) {

        console.error(
            "Pharmacy JavaScript error:",
            event.error ||
            event.message
        );

    }
);


/* =========================================================
   UNHANDLED PROMISE ERROR
========================================================= */

window.addEventListener(
    "unhandledrejection",
    function (event) {

        console.error(
            "Pharmacy promise error:",
            event.reason
        );

    }
);


console.log(
    "Gopal Joshi Hospital Pharmacy loaded."
);
