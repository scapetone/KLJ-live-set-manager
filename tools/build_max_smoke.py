#!/usr/bin/env python3
"""Generate a native Max smoke harness using the real view, runner and patch."""
import json
from pathlib import Path
from build_patch import ROOT

source = json.loads((ROOT/'device/KLJ Live Set Manager.maxpat').read_text())
p = source['patcher']
for item in p['boxes']:
    b = item['box']
    if b['id'] == 'engine':
        b['text'] = f'v8 {ROOT}/tests/max/native-smoke.js #0 {ROOT}/device /tmp/klj-max-smoke-v1.5-en.json'
    if b['id'] == 'runner':
        b['text'] = f'v8 {ROOT}/device/klj.runner.js #0'
    if b['id'] == 'ready':
        b['text'] = 'loadbang'
p.pop('dependency_cache', None)
dest = ROOT/'tests/max/generated/Native smoke.maxpat'
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(json.dumps(source, ensure_ascii=False, indent=2)+'\n')
print(dest)
