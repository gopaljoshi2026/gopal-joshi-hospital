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
    localStorage.getItem(
        "hospital_token"
    );

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
    localStorage.clear();
    location.href =
        location.pathname;
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
            localStorage.getItem(
                "hospital_user"
            ) || "{}"
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
