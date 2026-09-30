const express = require("express");

const HOSPITALOS_MODULES = [
    "command-center",
    "patients",
    "appointments",
    "consultations",
    "prescriptions",
    "laboratory",
    "pharmacy",
    "ipd",
    "beds",
    "nursing",
    "emergency",
    "ambulance",
    "ot-surgery",
    "billing",
    "accounts",
    "insurance",
    "inventory",
    "suppliers",
    "blood-bank",
    "hr",
    "reports",
    "users",
    "audit-security"
];
const fs = require("fs");
const path = require("path");

const router = express.Router();

const DATA_FILE = path.join(
    __dirname,
    "..",
    "..",
    "data",
    "hospital-control.json"
);

const DEFAULT_HOSPITAL = "HOSP-TEST-001";

function readDB() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return {
                roles: {},
                modules: [],
                auditLogs: [],
                securityEvents: []
            };
        }

        return JSON.parse(
            fs.readFileSync(DATA_FILE, "utf8")
        );
    } catch (error) {
        return {
            roles: {},
            modules: [],
            auditLogs: [],
            securityEvents: []
        };
    }
}

function writeDB(db) {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(db, null, 2),
        "utf8"
    );
}

function getToken(req) {
    const header =
        String(
            req.headers.authorization || ""
        );

    if (!header.startsWith("Bearer ")) {
        return "";
    }

    return header
        .replace("Bearer ", "")
        .trim();
}

function getUserFromToken(req) {
    try {
        const token = getToken(req);

        if (!token) {
            return null;
        }

        const decoded = JSON.parse(
            Buffer.from(
                token,
                "base64"
            ).toString("utf8")
        );

        if (!decoded.userId) {
            return null;
        }

        const userModel =
            require("../../models/user");

        const user =
            userModel.getUserById(
                decoded.userId
            );

        if (!user) {
            return null;
        }

        if (user.status !== "active") {
            return null;
        }

        if (
            decoded.hospitalId &&
            user.hospitalId !== decoded.hospitalId
        ) {
            return null;
        }

        return user;

    } catch (error) {
        return null;
    }
}

function requireLogin(req, res, next) {
    const user =
        getUserFromToken(req);

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Login required"
        });
    }

    req.user = user;

    next();
}

function roleAllowed(user, db) {
    if (!user) {
        return false;
    }

    const role =
        String(user.role || "")
            .toLowerCase();

    return (
        role === "super_admin" ||
        role === "superadmin" ||
        role === "admin" ||
        role === "hospital_admin" ||
        role === "hospital-admin"
    );
}

function audit(req, action, module, description) {

    const db = readDB();

    const user = req.user || {};

    const item = {
        id:
            "AUD-" +
            Date.now() +
            "-" +
            Math.floor(
                Math.random() * 10000
            ),

        hospitalId:
            user.hospitalId ||
            DEFAULT_HOSPITAL,

        userId:
            user.id || "SYSTEM",

        userName:
            user.name ||
            user.username ||
            "SYSTEM",

        role:
            user.role ||
            "system",

        action:
            action || "VIEW",

        module:
            module || "system",

        description:
            description || "",

        method:
            req.method,

        path:
            req.originalUrl,

        ip:
            req.ip ||
            req.headers["x-forwarded-for"] ||
            "",

        createdAt:
            new Date().toISOString()
    };

    db.auditLogs =
        Array.isArray(db.auditLogs)
            ? db.auditLogs
            : [];

    db.auditLogs.push(item);

    if (db.auditLogs.length > 5000) {
        db.auditLogs =
            db.auditLogs.slice(-5000);
    }

    writeDB(db);
}

/* -----------------------------------------------
   PUBLIC MANIFEST
------------------------------------------------ */

router.get(
    "/manifest",
    function(req, res) {

        const db = readDB();

        res.json({
            success: true,
            platform:
                db.system ||
                {},
            modules: HOSPITALOS_MODULES
        });
    }
);

/* -----------------------------------------------
   LOGIN SESSION CHECK
------------------------------------------------ */

router.get(
    "/session",
    requireLogin,
    function(req, res) {

        const db = readDB();

        const role =
            String(req.user.role || "")
                .toLowerCase();

        const roleData =
            db.roles[role] ||
            db.roles["hospital_admin"] ||
            {};
res.json({
            success: true,
            user: {
                id: req.user.id,
                name: req.user.name,
                username: req.user.username,
                role: req.user.role,
                department:
                    req.user.department || "",
                hospitalId:
                    req.user.hospitalId
            },
            permissions:
                roleData.permissions || []
        });
    }
);

/* -----------------------------------------------
   ROLES
------------------------------------------------ */

router.get(
    "/roles",
    requireLogin,
    function(req, res) {

        const db = readDB();

        if (!roleAllowed(req.user, db)) {
            return res.status(403).json({
                success: false,
                message:
                    "Admin permission required"
            });
        }
res.json({
            success: true,
            roles: db.roles
        });
    }
);

/* -----------------------------------------------
   PERMISSION CHECK
------------------------------------------------ */

router.get(
    "/permissions/:permission",
    requireLogin,
    function(req, res) {

        const db = readDB();

        const role =
            String(req.user.role || "")
                .toLowerCase();

        const roleData =
            db.roles[role] ||
            {};

        const permissions =
            roleData.permissions || [];

        const allowed =
            permissions.includes("*") ||
            permissions.includes(
                req.params.permission
            );

        res.json({
            success: true,
            permission:
                req.params.permission,
            allowed
        });
    }
);

/* -----------------------------------------------
   AUDIT LOGS
------------------------------------------------ */

router.get(
    "/audit",
    requireLogin,
    function(req, res) {

        const db = readDB();

        if (!roleAllowed(req.user, db)) {
            return res.status(403).json({
                success: false,
                message:
                    "Admin permission required"
            });
        }

        let logs =
            Array.isArray(db.auditLogs)
                ? db.auditLogs
                : [];

        const limit =
            Math.min(
                Number(req.query.limit) || 200,
                1000
            );

        logs =
            logs
                .slice()
                .reverse()
                .slice(0, limit);

        res.json({
            success: true,
            count: logs.length,
            logs
        });
    }
);

/* -----------------------------------------------
   SECURITY EVENTS
------------------------------------------------ */

router.get(
    "/security-events",
    requireLogin,
    function(req, res) {

        const db = readDB();

        if (!roleAllowed(req.user, db)) {
            return res.status(403).json({
                success: false,
                message:
                    "Admin permission required"
            });
        }

        res.json({
            success: true,
            events:
                db.securityEvents || []
        });
    }
);

/* -----------------------------------------------
   SECURITY EVENT CREATE
------------------------------------------------ */

router.post(
    "/security-events",
    function(req, res) {

        const db = readDB();

        db.securityEvents =
            Array.isArray(
                db.securityEvents
            )
                ? db.securityEvents
                : [];

        const event = {
            id:
                "SEC-" +
                Date.now(),

            type:
                req.body.type ||
                "SECURITY_EVENT",

            severity:
                req.body.severity ||
                "INFO",

            description:
                req.body.description ||
                "",

            userId:
                req.body.userId ||
                "",

            hospitalId:
                req.body.hospitalId ||
                DEFAULT_HOSPITAL,

            ip:
                req.ip || "",

            createdAt:
                new Date().toISOString()
        };

        db.securityEvents.push(event);

        if (
            db.securityEvents.length >
            3000
        ) {
            db.securityEvents =
                db.securityEvents.slice(-3000);
        }

        writeDB(db);

        res.status(201).json({
            success: true,
            event
        });
    }
);

/* -----------------------------------------------
   CONTROL CENTER STATS
------------------------------------------------ */

router.get(
    "/stats",
    requireLogin,
    async function(req, res) {

        const db = readDB();

        if (!roleAllowed(req.user, db)) {
            return res.status(403).json({
                success: false,
                message:
                    "Admin permission required"
            });
        }
let patients = 0;
        let appointments = 0;

        try {
            const patientModel =
                require("../../models/patient");

            const allPatients =
                patientModel.getPatients
                    ? patientModel.getPatients()
                    : [];

            patients =
                Array.isArray(allPatients)
                    ? allPatients.length
                    : 0;
        } catch (e) {}

        try {
            const appointmentFile =
                path.join(
                    __dirname,
                    "..",
                    "..",
                    "data",
                    "appointments.json"
                );

            if (
                fs.existsSync(
                    appointmentFile
                )
            ) {
                const data =
                    JSON.parse(
                        fs.readFileSync(
                            appointmentFile,
                            "utf8"
                        )
                    );

                appointments =
                    Array.isArray(data)
                        ? data.length
                        : 0;
            }
        } catch (e) {}

        res.json({
            success: true,

            patients,

            appointments,

            modules: HOSPITALOS_MODULES.length,

            auditLogs:
                db.auditLogs.length,

            securityEvents:
                db.securityEvents.length,

            generatedAt:
                new Date().toISOString()
        });
    }
);

/* -----------------------------------------------
   MODULE RECORD STORE
------------------------------------------------ */

router.get(
    "/records/:module",
    requireLogin,
    function(req, res) {

        const db = readDB();

        const moduleName =
            String(
                req.params.module
            );

        const file =
            path.join(
                __dirname,
                "..",
                "..",
                "data",
                "control-records-" +
                    moduleName +
                    ".json"
            );

        let records = [];

        try {
            if (fs.existsSync(file)) {
                records =
                    JSON.parse(
                        fs.readFileSync(
                            file,
                            "utf8"
                        )
                    );
            }
        } catch (e) {
            records = [];
        }
res.json({
            success: true,
            module: moduleName,
            count: records.length,
            records
        });
    }
);

router.post(
    "/records/:module",
    requireLogin,
    function(req, res) {

        const db = readDB();

        const moduleName =
            String(
                req.params.module
            );

        const file =
            path.join(
                __dirname,
                "..",
                "..",
                "data",
                "control-records-" +
                    moduleName +
                    ".json"
            );

        let records = [];

        try {
            if (fs.existsSync(file)) {
                records =
                    JSON.parse(
                        fs.readFileSync(
                            file,
                            "utf8"
                        )
                    );
            }
        } catch (e) {
            records = [];
        }

        const record = {
            id:
                moduleName
                    .toUpperCase() +
                "-" +
                Date.now(),

            hospitalId:
                req.user.hospitalId,

            createdBy:
                req.user.id,

            createdByName:
                req.user.name ||
                req.user.username,

            createdAt:
                new Date().toISOString(),

            data:
                req.body || {}
        };

        records.push(record);

        fs.writeFileSync(
            file,
            JSON.stringify(
                records,
                null,
                2
            ),
            "utf8"
        );

        audit(
            req,
            "CREATE",
            moduleName,
            "Created new module record"
        );

        res.status(201).json({
            success: true,
            record
        });
    }
);

module.exports = router;



