# SIR prototype backend

A small Node/Express + WebSocket backend that stands in for a real election
database integration. The in-memory store in `db.js` plays the role a real
connector (Postgres, ECINet API, etc.) would play later — swap its functions
and the REST/WebSocket layer in `server.js` keeps working unchanged.

It is still a prototype: no auth, no persistence across restarts, and the
"ECINet sync" is a timer that randomly advances a demo elector's stage to
simulate a real-time feed arriving from an external system.

## Run it
```
cd backend
npm install
npm start
```
Open http://localhost:4000 for a live monitor page (dashboard numbers and
events updating over a WebSocket, as a real integration would push them).

## API
- `GET /api/electors` — all demo electors
- `POST /api/electors/:id/check` — BLO marks a doorstep check done
- `POST /api/electors/:id/submit` — elector submits missing fields, body: `{ "dob": "...", "mobile": "...", ... }`
- `GET /api/deletions` — deletion proposals
- `POST /api/deletions/:id/notice` — body `{ "notice": true|false }`
- `POST /api/deletions/:id/propose` — ERO proposes a deletion (requires notice set first)
- `POST /api/deletions/:id/approve` — second officer approves
- `GET /api/dashboard` — aggregate counts
- `GET /api/activity` — recent activity log
- `ws://localhost:4000/ws` — realtime feed; first message is a `snapshot`, then `elector` / `deletion` / `activity` events as they happen

## Wiring it to the static prototype
`index.html` works fully offline with its own in-memory demo data. To point it
at this backend instead, fetch `http://localhost:4000/api/...` and open a
`WebSocket` to `ws://localhost:4000/ws` in place of the local `E`/`D` arrays —
the shapes match. This was kept as a separate step so the static prototype
still runs with zero dependencies when no backend is available.

## Making this real
To connect an actual election database:
1. Replace the in-memory arrays in `db.js` with real queries (e.g. a Postgres
   pool, or calls to an internal ECINet-equivalent API).
2. Replace `startSimulatedEciNetSync` with a real subscriber (webhook, queue
   consumer, or polling job) that calls `db.bus.emit(...)` when real data changes.
3. Add authentication/authorization in front of the `/api/*` routes and the
   WebSocket upgrade before exposing this beyond a local demo.
