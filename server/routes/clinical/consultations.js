const express = require("express");
const router = express.Router();


// ==========================================
// LABORATORY SERVICE
// ==========================================

const {
    createLabRequest
} = require("../laboratory/tests");


// ==========================================
// CONSULTATIONS STORAGE
// ==========================================

const consultations = [];


// ==========================================
// CREATE CONSULTATION
// ==========================================

router.post("/", (req, res) => {

    const {
        hospitalId,
        appointmentId,
        patientId,
        patientName,
        doctorId,
        doctorName,
        symptoms,
        diagnosis,
        notes,
        prescription,
        labTests
    } = req.body;


    // ======================================
    // VALIDATION
    // ======================================

    if (
        !hospitalId ||
        !appointmentId ||
        !patientId ||
        !patientName ||
        !doctorId ||
        !doctorName
    ) {

        return res.status(400).json({
            success: false,
            message: "Required consultation fields are missing"
        });

    }


    // ======================================
    // NORMALIZE PRESCRIPTION
    // ======================================

    const normalizedPrescription =
        Array.isArray(prescription)
            ? prescription
            : [];


    // ======================================
    // CREATE CONSULTATION
    // ======================================

    const consultation = {

        id: `CON-${Date.now()}-${consultations.length + 1}`,

        hospitalId,

        appointmentId,

        patientId,
        patientName,

        doctorId,
        doctorName,

        symptoms: symptoms || "",

        diagnosis: diagnosis || "",

        notes: notes || "",

        prescription: normalizedPrescription,

        labTests: Array.isArray(labTests)
            ? labTests
            : [],

        status: "completed",

        createdAt: new Date().toISOString()

    };


    consultations.push(consultation);


    // ======================================
    // AUTOMATIC LAB REQUESTS
    // ======================================

    const createdLabRequests = [];


    if (
        Array.isArray(labTests) &&
        labTests.length > 0
    ) {

        labTests.forEach(test => {

            let testName = "";
            let priority = "normal";


            if (typeof test === "string") {

                testName = test;

            }


            else if (
                typeof test === "object" &&
                test !== null
            ) {

                testName =
                    test.name ||
                    test.testName ||
                    "";

                priority =
                    test.priority ||
                    "normal";

            }


            if (testName) {

                const labRequest =
                    createLabRequest({

                        hospitalId,

                        appointmentId,

                        patientId,

                        patientName,

                        doctorId,

                        doctorName,

                        testName,

                        priority

                    });


                if (labRequest) {

                    createdLabRequests.push(
                        labRequest
                    );

                }

            }

        });

    }


    // ======================================
    // RESPONSE
    // ======================================

    res.status(201).json({

        success: true,

        message:
            createdLabRequests.length > 0
                ? "Consultation completed and lab tests requested automatically"
                : "Consultation completed successfully",

        consultation,

        labRequests:
            createdLabRequests,

        labRequestCount:
            createdLabRequests.length

    });

});


// ==========================================
// GET PRESCRIPTIONS FOR PHARMACY
// IMPORTANT: KEEP BEFORE /patient/:id
// ==========================================

router.get(
    "/prescriptions",
    (req, res) => {

        const {
            hospitalId
        } = req.query;


        // ======================================
        // HOSPITAL VALIDATION
        // ======================================

        if (!hospitalId) {

            return res.status(400).json({

                success: false,

                message:
                    "hospitalId is required"

            });

        }


        // ======================================
        // FIND CONSULTATIONS
        // HAVING PRESCRIPTIONS
        // ======================================

        const prescriptions =
            consultations
                .filter(
                    consultation =>
                        consultation.hospitalId ===
                        hospitalId
                )
                .filter(
                    consultation =>
                        Array.isArray(
                            consultation.prescription
                        ) &&
                        consultation.prescription.length > 0
                )
                .map(
                    consultation => ({

                        consultationId:
                            consultation.id,

                        appointmentId:
                            consultation.appointmentId,

                        hospitalId:
                            consultation.hospitalId,

                        patientId:
                            consultation.patientId,

                        patientName:
                            consultation.patientName,

                        doctorId:
                            consultation.doctorId,

                        doctorName:
                            consultation.doctorName,

                        diagnosis:
                            consultation.diagnosis,

                        prescription:
                            consultation.prescription,

                        createdAt:
                            consultation.createdAt

                    })
                )
                .sort(
                    (a, b) =>
                        new Date(b.createdAt) -
                        new Date(a.createdAt)
                );


        // ======================================
        // RESPONSE
        // ======================================

        res.json({

            success: true,

            count:
                prescriptions.length,

            prescriptions

        });

    }
);


// ==========================================
// GET CONSULTATION BY APPOINTMENT
// ==========================================

router.get(
    "/appointment/:appointmentId",
    (req, res) => {

        const consultation =
            consultations.find(
                item =>
                    item.appointmentId ===
                    req.params.appointmentId
            );


        if (!consultation) {

            return res.status(404).json({

                success: false,

                message:
                    "Consultation not found"

            });

        }


        res.json({

            success: true,

            consultation

        });

    }
);


// ==========================================
// GET PATIENT CONSULTATIONS
// ==========================================

router.get(
    "/patient/:patientId",
    (req, res) => {

        const patientConsultations =
            consultations.filter(
                item =>
                    item.patientId ===
                    req.params.patientId
            );


        res.json({

            success: true,

            consultations:
                patientConsultations

        });

    }
);


// ==========================================
// EXPORT
// ==========================================

module.exports = router;