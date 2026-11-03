# Manual Live checks

The author has validated the English runtime in Ableton Live 12 with instruments and Push 2. v1.5.1 changes only repository documentation and distribution packaging. No new musical or hardware test is claimed for this release preparation.

For a fresh install or update, use a copy of your Set:

1. Extract the six-file release ZIP. Keep all files together and open the AMXD on the control MIDI track. Confirm that the editor opens without missing-script errors.
2. Confirm that saved rows and scripts survive the update. Save, close and reopen the copied Set.
3. Launch a matching control clip manually, from a scene and through Follow Actions. Check tempo, root/scale, MIDI ON/OFF, Push track selection and one optional script. Natural loops should not recall it again. Unknown clips should take no action.
4. Scroll horizontally and vertically, resize and edit a distant row. CLIP must remain frozen; headers, active highlighting, menus and MIDI cells must stay aligned.
5. Move/rename/add/remove a MIDI track. Verify that states follow identities, new columns default OFF in the data without immediately changing Live, and duplicate names warn rather than target an arbitrary track.
6. Verify MIDI routing with Vortex and Push, including two keyboard instruments ON together. Choose Push layouts manually. Audio-stem volumes and Track Activators must remain untouched.

The automated suite uses simulated LiveAPI. The native Max reports cover real UI objects, script execution and pattr dictionary round-trips; they do not substitute for `.als` reopening or hardware checks.
