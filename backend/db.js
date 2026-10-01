// In-memory store standing in for a real election database connector.
// Swap the functions below for real queries (Postgres, ECINet API, etc.)
// and the rest of the backend (server.js, websocket broadcast) keeps working.
const { EventEmitter } = require("events");

const STAGES = [
  "Form issued",
  "Form collected",
  "Digitised",
  "Draft roll",
  "Notice sent",
  "Hearing",
  "Decision recorded"
];

const bus = new EventEmitter();

let electors = [
  { id: "DEMO-0001", name: "Demo Elector A", stage: 1, checked: false, f: { dob: "12/03/1985", mobile: "", father: "Demo Father A", last: "" } },
  { id: "DEMO-0002", name: "Demo Elector B", stage: 4, checked: false, f: { dob: "05/09/1999", mobile: "98000 00002", father: "Demo Father B", last: "Part 14, Sr 220" } },
  { id: "DEMO-0003", name: "Demo Elector C", stage: 0, checked: false, f: { dob: "", mobile: "98000 00003", father: "Demo Father C", last: "Part 9, Sr 41" } }
];

let deletions = [
  { id: "DEMO-0101", why: "Dead", st: 0, n: false },
  { id: "DEMO-0102", why: "Shifted", st: 0, n: false },
  { id: "DEMO-0103", why: "Duplicate", st: 0, n: false },
  { id: "DEMO-0104", why: "Absent", st: 0, n: false }
];

let activity = [];
let savedVisits = 0;

function addActivity(message, source) {
  const entry = { t: new Date().toISOString(), m: message, source: source || "system" };
  activity.unshift(entry);
  activity = activity.slice(0, 200);
  bus.emit("activity", entry);
  return entry;
}

function getElectors() {
  return electors;
}

function getElector(id) {
  return electors.find((e) => e.id === id);
}

function checkElector(id) {
  const e = getElector(id);
  if (!e) return null;
  e.checked = true;
  addActivity(`BLO checked live status of ${id}`, "blo");
  bus.emit("elector", e);
  return e;
}

function submitElectorFields(id, fields) {
  const e = getElector(id);
  if (!e) return null;
  Object.assign(e.f, fields);
  if (e.stage < 2) e.stage = 2;
  savedVisits += 1;
  addActivity(`Elector ${id} submitted fields on their phone. Status moved to Digitised.`, "elector");
  bus.emit("elector", e);
  return e;
}

function getDeletions() {
  return deletions;
}

function setDeletionNotice(id, flag) {
  const d = deletions.find((x) => x.id === id);
  if (!d) return null;
  d.n = !!flag;
  bus.emit("deletion", d);
  return d;
}

function proposeDeletion(id) {
  const d = deletions.find((x) => x.id === id);
  if (!d) return { error: "not found" };
  if (!d.n) return { error: "Issue a notice and offer a hearing before proposing a deletion." };
  d.st = 1;
  addActivity(`ERO proposed deletion of ${id} (reason: ${d.why}). Notice and hearing recorded.`, "ero");
  bus.emit("deletion", d);
  return { ok: true, deletion: d };
}

function approveDeletion(id) {
  const d = deletions.find((x) => x.id === id);
  if (!d) return { error: "not found" };
  d.st = 2;
  addActivity(`Second officer approved deletion of ${id}. Reason code: ${d.why}.`, "officer");
  bus.emit("deletion", d);
  return { ok: true, deletion: d };
}

function getDashboard() {
  const count = (fn) => electors.filter(fn).length;
  const byReason = ["Absent", "Shifted", "Dead", "Duplicate"].map((why) => {
    const list = deletions.filter((d) => d.why === why);
    return { why, listed: list.length, approved: list.filter((d) => d.st === 2).length };
  });
  return {
    total: electors.length,
    formsCollected: count((e) => e.stage >= 1),
    digitised: count((e) => e.stage >= 2),
    noticesSent: count((e) => e.stage >= 4),
    savedVisits,
    byReason
  };
}

function getActivity() {
  return activity;
}

// Simulates a push from a real election database (ECINet-style) arriving on its own schedule.
function startSimulatedEciNetSync(intervalMs) {
  return setInterval(() => {
    const movable = electors.filter((e) => e.stage < STAGES.length - 1);
    if (!movable.length) return;
    const e = movable[Math.floor(Math.random() * movable.length)];
    e.stage += 1;
    addActivity(`ECINet sync: ${e.id} advanced to "${STAGES[e.stage]}"`, "ecinet-sync");
    bus.emit("elector", e);
  }, intervalMs || 15000);
}

module.exports = {
  STAGES,
  bus,
  getElectors,
  getElector,
  checkElector,
  submitElectorFields,
  getDeletions,
  setDeletionNotice,
  proposeDeletion,
  approveDeletion,
  getDashboard,
  getActivity,
  addActivity,
  startSimulatedEciNetSync
};
