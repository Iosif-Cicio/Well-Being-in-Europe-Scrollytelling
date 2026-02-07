import * as d3 from "d3";

let svg, gMap, path;
let dataByIso3 = new Map();
let rankByIso3 = new Map();
let tooltipEl, legendEl;
let euAverage = null;

const regions = [
    ["FIN", "SWE", "DNK", "NOR", "ISL"],                 // Step 1 — Northern
    ["ESP", "ITA", "PRT", "GRC"],                        // Step 2 — Southern
    ["POL", "CZE", "SVK", "LTU", "LVA", "EST"],          // Step 3 — Central/Eastern
    ["FRA", "GBR", "BEL"],                               // Step 4 — Outliers
];


const darkYlGnBu = (t) => d3.interpolateYlGnBu(0.35 + t * 0.65);

function getIso3(feature) {
    const p = feature?.properties || {};
    return (
        p.ISO_A3 ||
        p.ISO3 ||
        p.ADM0_A3 ||
        p.ISO_A3_EH ||
        p.ISO ||
        feature.id ||
        null
    );
}

function getCountryName(feature) {
    const p = feature?.properties || {};
    return (
        p.NAME_EN ||
        p.NAME ||
        p.ADMIN ||
        p.NAME_LONG ||
        p.BRK_NAME ||
        p.SOVEREIGNT ||
        "Unknown country"
    );
}

/* ============================================================
   TOOLTIP
============================================================ */

function ensureTooltip() {
    d3.selectAll(".map-tooltip").remove();

    tooltipEl = d3
        .select("body")
        .append("div")
        .attr("class", "map-tooltip")
        .style("opacity", 0);
}

function showTooltip(html, x, y) {
    tooltipEl
        .style("opacity", 1)
        .html(html)
        .style("left", `${x + 12}px`)
        .style("top", `${y + 12}px`);
}

function hideTooltip() {
    tooltipEl.style("opacity", 0);
}

/* ============================================================
   LEGEND
============================================================ */

function ensureLegend({ min, max }) {
    d3.selectAll(".map-legend").remove();

    legendEl = d3
        .select("body")
        .append("div")
        .attr("class", "map-legend")
        .html(`
            <div class="map-legend-title">Life evaluation (Cantril Ladder)</div>
            <div class="map-legend-sub">
                Scale: 0 = worst possible life · 10 = best possible life<br/>
                Observed in Europe: <strong>${min.toFixed(1)}–${max.toFixed(1)}</strong>
            </div>
            <div class="map-legend-bar"></div>
            <div class="map-legend-ticks">
                <span>${min.toFixed(1)}</span>
                <span>${max.toFixed(1)}</span>
            </div>
        `);

    const stopsT = [0, 0.15, 0.30, 0.45, 0.60, 0.75, 0.90, 1];
    const stops = stopsT.map(t => darkYlGnBu(t)).join(",");

    legendEl
        .select(".map-legend-bar")
        .style("background", `linear-gradient(to right, ${stops})`);

    setLegendVisible(false);
}

export function setLegendVisible(isVisible) {
    if (!legendEl) return;
    legendEl.classed("is-visible", !!isVisible);
}

/* ============================================================
   INIT
============================================================ */

export async function initChoropleth(target) {
    const container = d3.select(target);
    container.selectAll("svg").remove();

    const width = container.node().clientWidth;
    const height = container.node().clientHeight;

    svg = container
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("width", "100%")
        .style("height", "100%");

    gMap = svg.append("g");

    ensureTooltip();

    const [geo, rows] = await Promise.all([
        d3.json("./data/europe.geojson"),
        d3.csv(
            "./data/whr25_eu27_efta_uk_lifeladder_2024_3yravg.csv",
            (d) => ({
                iso3: (d.iso3 || "").trim(),
                country: (d.country || "").trim(),
                score: +d.ladder_score,
            })
        ),
    ]);

    /* ============================================================
       DATA CLEANING
    ============================================================ */

    const clean = rows.filter((d) => d.iso3 && !Number.isNaN(d.score));

    dataByIso3 = new Map(clean.map((d) => [d.iso3, d]));

    euAverage = d3.mean(clean, (d) => d.score);

    const ranked = [...clean].sort((a, b) => d3.descending(a.score, b.score));

    rankByIso3 = new Map();
    ranked.forEach((d, i) => rankByIso3.set(d.iso3, i + 1));

    const projection = d3.geoMercator().fitSize([width, height], geo);
    path = d3.geoPath().projection(projection);

    // Relative scale: observed European min to max
    const extent = d3.extent(clean, (d) => d.score);

    const color = d3
        .scaleSequential()
        .domain(extent)
        .interpolator(darkYlGnBu);

    ensureLegend({ min: extent[0], max: extent[1] });

    /* ============================================================
       DRAW MAP
    ============================================================ */

    gMap
        .selectAll("path")
        .data(geo.features)
        .join("path")
        .attr("class", "country-path")
        .attr("d", path)
        .attr("display", (f) => {
            const iso3 = getIso3(f);
            return iso3 === "ISR" ? "none" : null;
        })
        .attr("fill", (f) => {
            const iso3 = getIso3(f);
            const entry = iso3 ? dataByIso3.get(iso3) : null;
            return entry ? color(entry.score) : "#d6d2c8";
        })
        .attr("stroke", "#333")
        .attr("stroke-width", 0.6)
        .attr("opacity", 0.95)
        .on("mousemove", (event, f) => {
            const iso3 = getIso3(f);
            const name = getCountryName(f);
            const entry = iso3 ? dataByIso3.get(iso3) : null;

            if (!entry) {
                showTooltip(`<strong>${name}</strong>`, event.clientX, event.clientY);
                return;
            }

            const rank = rankByIso3.get(entry.iso3);
            const total = rankByIso3.size;

            const delta = entry.score - euAverage;
            const deltaStr = (delta >= 0 ? "+" : "") + delta.toFixed(2);

            showTooltip(
                `<strong>${entry.country || name}</strong><br/>
                 Life Ladder: ${entry.score.toFixed(2)}<br/>
                 vs EU avg: ${deltaStr} (avg ${euAverage.toFixed(2)})<br/>
                 Rank in Europe: ${rank} / ${total}`,
                event.clientX,
                event.clientY
            );
        })
        .on("mouseleave", hideTooltip);

    updateChoropleth(0);
}

/* ============================================================
   STEP UPDATE
============================================================ */

export function updateChoropleth(stepIndex) {
    if (!gMap) return;

    if (stepIndex === 0 || stepIndex == null) {
        gMap
            .selectAll("path")
            .interrupt()
            .transition()
            .duration(450)
            .attr("opacity", 0.95)
            .attr("stroke-width", 0.6);
        return;
    }

    const regionIndex = stepIndex - 1;
    const group = regions[regionIndex] || [];
    const active = new Set(group);

    gMap
        .selectAll("path")
        .interrupt()
        .transition()
        .duration(600)
        .attr("opacity", (f) => {
            const iso3 = getIso3(f);
            return iso3 && active.has(iso3) ? 1 : 0.15;
        })
        .attr("stroke-width", (f) => {
            const iso3 = getIso3(f);
            return iso3 && active.has(iso3) ? 1.5 : 0.6;
        });
}