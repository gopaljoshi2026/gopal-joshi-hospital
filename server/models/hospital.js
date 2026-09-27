const fs = require("fs");
const path = require("path");

// =====================================================
// GOPAL JOSHI HOSPITAL
// MULTI-TENANT HOSPITAL MODEL
// =====================================================

const DATA_DIR = path.join(
    __dirname,
    "..",
    "data"
);

const DATA_FILE = path.join(
    DATA_DIR,
    "hospitals.json"
);

// =====================================================
// DEFAULT HOSPITAL
// =====================================================

const DEFAULT_HOSPITAL = {
    id: "HOSP-TEST-001",

    name: "Gopal Joshi Hospital",

    legalName:
        "Gopal Joshi Hospital Private Limited",

    code: "GJH001",

    email:
        "admin@gopaljoshihospital.com",

    phone:
        "+91-9999999999",

    alternatePhone:
        "",

    address: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        country: "India",
        pincode: ""
    },

    logo: "",

    branding: {
        primaryColor: "#2563eb",
        secondaryColor: "#0f172a",
        accentColor: "#16a34a"
    },

    departments: [
        "General Medicine",
        "Cardiology",
        "Orthopedics",
        "Pediatrics",
        "Gynecology",
        "Emergency",
        "Laboratory",
        "Pharmacy"
    ],

    subscription: {
        plan: "professional",
        status: "active",

        startDate:
            new Date().toISOString(),

        expiryDate: "",

        maxUsers: 100,

        maxPatients: 10000,

        maxBranches: 1
    },

    features: {
        appointments: true,
        patients: true,
        doctors: true,
        nurses: true,

        ipd: true,
        opd: true,

        beds: true,
        pharmacy: true,
        laboratory: true,
        billing: true,

        ambulance: true,
        emergency: true,

        reports: true,
        analytics: true,
        notifications: true,

        patientPortal: true,
        doctorPortal: true,

        auditLogs: true
    },

    status: "active",

    settings: {
        timezone:
            "Asia/Kolkata",

        currency: "INR",

        language: "en-IN",

        dateFormat:
            "DD/MM/YYYY",

        appointmentDuration:
            15,

        autoGenerateUHID:
            true,

        autoGenerateInvoice:
            true,

        enableNotifications:
            true
    },

    createdAt:
        new Date().toISOString(),

    updatedAt:
        new Date().toISOString()
};

// =====================================================
// ENSURE DATA DIRECTORY
// =====================================================

function ensureDataDirectory() {

    if (!fs.existsSync(DATA_DIR)) {

        fs.mkdirSync(
            DATA_DIR,
            {
                recursive: true
            }
        );
    }
}

// =====================================================
// INITIALIZE DATABASE
// =====================================================

function initializeDatabase() {

    try {

        ensureDataDirectory();

        if (
            !fs.existsSync(DATA_FILE)
        ) {

            fs.writeFileSync(
                DATA_FILE,
                JSON.stringify(
                    [DEFAULT_HOSPITAL],
                    null,
                    2
                ),
                "utf8"
            );

            return;
        }

        const raw =
            fs.readFileSync(
                DATA_FILE,
                "utf8"
            );

        if (!raw.trim()) {

            fs.writeFileSync(
                DATA_FILE,
                JSON.stringify(
                    [DEFAULT_HOSPITAL],
                    null,
                    2
                ),
                "utf8"
            );

            return;
        }

        const hospitals =
            JSON.parse(raw);

        if (
            !Array.isArray(
                hospitals
            )
        ) {

            fs.writeFileSync(
                DATA_FILE,
                JSON.stringify(
                    [DEFAULT_HOSPITAL],
                    null,
                    2
                ),
                "utf8"
            );
        }

    } catch (error) {

        console.error(
            "Hospital database initialization error:",
            error.message
        );
    }
}

// =====================================================
// READ HOSPITALS
// =====================================================

function readHospitals() {

    try {

        initializeDatabase();

        const raw =
            fs.readFileSync(
                DATA_FILE,
                "utf8"
            );

        const hospitals =
            JSON.parse(raw);

        if (
            !Array.isArray(
                hospitals
            )
        ) {
            return [];
        }

        return hospitals;

    } catch (error) {

        console.error(
            "Hospital data read error:",
            error.message
        );

        return [];
    }
}

// =====================================================
// WRITE HOSPITALS
// =====================================================

function writeHospitals(
    hospitals
) {

    try {

        ensureDataDirectory();

        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(
                hospitals,
                null,
                2
            ),
            "utf8"
        );

        return true;

    } catch (error) {

        console.error(
            "Hospital data write error:",
            error.message
        );

        return false;
    }
}

// =====================================================
// GENERATE HOSPITAL ID
// =====================================================

function generateHospitalId(
    hospitals
) {

    let number =
        hospitals.length + 1;

    let id =
        `HOSP-${String(number).padStart(3, "0")}`;

    while (
        hospitals.some(
            hospital =>
                hospital.id === id
        )
    ) {

        number++;

        id =
            `HOSP-${String(number).padStart(3, "0")}`;
    }

    return id;
}

// =====================================================
// GENERATE HOSPITAL CODE
// =====================================================

function generateHospitalCode(
    name,
    hospitals
) {

    const base =
        String(name || "HOSPITAL")
            .replace(
                /[^a-zA-Z0-9]/g,
                ""
            )
            .substring(
                0,
                5
            )
            .toUpperCase();

    let code =
        `${base || "HOSP"}001`;

    let number = 1;

    while (
        hospitals.some(
            hospital =>
                hospital.code === code
        )
    ) {

        number++;

        code =
            `${base || "HOSP"}${String(
                number
            ).padStart(3, "0")}`;
    }

    return code;
}

// =====================================================
// GET ALL HOSPITALS
// =====================================================

function getHospitals() {

    return readHospitals();
}

// =====================================================
// GET ACTIVE HOSPITALS
// =====================================================

function getActiveHospitals() {

    return readHospitals().filter(
        hospital =>
            hospital.status ===
            "active"
    );
}

// =====================================================
// GET HOSPITAL BY ID
// =====================================================

function getHospitalById(
    hospitalId
) {

    if (!hospitalId) {
        return null;
    }

    return readHospitals().find(
        hospital =>
            hospital.id ===
            hospitalId
    ) || null;
}

// =====================================================
// GET HOSPITAL BY CODE
// =====================================================

function getHospitalByCode(
    code
) {

    if (!code) {
        return null;
    }

    return readHospitals().find(
        hospital =>
            String(
                hospital.code
            ).toUpperCase() ===
            String(
                code
            ).toUpperCase()
    ) || null;
}

// =====================================================
// CREATE HOSPITAL
// =====================================================

function createHospital(
    data = {}
) {

    const hospitals =
        readHospitals();

    const now =
        new Date().toISOString();

    const hospitalName =
        data.name ||
        "New Hospital";

    const hospital = {

        id:
            generateHospitalId(
                hospitals
            ),

        name:
            hospitalName,

        legalName:
            data.legalName ||
            hospitalName,

        code:
            data.code ||
            generateHospitalCode(
                hospitalName,
                hospitals
            ),

        email:
            data.email || "",

        phone:
            data.phone || "",

        alternatePhone:
            data.alternatePhone || "",

        address: {
            line1:
                data.address?.line1 ||
                "",

            line2:
                data.address?.line2 ||
                "",

            city:
                data.address?.city ||
                "",

            state:
                data.address?.state ||
                "",

            country:
                data.address?.country ||
                "India",

            pincode:
                data.address?.pincode ||
                ""
        },

        logo:
            data.logo || "",

        branding: {
            ...DEFAULT_HOSPITAL.branding,

            ...(data.branding || {})
        },

        departments:
            Array.isArray(
                data.departments
            )
                ? data.departments
                : [
                    ...DEFAULT_HOSPITAL.departments
                ],

        subscription: {
            ...DEFAULT_HOSPITAL.subscription,

            ...(data.subscription || {})
        },

        features: {
            ...DEFAULT_HOSPITAL.features,

            ...(data.features || {})
        },

        status:
            data.status ||
            "active",

        settings: {
            ...DEFAULT_HOSPITAL.settings,

            ...(data.settings || {})
        },

        createdAt:
            now,

        updatedAt:
            now
    };

    hospitals.push(
        hospital
    );

    writeHospitals(
        hospitals
    );

    return hospital;
}

// =====================================================
// UPDATE HOSPITAL
// =====================================================

function updateHospital(
    hospitalId,
    updates = {}
) {

    const hospitals =
        readHospitals();

    const index =
        hospitals.findIndex(
            hospital =>
                hospital.id ===
                hospitalId
        );

    if (index === -1) {
        return null;
    }

    const existing =
        hospitals[index];

    const updatedHospital = {

        ...existing,

        ...updates,

        id:
            existing.id,

        createdAt:
            existing.createdAt,

        updatedAt:
            new Date().toISOString(),

        address: {
            ...(existing.address || {}),

            ...(updates.address || {})
        },

        branding: {
            ...(existing.branding || {}),

            ...(updates.branding || {})
        },

        subscription: {
            ...(existing.subscription || {}),

            ...(updates.subscription || {})
        },

        features: {
            ...(existing.features || {}),

            ...(updates.features || {})
        },

        settings: {
            ...(existing.settings || {}),

            ...(updates.settings || {})
        }
    };

    hospitals[index] =
        updatedHospital;

    writeHospitals(
        hospitals
    );

    return updatedHospital;
}

// =====================================================
// ACTIVATE HOSPITAL
// =====================================================

function activateHospital(
    hospitalId
) {

    return updateHospital(
        hospitalId,
        {
            status: "active"
        }
    );
}

// =====================================================
// SUSPEND HOSPITAL
// =====================================================

function suspendHospital(
    hospitalId
) {

    return updateHospital(
        hospitalId,
        {
            status: "suspended"
        }
    );
}

// =====================================================
// ARCHIVE HOSPITAL
// =====================================================

function archiveHospital(
    hospitalId
) {

    return updateHospital(
        hospitalId,
        {
            status: "archived"
        }
    );
}

// =====================================================
// HOSPITAL ACCESS CHECK
// =====================================================

function hasHospitalAccess(
    hospitalId
) {

    const hospital =
        getHospitalById(
            hospitalId
        );

    if (!hospital) {

        return {
            allowed: false,
            reason:
                "Hospital not found"
        };
    }

    if (
        hospital.status !==
        "active"
    ) {

        return {
            allowed: false,

            reason:
                `Hospital account is ${hospital.status}`
        };
    }

    if (
        hospital.subscription &&
        hospital.subscription.status !==
        "active"
    ) {

        return {
            allowed: false,

            reason:
                "Hospital subscription is not active"
        };
    }

    return {
        allowed: true,

        reason:
            "Hospital access granted"
    };
}

// =====================================================
// FEATURE ACCESS
// =====================================================

function hasFeature(
    hospitalId,
    feature
) {

    const hospital =
        getHospitalById(
            hospitalId
        );

    if (!hospital) {
        return false;
    }

    const access =
        hasHospitalAccess(
            hospitalId
        );

    if (!access.allowed) {
        return false;
    }

    return (
        hospital.features &&
        hospital.features[feature] ===
        true
    );
}

// =====================================================
// GET SUBSCRIPTION
// =====================================================

function getSubscription(
    hospitalId
) {

    const hospital =
        getHospitalById(
            hospitalId
        );

    if (!hospital) {
        return null;
    }

    return (
        hospital.subscription ||
        null
    );
}

// =====================================================
// GET HOSPITAL STATISTICS
// =====================================================

function getHospitalStats(
    hospitalId
) {

    const hospital =
        getHospitalById(
            hospitalId
        );

    if (!hospital) {
        return null;
    }

    return {

        hospitalId:
            hospital.id,

        hospitalName:
            hospital.name,

        status:
            hospital.status,

        subscription:
            hospital.subscription?.plan ||
            "unknown",

        subscriptionStatus:
            hospital.subscription?.status ||
            "unknown",

        departments:
            Array.isArray(
                hospital.departments
            )
                ? hospital.departments.length
                : 0,

        enabledFeatures:
            Object.values(
                hospital.features || {}
            ).filter(
                value =>
                    value === true
            ).length,

        totalFeatures:
            Object.keys(
                hospital.features || {}
            ).length,

        createdAt:
            hospital.createdAt,

        updatedAt:
            hospital.updatedAt
    };
}

// =====================================================
// CHECK UNIQUE HOSPITAL CODE
// =====================================================

function isHospitalCodeAvailable(
    code,
    excludeHospitalId = null
) {

    if (!code) {
        return false;
    }

    const hospitals =
        readHospitals();

    return !hospitals.some(
        hospital =>
            String(
                hospital.code
            ).toUpperCase() ===
            String(
                code
            ).toUpperCase() &&
            hospital.id !==
                excludeHospitalId
    );
}

// =====================================================
// SEARCH HOSPITALS
// =====================================================

function searchHospitals(
    query = ""
) {

    const hospitals =
        readHospitals();

    const search =
        String(query)
            .trim()
            .toLowerCase();

    if (!search) {
        return hospitals;
    }

    return hospitals.filter(
        hospital => {

            return (

                String(
                    hospital.id || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    hospital.name || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    hospital.code || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    hospital.email || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    hospital.phone || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    hospital.address?.city ||
                    ""
                )
                    .toLowerCase()
                    .includes(search)
            );
        }
    );
}

// =====================================================
// DELETE / REMOVE HOSPITAL
// =====================================================
//
// Hard delete intentionally avoided.
// Hospital SaaS data should normally be archived.
//

function removeHospital(
    hospitalId
) {

    return archiveHospital(
        hospitalId
    );
}

// =====================================================
// DATABASE INITIALIZATION
// =====================================================

initializeDatabase();

// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    getHospitals,

    getActiveHospitals,

    getHospitalById,

    getHospitalByCode,

    createHospital,

    updateHospital,

    activateHospital,

    suspendHospital,

    archiveHospital,

    removeHospital,

    hasHospitalAccess,

    hasFeature,

    getSubscription,

    getHospitalStats,

    isHospitalCodeAvailable,

    searchHospitals
};