# AGROVERCITY Superadmin Web Application

Production-ready React.js Superadmin Console built for **AGROVERCITY (Kisan Setu)**, strictly implementing the 5 core API topic areas defined in [`Admin_Persona_API_Topics.md`](./Admin_Persona_API_Topics.md) and connected directly to the live backend server.

---

## 🌐 Live Services & URLs

| Service | Address | Description |
|---|---|---|
| **Swagger API Docs** | [`http://65.20.92.22:8000/docs`](http://65.20.92.22:8000/docs) | Live FastAPI OpenAPI interactive documentation |
| **Backend Base URL** | `http://65.20.92.22:8000` | Real Firestore & Python backend engine |
| **Superadmin Web App** | [`http://65.20.92.22:5175/`](http://65.20.92.22:5175/) | Live React + Vite console on Port 5175 |

---

## 🔐 Credentials for Login

| Role | Registered Phone | MPIN | Account UID |
|---|---|---|---|
| **Super Admin Root** | `+919000000001` | `1234` | `admin-super` |
| **Operations Lead** | `+919000000002` | `1234` | `admin-ops` |
| **Finance Admin** | `+919000000003` | `1234` | `admin-finance` |
| **Compliance Officer** | `+919000000004` | `1234` | `admin-compliance` |

---

## 📦 Implemented Modules (from `Admin_Persona_API_Topics.md`)

### 1. Admin Overview / Dashboard
- **Route**: `/`
- **Endpoints**:
  - `GET /v1/admin/overview`
- **Features**: Live platform KPIs, Firestore active users count, persona distribution (Farmer, Transporter, Vyapari, etc.), marketplace GMV, Farmland leases, operational health badge, raw JSON inspector.

### 2. Users Management
- **Route**: `/users`
- **Endpoints**:
  - `GET /v1/admin/users`: High-density user grid with server pagination and filtering.
  - `GET /v1/admin/users/{uid}`: Full user profile inspector in slide-out drawer.
  - `POST /v1/admin/users/{target_uid}/status`: Instant status toggle (Active / Suspended / Locked).
  - `PUT /v1/admin/users/{uid}/status`: Update user status SOP.
  - `PUT /v1/admin/users/{uid}/personas`: Multi-persona assignment engine (Farmer, Transporter, Seller, Broker, Equipment Owner).
  - `GET /v1/admin/users/{uid}/farm-map`: Geographic parcel boundary & GPS polygon coordinates.
  - `GET /v1/admin/users/{uid}/role-profiles`: User role profiles inspection.
  - `GET /v1/admin/users/export`: 1-click roster export to CSV or JSON.

### 3. KYC Verification
- **Route**: `/kyc`
- **Endpoints**:
  - `GET /v1/admin/kyc/queue`: Active review queue.
  - `GET /v1/admin/kyc/pending`: Pending submissions.
  - `GET /v1/admin/kyc/history`: Historical KYC decisions.
  - `POST /v1/admin/kyc/{doc_id}/review`: Review KYC document.
  - `POST /v1/admin/kyc/{doc_id}/verify`: Verify and approve document.
  - `POST /v1/admin/kyc/{doc_id}/reject`: Reject document with mandatory audit justification.
  - `POST /v1/admin/kyc/{doc_id}/request-more`: Request additional documents from user.

### 4. Admin MPIN Verification
- **Route**: `/verify-mpin`
- **Endpoints**:
  - `POST /v1/admin/verify-mpin`
- **Features**: Zero-trust elevated privilege checkpoint. Validates cryptographic MPIN bcrypt hash before allowing sensitive administrative actions. Also integrated as reusable modal component across all destructive actions.

### 5. Authentication & Security
- **Route**: `/security`
- **Endpoints**:
  - `GET /v1/admin/auth/users`: List registered authentication records.
  - `POST /v1/admin/auth/users/{uid}/reset-mpin`: Trigger remote MPIN reset.
  - `POST /v1/admin/auth/users/{uid}/revoke-sessions`: Force logout across all mobile and web devices.
  - `PUT /v1/admin/auth/users/{uid}/status`: Toggle user authentication status.
  - `GET /v1/admin/auth/security-policy`: Inspect platform-wide security policy.
  - `PUT /v1/admin/auth/security-policy`: Update session TTL (hours), brute-force lockout thresholds, and MPIN enforcement rules.

---

## 🛡️ Audit Trail Compliance (`X-Audit-Reason`)

All state-mutating requests (`POST`, `PUT`) automatically prompt the admin for a mandatory reason (minimum 3 characters). This reason is transmitted via the `X-Audit-Reason` HTTP header and recorded to the immutable audit trail.

---

## 🚀 Running the App Locally

```bash
# 1. Install dependencies
pnpm install

# 2. Start Vite development server
pnpm dev

# App runs on http://localhost:5175 (or http://65.20.92.22:5175)
```
