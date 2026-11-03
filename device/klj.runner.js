/* Native Max v8. This is free JavaScript, NOT a security sandbox. */
autowatch = 0;
inlets = 1;
outlets = 1;
var ready = false;
function init() { ready = true; }
function run(dictName) {
    var payload, result;
    try {
        if (!ready) throw new Error("LiveAPI is not initialized yet");
        payload = JSON.parse(new Dict(dictName).stringify());
        var execute = new Function("LiveAPI", "context", '"use strict";\n' + payload.script);
        execute(LiveAPI, Object.freeze(payload.context));
        result = {token: payload.token, ok: 1, message: "Script completed"};
    } catch (e) {
        result = {token: payload ? payload.token : -1, ok: 0,
            message: String(e.name || "Error") + ": " + String(e.message || e)};
        error("KLJ script: " + result.message + "\n");
    }
    var dict = new Dict(jsarguments[1] + "_script_result");
    dict.parse(JSON.stringify(result));
    outlet(0, "scriptresult", dict.name);
}
