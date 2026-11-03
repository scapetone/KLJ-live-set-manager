#!/usr/bin/env python3
"""Update the ptch payload of the native MIDI AMXD exported for V1.

This preserves Max's AMPF/MIDI metadata. The result is a native container, not a
.maxpat renamed .amxd. Native-load verification is recorded separately.
"""
import json
from pathlib import Path
from build_patch import ROOT

source_path = ROOT/'device/KLJ Live Set Manager.maxpat'
template_path = ROOT/'tools/templates/midi-effect.amxd'
dest = ROOT/'device/KLJ Live Set Manager.amxd'
binary = template_path.read_bytes()
assert binary[:4] == b'ampf' and binary[8:12] == b'mmmm' and binary[24:28] == b'ptch'
size = int.from_bytes(binary[28:32], 'little')
assert len(binary) == 32 + size, 'Unexpected trailing chunks: do not discard them'
original = json.loads(binary[32:].rstrip(b'\0'))['patcher']
patch = json.loads(source_path.read_text())['patcher']
# Preserve the native object's inlet/outlet metadata, especially v8's script outlets.
old = {x['box']['id']: x['box'] for x in original['boxes']}
for item in patch['boxes']:
    b = item['box']
    for key in ['numinlets', 'numoutlets', 'outlettype']:
        if key in old.get(b['id'], {}):
            b[key] = old[b['id']][key]
    if b['id'] == 'state':
        b['restore'] = [0]
payload = json.dumps({'patcher':patch}, ensure_ascii=False, indent=2).encode() + b'\0'
dest.write_bytes(binary[:28] + len(payload).to_bytes(4, 'little') + payload)
print(dest)
