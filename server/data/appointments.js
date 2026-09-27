let appointments = [];
let nextId = 1;

function createAppointment(data) {
    const appointment = {
        id: `APT-${Date.now()}-${nextId++}`,

        hospitalId: data.hospitalId || "",

        patientId: data.patientId || "",
        patientName: data.patientName || "",

        doctorId: data.doctorId || "",
        doctorName: data.doctorName || "",

        department: data.department || "",

        date: data.date || "",
        time: data.time || "",

        reason: data.reason || "",

        status: "booked",

        notes: "",
        diagnosis: "",
        prescription: [],
        labTests: [],

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    appointments.push(appointment);

    return appointment;
}

function getAppointments(filters = {}) {
    let result = [...appointments];

    if (filters.hospitalId) {
        result = result.filter(a => a.hospitalId === filters.hospitalId);
    }

    if (filters.patientId) {
        result = result.filter(a => a.patientId === filters.patientId);
    }

    if (filters.doctorId) {
        result = result.filter(a => a.doctorId === filters.doctorId);
    }

    if (filters.status) {
        result = result.filter(a => a.status === filters.status);
    }

    if (filters.date) {
        result = result.filter(a => a.date === filters.date);
    }

    return result;
}

function getAppointmentById(id) {
    return appointments.find(a => a.id === id);
}

function updateAppointment(id, updates) {
    const appointment = getAppointmentById(id);

    if (!appointment) {
        return null;
    }

    Object.assign(appointment, updates);
    appointment.updatedAt = new Date().toISOString();

    return appointment;
}

function deleteAppointment(id) {
    const index = appointments.findIndex(a => a.id === id);

    if (index === -1) {
        return false;
    }

    appointments.splice(index, 1);

    return true;
}

module.exports = {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment
};