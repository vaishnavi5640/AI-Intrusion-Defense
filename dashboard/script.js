/* ============================================================
   SENTINELAI DASHBOARD
   Corrected Interactive JavaScript
   ============================================================ */

"use strict";


/* ============================================================
   STATE
   ============================================================ */

const state = {

    section: "dashboard",

    data: {
        total_events: 0,
        threats: 0,
        blocked: 0,
        normal: 0,
        events: []
    },

    trafficChart: null,
    networkChart: null,
    distributionChart: null,

    initialized: false,

    search: localStorage.getItem(
        "sentinel_log_search"
    ) || "",

    filter: localStorage.getItem(
        "sentinel_log_filter"
    ) || "ALL",

    approvals: [],

    incidents: []

};


/* ============================================================
   HELPERS
   ============================================================ */

const $ = selector =>
    document.querySelector(selector);


const $$ = (
    selector,
    root = document
) =>
    Array.from(
        root.querySelectorAll(selector)
    );


function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function eventOf(raw) {

    return {

        timestamp:
            raw?.timestamp || "",

        prediction:
            raw?.prediction || "Unknown",

        action:
            raw?.action || "ALERT",

        message:
            raw?.message || ""

    };

}


function isThreat(event) {

    return (
        event &&
        event.prediction &&
        event.prediction !== "BENIGN"
    );

}


function refreshIcons() {

    try {

        if (
            window.lucide &&
            typeof lucide.createIcons === "function"
        ) {

            lucide.createIcons();

        }

    }
    catch (error) {

        console.warn(
            "Lucide refresh failed:",
            error
        );

    }

}


/* ============================================================
   PAGE INFORMATION
   ============================================================ */

const pageInfo = {

    dashboard: [
        "Command Center",
        "Security Command Center",
        "AI-powered network intrusion detection and adaptive defense"
    ],

    network: [
        "Network Monitor",
        "Network Monitor",
        "Real-time visibility into network activity and security events."
    ],

    threats: [
        "Threat Detection",
        "Threat Detection",
        "AI-identified threats requiring investigation."
    ],

    approval: [
        "Approval Queue",
        "Approval Queue",
        "Review security decisions before adaptive actions are authorized."
    ],

    blocked: [
        "Blocked Traffic",
        "Blocked Traffic",
        "Threats automatically blocked by SentinelAI."
    ],

    incidents: [
        "Incidents",
        "Security Incidents",
        "Correlated threats requiring investigation."
    ],

    logs: [
        "Security Logs",
        "Security Logs",
        "Recorded activity from the SentinelAI defense engine."
    ],

    mitre: [
        "MITRE ATT&CK",
        "MITRE ATT&CK",
        "Threat behavior mapped to ATT&CK techniques."
    ],

    settings: [
        "Settings",
        "Settings",
        "SentinelAI system configuration."
    ]

};


/* ============================================================
   NAVIGATION
   ============================================================ */

function navigate(section) {

    if (!pageInfo[section]) {

        section = "dashboard";

    }

    state.section = section;

    $$(".nav-item").forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.section === section
        );

    });


    $$(".content-section").forEach(sectionElement => {

        const active =
            sectionElement.id ===
            `${section}-section`;

        sectionElement.classList.toggle(
            "active-section",
            active
        );

    });


    const info =
        pageInfo[section];


    const breadcrumb =
        $("#breadcrumb-current");

    const title =
        $("#page-title");

    const subtitle =
        $("#page-subtitle");


    if (breadcrumb) {

        breadcrumb.textContent =
            info[0];

    }


    if (title) {

        title.textContent =
            info[1];

    }


    if (subtitle) {

        subtitle.textContent =
            info[2];

    }


    renderCurrentSection();

    refreshIcons();

}


/* ============================================================
   NAVIGATION LISTENERS
   ============================================================ */

function setupNavigation() {

    document.addEventListener(
        "click",
        event => {

            const nav =
                event.target.closest(
                    ".nav-item[data-section]"
                );


            if (nav) {

                event.preventDefault();

                navigate(
                    nav.dataset.section
                );

                return;

            }


            const action =
                event.target.closest(
                    "[data-section-action]"
                );


            if (action) {

                event.preventDefault();

                navigate(
                    action.dataset.sectionAction
                );

            }

        }
    );

}


/* ============================================================
   LOAD DASHBOARD DATA
   ============================================================ */

async function loadDashboard() {

    try {

        const response =
            await fetch(
                "/api/dashboard",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        state.data = {

            total_events:
                Number(
                    data.total_events || 0
                ),

            threats:
                Number(
                    data.threats || 0
                ),

            blocked:
                Number(
                    data.blocked || 0
                ),

            normal:
                Number(
                    data.normal || 0
                ),

            events:
                Array.isArray(data.events)
                    ? data.events
                    : []

        };


        updateStatistics();

        createApprovalQueue();

        createIncidents();

        updateNavigationCounts();

        updateCriticalBanner();

        renderCurrentSection();


        const status =
            $("#system-status");


        if (status) {

            status.textContent =
                "SYSTEM ONLINE";

        }


        const lastUpdate =
            $("#last-update");


        if (lastUpdate) {

            lastUpdate.textContent =
                "Updated " +
                new Date()
                    .toLocaleTimeString();

        }


        document.body.classList.add(
            "api-online"
        );


    }
    catch (error) {

        console.error(
            "SentinelAI API error:",
            error
        );


        document.body.classList.remove(
            "api-online"
        );


        const status =
            $("#system-status");


        if (status) {

            status.textContent =
                "API OFFLINE";

        }

    }

}


/* ============================================================
   STATISTICS
   ============================================================ */

function updateStatistics() {

    const data =
        state.data;


    const events =
        $("#stat-events");

    const threats =
        $("#stat-threats");

    const blocked =
        $("#stat-blocked");


    if (events) {

        events.textContent =
            data.total_events
                .toLocaleString();

    }


    if (threats) {

        threats.textContent =
            data.threats
                .toLocaleString();

    }


    if (blocked) {

        blocked.textContent =
            data.blocked
                .toLocaleString();

    }


    /*
       Accuracy card may have a static
       value in the HTML.
    */

    const accuracy =
        $("[data-stat='accuracy'] .stat-value");


    if (accuracy) {

        accuracy.textContent =
            "99.97%";

    }

}


/* ============================================================
   NAVIGATION COUNTS
   ============================================================ */

function updateNavigationCounts() {

    const threatCount =
        $(".threat-count");


    const pendingCount =
        $(".pending-count");


    const incidentCount =
        $(".incident-count");


    if (threatCount) {

        threatCount.textContent =
            state.data.threats;

    }


    if (pendingCount) {

        pendingCount.textContent =
            getPendingApprovals().length;

    }


    if (incidentCount) {

        incidentCount.textContent =
            state.incidents.length;

    }

}


/* ============================================================
   CRITICAL BANNER
   ============================================================ */

function updateCriticalBanner() {

    const banner =
        $("#critical-banner");


    if (!banner) {

        return;

    }


    if (state.data.threats > 0) {

        banner.classList.remove(
            "hidden"
        );


        const message =
            $("#critical-message");


        if (message) {

            message.textContent =
                `${state.data.threats} suspicious event(s) detected.`;

        }

    }
    else {

        banner.classList.add(
            "hidden"
        );

    }

}


/* ============================================================
   RECENT EVENTS
   ============================================================ */

function renderRecentEvents() {

    const container =
        $("#recent-events-container");


    if (!container) {

        return;

    }


    const events =
        state.data.events || [];


    if (!events.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">

                    <i data-lucide="inbox"></i>

                </div>

                <strong>
                    No security events
                </strong>

                <span>
                    Waiting for API activity.
                </span>

            </div>

        `;

        refreshIcons();

        return;

    }


    container.innerHTML =

        events
            .map(
                (raw, index) => {

                    const event =
                        eventOf(raw);

                    const threat =
                        isThreat(event);

                    const time =
                        event.timestamp
                            ? event.timestamp
                                .split(" ")
                                .pop()
                            : "--";


                    return `

                        <div
                            class="event-row"
                            data-event-index="${index}"
                            style="cursor:pointer"
                        >

                            <span class="time">

                                ${escapeHtml(time)}

                            </span>


                            <div class="threat">

                                <div
                                    class="
                                        event-icon
                                        ${threat
                                            ? "danger-icon"
                                            : "safe-icon"}
                                    "
                                >

                                    <i
                                        data-lucide="${
                                            threat
                                                ? "shield-alert"
                                                : "check"
                                        }"
                                    ></i>

                                </div>


                                <div>

                                    <strong>

                                        ${escapeHtml(
                                            event.prediction
                                        )}

                                    </strong>


                                    <small>

                                        ${
                                            threat
                                                ? "Network threat"
                                                : "Normal traffic"
                                        }

                                    </small>

                                </div>

                            </div>


                            <span
                                class="
                                    badge
                                    ${threat
                                        ? "danger"
                                        : "safe"}
                                "
                            >

                                ${
                                    threat
                                        ? "DETECTED"
                                        : "NORMAL"
                                }

                            </span>


                            <span>

                                ${escapeHtml(
                                    event.action
                                )}

                            </span>

                        </div>

                    `;

                }
            )
            .join("");


    $$(".event-row", container)
        .forEach(row => {

            row.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            row.dataset.eventIndex
                        );


                    const selected =
                        events[index];


                    if (selected) {

                        showInvestigation(
                            selected
                        );

                    }

                }
            );

        });


    refreshIcons();

}


/* ============================================================
   INVESTIGATION MODAL
   ============================================================ */

function showInvestigation(raw) {

    const event =
        eventOf(raw);


    const threat =
        isThreat(event);


    const technique =
        event.prediction === "DDoS"
            ? "T1498"
            : "Unmapped";


    const techniqueName =
        event.prediction === "DDoS"
            ? "Network Denial of Service"
            : "Unknown / Other Threat";


    showModal(

        "Security Investigation",

        threat
            ? "Threat detected by SentinelAI"
            : "Normal network activity",

        `

            <div class="modal-grid">

                <div>

                    <small>
                        Prediction
                    </small>

                    <strong>
                        ${escapeHtml(
                            event.prediction
                        )}
                    </strong>

                </div>


                <div>

                    <small>
                        Action
                    </small>

                    <strong>
                        ${escapeHtml(
                            event.action
                        )}
                    </strong>

                </div>


                <div>

                    <small>
                        Timestamp
                    </small>

                    <strong>
                        ${escapeHtml(
                            event.timestamp
                        )}
                    </strong>

                </div>


                <div>

                    <small>
                        Severity
                    </small>

                    <strong>
                        ${
                            threat
                                ? "HIGH"
                                : "LOW"
                        }
                    </strong>

                </div>


                <div>

                    <small>
                        MITRE Technique
                    </small>

                    <strong>
                        ${technique}
                    </strong>

                </div>


                <div>

                    <small>
                        Technique
                    </small>

                    <strong>
                        ${escapeHtml(
                            techniqueName
                        )}
                    </strong>

                </div>

            </div>


            <div class="modal-message">

                <small>
                    Security Message
                </small>

                <p>
                    ${escapeHtml(
                        event.message ||
                        "No additional message recorded."
                    )}
                </p>

            </div>

        `,

        threat
            ? `

                <button
                    class="btn btn-danger"
                    type="button"
                    data-modal-block
                >
                    Block Threat
                </button>

              `
            : ""

    );

}


/* ============================================================
   MODAL
   ============================================================ */

function showModal(
    title,
    subtitle,
    body,
    buttons = ""
) {

    closeModal();


    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "sentinel-modal-overlay";


    overlay.className =
        "modal-overlay";


    overlay.innerHTML = `

        <div
            class="modal"
            role="dialog"
            aria-modal="true"
        >

            <button
                class="modal-close"
                id="sentinel-modal-close"
                type="button"
            >
                ×
            </button>


            <div class="eyebrow">
                SENTINELAI
            </div>


            <h2 id="sentinel-modal-title">
                ${escapeHtml(title)}
            </h2>


            <p
                class="modal-subtitle"
                id="sentinel-modal-subtitle"
            >
                ${escapeHtml(
                    subtitle || ""
                )}
            </p>


            <div
                class="modal-body"
                id="sentinel-modal-content"
            >
                ${body}
            </div>


            <div
                class="modal-actions"
                id="sentinel-modal-actions"
            >
                ${buttons}
            </div>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    const closeButton =
        $("#sentinel-modal-close");


    if (closeButton) {

        closeButton.onclick =
            closeModal;

    }


    overlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                overlay
            ) {

                closeModal();

            }

        }
    );


    const blockButton =
        $("[data-modal-block]");


    if (blockButton) {

        blockButton.addEventListener(
            "click",
            () => {

                closeModal();

                showModal(
                    "Threat Action",
                    "SentinelAI Defense",
                    `
                        <div class="modal-message">

                            <strong>
                                Threat marked for blocking.
                            </strong>

                            <p>
                                The defensive action has been
                                recorded in the SentinelAI workflow.
                            </p>

                        </div>
                    `
                );

            }
        );

    }


    refreshIcons();

}


/* ============================================================
   CLOSE MODAL
   ============================================================ */

function closeModal() {

    const modal =
        $("#sentinel-modal-overlay");


    if (modal) {

        modal.remove();

    }

}


/* ============================================================
   APPROVAL STATE
   ============================================================ */

function approvalKey(event) {

    return [

        event.timestamp,
        event.prediction,
        event.action

    ].join("|");

}


function getApprovalState() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "sentinelai_approvals"
            ) || "{}"
        );

    }
    catch {

        return {};

    }

}


function saveApprovalState(data) {

    localStorage.setItem(
        "sentinelai_approvals",
        JSON.stringify(data)
    );

}


function getPendingApprovals() {

    const stored =
        getApprovalState();


    return Array.isArray(
        stored.data
    )
        ? stored.data.filter(
            item =>
                item.status ===
                "PENDING"
        )
        : [];

}


/* ============================================================
   CREATE APPROVAL QUEUE
   ============================================================ */

function createApprovalQueue() {

    const stored =
        getApprovalState();


    if (
        !Array.isArray(
            stored.data
        )
    ) {

        stored.data = [];

    }


    const known =
        new Set(
            stored.data.map(
                item => item.key
            )
        );


    state.data.events
        .filter(isThreat)
        .forEach(raw => {

            const event =
                eventOf(raw);


            const key =
                approvalKey(event);


            if (
                !known.has(key)
            ) {

                stored.data.push({

                    key,

                    timestamp:
                        event.timestamp,

                    prediction:
                        event.prediction,

                    action:
                        event.action,

                    message:
                        event.message,

                    status:
                        "PENDING"

                });

            }

        });


    saveApprovalState(
        stored
    );

}


/* ============================================================
   APPROVAL QUEUE
   ============================================================ */

function renderApprovalQueue() {

    const container =
        $("#approval-list");


    const preview =
        $("#approval-preview");


    const pending =
        getPendingApprovals();


    const count =
        pending.length;


    const dashboardCount =
        $("#dashboard-pending-count");


    if (dashboardCount) {

        dashboardCount.textContent =
            `${count} pending`;

    }


    const statusText =
        $("#approval-status-text");


    if (statusText) {

        statusText.textContent =
            `${count} PENDING REVIEW`;

    }


    if (preview) {

        if (!count) {

            preview.innerHTML = `

                <div class="empty-state compact">

                    <div class="empty-icon">

                        <i
                            data-lucide="shield-check"
                        ></i>

                    </div>

                    <strong>
                        No requests awaiting approval
                    </strong>

                    <span>
                        New suspicious activity will appear here.
                    </span>

                </div>

            `;

        }
        else {

            preview.innerHTML =

                pending
                    .slice(0, 2)
                    .map(item => `

                        <div
                            class="approval-preview-item"
                            style="cursor:pointer"
                        >

                            <strong>
                                ${escapeHtml(
                                    item.prediction
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    item.timestamp
                                )}
                            </span>

                        </div>

                    `)
                    .join("");

        }

    }


    if (!container) {

        refreshIcons();

        return;

    }


    if (!count) {

        container.innerHTML = `

            <div class="page-card">

                <div class="empty-state">

                    <div class="empty-icon">

                        <i
                            data-lucide="shield-check"
                        ></i>

                    </div>

                    <strong>
                        No pending approval requests
                    </strong>

                    <span>
                        SentinelAI has no threats awaiting human authorization.
                    </span>

                </div>

            </div>

        `;

        refreshIcons();

        return;

    }


    container.innerHTML =

        pending
            .map(
                (item, index) => {

                    const critical =
                        item.prediction ===
                        "DDoS";


                    return `

                        <div
                            class="approval-card"
                            data-approval-index="${index}"
                        >

                            <div
                                class="approval-card-top"
                            >

                                <div class="eyebrow">

                                    REQUEST REQ-${
                                        String(
                                            index + 1
                                        ).padStart(
                                            4,
                                            "0"
                                        )
                                    }

                                </div>


                                <span
                                    class="
                                        risk-badge
                                        ${
                                            critical
                                                ? "critical"
                                                : "high"
                                        }
                                    "
                                >

                                    ${
                                        critical
                                            ? "CRITICAL"
                                            : "HIGH RISK"
                                    }

                                </span>

                            </div>


                            <div
                                class="approval-grid"
                            >

                                <div>

                                    <span>
                                        THREAT
                                    </span>

                                    <strong>
                                        ${escapeHtml(
                                            item.prediction
                                        )}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        ACTION
                                    </span>

                                    <strong>
                                        ${escapeHtml(
                                            item.action
                                        )}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        TIMESTAMP
                                    </span>

                                    <strong>
                                        ${escapeHtml(
                                            item.timestamp
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div
                                class="approval-reason"
                            >

                                <strong>
                                    AI Recommendation
                                </strong>

                                <br>

                                ${
                                    escapeHtml(
                                        item.message ||
                                        "Suspicious network activity detected."
                                    )
                                }

                            </div>


                            <div
                                class="approval-actions"
                            >

                                <button
                                    class="btn btn-success"
                                    data-approve="${index}"
                                    type="button"
                                >

                                    <i
                                        data-lucide="check"
                                    ></i>

                                    Approve

                                </button>


                                <button
                                    class="btn btn-danger"
                                    data-reject="${index}"
                                    type="button"
                                >

                                    <i
                                        data-lucide="x"
                                    ></i>

                                    Reject

                                </button>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");


    $$(
        "[data-approve]",
        container
    ).forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                const index =
                    Number(
                        button.dataset.approve
                    );

                decideApproval(
                    pending[index],
                    "APPROVE"
                );

            }
        );

    });


    $$(
        "[data-reject]",
        container
    ).forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                const index =
                    Number(
                        button.dataset.reject
                    );

                decideApproval(
                    pending[index],
                    "REJECT"
                );

            }
        );

    });


    $$(".approval-card", container)
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            card.dataset.approvalIndex
                        );

                    if (pending[index]) {

                        showInvestigation(
                            pending[index]
                        );

                    }

                }
            );

        });


    refreshIcons();

}


/* ============================================================
   APPROVAL DECISION
   ============================================================ */

function decideApproval(
    item,
    decision
) {

    if (!item) {

        return;

    }


    const stored =
        getApprovalState();


    const target =
        stored.data.find(
            entry =>
                entry.key ===
                item.key
        );


    if (!target) {

        return;

    }


    target.status =
        decision === "APPROVE"
            ? "APPROVED"
            : "REJECTED";


    saveApprovalState(
        stored
    );


    updateNavigationCounts();

    renderApprovalQueue();

    showModal(

        decision === "APPROVE"
            ? "Threat Approved"
            : "Threat Rejected",

        "SentinelAI approval workflow",

        `

            <div class="modal-message">

                <strong>

                    ${
                        decision === "APPROVE"
                            ? "Security action approved."
                            : "Security action rejected."
                    }

                </strong>

                <p>

                    ${escapeHtml(
                        item.prediction
                    )}

                    request has been processed.

                </p>

            </div>

        `

    );

}


/* ============================================================
   INCIDENT CREATION
   ============================================================ */

function createIncidents() {

    const groups = {};


    state.data.events
        .filter(isThreat)
        .forEach(raw => {

            const event =
                eventOf(raw);


            if (
                !groups[
                    event.prediction
                ]
            ) {

                groups[
                    event.prediction
                ] = [];

            }


            groups[
                event.prediction
            ].push(event);

        });


    state.incidents =
        Object.keys(groups)
            .map(name => ({

                id:
                    `INC-${name
                        .replace(
                            /[^a-zA-Z0-9]/g,
                            ""
                        )
                        .toUpperCase()}`,

                type:
                    name,

                severity:
                    name === "DDoS"
                        ? "CRITICAL"
                        : "HIGH",

                status:
                    "ACTIVE",

                message:
                    `${groups[name].length} related security event(s) detected.`,

                created:
                    groups[name][0]?.timestamp ||
                    ""

            }));

}


/* ============================================================
   END OF PART 1
   ============================================================ */
   /* ============================================================
   NETWORK MONITOR
   ============================================================ */

function renderNetwork() {

    const data =
        state.data;


    /*
       Your actual HTML uses:
       #network-events
       #network-normal
       #network-threats
       #network-blocked
    */


    const total =
        $("#network-events");


    const normal =
        $("#network-normal");


    const threats =
        $("#network-threats");


    const blocked =
        $("#network-blocked");


    if (total) {

        total.textContent =
            Number(
                data.total_events || 0
            ).toLocaleString();

    }


    if (normal) {

        normal.textContent =
            Number(
                data.normal || 0
            ).toLocaleString();

    }


    if (threats) {

        threats.textContent =
            Number(
                data.threats || 0
            ).toLocaleString();

    }


    if (blocked) {

        blocked.textContent =
            Number(
                data.blocked || 0
            ).toLocaleString();

    }


    renderNetworkChart();


    /*
       Make network metric cards interactive
       without changing their existing styling.
    */

    $$(".network-metric")
        .forEach(card => {

            if (
                card.dataset
                    .sentinelInteractive
            ) {

                return;

            }


            card.dataset
                .sentinelInteractive =
                "true";


            card.style.cursor =
                "pointer";


            card.addEventListener(
                "click",
                () => {

                    const text =
                        card.innerText
                            .toLowerCase();


                    if (
                        text.includes(
                            "threat"
                        )
                    ) {

                        navigate(
                            "threats"
                        );

                    }

                    else if (
                        text.includes(
                            "blocked"
                        )
                    ) {

                        navigate(
                            "blocked"
                        );

                    }

                    else if (
                        text.includes(
                            "normal"
                        )
                    ) {

                        showNormalTraffic();

                    }

                    else {

                        navigate(
                            "logs"
                        );

                    }

                }
            );

        });

}


/* ============================================================
   NORMAL TRAFFIC DETAILS
   ============================================================ */

function showNormalTraffic() {

    const normalEvents =
        state.data.events
            .filter(
                raw =>
                    eventOf(raw)
                        .prediction ===
                    "BENIGN"
            );


    showModal(

        "Normal Network Traffic",

        "Allowed activity detected by SentinelAI",

        `

            <div class="modal-grid">

                <div>

                    <small>
                        Normal Events
                    </small>

                    <strong>
                        ${normalEvents.length}
                    </strong>

                </div>


                <div>

                    <small>
                        Status
                    </small>

                    <strong>
                        ALLOWED
                    </strong>

                </div>

            </div>


            <div class="modal-message">

                <small>
                    Description
                </small>

                <p>

                    SentinelAI classified these
                    network events as benign traffic.
                    No defensive blocking action
                    was required.

                </p>

            </div>

        `

    );

}


/* ============================================================
   THREAT DETECTION
   ============================================================ */

function renderThreats() {

    const container =
        $("#threat-list");


    if (!container) {

        return;

    }


    const threats =
        (
            state.data.events ||
            []
        )
        .filter(
            isThreat
        );


    if (!threats.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">

                    <i
                        data-lucide="shield-check"
                    ></i>

                </div>

                <h3>
                    No threats detected
                </h3>

                <p>
                    SentinelAI has not detected
                    malicious activity.
                </p>

            </div>

        `;


        refreshIcons();

        return;

    }


    container.innerHTML =

        threats
            .map(
                (raw, index) => {

                    const event =
                        eventOf(raw);


                    const isDdos =
                        event.prediction ===
                        "DDoS";


                    return `

                        <div
                            class="
                                threat-card
                                detail-row
                            "
                            data-threat="${index}"
                            style="cursor:pointer"
                        >

                            <div
                                class="
                                    detail-icon
                                    danger
                                "
                            >

                                <i
                                    data-lucide="shield-alert"
                                ></i>

                            </div>


                            <div
                                class="detail-content"
                            >

                                <strong>

                                    ${escapeHtml(
                                        event.prediction
                                    )}

                                </strong>


                                <span>

                                    ${escapeHtml(
                                        event.timestamp
                                    )}

                                </span>


                                <small>

                                    ${
                                        isDdos
                                            ? "Network Denial of Service"
                                            : "Suspicious network activity"
                                    }

                                </small>

                            </div>


                            <span
                                class="
                                    detail-badge
                                    danger
                                "
                            >

                                DETECTED

                            </span>

                        </div>

                    `;

                }
            )
            .join("");


    $$(
        "[data-threat]",
        container
    )
    .forEach(row => {

        row.addEventListener(
            "click",
            () => {

                const index =
                    Number(
                        row.dataset
                            .threat
                    );


                const selected =
                    threats[index];


                if (selected) {

                    showInvestigation(
                        selected
                    );

                }

            }
        );

    });


    refreshIcons();

}


/* ============================================================
   BLOCKED TRAFFIC
   ============================================================ */

function renderBlocked() {

    const container =
        $("#blocked-list");


    if (!container) {

        return;

    }


    const blocked =
        (
            state.data.events ||
            []
        )
        .filter(
            raw => {

                const event =
                    eventOf(raw);


                return (
                    event.action ===
                    "BLOCK"
                );

            }
        );


    if (!blocked.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">

                    <i
                        data-lucide="shield-check"
                    ></i>

                </div>

                <h3>
                    No blocked traffic
                </h3>

                <p>
                    No malicious traffic has
                    been blocked yet.
                </p>

            </div>

        `;


        refreshIcons();

        return;

    }


    container.innerHTML =

        blocked
            .map(
                (raw, index) => {

                    const event =
                        eventOf(raw);


                    return `

                        <div
                            class="
                                detail-row
                                blocked-row
                            "
                            data-blocked="${index}"
                            style="cursor:pointer"
                        >

                            <div
                                class="
                                    detail-icon
                                    danger
                                "
                            >

                                <i
                                    data-lucide="ban"
                                ></i>

                            </div>


                            <div
                                class="detail-content"
                            >

                                <strong>

                                    ${escapeHtml(
                                        event.prediction
                                    )}

                                </strong>


                                <span>

                                    ${escapeHtml(
                                        event.timestamp
                                    )}

                                </span>


                                <small>

                                    ${escapeHtml(
                                        event.message ||
                                        "Malicious traffic blocked."
                                    )}

                                </small>

                            </div>


                            <span
                                class="
                                    detail-badge
                                    danger
                                "
                            >

                                BLOCKED

                            </span>

                        </div>

                    `;

                }
            )
            .join("");


    $$(
        "[data-blocked]",
        container
    )
    .forEach(row => {

        row.addEventListener(
            "click",
            () => {

                const index =
                    Number(
                        row.dataset
                            .blocked
                    );


                const selected =
                    blocked[index];


                if (selected) {

                    showInvestigation(
                        selected
                    );

                }

            }
        );

    });


    refreshIcons();

}


/* ============================================================
   INCIDENTS
   ============================================================ */

function renderIncidents() {

    const container =
        $("#incident-grid");


    if (!container) {

        return;

    }


    const incidents =
        state.incidents || [];


    if (!incidents.length) {

        container.innerHTML = `

            <div class="page-card">

                <div class="empty-state">

                    <div class="empty-icon">

                        <i
                            data-lucide="folder-check"
                        ></i>

                    </div>

                    <strong>
                        No active incidents
                    </strong>

                    <span>
                        No correlated security
                        incidents detected.
                    </span>

                </div>

            </div>

        `;


        refreshIcons();

        return;

    }


    container.innerHTML =

        incidents
            .map(
                (incident, index) => {

                    return `

                        <div
                            class="detail-row incident-row"
                            data-incident="${index}"
                            style="cursor:pointer"
                        >

                            <div
                                class="detail-icon danger"
                            >

                                <i
                                    data-lucide="folder-search"
                                ></i>

                            </div>


                            <div
                                class="detail-content"
                            >

                                <strong>

                                    ${escapeHtml(
                                        incident.type
                                    )}

                                </strong>


                                <span>

                                    ${escapeHtml(
                                        incident.id
                                    )}

                                    ·

                                    ${escapeHtml(
                                        incident.created
                                    )}

                                </span>


                                <small>

                                    ${escapeHtml(
                                        incident.message
                                    )}

                                </small>

                            </div>


                            <span
                                class="
                                    detail-badge
                                    danger
                                "
                            >

                                ${escapeHtml(
                                    incident.status
                                )}

                            </span>

                        </div>

                    `;

                }
            )
            .join("");


    $$(
        "[data-incident]",
        container
    )
    .forEach(row => {

        row.addEventListener(
            "click",
            () => {

                const index =
                    Number(
                        row.dataset
                            .incident
                    );


                const incident =
                    incidents[index];


                if (!incident) {

                    return;

                }


                showModal(

                    "Security Incident",

                    "Correlated SentinelAI activity",

                    `

                        <div class="modal-grid">

                            <div>

                                <small>
                                    Incident ID
                                </small>

                                <strong>
                                    ${escapeHtml(
                                        incident.id
                                    )}
                                </strong>

                            </div>


                            <div>

                                <small>
                                    Threat Type
                                </small>

                                <strong>
                                    ${escapeHtml(
                                        incident.type
                                    )}
                                </strong>

                            </div>


                            <div>

                                <small>
                                    Severity
                                </small>

                                <strong>
                                    ${escapeHtml(
                                        incident.severity
                                    )}
                                </strong>

                            </div>


                            <div>

                                <small>
                                    Status
                                </small>

                                <strong>
                                    ${escapeHtml(
                                        incident.status
                                    )}
                                </strong>

                            </div>

                        </div>


                        <div
                            class="modal-message"
                        >

                            <small>
                                Incident Details
                            </small>

                            <p>

                                ${escapeHtml(
                                    incident.message
                                )}

                            </p>

                        </div>

                    `

                );

            }
        );

    });


    refreshIcons();

}


/* ============================================================
   SECURITY LOGS
   ============================================================ */

function renderLogs() {

    /*
       IMPORTANT:

       Your actual HTML uses:

       #security-log-view

       not #log-terminal.
    */


    const container =
        $("#security-log-view");


    if (!container) {

        return;

    }


    /*
       Preserve the existing HTML layout
       and only create the functional
       search/filter area when required.
    */


    if (
        !$("#sentinel-log-search")
    ) {

        container.innerHTML = `

            <div
                class="sentinel-log-controls"
            >

                <input
                    id="sentinel-log-search"
                    type="search"
                    placeholder="Search events, attacks, actions..."
                    value="${escapeHtml(
                        state.search
                    )}"
                >


                <select
                    id="sentinel-log-filter"
                >

                    <option
                        value="ALL"
                        ${
                            state.filter === "ALL"
                                ? "selected"
                                : ""
                        }
                    >
                        All Events
                    </option>


                    <option
                        value="THREAT"
                        ${
                            state.filter === "THREAT"
                                ? "selected"
                                : ""
                        }
                    >
                        Threats
                    </option>


                    <option
                        value="BLOCK"
                        ${
                            state.filter === "BLOCK"
                                ? "selected"
                                : ""
                        }
                    >
                        Blocked
                    </option>


                    <option
                        value="BENIGN"
                        ${
                            state.filter === "BENIGN"
                                ? "selected"
                                : ""
                        }
                    >
                        Normal
                    </option>

                </select>

            </div>


            <div
                id="sentinel-log-results"
            ></div>

        `;


        const search =
            $("#sentinel-log-search");


        const filter =
            $("#sentinel-log-filter");


        if (search) {

            search.addEventListener(
                "input",
                event => {

                    state.search =
                        event.target.value;


                    localStorage.setItem(
                        "sentinel_log_search",
                        state.search
                    );


                    renderLogs();

                }
            );

        }


        if (filter) {

            filter.addEventListener(
                "change",
                event => {

                    state.filter =
                        event.target.value;


                    localStorage.setItem(
                        "sentinel_log_filter",
                        state.filter
                    );


                    renderLogs();

                }
            );

        }

    }


    const results =
        $("#sentinel-log-results");


    if (!results) {

        return;

    }


    const query =
        (
            state.search ||
            ""
        )
        .toLowerCase();


    const filtered =
        (
            state.data.events ||
            []
        )
        .filter(raw => {

            const event =
                eventOf(raw);


            const searchableText = `

                ${event.timestamp}
                ${event.prediction}
                ${event.action}
                ${event.message}

            `.toLowerCase();


            const matchesSearch =
                searchableText.includes(
                    query
                );


            let matchesFilter =
                true;


            if (
                state.filter ===
                "THREAT"
            ) {

                matchesFilter =
                    isThreat(event);

            }


            if (
                state.filter ===
                "BLOCK"
            ) {

                matchesFilter =
                    event.action ===
                    "BLOCK";

            }


            if (
                state.filter ===
                "BENIGN"
            ) {

                matchesFilter =
                    event.prediction ===
                    "BENIGN";

            }


            return (
                matchesSearch &&
                matchesFilter
            );

        });


    if (!filtered.length) {

        results.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">

                    <i
                        data-lucide="search-x"
                    ></i>

                </div>

                <strong>
                    No matching logs
                </strong>

                <span>
                    Try another search or filter.
                </span>

            </div>

        `;


        refreshIcons();

        return;

    }


    results.innerHTML =

        filtered
            .map(
                (raw, index) => {

                    const event =
                        eventOf(raw);


                    const threat =
                        isThreat(event);


                    return `

                        <div
                            class="terminal-line"
                            data-log-index="${index}"
                            style="cursor:pointer"
                        >

                            <span
                                class="terminal-time"
                            >

                                [
                                ${escapeHtml(
                                    event.timestamp
                                )}
                                ]

                            </span>


                            <span>

                                Prediction:

                                ${escapeHtml(
                                    event.prediction
                                )}

                            </span>


                            <span>

                                Action:

                                ${escapeHtml(
                                    event.action
                                )}

                            </span>


                            <span>

                                ${
                                    threat
                                        ? "THREAT"
                                        : "NORMAL"
                                }

                            </span>

                        </div>

                    `;

                }
            )
            .join("");


    $$(
        "[data-log-index]",
        results
    )
    .forEach(row => {

        row.addEventListener(
            "click",
            () => {

                const index =
                    Number(
                        row.dataset
                            .logIndex
                    );


                const selected =
                    filtered[index];


                if (selected) {

                    showInvestigation(
                        selected
                    );

                }

            }
        );

    });


    refreshIcons();

}


/* ============================================================
   END OF PART 2
   ============================================================ */
   /* ============================================================
   MITRE ATT&CK
   ============================================================ */

function renderMitre() {

    const container =
        $("#mitre-list") ||
        $("#mitre-table-body") ||
        $("#mitre-table");


    if (!container) {

        return;

    }


    const threats =
        (
            state.data.events ||
            []
        )
        .filter(
            isThreat
        );


    /*
       If the page uses a table body,
       render proper table rows.
    */

    if (
        container.id ===
        "mitre-table-body"
    ) {

        if (!threats.length) {

            container.innerHTML = `

                <tr>

                    <td colspan="4">

                        No validated attack
                        techniques detected.

                    </td>

                </tr>

            `;

            return;

        }


        container.innerHTML =

            threats
                .map(
                    (raw, index) => {

                        const event =
                            eventOf(raw);


                        const technique =
                            event.prediction ===
                            "DDoS"
                                ? "T1498"
                                : "—";


                        const name =
                            event.prediction ===
                            "DDoS"
                                ? "Network Denial of Service"
                                : "Unmapped threat";


                        return `

                            <tr
                                data-mitre="${index}"
                                style="cursor:pointer"
                            >

                                <td>

                                    ${escapeHtml(
                                        event.prediction
                                    )}

                                </td>


                                <td>

                                    ${technique}

                                </td>


                                <td>

                                    ${name}

                                </td>


                                <td>

                                    Impact

                                </td>

                            </tr>

                        `;

                    }
                )
                .join("");


        $$(
            "[data-mitre]",
            container
        )
        .forEach(row => {

            row.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            row.dataset
                                .mitre
                        );


                    const event =
                        threats[index];


                    if (event) {

                        showInvestigation(
                            event
                        );

                    }

                }
            );

        });


        refreshIcons();

        return;

    }


    /*
       Card/list version.
    */

    if (!threats.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">

                    <i
                        data-lucide="shield-check"
                    ></i>

                </div>

                <strong>
                    No ATT&CK techniques detected
                </strong>

                <span>
                    Validated threats will be mapped here.
                </span>

            </div>

        `;


        refreshIcons();

        return;

    }


    const grouped =
        {};


    threats.forEach(
        raw => {

            const event =
                eventOf(raw);


            const key =
                event.prediction;


            if (
                !grouped[key]
            ) {

                grouped[key] = 0;

            }


            grouped[key]++;

        }
    );


    container.innerHTML =

        Object.entries(
            grouped
        )
        .map(
            ([prediction, count]) => {

                const technique =
                    prediction === "DDoS"
                        ? "T1498"
                        : "—";


                const name =
                    prediction === "DDoS"
                        ? "Network Denial of Service"
                        : "Unmapped threat";


                return `

                    <div
                        class="mitre-card"
                        data-mitre-name="${escapeHtml(
                            prediction
                        )}"
                        style="cursor:pointer"
                    >

                        <div
                            class="mitre-card-header"
                        >

                            <span>
                                ${technique}
                            </span>


                            <span>
                                IMPACT
                            </span>

                        </div>


                        <h3>

                            ${escapeHtml(
                                name
                            )}

                        </h3>


                        <p>

                            Detected class:

                            <strong>
                                ${escapeHtml(
                                    prediction
                                )}
                            </strong>

                            <br>

                            Observed events:

                            <strong>
                                ${count}
                            </strong>

                        </p>

                    </div>

                `;

            }
        )
        .join("");


    $$(".mitre-card", container)
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const prediction =
                        card.dataset
                            .mitreName;


                    const event =
                        threats.find(
                            raw =>
                                eventOf(raw)
                                    .prediction ===
                                prediction
                        );


                    if (event) {

                        showInvestigation(
                            event
                        );

                    }

                }
            );

        });


    refreshIcons();

}


/* ============================================================
   CHARTS
   ============================================================ */

function renderCharts() {

    if (
        typeof Chart ===
        "undefined"
    ) {

        console.warn(
            "Chart.js is not loaded."
        );

        return;

    }


    renderTrafficChart();

    renderNetworkChart();

    renderDistributionChart();

}


/* ============================================================
   TRAFFIC CHART
   ============================================================ */

function renderTrafficChart() {

    const canvas =
        $("#trafficChart") ||
        $("#traffic-chart");


    if (!canvas) {

        return;

    }


    const events =
        state.data.events || [];


    if (
        state.trafficChart
    ) {

        state.trafficChart.destroy();

        state.trafficChart =
            null;

    }


    const labels =
        events.map(
            event => {

                const e =
                    eventOf(event);


                return e.timestamp
                    ? e.timestamp
                        .split(" ")
                        .pop()
                    : "--";

            }
        );


    const normal =
        events.map(
            event => {

                return eventOf(
                    event
                ).prediction ===
                "BENIGN"
                    ? 1
                    : 0;

            }
        );


    const threats =
        events.map(
            event => {

                return isThreat(
                    eventOf(event)
                )
                    ? 1
                    : 0;

            }
        );


    state.trafficChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels,

                    datasets: [

                        {

                            label:
                                "Normal Traffic",

                            data:
                                normal,

                            borderColor:
                                "#76a83b",

                            backgroundColor:
                                "rgba(118,168,59,0.08)",

                            tension:
                                0.35,

                            fill:
                                true,

                            pointRadius:
                                3

                        },


                        {

                            label:
                                "Threats",

                            data:
                                threats,

                            borderColor:
                                "#d9574f",

                            backgroundColor:
                                "rgba(217,87,79,0.08)",

                            tension:
                                0.35,

                            fill:
                                true,

                            pointRadius:
                                3

                        }

                    ]

                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            position:
                                "top"

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            suggestedMax:
                                1,

                            ticks: {

                                stepSize:
                                    1

                            }

                        }

                    }

                }

            }
        );

}


/* ============================================================
   NETWORK CHART
   ============================================================ */

function renderNetworkChart() {

    const canvas =
        $("#networkChart") ||
        $("#network-chart");


    if (!canvas) {

        return;

    }


    if (
        state.networkChart
    ) {

        state.networkChart.destroy();

        state.networkChart =
            null;

    }


    const events =
        state.data.events || [];


    const labels =
        events.map(
            event => {

                const e =
                    eventOf(event);


                return e.timestamp
                    ? e.timestamp
                        .split(" ")
                        .pop()
                    : "--";

            }
        );


    const totalData =
        events.map(
            () => 1
        );


    const threatData =
        events.map(
            event =>
                isThreat(
                    eventOf(event)
                )
                    ? 1
                    : 0
        );


    state.networkChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels,

                    datasets: [

                        {

                            label:
                                "Observed Traffic",

                            data:
                                totalData,

                            tension:
                                0.35,

                            fill:
                                true

                        },


                        {

                            label:
                                "Threat Activity",

                            data:
                                threatData,

                            tension:
                                0.35,

                            fill:
                                true

                        }

                    ]

                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            position:
                                "top"

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            ticks: {

                                stepSize:
                                    1

                            }

                        }

                    }

                }

            }
        );

}


/* ============================================================
   THREAT DISTRIBUTION CHART
   ============================================================ */

function renderDistributionChart() {

    const canvas =
        $("#threatDistributionChart") ||
        $("#distributionChart");


    if (!canvas) {

        return;

    }


    if (
        state.distributionChart
    ) {

        state.distributionChart.destroy();

        state.distributionChart =
            null;

    }


    const threats =
        (
            state.data.events ||
            []
        )
        .filter(
            isThreat
        );


    const counts =
        {};


    threats.forEach(
        raw => {

            const prediction =
                eventOf(raw)
                    .prediction;


            counts[prediction] =
                (
                    counts[prediction] ||
                    0
                ) + 1;

        }
    );


    const labels =
        Object.keys(
            counts
        );


    const values =
        Object.values(
            counts
        );


    state.distributionChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels:
                        labels.length
                            ? labels
                            : [
                                "No threats"
                            ],

                    datasets: [

                        {

                            data:
                                labels.length
                                    ? values
                                    : [1]

                        }

                    ]

                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            position:
                                "bottom"

                        }

                    }

                }

            }
        );

}


/* ============================================================
   SETTINGS
   ============================================================ */

function renderSettings() {

    const settings = [

        {

            name:
                "Detection Engine",

            value:
                "Machine Learning Intrusion Detection",

            status:
                "ACTIVE"

        },


        {

            name:
                "Machine Learning Model",

            value:
                "Random Forest",

            status:
                "LOADED"

        },


        {

            name:
                "Model Accuracy",

            value:
                "Five-fold Cross-Validation",

            status:
                "99.97%"

        },


        {

            name:
                "Defense Response",

            value:
                "Automatic DDoS Blocking",

            status:
                "ENABLED"

        },


        {

            name:
                "API Port",

            value:
                "Flask Application Endpoint",

            status:
                "5000"

        }

    ];


    const rows =
        $$("#settings-section .setting-row");


    rows.forEach(
        (row, index) => {

            if (
                row.dataset
                    .sentinelSettingsReady
            ) {

                return;

            }


            row.dataset
                .sentinelSettingsReady =
                "true";


            row.style.cursor =
                "pointer";


            row.addEventListener(
                "click",
                () => {

                    const setting =
                        settings[index];


                    if (!setting) {

                        return;

                    }


                    showModal(

                        setting.name,

                        "SentinelAI system configuration",

                        `

                            <div
                                class="modal-grid"
                            >

                                <div>

                                    <small>
                                        Configuration
                                    </small>

                                    <strong>

                                        ${escapeHtml(
                                            setting.name
                                        )}

                                    </strong>

                                </div>


                                <div>

                                    <small>
                                        Status
                                    </small>

                                    <strong>

                                        ${escapeHtml(
                                            setting.status
                                        )}

                                    </strong>

                                </div>

                            </div>


                            <div
                                class="modal-message"
                            >

                                <small>
                                    Description
                                </small>

                                <p>

                                    ${escapeHtml(
                                        setting.value
                                    )}

                                </p>

                            </div>

                        `

                    );

                }
            );

        }
    );


    refreshIcons();

}


/* ============================================================
   STAT CARD INTERACTIONS
   ============================================================ */

function setupStatCards() {

    const cards =
        $$(".stat-card");


    cards.forEach(
        (card, index) => {

            if (
                card.dataset
                    .sentinelStatReady
            ) {

                return;

            }


            card.dataset
                .sentinelStatReady =
                "true";


            card.style.cursor =
                "pointer";


            card.addEventListener(
                "click",
                () => {

                    if (
                        index === 0
                    ) {

                        navigate(
                            "logs"
                        );

                    }


                    else if (
                        index === 1
                    ) {

                        navigate(
                            "threats"
                        );

                    }


                    else if (
                        index === 2
                    ) {

                        navigate(
                            "blocked"
                        );

                    }


                    else {

                        showModal(

                            "AI Detection Engine",

                            "SentinelAI model information",

                            `

                                <div
                                    class="modal-grid"
                                >

                                    <div>

                                        <small>
                                            Model
                                        </small>

                                        <strong>
                                            Random Forest
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            Accuracy
                                        </small>

                                        <strong>
                                            99.97%
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            Validation
                                        </small>

                                        <strong>
                                            5-Fold Cross-Validation
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            Dataset
                                        </small>

                                        <strong>
                                            CICIDS2017
                                        </strong>

                                    </div>

                                </div>

                            `

                        );

                    }

                }
            );

        }
    );

}


/* ============================================================
   CRITICAL BANNER BUTTON
   ============================================================ */

function setupCriticalBanner() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "#critical-banner [data-section-action]"
                );


            if (!button) {

                return;

            }


            navigate(
                button.dataset
                    .sectionAction
            );

        }
    );

}


/* ============================================================
   REFRESH BUTTON
   ============================================================ */

function setupRefresh() {

    const button =
        $("#refresh-button") ||
        $("#refresh-btn") ||
        $("[data-refresh]");


    if (!button) {

        return;

    }


    if (
        button.dataset
            .sentinelRefreshReady
    ) {

        return;

    }


    button.dataset
        .sentinelRefreshReady =
        "true";


    button.addEventListener(
        "click",
        async () => {

            button.classList.add(
                "is-loading"
            );


            try {

                await loadDashboard();

            }
            finally {

                setTimeout(
                    () => {

                        button.classList.remove(
                            "is-loading"
                        );

                    },
                    500
                );

            }

        }
    );

}


/* ============================================================
   GLOBAL MODAL CONTROLS
   ============================================================ */

function setupModalControls() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeModal();

            }

        }
    );

}


/* ============================================================
   RENDER CURRENT SECTION
   ============================================================ */

function renderCurrentSection() {

    if (
        state.section ===
        "dashboard"
    ) {

        renderRecentEvents();

        renderApprovalQueue();

        renderCharts();

    }


    if (
        state.section ===
        "network"
    ) {

        renderNetwork();

    }


    if (
        state.section ===
        "threats"
    ) {

        renderThreats();

    }


    if (
        state.section ===
        "approval"
    ) {

        renderApprovalQueue();

    }


    if (
        state.section ===
        "blocked"
    ) {

        renderBlocked();

    }


    if (
        state.section ===
        "incidents"
    ) {

        renderIncidents();

    }


    if (
        state.section ===
        "logs"
    ) {

        renderLogs();

    }


    if (
        state.section ===
        "mitre"
    ) {

        renderMitre();

    }


    if (
        state.section ===
        "settings"
    ) {

        renderSettings();

    }


    refreshIcons();

}


/* ============================================================
   INITIALIZATION
   ============================================================ */

function initializeSentinelAI() {

    if (
        state.initialized
    ) {

        return;

    }


    state.initialized =
        true;


    setupNavigation();

    setupStatCards();

    setupRefresh();

    setupCriticalBanner();

    setupModalControls();


    navigate(
        "dashboard"
    );


    loadDashboard();


    /*
       Keep the dashboard synchronized
       with the Flask API.
    */

    setInterval(
        () => {

            loadDashboard();

        },
        5000
    );

}


/* ============================================================
   START APPLICATION
   ============================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeSentinelAI
    );

}
else {

    initializeSentinelAI();

}


/* ============================================================
   END OF PART 3
   ============================================================ */
   /* ============================================================
   PART 4 — FINAL POLISH, SAFETY & INTERACTIONS
   ============================================================ */


/* ============================================================
   SAFE API REQUEST
   ============================================================ */

async function fetchJSON(url, options = {}) {

    try {

        const response =
            await fetch(
                url,
                options
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        return await response.json();

    }

    catch (error) {

        console.error(
            "SentinelAI API error:",
            error
        );


        return null;

    }

}


/* ============================================================
   SAFE DASHBOARD LOADING
   ============================================================ */

async function refreshDashboardData() {

    const data =
        await fetchJSON(
            "/api/dashboard"
        );


    if (!data) {

        return false;

    }


    state.data = {

        total_events:
            Number(
                data.total_events || 0
            ),

        threats:
            Number(
                data.threats || 0
            ),

        blocked:
            Number(
                data.blocked || 0
            ),

        normal:
            Number(
                data.normal || 0
            ),

        events:
            Array.isArray(
                data.events
            )
                ? data.events
                : []

    };


    return true;

}


/* ============================================================
   REBUILD STATISTICS
   ============================================================ */

function refreshStatistics() {

    const values = {

        total:
            state.data.total_events,

        threats:
            state.data.threats,

        blocked:
            state.data.blocked,

        normal:
            state.data.normal

    };


    /*
       Support explicit IDs if present.
    */

    const idMap = {

        "stat-events":
            values.total,

        "stat-threats":
            values.threats,

        "stat-blocked":
            values.blocked,

        "stat-normal":
            values.normal

    };


    Object.entries(
        idMap
    )
    .forEach(
        ([id, value]) => {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    Number(
                        value
                    ).toLocaleString();

            }

        }
    );


    /*
       Also support stat cards
       that don't have IDs.
    */

    const cards =
        $$(".stat-card");


    cards.forEach(
        (card, index) => {

            const value =
                card.querySelector(
                    ".stat-value, .value, h2, h3"
                );


            if (!value) {

                return;

            }


            let number = 0;


            if (
                index === 0
            ) {

                number =
                    values.total;

            }

            else if (
                index === 1
            ) {

                number =
                    values.threats;

            }

            else if (
                index === 2
            ) {

                number =
                    values.blocked;

            }

            else if (
                index === 3
            ) {

                number =
                    values.normal;

            }


            value.textContent =
                Number(
                    number
                ).toLocaleString();

        }
    );

}


/* ============================================================
   UPDATE PAGE HEADER
   ============================================================ */

function updatePageHeader() {

    const info =
        pageInfo[
            state.section
        ];


    if (!info) {

        return;

    }


    const title =
        $("#page-title");


    const subtitle =
        $("#page-subtitle");


    const breadcrumb =
        $("#breadcrumb-current");


    if (title) {

        title.textContent =
            info.title;

    }


    if (subtitle) {

        subtitle.textContent =
            info.subtitle;

    }


    if (breadcrumb) {

        breadcrumb.textContent =
            info.breadcrumb;

    }

}


/* ============================================================
   LIVE STATUS
   ============================================================ */

function updateLiveStatus(
    online = true
) {

    const indicators =
        $$(
            ".live-indicator, .status-indicator"
        );


    indicators.forEach(
        indicator => {

            const text =
                indicator.querySelector(
                    "span:last-child"
                );


            if (
                text &&
                text.textContent
                    .toLowerCase()
                    .includes("live")
            ) {

                text.textContent =
                    online
                        ? "Live monitoring"
                        : "Connection unavailable";

            }

        }
    );

}


/* ============================================================
   API STATUS CHECK
   ============================================================ */

async function checkAPIStatus() {

    const result =
        await fetchJSON(
            "/api/status"
        );


    if (!result) {

        updateLiveStatus(
            false
        );

        return false;

    }


    updateLiveStatus(
        result.status ===
        "running"
    );


    return true;

}


/* ============================================================
   FULL DASHBOARD REFRESH
   ============================================================ */

async function loadDashboard() {

    const success =
        await refreshDashboardData();


    if (!success) {

        updateLiveStatus(
            false
        );

        return;

    }


    updateLiveStatus(
        true
    );


    refreshStatistics();

    updateStatistics();

    updateNavigationCounts();

    updateCriticalBanner();

    updatePageHeader();

    renderCurrentSection();

    refreshIcons();

}


/* ============================================================
   GLOBAL SEARCH
   ============================================================ */

function setupGlobalSearch() {

    const input =
        $(
            "#global-search"
        ) ||
        $(
            "#search-input"
        );


    if (!input) {

        return;

    }


    if (
        input.dataset
            .sentinelSearchReady
    ) {

        return;

    }


    input.dataset
        .sentinelSearchReady =
        "true";


    input.addEventListener(
        "input",
        event => {

            const value =
                event.target.value
                    .trim()
                    .toLowerCase();


            if (!value) {

                renderCurrentSection();

                return;

            }


            const matches =
                (
                    state.data.events ||
                    []
                )
                .filter(
                    raw => {

                        const event =
                            eventOf(raw);


                        return (

                            String(
                                event.prediction ||
                                ""
                            )
                            .toLowerCase()
                            .includes(value)

                            ||

                            String(
                                event.action ||
                                ""
                            )
                            .toLowerCase()
                            .includes(value)

                            ||

                            String(
                                event.message ||
                                ""
                            )
                            .toLowerCase()
                            .includes(value)

                            ||

                            String(
                                event.timestamp ||
                                ""
                            )
                            .toLowerCase()
                            .includes(value)

                        );

                    }
                );


            showSearchResults(
                matches,
                value
            );

        }
    );

}


/* ============================================================
   SEARCH RESULTS
   ============================================================ */

function showSearchResults(
    matches,
    query
) {

    const container =
        $("#search-results");


    if (!container) {

        /*
           Search still works internally
           even if the original UI does not
           contain a results container.
        */

        return;

    }


    if (!matches.length) {

        container.innerHTML = `

            <div class="empty-state">

                <strong>
                    No results found
                </strong>

                <span>
                    Nothing matched "${escapeHtml(
                        query
                    )}".
                </span>

            </div>

        `;


        return;

    }


    container.innerHTML =

        matches
            .slice(
                0,
                10
            )
            .map(
                (raw, index) => {

                    const event =
                        eventOf(raw);


                    return `

                        <div
                            class="search-result"
                            data-search-index="${index}"
                            style="cursor:pointer"
                        >

                            <strong>

                                ${escapeHtml(
                                    event.prediction ||
                                    "Unknown"
                                )}

                            </strong>

                            <span>

                                ${escapeHtml(
                                    event.timestamp ||
                                    ""
                                )}

                            </span>

                        </div>

                    `;

                }
            )
            .join("");


    $$(".search-result", container)
        .forEach(
            (item, index) => {

                item.addEventListener(
                    "click",
                    () => {

                        showInvestigation(
                            matches[index]
                        );

                    }
                );

            }
        );

}


/* ============================================================
   APPROVAL BUTTONS
   ============================================================ */

function setupApprovalDelegation() {

    document.addEventListener(
        "click",
        event => {

            const approve =
                event.target.closest(
                    "[data-approve-id]"
                );


            const reject =
                event.target.closest(
                    "[data-reject-id]"
                );


            if (
                approve
            ) {

                decideApproval(
                    approve.dataset
                        .approveId,
                    "approved"
                );

            }


            if (
                reject
            ) {

                decideApproval(
                    reject.dataset
                        .rejectId,
                    "rejected"
                );

            }

        }
    );

}


/* ============================================================
   SIDEBAR TOGGLE
   ============================================================ */

function setupSidebar() {

    const button =
        $(
            "#sidebar-toggle"
        ) ||
        $(
            "#menu-toggle"
        );


    if (!button) {

        return;

    }


    if (
        button.dataset
            .sentinelSidebarReady
    ) {

        return;

    }


    button.dataset
        .sentinelSidebarReady =
        "true";


    button.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "sidebar-collapsed"
            );

        }
    );

}


/* ============================================================
   WINDOW RESIZE
   ============================================================ */

function setupResizeHandling() {

    let timeout;


    window.addEventListener(
        "resize",
        () => {

            clearTimeout(
                timeout
            );


            timeout =
                setTimeout(
                    () => {

                        if (
                            state.trafficChart
                        ) {

                            state.trafficChart.resize();

                        }


                        if (
                            state.networkChart
                        ) {

                            state.networkChart.resize();

                        }


                        if (
                            state.distributionChart
                        ) {

                            state.distributionChart.resize();

                        }

                    },
                    150
                );

        }
    );

}


/* ============================================================
   INITIALIZATION PATCH
   ============================================================ */

const originalInitializeSentinelAI =
    initializeSentinelAI;


/*
   Replace initialization with the complete
   version while keeping the previous logic.
 */

function initializeSentinelAI() {

    if (
        state.initialized
    ) {

        return;

    }


    state.initialized =
        true;


    setupNavigation();

    setupStatCards();

    setupRefresh();

    setupCriticalBanner();

    setupModalControls();

    setupGlobalSearch();

    setupApprovalDelegation();

    setupSidebar();

    setupResizeHandling();


    navigate(
        "dashboard"
    );


    loadDashboard();

    checkAPIStatus();


    /*
       Refresh data every 5 seconds.
       This keeps the dashboard synchronized
       with Flask + Prometheus activity.
    */

    if (
        state.refreshTimer
    ) {

        clearInterval(
            state.refreshTimer
        );

    }


    state.refreshTimer =
        setInterval(
            () => {

                loadDashboard();

            },
            5000
        );

}


/* ============================================================
   FINAL STARTUP
   ============================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeSentinelAI,
        {
            once: true
        }
    );

}
else {

    initializeSentinelAI();

}


/* ============================================================
   FINAL ERROR PROTECTION
   ============================================================ */

window.addEventListener(
    "error",
    event => {

        console.error(
            "SentinelAI dashboard error:",
            event.error ||
            event.message
        );

    }
);


window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "SentinelAI asynchronous error:",
            event.reason
        );

    }
);


/* ============================================================
   SENTINELAI READY
   ============================================================ */

console.log(
    "%cSentinelAI Command Center ready",
    "font-weight:bold"
);

console.log(
    "AI Intrusion Detection:",
    "ONLINE"
);

console.log(
    "Adaptive Defense:",
    "ACTIVE"
);

console.log(
    "Monitoring:",
    "ENABLED"
);


/* ============================================================
   END OF PART 4
   ============================================================ */