# v1.5.1 release validation

## Scope and preservation

This release finalizes the repository and user distribution. The author confirmed the English runtime works in Ableton Live 12 with instruments and Push 2 before release preparation.

The current AMXD, four runtime JavaScript files, editable Max patch and Max project are byte-for-byte identical to the validated V1.5-EN baseline. Only the AMXD's external filename is standardized to `KLJ Live Set Manager.amxd`. Its internal title remains V1.5-EN. Runtime dependency names and their adjacent placement are unchanged.

A full working-tree backup and Git bundle were preserved outside the repository before cleanup. Superseded source-folder AMXDs and ZIP/manifests were removed after that backup. Existing extracted local `dist/` installations remain ignored, since the musician's Sets may reference them. Generated harnesses, caches and macOS metadata are ignored; no useful tests were removed. Historical design documents and validation evidence remain in the repository.

## Checks performed for this release

- **45 Node tests passed, zero failures**, using simulated LiveAPI. Existing-state compatibility, French user names/scripts, MIDI target protection, clip events, Push selection and frozen-column behavior remain covered.
- Source and AMXD structure passed validation: native MIDI AMPF container, 69 source Max boxes, 19 main patch cords, matching embedded editor, four dependencies, empty shipped state, Blob / Stored Only parameter and English UI labels.
- Rebuilding the patch and AMXD produced exactly the baseline bytes. No interface, functional or state-schema changes were introduced.
- The user ZIP contains exactly six root-level files: AMXD, four JS files and English README.txt. It was extracted into a fresh temporary directory and every extracted file compared byte for byte with its source. Repeated builds produced the same ZIP SHA-256.
- The new English README, installation guide, manual checklist and development guide use valid local document targets. GitHub download URLs are verified after publication.
- The publishable tree and native container payloads were checked for personal filesystem paths, credentials, private Live Sets, audio recordings/samples and unwanted binary dependencies. No such material was found. The only AMXDs are the project device and its original native-container build template; no SDK or third-party runtime is included.
- The README screenshot is an unmodified capture supplied by the author, reviewed for private content and personal-path metadata. It shows the actual English UI, including validation feedback.
- No open-source license or license grant was added.

Exact runtime hashes, ZIP contents and checksum are recorded in [release-v1.5.1.json](release-v1.5.1.json).

## Validation boundaries

The 23 native Max checks in [native-v1.5-en.json](native-v1.5-en.json), and the English native UI observations in the existing reports, are historical results for the unchanged runtime. They were not rerun for this packaging pass. The author's subsequent confirmation establishes musician validation of that English version. No new musical Live, `.als` reopening or hardware test is claimed during release preparation.

The package was checked by clean-directory extraction and static dependency resolution, not by inserting a new instance into the user's Set. Follow [LIVE_TESTS.md](../LIVE_TESTS.md) for any fresh installation. User JavaScript remains unsandboxed and Push playing layouts remain manual.
