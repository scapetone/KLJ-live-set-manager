const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const M = require('../device/klj.model.js');
const defaults = {bpm: 120, root: 0, scale: 'Minor'};
const track = (id, name, position = 1, extra = {}) => ({id, name, position, midi: true,
    audio: false, instrument: true, group: false, control: false, ...extra});
function fixture() {
    const state = M.empty();
    const tracks = M.reconcile(state, [track(20, 'KEYS'), track(21, 'BASS', 2)], [], true);
    const row = M.add(state, defaults); row.clip = 'SONG_A';
    return {state, tracks, row};
}
function host() {
    const dicts = new Map(), objects = new Map(), queue = new Set(), writes = [], outputs = [];
    const uiObjects = new Map();
    const patcher = {wind:{location:[0,0,1180,760],size:[1180,760]}, raised: [], bringtofront(obj) {this.raised.push(obj);}, getnamed(name) {
        if (!uiObjects.has(name)) uiObjects.set(name, {hidden: 0, messages: [], value:'',
            message(...args) {this.messages.push(args); if(args[0]==='dictionary') this.value=dicts.get(args[1]).text;},
            setboxattr(name,value) {this[name]=value; this.messages.push(['box',name,...value]);},
            getvalueof() {return this.value;}, subpatcher() {return patcher;}});
        return uiObjects.get(name);
    }};
    function Dict(name) {this.name = name || 'generated'; if (!dicts.has(this.name)) dicts.set(this.name, {});}
    Dict.prototype.parse = function (json) {dicts.set(this.name, JSON.parse(json));};
    Dict.prototype.stringify = function () {return JSON.stringify(dicts.get(this.name));};
    objects.set(1, {type: 'Song', tracks: ['id', 10, 'id', 20, 'id', 21, 'id', 30],
        tempo: 120, root_note: 0, scale_name: 'Minor', is_playing: 0});
    objects.set(2, {type: 'Song.View', selected_track: ['id', 10]});
    objects.set(3, {type: 'MidiEffect', canonical_parent: ['id', 10]});
    for (const [id,name] of [[10,'CONTROL'],[20,'KEYS'],[21,'BASS'],[30,'STEM']]) {
        objects.set(id, {type:'Track', name, has_midi_input: id === 30 ? 0 : 1,
            has_audio_input: id === 30 ? 1 : 0, is_foldable:0, is_frozen:0,
            devices: id === 20 || id === 21 ? ['id', id+100] : [],
            playing_slot_index:-2, clip_slots:id===10 ? ['id',500,'id',501] : [], mute:0, volume:0.8});
        if (id === 20 || id === 21) objects.set(id+100, {type:1});
    }
    objects.set(1000, {type:'Clip', name:'SONG_A', is_playing:1});
    objects.set(1001, {type:'Clip', name:'SONG_A', is_playing:1});
    objects.set(500, {type:'ClipSlot',clip:['id',1000]});
    objects.set(501, {type:'ClipSlot',clip:['id',1001]});
    function LiveAPI(callback, target) {
        this.callback = callback; this.property = ''; this.mode = 0;
        if (target === 'this_device') this.id = 3;
        else if (target === 'live_set') this.id = 1;
        else if (target === 'live_set view') this.id = 2;
        else {
            const match = /^id (\d+)(?: clip_slots (\d+) clip)?$/.exec(target);
            if (!match) throw Error('Unsupported path: '+target);
            this.id = match[2] === undefined ? Number(match[1]) : (Number(match[2]) === 0 ? 1000 : 1001);
        }
    }
    Object.defineProperty(LiveAPI.prototype, 'type', {get() {return objects.get(this.id)?.type;}});
    LiveAPI.prototype.get = function (prop) {
        const o = objects.get(this.id);
        if (!o || !(prop in o)) throw Error('Unavailable '+this.id+'.'+prop);
        return Array.isArray(o[prop]) ? o[prop] : [o[prop]];
    };
    LiveAPI.prototype.set = function (prop, ...args) {
        if (!objects.has(this.id)) throw Error('deleted');
        writes.push([this.id, prop, ...args]);
        objects.get(this.id)[prop] = args[0] === 'id' ? args : args[0];
    };
    function Task(fn, owner) {this.fn = () => fn.call(owner);}
    Task.prototype.schedule = function () {queue.add(this);};
    Task.prototype.cancel = function () {queue.delete(this);};
    Task.prototype.repeat = function () {};
    let context;
    context = vm.createContext({console, Dict, LiveAPI, Task, patcher, jsarguments:['klj.engine.js', 'test'],
        arrayfromargs: a => Array.from(a), error() {}, post() {},
        outlet(...args) {outputs.push(args);},
        include(name) {vm.runInContext(fs.readFileSync(path.join(__dirname,'../device', name), 'utf8'), context, {filename:name});}});
    vm.runInContext(fs.readFileSync(path.join(__dirname,'../device/klj.engine.js'),'utf8'), context);
    return {context, objects, writes, outputs, dicts, uiObjects,
        drain() {for (let i=0; queue.size && i<20; i++) {const tasks=Array.from(queue); queue.clear(); tasks.forEach(t=>t.fn());} assert.equal(queue.size,0);},
        click(col,row=0) {
            context.ui('sync','click',1,0,1,0);
            context.ui('sync','select',col,row);
        },
        launch(index) {objects.get(1).is_playing=1; objects.get(10).playing_slot_index=index; context.checkClip();}};
}

test('clip gate: quantization, loops, identical names, stop and resume', () => {
    const g = new M.Gate();
    assert.equal(g.read({playing:false}), null);
    assert.equal(g.read({playing:false, id:1}), null);
    assert.equal(g.read({playing:true, id:1, name:'A'}).id, 1);
    for (let i=0;i<20;i++) assert.equal(g.read({playing:true,id:1,name:'A'}),null);
    assert.equal(g.read({playing:true,id:2,name:'A'}).id,2);
    g.read({playing:false});
    assert.equal(g.read({playing:true,id:2,name:'A'}).id,2);
    assert.equal(g.read({playing:true,id:3,name:'A'},true),null);
    assert.equal(g.read({playing:true,id:3,name:'A'}),null);
});
test('all normal MIDI tracks are eligible, including empty tracks', () => {
    for (const extra of [{audio:true},{midi:false},{group:true},{control:true}]) assert.equal(M.eligible(track(1,'x',1,extra)),false);
    assert.equal(M.eligible(track(1,'rack')),true);
    assert.equal(M.eligible(track(2,'empty',2,{instrument:false})),true);
});
test('move and rename preserve identity, not index', () => {
    const f=fixture(), key=f.tracks[0].key; f.row.enabled[key]=1; f.row.push=key;
    const out=M.reconcile(f.state,[track(21,'BASS'),track(20,'NEW',2)],f.tracks,false);
    assert.equal(out[1].key,key); assert.equal(f.row.enabled[key],1); assert.equal(f.row.push,key);
    assert.equal(f.state.tracks[1].name,'NEW');
});
test('new tracks default OFF without IO; delete and recreate loses old data', () => {
    const f=fixture(), deleted=f.tracks[0].key; f.row.enabled[deleted]=1; f.row.push=deleted;
    const next=M.reconcile(f.state,[track(21,'BASS'),track(22,'KEYS',2)],f.tracks,false);
    assert.notEqual(next[1].key,deleted); assert.equal(f.row.enabled[next[1].key],0);
    assert.equal(deleted in f.row.enabled,false); assert.equal(f.row.push,null);
});
test('reload matches unique names with changed Live IDs', () => {
    const f=fixture(); f.row.enabled[f.tracks[0].key]=1;
    const saved=M.validate(JSON.parse(JSON.stringify(f.state)));
    const next=M.reconcile(saved,[track(80,'BASS'),track(90,'KEYS',2)],[],true);
    assert.equal(saved.rows[0].enabled[next[1].key],1);
    assert.equal(JSON.stringify(saved).includes('"id":90'),false);
});
test('ambiguous names never issue track writes', () => {
    const f=fixture(); const next=M.reconcile(f.state,[track(20,'KEYS'),track(21,'KEYS',2)],f.tracks,false);
    f.row.push=next[0].key; const writes=[];
    const warnings=M.apply(f.row,next,{song(){},mute(...a){writes.push(a);},select(...a){writes.push(a);}});
    assert.equal(writes.length,0); assert.equal(warnings.length,3);
});
test('full clone and JSON roundtrip preserve scripts, accents and newlines', () => {
    const f=fixture(); f.row.script='// été "clé"\\\nconst x = `é\nà`;\npost(x);';
    f.row.enabled[f.tracks[0].key]=1; f.row.push=f.tracks[1].key; f.row.pushMode='64 PADS';
    const copy=M.add(f.state,defaults,f.row);
    assert.notEqual(copy.id,f.row.id); assert.notEqual(copy.clip,f.row.clip);
    assert.equal(copy.script,f.row.script); assert.equal(copy.pushMode,'64 PADS');
    copy.enabled[f.tracks[0].key]=0; assert.equal(f.row.enabled[f.tracks[0].key],1);
    assert.deepEqual(M.validate(M.clone(f.state)),f.state);
});
test('validation rejects duplicate clip names, bad ranges and corrupt references', () => {
    const f=fixture(); M.add(f.state,defaults);
    for (const mutate of [s=>s.rows[1].clip=s.rows[0].clip, s=>s.rows[0].bpm=0,
        s=>s.rows[0].push='missing',s=>s.rows[0].enabled.bad=1,s=>s.rows[0].root=12,
        s=>s.rows[0].script=null,s=>s.nextId=1,s=>s.version=99]) {
        const bad=M.clone(f.state); mutate(bad); assert.throws(()=>M.validate(bad));
    }
});
test('KEY supports accidentals and rejects unknown scales', () => {
    assert.deepEqual(M.parseKey('Bb minor'),{root:10,scale:'Minor'});
    assert.deepEqual(M.parseKey('F# Major'),{root:6,scale:'Major'});
    assert.throws(()=>M.parseKey('H Minor')); assert.throws(()=>M.parseKey('C Fake'));
});
test('engine initializes without writes to Live or executing an already playing clip', () => {
    const h=host(); h.objects.get(1).is_playing=1; h.objects.get(10).playing_slot_index=0;
    h.context.init(); h.drain(); assert.equal(h.context.ready,true);
    assert.deepEqual(h.writes,[]); assert.equal(h.context.token,0);
});
test('concrete Live track classes do not break parent resolution', () => {
    const h=host(); h.objects.get(10).type='MidiTrack'; h.context.init();
    assert.equal(h.context.ready,true); assert.equal(h.context.ownTrack,10);
});
test('engine recalls full configuration, selected track, and never writes stems/ARM/Monitor', () => {
    const h=host(); h.context.init();
    const r=M.add(h.context.state, {bpm:118,root:5,scale:'Major'}); r.clip='SONG_A';
    r.enabled[h.context.runtime[0].key]=1; r.push=h.context.runtime[0].key;
    h.launch(0);
    assert.equal(h.context.active,'SONG_A');
    assert.deepEqual(h.writes,[[1,'tempo',118],[1,'root_note',5],[1,'scale_name','Major'],[21,'mute',1],[2,'selected_track','id',20]]);
    h.writes.length=0; h.launch(0); assert.deepEqual(h.writes,[]);
    h.objects.get(20).mute=1; h.launch(1);
    assert.deepEqual(h.writes,[[20,'mute',0]]); // compare current Live state, not an old cached row
});
test('unknown clips do not apply even BPM and do not replay upon name edits', () => {
    const h=host(); h.context.init(); h.launch(0); assert.equal(h.writes.length,0);
    const r=M.add(h.context.state,defaults); r.clip='SONG_A'; h.launch(0);
    assert.equal(h.writes.length,0); assert.equal(h.context.token,0);
    h.launch(1); assert.equal(h.context.token,1);
});
test('early slot notification binds the pending clip; script is dispatched after standard writes', () => {
    const h=host(); h.context.init(); const r=M.add(h.context.state,defaults); r.clip='SONG_A'; r.script='post("test");';
    h.objects.get(1000).is_playing=0; h.launch(0);
    assert.equal(h.context.observedClip,1000); assert.equal(h.context.token,0);
    h.objects.get(1000).is_playing=1; h.context.clipStatusChanged(); h.drain();
    assert.equal(h.context.token,1); assert.ok(h.writes.some(w=>w[1]==='mute'));
    const script=h.outputs.find(o=>o[0]===1 && o[1]==='run'); assert.ok(script);
    assert.equal(h.dicts.get(script[2]).context.clip,'SONG_A');
});
test('a delivered transport stop is retained across deferred stop/start coalescing', () => {
    const h=host(); h.context.init(); const r=M.add(h.context.state,defaults); r.clip='SONG_A';
    h.launch(0); assert.equal(h.context.token,1);
    h.context.songPlayingChanged(['is_playing',0]);
    h.context.songPlayingChanged(['is_playing',1]); h.drain();
    assert.equal(h.context.token,2);
});
test('adding an instrument only updates data until the next real launch', () => {
    const h=host(); h.context.init(); const r=M.add(h.context.state,defaults); r.clip='SONG_A';
    h.objects.set(22,{...h.objects.get(20),name:'NEW',devices:['id',120]});
    h.objects.get(1).tracks.push('id',22); h.context.refresh(false);
    assert.equal(h.writes.length,0);
    const t=h.context.runtime.find(t=>t.id===22); assert.equal(r.enabled[t.key],0);
    h.launch(0); assert.ok(h.writes.some(w=>w[0]===22 && w[1]==='mute' && w[2]===1));
});
test('guard revalidates eligibility, deletion and ambiguity at every mute write', () => {
    const h=host(); h.context.init(); const t=h.context.runtime[0];
    h.objects.get(20).has_midi_input=0; h.objects.get(20).has_audio_input=1;
    assert.throws(()=>h.context.guardedTrack(t)); assert.equal(h.writes.length,0);
    h.objects.get(20).has_midi_input=1; h.objects.get(20).has_audio_input=0;
    h.objects.get(21).name='KEYS'; assert.throws(()=>h.context.guardedTrack(t));
    h.objects.get(1).tracks=['id',10,'id',21,'id',30]; assert.throws(()=>h.context.guardedTrack(t));
});
test('failed inventory cannot delete persisted columns', () => {
    const h=host(); h.context.init(); const before=JSON.stringify(h.context.state);
    h.objects.get(1).tracks.push('id',999); assert.throws(()=>h.context.refresh(false));
    assert.equal(JSON.stringify(h.context.state),before);
});
test('pattr save echo is ignored; genuine restore primes detector and retains scripts', () => {
    const h=host(); h.context.init(); const f=fixture(); f.row.script='post("é\\n");';
    const d=new h.context.Dict('restored'); d.parse(JSON.stringify(f.state));
    h.objects.get(1).is_playing=1; h.objects.get(10).playing_slot_index=0;
    h.context.restore('dictionary','restored'); assert.equal(h.context.state.rows[0].script,f.row.script);
    h.context.checkClip(); assert.equal(h.context.token,0);
    h.context.saving=true; h.context.restore('dictionary','missing');
    assert.equal(h.context.state.rows.length,1); h.context.saving=false;
});
test('two instances have independent model and dictionary names', () => {
    const a=host(),b=host(); a.context.init(); b.context.init();
    M.add(a.context.state,defaults); assert.equal(b.context.state.rows.length,0);
});
test('UI edits reject invalid values before model mutation and duplicate full rows', () => {
    const h=host(); h.context.init(); h.context.ui('add');
    const name=h.context.state.rows[0].clip;
    h.context.ui('cell',1,0,'9999'); assert.equal(h.context.state.rows[0].bpm,120);
    h.context.ui('cell',0,0,'TEST'); assert.equal(h.context.state.rows[0].clip,'TEST');
    h.uiObjects.get('script').value='// é\rpost("a b");'; h.context.ui('scriptchanged');
    h.context.ui('duplicate'); assert.equal(h.context.state.rows.length,2);
    assert.equal(h.context.state.rows[1].script,'// é\npost("a b");');
    assert.notEqual(h.context.state.rows[1].clip,name);
});
test('native runner implementation catches syntax/runtime errors and continues', () => {
    const h=host(); vm.runInContext(fs.readFileSync(path.join(__dirname,'../device/klj.runner.js'),'utf8'),h.context);
    h.context.init(); const d=new h.context.Dict('payload');
    for (const [script,ok] of [['throw new Error("échec")',0],['const = ;',0],['if(context.clip !== "A") throw Error("bad");',1]]) {
        d.parse(JSON.stringify({token:1,context:{clip:'A'},script})); h.context.run('payload');
        const result=JSON.parse(new h.context.Dict('test_script_result').stringify());
        assert.equal(result.ok,ok);
    }
});

test('ten grid edits keep A canonical, preserve internal spaces and persist without padding', () => {
    const h=host(); h.context.init(); h.context.ui('add');
    for(let i=0;i<10;i++) {
        h.context.ui('cell',0,0,' A  ');
        assert.equal(h.context.state.rows[0].clip,'A');
        assert.equal(h.context.state.rows[0].clip.length,1);
        assert.equal(M.migrate(JSON.parse(JSON.stringify(h.context.state))).state.rows[0].clip,'A');
    }
    h.objects.get(1000).name=' A '; h.launch(0); assert.equal(h.context.active,'A');
    h.context.ui('cell',0,0,'  B  C  '); assert.equal(h.context.state.rows[0].clip,'B  C');
});
test('legacy padded names are cleaned without losing parameters or collision rows', () => {
    const f=fixture(); f.row.clip=' A  '; f.row.script='// é\npost("test");'; f.row.pushMode='64 PADS';
    const r=M.add(f.state,defaults); r.clip='A'; r.bpm=200;
    const reserved=M.add(f.state,defaults); reserved.clip='A_2';
    const result=M.migrate(f.state);
    assert.deepEqual(result.state.rows.map(r=>r.clip),['A','A_3','A_2']);
    assert.equal(result.state.rows[0].script,f.row.script);
    assert.equal(result.state.rows[0].pushMode,'64 PADS'); assert.equal(result.state.rows[1].bpm,200);
    assert.equal(f.row.clip,' A  '); assert.equal(result.changes[0].rawLength,4);
    assert.deepEqual(M.migrate(result.state).state,result.state);
});
test('ROOT, SCALE and PUSH use the same raised native selector and persist', () => {
    const h=host(); h.context.init(); h.context.ui('add');
    for(const [col,index,field,value] of [[2,4,'root',4],[3,1,'scale','Minor'],
            [4+h.context.runtime.length,1,'push',h.context.runtime[0].key]]) {
        h.context.ui('cell',col,0); h.click(col);
        const menu=h.uiObjects.get('cellmenu');
        assert.equal(menu.hidden,0); assert.equal(h.context.view.menuTarget.field,field);
        assert.equal(menu.ignoreclick,0);
        assert.equal(menu.presentation_rect.length,4);
        assert.equal(menu.patching_rect.length,4);
        h.context.ui('menu',index);
        assert.equal(M.validate(M.clone(h.context.state)).rows[0][field],value);
        assert.equal(menu.hidden,1);
    }
    assert.equal(M.SCALES.length,35);
});
test('content and programmatic selections do not open menus or toggle MIDI states', () => {
    const h=host(); h.context.init(); h.context.ui('add');
    const key=h.context.runtime[0].key;
    h.context.ui('cell',4,0,'OFF'); h.context.ui('sync','select',4,0);
    assert.equal(h.context.state.rows[0].enabled[key],0);
    h.click(4); assert.equal(h.context.state.rows[0].enabled[key],1);
    h.context.ui('cell',4,0,'ON'); h.context.ui('sync','select',4,0);
    assert.equal(h.context.state.rows[0].enabled[key],1);
    h.click(4); assert.equal(h.context.state.rows[0].enabled[key],0);
    h.click(2);
    h.context.ui('cell',2,0,'C'); h.context.ui('sync','select',2,0);
    assert.equal(h.uiObjects.get('cellmenu').hidden,0);
    h.context.ui('sync','offset',2,0); assert.equal(h.uiObjects.get('cellmenu').hidden,1);
    assert.equal(h.writes.length,0);
});
test('requested BPM/KEY sequence reads actual Live state and fixes intervening manual changes', () => {
    const h=host(); h.context.init();
    for(const [clip,bpm,root] of [['BPM_100',100,0],['KEY_Eminor',120,4],['BPM_200',200,0]]) {
        const r=M.add(h.context.state,{bpm,root,scale:'Minor'}); r.clip=clip;
    }
    for(const [i,name,bpm,root] of [[0,'BPM_100',100,0],[1,'KEY_Eminor',120,4],[0,'BPM_200',200,0],[1,'BPM_100',100,0]]) {
        h.objects.get(1).tempo=137; h.objects.get(1).root_note=9; h.objects.get(1).scale_name='Major';
        h.objects.get(i===0?1000:1001).name=name; h.launch(i);
        assert.equal(h.objects.get(1).tempo,bpm); assert.equal(h.objects.get(1).root_note,root);
        assert.equal(h.objects.get(1).scale_name,'Minor');
        assert.equal(h.context.lastRecall.actual.bpm,bpm); assert.equal(h.context.lastRecall.actual.root,root);
    }
});
test('empty MIDI tracks can toggle and receive Push; loading an instrument keeps their saved identity', () => {
    const h=host(); h.objects.get(20).devices=[]; h.objects.get(21).devices=[]; h.context.init();
    assert.equal(h.context.runtime.length,2); assert.equal(h.writes.length,0);
    h.context.ui('add'); h.context.ui('cell',0,0,'SONG_A');
    const key=h.context.runtime[0].key;
    h.context.ui('cell',4,0); h.click(4);
    h.click(6); h.context.ui('menu',1);
    h.objects.get(20).devices=['id',120]; h.context.refresh(false);
    assert.equal(h.context.runtime[0].key,key); assert.equal(h.context.state.rows[0].enabled[key],1);
    assert.equal(h.writes.length,0);
    h.objects.get(20).mute=1; h.launch(0);
    assert.ok(h.writes.some(w=>w[0]===20 && w[1]==='mute' && w[2]===0));
    assert.ok(h.writes.some(w=>w[0]===2 && w[1]==='selected_track' && w[3]===20));
    assert.ok(h.writes.every(w=>w[0]!==30 && !['arm','current_monitoring_state','volume'].includes(w[1])));
});

test('engine restores legacy padded names, preserves data and persists the cleanup', () => {
    const h=host(); h.context.init(); const f=fixture(); f.row.clip=' A  '; f.row.pushMode='PADS'; f.row.root=4;
    f.row.script='// été\npost("A");'; const d=new h.context.Dict('legacy'); d.parse(JSON.stringify(f.state));
    h.context.restore('dictionary','legacy');
    assert.equal(h.context.state.rows[0].clip,'A'); assert.equal(h.context.state.rows[0].pushMode,'PADS');
    assert.equal(h.context.state.rows[0].script,f.row.script); assert.equal(h.context.state.rows[0].root,4);
    assert.equal(JSON.parse(h.context.lastStored).rows[0].clip,'A'); assert.equal(h.writes.length,0);
});
test('a rejected Live setter reports requested and actual values while independent writes continue', () => {
    const h=host(); h.context.init();
    const r=M.add(h.context.state,{bpm:100,root:4,scale:'Major'}); r.clip='SONG_A';
    Object.defineProperty(h.objects.get(1),'tempo',{get(){return 120;},set(){},configurable:true});
    h.launch(0);
    assert.match(h.context.statusText,/tempo requested=100, actual=120/);
    assert.equal(h.objects.get(1).root_note,4); assert.equal(h.context.lastRecall.actual.bpm,120);
});

test('V1.1 state keeps all saved fields when V1.2 adds empty MIDI tracks', () => {
    const h=host(); h.context.init(); const f=fixture();
    f.row.root=7; f.row.scale='Dorian'; f.row.pushMode='PADS'; f.row.script='// conservé\npost("été");';
    f.row.enabled[f.tracks[0].key]=1; f.row.push=f.tracks[1].key;
    h.objects.set(22,{...h.objects.get(20),name:'EMPTY',devices:[]}); h.objects.get(1).tracks.push('id',22);
    const d=new h.context.Dict('v11'); d.parse(JSON.stringify(f.state)); h.context.restore('dictionary','v11');
    const r=h.context.state.rows[0], empty=h.context.runtime.find(t=>t.id===22);
    assert.equal(r.root,7); assert.equal(r.scale,'Dorian'); assert.equal(r.pushMode,'PADS');
    assert.equal(r.script,f.row.script); assert.equal(r.enabled[f.tracks[0].key],1);
    assert.equal(r.push,f.tracks[1].key); assert.equal(r.enabled[empty.key],0);
    assert.equal(h.writes.length,0);
});
test('popup remains in the editor when window origin changes or mouse coordinates are unavailable', () => {
    const h=host(); h.context.init(); h.context.ui('add');
    h.context.patcher.wind.location=[600,300,1780,1060];
    h.context.ui('mousex',1000); h.context.ui('mousey',500); h.click(3);
    const menu=h.uiObjects.get('cellmenu');
    assert.equal(menu.presentation_rect[0],384); assert.equal(menu.presentation_rect[1],190);
    h.context.ui('mousex',-2000); h.context.ui('mousey',-2000); h.click(3);
    assert.equal(menu.presentation_rect[0],20+h.context.view.columnWidths.slice(0,3).reduce((a,b)=>a+b,0)); assert.equal(menu.presentation_rect[1],h.context.view.gridRect[1]);
    h.click(4+h.context.runtime.length);
    assert.ok(menu.presentation_rect[0]+menu.presentation_rect[2]<=1160);
});

test('resizing grows the matrix and anchors actions without changing state, scripts or Live', () => {
    const h=host(); h.context.init(); h.context.ui('add');
    const before=JSON.stringify(h.context.state), saved=h.context.lastStored;
    const grid=h.uiObjects.get('grid'), small=grid.presentation_rect.slice();
    h.context.patcher.wind.size=[1660,980]; h.context.ui('layout');
    assert.ok(grid.presentation_rect[2]>small[2]); assert.ok(grid.presentation_rect[3]>small[3]);
    for(const name of ['add','duplicate','delete','details']) {
        const r=h.uiObjects.get(name).presentation_rect;
        assert.ok(r[0]>=0 && r[0]+r[2]<=1660); assert.ok(r[1]+r[3]<=980);
    }
    h.context.ui('details');
    const panel=h.uiObjects.get('script').presentation_rect;
    assert.ok(panel[1]>=grid.presentation_rect[1]+grid.presentation_rect[3]);
    assert.ok(panel[1]+panel[3]<h.uiObjects.get('add').presentation_rect[1]);
    assert.equal(JSON.stringify(h.context.state),before); assert.equal(h.context.lastStored,saved);
    assert.deepEqual(h.writes,[]);
    h.click(3); const menu=h.uiObjects.get('cellmenu').presentation_rect;
    assert.ok(menu[0]+menu[2]<=grid.presentation_rect[0]+grid.presentation_rect[2]);
    assert.ok(menu[1]+menu[3]<=grid.presentation_rect[1]+grid.presentation_rect[3]);
});
test('long MIDI names stay intact in data while columns and displayed headers are bounded', () => {
    const h=host(); const full='A VERY LONG TRACK NAME '.repeat(10); h.objects.get(20).name=full; h.context.init();
    h.context.patcher.wind.size=[3000,1200]; h.context.ui('layout');
    assert.ok(h.context.view.columnWidths[4]<=160);
    assert.equal(h.context.runtime[0].name,full); assert.equal(h.context.state.tracks[0].name,full);
    const text=h.uiObjects.get('headers').messages.find(a=>a[0]==='set' && a[1]===3)[3];
    assert.ok(text.includes('…')); assert.ok(text.length<32);
    h.context.ui('add'); h.click(4+h.context.runtime.length);
    assert.ok(h.context.view.menuTarget.choices[1].label.includes(full));
});
test('fixed headers contain the expected columns and PLUS preserves legacy Push mode', () => {
    const h=host(); h.context.init(); h.context.ui('add');
    h.context.state.rows[0].pushMode='64 PADS'; h.context.view.render(h.context.state,h.context.runtime);
    const headers=['CLIP',...h.uiObjects.get('headers').messages.filter(a=>a[0]==='set').slice(-(h.context.runtime.length+5)).map(a=>a[3])];
    assert.equal(h.uiObjects.get('clip_header').messages.filter(a=>a[0]==='set').at(-1)[3],'CLIP');
    assert.deepEqual(headers.slice(0,4),['CLIP','BPM','ROOT','SCALE']);
    assert.deepEqual(headers.slice(-2),['PUSH','MORE']); assert.ok(headers.every(s=>!s.includes('MODE')));
    h.click(5+h.context.runtime.length); assert.equal(h.context.view.details,true);
    assert.equal(h.context.state.rows[0].pushMode,'64 PADS');
    const copy=M.migrate(M.clone(h.context.state)).state;
    assert.equal(copy.rows[0].pushMode,'64 PADS');
});
test('active highlighting is independent from editing and never changes a clip name', () => {
    const h=host(); h.context.init(); h.context.ui('add'); h.context.ui('cell',0,0,'SONG_A');
    h.context.ui('add'); const selected=h.context.view.selected; const before=JSON.stringify(h.context.state);
    h.launch(0); assert.equal(h.context.view.active,'SONG_A'); assert.equal(h.context.view.selected,selected);
    assert.equal(JSON.stringify(h.context.state),before);
    const backgrounds=h.uiObjects.get('grid').messages.filter(a=>a[0]==='row' && a[2]==='brgb').slice(-2);
    assert.notDeepEqual(backgrounds[0].slice(3),backgrounds[1].slice(3));
    assert.equal(h.context.state.rows[0].clip,'SONG_A');
});

test('headers receive contrasting text colors on every render, including new track structure', () => {
    const h=host(); h.context.init();
    const header=h.uiObjects.get('headers');
    let cells=header.messages.filter(a=>a[0]==='cell' && a[3]==='frgb');
    assert.equal(cells.length,h.context.runtime.length+5);
    assert.ok(cells.every(a=>a.slice(4).join(',')==='243,245,249'));
    h.objects.set(22,{...h.objects.get(20),name:'NEW MIDI',devices:[]}); h.objects.get(1).tracks.push('id',22);
    h.context.refresh(false);
    cells=header.messages.filter(a=>a[0]==='cell' && a[3]==='frgb').slice(-(h.context.runtime.length+5));
    assert.equal(cells.length,h.context.runtime.length+5);
    assert.ok(cells.every(a=>a.slice(4).join(',')==='243,245,249'));
});
test('warnings are nonmodal, dismiss without data writes, and clear on a successful recall', () => {
    const h=host(); h.context.init(); h.context.ui('add'); h.context.ui('cell',0,0,'SONG_A');
    const initial=JSON.stringify(h.context.state), stored=h.context.lastStored;
    assert.equal(h.uiObjects.get('warning_panel').hidden,1);
    h.objects.get(1000).name='INTRO_TEST'; h.launch(0);
    assert.equal(h.uiObjects.get('warning_panel').hidden,0);
    assert.match(h.context.view.warningText,/Unknown clip/);
    const warnedTop=h.context.view.gridRect[1]; h.context.ui('dismiss');
    assert.equal(h.uiObjects.get('warning_panel').hidden,1);
    assert.ok(h.context.view.gridRect[1]<warnedTop);
    assert.equal(JSON.stringify(h.context.state),initial); assert.equal(h.context.lastStored,stored);
    assert.deepEqual(h.writes,[]);
    h.context.view.status('—','Unknown clip: INTRO_TEST — No action taken');
    assert.equal(h.context.view.gridRect[1],warnedTop);
    assert.equal(h.uiObjects.get('warning_panel').hidden,0);
    h.context.view.status('SONG_A','JavaScript error: syntax error');
    assert.equal(h.uiObjects.get('warning_panel').hidden,0);
    h.launch(1); assert.equal(h.uiObjects.get('warning_panel').hidden,1);
    assert.equal(h.context.view.warningText,'');
});
test('closing the script panel saves edited multiline text and preserves layout without musical writes', () => {
    const h=host(); h.context.init(); h.context.ui('add'); h.context.ui('details');
    const value='// été et "guillemets"\rconst x = `a\rb`;';
    h.uiObjects.get('script').value=value; h.context.ui('closedetails');
    assert.equal(h.context.view.details,false);
    assert.equal(h.context.state.rows[0].script,value.replace(/\r/g,'\n'));
    for(const name of ['script_panel','script_header','script_dot','script_label','script','script_close'])
        assert.equal(h.uiObjects.get(name).hidden,1);
    h.context.ui('details'); assert.equal(h.context.view.details,true);
    assert.equal(h.uiObjects.get('script').value,value);
    assert.deepEqual(h.writes,[]);
});

test('frozen CLIP has its own editable cells and horizontal viewport excludes its width', () => {
    const h=host(); h.context.init(); h.context.ui('add'); h.context.ui('cell',0,0,'FROZEN');
    const v=h.context.view, left=h.uiObjects.get('clips'), grid=h.uiObjects.get('grid');
    assert.equal(left.messages.filter(a=>a[0]==='set').at(-1)[3],'FROZEN');
    assert.ok(!grid.messages.some(a=>a[0]==='set' && a[3]==='FROZEN'));
    for (const size of [[900,600],[2400,1000],[800,520]]) {
        h.context.patcher.wind.size=size; h.context.ui('layout');
        assert.equal(left.presentation_rect[0],20);
        assert.equal(left.presentation_rect[2]-18,v.columnWidths[0]);
        assert.equal(grid.presentation_rect[0],20+v.columnWidths[0]);
        assert.equal(grid.presentation_rect[3]-18,left.presentation_rect[3]);
        assert.equal(h.uiObjects.get('headers').presentation_rect[0],grid.presentation_rect[0]);
    }
    assert.deepEqual(h.writes,[]);
});
test('native parameter columns translate once: BPM edit, ROOT menu, MIDI toggle, PUSH, PLUS', () => {
    const h=host(); h.context.init(); h.context.ui('add');
    h.context.ui('parametercell',0,0,151); assert.equal(h.context.state.rows[0].bpm,151);
    const click=c=>{h.context.ui('parametersync','sync','click',1,0,1,0); h.context.ui('parametersync','sync','select',c,0);};
    click(1); assert.equal(h.context.view.menuTarget.field,'root'); h.context.ui('menu',4);
    assert.equal(h.context.state.rows[0].root,4);
    click(2); assert.equal(h.context.view.menuTarget.field,'scale'); h.context.ui('menu',0);
    click(3); assert.equal(h.context.state.rows[0].enabled[h.context.runtime[0].key],1);
    click(3+h.context.runtime.length); assert.equal(h.context.view.menuTarget.field,'push'); h.context.ui('menu',1);
    assert.equal(h.context.state.rows[0].push,h.context.runtime[0].key);
    click(4+h.context.runtime.length); assert.equal(h.context.view.details,true);
    assert.deepEqual(h.writes,[]);
});
test('frozen and parameter panes highlight the same active and edited rows', () => {
    const h=host(); h.context.init(); h.context.ui('add'); h.context.ui('cell',0,0,'SONG_A'); h.context.ui('add');
    const before=JSON.stringify(h.context.state); h.launch(0);
    const backgrounds=name=>h.uiObjects.get(name).messages.filter(a=>a[0]==='row' && a[2]==='brgb').slice(-2).map(a=>a.slice(1));
    assert.deepEqual(backgrounds('clips'),backgrounds('grid'));
    assert.equal(JSON.stringify(h.context.state),before);
});

test('English UI restores French user names and scripts without translating persisted data', () => {
    const h=host(), f=fixture();
    h.objects.get(20).name=f.state.tracks[0].name='Clavier été';
    h.objects.get(21).name=f.state.tracks[1].name='Basse — Aucune sélection';
    f.row.clip='NOUVEAU_CLIP_COPIE_été'; f.row.script='// Ne pas traduire\npost("Prêt — aucune action");';
    f.row.push=f.tracks[0].key; f.row.pushMode='64 PADS';
    const original=JSON.stringify(f.state);
    h.context.init(); const d=new h.context.Dict('french_user_state'); d.parse(original); h.context.restore('dictionary',d.name);
    assert.equal(JSON.stringify(h.context.state),original);
    assert.equal(h.context.lastStored,original);
    h.context.view.status(f.row.clip,'Configuration applied');
    assert.equal(h.uiObjects.get('active_label').messages.at(-1)[1],'●  ACTIVE · '+f.row.clip);
    h.click(4+h.context.runtime.length);
    assert.equal(h.context.view.menuTarget.choices[0].label,'— None');
    assert.match(h.context.view.menuTarget.choices[1].label,/Clavier été/);
    assert.equal(JSON.stringify(h.context.state),original);
    assert.deepEqual(h.writes,[]);
});
test('English status classification keeps useful warnings and clears them on normal status', () => {
    const h=host(); h.context.init();
    assert.equal(h.context.statusText,'Ready — waiting for next clip');
    const v=h.context.view;
    for(const text of ['Initializing…','Ready — waiting for next clip','Configuration applied',
        'Configurations restored — waiting for next clip','Track list updated: 2 MIDI tracks']) {
        v.status('Prélude',text); assert.equal(h.uiObjects.get('warning_panel').hidden,1,text);
    }
    for(const text of ['Ready — duplicate track names: ambiguous targets skipped',
        'Ready — waiting for next clip | No playable MIDI tracks: control track, groups and audio tracks are excluded.',
        'Unknown clip: INTRO_été — No action taken','JavaScript error [Prélude]: Erreur utilisateur']) {
        v.status('Prélude',text); assert.equal(h.uiObjects.get('warning_panel').hidden,0,text);
        assert.equal(v.warningText,text);
    }
    v.status('Prélude','Configuration applied'); assert.equal(h.uiObjects.get('warning_panel').hidden,1);
    assert.deepEqual(h.writes,[]);
});
test('only new generated names use English; existing French names remain untouched', () => {
    const f=fixture(); f.row.clip='NOUVEAU_CLIP_COPIE';
    const original=JSON.stringify(f.row);
    const added=M.add(f.state,defaults); assert.equal(added.clip,'NEW_CLIP');
    const copy=M.add(f.state,defaults,f.row); assert.equal(copy.clip,'NOUVEAU_CLIP_COPIE_COPY');
    assert.equal(JSON.stringify(f.row),original);
});
