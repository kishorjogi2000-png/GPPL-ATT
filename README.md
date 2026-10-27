# Smart Workforce — Attendance & Management System

A React 19 + Vite + TypeScript attendance and workforce-management application for offices, sites and factories. It covers employee self-service attendance, an admin console, an entrance kiosk mode, monthly payroll reports and RBAC.

> **Deployment status:** this repository is a hardened single-browser build. Attendance data lives in the browser profile. A shared database/API is required before rolling it out to 200+ employees on multiple devices (see [Production readiness](#production-readiness)).

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Production bundle:

```bash
npm run build
npm start            # Express static server on PORT (default 3000) + /healthz
```

Checks:

```bash
npm run lint         # TypeScript, no emit
npm test             # 18 logic tests (attendance rules, geofence, CSV, face templates)
npm run build        # Vite production build
```

**Windows note:** this project directory contains `&` (`...attendance-&-management-system`). PowerShell parses that as a command separator, so `npm run …` can fail with `'-management-system' is not recognized`. Run the tools directly instead:

```powershell
node ./node_modules/typescript/bin/tsc --noEmit
node ./node_modules/vite/bin/vite.js build
node ./node_modules/tsx/dist/cli.mjs scripts/run-tests.ts
```

or move the project to a path without `&`.

---

## Seeded accounts (development only)

| Username | Password | Role |
|---|---|---|
| `admin` | `Admin@123` | Super Admin |
| `priya.hr` | `Priya@123` | HR |
| `kishor` | `Kishor@123` | Employee |
| `rohit` | `Rohit@123` | Employee |
| `mohan` | `Temp@123` | Employee |

These exist only to bootstrap a fresh browser profile. **Rotate every password before real use** (User Accounts → Reset Password). Seeded hashes are legacy SHA-256 and upgrade to PBKDF2 automatically on first successful login. Seeded face templates have been removed, so every employee must enrol a real face before punching.

---

## What the app does

### Employee mobile portal
- Real browser GPS (`navigator.geolocation`) with accuracy-aware geofencing and live distance to the assigned site.
- Only the assigned site and explicitly granted sites can be selected; the geofence is re-checked immediately before saving.
- Live camera selfie with GPS/address stamp; face template matching and motion-based liveness, both on-device and fail-closed.
- One attendance row per employee per local calendar day: IN → OUT, duplicate punches rejected with a clear message.
- Late, half-day, early departure, overtime and worked-minutes calculated by a single rules engine against the employee's shift.
- Offline punch queue (deduplicated, idempotent) with sync when the browser reconnects.
- Attendance history, leave/advance/grievance requests, notifications, profile photo, face enrolment and password change.
- First-login onboarding forces a password change, then profile photo, face enrolment and permission checks.

### Admin console
- Dashboard with real counts (present, late, absent/unmarked, on leave), verification-mode breakdown and geofence status.
- Attendance log with filters, photo previews, manual entry (duplicate-guarded) and escaped CSV export.
- Employee master, bulk CSV import, departments, shifts and company holidays.
- Leave/advance/grievance approval workflows.
- Monthly attendance roster by month and department, plus daily/late/leave/advance/grievance/employee reports; CSV/Excel export and print-to-PDF.
- User accounts, RBAC, audit trail and system settings.
- RBAC-filtered navigation and per-tab guards; role switching is disabled for real sessions.

### Office kiosk
- Dedicated entrance terminal: live camera → face match → liveness → IN/OUT, once per employee per day.
- Fails closed when the camera or an enrolment is missing; no mock fallback.

---

## Security model (current build)

- **Passwords:** PBKDF2-HMAC-SHA256, 210,000 iterations, unique random salt per user, self-describing hash format. Legacy SHA-256 hashes verify once then migrate.
- **Lockout:** 5 failed attempts → 15-minute lock, persisted per account.
- **Sessions:** 8-hour absolute expiry and 30-minute idle timeout, revalidated against the live account on read; signed-out/disabled users lose the session immediately.
- **RBAC:** permission map per role; admin tabs and navigation filtered; restricted tabs render an access-denied panel.
- **Forced password change:** new accounts and admin password resets must set a new password before entering the admin console (employees go through mobile onboarding).
- **Location:** real device GPS, conservative accuracy handling (poor accuracy blocks the punch), impossible accuracy/speed flagged as suspicious.
- **Biometrics:** template comparison and liveness run in the browser; mock/sample templates are rejected, and attendance is blocked until a real face is enrolled.
- **Storage:** photos are kept in IndexedDB (with legacy inline data URLs still readable); the main record store handles quota errors explicitly.
- **Audit:** logins, failures, punches, approvals, resets and exports are recorded with honest client-side metadata (`IP: N/A (client-side)`).
- **CSV export:** RFC 4180 escaping, UTF-8 BOM and spreadsheet formula-injection protection.

No fake OTP, no simulated GPS, no placeholder face vectors and no prefilled credentials.

---

## Production readiness

The following are **not** implemented and need your decision (and possibly paid services):

1. **Shared backend (mandatory for 200+ staff):** authentication, employees, attendance, photos and audit must move behind a server API with a real database (Postgres/MySQL/Firebase). The current browser store cannot be shared across devices and is capped by `localStorage` (~5 MB).
2. **Server-side enforcement:** geofence, duplicate and time rules must be re-validated server-side. Client checks stop casual misuse, not a determined user.
3. **Certified biometrics:** a commercial face/liveness SDK or hardware terminal (e.g. Mantrap/face terminal) is required for strong identity assurance. The current implementation is lightweight image matching, suitable for convenience, not for legal-grade attendance.
4. **Password recovery:** self-service reset is intentionally disabled because no verified SMS/email channel exists. Admins reset passwords today; add an SMS/email provider (Twilio/MSG91/SES) for self-service.
5. **Push notifications:** in-app notifications only. Web Push/FCM/APNs needs keys and a server.
6. **Google Sheets/Drive:** connectors need an OAuth client or service-account backend. The UI now reports "not configured" instead of pretending to sync.
7. **Hosting:** serve only over HTTPS. Geolocation and camera APIs require a secure context (localhost is exempt).

---

## Data, privacy and operations

- Storage keys: `SMART_WORKFORCE_DB_V2` (main data), `WORKFORCE_AUTH_SESSION_V2` (session), `SMART_WORKFORCE_OFFLINE_ATTENDANCE_QUEUE` (offline punches). Photos live in IndexedDB (`smart_workforce_photos`).
- Clearing site data deletes employees, attendance and photos. Export reports and take backups before clearing the browser.
- Photos are pruned after 365 days by the app.
- The audit log keeps the most recent entries to protect storage quota.

---

## Project structure

```
src/
  App.tsx                     auth gate, RBAC tab guard, experience modes
  components/
    auth/                     login, forced password change
    mobile/                   employee portal and punch flow
    kiosk/                    entrance terminal
    admin/                    dashboard, attendance, employees, reports, users…
    layout/                   admin shell / navigation
  services/
    auth.ts                   PBKDF2, lockout, sessions, RBAC
    db.ts                     schema, migrations, recordPunch, audit
    attendanceRules.ts        status/late/overtime/monthly report engine
    geolocation.ts            device GPS + geofence evaluation
    faceVerification.ts       template extraction, matching, liveness
    photoStore.ts             IndexedDB photo storage
    offlineSync.ts            offline punch queue
    csv.ts                    escaped CSV/print helpers
  utils/dateTime.ts           local-date arithmetic
scripts/run-tests.ts          test runner
docs/AUDIT_AND_PLAN.md        security audit and staged plan
```

---

## License / support

Internal project. Review `docs/AUDIT_AND_PLAN.md` for the full audit, staged plan and the list of features that require external APIs, paid services or hardware.
