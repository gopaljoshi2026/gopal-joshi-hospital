const express = require("express");
const router = express.Router();

const {
    authenticateUser,
    getUserByUsername,
    getUserById,
    sanitizeUser,
    updateLastLogin,
    hasHospitalAccess,
    hasPermission,
    hasRole
} = require("../models/user");

const {
    getHospitalById,
    hasHospitalAccess: hospitalHasAccess,
    getSubscription,
    getHospitalStats
} = require("../models/hospital");


/* ============================================
   CREATE DEMO TOKEN
============================================ */

function createToken(user) {

    return Buffer.from(
        JSON.stringify({
            userId: user.id,
            hospitalId: user.hospitalId,
            role: user.role,
            issuedAt: Date.now()
        })
    ).toString("base64");

}


/* ============================================
   READ DEMO TOKEN
============================================ */

function decodeToken(token) {

    try {

        if (!token) {
            return null;
        }

        const decoded =
            Buffer.from(token, "base64").toString("utf8");

        return JSON.parse(decoded);

    } catch (error) {

        return null;

    }

}


/* ============================================
   LOGIN
============================================ */

router.post("/login", (req, res) => {

    try {

        const username =
            String(req.body?.username || "").trim();

        const password =
            String(req.body?.password || "");

        const requestedHospitalId =
            String(
                req.body?.hospitalId ||
                ""
            ).trim();


        if (!username || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Username and password are required"

            });

        }


        /* ========================================
           AUTHENTICATE USER
        ======================================== */

        const user =
            authenticateUser(
                username,
                password
            );


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid username or password"

            });

        }


        /* ========================================
           HOSPITAL CHECK
        ======================================== */

        const hospitalId =
            user.hospitalId;


        if (!hospitalId) {

            return res.status(403).json({

                success: false,

                message:
                    "User is not linked to any hospital"

            });

        }


        if (
            requestedHospitalId &&
            requestedHospitalId !== hospitalId
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "User does not belong to this hospital"

            });

        }


        /* ========================================
           GET HOSPITAL
        ======================================== */

        const hospital =
            getHospitalById(hospitalId);


        if (!hospital) {

            return res.status(403).json({

                success: false,

                message:
                    "Hospital not found"

            });

        }


        /* ========================================
           HOSPITAL ACCESS CHECK
        ======================================== */

        if (
            hospital.status !== "active"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Hospital account is not active"

            });

        }


        if (
            !hospitalHasAccess(hospitalId)
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Hospital access is currently unavailable"

            });

        }


        /* ========================================
           USER HOSPITAL ACCESS
        ======================================== */

        if (
            !hasHospitalAccess(
                user.id,
                hospitalId
            )
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "User does not have access to this hospital"

            });

        }


        /* ========================================
           UPDATE LAST LOGIN
        ======================================== */

        updateLastLogin(user.id);


        /* ========================================
           CREATE TOKEN
        ======================================== */

        const token =
            createToken(user);


        /* ========================================
           SUBSCRIPTION
        ======================================== */

        const subscription =
            getSubscription(hospitalId);


        /* ========================================
           HOSPITAL STATS
        ======================================== */

        const stats =
            getHospitalStats(hospitalId);


        /* ========================================
           SANITIZED USER
        ======================================== */

        const safeUser =
            sanitizeUser(
                getUserById(user.id)
            );


        /* ========================================
           SUCCESS RESPONSE
        ======================================== */

        return res.json({

            success: true,

            message:
                "Login successful",

            token,

            user: safeUser,

            hospital: {

                id: hospital.id,

                name: hospital.name,

                legalName:
                    hospital.legalName || "",

                code:
                    hospital.code || "",

                email:
                    hospital.email || "",

                phone:
                    hospital.phone || "",

                address:
                    hospital.address || "",

                logo:
                    hospital.logo || "",

                branding:
                    hospital.branding || {},

                status:
                    hospital.status

            },

            subscription,

            hospitalStats: stats

        });

    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Login failed",

            error:
                error.message

        });

    }

});


/* ============================================
   GET CURRENT USER
============================================ */

router.get("/me", (req, res) => {

    try {

        const authHeader =
            String(
                req.headers.authorization || ""
            );


        if (!authHeader.startsWith("Bearer ")) {

            return res.status(401).json({

                success: false,

                message:
                    "Authorization token required"

            });

        }


        const token =
            authHeader.replace(
                "Bearer ",
                ""
            ).trim();


        const decoded =
            decodeToken(token);


        if (!decoded || !decoded.userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid authentication token"

            });

        }


        const user =
            getUserById(
                decoded.userId
            );


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "User not found"

            });

        }


        if (
            user.status !== "active"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "User account is not active"

            });

        }


        if (
            user.hospitalId !==
            decoded.hospitalId
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Hospital access mismatch"

            });

        }


        const hospital =
            getHospitalById(
                user.hospitalId
            );


        if (!hospital) {

            return res.status(403).json({

                success: false,

                message:
                    "Hospital not found"

            });

        }


        return res.json({

            success: true,

            user:
                sanitizeUser(user),

            hospital: {

                id:
                    hospital.id,

                name:
                    hospital.name,

                code:
                    hospital.code,

                status:
                    hospital.status

            }

        });

    } catch (error) {

        console.error(
            "ME API ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to load current user"

        });

    }

});


/* ============================================
   FIND USER BY USERNAME
============================================ */

router.get("/user/:username", (req, res) => {

    try {

        const username =
            String(
                req.params.username || ""
            ).trim();


        const user =
            getUserByUsername(username);


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        return res.json({

            success: true,

            user:
                sanitizeUser(user)

        });

    } catch (error) {

        console.error(
            "FIND USER ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to find user"

        });

    }

});


/* ============================================
   CHECK USER ROLE
============================================ */

router.get(
    "/user/:id/role/:role",
    (req, res) => {

        try {

            const user =
                getUserById(
                    req.params.id
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            const result =
                hasRole(
                    user.id,
                    req.params.role
                );


            return res.json({

                success: true,

                userId:
                    user.id,

                role:
                    req.params.role,

                hasRole:
                    result

            });

        } catch (error) {

            return res.status(500).json({

                success: false,

                message:
                    "Unable to check role"

            });

        }

    }
);


/* ============================================
   CHECK USER PERMISSION
============================================ */

router.get(
    "/user/:id/permission/:permission",
    (req, res) => {

        try {

            const user =
                getUserById(
                    req.params.id
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            const result =
                hasPermission(
                    user.id,
                    req.params.permission
                );


            return res.json({

                success: true,

                userId:
                    user.id,

                permission:
                    req.params.permission,

                hasPermission:
                    result

            });

        } catch (error) {

            return res.status(500).json({

                success: false,

                message:
                    "Unable to check permission"

            });

        }

    }
);


/* ============================================
   CHECK HOSPITAL ACCESS
============================================ */

router.get(
    "/user/:id/hospital/:hospitalId",
    (req, res) => {

        try {

            const result =
                hasHospitalAccess(
                    req.params.id,
                    req.params.hospitalId
                );


            return res.json({

                success: true,

                userId:
                    req.params.id,

                hospitalId:
                    req.params.hospitalId,

                hasAccess:
                    result

            });

        } catch (error) {

            return res.status(500).json({

                success: false,

                message:
                    "Unable to check hospital access"

            });

        }

    }
);


/* ============================================
   LOGOUT
============================================ */

router.post("/logout", (req, res) => {

    /*
        Current demo-token system is stateless.

        Later production version me:
        - JWT/session blacklist
        - refresh tokens
        - session management
        - device management
        implement karenge.
    */

    return res.json({

        success: true,

        message:
            "Logout successful"

    });

});


module.exports = router;