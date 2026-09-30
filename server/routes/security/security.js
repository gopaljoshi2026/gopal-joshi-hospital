const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");

const {
    getSecurityStats
} = require("../../middleware/security");

const DATA_DIR =
    path.join(__dirname, "../../data");

const FILE =
    path.join(DATA_DIR, "security-events.json");

function ensureFile() {

    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, {
            recursive: true
        });
    }

    if (!fs.existsSync(FILE)) {
        fs.writeFileSync(
            FILE,
            JSON.stringify([], null, 2)
        );
    }

}

function readEvents() {

    ensureFile();

    try {
        return JSON.parse(
            fs.readFileSync(FILE, "utf8")
        );
    } catch {
        return [];
    }

}

function writeEvents(events) {

    ensureFile();

    fs.writeFileSync(
        FILE,
        JSON.stringify(events, null, 2)
    );

}

function addEvent(event) {

    const events = readEvents();

    events.unshift({
        id:
            "SEC-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 7),

        timestamp:
            new Date().toISOString(),

        severity:
            event.severity || "INFO",

        category:
            event.category || "SYSTEM",

        actor:
            event.actor || "SYSTEM",

        action:
            event.action || "UNKNOWN",

        hospitalId:
            event.hospitalId || null,

        recordId:
            event.recordId || null,

        ip:
            event.ip || null,

        device:
            event.device || null,

        details:
            event.details || ""
    });

    writeEvents(
        events.slice(0, 5000)
    );

}

router.get("/health", (req, res) => {

    res.json({
        success: true,
        security: "active",
        stats: getSecurityStats()
    });

});

router.get("/events", (req, res) => {

    const events = readEvents();

    res.json({
        success: true,
        count: events.length,
        events
    });

});

router.post("/events", (req, res) => {

    addEvent(req.body || {});

    res.json({
        success: true,
        message: "Security event recorded"
    });

});

router.get("/dashboard", (req, res) => {

    const events = readEvents();

    const critical =
        events.filter(
            e => e.severity === "CRITICAL"
        ).length;

    const warnings =
        events.filter(
            e => e.severity === "WARNING"
        ).length;

    res.json({
        success: true,

        stats: {
            ...getSecurityStats(),
            totalEvents: events.length,
            criticalEvents: critical,
            warningEvents: warnings
        },

        recent:
            events.slice(0, 20)
    });

});

module.exports = {
    router,
    addEvent
};
