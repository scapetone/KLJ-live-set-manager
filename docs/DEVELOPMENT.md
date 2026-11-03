# Development

## Repository layout

- `device/`: current AMXD, editable Max patch/project and its four runtime JavaScript files.
- `tests/`: dependency-free Node tests and native Max diagnostic harnesses.
- `tools/`: patch generation, native-container build, validation and minimal packaging.
- `examples/`: optional user-script examples.
- `docs/`: development notes, user ZIP readme and historical design documents.
- `validation/`: historical results and current release audit. Native reports identify the version actually tested.
- `dist/`: ignored local build output. Downloadable user artifacts are attached to GitHub Releases.

## Check and build

From the repository root, with Node.js and Python 3 installed:

```sh
node --test tests/engine.test.cjs
python3 tools/build_patch.py
python3 tools/build_amxd.py
python3 tools/validate_patch.py
python3 tools/package.py
```

The AMXD builder replaces the complete `ptch` payload in the project's native MIDI template, retaining AMPF metadata. The template was originally exported from Max and contains no musician state or third-party runtime. It is not a JSON file renamed to AMXD. The validator compares the embedded editor to its source, checks patch cords, dependencies, MIDI container metadata and the Blob / Stored Only parameter.

Packaging creates `dist/KLJ-Live-Set-Manager-v1.5.1.zip` with only the AMXD, four JS files and `README.txt`. It extracts the ZIP into a clean temporary directory and compares every file byte for byte. Timestamps and permissions are fixed for reproducible output. Keep development sources out of the user archive.

The validated V1.5-EN runtime is unchanged in v1.5.1, including its internal title. Only the release filename is standardized. `autowatch` is disabled in production: reload the device after changing runtime code.

## Native Max harnesses

```sh
python3 tools/build_max_smoke.py
python3 tools/build_mouse_probe.py
python3 tools/build_name_probe.py
```

Generated patchers appear in ignored `tests/max/generated/`. Their script paths are resolved from the current checkout at generation time, so they must not be committed. Open them in Max 9. A Max for Live-only license may require opening Max from a device in Live first.

The smoke harness uses the real model, view, runner and patch wiring without musical LiveAPI commands. The mouse harness presents 40 example configurations. The name probe reproduces native cell serialization behavior. Reports use `/tmp/` on macOS; adapt output paths when using Windows. French strings in fixtures intentionally test that user data is preserved verbatim.

## Persistence and release boundaries

Do not change the persisted schema or parameter identity casually. The existing tests cover restored states, French names/scripts, independent instances, target validation and audio-track protections. `.als` reopening and Push/Vortex routing still require manual testing; see [the checklist](../LIVE_TESTS.md).

No license has been selected. The repository includes no Live Sets, samples, external JavaScript packages or Ableton/Cycling '74 SDK binaries.
