# RBAC Implementation & Security Verification Plan

## Security Threat Model

### Component Overview
The application is a full-stack Club Management Platform (Node.js/Express backend + ES6 SPA frontend) deployed for Pragati University / Pragati Engineering College. It serves 5 distinct actor roles: Super Admin, Faculty Coordinator, Club Admin / Club Lead, Student, and Guest. The system manages institutional club charters, memberships, attendance records with QR tokens, accredited certificates, and audit logs.

### Entry Points and Untrusted Inputs
| Entry Point | Type | Trusted? | Validation |
|---|---|---|---|
| `POST /api/auth/*` | JSON REST Body | Untrusted | Email, password, rollNo format checks; hashed verification |
| `Authorization: Bearer` / `x-user-id` | HTTP Headers | Untrusted | Validated against active user database records; session verification |
| `GET /api/clubs/:clubId/members` | URL Param & Query | Untrusted | Verified against caller role & club scope permissions |
| `POST /api/memberships/review` | JSON REST Body | Untrusted | Verifies caller is assigned coordinator, club admin (scoped), or super admin |
| `POST /api/events/create` | JSON REST Body | Untrusted | Checks `events.create` permission & scope against caller's assigned club |
| `POST /api/attendance/generate-qr` | JSON REST Body | Untrusted | Checks `attendance.mark` / QR generation authority for target event's club |
| `POST /api/certificates/issue` | JSON REST Body | Untrusted | Strict check: only Super Admin or assigned Faculty Coordinator (`certificates.approve`) |
| `POST /api/certificates/request` | JSON REST Body | Untrusted | Allows Club Admin to submit certificate requests for faculty approval |
| `POST /api/admin/users/*` | JSON REST Body | Untrusted | Strict check: caller must have `users.create` / `roles.assign` (Super Admin only) |
| `GET /api/audit-logs` | Query / Route | Untrusted | Role check: Super Admin gets full logs; Faculty Coordinator gets assigned club logs; Students/Guests blocked (403) |
| `POST /api/settings/*` | JSON REST Body | Untrusted | Strict check: `settings.manage` (Super Admin only) |

### Trust Boundaries and Auth Assumptions
- **Authentication**: Token / Session credential passed via `Authorization: Bearer <token>` or `x-user-id` header on every API request.
- **Authorization**: Granular RBAC middleware inspecting `(user, permission, scope, resourceId)` at the Express route level.
- **Implicit trust**: Eliminate all implicit trust. Frontend UI checks are strictly decorative; all authorization decisions, club scope checks, and data filtering occur on the backend before data return or mutation.
- **Boundary crossings**: Browser client to Express REST API; requests must supply authenticated identity which is validated on each invocation.

### Sensitive Data Paths
| Data Type | Source | Destination | Protection |
|---|---|---|---|
| Passwords & Salts | Database | Server internal | SHA-256 HMAC + unique per-user salts. Stripped from all API responses via `sanitizeUser` |
| Student Records & PII | Database | Express API | Scoped: Students only see own profile; Club Admins only see members in their club; Public users cannot view student PII |
| Audit Logs | Mutating endpoints | Express DB | Restricted to Super Admin (full) and Faculty Coordinator (scoped); hidden from students/guests |
| Certificates | Issue endpoint | Verification registry | Signed with SHA-256 hash ledger; approval restricted to authorized faculty and super admin |

### Privileged Actions
| Action | Location | Guard |
|---|---|---|
| User role modification | `POST /api/admin/users/update-role` | Requires `roles.assign` (Super Admin only) |
| Club deletion/approval | `POST /api/admin/clubs/:id/*` | Requires `clubs.approve` / `clubs.delete` (Super Admin only) |
| Certificate generation/approval | `POST /api/certificates/issue` | Requires `certificates.approve` and club scope verification |
| Attendance session override | `POST /api/attendance/manual-checkin` | Requires `attendance.update` and club scope verification |
| Settings management | `POST /api/settings/*` | Requires `settings.manage` (Super Admin only) |

### Priority Review Areas
1. **Scope Checking**: Ensure `/api/clubs/:clubId/*` and event/attendance/certificate routes strictly verify that Faculty Coordinators and Club Admins can ONLY access their assigned clubs.
2. **Prevent Privilege Escalation**: Ensure no user can elevate their role or create admin accounts through registration or profile update endpoints.
3. **Audit Log Privacy**: Ensure students and guests cannot query administrative audit logs.

## Verification Plan

### Security Verification
- **Security Scan**: Inspect all newly created and modified files for common CWE vulnerabilities (XSS, injection, exposed secrets, missing auth boundaries). Resolve any detected issues immediately.
- **Security Audit**: Audit the implementation against the component's threat model (`## Security Threat Model`). Document all findings, dispositions, and remediations in `walkthrough.md` using the `generate-security-audit-report` skill.
