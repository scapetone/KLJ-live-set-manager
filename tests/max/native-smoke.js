/* Open the generated Native smoke.maxpat in Max 9. No Live access or musical writes. */
autowatch = 1;
inlets = 1;
outlets = 2;
include(jsarguments[2] + "/klj.model.js");
include(jsarguments[2] + "/klj.ui.js");
var state, runtime, view, stage = 0, results = [], report = String(jsarguments[3]);
var source = '// accents : été, clé ; guillemets " et antislash \\\nconst x = `une\nseconde ligne`;\nif (context.clip !== "TEST") throw Error("contexte");\npost("KLJ script natif OK : " + x);';
function result(name, ok, detail) {
    results.push({name: name, ok: !!ok, detail: detail || ""});
    post("KLJ NATIVE " + (ok ? "PASS " : "FAIL ") + name + " " + (detail || "") + "\n");
    var file = new File(report, "write", "TEXT");
    if (file.isopen) {file.eof = 0; file.writestring(JSON.stringify({results: results}, null, 2)); file.close();}
}
function init() {
    if (view) return;
    try {
        state = KLJModel.empty();
        runtime = KLJModel.reconcile(state, [{id: 20, name: "TEST KEYS", position: 11, midi: true, instrument: true},
            {id: 21, name: "TEST BASS", position: 12, midi: true, instrument: true}], [], true);
        var r = KLJModel.add(state, {bpm: 118, root: 5, scale: "Minor"});
        r.pushMode = "64 PADS";
        r.clip = "TEST"; r.script = source; r.enabled[runtime[0].key] = 1;
        view = new KLJView(this.patcher, jsarguments[1]);
        this.patcher.getnamed("runner").message("init");
        view.render(state, runtime);
        view.status("TEST — simulation", "Test natif ; aucune commande Live");
        result("model + UI compile/render in native v8", true);
        view.showDetails(true);
        var d = new Dict(jsarguments[1] + "_smoke_state"); d.parse(JSON.stringify(state));
        outlet(0, "dictionary", d.name);
        new Task(function () {
            result("textedit getvalueof multiline roundtrip", view.scriptValue() === source);
            this.patcher.getnamed("klj_state").message("bang");
        }, this).schedule(100);
        new Task(regressions, this).schedule(300);
        var payload = new Dict(jsarguments[1] + "_smoke_script");
        payload.parse(JSON.stringify({token: 1, script: source, context: {clip: "TEST"}}));
        outlet(1, "run", payload.name);
    } catch (e) {result("initialization", false, String(e));}
}
function restore() {
    var args = arrayfromargs(arguments);
    if (args[0] !== "dictionary" || !state) return;
    try {
        var copy = JSON.parse(new Dict(args[1]).stringify());
        result("pattr dictionary copy + multiline script", copy.rows[0].script === source);
        if (stage === 1) result("V1.5-EN names + ROOT/SCALE + legacy mode pattr roundtrip",
            copy.rows[0].clip === "B  C" && copy.rows[0].root === 4 &&
            copy.rows[0].scale === "Minor" && copy.rows[0].pushMode === "64 PADS" && copy.rows[0].push === runtime[0].key);
    } catch (e) {result("pattr dictionary", false, String(e));}
}
function ui() {
    var a = arrayfromargs(arguments), event = a.shift();
    if (view) try {view.event(event, a, state, runtime, {
        changed: function () {view.render(state, runtime);},
        defaults: function () {return {bpm: 120, root: 0, scale: "Minor"};}
    });} catch (e) {result("UI event", false, String(e));}
}
function scriptresult(name) {
    var r = JSON.parse(new Dict(name).stringify());
    result("new Function native runner token " + r.token, r.ok === (r.token === 2 ? 0 : 1), r.message);
    if (r.token >= 1 && r.token < 3) {
        var payload = new Dict(jsarguments[1] + "_smoke_next");
        payload.parse(JSON.stringify({token: r.token + 1, context: {clip: "TEST"},
            script: r.token === 1 ? 'throw new Error("Erreur attendue")' : 'if (context.clip !== "TEST") throw Error("suite");'}));
        outlet(1, "run", payload.name);
    }
}
var startupTask = new Task(init, this);
startupTask.schedule(200);

function regressions() {
    try {
        var grid = view.clips;
        grid.message("set", 0, 0, " A  "); grid.message("select", 0, 0);
        for (var i = 0; i < 10; i++) grid.message("select", 0, 0);
        result("V1.5-EN ten native grid selections keep A length 1", state.rows[0].clip === "A");
        grid.message("set", 0, 0, "  B  C  "); grid.message("select", 0, 0);
        result("V1.5-EN native grid preserves internal double space", state.rows[0].clip === "B  C");
        function click(col) {ui("parametersync", "click", 1, 0, 1, 0); view.grid.message("select", col - 1, 0);}
        click(2);
        result("V1.5-EN ROOT menu visible", view.menu.hidden === 0 && view.menuTarget.field === "root");
        view.menu.message("int", 4);
        click(3);
        result("V1.5-EN SCALE menu visible", view.menu.hidden === 0 && view.menuTarget.field === "scale");
        view.menu.message("int", KLJModel.SCALES.indexOf("Minor"));
        result("V1.5-EN native ROOT/SCALE outlets set E Minor", state.rows[0].root === 4 && state.rows[0].scale === "Minor");
        click(4 + runtime.length); view.menu.message("int", 1);
        result("V1.5-EN native PUSH outlet selects track key", state.rows[0].push === runtime[0].key);
        result("V1.5-EN legacy mode data retained without UI", state.rows[0].pushMode === "64 PADS");
        var fields = [];
        // The separate header contains one row and remains outside vertical body scrolling.
        result("V1.5-EN header separate and no user selection", !!view.headers && Number(view.headers.getattr("selmode")) === 0);
        var channel = jsarguments[1] + "_header_probe";
        var capture = view.editor.newdefault(1100, 1100, "send", channel);
        var receive = this.patcher.newdefault(1100, 1100, "receive", channel);
        var prefix = this.patcher.newdefault(1100, 1130, "prepend", "headercell");
        view.editor.connect(view.clipHeader, 0, capture, 0);
        this.patcher.connect(receive, 0, prefix, 0);
        this.patcher.connect(prefix, 0, this.patcher.getnamed("engine"), 0);
        view.clipHeader.message("dump");
        var before = JSON.stringify(state);
        view.layout(true); view.showDetails(false); view.showDetails(true);
        result("V1.5-EN layout and details preserve all configuration fields", JSON.stringify(state) === before);
        result("V1.5-EN body uses new first row without overwriting header", state.rows[0].clip === "B  C");
        result("V1.5-EN MIDI width bounded", view.columnWidths[4] <= 160);
        stage = 1;
        var data = new Dict(jsarguments[1] + "_smoke_v11"); data.parse(JSON.stringify(state));
        outlet(0, "dictionary", data.name);
        this.patcher.getnamed("klj_state").message("bang");
    } catch (e) {result("V1.5-EN native regressions", false, String(e));}
}

function headercell() {
    var a = arrayfromargs(arguments);
    if (a[0] === 0 && a[1] === 0) result("V1.5-EN actual header dump contains CLIP", a.indexOf("CLIP") >= 0, JSON.stringify(a));
}
