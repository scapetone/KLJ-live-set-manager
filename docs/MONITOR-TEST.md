# Monitor IN/OFF — minimal-change analysis and test variant

Base: stable **v1.6.0**, commit `4157310251c9ce9086ed062400428a85b24a8471`. Candidate: **1.7.0-dev.1**, branch `codex/monitor-in-off-test`. This document records the local test build before publication. The author later approved it for [v1.7.0 release](../validation/RELEASE-1.7.0.md); older release assets and installations are retained.

## Musician validation received

On 6 November 2026, the author reported: **“tests ok, testé sur mon vrai set live de test avec le plugin remplacé !”** This confirms successful testing of the Monitor candidate in their real test Live Set after replacing the existing plugin, rather than only inserting a fresh empty instance. The candidate is accepted in that setup based on musician feedback. No independent native Max execution, latency measurement or detailed per-field ALS round-trip observation is inferred from this report. The exact prepared-copy loading path was not specified. Scene-start crackle diagnosis remains outside this iteration. The author subsequently requested publication of this validated version as v1.7.0.

## Request and rationale

The author reports that muted MIDI tracks still received Push notes in their setup, and manually setting unused instruments' tracks to Monitor OFF removed first-note CPU crackles in their trials. They explicitly authorize replacing built-in MIDI mute control with monitoring. This establishes the necessity required by the maintenance instructions for this narrow Monitor change. It does not establish the cause of scene-start crackles, which is outside this iteration.

## Minimal change

The model's saved `enabled` values and ON/OFF cells already express musical intent independently of Live's control property. Keep the model, schema, identifiers, UI, runner and all other mechanisms intact. Change only the LiveAPI adapter in `recall`:

```js
// The unchanged model's legacy callback sends 0 for active and 1 for inactive.
setIfDifferent(apiId(t.id), "current_monitoring_state", value === 0 ? 0 : 2,
    function () {return checkedTrack(t);});
```

| Saved state / cell | Legacy callback input | Requested monitoring |
|---|---:|---|
| ON / `enabled[key] === 1` | 0 | IN (0) |
| OFF / `enabled[key] === 0` | 1 | OFF (2) |

The internal callback stays named `mute` to avoid changing the shared model contract; it no longer writes Live's mute property. The [Cycling '74 LOM reference](https://docs.cycling74.com/legacy/max7/vignettes/live_object_model) documents `current_monitoring_state` as get/set/observe, 0=In, 1=Auto, 2=Off, excluding return/master. The current online Track reference omits this property, so availability and read-back must still be confirmed in the actual Live 12 / Max 9 host. No unsupported-property fallback is introduced: failure is reported through the existing warning path.

- Reuse the stable `setIfDifferent`, shared per-recall name scan and fresh write-boundary guards. No new observers, scans, timers or parameter writes.
- Read current monitoring values and write only actual changes; verify the resulting value. Never write Auto (1), Arm, mute, volume, routing or Device Activator.
- Target only eligible normal MIDI tracks, including empty ones. Exclude the control track, audio tracks, groups, returns, master, missing, ambiguous or frozen targets, using the unchanged stable guards.
- Keep BPM/root/scale → MIDI state → Push selection → script ordering, clip/Follow Action handling, Gate deduplication, startup behavior, persistence and scripts unchanged.
- ON/OFF in existing configurations gains the requested Monitor meaning without rewriting any saved values. Opening the editor or refreshing tracks does not apply a configuration.

## Essential test preparation

**Monitor IN does not undo a mute left by v1.6.0.** In the test copy only, manually enable the MIDI Track Activators needed for the test; leave the eight audio tracks untouched. The candidate intentionally does not unmute tracks or enable instruments/devices, and does not change Arm/routing. First trigger a known configuration before playing notes, since the candidate does not apply a row merely on load.

Use a separate copy of the Set and a separate candidate folder. Preserve the stable installation and original ALS. Do not run the stable and candidate instances side by side on the same control track: they would issue competing commands. Retain the configured instance by redirecting only the copy's runtime reference, rather than deleting/reinserting it. A newly inserted instance is empty.

Custom scripts are preserved verbatim and remain unsandboxed; a script that explicitly issues mute or Device On commands still does so. This restriction applies to the built-in path, not by rewriting user code.

## Verification performed

- **66 Node tests pass**, using simulated Max/LiveAPI. Existing musical, UI, scaled-recall, persistence and guard tests now verify the monitoring property with the same behavior outside activation.
- Additional tests cover eight audio tracks with mixed mute/monitor/volume values unchanged; MIDI mute and device parameter values unchanged; AUTO manually set before recall corrected to IN/OFF; no-op suppression; changed values corrected on a later actual clip start; and unavailable/refused monitoring reported without mute/Arm fallback. The next valid launch still works after an error.
- Model, UI and runner JS are byte-identical to stable v1.6.0. In the engine, the adapter substitution and its explanatory comments are the only changes. The AMXD patch differs only by its test-version title, **V1.7-dev.1 Monitor**. The saved parameter and schema are unchanged.
- Native-container validator and six-file packaging/extraction checks pass. No Live Set or private asset is included in Git or the ZIP.
- Ten simulated before/after recall comparisons show **identical API construction/read/write counts** and identical target/order after mapping `mute` 0/1 to monitoring 0/2. At 41 tracks / 32 MIDI / 15 rows: **88 reads** for an already-correct recall and **359** when everything changes, as in stable v1.6.0. See [counts](../validation/monitor-performance-dev1.json).
- These counts do not prove equal native setter latency or Push playability. The automated pass did not execute a native Max/Live/Push or ALS round-trip test. The author subsequently reported successful testing in their real test Live Set with the plugin replaced, as recorded above; no independent native measurement or exhaustive checklist is claimed.

## Musician acceptance test

1. Open only the test copy, with its candidate installation adjacent to all four JS files. Confirm **V1.7-dev.1 Monitor** and the existing rows/scripts.
2. Manually enable the Track Activators of the MIDI tracks being tested. Do not change audio tracks, Arm or instrument Device Activators.
3. Trigger two existing configurations with different MIDI/Push targets. ON cells must show Monitor IN, OFF cells Monitor OFF. MIDI Track Activators must stay as set manually; all eight audio tracks must stay unchanged.
4. Play Push and the keyboard. Check intended simultaneous ON instruments, input isolation of OFF tracks and the actual selected Push instrument. Compare transition responsiveness with stable v1.6.0, with the editor closed and then open. Note first and later transitions separately.
5. Test a scene, Follow Action, loop and stop/restart for configuration behavior, without investigating scene-start crackles. Test tempo/root/scale and a custom script.
6. Set an eligible MIDI monitor to Auto manually, then launch another recognized control clip: its row must restore the requested IN/OFF state. A natural loop must not reapply the row.
7. Save/close/reopen only the test copy; compare rows, keys, values and scripts. Retain stable files and the original ALS for rollback.
8. Report any `current_monitoring_state` error verbatim. Never compensate by enabling an automatic mute/Arm fallback or editing the eight audio tracks.

## Local handoff

The Desktop test folder contains the six adjacent candidate files, its ZIP and an unchanged stable v1.6.0 ZIP for reference, plus French instructions. A private copy of the previously saved test ALS was created in the same project to retain sample paths. Only two absolute and two relative AMXD reference values were redirected to the separate candidate folder; reversing those replacements reproduces the source XML exactly, including configuration data. The source ALS and active installation were not written. These private paths and assets stay outside Git. Native loading of that copy remains untested.
