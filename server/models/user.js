const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");
const DATA_FILE = path.join(DATA_DIR, "users.json");

const HOSPITAL_ID = "HOSP-TEST-001";

/* =========================================================
   ROLE PERMISSIONS
========================================================= */

const ROLE_PERMISSIONS = {
    super_admin: [
        "system.manage",
        "hospital.create",
        "hospital.update",
        "hospital.delete",
        "hospital.view",
        "subscription.manage",
        "users.manage",
        "reports.view",
        "analytics.view",
        "audit.view"
    ],

    hospital_admin: [
        "hospital.view",
        "hospital.update",
        "users.manage",
        "patients.manage",
        "doctors.manage",
        "nurses.manage",
        "appointments.manage",
        "reception.manage",
        "ipd.manage",
        "beds.manage",
        "pharmacy.view",
        "laboratory.view",
        "billing.view",
        "reports.view",
        "analytics.view",
        "ambulance.manage",
        "emergency.manage",
        "audit.view"
    ],

    doctor: [
        "patients.view",
        "patients.update",
        "appointments.view",
        "appointments.manage",
        "consultation.create",
        "consultation.update",
        "prescription.create",
        "prescription.update",
        "laboratory.order",
        "laboratory.view",
        "ipd.view",
        "beds.view",
        "reports.view"
    ],

    nurse: [
        "patients.view",
        "patients.update",
        "appointments.view",
        "vitals.manage",
        "nursing.manage",
        "ipd.view",
        "beds.view",
        "medication.view",
        "emergency.view"
    ],

    reception: [
        "patients.manage",
        "appointments.manage",
        "appointments.view",
        "billing.view",
        "billing.create",
        "doctors.view",
        "beds.view",
        "reception.manage"
    ],

    pharmacist: [
        "pharmacy.manage",
        "pharmacy.view",
        "inventory.manage",
        "inventory.view",
        "sales.create",
        "sales.view",
        "prescription.view",
        "billing.view"
    ],

    laboratory: [
        "laboratory.manage",
        "laboratory.view",
        "laboratory.test",
        "laboratory.report",
        "patients.view",
        "billing.view"
    ],

    accountant: [
        "billing.manage",
        "billing.view",
        "payments.manage",
        "reports.view",
        "analytics.view"
    ],

    manager: [
        "hospital.view",
        "patients.view",
        "doctors.view",
        "nurses.view",
        "appointments.view",
        "ipd.view",
        "beds.view",
        "pharmacy.view",
        "laboratory.view",
        "billing.view",
        "reports.view",
        "analytics.view"
    ],

    patient: [
        "profile.view",
        "profile.update",
        "appointments.view",
        "appointments.create",
        "consultation.view",
        "prescription.view",
        "laboratory.view",
        "billing.view"
    ]
};


/* =========================================================
   DOCTOR MASTER DATA
   50 DOCTORS
========================================================= */

const DOCTOR_MASTER = [
    ["Rajesh Sharma", "Cardiology", "MBBS, MD Cardiology"],
    ["Amit Verma", "Neurology", "MBBS, MD Neurology"],
    ["Neha Kapoor", "Gynecology", "MBBS, MD Gynecology"],
    ["Rahul Singh", "Orthopedics", "MBBS, MS Orthopedics"],
    ["Pooja Agarwal", "Pediatrics", "MBBS, MD Pediatrics"],
    ["Vivek Gupta", "General Medicine", "MBBS, MD Medicine"],
    ["Anjali Mehta", "Dermatology", "MBBS, MD Dermatology"],
    ["Saurabh Jain", "ENT", "MBBS, MS ENT"],
    ["Priya Sharma", "Ophthalmology", "MBBS, MS Ophthalmology"],
    ["Manish Bansal", "General Surgery", "MBBS, MS Surgery"],

    ["Ritika Arora", "Cardiology", "MBBS, MD Cardiology"],
    ["Nitin Yadav", "Neurology", "MBBS, DM Neurology"],
    ["Shweta Mishra", "Gynecology", "MBBS, MS Gynecology"],
    ["Karan Malhotra", "Orthopedics", "MBBS, MS Orthopedics"],
    ["Kavita Sharma", "Pediatrics", "MBBS, MD Pediatrics"],
    ["Deepak Chauhan", "General Medicine", "MBBS, MD Medicine"],
    ["Rohit Agarwal", "Dermatology", "MBBS, MD Dermatology"],
    ["Sneha Gupta", "ENT", "MBBS, MS ENT"],
    ["Vikas Saxena", "Ophthalmology", "MBBS, MS Ophthalmology"],
    ["Nisha Verma", "General Surgery", "MBBS, MS Surgery"],

    ["Arun Kumar", "Cardiology", "MBBS, DM Cardiology"],
    ["Meenakshi Joshi", "Neurology", "MBBS, MD Neurology"],
    ["Akash Tiwari", "Gynecology", "MBBS, MD Gynecology"],
    ["Shivani Kapoor", "Orthopedics", "MBBS, MS Orthopedics"],
    ["Mohit Sharma", "Pediatrics", "MBBS, MD Pediatrics"],
    ["Renu Gupta", "General Medicine", "MBBS, MD Medicine"],
    ["Harsh Vardhan", "Dermatology", "MBBS, MD Dermatology"],
    ["Swati Singh", "ENT", "MBBS, MS ENT"],
    ["Abhishek Jain", "Ophthalmology", "MBBS, MS Ophthalmology"],
    ["Monika Agarwal", "General Surgery", "MBBS, MS Surgery"],

    ["Sanjay Kumar", "Cardiology", "MBBS, MD Cardiology"],
    ["Divya Sharma", "Neurology", "MBBS, DM Neurology"],
    ["Gaurav Mittal", "Gynecology", "MBBS, MD Gynecology"],
    ["Komal Verma", "Orthopedics", "MBBS, MS Orthopedics"],
    ["Yash Gupta", "Pediatrics", "MBBS, MD Pediatrics"],
    ["Preeti Singh", "General Medicine", "MBBS, MD Medicine"],
    ["Tarun Bhatia", "Dermatology", "MBBS, MD Dermatology"],
    ["Ayesha Khan", "ENT", "MBBS, MS ENT"],
    ["Varun Mehra", "Ophthalmology", "MBBS, MS Ophthalmology"],
    ["Shalini Kapoor", "General Surgery", "MBBS, MS Surgery"],

    ["Rakesh Joshi", "Cardiology", "MBBS, MD Cardiology"],
    ["Simran Kaur", "Neurology", "MBBS, MD Neurology"],
    ["Ankit Srivastava", "Gynecology", "MBBS, MD Gynecology"],
    ["Bhavna Gupta", "Orthopedics", "MBBS, MS Orthopedics"],
    ["Devendra Singh", "Pediatrics", "MBBS, MD Pediatrics"],
    ["Sakshi Jain", "General Medicine", "MBBS, MD Medicine"],
    ["Pranav Agarwal", "Dermatology", "MBBS, MD Dermatology"],
    ["Isha Sharma", "ENT", "MBBS, MS ENT"],
    ["Naveen Kumar", "Ophthalmology", "MBBS, MS Ophthalmology"],
    ["Riya Mehta", "General Surgery", "MBBS, MS Surgery"]
];


/* =========================================================
   DEFAULT USERS
========================================================= */

function createDefaultUsers() {

    const now = new Date().toISOString();

    const users = [];

    /* ---------------- ADMIN ---------------- */

    users.push({
        id: "USR-001",
        hospitalId: HOSPITAL_ID,
        username: "admin",
        name: "Hospital Admin",
        email: "admin@gopaljoshihospital.com",
        phone: "+91-9999999999",
        password: "admin123",
        role: "hospital_admin",
        department: "Administration",
        specialization: "",
        qualification: "Hospital Administration",
        status: "active",
        permissions: ROLE_PERMISSIONS.hospital_admin,
        profile: {
            designation: "Hospital Administrator",
            experience: 10
        },
        lastLogin: null,
        createdAt: now,
        updatedAt: now
    });


    /* ---------------- MAIN DEMO DOCTOR LOGIN ---------------- */

    users.push({
        id: "USR-002",
        hospitalId: HOSPITAL_ID,
        username: "doctor",
        name: "Dr. Rajesh Sharma",
        email: "doctor@gopaljoshihospital.com",
        phone: "+91-9000000002",
        password: "doctor123",
        role: "doctor",
        department: "Cardiology",
        specialization: "Cardiology",
        qualification: "MBBS, MD Cardiology",
        status: "active",
        permissions: ROLE_PERMISSIONS.doctor,
        profile: {
            designation: "Senior Consultant",
            experience: 12,
            consultationFee: 800
        },
        lastLogin: null,
        createdAt: now,
        updatedAt: now
    });


    /* ---------------- PHARMACY LOGIN ---------------- */

    users.push({
        id: "USR-003",
        hospitalId: HOSPITAL_ID,
        username: "pharmacy",
        name: "Gopal Joshi Pharmacy",
        email: "pharmacy@gopaljoshihospital.com",
        phone: "+91-9000000003",
        password: "pharmacy123",
        role: "pharmacist",
        department: "Pharmacy",
        specialization: "",
        qualification: "D.Pharm",
        status: "active",
        permissions: ROLE_PERMISSIONS.pharmacist,
        profile: {
            designation: "Pharmacy Manager",
            experience: 8
        },
        lastLogin: null,
        createdAt: now,
        updatedAt: now
    });


    /* ---------------- LAB LOGIN ---------------- */

    users.push({
        id: "USR-004",
        hospitalId: HOSPITAL_ID,
        username: "laboratory",
        name: "Gopal Joshi Laboratory",
        email: "lab@gopaljoshihospital.com",
        phone: "+91-9000000004",
        password: "lab123",
        role: "laboratory",
        department: "Laboratory",
        specialization: "",
        qualification: "B.Sc MLT",
        status: "active",
        permissions: ROLE_PERMISSIONS.laboratory,
        profile: {
            designation: "Laboratory Manager",
            experience: 7
        },
        lastLogin: null,
        createdAt: now,
        updatedAt: now
    });


    /* =====================================================
       DOCTORS

       Rajesh Sharma already exists as USR-002.
       Therefore skip index 0 and create the remaining
       49 doctors here.
    ===================================================== */

    DOCTOR_MASTER.forEach(function (doctor, index) {

        const doctorNumber = index + 1;

        if (doctorNumber === 1) {
            return;
        }

        const actualDoctorNumber = doctorNumber - 1;
        const padded = String(actualDoctorNumber).padStart(2, "0");

        const username = "doctor" + padded;

        const email =
            "doctor" + padded + "@gopaljoshihospital.com";

        const phone =
            "+91-" + String(9000001000 + actualDoctorNumber);

        const experience =
            5 + ((actualDoctorNumber * 3) % 18);

        const consultationFee =
            500 + ((actualDoctorNumber * 50) % 1000);

        users.push({
            id: "DOC-" + padded,
            hospitalId: HOSPITAL_ID,
            username: username,
            name: "Dr. " + doctor[0],
            email: email,
            phone: phone,
            password: "doctor123",
            role: "doctor",
            department: doctor[1],
            specialization: doctor[1],
            qualification: doctor[2],
            status: "active",
            permissions: ROLE_PERMISSIONS.doctor,

            profile: {

                designation:
                    experience >= 15
                        ? "Senior Consultant"
                        : experience >= 10
                            ? "Consultant"
                            : "Medical Consultant",

                experience: experience,

                consultationFee: consultationFee,

                roomNumber:
                    "OPD-" +
                    String(
                        ((actualDoctorNumber - 1) % 20) + 1
                    ).padStart(2, "0"),

                availableDays: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday"
                ].slice(
                    0,
                    3 + (actualDoctorNumber % 4)
                ),

                availableTime:
                    actualDoctorNumber % 2 === 0
                        ? "10:00 AM - 02:00 PM"
                        : "02:00 PM - 06:00 PM"
            },

            lastLogin: null,
            createdAt: now,
            updatedAt: now
        });
    });


    /* =====================================================
       ADDITIONAL NURSE
    ===================================================== */

    users.push({
        id: "NUR-001",
        hospitalId: HOSPITAL_ID,
        username: "nurse",
        name: "Anita Sharma",
        email: "nurse@gopaljoshihospital.com",
        phone: "+91-9000002001",
        password: "nurse123",
        role: "nurse",
        department: "Nursing",
        specialization: "General Nursing",
        qualification: "B.Sc Nursing",
        status: "active",
        permissions: ROLE_PERMISSIONS.nurse,
        profile: {
            designation: "Senior Staff Nurse",
            experience: 8
        },
        lastLogin: null,
        createdAt: now,
        updatedAt: now
    });


    /* =====================================================
       RECEPTION
    ===================================================== */

    users.push({
        id: "REC-001",
        hospitalId: HOSPITAL_ID,
        username: "reception",
        name: "Priya Reception",
        email: "reception@gopaljoshihospital.com",
        phone: "+91-9000003001",
        password: "reception123",
        role: "reception",
        department: "Reception",
        specialization: "",
        qualification: "Hospital Administration",
        status: "active",
        permissions: ROLE_PERMISSIONS.reception,
        profile: {
            designation: "Reception Executive",
            experience: 4
        },
        lastLogin: null,
        createdAt: now,
        updatedAt: now
    });


    /* =====================================================
       MANAGER
    ===================================================== */

    users.push({
        id: "MGR-001",
        hospitalId: HOSPITAL_ID,
        username: "manager",
        name: "Hospital Manager",
        email: "manager@gopaljoshihospital.com",
        phone: "+91-9000004001",
        password: "manager123",
        role: "manager",
        department: "Management",
        specialization: "",
        qualification: "MBA Hospital Management",
        status: "active",
        permissions: ROLE_PERMISSIONS.manager,
        profile: {
            designation: "Hospital Operations Manager",
            experience: 9
        },
        lastLogin: null,
        createdAt: now,
        updatedAt: now
    });


    return users;
}


/* =========================================================
   INITIALIZE DATA
========================================================= */

function ensureDataDirectory() {

    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, {
            recursive: true
        });
    }
}


function initializeDatabase() {

    ensureDataDirectory();

    if (!fs.existsSync(DATA_FILE)) {

        const defaultUsers = createDefaultUsers();

        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(defaultUsers, null, 2),
            "utf8"
        );

        return defaultUsers;
    }

    try {

        const data = fs.readFileSync(
            DATA_FILE,
            "utf8"
        );

        if (!data.trim()) {

            const defaultUsers = createDefaultUsers();

            fs.writeFileSync(
                DATA_FILE,
                JSON.stringify(defaultUsers, null, 2),
                "utf8"
            );

            return defaultUsers;
        }

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "User database read error:",
            error
        );

        const defaultUsers = createDefaultUsers();

        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(defaultUsers, null, 2),
            "utf8"
        );

        return defaultUsers;
    }
}


function saveUsers(users) {

    ensureDataDirectory();

    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(users, null, 2),
        "utf8"
    );

    return users;
}


/* =========================================================
   BASIC GETTERS
========================================================= */

function getUsers() {
    return initializeDatabase();
}


function getUsersByHospital(hospitalId) {

    return getUsers().filter(
        function (user) {
            return user.hospitalId === hospitalId;
        }
    );
}


function getActiveUsersByHospital(hospitalId) {

    return getUsersByHospital(hospitalId).filter(
        function (user) {
            return user.status === "active";
        }
    );
}


function getUserById(id) {

    return getUsers().find(
        function (user) {
            return user.id === id;
        }
    ) || null;
}


function getUserByUsername(username) {

    if (!username) {
        return null;
    }

    const search = String(username).toLowerCase();

    return getUsers().find(
        function (user) {
            return String(user.username).toLowerCase() === search;
        }
    ) || null;
}


function getUserByEmail(email) {

    if (!email) {
        return null;
    }

    const search = String(email).toLowerCase();

    return getUsers().find(
        function (user) {
            return String(user.email || "").toLowerCase() === search;
        }
    ) || null;
}


/* =========================================================
   AUTHENTICATION
========================================================= */

function authenticateUser(username, password) {

    const user = getUserByUsername(username);

    if (!user) {
        return null;
    }

    if (user.status !== "active") {
        return null;
    }

    if (user.password !== password) {
        return null;
    }

    return user;
}


/* =========================================================
   CREATE USER
========================================================= */

function createUser(data) {

    const users = getUsers();

    if (!data.hospitalId) {
        throw new Error("hospitalId is required");
    }

    if (!data.username) {
        throw new Error("username is required");
    }

    if (!data.name) {
        throw new Error("name is required");
    }

    if (!data.password) {
        throw new Error("password is required");
    }

    const usernameExists = users.some(
        function (user) {
            return (
                user.hospitalId === data.hospitalId &&
                String(user.username).toLowerCase() ===
                String(data.username).toLowerCase()
            );
        }
    );

    if (usernameExists) {
        throw new Error("Username already exists");
    }

    if (data.email) {

        const emailExists = users.some(
            function (user) {
                return (
                    user.hospitalId === data.hospitalId &&
                    user.email &&
                    String(user.email).toLowerCase() ===
                    String(data.email).toLowerCase()
                );
            }
        );

        if (emailExists) {
            throw new Error("Email already exists");
        }
    }

    const role = data.role || "patient";

    const user = {

        id:
            data.id ||
            "USR-" + String(Date.now()).slice(-8),

        hospitalId: data.hospitalId,

        username: data.username,

        name: data.name,

        email: data.email || "",

        phone: data.phone || "",

        password: data.password,

        role: role,

        department: data.department || "",

        specialization: data.specialization || "",

        qualification: data.qualification || "",

        status: data.status || "active",

        permissions:
            data.permissions ||
            ROLE_PERMISSIONS[role] ||
            [],

        profile: data.profile || {},

        lastLogin: null,

        createdAt: new Date().toISOString(),

        updatedAt: new Date().toISOString()
    };

    users.push(user);

    saveUsers(users);

    return user;
}


/* =========================================================
   UPDATE USER
========================================================= */

function updateUser(id, updates) {

    const users = getUsers();

    const index = users.findIndex(
        function (user) {
            return user.id === id;
        }
    );

    if (index === -1) {
        return null;
    }

    const oldUser = users[index];

    const updatedUser = {

        ...oldUser,

        ...updates,

        id: oldUser.id,

        hospitalId: oldUser.hospitalId,

        username: oldUser.username,

        updatedAt: new Date().toISOString()
    };

    if (updates.role) {

        updatedUser.permissions =
            updates.permissions ||
            ROLE_PERMISSIONS[updates.role] ||
            [];
    }

    users[index] = updatedUser;

    saveUsers(users);

    return updatedUser;
}


/* =========================================================
   USER STATUS
========================================================= */

function activateUser(id) {

    return updateUser(id, {
        status: "active"
    });
}


function deactivateUser(id) {

    return updateUser(id, {
        status: "inactive"
    });
}


function suspendUser(id) {

    return updateUser(id, {
        status: "suspended"
    });
}


/* =========================================================
   ROLE FILTERS
========================================================= */

function getUsersByRole(hospitalId, role) {

    return getUsersByHospital(hospitalId).filter(
        function (user) {
            return user.role === role;
        }
    );
}


function getDoctors(hospitalId) {

    return getUsersByRole(
        hospitalId,
        "doctor"
    ).filter(
        function (user) {
            return user.status === "active";
        }
    );
}


function getNurses(hospitalId) {

    return getUsersByRole(
        hospitalId,
        "nurse"
    ).filter(
        function (user) {
            return user.status === "active";
        }
    );
}


/* =========================================================
   SEARCH
========================================================= */

function searchUsers(hospitalId, query) {

    const users = getUsersByHospital(hospitalId);

    if (!query) {
        return users;
    }

    const search = String(query).toLowerCase();

    return users.filter(
        function (user) {

            return (
                String(user.name || "")
                    .toLowerCase()
                    .includes(search) ||

                String(user.username || "")
                    .toLowerCase()
                    .includes(search) ||

                String(user.email || "")
                    .toLowerCase()
                    .includes(search) ||

                String(user.phone || "")
                    .toLowerCase()
                    .includes(search) ||

                String(user.role || "")
                    .toLowerCase()
                    .includes(search) ||

                String(user.department || "")
                    .toLowerCase()
                    .includes(search) ||

                String(user.specialization || "")
                    .toLowerCase()
                    .includes(search)
            );
        }
    );
}


/* =========================================================
   PERMISSIONS
========================================================= */

function hasPermission(userId, permission) {

    const user = getUserById(userId);

    if (!user) {
        return false;
    }

    if (user.role === "super_admin") {
        return true;
    }

    return (
        Array.isArray(user.permissions) &&
        user.permissions.includes(permission)
    );
}


function hasRole(userId, role) {

    const user = getUserById(userId);

    if (!user) {
        return false;
    }

    return user.role === role;
}


function hasHospitalAccess(userId, hospitalId) {

    const user = getUserById(userId);

    if (!user) {
        return false;
    }

    if (user.role === "super_admin") {
        return true;
    }

    return user.hospitalId === hospitalId;
}


/* =========================================================
   SANITIZE
========================================================= */

function sanitizeUser(user) {

    if (!user) {
        return null;
    }

    const safeUser = {
        ...user
    };

    delete safeUser.password;

    return safeUser;
}


function sanitizeUsers(users) {

    return users.map(
        function (user) {
            return sanitizeUser(user);
        }
    );
}


/* =========================================================
   LOGIN TRACKING
========================================================= */

function updateLastLogin(id) {

    return updateUser(id, {
        lastLogin: new Date().toISOString()
    });
}


/* =========================================================
   USER STATISTICS
========================================================= */

function getUserStats(hospitalId) {

    const users = getUsersByHospital(hospitalId);

    const doctors = users.filter(
        function (user) {
            return (
                user.role === "doctor" &&
                user.status === "active"
            );
        }
    );

    const nurses = users.filter(
        function (user) {
            return (
                user.role === "nurse" &&
                user.status === "active"
            );
        }
    );

    const patients = users.filter(
        function (user) {
            return (
                user.role === "patient" &&
                user.status === "active"
            );
        }
    );

    const activeUsers = users.filter(
        function (user) {
            return user.status === "active";
        }
    );

    const inactiveUsers = users.filter(
        function (user) {
            return user.status === "inactive";
        }
    );

    const suspendedUsers = users.filter(
        function (user) {
            return user.status === "suspended";
        }
    );

    const roleCounts = {};

    users.forEach(
        function (user) {

            if (!roleCounts[user.role]) {
                roleCounts[user.role] = 0;
            }

            roleCounts[user.role]++;
        }
    );

    return {

        hospitalId: hospitalId,

        totalUsers: users.length,

        activeUsers: activeUsers.length,

        inactiveUsers: inactiveUsers.length,

        suspendedUsers: suspendedUsers.length,

        totalDoctors: doctors.length,

        activeDoctors: doctors.length,

        totalNurses: nurses.length,

        activeNurses: nurses.length,

        totalPatients: patients.length,

        activePatients: patients.length,

        roleCounts: roleCounts
    };
}


/* =========================================================
   ROLE INFORMATION
========================================================= */

function getRolePermissions(role) {

    return ROLE_PERMISSIONS[role] || [];
}


function getAvailableRoles() {

    return Object.keys(
        ROLE_PERMISSIONS
    );
}


/* =========================================================
   DOCTOR HELPERS
========================================================= */

function getDoctorCount(hospitalId) {

    return getDoctors(hospitalId).length;
}


function getDoctorById(id) {

    const user = getUserById(id);

    if (!user || user.role !== "doctor") {
        return null;
    }

    return user;
}


function getDoctorByUsername(username) {

    const user = getUserByUsername(username);

    if (!user || user.role !== "doctor") {
        return null;
    }

    return user;
}


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {

    ROLE_PERMISSIONS,

    getUsers,

    getUsersByHospital,

    getActiveUsersByHospital,

    getUserById,

    getUserByUsername,

    getUserByEmail,

    authenticateUser,

    createUser,

    updateUser,

    activateUser,

    deactivateUser,

    suspendUser,

    getUsersByRole,

    getDoctors,

    getNurses,

    searchUsers,

    hasPermission,

    hasRole,

    hasHospitalAccess,

    sanitizeUser,

    sanitizeUsers,

    updateLastLogin,

    getUserStats,

    getRolePermissions,

    getAvailableRoles,

    getDoctorCount,

    getDoctorById,

    getDoctorByUsername,

    initializeDatabase
};


/* =========================================================
   INITIALIZE ON SERVER START
========================================================= */

initializeDatabase();

console.log(
    "User database initialized: " +
    getUsers().length +
    " users"
);

console.log(
    "Hospital " +
    HOSPITAL_ID +
    " doctors: " +
    getDoctors(HOSPITAL_ID).length
);