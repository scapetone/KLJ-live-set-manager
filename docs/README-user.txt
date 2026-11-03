KLJ Live Set Manager — v1.5.1
Max for Live MIDI effect for Ableton Live 12 and Push 2

INSTALL
1. Unzip this archive into a permanent folder.
2. Keep the .amxd and all four klj.*.js files together in that folder.
3. Load KLJ Live Set Manager.amxd on the MIDI track containing your control clips.
4. Click OPEN CONFIGURATIONS. Add a row whose CLIP name matches a control clip.
5. Set BPM, ROOT, SCALE, MIDI ON/OFF states and the PUSH target. Save your Live Set.

The configuration is recalled when the matching clip actually starts playing.
Editing a row does not apply it. Data and JavaScript are stored in the Live Set.
New rows start with all managed MIDI tracks OFF; configure them before playback.

Click ROOT/SCALE/PUSH, then open the native selector. Double-click CLIP/BPM to edit.
MORE opens the optional JavaScript panel. CLIP stays visible while scrolling.

MIDI INPUTS AND PUSH
Configure MIDI inputs and Monitor manually. The device does not change Arm or
Monitor. Push track selection is automatic; choose Push's playing layout manually.
Audio tracks, return tracks, groups, master and the control track are excluded.

UPDATING AN EXISTING SET
Back up your Set and its device folder first. Do not delete an existing instance
until its saved configurations have been recovered. A newly inserted device is empty.
To retain the instance, close Live and replace its referenced AMXD with this AMXD,
keeping the old filename, plus the four adjacent JS files. Reopen a copy of the Set
and verify that all configurations are present before saving. No data migration is
required. The internal device title remains V1.5-EN, the validated runtime version.

LIMITATIONS
A same-slot retrigger without an observable stop/play transition may not be detected.
User JavaScript is not sandboxed: avoid infinite loops and do not alter audio stems.

Project, usage and support:
https://github.com/scapetone/KLJ-live-set-manager
