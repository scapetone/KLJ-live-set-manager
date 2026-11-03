#!/usr/bin/env python3
import json
from build_patch import ROOT, Patch
p = Patch([120, 100, 500, 240], presentation=False)
p.box('grid', 'jit.cellblock', [20, 20, 420, 120], varname='grid', cols=1, rows=2, selmode=5, outmode=2)
p.obj('events', 'prepend cell', 20, 150)
p.obj('probe', f'v8 {ROOT}/tests/max/name-probe.js', 160, 150)
p.obj('load', 'loadbang', 20, 185)
p.obj('defer', 'deferlow', 90, 185)
p.box('init', 'message', [170, 185, 40, 22], 'init')
for a,b in [('grid','events'),('events','probe'),('load','defer'),('defer','init'),('init','probe')]: p.line(a,b)
dest = ROOT/'tests/max/generated/Name probe.maxpat'
dest.parent.mkdir(parents=True,exist_ok=True)
dest.write_text(json.dumps({'patcher':p.data},indent=2)+'\n')
print(dest)
