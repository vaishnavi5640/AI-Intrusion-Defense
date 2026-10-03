let trafficChart = null;
let networkChart = null;

let dashboardData = {
    total_events: 0,
    threats: 0,
    blocked: 0,
    normal: 0,
    events: []
};


/* =========================================
   PAGE INFORMATION
   ========================================= */

const pageInformation = {

    dashboard: {
        title: "Security Dashboard",
        subtitle: "AI-powered network intrusion monitoring"
    },

    network: {
        title: "Network Monitor",
        subtitle: "Real-time network security activity"
    },

    threats: {
        title: "Threat Detection",
        subtitle: "AI-detected network threats"
    },

    blocked: {
        title: "Blocked Traffic",
        subtitle: "Automatically blocked malicious activity"
    },

    logs: {
        title: "Security Logs",
        subtitle: "Complete security event history"
    },

    settings: {
        title: "System Settings",
        subtitle: "SentinelAI configuration"
    }

};


/* =========================================
   SIDEBAR NAVIGATION
   ========================================= */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(".nav-item");


    navItems.forEach(item => {

        item.addEventListener("click", function(event) {

            event.preventDefault();


            const section =
                this.dataset.section;


            showSection(section);


            navItems.forEach(nav => {

                nav.classList.remove("active");

            });


            this.classList.add("active");

        });

    });

}


/* =========================================
   SHOW SECTION
   ========================================= */

function showSection(section) {

    const sections =
        document.querySelectorAll(".content-section");


    sections.forEach(element => {

        element.classList.remove("active-section");

    });


    const selected =
        document.getElementById(
            section + "-section"
        );


    if (selected) {

        selected.classList.add(
            "active-section"
        );

    }


    const information =
        pageInformation[section];


    if (information) {

        document.getElementById(
            "page-title"
        ).textContent =
            information.title;


        document.getElementById(
            "page-subtitle"
        ).textContent =
            information.subtitle;

    }


    if (section === "network") {

        updateNetworkPage();

    }


    if (section === "threats") {

        updateThreatPage();

    }


    if (section === "blocked") {

        updateBlockedPage();

    }


    if (section === "logs") {

        updateLogsPage();

    }


    if (window.lucide) {

        lucide.createIcons();

    }

}


/* =========================================
   LOAD DASHBOARD DATA
   ========================================= */

async function loadDashboard() {

    try {

        const response =
            await fetch("/api/dashboard");


        const data =
            await response.json();


        dashboardData = data;


        updateStatistics(data);

        updateEventsTable(data.events);

        updateTrafficChart(data.events);

        updateNetworkPage();

        updateThreatPage();

        updateBlockedPage();

        updateLogsPage();


        if (window.lucide) {

            lucide.createIcons();

        }

    }

    catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

}


/* =========================================
   UPDATE STATISTICS
   ========================================= */

function updateStatistics(data) {

    const statValues =
        document.querySelectorAll(
            ".stat-value"
        );


    if (statValues[0]) {

        statValues[0].textContent =
            data.total_events.toLocaleString();

    }


    if (statValues[1]) {

        statValues[1].textContent =
            data.threats.toLocaleString();

    }


    if (statValues[2]) {

        statValues[2].textContent =
            data.blocked.toLocaleString();

    }


    if (statValues[3]) {

        statValues[3].textContent =
            "99.97%";

    }

}


/* =========================================
   EVENTS TABLE
   ========================================= */

function updateEventsTable(events) {

    const table =
        document.querySelector(
            ".events-table"
        );


    if (!table) return;


    let html = `

        <div class="table-head">

            <span>TIME</span>
            <span>THREAT</span>
            <span>DETECTION</span>
            <span>ACTION</span>

        </div>

    `;


    if (!events || events.length === 0) {

        html += `

            <div class="event-row">

                <span class="time">--</span>

                <div class="threat">

                    <div class="event-icon safe-icon">

                        <i data-lucide="check"></i>

                    </div>

                    <div>

                        <strong>Waiting</strong>

                        <small>
                            No security events yet
                        </small>

                    </div>

                </div>

                <span class="badge safe-badge">
                    Normal
                </span>

                <span class="action-allow">
                    ALLOW
                </span>

            </div>

        `;

    }


    else {

        events.forEach(event => {

            const attack =
                event.prediction !== "BENIGN";


            const time =
                event.timestamp
                    ? event.timestamp.split(" ")[1]
                    : "--";


            html += `

                <div class="event-row">

                    <span class="time">
                        ${time}
                    </span>

                    <div class="threat">

                        <div class="event-icon ${
                            attack
                                ? "danger-icon"
                                : "safe-icon"
                        }">

                            <i data-lucide="${
                                attack
                                    ? "zap"
                                    : "check"
                            }"></i>

                        </div>

                        <div>

                            <strong>
                                ${event.prediction}
                            </strong>

                            <small>
                                ${
                                    attack
                                        ? "Network attack"
                                        : "Normal traffic"
                                }
                            </small>

                        </div>

                    </div>

                    <span class="badge ${
                        attack
                            ? "danger-badge"
                            : "safe-badge"
                    }">

                        ${
                            attack
                                ? "Detected"
                                : "Normal"
                        }

                    </span>

                    <span class="${
                        event.action === "BLOCK"
                            ? "action-block"
                            : "action-allow"
                    }">

                        ${event.action}

                    </span>

                </div>

            `;

        });

    }


    table.innerHTML = html;

}


/* =========================================
   TRAFFIC CHART
   ========================================= */

function updateTrafficChart(events) {

    const canvas =
        document.getElementById(
            "trafficChart"
        );


    if (!canvas) return;


    if (!events || events.length === 0) {

        if (trafficChart) {

            trafficChart.destroy();

            trafficChart = null;

        }

        return;

    }


    const labels = [];
    const normal = [];
    const threats = [];


    events
        .slice()
        .reverse()
        .forEach(event => {

            labels.push(
                event.timestamp
                    ? event.timestamp.split(" ")[1]
                    : "--"
            );


            if (event.prediction === "BENIGN") {

                normal.push(1);
                threats.push(0);

            }

            else {

                normal.push(0);
                threats.push(1);

            }

        });


    if (trafficChart) {

        trafficChart.destroy();

    }


    trafficChart =
        new Chart(canvas, {

            type: "line",

            data: {

                labels: labels,

                datasets: [

                    {

                        label: "Normal Traffic",

                        data: normal,

                        borderColor: "#76a83b",

                        backgroundColor:
                            "rgba(118,168,59,0.08)",

                        tension: 0.4,

                        fill: true,

                        pointRadius: 3

                    },

                    {

                        label: "Threats",

                        data: threats,

                        borderColor: "#d9574f",

                        backgroundColor:
                            "rgba(217,87,79,0.08)",

                        tension: 0.4,

                        fill: true,

                        pointRadius: 3

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        position: "top"

                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        suggestedMax: 1,

                        ticks: {

                            stepSize: 1

                        }

                    }

                }

            }

        });

}


/* =========================================
   NETWORK PAGE
   ========================================= */

function updateNetworkPage() {

    const events =
        dashboardData.events || [];


    const eventsElement =
        document.getElementById(
            "network-events"
        );


    const threatsElement =
        document.getElementById(
            "network-threats"
        );


    const blockedElement =
        document.getElementById(
            "network-blocked"
        );


    if (eventsElement) {

        eventsElement.textContent =
            dashboardData.total_events || 0;

    }


    if (threatsElement) {

        threatsElement.textContent =
            dashboardData.threats || 0;

    }


    if (blockedElement) {

        blockedElement.textContent =
            dashboardData.blocked || 0;

    }


    const canvas =
        document.getElementById(
            "networkChart"
        );


    if (!canvas) return;


    if (networkChart) {

        networkChart.destroy();

    }


    const labels = [];
    const values = [];


    events
        .slice()
        .reverse()
        .forEach(event => {

            labels.push(
                event.timestamp
                    ? event.timestamp.split(" ")[1]
                    : "--"
            );


            values.push(
                event.prediction === "BENIGN"
                    ? 1
                    : 2
            );

        });


    networkChart =
        new Chart(canvas, {

            type: "line",

            data: {

                labels: labels,

                datasets: [

                    {

                        label:
                            "Network Activity",

                        data:
                            values,

                        borderColor:
                            "#668eaa",

                        backgroundColor:
                            "rgba(102,142,170,0.08)",

                        fill: true,

                        tension: 0.4,

                        pointRadius: 4

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            stepSize: 1

                        }

                    }

                }

            }

        });

}


/* =========================================
   THREAT PAGE
   ========================================= */

function updateThreatPage() {

    const container =
        document.getElementById(
            "threat-list"
        );


    if (!container) return;


    const threats =
        (dashboardData.events || [])
            .filter(
                event =>
                    event.prediction !== "BENIGN"
            );


    if (threats.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <i data-lucide="shield-check"></i>

                <h3>No threats detected</h3>

                <p>
                    The latest monitored events contain no detected intrusions.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        threats.map(event => `

            <div class="detail-row">

                <div class="detail-icon danger">

                    <i data-lucide="shield-alert"></i>

                </div>

                <div class="detail-content">

                    <strong>
                        ${event.prediction}
                    </strong>

                    <span>
                        ${event.timestamp}
                    </span>

                </div>

                <span class="detail-badge danger">
                    DETECTED
                </span>

            </div>

        `).join("");

}


/* =========================================
   BLOCKED PAGE
   ========================================= */

function updateBlockedPage() {

    const container =
        document.getElementById(
            "blocked-list"
        );


    if (!container) return;


    const blocked =
        (dashboardData.events || [])
            .filter(
                event =>
                    event.action === "BLOCK"
            );


    if (blocked.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <i data-lucide="check-circle"></i>

                <h3>No blocked traffic</h3>

                <p>
                    No malicious traffic has been blocked recently.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        blocked.map(event => `

            <div class="detail-row">

                <div class="detail-icon danger">

                    <i data-lucide="ban"></i>

                </div>

                <div class="detail-content">

                    <strong>
                        ${event.prediction}
                    </strong>

                    <span>
                        ${event.timestamp}
                    </span>

                </div>

                <span class="detail-badge danger">
                    BLOCKED
                </span>

            </div>

        `).join("");

}


/* =========================================
   SECURITY LOGS PAGE
   ========================================= */

function updateLogsPage() {

    const container =
        document.getElementById(
            "security-log-view"
        );


    if (!container) return;


    const events =
        dashboardData.events || [];


    if (events.length === 0) {

        container.textContent =
            "Waiting for security events...";

        return;

    }


    container.innerHTML =
        events.map(event => {

            return `

                <div class="terminal-line">

                    <span class="terminal-time">
                        [${event.timestamp}]
                    </span>

                    <span>
                        Prediction: ${event.prediction}
                    </span>

                    <span>
                        Action: ${event.action}
                    </span>

                    <span>
                        ${event.message}
                    </span>

                </div>

            `;

        }).join("");

}


/* =========================================
   START
   ========================================= */

setupNavigation();

loadDashboard();


/* =========================================
   REFRESH EVERY 3 SECONDS
   ========================================= */

setInterval(

    loadDashboard,

    3000

);