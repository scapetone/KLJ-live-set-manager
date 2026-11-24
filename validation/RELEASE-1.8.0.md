# v1.8.0 release validation

24 November 2026. Publication explicitly requested by the project owner.

## Scope

Promotes the **v1.8.0-dev.1 API-efficiency runtime**, with all four JavaScript
files byte-identical to that candidate. The compact title is now **V1.8.0**.
Distribution documentation and version metadata are updated. The diagnostic
no-tempo variant is not part of this release.

Tempo recall stays enabled. ROOT/SCALE, MIDI Monitor IN/OFF, Push track selection,
script execution, clip gate/deduplication, UI and state restoration are retained.
Schema v1 and Blob / Stored Only parameter identity are unchanged. There is no
data migration or automatic unmute, Arm or Device Activator command. Built-in
activation writes remain restricted to eligible MIDI tracks.

The engine reads already-correct values once, verifies actual writes, reuses
session LiveAPI handles, avoids rescanning every track's input type during a
recall, coalesces pending checks and reuses verified values for diagnostics.
Fresh names and per-write safety checks remain. See the historical
[candidate audit](API-EFFICIENCY-1.8.0-dev.1.md) for the exact scope and limits.

## Evidence

- **72 Node tests pass**, zero failures. These simulate Max/LiveAPI; they cover
  target safety, state restoration, UI interaction, scripts, clip detection,
  no-op suppression, handle lifetime and diagnostic counters.
- **65 audit scenarios** retain identical write targets, values and order versus
  v1.7.0. All ten recall scenarios reduce explicit getters and constructors.
  At 41 tracks / 32 MIDI / 15 configurations: already-correct recall uses
  47 versus 88 getters, while all-changed recall uses 314 versus 359. These are
  simulated operation counts, not CPU, audio latency or Push readiness.
- Native AMPF/MIDI-container validator passes: source/embedded-editor consistency,
  patch cords, dependencies and persistence parameter checked. It is not a
  native Max load test.
- The ZIP contains exactly the AMXD, four runtime JS files and English README.txt;
  clean extraction and byte comparisons pass. All runtime hashes match dev.1.
  [Release manifest](release-v1.8.0.json) records artifact/runtime hashes.
- Existing public v1.7.0 assets are retained unchanged. Private Sets, samples,
  generated harnesses and local diagnostic distributions are excluded from Git.

## Musician evidence and unresolved issue

The v1.7.0 Monitor behavior was previously validated by the author in their real
Live/Push Set. During subsequent investigation, the author reported crackles
also when changing tempo outside the plugin, then requested publication of the
latest optimized version with normal tempo handling.

This does **not** prove that KLJ contributes no load, nor establish a fix for
tempo-related scene crackles. No new native playback/CPU/Push latency measurement
is claimed for this release. Scene-start crackles remain under investigation.

## Updating and collected projects

Keep the configured instance. With Live closed, update its AMXD and four adjacent
JS files together, then check a copy of the Set before saving. Save/close/reopen
remains a user validation step. After Collect All and Save, check that the four
JS files are beside the AMXD Live actually loads: a collected AMXD without those
dependencies can fail to show its saved configurations even while they remain
in the ALS. Do not delete/recreate the instance to update it.
