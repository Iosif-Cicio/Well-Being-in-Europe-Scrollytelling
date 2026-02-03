import { initChapterOne } from "./chapter-one/chapterOne.js";
import { initChapterTwo } from "./chapter-two/chapterTwo.js";
import { initChapterThree } from "./chapter-three/chapterThree.js";
import { initChapterFour } from "./chapter-four/chapterFour.js";

window.appState = {
    timelineZoomed: false
};

function initIntroImages() {
    const intro = document.querySelector("#intro-panel");
    const sticky = document.querySelector(".intro-media-sticky");
    const images = document.querySelectorAll(".intro-img");

    if (!intro || !sticky || images.length < 2) return;

    const img1 = images[0];
    const img2 = images[1];

    img1.classList.add("is-active");
    img2.classList.remove("is-active");

    const HANDOFF_POINT = 0.65;
    let maxShift = 0;

    function computeMaxShift() {
        const stickyRect = sticky.getBoundingClientRect();
        const imgRect = img2.getBoundingClientRect();
        maxShift = Math.max(0, imgRect.height - stickyRect.height);
    }

    function onScroll() {
        const introRect = intro.getBoundingClientRect();
        const stickyRect = sticky.getBoundingClientRect();
        const stickyTop = parseFloat(getComputedStyle(sticky).top) || 0;

        const progress =
            (stickyTop - introRect.top) /
            (introRect.height - stickyRect.height - stickyTop);

        const clamped = Math.max(0, Math.min(1, progress));

        const motionProgress = Math.min(clamped, HANDOFF_POINT);
        const translateY = maxShift * motionProgress;
        img2.style.transform = `translateY(${translateY}px)`;

        if (clamped >= HANDOFF_POINT) {
            img1.classList.remove("is-active");
            img2.classList.add("is-active");
        } else {
            img2.classList.remove("is-active");
            img1.classList.add("is-active");
        }
    }

    computeMaxShift();
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => {
        computeMaxShift();
        onScroll();
    });
}

/**
 * ============================================================
 * CHAPTER FIVE — CONCLUSION IMAGE HANDOFF
 * Same logic as hero, scoped + calmer timing
 * ============================================================
 */
function initChapterFiveImages() {
    const section = document.querySelector("#chapter-five-content");
    const sticky = section?.querySelector(".chapter-five-media-sticky");
    const images = section?.querySelectorAll(".chapter-five-img");

    if (!section || !sticky || !images || images.length < 2) return;

    const img1 = images[0];
    const img2 = images[1];

    img1.classList.add("is-active");
    img2.classList.remove("is-active");

    const HANDOFF_POINT = 0.5; // slightly later than intro
    let maxShift = 0;

    function computeMaxShift() {
        const stickyRect = sticky.getBoundingClientRect();
        const imgRect = img2.getBoundingClientRect();
        maxShift = Math.max(0, imgRect.height - stickyRect.height);
    }

    function onScroll() {
        const sectionRect = section.getBoundingClientRect();
        const stickyRect = sticky.getBoundingClientRect();
        const stickyTop = parseFloat(getComputedStyle(sticky).top) || 0;

        const progress =
            (stickyTop - sectionRect.top) /
            (sectionRect.height - stickyRect.height - stickyTop);

        const clamped = Math.max(0, Math.min(1, progress));

        const motionProgress = Math.min(clamped, HANDOFF_POINT);
        const translateY = maxShift * motionProgress;
        img2.style.transform = `translateY(${translateY}px)`;

        if (clamped >= HANDOFF_POINT) {
            img1.classList.remove("is-active");
            img2.classList.add("is-active");
        } else {
            img2.classList.remove("is-active");
            img1.classList.add("is-active");
        }
    }

    computeMaxShift();
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => {
        computeMaxShift();
        onScroll();
    });
}

/**
 * ============================================================
 * ENTRY POINT
 * ============================================================
 */
document.addEventListener("DOMContentLoaded", () => {
    initIntroImages();
    initChapterOne();
    initChapterTwo();
    initChapterThree();
    initChapterFour();
    initChapterFiveImages();
});
