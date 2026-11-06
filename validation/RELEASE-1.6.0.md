# v1.6.0 release validation

Date: 6 November 2026.

## Released behavior

v1.6.0 promotes the final **1.6.0-dev.4** candidate tested by the project author. Compared with v1.5.1, it removes repeated background full-Set scans, groups structural notifications, suspends hidden-editor work, adds REFRESH TRACKS, protects unknown/failed state restoration and shares track-name checks within each musical recall. The MIDI effect, clip matching/deduplication, BPM/root/scale, MIDI activation, Push track selection, optional JavaScript and schema version 1 remain supported. Push layouts, Arm and Monitor remain manual.

The release preparation changes only the compact version label and distribution/development documents relative to dev.4. **All four runtime JS files are byte-for-byte identical to the author-tested dev.4 ZIP.** Decoded AMXD JSON differs only in the compact title, now `KLJ / LIVE MANAGER  V1.6.0`; the editor, wiring, parameter identity and empty shipped state are unchanged.

## Evidence

- **63 Node tests pass, zero failures**, using simulated Max/LiveAPI. These cover existing state, corrupt/late restoration, retained unresolved references, scripts, clip event behavior, UI interactions, scaled recalls and write-boundary MIDI protection.
- Source/native-container validation passes: 76 source Max boxes, 23 root boxes/cords, matching embedded editor, correct scripting names, MIDI AMPF metadata, four adjacent JS dependencies and Blob / Stored Only persistence parameter.
- The six-file ZIP passes extraction into a clean temporary directory and byte comparisons. Repeated packaging produces the same SHA-256. Hashes and file list are in [release-v1.6.0.json](release-v1.6.0.json).
- The schema remains 1. The `state` box ID, `pattr klj_state`, `KLJ Configurations` parameter, existing keys, user names/scripts and useful legacy fields are preserved. No new data migration is introduced. Follow [the update procedure](../INSTALLATION.md#updating-from-a-previous-version); retain the existing configured instance and replace all runtime files together with Live closed.
- Simulated recall counts at 41 tracks / 32 MIDI / 15 rows fall from dev.3's 2,728 reads to 359 when all requested values change, or 88 when already correct. Exact write targets/values/order match in ten before/after scenarios. These are API counts, not measured Live latency or a real-time guarantee. See [recall investigation](RECALL-LATENCY-2026-11-04.md).
- Private Live Sets, recordings, generated harnesses, local distributions and personal paths are excluded from the publishable tree. No license terms or extra runtime dependencies are added.
- The pre-existing upstream README edit is retained. The v1.5.1 tag and original release asset remain available unchanged; its ZIP digest is `933de4c151b1c21d125aecf94f7667728dc7ee2d48ed791c7b42826f3088300a`.

## Musician feedback and limits

The author confirmed that the dev.2 editor opens and ordinary Live editing is fluid, then confirmed functional automation tests on the corrected candidate. After reporting excessive clip-to-Push delay, they tested the final dev.4 correction and on 6 November 2026 replied **“C'est parfait, déploie cette version sur Github”**, authorizing this release.

This is musician acceptance of the final candidate in their Live setup, not an independently timed Ableton/Push benchmark. The release packaging pass does not claim a new native Max execution, hardware test, exhaustive failure matrix or independently observed ALS save/reopen. Earlier failed native automation attempts remain documented in the historical reports. A detailed before/after comparison of every saved field after ALS reopening was not separately supplied with the final approval; automated fixtures and unchanged parameter identity provide structural evidence, not a universal host-level guarantee.

User scripts remain unsandboxed. Naming/structure edits are not atomic with a recall; the implementation checks actual target eligibility at write boundaries and skips detected changed targets. Same-slot relaunches without an observed stop/play transition retain the known limitation. See [the manual checklist](../LIVE_TESTS.md) for testing another Set or Live/Max version.
