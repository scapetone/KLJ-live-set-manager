#!/usr/bin/env python3
"""Generate the source Max patch. No binary .amxd is fabricated here."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BG = [19/255, 24/255, 32/255, 1]
PANEL = [37/255, 44/255, 56/255, 1]
FG = [243/255, 245/255, 249/255, 1]
SUB = [169/255, 181/255, 198/255, 1]
GREEN = [116/255, 212/255, 172/255, 1]
AMBER = [243/255, 186/255, 121/255, 1]


class Patch:
    def __init__(self, rect, presentation=True):
        self.data = dict(fileversion=1, appversion=dict(major=9, minor=1, revision=5, architecture="arm64", modernui=1),
                         classnamespace="box", rect=rect, openinpresentation=int(presentation),
                         default_fontsize=13, default_fontface=0, default_fontname="Arial",
                         bgcolor=BG, editing_bgcolor=BG, boxes=[], lines=[])

    def box(self, id, cls, rect, text=None, present=False, **kw):
        b = dict(id=id, maxclass=cls, patching_rect=rect)
        if text is not None:
            b['text'] = text
        if present:
            b.update(presentation=1, presentation_rect=rect)
        b.update(kw)
        self.data['boxes'].append(dict(box=b))
        return id

    def obj(self, id, text, x, y, **kw):
        return self.box(id, "newobj", [x, y, max(70, len(text)*6), 22], text, **kw)

    def line(self, source, dest, outlet=0, inlet=0):
        self.data['lines'].append(dict(patchline=dict(source=[source, outlet], destination=[dest, inlet])))

    def label(self, id, text, rect, color=FG, size=13, **kw):
        return self.box(id, "comment", rect, text, present=True, textcolor=color, fontsize=size, **kw)


def editor():
    p = Patch([100, 80, 1180, 760])
    p.data.update(title="KLJ / LIVE MANAGER", toolbarvisible=0, enablehscroll=0, enablevscroll=0)
    p.label('title', 'KLJ / LIVE MANAGER', [20, 16, 550, 32], size=24, fontface=1, varname='title')
    p.label('active_label', '●  ACTIVE · —', [650, 23, 510, 24], color=GREEN, varname='active_label')
    p.box('warning_panel', 'panel', [20, 62, 1140, 36], present=True, varname='warning_panel',
          hidden=1, background=1, bgcolor=[0.18, 0.17, 0.16, 1], border=1, bordercolor=[0.34, 0.31, 0.27, 1], rounded=6, ignoreclick=1)
    p.label('warning_icon', '⚠', [30, 69, 22, 24], color=AMBER, hidden=1, varname='warning_icon')
    p.label('status_label', '', [58, 69, 1058, 24], color=FG, hidden=1, varname='status_label')
    p.box('warning_close', 'textbutton', [1128, 68, 24, 24], present=True, text='×', texton='×', varname='warning_close',
          hidden=1, bgcolor=[0.18, 0.17, 0.16, 1], textcolor=SUB, textoncolor=FG, rounded=4, mode=0)
    p.box('dismiss_msg', 'message', [20, 1000, 70, 22], 'dismiss')
    p.line('warning_close', 'dismiss_msg'); p.line('dismiss_msg', 'events')
    p.box('grid', 'jit.cellblock', [20, 108, 1140, 570], present=True, varname='grid', cols=6, rows=1,
          colhead=0, rowhead=0, rowheight=32, colwidth=140, selmode=5, outmode=0,
          hscroll=1, vscroll=1, hsync=0, vsync=1, selsync=0, savemode=0, bgcolor=BG, fgcolor=FG, textcolor=FG,
          gridlinecolor=[53/255, 61/255, 73/255, 1], headercolor=PANEL, hcellcolor=PANEL, fontsize=13)
    p.box('headers', 'jit.cellblock', [20, 72, 1122, 36], present=True, varname='headers',
          cols=6, rows=1, colhead=0, rowhead=0, rowheight=36, colwidth=140,
          selmode=0, readonly=0, automouse=0, hscroll=0, vscroll=0, hsync=1, vsync=0, selsync=0,
          savemode=0, bgcolor=[49/255,59/255,73/255,1], fgcolor=FG, textcolor=FG, fontface=1, fontsize=13,
          gridlinecolor=[53/255, 61/255, 73/255, 1])
    p.box('clips', 'jit.cellblock', [20,108,200,552], present=True, varname='clips',
          cols=1, rows=1, colhead=0, rowhead=0, rowheight=32, colwidth=200, selmode=5, outmode=0,
          hscroll=0, vscroll=1, hsync=0, vsync=1, selsync=0, savemode=0,
          bgcolor=BG, fgcolor=FG, textcolor=FG, fontsize=13,
          gridlinecolor=[53/255,61/255,73/255,1], hcellcolor=PANEL)
    p.box('clip_header', 'jit.cellblock', [20,72,200,36], present=True, varname='clip_header',
          cols=1, rows=1, rowheight=36, colwidth=200, selmode=0, readonly=0, automouse=0,
          hscroll=0, vscroll=0, hsync=0, vsync=0, selsync=0, savemode=0,
          bgcolor=[49/255,59/255,73/255,1], fgcolor=FG, textcolor=FG, fontface=1, fontsize=13,
          gridlinecolor=[53/255,61/255,73/255,1])
    p.line('grid', 'clips', 2, 1)
    p.line('clips', 'grid', 2, 1)
    p.line('grid', 'headers', 2, 1)
    # Native synchronization can leave a stale header paint after a rapid scrollbar drag.
    p.obj('header_bang', 't b', 1050, 1000)
    p.obj('header_defer', 'deferlow', 1050, 1030)
    p.box('header_refresh', 'message', [1050, 1060, 65, 22], 'refresh')
    p.line('grid', 'header_bang', 2, 0); p.line('header_bang', 'header_defer')
    p.line('header_defer', 'header_refresh'); p.line('header_refresh', 'headers')
    p.line('header_refresh', 'clips'); p.line('header_refresh', 'grid')
    p.line('clips', 'header_bang', 2, 0)
    p.box('cellmenu', 'umenu', [20, 110, 260, 26], present=True, varname='cellmenu', hidden=1,
          bgcolor=PANEL, bgfillcolor={'type':'color','color':PANEL}, textcolor=FG, elementcolor=SUB,
          items=['—'], menumode=0, ignoreclick=0, fontsize=13)
    for id, text, x, width, color in [('add', '+ ADD', 20, 150, GREEN),
                                      ('duplicate', 'DUPLICATE', 185, 140, FG),
                                      ('delete', 'DELETE', 340, 140, FG),
                                      ('details', 'JAVASCRIPT', 920, 240, AMBER)]:
        p.box(id, 'textbutton', [x, 666, width, 30], present=True, text=text, texton=text,
              bgcolor=GREEN if id == "add" else PANEL, bgoncolor=[0.22,0.57,0.44,1] if id == "add" else [0.23,0.28,0.35,1],
              textcolor=BG if id == "add" else FG, textoncolor=BG if id == "add" else FG,
              border=1, bordercolor=[0.34,0.39,0.46,1], rounded=6, fontsize=13, mode=0, outputmode=1, varname=id)
        # textbutton's left outlet sends 1 on activation; route through a fixed message instead.
        p.box('msg_'+id, 'message', [x, 835, width, 22], id)
        p.line(id, 'msg_'+id)
        p.line('msg_'+id, 'events')
    p.box('script_panel', 'panel', [20, 460, 1140, 180], present=True, varname='script_panel', hidden=1,
          background=1, bgcolor=[0.08,0.10,0.14,1], border=1, bordercolor=[0.38,0.43,0.50,1], rounded=6, ignoreclick=1)
    p.box('script_header', 'panel', [21, 461, 1138, 34], present=True, varname='script_header', hidden=1,
          background=1, bgcolor=PANEL, ignoreclick=1)
    p.label('script_dot', '●', [32, 467, 16, 24], color=AMBER, hidden=1, varname='script_dot')
    p.label('script_label', 'JAVASCRIPT', [52, 466, 1052, 24], color=FG, hidden=1, varname='script_label', fontface=1)
    p.box('script', 'textedit', [28, 498, 1124, 132], present=True, hidden=1, varname='script',
          keymode=0, outputmode=1, bangmode=0, wordwrap=0, fontsize=13, fontname='Menlo',
          bgcolor=[0.08,0.10,0.14,1], textcolor=FG, rounded=4)
    p.box('script_close', 'textbutton', [1128, 466, 24, 24], present=True, hidden=1, varname='script_close',
          text='×', texton='×', bgcolor=PANEL, textcolor=SUB, textoncolor=FG, rounded=4, mode=0)
    p.box('script_close_msg', 'message', [160, 1000, 100, 22], 'closedetails')
    p.line('script_close', 'script_close_msg'); p.line('script_close_msg', 'events')
    p.obj('cell_event', 'prepend parametercell', 20, 885)
    p.obj('sync_event', 'prepend parametersync', 165, 885)
    p.obj('menu_event', 'prepend menu', 310, 885)
    p.obj('textchange', 'route textchanged', 610, 800)
    p.obj('textdefer', 'deferlow', 610, 835)
    p.box('textbang', 'message', [610, 865, 100, 22], 'scriptchanged')
    p.obj('clip_cell_event', 'prepend cell', 20, 1100)
    p.obj('clip_sync_event', 'prepend sync', 180, 1100)
    p.line('clips', 'clip_cell_event', 0); p.line('clip_cell_event', 'events')
    p.line('clips', 'clip_sync_event', 2); p.line('clip_sync_event', 'events')
    p.line('grid', 'cell_event', 0)
    p.line('grid', 'sync_event', 2)
    p.line('cellmenu', 'menu_event')
    p.line('script', 'textchange', 3)
    p.line('textchange', 'textdefer')
    p.line('textdefer', 'textbang')
    p.line('textbang', 'events')
    for name in ['cell_event', 'sync_event', 'menu_event']:
        p.line(name, 'events')
    p.obj('mouse', 'mousestate', 800, 800, varname='mouse')
    p.obj('mouseload', 'loadmess mode 0', 800, 765)
    p.obj('mousex', 'prepend mousex', 800, 835)
    p.obj('mousey', 'prepend mousey', 920, 835)
    p.obj('mousepoll', 'loadmess poll', 950, 765)
    p.line('mouseload', 'mouse')
    p.line('mousepoll', 'mouse')
    p.line('mouse', 'mousex', 1)
    p.line('mouse', 'mousey', 2)
    p.line('mousex', 'events')
    p.line('mousey', 'events')
    p.obj('layoutload', 'loadmess 1', 1060, 765)
    p.obj('layoutclock', 'qmetro 100', 1060, 800)
    p.box('layoutmsg', 'message', [1060, 835, 70, 22], 'layout')
    p.line('layoutload', 'layoutclock')
    p.line('layoutclock', 'layoutmsg')
    p.line('layoutmsg', 'events')
    p.obj('window', 'thispatcher', 800, 930, varname='window')
    p.obj('events', 'outlet', 455, 960)
    p.obj('control', 'inlet', 1060, 800)
    return p.data


def main():
    p = Patch([80, 80, 980, 750])
    p.data['devicewidth'] = 360
    p.label('title', 'KLJ / LIVE MANAGER  V1.5-EN', [10, 5, 340, 24], size=17, fontface=1)
    p.label('active', '—', [10, 33, 340, 24], color=GREEN, size=17, varname='active')
    p.label('status', '', [10, 63, 340, 49], color=SUB, size=11, varname='status', hidden=1)
    p.box('open', 'textbutton', [10, 74, 340, 30], present=True, text='OPEN CONFIGURATIONS',
          texton='OPEN CONFIGURATIONS', bgcolor=PANEL, textcolor=FG, mode=0, outputmode=1)
    p.obj('midiin', 'midiin', 20, 200)
    p.obj('midiout', 'midiout', 20, 240)
    p.line('midiin', 'midiout')
    p.obj('ready', 'live.thisdevice', 160, 200)
    p.obj('restore_first', 't b b', 160, 240)
    p.obj('defer', 'deferlow', 160, 280)
    p.obj('init_order', 't b b', 160, 320)
    p.box('init_engine', 'message', [160, 360, 40, 22], 'init')
    p.box('init_runner', 'message', [280, 360, 40, 22], 'init')
    p.obj('engine', 'v8 klj.engine.js #0', 160, 430, varname='engine')
    p.obj('runner', 'v8 klj.runner.js #0', 530, 480, varname='runner')
    p.obj('state', 'pattr klj_state', 160, 530, varname='klj_state',
          saved_attribute_attributes={'valueof': {'parameter_longname': 'KLJ Configurations',
              'parameter_shortname': 'KLJ State', 'parameter_type': 3, 'parameter_invisible': 1}},
          saved_object_attributes={'parameter_enable': 1, 'parameter_mappable': 0})
    p.obj('restore', 'prepend restore', 160, 580)
    p.box('open_msg', 'message', [600, 200, 50, 22], 'open')
    p.obj('pcontrol', 'pcontrol', 600, 240)
    p.obj('editor', 'p editor', 600, 280, varname='editor', patcher=editor())
    p.obj('uievent', 'prepend ui', 600, 360)
    p.data['parameters'] = {'state': ['KLJ Configurations', 'KLJ State', 0],
                            'parameterbanks': {}, 'inherited_shortname': 1}
    for a,b in [('ready','restore_first'),('restore_first','defer'),('defer','init_order'),
                ('init_order','init_engine'),('init_engine','engine'),('engine','state'),
                ('state','restore'),('restore','engine'),('runner','engine'),('open','open_msg'),
                ('open_msg','pcontrol'),('pcontrol','editor'),('editor','uievent'),('uievent','engine')]:
        p.line(a,b)
    p.line('restore_first','state',1)
    p.line('init_order','init_runner',1)
    p.line('init_runner','runner')
    p.line('engine','runner',1)
    p.data['dependency_cache'] = [dict(name=n, type='TEXT', implicit=1)
                                 for n in ['klj.engine.js', 'klj.model.js', 'klj.ui.js', 'klj.runner.js']]
    path = ROOT/'device/KLJ Live Set Manager.maxpat'
    path.write_text(json.dumps({'patcher': p.data}, ensure_ascii=False, indent=2)+'\n')
    # Max requires the .maxproj basename to match its containing directory.
    project = dict(name='device', version=1, amxdtype=2, autoorganize=0,
                   autolocalize=0, hideprojectwindow=0, showdependencies=1,
                   contents={'patchers': {'KLJ Live Set Manager.maxpat': dict(kind='patcher', local=1, toplevel=1)},
                             'code': {n: dict(kind='javascript', local=1) for n in
                                      ['klj.engine.js', 'klj.model.js', 'klj.ui.js', 'klj.runner.js']}},
                   layout={}, searchpath={}, detailsvisible=0)
    (ROOT/'device/device.maxproj').write_text(json.dumps(project, ensure_ascii=False, indent=2)+'\n')
    print(path)


if __name__ == '__main__':
    main()
