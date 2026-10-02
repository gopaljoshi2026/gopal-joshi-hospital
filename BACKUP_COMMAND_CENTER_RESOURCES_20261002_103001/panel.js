(function(){

const panel =
    window.HOSPITAL_PANEL ||
    "hospital-admin";

const API = "";

const names = {
    "super-admin":"Super Admin",
    "hospital-admin":"Hospital Admin",
    "reception":"Reception",
    "doctor":"Doctor",
    "nurse":"Nursing",
    "patient-portal":"Patient Portal",
    "laboratory":"Laboratory",
    "pharmacy":"Pharmacy",
    "billing":"Billing",
    "ipd":"IPD / Admission",
    "beds":"Beds & Wards",
    "emergency":"Emergency",
    "ambulance":"Ambulance",
    "ot-surgery":"OT / Surgery",
    "blood-bank":"Blood Bank",
    "inventory":"Inventory",
    "suppliers":"Suppliers",
    "insurance":"Insurance / TPA",
    "hr":"HR / Staff",
    "accounts":"Accounts",
    "reports":"Reports & Analytics",
    "command-center":"Hospital Command Center",
    "audit-security":"Audit & Security"
};

const title =
    names[panel] ||
    "Hospital Panel";

const token =
    localStorage.getItem("hospitalos_token") || localStorage.getItem("hospital_token");

function esc(value){
    return String(value ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;");
}

async function api(path, options={}){

    const headers =
        Object.assign(
            {"Content-Type":"application/json"},
            options.headers || {}
        );

    if(token){
        headers.Authorization =
            "Bearer " + token;
    }

    const response =
        await fetch(
            API + path,
            Object.assign(
                {},
                options,
                {headers}
            )
        );

    const data =
        await response.json()
            .catch(() => ({
                success:false
            }));

    if(
        response.status === 401
    ){
        localStorage.clear();
        location.reload();
    }

    return data;
}

function loginScreen(){

    document.body.innerHTML = `
    <div class="login">
      <div class="loginbox">
        <h2>Gopal Joshi Hospital SaaS</h2>
        <p class="muted">
          Secure ${esc(title)} Login
        </p>

        <label>Username</label>
        <input id="username" placeholder="Enter username">

        <label>Password</label>
        <input id="password" type="password" placeholder="Enter password">

        <button class="full" onclick="window.doLogin()">
          Login
        </button>

        <p id="loginMsg" class="muted"></p>
      </div>
    </div>`;
}

window.doLogin =
async function(){

    const username =
        document.getElementById(
            "username"
        ).value.trim();

    const password =
        document.getElementById(
            "password"
        ).value;

    const msg =
        document.getElementById(
            "loginMsg"
        );

    msg.textContent =
        "Checking credentials...";

    const result =
        await fetch(
            "/api/auth/login",
            {
                method:"POST",
                headers:{
                    "Content-Type":
                        "application/json"
                },
                body:JSON.stringify({
                    username,
                    password
                })
            }
        ).then(r=>r.json());

    if(!result.success){
        msg.textContent =
            result.message ||
            "Login failed";
        return;
    }

    localStorage.setItem(
        "hospital_token",
        result.token
    );

    localStorage.setItem(
        "hospital_user",
        JSON.stringify(
            result.user
        )
    );

    location.reload();
};

function logout(){
    localStorage.removeItem("hospitalos_token"); localStorage.removeItem("hospitalos_user"); localStorage.removeItem("hospitalos_hospital"); localStorage.removeItem("hospitalos_subscription"); localStorage.removeItem("hospitalos_stats"); localStorage.removeItem("hospital_token"); localStorage.removeItem("hospital_user"); location.href = "/hospital-admin/";
}

function sideModules(){

    return `
    <a href="/command-center/">◈ Command Center</a>
    <a href="/hospital-admin/">👤 Patients / Admin</a>
    <a href="/reception/">🧾 Reception</a>
    <a href="/doctor/">🩺 Doctor</a>
    <a href="/nurse/">👩‍⚕️ Nursing</a>
    <a href="/laboratory/">🧪 Laboratory</a>
    <a href="/pharmacy/">💊 Pharmacy</a>
    <a href="/billing/">💳 Billing</a>
    <a href="/ipd/">🛏 IPD</a>
    <a href="/beds/">🛏 Beds & Wards</a>
    <a href="/emergency/">🚨 Emergency</a>
    <a href="/ambulance/">🚑 Ambulance</a>
    <a href="/ot-surgery/">🏥 OT / Surgery</a>
    <a href="/blood-bank/">🩸 Blood Bank</a>
    <a href="/inventory/">📦 Inventory</a>
    <a href="/suppliers/">🚚 Suppliers</a>
    <a href="/insurance/">📑 Insurance / TPA</a>
    <a href="/hr/">👥 HR / Staff</a>
    <a href="/accounts/">💰 Accounts</a>
    <a href="/reports/">📊 Reports</a>
    <a href="/audit-security/">🔐 Audit & Security</a>
    `;
}

function render(){

    const user =
        JSON.parse(
            localStorage.getItem("hospitalos_user") || localStorage.getItem("hospital_user") || "{}"
        );

    document.body.innerHTML = `
    <div class="top">
      <div class="brand">
        Gopal Joshi Hospital SaaS
      </div>
      <div class="user">
        ${esc(user.name || user.username || "User")}
        · ${esc(user.role || title)}
        &nbsp;
        <button
          class="secondary"
          onclick="window.logout()">
          Logout
        </button>
      </div>
    </div>

    <div class="layout">
      <aside class="side">
        ${sideModules()}
      </aside>

      <main class="main">

        <div class="hero">
          <h1>${esc(title)}</h1>
          <div class="muted">
            Connected Hospital Operating System
          </div>
        </div>

        <section class="grid">
          <div class="card">
            <div class="label">Patients</div>
            <div id="patients" class="num">—</div>
          </div>

          <div class="card">
            <div class="label">Appointments</div>
            <div id="appointments" class="num">—</div>
          </div>

          <div class="card">
            <div class="label">Active Modules</div>
            <div id="modules" class="num">—</div>
          </div>

          <div class="card">
            <div class="label">Audit Events</div>
            <div id="audit" class="num">—</div>
          </div>
        </section>

        <div class="hero" style="margin-top:20px">
          <h2>Department Workspace</h2>
          <p class="muted">
            This panel is connected to the central
            Hospital SaaS architecture.
          </p>

          <div id="workspace"></div>
        </div>

        <div class="hero">
          <h2>Hospital Modules</h2>
          <div id="modulesList"
               class="modules"></div>
        </div>

      </main>
    </div>`;

    loadDashboard();
}

window.logout = logout;

async function loadDashboard(){

    const stats =
        await api(
            "/api/saas/control/stats"
        );

    if(stats.success){

        document.getElementById(
            "patients"
        ).textContent =
            stats.patients;

        document.getElementById(
            "appointments"
        ).textContent =
            stats.appointments;

        document.getElementById(
            "modules"
        ).textContent =
            stats.modules;

        document.getElementById(
            "audit"
        ).textContent =
            stats.auditLogs;
    }

    const manifest =
        await api(
            "/api/saas/control/manifest"
        );

    if(
        manifest.success
    ){

        document.getElementById(
            "modulesList"
        ).innerHTML =
            manifest.modules
                .map(m => `
                    <a class="module"
                       href="${esc(m.path)}">
                      <div class="icon">
                        ${esc(m.icon)}
                      </div>
                      <strong>
                        ${esc(m.name)}
                      </strong>
                    </a>
                `)
                .join("");
    }

    document.getElementById(
        "workspace"
    ).innerHTML = `
      <div class="card">
        <h3>${esc(title)} Connected</h3>
        <p class="muted">
          User, hospital, role and permission
          checks are handled through the SaaS backend.
        </p>
        <button onclick="window.loadRecords()">
          Load ${esc(title)} Records
        </button>
        <div id="records"
             style="margin-top:15px"></div>
      </div>`;
}

window.loadRecords =
async function(){

    const module =
        panel === "command-center"
            ? "dashboard"
            : panel;

    const result =
        await api(
            "/api/saas/control/records/" +
            encodeURIComponent(module)
        );

    const target =
        document.getElementById(
            "records"
        );

    if(!target) return;

    if(!result.success){
        target.innerHTML =
            "<p>Unable to load records.</p>";
        return;
    }

    if(!result.records.length){
        target.innerHTML =
            "<p class='muted'>No records yet.</p>";
        return;
    }

    target.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Created By</th>
            <th>Created At</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          ${result.records.map(r => `
            <tr>
              <td>${esc(r.id)}</td>
              <td>${esc(r.createdByName)}</td>
              <td>${esc(r.createdAt)}</td>
              <td>${esc(JSON.stringify(r.data))}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>`;
};

async function boot(){

    if(!token){
        loginScreen();
        return;
    }

    const session =
        await api(
            "/api/saas/control/session"
        );

    if(!session.success){
        loginScreen();
        return;
    }

    render();
}

boot();

})();



/* HOSPITALOS_COMMAND_CENTER_V2 */

(function(){

    if(window.HOSPITAL_PANEL !== "command-center"){
        return;
    }

    const token =
        localStorage.getItem("hospitalos_token") ||
        localStorage.getItem("hospital_token");

    const headers = {
        "Content-Type":"application/json"
    };

    if(token){
        headers.Authorization = "Bearer " + token;
    }

    const MODULES = [
        ["patients","Patients","/hospital-admin/"],
        ["appointments","Appointments","/hospital-admin/appointments.html"],
        ["consultations","Consultation","/admin/consultation.html"],
        ["laboratory","Laboratory","/laboratory/"],
        ["pharmacy","Pharmacy","/pharmacy/"],
        ["billing","Billing","/billing/"],
        ["ipd","IPD / Admissions","/ipd/"],
        ["beds","Beds & Wards","/beds/"],
        ["nursing","Nursing","/nurse/"],
        ["emergency","Emergency","/emergency/"],
        ["ambulance","Ambulance","/ambulance/"],
        ["ot-surgery","OT / Surgery","/ot-surgery/"],
        ["blood-bank","Blood Bank","/blood-bank/"],
        ["inventory","Inventory","/inventory/"],
        ["suppliers","Suppliers","/suppliers/"],
        ["insurance","Insurance / TPA","/insurance/"],
        ["hr","Staff / HR","/hr/"],
        ["accounts","Accounts","/accounts/"],
        ["reports","Reports & Analytics","/reports/"],
        ["users","Users & Roles","/hospital-admin/"],
        ["audit","Audit & Security","/audit-security/"]
    ];

    async function getJSON(url){

        try{

            const r = await fetch(url,{
                headers
            });

            return await r.json();

        }catch(e){

            return {
                success:false,
                error:e.message
            };

        }

    }

    function esc(value){

        return String(value ?? "")
            .replaceAll("&","&amp;")
            .replaceAll("<","&lt;")
            .replaceAll(">","&gt;")
            .replaceAll('"',"&quot;");

    }

    function number(value){

        const n = Number(value);

        return Number.isFinite(n) ? n : 0;

    }

    async function loadCommandCenter(){

        const stats =
            await getJSON(
                "/api/saas/control/stats"
            );

        const manifest =
            await getJSON(
                "/api/saas/control/manifest"
            );

        const audit =
            await getJSON(
                "/api/saas/control/audit"
            );

        let patientCount =
            number(
                stats?.patients ??
                stats?.data?.patients ??
                stats?.hospitalStats?.patients
            );

        let appointmentCount =
            number(
                stats?.appointments ??
                stats?.data?.appointments ??
                stats?.hospitalStats?.appointments
            );

        let auditCount =
            Array.isArray(audit?.data)
                ? audit.data.length
                : Array.isArray(audit?.records)
                    ? audit.records.length
                    : number(
                        audit?.count ??
                        audit?.total
                    );

        const activeModules = 23;

        document.body.innerHTML = `

        <div style="
            min-height:100vh;
            background:#f5f7fb;
            font-family:Arial,sans-serif;
            color:#172033;
        ">

          <div style="
              background:#0f172a;
              color:white;
              padding:18px 24px;
              display:flex;
              justify-content:space-between;
              align-items:center;
              gap:15px;
              flex-wrap:wrap;
          ">

            <div>
              <div style="
                  font-size:22px;
                  font-weight:700;
              ">
                Gopal Joshi Hospital
              </div>

              <div style="
                  opacity:.75;
                  margin-top:4px;
              ">
                Hospital Command Center
              </div>
            </div>

            <div style="
                display:flex;
                gap:10px;
                align-items:center;
                flex-wrap:wrap;
            ">

              <span style="
                  background:#16a34a;
                  padding:7px 12px;
                  border-radius:20px;
                  font-size:13px;
              ">
                ● SYSTEM CONNECTED
              </span>

              <button onclick="location.href='/hospital-admin/'"
                style="
                    border:0;
                    padding:9px 14px;
                    border-radius:8px;
                    cursor:pointer;
                ">
                Admin Dashboard
              </button>

            </div>

          </div>

          <main style="
              padding:24px;
              max-width:1500px;
              margin:auto;
          ">

            <div style="
                display:grid;
                grid-template-columns:
                    repeat(auto-fit,minmax(210px,1fr));
                gap:16px;
                margin-bottom:25px;
            ">

              ${card(
                  "Patients",
                  patientCount,
                  "View Patient Records",
                  "/hospital-admin/"
              )}

              ${card(
                  "Appointments",
                  appointmentCount,
                  "View Appointments",
                  "/admin/appointments.html"
              )}

              ${card(
                  "Active Modules",
                  activeModules,
                  "Hospital Departments",
                  "#modules"
              )}

              ${card(
                  "Audit Events",
                  auditCount,
                  "Security & Activity",
                  "/audit-security/"
              )}

            </div>

            <section style="
                background:white;
                border-radius:14px;
                padding:22px;
                box-shadow:0 2px 10px rgba(15,23,42,.07);
                margin-bottom:22px;
            ">

              <div style="
                  display:flex;
                  justify-content:space-between;
                  align-items:center;
                  gap:10px;
                  flex-wrap:wrap;
              ">

                <div>
                  <h2 style="margin:0">
                    Hospital Modules
                  </h2>

                  <p style="
                      margin:6px 0 0;
                      color:#64748b;
                  ">
                    All major hospital departments connected to HospitalOS.
                  </p>
                </div>

                <span style="
                    padding:7px 12px;
                    border-radius:20px;
                    background:#ecfdf5;
                    color:#047857;
                    font-size:13px;
                ">
                    ${activeModules} modules
                </span>

              </div>

              <div id="modules" style="
                  display:grid;
                  grid-template-columns:
                      repeat(auto-fit,minmax(210px,1fr));
                  gap:14px;
                  margin-top:20px;
              ">

                ${MODULES.map(m => `

                    <div onclick="location.href='${m[2]}'"
                         style="
                            background:#f8fafc;
                            border:1px solid #e2e8f0;
                            border-radius:12px;
                            padding:17px;
                            cursor:pointer;
                            transition:.15s;
                         "
                         onmouseover="this.style.transform='translateY(-2px)'"
                         onmouseout="this.style.transform='translateY(0)'">

                        <div style="
                            font-weight:700;
                            font-size:16px;
                        ">
                            ${esc(m[1])}
                        </div>

                        <div style="
                            color:#64748b;
                            font-size:13px;
                            margin-top:7px;
                        ">
                            Connected Hospital Module
                        </div>

                        <div style="
                            margin-top:12px;
                            color:#2563eb;
                            font-size:13px;
                            font-weight:600;
                        ">
                            Open Module →
                        </div>

                    </div>

                `).join("")}

              </div>

            </section>

            <section style="
                display:grid;
                grid-template-columns:
                    repeat(auto-fit,minmax(280px,1fr));
                gap:18px;
            ">

              <div style="
                  background:white;
                  border-radius:14px;
                  padding:22px;
                  box-shadow:0 2px 10px rgba(15,23,42,.07);
              ">

                <h3 style="margin-top:0">
                    Connected Architecture
                </h3>

                <div style="
                    color:#64748b;
                    line-height:1.8;
                ">
                    Patient → Appointment → Consultation
                    → Prescription / Lab → Pharmacy / Lab
                    → Billing → Completed Visit
                </div>

              </div>

              <div style="
                  background:white;
                  border-radius:14px;
                  padding:22px;
                  box-shadow:0 2px 10px rgba(15,23,42,.07);
              ">

                <h3 style="margin-top:0">
                    Command Center
                </h3>

                <div style="
                    color:#64748b;
                    line-height:1.8;
                ">
                    Central visibility for hospital operations,
                    users, modules, records and security activity.
                </div>

              </div>

            </section>

          </main>

        </div>
        `;

    }

    function card(title,value,textValue,url){

        return `

        <div onclick="location.href='${url}'"
             style="
                background:white;
                border-radius:14px;
                padding:20px;
                cursor:pointer;
                box-shadow:0 2px 10px rgba(15,23,42,.07);
                border:1px solid #e2e8f0;
             ">

            <div style="
                color:#64748b;
                font-size:14px;
            ">
                ${esc(title)}
            </div>

            <div style="
                font-size:32px;
                font-weight:800;
                margin:8px 0;
            ">
                ${esc(value)}
            </div>

            <div style="
                color:#2563eb;
                font-size:13px;
            ">
                ${esc(textValue)} →
            </div>

        </div>

        `;

    }

    setTimeout(
        loadCommandCenter,
        250
    );

})();





async function loadWorkflowActivity() {

    try {

        const apiBase =
            window.HOSPITALOS_API ||
            (window.location.origin + "/api");

        const response = await fetch(
            apiBase + "/saas/command-center/workflow-dashboard"
        );

        const data = await response.json();

        if (!data.success) return;

        const c = data.counts || {};

        const workflowHTML = `
            <section style="
                margin-top:24px;
                padding:20px;
                border-radius:16px;
                background:rgba(15,23,42,.96);
                border:1px solid rgba(255,255,255,.08);
                color:white;
            ">

                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:18px;
                ">
                    <div>
                        <h2 style="margin:0">
                            Clinical Workflow Activity
                        </h2>

                        <div style="
                            opacity:.65;
                            margin-top:5px;
                        ">
                            Live Patient Journey
                        </div>
                    </div>

                    <div style="
                        padding:8px 12px;
                        border-radius:20px;
                        background:#123b2d;
                        color:#6ee7b7;
                        font-size:13px;
                    ">
                        ● CONNECTED
                    </div>
                </div>

                <div style="
                    display:grid;
                    grid-template-columns:
                    repeat(auto-fit,minmax(130px,1fr));
                    gap:12px;
                ">

                    <div class="workflow-stat">
                        <b>${c.visits || 0}</b>
                        <span>Visits</span>
                    </div>

                    <div class="workflow-stat">
                        <b>${c.consultations || 0}</b>
                        <span>Consultations</span>
                    </div>

                    <div class="workflow-stat">
                        <b>${c.prescriptions || 0}</b>
                        <span>Prescriptions</span>
                    </div>

                    <div class="workflow-stat">
                        <b>${c.labOrders || 0}</b>
                        <span>Lab Orders</span>
                    </div>

                    <div class="workflow-stat">
                        <b>${c.pharmacyOrders || 0}</b>
                        <span>Pharmacy</span>
                    </div>

                    <div class="workflow-stat">
                        <b>${c.billingLinks || 0}</b>
                        <span>Billing</span>
                    </div>

                    <div class="workflow-stat">
                        <b>${c.timelineEvents || 0}</b>
                        <span>Timeline</span>
                    </div>

                    <div class="workflow-stat">
                        <b>${c.auditEvents || 0}</b>
                        <span>Audit</span>
                    </div>

                </div>

                <div style="
                    margin-top:20px;
                    padding:15px;
                    border-radius:12px;
                    background:rgba(255,255,255,.04);
                ">

                    <h3 style="margin-top:0">
                        Recent Patient Activity
                    </h3>

                    ${
                        (data.recentEvents || []).map(e => `
                            <div style="
                                padding:10px 0;
                                border-bottom:
                                1px solid rgba(255,255,255,.06);
                            ">
                                <b>${e.event}</b>

                                <div style="
                                    opacity:.6;
                                    font-size:12px;
                                    margin-top:3px;
                                ">
                                    Visit: ${e.visitId || "-"}
                                    &nbsp; • &nbsp;
                                    ${new Date(e.timestamp).toLocaleString()}
                                </div>
                            </div>
                        `).join("")
                    }

                </div>

            </section>
        `;

        const container =
            document.querySelector("main") ||
            document.querySelector(".dashboard") ||
            document.body;

        if (!document.getElementById("workflow-activity-panel")) {

            const wrapper =
                document.createElement("div");

            wrapper.id = "workflow-activity-panel";
            wrapper.innerHTML = workflowHTML;

            container.appendChild(wrapper);
        }

    } catch (error) {

        console.error(
            "Workflow Command Center error:",
            error
        );

    }
}

document.addEventListener(
    "DOMContentLoaded",
    loadWorkflowActivity
);



async function loadHospitalCatalog() {

    try {

        const apiBase =
            window.HOSPITALOS_API ||
            (window.location.origin + "/api");

        const response = await fetch(
            apiBase + "/saas/command-center/catalog"
        );

        const data = await response.json();

        if (!data.success) return;

        const c = data.counts || {};

        const doctors = data.doctors || [];
        const medicines = data.medicines || [];

        const catalogHTML = `
            <section
                id="hospital-resource-catalog"
                style="
                    margin-top:24px;
                    padding:20px;
                    border-radius:16px;
                    background:rgba(15,23,42,.96);
                    border:1px solid rgba(255,255,255,.08);
                    color:white;
                "
            >

                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:18px;
                ">

                    <div>
                        <h2 style="margin:0">
                            Hospital Resource Catalog
                        </h2>

                        <div style="
                            opacity:.65;
                            margin-top:5px;
                        ">
                            Doctors, medicines and departments
                        </div>
                    </div>

                    <div style="
                        padding:8px 12px;
                        border-radius:20px;
                        background:#123b2d;
                        color:#6ee7b7;
                        font-size:13px;
                    ">
                        ● LIVE
                    </div>

                </div>

                <div style="
                    display:grid;
                    grid-template-columns:
                    repeat(auto-fit,minmax(150px,1fr));
                    gap:12px;
                ">

                    <div class="workflow-stat">
                        <b>${c.doctors || 0}</b>
                        <span>Doctors</span>
                    </div>

                    <div class="workflow-stat">
                        <b>${c.activeDoctors || 0}</b>
                        <span>Active Doctors</span>
                    </div>

                    <div class="workflow-stat">
                        <b>${c.medicines || 0}</b>
                        <span>Medicines</span>
                    </div>

                    <div class="workflow-stat">
                        <b>${c.activeMedicines || 0}</b>
                        <span>Active Medicines</span>
                    </div>

                    <div class="workflow-stat">
                        <b>${c.departments || 0}</b>
                        <span>Departments</span>
                    </div>

                    <div class="workflow-stat">
                        <b>${c.medicineCategories || 0}</b>
                        <span>Medicine Categories</span>
                    </div>

                </div>

                <div style="
                    display:grid;
                    grid-template-columns:
                    repeat(auto-fit,minmax(280px,1fr));
                    gap:16px;
                    margin-top:20px;
                ">

                    <div style="
                        padding:16px;
                        border-radius:12px;
                        background:rgba(255,255,255,.04);
                    ">

                        <h3 style="margin-top:0">
                            Doctors
                        </h3>

                        ${
                            doctors.slice(0, 10).map(d => `
                                <div style="
                                    padding:9px 0;
                                    border-bottom:
                                    1px solid rgba(255,255,255,.06);
                                ">
                                    <b>${d.name || "-"}</b>

                                    <div style="
                                        opacity:.65;
                                        font-size:12px;
                                        margin-top:3px;
                                    ">
                                        ${d.specialization || "-"}
                                        •
                                        ${d.department || "-"}
                                    </div>
                                </div>
                            `).join("")
                        }

                    </div>

                    <div style="
                        padding:16px;
                        border-radius:12px;
                        background:rgba(255,255,255,.04);
                    ">

                        <h3 style="margin-top:0">
                            Medicine Catalog
                        </h3>

                        ${
                            medicines.slice(0, 10).map(m => `
                                <div style="
                                    padding:9px 0;
                                    border-bottom:
                                    1px solid rgba(255,255,255,.06);
                                ">
                                    <b>${m.name || "-"}</b>

                                    <div style="
                                        opacity:.65;
                                        font-size:12px;
                                        margin-top:3px;
                                    ">
                                        ${m.category || "-"}
                                        •
                                        ${m.form || "-"}
                                        • Stock ${m.stock ?? 0}
                                    </div>
                                </div>
                            `).join("")
                        }

                    </div>

                </div>

            </section>
        `;

        const container =
            document.querySelector("main") ||
            document.querySelector(".dashboard") ||
            document.body;

        if (!document.getElementById(
            "hospital-resource-catalog"
        )) {

            const wrapper =
                document.createElement("div");

            wrapper.innerHTML = catalogHTML;

            container.appendChild(wrapper);
        }

    } catch (error) {

        console.error(
            "Hospital catalog error:",
            error
        );

    }
}

document.addEventListener(
    "DOMContentLoaded",
    loadHospitalCatalog
);

