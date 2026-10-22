# AI-LOG

## Data leaving our system

The re-plan agent sends a tester's remaining stops for the day and their booking names and times to Anthropic (Claude Haiku 5.5, and Sonnet 5.5 in the comparison) and the trip's places to Google Routes for driving times. That is acceptable because testers agree to it first, the evaluation uses invented scenarios, and no payment details or contact information are stored or sent.

## 2026-10-20: choosing the product idea (PA#1)

Tool: Claude Code.
Asked for: product ideas with a sharp LLM feature, scored against the PA#1 rubric.
Kept: nothing as proposed.
Changed: n/a.
Rejected: order extraction from seller chats (the lecturer already uses it as an example); allergen tagging for restaurant menus (we did not trust the LLM to get ingredients right and the harm is a health one); citation checker, regulations Q&A and refund helper (we preferred our own travel idea).
By hand: the original AI travel agent requirements document.

## 2026-10-21: narrowing the travel idea (PA#1)

Tool: Claude Code.
Asked for: a review of our AI travel agent requirements against the PA#1 rubric.
Kept: narrowing to one feature, re-planning a day around fixed bookings, with a code validator for hard constraints (bookings kept, opening hours, travel times) so the feature can be measured.
Changed: we pushed back that the narrowed version felt like a booking form; the feature is now framed as an agent loop (search places, route, weigh trade-offs, self-check with the validator) with first itinerary generation kept as a supporting, unevaluated part.
Rejected: flight and hotel search, real booking, Gmail import and calendar sync, because the APIs need approvals we cannot get this semester.
By hand: no text. Keeping the travel idea and pushing back on the narrowed version were our calls.

## 2026-10-21: drafting the proposal (PA#1)

Tool: Claude Code.
Asked for: a two-page draft in rubric order, the questions it needed us to decide, and revisions until it fit two pages.
Kept: the section structure, the error types in §2, the per-member plan table in §4, the 30-minute arrival margin and 150-minute stop limit in the validator.
Changed: the demo city from Tokyo to Đà Lạt (our own trip, and Google transit data for Japan was unconfirmed); the invented persona in §1 to Đăng's real family trip; the model from Claude Opus 5.5 to Haiku 5.5 as main model because we want the lowest cost, with Sonnet 5.5 as comparison and fallback (about $6 for the evaluation; we first planned Gemini's free tier, but access to Gemini 2.5 Flash for new projects was uncertain, and one provider also removed the need for the Vercel AI SDK); checkpoint dates to a two-week rhythm with evaluation at checkpoint 4, since the course calendar is not out yet.
Rejected: the chat that drafts the first itinerary. Travellers plan in Mindtrip, Layla or a notes app and enter only today's stops and bookings.
By hand: the Đà Lạt trip story (August 2023, family, rented car, homestay, a strawberry farm rained out, no alternative found) and the decisions above. The ownership split in §4 was suggested by the tool and confirmed by all three of us.

## 2026-10-21: re-plan cost spike (PA#1)

Tool: Claude Code.
Asked for: a script that runs the re-plan agent on Claude Haiku 5.5 against one rainy-afternoon scenario in Đà Lạt and measures tokens, cost, time and validator results.
Kept: the script and three run sets in `spikes/replan-cost` (9 of 9 plans valid; latest set $0.0019 and 12.5 s per re-plan, output saved in `runs/`). §6 uses the measured numbers instead of the earlier estimate, which was about 3 times too high.
Changed: the validator now checks a booking's end time, a 30-minute arrival margin, a 150-minute stop limit and idle time; the agent stops after three rejected plans, matching §2.
Rejected: treating "passes the validator" as enough. Three of the first six valid plans parked us in one café for over five hours, so §2 adds a hand rating of usefulness, risk 1 is now about plans not worth following, and the stop limit went in; with it, all three plans in the last set had two real stops.
By hand: the Anthropic key and workspace setup; deciding to run the spike with fixture data rather than wait for a Google key.

## 2026-10-22: ten rainy-day scenarios (PA#2)

Tool: Claude Code.
Asked for: 10 rainy-day scenarios in `eval/scenarios`, each different in one point (rain in the morning, afternoon or evening; homestay check-out, prepaid tour, dinner or sleeper bus; kids, older parents, friends; a vague request), passing `npm run check`.
Kept: all ten files, 001 to 010, as written. Each has at least one plan the validator accepts; this was checked with one hand-made plan per scenario, which is not saved.
Changed: nothing yet.
Rejected: n/a.
By hand: nothing. All ten are invented; no real trip of someone we know is in the set yet. The coordinates of the four extra places (GO! Đà Lạt, Chợ đêm, Lẩu gà lá é Tao Ngộ, Thác Datanla) come from Google Maps; their opening hours are guesses, since Maps without a login showed only that Tao Ngộ closes at 22:00.

## 2026-10-22: revising the proposal using the Vision/Planning templates (PA#1)

Tool: ChatGPT (GPT-6); local document review and Markdown authoring.
Asked for: read `proposal.md`, `ai-travel-agent-requirements.md`, the provided Vision Document and Software Development Plan samples, and the PA#1 rubric; produce an English `proposal-v2.md` in a professional Vision + Plan format, and update this AI log.
Kept: the rainy-day Đà Lạt family example, one same-day re-planning LLM feature, non-movable bookings, 30-minute booking buffer, 150-minute stop limit, three-attempt validation loop, manual accept/edit/reject decision, 100-place target, 50 scenarios, the named three-person checkpoint responsibilities and tentative dates, the two project-threatening risks, and the team's recorded spike figures and technology selections.
Changed: reorganized the proposal into Vision (Introduction, Positioning, Stakeholders, Product Overview, Scope) and Software Development Plan (Organization/Schedule, Risks, Technology/Estimates); converted the problem, harms, users, scope, schedule, risks, and stack into compact tables. Clarified that 50 scenarios × 3 repeats × 2 models means 300 planned runs in total, or 150 per model, consistent with the source's per-model cost estimates. Clarified that one shared demo login is not an account management feature, that the original broad AI Travel Agent roadmap is out of this semester's scope, and that provider prices, example travel fares, and API quotas are unverified assumptions copied from the draft. Marked document approval and course-calendar alignment as pending. Inspected a two-page A4 print preview using a compact Markdown stylesheet; pagination under other exporters is not guaranteed.
Rejected: adding full-trip generation, autonomous booking/payment, live weather monitoring, Gmail/calendar imports, collaborative planning, unsupported product benchmarks, invented test outcomes, or any claim that the team's draft figures were independently verified. Where the earlier AI log and latest proposal differed about first-itinerary generation, followed the latest explicit `proposal.md` exclusion.
By hand: no additional team decisions or manual experiments were performed for this revision. The original case study, spike results, and ownership agreements were supplied in the team's uploaded files; team review and sign-off remain necessary. The project's Anthropic and Google APIs were not invoked for this editing task.

## 2026-10-22: revising the development plan and risk register (PA#1; proposal v3)

Tool: ChatGPT (GPT-6); review and Markdown editing of `proposal-v2.md`, the supplied Software Development Plan example, the PA#1 rubric, and the team's existing proposal/requirements.
Asked for: revise the plan as a concrete, professional Scrum-based software development process rather than a high-level task schedule; expand and rank risks using a structured risk-management format; deliver `proposal-v3.md`.
Kept: the Đà Lạt rainy-day problem, the single same-day re-planning feature and fixed-booking safeguards, semester MVP boundaries, six tentative checkpoints and named implementers, evaluation design (50 scenarios × 3 runs × 2 models), original spike figures, and selected technology stack. The original two major risks (unreliable place data and feasible-but-useless itineraries) remain top priorities.
Changed: reframed the six checkpoints as provisional two-week Scrum Sprints (S1–S6) with Sprint Goals, specific engineering work packages, individually assigned responsibilities, testable increments and release/acceptance gates. Added a prioritized Product Backlog, Sprint Backlog, proposed Scrum accountabilities and event timeboxes, backlog refinement, PR/peer review/CI/integration/UAT workflow, Definition of Done, progress metrics, change control, branch and release management. Replaced the brief risk list with a six-entry ranked register using estimated probability (1–5) × impact (1–5), exposure-based Very High/High/Medium bands, named owners, review points, early mitigations, triggers and contingencies. Added risks for fixed-booking/route errors, external API reliability/cost, integration capacity, and tester-data privacy.
Rejected: treating each checkpoint merely as a date and per-person to-do list; generic unranked risks without measurable triggers or fallback actions; expanding the semester product to full-trip planning, automated booking, payments, or continuous external monitoring; presenting proposed Scrum practices, risk scores, vendor prices or evaluation results as independently validated or formally approved.
By hand: the request for stronger Scrum and risk management came from the user's review. No new team decisions, code changes, experiments, production runs or external API verification occurred during this editing task. Sprint dates, responsibilities newly added in v3, process timeboxes, risk probabilities/impacts and response thresholds are planning proposals requiring team confirmation and alignment with the official course schedule. A compact A4 print preview was inspected, but pagination may vary between Markdown exporters. The original `proposal-v2.md` and preceding AI-LOG entries were retained.
