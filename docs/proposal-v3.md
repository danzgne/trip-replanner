# Trip Replanner

**Project Vision & Software Development Plan (Small Project) | PA#1**  
**Version:** 3.0 | **Date:** 22 October 2026 | **Status:** Proposed; pending team sign-off  
**Team:** Nguyễn Hoàng Đăng (23127166) · Tô Minh Thắng (23127260) · Lê Minh Đức (23127351)  
**Repository:** https://github.com/danzgne/trip-replanner

| Revision           | Description                                                                                                                                                         | Approval    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| v3.0 · 22 Oct 2026 | Replaced checkpoint-only scheduling with Scrum delivery, engineering controls, test gates and ranked risk management; preserved the PA#1 vision and MVP boundaries. | Team review |

## PART I — PROPOSAL DOCUMENT

### 1. Introduction

**Purpose and scope.** Define the user problem, single testable LLM feature, value, semester scope and delivery plan. This is the **PA#1 proposal**, not the detailed feature specification reserved for later milestones.

### 2. Positioning

**Business opportunity / actual situation.** In some family visited Đà Lạt from Ho Chi Minh City in a rented car and stayed at a booked homestay. Heavy rain cancelled a strawberry-farm visit; lacking an alternative, they waited at the homestay and later visited only the market. Today, travellers check Google Maps/Facebook, verify opening hours one by one or abandon activities.

| Problem-statement element       | Description                                                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **The problem of**              | Quickly replanning **the remaining rainy day** around places that are indoor, open and reachable **without missing fixed bookings**. |
| **Affects**                     | Families/small groups travelling in Đà Lạt with fixed car, homestay, bus or prepaid-tour commitments.                                |
| **Impact**                      | Wasted holiday time, visits to closed venues, missed departures and lost prepaid fees.                                               |
| **A successful solution would** | Offer an enjoyable, feasible replacement day; verify hard constraints in code; show all changes before user approval.                |

**Product position.** For rain-disrupted Đà Lạt travellers, _Trip Replanner_ is a Vietnamese mobile-web **same-day replanning assistant**, not a full-trip generator. Unlike unverified chat suggestions, its structured trip state and deterministic validator constrain the LLM's proposals.

### 3. Stakeholders and users

| User / stakeholder                 | Need and context                                                           | MVP response                                                                                                   |
| ---------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Traveller (primary)**            | On a phone, wet weather, limited remaining hours and non-movable bookings. | Enter stops/bookings, state changed preferences, examine a day-map and proposed diff, then accept/edit/reject. |
| **Project team / course reviewer** | A measurable LLM feature and demonstrable incremental delivery.            | Scenario fixtures, validator evidence, usefulness ratings, release builds and sprint records.                  |

### 4. Product overview and critical feature

**Product perspective.** The stored day plan and fixed bookings are the **source of truth**; chat provides intent. The agent searches a team-checked Đà Lạt catalog, obtains driving times and proposes replacement stops; it does not book or pay.

`Vietnamese request → extracted constraints → indoor candidates + routes → LLM proposal → code validation → change diff → user approval`

The validator checks **fixed bookings**, opening hours/indoor status, feasible travel, a **30-minute pre-booking arrival buffer** and a **150-minute maximum stop**. Failed proposals are retried at most **three times**; otherwise the previous plan remains. Only an approved diff is committed. Incorrect source data can still produce an unusable plan.

| Failure mode                      | Who pays / how reversible?                                                                                                                                                        | Detection and evaluation                                                          |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Missed booking**                | Traveller may lose ~**290,000 VND** per bus seat plus **300,000–600,000 VND** for another night; usually not reversible after departure. These are **unverified draft examples**. | Hard-constraint checks; zero known booking conflicts may reach the proposed diff. |
| **Misread intent / closed place** | Desired stop removed or ~one hour wasted; reversible by rejecting or manually editing.                                                                                            | Extracted constraints displayed alongside diff; tester review.                    |
| **Valid but unhelpful**           | Afternoon wasted at the homestay/café. Earlier spike: **3/6** valid plans stayed >5 hours in one café; after stop cap, **3/3** had two stops.                                     | Two raters classify useful / acceptable / useless and report agreement.           |

**Planned acceptance evidence:** **50 scenarios × 3 runs × 2 models = 300 runs** (150/model), using common travel-time fixtures; report validation failures, usefulness, latency, API cost and accept/edit/reject results. Team/friends replay real past rainy days. **This evaluation has not yet been completed.**

### 5. MVP boundaries

| In scope this semester                                                                                                                  | Explicitly out of scope                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vietnamese responsive day workspace, one demo login (not user-account management), remaining stops/fixed bookings and two seeded trips. | Full-trip generation/import, actual accounts, offline/multi-city/multi-day replanning.                                                                           |
| Team-checked **100-place target** (hours/indoor flag), agent + validator, travel-time lookup, day map, diff and decision log.           | Agent-driven live Places search; booking, payment, cancellation, flights/hotels/buses; weather monitoring, Gmail/calendar integration, alerts and collaboration. |
| Two-model 50-scenario evaluation, human ratings and replay testing.                                                                     | Broader travel-agent budget/expense management and autonomous trip operations.                                                                                   |

## PART II — SOFTWARE DEVELOPMENT PLAN

### 6. Project organization and Scrum management process

**Delivery model.** **Six incremental Sprints**, nominally two weeks each, implementing Scrum accountabilities, artifacts and events. The PA#1 rubric places evaluation at PA#4; the two-week rhythm is our own assumption, and we will move every date to the calendar once it is out. The owner makes sure the checkpoint is complete and on time.

| Proposed Scrum accountability / technical area | Member    | Concrete responsibility                                                                                              |
| ---------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------- |
| **Product Owner; AI developer**                | **Đăng**  | Product Goal, ordered Product Backlog, acceptance priorities; prompt/agent loop, rating rubric and failure analysis. |
| **Scrum Master; UI/DevOps developer**          | **Thắng** | Facilitate events, remove blockers, maintain board; trip-entry UX, diff/map, deployment and UI tests.                |
| **Developer; technical/data lead**             | **Đức**   | Data model and API contracts, place catalog, deterministic validator, scenario fixtures, evaluation scripts/metrics. |

**All three act as Developers for delivery;** Scrum accountabilities above are a **proposed team assignment**, not an assertion of prior agreement. A **named Sprint DRI** coordinates each release checkpoint; task owners still implement and test their own backlog items.

**Product Goal.** A traveller can change the remaining Đà Lạt day with natural language, inspect a **feasible and useful** proposed replacement, and approve it without losing fixed bookings. The **Product Backlog** contains thin, demonstrable items (`TR-01` trip/booking input; `TR-02` catalog/route data; `TR-03` validator; `TR-04` agent/retry; `TR-05` diff/map/decision; `TR-06` evaluation/deployment), each with a priority, owner, acceptance criteria, dependencies and estimate. At Sprint Planning, the team sets a **Sprint Goal**, selects items by capacity and creates a **Sprint Backlog** (tasks + test work + owner). Unfinished items return to the Product Backlog; they are never reported as Done.

**Repeatable Sprint operating cycle (team working agreement; timeboxes proposed):**

| Activity / when                                       | Required output and working rule                                                                                                                                         |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Sprint Planning** · day 1, 90 min                   | Product Owner explains highest-value backlog items; team defines Sprint Goal, capacity, owners, acceptance tests and dependencies.                                       |
| **Daily Scrum** · each working day, ≤15 min           | Developers inspect progress toward Sprint Goal, update board (`To Do → In Progress → Review/CI → Test → Done`) and surface blockers; escalate blocked items within 24 h. |
| **Refinement** · weekly, 45 min (supporting practice) | Split oversized items, clarify scenarios/data assumptions and re-estimate risks; no new work should silently displace Sprint Goal.                                       |
| **Development / verification** · continuously         | Issue → design/API contract → branch/PR → peer review → automated checks → staging integration → exploratory/UAT test. Every PR has one peer reviewer (not its author).  |
| **Sprint Review** · last day, 60 min                  | Demo **Done** increment and objective evidence; obtain reviewer/tester feedback, update Product Backlog and record accept/rework decisions.                              |
| **Sprint Retrospective** · after Review, 45 min       | Inspect lead time, failures and collaboration; assign **one measurable improvement** for the next Sprint.                                                                |

**Definition of Done (applies to every product increment):** acceptance criteria demonstrably pass; relevant **unit + integration** tests added (including booking invariants/negative scenarios); type-check/lint and CI pass; peer-reviewed PR merged; UI manually checked on mobile where relevant; no open critical defect; setup, decisions and tests documented; integrated staging build is demoable. The **increment**, not a slide or unmerged branch, is the Sprint deliverable. Agent outputs require validator approval **before** display as a feasible option; persisted plan changes require explicit user acceptance.

### 7. Sprint plan, releases, and ownership

| Sprint / reporting phase; dates **(provisional)** | Sprint Goal and work packages (named implementers)                                                                                                                                                                   | Done evidence / release gate; accountable DRI                                                                                                       |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S1 · Inception**; **9–22 Oct**                  | **Đăng:** PA#1 vision, ordered backlog, repository, Haiku cost/feasibility spike. **Thắng/Đức:** review scope, acceptance risks and technical approach.                                                              | **PA#1 baseline:** draft, repository and spike evidence; scope agreed **after sign-off**. **DRI: Đăng**.                                            |
| **S2 · Elaboration**; **23 Oct–5 Nov**            | **Đăng:** user stories, constraint schema, usefulness rating guide. **Thắng:** mobile day-entry form + two seed trips. **Đức:** schema/API contracts, `TR-03` validator unit tests, 10 fixtures + 30 checked places. | **Vertical-slice prototype:** saved day + fixed bookings; validator rejects conflicting fixtures; review demo. **DRI: Đức**.                        |
| **S3 · Elaboration**; **6–19 Nov**                | **Đăng:** `TR-04` agent, tool calls, 3-try recovery. **Thắng:** `TR-05` diff/map and staging E2E flow. **Đức:** 100-place target, 50 fixtures, route adapter + integration tests.                                    | **Alpha:** request → proposed diff → accept/reject; no rejected candidate commits; 50 fixtures versioned. **DRI: Thắng**.                           |
| **S4 · Construction**; **20 Nov–3 Dec**           | **Đăng:** error taxonomy, co-rate outputs with Đức. **Thắng:** decision/audit log + regression tests. **Đức:** run **300 planned evaluations**, compare two models, summarize validity/quality/cost/latency.         | **PA#4 evaluation gate:** reproducible run files, rater agreement, failures and model comparison; **not a claim of passing results**. **DRI: Đức**. |
| **S5 · Construction**; **4–17 Dec**               | **Đăng:** prioritize/fix three dominant failure modes and rerun affected cases. **Thắng:** tester replays, mobile usability/UAT. **Đức:** latency/cost analysis, stale-data edge tests, regression suite.            | **Beta/release candidate:** documented fixes, full regression, tester accept/edit/reject evidence and measured spend. **DRI: Đăng**.                |
| **S6 · Construction**; **18–31 Dec**              | **Đăng:** real-case demo and risk closure. **Thắng:** deploy, smoke/rollback checks, demo script. **Đức:** final results, reproducibility README and handover.                                                       | **Final demo:** deployed app, seed data, traceable results, no critical open defects, tagged release. **DRI: Thắng**.                               |

**Monitoring and configuration control.** GitHub Issues = traceable backlog (`PBI → PR → test → release`); protected `main`, short-lived feature branches, PR review and tagged `alpha/beta/final` builds. Sprint Review records completed vs planned PBIs, critical defects, test pass rate, validator rejection rate, human usefulness distribution, p50/p95 re-plan latency and cumulative API spend. Changes to scope/acceptance criteria are logged and re-ordered by the Product Owner with the team; an active Sprint Goal is protected. Sprint risks are reassessed at **every Planning and Review**; follow-up actions have owners and due Sprint.

### 8. Risk management: ranked register

**Scoring (planning estimates, not measured frequencies):** Probability **P** and impact **I** each 1–5; **exposure = P × I**. **Very High 16–25; High 10–15; Medium 5–9; Low 1–4**. Sorted by exposure as in the supplied Planning Document. The first two directly threaten the product's core promise and have immediate mitigations.

| Rank · ID (P×I)             | Risk description and impact                                                                                                                 | Mitigation now; trigger → contingency                                                                                                                                                                                           | Owner / review                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **Very High · R1 (4×5=20)** | **Incorrect/incomplete venue hours or indoor status**: validator may approve a closed/unsafe stop; missed time slots undermine credibility. | **Now:** Đức checks the first **30 places** against venue sources; track evidence/timestamps. **If >30%** incomplete/wrong → phone-verify essentials and reduce 100-place target to **60 trusted venues**; flag uncertain data. | **Đức** · S2 and every Sprint |
| **Very High · R2 (4×4=16)** | **LLM output passes constraints but is useless**: traveller repeats the failed homestay/café experience; core value not delivered.          | **Now:** keep **150-min stop limit**, build blinded usefulness rubric. **If >30% useless at S4** → test Sonnet 5.5; if still poor, choose from curated indoor half-day routes.                                                  | **Đăng** · S2/S4/S5           |

### 9. Technology choices and estimates

| Choice                                                    | Project rationale / cost assumption                                                                                                                                                         |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js / TypeScript + Vercel**                         | Unified responsive UI, API and deployment for three developers; move long-running route tasks to a small Node service if hosting limits interfere.                                          |
| **PostgreSQL / Neon**                                     | Transactional trip/booking state and queryable catalog, validator inputs and decision log.                                                                                                  |
| **Anthropic SDK; Claude Haiku 5.5 (main)**                | Team's fixture-based spike: **6,773 input + 2,370 output tokens**, **12.5 s**, **~USD 0.0019/run**; at assumed **USD 0.10 / USD 0.50 per million tokens**, **~USD 0.30/150 runs**.          |
| **Claude Sonnet 5.5 (comparison/fallback)**               | Same agent interface; assumed **USD 2 / USD 10 per million tokens**, **~USD 0.04/run**, **~USD 6/150 runs**; proposed **USD 10 combined model budget cap**.                                 |
| **Google Routes Matrix; Google Places + Maps JavaScript** | Driving times/day map; **frozen fixtures** for fair model comparison; manual indoor/hour verification. Verify all API quotas, current prices and usage/storage terms before implementation. |

**Assumptions / references.** Three part-time contributors, a single-city pilot and a tentative six-Sprint calendar. Vendor prices, illustrative traveller costs, spike findings and availability are **carried forward from the team's supplied draft, not independently remeasured here**. Structural references: supplied _Vision Document_, _Planning document_ (§§3–4), `proposal.md`, `ai-travel-agent-requirements.md`, `AI-LOG.md`, and _PA#1 rubric_. Scrum concepts: [The Scrum Guide (2020)](https://scrumguides.org/scrum-guide.html). **PA#1 submission additionally requires** a separate `SELF_ASSESSMENT_REPORT.md` and correctly named ZIP; neither is part of this document.
