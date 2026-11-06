# KLJ Live Set Manager — maintenance instructions

The English v1.7.0 device with MIDI Monitor IN/OFF activation is validated by the author in Ableton Live 12 with Push 2. Preserve that working baseline; do not redesign the product or refactor the musical engine without an explicit request.

- Read README.md for the current product and docs/DEVELOPMENT.md for build/test commands. Other design documents in docs/ are historical references; consult them only for a specific need. Current user instructions take precedence.
- Keep native Max for Live objects, Max v8 JavaScript and LiveAPI. Do not add frameworks, dependencies, ClyphX syntax or tool installations without a concrete need.
- Never change audio stems' volumes, Monitor, Track Activators/Mute or mix settings. Built-in activation uses Monitor IN/OFF only on eligible MIDI tracks; never add mute or Device Activator writes. Do not add Arm, Monitor Auto or routing commands without explicit authorization and demonstrated necessity.
- Preserve clip-start detection, loop deduplication, Push track selection, free JavaScript execution and state restoration. Push playing layouts remain manual; never present them as automated.
- Preserve the versioned state schema, parameter identity, user names and scripts when updating. Keep all four runtime JavaScript files next to the AMXD.
- Run the Node suite, native-container validator and packaging checks. Distinguish simulated LiveAPI tests, actual native Max tests and musician tests in Live/Push; never claim absent hardware testing.
- The user ZIP contains exactly the AMXD, four required JS files and English README.txt. Generated harnesses, local distributions and private Live assets must stay out of Git.
- Do not publish license terms unless the project owner explicitly selects them.
