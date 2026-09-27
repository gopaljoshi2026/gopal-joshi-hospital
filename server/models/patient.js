const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "patients.json");

const HOSPITAL_ID = "HOSP-TEST-001";

function ensureStorage() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, "[]", "utf8");
    }
}

function readPatients() {
    ensureStorage();

    try {
        const data = fs.readFileSync(DATA_FILE, "utf8");
        const patients = JSON.parse(data);

        return Array.isArray(patients) ? patients : [];
    } catch (error) {
        return [];
    }
}

function savePatients(patients) {
    ensureStorage();

    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(patients, null, 2),
        "utf8"
    );

    return patients;
}

function generateUHID(hospitalId = HOSPITAL_ID) {
    const patients = readPatients();

    const hospitalPatients = patients.filter(
        patient => patient.hospitalId === hospitalId
    );

    const nextNumber = hospitalPatients.length + 1;

    return (
        "GJH-" +
        String(new Date().getFullYear()).slice(-2) +
        "-" +
        String(nextNumber).padStart(5, "0")
    );
}

function generatePatientId() {
    const patients = readPatients();

    const nextNumber = patients.length + 1;

    return "PAT-" + String(nextNumber).padStart(5, "0");
}

function calculateAge(dateOfBirth) {
    if (!dateOfBirth) {
        return null;
    }

    const dob = new Date(dateOfBirth);

    if (Number.isNaN(dob.getTime())) {
        return null;
    }

    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();

    const monthDifference =
        today.getMonth() - dob.getMonth();

    if (
        monthDifference < 0 ||
        (
            monthDifference === 0 &&
            today.getDate() < dob.getDate()
        )
    ) {
        age--;
    }

    return age >= 0 ? age : null;
}

function normalizePatient(input = {}) {
    const now = new Date().toISOString();

    return {
        id: input.id || generatePatientId(),

        hospitalId:
            input.hospitalId ||
            HOSPITAL_ID,

        uhid:
            input.uhid ||
            generateUHID(
                input.hospitalId ||
                HOSPITAL_ID
            ),

        registrationNumber:
            input.registrationNumber ||
            null,

        name:
            String(input.name || "").trim(),

        firstName:
            String(input.firstName || "").trim(),

        lastName:
            String(input.lastName || "").trim(),

        gender:
            input.gender || "",

        dateOfBirth:
            input.dateOfBirth || null,

        age:
            input.age !== undefined &&
            input.age !== null &&
            input.age !== ""
                ? Number(input.age)
                : calculateAge(input.dateOfBirth),

        bloodGroup:
            input.bloodGroup || "",

        maritalStatus:
            input.maritalStatus || "",

        phone:
            String(input.phone || "").trim(),

        alternatePhone:
            String(input.alternatePhone || "").trim(),

        email:
            String(input.email || "").trim(),

        address: {
            line1:
                input.address?.line1 ||
                input.address ||
                "",

            city:
                input.address?.city ||
                "",

            state:
                input.address?.state ||
                "",

            pincode:
                input.address?.pincode ||
                "",

            country:
                input.address?.country ||
                "India"
        },

        emergencyContact: {
            name:
                input.emergencyContact?.name ||
                "",

            relationship:
                input.emergencyContact?.relationship ||
                "",

            phone:
                input.emergencyContact?.phone ||
                ""
        },

        allergies:
            Array.isArray(input.allergies)
                ? input.allergies
                : [],

        medicalHistory:
            Array.isArray(input.medicalHistory)
                ? input.medicalHistory
                : [],

        currentMedications:
            Array.isArray(input.currentMedications)
                ? input.currentMedications
                : [],

        chronicConditions:
            Array.isArray(input.chronicConditions)
                ? input.chronicConditions
                : [],

        documents:
            Array.isArray(input.documents)
                ? input.documents
                : [],

        insurance: {
            provider:
                input.insurance?.provider ||
                "",

            policyNumber:
                input.insurance?.policyNumber ||
                "",

            validTill:
                input.insurance?.validTill ||
                ""
        },

        portal: {
            enabled:
                input.portal?.enabled === true,

            username:
                input.portal?.username ||
                null
        },

        stats: {
            totalVisits: 0,
            totalAppointments: 0,
            totalAdmissions: 0,
            totalBills: 0,
            totalLabOrders: 0,
            totalPrescriptions: 0
        },

        status:
            input.status ||
            "active",

        tags:
            Array.isArray(input.tags)
                ? input.tags
                : [],

        notes:
            input.notes || "",

        createdAt:
            input.createdAt ||
            now,

        updatedAt:
            now,

        lastVisitAt:
            input.lastVisitAt ||
            null
    };
}

function createPatient(data = {}) {
    const patients = readPatients();

    if (!data.name) {
        throw new Error("Patient name is required");
    }

    if (!data.phone) {
        throw new Error("Patient phone is required");
    }

    const hospitalId =
        data.hospitalId ||
        HOSPITAL_ID;

    const duplicate = patients.find(
        patient =>
            patient.hospitalId === hospitalId &&
            patient.phone === data.phone &&
            patient.name.toLowerCase() ===
                String(data.name).toLowerCase()
    );

    if (duplicate) {
        throw new Error(
            "Patient already exists"
        );
    }

    const patient = normalizePatient({
        ...data,
        hospitalId
    });

    patients.push(patient);

    savePatients(patients);

    return patient;
}

function getPatients(hospitalId = HOSPITAL_ID) {
    return readPatients().filter(
        patient =>
            patient.hospitalId === hospitalId
    );
}

function getPatientById(
    patientId,
    hospitalId = HOSPITAL_ID
) {
    return readPatients().find(
        patient =>
            patient.id === patientId &&
            patient.hospitalId === hospitalId
    ) || null;
}

function getPatientByUHID(
    uhid,
    hospitalId = HOSPITAL_ID
) {
    return readPatients().find(
        patient =>
            patient.uhid === uhid &&
            patient.hospitalId === hospitalId
    ) || null;
}

function updatePatient(
    patientId,
    hospitalId,
    updates = {}
) {
    const patients = readPatients();

    const index = patients.findIndex(
        patient =>
            patient.id === patientId &&
            patient.hospitalId === hospitalId
    );

    if (index === -1) {
        return null;
    }

    const existing = patients[index];

    const updated = {
        ...existing,
        ...updates,

        address: {
            ...existing.address,
            ...(updates.address || {})
        },

        emergencyContact: {
            ...existing.emergencyContact,
            ...(updates.emergencyContact || {})
        },

        insurance: {
            ...existing.insurance,
            ...(updates.insurance || {})
        },

        portal: {
            ...existing.portal,
            ...(updates.portal || {})
        },

        age:
            updates.dateOfBirth
                ? calculateAge(
                    updates.dateOfBirth
                )
                : (
                    updates.age !== undefined
                        ? Number(updates.age)
                        : existing.age
                ),

        updatedAt:
            new Date().toISOString()
    };

    patients[index] = updated;

    savePatients(patients);

    return updated;
}

function updatePatientStats(
    patientId,
    hospitalId,
    stats = {}
) {
    const patient =
        getPatientById(
            patientId,
            hospitalId
        );

    if (!patient) {
        return null;
    }

    const currentStats =
        patient.stats || {};

    return updatePatient(
        patientId,
        hospitalId,
        {
            stats: {
                ...currentStats,
                ...stats
            }
        }
    );
}

function searchPatients(
    hospitalId,
    query
) {
    const patients =
        getPatients(hospitalId);

    const search =
        String(query || "")
            .trim()
            .toLowerCase();

    if (!search) {
        return patients;
    }

    return patients.filter(patient => {
        return (
            String(patient.name || "")
                .toLowerCase()
                .includes(search) ||

            String(patient.uhid || "")
                .toLowerCase()
                .includes(search) ||

            String(patient.phone || "")
                .toLowerCase()
                .includes(search) ||

            String(patient.email || "")
                .toLowerCase()
                .includes(search) ||

            String(patient.bloodGroup || "")
                .toLowerCase()
                .includes(search)
        );
    });
}

function getPatientStats(
    hospitalId = HOSPITAL_ID
) {
    const patients =
        getPatients(hospitalId);

    const today =
        new Date()
            .toISOString()
            .slice(0, 10);

    const todayRegistrations =
        patients.filter(patient =>
            String(patient.createdAt)
                .startsWith(today)
        ).length;

    const activePatients =
        patients.filter(
            patient =>
                patient.status === "active"
        ).length;

    const male =
        patients.filter(
            patient =>
                String(patient.gender)
                    .toLowerCase() === "male"
        ).length;

    const female =
        patients.filter(
            patient =>
                String(patient.gender)
                    .toLowerCase() === "female"
        ).length;

    return {
        total: patients.length,

        active: activePatients,

        inactive:
            patients.length -
            activePatients,

        todayRegistrations,

        male,

        female,

        other:
            patients.length -
            male -
            female
    };
}

function removePatient(
    patientId,
    hospitalId
) {
    const patients = readPatients();

    const filtered =
        patients.filter(
            patient =>
                !(
                    patient.id === patientId &&
                    patient.hospitalId === hospitalId
                )
        );

    if (
        filtered.length ===
        patients.length
    ) {
        return false;
    }

    savePatients(filtered);

    return true;
}

module.exports = {
    HOSPITAL_ID,

    createPatient,

    getPatients,

    getPatientById,

    getPatientByUHID,

    updatePatient,

    updatePatientStats,

    searchPatients,

    getPatientStats,

    removePatient
};