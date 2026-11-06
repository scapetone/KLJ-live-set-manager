#!/usr/bin/env python3
"""Check actual patch wiring, persistence metadata and packaged dependencies."""
import json
import re
from pathlib import Path
from build_patch import ROOT

path = ROOT/'device/KLJ Live Set Manager.maxpat'
patch = json.loads(path.read_text())['patcher']
count = 0


def validate(p):
    global count
    boxes = {x['box']['id']: x['box'] for x in p['boxes']}
    assert len(boxes) == len(p['boxes']), 'Duplicate box IDs'
    for line in p['lines']:
        wire = line['patchline']
        assert wire['source'][0] in boxes, wire
        assert wire['destination'][0] in boxes, wire
        assert wire['source'][1] >= 0 and wire['destination'][1] >= 0, wire
    for b in boxes.values():
        count += 1
        assert len(b['patching_rect']) == 4
        if 'patcher' in b:
            validate(b['patcher'])
    return boxes


boxes = validate(patch)
links = {(tuple(x['patchline']['source']), tuple(x['patchline']['destination'])) for x in patch['lines']}
for source, dest in [(('midiin', 0), ('midiout', 0)), (('engine', 0), ('state', 0)),
                     (('state', 0), ('restore', 0)), (('restore', 0), ('engine', 0)),
                     (('engine', 1), ('runner', 0)), (('runner', 0), ('engine', 0)),
                     (('ready', 0), ('restore_first', 0)), (('defer', 0), ('init_order', 0)),
                     (('pcontrol', 0), ('editor', 0)), (('open_msg',0),('open_order',0)), (('opened_msg',0),('uievent',0)), (('open_order',0),('window_open',0)), (('window_open',0),('pcontrol',0))]:
    assert (source, dest) in links, (source, dest)
assert boxes['window_open']['maxclass'] == 'message' and boxes['window_open']['text'] == 'open', 'pcontrol must receive open, not a trigger bang'
parameter = boxes['state']['saved_attribute_attributes']['valueof']
assert boxes['state']['saved_object_attributes']['parameter_enable'] == 1
assert parameter['parameter_type'] == 3, 'Persistence must be Blob'
assert parameter['parameter_invisible'] == 1, 'Persistence must be Stored Only, not Hidden'
assert patch['parameters']['state'][0] == parameter['parameter_longname']
editor = {x['box']['id']: x['box'] for x in boxes['editor']['patcher']['boxes']}
editor_names = {b.get('varname') for b in editor.values()}
for name in re.findall(r'this\.editor\.getnamed\("([^"]+)"\)', (path.parent/'klj.ui.js').read_text()):
    assert name in editor_names, f'UI scripting name missing: {name} (box ID alone is not enough)'
assert boxes['open']['text'] == boxes['open']['texton'] == 'OPEN CONFIGURATIONS'
assert editor['active_label']['text'] == '●  ACTIVE · —'
assert [editor[n]['text'] for n in ['add','duplicate','delete','details']] == ['+ ADD','DUPLICATE','DELETE','JAVASCRIPT']
assert '"PUSH", "MORE"' in (path.parent/'klj.ui.js').read_text()
for script in path.parent.glob('klj.*.js'):
    for french in ['EN COURS','Aucune','aucune','inconnu','appliquée','Prêt','SUPPRIMER','DUPLIQUER','NOUVEAU_CLIP','_COPIE','invalide','attendu','initialisé']:
        assert french not in script.read_text(), (script.name, french)
assert editor['layoutload']['text'] == 'loadmess 0'
assert editor['mousepoll']['text'] == 'loadmess nopoll'
assert editor['editor_closed']['text'] == 'closebang'
assert editor['refreshtracks']['text'] == 'REFRESH TRACKS'
assert editor['grid']['selmode'] == 5
assert editor['grid']['outmode'] == 0, 'V1.5-EN must not serialize cell symbols with padding'
assert editor['grid']['rowhead'] == 0
assert editor['headers']['fgcolor'] == [243/255,245/255,249/255,1], 'Header foreground must contrast with its background'
assert editor['headers']['rows'] == 1 and editor['headers']['readonly'] == 0 and editor['headers']['selmode'] == 0
assert editor['headers']['hsync'] == 1 and editor['headers']['vsync'] == 0
assert editor['headers']['selsync'] == 0
assert editor['headers']['hscroll'] == editor['headers']['vscroll'] == 0
assert editor['clips']['cols'] == 1 and editor['clips']['selmode'] == 5
assert editor['clips']['hscroll'] == editor['clips']['hsync'] == editor['grid']['hsync'] == 0
assert editor['clips']['vscroll'] == 1
assert editor['grid']['vsync'] == editor['clips']['vsync'] == 1
assert editor['grid']['selsync'] == editor['clips']['selsync'] == 0
assert editor['clip_header']['hsync'] == editor['clip_header']['vsync'] == 0
assert editor['cell_event']['text'] == 'prepend parametercell'
assert editor['sync_event']['text'] == 'prepend parametersync'
assert editor['grid']['colhead'] == 0, 'The CLIP column must remain editable'
assert editor['cellmenu']['maxclass'] == 'umenu'
assert editor['cellmenu']['ignoreclick'] == 0
assert editor['cellmenu']['menumode'] == 0
editor_links = {(tuple(x['patchline']['source']), tuple(x['patchline']['destination'])) for x in boxes['editor']['patcher']['lines']}
for source, dest in [(('cellmenu',0),('menu_event',0)), (('menu_event',0),('events',0)),
                     (('grid',2),('sync_event',0)), (('grid',2),('clips',1)), (('clips',2),('grid',1)),
                     (('clips',0),('clip_cell_event',0)), (('clip_cell_event',0),('events',0)), (('grid',2),('headers',1)),
                     (('layoutclock',0),('layoutmsg',0)), (('layoutmsg',0),('events',0))]:
    assert (source,dest) in editor_links
assert editor['grid']['hscroll'] == editor['grid']['vscroll'] == 1
assert all(n not in editor for n in ['hint','footer','script_hint'])
for name in ['warning_panel','status_label','warning_close','script_panel','script_close']:
    assert name in editor
assert editor['script']['keymode'] == 0 and editor['script']['outputmode'] == 1
for dependency in patch['dependency_cache']:
    assert (path.parent/dependency['name']).is_file(), dependency
project_path = path.parent/'device.maxproj'
project = json.loads(project_path.read_text())
assert project_path.stem == project_path.parent.name, 'Max project folder and filename must match'
assert project['amxdtype'] == 2, 'Must export as MIDI effect'
for group in project['contents'].values():
    for name in group:
        assert (path.parent/name).is_file(), name
print(f'OK: {count} Max boxes, all patch cords, Blob / Stored Only state, MIDI project and dependencies')

amxd = path.parent/'KLJ Live Set Manager.amxd'
if amxd.exists():
    binary = amxd.read_bytes()
    assert binary[:4] == b'ampf', 'Not a native AMXD container'
    assert binary[8:12] == b'mmmm', 'Not a MIDI effect'
    assert binary[24:28] == b'ptch', 'Missing native patch chunk'
    size = int.from_bytes(binary[28:32], 'little')
    exported = json.loads(binary[32:32+size].rstrip(b'\x00'))['patcher']
    exported_boxes = validate(exported)
    exported_links = {(tuple(x['patchline']['source']), tuple(x['patchline']['destination'])) for x in exported['lines']}
    assert links == exported_links, 'Export lost a main patch cord'
    assert exported_boxes['engine']['numoutlets'] == 2
    assert exported_boxes['editor']['patcher'] == boxes['editor']['patcher'], 'AMXD editor differs from current source'
    assert exported_boxes['title']['text'] == boxes['title']['text']
    assert exported_boxes['title']['text'] == 'KLJ / LIVE MANAGER  V1.7.0'
    assert exported_boxes['state']['saved_object_attributes']['parameter_enable'] == 1
    assert exported_boxes['state']['saved_attribute_attributes']['valueof']['parameter_type'] == 3
    assert exported.get('openinpresentation') == 1
    assert exported_boxes['editor']['patcher']['openinpresentation'] == 1
    assert exported_boxes['state'].get('restore') == [0], 'Do not ship musician/test configurations'
    for name in ['engine', 'runner']:
        assert exported_boxes[name]['text'] == boxes[name]['text']
    print(f'OK: native MIDI AMXD, {len(exported_boxes)} root boxes, all {len(links)} main patch cords, empty state and presentation mode')
