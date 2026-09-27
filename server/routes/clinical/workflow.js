const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const DATA_DIR = path.join(__dirname, "../../data");
const DATA_FILE = path.join(DATA_DIR, "clinical-workflow.json");

const DEFAULT_HOSPITAL = "HOSP-TEST-001";

function ensureFile() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(
                {
                    consultations: [],
                    prescriptions: [],
                    labOrders: [],
                    billingItems: []
                },
                null,
                2
            )
        );
    }
}

function readData() {
    ensureFile();

    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    } catch {
        return {
            consultations: [],
            prescriptions: [],
            labOrders: [],
            billingItems: []
        };
    }
}

function writeData(data) {
    ensureFile();

    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(data, null, 2)
    );
}

function id(prefix, list) {
    return `${prefix}-${String(list.length + 1).padStart(5, "0")}`;
}

function now() {
    return new Date().toISOString();
}


/* =========================================================
   DASHBOARD / QUEUES
========================================================= */

router.get("/dashboard", (req, res) => {
    const hospitalId =
        req.query.hospitalId || DEFAULT_HOSPITAL;

    const data = readData();

    const consultations =
        data.consultations.filter(
            x => x.hospitalId === hospitalId
        );

    const prescriptions =
        data.prescriptions.filter(
            x => x.hospitalId === hospitalId
        );

    const labOrders =
        data.labOrders.filter(
            x => x.hospitalId === hospitalId
        );

    const billingItems =
        data.billingItems.filter(
            x => x.hospitalId === hospitalId
        );

    res.json({
        success: true,
        hospitalId,

        summary: {
            consultations: consultations.length,

            activeConsultations:
                consultations.filter(
                    x => x.status === "In Consultation"
                ).length,

            completedConsultations:
                consultations.filter(
                    x => x.status === "Completed"
                ).length,

            prescriptions:
                prescriptions.length,

            pendingPrescriptions:
                prescriptions.filter(
                    x => x.status === "Pending"
                ).length,

            labOrders:
                labOrders.length,

            pendingLabOrders:
                labOrders.filter(
                    x => x.status === "Pending"
                ).length,

            billingItems:
                billingItems.length,

            pendingBilling:
                billingItems.filter(
                    x => x.status === "Pending"
                ).length
        }
    });
});


/* =========================================================
   SAVE COMPLETE CLINICAL WORKFLOW
========================================================= */

router.post("/save", (req, res) => {

    const body = req.body || {};

    const hospitalId =
        body.hospitalId || DEFAULT_HOSPITAL;

    const data = readData();

    const appointmentId =
        body.appointmentId || null;

    const patientId =
        body.patientId || null;

    const patientName =
        body.patientName || "";

    const doctorId =
        body.doctorId || null;

    const doctorName =
        body.doctorName || "";

    const department =
        body.department || "";

    const consultation = body.consultation || {};

    const medicines =
        Array.isArray(body.medicines)
            ? body.medicines
            : [];

    const labTests =
        Array.isArray(body.labTests)
            ? body.labTests
            : [];

    const consultationId =
        id("CON", data.consultations);

    const timestamp = now();


    /* =====================================================
       CONSULTATION
    ===================================================== */

    const consultationRecord = {

        id: consultationId,

        hospitalId,

        appointmentId,

        patientId,

        patientName,

        doctorId,

        doctorName,

        department,

        vitals: consultation.vitals || {},

        symptoms:
            Array.isArray(consultation.symptoms)
                ? consultation.symptoms
                : [],

        diagnosis:
            consultation.diagnosis || "",

        notes:
            consultation.notes || "",

        followUpDate:
            consultation.followUpDate || null,

        status:
            body.status || "In Consultation",

        createdAt: timestamp,

        updatedAt: timestamp
    };


    data.consultations.push(
        consultationRecord
    );


    /* =====================================================
       PRESCRIPTION
    ===================================================== */

    let prescriptionRecord = null;

    if (medicines.length > 0) {

        prescriptionRecord = {

            id: id(
                "RX",
                data.prescriptions
            ),

            hospitalId,

            consultationId,

            appointmentId,

            patientId,

            patientName,

            doctorId,

            doctorName,

            medicines: medicines.map(
                (medicine, index) => ({
                    id: index + 1,

                    medicineId:
                        medicine.medicineId ||
                        null,

                    medicineName:
                        medicine.medicineName ||
                        medicine.name ||
                        "",

                    dosage:
                        medicine.dosage ||
                        "",

                    frequency:
                        medicine.frequency ||
                        "",

                    duration:
                        medicine.duration ||
                        "",

                    route:
                        medicine.route ||
                        "Oral",

                    instructions:
                        medicine.instructions ||
                        "",

                    quantity:
                        Number(
                            medicine.quantity || 0
                        )
                })
            ),

            status: "Pending",

            createdAt: timestamp,

            updatedAt: timestamp
        };

        data.prescriptions.push(
            prescriptionRecord
        );
    }


    /* =====================================================
       LAB ORDER
    ===================================================== */

    let labOrderRecord = null;

    if (labTests.length > 0) {

        labOrderRecord = {

            id: id(
                "LAB",
                data.labOrders
            ),

            hospitalId,

            consultationId,

            appointmentId,

            patientId,

            patientName,

            doctorId,

            doctorName,

            department,

            tests: labTests.map(
                (test, index) => ({
                    id: index + 1,

                    testId:
                        test.testId ||
                        null,

                    testName:
                        test.testName ||
                        test.name ||
                        "",

                    priority:
                        test.priority ||
                        "Routine"
                })
            ),

            status: "Pending",

            result: null,

            createdAt: timestamp,

            updatedAt: timestamp
        };

        data.labOrders.push(
            labOrderRecord
        );
    }


    /* =====================================================
       BILLING
    ===================================================== */

    const consultationFee =
        Number(body.consultationFee || 0);

    let billingRecord = null;

    if (consultationFee > 0) {

        billingRecord = {

            id: id(
                "CLB",
                data.billingItems
            ),

            hospitalId,

            consultationId,

            appointmentId,

            patientId,

            patientName,

            description:
                "OPD Consultation",

            amount:
                consultationFee,

            paidAmount: 0,

            dueAmount:
                consultationFee,

            status: "Pending",

            createdAt: timestamp,

            updatedAt: timestamp
        };

        data.billingItems.push(
            billingRecord
        );
    }


    /* =====================================================
       SAVE
    ===================================================== */

    writeData(data);


    res.json({

        success: true,

        message:
            "Clinical workflow saved successfully.",

        workflow: {

            consultation:
                consultationRecord,

            prescription:
                prescriptionRecord,

            labOrder:
                labOrderRecord,

            billing:
                billingRecord
        }
    });
});


/* =========================================================
   PATIENT WORKFLOW
========================================================= */

router.get("/patient/:patientId", (req, res) => {

    const hospitalId =
        req.query.hospitalId ||
        DEFAULT_HOSPITAL;

    const patientId =
        req.params.patientId;

    const data = readData();

    res.json({

        success: true,

        consultations:
            data.consultations.filter(
                x =>
                    x.hospitalId === hospitalId &&
                    x.patientId === patientId
            ),

        prescriptions:
            data.prescriptions.filter(
                x =>
                    x.hospitalId === hospitalId &&
                    x.patientId === patientId
            ),

        labOrders:
            data.labOrders.filter(
                x =>
                    x.hospitalId === hospitalId &&
                    x.patientId === patientId
            ),

        billingItems:
            data.billingItems.filter(
                x =>
                    x.hospitalId === hospitalId &&
                    x.patientId === patientId
            )
    });
});


/* =========================================================
   PHARMACY QUEUE
========================================================= */

router.get("/pharmacy/queue", (req, res) => {

    const hospitalId =
        req.query.hospitalId ||
        DEFAULT_HOSPITAL;

    const data = readData();

    const prescriptions =
        data.prescriptions.filter(
            x =>
                x.hospitalId === hospitalId &&
                x.status === "Pending"
        );

    res.json({
        success: true,
        count: prescriptions.length,
        prescriptions
    });
});


/* =========================================================
   LAB QUEUE
========================================================= */

router.get("/laboratory/queue", (req, res) => {

    const hospitalId =
        req.query.hospitalId ||
        DEFAULT_HOSPITAL;

    const data = readData();

    const orders =
        data.labOrders.filter(
            x =>
                x.hospitalId === hospitalId &&
                x.status === "Pending"
        );

    res.json({
        success: true,
        count: orders.length,
        labOrders: orders
    });
});


/* =========================================================
   BILLING QUEUE
========================================================= */

router.get("/billing/queue", (req, res) => {

    const hospitalId =
        req.query.hospitalId ||
        DEFAULT_HOSPITAL;

    const data = readData();

    const billing =
        data.billingItems.filter(
            x =>
                x.hospitalId === hospitalId &&
                x.status === "Pending"
        );

    res.json({
        success: true,
        count: billing.length,
        billing
    });
});


/* =========================================================
   UPDATE PRESCRIPTION STATUS
========================================================= */

router.patch(
    "/prescription/:id/status",
    (req, res) => {

        const data = readData();

        const item =
            data.prescriptions.find(
                x => x.id === req.params.id
            );

        if (!item) {
            return res.status(404).json({
                success: false,
                message:
                    "Prescription not found."
            });
        }

        item.status =
            req.body.status ||
            item.status;

        item.updatedAt = now();

        writeData(data);

        res.json({
            success: true,
            prescription: item
        });
    }
);


/* =========================================================
   UPDATE LAB STATUS
========================================================= */

router.patch(
    "/lab/:id/status",
    (req, res) => {

        const data = readData();

        const item =
            data.labOrders.find(
                x => x.id === req.params.id
            );

        if (!item) {
            return res.status(404).json({
                success: false,
                message:
                    "Lab order not found."
            });
        }

        item.status =
            req.body.status ||
            item.status;

        item.result =
            req.body.result ||
            item.result;

        item.updatedAt = now();

        writeData(data);

        res.json({
            success: true,
            labOrder: item
        });
    }
);


/* =========================================================
   UPDATE BILLING
========================================================= */

router.patch(
    "/billing/:id/payment",
    (req, res) => {

        const data = readData();

        const item =
            data.billingItems.find(
                x => x.id === req.params.id
            );

        if (!item) {
            return res.status(404).json({
                success: false,
                message:
                    "Billing item not found."
            });
        }

        const paid =
            Number(
                req.body.paidAmount || 0
            );

        item.paidAmount = paid;

        item.dueAmount =
            Math.max(
                0,
                Number(item.amount || 0) - paid
            );

        item.status =
            item.dueAmount === 0
                ? "Paid"
                : "Pending";

        item.updatedAt = now();

        writeData(data);

        res.json({
            success: true,
            billing: item
        });
    }
);


module.exports = router;