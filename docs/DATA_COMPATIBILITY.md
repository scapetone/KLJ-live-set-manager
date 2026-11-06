# Saved-state compatibility policy

## Contract

The plugin version and data schema version are independent. v1.6.0 remains on schema **1** (`state.version === 1`) and supports valid v1.5.1 states without a format migration. The reference fixture in `tests/fixtures/v1.5.1-state.json` is accepted by the original v1.5.1 validator and contains several rows, varied activations/root/scale/Push, multiline Unicode JavaScript, legacy pushMode values and extra legacy metadata.

A release must not silently discard or reset a supported configuration. Every future schema change requires an explicit version dispatch, a migration from supported versions, fixtures from those versions, and both automated and real existing-Set upgrade tests. Keep row IDs, track keys, order, names, user scripts and useful unknown fields. Never translate or reinterpret user data as UI text. No automatic updater is introduced.

## Initialization and failure behavior

The native patch requests the pattr value before deferred engine initialization, as before. The engine additionally requires an explicit default-zero or validated-dictionary response. Unknown startup state is not persisted. New installations do not automatically write an empty model: the first intentional edit authorizes their first save.

A restored dictionary is copied and fully validated before replacing memory. Invalid JSON, invalid/partial states and unsupported versions lock persistence, editing and recall. A subsequent scalar default cannot unlock the error or replace existing data. The original raw payload is retained in memory for diagnosis and is not emitted as an empty state. The pattr parameter is never replaced by a fallback on this path. A valid subsequent restore can recover the engine.

This protects against the plugin overwriting the Blob. It cannot recover data that Live has already failed to deliver or that another program has overwritten. No host-level guarantee should be claimed solely from a filename or parameter label.

## Track reconciliation

An inventory is built on a candidate copy and validated before committing it. Unmatched references from a restored state are retained, even when a track is absent, ambiguously named or renamed while the device was absent. Runtime targets only contain currently eligible tracks. Unresolved data is preserved across subsequent refreshes; returning unique names can rebind without changing the saved key.

Existing track IDs still handle session moves and renames. A confirmed deletion of a runtime track keeps the prior deletion semantics. A new track gets OFF values without being physically muted until a recall. Reconciliation preserves extra track metadata rather than rebuilding records from only key/name.

No positional or approximate name matching is allowed. An offline rename with conflicting saved/runtime identities may require recovery from the original Set; preserving data does not prove that its intended musical target can be guessed.

## Release gate

Before each release:

1. Validate the complete supported fixture set, including unknown/invalid/partial schema cases and late restore ordering.
2. Check parameter identity (`state`, `klj_state`, `KLJ Configurations`, Blob / Stored Only), effect type and adjacent JS dependencies.
3. Upgrade an existing configured instance in Live, retaining the instance; verify all data before and after saving/reopening the ALS. Include scripts and inherited fields, not just visible row counts.
4. Document the update procedure and any compatibility limits in release notes. Do not publish silently incompatible data changes.
5. Keep a rollback installation and Set backup. Test on copies; never use a freshly inserted empty instance as proof of update compatibility.

The public v1.5.1 Release is retained unchanged. On 6 November 2026 the author confirmed the final candidate was satisfactory and requested publication. v1.6.0 uses the same four runtime JavaScript files; see [release validation](../validation/RELEASE-1.6.0.md) for musician feedback versus automated and native-host evidence. The publication request does not imply independent verification of every checklist item.
