import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const ID='n5eb-classmod-library',hooks=new Map();
globalThis.Hooks={on:(key,fn)=>{const list=hooks.get(key)??[];list.push(fn);hooks.set(key,list);},once:(key,fn)=>{const list=hooks.get(key)??[];list.push(fn);hooks.set(key,list);}};
const get=(o,path)=>path.split('.').reduce((v,k)=>v?.[k],o);
const set=(o,path,value)=>{const parts=path.split('.'),last=parts.pop();let parent=o;for(const p of parts)parent=parent[p]??={};parent[last]=structuredClone(value);};
let enforcement=false,dialogResult='eye';
class ItemDocument{prepareDerivedData(){this.system.prerequisites={...this._source.system.prerequisites};}}
globalThis.CONFIG={Item:{documentClass:ItemDocument}};
globalThis.foundry={utils:{getProperty:get,deepClone:structuredClone,escapeHTML:String},applications:{api:{DialogV2:{wait:async()=>dialogResult}}}};
globalThis.game={user:{id:'player',isGM:false},system:{id:'n5eb'},settings:{get:(ns,key)=>key==='enforceMinimumLevels'?enforcement:false,register:()=>{}},packs:{get:()=>null}};
globalThis.ui={notifications:{warn:()=>{},error:()=>{},info:()=>{}}};
await import('../scripts/classmod-settings.js');await import('../scripts/main.js');
for(const fn of hooks.get('init')??[])await fn();for(const fn of hooks.get('ready')??[])await fn();
const run=(key,...args)=>{let result;for(const fn of hooks.get(key)??[]){const r=fn(...args);if(r===false)result=false;}return result;};
test('minimum switch allows early acquisition and increase, but restores requirements for existing Class Mods',()=>{
 const actor={documentName:'Actor',system:{details:{level:6}}},item={type:'classmod',system:{identifier:'madara-cells',levels:1},parent:actor};
 enforcement=false;assert.notEqual(run('preCreateItem',item,{}, {},'player'),false);assert.notEqual(run('preUpdateItem',item,{'system.levels':3},{},'player'),false);
 enforcement=true;assert.equal(run('preCreateItem',item,{}, {},'player'),false);assert.equal(run('preUpdateItem',item,{'system.levels':3},{},'player'),false);
 actor.system.details.level=12;assert.notEqual(run('preUpdateItem',item,{'system.levels':3},{},'player'),false);
});
test('prepared minimum-level overrides are reversible and preserve native features outside the module',()=>{
 const owned=new ItemDocument();owned.type='feat';owned.flags={[ID]:{managed:true}};owned._source={system:{prerequisites:{level:8}}};owned.system={};
 enforcement=false;owned.prepareDerivedData();assert.equal(owned.system.prerequisites.level,0);assert.equal(owned._source.system.prerequisites.level,8);
 enforcement=true;owned.prepareDerivedData();assert.equal(owned.system.prerequisites.level,8);
 const native=new ItemDocument();native.type='feat';native.flags={};native._source=owned._source;native.system={};enforcement=false;native.prepareDerivedData();assert.equal(native.system.prerequisites.level,8);
});
test('future Class Mod level metadata participates in central validation',()=>{
 enforcement=true;const item={type:'classmod',parent:{documentName:'Actor',system:{details:{level:5}}},flags:{[ID]:{minimumCharacterLevels:{2:9}}},system:{identifier:'future-classmod',levels:1}};
 assert.equal(run('preUpdateItem',item,{'system.levels':2},{},'player'),false);enforcement=false;assert.notEqual(run('preUpdateItem',item,{'system.levels':2},{},'player'),false);
});
function eyeActor(withEffects){
 const effects=withEffects?[{id:'effect',transfer:true,disabled:true,flags:{}}]:[];
 let useOptions;
 const eye={id:'eye',name:'Latent Sharingan II',type:'feat',flags:{[ID]:{karmicDojutsuFreeActivation:true}},effects,
  system:{consume:{type:'attribute',target:undefined,amount:5},activities:[{id:'activity',type:'utility',consumption:{targets:[{type:'attribute',target:undefined,value:'5'},{type:'itemUses',target:'eye',value:'1'}]},use:async options=>{useOptions=options;}}]},
  getFlag(ns,k){return this.flags?.[ns]?.[k];},toObject(){return {system:{consume:structuredClone(this.system.consume),activities:{activity:{consumption:structuredClone(this.system.activities[0].consumption)}}}};},
  async update(patch){for(const [path,value]of Object.entries(patch)){if(path.startsWith('system.activities.activity.'))set(this.system.activities[0],path.replace('system.activities.activity.',''),value);else set(this,path,value);}},
  async updateEmbeddedDocuments(kind,updates){for(const u of updates)Object.assign(effects.find(e=>e.id===u._id),u);}};
 const items=[eye];items.get=id=>items.find(i=>i.id===id);
 return {isOwner:true,items,sheet:{render:()=>{}},getFlag:()=>null,eye,getUse:()=>useOptions};
}
test('Karmic eye activation removes invalid attribute consumption and toggles existing native effects',async()=>{
 const actor=eyeActor(true);await N5eBClassMods.toggleKarmicDojutsu(actor);
 assert.equal(actor.eye.effects[0].disabled,false);assert.equal(actor.eye.system.consume.amount,0);assert.deepEqual(actor.eye.system.activities[0].consumption.targets,[{type:'itemUses',target:'eye',value:'1'}]);
 await N5eBClassMods.toggleKarmicDojutsu(actor);assert.equal(actor.eye.effects[0].disabled,true);
});
test('Karmic eye utility fallback preserves legitimate uses after removing invalid Chakra consumption',async()=>{
 const actor=eyeActor(false);await N5eBClassMods.toggleKarmicDojutsu(actor);assert.deepEqual(actor.getUse(),{consume:{resources:true}});
});
test('module packaging uses the new version and includes all runtime entry points',()=>{
 const module=JSON.parse(readFileSync(new URL('../module.json',import.meta.url)));assert.equal(module.version,'0.19.1');assert.ok(module.esmodules.includes('scripts/rasengan.js'));assert.equal(module.esmodules[0],'scripts/classmod-settings.js');
 const index=JSON.parse(readFileSync(new URL('../data/index.json',import.meta.url)));assert.equal(index.version,module.version);assert.ok(index.files.includes('rasengan.json'));
 for(const p of module.esmodules)assert.ok(readFileSync(new URL('../'+p,import.meta.url)).length);
});
