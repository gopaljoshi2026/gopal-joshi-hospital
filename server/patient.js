const express = require("express");

const router = express.Router();

const {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient
} = require("../data/patients");


// CREATE PATIENT

router.post("/", (req, res) => {

    const {
        name,
        email,
        phone,
        age,
        gender,
        address,
        bloodGroup,
        condition,
        doctor
    } = req.body;

    if (!name || !phone) {

        return res.status(400).json({
            success: false,
            message: "Patient name and phone are required"
        });

    }

    const patient = createPatient({
        name,
        email,
        phone,
        age,
        gender,
        address,
        bloodGroup,
        condition,
        doctor
    });

    res.status(201).json({
        success: true,
        message: "Patient registered successfully",
        patient
    });

});


// GET PATIENTS

router.get("/", (req, res) => {

    res.json({
        success: true,
        patients: getPatients()
    });

});


// GET SINGLE PATIENT

router.get("/:id", (req, res) => {

    const patient =
        getPatientById(req.params.id);

    if (!patient) {

        return res.status(404).json({
            success: false,
            message: "Patient not found"
        });

    }

    res.json({
        success: true,
        patient
    });

});


// UPDATE PATIENT

router.patch("/:id", (req, res) => {

    const patient =
        updatePatient(
            req.params.id,
            req.body
        );

    if (!patient) {

        return res.status(404).json({
            success: false,
            message: "Patient not found"
        });

    }

    res.json({
        success: true,
        message: "Patient updated successfully",
        patient
    });

});

module.exports = router;