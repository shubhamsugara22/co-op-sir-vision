# SIR status and notice helper (prototype)

A static, single-file web prototype. It uses made-up people and data and is not connected to any ECI system.

## What is inside
- `index.html`: the prototype module. Open this one.
- `artifact/sir-prototype.html`: the same page as published as a Claude artifact.
- `docs/sources.md`: official documents and articles the rules come from.
- `.github/workflows/deploy-pages.yml`: auto-deploys this folder to GitHub Pages on every push to `main`.
- `backend/`: a small Node/WebSocket backend that simulates a real election database integration with realtime updates. Optional; `index.html` works without it.

## Tabs
- **For electors**: status tracker and notice decoder.
- **For BLOs**: doorstep live check, plus "This BLO's work so far" statistics (checks done, forms digitised, notices with hearings offered, pending).
- **Activity log**: append-only record of every action.
- **All rules**: the full rulebook with citations.
- **Officers and public view**: two-person deletion check and the aggregate public dashboard.
- **Simple guide**: plain-language explainer of what has happened, what is pending, and what is built vs. planned (no legal terms).
- **Workflow**: the automated pipeline, marking each step as automated or needing a person, plus how the backend fits in.
- **Search in SIR (OCR)**: read a scanned (image-only) SIR roll PDF or photo in the browser with OCR, then search it for a name. Needs internet once, to load the OCR library; the file itself is never uploaded.

## Run locally
Option 1: double-click `index.html`.

Option 2 (recommended, behaves like hosting):
```
cd sir-prototype
python3 -m http.server 8080
```
Then open http://localhost:8080

No build step, no install needed. Every tab except **Search in SIR (OCR)** works fully offline; that one loads its OCR library from a CDN the first time it is used.

## Try this
1. For electors: pick a demo elector, then use the notice decoder.
2. For BLOs: pick Demo Elector A, check live status, ask the elector to fill in, then fill the fields on the simulated phone. Watch the BLO stats update.
3. Officers and public view: propose a deletion with and without ticking the notice box, then approve it.
4. Activity log: see every action recorded.
5. Simple guide: see the plain-language status overview and the built vs. planned lists.
6. Workflow: see which pipeline steps are automatic and which need a person.
7. Search in SIR (OCR): upload a scanned PDF or photo of a roll page and search it for a name.

## Backend (optional, simulates a real integration)
```
cd backend
npm install
npm start
```
Then open http://localhost:4000 to see a live monitor page: a dashboard and
event log updating over a WebSocket, the way a real election database feed
would push updates. See `backend/README.md` for the API and how to replace
the in-memory store with a real database connector.

## Host it later
It is plain static files, so any of these work:
- GitHub Pages: push the folder to `main`; `.github/workflows/deploy-pages.yml` builds and deploys it automatically. Enable Pages once (Settings > Pages > Source: GitHub Actions).
- Google Cloud Storage: `gsutil mb gs://YOUR-BUCKET`, `gsutil cp index.html gs://YOUR-BUCKET/`, then `gsutil web set -m index.html gs://YOUR-BUCKET` and make the object public.
- Firebase Hosting, Netlify or Cloudflare Pages: point them at this folder.
- The `backend/` folder is a separate Node app; host it on any Node-capable platform (Render, Fly.io, a small VM) if you want the realtime demo running publicly too.

## Planned, not built yet
- SMS or WhatsApp updates to electors at each stage.
- Push notifications to the BLO's phone for pending visits.
- Real login, a real ECINet connection in place of the backend's simulated sync, real document uploads.

## Before you share it
- Keep the on-page note that the data is synthetic.
- State of the data is in memory only: reloading resets it (the static page); the backend's data resets on restart too.
- Check dates on the ECI and CEO Delhi sites, since schedules were extended before.
- Do not load real elector data into it, and do not run real voters' documents through the OCR tool's third-party CDN libraries without checking their privacy terms first.
- Rules shown for "logical discrepancy" come from court records and press, not an official ECI list.
