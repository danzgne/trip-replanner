# Re-plan cost spike

One rainy-afternoon scenario in Đà Lạt: 15 catalog places with fixture opening hours, fixture driving times, a prepaid dinner at 18:30 and a sleeper bus at 22:00. The agent searches places, asks for travel times and submits a plan that the validator in `index.js` accepts or rejects.

Run: put `ANTHROPIC_API_KEY` in `../../.env.local`, then `npm install && npm start`. It runs every scenario in `../../eval/scenarios` against the places in `../../eval/places.json`. `MODEL`, `EFFORT`, `RUNS` (per scenario, default 1) and `SCENARIO` (id prefix) override the defaults. Sets A to C below ran one scenario, before the runner read scenario files.

## Results, 2026-10-21

| Run set | Validator | Runs | Valid (first proposal) | Avg input tokens | Avg output tokens | Avg cost | Avg time |
|---|---|---|---|---|---|---|---|
| A | fixed bookings checked by place and start | 3 | 3 (3) | 8,066 | 1,693 | $0.0017 | 11.5 s |
| B | as A, plus booking end time | 3 | 3 (3) | 5,973 | 1,655 | $0.0014 | 10.6 s |
| C | as B, plus 30-minute arrival margin before fixed bookings, stops of at most 150 minutes, at most 120 idle minutes | 3 | 3 (3) | 6,773 | 2,370 | $0.0019 | 12.5 s |

Model `claude-haiku-5-5`, effort `medium`. The proposal quotes set C. Full console output of set C, including each plan's explanation, is in `runs/2026-10-21-set-c.txt`; the output of sets A and B was not saved, only these averages.

In sets A and B all six plans dropped the two outdoor stops and kept both bookings, but three kept the travellers in one café for over five hours. In set C every plan had two real stops (a museum or the market, and a café) before dinner.

## Eleven scenarios, 2026-10-22

Scenario 000 plus Thắng's 001 to 010, one run each with the set C validator.

| Run | Output | Valid (first proposal) | Avg input tokens | Avg output tokens | Avg cost | Avg time |
|---|---|---|---|---|---|---|
| First | `runs/2026-10-22-eleven-scenarios.txt` | 10 (10) | 9,946 | 2,823 | $0.0024 | 15.2 s |
| After fixes | `runs/2026-10-22-eleven-scenarios-fixed.txt` | 11 (9) | 10,008 | 2,858 | $0.0024 | 15.6 s |

Reading the first run's plans showed two runner bugs. The restaurant and bus station used as bookings were searchable, so plans 003 and 007 added a dinner booking the traveller did not have, and the validator passed them. And in 005 the agent answered in text after its first plan was rejected, which ended the run. Booking places are now `booking_only` in `../../eval/places.json` (not searchable, and rejected unless the scenario holds that booking), and after a rejected plan the runner asks the agent for a revised one.

After the fixes all 11 runs ended with a valid plan. Valid is not the same as right: in 008 the family asked to rest at the homestay and got four stops instead. That is the misread-request error the hand ratings must catch.

## Limits

- Sets A to C used one scenario; the eleven-scenario run used one run per scenario, and the scenarios are invented.
- Travel times are straight-line estimates (distance × 1.4 at 25 km/h plus 5 minutes), not Google Routes, so real tool latency is not included.
- Opening hours in the fixture are illustrative, not checked against the real places.
- The stop-length rule does not yet allow a long rest the traveller asked for ("we're tired"); the rating guide decides when that is right.
- The cap of three rejected plans was added after sets A and B; every run was accepted on its first proposal.
