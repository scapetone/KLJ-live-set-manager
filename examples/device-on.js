/* Paste this into MORE for a row. Replace the two exact names below.
 * Only the selected device's Device On parameter is changed. No track mix writes.
 * This example finds a device at the top level of a track, not inside a rack.
 */
const TRACK_NAME = "YOUR_EXACT_TRACK_NAME";
const DEVICE_NAME = "YOUR_EXACT_DEVICE_NAME";
const DEVICE_ON = 1; // 1 = ON, 0 = OFF

function childIds(list) {
    return list.filter(x => x !== "id" && Number(x) > 0).map(Number);
}
function value(object, property) {
    const result = object.get(property);
    return Array.isArray(result) ? result.join(" ") : result;
}
function uniqueByName(ids, exactName) {
    const matches = ids.map(id => new LiveAPI(null, "id " + id))
        .filter(object => value(object, "name") === exactName);
    if (matches.length !== 1) throw new Error("Target missing or ambiguous: " + exactName);
    return matches[0];
}

const song = new LiveAPI(null, "live_set");
const track = uniqueByName(childIds(song.get("tracks")), TRACK_NAME);
const device = uniqueByName(childIds(track.get("devices")), DEVICE_NAME);
const parameters = childIds(device.get("parameters"));
// Live's device activator is parameter 0. Verify its original name before writing.
if (!parameters.length) throw new Error("This effect exposes no parameters");
const activator = new LiveAPI(null, "id " + parameters[0]);
if (value(activator, "original_name") !== "Device On") throw new Error("Device On not found");
if (Number(value(activator, "value")) !== DEVICE_ON) activator.set("value", DEVICE_ON);
