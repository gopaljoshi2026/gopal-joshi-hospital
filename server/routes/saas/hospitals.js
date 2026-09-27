const express = require("express");

const router = express.Router();

const {
    getHospitals,
    getActiveHospitals,
    getHospitalById,
    getHospitalByCode,
    createHospital,
    updateHospital,
    activateHospital,
    suspendHospital,
    archiveHospital,
    hasHospitalAccess,
    hasFeature,
    getSubscription,
    getHospitalStats
} = require("../../models/hospital");

// =====================================================
// GET ALL HOSPITALS
// =====================================================

router.get("/", (req, res) => {

    try {

        const hospitals =
            getHospitals({
                status:
                    req.query.status ||
                    undefined
            });

        res.json({
            success: true,
            count: hospitals.length,
            hospitals
        });

    } catch (error) {

        console.error(
            "Get hospitals error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Hospitals load nahi ho paaye"
        });
    }
});

// =====================================================
// GET ACTIVE HOSPITALS
// =====================================================

router.get("/active", (req, res) => {

    try {

        const hospitals =
            getActiveHospitals();

        res.json({
            success: true,
            count: hospitals.length,
            hospitals
        });

    } catch (error) {

        console.error(
            "Get active hospitals error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Active hospitals load nahi ho paaye"
        });
    }
});

// =====================================================
// GET HOSPITAL BY CODE
// =====================================================

router.get("/code/:code", (req, res) => {

    try {

        const hospital =
            getHospitalByCode(
                req.params.code
            );

        if (!hospital) {

            return res.status(404).json({
                success: false,
                message:
                    "Hospital nahi mila"
            });
        }

        res.json({
            success: true,
            hospital
        });

    } catch (error) {

        console.error(
            "Get hospital by code error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Hospital load nahi ho paaya"
        });
    }
});

// =====================================================
// GET HOSPITAL BY ID
// =====================================================

router.get("/:id", (req, res) => {

    try {

        const hospital =
            getHospitalById(
                req.params.id
            );

        if (!hospital) {

            return res.status(404).json({
                success: false,
                message:
                    "Hospital nahi mila"
            });
        }

        res.json({
            success: true,
            hospital
        });

    } catch (error) {

        console.error(
            "Get hospital error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Hospital load nahi ho paaya"
        });
    }
});

// =====================================================
// CREATE HOSPITAL
// =====================================================

router.post("/", (req, res) => {

    try {

        const hospital =
            createHospital(
                req.body || {}
            );

        res.status(201).json({
            success: true,
            message:
                "Hospital successfully create ho gaya",
            hospital
        });

    } catch (error) {

        console.error(
            "Create hospital error:",
            error
        );

        res.status(400).json({
            success: false,
            message:
                error.message ||
                "Hospital create nahi ho paaya"
        });
    }
});

// =====================================================
// UPDATE HOSPITAL
// =====================================================

router.patch("/:id", (req, res) => {

    try {

        const hospital =
            updateHospital(
                req.params.id,
                req.body || {}
            );

        if (!hospital) {

            return res.status(404).json({
                success: false,
                message:
                    "Hospital nahi mila"
            });
        }

        res.json({
            success: true,
            message:
                "Hospital successfully update ho gaya",
            hospital
        });

    } catch (error) {

        console.error(
            "Update hospital error:",
            error
        );

        res.status(400).json({
            success: false,
            message:
                error.message ||
                "Hospital update nahi ho paaya"
        });
    }
});

// =====================================================
// ACTIVATE HOSPITAL
// =====================================================

router.patch("/:id/activate", (req, res) => {

    try {

        const hospital =
            activateHospital(
                req.params.id
            );

        if (!hospital) {

            return res.status(404).json({
                success: false,
                message:
                    "Hospital nahi mila"
            });
        }

        res.json({
            success: true,
            message:
                "Hospital activate ho gaya",
            hospital
        });

    } catch (error) {

        console.error(
            "Activate hospital error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Hospital activate nahi ho paaya"
        });
    }
});

// =====================================================
// SUSPEND HOSPITAL
// =====================================================

router.patch("/:id/suspend", (req, res) => {

    try {

        const reason =
            req.body?.reason ||
            "Suspended by administrator";

        const hospital =
            suspendHospital(
                req.params.id,
                reason
            );

        if (!hospital) {

            return res.status(404).json({
                success: false,
                message:
                    "Hospital nahi mila"
            });
        }

        res.json({
            success: true,
            message:
                "Hospital suspend ho gaya",
            hospital
        });

    } catch (error) {

        console.error(
            "Suspend hospital error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Hospital suspend nahi ho paaya"
        });
    }
});

// =====================================================
// ARCHIVE HOSPITAL
// =====================================================

router.patch("/:id/archive", (req, res) => {

    try {

        const hospital =
            archiveHospital(
                req.params.id
            );

        if (!hospital) {

            return res.status(404).json({
                success: false,
                message:
                    "Hospital nahi mila"
            });
        }

        res.json({
            success: true,
            message:
                "Hospital archive ho gaya",
            hospital
        });

    } catch (error) {

        console.error(
            "Archive hospital error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Hospital archive nahi ho paaya"
        });
    }
});

// =====================================================
// CHECK HOSPITAL ACCESS
// =====================================================

router.get("/:id/access", (req, res) => {

    try {

        const allowed =
            hasHospitalAccess(
                req.params.id
            );

        res.json({
            success: true,
            hospitalId:
                req.params.id,
            accessAllowed:
                allowed
        });

    } catch (error) {

        console.error(
            "Hospital access error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Hospital access check nahi ho paaya"
        });
    }
});

// =====================================================
// CHECK FEATURE
// =====================================================

router.get(
    "/:id/features/:feature",
    (req, res) => {

        try {

            const enabled =
                hasFeature(
                    req.params.id,
                    req.params.feature
                );

            res.json({
                success: true,
                hospitalId:
                    req.params.id,
                feature:
                    req.params.feature,
                enabled
            });

        } catch (error) {

            console.error(
                "Hospital feature error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Feature check nahi ho paaya"
            });
        }
    }
);

// =====================================================
// SUBSCRIPTION
// =====================================================

router.get(
    "/:id/subscription",
    (req, res) => {

        try {

            const subscription =
                getSubscription(
                    req.params.id
                );

            if (!subscription) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Hospital subscription nahi mili"
                });
            }

            res.json({
                success: true,
                hospitalId:
                    req.params.id,
                subscription
            });

        } catch (error) {

            console.error(
                "Subscription error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Subscription load nahi ho paayi"
            });
        }
    }
);

// =====================================================
// HOSPITAL STATS
// =====================================================

router.get(
    "/:id/stats",
    (req, res) => {

        try {

            const stats =
                getHospitalStats(
                    req.params.id
                );

            if (!stats) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Hospital nahi mila"
                });
            }

            res.json({
                success: true,
                stats
            });

        } catch (error) {

            console.error(
                "Hospital stats error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Hospital stats load nahi ho paaye"
            });
        }
    }
);

module.exports = router;