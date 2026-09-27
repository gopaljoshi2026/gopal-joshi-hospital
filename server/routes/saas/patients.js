const express = require("express");
const router = express.Router();

const {
    getPatients,
    getPatientById,
    getPatientByUHID,
    createPatient,
    updatePatient,
    removePatient,
    searchPatients,
    getPatientStats
} = require("../../models/patient");

const {
    getHospitalById
} = require("../../models/hospital");

const DEFAULT_HOSPITAL_ID = "HOSP-TEST-001";

/* =========================================================
   HELPERS
========================================================= */

function hospitalIdFromRequest(req) {
    return (
        req.query.hospitalId ||
        req.body?.hospitalId ||
        req.params.hospitalId ||
        DEFAULT_HOSPITAL_ID
    );
}

function sendError(res, status, message, extra = {}) {
    return res.status(status).json({
        success: false,
        message,
        ...extra
    });
}

function getHospital(req) {
    const hospitalId = hospitalIdFromRequest(req);

    try {
        return getHospitalById(hospitalId);
    } catch (error) {
        return null;
    }
}

/* =========================================================
   HEALTH
========================================================= */

router.get("/health", (req, res) => {
    res.json({
        success: true,
        module: "patients",
        status: "online",
        hospitalId: hospitalIdFromRequest(req),
        timestamp: new Date().toISOString()
    });
});

/* =========================================================
   STATS
   GET /api/saas/patients/stats?hospitalId=HOSP-TEST-001
========================================================= */

router.get("/stats", (req, res) => {
    try {
        const hospitalId = hospitalIdFromRequest(req);
        const hospital = getHospital(req);

        if (!hospital) {
            return sendError(res, 404, "Hospital not found");
        }

        const stats = getPatientStats(hospitalId);

        return res.json({
            success: true,
            hospital: {
                id: hospital.id,
                name: hospital.name,
                code: hospital.code
            },
            stats
        });
    } catch (error) {
        console.error("Patient stats error:", error);

        return sendError(
            res,
            500,
            "Unable to load patient statistics",
            { error: error.message }
        );
    }
});

/* =========================================================
   SEARCH
   GET /api/saas/patients/search
========================================================= */

router.get("/search", (req, res) => {
    try {
        const hospitalId = hospitalIdFromRequest(req);
        const hospital = getHospital(req);

        if (!hospital) {
            return sendError(res, 404, "Hospital not found");
        }

        const query = String(req.query.q || "").trim();

        if (!query) {
            return res.json({
                success: true,
                hospital: {
                    id: hospital.id,
                    name: hospital.name,
                    code: hospital.code
                },
                patients: []
            });
        }

        const patients = searchPatients(query, hospitalId);

        return res.json({
            success: true,
            hospital: {
                id: hospital.id,
                name: hospital.name,
                code: hospital.code
            },
            query,
            total: patients.length,
            patients
        });
    } catch (error) {
        console.error("Patient search error:", error);

        return sendError(
            res,
            500,
            "Unable to search patients",
            { error: error.message }
        );
    }
});

/* =========================================================
   GET BY UHID
   GET /api/saas/patients/uhid/GJH-26-00001
========================================================= */

router.get("/uhid/:uhid", (req, res) => {
    try {
        const hospitalId = hospitalIdFromRequest(req);
        const hospital = getHospital(req);

        if (!hospital) {
            return sendError(res, 404, "Hospital not found");
        }

        const patient = getPatientByUHID(
            req.params.uhid,
            hospitalId
        );

        if (!patient) {
            return sendError(res, 404, "Patient not found");
        }

        return res.json({
            success: true,
            hospital: {
                id: hospital.id,
                name: hospital.name,
                code: hospital.code
            },
            patient
        });
    } catch (error) {
        console.error("Get patient by UHID error:", error);

        return sendError(
            res,
            500,
            "Unable to load patient",
            { error: error.message }
        );
    }
});

/* =========================================================
   LIST PATIENTS
   GET /api/saas/patients
========================================================= */

router.get("/", (req, res) => {
    try {
        const hospitalId = hospitalIdFromRequest(req);
        const hospital = getHospital(req);

        if (!hospital) {
            return sendError(res, 404, "Hospital not found");
        }

        const page = Math.max(
            parseInt(req.query.page || "1", 10),
            1
        );

        const limit = Math.min(
            Math.max(
                parseInt(req.query.limit || "20", 10),
                1
            ),
            100
        );

        const search = String(req.query.search || "").trim();
        const status = String(req.query.status || "").trim();
        const gender = String(req.query.gender || "").trim();
        const bloodGroup = String(
            req.query.bloodGroup || ""
        ).trim();

        let patients = getPatients(hospitalId);

        /* Search */
        if (search) {
            const keyword = search.toLowerCase();

            patients = patients.filter((patient) => {
                return [
                    patient.id,
                    patient.uhid,
                    patient.name,
                    patient.firstName,
                    patient.lastName,
                    patient.phone,
                    patient.email
                ]
                    .filter(Boolean)
                    .some((value) =>
                        String(value)
                            .toLowerCase()
                            .includes(keyword)
                    );
            });
        }

        /* Status */
        if (status) {
            patients = patients.filter(
                (patient) =>
                    String(patient.status || "")
                        .toLowerCase() ===
                    status.toLowerCase()
            );
        }

        /* Gender */
        if (gender) {
            patients = patients.filter(
                (patient) =>
                    String(patient.gender || "")
                        .toLowerCase() ===
                    gender.toLowerCase()
            );
        }

        /* Blood Group */
        if (bloodGroup) {
            patients = patients.filter(
                (patient) =>
                    String(patient.bloodGroup || "")
                        .toLowerCase() ===
                    bloodGroup.toLowerCase()
            );
        }

        /* Newest first */
        patients.sort((a, b) => {
            return (
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
            );
        });

        const total = patients.length;
        const totalPages =
            total === 0 ? 0 : Math.ceil(total / limit);

        const startIndex = (page - 1) * limit;
        const paginatedPatients = patients.slice(
            startIndex,
            startIndex + limit
        );

        return res.json({
            success: true,

            hospital: {
                id: hospital.id,
                name: hospital.name,
                code: hospital.code
            },

            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            },

            filters: {
                search,
                status,
                gender,
                bloodGroup
            },

            patients: paginatedPatients
        });
    } catch (error) {
        console.error("Patient list error:", error);

        return sendError(
            res,
            500,
            "Unable to load patients",
            { error: error.message }
        );
    }
});

/* =========================================================
   GET SINGLE PATIENT
   IMPORTANT PROFILE API

   GET /api/saas/patients/PAT-00001?hospitalId=HOSP-TEST-001
========================================================= */

router.get("/:id", (req, res) => {
    try {
        const hospitalId = hospitalIdFromRequest(req);
        const hospital = getHospital(req);

        if (!hospital) {
            return sendError(res, 404, "Hospital not found");
        }

        const patientId = req.params.id;

        const patient = getPatientById(
            patientId,
            hospitalId
        );

        if (!patient) {
            return sendError(
                res,
                404,
                "Patient not found",
                {
                    patientId,
                    hospitalId
                }
            );
        }

        /*
         * IMPORTANT:
         * Frontend expects:
         *
         * data.patient
         *
         * इसलिए complete patient object yahi return hoga.
         */

        return res.json({
            success: true,

            hospital: {
                id: hospital.id,
                name: hospital.name,
                code: hospital.code
            },

            patient
        });
    } catch (error) {
        console.error("Get single patient error:", error);

        return sendError(
            res,
            500,
            "Unable to load patient profile",
            { error: error.message }
        );
    }
});

/* =========================================================
   CREATE PATIENT

   POST /api/saas/patients
========================================================= */

router.post("/", (req, res) => {
    try {
        const hospitalId = hospitalIdFromRequest(req);
        const hospital = getHospital(req);

        if (!hospital) {
            return sendError(res, 404, "Hospital not found");
        }

        const body = req.body || {};

        if (!body.name || !String(body.name).trim()) {
            return sendError(
                res,
                400,
                "Patient name is required"
            );
        }

        if (!body.phone || !String(body.phone).trim()) {
            return sendError(
                res,
                400,
                "Patient phone number is required"
            );
        }

        const patientData = {
            ...body,
            hospitalId
        };

        const patient = createPatient(patientData);

        return res.status(201).json({
            success: true,
            message: "Patient registered successfully",

            hospital: {
                id: hospital.id,
                name: hospital.name,
                code: hospital.code
            },

            patient
        });
    } catch (error) {
        console.error("Create patient error:", error);

        return sendError(
            res,
            400,
            error.message || "Unable to register patient"
        );
    }
});

/* =========================================================
   UPDATE PATIENT

   PATCH /api/saas/patients/PAT-00001
========================================================= */

router.patch("/:id", (req, res) => {
    try {
        const hospitalId = hospitalIdFromRequest(req);
        const hospital = getHospital(req);

        if (!hospital) {
            return sendError(res, 404, "Hospital not found");
        }

        const patientId = req.params.id;

        const existingPatient = getPatientById(
            patientId,
            hospitalId
        );

        if (!existingPatient) {
            return sendError(
                res,
                404,
                "Patient not found"
            );
        }

        const updatedPatient = updatePatient(
            patientId,
            req.body || {},
            hospitalId
        );

        return res.json({
            success: true,
            message: "Patient updated successfully",

            hospital: {
                id: hospital.id,
                name: hospital.name,
                code: hospital.code
            },

            patient: updatedPatient
        });
    } catch (error) {
        console.error("Update patient error:", error);

        return sendError(
            res,
            400,
            error.message || "Unable to update patient"
        );
    }
});

/* =========================================================
   ARCHIVE / DELETE PATIENT

   DELETE /api/saas/patients/PAT-00001
========================================================= */

router.delete("/:id", (req, res) => {
    try {
        const hospitalId = hospitalIdFromRequest(req);
        const hospital = getHospital(req);

        if (!hospital) {
            return sendError(res, 404, "Hospital not found");
        }

        const patientId = req.params.id;

        const existingPatient = getPatientById(
            patientId,
            hospitalId
        );

        if (!existingPatient) {
            return sendError(
                res,
                404,
                "Patient not found"
            );
        }

        const result = removePatient(
            patientId,
            hospitalId
        );

        return res.json({
            success: true,
            message: "Patient archived successfully",

            hospital: {
                id: hospital.id,
                name: hospital.name,
                code: hospital.code
            },

            patient: result
        });
    } catch (error) {
        console.error("Delete patient error:", error);

        return sendError(
            res,
            400,
            error.message || "Unable to archive patient"
        );
    }
});

/* =========================================================
   FINAL EXPORT
========================================================= */

module.exports = router;