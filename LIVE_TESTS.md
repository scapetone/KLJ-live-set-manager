# v1.6.0 manual validation

Test updates on a backed-up copy of an existing configured Set. v1.6.0 promotes the author-approved dev.4 runtime; the public v1.5.1 Release is unchanged. See [Updating from a previous version](INSTALLATION.md#updating-from-a-previous-version), [release evidence](validation/RELEASE-1.6.0.md) and [data policy](docs/DATA_COMPATIBILITY.md). This checklist describes how to validate your own setup; it is not a claim that every step was independently observed.

## Existing-instance upgrade — required before publication

1. Open the test copy with the **v1.5.1 runtime**, confirm rows and scripts, save and close. Keep this saved copy and installation unchanged as the baseline.
2. Replace that installation's AMXD and four JS together, retaining the AMXD path/name. Open the same configured instance; do not delete/reinsert it.
3. Confirm title V1.6.0. Compare names/IDs/order, BPM, ROOT/SCALE, every MIDI state, track keys/associations, Push choices, full multiline scripts and inherited data. If a restore error appears, do not save over the baseline.
4. Save to a second ALS, close and reopen it. Recheck the data. An unchanged row count alone is insufficient evidence.
5. Test a fresh instance separately: no configurations until an intentional edit. An invalid or unsupported Blob must produce an error and no fallback save. Automated tests cover these error cases; native error injection must use a disposable Set only.

## Performance and music

With about 41 tracks/32 MIDI/15 rows, then 20–30 rows:

- Editor closed, transport stopped: create/rename/edit ordinary Live clips for a minute. Compare against v1.5.1 and note whether periodic stalls remain.
- Repeat during playback. Trigger manually, by scene and Follow Action; test quantization waiting, loops, stop/restart and two clips with the same name. A natural loop must not replay the script.
- Verify BPM/root/scale, MIDI activators, Push track selection and a script. Verify that audio-stem volumes/activators and Arm/Monitor are unchanged.
- Open/close the editor several times, including the native window close button. Only the open window should poll mouse/layout or rebuild cells. Reopening must display all changes made while closed.
- Use REFRESH TRACKS during an already playing clip: no configuration/script replay. Rename/move/add/delete MIDI tracks and check new OFF defaults without immediate writes.
- Change device chains on a MIDI track: the track stays eligible even when empty. Missing/offline-renamed saved references must warn and retain their states and Push association in the data.
- Check frozen CLIP, both scroll axes, menus after resize, script edits and saving/reopening.

dev.4 shares fresh track-name/ambiguity checks within a single synchronous recall and checks membership/type/frozen state at each actual MIDI/Push write. Read-only no-ops skip these write guards. Persistence and full rendering are unchanged from dev.3. Simulated operation counts are not Live latency measurements. Record actual responsiveness and worst recall delays before approving a release.

## dev.4 recall-latency check

1. Update the existing test instance using all six files, with Live closed. Confirm **V1.6.0** and the same configurations. These recall changes were tested by the author under the candidate label **V1.6-dev.4 Phase 1**.
2. Close the KLJ editor. Alternate two existing clips with different MIDI states and different Push targets at least five times. Measure from actual clip playback to playable Push pads, excluding quantization waiting. Note the first and subsequent recalls separately.
3. Repeat with the editor open. Test scenes and Follow Actions. Check tempo/root/scale, MIDI states, selection and custom JavaScript, including correction after a manual Track Activator change. Recalling equal values must not change the Set unnecessarily.
4. If a delay remains, capture the `KLJ recall:` line from the Max Console. Compare notification-to-recall, name scan, apply, Push selection, UI, script dispatch and total durations. A fast selected_track setter does not prove Push pads are immediately playable. Timing is diagnostic only and is never saved in configuration data.
5. On the copy only, verify duplicate MIDI names are skipped and rename/move/add/delete/frozen targets remain safe. Editing structure during a recall is not atomic: a detected change skips subsequent affected commands and schedules inventory refresh. No audio track, return, master, control track, Arm/Monitor or volume command may be issued.
6. Save/close/reopen the test ALS and check that all rows, track keys, Push references and scripts remain intact. Keep the original installation and original ALS available for rollback.
