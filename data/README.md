# Place-hours check

Risk 2 in the proposal: how often are Google's opening hours for Đà Lạt places wrong or missing?

Fill one row per place in `place-hours-check.csv`, 30 places in total. Mix well-known sights (Dinh Bảo Đại, XQ Sử Quán, Bảo tàng Lâm Đồng, Ga Đà Lạt) with small cafés, strawberry greenhouses and restaurants, since the small ones are where hours go wrong.

| Column | What to write |
|---|---|
| `place_name` | Name as shown on Google Maps |
| `google_maps_url` | Link to the place on Google Maps |
| `google_hours` | Hours Google shows, e.g. `07:00-17:00`, or `missing` |
| `facebook_url` | The place's own Facebook page, or `none` |
| `facebook_hours` | Hours the place itself posts, or `none` |
| `checked_on` | Date you checked, `2026-10-22` |
| `hours_match` | `yes`, `no` or `unknown` (no own source to compare) |
| `indoor` | `yes`, `no` or `partly`: could a family stay dry there in heavy rain? |
| `notes` | Anything odd: closed on Mondays, "hours vary with weather", recently moved |

When the 30 rows are done, count `no` and `missing` and write the share at the bottom of this file. If it is more than 30%, the catalog keeps only places we can confirm by phone (proposal §5).
