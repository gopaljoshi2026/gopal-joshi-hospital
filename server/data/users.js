const users = [

    {
        id: 1,
        name: "Hospital Admin",
        username: "admin",
        password: "admin123",
        role: "admin"
    },

    {
        id: 2,
        name: "Dr. Rajesh Sharma",
        username: "doctor",
        password: "doctor123",
        role: "doctor"
    },

    {
        id: 3,
        name: "Pharmacy Staff",
        username: "pharmacy",
        password: "pharmacy123",
        role: "pharmacy"
    },

    {
        id: 4,
        name: "Laboratory Staff",
        username: "laboratory",
        password: "lab123",
        role: "laboratory"
    },

    {
        id: 5,
        name: "Nurse Staff",
        username: "nurse",
        password: "nurse123",
        role: "nurse"
    },

    {
        id: 6,
        name: "Reception Staff",
        username: "reception",
        password: "reception123",
        role: "reception"
    },

    {
        id: 7,
        name: "Bed Management Staff",
        username: "beds",
        password: "beds123",
        role: "beds"
    },

    {
        id: 8,
        name: "Ambulance Staff",
        username: "ambulance",
        password: "ambulance123",
        role: "ambulance"
    },

    {
        id: 9,
        name: "Hospital Manager",
        username: "manager",
        password: "manager123",
        role: "manager"
    },

    {
        id: 10,
        name: "Patient Demo",
        username: "patient",
        password: "patient123",
        role: "patient",
        email: "patient@gopaljoshi.com",
        phone: "9999999999"
    }

];


function findUser(username, password) {

    return users.find(
        user =>
            user.username === username &&
            user.password === password
    );

}


function findUserByUsername(username) {

    return users.find(
        user =>
            user.username === username
    );

}


module.exports = {
    users,
    findUser,
    findUserByUsername
};