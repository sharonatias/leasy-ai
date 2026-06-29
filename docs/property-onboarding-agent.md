# Property Onboarding Agent — Product Specification

**Module:** Property Onboarding Agent
**Version:** 1.0 — MVP
**Date:** 2026-06-29
**Status:** Draft

---

## 1. Purpose

The Property Onboarding Agent is the first module in Leasy AI. It prepares a single apartment for rental by collecting all required information, identifying gaps, and building a structured knowledge base that the AI Leasing Agent will use to represent the property to potential tenants.

Without complete onboarding, the Leasing Agent cannot answer tenant questions accurately. This module ensures every property reaches a verified state of readiness before going live.

**First property:**

| Field   | Value     |
|---------|-----------|
| Project | 330-927   |
| Building| 330 Tower |
| City    | Dubai     |

---

## 2. User Flow

1. Property owner opens the onboarding flow for a new apartment.
2. System creates an onboarding session linked to the property.
3. Owner fills in information across four categories: apartment details, building info, rental terms, and media.
4. As data is entered, the missing information checklist updates in real time.
5. The readiness score recalculates after every change.
6. When the owner believes the property is complete, they request an AI Quality Review.
7. The AI reviews all submitted data and generates a readiness report with detected issues and improvement suggestions.
8. Owner addresses flagged issues (or dismisses them with a reason).
9. Once the readiness score reaches 100% and the AI review passes, the property is marked as **Ready to Lease**.
10. The AI Knowledge Generation step runs automatically, producing marketing descriptions, FAQs, highlights, and more.
11. The Leasing Agent can now represent this property.

---

## 3. Required Apartment Information

| Field              | Type       | Required | Notes                                      |
|--------------------|------------|----------|---------------------------------------------|
| Unit number        | string     | Yes      | e.g. "1204"                                 |
| Floor              | number     | Yes      |                                              |
| Bedrooms           | number     | Yes      | 0 = studio                                  |
| Bathrooms          | number     | Yes      |                                              |
| Size (sqft)        | number     | Yes      | Net area                                    |
| View type          | enum       | Yes      | Sea, City, Garden, Pool, Community, Other   |
| Furnishing status  | enum       | Yes      | Furnished, Semi-Furnished, Unfurnished      |
| Current condition  | enum       | Yes      | New, Excellent, Good, Needs Maintenance     |
| Availability date  | date       | Yes      | When the unit can be occupied               |
| Unique features    | text       | No       | Free-text: balcony, upgraded kitchen, etc.  |

---

## 4. Required Building Information

Building-level data is shared across all units in the same building.

| Field              | Type       | Required | Notes                                       |
|--------------------|------------|----------|----------------------------------------------|
| Building name      | string     | Yes      | "330 Tower"                                  |
| Project code       | string     | Yes      | "330-927"                                    |
| City               | string     | Yes      | "Dubai"                                      |
| Developer          | string     | Yes      |                                               |
| Total floors       | number     | Yes      |                                               |
| Completion year    | number     | Yes      |                                               |
| Amenities          | string[]   | Yes      | Pool, Gym, Concierge, Kids Area, etc.        |
| Parking            | enum       | Yes      | Included, Available for Purchase, None       |
| Building rules     | text       | No       | Pet restrictions, move-in hours, etc.        |

---

## 5. Required Rental Terms

Owner's leasing preferences for this specific unit.

| Field                | Type       | Required | Notes                                        |
|----------------------|------------|----------|-----------------------------------------------|
| Asking price (AED/yr)| number     | Yes      | Annual rent in AED                            |
| Minimum lease term   | enum       | Yes      | 6 months, 1 year, 2 years                    |
| Payment schedule     | enum       | Yes      | 1, 2, 4, 6, or 12 cheques (Dubai standard)   |
| Security deposit     | number     | Yes      | Typically 5% of annual rent                   |
| Included utilities   | string[]   | No       | Chiller, internet, etc.                       |
| Pet policy           | enum       | Yes      | Allowed, Not Allowed, Case by Case           |
| Early termination    | text       | No       | Penalty terms, notice period                  |
| RERA permit number   | string     | No       | Future-ready field, not required for MVP      |
| Ejari registration   | string     | No       | Future-ready field, not required for MVP      |

> **Note on RERA & Ejari:** These fields are included for forward compatibility with Dubai regulatory requirements. They are optional, do not affect the readiness score, and will become relevant when compliance tracking is added in a future module.

---

## 6. Required Media Assets

Each media item has a status: **Uploaded**, **Missing**, or **Needs Update**.

| Asset                | Required | Notes                                    |
|----------------------|----------|-------------------------------------------|
| Living room photo    | Yes      | Main hero image                           |
| Bedroom photo(s)     | Yes      | One per bedroom                           |
| Bathroom photo(s)    | Yes      | At least one                              |
| Kitchen photo        | Yes      | Including appliances visible              |
| View from unit       | Yes      | From balcony or main window               |
| Building exterior    | Yes      | Front entrance or full building           |
| Floor plan           | Yes      | 2D layout with dimensions                 |
| Video walkthrough    | No       | Future enhancement                        |

---

## 7. Missing Information Checklist

A dynamic checklist grouped by category that updates in real time as the owner submits data.

**Structure:**

```
Apartment Information     [7/10 complete]
  ✅ Unit number
  ✅ Floor
  ✅ Bedrooms
  ✅ Bathrooms
  ✅ Size
  ✅ View type
  ✅ Furnishing status
  ❌ Current condition
  ❌ Availability date
  ❌ Unique features (optional)

Building Information      [5/7 complete]
  ...

Rental Terms              [4/5 complete]
  ...

Media Assets              [3/7 complete]
  ...
```

**Behavior:**
- Optional fields show as skippable but still appear in the checklist.
- Missing required fields block the property from reaching "Ready" status.
- The checklist is the primary data source for the AI when prompting the owner for missing info.

---

## 8. Readiness Score Logic

The readiness score is a weighted percentage across four categories.

| Category              | Weight | Calculation                                          |
|-----------------------|--------|------------------------------------------------------|
| Apartment Information | 30%    | Required fields filled / total required fields       |
| Building Information  | 15%    | Required fields filled / total required fields       |
| Rental Terms          | 25%    | Required fields filled / total required fields       |
| Media Assets          | 30%    | Required assets uploaded / total required assets     |

**Formula:**

```
score = (apartment_pct × 0.30) + (building_pct × 0.15) + (terms_pct × 0.25) + (media_pct × 0.30)
```

**Thresholds:**

| Score     | Status               | Meaning                                        |
|-----------|----------------------|-------------------------------------------------|
| 100%      | Ready to Lease       | All required data present, AI review passed     |
| 80–99%    | Almost Ready         | Listable with warnings, missing non-critical items |
| 50–79%    | In Progress          | Significant gaps remain                         |
| Below 50% | Just Started         | Most information still missing                  |

**Exclusions:**
- Optional fields (unique features, building rules, included utilities, early termination, video walkthrough) do not affect the score.
- RERA and Ejari fields do not affect the score.

---

## 9. AI Knowledge Generation

Once a property reaches 100% readiness and passes the AI Quality Review, the system automatically generates a structured knowledge base for the Leasing Agent.

### Generated Outputs

**Marketing Description**
A professional, engaging property listing description written in a tone appropriate for the Dubai rental market. Includes key selling points, neighborhood context, and lifestyle appeal. Generated in English, with future support for Arabic.

**FAQs**
A set of 10–15 anticipated tenant questions and answers based on the property data. Examples:
- "Is the apartment furnished?"
- "How many cheques do you accept?"
- "Is parking included?"
- "Are pets allowed?"

**Apartment Highlights**
A ranked list of the property's strongest selling points, derived from the data. Examples:
- High floor with sea view
- Brand new condition
- Full building amenities (pool, gym, concierge)

**Potential Weaknesses**
Honest assessment of aspects tenants may question or object to. The Leasing Agent uses these to prepare responses rather than being caught off guard. Examples:
- No balcony
- Street-facing view on a low floor
- Unfurnished in a market that prefers furnished

**Recommended Improvements**
Actionable suggestions the owner can make to increase the property's appeal or rental value. Examples:
- "Adding blackout curtains to the bedroom could justify a 3–5% higher asking price."
- "A professional deep clean before listing photos would improve first impressions."

**Suggested Missing Photos**
Even after all required photos are uploaded, the AI may suggest additional photos that would strengthen the listing. Examples:
- Closet/storage space
- Balcony detail shot
- Night view from the unit
- Building lobby

### How the Leasing Agent Uses This

The Leasing Agent treats the generated knowledge as its primary reference when answering tenant inquiries. It combines structured data (fields) with generated content (descriptions, FAQs, highlights) to hold natural conversations about the property.

---

## 10. AI Quality Review

Before a property can be marked as **Ready to Lease**, the AI performs an automated quality review of all submitted data and media.

### Readiness Report

A summary document that includes:
- Overall readiness score with breakdown by category.
- Confirmation that all required fields are populated.
- Confirmation that all required media assets are uploaded.
- Flag if any data appears inconsistent (e.g. 0 bedrooms listed as "3 Bedroom" in description).

### Detected Issues

The AI scans for problems that could hurt the listing or cause tenant complaints:

| Issue Type          | Example                                                        |
|---------------------|----------------------------------------------------------------|
| Data inconsistency  | Size listed as 200 sqft for a 2-bedroom (likely an error)      |
| Pricing outlier     | Asking price is 40% above comparable units in the same building |
| Photo quality       | Dark or blurry photos detected                                 |
| Missing context     | No mention of parking in a building that offers it              |
| Incomplete terms    | No early termination clause (common tenant concern)            |

### Improvement Suggestions

Specific, actionable recommendations:
- "The kitchen photo is dark — consider retaking with natural light."
- "Adding the building's gym and pool to amenities would strengthen the listing."
- "The asking price is above the area median. Consider if the view and condition justify the premium, or adjust to attract more inquiries."

### Review Outcome

| Result   | Meaning                                                  |
|----------|----------------------------------------------------------|
| Pass     | No blocking issues. Property can proceed to Ready.       |
| Warning  | Non-blocking issues found. Owner can proceed or address. |
| Fail     | Blocking issues detected. Must be resolved first.        |

Blocking issues: missing required fields, suspected data errors (e.g. 0 sqft), zero photos in a required category.

---

## 11. Future Database Implications

The following tables are implied by this specification. They are documented here for planning purposes and will be created in a separate step.

```
projects
  - id, name, code, city, created_at

buildings
  - id, project_id, name, developer, total_floors, completion_year,
    amenities, parking, rules, created_at

properties
  - id, building_id, unit_number, floor, bedrooms, bathrooms,
    size_sqft, view_type, furnishing, condition, availability_date,
    unique_features, created_at, updated_at

rental_terms
  - id, property_id, asking_price, min_lease_term, payment_schedule,
    security_deposit, included_utilities, pet_policy,
    early_termination, rera_permit, ejari_registration, created_at

media_assets
  - id, property_id, asset_type, url, status, uploaded_at

onboarding_progress
  - id, property_id, category, total_fields, completed_fields,
    score, status, updated_at

ai_generated_content
  - id, property_id, content_type, content, generated_at, version
```

> **These tables will not be created until explicitly requested.** This section exists to ensure the onboarding design aligns with the future schema.

---

## 12. MVP Scope

What we build first:

- Single property onboarding for one apartment in 330 Tower, Dubai.
- Manual data entry across all four categories.
- Real-time missing information checklist.
- Readiness score with weighted calculation.
- AI Quality Review before marking a property as ready.
- AI Knowledge Generation for the completed property.
- All data stored in Supabase.

**One building. One project. One apartment. Full depth.**

---

## 13. Out of Scope for Now

| Feature                    | Reason                                          |
|----------------------------|--------------------------------------------------|
| Bulk property import       | MVP handles one property at a time               |
| Multi-owner support        | Single owner assumed for now                     |
| AI auto-fill from documents| Future: extract data from title deeds, contracts |
| Tenant-facing views        | Handled by the Leasing Agent module              |
| Payment integration        | No financial transactions in onboarding          |
| Contract generation        | Separate future module                           |
| RERA/Ejari enforcement     | Fields exist but are optional, no validation yet |
| Arabic language support    | English only for MVP                             |
| Multi-building onboarding  | One building at a time                           |
