import scrollama from "scrollama";
import {
    initChoropleth,
    updateChoropleth,
    setLegendVisible
} from "../charts/choropleth.js";

export async function initChapterOne() {
    // Make sure map + legend exist before scrollama starts
    await initChoropleth("#map-choropleth");

    const steps = document.querySelectorAll("#chapter-one-content .map-step");
    const lastIndex = steps.length - 1;

    /* =========================
       SCROLLAMA (MAP HIGHLIGHTS)
       ========================= */

    const scroller = scrollama();

    scroller
        .setup({
            step: "#chapter-one-content .map-step",
            offset: 0.6
        })
        .onStepEnter(({ element, index }) => {
            element.classList.add("is-active");
            updateChoropleth(index);
        })
        .onStepExit(({ element, index, direction }) => {
            element.classList.remove("is-active");

            // Leaving final step downward → reset to default map
            if (direction === "down" && index === lastIndex) {
                updateChoropleth(0);
            }

            // Leaving Step 0 upward → reset as well
            if (direction === "up" && index === 0) {
                updateChoropleth(0);
            }
        });

    window.addEventListener("resize", scroller.resize);

    /* =========================
       LEGEND VISIBILITY (CORRECT)
       ========================= */

    const mapEl = document.querySelector("#map-choropleth");

    if (mapEl) {
        const legendObserver = new IntersectionObserver(
            ([entry]) => {
                // When map fills the viewport (sticky phase)
                // → legend visible
                setLegendVisible(entry.isIntersecting);
            },
            {
                root: null,
                // Map is considered "active" when it occupies the center area
                rootMargin: "-35% 0px -35% 0px",
                threshold: 0
            }
        );

        legendObserver.observe(mapEl);
    }
}
