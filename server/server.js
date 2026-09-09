const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend files
app.use(express.static(path.join(__dirname, "..")));

// ================================
// AUTHENTICATION
// ================================

const authRoutes = require("./routes/auth");

app.use("/api/auth", authRoutes);


// ================================
// DEMO ROLE AUTHENTICATION
// ================================

// Demo token ko read karke user identify karega.
// Final production version me proper session/JWT + database use karenge.

const { users } = require("./data/users");

function getUserFromToken(req) {
    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
        return null;
    }

    const token = header.replace("Bearer ", "").trim();

    if (!token) {
        return null;
    }

    try {
        const decoded = Buffer
            .from(token, "base64")
            .toString("utf8");

        const parts = decoded.split(":");

        const userId = Number(parts[0]);
        const role = parts[1];

        if (!userId || !role) {
            return null;
        }

        const user = users.find(
            item =>
                item.id === userId &&
                item.role === role
        );

        if (!user) {
            return null;
        }

       return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    email: user.email || "",
    phone: user.phone || ""
};

    } catch (error) {
        return null;
    }
}


// Attach logged-in user to request
app.use("/api/private", (req, res, next) => {

    const user = getUserFromToken(req);

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Login required"
        });
    }

    req.user = user;

    next();
});


// ================================
// ROLE CHECK
// ================================

function allowRoles(...roles) {

    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Login required"
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied for this role"
            });
        }

        next();
    };
}


// ================================
// PRIVATE USER INFO
// ================================

app.get(
    "/api/private/me",
    (req, res) => {

        res.json({
            success: true,
            user: req.user
        });

    }
);


// ================================
// DOCTOR PRIVATE API
// ================================

app.get(
    "/api/private/doctor",
    allowRoles("doctor"),
    (req, res) => {

        res.json({
            success: true,
            message: "Doctor Panel Access Granted",
            user: req.user
        });

    }
);


// ================================
// PHARMACY PRIVATE API
// ================================

app.get(
    "/api/private/pharmacy",
    allowRoles("pharmacy"),
    (req, res) => {

        res.json({
            success: true,
            message: "Pharmacy Panel Access Granted",
            user: req.user
        });

    }
);


// ================================
// LABORATORY PRIVATE API
// ================================

app.get(
    "/api/private/laboratory",
    allowRoles("laboratory"),
    (req, res) => {

        res.json({
            success: true,
            message: "Laboratory Panel Access Granted",
            user: req.user
        });

    }
);


// ================================
// NURSE PRIVATE API
// ================================

app.get(
    "/api/private/nurse",
    allowRoles("nurse"),
    (req, res) => {

        res.json({
            success: true,
            message: "Nurse Panel Access Granted",
            user: req.user
        });

    }
);


// ================================
// RECEPTION PRIVATE API
// ================================

app.get(
    "/api/private/reception",
    allowRoles("reception"),
    (req, res) => {

        res.json({
            success: true,
            message: "Reception Panel Access Granted",
            user: req.user
        });

    }
);


// ================================
// BED MANAGEMENT PRIVATE API
// ================================

app.get(
    "/api/private/beds",
    allowRoles("beds"),
    (req, res) => {

        res.json({
            success: true,
            message: "Bed Management Access Granted",
            user: req.user
        });

    }
);


// ================================
// AMBULANCE PRIVATE API
// ================================

app.get(
    "/api/private/ambulance",
    allowRoles("ambulance"),
    (req, res) => {

        res.json({
            success: true,
            message: "Ambulance Panel Access Granted",
            user: req.user
        });

    }
);


// ================================
// MANAGER PRIVATE API
// ================================

app.get(
    "/api/private/manager",
    allowRoles("manager"),
    (req, res) => {

        res.json({
            success: true,
            message: "Manager Panel Access Granted",
            user: req.user
        });

    }
);


// ================================
// ADMIN PRIVATE API
// ================================

app.get(
    "/api/private/admin",
    allowRoles("admin"),
    (req, res) => {

        res.json({
            success: true,
            message: "Admin Panel Access Granted",
            user: req.user
        });

    }
);


// ================================
// PATIENT PRIVATE API
// ================================

app.get(
    "/api/private/patient",
    allowRoles("patient"),
    (req, res) => {

        res.json({
            success: true,
            message: "Patient Panel Access Granted",
            user: req.user
        });

    }
);


// ================================
// APPOINTMENT ROUTES
// ================================

const appointmentRoutes =
    require("./routes/appointments");

app.use(
    "/api/appointments",
    appointmentRoutes
);


// ================================
// HOME PAGE
// ================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "..", "index.html")
    );

});


// ================================
// HEALTH CHECK
// ================================

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        message:
            "Gopal Joshi Hospital Backend is running"
    });

});


// ================================
// 404 HANDLER
// ================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "API route not found"
    });

});


// ================================
// START SERVER
// ================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "------------------------------------"
        );

        console.log(
            "Gopal Joshi Hospital Started!"
        );

        console.log(
            `Website: http://localhost:${PORT}`
        );

        console.log(
            `API: http://localhost:${PORT}/api`
        );

        console.log(
            "Authentication system ready!"
        );

        console.log(
            "Role based access system ready!"
        );

        console.log(
            "------------------------------------"
        );

    }
);