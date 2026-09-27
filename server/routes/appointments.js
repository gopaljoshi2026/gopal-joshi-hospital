const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

/* =========================================================
   CONFIG
========================================================= */

const DEFAULT_HOSPITAL_ID = "HOSP-TEST-001";

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "appointments.json");

const ALLOWED_STATUS = [
    "Scheduled",
    "Confirmed",
    "Waiting",
    "In Consultation",
    "Completed",
    "Cancelled",
    "No Show"
];

const ALLOWED_TYPES = [
    "OPD",
    "Follow-up",
    "Emergency",
    "Teleconsultation"
];

/* =========================================================
   STORAGE
========================================================= */

function ensureStorage() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify([], null, 2),
            "utf8"
        );
    }
}

function readAppointments() {
    ensureStorage();

    try {
        const raw = fs.readFileSync(
            DATA_FILE,
            "utf8"
        );

        const data = JSON.parse(raw);

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error(
            "Appointment database read error:",
            error
        );

        return [];
    }
}

function saveAppointments(appointments) {
    ensureStorage();

    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(appointments, null, 2),
        "utf8"
    );
}

/* =========================================================
   HELPERS
========================================================= */

function getHospitalId(req) {
    return (
        req.query.hospitalId ||
        req.body?.hospitalId ||
        DEFAULT_HOSPITAL_ID
    );
}

function clean(value) {
    return String(value ?? "").trim();
}

function generateAppointmentId() {
    const appointments = readAppointments();

    const year = new Date()
        .getFullYear()
        .toString()
        .slice(-2);

    const number = appointments.length + 1;

    return `APT-${year}-${String(number).padStart(5, "0")}`;
}

function findAppointment(id, hospitalId) {
    const appointments = readAppointments();

    return appointments.find(
        (appointment) =>
            String(appointment.id) === String(id) &&
            appointment.hospitalId === hospitalId
    );
}

function dateOnly(value) {
    if (!value) return "";

    return String(value).slice(0, 10);
}

/* =========================================================
   HEALTH
========================================================= */

router.get("/health", (req, res) => {
    res.json({
        success: true,
        module: "appointments",
        status: "online",
        hospitalId: getHospitalId(req),
        timestamp: new Date().toISOString()
    });
});

/* =========================================================
   DASHBOARD STATS
=========================================================

GET:
 /api/appointments/stats?hospitalId=HOSP-TEST-001

========================================================= */

router.get("/stats", (req, res) => {
    try {
        const hospitalId = getHospitalId(req);
        const appointments = readAppointments()
            .filter(
                (appointment) =>
                    appointment.hospitalId === hospitalId
            );

        const today = dateOnly(
            new Date().toISOString()
        );

        const todayAppointments =
            appointments.filter(
                (appointment) =>
                    appointment.date === today
            );

        const stats = {
            total: appointments.length,

            today: todayAppointments.length,

            scheduled:
                appointments.filter(
                    (a) => a.status === "Scheduled"
                ).length,

            confirmed:
                appointments.filter(
                    (a) => a.status === "Confirmed"
                ).length,

            waiting:
                appointments.filter(
                    (a) => a.status === "Waiting"
                ).length,

            inConsultation:
                appointments.filter(
                    (a) =>
                        a.status ===
                        "In Consultation"
                ).length,

            completed:
                appointments.filter(
                    (a) => a.status === "Completed"
                ).length,

            cancelled:
                appointments.filter(
                    (a) => a.status === "Cancelled"
                ).length,

            emergency:
                appointments.filter(
                    (a) =>
                        a.type === "Emergency"
                ).length
        };

        res.json({
            success: true,
            hospitalId,
            stats
        });
    } catch (error) {
        console.error(
            "Appointment stats error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to load appointment statistics"
        });
    }
});

/* =========================================================
   TODAY'S APPOINTMENTS
=========================================================

GET:
 /api/appointments/today?hospitalId=HOSP-TEST-001

========================================================= */

router.get("/today", (req, res) => {
    try {
        const hospitalId = getHospitalId(req);

        const today = dateOnly(
            new Date().toISOString()
        );

        const appointments =
            readAppointments()
                .filter(
                    (appointment) =>
                        appointment.hospitalId ===
                        hospitalId &&
                        appointment.date === today
                )
                .sort((a, b) =>
                    String(a.time).localeCompare(
                        String(b.time)
                    )
                );

        res.json({
            success: true,
            hospitalId,
            date: today,
            total: appointments.length,
            appointments
        });
    } catch (error) {
        console.error(
            "Today's appointments error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to load today's appointments"
        });
    }
});

/* =========================================================
   DOCTOR APPOINTMENTS
=========================================================

GET:
 /api/appointments/doctor/DOCTOR-ID?hospitalId=...

========================================================= */

router.get("/doctor/:doctorId", (req, res) => {
    try {
        const hospitalId = getHospitalId(req);
        const doctorId = req.params.doctorId;

        const appointments =
            readAppointments()
                .filter(
                    (appointment) =>
                        appointment.hospitalId ===
                            hospitalId &&
                        String(
                            appointment.doctorId
                        ) === String(doctorId)
                )
                .sort((a, b) => {
                    const first =
                        `${a.date} ${a.time}`;

                    const second =
                        `${b.date} ${b.time}`;

                    return first.localeCompare(
                        second
                    );
                });

        res.json({
            success: true,
            hospitalId,
            doctorId,
            total: appointments.length,
            appointments
        });
    } catch (error) {
        console.error(
            "Doctor appointments error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to load doctor appointments"
        });
    }
});

/* =========================================================
   PATIENT APPOINTMENTS
=========================================================

GET:
 /api/appointments/patient/PAT-00001?hospitalId=...

========================================================= */

router.get("/patient/:patientId", (req, res) => {
    try {
        const hospitalId = getHospitalId(req);
        const patientId = req.params.patientId;

        const appointments =
            readAppointments()
                .filter(
                    (appointment) =>
                        appointment.hospitalId ===
                            hospitalId &&
                        String(
                            appointment.patientId
                        ) === String(patientId)
                )
                .sort((a, b) => {
                    const first =
                        `${a.date} ${a.time}`;

                    const second =
                        `${b.date} ${b.time}`;

                    return second.localeCompare(
                        first
                    );
                });

        res.json({
            success: true,
            hospitalId,
            patientId,
            total: appointments.length,
            appointments
        });
    } catch (error) {
        console.error(
            "Patient appointments error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to load patient appointments"
        });
    }
});

/* =========================================================
   SEARCH / FILTER
=========================================================

GET:
 /api/appointments/search?hospitalId=...&search=Amit

========================================================= */

router.get("/search", (req, res) => {
    try {
        const hospitalId = getHospitalId(req);

        const search = clean(
            req.query.search
        ).toLowerCase();

        const date = clean(req.query.date);
        const status = clean(req.query.status);
        const doctorId = clean(
            req.query.doctorId
        );

        let appointments =
            readAppointments().filter(
                (appointment) =>
                    appointment.hospitalId ===
                    hospitalId
            );

        if (search) {
            appointments =
                appointments.filter(
                    (appointment) => {
                        const values = [
                            appointment.id,
                            appointment.patientId,
                            appointment.patientName,
                            appointment.patientPhone,
                            appointment.doctorId,
                            appointment.doctorName,
                            appointment.department,
                            appointment.reason
                        ];

                        return values.some(
                            (value) =>
                                String(
                                    value || ""
                                )
                                    .toLowerCase()
                                    .includes(search)
                        );
                    }
                );
        }

        if (date) {
            appointments =
                appointments.filter(
                    (a) => a.date === date
                );
        }

        if (status) {
            appointments =
                appointments.filter(
                    (a) =>
                        String(
                            a.status
                        ).toLowerCase() ===
                        status.toLowerCase()
                );
        }

        if (doctorId) {
            appointments =
                appointments.filter(
                    (a) =>
                        String(
                            a.doctorId
                        ) === String(doctorId)
                );
        }

        appointments.sort((a, b) => {
            const first =
                `${a.date} ${a.time}`;

            const second =
                `${b.date} ${b.time}`;

            return first.localeCompare(
                second
            );
        });

        res.json({
            success: true,
            hospitalId,
            total: appointments.length,
            appointments
        });
    } catch (error) {
        console.error(
            "Appointment search error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to search appointments"
        });
    }
});

/* =========================================================
   LIST ALL APPOINTMENTS
=========================================================

GET:
 /api/appointments?hospitalId=...

Supports:

page
limit
date
status
doctorId
patientId
type

========================================================= */

router.get("/", (req, res) => {
    try {
        const hospitalId = getHospitalId(req);

        const page = Math.max(
            parseInt(
                req.query.page || "1",
                10
            ),
            1
        );

        const limit = Math.min(
            Math.max(
                parseInt(
                    req.query.limit || "20",
                    10
                ),
                1
            ),
            100
        );

        const date = clean(req.query.date);
        const status = clean(
            req.query.status
        );
        const doctorId = clean(
            req.query.doctorId
        );
        const patientId = clean(
            req.query.patientId
        );
        const type = clean(req.query.type);

        let appointments =
            readAppointments().filter(
                (appointment) =>
                    appointment.hospitalId ===
                    hospitalId
            );

        if (date) {
            appointments =
                appointments.filter(
                    (a) => a.date === date
                );
        }

        if (status) {
            appointments =
                appointments.filter(
                    (a) =>
                        String(
                            a.status
                        ).toLowerCase() ===
                        status.toLowerCase()
                );
        }

        if (doctorId) {
            appointments =
                appointments.filter(
                    (a) =>
                        String(
                            a.doctorId
                        ) === String(doctorId)
                );
        }

        if (patientId) {
            appointments =
                appointments.filter(
                    (a) =>
                        String(
                            a.patientId
                        ) === String(patientId)
                );
        }

        if (type) {
            appointments =
                appointments.filter(
                    (a) =>
                        String(
                            a.type
                        ).toLowerCase() ===
                        type.toLowerCase()
                );
        }

        appointments.sort((a, b) => {
            const first =
                `${a.date} ${a.time}`;

            const second =
                `${b.date} ${b.time}`;

            return first.localeCompare(
                second
            );
        });

        const total =
            appointments.length;

        const totalPages =
            total === 0
                ? 0
                : Math.ceil(
                      total / limit
                  );

        const start =
            (page - 1) * limit;

        const result =
            appointments.slice(
                start,
                start + limit
            );

        res.json({
            success: true,

            hospitalId,

            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage:
                    page < totalPages,
                hasPreviousPage:
                    page > 1
            },

            filters: {
                date,
                status,
                doctorId,
                patientId,
                type
            },

            appointments: result
        });
    } catch (error) {
        console.error(
            "Appointment list error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to load appointments"
        });
    }
});

/* =========================================================
   GET SINGLE APPOINTMENT
========================================================= */

router.get("/:id", (req, res) => {
    try {
        const hospitalId = getHospitalId(req);

        const appointment =
            findAppointment(
                req.params.id,
                hospitalId
            );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message:
                    "Appointment not found"
            });
        }

        res.json({
            success: true,
            hospitalId,
            appointment
        });
    } catch (error) {
        console.error(
            "Get appointment error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to load appointment"
        });
    }
});

/* =========================================================
   CREATE APPOINTMENT
=========================================================

POST /api/appointments

Example:

{
    hospitalId: "HOSP-TEST-001",

    patientId: "PAT-00001",
    patientName: "Amit Kumar",
    patientPhone: "9876543210",

    doctorId: "DOC-001",
    doctorName: "Dr. Raj Sharma",

    department: "General Medicine",

    date: "2026-09-24",
    time: "10:30",

    type: "OPD",

    reason: "Fever and weakness",

    fee: 500
}

========================================================= */

router.post("/", (req, res) => {
    try {
        const hospitalId = getHospitalId(req);

        const body = req.body || {};

        const patientId =
            clean(body.patientId);

        const patientName =
            clean(body.patientName);

        const patientPhone =
            clean(body.patientPhone);

        const doctorId =
            clean(body.doctorId);

        const doctorName =
            clean(
                body.doctorName ||
                body.doctor
            );

        const department =
            clean(body.department);

        const date =
            clean(body.date);

        const time =
            clean(body.time);

        const reason =
            clean(body.reason);

        const type =
            clean(
                body.type || "OPD"
            );

        const fee =
            Math.max(
                0,
                Number(body.fee) || 0
            );

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message:
                    "Patient ID is required"
            });
        }

        if (!patientName) {
            return res.status(400).json({
                success: false,
                message:
                    "Patient name is required"
            });
        }

        if (!doctorId) {
            return res.status(400).json({
                success: false,
                message:
                    "Doctor ID is required"
            });
        }

        if (!doctorName) {
            return res.status(400).json({
                success: false,
                message:
                    "Doctor name is required"
            });
        }

        if (!date) {
            return res.status(400).json({
                success: false,
                message:
                    "Appointment date is required"
            });
        }

        if (!time) {
            return res.status(400).json({
                success: false,
                message:
                    "Appointment time is required"
            });
        }

        if (!reason) {
            return res.status(400).json({
                success: false,
                message:
                    "Appointment reason is required"
            });
        }

        if (!ALLOWED_TYPES.includes(type)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid appointment type"
            });
        }

        /* Prevent same doctor double booking */

        const appointments =
            readAppointments();

        const duplicate =
            appointments.find(
                (appointment) =>
                    appointment.hospitalId ===
                        hospitalId &&
                    appointment.doctorId ===
                        doctorId &&
                    appointment.date ===
                        date &&
                    appointment.time ===
                        time &&
                    appointment.status !==
                        "Cancelled"
            );

        if (duplicate) {
            return res.status(409).json({
                success: false,
                message:
                    "This doctor already has an appointment at this time",
                existingAppointment:
                    duplicate
            });
        }

        const now =
            new Date().toISOString();

        const appointment = {
            id: generateAppointmentId(),

            hospitalId,

            patientId,
            patientName,
            patientPhone,

            doctorId,
            doctorName,

            department,

            date,
            time,

            type,

            reason,

            fee,

            payment: {
                status: "Pending",
                amount: fee,
                paidAmount: 0,
                dueAmount: fee
            },

            status:
                date ===
                dateOnly(
                    new Date().toISOString()
                )
                    ? "Waiting"
                    : "Scheduled",

            consultation: {
                diagnosis: "",
                symptoms: [],
                vitals: {},
                notes: "",
                prescriptionId: null,
                labOrderId: null,
                followUpDate: null
            },

            createdAt: now,
            updatedAt: now
        };

        appointments.push(
            appointment
        );

        saveAppointments(
            appointments
        );

        res.status(201).json({
            success: true,
            message:
                "Appointment booked successfully",

            appointment
        });
    } catch (error) {
        console.error(
            "Create appointment error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to create appointment"
        });
    }
});

/* =========================================================
   UPDATE APPOINTMENT
========================================================= */

router.patch("/:id", (req, res) => {
    try {
        const hospitalId = getHospitalId(req);

        const appointments =
            readAppointments();

        const index =
            appointments.findIndex(
                (appointment) =>
                    String(
                        appointment.id
                    ) ===
                        String(
                            req.params.id
                        ) &&
                    appointment.hospitalId ===
                        hospitalId
            );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message:
                    "Appointment not found"
            });
        }

        const current =
            appointments[index];

        const allowedFields = [
            "doctorId",
            "doctorName",
            "department",
            "date",
            "time",
            "type",
            "reason",
            "fee"
        ];

        allowedFields.forEach(
            (field) => {
                if (
                    req.body[field] !==
                    undefined
                ) {
                    current[field] =
                        req.body[field];
                }
            }
        );

        current.updatedAt =
            new Date().toISOString();

        saveAppointments(
            appointments
        );

        res.json({
            success: true,
            message:
                "Appointment updated successfully",
            appointment: current
        });
    } catch (error) {
        console.error(
            "Update appointment error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to update appointment"
        });
    }
});

/* =========================================================
   CHANGE STATUS
=========================================================

PATCH /api/appointments/:id/status

{
    status: "Confirmed"
}

========================================================= */

router.patch("/:id/status", (req, res) => {
    try {
        const hospitalId = getHospitalId(req);

        const appointments =
            readAppointments();

        const appointment =
            appointments.find(
                (a) =>
                    String(a.id) ===
                        String(
                            req.params.id
                        ) &&
                    a.hospitalId ===
                        hospitalId
            );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message:
                    "Appointment not found"
            });
        }

        const status =
            clean(req.body?.status);

        if (
            !ALLOWED_STATUS.includes(
                status
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid appointment status",
                allowed:
                    ALLOWED_STATUS
            });
        }

        appointment.status =
            status;

        appointment.updatedAt =
            new Date().toISOString();

        saveAppointments(
            appointments
        );

        res.json({
            success: true,
            message:
                "Appointment status updated",
            appointment
        });
    } catch (error) {
        console.error(
            "Appointment status error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to update appointment status"
        });
    }
});

/* =========================================================
   RESCHEDULE
=========================================================

PATCH /api/appointments/:id/reschedule

{
    date: "2026-09-25",
    time: "11:00"
}

========================================================= */

router.patch(
    "/:id/reschedule",
    (req, res) => {
        try {
            const hospitalId =
                getHospitalId(req);

            const appointments =
                readAppointments();

            const appointment =
                appointments.find(
                    (a) =>
                        String(a.id) ===
                            String(
                                req.params.id
                            ) &&
                        a.hospitalId ===
                            hospitalId
                );

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Appointment not found"
                });
            }

            const date =
                clean(req.body?.date);

            const time =
                clean(req.body?.time);

            if (!date || !time) {
                return res.status(400).json({
                    success: false,
                    message:
                        "New date and time are required"
                });
            }

            const conflict =
                appointments.find(
                    (a) =>
                        String(a.id) !==
                            String(
                                appointment.id
                            ) &&
                        a.hospitalId ===
                            hospitalId &&
                        a.doctorId ===
                            appointment.doctorId &&
                        a.date === date &&
                        a.time === time &&
                        a.status !==
                            "Cancelled"
                );

            if (conflict) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Doctor is already booked at the new time"
                });
            }

            appointment.date =
                date;

            appointment.time =
                time;

            appointment.status =
                "Scheduled";

            appointment.updatedAt =
                new Date().toISOString();

            saveAppointments(
                appointments
            );

            res.json({
                success: true,
                message:
                    "Appointment rescheduled successfully",
                appointment
            });
        } catch (error) {
            console.error(
                "Reschedule error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to reschedule appointment"
            });
        }
    }
);

/* =========================================================
   CANCEL APPOINTMENT
========================================================= */

router.delete("/:id", (req, res) => {
    try {
        const hospitalId =
            getHospitalId(req);

        const appointments =
            readAppointments();

        const appointment =
            appointments.find(
                (a) =>
                    String(a.id) ===
                        String(
                            req.params.id
                        ) &&
                    a.hospitalId ===
                        hospitalId
            );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message:
                    "Appointment not found"
            });
        }

        appointment.status =
            "Cancelled";

        appointment.updatedAt =
            new Date().toISOString();

        saveAppointments(
            appointments
        );

        res.json({
            success: true,
            message:
                "Appointment cancelled successfully",
            appointment
        });
    } catch (error) {
        console.error(
            "Cancel appointment error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to cancel appointment"
        });
    }
});

/* =========================================================
   EXPORT
========================================================= */

module.exports = router;