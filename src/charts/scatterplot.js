import * as d3 from "d3";

/* ============================================================
   SCATTERPLOT — STATIC, WHR-CORRECT
============================================================ */

let svg, g;
let xScale, yScale;
let width, height, margin;

let hoverLayer;
let hoverGroup;
let labelLayer;

let activeHighlight = "none";
let activeRegion = null;

/* ============================================================
   NARRATIVE COUNTRY GROUPS
============================================================ */

const RICH_AND_HAPPY = [
    "Finland",
    "Denmark",
    "Iceland",
    "Netherlands",
    "Sweden",
    "Norway",
    "Switzerland"
];

// High-income peer group with divergent well-being outcomes
// was before rich but unhappy, but shifted from identifying outliers
const SIMILAR_INCOME_DIFFERENT_WELLBEING = [
    "Germany",
    "Belgium",
    "Austria",
    "Sweden",
    "Finland"
];

const isSmallScreen = window.innerHeight < 800;

/* ============================================================
   INIT
   SVG CONTAINER, SCALES, AXES, DOTS
============================================================ */

export function initScatterplot({ container, data, width: w, height: h }) {
    margin = { top: 64,
        right: 148,
        bottom: isSmallScreen ? 80 : 40,
        left: 64 };
    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;

    container.selectAll("*").remove();

    svg = container
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    setupScales();
    drawAxes();
    drawDots(data);
    setupInlineLabels();
    setupHoverLayer();
}

/* ============================================================
   SCALES
============================================================ */

function setupScales() {
    xScale = d3.scaleLinear()
        .domain([20000, 160000])
        .range([0, width]);

    yScale = d3.scaleLinear()
        .domain([5.0, 8.0])
        .range([height, 0]);
}

/* ============================================================
   AXES
============================================================ */

function drawAxes() {
    const ticks = [
        20000, 40000, 60000, 80000,
        100000, 120000, 140000, 160000
    ];

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(
            d3.axisBottom(xScale)
                .tickValues(ticks)
                .tickFormat(d => `${d / 1000}k`)
        );

    g.append("g")
        .call(d3.axisLeft(yScale).ticks(6));

    svg.append("text")
        .attr("x", margin.left + width / 2)
        .attr("y", height + margin.top + 55)
        .attr("text-anchor", "middle")
        .attr("class", "axis-label")
        .text("GDP per capita, PPP");

    svg.append("text")
        .attr("x", -(margin.top + height / 2))
        .attr("y", 20)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .attr("class", "axis-label")
        .text("Life evaluation (Cantril ladder, 0–10)");
}

/* ============================================================
   DOTS
============================================================ */

function drawDots(data) {
    g.selectAll("circle.country-dot")
        .data(data)
        .join("circle")
        .attr("class", "country-dot")
        .attr("cx", d => xScale(d.gdpPPP_avg))
        .attr("cy", d => yScale(d.life))
        .attr("r", 4.5)
        .attr("fill", "#4f8a8b")
        .attr("opacity", 0.95)
        .on("mouseenter", handleMouseEnter)
        .on("mouseleave", handleMouseLeave);
}

/* ============================================================
   INLINE LABELS
============================================================ */

function setupInlineLabels() {
    labelLayer = g.append("g")
        .attr("class", "inline-label-layer")
        .style("pointer-events", "none");
}

function showInlineLabels(countries) {
    const data = g.selectAll(".country-dot")
        .filter(d => countries.includes(d.country))
        .data();

    labelLayer.selectAll("text")
        .data(data, d => d.country)
        .join("text")
        .attr("x", d => xScale(d.gdpPPP_avg) + 8)
        .attr("y", d => yScale(d.life) - 6)
        .text(d => d.country)
        .attr("font-size", "11px")
        .attr("font-weight", 500)
        .attr("fill", "#1a1a1a")
        .attr("opacity", 0)
        .transition()
        .duration(300)
        .attr("opacity", 1);
}

function clearInlineLabels() {
    labelLayer.selectAll("text")
        .transition()
        .duration(200)
        .attr("opacity", 0)
        .remove();
}

/* ============================================================
   REGION & PATTERN HIGHLIGHTS (UNCHANGED)
============================================================ */

export function highlightRegion(regionName) {
    activeHighlight = "region";
    activeRegion = regionName;

    g.selectAll(".country-dot")
        .transition()
        .duration(300)
        .attr("opacity", d => d.region === regionName ? 1 : 0.15)
        .attr("r", 4.5)
        .attr("stroke", "none");

    clearInlineLabels();
}

export function resetRegionHighlight() {
    activeHighlight = "none";
    activeRegion = null;

    g.selectAll(".country-dot")
        .transition()
        .duration(300)
        .attr("opacity", 0.95)
        .attr("r", 4.5)
        .attr("stroke", "none");

    clearInlineLabels();
}

export function highlightRichAndHappy() {
    activeHighlight = "rich-happy";

    g.selectAll(".country-dot")
        .transition()
        .duration(300)
        .attr("opacity", d => RICH_AND_HAPPY.includes(d.country) ? 1 : 0.2)
        .attr("r", d => RICH_AND_HAPPY.includes(d.country) ? 6 : 4.5)
        .attr("stroke", d => RICH_AND_HAPPY.includes(d.country) ? "#222" : "none")
        .attr("stroke-width", 0.8);

    clearInlineLabels();
    showInlineLabels(RICH_AND_HAPPY);
}

export function highlightRichButUnhappy() {
    activeHighlight = "rich-unhappy";

    g.selectAll(".country-dot")
        .transition()
        .duration(350)
        .attr("opacity", d => SIMILAR_INCOME_DIFFERENT_WELLBEING.includes(d.country) ? 1 : 0.12)
        .attr("r", d => SIMILAR_INCOME_DIFFERENT_WELLBEING.includes(d.country) ? 7 : 4.5)
        .attr("stroke", d => SIMILAR_INCOME_DIFFERENT_WELLBEING.includes(d.country) ? "#111" : "none")
        .attr("stroke-width", 1.2);

    clearInlineLabels();
    showInlineLabels(SIMILAR_INCOME_DIFFERENT_WELLBEING);
}

/* ============================================================
   HOVER OVERLAY
============================================================ */

function setupHoverLayer() {
    hoverLayer = g.append("g")
        .attr("class", "hover-layer")
        .style("pointer-events", "none");

    hoverGroup = hoverLayer.append("g")
        .style("opacity", 0);
}

function handleMouseEnter(event, d) {
    d3.select(event.currentTarget).attr("r", 7);

    const cx = xScale(d.gdpPPP_avg);
    const cy = yScale(d.life);

    hoverGroup.selectAll("*").remove();

    hoverGroup.append("line")
        .attr("x1", cx)
        .attr("y1", cy)
        .attr("x2", cx + 18)
        .attr("y2", cy - 18)
        .attr("stroke", "#666");

    const labelGroup = hoverGroup.append("g")
        .attr("transform", `translate(${cx + 22},${cy - 22})`);

    labelGroup.append("rect")
        .attr("x", 0)
        .attr("y", -18)
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("width", 200)
        .attr("height", 58)
        .attr("fill", "#f6f4e8")
        .attr("stroke", "rgba(0,0,0,0.15)");

    labelGroup.append("image")
        .attr("x", 12)
        .attr("y", -3)
        .attr("width", 25)
        .attr("height", 21)
        .attr("href", `./images/countryFlags/${d.iso2.toLowerCase()}.svg`);

    labelGroup.append("text")
        .attr("x", 42)
        .attr("y", 4)
        .attr("font-size", "12px")
        .attr("font-weight", 600)
        .text(d.country);

    labelGroup.append("text")
        .attr("x", 42)
        .attr("y", 20)
        .attr("font-size", "11px")
        .text(`GDP: ${Math.round(d.gdpPPP_avg / 1000)}k · Life: ${d.life.toFixed(2)}`); // tooltip numbers rounded

    hoverGroup.style("opacity", 1);
}

function handleMouseLeave(event, d) {
    const circle = d3.select(event.currentTarget);

    if (activeHighlight === "rich-unhappy") {
        const isMatch = SIMILAR_INCOME_DIFFERENT_WELLBEING.includes(d.country);
        circle.attr("opacity", isMatch ? 1 : 0.12)
            .attr("r", isMatch ? 7 : 4.5);

    } else if (activeHighlight === "rich-happy") {
        const isMatch = RICH_AND_HAPPY.includes(d.country);
        circle.attr("opacity", isMatch ? 1 : 0.2)
            .attr("r", isMatch ? 6 : 4.5);

    } else if (activeHighlight === "region") {
        circle.attr("opacity", d.region === activeRegion ? 1 : 0.15)
            .attr("r", 4.5);

    } else {
        circle.attr("opacity", 0.95)
            .attr("r", 4.5);
    }

    hoverGroup.style("opacity", 0);
}