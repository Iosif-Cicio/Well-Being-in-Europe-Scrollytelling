import * as d3 from "d3";

import {
    initTimeline,
    updateTimelineProgress,
    toggleYAxisZoom,
    highlightCountries,
    resetTimelineHighlight,
    setKeyboardFocus,
    setClickFocusCountry
} from "../charts/timeline.js";

import { lifeEuropeTime } from "../data/lifeEuropeTime.js";

let data;
let years;

// global zoom state helpers
const getZoomState = () => window.appState?.timelineZoomed === true;
const setZoomState = (v) => {
    if (window.appState) {
        window.appState.timelineZoomed = v;
    }
};

const LOSERS = [
    "Austria",
    "Germany",
    "Switzerland",
    "United Kingdom",
    "Cyprus"
];

const WINNERS = [
    "Bulgaria",
    "Estonia",
    "Lithuania",
    "Latvia",
    "Romania"
];

// keyboard state
let ranking2011 = [];
let kbCountryIndex = null;
let kbYearIndex = null;

// keep the latest timelineProgress from scroll so keyboard calls stay in sync
let currentTimelineProgress = 0;

// click / keyboard focus mode
let clickFocusActive = false;

// scroll + step reset tracking
let lastActiveStep = null;
let lastScrollY = window.scrollY;
let accumulatedScroll = 0;

// ~1cm scroll threshold (≈ 38px on standard DPI)
const SCROLL_RESET_THRESHOLD = 38;

export function initChapterFour() {

    const container = d3.select("#chapter-four-viz");
    if (container.empty()) return;

    /* ======================
       DATA PREP
    ====================== */

    data = Object.entries(lifeEuropeTime)
        .flatMap(([country, values]) =>
            values.map(d => ({
                country,
                year: +d.year,
                life: +d.life
            }))
        );

    years = Array.from(new Set(data.map(d => d.year)))
        .sort((a, b) => a - b);

    initTimeline({ container, years });

    /* ======================
       BUILD 2011 RANKING
    ====================== */

    const firstYear = years[0];

    const lifeByCountryFirstYear = new Map();
    data.forEach(d => {
        if (d.year === firstYear) {
            lifeByCountryFirstYear.set(d.country, d.life);
        }
    });

    ranking2011 = Array.from(lifeByCountryFirstYear.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([country]) => country);

    /* ======================
       RESTORE GLOBAL ZOOM
    ====================== */

    if (getZoomState()) {
        toggleYAxisZoom();
    }

    /* ======================
       SCROLL SETUP
    ====================== */

    const scrolly = document.querySelector("#chapter-four-scrolly");
    const release = document.querySelector(".chapter-four-release");
    const steps = Array.from(document.querySelectorAll(".chapter-four-step"));

    function getActiveStep() {
        const mid = window.innerHeight * 0.5;
        let active = 0;

        steps.forEach(step => {
            const rect = step.getBoundingClientRect();
            if (rect.top <= mid && rect.bottom >= mid) {
                active = +step.dataset.step;
            }
        });

        steps.forEach(step =>
            step.classList.toggle(
                "is-active",
                +step.dataset.step === active
            )
        );

        return active;
    }

    function isChapterFourInView() {
        const rect = scrolly.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    function getAllowedCountryList(activeStep) {
        if (activeStep === 4) return LOSERS.slice();
        if (activeStep === 5) return WINNERS.slice();
        return ranking2011.slice();
    }

    function constrainCountryIndex(list) {
        if (kbCountryIndex === null) return;
        kbCountryIndex = Math.max(0, Math.min(kbCountryIndex, list.length - 1));
    }

    function constrainYearIndex() {
        if (kbYearIndex === null) return;
        kbYearIndex = Math.max(0, Math.min(kbYearIndex, years.length - 1));
    }

    /* ======================
       HARD RESET (scroll / step)
    ====================== */

    function hardResetInteraction(timelineProgress) {
        clickFocusActive = false;
        kbCountryIndex = null;
        kbYearIndex = null;
        accumulatedScroll = 0;

        resetTimelineHighlight(data, timelineProgress);
    }

    function ensureKeyboardInit(activeStep) {
        if (kbCountryIndex !== null && kbYearIndex !== null) return;

        const list = getAllowedCountryList(activeStep);
        kbCountryIndex = 0;
        kbYearIndex = 0;

        if (activeStep !== 4 && activeStep !== 5) {
            clickFocusActive = true;
            setClickFocusCountry(list[kbCountryIndex], data, currentTimelineProgress);
        }

        setKeyboardFocus(list[kbCountryIndex], years[kbYearIndex], data, currentTimelineProgress);
    }

    function applyKeyboardFocus(activeStep) {
        const list = getAllowedCountryList(activeStep);

        constrainCountryIndex(list);
        constrainYearIndex();

        const country = list[kbCountryIndex];
        const year = years[kbYearIndex];

        if (activeStep === 4 || activeStep === 5) {
            clickFocusActive = false;
            setKeyboardFocus(country, year, data, currentTimelineProgress);
            return;
        }

        clickFocusActive = true;
        setClickFocusCountry(country, data, currentTimelineProgress);
        setKeyboardFocus(country, year, data, currentTimelineProgress);
    }

    function onScroll() {

        const currentY = window.scrollY;
        accumulatedScroll += Math.abs(currentY - lastScrollY);
        lastScrollY = currentY;

        const scrollyRect = scrolly.getBoundingClientRect();
        const releaseRect = release.getBoundingClientRect();

        const totalScroll =
            releaseRect.top - scrollyRect.top - window.innerHeight;

        if (totalScroll <= 0) return;

        const currentScroll = Math.min(
            Math.max(-scrollyRect.top, 0),
            totalScroll
        );

        const overallProgress = currentScroll / totalScroll;

        const stepsForTime = 4;
        const maxStepFraction = stepsForTime / steps.length;
        const timelineProgress = Math.min(
            1,
            overallProgress / maxStepFraction
        );

        currentTimelineProgress = timelineProgress;

        updateTimelineProgress(data, timelineProgress);

        const activeStep = getActiveStep();

        /* ======================
           RESET CONDITIONS
        ====================== */

        if (
            lastActiveStep !== null &&
            activeStep !== lastActiveStep
        ) {
            hardResetInteraction(timelineProgress);
        }

        if (accumulatedScroll >= SCROLL_RESET_THRESHOLD) {
            hardResetInteraction(timelineProgress);
        }

        lastActiveStep = activeStep;

        /* ======================
           GLOBAL ZOOM
        ====================== */

        if (activeStep >= 4 && !getZoomState()) {
            toggleYAxisZoom();
            setZoomState(true);
        }

        if (activeStep > 0 && activeStep <= 3 && getZoomState()) {
            toggleYAxisZoom();
            setZoomState(false);
        }

        /* ======================
           HIGHLIGHTS
        ====================== */

        if (activeStep === 4) {
            clickFocusActive = false;
            highlightCountries(LOSERS, data, timelineProgress);

        } else if (activeStep === 5) {
            clickFocusActive = false;
            highlightCountries(WINNERS, data, timelineProgress);

        } else {
            resetTimelineHighlight(data, timelineProgress);
        }

        if (kbCountryIndex !== null && kbYearIndex !== null) {
            applyKeyboardFocus(activeStep);
        }
    }

    /* ======================
       CLICK → KEYBOARD SYNC
    ====================== */

    document.addEventListener("timeline-line-clicked", (e) => {
        const { country, year } = e.detail || {};
        if (!country) return;

        const activeStep = getActiveStep();
        const list = getAllowedCountryList(activeStep);

        const idx = list.indexOf(country);
        if (idx === -1) return;

        kbCountryIndex = idx;

        if (typeof year === "number") {
            const yIdx = years.indexOf(year);
            if (yIdx !== -1) kbYearIndex = yIdx;
        } else if (kbYearIndex === null) {
            kbYearIndex = 0;
        }

        clickFocusActive = (activeStep !== 4 && activeStep !== 5);
        accumulatedScroll = 0;

        applyKeyboardFocus(activeStep);
    });

    /* ======================
       KEYBOARD NAVIGATION
    ====================== */

    function onKeyDown(e) {
        if (!isChapterFourInView()) return;

        const key = e.key;
        if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) return;

        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea") return;

        e.preventDefault();

        const activeStep = getActiveStep();
        const list = getAllowedCountryList(activeStep);

        ensureKeyboardInit(activeStep);

        if (key === "ArrowUp") {
            kbCountryIndex = (kbCountryIndex - 1 + list.length) % list.length;
        } else if (key === "ArrowDown") {
            kbCountryIndex = (kbCountryIndex + 1) % list.length;
        } else if (key === "ArrowLeft") {
            kbYearIndex = Math.max(0, kbYearIndex - 1);
        } else if (key === "ArrowRight") {
            kbYearIndex = Math.min(years.length - 1, kbYearIndex + 1);
        }

        accumulatedScroll = 0;
        applyKeyboardFocus(activeStep);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    onScroll();
}
