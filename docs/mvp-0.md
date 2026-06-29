# MVP-0 — North Star

**Product:** Leasy AI
**Version:** MVP-0
**Date:** 2026-06-29
**Status:** Draft

---

## Mission

Leasy AI autonomously manages the rental workflow from property onboarding to a qualified viewing booking, with the owner only making the final business decision.

**One apartment. One building. One city. Full depth.**

| Field    | Value     |
|----------|-----------|
| Project  | 330-927   |
| Building | 330 Tower |
| City     | Dubai     |

Everything in this document serves the mission above. Everything that doesn't serve it is postponed.

---

## 1. Success Criteria

MVP-0 succeeds when all of the following are true:

1. **The Property Onboarding Agent** collected complete property information from the owner, generated a knowledge base, and passed quality review — without human intervention beyond the owner providing data.

2. **The Leasing Agent** received a tenant inquiry, held a natural conversation, answered property questions accurately from the knowledge base, qualified the tenant, and proposed viewing times — without human intervention.

3. **A viewing was booked** with a confirmed date, time, and qualified tenant — delivered to the owner as an actionable notification.

4. **The owner's only role** was providing property data during onboarding and making the final decision on the viewing.

What the product controls — onboarding, knowledge generation, tenant conversation, qualification, and scheduling — must work autonomously. What the product does not control — whether the tenant shows up, whether the lease is signed, whether the price is right — is not part of MVP-0 success.

---

## 2. Smallest Workflow That Proves the Product Works

```
Owner provides apartment data and photos
        ↓
Property Onboarding Agent collects, validates, and generates knowledge base
        ↓
AI Quality Review passes → property marked Ready to Lease
        ↓
Property is published (existing channel: Bayut, Dubizzle, or direct link)
        ↓
Tenant inquires (WhatsApp or web)
        ↓
Leasing Agent handles the conversation autonomously
        ↓
Leasing Agent qualifies the tenant
        ↓
Leasing Agent proposes viewing times and confirms one
        ↓
Owner receives notification: tenant details + confirmed viewing
```

Nine steps. Two agents. One human decision at the end.

---

## 3. Absolutely Required Features

Only what is needed to execute the workflow above.

### Property Onboarding

- Single apartment onboarding with manual data entry.
- Required fields: unit details, building info, rental terms, photos.
- Missing information checklist with real-time updates.
- Readiness score calculation.
- AI Quality Review (pass/warning/fail).

### Knowledge Base Generation

- Marketing description.
- FAQs (10–15 anticipated tenant questions with answers).
- Apartment highlights.
- Potential weaknesses (for the Leasing Agent to prepare responses).

### Leasing Agent — Tenant Conversation

- Receives tenant inquiry via WhatsApp or web chat.
- Greets the tenant and identifies the property of interest.
- Answers property questions using the knowledge base. Does not hallucinate.
- Handles common objections using the known weaknesses.

### Tenant Qualification

- Budget: Can the tenant afford the asking rent?
- Move-in date: Does it align with availability?
- Household size: Is it appropriate for the unit?
- Lease term: Does the tenant's preferred term match the owner's minimum?

Qualification is a filter, not a judgment. If the tenant meets the criteria, they qualify. The agent does not make subjective assessments.

### Viewing Scheduling

- Agent proposes available times (provided by the owner or set as defaults).
- Tenant confirms one.
- Agent sends confirmation to both tenant and owner.

### Owner Notification

- Owner receives a structured notification when a viewing is booked:
  - Tenant name.
  - Qualification summary (budget, move-in date, household size).
  - Confirmed viewing date and time.
  - Conversation summary.

---

## 4. Explicitly Postponed Features

| Feature | Reason |
|---------|--------|
| Multi-property onboarding | MVP-0 is one apartment. |
| Bulk import | No volume to justify it. |
| Contract generation | Happens after the viewing, outside MVP-0 scope. |
| Payment processing | No financial transactions in MVP-0. |
| Maintenance management | Post-lease concern. |
| Lease renewals | No leases exist yet. |
| Tenant portal | Tenants interact via WhatsApp or web chat only. |
| Mobile app | Web-based only for MVP-0. |
| Analytics dashboard | Metrics are tracked but a dashboard is not built. |
| Multi-language support | English only. |
| RERA/Ejari integration | Fields exist in the schema but are optional and not validated. |
| Automated follow-ups at scale | One tenant at a time is sufficient for MVP-0. |
| Owner onboarding UI | Owner provides data through a guided flow, not a polished portal. |
| Multi-channel publishing | Property is published manually to one or two channels. |
| Automated pricing suggestions | Owner sets the price. Agent does not suggest. |
| Viewing feedback collection | What happens at the viewing is outside scope. |

---

## 5. Information Required Before Publishing

The apartment cannot go live until every item below is present. This is the launch checklist.

### Apartment Data

- [ ] Unit number
- [ ] Floor
- [ ] Bedrooms
- [ ] Bathrooms
- [ ] Size (sqft)
- [ ] View type
- [ ] Furnishing status
- [ ] Current condition
- [ ] Availability date

### Building Data

- [ ] Building name
- [ ] Project code
- [ ] City
- [ ] Developer
- [ ] Total floors
- [ ] Completion year
- [ ] Amenities
- [ ] Parking

### Rental Terms

- [ ] Asking price (AED/year)
- [ ] Minimum lease term
- [ ] Payment schedule (cheques)
- [ ] Security deposit
- [ ] Pet policy

### Media

- [ ] Living room photo
- [ ] Bedroom photo(s)
- [ ] Bathroom photo(s)
- [ ] Kitchen photo
- [ ] View from unit
- [ ] Building exterior
- [ ] Floor plan

### Generated Content

- [ ] Marketing description
- [ ] FAQs
- [ ] Apartment highlights
- [ ] Potential weaknesses

### Quality Gate

- [ ] Readiness score = 100%
- [ ] AI Quality Review = Pass

If any required item is missing, the property does not publish.

---

## 6. First Inquiry to Viewing Booked

### Happy Path

| Step | Actor | Action |
|------|-------|--------|
| 1 | Tenant | Sends a message: "Hi, I'm interested in the apartment in 330 Tower." |
| 2 | Leasing Agent | Greets the tenant. Confirms the property. "Hi! Yes, I can help with the [X]-bedroom in 330 Tower. What would you like to know?" |
| 3 | Tenant | Asks questions: size, price, furnishing, view, amenities, parking. |
| 4 | Leasing Agent | Answers each question from the knowledge base. Never guesses. If the answer isn't in the knowledge base, it says so. |
| 5 | Leasing Agent | After answering questions, begins qualification: "To check if this is a good fit — what's your target budget, preferred move-in date, and how many people will be living in the apartment?" |
| 6 | Tenant | Provides qualification details. |
| 7 | Leasing Agent | Evaluates against criteria. If qualified: "Great, this looks like a good match. Would you like to schedule a viewing?" If not qualified: "Based on what you've shared, this apartment may not be the best fit because [reason]. Would you like me to explain the terms in more detail?" |
| 8 | Leasing Agent | Proposes available viewing times. "I have availability on [date] at [time] or [date] at [time]. Which works better for you?" |
| 9 | Tenant | Confirms a time. |
| 10 | Leasing Agent | Confirms with the tenant. Sends the owner a notification with tenant details and the confirmed time. |

### Edge Cases

| Scenario | Agent Behavior |
|----------|----------------|
| **Tenant not qualified (budget too low).** | Agent is honest but respectful: "The asking rent is [X] AED/year. Based on your budget, this might be a stretch. Would you still like to learn more, or would you prefer I keep your details for future options?" Does not book a viewing for unqualified tenants. |
| **Tenant stops responding.** | Agent sends one follow-up after 24 hours. If no response after 48 hours, the conversation is marked as inactive. No further follow-up in MVP-0. |
| **Tenant asks something the agent can't answer.** | Agent acknowledges the gap: "I don't have that specific detail right now. Let me check with the property owner and get back to you." Flags the question to the Onboarding Agent's feedback loop. |
| **Tenant asks about a different property.** | "I'm currently helping with apartments in 330 Tower. I don't have information about other properties yet, but I'd be happy to assist with this one." |
| **Tenant asks to negotiate price.** | "The asking price is set by the owner. I can pass along your offer if you'd like — what number did you have in mind?" Agent forwards to the owner. Does not negotiate. |
| **Multiple tenants inquire simultaneously.** | Each conversation is independent. The agent handles them in parallel without cross-referencing tenant data. Viewing times are first-come, first-served. |

---

## 7. Biggest Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Leasing Agent hallucates property details.** | Critical | The agent answers only from the knowledge base. If the answer isn't there, it says "I don't know" and flags the gap. No improvisation. |
| **Owner doesn't complete onboarding.** | High | The Onboarding Agent follows up. But if the owner disengages, the apartment simply doesn't publish. MVP-0 has one owner who is motivated — this risk is manageable. |
| **Tenants don't trust an AI conversation.** | High | The agent discloses it is AI-assisted. The conversation must feel natural and competent, not robotic. If the tenant asks for a human, the agent escalates immediately. |
| **WhatsApp integration is unreliable.** | Medium | Build a web chat fallback. WhatsApp is preferred for Dubai market but not the only channel. |
| **Knowledge base doesn't cover real tenant questions.** | Medium | The feedback loop captures uncovered questions. After the first few conversations, the knowledge base improves. MVP-0 accepts this gap and measures it. |
| **Viewing scheduling conflicts.** | Low | MVP-0 handles one apartment with limited viewing slots. Conflicts are unlikely. If they occur, the agent proposes alternative times. |
| **Owner is unresponsive when agent needs clarification.** | Medium | The system cannot force owner response. Agent waits, follows up once, and logs the delay. The property stays in its current state until the owner responds. |

---

## 8. Assumptions That Must Be Validated

| Assumption | Why We Believe It | How to Validate |
|------------|-------------------|-----------------|
| **Tenants in Dubai will engage with an AI agent for rental inquiries.** | WhatsApp is the dominant communication channel in Dubai real estate. Tenants are accustomed to chatting with agents. | Run the first 10 conversations and measure engagement rate (responses after the first message). |
| **One apartment's worth of data is enough to hold meaningful conversations.** | The knowledge base covers the most common tenant questions. | Track "I don't know" responses. If they exceed 20% of questions, the knowledge base is insufficient. |
| **The owner will complete onboarding within 48 hours.** | The owner (Sharon) is motivated and has the data ready. | Measure actual time from first input to Ready to Lease. |
| **WhatsApp is the right channel for first contact.** | Industry standard in Dubai. Tenants expect to message on WhatsApp after seeing a listing. | Offer both WhatsApp and web chat. Compare response rates. |
| **Budget, move-in date, and household size are sufficient qualification criteria.** | These are the three questions every human agent asks first in Dubai. | After 10 conversations, check if qualified tenants actually show up to viewings and if any unqualified tenants slipped through. |
| **The Leasing Agent can handle a full conversation without human intervention.** | The knowledge base plus qualification logic covers the standard inquiry flow. | Measure how many conversations require escalation. Target: fewer than 1 in 5. |

---

## 9. Metrics That Define Success

These are proof-of-concept metrics, not product analytics. They answer one question: did the system work?

### Autonomy Metrics

| Metric | What It Proves | Target |
|--------|---------------|--------|
| Onboarding completed without developer intervention | The Onboarding Agent works end-to-end. | Yes/No — must be Yes. |
| Knowledge base generated automatically | Content generation works. | Yes/No — must be Yes. |
| Tenant conversations handled without human takeover | The Leasing Agent is autonomous. | > 80% of conversations. |
| Viewings booked without human coordination | Scheduling works. | At least 1 viewing booked autonomously. |

### Quality Metrics

| Metric | What It Proves | Target |
|--------|---------------|--------|
| Knowledge base accuracy | The agent doesn't hallucinate. | 0 factual errors in tenant conversations. |
| Question coverage rate | The knowledge base is sufficient. | > 80% of tenant questions answered from the knowledge base. |
| Qualification accuracy | The filter works correctly. | No unqualified tenants booked for viewings. |
| Owner notification completeness | The owner gets what they need to act. | Every notification includes: tenant name, qualification summary, confirmed time. |

### Engagement Metrics

| Metric | What It Proves | Target |
|--------|---------------|--------|
| Tenant response rate | Tenants engage with the AI. | > 60% of tenants respond after the first agent message. |
| Conversation completion rate | Tenants stay through qualification. | > 50% of engaged tenants complete the qualification step. |
| Viewing conversion rate | Qualified tenants book viewings. | > 40% of qualified tenants book a viewing. |
| Time from inquiry to viewing booked | The process is fast enough. | < 24 hours. |

### System Metrics

| Metric | What It Proves | Target |
|--------|---------------|--------|
| Onboarding time | The process is practical for owners. | < 48 hours from first input to Ready. |
| Readiness score at publish | The property is truly ready. | 100%. |
| Post-handoff gaps | The Onboarding → Leasing handoff is clean. | 0 blocking gaps discovered during tenant conversations. |

---

## 10. Definition of Done

MVP-0 is complete when every item below is true.

### Onboarding

- [ ] One apartment in 330 Tower is onboarded with all required data.
- [ ] The Property Onboarding Agent collected and validated the data without developer intervention.
- [ ] The AI Quality Review passed.
- [ ] The knowledge base was generated: description, FAQs, highlights, weaknesses.
- [ ] The readiness score is 100%.

### Leasing

- [ ] The Leasing Agent received at least one real tenant inquiry.
- [ ] The agent held a complete conversation: greeting, property questions, qualification, viewing proposal.
- [ ] The agent answered all property questions from the knowledge base with zero factual errors.
- [ ] The agent correctly qualified or disqualified the tenant based on defined criteria.
- [ ] No human intervention was required during the conversation.

### Viewing

- [ ] At least one viewing was booked through the system.
- [ ] The tenant received a confirmation with date, time, and property address.
- [ ] The owner received a notification with tenant details, qualification summary, and confirmed viewing time.

### Autonomy

- [ ] The owner's only actions were: providing property data during onboarding and acknowledging the viewing notification.
- [ ] All other steps — validation, content generation, quality review, tenant conversation, qualification, and scheduling — were handled by the system.

### Boundary

MVP-0 ends at the viewing booking. What happens at the viewing, whether a lease is signed, and all post-viewing activity is outside scope.

---

## North Star Reminder

This is not a property management platform.

This is not a CRM.

This is a system of digital employees that manages the rental workflow autonomously, with the owner making only the final business decisions.

MVP-0 proves that this system can take one apartment from raw data to a qualified viewing — without a human agent in between.

Everything we build serves this proof.
