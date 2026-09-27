const express = require("express");
const router = express.Router();

const {
    createBill,
    getBillsByHospital,
    getBillById,
    updateBill
} = require("../../models/bill");


// ===============================
// CREATE BILL
// POST /api/billing
// ===============================

router.post("/", (req, res) => {

    try {

        const {
            hospitalId,
            patientId,
            patientName,
            items,
            subtotal,
            discount,
            tax,
            total,
            paymentMethod,
            paymentStatus,
            createdBy,
            prescriptionRef
        } = req.body;

        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "hospitalId is required"
            });
        }

        if (!patientName) {
            return res.status(400).json({
                success: false,
                message: "patientName is required"
            });
        }

        const bill = createBill({
            hospitalId,
            patientId: patientId || "",
            patientName,
            items: Array.isArray(items) ? items : [],
            subtotal: Number(subtotal) || 0,
            discount: Number(discount) || 0,
            tax: Number(tax) || 0,
            total: Number(total) || 0,
            paymentMethod: paymentMethod || "cash",
            paymentStatus: paymentStatus || "pending",
            createdBy: createdBy || "Pharmacy Staff",
            prescriptionRef: prescriptionRef || ""
        });

        res.status(201).json({
            success: true,
            message: "Bill created successfully",
            bill
        });

    } catch (error) {

        console.error("Create Bill Error:", error);

        res.status(500).json({
            success: false,
            message: "Bill creation failed"
        });

    }

});


// ===============================
// GET ALL BILLS
// GET /api/billing?hospitalId=...
// ===============================

router.get("/", (req, res) => {

    try {

        const { hospitalId } = req.query;

        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "hospitalId is required"
            });
        }

        const bills = getBillsByHospital(hospitalId);

        res.json({
            success: true,
            count: bills.length,
            bills
        });

    } catch (error) {

        console.error("Get Bills Error:", error);

        res.status(500).json({
            success: false,
            message: "Bills load failed"
        });

    }

});


// ===============================
// GET SINGLE BILL
// GET /api/billing/:id
// ===============================

router.get("/:id", (req, res) => {

    try {

        const bill = getBillById(req.params.id);

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: "Bill not found"
            });
        }

        res.json({
            success: true,
            bill
        });

    } catch (error) {

        console.error("Get Bill Error:", error);

        res.status(500).json({
            success: false,
            message: "Bill load failed"
        });

    }

});


// ===============================
// UPDATE BILL
// PATCH /api/billing/:id
// ===============================

router.patch("/:id", (req, res) => {

    try {

        const bill = updateBill(
            req.params.id,
            req.body
        );

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: "Bill not found"
            });
        }

        res.json({
            success: true,
            message: "Bill updated successfully",
            bill
        });

    } catch (error) {

        console.error("Update Bill Error:", error);

        res.status(500).json({
            success: false,
            message: "Bill update failed"
        });

    }

});


module.exports = router;