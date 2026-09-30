# 🍽️ Cal Poly SLO Dining Forecaster

A full-stack web app that predicts how busy Cal Poly San Luis Obispo's dining
locations are, so you can time your meals to skip the line. Browse an
interactive campus map, see hourly/weekly busyness forecasts per location,
and help improve the predictions by reporting what you see in line right now.

**🔗 Live demo:** https://cal-poly-dining-forecaster.vercel.app
*(the free-tier API may take 30–60s to wake up after inactivity — give it a moment on first load)*

## Features

- **Interactive campus map** — all 11 real Cal Poly dining locations plotted
  on a live map, color-coded by current busyness, panning locked to campus.
- **Hourly & weekly forecasts** — charts showing predicted busyness by hour
  for any day of the week, plus a "best times to go" / "times to avoid"
  breakdown per location.
- **Live open/closed status & wait estimates** — pulled from each location's
  real operating hours (including locations open past midnight).
- **Crowdsourced reporting** — anyone can report how busy a location is right
  now; reports are rate-limited per location/IP and blended into future
  forecasts.
- **Resilient, fast UI** — code-split map/chart bundles with loading
  skeletons, a splash screen on first load, and an error boundary so a
  single component crash doesn't take down the whole app.

## How the forecasting works (the honest version)

There's no real historical foot-traffic dataset behind this — Cal Poly
doesn't publish one. Instead:

- **Location data is real**: names, coordinates, and operating hours for all
  11 locations were manually verified against
  [dineoncampus.com](https://dineoncampus.com/calpoly/hours-of-operation),
  not geocoded or guessed.
- **Busyness data is synthetic** (`server/scripts/seed.js`): eight weeks of
  hourly busyness values are generated from a hand-modeled curve of typical
  college dining patterns (breakfast lull, lunch peak, afternoon quiet,
  dinner rush), then averaged per location/day/hour into a baseline forecast.
- **Crowdsourced reports move the needle**: when someone submits a live
  report, it's blended into that hour's forecast (70% historical baseline /
  30% recent crowd reports) and, if there are 2+ reports in the last 30
  minutes, the "current" busyness for that location is driven almost
  entirely by those live reports instead of the baseline.

In short: think of it as a realistic simulation with a live-correction
mechanism layered on top, not a model trained on real sensor/point-of-sale
data. That's a natural next step — see below.

## Tech stack

**Frontend** — React 19 + TypeScript + Vite, React Leaflet (map), Recharts
(charts), Framer Motion (animation), Lucide (icons).

**Backend** — Express 5 + better-sqlite3 (file-based SQLite, WAL mode), a
small in-memory rate limiter for crowd reports.

## Project structure

```
src/
  components/
    charts/     hourly/weekly forecast charts, best-time card
    layout/     header, sidebar, insights bar
    location/   busyness gauge, location card/detail, wait estimate
    map/        campus map + legend
    report/     crowd-report modal + floating button
    ui/         shared primitives (toast, skeleton, badge, error boundary...)
  hooks/        data-fetching hooks (locations, location detail)
  lib/          API client
  types/        shared TypeScript types + level/color/label helpers
server/
  index.js            Express routes
  db.js               SQLite connection + schema
  services/forecast.js  forecast/weekly-trend/best-time/current-level logic
  scripts/seed.js     generates locations, hours, and 8 weeks of synthetic data
```

## Getting started

Requires Node.js. The frontend and backend have **separate `node_modules`**,
so install both:

```bash
npm install            # frontend deps (root)
cd server && npm install && cd ..   # backend deps

npm run seed            # generate the SQLite database with sample data
npm run dev              # runs the Vite dev server + API concurrently
```

Then open the URL Vite prints (typically http://localhost:5173). The API
runs on http://localhost:3001.

Other scripts: `npm run build` (production build), `npm run lint` (oxlint),
`npm run preview` (preview a production build).

### Deploying

Locally, the frontend talks to the API through Vite's dev proxy (relative
`/api` calls). In production the frontend and backend are typically deployed
to two different hosts, so set `VITE_API_URL` (see `.env.example`) to the
deployed API's full URL — e.g. `https://your-api.onrender.com/api` — before
running `npm run build`.

## API

| Route | Description |
|---|---|
| `GET /api/locations` | All locations with metadata |
| `GET /api/locations/:id` | One location + its operating hours |
| `GET /api/locations/:id/forecast?day=0-6` | Hourly forecast for a day |
| `GET /api/locations/:id/weekly` | Weekly busyness trend |
| `GET /api/locations/:id/best-time?day=0-6` | Best/worst hours to visit |
| `GET /api/overview` | Current busyness + open status for all locations |
| `GET /api/overview/heatmap` | Lightweight lat/lng/level data for the map |
| `POST /api/report` | Submit a crowd report `{ location_id, level }` |

## Roadmap

See the "Next steps" list from development notes for the prioritized plan —
in short: real historical data or a live occupancy signal, automated tests,
a deployed live demo, and persistence beyond a local SQLite file.

## Author

Bruce Matthews — [brucematthews13.github.io](https://brucematthews13.github.io/index.html)
