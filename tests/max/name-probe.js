/* Reproduce jit.cellblock's serialization independently of the model/pattr/Live. */
autowatch = 0;
inlets = 1;
outlets = 0;
var grid, task, cases, current = -1, iteration = 0, results = [], accepting = false;
function init() {
    if (task) return;
    grid = this.patcher.getnamed("grid");
    cases = [{outmode: 2, initial: "A"}, {outmode: 0, initial: "A"}, {outmode: 0, initial: "B  C"}];
    task = new Task(next, this); task.schedule(0);
}
function next() {
    if (iteration === 0 || iteration === 10) {
        if (++current === cases.length) {
            var f = new File("/tmp/klj-names-native.json", "write", "TEXT");
            f.eof = 0; f.writestring(JSON.stringify(results, null, 2)); f.close();
            post("KLJ NAME PROBE terminé : /tmp/klj-names-native.json\n"); return;
        }
        iteration = 0;
        grid.message("outmode", cases[current].outmode);
        grid.message("set", 0, 1, cases[current].initial);
    }
    accepting = true;
    grid.message("select", 0, 1);
}
function cell() {
    if (!accepting) return;
    var a = arrayfromargs(arguments);
    if (a[0] !== 0 || a[1] !== 1) return;
    accepting = false;
    var atoms = a.slice(2), text = atoms.join(" ");
    results.push({outmode: cases[current].outmode, iteration: ++iteration, atoms: atoms, raw: text, length: text.length});
    // V1 fed this string unchanged back into the grid and persisted it.
    grid.message("set", 0, 1, text);
    task.schedule(10);
}
var startup = new Task(init, this); startup.schedule(200);
