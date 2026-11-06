# Installation and usage

## Requirements

Ableton Live 12 with Max for Live and Max 9. The author has validated the English device in Live 12.4.16 with integrated Max 9.1.5 and Push 2. There are no extra runtime packages.

## Install

1. Download the ZIP from [GitHub Releases](https://github.com/scapetone/KLJ-live-set-manager/releases).
2. Unzip into a permanent folder. Keep `KLJ Live Set Manager.amxd` and the four `klj.*.js` files together.
3. Load the AMXD as a MIDI effect on the track containing the control clips. Exclude this track from your playable instrument routing.
4. Configure your keyboard/Push MIDI inputs manually and leave the managed MIDI Track Activators enabled. On a recognized clip start, the device sets eligible MIDI tracks to Monitor IN for ON cells and Monitor OFF for OFF cells. Arm and Push playing layouts remain manual.
5. Click **OPEN CONFIGURATIONS**, then **+ ADD**. Enter the name of a control clip and configure the row.

New rows inherit Live's current tempo, root and scale. All managed MIDI tracks start OFF, with no Push target and no script. Editing does not recall the row; set the required ON states before starting its clip.

## Edit the matrix

- **CLIP / BPM:** double-click to edit, then press Enter. Configuration names must be unique and match their control clips, including case. Leading/trailing spaces are trimmed; internal spaces are preserved. BPM range: 20–999.
- **ROOT / SCALE:** click a cell, open the native selector and choose a value.
- **MIDI tracks:** click to toggle ON/OFF. ON requests Monitor IN; OFF requests Monitor OFF at the next recognized clip start. Normal MIDI tracks are included even when empty. The control track, groups, audio tracks, returns and master are excluded. Ambiguous names are reported and skipped. Built-in commands do not change Track Activators/Mute or Device Activators.
- **PUSH:** click, open the selector and choose the MIDI track by its current number and name, or **None**. This selects the track in Live; playing layouts remain manual on Push.
- **MORE / JAVASCRIPT:** expand or collapse the optional multiline script panel. Closing it saves edits to the model.
- **DUPLICATE / DELETE:** act on the edited row, without recalling it. Duplicates include the full script and use a unique name.
- **REFRESH TRACKS:** resynchronize the track list without recalling a configuration. Structural changes and MIDI track names are also observed automatically.

The green row is the active configuration. The blue-grey row is the editing selection. CLIP stays visible during horizontal scrolling; both sides scroll vertically together. Headers and controls follow window resizing. MIDI columns stay between 122 and 160 logical pixels, with long names shortened only for display. Full names remain in the data and Push choices. A size of at least 800 × 520 is recommended. Open menus close during resizing and can be reopened.

A matching clip recalls BPM, root/scale, MIDI activations and Push selection, then its script. Unknown clips show a warning without applying settings. Natural loops do not trigger another recall. Loading or editing a Set does not recall a clip merely because it was already playing.

**Save the Live Set to store configurations and scripts.** No separate data file is required.

<a id="updating-an-existing-set"></a>
## Updating from a previous version

**v1.7.0 keeps the v1.5.1/v1.6.0 data format and existing-instance update path.** Keep your previous installation and test an upgrade on a copy first. Keeping only the AMXD filename is not proof that Live restored its Blob.

**Activation behavior changes in v1.7.0:** existing ON/OFF values now control Monitor IN/OFF instead of mute. Manually enable any MIDI Track Activators left disabled by the previous version before playing those instruments. Monitor IN does not unmute a track or enable a disabled device. Leave audio tracks untouched. User scripts are preserved verbatim and can still issue their own commands.

1. Save and close your Set in Live. Back up the complete Set/project and its currently referenced device folder.
2. Make a separate test copy of the Set and installation. If you redirect a copy to another installation, ensure Live actually references that copy; do not silently keep loading the original device.
3. With Live closed, replace the AMXD **at the path referenced by that Set**, retaining its existing filename. Replace all four adjacent `klj.*.js` files together. Do not insert a fresh instance or delete the configured one.
4. Open the test Set. The compact title must show **V1.7.0**. Verify every row, its order, tempo, root/scale, MIDI states, Push reference and full script. Do not save over your only original Set if rows are missing or a restore warning appears.
5. Save the test Set, close and reopen it. Compare again and run the manual checks in LIVE_TESTS.md. Retain the previous installation and original Set for rollback.

The patch keeps the `state` object ID, `pattr klj_state`, parameter name **KLJ Configurations**, Blob / Stored Only attributes, MIDI effect type and schema **version 1**. No schema conversion is needed for v1.5.1 or v1.6.0. User names, keys, IDs, row order, scripts, unknown legacy metadata and `pushMode` are retained.

Unreadable or unsupported saved data locks editing, recall and persistence. The plugin reports the error and leaves the original parameter untouched rather than replacing it with an empty model. Recover by reopening a known-good Set/installation; REFRESH TRACKS cannot unlock invalid saved data.

A saved track that cannot be matched uniquely at reopening is retained in the data, including its enabled states and Push references, and reported as unresolved. It is not assigned by track position. An offline rename cannot always be identified safely. Returning missing tracks can reconnect by a unique saved name; conflicting identities require deliberate recovery using the original Set. Tracks actually deleted after being identified during the session retain the existing confirmed-deletion behavior. New MIDI tracks still default OFF in saved rows without immediate Live writes.

The author validated the Monitor candidate in their real test Live Set with the existing plugin replaced and approved v1.7.0 for publication. The release keeps all four candidate runtime JavaScript files unchanged. Restoration still depends on the actual Live/Max load and save behavior; verify your own Set before adopting the update. See [release validation](validation/RELEASE-1.7.0.md) for the exact evidence and boundaries.

## Optional JavaScript

Scripts run in Max `v8`, after the standard recall. `LiveAPI` and a frozen `context` object are available. Context fields are `clip`, `rowId`, `bpm`, `root` and `scale`.

```js
post("Configuration: " + context.clip + "\n");
```

Synchronous syntax/runtime exceptions are reported and later recalls remain usable. User JavaScript is not sandboxed: it must never alter audio stems' volume or Track Activators. An infinite loop can block Max/Live, and exceptions in asynchronous tasks created by a script are outside the synchronous error handler.

For a named effect's **Device On** parameter, see [the example](examples/device-on.js). Replace its placeholder track and device names. It searches devices directly on a track; nested racks require an adapted path.
