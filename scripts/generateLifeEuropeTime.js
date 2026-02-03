import fs from "fs";
import { csvParse } from "d3-dsv";

/* ============================================================
   LIFE EVALUATION OVER TIME — EUROPE (GENERATOR)
   Output: human-readable JS object (not JSON)
============================================================ */

const EUROPE_COUNTRIES = new Set([
    "Austria","Belgium","Bulgaria","Croatia","Cyprus","Czechia","Denmark",
    "Estonia","Finland","France","Germany","Greece","Hungary","Ireland",
    "Italy","Latvia","Lithuania","Luxembourg","Malta","Netherlands",
    "Poland","Portugal","Romania","Slovakia","Slovenia","Spain","Sweden",
    "Norway","Switzerland","Iceland","Liechtenstein","United Kingdom"
]);

const CSV_PATH = "./public/data/OWID-happiness-and-life-satisfaction.csv";
const OUT_PATH = "./src/data/lifeEuropeTime.js";

function run() {
    const csvText = fs.readFileSync(CSV_PATH, "utf8");
    const raw = csvParse(csvText);

    const rows = raw
        .map(d => ({
            country: d.Entity,
            year: +d.Year,
            life: +(
                d["Life satisfaction"] ??
                d["Life ladder"] ??
                d["Cantril ladder score"]
            )
        }))
        .filter(d =>
            EUROPE_COUNTRIES.has(d.country) &&
            Number.isFinite(d.year) &&
            Number.isFinite(d.life)
        );

    const grouped = {};
    for (const { country, year, life } of rows) {
        if (!grouped[country]) grouped[country] = [];
        grouped[country].push({ year, life });
    }

    for (const country of Object.keys(grouped)) {
        grouped[country].sort((a, b) => a.year - b.year);
    }

    const countries = Object.keys(grouped).sort();

    let output = `/* ============================================================
   LIFE EVALUATION OVER TIME — EUROPE
   Source: Our World in Data (Gallup World Poll, annual estimates)
   Variable: Life evaluation / Cantril Ladder (0–10)
   Coverage: EU-27 + EFTA + United Kingdom
   Notes:
   - Annual values only (no rolling averages)
   - Missing years reflect survey gaps (e.g. 2013)
   - Countries may end in different years (latest: 2024)
============================================================ */

export const lifeEuropeTime = {
`;

    for (const country of countries) {
        output += `  ${country}: [\n`;
        for (const d of grouped[country]) {
            output += `    { year: ${d.year}, life: ${d.life} },\n`;
        }
        output += `  ],\n\n`;
    }

    output += `};\n`;

    fs.writeFileSync(OUT_PATH, output, "utf8");
    console.log("✔ lifeEuropeTime.js generated (human-readable format)");
}

run();
