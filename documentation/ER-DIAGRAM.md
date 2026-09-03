# ER Relationships

User (1) --- (0..1) Employee
Employee (N) --- (1) Department
Visitor (1) --- (N) Visit
Visit (N) --- (1) Employee [host]
Visit (N) --- (1) Department
Visit (1) --- (N) Notification
User/Visit/Employee/Department/Blacklist actions --- (N) AuditLog entries
Settings: singleton document, no relationships

Visitor and Visit are kept separate: Visitor holds identity-ish data that's stable across visits
(name, mobile, photo, consent); Visit holds per-event data (status, host, times). This avoids
duplicating identity data per visit and is what makes the duplicate-active-visit rule and repeat-visitor
reporting possible.
