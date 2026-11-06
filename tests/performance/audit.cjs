/* Diagnostic only: execute unchanged production scripts against the existing fake host.
 * No Max UI, Live bridge latency, observer auto-notifications or pattr/ALS cost simulated.
 * Run: node tests/performance/audit.cjs > validation/local/performance/counts.json
 */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {createRequire}=require('node:module');
const {performance}=require('node:perf_hooks');
const testPath=path.resolve(__dirname,'../engine.test.cjs');
const deviceDir=process.env.KLJ_AUDIT_DEVICE || path.resolve(__dirname,'../../device');
let fixture=fs.readFileSync(testPath,'utf8').split("test('clip gate:")[0];
fixture=fixture.replace("path.join(__dirname,'../device', name)", "path.join("+JSON.stringify(deviceDir)+", name)");
fixture=fixture.replace("path.join(__dirname,'../device/klj.engine.js')", JSON.stringify(path.join(deviceDir,'klj.engine.js')));
// Count boundary calls without editing the production engine or its existing fixture.
fixture=fixture.replace('function LiveAPI(callback, target) {','function LiveAPI(callback, target) { metrics.apiNew++;');
fixture=fixture.replace('LiveAPI.prototype.get = function (prop) {','LiveAPI.prototype.get = function (prop) { metrics.apiGet++; metrics.gets[prop]=(metrics.gets[prop]||0)+1;');
fixture=fixture.replace('LiveAPI.prototype.set = function (prop, ...args) {','LiveAPI.prototype.set = function (prop, ...args) { metrics.apiSet++;');
fixture=fixture.replace('outlet(...args) {outputs.push(args);}', 'outlet(...args) {metrics.outlets++; outputs.push(args);}');
fixture=fixture.replace('Dict.prototype.parse = function (json) {','Dict.prototype.parse = function (json) {metrics.dictParse++; metrics.dictBytes+=Buffer.byteLength(json);');
const metrics={};const requireAtTest=createRequire(testPath);
const scope=vm.createContext({require:requireAtTest,__dirname:path.dirname(testPath),console,metrics,Buffer});
vm.runInContext(fixture+'\nglobalThis.makeHost=host;',scope);
function reset(){for(const k of Object.keys(metrics)) delete metrics[k];Object.assign(metrics,{apiNew:0,apiGet:0,apiSet:0,gets:{},uiMessages:0,boxChanges:0,outlets:0,dictParse:0,dictBytes:0,jsonStringify:0,jsonParse:0,jsonBytes:0,calls:{}});}
function setup(total,midi,rows,devices=1,scriptBytes=0){
 reset();const h=scope.makeHost(),c=h.context,ids=['id',10];
 for(let i=0;i<total-1;i++){
  const id=2000+i,isMidi=i<midi,ds=[];
  for(let d=0;isMidi&&d<devices;d++){const did=10000+i*100+d;ds.push('id',did);h.objects.set(did,{type:d===devices-1?1:0});}
  h.objects.set(id,{type:'Track',name:(isMidi?'MIDI_':'AUDIO_')+i,has_midi_input:+isMidi,has_audio_input:+!isMidi,is_foldable:0,is_frozen:0,devices:ds,mute:0,current_monitoring_state:0});ids.push('id',id);
 }
 h.objects.get(1).tracks=ids;
 for(const name of ['refresh','snapshot','checkClip','persist','guardedTrack']){
  const fn=c[name];c[name]=function(...args){metrics.calls[name]=(metrics.calls[name]||0)+1;return fn.apply(this,args);};
 }
 const originalJSON=JSON;
 c.JSON={parse(x){metrics.jsonParse++;return originalJSON.parse(x);},stringify(...args){metrics.jsonStringify++;const s=originalJSON.stringify(...args);metrics.jsonBytes+=s?Buffer.byteLength(s):0;return s;}};
 c.init();
 for(let i=0;i<rows;i++){const r=c.KLJModel.add(c.state,{bpm:120,root:0,scale:'Minor'});r.clip=i?'CONFIG_'+i:'SONG_A';r.script=scriptBytes?'//'+ 'x'.repeat(scriptBytes-2):'';r.push=c.runtime[0].key;}
 if ('hasRestoredState' in c) c.hasRestoredState=true;
 c.view.render(c.state,c.runtime);c.persist();
 if(process.env.KLJ_AUDIT_CLOSED==='1' && c.view.setVisible)c.view.setVisible(false);
 for(const obj of h.uiObjects.values()){
  const message=obj.message.bind(obj),box=obj.setboxattr.bind(obj);
  obj.message=function(...args){metrics.uiMessages++;return message(...args);};
  obj.setboxattr=function(...args){metrics.boxChanges++;return box(...args);};
 }
 for(const name of ['render','highlight','layout']){const fn=c.view[name];c.view[name]=function(...args){metrics.calls[name]=(metrics.calls[name]||0)+1;return fn.apply(this,args);};}
 function clear(){for(const obj of h.uiObjects.values())obj.messages.length=0;h.outputs.length=0;h.writes.length=0;}
 clear();return {h,c,clear};
}
function run(total,midi,rows,devices,scriptBytes,scenario){
 const {h,c,clear}=setup(total,midi,rows,devices,scriptBytes);let fn;
 const on=()=>{h.objects.get(1).is_playing=1;h.objects.get(10).playing_slot_index=0;};
 if(scenario==='idle_stopped_poll')fn=()=>{if(c.pollTask)c.pollTask.fn();h.drain();};
 if(scenario==='idle_playing_poll'){on();c.gate.read(c.snapshot(),true);c.bindClip(1000);fn=()=>{if(c.pollTask)c.pollTask.fn();h.drain();};}
 if(scenario==='unchanged_layout_tick')fn=()=>c.ui('layout');
 if(scenario==='rename_midi')fn=()=>{h.objects.get(2000).name+='x';c.scheduleScan();h.drain();};
 if(scenario==='rename_audio')fn=()=>{h.objects.get(2000+midi).name+='x';c.scheduleScan();h.drain();};
 if(scenario==='toggle_midi')fn=()=>h.click(4);
 if(scenario==='edit_script')fn=()=>c.ui('script',c.state.rows[0].script+'x');
 if(scenario==='noop_menu')fn=()=>{h.click(2);c.ui('menu',c.state.rows[0].root);};
 if(scenario==='recall_already_correct'){on();c.recall(c.snapshot());fn=()=>c.recall(c.snapshot());}
 if(scenario==='recall_all_changed'){
  on();fn=()=>{
   c.runtime.forEach(t=>{h.objects.get(t.id).mute=0;h.objects.get(t.id).current_monitoring_state=0;});
   Object.assign(h.objects.get(1),{tempo:99,root_note:1,scale_name:'Major'});
   h.objects.get(2).selected_track=['id',10];
   c.recall(c.snapshot());
  };
 }
 if(scenario==='recall_without_guards'){on();c.recall(c.snapshot());c.guardedTrack=t=>new c.LiveAPI(null,'id '+t.id);fn=()=>c.recall(c.snapshot());}
 if(scenario==='render_only')fn=()=>c.view.render(c.state,c.runtime);
 if(scenario==='validate_only')fn=()=>c.KLJModel.validate(c.state);
 const durations=[];let counts,writeLog;
 for(let i=0;i<7;i++){reset();clear();const start=performance.now();fn();durations.push(performance.now()-start);if(i===0){counts=JSON.parse(JSON.stringify(metrics));writeLog=JSON.parse(JSON.stringify(h.writes));}}
 durations.sort((a,b)=>a-b);
 return {total,midi,rows,devices,scriptBytes,scenario,counts,writeLog,nodeMedianMs:+durations[3].toFixed(3)};
}
const results=[];
for(const [t,m,r,d,s] of [[41,32,1,1,0],[41,32,15,1,0],[60,51,30,1,0],[41,32,15,8,0],[41,32,15,1,8192]]){
 for(const scenario of ['idle_stopped_poll','idle_playing_poll','unchanged_layout_tick','rename_midi','rename_audio','toggle_midi','edit_script','noop_menu','recall_already_correct','recall_all_changed','recall_without_guards','render_only','validate_only'])results.push(run(t,m,r,d,s,scenario));
}
console.log(JSON.stringify({environment:{node:process.version,platform:process.platform,arch:process.arch},limitations:'Fake synchronous API, zero native bridge/drawing/pattr/ALS latency; no observer initial callbacks or native patch feedback; bypass guards only inside one diagnostic VM, never in device.',results},null,2));
