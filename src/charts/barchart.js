import * as d3 from "d3";

/* ============================================================
   BAR CHART MODULE
============================================================ */

let svg, g;
let xScale, yScale;
let width, height, margin;

let barsByFactor = {};
let dataRef = [];
let activeFactors = [];
let prevActiveFactors = [];

let legendGroup;
let valueLabels;

const SORT_DELAY = 250;

const NEW_FACTOR_DURATION = 1100;
const EXISTING_UPDATE_DURATION = 0;
const SORT_DURATION = 650;

const COLORS = {
    gdp: "#2c7fb8",
    socialSupport: "#41b6c4",
    healthyLife: "#2f8f5b",
    freedom: "#feb24c",
    trust: "#fd8d3c",
    generosity: "#f03b20",
    dystopiaResidual: "#756bb1"
};

const FACTOR_LABELS = {
    gdp: "Income",
    socialSupport: "Social support",
    healthyLife: "Health",
    freedom: "Freedom",
    trust: "Trust",
    generosity: "Generosity",
    dystopiaResidual: "Dystopia + residual"
};

/* Fixed draw order for stacking (WHR order) */
const STACK_ORDER = [
    "gdp",
    "socialSupport",
    "healthyLife",
    "freedom",
    "trust",
    "generosity",
    "dystopiaResidual"
];

/* ============================================================
   STEP STATE
============================================================ */

const STEP_STATE = {
    "gdp-bars-intro": { factors: ["gdp"], sort: false },
    "gdp-bars-fill": { factors: ["gdp"], sort: true },

    "social-support": { factors: ["gdp", "socialSupport"], sort: false },
    "social-support-highlight": { factors: ["gdp", "socialSupport"], sort: true },

    "health": { factors: ["gdp", "socialSupport", "healthyLife"], sort: false },
    "health-highlight": { factors: ["gdp", "socialSupport", "healthyLife"], sort: true },

    "freedom": { factors: ["gdp", "socialSupport", "healthyLife", "freedom"], sort: false },
    "freedom-highlight": { factors: ["gdp", "socialSupport", "healthyLife", "freedom"], sort: true },

    "trust": { factors: ["gdp", "socialSupport", "healthyLife", "freedom", "trust"], sort: false },
    "trust-highlight": { factors: ["gdp", "socialSupport", "healthyLife", "freedom", "trust"], sort: true },

    "generosity": {
        factors: ["gdp", "socialSupport", "healthyLife", "freedom", "trust", "generosity"],
        sort: false
    },
    "generosity-highlight": {
        factors: ["gdp", "socialSupport", "healthyLife", "freedom", "trust", "generosity"],
        sort: true
    },

    "dystopia-intro": {
        factors: [
            "gdp",
            "socialSupport",
            "healthyLife",
            "freedom",
            "trust",
            "generosity",
            "dystopiaResidual"
        ],
        sort: false
    },

    "dystopia-sort": {
        factors: [
            "gdp",
            "socialSupport",
            "healthyLife",
            "freedom",
            "trust",
            "generosity",
            "dystopiaResidual"
        ],
        sort: true
    },

    "chapter-three-outro": {
        factors: [
            "gdp",
            "socialSupport",
            "healthyLife",
            "freedom",
            "trust",
            "generosity",
            "dystopiaResidual"
        ],
        sort: true
    }
};

/* ============================================================
   INIT
============================================================ */

export function initBarChart({ container, data, width: w, height: h }) {
    dataRef = data.map(d => ({ ...d }));
    activeFactors = [];
    prevActiveFactors = [];

    margin = { top: 40, right: 24, bottom: 140, left: 80 };
    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;

    container.selectAll("*").remove();

    svg = container.append("svg")
        .attr("viewBox", `0 0 ${w} ${h}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    xScale = d3.scaleLinear()
        .domain([0, 8])
        .range([0, width]);

    yScale = d3.scaleBand()
        .domain(dataRef.map(d => d.country))
        .range([0, height])
        .padding(0.25);

    g.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).tickSize(0));

    g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(6));

    Object.keys(COLORS).forEach(key => {
        barsByFactor[key] = g.append("g").attr("class", `bars-${key}`);
    });

    legendGroup = svg.append("g")
        .attr("class", "bar-legend")
        .attr("transform", `translate(${margin.left}, ${margin.top + height + 40})`);

    valueLabels = g.append("g").attr("class", "value-labels");

    resetBars();
    resetOrder();
}

/* ============================================================
   STEP UPDATE
============================================================ */

export function updateBars(stepKey) {
    const state = STEP_STATE[stepKey];
    if (!state) return;

    Object.values(barsByFactor).forEach(group => {
        group.selectAll("rect").interrupt();
    });
    valueLabels.selectAll("text").interrupt();

    prevActiveFactors = [...activeFactors];
    activeFactors = state.factors;

    const newlyAdded = activeFactors.filter(k => !prevActiveFactors.includes(k));

    drawStack({ newlyAdded });
    updateLegend();
    updateValueLabels(newlyAdded);

    if (state.sort) {
        delayedSort();
    }
}

/* ============================================================
   STACK DRAWING
============================================================ */

function drawStack({ newlyAdded }) {
    const cumulative = {};
    dataRef.forEach(d => cumulative[d.country] = 0);

    STACK_ORDER.forEach(key => {
        const group = barsByFactor[key];
        const enabled = activeFactors.includes(key);
        const isNew = newlyAdded.includes(key);

        const bars = group
            .selectAll("rect")
            .data(dataRef, d => d.country)
            .join(
                enter => enter.append("rect")
                    .attr("y", d => yScale(d.country))
                    .attr("height", yScale.bandwidth())
                    .attr("x", d => xScale(cumulative[d.country]))
                    .attr("fill", COLORS[key])
                    .attr("width", 0)
                    .attr("opacity", 0),
                update => update
            );

        bars
            .attr("y", d => yScale(d.country))
            .attr("x", d => xScale(cumulative[d.country]))
            .attr("height", yScale.bandwidth());

        if (!enabled) {
            bars.attr("opacity", 0).attr("width", 0);
        } else {
            bars
                .attr("opacity", 1)
                .transition()
                .duration(isNew ? NEW_FACTOR_DURATION : EXISTING_UPDATE_DURATION)
                .attr("width", d => xScale(d[key]));
        }

        if (enabled) {
            dataRef.forEach(d => {
                cumulative[d.country] += d[key];
            });
        }
    });
}

/* ============================================================
   LEGEND (WRAPS SAFELY)
============================================================ */

function updateLegend() {
    const items = legendGroup
        .selectAll(".legend-item")
        .data(activeFactors, d => d);

    const enter = items.enter()
        .append("g")
        .attr("class", "legend-item");

    enter.append("rect")
        .attr("width", 14)
        .attr("height", 14)
        .attr("y", -10)
        .attr("fill", d => COLORS[d]);

    enter.append("text")
        .attr("x", 20)
        .attr("y", 2)
        .style("font-size", "0.85rem")
        .text(d => FACTOR_LABELS[d]);

    enter.merge(items)
        .attr("transform", (d, i) =>
            `translate(${(i % 4) * 140}, ${Math.floor(i / 4) * 22})`
        )
        .classed("is-visible", true);

    items.exit().remove();
}

/* ============================================================
   VALUE LABELS (FIXED SNAP)
============================================================ */

function updateValueLabels(newlyAdded) {
    const latest = newlyAdded[0] || null;
    const showDelta = latest && activeFactors.length > 1;
    const isNewFactorStep = newlyAdded.length > 0;

    const totals = dataRef.map(d => ({
        country: d.country,
        total: activeFactors.reduce((sum, k) => sum + d[k], 0),
        delta: showDelta ? d[latest] : null
    }));

    const labels = valueLabels
        .selectAll("text")
        .data(totals, d => d.country);

    const enter = labels.enter()
        .append("text")
        .attr("y", d => yScale(d.country) + yScale.bandwidth() / 2 + 4)
        .style("opacity", 0)
        .style("font-size", "0.8rem")
        .style("fill", "#333");

    const merged = enter.merge(labels)
        .text(d => {
            if (d.delta != null) {
                return `${d.total.toFixed(2)} (+${d.delta.toFixed(2)})`;
            }
            return d.total.toFixed(2);
        });

    // 🔧 critical fix
    merged.interrupt();

    if (isNewFactorStep) {
        merged
            .style("opacity", 0)
            .transition()
            .delay(NEW_FACTOR_DURATION - 150)
            .duration(500)
            .attr("x", d => xScale(d.total) + 6)
            .style("opacity", 1);
    } else {
        merged
            .attr("x", d => xScale(d.total) + 6)
            .style("opacity", 1);
    }

    labels.exit().remove();
}

/* ============================================================
   SORTING
============================================================ */

function delayedSort() {
    setTimeout(() => {
        const order = dataRef
            .map(d => ({
                country: d.country,
                value: activeFactors.reduce((sum, k) => sum + d[k], 0)
            }))
            .sort((a, b) => b.value - a.value)
            .map(d => d.country);

        yScale.domain(order);

        g.select(".y-axis")
            .transition()
            .duration(SORT_DURATION)
            .call(d3.axisLeft(yScale).tickSize(0));

        Object.values(barsByFactor).forEach(group => {
            group.selectAll("rect")
                .transition()
                .duration(SORT_DURATION)
                .attr("y", d => yScale(d.country));
        });

        valueLabels.selectAll("text")
            .transition()
            .duration(SORT_DURATION)
            .attr("y", d => yScale(d.country) + yScale.bandwidth() / 2 + 4);
    }, SORT_DELAY);
}

/* ============================================================
   RESET HELPERS
============================================================ */

function resetOrder() {
    yScale.domain(dataRef.map(d => d.country));
    g.select(".y-axis").call(d3.axisLeft(yScale).tickSize(0));
}

function resetBars() {
    Object.values(barsByFactor).forEach(group => {
        group.selectAll("rect").attr("width", 0);
    });
}

/* ============================================================
   RESET (SAFE)
============================================================ */

export function resetChart() {
    Object.values(barsByFactor).forEach(group => {
        group.selectAll("rect")
            .interrupt()
            .attr("x", xScale(0))
            .attr("width", 0);
    });

    valueLabels.selectAll("text")
        .interrupt()
        .style("opacity", 0);
}
