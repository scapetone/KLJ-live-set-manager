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
var recallWarnings = [], initializing = false;
var migrationNotice = "", lastRecall = null;
var namespace = String(jsarguments[1]);
var storeDict = new Dict(namespace + "_state"), scriptDict = new Dict(namespace + "_script");

function scalar(value) {return Array.isArray(value) ? (value.length === 1 ? value[0] : value.join(" ")) : value;}
function read(api, property) {return scalar(api.get(property));}
function ids(value) {return (Array.isArray(value) ? value : [value]).filter(function (x) {return x !== "id" && Number(x) > 0;}).map(Number);}
function apiId(id) {return new LiveAPI(null, "id " + Number(id));}
function warn(e) {status(String(e && e.message ? e.message : e)); error("KLJ: " + statusText + "\n");}
function status(text) {
    statusText = text + (ready && runtime.length === 0
        ? " | No playable MIDI tracks: control track, groups and audio tracks are excluded." : "");
    if (view) view.status(active, statusText);
    this.patcher.getnamed("active").message("set", active);
    this.patcher.getnamed("status").message("set", statusText);
}
function persist() {
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
    if (!name) return; // A new pattr outputs its scalar default, not a KLJ state.
    try {
        var raw = JSON.parse(new Dict(String(name)).stringify());
        var restored = KLJModel.migrate(raw);
        state = restored.state;
        lastStored = JSON.stringify(raw); // Persist the cleaned names, even if nothing else changes.
        migrationNotice = restored.changes.length ? "Names normalized: " + restored.changes.map(function (c) {
            post("KLJ name restored: " + JSON.stringify(c) + "\n"); return JSON.stringify(c.raw) + " → " + c.name;
        }).join(" ; ") : "";
        if (ready) {
            restoring = true;
            try {refresh(true); gate.read(snapshot(), true); view.render(state, runtime);}
            finally {restoring = false;}
            status(migrationNotice || "Configurations restored — waiting for next clip");
        }
    } catch (e) {warn(e);}
}
function observe(path, property, fn, bag) {
    var object = new LiveAPI(function (args) {if (ready) fn(args);}, path);
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
    var trackIds = ids(new LiveAPI(null, "live_set").get("tracks"));
    var object = new LiveAPI(null, "this_device");
    for (var n = 0; n < 12; n++) {
        // Live reports concrete classes (e.g. MidiTrack), not always the LOM base class Track.
        if (trackIds.indexOf(Number(object.id)) >= 0) return Number(object.id);
        if (!Number(object.id) || object.type === "Song") break;
        var parent = ids(object.get("canonical_parent"))[0];
        if (!parent) break;
        object = apiId(parent);
    }
    throw new Error("Place the device on the MIDI control clip track");
}
function describe(id, position) {
    var t = apiId(id);
    if (!Number(t.id)) throw new Error("Track deleted during scan");
    var midi = Number(read(t, "has_midi_input")) === 1;
    var instrument = false;
    if (midi && id !== ownTrack) instrument = ids(t.get("devices")).some(function (d) {
        return Number(read(apiId(d), "type")) === 1;
    });
    return {id: id, name: String(read(t, "name")), position: position,
        midi: midi, audio: Number(read(t, "has_audio_input")) === 1,
        group: Number(read(t, "is_foldable")) === 1, control: id === ownTrack,
        instrument: instrument, frozen: Number(read(t, "is_frozen")) === 1};
}
function scheduleScan() {if (scanTask) scanTask.schedule(0);}
function scheduleClip() {if (clipTask) clipTask.schedule(0);}
function songPlayingChanged(args) {
    // Preserve an observed stop even when stop/start are delivered before the deferred task.
    if (!initializing && args && args[0] === "is_playing" && Number(args[1]) === 0) gate.read({playing: false});
    scheduleClip();
}
function clipStatusChanged() {
    try {if (!initializing && !snapshot().playing) gate.read({playing: false});} catch (_) {}
    scheduleClip();
}
function refresh(initial) {
    var previousCount = runtime.length;
    var trackIds = ids(song.get("tracks"));
    // Build the entire inventory before mutating persisted data: a failed scan cannot delete columns.
    var descriptors = trackIds.map(function (id, i) {return describe(id, i + 1);});
    var signature = JSON.stringify(descriptors);
    if (!initial && signature === trackSignature) return;
    runtime = KLJModel.reconcile(state, descriptors, runtime, !!initial);
    trackSignature = signature;
    release(trackObservers);
    descriptors.forEach(function (t) {
        observe("id " + t.id, "name", scheduleScan, trackObservers);
        if (t.midi) observe("id " + t.id, "devices", scheduleScan, trackObservers);
    });
    persist();
    if (view) view.render(state, runtime);
    if (runtime.some(function (t) {return t.ambiguous;})) status("Duplicate track names: ambiguous targets skipped");
    else if (!initial && previousCount !== runtime.length) status("Track list updated: " + runtime.length + " MIDI tracks");
}
function snapshot() {
    if (!Number(read(song, "is_playing"))) return {playing: false};
    var track = apiId(ownTrack), index = Number(read(track, "playing_slot_index"));
    if (index < 0) return {playing: false};
    var slotId = ids(track.get("clip_slots"))[index];
    if (!slotId) return {playing: false};
    var clipId = ids(apiId(slotId).get("clip"))[0];
    if (!clipId) return {playing: false};
    var clip = apiId(clipId);
    return {playing: Number(read(clip, "is_playing")) === 1, id: Number(clip.id), name: String(read(clip, "name"))};
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
    if (!ready || restoring || initializing) return;
    try {
        var current = snapshot();
        // An index notification can precede is_playing=1. Observe that clip now, not two seconds later.
        bindClip(current.id || 0);
        var launch = gate.read(current, false);
        if (launch) recall(launch);
    } catch (e) {warn(e);}
}
function guardedTrack(target) {
    // Never trust a stored index or yesterday's inventory at the write boundary.
    var currentIds = ids(song.get("tracks"));
    var position = currentIds.indexOf(target.id);
    if (position < 0) throw new Error("track missing");
    var descriptor = describe(target.id, position + 1);
    if (!KLJModel.eligible(descriptor)) throw new Error("unauthorized MIDI target: command rejected");
    if (descriptor.frozen) throw new Error("track frozen: command skipped");
    var names = currentIds.filter(function (id) {return id !== ownTrack;}).map(function (id) {
        return {id: id, api: apiId(id)};
    }).filter(function (x) {return Number(read(x.api, "has_midi_input")) === 1 && String(read(x.api, "name")) === descriptor.name;});
    if (names.length !== 1) throw new Error("ambiguous name: command rejected");
    return apiId(target.id);
}
function setIfDifferent(api, property, value) {
    if (read(api, property) !== value) api.set(property, value);
    var actual = read(api, property);
    if (typeof value === "number" ? Math.abs(Number(actual) - value) > 0.001 || !Number.isFinite(Number(actual)) : actual !== value)
        throw new Error("LiveAPI " + property + " requested=" + JSON.stringify(value) + ", actual=" + JSON.stringify(actual));
    return actual;
}
function recall(launch) {
    refresh(false);
    var actual = snapshot();
    if (!actual.playing || actual.id !== launch.id) return;
    var clipName = KLJModel.normalizeName(launch.name);
    if (view && (view.traceNames || clipName !== launch.name)) post("KLJ clip name → match: " + JSON.stringify({
        raw: launch.name, rawLength: launch.name.length, name: clipName, length: clipName.length
    }) + "\n");
    var row = state.rows.find(function (r) {return r.clip === clipName;});
    if (!row) {status("Unknown clip: " + launch.name + " — No action taken"); return;}
    var config = KLJModel.clone(row), event = ++token;
    recallWarnings = KLJModel.apply(config, runtime, {
        song: function (p, value) {setIfDifferent(song, p, value);},
        mute: function (t, value) {setIfDifferent(guardedTrack(t), "mute", value);},
        select: function (t) {
            guardedTrack(t);
            var current = ids(songView.get("selected_track"))[0];
            if (current !== t.id) songView.set("selected_track", "id", t.id);
            var actualTrack = ids(songView.get("selected_track"))[0];
            if (actualTrack !== t.id) throw new Error("Push selection requested=" + t.id + ", actual=" + actualTrack);
        }
    });
    lastRecall = {clip: config.clip, requested: {bpm: config.bpm, root: config.root, scale: config.scale},
        actual: {bpm: Number(read(song, "tempo")), root: Number(read(song, "root_note")), scale: String(read(song, "scale_name")), selectedTrack: ids(songView.get("selected_track"))[0]},
        warnings: recallWarnings.slice()};
    post("KLJ recall: " + JSON.stringify(lastRecall) + "\n");
    active = config.clip;
    status(recallWarnings.length ? recallWarnings.join(" | ") : "Configuration applied");
    if (config.script.trim()) {
        scriptDict.parse(JSON.stringify({token: event, script: config.script,
            context: {clip: config.clip, rowId: config.id, bpm: config.bpm, root: config.root, scale: config.scale}}));
        outlet(1, "run", scriptDict.name);
    }
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
        song = new LiveAPI(null, "live_set");
        songView = new LiveAPI(null, "live_set view");
        scanTask = new Task(function () {try {refresh(false); checkClip();} catch (e) {warn(e);}}, this);
        clipTask = new Task(checkClip, this);
        ready = true;
        refresh(true);
        var first = snapshot();
        gate.read(first, true);
        bindClip(first.id || 0);
        observe("live_set", "tracks", scheduleScan, observers);
        observe("live_set", "is_playing", songPlayingChanged, observers);
        observe("id " + ownTrack, "playing_slot_index", scheduleClip, observers);
        observe("id " + ownTrack, "clip_slots", scheduleClip, observers);
        // Backstop for device changes not observed by a particular Live version. Never writes MIDI states.
        pollTask = new Task(function () {scheduleScan(); scheduleClip();}, this);
        pollTask.interval = 2000;
        pollTask.repeat();
        status(migrationNotice || (runtime.some(function (t) {return t.ambiguous;})
            ? "Ready — duplicate track names: ambiguous targets skipped"
            : "Ready — waiting for next clip"));
        post("KLJ V1.5-EN ready: " + runtime.length + " MIDI tracks; control track ID " + ownTrack + "\n");
    } catch (e) {shutdown(); warn(e);}
    finally {initializing = false;}
}
function ui() {
    if (!view) return;
    var args = arrayfromargs(arguments), event = String(args.shift());
    try {
        if (!ready) throw new Error("Device not initialized");
        view.event(event, args, state, runtime, {
            changed: function () {KLJModel.validate(state); persist(); view.render(state, runtime);},
            defaults: function () {return {bpm: Number(read(song, "tempo")), root: Number(read(song, "root_note")), scale: String(read(song, "scale_name"))};},
            warn: warn
        });
    } catch (e) {warn(e); view.render(state, runtime);}
}
function shutdown() {
    ready = false;
    [scanTask, clipTask, pollTask].forEach(function (t) {if (t) t.cancel();});
    release(observers); release(trackObservers);
    if (clipObserver) release([clipObserver]);
    clipObserver = null; observedClip = 0; trackSignature = "";
}
function freebang() {shutdown();}
function debugnames(value) {if (view) view.traceNames = !!Number(value);}
