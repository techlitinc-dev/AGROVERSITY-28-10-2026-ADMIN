# AGROVERCITY Admin API — Selected Persona Topics

Extracted from `Admin_API_Endpoints.md`. This file includes only the five requested topics and their listed endpoints.

## 1. Admin Overview / Dashboard

| Method | API path | Description |
|---|---|---|
| `GET` | `/v1/admin/overview` | Get Admin Overview |

## 2. Users Management

| Method | API path | Description |
|---|---|---|
| `GET` | `/v1/admin/users` | List Users |
| `POST` | `/v1/admin/users/{target_uid}/status` | Update User Status |
| `GET` | `/v1/admin/users/{uid}/role-profiles` | Get Role Profiles |
| `PUT` | `/v1/admin/users/{uid}/status` | Update User Status Sop |
| `GET` | `/v1/admin/users/export` | Export User Roster |
| `GET` | `/v1/admin/users/{uid}` | Get User Details |
| `PUT` | `/v1/admin/users/{uid}/personas` | Manage User Personas |
| `GET` | `/v1/admin/users/{uid}/farm-map` | Get User Farm Map |

## 3. KYC Verification

| Method | API path | Description |
|---|---|---|
| `GET` | `/v1/admin/kyc/queue` | Get Kyc Queue |
| `POST` | `/v1/admin/kyc/{doc_id}/review` | Review Kyc Document |
| `GET` | `/v1/admin/kyc/pending` | List Pending Kyc |
| `GET` | `/v1/admin/kyc/history` | List Kyc History |
| `POST` | `/v1/admin/kyc/{doc_id}/verify` | Verify Kyc Document |
| `POST` | `/v1/admin/kyc/{doc_id}/reject` | Reject Kyc Document |
| `POST` | `/v1/admin/kyc/{doc_id}/request-more` | Request More Kyc Documents |

## 4. Admin MPIN Verification

| Method | API path | Description |
|---|---|---|
| `POST` | `/v1/admin/verify-mpin` | Verify Admin Mpin |

## 5. Authentication & Security

| Method | API path | Description |
|---|---|---|
| `GET` | `/v1/admin/auth/users` | List Auth Users |
| `POST` | `/v1/admin/auth/users/{uid}/reset-mpin` | Admin Reset Mpin |
| `POST` | `/v1/admin/auth/users/{uid}/revoke-sessions` | Admin Revoke Sessions |
| `PUT` | `/v1/admin/auth/users/{uid}/status` | Update Auth User Status |
| `GET` | `/v1/admin/auth/security-policy` | Get Security Policy |
| `PUT` | `/v1/admin/auth/security-policy` | Update Security Policy |

## Notes

- Replace path parameters such as `{uid}`, `{target_uid}`, and `{doc_id}` with the relevant values at runtime.
- The source API document does not specify a base server URL. Append these paths to your configured API base URL.
