import test from 'node:test';
import assert from 'node:assert/strict';
import {castPayment,modifyTechniqueData} from '../scripts/madara-rules.js';
const ID='n5eb-classmod-library',hooks=new Map();let forms=[],nativeCancel=false,seq=0,warnings=[],rollTotal=30,attackRolls=[{total:30,isCritical:false}];
const get=(o,p)=>p.split('.').reduce((v,k)=>v?.[k],o);
const set=(o,p,v)=>{const keys=p.split('.'),last=keys.pop();for(const k of keys)o=o[k]??={};if(last.startsWith('-='))delete o[last.slice(2)];else o[last]=structuredClone(v);};
const run=async(name,...args)=>{let result;for(const f of hooks.get(name)??[])if(await f(...args)===false)result=false;return result;};
globalThis.Hooks={on:(n,f)=>hooks.set(n,[...(hooks.get(n)??[]),f]),once:(n,f)=>hooks.set(n,[...(hooks.get(n)??[]),f])};
globalThis.foundry={utils:{getProperty:get,deepClone:structuredClone,escapeHTML:String,randomID:()=>`cast${++seq}`,mergeObject:(a,b)=>({...a,...b})},applications:{api:{DialogV2:{wait:async()=>forms.shift()}}}};
globalThis.ui={notifications:{warn:s=>warnings.push(s),info:()=>{},error:()=>{}}};
globalThis.CONST={ACTIVE_EFFECT_MODES:{ADD:2,OVERRIDE:5,UPGRADE:4}};
globalThis.game={user:{id:'gm',isGM:true},users:{activeGM:{id:'gm'}},system:{id:'n5eb'},actors:[],combats:[],time:{worldTime:1000},packs:{get:()=>null},settings:{get:()=>false},messages:new Map()};
globalThis.canvas={tokens:{controlled:[]}};
globalThis.ChatMessage={getSpeaker:({actor})=>({actor:actor.id}),create:async d=>{const message={...d,id:`message${++seq}`,isOwner:true,getFlag(ns,k){return get(this.flags?.[ns],k);},async update(patch){for(const [k,v]of Object.entries(patch))set(this,k,v);}};game.messages.set(message.id,message);return message;}};
globalThis.Roll=class{async evaluate(){this.total=rollTotal;return this;}async toMessage(){}};
class Collection extends Array{get(id){return this.find(d=>d.id===id);}}
class Document{
 constructor(data,parent){Object.assign(this,structuredClone(data));this.id??=this._id??`doc${++seq}`;this.parent=parent;this.uuid=`${parent?.uuid??'Actor'}.${this.type??'Effect'}.${this.id}`;this.effects=new Collection(...(data.effects??[]).map(d=>new Document(d,this)));}
 getFlag(ns,k){return get(this.flags?.[ns],k);}
 toObject(){const {parent,uuid,id,effects,actor,...rest}=this,data=Object.fromEntries(Object.entries(rest).filter(([,v])=>typeof v!=='function'));return {...structuredClone(data),_id:id,effects:effects.map(e=>e.toObject())};}
 async update(patch){for(const [k,v]of Object.entries(patch))set(this,k,v);return this;}
 async delete(){const collection=this.type?this.parent.items:this.parent.effects;collection.splice(collection.indexOf(this),1);}
 clone(data,{parent=this.parent}={}){
  const item=new Document(data,parent);item.actor=parent;
  const sourceActivities=Object.entries(data.system.activities??{});
  item.system.activities=new Collection(...sourceActivities.map(([id,a])=>({...structuredClone(a),id,item,messageFlags:{item:{uuid:item.uuid,id:item.id},activity:{id,uuid:item.uuid+'.Activity.'+id}},async _createUsageMessage(message){await run('dnd5e.preCreateUsageMessage',this,message);return ChatMessage.create(message.data);},async rollAttack(){return attackRolls;},async use(config,dialog,message){
    if(nativeCancel)return;
    if(await run('dnd5e.preActivityConsumption',this,config,message)===false)return;
    const updates={actor:{},item:[]};if(await run('dnd5e.activityConsumption',this,config,message,updates)===false)return;
    await parent.update(updates.actor);await run('dnd5e.postActivityConsumption',this,config,message);
    // The native card initially identifies the live owned item and activity.
    message.data.flags.n5eb={item:{uuid:item.uuid,id:item.id},activity:{uuid:item.uuid+'.Activity.'+id,id}};
    await run('dnd5e.preCreateUsageMessage',this,message);parent.lastCast={item,activity:this,config,message,updates};return parent.lastCast;
  }})));
  // Native toObject returns source data, including cast-local changes and scaling flags.
  item.toObject=()=>structuredClone(data);return item;
 }
}
class Actor{
 constructor(level=2){this.id=`actor${++seq}`;this.uuid=`Actor.${this.id}`;this.documentName='Actor';this.isOwner=true;this.name=this.id;this.flags={};this.effects=new Collection();this.items=new Collection(new Document({id:'cm',type:'classmod',system:{identifier:'madara-cells',levels:level}},this));this.apps={};this.system={details:{level:16},attributes:{prof:4,hp:{value:100,max:100},chakra:{value:80,temp:5,max:80}},abilities:{dex:{mod:3},int:{mod:4},con:{mod:2}},skills:{}};this.writes=0;}
 getFlag(ns,k){return get(this.flags[ns],k);}
 async update(patch,options={}){assert.equal(options.parent?.documentName==='Actor',false);options.parent??=null;for(const [k,v]of Object.entries(patch))set(this,k,v);this.writes++;return this;}
 async createEmbeddedDocuments(type,data,options={}){options.parent??=this;const collection=type==='Item'?this.items:this.effects,docs=data.map(d=>new Document(d,this));collection.push(...docs);return docs;}
 async deleteEmbeddedDocuments(type,ids){const c=type==='Item'?this.items:this.effects;for(let i=c.length-1;i>=0;i--)if(ids.includes(c[i].id))c.splice(i,1);}
 async updateEmbeddedDocuments(type,updates){for(const p of updates){const {_id,...patch}=p;await this.items.get(_id).update(patch);}}
 getChakraSpendUpdates(cost){const c=this.system.attributes.chakra;return {'system.attributes.chakra.temp':Math.max(0,c.temp-cost),'system.attributes.chakra.value':c.value-Math.max(0,cost-c.temp)};}
}
await import('../scripts/madara-cells.js');await run('ready');const API=N5eBMadaraCells;
function fresh(level=2,identifier='uchiha-flame-ball'){
 forms=[];warnings=[];nativeCancel=false;game.combat=null;const actor=new Actor(level);
 actor.flags[ID]={madaraCellsTracker:API.getTracker(actor)};
 const jutsu=new Document({id:'jutsu',type:'spell',name:'Base Jutsu',system:{identifier,rank:'c',chakra:{cost:'9'},jutsu:{keywords:['fire','hijutsu']},description:{value:'base'},activities:{attack:{type:'attack',attack:{flat:false,bonus:''},damage:{parts:[{number:3,denomination:6,bonus:'0',scaling:{mode:'whole',number:2}}]}}}},effects:[]},actor);
 jutsu.system.getChakraCost=()=>9;jutsu.system.rankForDelta=()=>'b';actor.items.push(jutsu,new Document({id:'mastered',type:'feat',name:'Mastered Jutsu',system:{identifier:'mastered-'+identifier,description:{value:'benefits'}},flags:{[ID]:{madaraMasteredTechnique:true,baseJutsuIdentifier:identifier,classMod:'madara-cells'}}},actor));
 // Item source serialization does not include derived methods.
 const original=jutsu.toObject.bind(jutsu);jutsu.toObject=()=>{const {getChakraCost,rankForDelta,...system}=jutsu.system;jutsu.system=system;const data=original();jutsu.system={...system,getChakraCost,rankForDelta};return data;};
 return actor;
}
test('payment keeps Uchiha discount, Mastered activation and Perfect Match conversion',()=>{
 assert.deepEqual(castPayment({level:2,cost:7,mastered:true,legacy:40,chakra:80}),{legacyCost:6,legacySpent:6,normalCost:0});
 assert.deepEqual(castPayment({level:2,cost:7,source:'normal',mastered:true,legacy:40,chakra:80}),{legacyCost:2,legacySpent:2,normalCost:7});
 assert.deepEqual(castPayment({level:5,cost:4,source:'normal',mastered:true,legacy:0,chakra:10}),{legacyCost:0,legacySpent:0,normalCost:10});
 assert.throws(()=>castPayment({level:2,cost:7,mastered:true,legacy:1,chakra:80}),/Requires/);
 assert.throws(()=>castPayment({level:5,cost:7,legacy:0,chakra:1}),/Requires/);
});
test('Legacy cast charges once and snapshots Mastered damage without changing the owned Jutsu',async()=>{
 const actor=fresh();const original=actor.items.get('jutsu').toObject();await API.castTechnique(actor,'mastered',{source:'legacy'});
 assert.equal(API.getTracker(actor).legacy,34);assert.equal(actor.system.attributes.chakra.value,80);assert.equal(actor.lastCast.item.system.activities[0].damage.parts[0].number,7);
 assert.deepEqual(actor.items.get('jutsu').toObject(),original);const flags=actor.lastCast.message.data.flags.n5eb;
 assert.equal(flags.item.uuid,null);assert.equal(flags.activity.uuid,null);assert.equal(flags.item.data.system.activities.attack.damage.parts[0].number,7);
 assert.match(actor.lastCast.message.data.content,/6 Legacy Chakra/);
});
test('normal cast uses temporary Chakra first and separately pays the Mastered activation',async()=>{
 const actor=fresh();await API.castTechnique(actor,'mastered',{source:'normal'});
 assert.equal(API.getTracker(actor).legacy,38);assert.equal(actor.system.attributes.chakra.temp,0);assert.equal(actor.system.attributes.chakra.value,78);
 assert.equal(actor.lastCast.message.data.system.chakraCost,7);
});
test('pool dialog and native usage cancellation both leave resources untouched',async()=>{
 const actor=fresh();forms.push(null);await API.castTechnique(actor,'mastered');assert.equal(actor.writes,0);
 nativeCancel=true;await API.castTechnique(actor,'mastered',{source:'legacy'});assert.equal(actor.writes,0);assert.equal(actor.lastCast,undefined);
});
test('insufficient payment vetoes native consumption and makes no Actor write',async()=>{
 const actor=fresh();await API.setTracker(actor,{legacy:0},{effects:false,syncJutsu:false});const writes=actor.writes;
 await API.castTechnique(actor,'mastered',{source:'legacy'});assert.equal(actor.writes,writes);assert.equal(actor.lastCast,undefined);assert.match(warnings[0],/Requires/);
});
test('Flame Flower sets both concentration and message maintenance cost to zero',async()=>{
 const actor=fresh(2,'uchiha-flame-flower');await API.castTechnique(actor,'mastered',{source:'legacy'});
 assert.equal(actor.lastCast.config.chakra.maintain,0);assert.equal(actor.lastCast.message.data.system.maintainCost,0);
});
test('snapshot roll hooks preserve Ember advantage and scoped Deflect disadvantage',async()=>{
 const actor=fresh(2,'uchiha-ember-bullet');forms.push('clear');await API.castTechnique(actor,'mastered',{source:'legacy'});
 const config={subject:actor.lastCast.activity};await run('dnd5e.preRollAttackV2',config,{}, {data:{}});assert.equal(config.advantage,true);
 game.messages.set('deflect',{getFlag:()=>({identifier:'genjutsu-deflect'})});const save={ability:'wis',event:{target:{closest:()=>({dataset:{messageId:'deflect'}})}}};await run('dnd5e.preRollSavingThrowV2',save);assert.equal(save.disadvantage,true);
 const other={ability:'dex',event:save.event};await run('dnd5e.preRollSavingThrowV2',other);assert.equal(other.disadvantage,undefined);
});
function sharingan(actor,spent=0){const item=new Document({id:'eye',type:'feat',name:'Sharingan',system:{identifier:'sharingan',uses:{max:5,spent}},effects:[{name:'Sharingan',changes:[{key:'senses',value:''}]}]},actor);actor.items.push(item);return item;}
test('Sharingan activation grants one actual timed effect, spends a use and expires',async()=>{
 const actor=new Actor(2),eye=sharingan(actor);await API.toggleSharingan(actor);assert.equal(eye.system.uses.spent,1);
 const effects=actor.effects.filter(e=>e.getFlag(ID,'madaraCellsSharinganEffect'));assert.equal(effects.length,1);assert.equal(effects[0].name,'Sharingan');assert.equal(effects[0].duration.seconds,600);assert.deepEqual(effects[0].changes,[]);
 await API.setTracker(actor,{}, {syncJutsu:false});assert.equal(actor.effects.filter(e=>e.name==='Sharingan').length,1);
 game.actors=[actor];game.time.worldTime=1601;await run('updateWorldTime');await new Promise(r=>setImmediate(r));assert.equal(API.getTracker(actor).sharinganActive,false);assert.equal(actor.effects.filter(e=>e.name==='Sharingan').length,0);game.actors=[];game.time.worldTime=1000;
});
test('Indirect Reincarnation makes Sharingan permanent without spending uses',async()=>{
 const actor=new Actor(4),eye=sharingan(actor);await API.toggleSharingan(actor);await API.toggleSharingan(actor);
 assert.equal(eye.system.uses.spent,0);assert.equal(actor.effects.filter(e=>e.name==='Sharingan').length,1);assert.equal(actor.effects.find(e=>e.name==='Sharingan').duration.seconds,null);
});
test('full Sharingan and Mangekyō pools never spend Legacy; partial pools use spent schema',async()=>{
 const actor=new Actor(5),eye=sharingan(actor);forms.push('eye');await API.replenishSharingan(actor);assert.equal(actor.writes,0);
 eye.system.uses.spent=2;forms.push('eye');await API.replenishSharingan(actor);assert.equal(eye.system.uses.spent,1);assert.equal(API.getTracker(actor).legacy,99);
 const mang=new Document({id:'mang',type:'feat',name:'Mangekyō',system:{identifier:'mangekyo',uses:{max:3,spent:0}}},actor);actor.items.push(mang);
 forms.push({item:'mang',count:8});await API.convertMangekyo(actor);assert.equal(API.getTracker(actor).legacy,99);
 mang.system.uses.spent=1;forms.push({item:'mang',count:8});await API.convertMangekyo(actor);assert.equal(mang.system.uses.spent,0);assert.equal(API.getTracker(actor).legacy,89);
});
test('old permanent zero-cost overrides restore original Chakra exactly once',async()=>{
 const actor=fresh(),jutsu=actor.items.get('jutsu');jutsu.system.chakra={cost:'0'};jutsu.flags={[ID]:{madaraLegacyOriginal:{chakra:{cost:'9',scaling:{value:3}}}}};
 await API.setTracker(actor,{}, {effects:false});assert.deepEqual(jutsu.system.chakra,{cost:'9',scaling:{value:3}});assert.equal(jutsu.getFlag(ID,'madaraLegacyOriginal'),undefined);
});
test('native actor sheet header receives one control; unrelated actor-backed menus receive none',async()=>{
 const actor=new Actor(),sheet=[],menu=[];await run('getHeaderControlsApplicationV2',{document:actor},sheet);await run('getHeaderControlsApplicationV2',{actor},menu);assert.equal(sheet.length,1);assert.equal(menu.length,0);
});
test('unrelated item updates produce no reads, effects, grants or writes',async()=>{
 const actor=new Actor();let reads=0;game.packs.get=()=>{reads++;return null;};const item=new Document({type:'spell',system:{identifier:'clone-technique'}},actor);
 for(let n=0;n<100;n++){await run('updateItem',item,{'system.uses.spent':n},{},'gm');await run('createItem',item,{},'gm');}
 assert.equal(reads,0);assert.equal(actor.writes,0);assert.equal(actor.effects.length,0);game.packs.get=()=>null;
});
test('Mastered Shuriken Rain changes dice, two templates and ammunition only on a clone',()=>{
 const source={system:{jutsu:{components:['m','w','nt']},activities:{save:{save:{dc:{}},damage:{parts:[{number:5,denomination:4,scaling:{formula:'2d4'}}]},target:{template:{type:'sphere',size:'10'}},consumption:{targets:[{type:'itemQuantity',target:'shuriken'},{type:'itemUses',target:''}]}}}},effects:[]};
 const data=modifyTechniqueData(source,{attack:10,dc:18,mastered:'uchiha-shuriken-rain'}),a=data.system.activities.save;
 assert.equal(a.damage.parts[0].number,6);assert.equal(a.damage.parts[0].denomination,6);assert.equal(a.damage.parts[0].scaling.formula,'2d6');assert.equal(a.target.template.count,'2');assert.deepEqual(a.consumption.targets,[{type:'itemUses',target:''}]);assert.equal(source.system.activities.save.damage.parts[0].denomination,4);
});
test('reloaded chat consumption cannot silently switch a Legacy cast to normal Chakra',async()=>{
 const actor=fresh();await API.castTechnique(actor,'mastered',{source:'legacy'});const before=actor.writes;
 assert.equal(await run('dnd5e.preActivityConsumption',actor.lastCast.activity,{},{}),false);assert.equal(actor.writes,before);
});
test('Mastered Defence limits persist per turn and round, and release on the next round',async()=>{
 const actor=new Actor(1);game.combat={id:'defence',round:1,turn:0};await API.spendDefence(actor);const remaining=API.getTracker(actor).defence;
 await API.spendDefence(actor);assert.equal(API.getTracker(actor).defence,remaining);
 game.combat.turn=1;await API.spendDefence(actor);assert.equal(API.getTracker(actor).defence,remaining);
 game.combat.round=2;await API.spendDefence(actor);assert.equal(API.getTracker(actor).defence,remaining-1);game.combat=null;
});
test('single-character rounds process Hatred countdown and stability stops takeover',async()=>{
 rollTotal=0;const actor=new Actor(2);actor.system.attributes.hp.value=0;
 await API.setTracker(actor,{hatred:true});const combat={id:'solo',round:1,turn:0,combatant:{actor}};
 for(let round=1;round<=3;round++){combat.round=round;await run('updateCombat',combat,{round},{},'gm');}
 assert.equal(actor.system.attributes.hp.value,1);assert.equal(API.getTracker(actor).lostToHatred,true);
 const stable=new Actor(2);stable.system.attributes.hp.value=0;await API.setTracker(stable,{hatred:true,stabilized:true});const second={id:'stable',round:1,turn:0,combatant:{actor:stable}};
 await run('updateCombat',second,{round:1},{},'gm');assert.equal(API.getTracker(stable).zeroHatredTurns,0);assert.equal(API.getTracker(stable).lostToHatred,false);rollTotal=30;
});
test('long rest restores module pools and ends temporary Sharingan',async()=>{
 const actor=new Actor(2);sharingan(actor);await API.toggleSharingan(actor);await API.setTracker(actor,{legacy:1,defence:0});
 await run('dnd5e.restCompleted',actor,{type:'long'});await new Promise(r=>setImmediate(r));
 assert.equal(API.getTracker(actor).legacy,40);assert.equal(API.getTracker(actor).defence,4);assert.equal(API.getTracker(actor).sharinganActive,false);
});
async function ongoing(actor,identifier='uchiha-flame-flower',castId='ongoing'){
 const base=actor.items.get('jutsu'),data={name:'Concentration',flags:{},changes:[],duration:{seconds:60}};
 const native=base.clone({...base.toObject(),flags:{[ID]:{madaraCastId:castId,madaraCast:{mastered:true,identifier,castId,attack:10,dc:18}}}},{parent:actor});
 await run('dnd5e.preBeginConcentrating',actor,native,data);return (await actor.createEmbeddedDocuments('ActiveEffect',[data]))[0];
}
test('native concentration stores persistent Flower controls; cancellation and duplicate free attacks conserve spheres',async()=>{
 const actor=fresh(2,'uchiha-flame-flower'),control=await ongoing(actor);game.combat={id:'flowers',round:1,turn:0,combatant:{actor}};game.user.targets=new Set([{actor:new Actor()}]);
 attackRolls=[];await API.launchFlower(actor,control.id);assert.equal(control.getFlag(ID,'madaraOngoing').spheres,8);
 attackRolls=[{total:5,isCritical:false}];const chakra=actor.system.attributes.chakra.value,legacy=API.getTracker(actor).legacy;
 const result=await Promise.allSettled([API.launchFlower(actor,control.id),API.launchFlower(actor,control.id)]);
 assert.equal(result.filter(r=>r.status==='fulfilled').length,1);assert.equal(control.getFlag(ID,'madaraOngoing').spheres,7);assert.equal(API.getTracker(actor).legacy,legacy);assert.equal(actor.system.attributes.chakra.value,chakra);
 game.combat.round=2;await API.launchFlower(actor,control.id);assert.equal(control.getFlag(ID,'madaraOngoing').spheres,6);
 game.combat=null;game.user.targets=new Set();attackRolls=[{total:30,isCritical:false}];
});
test('Flower bonus action and free action have independent limits; ending concentration blocks more attacks',async()=>{
 const actor=fresh(2,'uchiha-flame-flower'),control=await ongoing(actor);game.combat={id:'flower-bonus',round:1,turn:0,combatant:{actor}};game.user.targets=new Set([{actor:new Actor()}]);
 await API.launchFlower(actor,control.id,{mode:'bonus'});await API.launchFlower(actor,control.id);assert.equal(control.getFlag(ID,'madaraOngoing').spheres,6);
 await assert.rejects(API.launchFlower(actor,control.id,{mode:'bonus'}),/already used/);await API.endTechnique(actor,control.id);
 await assert.rejects(API.launchFlower(actor,control.id),/no longer active/);game.combat=null;game.user.targets=new Set();
});
test('source-bound removal uses STR/Legacy DC or DEX Survival/Searing DC; cancellation and failure retain conditions',async()=>{
 const actor=new Actor();let config;actor.rollSavingThrow=async c=>{config=c;return [];};
 const [restraint]=await actor.createEmbeddedDocuments('ActiveEffect',[{name:'Restrained',flags:{[ID]:{madaraRemoval:{kind:'restrained',dc:19,casterUuid:actor.uuid,castId:'rain'}}}}]);
 await API.removeTechniqueCondition(actor,restraint.id);assert.equal(config.ability,'str');assert.equal(config.target,19);assert.ok(actor.effects.get(restraint.id));
 actor.rollSavingThrow=async()=>[{total:18}];assert.equal(await API.removeTechniqueCondition(actor,restraint.id),false);assert.ok(actor.effects.get(restraint.id));
 actor.rollSavingThrow=async()=>[{total:19}];assert.equal(await API.removeTechniqueCondition(actor,restraint.id),true);assert.equal(actor.effects.get(restraint.id),undefined);
 actor.rollSkill=async c=>{config=c;return [{total:20}];};const [burned]=await actor.createEmbeddedDocuments('ActiveEffect',[{name:'Burned',flags:{[ID]:{madaraRemoval:{kind:'burned',dc:18,casterUuid:actor.uuid,castId:'fire'}}}}]);
 await API.removeTechniqueCondition(actor,burned.id);assert.deepEqual(config,{skill:'sur',ability:'dex',target:18});assert.equal(actor.effects.get(burned.id),undefined);
});
test('Mastered Red Star grows only on affected turns; duplicates are ignored and overflow applies native psychic damage once',async()=>{
 const caster=fresh(2,'genjutsu-red-star'),control=await ongoing(caster,'genjutsu-red-star','red-cast'),target=new Actor();game.actors=[caster,target];
 const [red]=await target.createEmbeddedDocuments('ActiveEffect',[{name:'Demoralized',flags:{n5eb:{condition:{id:'demoralized',rank:2,maxRank:5}},[ID]:{madaraRedStar:{casterUuid:caster.uuid,castId:'red-cast',lastTurn:''}}}}]);
 const calls=[];target.applyDamage=async damages=>calls.push(damages);const combat={id:'redstar',round:1,turn:0,combatant:{actor:target}};
 await run('updateCombat',combat,{round:1},{},'gm');assert.equal(red.flags.n5eb.condition.rank,3);
 await run('updateCombat',combat,{round:1},{},'gm');assert.equal(red.flags.n5eb.condition.rank,3);
 for(let round=2;round<=4;round++){combat.round=round;await run('updateCombat',combat,{round},{},'gm');}
 assert.equal(red.flags.n5eb.condition.rank,5);assert.equal(calls.length,1);assert.equal(calls[0][0].type,'psychic');assert.equal(red.getFlag(ID,'madaraRedStar').crash.phase,'applied');
 await API.resolveRedStarCrash(target,red.id);assert.equal(calls.length,1);
 control.disabled=true;combat.round=5;await run('updateCombat',combat,{round:5},{},'gm');assert.equal(calls.length,1);game.actors=[];
});
test('interrupted Red Star damage cannot apply again silently, and non-owner clients cannot change target effects',async()=>{
 const target=new Actor(),[effect]=await target.createEmbeddedDocuments('ActiveEffect',[{flags:{[ID]:{madaraRedStar:{crash:{phase:'applying',total:30}}}}}]);
 await assert.rejects(API.resolveRedStarCrash(target,effect.id),/verify HP/);target.isOwner=false;
 await assert.rejects(API.resolveRedStarCrash(target,effect.id),/target owner/);await assert.rejects(API.removeTechniqueCondition(target,effect.id),/target owner/);
});
test('concentration cleanup removes only Red Star effects from that cast and preserves changed origins',async()=>{
 const caster=fresh(2,'genjutsu-red-star'),control=await ongoing(caster,'genjutsu-red-star','cleanup-red'),target=new Actor();game.actors=[caster,target];
 const metadata={casterUuid:caster.uuid,castId:'cleanup-red'};
 const effects=await target.createEmbeddedDocuments('ActiveEffect',[{name:'Own Red Star',origin:control.getFlag(ID,'madaraOngoing').sourceUuid,flags:{[ID]:{madaraRedStar:metadata}}},{name:'Other caster',origin:'Actor.other.Item.jutsu',flags:{[ID]:{madaraRedStar:metadata}}},{name:'Other cast',flags:{[ID]:{madaraRedStar:{...metadata,castId:'other'}}}}]);
 await run('deleteActiveEffect',control,{},'gm');assert.equal(target.effects.get(effects[0].id),undefined);assert.ok(target.effects.get(effects[1].id));assert.equal(effects[1].getFlag(ID,'madaraRedStar'),undefined);assert.ok(target.effects.get(effects[2].id));game.actors=[];
});
test('World Time expires ongoing controls without refreshing their one-minute duration',async()=>{
 const actor=fresh(2,'uchiha-flame-flower'),control=await ongoing(actor);game.actors=[actor];const expires=control.getFlag(ID,'madaraOngoing').expires;
 game.time.worldTime=expires;await run('updateWorldTime');assert.equal(actor.effects.get(control.id),undefined);game.time.worldTime=1000;game.actors=[];
});
