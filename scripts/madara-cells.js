import {createTrackerWindow, trackerTabs} from "./tracker-window.js";
import {castPayment, modifyTechniqueData} from "./madara-rules.js";
import {createTechniqueAutomation} from "./madara-techniques.js";
import { meetsMinimumLevel, enforceMinimumLevels } from "./classmod-settings.js";
const MODULE_ID = "n5eb-classmod-library";
const CLASSMOD_ID = "madara-cells";
const TRACKER_FLAG = "madaraCellsTracker";
const TRACKER_VERSION = 3;
const SHARINGAN_EFFECT_FLAG = "madaraCellsSharinganEffect";
const BASE_GRANT_FLAG = "madaraMasteredBase";
const casts = new Map();
const sourceCache = new Map();
const EFFECT_FLAG = "madaraCellsPassiveEffect";
const HATRED_EFFECT_FLAG = "madaraCellsHatredEffect";
const GRANT_FLAG = "madaraCellsGrantedFeature";
const CORE_GRANT_FLAG = "madaraCellsGrantedCore";
const LEGACY_ORIGINAL_FLAG = "madaraLegacyOriginal";
const INTERNAL = MODULE_ID;
const ICON = `modules/${MODULE_ID}/assets/madara-cells.png`;
const LEVEL_REQUIREMENTS = {1:8, 2:10, 3:12, 4:14, 5:16};
const SYNC_DCS = {2:{chakra:20,medicine:15}, 3:{chakra:25,medicine:20}, 4:{chakra:30,medicine:25}, 5:{chakra:35,medicine:30}};
const SHARINGAN_GRANTS = {
  base:{identifier:"sharingan", name:"Madara Cells — Sharingan (Level 11)", minLevel:1},
  tomoe1a:{identifier:"1-tomoe-sharingan", name:"Madara Cells — Additional 1 Tomoe Sharingan I", minLevel:2},
  tomoe2a:{identifier:"2-tomoe-sharingan", name:"Madara Cells — Additional 2 Tomoe Sharingan I", minLevel:2},
  tomoe1b:{identifier:"1-tomoe-sharingan", name:"Madara Cells — Additional 1 Tomoe Sharingan II", minLevel:4},
  tomoe2b:{identifier:"2-tomoe-sharingan", name:"Madara Cells — Additional 2 Tomoe Sharingan II", minLevel:4},
  tomoe3a:{identifier:"3-tomoe-sharingan", name:"Madara Cells — Additional 3 Tomoe Sharingan", minLevel:4}
};
const CORE_GRANTS = {
  "apex-sharingan":1,
  "madara-legacy-chakra":1,
  "mastered-defence":1,
  "madara-legacy-passives":1,
  "hatred-surge":1,
  "extraordinary-talent":2,
  "uchiha-technique-proficiency":2,
  "madara-partial-match":2,
  "indirect-reincarnation":4,
  "madara-perfect-match":5
};
const LEGACY_KIND_LABELS = {
  uchiha:"Uchiha Hijutsu (2 Chakra per Legacy)",
  fire:"Fire Release (no native affinity)",
  "fire-affinity":"Fire Release (native affinity)",
  hijutsu:"Hijutsu through Eugenics",
  physical:"Taijutsu/Bukijutsu through Fury of Indra"
};
const dialogs = new Map();
const queues = new Map();
const combatLastActor = new Map();
const techniqueAutomation=createTechniqueAutomation({refresh:actor=>{refreshDialog(actor);refreshStrip(actor);}});

function arr(value){ return value ? (Array.isArray(value) ? value : Array.from(value)) : []; }
function esc(value){ return foundry.utils.escapeHTML(String(value ?? "")); }
function clamp(value,min,max){ return Math.min(max,Math.max(min,Number(value)||0)); }
function flag(document,key){ return document?.getFlag?.(MODULE_ID,key) ?? document?.flags?.[MODULE_ID]?.[key]; }
function clone(value){ return foundry.utils.deepClone(value ?? {}); }
function actorKey(actor){ return actor?.uuid ?? actor?.id ?? null; }
function queue(actor,task){
  const key=actorKey(actor); if(!key) return Promise.resolve().then(task);
  const previous=queues.get(key)??Promise.resolve(), current=previous.catch(()=>{}).then(task);
  queues.set(key,current); return current.finally(()=>{if(queues.get(key)===current)queues.delete(key);});
}
function actorFromContext(value){
  if(!value) return globalThis.canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character ?? null;
  if(value.documentName==="Actor") return value;
  if(value.actor?.documentName==="Actor") return value.actor;
  if(value.document?.documentName==="Actor") return value.document;
  if(value.object?.documentName==="Actor") return value.object;
  if(value.token?.actor?.documentName==="Actor") return value.token.actor;
  return null;
}
function isMadaraClassMod(item){
  if(item?.type!=="classmod") return false;
  const identifier=String(item.system?.identifier??"").toLowerCase(), linked=String(flag(item,"classMod")??"").toLowerCase(), name=String(item.name??"").trim().toLowerCase();
  return identifier===CLASSMOD_ID||linked===CLASSMOD_ID||name==="madara cells"||name==="madara cells class mod";
}
function getClassMod(actor){ return arr(actor?.items).find(isMadaraClassMod)??null; }
function getLevel(actor){ return Math.max(0,Math.min(5,Number(getClassMod(actor)?.system?.levels??0))); }
function charLevel(actor){ return Math.max(0,Number(actor?.system?.details?.level??0)); }
function has(actor,identifier){ return arr(actor?.items).some(item=>item.system?.identifier===identifier); }
function prof(actor){ return Math.max(0,Number(actor?.system?.attributes?.prof??0)); }
function abilityMod(actor,key){ const ability=actor?.system?.abilities?.[key]??{}; return Number.isFinite(Number(ability.mod))?Number(ability.mod):Math.floor((Number(ability.value??10)-10)/2); }
function maxLegacy(actor){ return 20*getLevel(actor); }
function maxDefence(actor){ return Math.max(0,Math.floor(prof(actor)/2)+getLevel(actor)); }
function maxDefencePerRound(actor){ const level=getLevel(actor); return level>=5?3:level>=3?2:1; }
function currentTurnKey(combat=game.combat){ return combat?`${combat.id}:${combat.round??0}:${combat.turn??0}`:""; }
function getActivityItem(activity){ return activity?.item??activity?.parent?.item??null; }
function isJutsu(item){ return item?.type==="spell"&&Boolean(item.system?.jutsu); }

function defaultTracker(actor){
  return {version:TRACKER_VERSION,legacy:maxLegacy(actor),defence:maxDefence(actor),defenceRoundKey:"",defenceUsedRound:0,defenceTurnKey:"",hatred:false,hatredDc:16,lastTurnKey:"",lastHatredCheck:"",zeroHatredTurns:0,stabilized:false,lostToHatred:false,mutationSkills:{},sharinganActive:getLevel(actor)>=4,legacyJutsu:{},chakraSyncFailed:false,medicineFailures:0,cellsIncompatible:false,permanentHitDiceLost:0,lastSyncResult:"",sharinganExpires:0};
}
function normalizeTracker(actor,value={}){
  const base=defaultTracker(actor), source=value.legacyJutsu&&typeof value.legacyJutsu==="object"?value.legacyJutsu:{};
  const legacyJutsu=Object.fromEntries(Object.entries(source).filter(([,kind])=>Object.hasOwn(LEGACY_KIND_LABELS,kind)));
  return {...base,...value,version:TRACKER_VERSION,legacy:clamp(value.legacy??base.legacy,0,maxLegacy(actor)),defence:clamp(value.defence??base.defence,0,maxDefence(actor)),defenceRoundKey:String(value.defenceRoundKey??""),defenceUsedRound:Math.max(0,Math.floor(Number(value.defenceUsedRound??0))),defenceTurnKey:String(value.defenceTurnKey??""),hatred:Boolean(value.hatred)&&getLevel(actor)<5,hatredDc:Math.max(16,Number(value.hatredDc??16)),lastTurnKey:String(value.lastTurnKey??""),lastHatredCheck:String(value.lastHatredCheck??""),zeroHatredTurns:Math.max(0,Math.min(3,Math.floor(Number(value.zeroHatredTurns??0)))),stabilized:Boolean(value.stabilized),lostToHatred:Boolean(value.lostToHatred),mutationSkills:value.mutationSkills&&typeof value.mutationSkills==="object"?value.mutationSkills:{},sharinganActive:getLevel(actor)>=4||Boolean(value.sharinganActive),legacyJutsu,chakraSyncFailed:Boolean(value.chakraSyncFailed),medicineFailures:Math.max(0,Math.min(3,Math.floor(Number(value.medicineFailures??0)))),cellsIncompatible:Boolean(value.cellsIncompatible),permanentHitDiceLost:Math.max(0,Math.floor(Number(value.permanentHitDiceLost??0))),lastSyncResult:String(value.lastSyncResult??""),sharinganExpires:Number(value.sharinganExpires)||0};
}
function readTracker(actor){ return normalizeTracker(actor,actor?.getFlag?.(MODULE_ID,TRACKER_FLAG)??defaultTracker(actor)); }
async function writeTracker(actor,patch={},options={}){
  const {render=true,effects=true,syncJutsu=true}=options;
  if(!actor?.isOwner) return readTracker(actor);
  const next=normalizeTracker(actor,{...readTracker(actor),...patch}), raw=actor.getFlag?.(MODULE_ID,TRACKER_FLAG);
  if(!raw||JSON.stringify(raw)!==JSON.stringify(next)) await actor.update({[`flags.${MODULE_ID}.${TRACKER_FLAG}`]:next},{[INTERNAL]:{madara:true},render:false});
  if(effects) await refreshEffects(actor,next);
  if(syncJutsu) await syncLegacyJutsu(actor,next);
  if(render)refreshDialog(actor);refreshStrip(actor);return next;
}

function addChange(changes,key,value,mode=CONST.ACTIVE_EFFECT_MODES.ADD,priority=20){ if(value!==null&&value!==undefined&&value!=="")changes.push({key,mode,value:String(value),priority}); }
function skillAbility(skill){ return String(skill?.ability??skill?.abilityId??skill?.attribute??"").toLowerCase(); }
function passiveChanges(actor,state=readTracker(actor)){
  const level=getLevel(actor),changes=[]; if(!level)return changes;
  const dex=level>=5?4:2,intelligence=level>=5?4:level>=3?2:0;
  addChange(changes,"system.abilities.dex.value",dex); addChange(changes,"system.abilities.dex.max",dex);
  if(intelligence){addChange(changes,"system.abilities.int.value",intelligence);addChange(changes,"system.abilities.int.max",intelligence);}
  const movement=level>=4?30:level>=2?15:0; if(movement)addChange(changes,"system.attributes.movement.walk",movement);
  if(level>=4)for(const [key,skill] of Object.entries(actor?.system?.skills??{}))if(["dex","int","wis"].includes(skillAbility(skill)))addChange(changes,`system.skills.${key}.bonuses.check`,level);
  if(has(actor,"movement-mastery"))addChange(changes,"system.attributes.movement.walk",10*level);
  if(has(actor,"madara-mental-mastery"))for(const key of ["int","wis","cha"])addChange(changes,`system.abilities.${key}.bonuses.save`,level);
  if(has(actor,"madara-physical-mastery"))for(const key of ["str","dex","con"])addChange(changes,`system.abilities.${key}.bonuses.save`,level);
  if(state.permanentHitDiceLost)addChange(changes,"system.attributes.hd.max",-state.permanentHitDiceLost);
  if(state.sharinganActive&&has(actor,"occular-acuity")){
    addChange(changes,"system.attributes.senses.ranges.truesight",15,CONST.ACTIVE_EFFECT_MODES.UPGRADE,30);
    addChange(changes,"system.attributes.senses.ranges.darkvision",120,CONST.ACTIVE_EFFECT_MODES.UPGRADE,30);
    addChange(changes,"system.attributes.senses.ranges.chakrasight",120,CONST.ACTIVE_EFFECT_MODES.UPGRADE,30);
  }
  if(state.sharinganActive&&has(actor,"mastered-sharingan-agility")){
    const ac=15+Math.max(abilityMod(actor,"dex"),abilityMod(actor,"int"))+Math.floor(prof(actor)/2);
    addChange(changes,"system.attributes.ac.override",ac,CONST.ACTIVE_EFFECT_MODES.OVERRIDE,40);
    addChange(changes,"system.traits.dm.amount.ALL",-prof(actor),CONST.ACTIVE_EFFECT_MODES.ADD,30);
  }
  return changes;
}
async function refreshEffects(actor,state=readTracker(actor)){
  if(!actor?.isOwner)return;
  let passive=arr(actor?.effects).find(effect=>flag(effect,EFFECT_FLAG));
  if(!getClassMod(actor)){if(passive)await passive.delete({[INTERNAL]:{madara:true}});return;}
  const changes=passiveChanges(actor,state),data={name:"Madara Cells — Passive Adaptation",img:ICON,disabled:false,transfer:false,changes,statuses:[],flags:{[MODULE_ID]:{[EFFECT_FLAG]:true}}};
  if(!passive)await actor.createEmbeddedDocuments("ActiveEffect",[data],{[INTERNAL]:{madara:true}});else if(passive.img!==ICON||JSON.stringify(passive.changes??[])!==JSON.stringify(changes)||passive.disabled)await passive.update(data,{[INTERNAL]:{madara:true}});
  let hatred=arr(actor?.effects).find(effect=>flag(effect,HATRED_EFFECT_FLAG));
  if(state.hatred&&getLevel(actor)<5){const data={name:"Overcome with Hatred",img:ICON,disabled:false,transfer:false,changes:[],statuses:[],flags:{[MODULE_ID]:{[HATRED_EFFECT_FLAG]:true}}};if(!hatred)await actor.createEmbeddedDocuments("ActiveEffect",[data],{[INTERNAL]:{madara:true}});else if(hatred.disabled||hatred.img!==ICON)await hatred.update(data,{[INTERNAL]:{madara:true}});}else if(hatred)await hatred.delete({[INTERNAL]:{madara:true}});
  await syncSharinganEffect(actor,state);
}

async function syncSharinganEffect(actor,state=readTracker(actor)){
  const managed=arr(actor.effects).filter(effect=>flag(effect,SHARINGAN_EFFECT_FLAG));
  if(!state.sharinganActive||!getClassMod(actor)){
    if(managed.length)await actor.deleteEmbeddedDocuments('ActiveEffect',managed.map(effect=>effect.id),{[INTERNAL]:{madaraSharingan:true}});return;
  }
  const base=arr(actor.items).find(item=>flag(item,GRANT_FLAG)==='base'||item.system?.identifier==='sharingan');
  const source=arr(base?.effects).find(effect=>/^sharingan$/i.test(effect.name??''));
  const data=source?.toObject?.()??{name:'Sharingan',img:ICON,changes:[],statuses:[]};delete data._id;
  data.name='Sharingan';data.disabled=false;data.transfer=false;data.origin=base?.uuid??actor.uuid;
  data.changes=(data.changes??[]).filter(change=>String(change.value??'').trim()!=='');
  data.flags??={};data.flags[MODULE_ID]={...data.flags[MODULE_ID],[SHARINGAN_EFFECT_FLAG]:true};
  data.duration=getLevel(actor)>=4?{seconds:null,rounds:null,turns:null,startTime:null,startRound:null,startTurn:null}:{seconds:600,startTime:(state.sharinganExpires||game.time.worldTime+600)-600,rounds:null,turns:null,startRound:null,startTurn:null};
  if(!managed.length)await actor.createEmbeddedDocuments('ActiveEffect',[data],{[INTERNAL]:{madaraSharingan:true}});
  else{
    const effect=managed[0];if(effect.disabled||JSON.stringify(effect.changes??[])!==JSON.stringify(data.changes)||Number(effect.duration?.seconds??0)!==Number(data.duration.seconds??0))await effect.update(data,{[INTERNAL]:{madaraSharingan:true}});
    if(managed.length>1)await actor.deleteEmbeddedDocuments('ActiveEffect',managed.slice(1).map(effect=>effect.id),{[INTERNAL]:{madaraSharingan:true}});
  }
}
async function toggleSharingan(actor){
  if(!actor?.isOwner||!getClassMod(actor))return;
  const state=readTracker(actor);if(getLevel(actor)>=4)return writeTracker(actor,{sharinganActive:true,sharinganExpires:0});
  if(!state.sharinganActive){
    const base=arr(actor.items).find(item=>flag(item,GRANT_FLAG)==='base'||item.system?.identifier==='sharingan');
    if(base&&usesPool(base).max>0){
      if(usesPool(base).remaining<1)throw new Error('No Sharingan uses remain. Restore a use first.');
      await changeUses(base,-1);
    }
  }
  return writeTracker(actor,{sharinganActive:!state.sharinganActive,sharinganExpires:state.sharinganActive?0:game.time.worldTime+600});
}
async function sourceByIdentifier(packName,identifier){
  const key=`${packName}:${identifier}`;if(sourceCache.has(key))return sourceCache.get(key);
  const pack=game.packs.get(packName);if(!pack)return null;
  const index=await pack.getIndex({fields:["system.identifier"]}),entry=index.find(item=>item.system?.identifier===identifier);
  if(!entry)return null;const source=await pack.getDocument(entry._id);if(source)sourceCache.set(key,source);return source;
}
async function systemItemByIdentifier(identifier){return sourceByIdentifier("n5eb.clan",identifier);}
async function classModItemByIdentifier(identifier){return sourceByIdentifier("world.n5eb-custom-class-mods",identifier);}
async function syncCoreGrants(actor){
  const level=getLevel(actor),managed=arr(actor.items).filter(item=>flag(item,CORE_GRANT_FLAG));
  for(const item of managed)if(level<(CORE_GRANTS[item.system?.identifier]??99))await item.delete({[INTERNAL]:{madaraCoreGrant:true}});
  for(const [identifier,minimum] of Object.entries(CORE_GRANTS)){
    if(level<minimum||arr(actor.items).some(item=>item.system?.identifier===identifier))continue;
    const source=await classModItemByIdentifier(identifier);if(!source){console.warn(`${MODULE_ID} | Missing ${identifier} in world.n5eb-custom-class-mods`);continue;}
    const data=source.toObject();delete data._id;delete data.folder;data.flags=foundry.utils.mergeObject(data.flags??{},{[MODULE_ID]:{[CORE_GRANT_FLAG]:true}},{inplace:false});
    await actor.createEmbeddedDocuments("Item",[data],{[INTERNAL]:{madaraCoreGrant:true}});
  }
}
async function syncSharinganGrants(actor){
  const level=getLevel(actor),managed=arr(actor.items).filter(item=>flag(item,GRANT_FLAG)),desired=new Map(Object.entries(SHARINGAN_GRANTS).filter(([,grant])=>level>=grant.minLevel));
  for(const item of managed)if(!desired.has(String(flag(item,GRANT_FLAG))))await item.delete({[INTERNAL]:{madaraGrant:true}});
  for(const [key,grant] of desired){
    if(managed.some(item=>flag(item,GRANT_FLAG)===key))continue;
    if(key==="base"&&arr(actor.items).some(item=>!flag(item,GRANT_FLAG)&&item.system?.identifier==="sharingan"))continue;
    const source=await systemItemByIdentifier(grant.identifier);if(!source){console.warn(`${MODULE_ID} | Missing ${grant.identifier} in n5eb.clan`);continue;}
    const data=source.toObject();delete data._id;delete data.folder;data.name=grant.name;
    data.flags=foundry.utils.mergeObject(data.flags??{},{[MODULE_ID]:{[GRANT_FLAG]:key,madaraSourceIdentifier:grant.identifier}},{inplace:false});
    if(key==="base"){data.system.uses??={};data.system.uses.max=5;data.system.uses.value=5;data.system.uses.per="sr";for(const effect of data.effects??[])effect.disabled=true;}
    await actor.createEmbeddedDocuments("Item",[data],{[INTERNAL]:{madaraGrant:true}});
  }
}

function legacyOriginal(item){ return flag(item,LEGACY_ORIGINAL_FLAG); }
function rawJutsuCost(item){const original=legacyOriginal(item)?.chakra??item?.system?.chakra??{},value=Number(original.cost??item?.system?.consume?.amount??0);return Math.max(0,Number.isFinite(value)?value:0);}
async function syncLegacyJutsu(actor){
  // Repair the old permanent zero-cost override. Chakra choice now belongs to a single cast.
  const updates=arr(actor.items).filter(item=>legacyOriginal(item)).map(item=>({_id:item.id,"system.chakra":clone(legacyOriginal(item).chakra),[`flags.${MODULE_ID}.-=${LEGACY_ORIGINAL_FLAG}`]:null}));
  if(updates.length)await actor.updateEmbeddedDocuments("Item",updates,{[INTERNAL]:{madaraLegacyRestore:true}});
}
async function restoreLegacyJutsu(actor){return syncLegacyJutsu(actor);}
function masteredEntries(actor){
  const entries=new Map();
  for(const feature of arr(actor.items).filter(item=>flag(item,"madaraMasteredTechnique"))){
    const identifier=flag(feature,"baseJutsuIdentifier")??feature.system?.identifier;
    if(identifier)entries.set(identifier,{feature,identifier,item:arr(actor.items).find(item=>isJutsu(item)&&item.system?.identifier===identifier)});
  }
  return [...entries.values()];
}
async function syncMasteredJutsu(actor){
  const entries=masteredEntries(actor),desired=new Set(entries.map(entry=>entry.identifier));
  const stale=arr(actor.items).filter(item=>flag(item,BASE_GRANT_FLAG)&&!desired.has(flag(item,BASE_GRANT_FLAG)));
  if(stale.length)await actor.deleteEmbeddedDocuments('Item',stale.map(item=>item.id),{[INTERNAL]:{madaraMasteredGrant:true}});
  for(const entry of entries){
    if(entry.item)continue;
    const source=await systemItemByIdentifier(entry.identifier);if(!source){console.warn(`${MODULE_ID} | Missing Mastered base Jutsu: ${entry.identifier}`);continue;}
    const data=source.toObject();delete data._id;delete data.folder;data.system.jutsu??={};data.system.jutsu.countsKnown=false;
    data.flags??={};data.flags[MODULE_ID]={...data.flags[MODULE_ID],[BASE_GRANT_FLAG]:entry.identifier};
    await actor.createEmbeddedDocuments("Item",[data],{[INTERNAL]:{madaraMasteredGrant:true}});
  }
}
function legacyKind(actor,item){
  const configured=readTracker(actor).legacyJutsu[item.id];if(configured)return configured;
  const keywords=arr(item.system?.jutsu?.keywords);
  if(flag(item,BASE_GRANT_FLAG)||masteredEntries(actor).some(entry=>entry.identifier===item.system?.identifier)||/uchiha|genjutsu-(sharingan|deflect|red-star|ephemera)/i.test(item.system?.identifier??""))return "uchiha";
  if(keywords.includes("fire"))return "fire";
  return null;
}
async function castTechnique(actor,reference,{mastered=true,source}={}){
  if(!actor?.isOwner||!getClassMod(actor))throw new Error("Select a Madara Cells character you own.");
  const entry=masteredEntries(actor).find(entry=>entry.feature.id===reference||entry.identifier===reference);
  if(mastered&&!entry)throw new Error("This Mastered Technique is not owned.");
  await queue(actor,()=>syncMasteredJutsu(actor));
  const base=entry?arr(actor.items).find(item=>isJutsu(item)&&item.system?.identifier===entry.identifier):actor.items.get(reference);
  if(!base||!isJutsu(base))throw new Error("The native Jutsu was not found. Check the N5eB clan compendium.");
  const kind=legacyKind(actor,base);if(!kind)throw new Error("Configure this Jutsu's Legacy rule first.");
  if(!source){
    const result=await foundry.applications.api.DialogV2.wait({window:{title:`Cast ${entry?.feature.name??base.name}`},content:`<p>Choose the Chakra pool for this cast.${mastered?getLevel(actor)>=5?" Mastered activation: 2 LC, or 6 normal Chakra with Perfect Match.":" Mastered activation additionally costs 2 Legacy Chakra.":""}</p><label>Chakra pool<select name="source"><option value="legacy">Legacy Chakra</option><option value="normal">Normal Chakra</option></select></label>`,buttons:[{action:"cast",label:"Continue to native cast",default:true,callback:(event,button)=>new FormDataExtended(button.form).object.source},{action:"cancel",label:"Cancel"}],rejectClose:false});
    if(!['legacy','normal'].includes(result))return;source=result;
  }
  let noCover=false;
  if(mastered&&entry.identifier==='uchiha-ember-bullet'){
    const result=await foundry.applications.api.DialogV2.wait({window:{title:'Ember Bullet — target cover'},content:'<p>Does the target have cover?</p>',buttons:[{action:'clear',label:'No cover · advantage'},{action:'cover',label:'Has cover'},{action:'cancel',label:'Cancel'}],rejectClose:false});
    if(!['clear','cover'].includes(result))return;noCover=result==='clear';
  }
  return queue(actor,async()=>{
    // Native refund deltas need an existing numeric Legacy balance as their baseline.
    if(!actor.getFlag?.(MODULE_ID,TRACKER_FLAG))await writeTracker(actor,{}, {render:false,effects:false,syncJutsu:false});
    const id=foundry.utils.randomID(),values={attack:2*prof(actor)+getLevel(actor),dc:12+getLevel(actor)+prof(actor)},identifier=mastered?entry.identifier:"";
    let data=modifyTechniqueData(base.toObject(),{...values,mastered:identifier,apex:kind==='uchiha'||['fire','fire-affinity'].includes(kind),extraRange:readTracker(actor).sharinganActive&&has(actor,"occular-acuity"),searing:has(actor,"searing-flames"),level:getLevel(actor),casterUuid:actor.uuid,castId:id,sourceUuid:base.uuid});
    data.flags??={};data.flags[MODULE_ID]={...data.flags[MODULE_ID],madaraCastId:id,madaraCast:{source,mastered,identifier,noCover,attack:values.attack,dc:values.dc,casterUuid:actor.uuid,castId:id}};
    if(mastered){data.name=entry.feature.name;data.system.description.value=`${entry.feature.system?.description?.value??''}<hr>${data.system.description.value??''}`;}
    // A cast-local native Item clone keeps the live Actor parent and owned Item ID.
    const item=base.clone(data,{keepId:true,parent:actor});
    const activities=arr(item.system.activities).filter(activity=>typeof activity.use==='function');
    let activity=activities[0];if(!activity)throw new Error("This Jutsu has no native casting Activity.");
    if(activities.length>1){
      const selected=await foundry.applications.api.DialogV2.wait({window:{title:"Choose casting Activity"},content:`<label>Activity<select name="activity">${activities.map(a=>`<option value="${esc(a.id)}">${esc(a.name||a.type)}</option>`).join('')}</select></label>`,buttons:[{action:"use",label:"Cast",callback:(event,button)=>new FormDataExtended(button.form).object.activity},{action:"cancel",label:"Cancel"}],rejectClose:false});
      activity=activities.find(a=>a.id===selected);if(!activity)return;
    }
    const rank=base.system.effectiveRank??base.system.rank;
    const bonusRank=identifier==='uchiha-great-assault'?base.system.rankForDelta?.(1):null;
    const usage={consume:{chakra:false},jutsu:{rank:bonusRank??rank},[MODULE_ID]:{madaraCastId:id}};
    casts.set(id,{actor,base,item,kind,source,mastered,identifier,consumed:false});
    try{
      const result=await activity.use(usage,{configure:true},{data:{flags:{[MODULE_ID]:{madaraCast:{source,mastered,identifier,attack:values.attack,dc:values.dc}}}}});
      refreshDialog(actor);return result;
    }finally{casts.delete(id);}
  });
}
function castSession(activity,config){const id=config?.[MODULE_ID]?.madaraCastId??flag(getActivityItem(activity),"madaraCastId");return id?casts.get(id):null;}
function prepareCastConsumption(activity,config,message){
  const session=castSession(activity,config);if(!session){
    if(flag(getActivityItem(activity),'madaraCast')){ui.notifications.warn('Cast again from the Madara tracker after refunding a cast.');return false;}return;
  }
  if(session.consumed){ui.notifications.warn("This cast has already consumed its Chakra.");return false;}
  if(!config.consume||typeof config.consume!=='object')config.consume={};config.consume.chakra=false;
}
function consumeCast(activity,config,message,updates){
  const session=castSession(activity,config);if(!session)return;
  if(session.consumed)return false;
  try{
    const {actor,base,kind,source,mastered}=session,state=readTracker(actor),rank=config.jutsu?.rank??base.system.effectiveRank??base.system.rank;
    let cost=typeof base.system.getChakraCost==='function'?base.system.getChakraCost({rank}):rawJutsuCost(base);
    if(mastered&&!flag(base,BASE_GRANT_FLAG))cost=Math.max(1,cost-getLevel(actor));
    if(kind==='fire'&&getLevel(actor)<2)cost+=3;
    const chakra=actor.system.attributes.chakra,payment=castPayment({level:getLevel(actor),cost,kind,source,mastered,legacy:state.legacy,chakra:Number(chakra.value??0),temporary:Number(chakra.temp??0)});
    updates.actor??={};
    if(payment.normalCost)Object.assign(updates.actor,actor.getChakraSpendUpdates?.(payment.normalCost,updates.actor)??{"system.attributes.chakra.temp":Math.max(0,Number(chakra.temp??0)-payment.normalCost),"system.attributes.chakra.value":Math.max(0,Number(chakra.value??0)-Math.max(0,payment.normalCost-Number(chakra.temp??0)))});
    if(payment.legacySpent)updates.actor[`flags.${MODULE_ID}.${TRACKER_FLAG}.legacy`]=state.legacy-payment.legacySpent;
    config.chakra??={};config.chakra.cost=payment.normalCost;
    if(session.identifier==='uchiha-flame-flower')config.chakra.maintain=0;
    message.data??={};message.data.system??={};message.data.system.chakraCost=payment.normalCost;
    if(session.identifier==='uchiha-flame-flower')message.data.system.maintainCost=0;
    message.data.flags??={};message.data.flags[MODULE_ID]??={};message.data.flags[MODULE_ID].madaraPayment={...payment,source,mastered};
    session.payment=payment;return true;
  }catch(error){ui.notifications.warn(error.message);return false;}
}
function snapshotCast(activity,message){
  const item=getActivityItem(activity),cast=flag(item,'madaraCast');if(!cast)return;
  message.data??={};message.data.flags??={};const native=message.data.flags.n5eb??={};
  // N5eB resolves UUIDs before stored data. Clear both UUIDs to resolve the cast-local snapshot.
  native.item={...native.item,id:item.id,type:item.type,uuid:null,data:item.toObject()};
  native.activity={...native.activity,id:activity.id,type:activity.type,uuid:null};
  const own=message.data.flags[MODULE_ID]??={};own.madaraCast={...cast,baseUuid:item.uuid};
  const payment=own.madaraPayment;
  if(payment)message.data.content=(message.data.content??'')+`<p class="madara-payment"><strong>Madara Cells:</strong> ${payment.legacySpent} Legacy Chakra · ${payment.normalCost} normal Chakra.</p>`;
}
async function configureLegacyJutsu(actor){
  const state=readTracker(actor),jutsu=arr(actor.items).filter(isJutsu).sort((a,b)=>a.name.localeCompare(b.name));if(!jutsu.length)return ui.notifications.warn("No owned Jutsu were found.");
  const result=await foundry.applications.api.DialogV2.wait({window:{title:"Madara Cells — Configure Legacy Casting"},content:`<p>Choose which Legacy rule applies. The Chakra pool is selected for each tracker cast.</p><div class="form-group"><label>Jutsu<select name="item">${jutsu.map(item=>`<option value="${esc(item.id)}">${esc(item.name)}${state.legacyJutsu[item.id]?` — ${esc(LEGACY_KIND_LABELS[state.legacyJutsu[item.id]])}`:""}</option>`).join("")}</select></label></div><div class="form-group"><label>Legacy rule<select name="kind"><option value="remove">Use normal Chakra / remove</option>${Object.entries(LEGACY_KIND_LABELS).map(([key,label])=>`<option value="${key}">${esc(label)}</option>`).join("")}</select></label></div>`,buttons:[{action:"save",label:"Apply",default:true,callback:(event,button)=>new FormDataExtended(button.form).object},{action:"cancel",label:"Cancel"}],rejectClose:false});
  if(!result||result==="cancel")return;const itemId=String(result.item??""),kind=String(result.kind??"remove");if(!actor.items.get(itemId))return;const next={...state.legacyJutsu};if(kind==="remove")delete next[itemId];else if(Object.hasOwn(LEGACY_KIND_LABELS,kind))next[itemId]=kind;await writeTracker(actor,{legacyJutsu:next});
}

async function cleanupActor(actor){
  const state=readTracker(actor),updates={};for(const data of Object.values(state.mutationSkills??{})){const path=data.kind==="tool"?`system.tools.${data.key}.value`:`system.skills.${data.key}.value`,current=Number(foundry.utils.getProperty(actor,path)??0);if(current===Number(data.applied))updates[path]=Number(data.original??0);}if(Object.keys(updates).length)await actor.update(updates,{[INTERNAL]:{madara:true}});
  for(const effect of arr(actor.effects))if(flag(effect,"madaraOngoing"))await techniqueAutomation.endTechnique(actor,effect.id);
  await restoreLegacyJutsu(actor);const effects=arr(actor.effects).filter(effect=>flag(effect,EFFECT_FLAG)||flag(effect,HATRED_EFFECT_FLAG)||flag(effect,SHARINGAN_EFFECT_FLAG));if(effects.length)await actor.deleteEmbeddedDocuments("ActiveEffect",effects.map(effect=>effect.id),{[INTERNAL]:{madara:true}});const grants=arr(actor.items).filter(item=>flag(item,GRANT_FLAG)||flag(item,CORE_GRANT_FLAG)||flag(item,BASE_GRANT_FLAG));if(grants.length)await actor.deleteEmbeddedDocuments("Item",grants.map(item=>item.id),{[INTERNAL]:{madara:true}});await actor.unsetFlag(MODULE_ID,TRACKER_FLAG);
}
async function ensureActor(actor){
  if(!getClassMod(actor)||!actor.isOwner)return;const raw=actor.getFlag?.(MODULE_ID,TRACKER_FLAG),state=normalizeTracker(actor,raw??defaultTracker(actor));if(state.sharinganActive&&getLevel(actor)<4){if(!state.sharinganExpires)state.sharinganExpires=game.time.worldTime+600;else if(state.sharinganExpires<=game.time.worldTime){state.sharinganActive=false;state.sharinganExpires=0;}}if(!raw||JSON.stringify(raw)!==JSON.stringify(state))await actor.update({[`flags.${MODULE_ID}.${TRACKER_FLAG}`]:state},{[INTERNAL]:{madara:true},render:false});
  await syncCoreGrants(actor);await syncSharinganGrants(actor);await syncMasteredJutsu(actor);await refreshEffects(actor,state);await syncLegacyJutsu(actor,state);if(getLevel(actor)>=5&&state.hatred)await writeTracker(actor,{hatred:false,hatredDc:16,zeroHatredTurns:0},{render:false});await ensureMutationChoices(actor);
}

async function roll(actor,formula,label){const result=await new Roll(formula).evaluate();await result.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:`${actor.name} — ${label}`});return Number(result.total??0);}
async function spendLegacy(actor,amount,reason="Legacy Chakra"){
  amount=Math.max(0,Math.floor(Number(amount)||0));if(!amount)return true;const state=readTracker(actor),fromLegacy=Math.min(state.legacy,amount),missing=amount-fromLegacy;let chakraCost=0;
  if(missing){if(getLevel(actor)<5){ui.notifications.warn(`Not enough Legacy Chakra (${state.legacy}/${amount}).`);return false;}chakraCost=missing*3;const chakra=Number(actor.system?.attributes?.chakra?.value??0);if(chakra<chakraCost){ui.notifications.warn(`Perfect Match needs ${chakraCost} regular Chakra for the missing ${missing} Legacy Chakra.`);return false;}await actor.update({"system.attributes.chakra.value":chakra-chakraCost},{[INTERNAL]:{madara:true}});}
  await writeTracker(actor,{legacy:state.legacy-fromLegacy},{render:false,effects:false,syncJutsu:false});ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)} — ${esc(reason)}:</strong> spent ${amount} Legacy Chakra${chakraCost?` (${chakraCost} regular Chakra through Perfect Match)`:""}.</p>`});refreshDialog(actor);return true;
}
async function changeLegacy(actor,delta){const state=readTracker(actor);await writeTracker(actor,{legacy:state.legacy+Number(delta||0)});}
async function spendDefence(actor){
  const state=readTracker(actor);if(state.defence<=0)return ui.notifications.warn("No Mastered Defence reactions remain.");const combat=game.combat,roundKey=combat?`${combat.id}:${combat.round??0}`:"",turnKey=currentTurnKey(combat),used=state.defenceRoundKey===roundKey?state.defenceUsedRound:0;
  if(roundKey&&used>=maxDefencePerRound(actor))return ui.notifications.warn(`Mastered Defence is limited to ${maxDefencePerRound(actor)} additional reaction(s) per round.`);if(turnKey&&state.defenceTurnKey===turnKey)return ui.notifications.warn("Mastered Defence can only be used once per turn.");
  await writeTracker(actor,{defence:state.defence-1,defenceRoundKey:roundKey,defenceUsedRound:used+1,defenceTurnKey:turnKey});ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)}:</strong> spends 1 Mastered Defence reaction (${state.defence-1}/${maxDefence(actor)} remaining).</p>`});
}
async function refillDefence(actor){if(readTracker(actor).defence>=maxDefence(actor))return ui.notifications.warn("Mastered Defence is already full.");if(!await spendLegacy(actor,10,"Mastered Defence Refill"))return;await writeTracker(actor,{defence:maxDefence(actor)});}
async function activateMastered(actor){
  const entries=masteredEntries(actor);if(!entries.length)return ui.notifications.warn("No Mastered Uchiha Technique is owned.");
  const id=await foundry.applications.api.DialogV2.wait({window:{title:"Mastered Uchiha Technique"},content:`<label>Technique<select name="art">${entries.map(entry=>`<option value="${esc(entry.feature.id)}">${esc(entry.feature.name)}</option>`).join('')}</select></label>`,buttons:[{action:"cast",label:"Choose Chakra and cast",callback:(event,button)=>new FormDataExtended(button.form).object.art},{action:"cancel",label:"Cancel"}],rejectClose:false});
  if(typeof id==='string'&&id!=='cancel')return castTechnique(actor,id);
}
function usesPool(item){
  const uses=item.system?.uses??{},max=Math.max(0,Number(uses.max)||0);
  return {max,remaining:Math.max(0,Math.min(max,uses.spent!==undefined?max-Number(uses.spent||0):Number(uses.value||0)))};
}
async function changeUses(item,delta){
  const {max,remaining}=usesPool(item),next=clamp(remaining+delta,0,max);
  await item.update(item.system.uses.spent!==undefined?{'system.uses.spent':max-next}:{'system.uses.value':next},{[INTERNAL]:{madara:true}});
}
async function replenishSharingan(actor){
  const candidates=arr(actor.items).filter(item=>/sharingan/i.test(`${item.name??""} ${item.system?.identifier??""}`)&&usesPool(item).max>0);if(!candidates.length)return ui.notifications.warn("No Sharingan feature with a uses pool was found.");const id=await foundry.applications.api.DialogV2.wait({window:{title:"Replenish Sharingan Use"},content:`<div class="form-group"><label>Sharingan Feature<select name="item">${candidates.map(item=>`<option value="${esc(item.id)}">${esc(item.name)} (${usesPool(item).remaining}/${usesPool(item).max})</option>`).join("")}</select></label></div>`,buttons:[{action:"restore",label:"Spend 1 Legacy Chakra",default:true,callback:(event,button)=>new FormDataExtended(button.form).object.item},{action:"cancel",label:"Cancel"}],rejectClose:false});if(!id||id==="cancel")return;const item=actor.items.get(id);if(!item)return;const {remaining,max}=usesPool(item);if(remaining>=max)return ui.notifications.info("Sharingan uses are already full.");if(!await spendLegacy(actor,1,"Sharingan Use"))return;await changeUses(item,1);
}
async function convertMangekyo(actor){
  if(getLevel(actor)<5)return ui.notifications.warn("Perfect Match is required.");const candidates=arr(actor.items).filter(item=>/mangek/i.test(`${item.name??""} ${item.system?.identifier??""}`)&&usesPool(item).max>0);if(!candidates.length)return ui.notifications.warn("No Mangekyō item with a uses pool was found.");const result=await foundry.applications.api.DialogV2.wait({window:{title:"Mangekyō Synergy"},content:`<div class="form-group"><label>Mangekyō Feature<select name="item">${candidates.map(item=>`<option value="${esc(item.id)}">${esc(item.name)}</option>`).join("")}</select></label></div><div class="form-group"><label>Charges<input name="count" type="number" min="1" value="1"></label></div>`,buttons:[{action:"convert",label:"Convert Legacy Chakra",default:true,callback:(event,button)=>new FormDataExtended(button.form).object},{action:"cancel",label:"Cancel"}],rejectClose:false});if(!result||result==="cancel")return;const item=actor.items.get(result.item);if(!item)return;const pool=usesPool(item),count=Math.min(pool.max-pool.remaining,Math.max(1,Math.floor(Number(result.count)||1)));if(count<=0)return ui.notifications.info('Mangekyō charges are already full.');if(!await spendLegacy(actor,10*count,"Mangekyō Art Charges"))return;await changeUses(item,count);
}

function requiredMutationCount(actor){const level=getLevel(actor);return level<2?0:level-1;}
async function ensureMutationChoices(actor){const need=requiredMutationCount(actor),have=Object.keys(readTracker(actor).mutationSkills??{}).length;if(need>have&&actor.isOwner)ui.notifications.info(`${actor.name} can choose ${need-have} Madara Cells mutation proficiency${need-have===1?"":"ies"} from the tracker.`);}
async function chooseMutation(actor){
  const state=readTracker(actor),chosen=state.mutationSkills??{},need=requiredMutationCount(actor);if(Object.keys(chosen).length>=need)return ui.notifications.info("All current Extraordinary Talent choices are assigned.");const options=[];
  for(const [key,value] of Object.entries(actor.system?.skills??{}))if(!chosen[`skill:${key}`])options.push({id:`skill:${key}`,label:value.label??CONFIG.DND5E?.skills?.[key]?.label??key,value:Number(value.value??0),kind:"skill",key});for(const [key,value] of Object.entries(actor.system?.tools??{}))if(!chosen[`tool:${key}`])options.push({id:`tool:${key}`,label:value.label??key,value:Number(value.value??0),kind:"tool",key});if(!options.length)return ui.notifications.warn("No eligible skill/tool entries were found.");options.sort((a,b)=>String(a.label).localeCompare(String(b.label)));
  const id=await foundry.applications.api.DialogV2.wait({window:{title:"Extraordinary Talent"},content:`<div class="form-group"><label>Skill or Tool<select name="choice">${options.map(option=>`<option value="${esc(option.id)}">${esc(option.label)} — ${option.value>0?"increase Mastery":"gain Proficiency"}</option>`).join("")}</select></label></div>`,buttons:[{action:"apply",label:"Apply",default:true,callback:(event,button)=>new FormDataExtended(button.form).object.choice},{action:"cancel",label:"Cancel"}],rejectClose:false});const option=options.find(entry=>entry.id===id);if(!option)return;const path=option.kind==="tool"?`system.tools.${option.key}.value`:`system.skills.${option.key}.value`,original=Number(foundry.utils.getProperty(actor,path)??0),applied=original>0?original+1:1;await actor.update({[path]:applied},{[INTERNAL]:{madara:true}});await writeTracker(actor,{mutationSkills:{...chosen,[id]:{kind:option.kind,key:option.key,original,applied}}});
}

function skillTotal(actor,key,ability){const skill=actor.system?.skills?.[key]??{};if(Number.isFinite(Number(skill.total)))return Number(skill.total);return abilityMod(actor,ability)+Math.floor(prof(actor)*Number(skill.value??0))+Number(skill.bonus??0);}
async function attemptSynchronization(actor,method){
  const classMod=getClassMod(actor),level=getLevel(actor),next=level+1,state=readTracker(actor),dcs=SYNC_DCS[next];if(!classMod||!dcs)return ui.notifications.info("Madara Cells are already at maximum level.");if(state.cellsIncompatible)return ui.notifications.warn("The cells are recorded as incompatible after three failed Medicine attempts. A GM can reset this.");if(!meetsMinimumLevel(actor,LEVEL_REQUIREMENTS[next]))return ui.notifications.warn(`Madara Cells level ${next} requires character level ${LEVEL_REQUIREMENTS[next]}+.`);if(method==="medicine"&&!state.chakraSyncFailed)return ui.notifications.warn("The Medicine fallback unlocks after the Chakra Control attempt fails.");if(method==="chakra"&&state.chakraSyncFailed)return ui.notifications.warn("Use the Medicine fallback or have a GM reset the attempt.");
  const skill=method==="medicine"?"med":"ccl",ability=method==="medicine"?"wis":"con",dc=dcs[method],bonus=skillTotal(actor,skill,ability),total=await roll(actor,`1d20${bonus>=0?"+":""}${bonus}`,`Madara Cells Synchronization — ${method==="medicine"?"Medicine":"Chakra Control"} DC ${dc}`);
  if(total>=dc){const patch={chakraSyncFailed:false,medicineFailures:0,lastSyncResult:`${method==="medicine"?"Medicine":"Chakra Control"} ${total} vs DC ${dc} — success; level ${next} unlocked`};if(method==="medicine")patch.permanentHitDiceLost=state.permanentHitDiceLost+next;await writeTracker(actor,patch,{render:false});await classMod.update({"system.levels":next},{[INTERNAL]:{madaraProgression:true}});await ensureActor(actor);actor.sheet?.render?.(false);refreshDialog(actor);ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)} — Madara Cells:</strong> synchronization succeeded. Class Mod level ${next} unlocked.${method==="medicine"?` Permanent Hit Dice loss tracked: ${patch.permanentHitDiceLost}.`:""}</p>`});return;}
  if(method==="chakra")await writeTracker(actor,{chakraSyncFailed:true,lastSyncResult:`Chakra Control ${total} vs DC ${dc} — failure; Medicine fallback unlocked`});else{const failures=state.medicineFailures+1;await writeTracker(actor,{medicineFailures:failures,cellsIncompatible:failures>=3,lastSyncResult:`Medicine ${total} vs DC ${dc} — failure (${failures}/3)`});}
}

async function hatredCheck(actor,{escape=false}={}){if(getLevel(actor)>=5)return true;const state=readTracker(actor),advantage=has(actor,"madara-partial-match"),formula=`${advantage?"2d20kh":"1d20"}${abilityMod(actor,"con")>=0?"+":""}${abilityMod(actor,"con")}`,total=await roll(actor,formula,escape?"Overcome with Hatred — Control Check":"Madara Cells — Hatred Surge"),success=total>=state.hatredDc;if(success)await writeTracker(actor,{hatred:escape?false:state.hatred,hatredDc:escape?16:state.hatredDc+1,lastHatredCheck:`${total} vs DC ${state.hatredDc} — success`,zeroHatredTurns:escape?0:state.zeroHatredTurns},{render:false});else{await writeTracker(actor,{hatred:true,lastHatredCheck:`${total} vs DC ${state.hatredDc} — failure`},{render:false});ui.notifications.warn(`${actor.name} is Overcome with Hatred.`);}refreshDialog(actor);return success;}
async function hatredAttackReminder(actor){ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)} is Overcome with Hatred.</strong> The GM secretly determines a random nearby target; the character attacks that target as aggressively as possible this turn.</p>`});}
async function processTurnStart(actor,combat){
  const level=getLevel(actor),key=currentTurnKey(combat),state=readTracker(actor);if(!level||!key||state.lastTurnKey===key)return;await writeTracker(actor,{lastTurnKey:key},{render:false,effects:false,syncJutsu:false});if(level>=5){if(state.hatred)await writeTracker(actor,{hatred:false,hatredDc:16,zeroHatredTurns:0},{render:false});return;}
  const hp=actor.system?.attributes?.hp??{},value=Number(hp.value??0),maximum=Math.max(1,Number(hp.max??1)),current=readTracker(actor);if(current.hatred){await hatredAttackReminder(actor);if(value<=0&&!current.stabilized){const turns=current.zeroHatredTurns+1;if(turns>=3){await actor.update({"system.attributes.hp.value":1},{[INTERNAL]:{madara:true}});await writeTracker(actor,{zeroHatredTurns:3,lostToHatred:true},{render:false});ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)}:</strong> the three-turn Hatred Surge countdown completed. HP is set to 1 and the tracker marks the character for GM control.</p>`});}else await writeTracker(actor,{zeroHatredTurns:turns},{render:false});}else if(current.zeroHatredTurns)await writeTracker(actor,{zeroHatredTurns:0},{render:false});return;}if(value/maximum<.25){const controlled=await hatredCheck(actor);if(!controlled)await hatredAttackReminder(actor);}
}
async function processTurnEnd(actor){if(getClassMod(actor)&&getLevel(actor)<5&&readTracker(actor).hatred)await hatredCheck(actor,{escape:true});}
async function applyRest(actor,type){if(!["long","full"].includes(type))return;await writeTracker(actor,{legacy:maxLegacy(actor),defence:maxDefence(actor),defenceRoundKey:"",defenceUsedRound:0,defenceTurnKey:"",hatredDc:16,lastTurnKey:"",zeroHatredTurns:0,stabilized:false,sharinganActive:getLevel(actor)>=4,sharinganExpires:0},{render:false});ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)} — Madara Cells:</strong> Legacy Chakra and Mastered Defence restored.</p>`});refreshDialog(actor);}

function progressionStatus(actor,state=readTracker(actor)){const level=getLevel(actor);if(level>=5)return"Maximum Madara Cells level reached.";const next=level+1,dcs=SYNC_DCS[next];if(state.cellsIncompatible)return"Cells incompatible after 3 failed Medicine checks (GM reset required).";return`Next: level ${next}${enforceMinimumLevels()?` at character level ${LEVEL_REQUIREMENTS[next]}`:" (character minimum disabled)"} — Chakra Control DC ${dcs.chakra}; Medicine DC ${dcs.medicine}${state.chakraSyncFailed?" (Medicine unlocked)":""}.`;}
function trackerHtml(actor,tab="overview"){
  const state=readTracker(actor),level=getLevel(actor),entries=masteredEntries(actor),mutations=Object.keys(state.mutationSkills).length;
  const button=(action,label,id='',disabled=false)=>`<button type="button" data-action="${action}" data-id="${esc(id)}" ${disabled?'disabled':''}>${label}</button>`;
  const card=(title,body)=>`<section class="madara-tracker-card"><h3>${title}</h3>${body}</section>`;
  const stat=(label,value)=>`<div><span>${label}</span><strong>${value}</strong></div>`;
  const techniques=entries.map(entry=>{
    const item=entry.item,cost=item?rawJutsuCost(item):0;
    return card(esc(entry.feature.name),`<p>${item?`${cost} base Chakra · 2 Legacy Chakra for Mastered activation`:'Native Jutsu will be granted from the clan compendium.'}</p><details><summary>Mastered benefits</summary>${entry.feature.system?.description?.value??''}</details><div class="tracker-controls">${button('cast-mastered','Cast · choose Chakra',entry.feature.id)}</div>`);
  }).join('')||'<p>No Mastered Techniques chosen. Select them in the Madara Cells advancement.</p>';
  const configured=Object.entries(state.legacyJutsu).map(([id,kind])=>{
    const item=actor.items.get(id);return item?`<div class="madara-technique-row"><div><strong>${esc(item.name)}</strong><small>${esc(LEGACY_KIND_LABELS[kind])}</small></div>${button('cast-jutsu','Cast · choose Chakra',id)}</div>`:'';
  }).join('');
  const overview=`<section class="madara-grid">${stat('Legacy Chakra',`${state.legacy}/${maxLegacy(actor)}`)}${stat('Normal Chakra',`${Number(actor.system.attributes?.chakra?.value??0)} / ${Number(actor.system.attributes?.chakra?.max??0)}`)}${stat('Mastered Defence',`${state.defence}/${maxDefence(actor)}`)}${stat('Legacy Attack / DC',`+${2*prof(actor)+level} / ${12+level+prof(actor)}`)}${stat('Mastered Techniques',`${entries.length} / ${level+1}`)}${stat('Sharingan',state.sharinganActive?'ACTIVE':'INACTIVE')}</section>`+
    card('Mastered Defence',`<p>${maxDefencePerRound(actor)} additional reaction(s) per round · once per turn. Round usage resets automatically.</p><div class="tracker-controls">${button('defence','Use defence reaction','',state.defence<=0)}${button('refill-defence','Refill · 10 Legacy','',state.defence>=maxDefence(actor))}</div>`)+
    card('Resources & recovery',`<p>Long / Full Rest restore Legacy Chakra and Mastered Defence automatically.</p><div class="tracker-controls">${button('legacy-minus','−1 Legacy')}${button('legacy-plus','+1 Legacy')}${button('long-rest','Long Rest')}${button('full-rest','Full Rest')}</div>`);
  const sharingan=card('Apex Sharingan',`<p>${state.sharinganActive?level>=4?'Permanently active (Indirect Reincarnation).':`Active · ${Math.max(0,Math.ceil((state.sharinganExpires-game.time.worldTime)/60))} minutes remaining.`:'Inactive · activation lasts 10 minutes.'}</p><p>Activating applies the native Sharingan effect to the character. Occular Acuity and Sharingan Agility bonuses follow the activation state.</p><div class="tracker-controls">${button('toggle-sharingan',state.sharinganActive?'Deactivate Sharingan':'Activate Sharingan · 1 use','',level>=4)}${button('sharingan','Restore one use · 1 Legacy')}${level>=5?button('mangekyo','Convert Legacy → Mangekyō'):''}</div>`)+card('Granted Sharingan features',arr(actor.items).filter(item=>flag(item,GRANT_FLAG)||item.system?.identifier==='sharingan').map(item=>`<p>${esc(item.name)}</p>`).join('')||'<p>Native Sharingan grant unavailable: check n5eb.clan.</p>');
  const adaptations=card('Cell Synchronization',`<p>${esc(progressionStatus(actor,state))}</p><div class="tracker-controls">${button('sync-chakra','Chakra Control check','',level>=5||state.chakraSyncFailed||state.cellsIncompatible)}${button('sync-medicine','Medicine fallback','',level>=5||!state.chakraSyncFailed||state.cellsIncompatible)}${game.user.isGM?button('reset-sync','GM: reset attempt'):''}</div><p>${esc(state.lastSyncResult)}</p><small>Each attempt requires the downtime specified in the Class Mod. Medicine success permanently loses Hit Dice.</small>`)+card('Extraordinary Talent',`<p>${mutations} / ${requiredMutationCount(actor)} mutation choices assigned.</p>${Object.values(state.mutationSkills).map(choice=>`<p>${esc(choice.key)} · ${choice.applied}</p>`).join('')}${button('mutation','Choose skill / tool','',mutations>=requiredMutationCount(actor))}<p>Permanent Hit Dice lost: ${state.permanentHitDiceLost}</p>`)+card('Legacy Passives',arr(actor.items).filter(item=>flag(item,'madaraLegacyPassive')).map(item=>`<details><summary>${esc(item.name)}</summary>${item.system.description?.value??''}</details>`).join('')||'<p>No Legacy Passive selected.</p>');
  const hatred=card('Hatred Surge',`<p>${level>=5?'Removed by Perfect Match.':state.hatred?'Overcome with Hatred is active.':`Control DC ${state.hatredDc}; automatic turn-start check below 25% HP.`}</p><p>0-HP countdown: ${state.zeroHatredTurns} / 3 · ${state.lostToHatred?'GM takeover':'Player control'}</p><p>${esc(state.lastHatredCheck)}</p><div class="tracker-controls">${state.hatred?button('hatred','Attempt control')+button('stabilize','Mark stabilized'):game.user.isGM&&level<5?button('trigger-hatred','GM: trigger hatred'):''}${game.user.isGM?button('reset-takeover','GM: reset takeover'):''}</div><small>Combat turns track the checks and countdown automatically. Target choice under Hatred remains with the GM.</small>`);
  const panels={overview,techniques:techniques+card('Other Legacy Jutsu',`<p>Choose the pool on each tracker cast; normal Jutsu costs are preserved.</p>${configured}${button('configure-jutsu','Configure Legacy rule')}`),ongoing:techniqueAutomation.panel(actor),sharingan,adaptations,hatred};
  return `<div class="n5eb-madara-tracker" data-madara-root data-tab="${tab}"><aside class="n5eb-tracker-sidebar" aria-label="Madara Cells tracker"><img class="tracker-emblem" src="${ICON}" alt=""><h2>Madara Cells</h2><p>Level ${level} / 5</p>${Object.entries({overview:'Overview',techniques:'Techniques',ongoing:'Active techniques',sharingan:'Sharingan',adaptations:'Adaptation',hatred:'Hatred Surge'}).map(([id,label])=>`<button type="button" data-tab-button="${id}" class="${tab===id?'active':''}" aria-selected="${tab===id}">${label}</button>`).join('')}<p>${state.legacy} / ${maxLegacy(actor)}<br>Legacy Chakra</p></aside><main class="n5eb-tracker-body"><header><h2>${esc(actor.name)}</h2><p>Madara Cells ${level} · Character ${charLevel(actor)} · Attack +${2*prof(actor)+level} · DC ${12+level+prof(actor)}</p></header>${Object.entries(panels).map(([id,body])=>`<div data-panel="${id}" ${tab===id?'':'hidden'}>${body}</div>`).join('')}</main></div>`;
}
function dialogKey(actor){return actorKey(actor);}
function refreshDialog(actor){
  const root=dialogs.get(dialogKey(actor))?.element?.querySelector('[data-madara-root]');if(!root)return;
  const scroll=root.querySelector('.n5eb-tracker-body').scrollTop,template=document.createElement('template');template.innerHTML=trackerHtml(actor,root.dataset.tab);
  root.innerHTML=template.content.firstElementChild.innerHTML;root.querySelector('.n5eb-tracker-body').scrollTop=scroll;
}
async function openTracker(context){
  const actor=actorFromContext(context);if(!actor?.isOwner||!getClassMod(actor))return ui.notifications.warn('Select a Madara Cells character you own.');
  const existing=dialogs.get(dialogKey(actor));if(existing?.rendered){existing.bringToFront();return existing;}
  await queue(actor,()=>ensureActor(actor));const key=dialogKey(actor),opened=dialogs.get(key);if(opened){opened.bringToFront();return opened;}
  const dialog=createTrackerWindow({window:{title:`Madara Cells — ${actor.name}`,icon:'fa-solid fa-eye',resizable:true},position:{width:950,height:Math.min(760,window.innerHeight-80)},classes:['n5eb-tracker-window','n5eb-madara-tracker-window']},()=>trackerHtml(actor),app=>activateDialog(app,actor));
  dialogs.set(key,dialog);dialog.addEventListener('close',()=>dialogs.delete(key),{once:true});await dialog.render({force:true});return dialog;
}
function activateDialog(dialog,actor){
  const root=dialog.element?.querySelector('[data-madara-root]');if(!root||root.dataset.bound)return;root.dataset.bound='true';
  root.addEventListener('click',async event=>{
    const tab=event.target.closest('[data-tab-button]');if(tab){event.preventDefault();event.stopPropagation();trackerTabs(root,tab.dataset.tabButton);return;}
    const button=event.target.closest('[data-action]');if(!button||button.disabled||root.dataset.busy)return;event.preventDefault();event.stopPropagation();root.dataset.busy='true';button.disabled=true;
    try{
      const action=button.dataset.action,state=readTracker(actor);
      if(action==='cast-mastered')await castTechnique(actor,button.dataset.id);
      else if(action==='cast-jutsu')await castTechnique(actor,button.dataset.id,{mastered:false});
      else if(['flower-free','flower-bonus','end-technique','remove-condition','redstar-crash'].includes(action))await techniqueAutomation.perform(actor,action,button.dataset.id,button.dataset.target);
      else if(action==='legacy-minus')await queue(actor,()=>changeLegacy(actor,-1));
      else if(action==='legacy-plus')await queue(actor,()=>changeLegacy(actor,1));
      else if(action==='defence')await queue(actor,()=>spendDefence(actor));
      else if(action==='refill-defence')await queue(actor,()=>refillDefence(actor));
      else if(action==='sharingan')await replenishSharingan(actor);
      else if(action==='toggle-sharingan')await queue(actor,()=>toggleSharingan(actor));
      else if(action==='mutation')await chooseMutation(actor);
      else if(action==='hatred')await queue(actor,()=>hatredCheck(actor,{escape:true}));
      else if(action==='trigger-hatred'&&game.user.isGM)await writeTracker(actor,{hatred:true});
      else if(action==='stabilize')await writeTracker(actor,{zeroHatredTurns:0,stabilized:true});
      else if(action==='mangekyo')await convertMangekyo(actor);
      else if(action==='configure-jutsu')await configureLegacyJutsu(actor);
      else if(action==='sync-chakra')await attemptSynchronization(actor,'chakra');
      else if(action==='sync-medicine')await attemptSynchronization(actor,'medicine');
      else if(action==='reset-sync'&&game.user.isGM)await writeTracker(actor,{chakraSyncFailed:false,medicineFailures:0,cellsIncompatible:false,lastSyncResult:''});
      else if(action==='reset-takeover'&&game.user.isGM)await writeTracker(actor,{lostToHatred:false,zeroHatredTurns:0,hatred:false,hatredDc:16});
      else if(action==='long-rest'||action==='full-rest')await queue(actor,()=>applyRest(actor,action==='long-rest'?'long':'full'));
    }catch(error){console.error(`${MODULE_ID} | Madara Cells`,error);ui.notifications.error(error.message);}
    finally{delete root.dataset.busy;refreshDialog(actor);}
  });
}
function isActorSheet(app){return app?.document?.documentName==='Actor'||app?.object?.documentName==='Actor'||(/ActorSheet/.test(app?.constructor?.name??'')&&app?.actor?.documentName==='Actor');}
function refreshStrip(actor){
  for(const app of Object.values(actor.apps??{})){
    const root=app.element?.querySelector?app.element:app.element?.[0],strip=root?.querySelector('[data-madara-strip]');if(!strip)continue;
    const state=readTracker(actor),numbers=strip.querySelectorAll('.tracker-mini strong');
    if(numbers[0])numbers[0].textContent=`${state.legacy}/${maxLegacy(actor)}`;
    if(numbers[1])numbers[1].textContent=`${state.defence}/${maxDefence(actor)}`;
    if(numbers[2])numbers[2].textContent=state.sharinganActive?'ACTIVE':'OFF';
    if(numbers[3])numbers[3].textContent=getLevel(actor)>=5?'REMOVED':state.hatred?'ACTIVE':`DC ${state.hatredDc}`;
  }
}

function renderRoot(app,html){if(html?.querySelector)return html;if(html?.[0]?.querySelector)return html[0];if(app?.element?.querySelector)return app.element;if(app?.element?.[0]?.querySelector)return app.element[0];return null;}
function injectTrackerStrip(app,html){if(!isActorSheet(app))return;const actor=actorFromContext(app);if(!actor||!getClassMod(actor))return;const root=renderRoot(app,html);if(!root||root.querySelector("[data-madara-strip]"))return;const target=root.querySelector(".jutsu-casting-overview")??root.querySelector(".sheet-body")??root.querySelector("[data-tab='attributes']");if(!target)return;const state=readTracker(actor),section=document.createElement("section");section.className="n5eb-madara-tracker-strip";section.dataset.madaraStrip="true";section.innerHTML=`<button type="button" class="tracker-title" data-action="open-madara"><img src="${ICON}" alt=""> Madara Cells</button><div class="tracker-mini"><span>Legacy</span><strong>${state.legacy}/${maxLegacy(actor)}</strong></div><div class="tracker-mini"><span>Defence</span><strong>${state.defence}/${maxDefence(actor)}</strong></div><div class="tracker-mini"><span>Sharingan</span><strong>${state.sharinganActive?"ACTIVE":"OFF"}</strong></div><div class="tracker-mini"><span>Hatred</span><strong>${getLevel(actor)>=5?"REMOVED":state.hatred?"ACTIVE":`DC ${state.hatredDc}`}</strong></div>`;target.prepend(section);section.querySelector("[data-action='open-madara']")?.addEventListener("click",()=>openTracker(actor));}
function renderRuntime(app,html){if(isActorSheet(app))injectTrackerStrip(app,html);}
function validateLevelChange(item,changes){if(!isMadaraClassMod(item))return;const proposed=changes["system.levels"]??foundry.utils.getProperty(changes,"system.levels");if(proposed==null)return;const next=clamp(Math.floor(Number(proposed)||1),1,5),actor=item.parent;if(actor?.documentName==="Actor"&&!meetsMinimumLevel(actor,LEVEL_REQUIREMENTS[next])){ui.notifications.warn(`Madara Cells level ${next} requires character level ${LEVEL_REQUIREMENTS[next]}+.`);return false;}}

Hooks.once("ready",async()=>{globalThis.N5eBMadaraCells=Object.freeze({openTracker,castTechnique,toggleSharingan,launchFlower:techniqueAutomation.launchFlower,removeTechniqueCondition:techniqueAutomation.removeCondition,endTechnique:techniqueAutomation.endTechnique,resolveRedStarCrash:techniqueAutomation.resolveCrash,getTracker:readTracker,setTracker:writeTracker,syncActor:ensureActor,spendLegacy,spendDefence,activateMastered,hatredCheck,replenishSharingan,convertMangekyo,configureLegacyJutsu,attemptSynchronization,renderTrackerStrip:injectTrackerStrip});if(game.system.id!=="n5eb")return;const gm=game.users?.activeGM;for(const actor of game.actors??[])if(getClassMod(actor)&&actor.isOwner&&(!gm||gm.id===game.user.id))await queue(actor,()=>ensureActor(actor));for(const combat of game.combats??[])combatLastActor.set(combat.id,{actor:combat.combatant?.actor,key:currentTurnKey(combat)});});
Hooks.on("getActorSheetHeaderButtons",(sheet,buttons)=>{const actor=actorFromContext(sheet);if(!actor||!getClassMod(actor))return;const state=readTracker(actor);buttons.unshift({label:`Legacy ${state.legacy}/${maxLegacy(actor)} · MD ${state.defence}/${maxDefence(actor)}`,class:"n5eb-madara-tracker-button",icon:"fas fa-eye",onclick:()=>openTracker(actor)});});
Hooks.on("getHeaderControlsApplicationV2",(app,controls)=>{if(!isActorSheet(app))return;const actor=actorFromContext(app);if(!actor||!getClassMod(actor))return;const state=readTracker(actor);controls.unshift({action:"n5ebMadaraTracker",label:`Madara Cells ${state.legacy}/${maxLegacy(actor)}`,icon:"fa-solid fa-eye",classes:"n5eb-madara-tracker-button",visible:true,ownership:"OWNER",onClick:()=>openTracker(actor)});});
Hooks.on("renderActorSheet",renderRuntime);Hooks.on("renderCharacterActorSheet",renderRuntime);Hooks.on("renderApplicationV2",renderRuntime);
Hooks.on("preCreateItem",(item,data,options,userId)=>{if(options?.[INTERNAL]||userId!==game.user.id||item.parent?.documentName!=="Actor"||!isMadaraClassMod(item))return;if(!meetsMinimumLevel(item.parent,LEVEL_REQUIREMENTS[1])){ui.notifications.warn(`Madara Cells requires character level ${LEVEL_REQUIREMENTS[1]}+.`);return false;}});
Hooks.on("preUpdateItem",(item,changes,options,userId)=>{if(options?.[INTERNAL]||userId!==game.user.id||item.parent?.documentName!=="Actor")return;return validateLevelChange(item,changes);});
function madaraRelevant(item){return isMadaraClassMod(item)||flag(item,'classMod')===CLASSMOD_ID||Boolean(flag(item,GRANT_FLAG))||Boolean(flag(item,BASE_GRANT_FLAG));}
Hooks.on('createItem',(item,options,userId)=>{
  if(options?.[INTERNAL]||userId!==game.user.id||item.parent?.documentName!=='Actor')return;
  if(madaraRelevant(item)&&getClassMod(item.parent))queue(item.parent,()=>ensureActor(item.parent)).then(()=>refreshDialog(item.parent)).catch(console.error);
});
Hooks.on('updateItem',(item,changes,options,userId)=>{
  if(options?.[INTERNAL]||userId!==game.user.id||item.parent?.documentName!=='Actor'||!getClassMod(item.parent))return;
  if(isMadaraClassMod(item)&&(changes['system.levels']!==undefined||foundry.utils.getProperty(changes,'system.levels')!==undefined))queue(item.parent,()=>ensureActor(item.parent)).then(()=>refreshDialog(item.parent)).catch(console.error);
});
Hooks.on('deleteItem',async(item,options,userId)=>{
  if(options?.[INTERNAL]||userId!==game.user.id||item.parent?.documentName!=='Actor')return;
  const actor=item.parent;if(isMadaraClassMod(item))return cleanupActor(actor);
  if(getClassMod(actor)&&madaraRelevant(item))await queue(actor,()=>ensureActor(actor));
  const state=readTracker(actor);if(state.legacyJutsu[item.id]){const next={...state.legacyJutsu};delete next[item.id];await writeTracker(actor,{legacyJutsu:next},{render:false});}
  refreshDialog(actor);
});
Hooks.on('updateCombat',async(combat,changes,options,userId)=>{
  if(userId!==game.user.id||(!Object.hasOwn(changes,'turn')&&!Object.hasOwn(changes,'round')))return;
  const previous=combatLastActor.get(combat.id),current=combat.combatant?.actor,key=currentTurnKey(combat);
  combatLastActor.set(combat.id,{actor:current,key});
  if(previous?.key===key)return;
  if(previous?.actor?.isOwner&&getClassMod(previous.actor))await queue(previous.actor,()=>processTurnEnd(previous.actor));
  if(current?.isOwner&&getClassMod(current))await queue(current,()=>processTurnStart(current,combat));
});
Hooks.on('deleteCombat',combat=>combatLastActor.delete(combat.id));
Hooks.on('dnd5e.preActivityConsumption',prepareCastConsumption);
Hooks.on('dnd5e.activityConsumption',consumeCast);
Hooks.on('dnd5e.preCreateUsageMessage',snapshotCast);
Hooks.on('dnd5e.preRollAttackV2',(config,dialog,message)=>{
  const item=getActivityItem(config.subject),cast=flag(item,'madaraCast');if(!cast)return;
  if(cast.identifier==='uchiha-ember-bullet'&&cast.noCover)config.advantage=true;
  snapshotCast(config.subject,message);
});
Hooks.on('dnd5e.preRollSavingThrowV2',config=>{
  const messageId=config.event?.target?.closest?.('[data-message-id]')?.dataset?.messageId;
  const cast=game.messages?.get?.(messageId)?.getFlag?.(MODULE_ID,'madaraCast');
  if(cast?.identifier==='genjutsu-deflect'&&config.ability==='wis')config.disadvantage=true;
});
Hooks.on('dnd5e.postActivityConsumption',(activity,config)=>{
  const session=castSession(activity,config);if(session){session.consumed=true;refreshDialog(session.actor);refreshStrip(session.actor);}
});
Hooks.on('dnd5e.restCompleted',(actor,result)=>{if(actor.isOwner&&getClassMod(actor))queue(actor,()=>applyRest(actor,result?.type)).catch(console.error);});
Hooks.on('updateActor',(actor,changes,options,userId)=>{
  if(!getClassMod(actor))return;refreshDialog(actor);refreshStrip(actor);
  if(options?.[INTERNAL]||userId!==game.user.id||!actor.isOwner)return;
  const hp=changes['system.attributes.hp.value']??foundry.utils.getProperty(changes,'system.attributes.hp.value');
  const relevant=hp!==undefined||changes.system||Object.keys(changes).some(key=>key.startsWith('system.'));
  if(!relevant)return;
  queue(actor,async()=>{
    if(hp!==undefined){const state=readTracker(actor),maximum=Math.max(1,Number(actor.system.attributes.hp?.max??1)),patch={};if(Number(hp)>0&&(state.zeroHatredTurns||state.stabilized)){patch.zeroHatredTurns=0;patch.stabilized=false;}if(Number(hp)/maximum>=.25&&!state.hatred&&state.hatredDc!==16)patch.hatredDc=16;if(Object.keys(patch).length)await writeTracker(actor,patch,{render:false,effects:false,syncJutsu:false});}
    await refreshEffects(actor);refreshDialog(actor);
  }).catch(console.error);
});
Hooks.on('updateWorldTime',()=>{
  if(game.users?.activeGM&&game.users.activeGM.id!==game.user.id)return;
  for(const actor of game.actors??[])if(actor.isOwner&&getClassMod(actor)&&getLevel(actor)<4){const state=readTracker(actor);if(state.sharinganActive&&state.sharinganExpires>0&&state.sharinganExpires<=game.time.worldTime)queue(actor,()=>writeTracker(actor,{sharinganActive:false,sharinganExpires:0})).catch(console.error);}
});
Hooks.on('deleteActiveEffect',(effect,options,userId)=>{
  if(options?.[INTERNAL]||userId!==game.user.id||!flag(effect,SHARINGAN_EFFECT_FLAG))return;
  const actor=effect.parent;if(actor?.isOwner&&getClassMod(actor))queue(actor,()=>writeTracker(actor,{sharinganActive:getLevel(actor)>=4,sharinganExpires:0})).catch(console.error);
});
