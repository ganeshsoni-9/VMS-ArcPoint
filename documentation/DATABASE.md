# Database Design

Collections: users, employees, departments, visitors, visits, notifications, auditLogs, blacklists, settings.

Visitor and Visit are separate collections because a visitor can have many visits over time; merging them
would duplicate identity data (name, mobile, photo) on every visit record and break both the
duplicate-active-visit rule and repeat-visitor reporting, which both key off a stable Visitor identity.

Key indexes:
- `visitors.mobile`
- `visits.status`, `visits.visitDate`, `visits.host`, `visits.department`
- `visits.visitorPassId` (unique)
- `visits.activeVisitor` (partial unique — enforces "one active visit per visitor" at the DB layer)

See `/mnt/user-data/outputs` phase0-architecture.md (shared earlier in chat) for the full ER relationship diagram.
