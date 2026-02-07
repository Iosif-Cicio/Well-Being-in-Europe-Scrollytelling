import * as d3 from "d3";

/* ============================================================
   TIMELINE — LIFE EVALUATION OVER TIME
============================================================ */

let svg, g;
let xScale, yScale;
let width, height, margin;
let line;

let isZoomed = false;

const Y_DOMAIN_DEFAULT = [0, 10];
const Y_DOMAIN_ZOOMED = [3, 8];
const ZOOM_DURATION = 800;

const MISSING_YEAR = 2013;

// interaction state
const lockedCountries = new Set();

// distinguish narrative locks vs click lock so svg click doesn't wipe narrative
let lockMode = "none"; // "none" | "narrative" | "click"

// keyboard cursor state (single anchor)
let keyboardFocus = null; // { country, year }

// state for zoom re-render
let lastData = null;
let lastProgress = 0;

/* ============================================================
   HELPERS
============================================================ */

function getRankForYear(year, value, byCountry) {
    const values = [];

    byCountry.forEach(series => {
        const entry = series.find(d => d.year === year);
        if (entry && typeof entry.life === "number") {
            values.push(entry.life);
        }
    });

    values.sort((a, b) => b - a);
    const rank = values.indexOf(value) + 1;
    return rank > 0 ? rank : null;
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

// Fixed-position tooltip anchored to a point in the chart (g coords)
function positionFixedTooltipAtChartPoint(tooltipSel, cx, cy) {
    const svgNode = svg?.node?.();
    if (!svgNode) return;

    const rect = svgNode.getBoundingClientRect();
    const tooltipNode = tooltipSel.node();
    const tooltipWidth = tooltipNode?.offsetWidth ?? 0;

    const padding = 12;

    // prefer right side
    let x = rect.left + margin.left + cx + 14;
    const y = rect.top + margin.top + cy - 24;

    // flip to left if overflowing
    if (x + tooltipWidth + padding > window.innerWidth) {
        x = rect.left + margin.left + cx - tooltipWidth - 14;
    }

    x = clamp(x, padding, window.innerWidth - tooltipWidth - padding);

    tooltipSel
        .style("left", `${x}px`)
        .style("top", `${y}px`);
}

function clearKeyboardFocusVisuals() {
    g?.selectAll?.(".keyboard-focus-dot").remove();
    d3.select(".timeline-country-tooltip").style("opacity", 0);
}

function renderKeyboardFocus(byCountry) {
    // remove old dot always (single dot)
    g.selectAll(".keyboard-focus-dot").remove();

    const tooltip = d3.select(".timeline-country-tooltip");

    if (!keyboardFocus) {
        tooltip.style("opacity", 0);
        return;
    }

    // only allow keyboard focus if the country is currently focus-eligible:
    // - if there are lockedCountries, must be inside them
    if (lockedCountries.size && !lockedCountries.has(keyboardFocus.country)) {
        tooltip.style("opacity", 0);
        return;
    }

    const series = byCountry.get(keyboardFocus.country);
    if (!series) return;

    // never fabricate 2013: if year is 2013, hide (chapterFour skips it anyway)
    const point = series.find(d => d.year === keyboardFocus.year);
    if (!point) {
        tooltip.style("opacity", 0);
        return;
    }

    g.append("circle")
        .attr("class", "keyboard-focus-dot")
        .attr("r", 6)
        .attr("fill", "#8f3c97")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2)
        .attr("pointer-events", "none")
        .attr("cx", xScale(point.year))
        .attr("cy", yScale(point.life));

    tooltip
        .style("position", "fixed")
        .style("pointer-events", "none")
        .style("opacity", 1)
        .html(`
            <strong>${point.country}</strong><br/>
            Year: ${point.year}<br/>
            Life evaluation: ${point.life.toFixed(2)}
        `);

    positionFixedTooltipAtChartPoint(
        tooltip,
        xScale(point.year),
        yScale(point.life)
    );
}

/* ============================================================
   INIT
============================================================ */

export function initTimeline({ container, years }) {

    margin = { top: 80, right: 40, bottom: 90, left: 80 };

    const node = container.node();
    width = node.clientWidth - margin.left - margin.right;
    height = window.innerHeight * 0.85 - margin.top - margin.bottom;

    container.selectAll("svg").remove();

    svg = container.append("svg")
        .attr(
            "viewBox",
            `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
        )
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("height", "100%");

    g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    /* ======================
       SCALES
    ====================== */

    const numericYears = years.map(d => +d);

    xScale = d3.scaleLinear()
        .domain([numericYears[0], numericYears[numericYears.length - 1]])
        .range([0, width]);

    yScale = d3.scaleLinear()
        .domain(Y_DOMAIN_DEFAULT)
        .range([height, 0]);

    /* ======================
       AXES
    ====================== */

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(
            d3.axisBottom(xScale)
                .tickValues(numericYears)
                .tickFormat(d3.format("d"))
        );

    g.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale));

    g.append("text")
        .attr("x", -margin.left + 10)
        .attr("y", -24)
        .attr("font-size", "14px")
        .attr("font-weight", 600)
        .text("Life evaluation (0–10)");

    /* ======================
       LINE GENERATOR
    ====================== */

    line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.life))
        .curve(d3.curveLinear);

    /* ======================
       TOOLTIP DIVS
    ====================== */

    d3.select("body")
        .selectAll(".timeline-tooltip")
        .data([null])
        .join("div")
        .attr("class", "timeline-tooltip")
        .style("position", "fixed")          // <- fixed so it won't drift on scroll
        .style("pointer-events", "none")
        .style("opacity", 0);

    d3.select("body")
        .selectAll(".timeline-country-tooltip")
        .data([null])
        .join("div")
        .attr("class", "timeline-country-tooltip")
        .style("position", "fixed")          // <- fixed so it won't drift on scroll
        .style("pointer-events", "none")
        .style("opacity", 0);

    /* ======================
       2013 INFO ICON (UNCHANGED SEMANTICS)
    ====================== */

    const infoGroup = g.append("g")
        .attr("transform", `translate(${xScale(MISSING_YEAR)}, ${height + 18})`)
        .style("cursor", "help");

    infoGroup.append("circle")
        .attr("r", 10)
        .attr("fill", "#F5F5DD")
        .attr("stroke", "#1a1a1a")
        .attr("stroke-width", 1.5);

    infoGroup.append("rect")
        .attr("x", -0.75)
        .attr("y", -1)
        .attr("width", 1.5)
        .attr("height", 6)
        .attr("fill", "#1a1a1a");

    infoGroup.append("circle")
        .attr("cy", -6)
        .attr("r", 1.3)
        .attr("fill", "#1a1a1a");

    const infoTooltip = d3.select(".timeline-tooltip");

    infoGroup
        .on("mouseenter", () => {
            infoTooltip
                .style("opacity", 1)
                .html(`
                    <div style="text-align:center">
                        <strong>Why is 2013 missing?</strong><br/>
                        Life evaluation data was not reported consistently
                        across Europe due to survey fieldwork gaps
                        in the Gallup World Poll.
                    </div>
                `);
        })
        .on("mousemove", (event) => {
            // fixed positioning => clientX/clientY
            infoTooltip
                .style("left", event.clientX + 12 + "px")
                .style("top", event.clientY - 24 + "px");
        })
        .on("mouseleave", () => {
            infoTooltip.style("opacity", 0);
        });
}

/* ============================================================
   UPDATE — CONTINUOUS SCROLL
============================================================ */

export function updateTimelineProgress(data, progress) {

    lastData = data;
    lastProgress = progress;

    const allYears = Array.from(new Set(data.map(d => d.year))).sort((a, b) => a - b);
    const minYear = allYears[0];
    const maxYear = allYears[allYears.length - 1];

    const p = Math.max(0, Math.min(1, progress));
    const currentYearFloat = minYear + p * (maxYear - minYear);

    const prevYear = d3.max(allYears.filter(y => y <= currentYearFloat));
    const nextYear = d3.min(allYears.filter(y => y > currentYearFloat));

    const t = (nextYear && nextYear !== prevYear)
        ? (currentYearFloat - prevYear) / (nextYear - prevYear)
        : 0;

    const byCountry = d3.group(data, d => d.country);
    const countries = Array.from(byCountry.keys()).sort(d3.ascending);

    const countryTooltip = d3.select(".timeline-country-tooltip");

    const paths = g.selectAll(".country-line")
        .data(countries, d => d);

    paths.enter()
        .append("path")
        .attr("class", "country-line")
        .attr("fill", "none")
        .attr("stroke", "#8f3c97")
        .attr("stroke-width", 2)
        .merge(paths)
        .attr("stroke-width", c =>
            lockedCountries.has(c)
                ? 3
                : (isZoomed ? 2.4 : 2)
        )
        .attr("opacity", c => {
            if (!lockedCountries.size) return 0.55;
            return lockedCountries.has(c) ? 0.95 : 0.18;
        })
        .attr("d", country => {

            const series = byCountry.get(country)
                .slice()
                .sort((a, b) => a.year - b.year);

            const base = series.filter(d => d.year <= prevYear);

            if (nextYear) {
                const a = series.find(d => d.year === prevYear);
                const b = series.find(d => d.year === nextYear);
                if (a && b) {
                    base.push({
                        country,
                        year: currentYearFloat,
                        life: a.life + (b.life - a.life) * t
                    });
                }
            }

            return base.length >= 2 ? line(base) : null;
        })
        .on("mouseenter", (event, country) => {
            if (lockedCountries.size && !lockedCountries.has(country)) return;

            countryTooltip
                .style("opacity", 1)
                .html(`<strong>${country}</strong>`);
        })
        .on("mousemove", (event, country) => {
            if (lockedCountries.size && !lockedCountries.has(country)) return;

            // fixed tooltip => client coords
            countryTooltip
                .style("left", event.clientX + 12 + "px")
                .style("top", event.clientY - 24 + "px");
        })
        .on("mouseleave", () => {
            countryTooltip.style("opacity", 0);
        })
        .on("click", (event, country) => {
            event.stopPropagation();

            // If narrative focus exists (LOSERS/WINNERS), do NOT destroy it.
            // Only set keyboard anchor inside the allowed set.
            if (lockedCountries.size) {
                if (!lockedCountries.has(country)) return;

                // anchor keyboard to clicked country, keep current year if possible
                keyboardFocus = keyboardFocus
                    ? { country, year: keyboardFocus.year }
                    : { country, year: prevYear };

                document.dispatchEvent(new CustomEvent("timeline-line-clicked", {
                    detail: {
                        country,
                        year: keyboardFocus.year,
                        source: "line"
                    }
                }));

                updateTimelineProgress(data, progress);
                return;
            }

            // Otherwise: create click-based exclusive focus
            lockedCountries.clear();
            lockedCountries.add(country);
            lockMode = "click";

            const series = byCountry.get(country).slice().sort((a, b) => a.year - b.year);
            const safeYear = (keyboardFocus?.year && keyboardFocus.year !== MISSING_YEAR)
                ? keyboardFocus.year
                : series[0]?.year;

            keyboardFocus = { country, year: safeYear };

            document.dispatchEvent(new CustomEvent("timeline-line-clicked", {
                detail: {
                    country,
                    year: keyboardFocus.year,
                    source: "line"
                }
            }));

            updateTimelineProgress(data, progress);
        });

    // Only clear click-based focus on svg click.
    svg.on("click", () => {
        if (lockMode !== "click") return;

        if (lockedCountries.size) {
            lockedCountries.clear();
            lockMode = "none";
            keyboardFocus = null;
            clearKeyboardFocusVisuals();
            updateTimelineProgress(data, progress);
        }
    });

    paths.exit().remove();

    /* ======================
       DOTS — LOCKED COUNTRIES
    ====================== */

    const dotData = [];
    lockedCountries.forEach(country => {
        byCountry.get(country)
            .filter(d => d.year <= prevYear)
            .forEach(d => dotData.push(d));
    });

    const dots = g.selectAll(".country-dot")
        .data(dotData, d => `${d.country}-${d.year}`);

    dots.enter()
        .append("circle")
        .attr("class", "country-dot")
        .attr("r", 4)
        .attr("fill", "#8f3c97")
        .merge(dots)
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.life))
        .on("mouseenter", (event, d) => {
            const rank = getRankForYear(d.year, d.life, byCountry);

            countryTooltip
                .style("opacity", 1)
                .html(`
                    <strong>${d.country}</strong><br/>
                    Year: ${d.year}<br/>
                    Average Evaluation: ${d.life.toFixed(2)}<br/>
                    Sample Rank: ${rank}
                `);
        })
        .on("mousemove", (event) => {
            const tooltipNode = countryTooltip.node();
            const tooltipWidth = tooltipNode.offsetWidth;
            const padding = 16;

            // fixed => client coords
            const x = event.clientX + tooltipWidth + padding > window.innerWidth
                ? event.clientX - tooltipWidth - padding
                : event.clientX + padding;

            countryTooltip
                .style("left", x + "px")
                .style("top", event.clientY - 28 + "px");
        })
        .on("mouseleave", () => {
            countryTooltip.style("opacity", 0);
        })
        .on("click", (event, d) => {
            // clicking a dot anchors keyboard to that country+year
            event.stopPropagation();

            // If narrative focus exists, only allow dots inside it (they are)
            // If click focus exists, this dot is inside it too
            keyboardFocus = { country: d.country, year: d.year };

            document.dispatchEvent(new CustomEvent("timeline-line-clicked", {
                detail: {
                    country: d.country,
                    year: d.year,
                    source: "dot"
                }
            }));

            updateTimelineProgress(data, progress);
        });

    dots.exit().remove();

    // keyboard focus dot + tooltip (single)
    renderKeyboardFocus(byCountry);
}

/* ============================================================
   KEYBOARD CURSOR API
============================================================ */

export function setKeyboardFocus(country, year, data, progress) {
    if (year === MISSING_YEAR) return;

    keyboardFocus = { country, year };

    if (data && typeof progress === "number") {
        updateTimelineProgress(data, progress);
        return;
    }

    if (lastData) {
        const byCountry = d3.group(lastData, d => d.country);
        renderKeyboardFocus(byCountry);
    }
}

/* ============================================================
   CLICK FOCUS API (NEW)
   - lets ChapterFour move the exclusive click-focus with ↑/↓
============================================================ */

export function setClickFocusCountry(country, data, progress) {
    lockedCountries.clear();
    lockedCountries.add(country);
    lockMode = "click";

    // do NOT touch keyboardFocus year here; chapter sets it via setKeyboardFocus
    updateTimelineProgress(data ?? lastData, typeof progress === "number" ? progress : lastProgress);
}

/* ============================================================
   STEP HELPERS — PROGRAMMATIC HIGHLIGHTS
============================================================ */

export function highlightCountries(countries, data, progress) {
    lockedCountries.clear();
    countries.forEach(c => lockedCountries.add(c));
    lockMode = "narrative";

    if (keyboardFocus && !lockedCountries.has(keyboardFocus.country)) {
        keyboardFocus = null;
        clearKeyboardFocusVisuals();
    }

    updateTimelineProgress(data, progress);
}

export function resetTimelineHighlight(data, progress) {
    lockedCountries.clear();
    lockMode = "none";

    keyboardFocus = null;
    clearKeyboardFocusVisuals();

    updateTimelineProgress(data, progress);
}

/* ============================================================
   Y-AXIS ZOOM TOGGLE
============================================================ */

export function toggleYAxisZoom() {
    isZoomed = !isZoomed;

    yScale.domain(isZoomed ? Y_DOMAIN_ZOOMED : Y_DOMAIN_DEFAULT);

    // animate axis
    g.select(".y-axis")
        .transition()
        .duration(ZOOM_DURATION)
        .ease(d3.easeCubicInOut)
        .call(d3.axisLeft(yScale));

    // animate lines + stroke width together
    g.selectAll(".country-line")
        .transition()
        .duration(ZOOM_DURATION)
        .ease(d3.easeCubicInOut)
        .attr("stroke-width", d =>
            lockedCountries.has(d) ? 3 : (isZoomed ? 2.4 : 2)
        )
        .attr("d", country => {
            const series = lastData
                ? d3.group(lastData, d => d.country).get(country)
                : null;

            if (!series) return null;

            return line(
                series
                    .slice()
                    .sort((a, b) => a.year - b.year)
                    .filter(d => d.year <=
                        d3.min([
                            d3.max(series.map(d => d.year)),
                            series[series.length - 1].year
                        ])
                    )
            );
        });

    // dots follow the same scale smoothly
    g.selectAll(".country-dot")
        .transition()
        .duration(ZOOM_DURATION)
        .ease(d3.easeCubicInOut)
        .attr("cy", d => yScale(d.life));

    return isZoomed;
}
