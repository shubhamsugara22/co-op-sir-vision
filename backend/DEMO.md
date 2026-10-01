# Demonstrating the backend to stakeholders

A short script to show the realtime-integration simulation without touching code.

## 1. Start it
```
cd backend
npm install
npm start
```
Console prints `SIR prototype backend listening on http://localhost:4000`.

## 2. Open the monitor page
Open http://localhost:4000 in a browser. Point out:
- "Live" status dot once the WebSocket connects.
- The dashboard numbers (forms collected, digitised, notices sent, visits avoided).
- The event log underneath, currently empty or showing startup events.

## 3. Trigger a visible change
In a second terminal, call the API directly so the audience sees cause and effect:
```
curl -X POST http://localhost:4000/api/electors/DEMO-0001/check
```
Point out: the event log on the monitor page updates immediately, with no page
refresh — this is the WebSocket push, not polling.

## 4. Show the simulated "ECINet sync"
Wait up to `SYNC_INTERVAL_MS` (default 15s). An `ECINet sync: ... advanced to ...`
line appears on its own. Say explicitly: *this interval is a stand-in for
whatever cadence a real election-database feed would use — a webhook, a queue
consumer, or a polling job — see `backend/README.md` → "Making this real".*

## 5. Show a full proposal→approval flow
```
curl -X POST http://localhost:4000/api/deletions/DEMO-0101/notice -H "Content-Type: application/json" -d "{\"notice\":true}"
curl -X POST http://localhost:4000/api/deletions/DEMO-0101/propose
curl -X POST http://localhost:4000/api/deletions/DEMO-0101/approve
```
Each step logs to the monitor page's event feed and updates the dashboard —
demonstrating the two-person check end to end, with a visible audit trail.

## 6. Talking points
- This is a demo of **wiring**, not a real data source: `db.js` holds the
  in-memory store that a real connector would replace.
- Nothing here needs the browser to poll; every client sees the same event at
  the same time, which is what "transparency" needs from the data layer.
- No authentication yet — call this out explicitly if demoing outside a trusted
  network; see `backend/README.md` → "Making this real" for what is missing.
