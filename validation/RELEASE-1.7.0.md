# v1.7.0 release validation

Date: 6 November 2026. Validated candidate: **1.7.0-dev.1 Monitor**.

## Scope and compatibility

v1.7.0 replaces built-in MIDI Track Activator/Mute commands with **Monitor IN/OFF**. Matrix ON requests `current_monitoring_state = 0` (IN); OFF requests `2` (OFF). Auto is never requested. The existing guard, current-value comparison, setter read-back and error path are reused. The internal model callback retains its legacy name `mute`; only its LiveAPI adapter changes.

Built-in commands do not write mute, Arm, routing, volume or Device Activators. Eligible targets remain normal MIDI tracks; audio tracks, the control track, groups, returns, master, missing/ambiguous/frozen targets are excluded. User scripts are preserved verbatim and remain unsandboxed, so any explicit user-written commands still run.

Clip starts and Follow Actions, loop deduplication, BPM/root/scale, Push track selection, free JavaScript, the English editor, frozen CLIP column, resize behavior and state restoration are retained. The schema stays **version 1**, with the same `state` ID, `pattr klj_state`, `KLJ Configurations` Blob / Stored Only parameter, row IDs, track keys, names, scripts and legacy data. No data migration or re-entry is required for supported v1.5.1/v1.6.0 configurations.

**This is an intentional activation behavior change.** Monitor IN does not undo a mute left by a previous version or turn on a disabled instrument. Upgraders must manually enable the MIDI Track Activators they intend to play, leaving audio tracks untouched. There is no automatic unmute/Device On fallback. The existing configured instance should be retained while replacing all runtime files together, with Live closed; see [update instructions](../INSTALLATION.md#updating-from-a-previous-version).

## Checks performed

- **66 Node tests pass, zero failures**, with simulated Max/LiveAPI. They include full recall, no-op suppression, manual monitoring changes, exact IN/OFF mapping, eight audio tracks with mixed monitor/mute/volume values untouched, MIDI mutes and Device Activator values untouched, safe target rejection and unavailable/refused monitoring recovery without fallback.
- Native-container validator passes: 76 source boxes, 23 root boxes/cords, native MIDI AMPF metadata, source/binary editor identity, required scripting names, dependencies and unchanged persistence parameter.
- The six-file ZIP passes clean-directory extraction, byte comparisons and reproducible packaging. It contains exactly the AMXD, four adjacent JS files and English README.txt. Hashes/file list are in [release-v1.7.0.json](release-v1.7.0.json).
- All four runtime JS files are **byte-identical to the author-tested 1.7.0-dev.1 ZIP**. Decoded AMXD differs only in the compact version title, now **V1.7.0**. Compared with v1.6.0, the model, UI and runner remain byte-identical, and only the engine's activation adapter and explanatory comments change.
- Ten simulated recall comparisons retain the exact API construction/read/write counts from v1.6.0. At 41 tracks / 32 MIDI / 15 configurations: 88 reads when already correct, 359 when all requested values change. Targets/order match after mapping mute 0/1 to monitoring 0/2. These are operation counts, not native setter latency or measured Push readiness. See [comparison](monitor-performance-dev1.json).
- Private Sets/assets, generated harnesses, local distributions and personal paths are excluded from Git and the ZIP. No license terms or runtime dependencies are added.

## Musician evidence and limits

The author initially reported that manually setting unused MIDI tracks to Monitor OFF removed the first-note CPU crackles observed in their setup. After receiving the test build, they confirmed **“tests ok, testé sur mon vrai set live de test avec le plugin remplacé !”**, then explicitly requested release. This establishes musician acceptance in their real test Live Set with the existing plugin replaced, rather than only a new empty instance.

Release preparation does not claim an independently executed native Max session, exhaustive hardware checklist, measured latency benchmark or independently observed per-field ALS save/reopen. The author did not specify that they used the automatically prepared private Set copy, so loading that exact copy is not inferred. The four candidate JS files are preserved to retain the accepted behavior.

Scene-start crackle diagnosis is explicitly outside this release. Push layouts remain manual; same-slot relaunches without an observed stop/play transition retain the known limitation. Current-value/property errors remain visible, without a mute or Arm fallback. See [the manual checklist](../LIVE_TESTS.md) and [the original minimal-change analysis](../docs/MONITOR-TEST.md).

The v1.6.0 and v1.5.1 tags and release assets are retained unchanged for rollback. Keep both a previous installation and an original Set backup: reverting the runtime alone does not reset manually changed monitor/Track Activator states in an already saved test Set.
