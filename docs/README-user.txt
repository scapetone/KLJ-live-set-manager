KLJ Live Set Manager — v1.7.0
Max for Live MIDI effect for Ableton Live 12 and Push 2

INSTALL
1. Unzip this archive into a permanent folder.
2. Keep the .amxd and all four klj.*.js files together in that folder.
3. Load KLJ Live Set Manager.amxd on the MIDI track containing your control clips.
4. Click OPEN CONFIGURATIONS. Add a row whose CLIP name matches a control clip.
5. Set BPM, ROOT, SCALE, MIDI ON/OFF states and the PUSH target. Save your Live Set.

Matrix ON = Monitor IN; matrix OFF = Monitor OFF on eligible MIDI tracks.
The configuration is recalled when the matching clip actually starts playing.
Editing a row does not apply it. Data and JavaScript are stored in the Live Set.
New rows start with all managed MIDI tracks OFF; configure them before playback.

Click ROOT/SCALE/PUSH, then open the native selector. Double-click CLIP/BPM to edit.
MORE opens the optional JavaScript panel. CLIP stays visible while scrolling.

MIDI INPUTS AND PUSH
Configure MIDI inputs manually. The device controls Monitor IN/OFF only on
eligible MIDI tracks; Arm is unchanged. Push track selection is automatic;
choose Push's playing layout manually.
Audio tracks, return tracks, groups, master and the control track are excluded.

UPDATING AN EXISTING SET
Back up your Set and its device folder first. Do not delete an existing instance
until its saved configurations have been recovered. A newly inserted device is empty.
To retain the instance, close Live and replace its referenced AMXD with this AMXD,
keeping the old filename, plus the four adjacent JS files. Reopen a copy of the Set
and verify that all configurations are present before saving. No data migration is
required. The internal device title must show V1.7.0.
Complete a save/close/reopen test before relying on this upgrade.

LIMITATIONS
A same-slot retrigger without an observable stop/play transition may not be detected.
User JavaScript is not sandboxed: avoid infinite loops and do not alter audio stems.

Project, usage and support:
https://github.com/scapetone/KLJ-live-set-manager

PERFORMANCE AND RESTORATION
REFRESH TRACKS resynchronizes track identities without applying a configuration.
The background full-track scan is removed; track changes are observed.
Closing the editor suspends its mouse/layout polling and matrix rebuilds.
Unreadable saved data blocks edits, recall and saving by the device.
Unresolved saved track references are retained and reported, not silently deleted.
Keep the original Set and previous installation. Test an update on a copy first.

CONFIGURATION RECALL
Track-name checks are shared within each recall. Every monitor/Push write still checks
the live target's membership, MIDI/audio/group type and frozen state. No-op reads
do not scan the Set. No device chains are traversed during these checks.
Compare actual clip playback to playable Push pads with the editor closed/open.
The Max Console KLJ recall line includes diagnostic durations; these do not measure
hardware readiness or change saved configurations. Report any remaining delay.

UPGRADING FROM MUTE CONTROL
Test on a copy of your Set and preserve the previous installation.
Track Activators on managed MIDI tracks must be enabled manually,
including tracks left muted by the old version. This device does not unmute them
and never switches instruments' Device Activators. Leave all audio tracks as-is.
Monitor IN/OFF applies on the next recognized clip start, not when opening the UI.
Only MIDI monitoring is changed; no AUTO state or extra Arm/routing commands.
Existing configuration names, keys, scripts and saved ON/OFF values are unchanged.
If monitoring is unavailable or rejected, an error is shown; no mute fallback.
User scripts remain unchanged and may issue their own LiveAPI commands.
Check Push/keyboard input isolation and responsiveness, then save/reopen the test
copy. This release does not address scene-start crackle diagnosis.
