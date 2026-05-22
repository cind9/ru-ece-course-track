# Rutgers CE Track Course Planner

Interactive 4-year **Computer Engineering** course flowchart with:

- **Hover** — highlights the course and the courses it directly unlocks
- **Click** — add/remove courses from semester planner boxes (greyed on chart)
- **Credit totals** — per semester and across all planned courses (including residency credits for ECE courses)
- **Available next** — courses you can take based on completed/planned prerequisites and fall/spring offering

## Project location

```
~/Documents/projects/ru-ce-course-track
```

Full path: `/Users/mkim/Documents/projects/ru-ce-course-track`

## How to open and use the website

### 1. Open the project in Cursor (optional)

- **File → Open Folder…**
- Go to **Documents → projects → ru-ce-course-track**
- Click **Open**

### 2. Start the dev server

Open a terminal in Cursor (**Terminal → New Terminal**) or use macOS Terminal, then run:

```bash
cd ~/Documents/projects/ru-ce-course-track
npm run dev
```

You should see something like:

```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### 3. Open the site in your browser

- Hold **Cmd** and click the `http://localhost:5173/` link in the terminal, **or**
- Open Chrome/Safari/Firefox and paste: **http://localhost:5173/**

The page updates automatically when you edit code while `npm run dev` is running.

### 4. Stop the server

In the terminal where it’s running, press **Ctrl + C**.

## Using the planner

1. **Select a semester box** on the right (e.g. “Fall 2026”) — it gets a blue border.
2. **Click courses** on the flowchart to add them to that box. They turn grey on the chart.
3. Click again to remove a course from the active semester.
4. Check **box totals** and **All planned courses** for credits and residency credits.
5. Use **Courses you can take next** — pick Fall or Spring to filter by when courses are offered.

## Build for production (optional)

```bash
npm run build
npm run preview
```

Then open the URL shown (usually http://localhost:4173/).

## Tech stack

- React + TypeScript + Vite

## Credits note

ECE residency numbers match the official CE track chart. Non-ECE (peach) courses use typical Rutgers credit values as prototypes—verify on [catalogs.rutgers.edu](https://catalogs.rutgers.edu) if needed.
