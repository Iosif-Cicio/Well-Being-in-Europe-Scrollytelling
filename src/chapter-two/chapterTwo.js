import * as d3 from "d3";
import scrollama from "scrollama";
import { incomeEuropePPP } from "../data/incomeEuropePPP.js";

import {
    initScatterplot,
    highlightRegion,
    resetRegionHighlight,
    highlightRichAndHappy,
    highlightRichButUnhappy
} from "../charts/scatterplot.js";

import { happinessEurope2025 } from "../data/happinessEurope2025.js";

/* ============================================================
   CHAPTER TWO — SCATTERPLOT + SCROLL
============================================================ */

const container = d3.select("#chapter-two-viz");
const stickyFigure = d3.select("#chapter-two-scrolly figure");

/* reference to source element */
const sourceEl = d3.select("#chapter-two-source");

let width, height;
let scroller;

/* ============================================================
   INIT
============================================================ */

export async function initChapterTwo() {
    if (container.empty()) {
        console.warn("Chapter Two container not found");
        return;
    }

    setupDimensions();

    const incomeByIso = new Map(
        incomeEuropePPP.map(d => [d.iso2, d])
    );

    const mergedData = happinessEurope2025
        .map(d => ({
            ...d,
            ...incomeByIso.get(d.iso2)
        }))
        .filter(d => Number.isFinite(d.gdpPPP_avg));

    initScatterplot({
        container,
        data: mergedData,
        width,
        height
    });

    // start hidden (fade-in behavior unchanged)
    if (!stickyFigure.empty()) {
        stickyFigure.classed("is-visible", false);
    }

    // Source is ALWAYS visible now
    if (!sourceEl.empty()) {
        sourceEl.classed("chart-source--hidden", false);
    }

    setupScroller();
}

/* ============================================================
   DIMENSIONS
============================================================ */

function setupDimensions() {
    width = container.node().clientWidth;
    height = container.node().clientHeight || 600;
}

/* ============================================================
   SCROLLAMA
============================================================ */

function setupScroller() {
    scroller = scrollama();

    scroller
        .setup({
            step: "#chapter-two-scrolly .step",
            offset: 0.6
        })
        .onStepEnter(({ element }) => {
            const step = element.dataset.step;

            // fade in on first entry
            if (!stickyFigure.empty() && !stickyFigure.classed("is-visible")) {
                stickyFigure.classed("is-visible", true);
            }

            resetRegionHighlight();

            switch (step) {
                case "gdp-western-highlight":
                    highlightRichAndHappy();
                    break;

                case "gdp-outliers":
                    highlightRichButUnhappy();
                    break;

                default:
                    break;
            }
        })
        .onStepExit(({ element, direction }) => {
            const step = element.dataset.step;

            if (direction === "up" && step === "gdp-intro") {
                if (!stickyFigure.empty()) {
                    stickyFigure.classed("is-visible", false);
                }
            }
        });
}