# Rainy-day scenarios

Each file is one situation the re-plan agent must handle. The runner in `spikes/replan-cost` runs every `*.json` file here except those starting with `_`.

## How to add one

1. Copy `_template.json` to `NNN-short-name.json` (next free number).
2. Fill the fields:
   - `source`: whose real trip this comes from, or `invented`. Real trips are worth more.
   - `now`: the time the traveller asks for a new plan.
   - `rain_from`: when heavy rain starts, or `null` if the change is not rain.
   - `current_place`: where they are now.
   - `fixed`: bookings that cannot move. `label` says what it is, what was paid and whether it is refundable.
   - `planned`: the stops they had planned for the rest of the day, before the change.
   - `message`: what they type, in Vietnamese, as a real person would ("mưa to quá, mấy đứa nhỏ đói rồi").
   - `extra_places`: places not yet in `../places.json`, same fields as there. Take `lat` and `lng` from Google Maps (right click on the place); write `hours` as `[["07:00", "17:00"]]`, with two ranges if it closes at noon.
3. Every `place_id` must exist in `../places.json` or in `extra_places`.
4. Run `npm install` once, then `npm run check` in `spikes/replan-cost`. It checks every scenario file without calling any API, so no key is needed. Đăng runs the agent on the finished set.

## What makes a good set

Vary one thing at a time: rain in the morning or the afternoon; a sleeper bus, a homestay check-out, a prepaid tour or a dinner booking; a tired family, kids, older parents or friends who still want to go out; a museum closed for lunch; a request that is hard to read ("thôi đi đâu cũng được"). Write down in `source` which case it tests.
