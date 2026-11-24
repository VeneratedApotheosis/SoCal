# Calendar settings performance benchmark

This report measures alphabetical sorting in PR #30 separately from on-demand sharing in PR #29. The benchmarks ran locally with Node 24.22.1 using synthetic calendar records and responses.

## PR #30 · Alphabetical sorting

Compared the sorting changes with PR #29 at commit 15f8c1e. Shared Calendars sorts calendar names and user IDs. Subscribed Calendars sorts calendar names within each owner group and keeps Other at the bottom.

**API request change was zero.** Sorting uses the calendar and permissions data already in memory. The request hooks and panel loading behavior are identical on both sides of this comparison.

The table reports time to derive the shared calendar list, By User view, and subscribed owner groups together. Each fixture used mixed-case names, four owner groups, and eight users. I verified alphabetical ordering and alternated baseline and updated runs for 1,000 samples each after warmup.

| Calendars | Baseline median / p95 | Sorted median / p95 | Median change |
| --- | ---: | ---: | ---: |
| 16 | 0.002 / 0.006 ms | 0.005 / 0.012 ms | +0.003 ms |
| 500 | 0.028 / 0.044 ms | 0.081 / 0.124 ms | +0.053 ms |

The final implementation reuses a case-insensitive collator for each list. These timings cover list derivation. Browser rendering and interaction latency remain unmeasured.

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

The earlier build could publish calendar metadata before permissions finished, so moving ACL calls out of startup saved background traffic while metadata availability stayed similar. The cost moves to the first panel open for users who visit it. The 85.7% reduction applies to the calendar-list workflow in this fixture. Signed-in network latency, full-page load time, and total app request counts remain unmeasured for PR #29 and PR #30.
