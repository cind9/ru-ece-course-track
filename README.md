# Rutgers CE Degree Planner

Interactive 4-year **Computer Engineering** course flowchart with:

- **Hover** — highlights the course and the courses it directly unlocks
- **Click** — add/remove courses from semester planner boxes (greyed on chart)
- **Credit totals** — per semester and across all planned courses (including residency credits for ECE courses)
- **Available next** — courses you can take based on completed/planned prerequisites and fall/spring offering

## Live site

**Recommended (cleaner URL):** [Rutgers CE Degree Planner](https://rutgers-ce-degree-planner.vercel.app)

**GitHub Pages (after setup below):** [Rutgers CE Degree Planner](https://cind9.github.io/rutgers-ce-degree-planner/)

Link previews (iMessage, Slack, Discord, etc.) use the app name **Rutgers CE Degree Planner** via Open Graph meta tags—not a generic “github.io” title.

## Deploy / share

### Option A — Vercel (recommended, free, no custom domain)

1. Sign in at [vercel.com](https://vercel.com) and **Import** this GitHub repo.
2. Use defaults: **Build** `npm run build`, **Output** `dist` (also set in `vercel.json`).
3. Set the project name to **`rutgers-ce-degree-planner`** so the URL is  
   `https://rutgers-ce-degree-planner.vercel.app`
4. Deploy. Share that URL—it reads as the app name, not a raw `github.io` path.

### Option B — GitHub Pages

1. **Rename the repo** on GitHub to `rutgers-ce-degree-planner`  
   (Settings → General → Repository name). Then update your local remote:
   ```bash
   git remote set-url origin https://github.com/cind9/rutgers-ce-degree-planner.git
   ```
2. **Enable Pages:** repo **Settings → Pages → Build and deployment → Source:** `GitHub Actions`.
3. Push to `main`. The workflow `.github/workflows/deploy-pages.yml` runs `npm run build:pages` (base path `/rutgers-ce-degree-planner/`).
4. Live URL: `https://cind9.github.io/rutgers-ce-degree-planner/`

If Pages shows “Site not found”, Pages is not enabled or the workflow has not finished—check **Actions** and **Settings → Pages**.

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
- Deploy: Vercel (`npm run build`) or GitHub Pages (`npm run build:pages`)

## Credits note

ECE residency numbers match the official CE track chart. Non-ECE (peach) courses use typical Rutgers credit values as prototypes—verify on [catalogs.rutgers.edu](https://catalogs.rutgers.edu) if needed.
