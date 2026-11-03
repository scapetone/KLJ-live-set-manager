# KLJ Live Set Manager

**Clip-triggered performance configurations for Ableton Live 12.**

Built for Kiss La Joue: one visual matrix to prepare a live show, then recall each configuration from the clips already driving the set.

[Download v1.5.1](https://github.com/scapetone/KLJ-live-set-manager/releases/download/v1.5.1/KLJ-Live-Set-Manager-v1.5.1.zip) · [Releases](https://github.com/scapetone/KLJ-live-set-manager/releases) · [Usage](INSTALLATION.md)

## Screenshot

![KLJ Live Set Manager English configuration editor](docs/images/klj-live-set-manager.png)

The English editor with validation feedback and the per-configuration JavaScript panel.

## The problem

A complex Ableton Live Set needs predictable changes between songs and sections: tempo, key, playable MIDI instruments and the instrument selected for Push. Recreating that setup with legacy ClyphX macros makes a show harder to inspect and maintain.

## The solution

KLJ Live Set Manager is a Max for Live MIDI effect with a configuration editor. Each row matches a control clip by name. When that clip starts playing, the device recalls the row's settings and optional JavaScript. Scenes and native Follow Actions keep driving the show.

## Features

- Recall BPM, root note and scale.
- Set Track Activators for normal MIDI tracks, including tracks without an instrument loaded.
- Keep several MIDI instruments active at once and select the target track for Push 2.
- Add optional JavaScript to each configuration, with error reporting.
- Save configurations and scripts inside the Live Set.
- Edit, duplicate and delete rows in a resizable matrix with a frozen CLIP column.
- Follow MIDI track moves, renames, additions and removals; warn about ambiguous names.
- Leave audio tracks, returns, master and the control track outside the built-in activation controls.

## Installation

**Requires Ableton Live 12 with Max for Live and Max 9.** Validated by the project author in Live 12.4.16 with integrated Max 9.1.5 and Push 2.

1. Download and unzip the [release ZIP](https://github.com/scapetone/KLJ-live-set-manager/releases/download/v1.5.1/KLJ-Live-Set-Manager-v1.5.1.zip) into a permanent folder.
2. Keep the `.amxd` and all four `klj.*.js` files together.
3. Load the device on the MIDI track containing your control clips.
4. Open **OPEN CONFIGURATIONS**, add a row with the matching clip name, set its values and save the Live Set.

No additional packages or external services are required. Configure MIDI inputs and Monitor manually. For an existing installation, follow the [update instructions](INSTALLATION.md#updating-an-existing-set) before replacing its device.

## Tech stack

Native Max for Live patchers and UI objects, JavaScript running in Max `v8`, LiveAPI observers and commands, and `pattr` Blob storage. The editor uses synchronized `jit.cellblock` grids and native selectors. Development checks use Node.js and Python's standard library; neither is required to use the device.

## Known limitations

- Push 2 track selection is automated. Playing layouts such as Note, In Key and Pads are configured manually on Push.
- A same-slot relaunch without an observable stop/play transition may not be detected. Natural clip loops do not recall configurations again.
- Track names should be unique. Ambiguous MIDI targets are skipped.
- Custom JavaScript is not sandboxed. It can access LiveAPI and must respect the audio-stem protections; an infinite loop can block Max/Live.
- Turning an instrument OFF can interrupt its sound. MIDI routing, Arm and Monitor remain manual.

## Development process

Functional and visual design, product direction and testing in Ableton Live were led by [scapetone](https://github.com/scapetone). Implementation and iterative corrections were assisted by **OpenAI Codex**, with automated checks and native Max tests followed by musician validation in Live with instruments and Push 2.

Release v1.5.1 packages the validated English version without changing its runtime code or interface. See [development and build instructions](docs/DEVELOPMENT.md) and the [release validation report](validation/RELEASE-1.5.1.md).

Licensing terms have not yet been selected. No open-source license is included.
