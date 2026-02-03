# Well-Being in Europe — Scrollytelling Project

**Author:** Iosif Cicio  
**Academic context:** Bachelor’s Thesis, Creative Computing, FH St. Pölten

This repository contains the source code for an interactive scrollytelling project developed as part of a bachelor’s thesis.  
The project explores patterns of subjective well-being across European countries using survey-based indicators and narrative data visualization.

The application is designed primarily for desktop viewing and focuses on long-form, scroll-driven exploration rather than mobile interaction.

---

## Project Overview

This project is an interactive scrollytelling application that explores patterns of subjective well-being across European countries.  
It focuses on how reported life evaluation varies spatially and over time, and how these differences relate to broader social and economic conditions.

The narrative is supported by a set of interactive visualizations, including a choropleth map of Europe, a scatterplot, comparative bar charts, and a time-based line chart. Each visualization is embedded within a scroll-driven structure and is used to support a specific analytical point rather than to present data exhaustively.

Rather than treating well-being as a single ranking or aggregate indicator, the project emphasizes regional patterns, contrasts, and outliers. Interaction is deliberately constrained to preserve narrative clarity and guide interpretation.

The application is designed as a long-form, desktop-oriented experience. 

---

## Data Sources

The project is based on publicly available international survey and statistical data.

Reported life evaluation is measured using the Cantril Ladder question (0–10) from the Gallup World Poll, as published in the *World Happiness Report 2025*. Country-level values are calculated as population-weighted three-year averages (2022–2024) to reduce short-term volatility and improve comparability.

Additional contextual indicators are used to support specific visualizations:
- Income is measured as GDP per capita adjusted for purchasing power parity (PPP), based on World Bank data.
- Decomposition components (income, social support, healthy life expectancy, freedom, trust, generosity, and residual factors) follow the explanatory framework used in the World Happiness Report.
- Long-term trends in life evaluation are drawn from data compiled by the Wellbeing Research Centre and published by *Our World in Data*, covering the period from 2011 to 2024.

All data is processed and visualized client-side.  
No personal, individual-level, or sensitive data is collected or stored.

---

## Technical Setup

The project is implemented as a static web application using:

- **Vite** as the build tool
- **D3.js** for data visualization
- **Scrollama** for scroll-driven interactions

The application is compiled into static assets and deployed via GitHub Pages.  
An offline build of the project is included with the thesis submission to ensure long-term reproducibility.

---

## Development

To run the project locally:

```bash
npm install
npm run dev
