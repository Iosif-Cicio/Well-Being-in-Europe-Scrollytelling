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
let leaderLineLayer;

let activeHighlight = "none";
let activeRegion = null;
let isHovering = false;

const HOVER_RADIUS = 12;

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
const SIMILAR_INCOME_DIFFERENT_WELLBEING = [
    "Germany",
    "Belgium",
    "Austria",
    "Sweden",
    "Finland"
];

/* ============================================================
   INLINE LABEL OFFSETS (collision-safe, explicit)
============================================================ */

const LABEL_OFFSETS = {
    Denmark: { dx: 14, dy: -20 },
    Iceland: { dx: 12, dy: -5 },
    Austria: { dx: 14, dy: -5 },
    Germany: { dx: 15, dy: 7 }
};

const isSmallScreen = window.innerHeight < 800;

/* ============================================================
   INIT
   SVG CONTAINER, SCALES, AXES, DOTS
   FIX: Use viewBox for responsive scaling
============================================================ */

export function initScatterplot({ container, data, width: w, height: h }) {
    // Responsive margins that scale down on smaller containers
    const isNarrow = w < 600;
    margin = {
        top: 64,
        right: isNarrow ? 60 : 148,
        bottom: isSmallScreen ? 80 : 50,
        left: isNarrow ? 50 : 64
    };

    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;

    container.selectAll("*").remove();

    // FIX: Use viewBox for responsive scaling instead of fixed dimensions
    svg = container
        .append("svg")
        .attr("viewBox", `0 0 ${w} ${h}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("height", "100%");

    g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    setupScales();
    drawAxes(w);
    drawDots(data);
    setupInlineLabels();
    setupHoverLayer();
}

/* ============================================================
   SCALES
============================================================ */

function setupScales() {
    xScale = d3
        .scaleLinear()
        .domain([20000, 160000])
        .range([0, width]);

    yScale = d3
        .scaleLinear()
        .domain([5.0, 8.0])
        .range([height, 0]);
}

/* ============================================================
   AXES
============================================================ */

function drawAxes(containerWidth) {
    // FIX: Reduce ticks on narrower screens
    const isNarrow = containerWidth < 600;
    const ticks = isNarrow
        ? [20000, 60000, 100000, 140000]
        : [20000, 40000, 60000, 80000, 100000, 120000, 140000, 160000];

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
        .attr("y", height + margin.top + 45)
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
        .attr("r", 5.5)
        .attr("fill", "#2c7fb8")
        .attr("opacity", 0.95)
        .style("pointer-events", "none");

    // Voronoi interaction layer
    setupVoronoiInteraction(data);
}

function setupVoronoiInteraction(data) {
    // Voronoi diagram for smart hit detection
    const delaunay = d3.Delaunay.from(
        data,
        d => xScale(d.gdpPPP_avg),
        d => yScale(d.life)
    );
    const voronoi = delaunay.voronoi([0, 0, width, height]);

    // Invisible Voronoi cells for hit detection
    g.selectAll("path.voronoi-cell")
        .data(data)
        .join("path")
        .attr("class", "voronoi-cell")
        .attr("d", (d, i) => voronoi.renderCell(i))
        .attr("fill", "none")
        .attr("stroke", "none")
        .attr("pointer-events", "all")
        .style("cursor", "pointer")
        .on("mousemove", function (event, d) {
            const [mx, my] = d3.pointer(event, g.node());

            const dx = xScale(d.gdpPPP_avg) - mx;
            const dy = yScale(d.life) - my;

            const isClose = (dx * dx + dy * dy) <= (HOVER_RADIUS * HOVER_RADIUS);

            if (isClose && !isHovering) {
                isHovering = true;
                handleMouseEnter(event, d);
            }

            if (!isClose && isHovering) {
                isHovering = false;
                handleMouseLeave(event, d);
            }
        })
        .on("mouseleave", function (event, d) {
            if (isHovering) {
                isHovering = false;
                handleMouseLeave(event, d);
            }
        });
}

/* ============================================================
   INLINE LABELS + LEADER LINES
============================================================ */

const LABEL_DOT_RADIUS = 6;

function setupInlineLabels() {
    leaderLineLayer = g.append("g")
        .attr("class", "inline-leader-lines")
        .style("pointer-events", "none");

    labelLayer = g.append("g")
        .attr("class", "inline-label-layer")
        .style("pointer-events", "none");
}

function showInlineLabels(countries) {
    const data = g.selectAll(".country-dot")
        .filter(d => countries.includes(d.country))
        .data();

    /* ---------- LEADER LINES ---------- */

    leaderLineLayer
        .selectAll("line")
        .data(data.filter(d => LABEL_OFFSETS[d.country]), d => d.country)
        .join("line")
        .attr("x1", d => {
            const o = LABEL_OFFSETS[d.country];
            const angle = Math.atan2(o.dy, o.dx);
            return xScale(d.gdpPPP_avg) + Math.cos(angle) * LABEL_DOT_RADIUS;
        })
        .attr("y1", d => {
            const o = LABEL_OFFSETS[d.country];
            const angle = Math.atan2(o.dy, o.dx);
            return yScale(d.life) + Math.sin(angle) * LABEL_DOT_RADIUS;
        })
        .attr("x2", d => {
            const o = LABEL_OFFSETS[d.country];
            return xScale(d.gdpPPP_avg) + o.dx - 2;
        })
        .attr("y2", d => {
            const o = LABEL_OFFSETS[d.country];
            return yScale(d.life) + o.dy + 1;
        })
        .attr("stroke", "#666")
        .attr("stroke-width", 0.9)
        .attr("stroke-linecap", "round")
        .attr("opacity", 0)
        .transition()
        .duration(300)
        .attr("opacity", 0.9);

    /* ---------- LABELS ---------- */

    labelLayer
        .selectAll("text")
        .data(data, d => d.country)
        .join("text")
        .attr("x", d => {
            const o = LABEL_OFFSETS[d.country];
            return xScale(d.gdpPPP_avg) + (o ? o.dx : 8);
        })
        .attr("y", d => {
            const o = LABEL_OFFSETS[d.country];
            return yScale(d.life) + (o ? o.dy : -6);
        })
        .attr("dominant-baseline", "middle") // vertical centering for the lines
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

    leaderLineLayer.selectAll("line")
        .transition()
        .duration(200)
        .attr("opacity", 0)
        .remove();
}

/* ============================================================
   REGION & PATTERN HIGHLIGHTS
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
        .attr("stroke-width", 1,2);

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
    // Find and highlight the corresponding visual dot
    const visualDot = g.selectAll(".country-dot")
        .filter(dotData => dotData.country === d.country);

    visualDot
        .raise() // Bring to front
        .transition()
        .duration(100)
        .attr("r", 7)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);

    hoverLayer.raise(); // keep tooltip above raised dot

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

    // White background rect to cover any dots behind - larger and fully opaque
    labelGroup.append("rect")
        .attr("x", -4)
        .attr("y", -22)
        .attr("rx", 8)
        .attr("ry", 8)
        .attr("width", 208)
        .attr("height", 66)
        .attr("fill", "#fff")
        .attr("opacity", 1);

    // Visible tooltip rect
    labelGroup.append("rect")
        .attr("x", 0)
        .attr("y", -18)
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("width", 200)
        .attr("height", 58)
        .attr("fill", "#f6f4e8")
        .attr("stroke", "rgba(0,0,0,0.15)")
        .attr("stroke-width", 0.5);

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
        .text(`GDP: ${Math.round(d.gdpPPP_avg / 1000)}k · Life: ${d.life.toFixed(2)}`);

    hoverGroup.style("opacity", 1);
}

function handleMouseLeave(event, d) {
    // Reset the visual dot
    const visualDot = g.selectAll(".country-dot")
        .filter(dotData => dotData.country === d.country);

    if (activeHighlight === "rich-unhappy") {
        const isMatch = SIMILAR_INCOME_DIFFERENT_WELLBEING.includes(d.country);
        visualDot
            .transition()
            .duration(200)
            .attr("opacity", isMatch ? 1 : 0.12)
            .attr("r", isMatch ? 7 : 4.5)
            .attr("stroke", isMatch ? "#111" : "none")
            .attr("stroke-width", 1.2);

    } else if (activeHighlight === "rich-happy") {
        const isMatch = RICH_AND_HAPPY.includes(d.country);
        visualDot
            .transition()
            .duration(200)
            .attr("opacity", isMatch ? 1 : 0.2)
            .attr("r", isMatch ? 6 : 4.5)
            .attr("stroke", isMatch ? "#222" : "none")
            .attr("stroke-width", 1.2);

    } else if (activeHighlight === "region") {
        visualDot
            .transition()
            .duration(200)
            .attr("opacity", d.region === activeRegion ? 1 : 0.15)
            .attr("r", 4.5)
            .attr("stroke", "none");

    } else {
        visualDot
            .transition()
            .duration(200)
            .attr("opacity", 0.95)
            .attr("r", 4.5)
            .attr("stroke", "none");
    }

    hoverGroup.style("opacity", 0);
}