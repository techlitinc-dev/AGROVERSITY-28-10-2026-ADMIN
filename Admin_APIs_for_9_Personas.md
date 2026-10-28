# Admin API URLs for Selected Personas

Source: **AGROVERCITY API**, OpenAPI version **0.1.0**.

This document includes only admin endpoints directly related to the nine requested personas. General user management, authentication, KYC, platform configuration, and unrelated admin modules are excluded.

**Coverage:** 114 unique API paths and 120 operations. An endpoint may appear under more than one persona when its business domain overlaps.

## Base URL

The OpenAPI file does not contain a `servers` entry. Prepend your backend base URL to every path:

```text
{API_BASE_URL}/v1/admin/transport/bookings
```

Replace path parameters such as `{booking_id}`, `{uid}`, and `{shg_id}` with real values.

## Persona Mapping

| Persona | Included admin resources | Operations |
|---|---|---:|
| 1. Transporter | `transport` — transporters, drivers, vehicles, bookings, routes, and pricing rules. | 10 |
| 2. Equipment Owner | `equipment` — equipment verification, bookings, escalation, cancellation, and damage claims. | 6 |
| 3. Vyapari (Trader) | `buyers`, `sellers`, `lots`, `deals`, `rates`, `mandi`, `procurements`, and `contracts`. | 24 |
| 4. Customer | `orders`, `marketplace/orders`, and `subscriptions`. | 5 |
| 5. Farmer | `farm-map`, `diary`, `land`, `water`, `district-crops`, `advisory`, `soil-tests`, `pnl`, and `claims`. | 34 |
| 6. Woman Hub | `women`, `shgs`, and `gruh` — SHGs, enterprises, loans, subsidies, deposits, and certifications. | 18 |
| 7. Instructor / Teacher | `courses`, `workshops`, `experts`, and `expert-handoffs`. | 11 |
| 8. Nursery | `nurseries`, `nursery`, `plants`, `sapling-requests`, and tree-request oversight. | 10 |
| 9. Milk Vendor / Doodh Vala | Dairy rate-chart oversight and livestock-order auditing. No separate milk-vendor CRUD resource is defined. | 2 |

## Endpoints by Persona

### 1. Transporter

`transport` — transporters, drivers, vehicles, bookings, routes, and pricing rules.

| Method | API path | Description |
|---|---|---|
| `POST` | `/v1/admin/transport/vehicles/{vehicle_id}/verify` | Verify Vehicle |
| `POST` | `/v1/admin/transport/transporters/{transporter_id}/suspend` | Suspend Transporter |
| `GET` | `/v1/admin/transport/bookings` | List Transport Bookings |
| `PUT` | `/v1/admin/transport/bookings/{booking_id}/status` | Intervene Transport Booking Status |
| `GET` | `/v1/admin/transport/pricing-rules` | Get Transport Pricing Rules |
| `PUT` | `/v1/admin/transport/pricing-rules` | Update Transport Pricing Rules |
| `GET` | `/v1/admin/transport/bookings/{booking_id}` | Get Transport Booking Detail |
| `GET` | `/v1/admin/transport/bookings/{booking_id}/route` | Get Transport Booking Route |
| `GET` | `/v1/admin/transport/drivers` | List All Transport Drivers |
| `GET` | `/v1/admin/transport/vehicles` | List All Transport Vehicles |

### 2. Equipment Owner

`equipment` — equipment verification, bookings, escalation, cancellation, and damage claims.

| Method | API path | Description |
|---|---|---|
| `GET` | `/v1/admin/equipment/damage-claims` | Admin List Equipment Damage Claims |
| `GET` | `/v1/admin/equipment` | List Equipment |
| `POST` | `/v1/admin/equipment/bookings/{booking_id}/escalate` | Escalate Equipment Booking |
| `PUT` | `/v1/admin/equipment/{equipment_id}/verify` | Verify Equipment |
| `GET` | `/v1/admin/equipment/bookings` | List Equipment Bookings |
| `DELETE` | `/v1/admin/equipment/bookings/{booking_id}` | Admin Cancel Equipment Booking |

### 3. Vyapari (Trader)

`buyers`, `sellers`, `lots`, `deals`, `rates`, `mandi`, `procurements`, and `contracts`.

| Method | API path | Description |
|---|---|---|
| `GET` | `/v1/admin/flagged-rates` | List Flagged Rates |
| `GET` | `/v1/admin/rates/flagged` | List Flagged Rates |
| `GET` | `/v1/admin/mandi/rates` | List Mandi Rates |
| `POST` | `/v1/admin/mandi/rates` | Create Manual Mandi Rate |
| `POST` | `/v1/admin/mandi/rates/{rate_id}/approve` | Approve Mandi Rate |
| `POST` | `/v1/admin/mandi/rates/{rate_id}/reject` | Reject Mandi Rate |
| `GET` | `/v1/admin/lots` | List Lots |
| `GET` | `/v1/admin/deals` | List Deals |
| `POST` | `/v1/admin/deals/{deal_id}/escalate` | Escalate Deal |
| `GET` | `/v1/admin/buyers` | List Buyers |
| `POST` | `/v1/admin/buyers/{buyer_id}/verify` | Verify Buyer |
| `POST` | `/v1/admin/buyers/{buyer_id}/suspend` | Suspend Buyer |
| `GET` | `/v1/admin/rates/pending` | List Pending Rates |
| `POST` | `/v1/admin/rates/{rate_id}/approve` | Approve Rate |
| `POST` | `/v1/admin/rates/{rate_id}/reject` | Reject Rate |
| `POST` | `/v1/admin/mandi/sync` | Trigger Mandi Sync |
| `PUT` | `/v1/admin/lots/{lot_id}/status` | Force Lot Status |
| `POST` | `/v1/admin/market/lots/{lot_id}/moderate` | Moderate Lot |
| `GET` | `/v1/admin/procurements` | List Procurements |
| `GET` | `/v1/admin/contracts` | List Contracts |
| `POST` | `/v1/admin/contracts` | Publish Contract |
| `PUT` | `/v1/admin/contracts/{contract_id}/status` | Update Contract Status |
| `GET` | `/v1/admin/contracts/{contract_id}/acceptances` | List Contract Acceptances |
| `GET` | `/v1/admin/sellers` | List Sellers |

### 4. Customer

`orders`, `marketplace/orders`, and `subscriptions`.

| Method | API path | Description |
|---|---|---|
| `GET` | `/v1/admin/orders` | List Orders |
| `POST` | `/v1/admin/orders/{order_id}/refund` | Refund Order |
| `GET` | `/v1/admin/marketplace/orders` | List Marketplace Orders |
| `POST` | `/v1/admin/marketplace/orders/{order_id}/refund` | Refund Marketplace Order |
| `GET` | `/v1/admin/subscriptions` | List All Subscriptions |

### 5. Farmer

`farm-map`, `diary`, `land`, `water`, `district-crops`, `advisory`, `soil-tests`, `pnl`, and `claims`.

| Method | API path | Description |
|---|---|---|
| `GET` | `/v1/admin/district-crops` | List District Crops |
| `PUT` | `/v1/admin/district-crops/{district}` | Upsert District Crops |
| `POST` | `/v1/admin/district-crops/{district}/approve` | Approve District Crops |
| `GET` | `/v1/admin/diary/entries` | List Diary Entries |
| `GET` | `/v1/admin/land/leases` | List Land Leases |
| `GET` | `/v1/admin/advisory/scans/accuracy` | Advisory Scan Accuracy |
| `POST` | `/v1/admin/advisory/pest-alerts` | Dispatch Pest Alert |
| `GET` | `/v1/admin/advisory/soil-tests` | List Soil Tests |
| `POST` | `/v1/admin/advisory/soil-tests/{test_id}/validate` | Validate Soil Test |
| `GET` | `/v1/admin/water/schedules` | List Water Schedules |
| `PUT` | `/v1/admin/water/schedules/{schedule_id}` | Put Water Schedule |
| `GET` | `/v1/admin/users/{uid}/farm-map` | Get User Farm Map |
| `GET` | `/v1/admin/land/listings` | List Land Listings |
| `GET` | `/v1/admin/land/leases/{lease_id}/agreement` | Inspect Lease Agreement |
| `PUT` | `/v1/admin/land/leases/{lease_id}/terminate` | Terminate Lease Arbitrated |
| `GET` | `/v1/admin/advisory/scans` | Audit Advisory Scans |
| `GET` | `/v1/admin/soil-tests` | List Soil Tests |
| `POST` | `/v1/admin/soil-tests/{test_id}/results` | Upload Soil Test Result |
| `GET` | `/v1/admin/diary/summary` | Diary Regional Summary |
| `GET` | `/v1/admin/pnl/benchmarks` | Get Pnl Benchmarks |
| `PUT` | `/v1/admin/pnl/benchmarks/{crop}` | Put Pnl Benchmark |
| `POST` | `/v1/admin/advisory/articles` | Create Advisory Article |
| `GET` | `/v1/admin/advisory/articles` | List Advisory Articles |
| `GET` | `/v1/admin/advisory/articles/{article_id}` | Get Advisory Article |
| `PUT` | `/v1/admin/advisory/articles/{article_id}` | Update Advisory Article |
| `DELETE` | `/v1/admin/advisory/articles/{article_id}` | Delete Advisory Article |
| `POST` | `/v1/admin/advisory/articles/{article_id}/push` | Push Advisory Article |
| `GET` | `/v1/admin/claims` | List Claims |
| `PUT` | `/v1/admin/claims/{userId}/{claimId}` | Advance Claim |
| `POST` | `/v1/admin/claims/{claim_id}/assign-surveyor` | Assign Claim Surveyor |
| `PUT` | `/v1/admin/water/canal-schedule` | Put Canal Schedule |
| `POST` | `/v1/admin/water/groundwater-readings` | Ingest Groundwater Readings |
| `PUT` | `/v1/admin/water/subsidy-rules` | Put Subsidy Rules |
| `GET` | `/v1/admin/water/usage-stats` | Get Water Usage Stats |

### 6. Woman Hub

`women`, `shgs`, and `gruh` — SHGs, enterprises, loans, subsidies, deposits, and certifications.

| Method | API path | Description |
|---|---|---|
| `GET` | `/v1/admin/shgs` | List Shgs |
| `POST` | `/v1/admin/shgs/{shg_id}/verify` | Verify Shg |
| `POST` | `/v1/admin/shgs/{shg_id}/reject` | Reject Shg |
| `GET` | `/v1/admin/shgs/{shg_id}/deposits` | Shg Deposits |
| `GET` | `/v1/admin/shgs/{shg_id}/enterprises` | Shg Enterprises |
| `GET` | `/v1/admin/women/shgs/queue` | Women Shg Verification Queue |
| `POST` | `/v1/admin/women/shgs/{shg_id}/verify` | Verify Women Shg |
| `POST` | `/v1/admin/women/shg/verify` | Verify Women Shg 24B |
| `POST` | `/v1/admin/women/subsidies/disburse` | Disburse Women Subsidy |
| `GET` | `/v1/admin/gruh/certifications/queue` | Gruh Certification Queue |
| `POST` | `/v1/admin/gruh/certifications/{cert_id}/verify` | Verify Gruh Certification |
| `POST` | `/v1/admin/gruh/certifications/{cert_id}/reject` | Reject Gruh Certification |
| `GET` | `/v1/admin/women/enterprise-products` | Women Enterprise Products |
| `GET` | `/v1/admin/women/shg` | List Women Shgs |
| `GET` | `/v1/admin/women/enterprises` | List Women Enterprises |
| `GET` | `/v1/admin/women/loans` | List Women Loans |
| `GET` | `/v1/admin/women/deposit-compliance` | Women Deposit Compliance |
| `GET` | `/v1/admin/women/impact-report` | Get Women Impact Report |

### 7. Instructor / Teacher

`courses`, `workshops`, `experts`, and `expert-handoffs`.

| Method | API path | Description |
|---|---|---|
| `GET` | `/v1/admin/expert-handoffs` | List Expert Handoffs |
| `POST` | `/v1/admin/expert-handoffs/{ticket_id}/resolve` | Resolve Expert Handoff |
| `GET` | `/v1/admin/courses/queue` | Course Review Queue |
| `POST` | `/v1/admin/courses/{course_id}/review` | Review Course |
| `POST` | `/v1/admin/courses/{course_id}/feature` | Feature Course |
| `GET` | `/v1/admin/courses/report` | Courses Report |
| `GET` | `/v1/admin/experts` | List Experts |
| `PUT` | `/v1/admin/experts/{expert_id}` | Put Expert |
| `GET` | `/v1/admin/content/workshops` | List Workshops |
| `PUT` | `/v1/admin/content/workshops/{workshop_id}` | Update Workshop |
| `GET` | `/v1/admin/workshops/{workshop_id}/roster` | Workshop Roster |

### 8. Nursery

`nurseries`, `nursery`, `plants`, `sapling-requests`, and tree-request oversight.

| Method | API path | Description |
|---|---|---|
| `GET` | `/v1/admin/nurseries` | List Nurseries |
| `POST` | `/v1/admin/nurseries/{nursery_id}/reject` | Reject Nursery Kyc |
| `POST` | `/v1/admin/plants/{plant_id}/moderate` | Moderate Plant |
| `GET` | `/v1/admin/nursery/kpis` | Get Admin Nursery Kpis |
| `GET` | `/v1/admin/sapling-requests` | List Sapling Requests |
| `POST` | `/v1/admin/sapling-requests/{request_id}/review` | Review Sapling Request |
| `GET` | `/v1/admin/tree/requests` | List Tree Requests |
| `PUT` | `/v1/admin/tree/requests/{request_id}/status` | Update Tree Request Status |
| `POST` | `/v1/admin/nurseries/{nursery_id}/verify` | Verify Tree Nursery |
| `GET` | `/v1/admin/tree/requests/{request_id}/survival` | Get Sapling Survival |

### 9. Milk Vendor / Doodh Vala

Dairy rate-chart oversight and livestock-order auditing. No separate milk-vendor CRUD resource is defined.

| Method | API path | Description |
|---|---|---|
| `GET` | `/v1/admin/livestock/orders` | Audit Livestock Orders |
| `GET` | `/v1/admin/livestock/dairy/rate-charts` | Get Dairy Rate Charts Oversight |
