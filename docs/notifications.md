# Notifications (not built — integration notes)

Neither portal sends real notifications. This records how it would be wired
up later, without committing to a vendor.

## SMS / WhatsApp updates to electors
Trigger points: form collected, digitised, draft roll published, notice
issued, hearing scheduled, decision recorded — i.e. every `STAGES` transition
already logged by `backend/db.js`'s `addActivity`.

Suggested approach:
1. Add a phone-verified opt-in at enumeration time (the `mobile` field already
   exists on each elector record).
2. Subscribe a notification worker to `db.bus` (`elector`, `deletion` events)
   instead of polling.
3. Send through an aggregator API — e.g. MSG91, Twilio, or the NIC/government
   SMS gateway already used for other ECI services — templated per stage, in
   the elector's preferred language.
4. Log delivery status back onto the activity log (`sent`, `failed`,
   `read` where the channel supports it) so delivery is itself auditable.
5. Rate-limit and retry with backoff; do not block the main request path on a
   notification send (queue it, e.g. with a lightweight job queue or
   `setImmediate`/worker thread for this prototype's scale).

## Push notifications to the BLO's phone/app
Trigger points: new doorstep visit assigned, elector submitted fields
remotely, notice needs document pickup, hearing reminder.

Suggested approach:
1. BLO app registers a push token (Web Push API for a PWA, or FCM/APNs for a
   native app) against their BLO ID.
2. Same `db.bus` subscriber pattern as above, filtered to events relevant to
   that BLO's assigned booth/electors.
3. Push payload carries only an ID and a short reason, not personal data — the
   app fetches full details over the authenticated API on open.
4. Add a daily digest fallback (e.g. a morning summary) for BLOs without
   reliable connectivity, rather than relying solely on realtime push.

## What this needs before it is real
- A consent record per elector for SMS/WhatsApp (and a way to withdraw it).
- A vendor contract and sender-ID registration (DLT compliance in India for
  SMS/WhatsApp Business).
- Authentication on the backend's `/api/*` routes and WebSocket upgrade —
  notifications must not be triggerable by an unauthenticated caller.
- A way to test templates and delivery without touching real electors (a
  staging aggregator account, same as the rest of this prototype's synthetic
  data).
