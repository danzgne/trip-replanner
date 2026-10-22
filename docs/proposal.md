# Trip Replanner: proposal and plan (PA#1)

Team: 23127166 Nguyễn Hoàng Đăng, 23127260 Tô Minh Thắng, 23127351 Lê Minh Đức  
Repository: https://github.com/danzgne/trip-replanner

## 1. Problem and users

**User:** a family or small group from Ho Chi Minh City on a short Đà Lạt trip in the rainy season, with things booked that cannot move: a homestay, a rented car, the sleeper bus home, a prepaid tour.

**Our case:** in August 2023 Đăng's family drove to Đà Lạt in a rented car and stayed at a booked homestay. The day's plan was a strawberry farm; heavy rain cancelled it. Nobody could find another place to go, so the family waited at the homestay, and in the end only went to the market to buy food to cook there before heading home. That is half the problem, finding somewhere open and dry; fixed bookings make a wrong answer expensive.

**Problem:** when rain breaks a day in Đà Lạt, the traveller has no quick way to rebuild it around places that are still open, still dry and still reachable before the bookings they cannot move.

**What they do today:** search Google Maps and Facebook groups for indoor places one at a time and check hours by hand, or give up and stay in. A chat assistant, even one that browses, does not know the traveller's bookings, and nothing checks its plan. Our app needs only the rest of today and the fixed bookings, not the whole trip.

## 2. The LLM feature and the cost of it being wrong

**One feature: re-plan the current day around fixed bookings.** The traveller types what changed ("it's pouring, drop the outdoor stuff, we're tired, the bus is at 10 pm"). An agent turns this into constraints, searches our Đà Lạt place catalog, asks Google Routes for travel times, weighs trade-offs and submits a plan. A code validator checks every hard constraint against stored data: arriving 30 minutes before each fixed booking as a margin for rain, places open and indoor, no stop over 150 minutes. A rejected plan goes back to the agent and never reaches the traveller; after three rejections the app keeps the current plan. The traveller accepts, edits or rejects the result as a diff, which also shows the constraints the agent read from the message.

**Why an LLM:** code guarantees a plan is feasible; the LLM decides what is worth doing from a vague request ("we're tired", "something warm to eat") and explains what each change costs.

**Cost of a wrong answer.** The person harmed is the traveller.
- *Missed fixed booking:* blocked by the validator unless its data is wrong (a closing time, a travel time in a storm). Then the traveller misses the sleeper bus (about 290,000 VND per seat on a Phương Trang limousine) and pays for an extra night (300,000 to 600,000 VND for a homestay double room), or loses a prepaid tour fee. Fixable only before departure.
- *Misread request:* the agent drops a stop the traveller could still do (our run of 009 dropped a lake walk that ends as the rain starts) or explains wrongly (005 told friends to cancel bookings they did not have). Code cannot check this; the constraints shown in the diff let the traveller catch it before accepting.
- *Unusable plan:* a drive to a place that turns out closed costs about an hour of a six-hour afternoon.
- *Plan not worth following:* valid but empty, so the family is back at the homestay, the failure we lived through. Early spike runs (output not kept) parked travellers in one café for five hours, hence the 150-minute stop limit.

**How we will know.**
- *Before release:* 50 rainy-day scenarios. Code reports how many end without a valid plan: none of the first 11, once we fixed two runner bugs found by reading the outputs. Two of us independently rate each plan and its explanation *useful* (we would follow it), *acceptable* (with edits) or *useless* (for example, hours in one place the traveller did not ask to rest in), and report agreement.
- *With testers:* the three of us and friends replay our own past rainy days, starting with Đăng's family trip, and compare each plan with what we actually did. Every re-plan logs the validator result and accept / edit / reject.

## 3. Scope

**In this semester**
- Entry of today's remaining stops and fixed bookings (time, place, amount paid, "refundable?"); two seeded demo trips; a Vietnamese mobile web page with one demo login.
- A Đà Lạt catalog of 100 places with opening hours and an indoor flag checked by us.
- The re-plan agent, the validator, the diff view and a map of the day.
- The 50-scenario evaluation on two models, the accept / edit / reject log and tester replays.

**Deliberately left out (not this semester)**
- Planning or importing the whole itinerary: travellers plan in Mindtrip, Layla or a notes app.
- Live Google Places search: the agent searches only our catalog.
- Flight, hotel and bus search, booking or payment; user accounts; offline use.
- Gmail import, calendar sync, push notifications, automatic weather detection.
- Shared editing, re-planning more than the current day, any city other than Đà Lạt.

## 4. Plan and ownership

The course calendar is not published yet. The PA#1 rubric places evaluation at PA#4; the two-week rhythm is our own assumption, and we will move every date to the calendar once it is out. The owner makes sure the checkpoint is complete and on time. All three of us agreed this split.

| # | Date | Đăng | Thắng | Đức | Owner |
|---|---|---|---|---|---|
| 1 | Oct 22 | Proposal, repository, cost spike | 10 rainy-day scenarios | Draft development plan and risk register | Đăng |
| 2 | Nov 5 | Feature spec, rating guide | Trip entry, day view, demo trips and login | Data model, validator, 30-place hours check | Đức |
| 3 | Nov 19 | Agent v1 with self-check loop | Diff view, day map, first deploy | Catalog to 100 places, scenarios to 50 | Thắng |
| 4 | Dec 3 | Failure analysis by error type | Accept / edit / reject log | Evaluation: 50 scenarios × 3 runs, two models; ratings with Đăng | Đức |
| 5 | Dec 17 | Fix top three failure modes, re-run | Tester replays with friends | Cost and latency report | Đăng |
| 6 | Dec 31 | Demo scenarios | Final deploy, demo script | Final numbers in README | Thắng |

## 5. Risks

1. **Plans are valid but not worth following.** Still visible: in the 11-scenario run, 4 valid plans sent travellers back to a place they had already visited that day. *Mitigation, already started:* the stop limit removed five-hour café plans. Đăng's rating guide, starting this week, covers when a long rest is what the traveller asked for. If more than 3 in 10 plans are rated useless at checkpoint 4, we switch to Claude Sonnet 5.5; if that fails, the agent chooses among indoor half-day routes we build by hand.
2. **Place data for Đà Lạt is unreliable,** and the validator is only as good as its data: many small cafés have missing or wrong hours on Google, which has no indoor field. *Mitigation, starting this week:* Đức checks 30 places against their Facebook pages, and Đăng sets up the Google billing account. If more than 30% are wrong or missing, the catalog keeps only places we confirm by phone, 60 instead of 100.

## 6. Technology choices

| Choice | Why, for this project |
|---|---|
| Next.js (TypeScript) on Vercel | One codebase for UI and agent route, free tier. Slowest spike re-plan: 25 s; the checkpoint 3 deploy tests it against the function time limit, else the agent moves to a small Node server. |
| PostgreSQL (Neon free tier) | The validator needs time-range overlap queries over a day's bookings, and checkpoint 4 analyses the accept / edit / reject log with SQL. |
| Claude Haiku 5.5, Anthropic SDK (main model) | $0.10 / $0.50 per million input / output tokens. Measured on 11 scenarios in `spikes/replan-cost/runs` (one run each, fixture travel times): 10,008 input and 2,858 output tokens, $0.0024 and 15.6 s per re-plan; 150 evaluation runs cost about $0.36. |
| Claude Sonnet 5.5, medium effort (comparison, fallback) | $2 / $10 per million tokens, about $0.05 per re-plan, so about $7 for 150 runs; same SDK, only the model name changes. Cap for both: $10. |
| Google Routes (Route Matrix) | Live driving times for own or rented cars, inside 10,000 free elements a month. The evaluation uses our fixed travel-time table per scenario: same inputs for both models, no Routes cost. |
| Google Places, Maps JavaScript | One Place Details call per catalog place (Enterprise SKU, 1,000 free a month); we store only place IDs, as Google allows, plus hours we checked. Maps: 10,000 free loads. |
