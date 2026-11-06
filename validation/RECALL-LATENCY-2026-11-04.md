# Recall latency — targeted dev.4 correction

> Historical development report from 4 November 2026. The author later approved the final candidate for v1.6.0 publication on 6 November; see [release evidence](RELEASE-1.6.0.md).

Date: 4 November 2026. Baseline: local **1.6.0-dev.3** ZIP. Candidate: **1.6.0-dev.4**, branch `codex/performance-phase1`. No public Release change, commit or push.

## Observation and demonstrated work

The musician reports that ordinary editing is now fluid and functional automation tests pass, but playing an instrument through Push becomes possible only several seconds after the control clip starts. They explicitly distinguish this from launch quantization. There is no instrumented measurement of that real delay yet, nor a confirmed comparison of this symptom with the editor open/closed.

The dev.3 engine calls `guardedTrack` once per MIDI target and once for Push. Each call describes the target, traverses its devices despite all normal MIDI tracks being eligible, reads the Set's track list, and scans MIDI names across the Set. This repeated name scan costs O(M × T) bridge reads. It runs even when the current values already match. Push selection is deliberately after the MIDI states, so it waits for these repeated checks.

The executable Node harness measured **2,728 LiveAPI reads and 1,425 API constructions** for a recall in a 41-track/32-managed-MIDI/15-row example with one device per MIDI track. There are zero setters in the already-correct case. This proves unnecessary work on the recall path; it does not establish how many milliseconds each operation costs in Live or prove that this is the only cause of the musician's delay.

## Correction

- Read the fresh MIDI names/ambiguities once, lazily, within one synchronous recall. Discard that context afterward; never use the previous clip's snapshot or persist it.
- Read actual mute/selected_track values first. A read-only no-op needs no write guard. Every actual MIDI mute or Push selection write still invokes the guarded path and verifies the result.
- At each guarded command, re-read normal-track membership, target name, MIDI/audio/group eligibility and frozen state. Reject changed names, missing targets or a changed track list. Observed inventory changes invalidate subsequent guarded commands and trigger the existing grouped refresh. Control/audio/return/master targets remain excluded.
- Remove instrument/device-chain traversal from target description: an instrument is not required for eligibility and the field was unused by the guard. No Arm, Monitor, volume or audio-track setter is added.
- Preserve the existing BPM/root/scale → MIDI states → Push → script sequence. Preserve clip detection, Gate deduplication, pending-play retry, editor/rendering implementation, pattr parameter, state format, keys, names and user scripts.
- Add diagnostic wall-clock timing to the existing recall log. It is runtime metadata only, outside the saved model, and adds no periodic task.

Name ambiguity is a fresh per-recall snapshot, not an atomic transaction with Live. A target's own name/type and membership are checked at each write, and observed changes invalidate the remaining commands. A concurrent rename elsewhere after the name snapshot can be detected only when its notification is delivered or at the next snapshot. LiveAPI offers no atomic Set-wide lock; concurrent structure/name editing during a musical transition still needs native validation. Audio eligibility is always re-read at the write boundary.

## Before/after counts — simulated LiveAPI only

Editor closed, scripts empty, same inputs and same production-code harness for both versions:

| Set / managed MIDI / rows | Scenario | Reads dev.3 → dev.4 | API constructions dev.3 → dev.4 | Setters before/after |
|---|---|---:|---:|---:|
| 41 / 32 / 15 | Already correct | 2,728 → 88 | 1,425 → 38 | 0 / 0 |
| 41 / 32 / 15 | All MIDI states, tempo/key and Push change | 2,728 → 359 | 1,425 → 144 | 36 / 36 |
| 60 / 51 / 30 | Already correct | 6,262 → 126 | 3,230 → 57 | 0 / 0 |
| 60 / 51 / 30 | All MIDI states, tempo/key and Push change | 6,262 → 549 | 3,230 → 220 | 55 / 55 |

At 41/32/15 this is about **97% fewer reads** for a no-op and **87% fewer reads** for an entirely changed configuration. These percentages describe counts, not a speedup measured in Live. All ten recall comparisons (including 1/15/30 rows, eight-device chains and 8 KiB scripts) produce exactly identical API write targets, values and order. The fake host does not execute user scripts through native Max outlets or model hardware effects.

The one/eight-device results are identical in dev.4 because the guard no longer traverses device chains. At fixed track count, changing row count does not change these recall API counts. Raw comparison: [performance-recall-dev4.json](performance-recall-dev4.json). Full local runs remain in ignored `validation/local/performance/`.

Reproduce with `KLJ_AUDIT_CLOSED=1 node tests/performance/audit.cjs`. Use `KLJ_AUDIT_DEVICE` pointing to the extracted dev.3 scripts for the baseline. No guard bypass is used for the published before/after counts; the separate historical isolation scenario remains diagnostic only.

## Verification

- **63 Node tests pass**, including scaled recalls, one name scan per recall, no-op handling, stale manual values corrected on the next recall, no cross-recall cache, duplicates without a delivered rename notification, and fresh guards after an earlier MIDI write changes a later target to audio/group/frozen/missing/renamed or changes structure. A delivered name notification invalidates the batch. Timing does not change persistence or clip deduplication.
- Existing tests cover clip starts/quantization/loops/Follow Action-style slot changes, BPM/root/scale, Push selection, script error recovery, restore safety, existing schema/legacy data and UI interactions against simulated Max/LiveAPI.
- Native-container validator passes: all patch cords, native MIDI container, source/binary editor identity, scripting names and Blob / Stored Only parameter. dev.3 and dev.4 AMXD JSON differ only by the compact version label. Model, UI and runner JS are byte-identical to dev.3.
- Six-file ZIP passes clean extraction and byte comparisons. The public v1.5.1 tag and asset are not modified. The dev.4 files are staged on the Desktop without replacing the active installation or editing any ALS.
- **No native Max execution, Live latency benchmark or Push hardware test of dev.4 is claimed.** Native-container validation is structural. The musician's successful automation tests and fluidity report concern the prior candidate.

## Reading the diagnostic log

`KLJ recall:` includes `timings` in milliseconds:

- `notificationToRecallMs`: first received notification to recall entry for that deferred check. This is not physical clip-onset latency; some retry/direct calls have no timestamp.
- `inventoryMs`: refresh work before matching/recall if the inventory was dirty.
- `nameScanMs`: the shared name scan, absent when no guarded write was needed. It is already included in `applyMs`.
- `applyMs`: standard BPM/key/MIDI/Push operations, including API read-back verification.
- `pushSelectedAfterMs`: recall entry to verified Live selected_track; absent if no Push target or selection fails. **This does not prove the pads are playable.**
- `uiMs`: status/highlight work after standard application.
- `scriptDispatchMs`: synchronous time around script dispatch, if present. It does not measure asynchronous script work or guarantee native runner completion.
- `totalMs`: recall entry through UI and script dispatch, before console output. Timings overlap and should not be summed.

The [LiveAPI documentation](https://docs.cycling74.com/apiref/js/liveapi/) specifies low-priority execution. Reducing calls does not establish a hard real-time latency guarantee. The [Track properties](https://docs.cycling74.com/apiref/lom/track/) support the retained membership/type/state checks.

## Native acceptance still required

Use the existing test ALS and the six-file dev.4 update, leaving the original Set and v1.5.1 backup intact. Alternate two clips selecting different Push instruments five times, first with KLJ closed, then open; distinguish first and warm recalls. Compare actual clip playback to playable pads, and note selection versus sound availability. Repeat a scene/Follow Action and a custom-script row, then save/reopen the test ALS. See [LIVE_TESTS.md](../LIVE_TESTS.md#dev4-recall-latency-check).

If the delay remains, collect the recall log before changing the architecture further. Large `applyMs` suggests API/setter or instrument-transition costs; large `uiMs` suggests drawing; long dispatch suggests synchronous user code; a large notification-to-recall value suggests callback/queue contention. Fast engine timings with late Push playability require investigating the native Push/instrument path separately. These are diagnostic interpretations, not established causes in the real Set.
