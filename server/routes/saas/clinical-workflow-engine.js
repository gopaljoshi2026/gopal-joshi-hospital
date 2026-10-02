const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const DATA_FILE = path.join(
    __dirname,
    "../../data/clinical-workflow.json"
);

function ensureDB() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify({
                visits: [],
                consultations: [],
                prescriptions: [],
                labOrders: [],
                labResults: [],
                pharmacyOrders: [],
                billingLinks: [],
                timeline: [],
                audit: []
            }, null, 2)
        );
    }
}

function readDB() {
    ensureDB();

    try {
        return JSON.parse(
            fs.readFileSync(DATA_FILE, "utf8")
        );
    } catch {
        return {
            visits: [],
            consultations: [],
            prescriptions: [],
            labOrders: [],
            labResults: [],
            pharmacyOrders: [],
            billingLinks: [],
            timeline: [],
            audit: []
        };
    }
}

function saveDB(db) {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(db, null, 2)
    );
}

function id(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function addTimeline(db, visitId, event, data = {}) {

    db.timeline.push({
        id: id("EVT"),
        visitId,
        event,
        data,
        timestamp: new Date().toISOString()
    });
}

function addAudit(db, action, visitId, data = {}) {

    db.audit.push({
        id: id("AUD"),
        action,
        visitId,
        data,
        timestamp: new Date().toISOString()
    });
}

/*
==============================================================
CREATE VISIT
Patient -> Appointment -> Clinical Visit
==============================================================
*/

router.post("/visits", (req, res) => {

    const db = readDB();

    const {
        hospitalId = "HOSP-TEST-001",
        patientId,
        appointmentId = null,
        doctorId = null,
        department = "General",
        reason = ""
    } = req.body;

    if (!patientId) {
        return res.status(400).json({
            success: false,
            message: "patientId is required"
        });
    }

    const visit = {
        id: id("VIS"),
        hospitalId,
        patientId,
        appointmentId,
        doctorId,
        department,
        reason,
        status: "WAITING_FOR_CONSULTATION",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    db.visits.push(visit);

    addTimeline(
        db,
        visit.id,
        "VISIT_CREATED",
        { patientId, appointmentId }
    );

    addAudit(
        db,
        "CREATE_VISIT",
        visit.id,
        { patientId }
    );

    saveDB(db);

    res.status(201).json({
        success: true,
        visit
    });
});

/*
==============================================================
GET VISIT
==============================================================
*/

router.get("/visits/:id", (req, res) => {

    const db = readDB();

    const visit = db.visits.find(
        x => x.id === req.params.id
    );

    if (!visit) {
        return res.status(404).json({
            success: false,
            message: "Visit not found"
        });
    }

    res.json({
        success: true,
        visit,
        timeline: db.timeline.filter(
            x => x.visitId === visit.id
        ),
        consultation: db.consultations.find(
            x => x.visitId === visit.id
        ) || null,
        prescriptions: db.prescriptions.filter(
            x => x.visitId === visit.id
        ),
        labOrders: db.labOrders.filter(
            x => x.visitId === visit.id
        ),
        labResults: db.labResults.filter(
            x => x.visitId === visit.id
        ),
        pharmacyOrders: db.pharmacyOrders.filter(
            x => x.visitId === visit.id
        ),
        billing: db.billingLinks.filter(
            x => x.visitId === visit.id
        )
    });
});

/*
==============================================================
CONSULTATION
==============================================================
*/

router.post("/visits/:id/consultation", (req, res) => {

    const db = readDB();

    const visit = db.visits.find(
        x => x.id === req.params.id
    );

    if (!visit) {
        return res.status(404).json({
            success: false,
            message: "Visit not found"
        });
    }

    const {
        doctorId = visit.doctorId,
        symptoms = "",
        diagnosis = "",
        notes = ""
    } = req.body;

    const consultation = {
        id: id("CON"),
        visitId: visit.id,
        patientId: visit.patientId,
        doctorId,
        symptoms,
        diagnosis,
        notes,
        status: "COMPLETED",
        createdAt: new Date().toISOString()
    };

    db.consultations.push(consultation);

    visit.status = "CONSULTATION_COMPLETED";
    visit.updatedAt = new Date().toISOString();

    addTimeline(
        db,
        visit.id,
        "CONSULTATION_COMPLETED",
        {
            consultationId: consultation.id,
            diagnosis
        }
    );

    addAudit(
        db,
        "CONSULTATION_COMPLETED",
        visit.id,
        { consultationId: consultation.id }
    );

    saveDB(db);

    res.status(201).json({
        success: true,
        consultation
    });
});

/*
==============================================================
PRESCRIPTION
==============================================================
*/

router.post("/visits/:id/prescriptions", (req, res) => {

    const db = readDB();

    const visit = db.visits.find(
        x => x.id === req.params.id
    );

    if (!visit) {
        return res.status(404).json({
            success: false,
            message: "Visit not found"
        });
    }

    const medicines = Array.isArray(req.body.medicines)
        ? req.body.medicines
        : [];

    if (!medicines.length) {
        return res.status(400).json({
            success: false,
            message: "At least one medicine is required"
        });
    }

    const prescription = {
        id: id("RX"),
        visitId: visit.id,
        patientId: visit.patientId,
        doctorId: req.body.doctorId || visit.doctorId,
        medicines,
        instructions: req.body.instructions || "",
        status: "ACTIVE",
        createdAt: new Date().toISOString()
    };

    db.prescriptions.push(prescription);

    visit.status = "PRESCRIPTION_CREATED";
    visit.updatedAt = new Date().toISOString();

    addTimeline(
        db,
        visit.id,
        "PRESCRIPTION_CREATED",
        { prescriptionId: prescription.id }
    );

    addAudit(
        db,
        "PRESCRIPTION_CREATED",
        visit.id,
        { prescriptionId: prescription.id }
    );

    saveDB(db);

    res.status(201).json({
        success: true,
        prescription
    });
});

/*
==============================================================
LAB ORDER
==============================================================
*/

router.post("/visits/:id/lab-orders", (req, res) => {

    const db = readDB();

    const visit = db.visits.find(
        x => x.id === req.params.id
    );

    if (!visit) {
        return res.status(404).json({
            success: false,
            message: "Visit not found"
        });
    }

    const tests = Array.isArray(req.body.tests)
        ? req.body.tests
        : [];

    if (!tests.length) {
        return res.status(400).json({
            success: false,
            message: "At least one lab test is required"
        });
    }

    const order = {
        id: id("LAB"),
        visitId: visit.id,
        patientId: visit.patientId,
        doctorId: req.body.doctorId || visit.doctorId,
        tests,
        status: "ORDERED",
        createdAt: new Date().toISOString()
    };

    db.labOrders.push(order);

    visit.status = "LAB_ORDERED";
    visit.updatedAt = new Date().toISOString();

    addTimeline(
        db,
        visit.id,
        "LAB_ORDERED",
        { labOrderId: order.id }
    );

    addAudit(
        db,
        "LAB_ORDERED",
        visit.id,
        { labOrderId: order.id }
    );

    saveDB(db);

    res.status(201).json({
        success: true,
        labOrder: order
    });
});

/*
==============================================================
LAB RESULT
==============================================================
*/

router.post("/lab-orders/:id/results", (req, res) => {

    const db = readDB();

    const order = db.labOrders.find(
        x => x.id === req.params.id
    );

    if (!order) {
        return res.status(404).json({
            success: false,
            message: "Lab order not found"
        });
    }

    const result = {
        id: id("RES"),
        labOrderId: order.id,
        visitId: order.visitId,
        patientId: order.patientId,
        results: req.body.results || [],
        remarks: req.body.remarks || "",
        status: "COMPLETED",
        createdAt: new Date().toISOString()
    };

    db.labResults.push(result);

    order.status = "COMPLETED";

    const visit = db.visits.find(
        x => x.id === order.visitId
    );

    if (visit) {
        visit.status = "LAB_COMPLETED";
        visit.updatedAt = new Date().toISOString();
    }

    addTimeline(
        db,
        order.visitId,
        "LAB_COMPLETED",
        { resultId: result.id }
    );

    addAudit(
        db,
        "LAB_RESULT_COMPLETED",
        order.visitId,
        { resultId: result.id }
    );

    saveDB(db);

    res.status(201).json({
        success: true,
        result
    });
});

/*
==============================================================
PHARMACY ORDER
==============================================================
*/

router.post("/visits/:id/pharmacy-orders", (req, res) => {

    const db = readDB();

    const visit = db.visits.find(
        x => x.id === req.params.id
    );

    if (!visit) {
        return res.status(404).json({
            success: false,
            message: "Visit not found"
        });
    }

    const medicines = Array.isArray(req.body.medicines)
        ? req.body.medicines
        : [];

    if (!medicines.length) {
        return res.status(400).json({
            success: false,
            message: "At least one medicine is required"
        });
    }

    const order = {
        id: id("PHR"),
        visitId: visit.id,
        patientId: visit.patientId,
        medicines,
        status: "PENDING",
        createdAt: new Date().toISOString()
    };

    db.pharmacyOrders.push(order);

    addTimeline(
        db,
        visit.id,
        "PHARMACY_ORDER_CREATED",
        { pharmacyOrderId: order.id }
    );

    addAudit(
        db,
        "PHARMACY_ORDER_CREATED",
        visit.id,
        { pharmacyOrderId: order.id }
    );

    saveDB(db);

    res.status(201).json({
        success: true,
        pharmacyOrder: order
    });
});

/*
==============================================================
BILLING LINK
==============================================================
*/

router.post("/visits/:id/billing", (req, res) => {

    const db = readDB();

    const visit = db.visits.find(
        x => x.id === req.params.id
    );

    if (!visit) {
        return res.status(404).json({
            success: false,
            message: "Visit not found"
        });
    }

    const billing = {
        id: id("BILL"),
        visitId: visit.id,
        patientId: visit.patientId,
        items: req.body.items || [],
        total: Number(req.body.total || 0),
        paymentStatus: req.body.paymentStatus || "PENDING",
        createdAt: new Date().toISOString()
    };

    db.billingLinks.push(billing);

    visit.status = "BILLING_CREATED";
    visit.updatedAt = new Date().toISOString();

    addTimeline(
        db,
        visit.id,
        "BILLING_CREATED",
        { billingId: billing.id }
    );

    addAudit(
        db,
        "BILLING_CREATED",
        visit.id,
        { billingId: billing.id }
    );

    saveDB(db);

    res.status(201).json({
        success: true,
        billing
    });
});

/*
==============================================================
COMPLETE VISIT
==============================================================
*/

router.post("/visits/:id/complete", (req, res) => {

    const db = readDB();

    const visit = db.visits.find(
        x => x.id === req.params.id
    );

    if (!visit) {
        return res.status(404).json({
            success: false,
            message: "Visit not found"
        });
    }

    visit.status = "COMPLETED";
    visit.completedAt = new Date().toISOString();
    visit.updatedAt = new Date().toISOString();

    addTimeline(
        db,
        visit.id,
        "VISIT_COMPLETED"
    );

    addAudit(
        db,
        "VISIT_COMPLETED",
        visit.id
    );

    saveDB(db);

    res.json({
        success: true,
        message: "Hospital visit completed",
        visit
    });
});

/*
==============================================================
WORKFLOW DASHBOARD
==============================================================
*/

router.get("/dashboard", (req, res) => {

    const db = readDB();

    res.json({
        success: true,

        counts: {
            visits: db.visits.length,
            consultations: db.consultations.length,
            prescriptions: db.prescriptions.length,
            labOrders: db.labOrders.length,
            labResults: db.labResults.length,
            pharmacyOrders: db.pharmacyOrders.length,
            billingLinks: db.billingLinks.length,
            timelineEvents: db.timeline.length,
            auditEvents: db.audit.length
        },

        recentVisits: db.visits.slice(-10).reverse(),

        recentEvents: db.timeline
            .slice(-20)
            .reverse()
    });
});

module.exports = router;
