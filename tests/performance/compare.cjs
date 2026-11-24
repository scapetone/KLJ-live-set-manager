/* Compare unchanged-command behavior across two audit runs. No Live connection. */
const fs = require('node:fs');
const assert = require('node:assert/strict');
const [beforePath, afterPath] = process.argv.slice(2);
assert.ok(beforePath && afterPath, 'Usage: node compare.cjs baseline.json candidate.json');
const before = JSON.parse(fs.readFileSync(beforePath)).results;
const after = JSON.parse(fs.readFileSync(afterPath)).results;
assert.equal(after.length, before.length);
for (let i = 0; i < before.length; i++) {
    const a = before[i], b = after[i];
    const key = x => [x.total, x.midi, x.rows, x.devices, x.scriptBytes, x.scenario];
    assert.deepEqual(key(b), key(a), 'Mismatched scenario');
    assert.deepEqual(b.writeLog, a.writeLog, 'Changed commands: ' + key(a).join('/'));
    assert.equal(b.counts.apiSet, a.counts.apiSet);
    if (a.scenario === 'recall_already_correct' || a.scenario === 'recall_all_changed') {
        assert.ok(b.counts.apiGet < a.counts.apiGet, 'Recall reads did not decrease');
        assert.ok(b.counts.apiNew < a.counts.apiNew, 'Recall constructors did not decrease');
        console.log(key(a).join('/') + ': reads ' + a.counts.apiGet + ' -> ' + b.counts.apiGet
            + ', constructors ' + a.counts.apiNew + ' -> ' + b.counts.apiNew
            + ', writes ' + b.counts.apiSet);
    }
}
console.log('PASS: identical write targets, values and order across all ' + before.length + ' scenarios.');
