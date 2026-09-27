const express = require("express");
const router = express.Router();

const labRequests = [];

// ==========================================
// CREATE LAB TEST REQUEST
// ==========================================

function createLabRequest(data) {

    const {
        hospitalId,
        appointmentId,
        patientId,
        patientName,
        doctorId,
        doctorName,
        testName,
        priority
    } = data;

    if (
        !hospitalId ||
        !appointmentId ||
        !patientId ||
        !patientName ||
        !doctorId ||
        !doctorName ||
        !testName
    ) {
        return null;
    }

    const request = {
        id: `LAB-${Date.now()}-${labRequests.length + 1}`,

        hospitalId,
        appointmentId,

        patientId,
        patientName,

        doctorId,
        doctorName,

        testName,

        priority: priority || "normal",

        status: "requested",

        sample: {
            collected: false,
            collectedAt: null
        },

        report: {
            result: "",
            remarks: "",
            reportedBy: "",
            reportedAt: null
        },

        createdAt: new Date().toISOString()
    };

    labRequests.push(request);

    return request;
}


// ==========================================
// CREATE LAB TEST REQUEST - API
// ==========================================

router.post("/request", (req, res) => {

    const request = createLabRequest(req.body);

    if (!request) {
        return res.status(400).json({
            success: false,
            message: "Required lab request fields are missing"
        });
    }

    res.status(201).json({
        success: true,
        message: "Lab test requested successfully",
        labRequest: request
    });
});


// ==========================================
// GET ALL LAB REQUESTS
// ==========================================

router.get("/", (req, res) => {

    res.json({
        success: true,
        count: labRequests.length,
        labRequests
    });

});


// ==========================================
// GET LAB REQUEST BY ID
// ==========================================

router.get("/:id", (req, res) => {

    const request = labRequests.find(
        item => item.id === req.params.id
    );

    if (!request) {
        return res.status(404).json({
            success: false,
            message: "Lab request not found"
        });
    }

    res.json({
        success: true,
        labRequest: request
    });

});


// ==========================================
// SAMPLE COLLECTION
// ==========================================

router.patch("/:id/sample", (req, res) => {

    const request = labRequests.find(
        item => item.id === req.params.id
    );

    if (!request) {
        return res.status(404).json({
            success: false,
            message: "Lab request not found"
        });
    }

    request.sample = {
        collected: true,
        collectedAt: new Date().toISOString()
    };

    request.status = "sample_collected";

    res.json({
        success: true,
        message: "Sample collected successfully",
        labRequest: request
    });

});


// ==========================================
// START PROCESSING
// ==========================================

router.patch("/:id/process", (req, res) => {

    const request = labRequests.find(
        item => item.id === req.params.id
    );

    if (!request) {
        return res.status(404).json({
            success: false,
            message: "Lab request not found"
        });
    }

    if (!request.sample.collected) {
        return res.status(400).json({
            success: false,
            message: "Sample must be collected before processing"
        });
    }

    request.status = "processing";

    res.json({
        success: true,
        message: "Lab test processing started",
        labRequest: request
    });

});


// ==========================================
// COMPLETE LAB REPORT
// ==========================================

router.patch("/:id/report", (req, res) => {

    const request = labRequests.find(
        item => item.id === req.params.id
    );

    if (!request) {
        return res.status(404).json({
            success: false,
            message: "Lab request not found"
        });
    }

    const {
        result,
        remarks,
        reportedBy
    } = req.body;

    if (!result) {
        return res.status(400).json({
            success: false,
            message: "Report result is required"
        });
    }

    request.report = {
        result,
        remarks: remarks || "",
        reportedBy: reportedBy || "",
        reportedAt: new Date().toISOString()
    };

    request.status = "completed";

    res.json({
        success: true,
        message: "Lab report completed successfully",
        labRequest: request
    });

});


// ==========================================
// GET PATIENT LAB REPORTS
// ==========================================

router.get("/patient/:patientId/reports", (req, res) => {

    const reports = labRequests.filter(
        item =>
            item.patientId === req.params.patientId &&
            item.status === "completed"
    );

    res.json({
        success: true,
        count: reports.length,
        reports
    });

});


// ==========================================
// EXPORT
// ==========================================

module.exports = router;

module.exports.createLabRequest = createLabRequest;