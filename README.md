# Rutgers CE Track Course Planner

Interactive 4-year **Computer Engineering** course flowchart with:

- **Hover** — highlights the course and the courses it directly unlocks
- **Click** — add/remove courses from semester planner boxes (greyed on chart)
- **Credit totals** — per semester and across all planned courses (including residency credits for ECE courses)
- **Available next** — courses you can take based on completed/planned prerequisites and fall/spring offering

## Live site

**[Rutgers CE Track](https://rutgers-ce-track.vercel.app/)**

Hosted on [Vercel](https://vercel.com). The public URL uses the project name `rutgers-ce-track` (not the GitHub repo slug).

### One-time deploy (repo owner)

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New → Project** → import `cind9/ru-ce-course-track` (or your fork).
3. Leave defaults: **Framework Preset** Vite, **Build Command** `npm run build`, **Output Directory** `dist`, **Install Command** `npm install`.
4. Set **Project Name** to `rutgers-ce-track` (this becomes `https://rutgers-ce-track.vercel.app`).
5. Deploy. Future pushes to `main` redeploy automatically.

`vercel.json` in this repo sets the build output and SPA fallback; no env vars required.

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
