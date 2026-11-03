/* Native mouse reproduction, no LiveAPI. Optional V1.1 view path in jsarguments[3]. */
autowatch=1; inlets=1; outlets=2;
include(jsarguments[2]+'/klj.model.js');
include(jsarguments[3] || jsarguments[2]+'/klj.ui.js');
var view, state, tracks, events=[], previousSize="", headerDump=[];
function headerprobe() {headerDump.push(arrayfromargs(arguments));}
function init() {
    if(view) return;
    state=KLJModel.empty();
    tracks=KLJModel.reconcile(state,[
        {id:20,name:'TEST KEYS WITH A VERY LONG NAME THAT MUST STAY NARROW',position:3,midi:true},
        {id:21,name:'EMPTY MIDI',position:4,midi:true},
        {id:22,name:'BASS',position:5,midi:true}, {id:23,name:'LEAD',position:6,midi:true}],[],true);
    for(var i=0;i<40;i++) KLJModel.add(state,{bpm:120,root:0,scale:'Minor'}).clip=i ? 'CONFIG_'+i : 'MOUSE_TEST';
    view=new KLJView(this.patcher,jsarguments[1]); view.render(state,tracks);

    view.status('CONFIG_1','Unknown clip: INTRO_TEST — No action taken');
    view.showDetails(true);
    var channel=jsarguments[1]+'_header_probe';
    var send=view.editor.newdefault(1100,1100,'send',channel);
    var receive=this.patcher.newdefault(1100,1100,'receive',channel);
    var prefix=this.patcher.newdefault(1100,1130,'prepend','headerprobe');
    view.editor.connect(view.headers,0,send,0);
    this.patcher.connect(receive,0,prefix,0); this.patcher.connect(prefix,0,this.patcher.getnamed('engine'),0);
    var pc=this.patcher.newdefault(1000,1000,'pcontrol');
    this.patcher.connect(pc,0,this.patcher.getnamed('editor'),0); pc.message('open');
}
function ui() {
    var a=arrayfromargs(arguments), kind=a.shift(), raw=a.slice();
    if(!view) return;
    try {view.event(kind,a,state,tracks,{changed:function(){view.render(state,tracks);},defaults:function(){return {bpm:120,root:0,scale:'Minor'};}});} catch(e){post('MOUSE ERROR '+e+'\n');}
    if(kind==='mousex'||kind==='mousey') return;
    var size=JSON.stringify(view.editor.wind.size);
    if(kind==='layout' && size===previousSize) return;
    previousSize=size;
    headerDump=[]; view.headers.message("dump");
    events.push({headers:headerDump,kind:kind,args:raw,size:view.editor.wind.size,gridRect:view.gridRect,widths:view.columnWidths,mouse:[view.mouseX,view.mouseY],menuHidden:view.menu.hidden,
        menuRect:view.menu.getboxattr('presentation_rect'),menuTarget:view.menuTarget,
        rootHidden:view.rootMenu?view.rootMenu.hidden:null,
        rootRect:view.rootMenu?view.rootMenu.getattr('presentation_rect'):null,rows:KLJModel.clone(state.rows)});
    if(events.length>100) events.shift();
    var f=new File('/tmp/klj-mouse-probe-v1.5-en.json','write','TEXT');f.eof=0;var json=JSON.stringify(events,null,2); for(var offset=0;offset<json.length;offset+=2000) f.writestring(json.slice(offset,offset+2000));f.close();
}
function restore() {}
function scriptresult() {}
var startup=new Task(init,this); startup.schedule(200);
