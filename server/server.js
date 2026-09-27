const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const ROOT_DIR = path.join(__dirname, "..");

app.use(express.static(ROOT_DIR));

/* =========================================================
   ROUTE REGISTRATION HELPER
========================================================= */

function registerRoute(app, basePath, candidates, label) {
    for (const candidate of candidates) {
        try {
            const router = require(candidate);

            app.use(basePath, router);

            console.log(
                label +
                " registered from " +
                candidate +
                "!"
            );

            return true;
        } catch (error) {
            if (
                error.code === "MODULE_NOT_FOUND" &&
                error.message.includes(candidate)
            ) {
                continue;
            }

            console.error(
                label +
                " failed from " +
                candidate +
                ":"
            );

            console.error(error.message);

            return false;
        }
    }

    console.log(
        label +
        " skipped - route file not found."
    );

    return false;
}

/* =========================================================
   BASIC API
========================================================= */

app.get("/api/health", function(req, res) {
    res.json({
        success: true,
        message: "Gopal Joshi Hospital SaaS API is running",
        server: "Gopal Joshi Hospital",
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString()
    });
});

app.get("/api", function(req, res) {
    res.json({
        success: true,
        message: "Gopal Joshi Hospital SaaS API",
        version: "1.0.0",
        modules: [
            "authentication",
            "hospital",
            "users",
            "command-center",
            "appointments",
            "consultation",
            "laboratory",
            "pharmacy",
            "billing"
        ]
    });
});

/* =========================================================
   AUTHENTICATION
========================================================= */

registerRoute(
    app,
    "/api/auth",
    [
        "./routes/auth"
    ],
    "Authentication API"
);

/* =========================================================
   SAAS HOSPITAL
========================================================= */

registerRoute(
    app,
    "/api/saas/hospitals",
    [
        "./routes/saas/hospitals"
    ],
    "SaaS Hospital API"
);

/* =========================================================
   SAAS USERS
========================================================= */

registerRoute(
    app,
    "/api/saas/users",
    [
        "./routes/saas/users"
    ],
    "SaaS User API"
);

/* =========================================================
   HOSPITAL COMMAND CENTER
========================================================= */

registerRoute(
    app,
    "/api/saas/command-center",
    [
        "./routes/saas/command-center"
    ],
    "Hospital Command Center API"
);
registerRoute(
    app,
    "/api/saas/patients",
    [
        "./routes/saas/patients"
    ],
    "SaaS Patient API"
);
/* =========================================================
   APPOINTMENTS
========================================================= */

registerRoute(
    app,
    "/api/appointments",
    [
        "./routes/appointments"
    ],
    "Appointment API"
);

/* =========================================================
   CONSULTATION
========================================================= */

registerRoute(
    app,
    "/api/consultation",
    [
        "./routes/clinical/consultation",
        "./routes/clinical/consultations",
        "./routes/consultation",
        "./routes/consultations"
    ],
    "Consultation API"
);

/* =========================================================
   LABORATORY
========================================================= */

registerRoute(
    app,
    "/api/laboratory",
    [
        "./routes/laboratory/tests",
        "./routes/laboratory"
    ],
    "Laboratory API"
);

/* =========================================================
   PHARMACY
========================================================= */

registerRoute(
    app,
    "/api/pharmacy/medicines",
    [
        "./routes/pharmacy/medicines"
    ],
    "Pharmacy API"
);

/* =========================================================
   BILLING
========================================================= */

registerRoute(
    app,
    "/api/billing",
    [
        "./routes/billing/bills",
        "./routes/billing"
    ],
    "Billing API"
);

/* =========================================================
   API 404
========================================================= */

app.use("/api", function(req, res) {
    res.status(404).json({
        success: false,
        message: "API endpoint not found",
        path: req.originalUrl
    });
});

/* =========================================================
   WEBSITE FALLBACK
========================================================= */

app.use(function(req, res, next) {
    if (req.method !== "GET") {
        return next();
    }

    if (req.path.startsWith("/api")) {
        return next();
    }

    const requestedPath = path.normalize(
        path.join(ROOT_DIR, req.path)
    );

    if (
        requestedPath.startsWith(ROOT_DIR) &&
        path.extname(requestedPath) === ""
    ) {
        return res.sendFile(
            path.join(ROOT_DIR, "index.html")
        );
    }

    next();
});

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(function(error, req, res, next) {
    console.error("GLOBAL SERVER ERROR:");
    console.error(error);

    if (res.headersSent) {
        return next(error);
    }

    res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
            process.env.NODE_ENV === "development"
                ? error.message
                : "Server error"
    });
});

/* =========================================================
   START SERVER
========================================================= */

registerRoute(app, "/api/saas/os", ["./routes/saas/hospital-os"], "Hospital OS");

app.listen(PORT, "0.0.0.0", function() {
    try {
        const os = require("os");
        const interfaces = os.networkInterfaces();

        for (const name of Object.keys(interfaces)) {
            for (const net of interfaces[name] || []) {
                if (net.family === "IPv4" && !net.internal) {
                    console.log(
                        "LAN Website: http://" +
                        net.address +
                        ":" +
                        PORT
                    );
                }
            }
        }
    } catch (e) {
        console.log("LAN address detection unavailable.");
    }

    console.log("");
    console.log("======================================");
    console.log("       GOPAL JOSHI HOSPITAL");
    console.log("======================================");
    console.log(
        "Website: http://localhost:" +
        PORT
    );
    console.log(
        "API:     http://localhost:" +
        PORT +
        "/api"
    );
    console.log("");

    console.log(
        "Authentication system ready!"
    );

    console.log(
        "Role based access system ready!"
    );

    console.log(
        "SaaS Hospital system ready!"
    );

    console.log(
        "SaaS User system ready!"
    );

    console.log(
        "Hospital Command Center ready!"
    );

    console.log(
        "Appointment system ready!"
    );

    console.log(
        "Consultation system checked!"
    );

    console.log(
        "Laboratory system ready!"
    );

    console.log(
        "Pharmacy system ready!"
    );

    console.log(
        "Billing system ready!"
    );

    console.log("======================================");
    console.log("");
});


/* =========================================================
   HOSPITAL MASTER CONTROL / RBAC / SECURITY
========================================================= */

registerRoute(
    app,
    "/api/saas/control",
    [
        "./routes/saas/hospital-control"
    ],
    "Hospital Control API"
);

