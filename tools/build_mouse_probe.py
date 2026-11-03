#!/usr/bin/env python3
"""Native mouse harness: actual editor and outlet wiring, no Live commands."""
import json
from build_patch import ROOT
p=json.loads((ROOT/'device/KLJ Live Set Manager.maxpat').read_text())
for item in p['patcher']['boxes']:
    b=item['box']
    if b['id']=='engine': b['text']=f'v8 {ROOT}/tests/max/mouse-probe.js #0 {ROOT}/device'
    if b['id']=='runner': b['text']=f'v8 {ROOT}/device/klj.runner.js #0'
    if b['id']=='ready': b['text']='loadbang'
p['patcher'].pop('dependency_cache',None)
d=ROOT/'tests/max/generated/Mouse probe.maxpat'
d.parent.mkdir(exist_ok=True,parents=True)
d.write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
print(d)
