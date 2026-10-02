const clinicalWorkflowEngine = require("./routes/saas/clinical-workflow-engine");
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const PORT =
    Number(process.env.PORT) || 5000;

const ROOT_DIR =
    path.join(__dirname, "..");

const {
    securityHeaders,
    rateLimit
} = require("./middleware/security");

app.disable("x-powered-by");

app.use(
    securityHeaders
);

app.use(
    cors({
        origin: true,
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Requested-With"
        ]
    })
);

app.use(
    express.json({
        limit: "5mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "5mb"
    })
);

app.use(
    "/api",
    rateLimit
);

app.use(
    express.static(ROOT_DIR)
);

function registerRoute(
    app,
    basePath,
    candidates,
    label
) {

    for (const candidate of candidates) {

        try {

            const router =
                require(candidate);

            if (
                router &&
                router.router
            ) {

                app.use(
                    basePath,
                    router.router
                );

            } else {

                app.use(
                    basePath,
                    router
                );

            }

            console.log(
                label +
                " registered from " +
                candidate +
                "!"
            );

            return true;

        } catch (error) {

            if (
                error.code ===
                    "MODULE_NOT_FOUND" &&
                error.message.includes(
                    candidate
                )
            ) {

                continue;

            }

            console.error(
                label +
                " failed:"
            );

            console.error(
                error.message
            );

            return false;
        }
    }

    console.log(
        label +
        " skipped - route not found."
    );

    return false;
}

app.get(
    "/api/health",
    function(req, res) {

        res.json({
            success: true,
            server: "Gopal Joshi Hospital",
            product: "HospitalOS",
            version: "2.0.0",
            status: "operational",
            environment:
                process.env.NODE_ENV ||
                "development",
            timestamp:
                new Date().toISOString()
        });

    }
);

app.get(
    "/api",
    function(req, res) {

        res.json({
            success: true,
            product: "HospitalOS",
            message:
                "Connected Hospital Operating System",
            modules: [
                "authentication",
                "hospitals",
                "users",
                "patients",
                "appointments",
                "consultation",
                "laboratory",
                "pharmacy",
                "billing",
                "command-center",
                "hospital-control",
                "security"
            ]
        });

    }
);

registerRoute(
    app,
    "/api/auth",
    ["./routes/auth"],
    "Authentication API"
);

registerRoute(
    app,
    "/api/saas/hospitals",
    ["./routes/saas/hospitals"],
    "SaaS Hospital API"
);

registerRoute(
    app,
    "/api/saas/users",
    ["./routes/saas/users"],
    "SaaS User API"
);

registerRoute(
    app,
    "/api/saas/command-center",
    ["./routes/saas/command-center"],
    "Hospital Command Center API"
);

registerRoute(
    app,
    "/api/saas/patients",
    ["./routes/saas/patients"],
    "SaaS Patient API"
);

registerRoute(
    app,
    "/api/appointments",
    ["./routes/appointments"],
    "Appointment API"
);

registerRoute(
    app,
    "/api/consultation",
    [
        "./routes/clinical/consultations",
        "./routes/clinical/consultation"
    ],
    "Consultation API"
);

registerRoute(
    app,
    "/api/laboratory",
    [
        "./routes/laboratory/tests",
        "./routes/laboratory"
    ],
    "Laboratory API"
);

registerRoute(
    app,
    "/api/pharmacy/medicines",
    ["./routes/pharmacy/medicines"],
    "Pharmacy API"
);

registerRoute(
    app,
    "/api/billing",
    [
        "./routes/billing/bills",
        "./routes/billing"
    ],
    "Billing API"
);

registerRoute(
    app,
    "/api/saas/control",
    ["./routes/saas/hospital-control"],
    "Hospital Control API"
);

registerRoute(
    app,
    "/api/security",
    ["./routes/security/security"],
    "Security API"
);

registerRoute(
    app,
    "/api/saas/hospital-os",
    ["./routes/saas/hospital-os"],
    "Hospital OS API"
);


// HospitalOS Core Clinical Workflow Engine
app.use("/api/saas/workflow", clinicalWorkflowEngine);

app.use(
    "/api",
    function(req, res) {

        res.status(404).json({
            success: false,
            message: "API endpoint not found",
            path: req.originalUrl
        });

    }
);

app.use(
    function(req, res, next) {

        if (req.method !== "GET") {
            return next();
        }

        if (
            req.path.startsWith("/api")
        ) {
            return next();
        }

        next();

    }
);

app.use(
    function(error, req, res, next) {

        console.error(
            "GLOBAL SERVER ERROR:",
            error
        );

        if (res.headersSent) {
            return next(error);
        }

        res.status(500).json({
            success: false,
            message:
                "Internal server error"
        });

    }
);


app.listen(
    PORT,
    "0.0.0.0",
    function() {

        console.log("");
        console.log(
            "================================================"
        );
        console.log(
            "        HOSPITALOS SAAS PLATFORM"
        );
        console.log(
            "================================================"
        );
        console.log(
            "Website: http://localhost:" +
            PORT
        );
        console.log(
            "API: http://localhost:" +
            PORT +
            "/api"
        );
        console.log(
            "Security Layer: ACTIVE"
        );
        console.log(
            "Rate Limiting: ACTIVE"
        );
        console.log(
            "Audit/Security API: ACTIVE"
        );
        console.log(
            "================================================"
        );

    }
);

