# Leasing Workflow — MVP-0

Context: First real rental workflow for MAG 330 Tower, City of Arabia, Dubai.
This document defines the end-to-end leasing process from property creation to tenant move-in.

---

## 1. Owner Workflow

How the property owner gets a unit ready to lease.

| Step | Action | Where it happens | Status |
|------|--------|-------------------|--------|
| 1 | Create property (building + unit) | `/onboarding/property` | `draft` |
| 2 | Add unit details (beds, baths, floor, sqft) | `/onboarding/unit` | `in_progress` |
| 3 | Add property details (view, furnishing, condition, availability) | `/onboarding/details` | `in_progress` |
| 4 | Set rental terms (price, payment schedule, deposit) | `/onboarding/rental` | `in_progress` |
| 5 | Upload photos (min 4 of 6 required types) | `/onboarding/media` | `in_progress` |
| 6 | Generate AI listing description | `/onboarding/story` | `in_progress` |
| 7 | Review readiness checklist | `/onboarding/review` | `ready_to_lease` |
| 8 | Share property link with tenants | Copy `/property/{id}` URL | `ready_to_lease` |

The owner sends the property link directly to potential tenants via WhatsApp, email, or any channel they prefer. There is no marketplace or public listing directory in MVP-0.

---

## 2. Tenant Workflow

What a tenant sees and does.

| Step | Action | Where it happens |
|------|--------|-------------------|
| 1 | Opens shared property link | `/property/{id}` |
| 2 | Reviews property showcase (photos, facts, price, terms) | Same page |
| 3 | Clicks "Request a Viewing" | Modal on same page |
| 4 | Fills form: name, phone, preferred date, optional message | Modal form |
| 5 | Gets confirmation: "We received your request" | Modal success state |

This creates a record in `tenant_inquiries` with `status: new`, `channel: web_chat`.

The tenant has no account. No login required. No app to download.

---

## 3. Leasing Workflow

The pipeline from new lead to deal closed. This is what the owner manages from the Review page.

```
New Lead → Contacted → Qualified → Viewing Booked → Closed
```

### Stage definitions

**New** (`inquiry_status: new`)
A tenant submitted a viewing request. The owner has not responded yet.
Owner action: Review the lead, check phone number, decide whether to contact.

**Contacted** (`inquiry_status: active`)
The owner reached out to the tenant (WhatsApp, phone call, etc.).
Owner action: Have an initial conversation, assess interest and fit.

**Qualified** (`inquiry_status: qualified`)
The tenant is a genuine prospect — budget fits, timeline works, ready to view.
Owner action: Schedule a viewing.

**Viewing Booked** (`inquiry_status: viewing_booked`)
A viewing date and time have been set.
Owner action: Conduct the viewing. After the viewing, decide next steps.

**Closed** (`inquiry_status: closed`)
The lead is done — either the tenant is not interested, or the deal is complete.
In MVP-0 there is no distinction between closed-won and closed-lost. The owner knows which it is.

---

## 4. Status Model

### tenant_inquiries.status

| Business stage | DB value | UI label | Currently in UI? |
|----------------|----------|----------|-------------------|
| New lead | `new` | New | Yes |
| Owner contacted tenant | `active` | Contacted | Yes |
| Tenant is qualified | `qualified` | Qualified | Yes |
| Viewing scheduled | `viewing_booked` | Viewing Booked | No |
| Lead is done | `closed` | Not interested | Yes |

### viewings.status

| Business stage | DB value | Currently in UI? |
|----------------|----------|-------------------|
| Date proposed, not confirmed | `proposed` | No |
| Tenant confirmed attendance | `confirmed` | No |
| Viewing took place | `completed` | No |
| Viewing cancelled | `cancelled` | No |

### qualification_result

| Value | Meaning | Currently used? |
|-------|---------|-----------------|
| `pending` | Not yet assessed | Yes (default on creation) |
| `qualified` | Tenant fits criteria | No |
| `not_qualified` | Tenant does not fit | No |

---

## 5. Gaps

What the current system cannot do that the MAG 330 workflow needs.

### Required for Viewing Booking (build now)

| Gap | Impact | Solution |
|-----|--------|----------|
| No viewing booking UI | Owner cannot schedule a viewing from the Review page | Add viewing booking flow to lead cards |
| `viewing_booked` status not in UI | Owner cannot mark a lead as "viewing scheduled" | Add as 5th status button when a viewing is created |
| No viewing details visible | Owner cannot see scheduled date/time | Show viewing info on lead card after booking |

### Not required for MVP-0 (build later)

| Gap | Notes |
|-----|-------|
| No closed-won vs closed-lost distinction | Owner knows the outcome; one `closed` status is enough for now |
| No follow-up status | Workaround: owner keeps lead in `active` or `qualified` |
| No owner notifications on new leads | Owner checks the Review page manually |
| Property status never transitions to `listed`/`leased` | Not blocking — the share link works regardless of property status |
| No multi-property dashboard | MVP-0 is one property (MAG 330 Unit 101) |
| No offer/negotiation tracking | Happens offline via WhatsApp; no need to track in-app yet |
| No tenant communication from within Leasy | Owner uses WhatsApp/phone directly |
| `qualification_result` not used in UI | Could enhance the Qualified stage later, not needed now |

---

## 6. MVP Boundaries

### Build now (Sprint 17+)

**Viewing Booking**
- Owner clicks "Book Viewing" on a qualified lead
- Picks date and time
- Creates a record in `viewings` table
- Lead status auto-updates to `viewing_booked`
- Viewing details shown on the lead card
- Owner can mark viewing as completed or cancelled

This uses the existing `viewings` table and `viewing_status` enum. No schema changes needed.

### Build later

| Feature | Why not now |
|---------|------------|
| Tenant notifications (WhatsApp/email) | Requires integration; owner contacts manually for now |
| AI conversation / chatbot | Complex; the simple form captures enough for MVP |
| Offer tracking | Negotiations happen on WhatsApp |
| Multi-property management | Only one unit in MAG 330 for now |
| Owner dashboard / analytics | Review page is sufficient |
| Calendar integration | Owner manages their own calendar |
| Property status automation | Not blocking the leasing flow |
| Tenant portal / login | Tenants don't need accounts yet |

### The MVP-0 promise

An owner can:
1. Create a property listing with photos and AI description
2. Share it with potential tenants
3. Receive viewing requests
4. Manage leads (New → Contacted → Qualified → Viewing Booked → Closed)
5. Schedule and track viewings

A tenant can:
1. View a premium property showcase
2. Request a viewing with one form
3. Get contacted by the owner directly

Everything else happens offline. Leasy handles the top of the funnel — discovery, first impression, lead capture, and viewing coordination.
