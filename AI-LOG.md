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
