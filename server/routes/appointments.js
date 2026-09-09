const express = require("express");

const router = express.Router();

const {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment
} = require("../data/appointments");


// CREATE APPOINTMENT

router.post("/", (req, res) => {

    try {

        const {
            patientId,
            patientName,
            email,
            phone,
            doctor,
            date,
            time,
            reason
        } = req.body;

        if (
            !patientName ||
            !phone ||
            !doctor ||
            !date ||
            !time
        ) {

            return res.status(400).json({
                success: false,
                message: "Required appointment fields are missing"
            });

        }

        const appointment = createAppointment({
            patientId,
            patientName,
            email,
            phone,
            doctor,
            date,
            time,
            reason
        });

        res.status(201).json({
            success: true,
            message: "Appointment created successfully",
            appointment
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Unable to create appointment"
        });

    }

});


// GET ALL APPOINTMENTS

router.get("/", (req, res) => {

    res.json({
        success: true,
        appointments: getAppointments()
    });

});


// GET ONE APPOINTMENT

router.get("/:id", (req, res) => {

    const appointment =
        getAppointmentById(req.params.id);

    if (!appointment) {

        return res.status(404).json({
            success: false,
            message: "Appointment not found"
        });

    }

    res.json({
        success: true,
        appointment
    });

});


// UPDATE APPOINTMENT

router.patch("/:id", (req, res) => {

    const appointment =
        updateAppointment(
            req.params.id,
            req.body
        );

    if (!appointment) {

        return res.status(404).json({
            success: false,
            message: "Appointment not found"
        });

    }

    res.json({
        success: true,
        message: "Appointment updated successfully",
        appointment
    });

});


// DELETE APPOINTMENT

router.delete("/:id", (req, res) => {

    const deleted =
        deleteAppointment(req.params.id);

    if (!deleted) {

        return res.status(404).json({
            success: false,
            message: "Appointment not found"
        });

    }

    res.json({
        success: true,
        message: "Appointment deleted successfully"
    });

});

module.exports = router;