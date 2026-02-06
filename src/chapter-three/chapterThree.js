import * as d3 from "d3";
import scrollama from "scrollama";

import {
    initBarChart,
    updateBars,
    resetChart
} from "../charts/barchart.js";

import { happinessEurope2025 } from "../data/happinessEurope2025.js";

/* ============================================================
   CHAPTER THREE — BAR CHART + SCROLL
============================================================ */

const container = d3.select("#chapter-three-viz");

let width, height;
let scroller;

// Must match visual trigger
const FADE_OFFSET = 0.6;

/* ============================================================
   INIT
============================================================ */

export function initChapterThree() {
    if (container.empty()) {
        console.warn("Chapter Three container not found");
        return;
    }

    // source is always visible
    const source = document.getElementById("chapter-three-source");
    if (source) source.classList.add("chart-source--visible");

    setupDimensions();

    initBarChart({
        container,
        data: happinessEurope2025,
        width,
        height
    });

    setupScroller();
    setupReloadSafeFade();

    // Only reset visuals here — no narrative state
    resetChart();

    // 🔁 Sync chart with current step AFTER reload
    requestAnimationFrame(syncInitialStep);

    // 🔒 Conditional resize safeguard (shrink only)
    window.addEventListener("resize", handleResize);
}

/* ============================================================
   DIMENSIONS (SHRINK-ONLY LOGIC)
============================================================ */

function setupDimensions() {
    width = container.node().clientWidth;

    const DESIGN_HEIGHT = 720; // intended desktop size
    const MIN_HEIGHT = 480;    // absolute safety floor

    const figure = container.node().closest("figure");

    if (!figure) {
        height = DESIGN_HEIGHT;
        return;
    }

    const available = figure.clientHeight;

    // Only shrink when necessary
    if (available < DESIGN_HEIGHT) {
        height = Math.max(MIN_HEIGHT, available);
    } else {
        height = DESIGN_HEIGHT;
    }
}

/* ============================================================
   RESIZE HANDLER (NO GROWTH, NO JITTER)
============================================================ */

function handleResize() {
    const prevHeight = height;

    setupDimensions();

    if (height !== prevHeight) {
        initBarChart({
            container,
            data: happinessEurope2025,
            width,
            height
        });
    }
}

/* ============================================================
   STEP HANDLER
============================================================ */

function handleStepEnter(element) {
    const stepKey = element.dataset.step;
    if (!stepKey) return;

    updateBars(stepKey);

    // active step styling
    document
        .querySelectorAll("#chapter-three-scrolly .step")
        .forEach(step =>
            step.classList.toggle("is-active", step === element)
        );

    // source stays visible (no toggling anymore)
}

/* ============================================================
   SCROLLAMA — DATA STATES ONLY
============================================================ */

function setupScroller() {
    scroller = scrollama();

    scroller
        .setup({
            step: "#chapter-three-scrolly .step",
            offset: FADE_OFFSET
        })
        .onStepEnter(({ element }) => {
            handleStepEnter(element);
        });
}

/* ============================================================
   RELOAD STEP SYNC
============================================================ */

function syncInitialStep() {
    const steps = document.querySelectorAll("#chapter-three-scrolly .step");
    const triggerLine = window.innerHeight * FADE_OFFSET;

    for (const step of steps) {
        const rect = step.getBoundingClientRect();

        if (rect.top < triggerLine && rect.bottom > triggerLine) {
            handleStepEnter(step);
            break;
        }
    }
}

/* ============================================================
   RELOAD-SAFE FADE (UNCHANGED)
============================================================ */

function setupReloadSafeFade() {
    const figure = document.querySelector("#chapter-three-scrolly figure");
    const firstStep = document.querySelector(
        '#chapter-three-scrolly .step[data-step="gdp-bars-intro"]'
    );

    if (!figure || !firstStep) {
        console.warn("Fade elements not found");
        return;
    }

    let ticking = false;

    const updateVisibility = () => {
        const triggerLine = window.innerHeight * FADE_OFFSET;
        const stepRect = firstStep.getBoundingClientRect();

        figure.classList.toggle(
            "is-visible",
            stepRect.top < triggerLine
        );

        ticking = false;
    };

    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(updateVisibility);
    };

    updateVisibility();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateVisibility);
    window.addEventListener("load", updateVisibility);
}