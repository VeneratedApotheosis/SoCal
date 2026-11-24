# SoCal calendar performance benchmark

This report covers historical calendar-fetch optimizations and the recent changes to recurring events and sharing permissions. Live browser measurements used one signed-in Google account. Controlled benchmarks ran locally with synthetic calendar records and responses.

## Timing comparison

Times are medians in milliseconds. Each row compares two versions within the same benchmark. The live browser rows measure visible events or API completion. The controlled rows measure hook execution with fixture responses.

| Change | Benchmark | Timing metric | Before | After | Difference |
| --- | --- | --- | ---: | ---: | ---: |
| May date-window prefetch | Controlled hooks | First event data published | 169.0 | 145.9 | −23.1 |
| October calendar-list reuse | Live browser, cache disabled | First visible event | 2,597.3 | 2,167.9 | −429.4 |
| October calendar-list reuse | Live browser, cache disabled | Last startup API response | 2,609.6 | 2,763.0 | +153.4 |
| October calendar-list reuse | Live browser, cache disabled | Calendar-list response per call | 690.0 | 332.3 | −357.7 |
| October calendar-list reuse | Live browser, cache disabled | Expanded-event response per call | 324.8 | 346.1 | +21.3 |
| October calendar-list reuse | Live browser, cache disabled | Recurring-series response per call | 292.0 | 319.0 | +27.0 |
| October calendar-list reuse | Live browser, cache enabled | First visible event | 2,690.3 | 2,036.5 | −653.8 |
| October calendar-list reuse | Controlled hooks | First event data published | 156.2 | 86.2 | −70.0 |
| PR #28 on-demand recurring series | Live browser | First visible event | 3,328.7 | 3,630.1 | +301.4 |
| PR #29 on-demand sharing | Controlled hooks | Calendar metadata available | 32.375 | 31.720 | −0.655 |
| PR #29 on-demand sharing | Controlled hooks | Startup calendar-list work complete | 84.092 | 31.723 | −52.369 |
| PR #29 on-demand sharing | Controlled hooks | First panel open to permissions ready | 0.000 | 51.815 | +51.815 |
| PR #29 on-demand sharing | Controlled hooks | Follow-up read after one permissions change | 84.004 | 55.425 | −28.579 |

The Supabase migration and the premature preference-write fix have no separate timing measurements.

## May 2026 · Date-window prefetch and token caching

Compared [be6f2c1](https://github.com/VeneratedApotheosis/SoCal/commit/be6f2c1) with [8b331d8](https://github.com/VeneratedApotheosis/SoCal/commit/8b331d8). The newer commit started with a ±20-day window and fetched more dates in 10-day batches as users navigated. It also added an in-memory access-token cache and moved token persistence off the fetch path.

The benchmark ran the historical hooks against fixed responses because both versions depend on the retired Express backend. Three runs per version replayed startup, navigation 30 days forward, and a return to the starting date.

| Controlled metric | Before | After | Change |
| --- | ---: | ---: | ---: |
| Calendar API calls at startup | 4 | 4 | 0 |
| Calendar API calls during navigation after startup | 90 | 6 | −84 (−93.3%) |
| Total calendar API calls | 94 | 10 | −84 (−89.4%) |
| Time until the hook published events, median | 169.0 ms | 145.9 ms | −23.1 ms |

The timing is a fixture measurement over three runs. It covers data publication inside the hook.

## October 2026 · Calendar-list reuse and earlier event rendering

Compared [0ee58ac](https://github.com/VeneratedApotheosis/SoCal/commit/0ee58ac) with [9594dc6](https://github.com/VeneratedApotheosis/SoCal/commit/9594dc6). The event loader began reusing the sidebar’s calendar list and publishing expanded events before recurring-series details arrived. Two startup effects could still trigger the same event fetch.

The live comparison used the same Google account across 20 signed-in reloads per build with HTTP asset caching disabled. All 40 showed a visible event. Request counts cover app API calls and exclude static assets and browser preflights.

| Live metric, cache disabled | Before | After | Change |
| --- | ---: | ---: | ---: |
| Time to first visible event, median | 2,597.3 ms | 2,167.9 ms | −429.4 ms (−16.5%) |
| Time to first visible event, p90 | 3,069.5 ms | 2,873.7 ms | −195.8 ms (−6.4%) |
| Time to last startup API response, median | 2,609.6 ms | 2,763.0 ms | +153.4 ms (+5.9%) |
| Calendar-list requests per reload | 3 | 1 | −2 (−66.7%) |
| Expanded event requests per reload | 16 | 32 | +16 (+100%) |
| Recurring-series requests per reload | 16 | 32 | +16 (+100%) |
| Total observed API calls per reload | 79 | 92 | +13 (+16.5%) |

Median response latency per call moved from 690.0 to 332.3 ms for the calendar list, from 324.8 to 346.1 ms for expanded events, and from 292.0 to 319.0 ms for recurring series. Showing events sooner improved perceived startup even though duplicate event calls increased total traffic and the final response arrived later.

The smaller cache-enabled sample showed a similar first-event improvement, from 2,690.3 to 2,036.5 ms (24.3%) across eight measured loads per build. One additional baseline reload did not show an event within the observation window. A restart briefly overlapped two tabs before Google began returning HTTP 403. The overlapping runs were excluded. The first six runs used a 30-second observation window. Later runs used eight seconds after the initial startup traffic finished within about 4.2 seconds.

A separate 20-run fixture per build reproduced the tradeoff. Calendar calls moved from four to five while the hook published events after a median of 156.2 ms before and 86.2 ms after.

Two nearby changes were reviewed in the commit history. [b6ea902](https://github.com/VeneratedApotheosis/SoCal/commit/b6ea902) moved backend calls from Express to Supabase, and [4b29e2f](https://github.com/VeneratedApotheosis/SoCal/commit/4b29e2f) prevented premature preference writes during startup. Neither change has a separate latency measurement.

## PR #28 · On-demand recurring-series details

[PR #28](https://github.com/VeneratedApotheosis/SoCal/pull/28) removed the startup sweep for recurring-series details. The editor fetches the series master when an editable recurring event opens and reuses cached data for later reads.

Across five signed-in browser reloads per build against the preceding main branch, total observed startup API calls fell from 43 to 27 (37.2%) and recurring-series calls fell from 16 to zero. Median time to first visible event went from 3.33 s to 3.63 s in that sample.

## PR #29 · On-demand sharing permissions

Compared merged PR #28 at 87603d4 with PR #29 at 15f8c1e. The actual calendar-list hooks ran against the same 16-calendar fixture, with six owned calendars. The fixture scheduled calendar-list responses after 25 ms and permissions responses after 50 ms, with permissions requests running concurrently. Each version ran 20 times.

| Calendar-list flow | Before | After | Change |
| --- | ---: | ---: | ---: |
| Requests during startup | 7 | 1 | −6 (−85.7%) |
| Requests on first Shared Calendars open after startup | 0 | 6 | +6 |
| Startup plus first Shared Calendars open | 7 | 7 | 0 |
| Follow-up reads after one calendar's permissions change | 7 | 1 | −6 (−85.7%) |

| Timing | Before median / p95 | After median / p95 |
| --- | ---: | ---: |
| Calendar metadata available | 32.375 / 34.732 ms | 31.720 / 35.448 ms |
| Startup calendar-list work complete | 84.092 / 95.371 ms | 31.723 / 35.454 ms |
| First panel open to permissions ready | 0.000 / 0.001 ms | 51.815 / 64.418 ms |
| Follow-up read after one permissions change | 84.004 / 97.668 ms | 55.425 / 65.247 ms |

The earlier build could publish calendar metadata before permissions finished, so moving ACL calls out of startup saved background traffic while metadata availability stayed similar. The cost moves to the first panel open for users who visit it. The 85.7% reduction applies to the calendar-list workflow in this fixture. Signed-in network latency, full-page load time, and total app request counts remain unmeasured for PR #29.
