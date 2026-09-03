# Security Review

| Area | Status |
|---|---|
| Password hashing | bcrypt, cost 12 |
| JWT auth | Implemented, verified on every protected route |
| RBAC | Server-side, per-route, not frontend-only |
| CORS | Allow-list via CLIENT_URL |
| Helmet | Enabled globally |
| Rate limiting | Global + stricter on /auth/login |
| Input validation | Zod on registration; Mongoose schema validation elsewhere |
| Mongo injection | Mongoose casts/validates input types; no raw query interpolation used |
| File upload | Designed (private doc endpoint, RBAC-checked) but upload flow (Multer) not wired — see README limitations |
| Sensitive logging | No passwords or tokens logged |
| Secrets | .env, never committed; .env.example has placeholders only |
| Audit logs | Append-only, no update/delete route |
| Data retention | Setting stored; no automatic deletion job (deliberately, pending a documented/tested job) |
