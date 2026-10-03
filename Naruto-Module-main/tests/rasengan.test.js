import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ARTS} from '../scripts/rasengan-catalog.js';
import {values,damageParts,normalize,remainingPoints,usagePrerequisite} from '../scripts/rasengan-rules.js';

const MID='n5eb-classmod-library';
const hooks=new Map();let sequence=0,forms=[],confirms=[],rolls=[];
const set=(object,path,value)=>{const keys=path.split('.'),last=keys.pop();let o=object;for(const k of keys)o=o[k]??={};o[last]=structuredClone(value);};
const get=(object,path)=>path.split('.').reduce((o,k)=>o?.[k],object);
globalThis.Hooks={on:(key,fn)=>{const list=hooks.get(key)??[];list.push(fn);hooks.set(key,list);},once:(key,fn)=>{const list=hooks.get(key)??[];list.push(fn);hooks.set(key,list);}};
globalThis.foundry={utils:{escapeHTML:s=>String(s).replace(/[<>]/g,''),deepClone:structuredClone,randomID:()=>`id${++sequence}`,getProperty:get},applications:{api:{DialogV2:{wait:async()=>forms.shift(),confirm:async()=>confirms.shift()??false}}}};
globalThis.ui={notifications:{warn:()=>{},error:()=>{},info:()=>{}}};
globalThis.canvas={tokens:{controlled:[],placeables:[]}};
const documents=new Map();globalThis.fromUuid=async id=>documents.get(id)??null;
class Actor {
  constructor(id,l=4){this.id=id;this.uuid=`Actor.${id}`;this.name=id;this.documentName='Actor';this.isOwner=true;this.flags={};this.items=[{id:'cm',type:'classmod',system:{identifier:'rasengan',levels:l}}];this.system={details:{level:14},abilities:{int:{mod:4}},attributes:{hp:{value:50},ac:{value:12},chakra:{value:100}}};this.effects=[];documents.set(this.uuid,this);}
  getFlag(ns,key){return this.flags?.[ns]?.[key];}
  async update(patch){for(const [path,value] of Object.entries(patch))set(this,path,value);return this;}
  async createEmbeddedDocuments(){return [];}
  async toggleStatusEffect(id,options){this.lastStatus={id,options};}
}
globalThis.game={user:{id:'gm',isGM:true,targets:new Set()},users:{activeGM:{id:'gm'}},actors:[],combats:[],messages:[],system:{id:'n5eb'},packs:{get:()=>null},time:{worldTime:1000},settings:{get:()=>false}};
globalThis.ChatMessage={getSpeaker:({actor})=>({actor:actor.id}),create:async data=>{const doc={...data,id:`msg${++sequence}`,async update(patch){for(const [k,v]of Object.entries(patch))set(this,k,v);}};game.messages.push(doc);return doc;}};
globalThis.Roll=class {
 constructor(formula){this.formula=formula;}
 async evaluate(){const match=/(\d+)d(\d+)(?:kh|kl)?(?:\+(-?\d+))?/.exec(this.formula);const n=Number(match[1]),faces=Number(match[2]),results=Array.from({length:n},()=>({result:rolls.shift()??Math.ceil(faces/2),active:true}));if(this.formula.includes('kh')||this.formula.includes('kl')){const chosen=this.formula.includes('kh')?Math.max(...results.map(r=>r.result)):Math.min(...results.map(r=>r.result));let used=false;for(const r of results){r.active=!used&&r.result===chosen;if(r.active)used=true;else r.discarded=true;}}this.dice=[{faces,results}];this.total=results.filter(r=>r.active).reduce((s,r)=>s+r.result,0)+Number(match[3]??0);return this;}
 async toMessage(data){return ChatMessage.create({...data,roll:this});}
};
await import('../scripts/rasengan.js');for(const fn of hooks.get('ready')??[])await fn();
const API=globalThis.N5eBRasengan;
const fresh=(id,l=4)=>{forms=[];confirms=[];rolls=[];game.combat=null;game.user.targets=new Set();return new Actor(id,l);};
const setup=async(actor,patch={})=>actor.update({[`flags.${MID}.rasenganTracker`]:normalize(actor,patch,ARTS)});

// Regression tests exercise stateful behavior, cancellations and retries through the public API.
test('bundled Arts match supplied text, cost 60 total, and retain special mixed damage',()=>{
 assert.equal(ARTS.length,20);assert.equal(ARTS.reduce((s,a)=>s+a.points,0),60);
 assert.equal(ARTS.find(a=>a.id==='ultimate-rasengan').parts[0].formula,'20d10');
 assert.deepEqual(ARTS.find(a=>a.partner).parts.map(p=>p.type),['chakra','lightning']);
 assert.deepEqual(damageParts(ARTS[0],3,true,'force'),[{formula:'18d8',type:'force'}]);
 const bundle=JSON.parse(readFileSync(new URL('../data/rasengan.json',import.meta.url)));assert.equal(bundle.items.filter(i=>i.flags[MID].rasenganArt).length,20);
});
test('simultaneous duplicate purchase spends RP exactly once',async()=>{
 const actor=fresh('purchase',1);const results=await Promise.allSettled([API.purchase(actor,'rasengan'),API.purchase(actor,'rasengan')]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.deepEqual(API.getTracker(actor).learned,['rasengan']);assert.equal(remainingPoints(actor,API.getTracker(actor),ARTS),13);
});
test('prerequisite Arts enforce the learning chain; unrelated Class Mods gate usage only',async()=>{
 const actor=fresh('prereq');await assert.rejects(API.purchase(actor,'ultra-big-ball-rasengan'),/prerequisite/);
 await API.purchase(actor,'portal-rasengan');assert.match(usagePrerequisite(actor,API.getTracker(actor),ARTS.find(a=>a.id==='portal-rasengan')),/Requires/);
});
test('formation charges once, cost reduction caps at zero, reshape retains compression without a refund',async()=>{
 const actor=fresh('evolve');await setup(actor,{learned:['rasengan','rasenshuriken','vanishing-rasengan']});
 forms.push({type:'force',discount:true});const id=await API.formArt(actor,'vanishing-rasengan');assert.equal(API.getTracker(actor).chakra,400);assert.equal(API.getTracker(actor).discountUsed,1);
 await API.compress(actor);await API.compress(actor);forms.push({art:'rasenshuriken'});await API.evolve(actor,id);
 let s=API.getTracker(actor);assert.equal(s.chakra,389);assert.equal(s.cores[0].compression,2);assert.equal(s.cores[0].type,'force');
 forms.push({art:'rasengan'});await API.evolve(actor,id);assert.equal(API.getTracker(actor).chakra,389);
});
test('two-hand Art cannot be formed alongside a maintained core',async()=>{
 const actor=fresh('hands');await setup(actor,{learned:['rasengan','spiralling-serial-spheres-rasengan']});forms.push({type:'chakra'});await API.formArt(actor,'rasengan');forms.push({type:'chakra'});await assert.rejects(API.formArt(actor,'spiralling-serial-spheres-rasengan'),/free hands/);
});
test('compression increments only once per combat turn, including a manual end-turn followed by a round boundary',async()=>{
 const actor=fresh('compress');await setup(actor,{learned:['rasengan'],cores:[{id:'core',art:'rasengan',compression:0}]});game.combat={id:'fight',round:1,combatant:{actor}};
 await API.compress(actor,{manual:true});game.combat.round=2;await API.compress(actor,{key:`fight:1:${actor.uuid}`});assert.equal(API.getTracker(actor).cores[0].compression,1);
 for(let n=0;n<5;n++)await API.compress(actor,{key:`fight:${n+2}:${actor.uuid}`});assert.equal(API.getTracker(actor).cores[0].compression,3);
});
test('critical hit imprints actual compressed dice on a non-owned target and persists through Full Rest',async()=>{
 const actor=fresh('echo-attack'),target=new Actor('enemy');target.isOwner=false;await setup(actor,{learned:['rasengan']});forms.push({type:'force'});const id=await API.formArt(actor,'rasengan');await API.compress(actor);game.user.targets.add({actor:target,name:target.name,document:{uuid:'Scene.a.Token.b'}});
 forms.push({mode:'normal'},{hit:true,critical:true});confirms.push(true);await API.releaseCore(actor,id);
 const s=API.getTracker(actor);assert.equal(s.echoes.length,1);assert.equal(s.echoes[0].parts[0].formula,'14d8');assert.equal(s.echoes[0].parts[0].type,'chakra');assert.equal(s.pending.length,0);
 await API.rest(actor,'full');assert.deepEqual(API.getTracker(actor).echoes,s.echoes);assert.equal(API.getTracker(actor).chakra,400);
 const reloaded=new Actor('reload');reloaded.flags=structuredClone(actor.flags);assert.equal(API.getTracker(reloaded).echoes[0].target,target.uuid);
});
test('missing target preserves all Echoes without a resource reset erasing them',async()=>{
 const actor=fresh('missing');await setup(actor,{echoes:[{id:'e',target:'Actor.gone',targetName:'Gone',artName:'Rasengan',parts:[{formula:'6d8',type:'chakra'}]}]});
 await assert.rejects(API.releaseEchoes(actor,'Actor.gone',{ids:['e']}),/no longer exists/);assert.equal(API.getTracker(actor).echoes.length,1);await API.rest(actor,'long');assert.equal(API.getTracker(actor).echoes.length,1);
});
test('three-Echo reaction uses native save with disadvantage and stops a failed triggering action',async()=>{
 const actor=fresh('reaction'),target=new Actor('react-target');let saveConfig;target.rollSavingThrow=async c=>{saveConfig=c;return [{total:1}];};
 await setup(actor,{echoes:[1,2,3].map(n=>({id:`e${n}`,target:target.uuid,targetName:target.name,artName:'Rasengan',parts:[{formula:'6d8',type:'chakra'}],rerolls:0}))});game.combat={id:'combat',round:1,combatant:{actor}};
 const result=await API.releaseEchoes(actor,target.uuid,{reaction:true,ids:['e1','e2','e3']});assert.equal(result.interrupted,true);assert.equal(saveConfig.ability,'con');assert.equal(saveConfig.disadvantage,true);assert.equal(API.getTracker(actor).echoes.length,0);
 await setup(actor,{...API.getTracker(actor),echoes:[{id:'again',target:target.uuid,targetName:target.name,parts:[{formula:'1d8',type:'chakra'}]}]});await assert.rejects(API.releaseEchoes(actor,target.uuid,{reaction:true,ids:['again']}),/reaction/);
});
test('cancelled interrupt save retains a resumable damage delivery and prevents a second release',async()=>{
 const actor=fresh('cancel'),target=new Actor('cancel-target');target.isOwner=false;await setup(actor,{echoes:[1,2,3].map(n=>({id:`e${n}`,target:target.uuid,targetName:target.name,parts:[{formula:'1d8',type:'chakra'}]}))});
 forms.push(null);await assert.rejects(API.releaseEchoes(actor,target.uuid,{reaction:true,ids:['e1','e2','e3']}),/unresolved/);
 const s=API.getTracker(actor);assert.equal(s.echoes.length,3);assert.equal(s.pending.length,1);
 await assert.rejects(API.releaseEchoes(actor,target.uuid,{ids:['e1']}),/pending release/);
 forms.push({total:1});await API.resumeResolution(actor,s.pending[0].id);assert.equal(API.getTracker(actor).echoes.length,0);assert.equal(API.getTracker(actor).pending.length,0);
});
test('cancelled release keeps the paid core; a retry does not charge again',async()=>{
 const actor=fresh('cancel-core'),target=new Actor('cancel-core-target');await setup(actor,{learned:['rasengan']});forms.push({type:'chakra'});const core=await API.formArt(actor,'rasengan');game.user.targets.add({actor:target,name:target.name});forms.push(null);await API.releaseCore(actor,core);assert.equal(API.getTracker(actor).chakra,392);assert.equal(API.getTracker(actor).cores.length,1);
 forms.push({mode:'normal'},null);await assert.rejects(API.releaseCore(actor,core),/Hit unresolved/);assert.equal(API.getTracker(actor).chakra,392);assert.equal(API.getTracker(actor).pending.length,1);
});
test('character-level formulas use actual level and never substituted minimums',()=>{
 const actor=fresh('formula',2);actor.system.details.level=6;assert.deepEqual(values(actor),{level:2,maximum:200,points:30,attack:12,dc:15,discounts:4});
});
test('reaction pre-use hook pauses native activity and resumes only after a successful interrupt save',async()=>{
 const source=fresh('auto-window'),target=new Actor('auto-target');target.rollSavingThrow=async()=>[{total:99}];
 await setup(source,{echoes:[1,2,3].map(n=>({id:`w${n}`,target:target.uuid,targetName:target.name,parts:[{formula:'1d8',type:'chakra'}]}))});game.actors=[source];
 let resumed=0;const activity={actor:target,type:'attack',item:{name:'Chidori',type:'spell',actor:target},use:async()=>{resumed++;}};
 confirms.push(true);forms.push({ew1:true,ew2:true,ew3:true});const hook=hooks.get('dnd5e.preUseActivity').at(-1);assert.equal(hook(activity),false);
 for(let n=0;n<20&&resumed===0;n++)await new Promise(r=>setImmediate(r));
 assert.equal(resumed,1);assert.equal(API.getTracker(source).echoes.length,0);game.actors=[];
});
test('one failed interrupt save cancels the triggering native activity',async()=>{
 const source=fresh('stop-window'),target=new Actor('stop-target');target.rollSavingThrow=async()=>[{total:0}];
 await setup(source,{echoes:[1,2,3].map(n=>({id:`s${n}`,target:target.uuid,targetName:target.name,parts:[{formula:'1d8',type:'chakra'}]}))});game.actors=[source];
 let resumed=0;const activity={actor:target,type:'attack',item:{name:'Chidori',type:'spell',actor:target},use:async()=>{resumed++;}};
 confirms.push(true);forms.push({es1:true,es2:true,es3:true});assert.equal(hooks.get('dnd5e.preUseActivity').at(-1)(activity),false);
 for(let n=0;n<20&&API.getTracker(source).echoes.length;n++)await new Promise(r=>setImmediate(r));
 assert.equal(resumed,0);assert.equal(API.getTracker(source).echoes.length,0);game.actors=[];
});
test('native typed damage card applies once despite two local clicks and marks the delivery',async()=>{
 const target=fresh('apply-target');let count=0,payload;
 target.applyDamage=async(d,o)=>{count++;payload={d,o};};
 const m=await ChatMessage.create({flags:{[MID]:{rasenganDamage:{target:target.uuid,damages:[{value:22,type:'chakra'}],multiplier:0.5,applied:false}}}});
 let click;const b={disabled:false,textContent:'',addEventListener:(event,fn)=>{click=fn;}};
 for(const h of hooks.get('renderChatMessageHTML')??[])h(m,{querySelector:()=>b});confirms.push(true);click();click();
 for(let n=0;n<20&&!m.flags[MID].rasenganDamage.applied;n++)await new Promise(r=>setImmediate(r));
 assert.equal(count,1);assert.deepEqual(payload,{d:[{value:22,type:'chakra'}],o:{multiplier:0.5}});assert.equal(m.flags[MID].rasenganDamage.applied,true);
});
test('combo chakra lock persists until Full Rest, then starts the one-month cooldown without deleting Echoes',async()=>{
 const actor=fresh('lock');await setup(actor,{chakraLocked:true,comboAwaitingFullRest:true,echoes:[{id:'old',target:'Actor.villain',parts:[{formula:'6d8',type:'chakra'}]}]});
 await API.rest(actor,'long');assert.equal(API.getTracker(actor).chakraLocked,true);await API.rest(actor,'full');const s=API.getTracker(actor);assert.equal(s.chakraLocked,false);assert.equal(s.cooldownUntil,game.time.worldTime+30*86400);assert.equal(s.echoes.length,1);
});
test('an area Save Art rolls damage once and reuses it for all affected targets',async()=>{
 const actor=fresh('area'),a=new Actor('area-a'),b=new Actor('area-b');a.rollSavingThrow=b.rollSavingThrow=async()=>[{total:0}];await setup(actor,{learned:['big-ball-rasengan']});
 forms.push({type:'chakra'});const core=await API.formArt(actor,'big-ball-rasengan');game.user.targets.add({actor:a,name:a.name});game.user.targets.add({actor:b,name:b.name});
 forms.push({mode:'normal',save:'con'},null);const start=game.messages.length;await API.releaseCore(actor,core);
 const messages=game.messages.slice(start);assert.equal(messages.filter(m=>m.roll?.formula==='4d8').length,1);const cards=messages.filter(m=>m.flags?.[MID]?.rasenganDamage);assert.equal(cards.length,2);assert.deepEqual(cards[0].flags[MID].rasenganDamage.damages,cards[1].flags[MID].rasenganDamage.damages);
});
test('a reaction used before your turn refreshes when that turn begins, not at the round boundary',async()=>{
 const source=fresh('own-turn'),target=new Actor('own-turn-target');await setup(source,{echoes:[1,2].map(n=>({id:`t${n}`,target:target.uuid,targetName:target.name,parts:[{formula:'1d8',type:'chakra'}]}))});game.combat={id:'cycle',round:1,turn:0,turns:[{actor:target},{actor:source}],combatant:{actor:target}};
 await API.releaseEchoes(source,target.uuid,{reaction:true,ids:['t1']});game.combat.turn=1;game.combat.combatant={actor:source};await API.releaseEchoes(source,target.uuid,{reaction:true,ids:['t2']});assert.equal(API.getTracker(source).echoes.length,0);
});
