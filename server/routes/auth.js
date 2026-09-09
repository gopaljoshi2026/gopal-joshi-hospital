const express = require("express");
const router = express.Router();

const {
    findUser,
    findUserByUsername
} = require("../data/users");


/* ============================================
   LOGIN
============================================ */

router.post("/login", (req, res) => {

    const username =
        String(req.body?.username || "").trim();

    const password =
        String(req.body?.password || "");

    if (!username || !password) {

        return res.status(400).json({
            success: false,
            message: "Username and password are required"
        });

    }


    const user =
        findUser(username, password);


    if (!user) {

        return res.status(401).json({
            success: false,
            message: "Invalid username or password"
        });

    }


    /*
        Demo token

        Format:
        userId:role:timestamp
    */

    const token =
        Buffer.from(
            `${user.id}:${user.role}:${Date.now()}`
        ).toString("base64");


    res.json({

        success: true,

        message: "Login successful",

        token,

        user: {

            id: user.id,

            name: user.name,

            username: user.username,

            role: user.role,

            email: user.email || "",

            phone: user.phone || ""

        }

    });

});


/* ============================================
   FIND USER
============================================ */

router.get("/user/:username", (req, res) => {

    const username =
        String(
            req.params.username || ""
        ).trim();


    const user =
        findUserByUsername(username);


    if (!user) {

        return res.status(404).json({

            success: false,

            message: "User not found"

        });

    }


    res.json({

        success: true,

        user: {

            id: user.id,

            name: user.name,

            username: user.username,

            role: user.role,

            email: user.email || "",

            phone: user.phone || ""

        }

    });

});


module.exports = router;