# SIR status and notice helper (prototype)

A static, single-file web prototype. It uses made-up people and data and is not connected to any ECI system.

## What is inside
- `index.html`: the prototype module. Open this one.
- `artifact/sir-prototype.html`: the same page as published as a Claude artifact.
- `docs/sources.md`: official documents and articles the rules come from.
- `.github/workflows/deploy-pages.yml`: auto-deploys this folder to GitHub Pages on every push to `main`.

## Tabs
- **For electors**: status tracker and notice decoder.
- **For BLOs**: doorstep live check, plus "This BLO's work so far" statistics (checks done, forms digitised, notices with hearings offered, pending).
- **Activity log**: append-only record of every action.
- **All rules**: the full rulebook with citations.
- **Officers and public view**: two-person deletion check and the aggregate public dashboard.
- **Simple guide**: plain-language explainer of what has happened, what is pending, and what is built vs. planned (no legal terms).
- **Workflow**: the automated pipeline, marking each step as automated or needing a person.

## Run locally
Option 1: double-click `index.html`.

Option 2 (recommended, behaves like hosting):
```
cd sir-prototype
python3 -m http.server 8080
```
Then open http://localhost:8080

No build step, no dependencies, no internet needed.

## Try this
1. For electors: pick a demo elector, then use the notice decoder.
2. For BLOs: pick Demo Elector A, check live status, ask the elector to fill in, then fill the fields on the simulated phone. Watch the BLO stats update.
3. Officers and public view: propose a deletion with and without ticking the notice box, then approve it.
4. Activity log: see every action recorded.
5. Simple guide: see the plain-language status overview and the built vs. planned lists.
6. Workflow: see which pipeline steps are automatic and which need a person.

## Host it later
It is plain static files, so any of these work:
- GitHub Pages: push the folder to `main`; `.github/workflows/deploy-pages.yml` builds and deploys it automatically. Enable Pages once (Settings > Pages > Source: GitHub Actions).
- Google Cloud Storage: `gsutil mb gs://YOUR-BUCKET`, `gsutil cp index.html gs://YOUR-BUCKET/`, then `gsutil web set -m index.html gs://YOUR-BUCKET` and make the object public.
- Firebase Hosting, Netlify or Cloudflare Pages: point them at this folder.

## Planned, not built yet
- SMS or WhatsApp updates to electors at each stage.
- Push notifications to the BLO's phone for pending visits.
- Real login, real ECINet connection, real document uploads.

## Before you share it
- Keep the on-page note that the data is synthetic.
- State of the data is in memory only: reloading resets it.
- Check dates on the ECI and CEO Delhi sites, since schedules were extended before.
- Do not load real elector data into it.
- Rules shown for "logical discrepancy" come from court records and press, not an official ECI list.
