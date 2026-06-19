# Well-Being in Europe — Scrollytelling Project

> An interactive data narrative exploring patterns of subjective well-being across European countries through scroll-driven visualizations.

**Author:** Iosif-Ionut Cicio<br>
**Academic Context:** Bachelor's Thesis, Creative Computing, USTP – University of Applied Sciences St. Pölten<br>
**Supervisor:** FH-Prof. Dr. Hsiang-Yun Wu<br>
**View Live:** https://iosif-cicio.github.io/Well-Being-in-Europe-Scrollytelling/

---

## Project Overview

This interactive scrollytelling application investigates how hybrid, scroll-based narrative visualizations can make multidimensional well-being data intelligible to non-experts. The project covers 31 European countries (the EU-27, three EFTA members — Iceland, Norway, and Switzerland — and the United Kingdom; Liechtenstein is excluded due to gaps in the source data). It visualizes life evaluation alongside contextual indicators such as income and the factors that contribute to each country's score, drawn from the World Happiness Report 2025, the World Bank, and Our World in Data.

Rather than reducing well-being to simple rankings, the project emphasizes regional patterns, temporal trends, and the relationship between life satisfaction and socioeconomic factors. The experience unfolds through a scroll-driven narrative, where each visualization supports a specific analytical insight.

This prototype is one half of a controlled comparison. It was built alongside a content-equivalent **static baseline** (see [Companion Repository](#companion-repository)) so that a within-subjects user study could measure the effect of the interactive format itself, with data, narrative claims, and visual encodings held constant across both versions.

### Key Features

- **Choropleth Map**: Spatial distribution of life evaluation scores across the 31 European countries, with narrative-driven highlighting of regional groups
- **Scatterplot Analysis**: Relationship between GDP per capita (PPP) and reported well-being, with Voronoi-based hit detection so overlapping points stay individually selectable
- **Stacked Factor Bar Chart**: Decomposition of each country's life evaluation score into its contributing factors, revealed progressively as the narrative introduces each one
- **Time Series Visualization**: Long-term trends in life satisfaction from 2011 to 2024, with an observed-range rescale and keyboard navigation for the dense multi-line view
- **Scroll-driven Storytelling**: Synchronized narrative and visual transitions using Scrollama

### Design Philosophy

The application is built on a loosened **Martini-glass structure** (Segel & Heer, 2010), a hybrid pattern that combines author-driven narrative clarity with limited reader-driven exploration. Rather than reserving exploration for a separate phase at the end, the project embeds limited inspection throughout the guided sequence, letting the reader verify narrative claims or inspect details the narrative does not directly address. The design prioritizes:

- **Narrative coherence** over exhaustive data presentation
- **Guided interpretation** through deliberate interaction constraints
- **Truthful framing**, holding design decisions (color, scale, labeling) constant across both prototypes wherever the formats allow, following the visualization-rhetoric concerns raised by Hullman and Diakopoulos (2011)
- **Desktop-first experience** optimized for long-form reading

---

## Data Sources

All data is derived from publicly available international surveys and statistical databases.

### Primary Data

**Life Evaluation Scores**
Measured using the Cantril Ladder question (0–10 scale) from the Gallup World Poll, as published in the *World Happiness Report 2025*. Country values represent three-year survey averages (2022–2024) to reduce short-term volatility and improve cross-country comparability.

### Contextual Indicators

- **Income**: GDP per capita adjusted for purchasing power parity (PPP), from the World Bank's World Development Indicators, averaged over 2022–2024 to match the WHR window
- **Decomposition Components**: Income contribution, social support, healthy life expectancy, freedom to make life choices, generosity, perceptions of corruption, and a Dystopia-plus-residual term, following the World Happiness Report framework. In the reader-facing narrative, "perceptions of corruption" is presented as "trust" for clarity, a framing choice documented for transparency.
- **Historical Trends**: Life evaluation data from 2011 to 2024, compiled by the Wellbeing Research Centre and published via *Our World in Data*. For the selected country set, 2013 is missing from the exported series and is left visible rather than filled with estimates.

### Data Processing

Data from CSV sources is processed and embedded into JavaScript modules for client-side visualization. The choropleth map reads a WHR CSV file (`whr25_eu27_efta_uk_lifeladder_2024_3yravg.csv`), while the other views use dedicated JavaScript data modules (`happinessEurope2025.js`, `incomeEuropePPP.js`, `lifeEuropeTime.js`).

All data processing and visualization occurs client-side. No personal, individual-level, or sensitive data is collected, stored, or transmitted.

---

## Technical Implementation

### Tech Stack

- **Build Tool**: [Vite](https://vitejs.dev/) — fast, modern frontend tooling
- **Visualization**: [D3.js](https://d3js.org/) (v7) — data-driven document manipulation
- **Scroll Interactions**: [Scrollama](https://github.com/russellsamora/scrollama) — Intersection Observer-based scrollytelling
- **Deployment**: GitHub Pages (static hosting)

### Architecture Highlights

- **Modular section system**: Each narrative section is self-contained with dedicated JS/CSS files
- **Incremental chart updates**: When a scroll step enters the viewport, Scrollama triggers an update function that uses D3's data join to add, change, or remove only the elements that change, rather than rebuilding the chart, which preserves the visual flow
- **Voronoi-based hit detection** on the scatterplot, so overlapping points remain individually selectable
- **Keyboard navigation and click-to-focus** on the dense time-series view, where hover targeting alone can be difficult

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/Iosif-Cicio/Well-Being-in-Europe-Scrollytelling.git
cd Well-Being-in-Europe-Scrollytelling

# Install dependencies
npm install
```

### Development

```bash
# Start development server with hot module replacement
npm run dev

# Application will be available at http://localhost:5173
```

### Production Build

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

---

## Browser Support

The application is designed for **desktop viewing** and optimized for modern desktop browsers:

- Chrome/Edge (v90+)
- Firefox (v88+)
- Safari (v14+)

**Optimized viewport width:** roughly 1200–1600px
**Mobile support:** Not available. The experience is intentionally designed as a long-form, desktop-oriented narrative that depends on pointer-based interactions such as hover tooltips. Supporting mobile would require a different interaction model, introducing variation between the two prototypes and diluting the content equivalence the thesis comparison depends on.

---

## Academic Context

This project was developed as part of a Bachelor's thesis in Creative Computing at USTP – University of Applied Sciences St. Pölten.

**Thesis Title:** *Narrative Visualization for Data Journalism: Exploring Well-Being Indicators Across Europe*

### Research Questions

The thesis compares this interactive scrollytelling prototype against a content-equivalent static baseline along three dimensions:

1. **Comprehension**: Does the hybrid interactive version yield higher factual comprehension than the static version?
2. **Engagement**: Does the interactive version increase self-reported engagement relative to the static version?
3. **Perceived usability**: Does the interactive version improve perceived usability compared with the static version?

### Method

A within-subjects user study with 17 participants used a Latin square design to counterbalance prototype order and comprehension quiz set. Each participant experienced both versions. Comprehension was measured with a custom five-item quiz, engagement with Likert items, and perceived usability with the System Usability Scale (Brooke, 1996). Differences were analyzed with Wilcoxon signed-rank tests, reporting effect sizes alongside significance.

### Summary of Findings

- **Engagement** was significantly higher for the interactive format, with a large effect size. This was the strongest result in the study.
- **Comprehension** showed essentially no difference between formats, consistent with prior work that found no comprehension benefit from interactivity alone.
- **Perceived usability** favored the interactive format slightly, but the difference was not statistically significant; both versions were rated well.
- **Preference**: 15 of 17 participants preferred the interactive version in a forced-choice question.

The broader takeaway, in line with newsroom practice, is to match format to purpose: scrollytelling earns its place through engagement and reader preference rather than through factual retention.

### Research Gaps Addressed

1. **Subject matter**: prior comparative studies focus on domains such as science news, health communication, and economic data, not multidimensional social indicators like well-being shown across countries.
2. **Content equivalence**: studies often compare versions that differ on several design factors at once, making it hard to attribute results to format alone. This project derives the static baseline directly from the interactive one to hold content constant.
3. **Measurement**: there is no standard instrument set for evaluating narrative visualization formats.

### Companion Repository

The static baseline used as the comparison condition is maintained as a separate repository:
https://github.com/Iosif-Cicio/Well-Being-in-Europe-Scrollytelling-Static

---

## Key References

- **Segel, E., & Heer, J. (2010).** Narrative visualization: Telling stories with data. *IEEE Transactions on Visualization and Computer Graphics, 16*(6), 1139–1148.
  *The foundational design-space framework for author-driven, reader-driven, and hybrid (Martini-glass) storytelling structures. The conceptual basis for this project's narrative structure.*

- **Hullman, J., & Diakopoulos, N. (2011).** Visualization rhetoric: Framing effects in narrative visualization. *IEEE Transactions on Visualization and Computer Graphics, 17*(12), 2231–2240.
  *Argues that design choices in narrative visualization are never neutral. Motivates holding framing decisions constant across the two prototypes for a fair comparison.*

- **Tjärnhage, A., Söderström, U., Norberg, O., Andersson, M., & Mejtoft, T. (2023).** The impact of scrollytelling on the reading experience of long-form journalism. *ECCE '23.*
  *The study most similar to this thesis: a within-subjects design with a Wilcoxon test that found significantly greater engagement for scrollytelling, while effects on comprehension and usability were less clear.*

- **Greussing, E., Kessler, S. H., & Boomgaarden, H. G. (2020).** Learning from science news via interactive and animated data visualizations. *Science Communication, 42*(6), 803–828.
  *Found a recall benefit, but only when interactivity and animation were combined, not for interactivity alone. Informs the cautious prediction for comprehension.*

- **McKenna, S., Henry Riche, N., Lee, B., Boy, J., & Meyer, M. (2017).** Visual narrative flow: Exploring factors shaping data visualization story reading experiences. *Computer Graphics Forum, 36*(3), 377–387.
  *Identified "flow factors" that shape engagement and noted that comparing versions differing on several factors at once confounds the result, a limitation this project is designed to avoid.*

- **Boy, J., Detienne, F., & Fekete, J.-D. (2015).** Storytelling in information visualizations: Does it engage users to explore data? *CHI '15*, 1449–1458.
  *A counterpoint that found no engagement or comprehension benefit from interactivity, part of the evidence that interactivity is not a guaranteed gain.*

- **Locoro, A., Cabitza, F., Actis-Grosso, R., & Batini, C. (2017).** Static and interactive infographics in daily tasks: A value-in-use perspective. *Computers in Human Behavior, 71*, 240–257.
  *Found interactive infographics more engaging but also more complex, the engagement-versus-complexity tension this project keeps in view.*

- **Weber, W., Engebretsen, M., & Kennedy, H. (2018).** Data stories: Rethinking journalistic storytelling in the context of data journalism. *Studies in Communication Sciences, 18*(1), 191–206.
  *Connects narrative visualization research to data journalism practice, situating the interactive-versus-static comparison in a newsroom context.*

- **Brooke, J. (1996).** SUS: A "quick and dirty" usability scale. In *Usability Evaluation in Industry* (pp. 189–194). Taylor & Francis.
  *The System Usability Scale used to measure perceived usability in the study.*
