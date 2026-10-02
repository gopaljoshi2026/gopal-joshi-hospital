const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const DATA_DIR = path.join(__dirname, "../../data");
const DATA_FILE = path.join(DATA_DIR, "command-center.json");

const HOSPITAL_ID = "HOSP-TEST-001";

function ensureDatabase() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE)) {
        const initialData = {
            patients: [],
            appointments: [],
            beds: [],
            admissions: [],
            nursingTasks: [],
            emergencies: [],
            ambulances: [],
            expenses: [],
            notifications: [],
            auditLogs: []
        };

        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(initialData, null, 2),
            "utf8"
        );
    }
}

function readDatabase() {
    ensureDatabase();

    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    } catch (error) {
        return {
            patients: [],
            appointments: [],
            beds: [],
            admissions: [],
            nursingTasks: [],
            emergencies: [],
            ambulances: [],
            expenses: [],
            notifications: [],
            auditLogs: []
        };
    }
}

function writeDatabase(data) {
    ensureDatabase();

    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(data, null, 2),
        "utf8"
    );
}

function createId(prefix) {
    return (
        prefix +
        "-" +
        Date.now() +
        "-" +
        Math.floor(Math.random() * 1000)
    );
}

function todayDate() {
    return new Date().toISOString().slice(0, 10);
}

function safeNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

/* =========================================================
   EXISTING SYSTEM DATA
========================================================= */

function getHospitalModel() {
    try {
        return require("../../models/hospital");
    } catch (error) {
        return null;
    }
}

function getUserModel() {
    try {
        return require("../../models/user");
    } catch (error) {
        return null;
    }
}

function getAppointmentModel() {
    try {
        return require("../../models/appointment");
    } catch (error) {
        return null;
    }
}

function getMedicineModel() {
    try {
        return require("../../models/medicine");
    } catch (error) {
        return null;
    }
}

function getBillModel() {
    try {
        return require("../../models/bill");
    } catch (error) {
        return null;
    }
}

/* =========================================================
   HOSPITAL
========================================================= */

function getHospital(hospitalId) {
    const hospitalModel = getHospitalModel();

    if (!hospitalModel) {
        return {
            id: hospitalId,
            name: "Gopal Joshi Hospital",
            code: "GJH001",
            status: "active"
        };
    }

    try {
        if (typeof hospitalModel.getHospitalById === "function") {
            return hospitalModel.getHospitalById(hospitalId);
        }
    } catch (error) {}

    return {
        id: hospitalId,
        name: "Gopal Joshi Hospital",
        code: "GJH001",
        status: "active"
    };
}

/* =========================================================
   DOCTORS / STAFF
========================================================= */

function getDoctors(hospitalId) {
    const userModel = getUserModel();

    if (!userModel) {
        return [];
    }

    try {
        if (typeof userModel.getUsersByHospital === "function") {
            const users = userModel.getUsersByHospital(hospitalId);

            return Array.isArray(users)
                ? users.filter(function(user) {
                    return user.role === "doctor" &&
                        user.status !== "inactive" &&
                        user.status !== "suspended";
                })
                : [];
        }
    } catch (error) {}

    try {
        if (typeof userModel.getAllUsers === "function") {
            const users = userModel.getAllUsers();

            return Array.isArray(users)
                ? users.filter(function(user) {
                    return user.hospitalId === hospitalId &&
                        user.role === "doctor" &&
                        user.status !== "inactive" &&
                        user.status !== "suspended";
                })
                : [];
        }
    } catch (error) {}

    return [];
}

/* =========================================================
   APPOINTMENTS
========================================================= */

function getAppointments(hospitalId) {
    const db = readDatabase();
    const localAppointments = db.appointments.filter(function(item) {
        return item.hospitalId === hospitalId;
    });

    const appointmentModel = getAppointmentModel();

    if (!appointmentModel) {
        return localAppointments;
    }

    try {
        if (typeof appointmentModel.getAppointmentsByHospital === "function") {
            const appointments =
                appointmentModel.getAppointmentsByHospital(hospitalId);

            if (Array.isArray(appointments)) {
                return appointments;
            }
        }
    } catch (error) {}

    try {
        if (typeof appointmentModel.getAllAppointments === "function") {
            const appointments = appointmentModel.getAllAppointments();

            if (Array.isArray(appointments)) {
                return appointments.filter(function(item) {
                    return item.hospitalId === hospitalId;
                });
            }
        }
    } catch (error) {}

    return localAppointments;
}

/* =========================================================
   PHARMACY
========================================================= */

function getPharmacySummary(hospitalId) {
    const medicineModel = getMedicineModel();

    if (!medicineModel) {
        return {
            totalMedicines: 0,
            totalStock: 0,
            lowStock: 0,
            expiringSoon: 0,
            expired: 0
        };
    }

    let medicines = [];

    try {
        if (typeof medicineModel.getMedicinesByHospital === "function") {
            medicines = medicineModel.getMedicinesByHospital(hospitalId);
        }
    } catch (error) {}

    try {
        if (!medicines.length &&
            typeof medicineModel.getAllMedicines === "function") {
            medicines = medicineModel.getAllMedicines();

            if (Array.isArray(medicines)) {
                medicines = medicines.filter(function(item) {
                    return !item.hospitalId ||
                        item.hospitalId === hospitalId;
                });
            }
        }
    } catch (error) {}

    if (!Array.isArray(medicines)) {
        medicines = [];
    }

    const now = new Date();
    const next30Days = new Date();

    next30Days.setDate(next30Days.getDate() + 30);

    let totalStock = 0;
    let lowStock = 0;
    let expiringSoon = 0;
    let expired = 0;

    medicines.forEach(function(medicine) {
        const stock = safeNumber(
            medicine.stock !== undefined
                ? medicine.stock
                : medicine.quantity
        );

        totalStock += stock;

        const minimumStock = safeNumber(
            medicine.minimumStock !== undefined
                ? medicine.minimumStock
                : medicine.minStock
        );

        if (minimumStock > 0 && stock <= minimumStock) {
            lowStock++;
        }

        if (medicine.expiryDate) {
            const expiry = new Date(medicine.expiryDate);

            if (!Number.isNaN(expiry.getTime())) {
                if (expiry < now) {
                    expired++;
                } else if (expiry <= next30Days) {
                    expiringSoon++;
                }
            }
        }
    });

    return {
        totalMedicines: medicines.length,
        totalStock: totalStock,
        lowStock: lowStock,
        expiringSoon: expiringSoon,
        expired: expired
    };
}

/* =========================================================
   BILLING
========================================================= */

function getBillingSummary(hospitalId) {
    const billModel = getBillModel();

    if (!billModel) {
        return {
            totalBills: 0,
            todayRevenue: 0,
            pendingAmount: 0
        };
    }

    let bills = [];

    try {
        if (typeof billModel.getBillsByHospital === "function") {
            bills = billModel.getBillsByHospital(hospitalId);
        }
    } catch (error) {}

    if (!Array.isArray(bills)) {
        bills = [];
    }

    const today = todayDate();

    let todayRevenue = 0;
    let pendingAmount = 0;

    bills.forEach(function(bill) {
        const total = safeNumber(bill.total);

        const billDate =
            bill.createdAt
                ? String(bill.createdAt).slice(0, 10)
                : "";

        if (billDate === today &&
            bill.paymentStatus !== "cancelled") {
            todayRevenue += total;
        }

        if (
            bill.paymentStatus === "pending" ||
            bill.paymentStatus === "partial"
        ) {
            pendingAmount += total;
        }
    });

    return {
        totalBills: bills.length,
        todayRevenue: todayRevenue,
        pendingAmount: pendingAmount
    };
}

/* =========================================================
   PATIENTS
========================================================= */

function getPatients(hospitalId) {
    const db = readDatabase();

    return db.patients.filter(function(patient) {
        return patient.hospitalId === hospitalId &&
            patient.status !== "archived";
    });
}

/* =========================================================
   BEDS
========================================================= */

function getBeds(hospitalId) {
    const db = readDatabase();

    return db.beds.filter(function(bed) {
        return bed.hospitalId === hospitalId;
    });
}

function seedBeds(hospitalId) {
    const db = readDatabase();

    const existing = db.beds.filter(function(bed) {
        return bed.hospitalId === hospitalId;
    });

    if (existing.length > 0) {
        return existing;
    }

    const wards = [
        {
            name: "General Ward",
            prefix: "GW",
            count: 20,
            type: "general"
        },
        {
            name: "Private Ward",
            prefix: "PW",
            count: 10,
            type: "private"
        },
        {
            name: "ICU",
            prefix: "ICU",
            count: 6,
            type: "icu"
        },
        {
            name: "Emergency",
            prefix: "ER",
            count: 4,
            type: "emergency"
        }
    ];

    wards.forEach(function(ward) {
        for (let i = 1; i <= ward.count; i++) {
            db.beds.push({
                id: createId("BED"),
                hospitalId: hospitalId,
                ward: ward.name,
                type: ward.type,
                bedNumber: ward.prefix + "-" + String(i).padStart(2, "0"),
                status: "available",
                patientId: "",
                patientName: "",
                admissionId: "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
    });

    writeDatabase(db);

    return db.beds.filter(function(bed) {
        return bed.hospitalId === hospitalId;
    });
}

/* =========================================================
   DASHBOARD COMMAND CENTER
========================================================= */

function buildDashboard(hospitalId) {
    const hospital = getHospital(hospitalId);

    const patients = getPatients(hospitalId);

    const doctors = getDoctors(hospitalId);

    const appointments = getAppointments(hospitalId);

    let beds = getBeds(hospitalId);

    if (!beds.length) {
        beds = seedBeds(hospitalId);
    }

    const today = todayDate();

    const todayAppointments = appointments.filter(function(item) {
        const date =
            item.date ||
            item.appointmentDate ||
            item.scheduledDate ||
            item.createdAt;

        return date &&
            String(date).slice(0, 10) === today &&
            item.status !== "cancelled";
    });

    const occupiedBeds = beds.filter(function(bed) {
        return bed.status === "occupied";
    });

    const availableBeds = beds.filter(function(bed) {
        return bed.status === "available";
    });

    const maintenanceBeds = beds.filter(function(bed) {
        return bed.status === "maintenance";
    });

    const pharmacy = getPharmacySummary(hospitalId);

    const billing = getBillingSummary(hospitalId);

    const db = readDatabase();

    const admissions = db.admissions.filter(function(item) {
        return item.hospitalId === hospitalId &&
            item.status !== "discharged";
    });

    const emergencies = db.emergencies.filter(function(item) {
        return item.hospitalId === hospitalId &&
            item.status !== "closed";
    });

    const ambulanceList = db.ambulances.filter(function(item) {
        return item.hospitalId === hospitalId;
    });

    const activeAmbulances = ambulanceList.filter(function(item) {
        return item.status === "available";
    });

    const pendingLab = db.nursingTasks.filter(function(item) {
        return item.hospitalId === hospitalId &&
            item.status === "pending";
    });

    const alerts = [];

    if (pharmacy.lowStock > 0) {
        alerts.push({
            type: "warning",
            module: "Pharmacy",
            title: "Low stock medicines",
            message: pharmacy.lowStock +
                " medicine items need stock attention."
        });
    }

    if (pharmacy.expired > 0) {
        alerts.push({
            type: "critical",
            module: "Pharmacy",
            title: "Expired medicines",
            message: pharmacy.expired +
                " medicine items are expired."
        });
    }

    if (pharmacy.expiringSoon > 0) {
        alerts.push({
            type: "warning",
            module: "Pharmacy",
            title: "Medicine expiry approaching",
            message: pharmacy.expiringSoon +
                " medicines expire within 30 days."
        });
    }

    if (emergencies.length > 0) {
        alerts.push({
            type: "critical",
            module: "Emergency",
            title: "Active emergency cases",
            message: emergencies.length +
                " emergency case(s) require attention."
        });
    }

    if (billing.pendingAmount > 0) {
        alerts.push({
            type: "warning",
            module: "Billing",
            title: "Pending payments",
            message:
                "â‚¹" +
                billing.pendingAmount.toLocaleString("en-IN") +
                " pending amount."
        });
    }

    const occupancy =
        beds.length > 0
            ? Math.round((occupiedBeds.length / beds.length) * 100)
            : 0;

    return {
        success: true,

        hospital: {
            id: hospital.id || hospitalId,
            name: hospital.name || "Gopal Joshi Hospital",
            code: hospital.code || "GJH001",
            status: hospital.status || "active"
        },

        date: today,

        summary: {
            patients: patients.length,
            doctors: doctors.length,
            appointmentsToday: todayAppointments.length,
            beds: beds.length,
            occupiedBeds: occupiedBeds.length,
            availableBeds: availableBeds.length,
            maintenanceBeds: maintenanceBeds.length,
            occupancy: occupancy,
            activeAdmissions: admissions.length,
            emergencyCases: emergencies.length,
            activeAmbulances: activeAmbulances.length,
            pendingLabTasks: pendingLab.length,
            todayRevenue: billing.todayRevenue,
            pendingBilling: billing.pendingAmount
        },

        pharmacy: pharmacy,

        billing: billing,

        alerts: alerts,

        appointments: todayAppointments.slice(0, 10),

        beds: {
            total: beds.length,
            occupied: occupiedBeds.length,
            available: availableBeds.length,
            maintenance: maintenanceBeds.length,
            occupancy: occupancy
        },

        operations: {
            admissions: admissions.length,
            emergencies: emergencies.length,
            ambulances: ambulanceList.length,
            availableAmbulances: activeAmbulances.length
        },

        generatedAt: new Date().toISOString()
    };
}

/* =========================================================
   DASHBOARD
========================================================= */

router.get("/dashboard", function(req, res) {
    try {
        const hospitalId =
            req.query.hospitalId || HOSPITAL_ID;

        const dashboard = buildDashboard(hospitalId);

        res.json(dashboard);
    } catch (error) {
        console.error("Command Center Dashboard Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load command center",
            error: error.message
        });
    }
});

/* =========================================================
   PATIENTS
========================================================= */

router.get("/patients", function(req, res) {
    const hospitalId =
        req.query.hospitalId || HOSPITAL_ID;

    const patients = getPatients(hospitalId);

    res.json({
        success: true,
        count: patients.length,
        patients: patients
    });
});

router.post("/patients", function(req, res) {
    try {
        const hospitalId =
            req.body.hospitalId || HOSPITAL_ID;

        const {
            name,
            age,
            gender,
            phone,
            email,
            address,
            bloodGroup,
            emergencyContact
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Patient name is required"
            });
        }

        const db = readDatabase();

        const patient = {
            id: createId("PAT"),
            hospitalId: hospitalId,
            uhid:
                "GJH-" +
                new Date().getFullYear() +
                "-" +
                String(db.patients.length + 1).padStart(5, "0"),
            name: name,
            age: safeNumber(age),
            gender: gender || "",
            phone: phone || "",
            email: email || "",
            address: address || "",
            bloodGroup: bloodGroup || "",
            emergencyContact: emergencyContact || "",
            status: "active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        db.patients.push(patient);

        writeDatabase(db);

        res.status(201).json({
            success: true,
            message: "Patient registered successfully",
            patient: patient
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to create patient",
            error: error.message
        });
    }
});

/* =========================================================
   APPOINTMENTS
========================================================= */

router.get("/appointments", function(req, res) {
    const hospitalId =
        req.query.hospitalId || HOSPITAL_ID;

    const appointments = getAppointments(hospitalId);

    res.json({
        success: true,
        count: appointments.length,
        appointments: appointments
    });
});

router.post("/appointments", function(req, res) {
    try {
        const hospitalId =
            req.body.hospitalId || HOSPITAL_ID;

        const {
            patientId,
            patientName,
            doctorId,
            doctorName,
            date,
            time,
            type,
            reason
        } = req.body;

        if (!patientName) {
            return res.status(400).json({
                success: false,
                message: "Patient name is required"
            });
        }

        const db = readDatabase();

        const appointment = {
            id: createId("APT"),
            hospitalId: hospitalId,
            patientId: patientId || "",
            patientName: patientName,
            doctorId: doctorId || "",
            doctorName: doctorName || "",
            date: date || todayDate(),
            time: time || "",
            type: type || "OPD",
            reason: reason || "",
            status: "scheduled",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        db.appointments.push(appointment);

        writeDatabase(db);

        res.status(201).json({
            success: true,
            message: "Appointment created successfully",
            appointment: appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to create appointment",
            error: error.message
        });
    }
});

/* =========================================================
   BEDS
========================================================= */

router.get("/beds", function(req, res) {
    const hospitalId =
        req.query.hospitalId || HOSPITAL_ID;

    let beds = getBeds(hospitalId);

    if (!beds.length) {
        beds = seedBeds(hospitalId);
    }

    const summary = {
        total: beds.length,
        occupied: beds.filter(function(bed) {
            return bed.status === "occupied";
        }).length,
        available: beds.filter(function(bed) {
            return bed.status === "available";
        }).length,
        maintenance: beds.filter(function(bed) {
            return bed.status === "maintenance";
        }).length
    };

    res.json({
        success: true,
        summary: summary,
        beds: beds
    });
});

router.patch("/beds/:id/status", function(req, res) {
    const db = readDatabase();

    const bed = db.beds.find(function(item) {
        return item.id === req.params.id;
    });

    if (!bed) {
        return res.status(404).json({
            success: false,
            message: "Bed not found"
        });
    }

    const allowedStatuses = [
        "available",
        "occupied",
        "maintenance",
        "cleaning"
    ];

    if (
        req.body.status &&
        allowedStatuses.indexOf(req.body.status) === -1
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid bed status"
        });
    }

    bed.status = req.body.status || bed.status;
    bed.patientId = req.body.patientId || bed.patientId;
    bed.patientName = req.body.patientName || bed.patientName;
    bed.updatedAt = new Date().toISOString();

    writeDatabase(db);

    res.json({
        success: true,
        message: "Bed updated successfully",
        bed: bed
    });
});

/* =========================================================
   ADMISSIONS
========================================================= */

router.get("/admissions", function(req, res) {
    const hospitalId =
        req.query.hospitalId || HOSPITAL_ID;

    const db = readDatabase();

    const admissions = db.admissions.filter(function(item) {
        return item.hospitalId === hospitalId;
    });

    res.json({
        success: true,
        count: admissions.length,
        admissions: admissions
    });
});

router.post("/admissions", function(req, res) {
    try {
        const hospitalId =
            req.body.hospitalId || HOSPITAL_ID;

        const {
            patientId,
            patientName,
            doctorId,
            doctorName,
            ward,
            bedId,
            reason
        } = req.body;

        if (!patientName) {
            return res.status(400).json({
                success: false,
                message: "Patient name is required"
            });
        }

        const db = readDatabase();

        const admission = {
            id: createId("ADM"),
            hospitalId: hospitalId,
            patientId: patientId || "",
            patientName: patientName,
            doctorId: doctorId || "",
            doctorName: doctorName || "",
            ward: ward || "",
            bedId: bedId || "",
            reason: reason || "",
            status: "admitted",
            admittedAt: new Date().toISOString(),
            dischargedAt: null
        };

        db.admissions.push(admission);

        if (bedId) {
            const bed = db.beds.find(function(item) {
                return item.id === bedId;
            });

            if (bed) {
                bed.status = "occupied";
                bed.patientId = patientId || "";
                bed.patientName = patientName;
                bed.admissionId = admission.id;
                bed.updatedAt = new Date().toISOString();
            }
        }

        writeDatabase(db);

        res.status(201).json({
            success: true,
            message: "Patient admitted successfully",
            admission: admission
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to create admission",
            error: error.message
        });
    }
});

/* =========================================================
   EMERGENCY
========================================================= */

router.get("/emergency", function(req, res) {
    const hospitalId =
        req.query.hospitalId || HOSPITAL_ID;

    const db = readDatabase();

    const emergencies = db.emergencies.filter(function(item) {
        return item.hospitalId === hospitalId;
    });

    res.json({
        success: true,
        count: emergencies.length,
        emergencies: emergencies
    });
});

router.post("/emergency", function(req, res) {
    try {
        const hospitalId =
            req.body.hospitalId || HOSPITAL_ID;

        const emergency = {
            id: createId("EMR"),
            hospitalId: hospitalId,
            patientName: req.body.patientName || "",
            phone: req.body.phone || "",
            priority: req.body.priority || "normal",
            complaint: req.body.complaint || "",
            doctorId: req.body.doctorId || "",
            status: "open",
            createdAt: new Date().toISOString()
        };

        const db = readDatabase();

        db.emergencies.push(emergency);

        writeDatabase(db);

        res.status(201).json({
            success: true,
            message: "Emergency case registered",
            emergency: emergency
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to register emergency",
            error: error.message
        });
    }
});

/* =========================================================
   AMBULANCE
========================================================= */

router.get("/ambulances", function(req, res) {
    const hospitalId =
        req.query.hospitalId || HOSPITAL_ID;

    const db = readDatabase();

    const ambulances = db.ambulances.filter(function(item) {
        return item.hospitalId === hospitalId;
    });

    res.json({
        success: true,
        count: ambulances.length,
        ambulances: ambulances
    });
});

router.post("/ambulances", function(req, res) {
    const hospitalId =
        req.body.hospitalId || HOSPITAL_ID;

    const db = readDatabase();

    const ambulance = {
        id: createId("AMB"),
        hospitalId: hospitalId,
        vehicleNumber: req.body.vehicleNumber || "",
        driverName: req.body.driverName || "",
        driverPhone: req.body.driverPhone || "",
        status: req.body.status || "available",
        location: req.body.location || "",
        createdAt: new Date().toISOString()
    };

    db.ambulances.push(ambulance);

    writeDatabase(db);

    res.status(201).json({
        success: true,
        message: "Ambulance added successfully",
        ambulance: ambulance
    });
});

/* =========================================================
   ANALYTICS
========================================================= */

router.get("/analytics", function(req, res) {
    const hospitalId =
        req.query.hospitalId || HOSPITAL_ID;

    const dashboard = buildDashboard(hospitalId);

    const db = readDatabase();

    const patients = getPatients(hospitalId);

    const appointments = getAppointments(hospitalId);

    const monthlyPatients = patients.filter(function(patient) {
        return patient.createdAt &&
            String(patient.createdAt).slice(0, 7) ===
            new Date().toISOString().slice(0, 7);
    }).length;

    const monthlyAppointments = appointments.filter(function(item) {
        const date =
            item.date ||
            item.appointmentDate ||
            item.createdAt;

        return date &&
            String(date).slice(0, 7) ===
            new Date().toISOString().slice(0, 7);
    }).length;

    const expenses = db.expenses.filter(function(item) {
        return item.hospitalId === hospitalId;
    });

    let totalExpenses = 0;

    expenses.forEach(function(expense) {
        totalExpenses += safeNumber(expense.amount);
    });

    res.json({
        success: true,
        hospitalId: hospitalId,

        overview: {
            patients: patients.length,
            monthlyPatients: monthlyPatients,
            doctors: dashboard.summary.doctors,
            appointments: appointments.length,
            monthlyAppointments: monthlyAppointments,
            beds: dashboard.summary.beds,
            occupancy: dashboard.summary.occupancy,
            admissions: dashboard.summary.activeAdmissions,
            emergencies: dashboard.summary.emergencyCases,
            revenueToday: dashboard.summary.todayRevenue,
            pendingBilling: dashboard.summary.pendingBilling,
            expenses: totalExpenses
        },

        pharmacy: dashboard.pharmacy,

        operations: dashboard.operations,

        generatedAt: new Date().toISOString()
    });
});

/* =========================================================
   ALERTS
========================================================= */

router.get("/alerts", function(req, res) {
    const hospitalId =
        req.query.hospitalId || HOSPITAL_ID;

    const dashboard = buildDashboard(hospitalId);

    res.json({
        success: true,
        count: dashboard.alerts.length,
        alerts: dashboard.alerts
    });
});

/* =========================================================
   AUDIT LOG
========================================================= */

router.get("/audit-logs", function(req, res) {
    const hospitalId =
        req.query.hospitalId || HOSPITAL_ID;

    const db = readDatabase();

    const logs = db.auditLogs.filter(function(item) {
        return item.hospitalId === hospitalId;
    });

    res.json({
        success: true,
        count: logs.length,
        logs: logs
    });
});

router.post("/audit-logs", function(req, res) {
    const hospitalId =
        req.body.hospitalId || HOSPITAL_ID;

    const db = readDatabase();

    const log = {
        id: createId("LOG"),
        hospitalId: hospitalId,
        userId: req.body.userId || "",
        userName: req.body.userName || "",
        action: req.body.action || "",
        module: req.body.module || "",
        description: req.body.description || "",
        ip: req.body.ip || "",
        createdAt: new Date().toISOString()
    };

    db.auditLogs.push(log);

    writeDatabase(db);

    res.status(201).json({
        success: true,
        log: log
    });
});

/* =========================================================
   HEALTH
========================================================= */

router.get("/health", function(req, res) {
    res.json({
        success: true,
        module: "Hospital Command Center",
        status: "online",
        hospitalId:
            req.query.hospitalId || HOSPITAL_ID,
        timestamp: new Date().toISOString()
    });
});


router.get("/workflow-dashboard", (req, res) => {
    try {
        const fs = require("fs");
        const path = require("path");

        const file = path.join(
            __dirname,
            "../../data/clinical-workflow.json"
        );

        if (!fs.existsSync(file)) {
            return res.json({
                success: true,
                counts: {
                    visits: 0,
                    consultations: 0,
                    prescriptions: 0,
                    labOrders: 0,
                    labResults: 0,
                    pharmacyOrders: 0,
                    billingLinks: 0,
                    timelineEvents: 0,
                    auditEvents: 0
                },
                recentVisits: [],
                recentEvents: []
            });
        }

        const db = JSON.parse(fs.readFileSync(file, "utf8"));

        res.json({
            success: true,

            counts: {
                visits: (db.visits || []).length,
                consultations: (db.consultations || []).length,
                prescriptions: (db.prescriptions || []).length,
                labOrders: (db.labOrders || []).length,
                labResults: (db.labResults || []).length,
                pharmacyOrders: (db.pharmacyOrders || []).length,
                billingLinks: (db.billingLinks || []).length,
                timelineEvents: (db.timeline || []).length,
                auditEvents: (db.audit || []).length
            },

            recentVisits: (db.visits || []).slice(-10).reverse(),

            recentEvents: (db.timeline || []).slice(-20).reverse(),

            recentAudit: (db.audit || []).slice(-20).reverse()
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
});


router.get("/catalog", (req, res) => {
    try {
        const fs = require("fs");
        const path = require("path");

        const medicinesFile = path.join(
            __dirname,
            "../../data/medicines.json"
        );

        const doctorsFile = path.join(
            __dirname,
            "../../data/doctors.json"
        );

        let medicines = [];
        let doctors = [];

        if (fs.existsSync(medicinesFile)) {
            const medicinesRaw = fs.readFileSync(
                medicinesFile,
                "utf8"
            ).replace(/^\uFEFF/, "").trim();

            medicines = JSON.parse(medicinesRaw);
        }

        if (fs.existsSync(doctorsFile)) {
            const doctorsRaw = fs.readFileSync(
                doctorsFile,
                "utf8"
            ).replace(/^\uFEFF/, "").trim();

            doctors = JSON.parse(doctorsRaw);
        }

        const activeMedicines = medicines.filter(
            x => x.status === "active"
        );

        const activeDoctors = doctors.filter(
            x => x.status === "active"
        );

        const departments = [
            ...new Set(
                activeDoctors
                    .map(x => x.department)
                    .filter(Boolean)
            )
        ];

        const categories = [
            ...new Set(
                activeMedicines
                    .map(x => x.category)
                    .filter(Boolean)
            )
        ];

        res.json({
            success: true,

            counts: {
                medicines: medicines.length,
                activeMedicines: activeMedicines.length,
                doctors: doctors.length,
                activeDoctors: activeDoctors.length,
                departments: departments.length,
                medicineCategories: categories.length
            },

            doctors: activeDoctors.slice(0, 50),

            medicines: activeMedicines.slice(0, 110),

            departments,

            medicineCategories: categories
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
});

module.exports = router;



