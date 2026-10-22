# Trip Replanner

**Project Vision & Software Development Plan (Small Project) — PA#1**  
**Version:** 2.0 · **Date:** 22 October 2026 · **Status:** Proposed; team review pending  
**Team:** Nguyễn Hoàng Đăng (23127166), Tô Minh Thắng (23127260), Lê Minh Đức (23127351)  
**Repository:** https://github.com/danzgne/trip-replanner

| Revision date | Version | Description                                                                                                                          | Prepared by                                                |
| ------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| 22 Oct 2026   | 2.0     | Restructured the existing proposal using the Proposal/Vision/Planning templates; aligned with PA#1 and reconciled evaluation counts. | AI-assisted revision of the team's draft; approval pending |

## PART I — Proposal

### 1. Introduction: purpose and scope

This document defines the users, value proposition, principal LLM feature, and semester boundaries of **Trip Replanner**, then assigns delivery responsibilities. It is a PA#1 proposal and plan, **not** the formal feature specification (reserved for a later milestone).

### 2. Positioning

**Business opportunity and real situation.** In August 2023, Đăng's family travelled from Ho Chi Minh City to Đà Lạt with a rented car and booked homestay. Heavy rain cancelled their planned strawberry-farm visit. Unable to find a suitable alternative, they stayed in and later went only to the market. Travellers currently search Google Maps and Facebook groups, verify venues individually, or abandon the day's activities.

**Problem statement**

| Vision element                  | Statement                                                                                                                                          |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The problem of**              | Rebuilding the _remaining day_ when rain disrupts outdoor stops, while respecting non-movable reservations.                                        |
| **Affects**                     | Families or small groups visiting Đà Lạt in the rainy season, particularly travellers with booked transport, accommodation, or prepaid activities. |
| **Impact**                      | Lost holiday time, unnecessary travel to closed venues, or missed fixed bookings with financial consequences.                                      |
| **A successful solution would** | Propose useful indoor stops that are open and reachable, preserve fixed bookings, and make every change reviewable before it is applied.           |

**Product position statement.** For Đà Lạt travellers whose day is disrupted by rain, **Trip Replanner** is a Vietnamese, mobile-friendly _same-day replanning assistant_. Unlike manually searching for alternatives or receiving an unverified chat itinerary, it combines natural-language preferences with an explicit, code-validated trip state. It does **not** attempt to replace a full-trip planner such as Mindtrip or Layla.

### 3. Stakeholder and user descriptions

| Stakeholder / user                 | Environment and key need                                                                      | Proposed response                                                                                                         |
| ---------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Primary: traveller**             | On a phone, during a rainy afternoon; has a car, limited time, and bookings that cannot move. | Enter today's remaining stops/bookings and describe changes in Vietnamese; inspect and accept/edit/reject a proposed day. |
| **Project team / course reviewer** | Must demonstrate a testable LLM feature within the semester.                                  | Reproducible scenarios, validator results, human usefulness ratings, and a six-checkpoint delivery record.                |

### 4. Product overview, features, and quality

**Product perspective.** The structured day plan and bookings are the source of truth; chat expresses the traveller's intent, not an independent itinerary. The MVP relies on a team-checked Đà Lạt place catalog and driving-time estimates. Assumptions include internet availability, sufficiently accurate venue hours, and access to the selected APIs.

**Core LLM feature — re-plan today's remaining activities around fixed bookings:**

`Vietnamese request → extracted preferences/constraints → candidate indoor places → driving times → LLM-generated proposal → deterministic validation → change diff → traveller decision`

The agent interprets vague needs (e.g., “we're tired” or “somewhere warm to eat”), selects worthwhile stops, and explains trade-offs. The validator checks the recorded fixed bookings, venue opening hours/indoor status, travel feasibility, a **30-minute arrival buffer** before fixed bookings, and a **150-minute maximum proposed stop**. Failed candidates are regenerated up to **three attempts**; after that the existing plan remains unchanged. Only a user-approved diff updates the stored plan. A validator cannot guarantee correctness if its venue or road data is stale.

**Cost of failure and evaluation**

| Failure                              | Traveller impact and recovery                                                                                                                                                                 | Detection / evidence                                                                                                        |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Missed fixed booking                 | Possible loss of a sleeper-bus seat (illustrative **~290,000 VND/person**) and extra homestay night (**~300,000–600,000 VND**), or a prepaid fee; difficult to reverse after departure.       | Booking/time validation; inspect schedule before accepting. Amounts are examples from the team's draft, not verified fares. |
| Intent misunderstood or place closed | An unwanted deleted stop or roughly an hour lost travelling to an unusable place; correctable before acceptance or by manual replanning.                                                      | Visible extracted constraints and diff; tester review.                                                                      |
| Feasible but unhelpful plan          | The family still spends the day waiting indoors. In the recorded spike, **3/6** early valid plans stayed over five hours in one café; after the stop limit, **3/3** had two meaningful stops. | Two independent usefulness raters: _useful / acceptable / useless_; report agreement.                                       |

**Pre-release measurement:** **50** rainy-day scenarios × **3** repetitions × **2** models = **300** runs (**150/model**). Record constraint failures, usefulness ratings, model cost/latency, and user **accept / edit / reject** decisions; team/friends will replay past trips. The evaluation is _planned_, not completed. Supporting quality requirements are a usable mobile layout, reproducible evaluation inputs, and no unvalidated candidate shown as an accepted plan.

### 5. Semester scope

| **In scope (semester MVP)**                                                                                                                                                                | **Out of scope (explicitly deferred)**                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vietnamese responsive day workspace; a shared **demo login** (no account system); enter remaining stops and fixed bookings (time, location, amount paid, refundability); two seeded trips. | Account registration, multi-user management, offline operation, full-trip creation/import, multi-day or non-Đà Lạt replanning.                                                                    |
| Team-checked catalog (target **100 places**, including hours and indoor flag); same-day agent, validator, map, proposed-change diff, accept/edit/reject log.                               | Live agent search across Google Places, autonomous reservations/payments/cancellations, flights/hotel/bus search, Gmail/calendar sync, weather-triggered automation, push alerts, shared editing. |
| Two-model evaluation, **50** scenarios, human ratings and tester replays.                                                                                                                  | Broader AI Travel Agent features (budget tracking, collaboration, end-to-end trip management) from the original vision.                                                                           |

## PART II — SOFTWARE DEVELOPMENT PLAN

### 6. Project overview, organization, and schedule

**Delivery approach:** six two-week checkpoints (Scrum model), with responsibility assigned to one accountable owner at each. The dates below are **tentative**: the course calendar was not yet published in the team's draft; align dates when official dates become available. Evaluation is scheduled at checkpoint 4 (PA#4), as stated in the draft. Project constraints are a **three-member team**, a single-city pilot, manually checked venue data, and a limited API budget.

| Milestone      | Đăng                            | Thắng                              | Đức                                                    | Owner / release evidence             |
| -------------- | ------------------------------- | ---------------------------------- | ------------------------------------------------------ | ------------------------------------ |
| **1 · 22 Oct** | Proposal, repo, cost spike      | Review proposal/plan               | Review proposal/plan                                   | **Đăng** · PA#1 draft                |
| **2 · 5 Nov**  | Feature spec, rating guide      | Trip entry, day view, 2 demo trips | Data model, validator, 10 scenarios, 30 venues checked | **Đức** · first integrated prototype |
| **3 · 19 Nov** | Agent v1 and retry loop         | Diff, map, integration             | 100-place catalog, 50 scenarios                        | **Thắng** · alpha workflow           |
| **4 · 3 Dec**  | Error-type analysis             | Accept/edit/reject log             | 50 scenarios × 3 runs × 2 models; rate with Đăng       | **Đức** · evaluation results         |
| **5 · 17 Dec** | Fix top 3 failure modes; re-run | Friend/tester replays              | Cost and latency report                                | **Đăng** · revised candidate         |
| **6 · 31 Dec** | Demo scenarios                  | Deployment and demo script         | Final metrics in README                                | **Thắng** · final demo               |

**Monitoring/control:** use the repository for code, scenarios, documentation, and revision history; review deliverables at each checkpoint. Report validator failures, usefulness ratings, accept/edit/reject outcomes, latency, and spending. Scope changes require team agreement and a corresponding plan/log update.

### 7. Project risks and mitigation

| Project-threatening risk                                     | Mitigation started / planned                                                                                   | Decision trigger                                                                                                                 |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **R1 — Technically valid but useless plans.**                | Spike led to a 150-minute stop limit; Đăng develops the human rating guide.                                    | If **>30%** are rated useless at checkpoint 4, try Sonnet 5.5; if still poor, fall back to hand-designed indoor half-day routes. |
| **R2 — Incorrect or missing place data defeats validation.** | Đức begins by cross-checking 30 venues against venue/Facebook information; Đăng sets up Google billing access. | If **>30%** of records are wrong/incomplete, prioritize phone-verified places and reduce the catalog target from 100 to **60**.  |

### 8. Technology choices and project estimates

| Component                                   | Project-specific reason / estimate                                                                                                                                                                                |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js + TypeScript; Vercel**            | Single UI/server codebase for a small team; use a small Node server if live route calls exceed hosting limits.                                                                                                    |
| **PostgreSQL (Neon)**                       | Relational bookings, stops, catalog, and logs; supports deterministic day-level validation.                                                                                                                       |
| **Anthropic SDK + Claude Haiku 5.5**        | Main re-planner. Draft pricing assumption: **USD 0.10 / 0.50 per 1M input/output tokens**. Team's fixture-based spike reports **6,773/2,370 tokens**, **USD 0.0019**, **12.5 s** per run; **~USD 0.30/150 runs**. |
| **Claude Sonnet 5.5 (comparison/fallback)** | Same interface; draft pricing assumption: **USD 2 / 10 per 1M input/output tokens**, **~USD 0.04/run**, **~USD 6/150 runs**. Combined model-spend cap: **USD 10**.                                                |
| **Google Routes (Route Matrix)**            | Live driving-time estimates; fixed travel-time fixtures for evaluation so both models face identical cases.                                                                                                       |
| **Google Places + Maps JavaScript**         | Venue lookup/metadata support and day-map display; indoor classification and hours must be team-verified. API quotas, pricing, and storage terms **must be rechecked before use**.                                |

**References and submission:** This revision uses only the supplied project draft, requirements, Vision/Planning templates, rubric, and `AI-LOG.md` (sources identified there). Prices, fares, and API quotas remain unverified draft estimates. PA#1 also requires a separate `SELF_ASSESSMENT_REPORT.md` and correctly named submission ZIP; neither is included here.
