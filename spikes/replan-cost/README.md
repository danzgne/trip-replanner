# Re-plan cost spike

One rainy-afternoon scenario in Đà Lạt: 15 catalog places with fixture opening hours, fixture driving times, a prepaid dinner at 18:30 and a sleeper bus at 22:00. The agent searches places, asks for travel times and submits a plan that the validator in `index.js` accepts or rejects.

Run: put `ANTHROPIC_API_KEY` in `../../.env.local`, then `npm install && npm start`. `MODEL`, `EFFORT` and `RUNS` override the defaults.

## Results, 2026-10-21

| Run set | Validator | Runs | Valid (first proposal) | Avg input tokens | Avg output tokens | Avg cost | Avg time |
|---|---|---|---|---|---|---|---|
| A | fixed bookings checked by place and start | 3 | 3 (3) | 8,066 | 1,693 | $0.0017 | 11.5 s |
| B | as A, plus booking end time | 3 | 3 (3) | 5,973 | 1,655 | $0.0014 | 10.6 s |
| C | as B, plus 30-minute arrival margin before fixed bookings, stops of at most 150 minutes, at most 120 idle minutes | 3 | 3 (3) | 6,773 | 2,370 | $0.0019 | 12.5 s |

Model `claude-haiku-5-5`, effort `medium`. The proposal quotes set C. Full console output of set C, including each plan's explanation, is in `runs/2026-10-21-set-c.txt`; the output of sets A and B was not saved, only these averages.

In sets A and B all six plans dropped the two outdoor stops and kept both bookings, but three kept the travellers in one café for over five hours. In set C every plan had two real stops (a museum or the market, and a café) before dinner.

## Limits

- One scenario only.
- Travel times are straight-line estimates (distance × 1.4 at 25 km/h plus 5 minutes), not Google Routes, so real tool latency is not included.
- Opening hours in the fixture are illustrative, not checked against the real places.
- The stop-length rule does not yet allow a long rest the traveller asked for ("we're tired"); the rating guide decides when that is right.
- The cap of three rejected plans was added after sets A and B; every run was accepted on its first proposal.
