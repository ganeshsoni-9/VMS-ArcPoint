# API Reference

Base URL: `/api`

All responses follow:
```json
{ "success": true, "message": "...", "data": {} }
{ "success": false, "message": "...", "errors": [] }
```

## Auth
- `POST /auth/login` — { email, password } → { token, user }
- `GET /auth/me` — current user (requires JWT)
- `POST /auth/logout`

## Visitors (admin, receptionist)
- `POST /visitors` — register visitor + creates PENDING visit
- `GET /visitors?search=&page=&limit=`
- `GET /visitors/:id` — visitor + visit history
- `GET /visitors/:id/document` — authenticated identity-document access

## Visits (admin, receptionist)
- `GET /visits?status=&department=&host=&from=&to=&page=&limit=`
- `GET /visits/currently-inside`
- `PATCH /visits/:id/check-in`
- `PATCH /visits/:id/check-out`
- `PATCH /visits/:id/cancel` — { reason }

## Host (employee, own requests only)
- `GET /host/requests?status=`
- `PATCH /host/requests/:id/approve`
- `PATCH /host/requests/:id/reject` — { reason }

## Employees / Departments
- Standard CRUD, admin-only writes (`GET /employees` also allowed for receptionist, needed for the host dropdown)

## Notifications
- `GET /notifications`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`

## Reports (admin, receptionist unless noted)
- `GET /reports/dashboard`
- `GET /reports/range?from=&to=`
- `GET /reports/repeat-visitors` (admin only)
- `GET /reports/export/csv?status=&department=&host=&from=&to=`

## Audit (admin only)
- `GET /audit-logs?action=&page=&limit=`

## Blacklist (admin only)
- Standard CRUD

## Settings (admin only)
- `GET /settings`, `PUT /settings`
