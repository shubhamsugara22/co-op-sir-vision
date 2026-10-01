// Prototype backend: REST + WebSocket, so a real election database integration
// can later replace db.js without touching this transport layer.
const http = require("http");
const path = require("path");
const express = require("express");
const { WebSocketServer } = require("ws");
const db = require("./db");

const PORT = process.env.PORT || 4000;
const SYNC_INTERVAL_MS = process.env.SYNC_INTERVAL_MS ? Number(process.env.SYNC_INTERVAL_MS) : 15000;

const app = express();
app.use(express.json());

// Minimal CORS so the static prototype (served from a different port) can call this API.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/electors", (req, res) => res.json(db.getElectors()));

app.post("/api/electors/:id/check", (req, res) => {
  const e = db.checkElector(req.params.id);
  if (!e) return res.status(404).json({ error: "not found" });
  res.json(e);
});

app.post("/api/electors/:id/submit", (req, res) => {
  const e = db.submitElectorFields(req.params.id, req.body || {});
  if (!e) return res.status(404).json({ error: "not found" });
  res.json(e);
});

app.get("/api/deletions", (req, res) => res.json(db.getDeletions()));

app.post("/api/deletions/:id/notice", (req, res) => {
  const d = db.setDeletionNotice(req.params.id, !!req.body.notice);
  if (!d) return res.status(404).json({ error: "not found" });
  res.json(d);
});

app.post("/api/deletions/:id/propose", (req, res) => {
  const result = db.proposeDeletion(req.params.id);
  if (result.error) return res.status(400).json(result);
  res.json(result.deletion);
});

app.post("/api/deletions/:id/approve", (req, res) => {
  const result = db.approveDeletion(req.params.id);
  if (result.error) return res.status(400).json(result);
  res.json(result.deletion);
});

app.get("/api/dashboard", (req, res) => res.json(db.getDashboard()));
app.get("/api/activity", (req, res) => res.json(db.getActivity()));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

function broadcast(type, payload) {
  const message = JSON.stringify({ type, payload });
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) client.send(message);
  });
}

db.bus.on("elector", (e) => broadcast("elector", e));
db.bus.on("deletion", (d) => broadcast("deletion", d));
db.bus.on("activity", (a) => broadcast("activity", a));

wss.on("connection", (socket) => {
  socket.send(JSON.stringify({ type: "snapshot", payload: {
    electors: db.getElectors(),
    deletions: db.getDeletions(),
    dashboard: db.getDashboard(),
    activity: db.getActivity()
  } }));
});

db.startSimulatedEciNetSync(SYNC_INTERVAL_MS);

server.listen(PORT, () => {
  console.log(`SIR prototype backend listening on http://localhost:${PORT}`);
  console.log(`Realtime monitor page: http://localhost:${PORT}/`);
  console.log(`WebSocket feed: ws://localhost:${PORT}/ws`);
});
