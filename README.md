# JeffreyEpsteins.org

Interactive public-record research interface focused on timeline analysis, source tracking, entity mapping, and brief generation.

## Disclaimer
- Independent information-design project.
- Not an official court, government, or law-enforcement website.
- Use primary records and credible reporting for verification.

## What this site can do
- Filter and search case timeline events by phase, year range, and keywords.
- Explore a phase-based flow map with source-cluster drilldowns.
- Pin events and export a working set.
- Run a question engine that ranks matching events and sources.
- Inspect an interactive entity relationship graph.
- Track source reading/verification status locally.
- Generate, copy, and download a structured working brief.
- Export full local research session state as JSON.

## Privacy
- This project is static and client-side only.
- Notes, pins, and source flags are saved in browser `localStorage`.
- No backend persistence is used.

## Stack
- `index.html` - application structure
- `styles.css` - visual system and responsive layout
- `script.js` - timeline engine, query logic, graph, source tracker, brief builder
- `CNAME` - custom domain configuration

## Local preview
Open `index.html` directly in your browser.

## GitHub Pages deployment
1. Push to `main`.
2. Open repository `Settings -> Pages`.
3. Set source to `Deploy from a branch`.
4. Select branch `main` and folder `/ (root)`.
5. Save and wait for deployment.

## Contribution guidelines
- Keep wording factual and source-oriented.
- Prefer date-specific phrasing over vague relative wording.
- When editing timeline items, maintain neutral language and verifiable references.
