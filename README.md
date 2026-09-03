# Visitor Management System (VMS)

A full-stack MERN Visitor Management System built as a candidate assignment for an **Architecture & Consultancy Office**. All data is fabricated demo data — no real personal information is used anywhere in this project.

## 1. Overview

Three roles — **Admin**, **Receptionist**, **Employee** — manage the full visitor lifecycle:

```
Registration → Host Notification → Approval/Rejection → Check-in → Currently Inside → Check-out → Completed → Reporting → Audit Trail
```

## 2. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS v3, React Router DOM, Axios, Recharts, Lucide React
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Helmet, CORS, express-rate-limit, Zod, json2csv
- **Testing**: Jest, Supertest, mongodb-memory-server

## 3. Folder Structure

```
visitor-management-system/
├── client/     — React frontend
├── server/     — Express backend
└── documentation/
```

## 4. Prerequisites

- Node.js 18+
- A MongoDB instance (local or MongoDB Atlas)

## 5. Installation

```bash
# Backend
cd server
cp .env.example .env   # then edit MONGODB_URI and JWT_SECRET
npm install
npm run seed            # loads fabricated demo data + demo users
npm run dev              # starts on http://localhost:5000

# Frontend (in a separate terminal)
cd client
cp .env.example .env
npm install
npm run dev               # starts on http://localhost:5173
```

## 6. Test Credentials (fictional demo users)

| Role | Email | Password |
|---|---|---|
| Admin | admin@vms.demo | Admin@123 |
| Receptionist | reception@vms.demo | Reception@123 |
| Employee | employee@vms.demo | Employee@123 |

## 7. Running Tests

```bash
cd server
npm test
```

Tests use an in-memory MongoDB instance (`mongodb-memory-server`) — no production/dev data is touched. Current suite covers: login success/failure, unauthorized access to an admin route, and the duplicate-active-visit database constraint. This is a starting suite (3 tests), not the full 8–10 described in the original spec — see Known Limitations.

## 8. What Is Implemented

- JWT auth + bcrypt hashing, server-side RBAC on every protected route (not just hidden buttons)
- Visitor registration with mandatory consent, duplicate-active-visit rule enforced at the **database level** via a partial unique index (race-condition safe, not just an application-level check)
- Unique visitor pass ID generation (`VMS-2026-000001` style)
- Host approval/rejection workflow with in-app notifications
- Check-in / check-out with **server-generated timestamps** and computed visit duration
- Currently Inside view
- Server-side search, filtering, and pagination on visitors and visits
- Admin dashboard with MongoDB-aggregation-driven metrics (no hardcoded numbers), department chart, status distribution, repeat-visitor count
- CSV export (filtered, excludes identity-document references)
- Append-only audit log covering all major actions
- Blacklist with a configurable block/flag policy
- Configurable data-retention **setting** (see limitations)
- Seed script with fabricated employees, departments, and sample visits in various states

## 9. Explicitly MOCK / NOT Implemented (honesty per assignment realism rule)

- **Email/WhatsApp notifications**: not built. In-app notifications only.
- **Photo & identity-document upload**: the model fields (`photoRef`, `idDocRef`) and a **private, authenticated** `GET /api/visitors/:id/document` endpoint exist and are wired for RBAC, but the Multer upload flow itself was not built in this pass — the frontend form does not yet collect files.
- **PDF export**: not implemented. CSV export is implemented.
- **QR visitor pass, self check-in, emergency-occupancy page**: not implemented (they were marked bonus/optional in the spec).
- **Automatic data-retention cleanup job**: the retention period is stored in Settings and surfaced in the Admin UI, but no scheduled deletion job runs — deliberately, since silent auto-deletion of audit/visit data is risky without a documented, tested job.
- **Full 10-test suite**: only 3 representative tests are included (login success, login failure, unauthorized access, plus a DB-level duplicate-visit constraint test). Expanding this to the full list in the original spec (registration validation, approve/reject, check-in/out duration, etc.) is straightforward given the existing test scaffold but wasn't completed here.
- No deployment was actually performed — no live URL exists. Deployment target recommendations (Vercel/Netlify + Render + MongoDB Atlas) are documented but not executed.

## 10. Security Decisions

- Passwords hashed with bcrypt (cost 12), never returned in any API response.
- Every protected route re-validates authentication, account-active status, and role — the frontend hiding a button is never the only protection.
- Duplicate-active-visit rule enforced with a MongoDB **partial unique index**, not just a pre-check query, to close the race-condition window.
- Identity documents are served only through an authenticated, role-checked endpoint — never a static/public path.
- Check-in/out timestamps are always server-generated.
- Helmet, CORS allow-list, and rate limiting (tighter on `/api/auth/login`) are applied globally.
- Audit log has no update/delete route anywhere in the API.

## 11. Known Limitations

See section 9. In addition: file upload security (MIME/extension/size validation) is designed for but not wired end-to-end since uploads themselves weren't implemented; this should be the next increment.

## 12. Future Improvements

Photo/ID upload with Multer + validation, PDF export, QR pass, self check-in kiosk mode, scheduled retention cleanup job, expanded automated test coverage, CI pipeline, actual deployment.
