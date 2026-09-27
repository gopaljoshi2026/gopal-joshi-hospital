const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const dataDir = path.join(__dirname, "..", "..", "data");
const dbFile = path.join(dataDir, "hospital-os.json");

const modules = [
  "departments","wards","beds","admissions","discharges",
  "nursingTasks","emergencies","ambulances","staff",
  "inventory","suppliers","bloodBank","insuranceClaims",
  "expenses","accounts","housekeeping","maintenance",
  "notifications","procedures","operations","referrals",
  "feedback","documents","teleconsultations"
];

function loadDB() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  if (!fs.existsSync(dbFile)) {
    const initial = {
      hospitals: [],
      auditLogs: [],
      departments: [],
      wards: [],
      beds: [],
      admissions: [],
      discharges: [],
      nursingTasks: [],
      emergencies: [],
      ambulances: [],
      staff: [],
      inventory: [],
      suppliers: [],
      bloodBank: [],
      insuranceClaims: [],
      expenses: [],
      accounts: [],
      housekeeping: [],
      maintenance: [],
      notifications: [],
      procedures: [],
      operations: [],
      referrals: [],
      feedback: [],
      documents: [],
      teleconsultations: []
    };
    fs.writeFileSync(dbFile, JSON.stringify(initial, null, 2));
  }

  return JSON.parse(fs.readFileSync(dbFile, "utf8"));
}

function saveDB(db) {
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}

function makeId(prefix) {
  return prefix + "-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}

router.get("/health", (req, res) => {
  res.json({
    success: true,
    system: "Gopal Joshi Hospital OS",
    status: "online",
    time: new Date().toISOString()
  });
});

router.get("/modules", (req, res) => {
  res.json({
    success: true,
    totalModules: modules.length,
    modules
  });
});

router.get("/command-center", (req, res) => {
  const db = loadDB();

  const count = name => Array.isArray(db[name]) ? db[name].length : 0;

  res.json({
    success: true,
    dashboard: {
      departments: count("departments"),
      wards: count("wards"),
      beds: count("beds"),
      admissions: count("admissions"),
      discharges: count("discharges"),
      nursingTasks: count("nursingTasks"),
      emergencies: count("emergencies"),
      ambulances: count("ambulances"),
      staff: count("staff"),
      inventoryItems: count("inventory"),
      suppliers: count("suppliers"),
      bloodBankRecords: count("bloodBank"),
      insuranceClaims: count("insuranceClaims"),
      expenses: count("expenses"),
      accounts: count("accounts"),
      housekeepingTasks: count("housekeeping"),
      maintenanceTasks: count("maintenance"),
      notifications: count("notifications"),
      procedures: count("procedures"),
      operations: count("operations"),
      referrals: count("referrals"),
      feedback: count("feedback"),
      documents: count("documents"),
      teleconsultations: count("teleconsultations")
    }
  });
});

router.get("/records/:module", (req, res) => {
  const moduleName = req.params.module;

  if (!modules.includes(moduleName)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Hospital OS module"
    });
  }

  const db = loadDB();

  res.json({
    success: true,
    module: moduleName,
    total: db[moduleName].length,
    records: db[moduleName]
  });
});

router.post("/records/:module", (req, res) => {
  const moduleName = req.params.module;

  if (!modules.includes(moduleName)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Hospital OS module"
    });
  }

  const db = loadDB();

  const record = {
    id: makeId(moduleName.toUpperCase()),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...req.body
  };

  db[moduleName].push(record);

  db.auditLogs.push({
    id: makeId("AUDIT"),
    action: "CREATE",
    module: moduleName,
    recordId: record.id,
    createdAt: new Date().toISOString()
  });

  saveDB(db);

  res.status(201).json({
    success: true,
    message: "Record created successfully",
    record
  });
});

router.get("/records/:module/:id", (req, res) => {
  const moduleName = req.params.module;

  if (!modules.includes(moduleName)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Hospital OS module"
    });
  }

  const db = loadDB();
  const record = db[moduleName].find(x => x.id === req.params.id);

  if (!record) {
    return res.status(404).json({
      success: false,
      message: "Record not found"
    });
  }

  res.json({
    success: true,
    record
  });
});

router.put("/records/:module/:id", (req, res) => {
  const moduleName = req.params.module;

  if (!modules.includes(moduleName)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Hospital OS module"
    });
  }

  const db = loadDB();
  const index = db[moduleName].findIndex(x => x.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Record not found"
    });
  }

  db[moduleName][index] = {
    ...db[moduleName][index],
    ...req.body,
    id: db[moduleName][index].id,
    updatedAt: new Date().toISOString()
  };

  db.auditLogs.push({
    id: makeId("AUDIT"),
    action: "UPDATE",
    module: moduleName,
    recordId: req.params.id,
    createdAt: new Date().toISOString()
  });

  saveDB(db);

  res.json({
    success: true,
    message: "Record updated successfully",
    record: db[moduleName][index]
  });
});

router.delete("/records/:module/:id", (req, res) => {
  const moduleName = req.params.module;

  if (!modules.includes(moduleName)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Hospital OS module"
    });
  }

  const db = loadDB();
  const index = db[moduleName].findIndex(x => x.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Record not found"
    });
  }

  const deleted = db[moduleName].splice(index, 1)[0];

  db.auditLogs.push({
    id: makeId("AUDIT"),
    action: "DELETE",
    module: moduleName,
    recordId: req.params.id,
    createdAt: new Date().toISOString()
  });

  saveDB(db);

  res.json({
    success: true,
    message: "Record deleted successfully",
    record: deleted
  });
});

router.get("/audit-logs", (req, res) => {
  const db = loadDB();

  res.json({
    success: true,
    total: db.auditLogs.length,
    logs: db.auditLogs
  });
});

module.exports = router;
