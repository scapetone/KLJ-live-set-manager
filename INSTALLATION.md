# Installation and usage

## Requirements

Ableton Live 12 with Max for Live and Max 9. The author has validated the English device in Live 12.4.16 with integrated Max 9.1.5 and Push 2. There are no extra runtime packages.

## Install

1. Download the ZIP from [GitHub Releases](https://github.com/scapetone/KLJ-live-set-manager/releases).
2. Unzip into a permanent folder. Keep `KLJ Live Set Manager.amxd` and the four `klj.*.js` files together.
3. Load the AMXD as a MIDI effect on the track containing the control clips. Exclude this track from your playable instrument routing.
4. Configure your keyboard/Push MIDI inputs and Monitor settings manually. The device never changes Arm or Monitor.
5. Click **OPEN CONFIGURATIONS**, then **+ ADD**. Enter the name of a control clip and configure the row.

New rows inherit Live's current tempo, root and scale. All managed MIDI tracks start OFF, with no Push target and no script. Editing does not recall the row; set the required ON states before starting its clip.

## Edit the matrix

- **CLIP / BPM:** double-click to edit, then press Enter. Configuration names must be unique and match their control clips, including case. Leading/trailing spaces are trimmed; internal spaces are preserved. BPM range: 20–999.
- **ROOT / SCALE:** click a cell, open the native selector and choose a value.
- **MIDI tracks:** click to toggle ON/OFF. Normal MIDI tracks are included even when empty. The control track, groups, audio tracks, returns and master are excluded. Ambiguous names are reported and skipped.
- **PUSH:** click, open the selector and choose the MIDI track by its current number and name, or **None**. This selects the track in Live; playing layouts remain manual on Push.
- **MORE / JAVASCRIPT:** expand or collapse the optional multiline script panel. Closing it saves edits to the model.
- **DUPLICATE / DELETE:** act on the edited row, without recalling it. Duplicates include the full script and use a unique name.

The green row is the active configuration. The blue-grey row is the editing selection. CLIP stays visible during horizontal scrolling; both sides scroll vertically together. Headers and controls follow window resizing. MIDI columns stay between 122 and 160 logical pixels, with long names shortened only for display. Full names remain in the data and Push choices. A size of at least 800 × 520 is recommended. Open menus close during resizing and can be reopened.

A matching clip recalls BPM, root/scale, MIDI activations and Push selection, then its script. Unknown clips show a warning without applying settings. Natural loops do not trigger another recall. Loading or editing a Set does not recall a clip merely because it was already playing.

**Save the Live Set to store configurations and scripts.** No separate data file is required.

## Updating an existing Set

Back up the Set and its device folder. Do not delete the current device instance before recovering its saved configurations: a newly inserted instance starts empty.

To retain the existing instance, close Live and replace its referenced AMXD with the release AMXD, keeping the old filename. Replace the four adjacent JS files too. Reopen a copy of the Set, confirm that its configurations and scripts are present, then save. Keep the previous backup.

v1.5.1 contains the same runtime bytes as the validated V1.5-EN. Its internal title still reads **V1.5-EN**. The state schema, parameter name `KLJ Configurations`, row/track identities and legacy `pushMode` data are unchanged. Existing French configuration names and scripts are not translated.

## Optional JavaScript

Scripts run in Max `v8`, after the standard recall. `LiveAPI` and a frozen `context` object are available. Context fields are `clip`, `rowId`, `bpm`, `root` and `scale`.

```js
post("Configuration: " + context.clip + "\n");
```

Synchronous syntax/runtime exceptions are reported and later recalls remain usable. User JavaScript is not sandboxed: it must never alter audio stems' volume or Track Activators. An infinite loop can block Max/Live, and exceptions in asynchronous tasks created by a script are outside the synchronous error handler.

For a named effect's **Device On** parameter, see [the example](examples/device-on.js). Replace its placeholder track and device names. It searches devices directly on a track; nested racks require an adapted path.
