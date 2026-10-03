/* =========================================
   SENTINELAI DASHBOARD JAVASCRIPT
   ========================================= */


let trafficChart = null;



/* =========================================
   LOAD DASHBOARD
   ========================================= */

async function loadDashboard() {

    try {

        const response =
            await fetch("/api/dashboard");


        const data =
            await response.json();



        /* ==============================
           STATISTICS
           ============================== */

        const statValues =
            document.querySelectorAll(".stat-value");


        // Total events

        if (statValues[0]) {

            statValues[0].textContent =
                data.total_events.toLocaleString();

        }


        // Threats

        if (statValues[1]) {

            statValues[1].textContent =
                data.threats.toLocaleString();

        }


        // Blocked

        if (statValues[2]) {

            statValues[2].textContent =
                data.blocked.toLocaleString();

        }


        // Model accuracy

        if (statValues[3]) {

            statValues[3].textContent =
                "99.97%";

        }



        /* ==============================
           NETWORK CHART
           ============================== */

        updateTrafficChart(data.events);



        /* ==============================
           EVENTS TABLE
           ============================== */

        updateEventsTable(data.events);



        /* ==============================
           ICONS
           ============================== */

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
   UPDATE EVENTS TABLE
   ========================================= */

function updateEventsTable(events) {


    const table =
        document.querySelector(".events-table");


    if (!table) {

        return;

    }



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

                <span class="time">
                    --
                </span>


                <div class="threat">

                    <div class="event-icon safe-icon">

                        <i data-lucide="check"></i>

                    </div>


                    <div>

                        <strong>
                            Waiting
                        </strong>

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

        table.innerHTML = html;

        return;

    }



    events.forEach(event => {


        const isAttack =
            event.prediction !== "BENIGN";


        const iconClass =
            isAttack
                ? "danger-icon"
                : "safe-icon";


        const badgeClass =
            isAttack
                ? "danger-badge"
                : "safe-badge";


        const icon =
            isAttack
                ? "zap"
                : "check";


        const detection =
            isAttack
                ? "Detected"
                : "Normal";


        const description =
            isAttack
                ? "Network attack"
                : "Normal traffic";


        const actionClass =
            event.action === "BLOCK"
                ? "action-block"
                : "action-allow";


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


                    <div class="event-icon ${iconClass}">

                        <i data-lucide="${icon}"></i>

                    </div>


                    <div>

                        <strong>

                            ${event.prediction}

                        </strong>


                        <small>

                            ${description}

                        </small>

                    </div>


                </div>



                <span class="badge ${badgeClass}">

                    ${detection}

                </span>



                <span class="${actionClass}">

                    ${event.action}

                </span>


            </div>

        `;

    });



    table.innerHTML = html;


}



/* =========================================
   NETWORK ACTIVITY CHART
   ========================================= */

function updateTrafficChart(events) {


    const canvas =
        document.getElementById(
            "trafficChart"
        );


    if (!canvas) {

        return;

    }



    /* ==============================
       EMPTY DATA
       ============================== */

    if (!events || events.length === 0) {


        if (trafficChart) {

            trafficChart.destroy();

            trafficChart = null;

        }


        return;

    }



    /* ==============================
       PREPARE DATA
       ============================== */

    const labels = [];

    const normal = [];

    const threats = [];



    events
        .slice()
        .reverse()
        .forEach(event => {


            const time =
                event.timestamp
                    ? event.timestamp.split(" ")[1]
                    : "--";


            labels.push(time);



            if (
                event.prediction ===
                "BENIGN"
            ) {

                normal.push(1);

                threats.push(0);

            }

            else {

                normal.push(0);

                threats.push(1);

            }

        });



    /* ==============================
       DESTROY OLD CHART
       ============================== */

    if (trafficChart) {

        trafficChart.destroy();

    }



    /* ==============================
       CREATE CHART
       ============================== */

    trafficChart =
        new Chart(canvas, {


            type: "line",


            data: {


                labels: labels,


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
                            0.4,

                        fill:
                            true,

                        pointRadius:
                            3,

                        pointHoverRadius:
                            5

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
                            0.4,

                        fill:
                            true,

                        pointRadius:
                            3,

                        pointHoverRadius:
                            5

                    }


                ]

            },


            options: {


                responsive:
                    true,


                maintainAspectRatio:
                    false,


                interaction: {

                    mode:
                        "index",

                    intersect:
                        false

                },


                plugins: {


                    legend: {

                        position:
                            "top",


                        labels: {

                            boxWidth:
                                10,

                            boxHeight:
                                10,

                            padding:
                                15,

                            font: {

                                size:
                                    9

                            }

                        }

                    },


                    tooltip: {

                        backgroundColor:
                            "#292a27",

                        titleColor:
                            "#ffffff",

                        bodyColor:
                            "#ffffff",

                        padding:
                            10,

                        displayColors:
                            true

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
                                1,

                            font: {

                                size:
                                    8

                            }

                        },


                        grid: {

                            color:
                                "rgba(80,75,65,0.08)"

                        }

                    },


                    x: {


                        ticks: {

                            font: {

                                size:
                                    8

                            },

                            maxRotation:
                                0

                        },


                        grid: {

                            color:
                                "rgba(80,75,65,0.05)"

                        }

                    }

                }

            }

        });

}



/* =========================================
   INITIAL LOAD
   ========================================= */

loadDashboard();



/* =========================================
   AUTO REFRESH
   ========================================= */

setInterval(

    loadDashboard,

    3000

);