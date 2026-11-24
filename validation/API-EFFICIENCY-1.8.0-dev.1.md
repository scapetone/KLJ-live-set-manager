# API-efficiency test build — 1.8.0-dev.1

6 November 2026. Branch: `codex/api-efficiency-test`. Baseline: stable v1.7.0
(`e953ab118ba63469055722405e60b86a6c627e64`). No public release or installed device is
replaced. This candidate preserves MIDI Monitor IN/OFF activation.

## Plan implemented

1. **Remove duplicate value reads.** Read the current value once; if it differs,
   keep the existing guard, setter and read-back. Already-correct values cause no
   write or second getter. Manual changes are still detected on the next recall.
2. **Reuse LiveAPI handles and inventory.** Retain handles for current normal
   tracks and only the current clip/slot. Prune track handles on inventory updates,
   reject invalid handles and clear all caches on shutdown. The recall name scan
   uses known MIDI IDs instead of querying every track's input type again.
3. **Keep fresh safety checks.** When a MIDI/Push write is needed, read MIDI names
   once for that recall, then validate membership, current eligibility, frozen
   state and name for each command. A changed track list invalidates the context.
   No cached monitoring value is used to decide whether to write.
4. **Reduce clip/diagnostic work.** Confirmation checks identity and playing state
   without rereading the name. Coalesce pending clip checks explicitly, preserving
   immediate stop detection, quantized-launch retries and the existing gate.
   Reuse verified song/Push values for diagnostics. A configuration without a
   Push target reports `selectedTrack: null` instead of reading it just for logging.
5. **Measure and package separately.** Add aggregate explicit get/set/constructor
   counts to the existing recall log. Run regression tests and compare exact
   write logs against stable. Build a distinct six-file test ZIP.

No new timer, polling, dependencies, delayed musical command or background file
I/O is added. The model, UI and script runner are byte-identical to stable.
The Max patch differs only in the compact version label. Schema v1, parameter
identity, row/track keys, user names and scripts are unchanged.

## Why some calls remain

For the saved Set's scene-2 transition, explicit getter counts break down as:

| Work | Stable | Candidate | Reason |
|---|---:|---:|---|
| Control clip detection and confirmation | 12 | 11 | Keep a fresh identity/play check; read the name once |
| 30 MIDI monitoring comparisons/read-backs | 60 | 32 | One comparison each; read back the two changed values |
| Name/ambiguity context | 69 | 31 | One track-list read and 30 fresh MIDI names; remove 38 repeated input-type reads |
| Safety guards for three writes | 18 | 18 | Current membership and target eligibility before each write |
| Song/Push values and diagnostics | 12 | 5 | Reuse already-read/verified values |
| **Total** | **171** | **97** | **43% fewer explicit getters** |

Fresh names deliberately remain: the existing tests show that a duplicate rename
can arrive before its observer notification. Dropping the scan would weaken this
protection. Checking membership again for each write also catches changes caused
between two commands. There is still work proportional to the number of actual
target changes; this iteration does not remove those safety checks to reach an
artificially small API count.

The handle cache stores no property values or persistent IDs. LiveAPI's default
mode follows an object when moved; IDs are session-specific and must not be
persisted across runs. See the official [LiveAPI reference](https://docs.cycling74.com/apiref/js/liveapi/).

## Evidence: simulated operation counts

The same fake host executes stable and candidate scripts. These are counts of
explicit `.get()`, `.set()` and constructor invocations, **not CPU measurements,
native callback traces or measured audio/Push latency**. Attribute accessors,
observer registration, Max/Live internals and user-script API calls in the
separate runner are not counted. The queue does not reproduce native callback
timing or initial observer notifications automatically.

### Saved Set fixture (private assets stay local)

The last saved fixture contains 39 normal tracks, 30 managed MIDI tracks and 24
configurations. Each case uses the same specified preceding state in both runs;
these numbers do not predict every possible transition to a scene.

| Target scene / preceding state | Getters before → after | Constructors before → after | Setters, both |
|---|---:|---:|---:|
| 1 / all MIDI OFF, 120 BPM | 171 → 97 | 81 → 3 | 3 |
| 2 / scene 1 | 171 → 97 | 81 → 3 | 3 |
| 10 / last configured scene 6 | 183 → 111 | 85 → 3 | 5 |
| 15 / scene 14 | 84 → 46 | 37 → 3 | 1 |
| 20 / scene 19 | 84 → 45 | 37 → 3 | 0 |

All 16 local scenarios retain the exact write targets, values and order, including
separate/coalesced callbacks, stop/restart, identical-name clips and a dirty
inventory. Repeating 20 pending-launch retries retains 126 reads, while reducing
constructors from 64 to 3. Ten stable-playback status notifications retain the
stop checks: 120 → 110 reads and 60 → 0 constructors. There are no redundant
setters in these scenarios before or after.

### Portable scaling fixture

| Tracks / MIDI / configurations | Case | Getters before → after | Constructors before → after | Setters, both |
|---|---|---:|---:|---:|
| 41 / 32 / 15 | Already correct | 88 → 47 | 38 → 0 | 0 |
| 41 / 32 / 15 | Everything changes | 359 → 314 | 144 → 2 | 36 |
| 60 / 51 / 30 | Already correct | 126 → 66 | 57 → 0 | 0 |
| 60 / 51 / 30 | Everything changes | 549 → 485 | 220 → 2 | 55 |

All 65 portable scenarios have identical write logs; all ten recall scenarios
reduce both getters and constructors. Constructor counts include cold accesses
where applicable; already-correct cases are primed by the harness. A real clip
change also creates its playing-status observer. Results and scope are recorded
in [api-efficiency-dev1.json](api-efficiency-dev1.json). Reproduction commands are
in [DEVELOPMENT.md](../docs/DEVELOPMENT.md#api-efficiency-candidate-v180-dev1).

## Validation and limits

- 72 Node tests pass. Six new cases cover no-op/read-back behavior, bounded handle
  reuse/pruning/shutdown, invalid native handles, callback coalescing with a
  stop/start, stale-clip rejection and independently counted diagnostic totals.
- Existing tests retain audio-track protection, fresh per-write guards, late
  duplicate names, manual changes, Follow Action-style clip changes, saved state,
  scripts, frozen CLIP, resize and menus. These remain simulated tests.
- Native AMPF/MIDI-container validation and source/embedded-editor checks pass;
  Blob / Stored Only identity is unchanged. The ZIP contains exactly six files
  and passes clean extraction and byte comparison checks.
- No native Max or Live/Push playback test has been performed for this candidate.
  Native CPU, audio crackles, first-launch behavior and physical Push readiness
  remain to be checked by the musician. Fewer constructors may reduce allocation
  and cleanup pressure; that causal effect is a hypothesis, not a measurement.

## Musician test

Use the prepared private copy of the saved Set, with the candidate in its own
folder; keep the current stable Set/device intact. Verify the compact title
**V1.8.0-dev.1** and that configurations are present before saving anything.

1. Close the KLJ editor. Reproduce the same scene sequences and cold/first launch
   conditions used with stable. Prioritize scenes 1, 2 and 15; compare 10 and 20.
   Record whether crackles occur and the maximum CPU shown by Live. Repeat warm
   launches separately. Different preceding configurations change the workload.
2. Verify immediate configuration recall and Push selection, MIDI Monitor IN/OFF,
   BPM/root/scale and Follow Actions. Audio tracks must remain unchanged.
3. Open the editor, check menus/scroll/resize and one configuration edit. Save,
   close and reopen **the copy**; confirm all rows, names and scripts survive.
4. If crackles persist, collect the existing `KLJ recall` lines for the affected
   transitions. `apiCalls` covers the successful engine check/recall, not all
   callbacks surrounding a scene launch. Full A/B isolation of writes versus
   observation/reads would then require the separately discussed dry-run test;
   this candidate does not add that mode or change musical command timing.
