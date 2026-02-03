import fs from "fs";
import xlsx from "xlsx";

/* ============================================================
   HAPPINESS — EUROPE (WHR 2025, FIGURE 2.1)
   Generated dataset for stacked bar chart
   Aggregation: 3-year average (2022–2024)
   Ranking year: 2024
============================================================ */

const XLSX_PATH = "./public/data/WHR25_Data_Figure_2.1v3.xlsx";
const OUT_PATH  = "./src/data/happinessEurope2025.js";

/* Region + ISO lookup (static, intentional) */
const META = {
    Austria: ["AT","Western Europe"],
    Belgium: ["BE","Western Europe"],
    Bulgaria: ["BG","Eastern Europe"],
    Croatia: ["HR","Eastern Europe"],
    Cyprus: ["CY","Southern Europe"],
    Czechia: ["CZ","Eastern Europe"],
    Denmark: ["DK","Northern Europe"],
    Estonia: ["EE","Eastern Europe"],
    Finland: ["FI","Northern Europe"],
    France: ["FR","Western Europe"],
    Germany: ["DE","Western Europe"],
    Greece: ["GR","Southern Europe"],
    Hungary: ["HU","Eastern Europe"],
    Iceland: ["IS","Northern Europe"],
    Ireland: ["IE","Northern Europe"],
    Italy: ["IT","Southern Europe"],
    Latvia: ["LV","Eastern Europe"],
    Lithuania: ["LT","Eastern Europe"],
    Luxembourg: ["LU","Western Europe"],
    Malta: ["MT","Southern Europe"],
    Netherlands: ["NL","Western Europe"],
    Norway: ["NO","Northern Europe"],
    Poland: ["PL","Eastern Europe"],
    Portugal: ["PT","Southern Europe"],
    Romania: ["RO","Eastern Europe"],
    Slovakia: ["SK","Eastern Europe"],
    Slovenia: ["SI","Eastern Europe"],
    Spain: ["ES","Southern Europe"],
    Sweden: ["SE","Northern Europe"],
    Switzerland: ["CH","Western Europe"],
    "United Kingdom": ["GB","Western Europe"]
};

function run() {
    const wb = xlsx.readFile(XLSX_PATH);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    const data = rows
        // WHR 2025 snapshot
        .filter(d => d.Year === 2024)
        .filter(d => META[d["Country name"]])
        .map(d => {
            const [iso2, region] = META[d["Country name"]];

            return {
                country: d["Country name"],
                iso2,
                region,
                life: +d["Life evaluation (3-year average)"],
                gdp: +d["Explained by: Log GDP per capita"],
                socialSupport: +d["Explained by: Social support"],
                healthyLife: +d["Explained by: Healthy life expectancy"],
                freedom: +d["Explained by: Freedom to make life choices"],
                trust: +d["Explained by: Perceptions of corruption"],
                generosity: +d["Explained by: Generosity"],
                dystopiaResidual: +d["Dystopia + residual"]
            };
        })
        // preserve same default order as before (descending life)
        .sort((a, b) => b.life - a.life);

    let output = `// Curated dataset derived from the World Happiness Report 2025
// Chapter 2 (Figure 2.1) + prepared for joining main WHR indicators
// Coverage: EU + EFTA + United Kingdom
//
// Each row represents the final 3-year average used in WHR 2025.
//
// life           → How good does life feel overall?
// gdp            → What does money contribute?
// socialSupport  → Do people feel they can rely on others?
// healthyLife    → Are people living long, healthy lives?
// freedom        → Do people feel in control of their choices?
// trust          → Do institutions feel fair and reliable?
// generosity     → Do people give beyond themselves?
//
// Flags-SVG source: https://github.com/lipis/flag-icons/tree/main/flags/4x3

export const happinessEurope2025 = [
`;

    for (const d of data) {
        output +=
            `  { country:"${d.country}", iso2:"${d.iso2}", region:"${d.region}",
    life:${d.life.toFixed(2)}, gdp:${d.gdp.toFixed(3)}, socialSupport:${d.socialSupport.toFixed(3)},
    healthyLife:${d.healthyLife.toFixed(3)}, freedom:${d.freedom.toFixed(3)},
    trust:${d.trust.toFixed(3)}, generosity:${d.generosity.toFixed(3)},
    dystopiaResidual:${d.dystopiaResidual.toFixed(3)} },
`;
    }

    output += `];\n`;

    fs.writeFileSync(OUT_PATH, output, "utf8");
    console.log("✔ happinessEurope2025.js generated (WHR 2025, Figure 2.1)");
}

run();
