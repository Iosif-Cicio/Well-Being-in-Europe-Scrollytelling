# Well-Being in Europe — Scrollytelling Project

> An interactive data narrative exploring patterns of subjective well-being across European countries through scroll-driven visualizations.

**Author:** Iosif-Ionut Cicio  
**Academic Context:** Bachelor's Thesis, Creative Computing, FH St. Pölten  
**Supervisor:** Professor Wu  
**View Live:** https://iosif-cicio.github.io/Well-Being-in-Europe-Scrollytelling/

---

## Project Overview

This interactive scrollytelling application investigates how hybrid, scroll-based narrative visualizations can make multidimensional well-being data intelligible to non-experts. The project focuses on approximately 30-35 European countries (EU-27, EFTA, and the UK), visualizing indicators such as life satisfaction, income security, and social trust drawn from Eurostat, the World Happiness Report, and Our World in Data.

Rather than reducing well-being to simple rankings, the project emphasizes regional patterns, temporal trends, and the relationship between life satisfaction and socioeconomic factors. The experience unfolds through a carefully choreographed scroll-driven narrative, where each visualization supports a specific analytical insight.

### Key Features

- **Choropleth Map**: Spatial distribution of life evaluation scores across European countries
- **Scatterplot Analysis**: Relationship between GDP per capita (PPP) and reported well-being
- **Comparative Bar Charts**: Country-level comparisons and regional contrasts
- **Time Series Visualization**: Long-term trends in life satisfaction (2011–2024)
- **Scroll-driven Storytelling**: Synchronized narrative and visual transitions using Scrollama

### Design Philosophy

The application is built on the **Martini-glass structure** (Segel & Heer, 2010) - a hybrid linear-nonlinear approach that combines author-driven narrative clarity with reader-driven exploration. This design prioritizes:

- **Narrative coherence** over exhaustive data presentation
- **Guided interpretation** through deliberate interaction constraints
- **Desktop-first experience** optimized for long-form reading and designed exclusively for desktop viewing
- **Analytical depth** focusing on patterns, outliers, and regional variation

---

## Data Sources

All data is derived from publicly available international surveys and statistical databases:

### Primary Data

**Life Evaluation Scores**  
Measured using the Cantril Ladder question (0–10 scale) from the Gallup World Poll, as published in the *World Happiness Report 2025*. Country values represent population-weighted three-year averages (2022–2024) to reduce short-term volatility and improve cross-country comparability.

### Contextual Indicators

- **Income**: GDP per capita adjusted for purchasing power parity (PPP), World Bank
- **Decomposition Components**: Income contribution, social support, healthy life expectancy, freedom to make life choices, generosity, perceptions of corruption, and residual (dystopia) factors — following the World Happiness Report framework
- **Historical Trends**: Long-term life evaluation data (2011–2024) compiled by the Wellbeing Research Centre and published via *Our World in Data*

### Data Processing

Data from CSV sources is processed and embedded into JavaScript modules for client-side visualization. The primary dataset used is `whr25_eu27_efta_uk_lifeladder_2024_3yravg.csv`, with additional contextual data compiled from World Happiness Report and Our World in Data sources into dedicated JavaScript modules (`happinessEurope2025.js`, `incomeEuropePPP.js`, `lifeEuropeTime.js`).

All data processing and visualization occurs client-side. No personal, individual-level, or sensitive data is collected, stored, or transmitted.

---

## Technical Implementation

### Tech Stack

- **Build Tool**: [Vite](https://vitejs.dev/) — Fast, modern frontend tooling
- **Visualization**: [D3.js](https://d3js.org/) — Data-driven document manipulation
- **Scroll Interactions**: [Scrollama](https://github.com/russellsamora/scrollama) — Intersection Observer-based scrollytelling
- **Deployment**: GitHub Pages (static hosting)

### Architecture Highlights

- **Modular chapter system**: Each narrative section is self-contained with dedicated JS/CSS files
- **Reusable visualization components**: D3-based charts designed for scroll-triggered updates
- **Performance-optimized**: Static asset compilation with code splitting
- **Accessibility-conscious**: Semantic HTML, keyboard navigation support, ARIA labels

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/well-being-europe-scrollytelling.git
cd well-being-europe-scrollytelling

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

### Deployment

The project is configured for GitHub Pages deployment:

```bash
# Build and deploy to gh-pages branch
npm run deploy
```

---

## Browser Support

The application is designed exclusively for **desktop viewing** and optimized for modern desktop browsers:

- Chrome/Edge (v90+)
- Firefox (v88+)
- Safari (v14+)

**Minimum viewport width:** 1024px  
**Mobile support:** Not available — the experience is intentionally designed as a long-form, desktop-oriented narrative.

---

## Academic Context

This project was developed as part of a Bachelor's thesis in Creative Computing at FH St. Pölten.

**Thesis Title:** *Narrative Visualization for Data Journalism: Exploring Well-Being Indicators Across Europe*

### Research Focus

The thesis investigates how hybrid, scroll-based narrative visualizations (scrollytelling) can make multidimensional well-being data intelligible to non-experts. It addresses two key gaps:

1. **Theoretical:** The effects of scroll-based and hybrid narrative structures on comprehension remain underexplored in visualization research
2. **Practical:** Newsrooms lack proven design patterns for turning pan-regional indicators into intuitive, emotionally resonant narratives

### Methodology

The project employs a **hybrid linear-nonlinear (Martini-glass) structure** as defined by Segel & Heer (2010), where author-driven narrative guides users through a structured story before allowing limited exploration. This approach balances:

- Communicative clarity of author-driven narratives
- Engagement benefits of reader-driven interactivity
- Guided interpretation for non-expert audiences

### Academic Foundations

The work builds on coursework in:
- **Data Visualization (VIS)** - theoretical foundations and D3.js implementation
- **User Experience and Usability** - user-centered evaluation methods
- **Responsive Design and Prototyping** - front-end development and interface design
- **Client-Side Coding** - web application architecture

An offline build is included with the thesis submission to ensure long-term reproducibility independent of external dependencies or hosting changes.

### Key References

- **Segel, E., & Heer, J. (2010).** Narrative visualization: Telling stories with data. *IEEE Transactions on Visualization and Computer Graphics, 16*(6), 1139-1148.  
  *Foundational framework for author-driven, reader-driven, and hybrid (Martini-glass) storytelling structures - the conceptual basis for this project.*

- **Hullman, J., & Diakopoulos, N. (2011).** Visualization rhetoric: Framing effects in narrative visualization. *IEEE Transactions on Visualization and Computer Graphics, 17*(12), 2231-2240.  
  *Examines how visual framing and rhetorical choices influence interpretation - informs design decisions for neutrality and transparency.*

- **Lee, B., Riche, N. H., Isenberg, P., & Carpendale, S. (2015).** More than telling a story: Transforming data into visually shared stories. *IEEE Computer Graphics and Applications, 35*(5), 84-89.  
  *Explores how data stories engage shared interpretation - informs the engagement and clarity dimensions of this study.*

- **Weber, W., Engebretsen, M., & Kennedy, H. (2018).** Data stories: Rethinking journalistic storytelling in the context of data journalism. *Studies in Communication Sciences, 18*(1), 191-206.  
  *Connects narrative visualization research to data journalism practice - demonstrates relevance of interactive versus static approaches.*

