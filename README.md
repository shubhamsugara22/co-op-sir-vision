# SIR Transparency Suite (prototype)

A static web prototype split into a landing hub and two portals. It uses made-up people and data and is not connected to any ECI system.

## What is inside
- `index.html`: landing hub with two cards linking to the portals below. Open this one first.
- `info-portal.html`: **wrapper portal** — official ECI links (Search in SIR, roll downloads, voter portal), the rulebook as a searchable FAQ, and a browser-side OCR search for scanned roll PDFs.
- `improve-portal.html`: **improvement portal** — demonstrates specific process gaps and a working fix for each: BLO doorstep live-check with running stats, two-officer deletion check, automation workflow, activity log.
- `assets/styles.css`: shared design system used by all three pages.
- `artifact/sir-prototype.html`: a frozen, single-file version of the earlier combined prototype, kept for Claude-artifact compatibility. Not kept in sync going forward.
- `docs/sources.md`: official documents and articles the rules come from.
- `docs/architecture.md`: how the pieces fit together.
- `docs/notifications.md`: how SMS/WhatsApp and BLO push notifications would be integrated later (not built).
- `.github/workflows/deploy-pages.yml`: auto-deploys this folder to GitHub Pages on every push to `main`.
- `backend/`: a small Node/WebSocket backend that simulates a real election database integration with realtime updates. Optional; neither portal needs it to run. See `backend/DEMO.md` for a stakeholder demo script.

## Portal 1 — Info and search (`info-portal.html`)
- **Official links**: cards linking straight to ECI's own "Search Your Name in Last SIR", roll downloads, the voter portal and the Delhi CEO FAQ.
- **FAQ / rules**: the SIR rulebook with a live search box, quick-filter chips (Documents, Appeal, Camps, Schedule) and expand/collapse all.
- **Search in SIR (OCR)**: read a scanned (image-only) SIR roll PDF or photo in the browser with OCR, then search it by EPIC No. or elector details, styled after ECI's own search form. Needs internet once, to load the OCR library; the file itself is never uploaded.

## Portal 2 — Improvement prototype (`improve-portal.html`)
- **Overview**: plain-language status guide plus a deficiency &rarr; fix table explaining what each tab demonstrates.
- **For electors**: status tracker and notice decoder.
- **For BLOs**: doorstep live check, plus "This BLO's work so far" statistics (checks done, forms digitised, notices with hearings offered, pending).
- **Officers and public view**: two-person deletion check (notice + hearing required before an ERO can even propose one, then a different officer approves) and the aggregate public dashboard.
- **Workflow**: the automated pipeline, marking each step as automated or needing a person, plus how the optional backend and hosting fit in.
- **Activity log**: append-only record of every action.

## Run locally
Option 1: double-click `index.html`.

Option 2 (recommended, behaves like hosting):
```
cd sir-prototype
python3 -m http.server 8080
```
Then open http://localhost:8080

No build step, no install needed. Everything works fully offline except the OCR search, which loads its library from a CDN the first time it is used.

## Try this
1. Open `index.html`, then go into each portal from the cards.
2. Info portal: search the FAQ for "appeal", then try the OCR tool on a scanned PDF.
3. Improvement portal, For BLOs: pick Demo Elector A, check live status, ask the elector to fill in, then fill the fields on the simulated phone. Watch the BLO stats update.
4. Improvement portal, Officers and public view: propose a deletion with and without ticking the notice box, then approve it.
5. Improvement portal, Activity log: see every action recorded.

## Backend (optional, simulates a real integration)
```
cd backend
npm install
npm start
```
Then open http://localhost:4000 to see a live monitor page: a dashboard and
event log updating over a WebSocket, the way a real election database feed
would push updates. See `backend/README.md` for the API and how to replace
the in-memory store with a real database connector, and `backend/DEMO.md`
for a script to demo it to stakeholders.

## Host it later
It is plain static files, so any of these work:
- GitHub Pages: push the folder to `main`; `.github/workflows/deploy-pages.yml` builds and deploys it automatically. Enable Pages once (Settings > Pages > Source: GitHub Actions).
- Google Cloud Storage: `gsutil mb gs://YOUR-BUCKET`, `gsutil cp index.html gs://YOUR-BUCKET/`, then `gsutil web set -m index.html gs://YOUR-BUCKET` and make the object public.
- Firebase Hosting, Netlify or Cloudflare Pages: point them at this folder.
- The `backend/` folder is a separate Node app; host it on any Node-capable platform (Render, Fly.io, a small VM) if you want the realtime demo running publicly too.

## Planned, not built yet
- SMS or WhatsApp updates to electors at each stage, and BLO push notifications — see `docs/notifications.md` for how these would be integrated.
- Real login, a real ECINet connection in place of the backend's simulated sync, real document uploads.
- A UI mockup pass in a design tool (e.g. Figma) before any real visual-design sign-off; the current CSS refresh is a developer-level pass, not a designed system.

## Before you share it
- Keep the on-page note that the data is synthetic.
- State of the data is in memory only: reloading resets it (the static pages); the backend's data resets on restart too.
- Check dates on the ECI and CEO Delhi sites, since schedules were extended before.
- Do not load real elector data into it, and do not run real voters' documents through the OCR tool's third-party CDN libraries without checking their privacy terms first.
- Rules shown for "logical discrepancy" come from court records and press, not an official ECI list.

