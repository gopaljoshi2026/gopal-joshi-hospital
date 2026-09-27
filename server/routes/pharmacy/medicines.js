const express = require("express");
const router = express.Router();

const {
    getMedicines,
    getMedicineById,
    createMedicine,
    updateMedicine,
    stockIn,
    stockOut,
    getLowStockMedicines,
    getExpiringMedicines,
    getExpiredMedicines,
    searchMedicines,
    getPharmacySummary,
    createSale,
    getSales,
    getStockTransactions
} = require("../../models/medicine");


// =====================================================
// 1. GET ALL MEDICINES
// =====================================================
router.get("/", (req, res) => {
    try {
        const { hospitalId } = req.query;

        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "hospitalId is required"
            });
        }

        const medicines = getMedicines(hospitalId);

        res.json({
            success: true,
            count: medicines.length,
            medicines
        });

    } catch (error) {
        console.error("Get medicines error:", error);

        res.status(500).json({
            success: false,
            message: "Medicines load nahi ho paayi"
        });
    }
});


// =====================================================
// 2. SEARCH MEDICINES
// Example:
// /api/pharmacy/search?q=para&hospitalId=HOSP-TEST-001
// =====================================================
router.get("/search", (req, res) => {
    try {
        const {
            q,
            hospitalId
        } = req.query;

        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "hospitalId is required"
            });
        }

        if (!q || !q.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query q is required"
            });
        }

        const medicines = searchMedicines(
            hospitalId,
            q.trim()
        );

        res.json({
            success: true,
            count: medicines.length,
            query: q.trim(),
            medicines
        });

    } catch (error) {
        console.error("Medicine search error:", error);

        res.status(500).json({
            success: false,
            message: "Medicine search failed"
        });
    }
});


// =====================================================
// 3. PHARMACY SUMMARY
// =====================================================
router.get("/summary", (req, res) => {
    try {
        const { hospitalId } = req.query;

        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "hospitalId is required"
            });
        }

        const summary = getPharmacySummary(hospitalId);

        res.json({
            success: true,
            summary
        });

    } catch (error) {
        console.error("Pharmacy summary error:", error);

        res.status(500).json({
            success: false,
            message: "Pharmacy summary load nahi ho paaya"
        });
    }
});


// =====================================================
// 4. LOW STOCK ALERT
// =====================================================
router.get("/alerts/low-stock", (req, res) => {
    try {
        const { hospitalId } = req.query;

        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "hospitalId is required"
            });
        }

        const medicines = getLowStockMedicines(hospitalId);

        res.json({
            success: true,
            count: medicines.length,
            medicines
        });

    } catch (error) {
        console.error("Low stock error:", error);

        res.status(500).json({
            success: false,
            message: "Low stock medicines load nahi ho paayi"
        });
    }
});


// =====================================================
// 5. EXPIRING MEDICINES
// =====================================================
router.get("/alerts/expiry", (req, res) => {
    try {
        const {
            hospitalId,
            days
        } = req.query;

        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "hospitalId is required"
            });
        }

        const expiryDays = Number(days || 90);

        const medicines = getExpiringMedicines(
            hospitalId,
            expiryDays
        );

        res.json({
            success: true,
            days: expiryDays,
            count: medicines.length,
            medicines
        });

    } catch (error) {
        console.error("Expiry alert error:", error);

        res.status(500).json({
            success: false,
            message: "Expiry medicines load nahi ho paayi"
        });
    }
});


// =====================================================
// 6. EXPIRED MEDICINES
// =====================================================
router.get("/alerts/expired", (req, res) => {
    try {
        const { hospitalId } = req.query;

        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "hospitalId is required"
            });
        }

        const medicines = getExpiredMedicines(hospitalId);

        res.json({
            success: true,
            count: medicines.length,
            medicines
        });

    } catch (error) {
        console.error("Expired medicines error:", error);

        res.status(500).json({
            success: false,
            message: "Expired medicines load nahi ho paayi"
        });
    }
});


// =====================================================
// 7. STOCK TRANSACTIONS
// =====================================================
router.get("/transactions", (req, res) => {
    try {
        const { hospitalId } = req.query;

        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "hospitalId is required"
            });
        }

        const transactions = getStockTransactions(hospitalId);

        res.json({
            success: true,
            count: transactions.length,
            transactions
        });

    } catch (error) {
        console.error("Stock transactions error:", error);

        res.status(500).json({
            success: false,
            message: "Stock transactions load nahi ho paaye"
        });
    }
});


// =====================================================
// 8. SALES HISTORY
// =====================================================
router.get("/sales/history", (req, res) => {
    try {
        const { hospitalId } = req.query;

        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "hospitalId is required"
            });
        }

        const sales = getSales(hospitalId);

        res.json({
            success: true,
            count: sales.length,
            sales
        });

    } catch (error) {
        console.error("Sales history error:", error);

        res.status(500).json({
            success: false,
            message: "Sales history load nahi ho paayi"
        });
    }
});


// =====================================================
// 9. CREATE MEDICINE
// =====================================================
router.post("/", (req, res) => {
    try {
        const {
            hospitalId,
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
            location,
            status
        } = req.body;

        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "hospitalId is required"
            });
        }

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Medicine name is required"
            });
        }

        const medicine = createMedicine({
            hospitalId,
            name,
            genericName: genericName || "",
            category: category || "Other",
            manufacturer: manufacturer || "",
            batchNumber: batchNumber || "",
            expiryDate: expiryDate || "",
            purchasePrice: Number(purchasePrice || 0),
            sellingPrice: Number(sellingPrice || 0),
            stock: Number(stock || 0),
            minimumStock: Number(minimumStock || 10),
            supplier: supplier || "",
            location: location || "",
            status: status || "active"
        });

        res.status(201).json({
            success: true,
            message: "Medicine created successfully",
            medicine
        });

    } catch (error) {
        console.error("Create medicine error:", error);

        res.status(500).json({
            success: false,
            message: "Medicine create nahi ho paayi"
        });
    }
});


// =====================================================
// 10. CREATE SALE / DISPENSE MEDICINE
// =====================================================
router.post("/sales", (req, res) => {
    try {
        const {
            hospitalId,
            medicineId,
            quantity,
            patientId,
            patientName,
            prescriptionRef,
            performedBy
        } = req.body;

        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "hospitalId is required"
            });
        }

        if (!medicineId) {
            return res.status(400).json({
                success: false,
                message: "medicineId is required"
            });
        }

        if (!quantity || Number(quantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid quantity is required"
            });
        }

        const sale = createSale({
            hospitalId,
            medicineId,
            quantity: Number(quantity),
            patientId: patientId || "",
            patientName: patientName || "",
            prescriptionRef: prescriptionRef || "",
            performedBy: performedBy || "Pharmacy Staff"
        });

        res.status(201).json({
            success: true,
            message: "Medicine dispensed successfully",
            sale
        });

    } catch (error) {
        console.error("Create sale error:", error);

        res.status(400).json({
            success: false,
            message: error.message || "Medicine sale failed"
        });
    }
});


// =====================================================
// 11. GET SINGLE MEDICINE
// =====================================================
router.get("/:id", (req, res) => {
    try {
        const medicine = getMedicineById(req.params.id);

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found"
            });
        }

        res.json({
            success: true,
            medicine
        });

    } catch (error) {
        console.error("Get medicine error:", error);

        res.status(500).json({
            success: false,
            message: "Medicine load nahi ho paayi"
        });
    }
});


// =====================================================
// 12. UPDATE MEDICINE
// =====================================================
router.patch("/:id", (req, res) => {
    try {
        const medicine = updateMedicine(
            req.params.id,
            req.body
        );

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found"
            });
        }

        res.json({
            success: true,
            message: "Medicine updated successfully",
            medicine
        });

    } catch (error) {
        console.error("Update medicine error:", error);

        res.status(500).json({
            success: false,
            message: "Medicine update nahi ho paayi"
        });
    }
});


router.put("/:id", (req, res) => {
    try {
        const medicine = updateMedicine(
            req.params.id,
            req.body
        );

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found"
            });
        }

        res.json({
            success: true,
            message: "Medicine updated successfully",
            medicine
        });

    } catch (error) {
        console.error("Update medicine error:", error);

        res.status(500).json({
            success: false,
            message: "Medicine update nahi ho paayi"
        });
    }
});


// =====================================================
// 13. STOCK IN
// =====================================================
router.patch("/:id/stock-in", (req, res) => {
    try {
        const {
            quantity,
            reason,
            reference,
            performedBy
        } = req.body;

        if (!quantity || Number(quantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid quantity is required"
            });
        }

        const medicine = stockIn(
            req.params.id,
            Number(quantity),
            {
                reason: reason || "Stock received",
                reference: reference || "",
                performedBy: performedBy || "Pharmacy Staff"
            }
        );

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found"
            });
        }

        res.json({
            success: true,
            message: "Stock added successfully",
            medicine
        });

    } catch (error) {
        console.error("Stock in error:", error);

        res.status(400).json({
            success: false,
            message: error.message || "Stock in failed"
        });
    }
});


// =====================================================
// 14. STOCK OUT
// =====================================================
router.patch("/:id/stock-out", (req, res) => {
    try {
        const {
            quantity,
            reason,
            reference,
            performedBy
        } = req.body;

        if (!quantity || Number(quantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid quantity is required"
            });
        }

        const medicine = stockOut(
            req.params.id,
            Number(quantity),
            {
                reason: reason || "Stock issued",
                reference: reference || "",
                performedBy: performedBy || "Pharmacy Staff"
            }
        );

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found"
            });
        }

        res.json({
            success: true,
            message: "Stock removed successfully",
            medicine
        });

    } catch (error) {
        console.error("Stock out error:", error);

        res.status(400).json({
            success: false,
            message: error.message || "Stock out failed"
        });
    }
});


module.exports = router;