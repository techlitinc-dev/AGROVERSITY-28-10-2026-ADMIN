# AGROVERCITY Superadmin Dashboard

Real-time telemetry and ecosystem governance dashboard for **AGROVERCITY (Kisan Setu)**.

Connected directly to the live backend REST server and Firestore database (**Zero mock or static data**).

---

## 🌐 Live Services & URLs

| Service | Address | Description |
|---|---|---|
| **Swagger API Docs** | [`http://65.20.92.22:8000/docs`](http://65.20.92.22:8000/docs) | Live FastAPI OpenAPI interactive documentation |
| **OpenAPI Specification** | [`http://65.20.92.22:8000/openapi.json`](http://65.20.92.22:8000/openapi.json) | OpenAPI 3.1.0 schema specification |
| **Backend Base URL** | `http://65.20.92.22:8000` | Real Firestore & Python backend engine |
| **Superadmin Web App** | [`http://65.20.92.22:5175/`](http://65.20.92.22:5175/) | Live React.js Console on Port 5175 |
| **Dashboard Overview Endpoint** | `GET /v1/admin/overview` | Unified real-time telemetry metrics |
| **User Management Router** | `GET /api/v1/admin/users` | Omni-persona directory & governance |

---

## 🔐 Credentials for Login

| Role | Registered Phone | MPIN | Account UID |
|---|---|---|---|
| **Super Admin Root** | `+919000000001` | `1234` | `admin-super` |

---

## 👤 User 360° Management Console (`/users`)

Built according to [`superadmin_user_management_module_instructions.md`](./superadmin_user_management_module_instructions.md), fully connected to live Firestore APIs with **zero mock or static data**:

### 1. User Directory & Filter Operations
- **Datetime Filter Bar**: Quick range presets (`All Time`, `Today`, `Last 7 Days`, `Last 30 Days`) and custom ISO datetime pickers (`start_date`, `end_date`).
- **Recent Entered User 1st Sorting**: By default sorts user roster by `createdAt` in descending order (`order=desc`), surfacing newly registered users at the very top. Toggleable to oldest first.
- **Multi-Persona Filtering**: Filter across `farmer`, `transporter`, `seller`, `nursery`, `vyapari`, `equipmentRental`, `farmLandlord`, and `admin`.
- **Search & Account Health**: Text search across phone, UID, email, and name; filter by KYC status and account status.
- **Direct System User Creation**: Interactive modal to create and pre-assign personas directly into Firestore.
- **Roster Export**: Instant export to CSV or JSON formats.

### 2. User 360° Drawer Console (4 Dedicated Tabs)
- **Tab 1: Profile & Identity**: Identity metadata, editable bio fields, verified phone, address, linked penny-drop bank account, zoomable KYC document gallery, and admin approval/rejection overrides with mandatory remarks.
- **Tab 2: Activity Log**: Chronological telemetry feed with category filters, IP addresses, JSON payload inspection drawer, active JWT sessions counter, and 1-click session revocation.
- **Tab 3: Content & Commercials**: Counts and detailed tabs for produce lots, marketplace orders, transporter fleet trips, media uploads, and customer reviews with moderation takedown buttons.
- **Tab 4: Governance & Security**: Account status toggles (`ACTIVE`, `SUSPENDED`, `BANNED`), Redis token blacklisting, manual wallet ledger adjustment (`CREDIT`/`DEBIT`), persona role checkboxes, 15-minute scoped impersonation token generation, and GDPR compliance audit dossier export.
