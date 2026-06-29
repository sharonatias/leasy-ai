# Property Domain Model

**System:** Leasy AI
**Scope:** MVP-0
**Date:** 2026-06-29
**Status:** Draft
**Authority:** This model is the single source of truth for how the system represents properties. Every database table, API response, and agent behavior derives from it.

---

## 1. Domain Overview

```
                          ┌───────────┐
                          │  Project   │
                          └─────┬─────┘
                                │ 1:N
                          ┌─────▼─────┐
                          │  Building  │
                          └─────┬─────┘
                                │ 1:N
                          ┌─────▼─────┐
               ┌──────────┤  Property  ├──────────┐
               │          └──┬──┬──┬──┘           │
               │             │  │  │              │
          1:1  │        1:N  │  │  │ 1:N     1:N  │
    ┌──────────▼──┐  ┌───────▼┐ │ ┌▼────────┐ ┌──▼──────────────┐
    │ Rental Terms│  │ Media  │ │ │Onboarding│ │ AI Generated    │
    │             │  │ Asset  │ │ │ Progress │ │ Content         │
    └─────────────┘  └────────┘ │ └──────────┘ └─────────────────┘
                                │
                                │ 1:N
                        ┌───────▼────────┐
                        │ Tenant Inquiry │
                        └───────┬────────┘
                                │ 1:1
                          ┌─────▼─────┐
                          │  Viewing   │
                          └───────────┘
```

**Reading the diagram:**
- One Project contains many Buildings.
- One Building contains many Properties.
- One Property has one set of Rental Terms, many Media Assets, one Onboarding Progress record, many AI Generated Content entries, and many Tenant Inquiries.
- One Tenant Inquiry may have one Viewing.

---

## 2. Entities

### 2.1 Project

The top-level real estate development. Groups buildings under a single development identity.

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | uuid | Yes | Primary key, auto-generated | |
| name | string | Yes | Max 200 chars | Human-readable name |
| code | string | Yes | Unique, max 20 chars | e.g. "330-927" |
| city | string | Yes | Max 100 chars | e.g. "Dubai" |
| country | string | Yes | Max 100 chars | e.g. "UAE" |
| created_at | timestamp | Yes | Auto-set on creation | |
| updated_at | timestamp | Yes | Auto-set on update | |

**Business rules:**
- Project code is unique across the system.
- A project cannot be deleted if it contains buildings.

**Data ownership:** System-managed. Created during initial setup. Onboarding Agent can read.

---

### 2.2 Building

A physical structure within a project. Building-level data is shared across all properties in the building.

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | uuid | Yes | Primary key, auto-generated | |
| project_id | uuid | Yes | Foreign key → Project | |
| name | string | Yes | Max 200 chars | e.g. "330 Tower" |
| developer | string | Yes | Max 200 chars | |
| total_floors | integer | Yes | > 0 | |
| completion_year | integer | Yes | 4 digits, ≤ current year + 5 | Allows near-future for off-plan |
| amenities | string[] | Yes | At least 1 item | e.g. ["Pool", "Gym", "Concierge"] |
| parking | enum | Yes | See Field Enums | |
| rules | text | No | Max 2000 chars | Pet restrictions, move-in hours, etc. |
| created_at | timestamp | Yes | Auto-set on creation | |
| updated_at | timestamp | Yes | Auto-set on update | |

**Business rules:**
- A building cannot be deleted if it contains properties.
- Amenities list must contain at least one item. Buildings without any amenities should list "None."
- Building data is entered once and shared across all units. Updating building data affects all properties in the building.

**Data ownership:** Onboarding Agent writes during first property onboarding in this building. All agents can read.

---

### 2.3 Property

A single rentable unit. The atomic entity of the system.

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | uuid | Yes | Primary key, auto-generated | |
| building_id | uuid | Yes | Foreign key → Building | |
| unit_number | string | Yes | Max 20 chars | e.g. "1204" |
| floor | integer | Yes | ≥ 0 | 0 = ground floor |
| bedrooms | integer | Yes | ≥ 0 | 0 = studio |
| bathrooms | integer | Yes | ≥ 1 | |
| size_sqft | number | Yes | > 0 | Net area in square feet |
| view_type | enum | Yes | See Field Enums | |
| furnishing | enum | Yes | See Field Enums | |
| condition | enum | Yes | See Field Enums | |
| availability_date | date | Yes | ≥ today | When the unit can be occupied |
| unique_features | text | No | Max 1000 chars | Free-text: balcony, upgraded kitchen, etc. |
| status | enum | Yes | See State Machines | Current lifecycle state |
| created_at | timestamp | Yes | Auto-set on creation | |
| updated_at | timestamp | Yes | Auto-set on update | |

**Business rules:**
- Unit number + building_id must be unique. No duplicate units in the same building.
- Floor must not exceed the building's total_floors.
- Bathrooms must be ≥ 1. A property without a bathroom is not rentable.
- Size must be reasonable for the bedroom count. The AI Quality Review flags outliers but does not enforce hard limits.
- Availability date cannot be in the past. If a property becomes unavailable, update the date or change status to Draft.

**Data ownership:** Onboarding Agent writes. Leasing Agent reads.

---

### 2.4 Rental Terms

The owner's leasing preferences for a specific property. One-to-one with Property.

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | uuid | Yes | Primary key, auto-generated | |
| property_id | uuid | Yes | Foreign key → Property, unique | One-to-one relationship |
| asking_price_aed | number | Yes | > 0 | Annual rent in AED |
| min_lease_term | enum | Yes | See Field Enums | |
| payment_schedule | enum | Yes | See Field Enums | Number of cheques |
| security_deposit_aed | number | Yes | ≥ 0 | Typically 5% of annual rent |
| included_utilities | string[] | No | | e.g. ["Chiller", "Internet"] |
| pet_policy | enum | Yes | See Field Enums | |
| early_termination | text | No | Max 1000 chars | Penalty terms, notice period |
| rera_permit | string | No | Max 50 chars | Future-ready, not required for MVP-0 |
| ejari_registration | string | No | Max 50 chars | Future-ready, not required for MVP-0 |
| created_at | timestamp | Yes | Auto-set on creation | |
| updated_at | timestamp | Yes | Auto-set on update | |

**Business rules:**
- Each property has exactly one rental terms record. Created when onboarding begins, updated as the owner provides data.
- Asking price must be > 0. A property with a zero price is not listable.
- Security deposit of 0 is valid (some owners waive it).
- RERA and Ejari fields do not affect readiness score and are not validated in MVP-0.

**Data ownership:** Onboarding Agent writes. Leasing Agent reads. Only the owner can authorize changes to pricing or terms (advisory decision boundary).

---

### 2.5 Media Asset

Photos and floor plans linked to a property. Each asset has a type and a status.

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | uuid | Yes | Primary key, auto-generated | |
| property_id | uuid | Yes | Foreign key → Property | |
| asset_type | enum | Yes | See Field Enums | What this photo is of |
| url | string | Yes | Valid URL | Supabase Storage path |
| status | enum | Yes | See Field Enums | Upload/quality status |
| sort_order | integer | No | ≥ 0 | Display ordering within type |
| uploaded_at | timestamp | Yes | Auto-set on creation | |

**Business rules:**
- A property must have at least one asset of each required type before reaching Ready to Lease. Required types: living_room, bedroom, bathroom, kitchen, view, building_exterior, floor_plan.
- Bedroom photos: at least one per bedroom (a 2-bedroom unit needs ≥ 2 bedroom photos).
- Bathroom photos: at least one regardless of bathroom count.
- The Onboarding Agent sets status to "uploaded" on receipt. The AI Quality Review may change it to "needs_update" if quality is insufficient.
- Deleting a required media asset reverts the property's readiness score.

**Data ownership:** Onboarding Agent writes. Leasing Agent reads.

---

### 2.6 Onboarding Progress

Tracks completion per category for a single property. Used to calculate readiness score and power the missing information checklist.

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | uuid | Yes | Primary key, auto-generated | |
| property_id | uuid | Yes | Foreign key → Property, unique | One-to-one relationship |
| apartment_total | integer | Yes | ≥ 0 | Total required apartment fields |
| apartment_completed | integer | Yes | ≥ 0, ≤ apartment_total | Filled apartment fields |
| building_total | integer | Yes | ≥ 0 | Total required building fields |
| building_completed | integer | Yes | ≥ 0, ≤ building_total | Filled building fields |
| terms_total | integer | Yes | ≥ 0 | Total required rental terms fields |
| terms_completed | integer | Yes | ≥ 0, ≤ terms_total | Filled rental terms fields |
| media_total | integer | Yes | ≥ 0 | Total required media assets |
| media_completed | integer | Yes | ≥ 0, ≤ media_total | Uploaded media assets |
| readiness_score | number | Yes | 0.0–1.0 | Weighted composite score |
| status | enum | Yes | See State Machines | |
| updated_at | timestamp | Yes | Auto-set on update | |

**Business rules:**
- Readiness score is calculated, never manually set:
  ```
  score = (apt_pct × 0.30) + (bldg_pct × 0.15) + (terms_pct × 0.25) + (media_pct × 0.30)
  ```
- Completed count must never exceed total count for any category.
- Score recalculates on every data change.
- Optional fields (unique_features, building rules, included_utilities, early_termination, RERA, Ejari) are excluded from totals.

**Data ownership:** Onboarding Agent writes. All agents can read.

---

### 2.7 AI Generated Content

Content produced by the system for a specific property. Versioned so previous generations are preserved.

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | uuid | Yes | Primary key, auto-generated | |
| property_id | uuid | Yes | Foreign key → Property | |
| content_type | enum | Yes | See Field Enums | What kind of content this is |
| content | text | Yes | Max 10000 chars | The generated text |
| version | integer | Yes | ≥ 1, auto-incremented per property + type | |
| is_current | boolean | Yes | Default: true | Only one current version per type per property |
| generated_at | timestamp | Yes | Auto-set on creation | |

**Business rules:**
- When new content is generated for the same property and type, the previous version's `is_current` is set to false and the new version becomes current.
- Old versions are retained for audit and rollback, never deleted.
- Content is regenerated when property data changes significantly (defined by the Onboarding Agent: any required field change triggers regeneration).
- The Leasing Agent always reads the current version.

**Data ownership:** Onboarding Agent writes (generates content). Leasing Agent reads.

---

### 2.8 Tenant Inquiry

A conversation initiated by a prospective tenant about a specific property. This is **not** a Tenant entity — it represents the inquiry, not the person. The tenant's identity exists only within the context of their inquiry.

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | uuid | Yes | Primary key, auto-generated | |
| property_id | uuid | Yes | Foreign key → Property | |
| channel | enum | Yes | See Field Enums | How the tenant reached out |
| tenant_name | string | No | Max 200 chars | Provided during conversation |
| tenant_phone | string | No | Max 20 chars | If WhatsApp, captured automatically |
| tenant_email | string | No | Max 200 chars | If provided |
| status | enum | Yes | See State Machines | |
| qualification_budget | number | No | > 0 | Tenant's stated budget (AED/year) |
| qualification_move_in | date | No | | Tenant's preferred move-in date |
| qualification_household | integer | No | > 0 | Number of occupants |
| qualification_lease_term | string | No | Max 50 chars | Tenant's preferred lease duration |
| qualification_result | enum | No | See Field Enums | Qualified / Not Qualified / Pending |
| conversation_summary | text | No | Max 5000 chars | Agent-generated summary |
| created_at | timestamp | Yes | Auto-set on creation | |
| updated_at | timestamp | Yes | Auto-set on update | |

**Business rules:**
- A tenant inquiry is created when a new conversation starts. It is never reused for a different conversation from the same person — each conversation is a separate inquiry.
- Tenant name is not required at creation (may be provided mid-conversation).
- Qualification fields are populated as the conversation progresses. They may remain empty if the tenant disengages before qualification.
- Conversation summary is generated by the Leasing Agent at the end of each conversation or when the inquiry status changes.
- Tenant contact information (phone, email) is PII and must follow the security rules in the Agent Framework.

**Data ownership:** Leasing Agent writes. Onboarding Agent reads feedback only (issue_type, description from the feedback loop). Owner reads via notifications.

**Why not a Tenant entity:**
In MVP-0, a tenant exists only in the context of their inquiry about a specific property. There is no tenant profile, no cross-property history, no identity verification. A full Tenant entity will be introduced in a future version when lease agreements and verified identity workflows exist. Until then, the Tenant Inquiry captures everything the system needs to know.

---

### 2.9 Viewing

A scheduled property visit resulting from a qualified tenant inquiry. One-to-one with Tenant Inquiry (a single inquiry produces at most one viewing).

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | uuid | Yes | Primary key, auto-generated | |
| inquiry_id | uuid | Yes | Foreign key → Tenant Inquiry, unique | One-to-one relationship |
| property_id | uuid | Yes | Foreign key → Property | Denormalized for query convenience |
| scheduled_date | date | Yes | ≥ today | |
| scheduled_time | time | Yes | | |
| status | enum | Yes | See State Machines | |
| tenant_name | string | Yes | Max 200 chars | Copied from inquiry at booking time |
| tenant_phone | string | No | Max 20 chars | Copied from inquiry |
| owner_notified | boolean | Yes | Default: false | Whether the owner has been notified |
| owner_notified_at | timestamp | No | | When the notification was sent |
| cancellation_reason | text | No | Max 500 chars | If cancelled, why |
| created_at | timestamp | Yes | Auto-set on creation | |
| updated_at | timestamp | Yes | Auto-set on update | |

**Business rules:**
- A viewing can only be created for a qualified tenant inquiry (qualification_result = "qualified").
- A viewing cannot be scheduled for a property that is not in "listed" status.
- Scheduled date must be in the future at the time of booking.
- The owner must be notified when a viewing is booked. `owner_notified` tracks delivery, not acknowledgment.
- If a viewing is cancelled, the cancellation_reason must be provided.
- A cancelled viewing does not automatically cancel the inquiry — the tenant may reschedule.
- Tenant name and phone are copied from the inquiry at booking time so the viewing record stands alone even if the inquiry data changes.

**Data ownership:** Leasing Agent writes. Owner reads via notifications.

---

## 3. Entity Relationships

| Parent | Child | Cardinality | Foreign Key | Cascade Rule |
|--------|-------|-------------|-------------|--------------|
| Project | Building | 1:N | building.project_id | Restrict delete (cannot delete project with buildings) |
| Building | Property | 1:N | property.building_id | Restrict delete (cannot delete building with properties) |
| Property | Rental Terms | 1:1 | rental_terms.property_id (unique) | Cascade delete (terms deleted with property) |
| Property | Media Asset | 1:N | media_asset.property_id | Cascade delete (assets deleted with property) |
| Property | Onboarding Progress | 1:1 | onboarding_progress.property_id (unique) | Cascade delete |
| Property | AI Generated Content | 1:N | ai_generated_content.property_id | Cascade delete |
| Property | Tenant Inquiry | 1:N | tenant_inquiry.property_id | Restrict delete (cannot delete property with active inquiries) |
| Tenant Inquiry | Viewing | 1:1 | viewing.inquiry_id (unique) | Cascade delete |

**Relationship rules:**
- Cascade delete means the child is deleted when the parent is deleted.
- Restrict delete means the parent cannot be deleted while children exist.
- A property with active tenant inquiries (status: new, active, qualified, viewing_booked) cannot be deleted. Inquiries must be closed first.

---

## 4. Field Enums

All controlled vocabularies used across entities. When a new value is needed, add it here first.

### Property Enums

**view_type:**
| Value | Label |
|-------|-------|
| sea | Sea View |
| city | City View |
| garden | Garden View |
| pool | Pool View |
| community | Community View |
| other | Other |

**furnishing:**
| Value | Label |
|-------|-------|
| furnished | Furnished |
| semi_furnished | Semi-Furnished |
| unfurnished | Unfurnished |

**condition:**
| Value | Label |
|-------|-------|
| new | New |
| excellent | Excellent |
| good | Good |
| needs_maintenance | Needs Maintenance |

### Rental Terms Enums

**min_lease_term:**
| Value | Label |
|-------|-------|
| 6_months | 6 Months |
| 1_year | 1 Year |
| 2_years | 2 Years |

**payment_schedule:**
| Value | Label | Notes |
|-------|-------|-------|
| 1 | 1 Cheque | Full annual payment |
| 2 | 2 Cheques | |
| 4 | 4 Cheques | |
| 6 | 6 Cheques | |
| 12 | 12 Cheques | Monthly |

**pet_policy:**
| Value | Label |
|-------|-------|
| allowed | Allowed |
| not_allowed | Not Allowed |
| case_by_case | Case by Case |

### Building Enums

**parking:**
| Value | Label |
|-------|-------|
| included | Included |
| available_for_purchase | Available for Purchase |
| none | None |

### Media Asset Enums

**asset_type:**
| Value | Label | Required |
|-------|-------|----------|
| living_room | Living Room | Yes |
| bedroom | Bedroom | Yes (1 per bedroom) |
| bathroom | Bathroom | Yes (at least 1) |
| kitchen | Kitchen | Yes |
| view | View from Unit | Yes |
| building_exterior | Building Exterior | Yes |
| floor_plan | Floor Plan | Yes |
| other | Other | No |

**asset_status:**
| Value | Label |
|-------|-------|
| uploaded | Uploaded |
| needs_update | Needs Update (flagged by AI Quality Review) |

### AI Generated Content Enums

**content_type:**
| Value | Label |
|-------|-------|
| marketing_description | Marketing Description |
| faqs | FAQs |
| highlights | Apartment Highlights |
| weaknesses | Potential Weaknesses |
| improvements | Recommended Improvements |
| missing_photos | Suggested Missing Photos |

### Tenant Inquiry Enums

**channel:**
| Value | Label |
|-------|-------|
| whatsapp | WhatsApp |
| web_chat | Web Chat |

**qualification_result:**
| Value | Label |
|-------|-------|
| pending | Pending (not yet qualified) |
| qualified | Qualified |
| not_qualified | Not Qualified |

---

## 5. Validation Rules

Cross-field validations that apply beyond single-field constraints.

### Property Validations

| Rule | Fields | Logic |
|------|--------|-------|
| Floor within building | property.floor, building.total_floors | property.floor ≤ building.total_floors |
| Bedroom photo count | media_asset (type: bedroom), property.bedrooms | Count of bedroom photos ≥ property.bedrooms |
| Size sanity check | property.size_sqft, property.bedrooms | AI Quality Review flags if size < 300 sqft for 1+ bedroom. Not a hard constraint — raised as a warning. |
| Availability in future | property.availability_date | Must be ≥ current date at time of write |

### Rental Terms Validations

| Rule | Fields | Logic |
|------|--------|-------|
| Price sanity check | rental_terms.asking_price_aed | AI Quality Review flags extreme outliers (< 10,000 or > 10,000,000 AED/year). Not a hard constraint. |
| Deposit reasonableness | rental_terms.security_deposit_aed, rental_terms.asking_price_aed | AI Quality Review flags if deposit > 10% of annual rent. Not a hard constraint. |

### Viewing Validations

| Rule | Fields | Logic |
|------|--------|-------|
| Qualified tenant only | tenant_inquiry.qualification_result | Viewing can only be created if qualification_result = "qualified" |
| Listed property only | property.status | Viewing can only be created if property.status = "listed" |
| Future date only | viewing.scheduled_date | Must be ≥ current date at time of booking |
| No double-booking | viewing.scheduled_date, viewing.scheduled_time, viewing.property_id | No two active viewings for the same property at the same date and time |

---

## 6. State Machines

### Property Status

```
Draft ──────► In Progress ──────► Ready to Lease ──────► Listed
  ▲               │                      │                  │
  │               │                      │                  │
  └───────────────┘                      │                  ▼
  (data cleared or reset)                │               Leased
                                         │              (future)
                                         ▼
                                    Back to In Progress
                                    (if data changes after review)
```

| Transition | Trigger | Condition |
|------------|---------|-----------|
| Draft → In Progress | Owner submits first piece of data | — |
| In Progress → Ready to Lease | Readiness score = 100% AND AI Quality Review = Pass | All required fields and media present |
| Ready to Lease → Listed | Owner confirms publication | Human approval required |
| Listed → Leased | Lease signed | Future — not in MVP-0 |
| Ready to Lease → In Progress | Required data changes after review | Readiness score drops below 100% |
| In Progress → Draft | All data cleared | Unlikely but possible |

### Onboarding Progress Status

```
Not Started ──────► In Progress ──────► Complete
                         ▲                  │
                         │                  │
                         └──────────────────┘
                         (data changes after completion)
```

| Transition | Trigger |
|------------|---------|
| Not Started → In Progress | First field completed |
| In Progress → Complete | Readiness score = 100% AND AI Quality Review = Pass |
| Complete → In Progress | Any required field is cleared or media is removed |

### Tenant Inquiry Status

```
New ──────► Active ──────► Qualified ──────► Viewing Booked ──────► Closed
  │            │               │                    │                  ▲
  │            │               │                    │                  │
  │            ▼               ▼                    ▼                  │
  └──────► Closed          Closed               Closed ───────────────┘
         (no response)   (not qualified)      (viewing completed
                                               or cancelled)
```

| Transition | Trigger |
|------------|---------|
| New → Active | Leasing Agent sends first response |
| Active → Qualified | Qualification criteria met |
| Active → Closed | Tenant stops responding (48-hour timeout) OR tenant explicitly declines |
| Qualified → Viewing Booked | Viewing confirmed |
| Qualified → Closed | Tenant declines viewing or stops responding |
| Viewing Booked → Closed | Viewing completed, cancelled, or no-show |
| New → Closed | No response from tenant within 48 hours of first outreach |

### Viewing Status

```
Proposed ──────► Confirmed ──────► Completed
    │                │
    ▼                ▼
 Cancelled       Cancelled
```

| Transition | Trigger |
|------------|---------|
| Proposed → Confirmed | Tenant confirms the time |
| Proposed → Cancelled | Tenant declines or no response within 24 hours |
| Confirmed → Completed | Viewing date/time passes | 
| Confirmed → Cancelled | Tenant or owner cancels. Reason required. |

---

## 7. Data Ownership

| Entity | Write Owner | Read Access | Notes |
|--------|-------------|-------------|-------|
| Project | System (initial setup) | All agents | Created once, rarely updated |
| Building | Onboarding Agent | All agents | Written during first property onboarding in the building |
| Property | Onboarding Agent | Leasing Agent, Owner | Leasing Agent never writes to property data |
| Rental Terms | Onboarding Agent | Leasing Agent, Owner | Changes require owner approval (advisory decision) |
| Media Asset | Onboarding Agent | Leasing Agent, Owner | |
| Onboarding Progress | Onboarding Agent | All agents | Calculated, never manually written |
| AI Generated Content | Onboarding Agent | Leasing Agent | Leasing Agent reads current version only |
| Tenant Inquiry | Leasing Agent | Onboarding Agent (feedback only), Owner (via notification) | Onboarding Agent sees issue reports, not full conversations |
| Viewing | Leasing Agent | Owner (via notification) | |

**Ownership rules:**
- The write owner is the only agent that can create, update, or delete records for that entity.
- Read access does not imply write access.
- Cross-agent data sharing follows the Handoff Protocol defined in the Agent Framework.
- Owner access is always through agent-mediated notifications, not direct database access in MVP-0.

---

## 8. MVP-0 Scope

### Active in MVP-0

All nine entities defined in this document are active. Every field marked as "Required" must be implemented.

### Active but limited

| Entity/Field | Limitation |
|--------------|------------|
| Project | One project only (330-927) |
| Building | One building only (330 Tower) |
| Property | One property at a time |
| Tenant Inquiry — channel | WhatsApp and web chat only |
| AI Generated Content | English only |
| Viewing | Manual time slots, no calendar integration |
| Rental Terms — rera_permit | Present in schema, not validated or required |
| Rental Terms — ejari_registration | Present in schema, not validated or required |

### Present in schema but deferred

| Field/Concept | Reason |
|---------------|--------|
| Property status "Leased" | No lease workflow in MVP-0 |
| Multi-language content | English only for MVP-0 |
| Tenant entity | Tenants exist only as inquiry records until identity/lease workflows are built |
| Owner entity | Single owner assumed, no multi-owner model yet |
| Viewing feedback | What happens at the viewing is outside MVP-0 scope |

---

## 9. Future Extensions

Entities and concepts the domain will eventually include. Named and positioned here so MVP-0 design doesn't block them, but explicitly not defined yet.

| Future Entity | Purpose | Depends On |
|---------------|---------|------------|
| **Tenant** | Full tenant profile with identity, history, and preferences across properties. | Identity verification workflow, lease agreement. |
| **Lease** | Active rental agreement between owner and tenant for a specific property. | Contract generation, digital signatures, legal compliance. |
| **Payment** | Rent payments, deposits, and financial tracking. | Payment gateway integration, Financial Agent. |
| **Maintenance Request** | Tenant-reported issues and vendor coordination. | Maintenance Agent, vendor management. |
| **Owner** | Multi-owner support with profiles, portfolios, and permissions. | Multi-property onboarding, role-based access. |
| **Notification** | Structured notification system for owners and tenants. | Notification service, multi-channel delivery. |
| **Audit Log** | Immutable record of all agent actions and data changes. | System-wide logging infrastructure. |

These entities will be modeled when their dependent workflows are built. Until then, their responsibilities are handled inline by existing entities or by agent behavior.
