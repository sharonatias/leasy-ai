# Property Onboarding Journey — UX Design

**Product:** Leasy AI
**Module:** Property Onboarding Agent
**Scope:** MVP-0
**Date:** 2026-06-29
**Status:** Draft
**Role:** Product Design & UX Architecture

---

## Design Principles

- Leasy should feel like hiring a professional leasing assistant, not filling out a CRM.
- The AI does as much work as possible. The owner does as little as possible.
- Never ask unnecessary questions.
- Ask the easiest questions first.
- Build trust before asking for detailed information.
- Every step must create a feeling of progress.
- If the AI can infer something, don't ask for it.
- If information can be collected later, postpone it.
- The owner should always understand why each question is being asked.

---

## Journey Overview

| Step | Name | Fields | Est. Time |
|------|------|--------|-----------|
| 0 | Welcome | 0 | 15 sec |
| 1 | Property Identity | 1–2 | 30 sec |
| 2 | Unit Basics | 4 | 45 sec |
| 3 | Unit Character | 4–5 | 45 sec |
| 4 | Building Details | 6–7 | 1.5 min |
| 5 | Rental Terms | 5–6 | 2 min |
| 6 | Photos & Floor Plan | 7+ uploads | 3–5 min |
| 7 | AI Review & Knowledge Generation | 0 | 30 sec (AI works) |

**Total: 8 screens. Estimated completion: 10–15 minutes.**

---

## Step 0 — Welcome

### Step Goal

Set expectations. Build confidence. Remove anxiety about what's ahead.

### Information Collected

None.

### Why This Step Exists

An owner arriving for the first time doesn't know how long this will take, what they'll need, or whether they can pause. Uncertainty causes abandonment. This step removes all three concerns in 15 seconds.

### What the AI Says

> "Welcome to Leasy AI. I'm going to help you prepare your property for leasing.
>
> Here's how it works:
> - I'll guide you through 7 short steps.
> - The whole process takes about 10–15 minutes.
> - You can stop at any time and continue later — nothing is lost.
> - At the end, I'll generate a complete property profile and a professional listing for you.
>
> Ready? Let's start with your property."

### What the Owner Sees

- Leasy AI logo and title.
- The AI's welcome message.
- A "Get Started" button.
- A small note: "You can stop and continue anytime."

### What the Owner Does

Reads the welcome. Clicks "Get Started."

### Validation Rules

None.

### Completion Criteria

Owner clicks "Get Started."

### What Happens Next

Proceed to Step 1.

---

## Step 1 — Property Identity

### Step Goal

Identify which property the owner is onboarding. Use existing data whenever possible. Create as little as necessary.

### Information Collected

| Field | Type | Source |
|-------|------|--------|
| Building | selection or text | Search existing buildings first |
| Unit number | string | Owner input |

### Why This Information Is Collected at This Moment

The owner came here to onboard their apartment. The very first thing they expect to do is tell the system *which* apartment. This is the lowest-effort, highest-clarity starting point.

By searching existing buildings first, the AI demonstrates competence — "I already know about your building" — and saves the owner from typing data that another owner in the same building may have already provided.

### What the AI Says

> "Which building is your property in?"

The AI presents a search field. As the owner types, the system searches existing buildings across all projects.

**If a match is found:**

> "I found 330 Tower in project 330-927, Dubai. Is this your building?"

The owner confirms. Building data is pre-filled. The AI skips to asking for the unit number.

**If no match is found:**

> "I don't have that building in the system yet. No problem — I'll set it up for you. What's the building name?"

The owner types the building name. The AI creates a new building record (details collected in Step 4).

**After building is confirmed:**

> "What's your unit number?"

### What the Owner Sees

- A search field with placeholder text: "Start typing your building name..."
- Search results appearing as the owner types.
- If matched: building card showing name, project, city with a "Yes, this is my building" button.
- If not matched: text input for the building name.
- After building: a simple text field for unit number.

### What the Owner Does

1. Types building name (or part of it).
2. Selects from results or enters a new building name.
3. Types their unit number.

### Validation Rules

- Building: must be selected from search or a new name provided (min 2 characters).
- Unit number: required, max 20 characters.
- Unit number must be unique within the selected building. If a duplicate is found: "Unit [X] already exists in [building]. Did you mean a different unit?"

### Completion Criteria

Building is identified (existing or new) and unit number is entered.

### AI Encouragement

> "Your property is created. 330 Tower, Unit 1204. Let's make it shine — next I'll ask a few quick details about the apartment itself."

### What Happens Next

System creates the property record in `draft` status. Onboarding progress record is initialized. Proceed to Step 2.

---

## Step 2 — Unit Basics

### Step Goal

Collect the core numeric facts about the apartment. Fast, no thinking required.

### Information Collected

| Field | Type | Why Now |
|-------|------|---------|
| Bedrooms | number (select) | Defines the property category. Tenants filter by this first. |
| Bathrooms | number (select) | Standard listing requirement. Always asked alongside bedrooms. |
| Floor | number | Simple fact the owner knows instantly. |
| Size (sqft) | number | Core metric for pricing and comparison. |

### Why This Information Is Collected at This Moment

These are pure numbers. No decisions, no opinions, no effort. The owner can answer all four in under 30 seconds. Quick wins build momentum and make the owner feel like onboarding is easy.

### What the AI Says

> "Let's start with the basics. These are quick — just four numbers."

### What the Owner Sees

- Bedrooms: selector with options (Studio, 1, 2, 3, 4, 5+).
- Bathrooms: selector with options (1, 2, 3, 4, 5+).
- Floor: number input with a note "0 = ground floor."
- Size: number input with "sqft" label.
- All four fields visible at once — no scrolling needed.

### What the Owner Does

Selects bedrooms and bathrooms. Types floor number and size.

### Validation Rules

- Bedrooms: required, ≥ 0 (0 = studio).
- Bathrooms: required, ≥ 1.
- Floor: required, ≥ 0. If building was selected from existing data and floor > total_floors, show a warning: "330 Tower has [X] floors. Please double-check."
- Size: required, > 0. If size < 300 sqft for 1+ bedrooms, show a gentle prompt: "That seems small for a [X]-bedroom — is that correct?"

### Completion Criteria

All four fields filled and valid.

### AI Encouragement

> "Got it — a [X]-bedroom on floor [Y]. That's the foundation set. Now let's capture what makes your apartment unique."

### What Happens Next

Update property record. Recalculate readiness score. Proceed to Step 3.

---

## Step 3 — Unit Character

### Step Goal

Capture what makes this apartment distinct. These are the fields that differentiate it from other units in the same building.

### Information Collected

| Field | Type | Why Now |
|-------|------|---------|
| View type | enum select | Key selling point. Tenants in Dubai filter by view. |
| Furnishing | enum select | Determines the tenant pool and pricing bracket. |
| Condition | enum select | Sets expectations and affects photo requirements. |
| Availability date | date picker | Determines when the property can be listed and shown. |
| Unique features | text (optional) | Free-text for anything special — balcony, upgraded kitchen, smart home, etc. |

### Why This Information Is Collected at This Moment

Step 2 gave us the facts. Step 3 gives us the story. These fields are what the AI will use to write the marketing description and identify selling points. They require a moment of thought ("What's the view? What condition is it in?") but are still straightforward choices, not business decisions.

Unique features is optional and placed last — the owner can skip it and come back, or type a quick note. No pressure.

### What the AI Says

> "Now the interesting part — what makes your apartment stand out?"

For the availability date:

> "When can a tenant move in? If you're not sure, choose your best estimate — you can always update it later."

### What the Owner Sees

- View type: visual selector with options (Sea, City, Garden, Pool, Community, Other).
- Furnishing: three clear options (Furnished, Semi-Furnished, Unfurnished).
- Condition: four options (New, Excellent, Good, Needs Maintenance).
- Availability date: date picker, defaulting to today.
- Unique features: text area with placeholder "Anything special? Balcony, upgraded kitchen, smart home features..." and a note "(Optional — you can add this later)."

### What the Owner Does

Selects view, furnishing, and condition. Picks or confirms availability date. Optionally types unique features.

### Validation Rules

- View type: required.
- Furnishing: required.
- Condition: required.
- Availability date: required, must be today or later.
- Unique features: optional, max 1000 characters.

### Completion Criteria

View, furnishing, condition, and availability date are set.

### AI Encouragement

> "Nice — a [furnished/unfurnished] [X]-bedroom with a [view] view. I'm already starting to see the listing come together. Next, let me learn about the building."

### What Happens Next

Update property record. Recalculate readiness score (should now show visible progress). Proceed to Step 4.

---

## Step 4 — Building Details

### Step Goal

Collect building-level data. If the building was selected from existing data in Step 1, this step is partially or fully pre-filled — the AI shows what it knows and asks the owner to confirm or complete.

### Information Collected

| Field | Type | Why Now |
|-------|------|---------|
| Developer | text | Adds credibility to the listing. Tenants in Dubai care about the developer. |
| Total floors | number | Validates the unit's floor. Gives tenants building context. |
| Completion year | number | Tenants want to know if the building is new or established. |
| Amenities | multi-select + text | Key selling points. Pool, gym, concierge, etc. |
| Parking | enum select | One of the top 5 questions tenants ask. |
| Building rules | text (optional) | Pet restrictions, move-in hours. Important but not urgent. |

### Why This Information Is Collected at This Moment

Building details are "background" information — important but not what the owner came here to do. By step 4, the owner has already invested 2–3 minutes and can see their apartment taking shape. They're willing to spend a moment on building context.

For existing buildings, the AI pre-fills everything it already knows and only asks for what's missing. The owner might click through this step in 10 seconds if the building is fully populated.

### What the AI Says

**If building data exists (selected from search in Step 1):**

> "I already have some information about 330 Tower. Let me show you what I know — just confirm it's correct or update anything that's changed."

The AI displays pre-filled fields. The owner reviews and confirms.

**If building is new (created in Step 1):**

> "Since this is a new building in the system, I need a few details. These are shared across all units in the building — so you only need to enter this once."

### What the Owner Sees

- Developer: text input.
- Total floors: number input.
- Completion year: number input (or year picker).
- Amenities: checkbox grid with common options (Pool, Gym, Concierge, Kids Area, Playground, BBQ Area, Sauna, Covered Parking, Security, Doorman) plus a text field for "Other amenities."
- Parking: three options (Included, Available for Purchase, None).
- Building rules: text area with placeholder "Pet restrictions, quiet hours, move-in procedures..." and "(Optional)."

For existing buildings: all known fields are pre-filled with a "Confirm" or "Edit" option.

### What the Owner Does

Fills in or confirms building details. Selects amenities from the grid. Chooses parking. Optionally adds building rules.

### Validation Rules

- Developer: required, max 200 characters.
- Total floors: required, > 0. If property floor > total floors: "You said the unit is on floor [X], but the building has [Y] floors. Which is correct?"
- Completion year: required, ≥ 1900.
- Amenities: required, at least one selection.
- Parking: required.
- Building rules: optional, max 2000 characters.

### Completion Criteria

Developer, total floors, completion year, amenities, and parking are filled.

### AI Encouragement

> "Building profile complete. Here's what I see so far: [X]-bedroom in [building], floor [Y], [view] view, [amenities count] amenities. The Leasing Agent is going to have a lot to work with. Now let's set up the rental terms."

### What Happens Next

Update building record. Recalculate readiness score. Proceed to Step 5.

---

## Step 5 — Rental Terms

### Step Goal

Capture the owner's business decisions — pricing, lease terms, and policies. This is where the owner needs to think, so the AI provides context to help.

### Information Collected

| Field | Type | Why Now |
|-------|------|---------|
| Asking price (AED/year) | number | The central business decision. |
| Minimum lease term | enum select | Defines the tenant pool. |
| Payment schedule (cheques) | enum select | Dubai-specific. Tenants filter by this. |
| Security deposit | number | Standard requirement. |
| Pet policy | enum select | Top 5 tenant question. |
| Early termination | text (optional) | Important but can be added later. |

### Why This Information Is Collected at This Moment

Rental terms require the most thought. The owner needs to decide on pricing, which may involve checking comparable listings, consulting partners, or thinking about their financial goals. By placing this at step 5, the owner has already completed the "easy" part and is committed.

The AI helps by providing context rather than leaving the owner to decide in a vacuum.

### What the AI Says

> "Now the business side. I'll need your rental terms — this is what tenants will see when they inquire."

For pricing:

> "What's your asking price? This is the annual rent in AED."

For payment schedule:

> "How many cheques will you accept? In Dubai, fewer cheques typically attracts more tenants but requires higher upfront payments."

For pet policy:

> "Some tenants will ask about pets right away — what's your policy?"

### What the Owner Sees

- Asking price: number input with "AED/year" label.
- Minimum lease term: three options (6 Months, 1 Year, 2 Years).
- Payment schedule: five options displayed as cards (1 Cheque, 2, 4, 6, 12 Cheques) with a subtle note explaining what each means.
- Security deposit: number input with "AED" label and a helper note "Typically 5% of annual rent."
- Pet policy: three options (Allowed, Not Allowed, Case by Case).
- Early termination: text area with placeholder "e.g., 2 months notice, 1 month penalty..." and "(Optional — you can add this later)."

### What the Owner Does

Enters pricing. Selects lease term, cheques, and pet policy. Enters deposit amount. Optionally describes early termination terms.

### Validation Rules

- Asking price: required, > 0. If the value seems unusually low or high, the AI notes it but does not block: "Just confirming — [X] AED/year for a [Y]-bedroom in [building]. Is that correct?"
- Minimum lease term: required.
- Payment schedule: required.
- Security deposit: required, ≥ 0.
- Pet policy: required.
- Early termination: optional, max 1000 characters.

### Completion Criteria

Asking price, minimum lease term, payment schedule, security deposit, and pet policy are set.

### AI Encouragement

> "Rental terms are set. Your property is almost ready — just photos left, and then I'll generate your complete property profile."

The readiness score should now be visibly high (around 70%) — reinforcing that the finish line is close.

### What Happens Next

Create or update rental terms record. Recalculate readiness score. Proceed to Step 6.

---

## Step 6 — Photos & Floor Plan

### Step Goal

Collect all required visual assets. The AI tells the owner exactly what's needed and why each photo matters.

### Information Collected

| Asset | Required | Why |
|-------|----------|-----|
| Living room | Yes | Hero image — the first thing tenants see. |
| Bedroom(s) | Yes (1 per bedroom) | Tenants want to see where they'll sleep. |
| Bathroom(s) | Yes (at least 1) | Cleanliness and condition signal. |
| Kitchen | Yes | One of the top 3 things tenants check. |
| View from unit | Yes | The owner said it's a [view] view — this photo proves it. |
| Building exterior | Yes | Establishes the building's look and neighborhood. |
| Floor plan | Yes | Tenants use this to understand layout and dimensions. |

### Why This Information Is Collected at This Moment

Photos are the highest-effort step. The owner may need to walk around the apartment, take new photos, or search through their gallery. By placing this second-to-last, the owner can see that the readiness score is already at ~70% — they're motivated to finish. They also know exactly what the apartment profile looks like (from steps 2–5), so the photos feel like the final piece.

### What the AI Says

> "Last step before I generate your property profile — photos. I need 7 photos that will make tenants want to visit."

The AI lists each required photo with a specific note:

> "**Living room** — This will be the hero image in your listing. Make sure it's well-lit and shows the full room."
>
> "**View from unit** — You mentioned a [view] view. This photo is your strongest selling point."
>
> "**Kitchen** — Tenants want to see appliances and counter space. Daytime light works best."

After the required photos:

> "Want to add more? A photo of the closet, balcony, or building lobby can strengthen the listing. (Optional)"

### What the Owner Sees

- A visual checklist of required photos, each with:
  - Photo type label and icon.
  - A brief note on what makes a good version of this photo.
  - Upload area (drag & drop or click to select).
  - Status indicator: empty / uploaded / needs update.
- The number of bedroom photo slots matches the bedroom count from Step 2 (e.g., 2-bedroom shows 2 bedroom upload slots).
- An "Add more photos" section at the bottom for optional extras.
- A running count: "5 of 7 required photos uploaded."

### What the Owner Does

Uploads photos one by one or in batch. Can drag and drop. Can reorder within each type. Can replace a photo by uploading a new one.

### Validation Rules

- Each required type must have at least one uploaded photo.
- Bedroom photos: count must match bedroom count (a 2-bedroom needs ≥ 2 bedroom photos).
- File type: JPEG, PNG, or WebP.
- File size: max 10 MB per file.
- The AI does not assess photo quality in real time during upload — quality review happens in Step 7.

### Completion Criteria

All 7 required photo types have at least one upload. Bedroom photo count matches bedroom count.

### AI Encouragement

> "All photos uploaded. Your property is 100% complete. Now comes the best part — I'm going to build your property's knowledge base and generate a professional listing. This takes about 30 seconds."

### What Happens Next

Update media asset records. Readiness score reaches 100%. Proceed to Step 7.

---

## Step 7 — AI Review & Knowledge Generation

### Step Goal

The AI takes over. It reviews everything, generates the property knowledge base, and presents the results to the owner. This is the payoff moment.

### Information Collected

None. The owner watches the AI work.

### Why This Step Exists

This is where the owner first experiences the core value of Leasy AI. They've spent 10–15 minutes entering data and uploading photos. Now they see what the AI does with it — a professional listing description, answers to questions they hadn't thought of, insights about their property's strengths and weaknesses, and specific suggestions for improvement.

This moment converts a skeptical owner into a believer.

### What the AI Says

The AI works in two phases:

**Phase 1 — Quality Review (5–10 seconds)**

> "Reviewing your property data..."

The AI checks for:
- Data inconsistencies (size vs. bedroom count, floor vs. building floors).
- Photo quality issues (if detectable: dark, blurry, missing context).
- Pricing outliers (if market data is available).
- Missing optional information that would strengthen the listing.

**If issues are found:**

> "I found [X] things worth reviewing before we publish."

Each issue is presented as a card:
- What the issue is.
- Why it matters.
- Suggested fix.
- "Fix Now" or "Dismiss" buttons.

**If no issues:**

> "Everything looks great. No issues detected."

**Phase 2 — Knowledge Generation (15–20 seconds)**

> "Generating your property profile..."

A progress indicator shows the AI generating each piece:

1. Marketing description
2. FAQs (10–15 questions with answers)
3. Apartment highlights
4. Potential weaknesses
5. Recommended improvements
6. Suggested additional photos

### What the Owner Sees

**Review section:**
- Review outcome: Pass / Warning / Fail with clear explanation.
- Issue cards (if any) with fix/dismiss options.

**Generated content section:**
Each piece of generated content is displayed in a clean, readable card:

- **Marketing Description** — The full listing text. The owner reads what tenants will see.
- **FAQs** — Scrollable list of anticipated tenant questions with AI-generated answers. The owner can see exactly how the Leasing Agent will respond.
- **Highlights** — Ranked list of the property's strongest selling points.
- **Weaknesses** — Honest assessment with a note: "The Leasing Agent will use these to prepare thoughtful responses — not to scare tenants away."
- **Improvements** — Actionable suggestions: "Adding blackout curtains could justify a 3–5% higher asking price."
- **Suggested Photos** — Additional photos that would strengthen the listing, beyond the required set.

**At the bottom:**
- Readiness score: 100%.
- A "Publish Property" button (requires owner confirmation).
- A "Review Later" option.

### What the Owner Does

1. Reviews the AI quality check results. Fixes or dismisses any issues.
2. Reads the generated marketing description.
3. Scrolls through the FAQs — this is often the "wow" moment.
4. Reviews highlights and weaknesses.
5. Decides whether to publish now or review later.

### Validation Rules

- If the quality review returns "Fail" (blocking issues), the "Publish" button is disabled until blocking issues are resolved.
- If "Warning," the owner can proceed but sees a confirmation: "There are [X] warnings. Publish anyway?"
- If "Pass," no friction.

### Completion Criteria

- AI Quality Review completed.
- All generated content produced.
- Owner has reviewed the results (scrolled through or spent at least 10 seconds on the page).

### AI Encouragement

**If publishing:**

> "Your property is live. The Leasing Agent now has everything it needs to represent 330 Tower, Unit 1204. When a tenant inquires, I'll handle the conversation, qualify them, and book a viewing — you'll get a notification with all the details. Welcome to Leasy."

**If reviewing later:**

> "No rush. Your property profile is saved and ready whenever you are. You can come back anytime to review, edit, or publish."

### What Happens Next

- If published: property status changes from `ready_to_lease` to `listed`. The Leasing Agent can now represent this property. The owner returns to the dashboard.
- If deferred: property stays at `ready_to_lease`. The owner can return and publish at any time.

---

## Journey Summary

### Total Steps

8 screens (Step 0–7). 7 steps collect data. 1 step (Step 7) is AI-generated output.

### Estimated Completion Time

10–15 minutes for a first-time owner with photos ready. 5–8 minutes if the building already exists in the system.

### Where the Readiness Score First Appears

After Step 2 (Unit Basics). The score is visible from this point forward, updating after every step. Approximate progression:

| After Step | Score |
|------------|-------|
| 1 | ~5% (identity only) |
| 2 | ~20% (apartment basics) |
| 3 | ~30% (apartment complete) |
| 4 | ~45% (building complete) |
| 5 | ~70% (terms complete) |
| 6 | 100% (photos complete) |
| 7 | 100% + AI review |

### Where AI Starts Generating Property Knowledge

Step 7. All content is generated after the owner completes data entry and photo uploads. This is intentional — generating partial content creates confusion and rework. The owner should see the final product, not drafts.

### Where the Owner First Experiences Value

**Step 7, Phase 2.** When the AI produces the marketing description and FAQs. The owner sees, for the first time, how the Leasing Agent will talk about their property. This is the moment the product proves its worth.

A smaller value moment occurs in Step 4 if the building was pre-filled from existing data — the owner realizes "the system already knows about my building."

### Biggest UX Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Photo upload abandonment.** Step 6 is the highest effort step. The owner may not have photos ready. | High — no photos means no listing. | Allow the owner to skip photos and return later. Show the readiness score without photos (~70%) so they see progress. Send a reminder. |
| **Pricing uncertainty.** The owner may not know what to charge at Step 5. | Medium — they'll enter a placeholder or abandon. | Provide market context if available. Add a note: "You can always adjust the price later." Never block on pricing. |
| **Overwhelm at Step 4 (Building Details).** If the building is new, 6–7 fields at once. | Medium — feels like a wall. | Pre-fill from search whenever possible. Group amenities as checkboxes (faster than typing). Mark building rules as optional. |
| **Value too late.** The owner doesn't see AI output until Step 7 — they've already invested 10 minutes. | Medium — if they abandon at Step 5, they never see the value. | The AI encouragement messages after each step preview what's coming: "I'll generate your listing at the end." The climbing readiness score provides intermediate gratification. |
| **Returning users can't find where they stopped.** | Low — but frustrating. | The dashboard shows the property with its current step and readiness score. One click resumes. |

### Opportunities to Delight the Owner

1. **Pre-filled building data (Step 1/4).** When the AI says "I already know about 330 Tower" and shows pre-filled data, the owner feels the system is smart and working for them.

2. **The AI encouragement messages.** After each step, a specific, personalized message that references what the owner just entered: "A 2-bedroom on floor 12 with a sea view — that's a strong listing." This is not generic praise — it reflects their data.

3. **The FAQ moment (Step 7).** When the owner reads "Is parking included? — Yes, 330 Tower includes one parking space per unit," they realize the AI understood their data and can answer real tenant questions. This is the highest-delight moment in the entire journey.

4. **The weaknesses section (Step 7).** Most systems only highlight strengths. When the AI says "The apartment is unfurnished in a market that prefers furnished — but the Leasing Agent will position this as flexibility for the tenant to personalize," the owner feels the AI is genuinely strategic, not just flattering.

5. **Smart photo guidance (Step 6).** "You mentioned a sea view — that photo will be your strongest selling point." The AI connects their data to specific photo advice. It's not a generic upload form.

### Opportunities for the AI to Reduce Owner Effort

1. **Building lookup (Step 1).** If the building exists, the owner skips most of Step 4. For the second unit in the same building, Step 4 is one click: "Confirm."

2. **Floor inference.** If the unit number starts with the floor (e.g., "1204" → floor 12), the AI can pre-fill the floor field: "Is this on floor 12?" One click vs. typing.

3. **Deposit suggestion.** When the owner enters the asking price, the AI can pre-fill the deposit at 5%: "The standard deposit is [X] AED (5% of annual rent). Change if needed." Saves a calculation.

4. **Photo count from bedroom count.** The AI automatically shows the right number of bedroom upload slots. The owner doesn't have to think about how many bedroom photos they need.

5. **Amenity suggestions from building data.** If the AI has data about the developer or building type, it can pre-check common amenities: "Buildings by [developer] typically have Pool, Gym, and Concierge. Correct?"

6. **Availability date default.** Default to today. Most owners listing a property want it available now. One less field to think about.

### Points Where the Owner May Abandon — and How to Prevent It

| Abandonment Point | Why | Prevention |
|-------------------|-----|------------|
| **Step 0 (Welcome)** | "This looks like work." | Emphasize it takes 10 minutes. Show that the AI does the heavy lifting. Make the CTA inviting, not intimidating. |
| **Step 4 (Building Details)** | "I don't know all this." | Make it clear which fields are required vs. optional. Pre-fill from existing data. Allow "I'll add this later" for non-critical fields. |
| **Step 5 (Rental Terms)** | "I haven't decided on pricing yet." | Allow saving without a price. Show the listing can be completed later. Note: "You can always adjust before publishing." |
| **Step 6 (Photos)** | "I don't have photos right now." | Allow skipping the entire step. Save progress at ~70%. Send a reminder: "Your property is almost ready — just photos left." Let the owner upload from mobile later. |
| **Between any two steps** | Life interrupts. Phone call, meeting, distraction. | Every step auto-saves. The dashboard shows exactly where they stopped. One click resumes. No data is ever lost. |
