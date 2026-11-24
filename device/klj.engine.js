/* Max for Live entry point. No LiveAPI access at global scope. */
autowatch = 0;
inlets = 1;
outlets = 2; // 0: persistent dictionary -> pattr; 1: script payload -> runner
include("klj.model.js");
include("klj.ui.js");

var state = KLJModel.empty(), runtime = [], ready = false, restoring = false, saving = false;
var ownTrack = 0, song = null, songView = null, view = null;
var gate = new KLJModel.Gate(), observers = [], trackObservers = [], clipObserver = null;
var observedClip = 0, trackSignature = "", lastStored = "", active = "—", statusText = "Initializing…";
var scanTask = null, clipTask = null, pollTask = null, token = 0;
var clipRetryTask = null, inventoryDirty = true, scanPending = false;
var clipNotificationAt = null; // Diagnostic only; never used by clip-start detection.
var restorationReady = false, restoreBlocked = false, hasRestoredState = false, userEdited = false;
var lastRestoreRaw = "", knownTrackIds = [], nameObservers = Object.create(null);
var trackHandles = Object.create(null), knownMidiIds = [];
var slotHandle = null, clipHandle = null, clipCheckPending = false;
var apiCounts = {get: 0, set: 0, create: 0};
var recallWarnings = [], initializing = false;
var migrationNotice = "", lastRecall = null;
var namespace = String(jsarguments[1]);
var storeDict = new Dict(namespace + "_state"), scriptDict = new Dict(namespace + "_script");

function scalar(value) {return Array.isArray(value) ? (value.length === 1 ? value[0] : value.join(" ")) : value;}
// Aggregate diagnostics only: no timers, extra API calls or per-call console output.
function liveObject(callback, path) {apiCounts.create++; return new LiveAPI(callback, path);}
function get(api, property) {apiCounts.get++; return api.get(property);}
function write(api, property, value, id) {
    apiCounts.set++;
    if (id === undefined) api.set(property, value); else api.set(property, value, id);
}
function callCounts() {return {get: apiCounts.get, set: apiCounts.set, create: apiCounts.create};}
function read(api, property) {return scalar(get(api, property));}
function ids(value) {return (Array.isArray(value) ? value : [value]).filter(function (x) {return x !== "id" && Number(x) > 0;}).map(Number);}
function apiId(id) {
    id = Number(id);
    if (trackHandles[id] && Number(trackHandles[id].id) === id) return trackHandles[id];
    if (slotHandle && Number(slotHandle.id) === id) return slotHandle;
    if (clipHandle && Number(clipHandle.id) === id) return clipHandle;
    return liveObject(null, "id " + id);
}
function warn(e) {status(String(e && e.message ? e.message : e)); error("KLJ: " + statusText + "\n");}
function status(text) {
    statusText = text + (ready && runtime.length === 0
        ? " | No playable MIDI tracks: control track, groups and audio tracks are excluded." : "");
    if (view) view.status(active, statusText);
    this.patcher.getnamed("active").message("set", active);
    this.patcher.getnamed("status").message("set", statusText);
}
function persist() {
    // A default scalar is not permission to replace a saved Blob during loading.
    if (!restorationReady || restoreBlocked || (!hasRestoredState && !userEdited)) return;
    var json = JSON.stringify(state);
    if (json === lastStored) return;
    storeDict.parse(json);
    if (view && view.traceNames) post("KLJ model names → pattr: " + JSON.stringify(state.rows.map(function (r) {
        return {name: r.clip, length: r.clip.length};
    })) + "\n");
    saving = true;
    try {outlet(0, "dictionary", storeDict.name); lastStored = json;}
    finally {saving = false;}
}
function restore() {
    if (saving) return; // pattr echoes writes; only genuine recalls replace the model.
    var args = arrayfromargs(arguments), name = args[0] === "dictionary" ? args[1] : null;
    if (!name) {
        if (args.length === 1 && args[0] === 0 && !hasRestoredState && !restoreBlocked) {
            restorationReady = true;
            if (ready) {gate.read(snapshot(), true); status("Ready — waiting for next clip");}
        } else if (args.length) {restoreBlocked = true; warn("Saved data is unreadable; writes are blocked. Original data retained.");}
        return;
    }
    try {
        lastRestoreRaw = new Dict(String(name)).stringify();
        var raw = JSON.parse(lastRestoreRaw);
        var restored = KLJModel.migrate(raw);
        // Only a fully validated candidate may replace memory. Invalid Blobs stay in pattr.
        state = restored.state;
        lastStored = JSON.stringify(raw);
        restorationReady = true; restoreBlocked = false; hasRestoredState = true;
        migrationNotice = restored.changes.length ? "Names normalized: " + restored.changes.map(function (c) {
            return JSON.stringify(c.raw) + " → " + c.name;
        }).join(" ; ") : "";
        inventoryDirty = true;
        if (ready) {
            restoring = true;
            try {refresh(true); gate.read(snapshot(), true); view.render(state, runtime);}
            finally {restoring = false;}
            status(inventoryNotice() || migrationNotice || "Configurations restored — waiting for next clip");
        }
    } catch (e) {
        restoreBlocked = true;
        warn("Restore failed; writes are blocked and saved data is retained: " + e.message);
    }
}

function observe(path, property, fn, bag) {
    var object = liveObject(function (args) {if (ready) fn(args);}, path);
    object.mode = 0;
    object.property = property;
    bag.push(object);
    return object;
}
function release(bag) {
    bag.forEach(function (o) {try {o.property = ""; o.id = 0;} catch (_) {}});
    bag.length = 0;
}
function findOwnTrack() {
    var trackIds = ids(get(liveObject(null, "live_set"), "tracks"));
    var object = liveObject(null, "this_device");
    for (var n = 0; n < 12; n++) {
        // Live reports concrete classes (e.g. MidiTrack), not always the LOM base class Track.
        if (trackIds.indexOf(Number(object.id)) >= 0) return Number(object.id);
        if (!Number(object.id) || object.type === "Song") break;
        var parent = ids(get(object, "canonical_parent"))[0];
        if (!parent) break;
        object = apiId(parent);
    }
    throw new Error("Place the device on the MIDI control clip track");
}
function describe(id, position) {
    var t = apiId(id);
    if (!Number(t.id)) throw new Error("Track deleted during scan");
    var midi = Number(read(t, "has_midi_input")) === 1;
    return {id: id, name: String(read(t, "name")), position: position,
        midi: midi, audio: Number(read(t, "has_audio_input")) === 1,
        group: Number(read(t, "is_foldable")) === 1, control: id === ownTrack,
        frozen: Number(read(t, "is_frozen")) === 1};
}
function scheduleScan() {
    inventoryDirty = true;
    if (scanTask && !scanPending) {scanPending = true; scanTask.schedule(50);}
}
function structureChanged(args) {
    if (args && args[0] === "tracks" && ids(args.slice(1)).join(",") === knownTrackIds.join(",")) return;
    scheduleScan();
}
function scheduleClip() {
    if (clipNotificationAt === null) clipNotificationAt = Date.now();
    if (clipTask && !clipCheckPending) {clipCheckPending = true; clipTask.schedule(0);}
}
function songPlayingChanged(args) {
    // Preserve an observed stop even when stop/start are delivered before the deferred task.
    if (!initializing && args && args[0] === "is_playing" && Number(args[1]) === 0) gate.read({playing: false});
    scheduleClip();
}
function clipStatusChanged() {
    if (clipNotificationAt === null) clipNotificationAt = Date.now();
    try {if (!initializing && !snapshot(false).playing) gate.read({playing: false});} catch (_) {}
    scheduleClip();
}
function inventoryNotice() {
    var unresolved = state.tracks.filter(function (t) {return !runtime.some(function (r) {return r.key === t.key;});});
    if (unresolved.length) return "Saved MIDI references unresolved (data retained): " + unresolved.map(function (t) {return t.name;}).join(", ");
    if (runtime.some(function (t) {return t.ambiguous;})) return "Duplicate track names: ambiguous targets skipped";
    return "";
}
function refresh(initial) {
    if (!restorationReady || restoreBlocked) return;
    if (scanTask) scanTask.cancel(); scanPending = false;
    var trackIds = ids(get(song, "tracks"));
    // Inventory needs track identity/type/name, not the device chain. Guards stay unchanged.
    var nextHandles = Object.create(null);
    var descriptors = trackIds.map(function (id, i) {
        var t = apiId(id);
        nextHandles[id] = t;
        return {id: id, name: String(read(t, "name")), position: i + 1,
            midi: Number(read(t, "has_midi_input")) === 1, audio: Number(read(t, "has_audio_input")) === 1,
            group: Number(read(t, "is_foldable")) === 1, control: id === ownTrack};
    });
    // Cache only current normal tracks. Never persist API handles or grow a history of clip IDs.
    trackHandles = nextHandles;
    knownMidiIds = descriptors.filter(function (t) {return t.midi && !t.control;}).map(function (t) {return t.id;});
    var signature = JSON.stringify(descriptors.filter(KLJModel.eligible));
    if (!initial && signature === trackSignature) {knownTrackIds = trackIds; inventoryDirty = false; return;}
    var candidate = KLJModel.clone(state);
    var next = initial || signature !== trackSignature ? KLJModel.reconcile(candidate, descriptors, runtime, !!initial, true) : runtime;
    KLJModel.validate(candidate);
    // Observer ownership follows identities; unchanged tracks are never resubscribed.
    Object.keys(nameObservers).forEach(function (id) {
        if (!next.some(function (t) {return String(t.id) === id;})) {release([nameObservers[id]]); delete nameObservers[id];}
    });
    next.forEach(function (t) {
        if (!nameObservers[t.id]) nameObservers[t.id] = observe("id " + t.id, "name", function (args) {
            var current = runtime.find(function (r) {return r.id === t.id;});
            if (args && args[0] === "name" && String(scalar(args.slice(1))) === (current ? current.name : t.name)) return;
            scheduleScan();
        }, []);
    });
    knownTrackIds = trackIds; inventoryDirty = false;
    if (!initial && signature === trackSignature) return;
    state = candidate; runtime = next; trackSignature = signature;
    persist();
    if (view) view.render(state, runtime);
    status(inventoryNotice() || "Track list updated: " + runtime.length + " MIDI tracks");
}
function snapshot(includeName) {
    if (!Number(read(song, "is_playing"))) return {playing: false};
    var track = apiId(ownTrack), index = Number(read(track, "playing_slot_index"));
    if (index < 0) return {playing: false};
    var slotId = ids(get(track, "clip_slots"))[index];
    if (!slotId) return {playing: false};
    slotHandle = apiId(slotId);
    var clipId = ids(get(slotHandle, "clip"))[0];
    if (!clipId) return {playing: false};
    clipHandle = apiId(clipId);
    var current = {playing: Number(read(clipHandle, "is_playing")) === 1, id: Number(clipHandle.id)};
    if (includeName !== false) current.name = String(read(clipHandle, "name"));
    return current;
}
function bindClip(id) {
    if (id === observedClip) return;
    if (clipObserver) release([clipObserver]);
    clipObserver = null;
    observedClip = id;
    if (id) {
        var bag = [];
        clipObserver = observe("id " + id, "playing_status", clipStatusChanged, bag);
    }
}
function checkClip() {
    clipCheckPending = false;
    var notifiedAt = clipNotificationAt; clipNotificationAt = null;
    if (!ready || restoring || initializing || !restorationReady || restoreBlocked) return;
    try {
        var callsBefore = callCounts(), current = snapshot();
        // An index notification can precede is_playing=1. Observe that clip now, not two seconds later.
        bindClip(current.id || 0);
        if (clipRetryTask) {
            clipRetryTask.cancel();
            if (current.id && !current.playing) clipRetryTask.schedule(100);
        }
        var launch = gate.read(current, false);
        if (launch) recall(launch, notifiedAt, callsBefore);
    } catch (e) {warn(e);}
}
function recallTrackContext() {
    // Fresh for this synchronous recall only. Never persist or reuse between clips.
    var trackIds = ids(get(song, "tracks")), names = Object.create(null), byId = Object.create(null);
    if (trackIds.join(",") !== knownTrackIds.join(",")) {
        scheduleScan();
        throw new Error("track structure changed during recall: command skipped");
    }
    // Keep fresh names to catch late/missing rename notifications. Track type is inventoried,
    // then revalidated on each actual target write; scanning every audio track here is redundant.
    knownMidiIds.forEach(function (id) {
        var t = apiId(id);
        var name = String(read(t, "name"));
        byId[id] = name;
        names[name] = (names[name] || 0) + 1;
    });
    return {ids: trackIds, names: names, byId: byId};
}
function guardedTrack(target, context) {
    // Share the name/ambiguity scan, but re-read membership and eligibility at each command.
    context = context || recallTrackContext();
    if (inventoryDirty) throw new Error("track inventory changed during recall: command skipped");
    var currentIds = ids(get(song, "tracks"));
    var position = currentIds.indexOf(target.id);
    if (position < 0) throw new Error("track missing");
    if (currentIds.join(",") !== context.ids.join(",")) {
        scheduleScan();
        throw new Error("track structure changed during recall: command skipped");
    }
    var descriptor = describe(target.id, position + 1);
    if (!KLJModel.eligible(descriptor)) throw new Error("unauthorized MIDI target: command rejected");
    if (descriptor.frozen) throw new Error("track frozen: command skipped");
    if (context.byId[target.id] !== descriptor.name) {
        scheduleScan();
        throw new Error("track name changed during recall: command skipped");
    }
    if (context.names[descriptor.name] !== 1) throw new Error("ambiguous name: command rejected");
    return apiId(target.id);
}
function setIfDifferent(api, property, value, beforeWrite, observedValue) {
    var actual = read(api, property);
    if (actual !== value) {
        if (beforeWrite) api = beforeWrite();
        write(api, property, value);
        actual = read(api, property);
    }
    if (observedValue) observedValue(actual);
    if (typeof value === "number" ? Math.abs(Number(actual) - value) > 0.001 || !Number.isFinite(Number(actual)) : actual !== value)
        throw new Error("LiveAPI " + property + " requested=" + JSON.stringify(value) + ", actual=" + JSON.stringify(actual));
    return actual;
}
function recall(launch, notifiedAt, callsBefore) {
    callsBefore = callsBefore || callCounts();
    if (restoreBlocked || !restorationReady) return;
    var started = Date.now(), timings = {};
    if (notifiedAt !== null && notifiedAt !== undefined) timings.notificationToRecallMs = Math.max(0, started - notifiedAt);
    if (inventoryDirty) refresh(false);
    timings.inventoryMs = Date.now() - started;
    var actual = snapshot(false);
    if (!actual.playing || actual.id !== launch.id) return;
    var clipName = KLJModel.normalizeName(launch.name);
    if (view && (view.traceNames || clipName !== launch.name)) post("KLJ clip name → match: " + JSON.stringify({
        raw: launch.name, rawLength: launch.name.length, name: clipName, length: clipName.length
    }) + "\n");
    var row = state.rows.find(function (r) {return r.clip === clipName;});
    if (!row) {status("Unknown clip: " + launch.name + " — No action taken"); return;}
    var config = KLJModel.clone(row), event = ++token;
    var context = null, contextError = null, contextAttempted = false;
    function checkedTrack(t) {
        if (!contextAttempted) {
            contextAttempted = true;
            var begin = Date.now();
            try {context = recallTrackContext();} catch (e) {contextError = e;}
            timings.nameScanMs = Date.now() - begin;
        }
        if (contextError) throw contextError;
        return guardedTrack(t, context);
    }
    var actualValues = {tempo: null, root_note: null, scale_name: null, selectedTrack: null};
    var applyStarted = Date.now();
    recallWarnings = KLJModel.apply(config, runtime, {
        song: function (p, value) {setIfDifferent(song, p, value, null, function (observed) {actualValues[p] = observed;});},
        mute: function (t, value) {
            // Legacy model callback: 0 means active, 1 inactive. Keep saved ON/OFF data unchanged.
            // This variant controls only monitoring: 0 = In, 2 = Off (never Auto, mute or Device On).
            // A read-only no-op needs no Set scan. Every actual write still goes through the guard.
            setIfDifferent(apiId(t.id), "current_monitoring_state", value === 0 ? 0 : 2, function () {return checkedTrack(t);});
        },
        select: function (t) {
            var current = ids(get(songView, "selected_track"))[0];
            actualValues.selectedTrack = current;
            if (current !== t.id) {
                checkedTrack(t);
                write(songView, "selected_track", "id", t.id);
                actualValues.selectedTrack = ids(get(songView, "selected_track"))[0];
            }
            var actualTrack = actualValues.selectedTrack;
            if (actualTrack !== t.id) throw new Error("Push selection requested=" + t.id + ", actual=" + actualTrack);
            timings.pushSelectedAfterMs = Date.now() - started;
        }
    });
    timings.applyMs = Date.now() - applyStarted;
    lastRecall = {clip: config.clip, requested: {bpm: config.bpm, root: config.root, scale: config.scale},
        actual: {bpm: actualValues.tempo, root: actualValues.root_note, scale: actualValues.scale_name,
            selectedTrack: actualValues.selectedTrack},
        warnings: recallWarnings.slice(), timings: timings};
    active = config.clip;
    var uiStarted = Date.now();
    status(recallWarnings.length ? recallWarnings.join(" | ") : "Configuration applied");
    timings.uiMs = Date.now() - uiStarted;
    if (config.script.trim()) {
        scriptDict.parse(JSON.stringify({token: event, script: config.script,
            context: {clip: config.clip, rowId: config.id, bpm: config.bpm, root: config.root, scale: config.scale}}));
        var scriptStarted = Date.now();
        outlet(1, "run", scriptDict.name);
        timings.scriptDispatchMs = Date.now() - scriptStarted;
    }
    timings.totalMs = Date.now() - started;
    lastRecall.apiCalls = {get: apiCounts.get - callsBefore.get, set: apiCounts.set - callsBefore.set,
        create: apiCounts.create - callsBefore.create};
    post("KLJ recall: " + JSON.stringify(lastRecall) + "\n");
}
function scriptresult(name) {
    try {
        var result = JSON.parse(new Dict(name).stringify());
        if (result.token !== token) return;
        if (!result.ok) status("JavaScript error [" + active + "] : " + result.message + (recallWarnings.length ? " | " + recallWarnings.join(" | ") : ""));
    } catch (e) {warn(e);}
}
function init() {
    if (ready) return;
    initializing = true;
    try {
        view = new KLJView(this.patcher, namespace);
        ownTrack = findOwnTrack();
        if (!Number(read(apiId(ownTrack), "has_midi_input"))) throw new Error("The control track must be MIDI");
        song = liveObject(null, "live_set");
        songView = liveObject(null, "live_set view");
        scanTask = new Task(function () {scanPending = false; try {refresh(false);} catch (e) {warn(e);}}, this);
        clipTask = new Task(checkClip, this);
        clipRetryTask = new Task(checkClip, this);
        ready = true;
        refresh(true);
        var first = snapshot();
        gate.read(first, true);
        bindClip(first.id || 0);
        observe("live_set", "tracks", structureChanged, observers);
        observe("live_set", "is_playing", songPlayingChanged, observers);
        observe("id " + ownTrack, "playing_slot_index", scheduleClip, observers);
        observe("id " + ownTrack, "clip_slots", scheduleClip, observers);

        status(inventoryNotice() || migrationNotice || (runtime.some(function (t) {return t.ambiguous;})
            ? "Ready — duplicate track names: ambiguous targets skipped"
            : "Ready — waiting for next clip"));
        post("KLJ Phase 1 dev ready: " + runtime.length + " MIDI tracks; control track ID " + ownTrack + "\n");
    } catch (e) {shutdown(); warn(e);}
    finally {initializing = false;}
}
function ui() {
    if (!view) return;
    var args = arrayfromargs(arguments), event = String(args.shift());
    try {
        if (event === "editoropen") {
            try {if (ready && !restoreBlocked && restorationReady) refresh(false);}
            finally {view.setVisible(true);}
            return;
        }
        if (event === "editorclose") {
            if (ready && !restoreBlocked && restorationReady) view.flush(state, runtime, {changed: function () {userEdited = true; KLJModel.validate(state); persist();}});
            view.setVisible(false); return;
        }
        if (!ready) throw new Error("Device not initialized");
        if (event === "refreshtracks") {
            if (!restorationReady || restoreBlocked) throw new Error("Restore is not valid; saved data retained. Reopen a known-good Set.");
            refresh(false); return;
        }
        if (!restorationReady || restoreBlocked) {
            if (["layout", "mousex", "mousey"].indexOf(event) >= 0) return;
            throw new Error("Saved data has not been restored safely; editing and recall are blocked.");
        }
        view.event(event, args, state, runtime, {
            changed: function () {userEdited = true; KLJModel.validate(state); persist(); view.render(state, runtime);},
            defaults: function () {return {bpm: Number(read(song, "tempo")), root: Number(read(song, "root_note")), scale: String(read(song, "scale_name"))};},
            warn: warn
        });
    } catch (e) {warn(e); view.render(state, runtime);}
}
function shutdown() {
    ready = false;
    clipNotificationAt = null;
    clipCheckPending = false;
    [scanTask, clipTask, pollTask, clipRetryTask].forEach(function (t) {if (t) t.cancel();});
    release(observers); release(trackObservers);
    Object.keys(nameObservers).forEach(function (id) {release([nameObservers[id]]);}); nameObservers = Object.create(null);
    if (clipObserver) release([clipObserver]);
    clipObserver = null; observedClip = 0; trackSignature = "";
    trackHandles = Object.create(null); knownMidiIds = []; slotHandle = null; clipHandle = null;
}
function freebang() {shutdown();}
function debugnames(value) {if (view) view.traceNames = !!Number(value);}
