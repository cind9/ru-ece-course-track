# Rutgers CE Track Course Planner

Interactive 4-year **Computer Engineering** course flowchart with:

- **Hover** — highlights the course and the courses it directly unlocks
- **Click** — add/remove courses from semester planner boxes (greyed on chart)
- **Credit totals** — per semester and across all planned courses (including residency credits for ECE courses)
- **Available next** — courses you can take based on completed/planned prerequisites and fall/spring offering

## Live site

**https://cind9.github.io/ru-ce-course-track/**

## Project location

```
~/Documents/projects/ru-ce-course-track
```

## How to run locally

```bash
cd ~/Documents/projects/ru-ce-course-track
npm install
npm run dev
```

Open **http://localhost:5173/** in your browser.

## Using the planner

1. **Select a semester box** on the right (e.g. “Fall 2026”) — it gets a blue border.
2. **Click courses** on the flowchart to add them to that box. They turn grey on the chart.
3. Click again to remove a course from the active semester.
4. Check **box totals** and **All planned courses** for credits and residency credits.
5. Use **Courses you can take next** — pick Fall or Spring to filter by when courses are offered.

## Tech stack

- React + TypeScript + Vite

## Credits note

ECE residency numbers match the official CE track chart. Non-ECE (peach) courses use typical Rutgers credit values as prototypes—verify on [catalogs.rutgers.edu](https://catalogs.rutgers.edu) if needed.
