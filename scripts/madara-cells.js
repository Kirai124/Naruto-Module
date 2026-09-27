const MODULE_ID = "n5eb-classmod-library";
const CLASSMOD_ID = "madara-cells";
const TRACKER_FLAG = "madaraCellsTracker";
const TRACKER_VERSION = 2;
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
  return {version:TRACKER_VERSION,legacy:maxLegacy(actor),defence:maxDefence(actor),defenceRoundKey:"",defenceUsedRound:0,defenceTurnKey:"",hatred:false,hatredDc:16,lastTurnKey:"",lastHatredCheck:"",zeroHatredTurns:0,lostToHatred:false,mutationSkills:{},sharinganActive:getLevel(actor)>=4,legacyJutsu:{},chakraSyncFailed:false,medicineFailures:0,cellsIncompatible:false,permanentHitDiceLost:0,lastSyncResult:""};
}
function normalizeTracker(actor,value={}){
  const base=defaultTracker(actor), source=value.legacyJutsu&&typeof value.legacyJutsu==="object"?value.legacyJutsu:{};
  const legacyJutsu=Object.fromEntries(Object.entries(source).filter(([,kind])=>Object.hasOwn(LEGACY_KIND_LABELS,kind)));
  return {...base,...value,version:TRACKER_VERSION,legacy:clamp(value.legacy??base.legacy,0,maxLegacy(actor)),defence:clamp(value.defence??base.defence,0,maxDefence(actor)),defenceRoundKey:String(value.defenceRoundKey??""),defenceUsedRound:Math.max(0,Math.floor(Number(value.defenceUsedRound??0))),defenceTurnKey:String(value.defenceTurnKey??""),hatred:Boolean(value.hatred)&&getLevel(actor)<5,hatredDc:Math.max(16,Number(value.hatredDc??16)),lastTurnKey:String(value.lastTurnKey??""),lastHatredCheck:String(value.lastHatredCheck??""),zeroHatredTurns:Math.max(0,Math.min(3,Math.floor(Number(value.zeroHatredTurns??0)))),lostToHatred:Boolean(value.lostToHatred),mutationSkills:value.mutationSkills&&typeof value.mutationSkills==="object"?value.mutationSkills:{},sharinganActive:getLevel(actor)>=4||Boolean(value.sharinganActive),legacyJutsu,chakraSyncFailed:Boolean(value.chakraSyncFailed),medicineFailures:Math.max(0,Math.min(3,Math.floor(Number(value.medicineFailures??0)))),cellsIncompatible:Boolean(value.cellsIncompatible),permanentHitDiceLost:Math.max(0,Math.floor(Number(value.permanentHitDiceLost??0))),lastSyncResult:String(value.lastSyncResult??"")};
}
function readTracker(actor){ return normalizeTracker(actor,actor?.getFlag?.(MODULE_ID,TRACKER_FLAG)??defaultTracker(actor)); }
async function writeTracker(actor,patch={},options={}){
  const {render=true,effects=true,syncJutsu=true}=options;
  if(!actor?.isOwner) return readTracker(actor);
  const next=normalizeTracker(actor,{...readTracker(actor),...patch}), raw=actor.getFlag?.(MODULE_ID,TRACKER_FLAG);
  if(!raw||JSON.stringify(raw)!==JSON.stringify(next)) await actor.update({[`flags.${MODULE_ID}.${TRACKER_FLAG}`]:next},{[INTERNAL]:{madara:true}});
  if(effects) await refreshEffects(actor,next);
  if(syncJutsu) await syncLegacyJutsu(actor,next);
  if(render){actor.sheet?.render?.(false);refreshDialog(actor);} return next;
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
  let passive=arr(actor?.effects).find(effect=>flag(effect,EFFECT_FLAG));
  if(!getClassMod(actor)){if(passive)await passive.delete({[INTERNAL]:{madara:true}});return;}
  const changes=passiveChanges(actor,state),data={name:"Madara Cells — Passive Adaptation",img:ICON,disabled:false,transfer:false,changes,statuses:[],flags:{[MODULE_ID]:{[EFFECT_FLAG]:true}}};
  if(!passive)await actor.createEmbeddedDocuments("ActiveEffect",[data],{[INTERNAL]:{madara:true}});else if(passive.img!==ICON||JSON.stringify(passive.changes??[])!==JSON.stringify(changes)||passive.disabled)await passive.update(data,{[INTERNAL]:{madara:true}});
  let hatred=arr(actor?.effects).find(effect=>flag(effect,HATRED_EFFECT_FLAG));
  if(state.hatred&&getLevel(actor)<5){const data={name:"Overcome with Hatred",img:ICON,disabled:false,transfer:false,changes:[],statuses:[],flags:{[MODULE_ID]:{[HATRED_EFFECT_FLAG]:true}}};if(!hatred)await actor.createEmbeddedDocuments("ActiveEffect",[data],{[INTERNAL]:{madara:true}});else if(hatred.disabled||hatred.img!==ICON)await hatred.update(data,{[INTERNAL]:{madara:true}});}else if(hatred)await hatred.delete({[INTERNAL]:{madara:true}});
}

async function systemItemByIdentifier(identifier){
  const pack=game.packs.get("n5eb.clan")??arr(game.packs).find(entry=>entry.metadata?.name==="clan"&&entry.metadata?.packageName==="n5eb"); if(!pack)return null;
  const index=await pack.getIndex({fields:["system.identifier"]}),entry=index.find(item=>item.system?.identifier===identifier); return entry?pack.getDocument(entry._id):null;
}
async function classModItemByIdentifier(identifier){
  const pack=game.packs.get("world.n5eb-custom-class-mods");if(!pack)return null;
  const index=await pack.getIndex({fields:["system.identifier"]}),entry=index.find(item=>item.system?.identifier===identifier);return entry?pack.getDocument(entry._id):null;
}
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
    if(key==="base"){data.system.uses??={};data.system.uses.max=5;data.system.uses.value=5;data.system.uses.per="lr";}
    await actor.createEmbeddedDocuments("Item",[data],{[INTERNAL]:{madaraGrant:true}});
  }
}

function legacyOriginal(item){ return flag(item,LEGACY_ORIGINAL_FLAG); }
function configuredLegacyItem(actor,item){ return readTracker(actor).legacyJutsu?.[item?.id]??null; }
function rawJutsuCost(item){const original=legacyOriginal(item)?.chakra??item?.system?.chakra??{},value=Number(original.cost??item?.system?.consume?.amount??0);return Math.max(0,Number.isFinite(value)?value:0);}
function legacyJutsuCost(actor,item,kind=configuredLegacyItem(actor,item)){let cost=rawJutsuCost(item);if(kind==="uchiha")cost=Math.ceil(cost/2);else if(kind==="fire"&&getLevel(actor)<2)cost+=3;return Math.max(0,Math.floor(cost));}
function availableLegacy(actor,state=readTracker(actor)){return state.legacy+(getLevel(actor)>=5?Math.floor(Number(actor.system?.attributes?.chakra?.value??0)/3):0);}
async function syncLegacyJutsu(actor,state=readTracker(actor)){
  const updates=[];
  for(const item of arr(actor.items)){
    if(!isJutsu(item))continue;const original=legacyOriginal(item),kind=state.legacyJutsu[item.id];
    if(!kind&&original){updates.push({_id:item.id,"system.chakra":clone(original.chakra),[`flags.${MODULE_ID}.-=${LEGACY_ORIGINAL_FLAG}`]:null});continue;}if(!kind)continue;
    const base=original??{chakra:clone(item.system?.chakra)},chakra=clone(base.chakra),cost=legacyJutsuCost(actor,item,kind);chakra.cost="0";chakra.special=`Legacy Chakra: ${cost} (${LEGACY_KIND_LABELS[kind]}; automatic)`;
    const update={_id:item.id,"system.chakra":chakra};if(!original)update[`flags.${MODULE_ID}.${LEGACY_ORIGINAL_FLAG}`]=base;updates.push(update);
  }
  if(updates.length)await actor.updateEmbeddedDocuments("Item",updates,{[INTERNAL]:{madaraLegacySync:true}});
}
async function restoreLegacyJutsu(actor){const updates=arr(actor.items).filter(item=>legacyOriginal(item)).map(item=>({_id:item.id,"system.chakra":clone(legacyOriginal(item).chakra),[`flags.${MODULE_ID}.-=${LEGACY_ORIGINAL_FLAG}`]:null}));if(updates.length)await actor.updateEmbeddedDocuments("Item",updates,{[INTERNAL]:{madaraLegacyRestore:true}});}
async function configureLegacyJutsu(actor){
  const state=readTracker(actor),jutsu=arr(actor.items).filter(isJutsu).sort((a,b)=>a.name.localeCompare(b.name));if(!jutsu.length)return ui.notifications.warn("No owned Jutsu were found.");
  const result=await foundry.applications.api.DialogV2.wait({window:{title:"Madara Cells — Configure Legacy Casting"},content:`<form><p>Configured Jutsu automatically spend Legacy Chakra instead of normal Chakra.</p><div class="form-group"><label>Jutsu<select name="item">${jutsu.map(item=>`<option value="${esc(item.id)}">${esc(item.name)}${state.legacyJutsu[item.id]?` — ${esc(LEGACY_KIND_LABELS[state.legacyJutsu[item.id]])}`:""}</option>`).join("")}</select></label></div><div class="form-group"><label>Legacy rule<select name="kind"><option value="remove">Use normal Chakra / remove</option>${Object.entries(LEGACY_KIND_LABELS).map(([key,label])=>`<option value="${key}">${esc(label)}</option>`).join("")}</select></label></div></form>`,buttons:[{action:"save",label:"Apply",default:true,callback:(event,button)=>new FormDataExtended(button.form).object},{action:"cancel",label:"Cancel"}],rejectClose:false});
  if(!result)return;const itemId=String(result.item??""),kind=String(result.kind??"remove");if(!actor.items.get(itemId))return;const next={...state.legacyJutsu};if(kind==="remove")delete next[itemId];else if(Object.hasOwn(LEGACY_KIND_LABELS,kind))next[itemId]=kind;await writeTracker(actor,{legacyJutsu:next});
}

async function cleanupActor(actor){
  const state=readTracker(actor),updates={};for(const data of Object.values(state.mutationSkills??{})){const path=data.kind==="tool"?`system.tools.${data.key}.value`:`system.skills.${data.key}.value`,current=Number(foundry.utils.getProperty(actor,path)??0);if(current===Number(data.applied))updates[path]=Number(data.original??0);}if(Object.keys(updates).length)await actor.update(updates,{[INTERNAL]:{madara:true}});
  await restoreLegacyJutsu(actor);const effects=arr(actor.effects).filter(effect=>flag(effect,EFFECT_FLAG)||flag(effect,HATRED_EFFECT_FLAG));if(effects.length)await actor.deleteEmbeddedDocuments("ActiveEffect",effects.map(effect=>effect.id),{[INTERNAL]:{madara:true}});const grants=arr(actor.items).filter(item=>flag(item,GRANT_FLAG)||flag(item,CORE_GRANT_FLAG));if(grants.length)await actor.deleteEmbeddedDocuments("Item",grants.map(item=>item.id),{[INTERNAL]:{madara:true}});await actor.unsetFlag(MODULE_ID,TRACKER_FLAG);
}
async function ensureActor(actor){
  if(!getClassMod(actor)||!actor.isOwner)return;const raw=actor.getFlag?.(MODULE_ID,TRACKER_FLAG),state=normalizeTracker(actor,raw??defaultTracker(actor));if(!raw||JSON.stringify(raw)!==JSON.stringify(state))await actor.update({[`flags.${MODULE_ID}.${TRACKER_FLAG}`]:state},{[INTERNAL]:{madara:true}});
  await syncCoreGrants(actor);await refreshEffects(actor,state);await syncSharinganGrants(actor);await syncLegacyJutsu(actor,state);if(getLevel(actor)>=5&&state.hatred)await writeTracker(actor,{hatred:false,hatredDc:16,zeroHatredTurns:0},{render:false});await ensureMutationChoices(actor);
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
async function refillDefence(actor){if(!await spendLegacy(actor,10,"Mastered Defence Refill"))return;await writeTracker(actor,{defence:maxDefence(actor),defenceRoundKey:"",defenceUsedRound:0,defenceTurnKey:""});}
async function activateMastered(actor){
  const arts=arr(actor.items).filter(item=>flag(item,"madaraMasteredTechnique"));if(!arts.length)return ui.notifications.warn("No Mastered Uchiha Technique is owned.");const id=await foundry.applications.api.DialogV2.wait({window:{title:"Mastered Uchiha Technique"},content:`<form><div class="form-group"><label>Technique<select name="art">${arts.map(item=>`<option value="${esc(item.id)}">${esc(item.name)}</option>`).join("")}</select></label></div></form>`,buttons:[{action:"activate",label:"Spend 2 Legacy Chakra",default:true,callback:(event,button)=>new FormDataExtended(button.form).object.art},{action:"cancel",label:"Cancel"}],rejectClose:false});if(!id)return;const item=actor.items.get(id);if(!item||!await spendLegacy(actor,2,item.name))return;ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<h3>${esc(item.name)} — Mastered Technique</h3>${item.system?.description?.value??""}`});
}
async function replenishSharingan(actor){
  const candidates=arr(actor.items).filter(item=>/sharingan/i.test(`${item.name??""} ${item.system?.identifier??""}`)&&Number(item.system?.uses?.max??0)>0);if(!candidates.length)return ui.notifications.warn("No Sharingan feature with a uses pool was found.");const id=await foundry.applications.api.DialogV2.wait({window:{title:"Replenish Sharingan Use"},content:`<form><div class="form-group"><label>Sharingan Feature<select name="item">${candidates.map(item=>`<option value="${esc(item.id)}">${esc(item.name)} (${Number(item.system?.uses?.value??0)}/${Number(item.system?.uses?.max??0)})</option>`).join("")}</select></label></div></form>`,buttons:[{action:"restore",label:"Spend 1 Legacy Chakra",default:true,callback:(event,button)=>new FormDataExtended(button.form).object.item},{action:"cancel",label:"Cancel"}],rejectClose:false});if(!id)return;const item=actor.items.get(id);if(!item||!await spendLegacy(actor,1,"Sharingan Use"))return;const current=Number(item.system?.uses?.value??0),maximum=Number(item.system?.uses?.max??current);await item.update({"system.uses.value":Math.min(maximum,current+1)},{[INTERNAL]:{madara:true}});
}
async function convertMangekyo(actor){
  if(getLevel(actor)<5)return ui.notifications.warn("Perfect Match is required.");const candidates=arr(actor.items).filter(item=>/mangek/i.test(`${item.name??""} ${item.system?.identifier??""}`)&&Number(item.system?.uses?.max??0)>0);if(!candidates.length)return ui.notifications.warn("No Mangekyō item with a uses pool was found.");const result=await foundry.applications.api.DialogV2.wait({window:{title:"Mangekyō Synergy"},content:`<form><div class="form-group"><label>Mangekyō Feature<select name="item">${candidates.map(item=>`<option value="${esc(item.id)}">${esc(item.name)}</option>`).join("")}</select></label></div><div class="form-group"><label>Charges<input name="count" type="number" min="1" value="1"></label></div></form>`,buttons:[{action:"convert",label:"Convert Legacy Chakra",default:true,callback:(event,button)=>new FormDataExtended(button.form).object},{action:"cancel",label:"Cancel"}],rejectClose:false});if(!result)return;const item=actor.items.get(result.item),count=Math.max(1,Math.floor(Number(result.count)||1));if(!item||!await spendLegacy(actor,10*count,"Mangekyō Art Charges"))return;const current=Number(item.system?.uses?.value??0),maximum=Number(item.system?.uses?.max??current+count);await item.update({"system.uses.value":Math.min(maximum,current+count)},{[INTERNAL]:{madara:true}});
}

function requiredMutationCount(actor){const level=getLevel(actor);return level<2?0:level-1;}
async function ensureMutationChoices(actor){const need=requiredMutationCount(actor),have=Object.keys(readTracker(actor).mutationSkills??{}).length;if(need>have&&actor.isOwner)ui.notifications.info(`${actor.name} can choose ${need-have} Madara Cells mutation proficiency${need-have===1?"":"ies"} from the tracker.`);}
async function chooseMutation(actor){
  const state=readTracker(actor),chosen=state.mutationSkills??{},need=requiredMutationCount(actor);if(Object.keys(chosen).length>=need)return ui.notifications.info("All current Extraordinary Talent choices are assigned.");const options=[];
  for(const [key,value] of Object.entries(actor.system?.skills??{}))if(!chosen[`skill:${key}`])options.push({id:`skill:${key}`,label:value.label??CONFIG.DND5E?.skills?.[key]?.label??key,value:Number(value.value??0),kind:"skill",key});for(const [key,value] of Object.entries(actor.system?.tools??{}))if(!chosen[`tool:${key}`])options.push({id:`tool:${key}`,label:value.label??key,value:Number(value.value??0),kind:"tool",key});if(!options.length)return ui.notifications.warn("No eligible skill/tool entries were found.");options.sort((a,b)=>String(a.label).localeCompare(String(b.label)));
  const id=await foundry.applications.api.DialogV2.wait({window:{title:"Extraordinary Talent"},content:`<form><div class="form-group"><label>Skill or Tool<select name="choice">${options.map(option=>`<option value="${esc(option.id)}">${esc(option.label)} — ${option.value>0?"increase Mastery":"gain Proficiency"}</option>`).join("")}</select></label></div></form>`,buttons:[{action:"apply",label:"Apply",default:true,callback:(event,button)=>new FormDataExtended(button.form).object.choice},{action:"cancel",label:"Cancel"}],rejectClose:false});const option=options.find(entry=>entry.id===id);if(!option)return;const path=option.kind==="tool"?`system.tools.${option.key}.value`:`system.skills.${option.key}.value`,original=Number(foundry.utils.getProperty(actor,path)??0),applied=original>0?original+1:1;await actor.update({[path]:applied},{[INTERNAL]:{madara:true}});await writeTracker(actor,{mutationSkills:{...chosen,[id]:{kind:option.kind,key:option.key,original,applied}}});
}

function skillTotal(actor,key,ability){const skill=actor.system?.skills?.[key]??{};if(Number.isFinite(Number(skill.total)))return Number(skill.total);return abilityMod(actor,ability)+Math.floor(prof(actor)*Number(skill.value??0))+Number(skill.bonus??0);}
async function attemptSynchronization(actor,method){
  const classMod=getClassMod(actor),level=getLevel(actor),next=level+1,state=readTracker(actor),dcs=SYNC_DCS[next];if(!classMod||!dcs)return ui.notifications.info("Madara Cells are already at maximum level.");if(state.cellsIncompatible)return ui.notifications.warn("The cells are recorded as incompatible after three failed Medicine attempts. A GM can reset this.");if(charLevel(actor)<LEVEL_REQUIREMENTS[next])return ui.notifications.warn(`Madara Cells level ${next} requires character level ${LEVEL_REQUIREMENTS[next]}+.`);if(method==="medicine"&&!state.chakraSyncFailed)return ui.notifications.warn("The Medicine fallback unlocks after the Chakra Control attempt fails.");if(method==="chakra"&&state.chakraSyncFailed)return ui.notifications.warn("Use the Medicine fallback or have a GM reset the attempt.");
  const skill=method==="medicine"?"med":"ccl",ability=method==="medicine"?"wis":"con",dc=dcs[method],bonus=skillTotal(actor,skill,ability),total=await roll(actor,`1d20${bonus>=0?"+":""}${bonus}`,`Madara Cells Synchronization — ${method==="medicine"?"Medicine":"Chakra Control"} DC ${dc}`);
  if(total>=dc){const patch={chakraSyncFailed:false,medicineFailures:0,lastSyncResult:`${method==="medicine"?"Medicine":"Chakra Control"} ${total} vs DC ${dc} — success; level ${next} unlocked`};if(method==="medicine")patch.permanentHitDiceLost=state.permanentHitDiceLost+next;await writeTracker(actor,patch,{render:false});await classMod.update({"system.levels":next},{[INTERNAL]:{madaraProgression:true}});await ensureActor(actor);actor.sheet?.render?.(false);refreshDialog(actor);ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)} — Madara Cells:</strong> synchronization succeeded. Class Mod level ${next} unlocked.${method==="medicine"?` Permanent Hit Dice loss tracked: ${patch.permanentHitDiceLost}.`:""}</p>`});return;}
  if(method==="chakra")await writeTracker(actor,{chakraSyncFailed:true,lastSyncResult:`Chakra Control ${total} vs DC ${dc} — failure; Medicine fallback unlocked`});else{const failures=state.medicineFailures+1;await writeTracker(actor,{medicineFailures:failures,cellsIncompatible:failures>=3,lastSyncResult:`Medicine ${total} vs DC ${dc} — failure (${failures}/3)`});}
}

async function hatredCheck(actor,{escape=false}={}){if(getLevel(actor)>=5)return true;const state=readTracker(actor),advantage=has(actor,"madara-partial-match"),formula=`${advantage?"2d20kh":"1d20"}${abilityMod(actor,"con")>=0?"+":""}${abilityMod(actor,"con")}`,total=await roll(actor,formula,escape?"Overcome with Hatred — Control Check":"Madara Cells — Hatred Surge"),success=total>=state.hatredDc;if(success)await writeTracker(actor,{hatred:escape?false:state.hatred,hatredDc:escape?16:state.hatredDc+1,lastHatredCheck:`${total} vs DC ${state.hatredDc} — success`,zeroHatredTurns:escape?0:state.zeroHatredTurns},{render:false});else{await writeTracker(actor,{hatred:true,lastHatredCheck:`${total} vs DC ${state.hatredDc} — failure`},{render:false});ui.notifications.warn(`${actor.name} is Overcome with Hatred.`);}refreshDialog(actor);return success;}
async function hatredAttackReminder(actor){ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)} is Overcome with Hatred.</strong> The GM secretly determines a random nearby target; the character attacks that target as aggressively as possible this turn.</p>`});}
async function processTurnStart(actor,combat){
  const level=getLevel(actor),key=currentTurnKey(combat),state=readTracker(actor);if(!level||!key||state.lastTurnKey===key)return;await writeTracker(actor,{lastTurnKey:key},{render:false,effects:false,syncJutsu:false});if(level>=5){if(state.hatred)await writeTracker(actor,{hatred:false,hatredDc:16,zeroHatredTurns:0},{render:false});return;}
  const hp=actor.system?.attributes?.hp??{},value=Number(hp.value??0),maximum=Math.max(1,Number(hp.max??1)),current=readTracker(actor);if(current.hatred){await hatredAttackReminder(actor);if(value<=0){const turns=current.zeroHatredTurns+1;if(turns>=3){await actor.update({"system.attributes.hp.value":1},{[INTERNAL]:{madara:true}});await writeTracker(actor,{zeroHatredTurns:3,lostToHatred:true},{render:false});ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)}:</strong> the three-turn Hatred Surge countdown completed. HP is set to 1 and the tracker marks the character for GM control.</p>`});}else await writeTracker(actor,{zeroHatredTurns:turns},{render:false});}else if(current.zeroHatredTurns)await writeTracker(actor,{zeroHatredTurns:0},{render:false});return;}if(value/maximum<.25){const controlled=await hatredCheck(actor);if(!controlled)await hatredAttackReminder(actor);}
}
async function processTurnEnd(actor){if(getClassMod(actor)&&getLevel(actor)<5&&readTracker(actor).hatred)await hatredCheck(actor,{escape:true});}
async function applyRest(actor,type){if(!["long","full"].includes(type))return;await writeTracker(actor,{legacy:maxLegacy(actor),defence:maxDefence(actor),defenceRoundKey:"",defenceUsedRound:0,defenceTurnKey:"",hatredDc:16,lastTurnKey:"",zeroHatredTurns:0},{render:false});ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)} — Madara Cells:</strong> Legacy Chakra and Mastered Defence restored.</p>`});refreshDialog(actor);}

function progressionStatus(actor,state=readTracker(actor)){const level=getLevel(actor);if(level>=5)return"Maximum Madara Cells level reached.";const next=level+1,dcs=SYNC_DCS[next];if(state.cellsIncompatible)return"Cells incompatible after 3 failed Medicine checks (GM reset required).";return`Next: level ${next} at character level ${LEVEL_REQUIREMENTS[next]} — Chakra Control DC ${dcs.chakra}; Medicine DC ${dcs.medicine}${state.chakraSyncFailed?" (Medicine unlocked)":""}.`;}
function trackerHtml(actor){
  const state=readTracker(actor),level=getLevel(actor),mutations=Object.keys(state.mutationSkills??{}).length,needed=requiredMutationCount(actor),mastered=arr(actor.items).filter(item=>flag(item,"madaraMasteredTechnique")).length,configured=Object.entries(state.legacyJutsu).map(([id,kind])=>{const item=actor.items.get(id);return item?`<li><span>${esc(item.name)}</span><strong>${legacyJutsuCost(actor,item,kind)} LC</strong></li>`:"";}).join("");
  return `<div class="n5eb-madara-tracker" data-madara-root><header><div><h2>Madara Cells</h2><p>Class Mod Level ${level} · Character Level ${charLevel(actor)}</p></div><div class="legacy-orb">${state.legacy}<small>/${maxLegacy(actor)}</small></div></header><section class="madara-grid"><div><span>Legacy Chakra</span><strong>${state.legacy}/${maxLegacy(actor)}</strong></div><div><span>Mastered Defence</span><strong>${state.defence}/${maxDefence(actor)}</strong></div><div><span>Hatred Surge</span><strong>${level>=5?"REMOVED":state.hatred?"ACTIVE":`DC ${state.hatredDc}`}</strong></div><div><span>Mastered Techniques</span><strong>${mastered}/${level+1}</strong></div><div><span>Mutation Choices</span><strong>${mutations}/${needed}</strong></div><div><span>Sharingan</span><strong>${state.sharinganActive?"ACTIVE":"INACTIVE"}</strong></div><div><span>Permanent HD Loss</span><strong>${state.permanentHitDiceLost}</strong></div><div><span>0-HP Hatred Counter</span><strong>${state.zeroHatredTurns}/3</strong></div></section><section class="madara-tracker-card"><h3>Legacy Casting</h3><p>Configured Jutsu spend Legacy Chakra automatically.</p><ul class="madara-jutsu-list">${configured||"<li><em>No Jutsu configured.</em></li>"}</ul><button type="button" data-action="configure-jutsu">Configure Legacy Jutsu</button></section><section class="madara-tracker-card"><h3>Cell Synchronization</h3><p>${esc(progressionStatus(actor,state))}</p><div class="tracker-controls"><button type="button" data-action="sync-chakra" ${level>=5||state.chakraSyncFailed||state.cellsIncompatible?"disabled":""}>Chakra Control Check</button><button type="button" data-action="sync-medicine" ${!state.chakraSyncFailed||state.cellsIncompatible?"disabled":""}>Medicine Fallback</button>${game.user.isGM?'<button type="button" data-action="reset-sync">GM Reset Attempt</button>':""}</div>${state.lastSyncResult?`<p class="hostility-log">${esc(state.lastSyncResult)}</p>`:""}</section><footer><button type="button" data-action="legacy-minus">-1 Legacy</button><button type="button" data-action="legacy-plus">+1 Legacy</button><button type="button" data-action="mastered">Activate Mastered Technique</button><button type="button" data-action="defence">Spend Defence Reaction</button><button type="button" data-action="refill-defence">Refill Defence (10 Legacy)</button><button type="button" data-action="sharingan">Replenish Sharingan Use</button><button type="button" data-action="toggle-sharingan" ${level>=4?"disabled":""}>${state.sharinganActive?"Deactivate":"Activate"} Sharingan</button>${level>=2&&mutations<needed?'<button type="button" data-action="mutation">Choose Mutation</button>':""}${state.hatred?'<button type="button" data-action="hatred">Attempt Hatred Control</button><button type="button" data-action="stabilize">Mark Stabilized</button>':game.user.isGM?'<button type="button" data-action="trigger-hatred">Trigger Hatred</button>':""}${level>=5?'<button type="button" data-action="mangekyo">Legacy → Mangekyō Charge</button>':""}<button type="button" data-action="restore">Restore Pools</button>${game.user.isGM?'<button type="button" data-action="reset-takeover">GM Reset Takeover</button>':""}</footer>${state.lastHatredCheck?`<p class="hostility-log">Last Hatred check: ${esc(state.lastHatredCheck)}</p>`:""}${state.lostToHatred?'<p class="hostility-log"><strong>The tracker marks the character as taken over by the cells.</strong></p>':""}</div>`;
}
function dialogKey(actor){return actorKey(actor);}function refreshDialog(actor){const dialog=dialogs.get(dialogKey(actor));if(dialog?.rendered)dialog.render({force:true});}
async function openTracker(context){const actor=actorFromContext(context);if(!actor||!getClassMod(actor))return ui.notifications.warn("No Madara Cells character is selected.");await ensureActor(actor);const key=dialogKey(actor),existing=dialogs.get(key);if(existing?.rendered)return existing.bringToFront();const content=document.createElement("div");content.innerHTML=trackerHtml(actor);const dialog=new foundry.applications.api.DialogV2({window:{title:`Madara Cells Tracker — ${actor.name}`,icon:"fa-solid fa-eye",resizable:true},position:{width:720,height:"auto"},classes:["n5eb-madara-tracker-window"],content,buttons:[{action:"close",label:"Close"}]});dialogs.set(key,dialog);dialog.addEventListener("render",()=>activateDialog(dialog,actor));dialog.addEventListener("close",()=>dialogs.delete(key),{once:true});await dialog.render({force:true});return dialog;}
function activateDialog(dialog,actor){
  const root=dialog.element?.querySelector?.("[data-madara-root]");if(!root)return;const run=task=>task().catch(error=>{console.error(`${MODULE_ID} | Madara Cells automation failed`,error);ui.notifications.error(`Madara Cells automation failed: ${error.message}`);});root.addEventListener("click",event=>{const action=event.target.closest("[data-action]")?.dataset.action;if(!action)return;run(async()=>{const state=readTracker(actor);if(action==="legacy-minus")await changeLegacy(actor,-1);else if(action==="legacy-plus")await changeLegacy(actor,1);else if(action==="mastered")await activateMastered(actor);else if(action==="defence")await spendDefence(actor);else if(action==="refill-defence")await refillDefence(actor);else if(action==="sharingan")await replenishSharingan(actor);else if(action==="toggle-sharingan"&&getLevel(actor)<4)await writeTracker(actor,{sharinganActive:!state.sharinganActive});else if(action==="mutation")await chooseMutation(actor);else if(action==="hatred")await hatredCheck(actor,{escape:true});else if(action==="trigger-hatred"&&game.user.isGM)await writeTracker(actor,{hatred:true});else if(action==="stabilize")await writeTracker(actor,{zeroHatredTurns:0});else if(action==="mangekyo")await convertMangekyo(actor);else if(action==="configure-jutsu")await configureLegacyJutsu(actor);else if(action==="sync-chakra")await attemptSynchronization(actor,"chakra");else if(action==="sync-medicine")await attemptSynchronization(actor,"medicine");else if(action==="reset-sync"&&game.user.isGM)await writeTracker(actor,{chakraSyncFailed:false,medicineFailures:0,cellsIncompatible:false,lastSyncResult:""});else if(action==="reset-takeover"&&game.user.isGM)await writeTracker(actor,{lostToHatred:false,zeroHatredTurns:0,hatred:false,hatredDc:16});else if(action==="restore")await writeTracker(actor,{legacy:maxLegacy(actor),defence:maxDefence(actor),defenceRoundKey:"",defenceUsedRound:0,defenceTurnKey:""});});});
}

function renderRoot(app,html){if(html?.querySelector)return html;if(html?.[0]?.querySelector)return html[0];if(app?.element?.querySelector)return app.element;if(app?.element?.[0]?.querySelector)return app.element[0];return null;}
function injectTrackerStrip(app,html){const actor=actorFromContext(app);if(!actor||!getClassMod(actor))return;const root=renderRoot(app,html);if(!root||root.querySelector("[data-madara-strip]"))return;const target=root.querySelector(".jutsu-casting-overview")??root.querySelector(".sheet-body")??root.querySelector("[data-tab='attributes']")??root.querySelector(".window-content");if(!target)return;const state=readTracker(actor),section=document.createElement("section");section.className="n5eb-madara-tracker-strip";section.dataset.madaraStrip="true";section.innerHTML=`<button type="button" class="tracker-title" data-action="open-madara"><img src="${ICON}" alt=""> Madara Cells</button><div class="tracker-mini"><span>Legacy</span><strong>${state.legacy}/${maxLegacy(actor)}</strong></div><div class="tracker-mini"><span>Defence</span><strong>${state.defence}/${maxDefence(actor)}</strong></div><div class="tracker-mini"><span>Sharingan</span><strong>${state.sharinganActive?"ACTIVE":"OFF"}</strong></div><div class="tracker-mini"><span>Hatred</span><strong>${getLevel(actor)>=5?"REMOVED":state.hatred?"ACTIVE":`DC ${state.hatredDc}`}</strong></div>`;target.prepend(section);section.querySelector("[data-action='open-madara']")?.addEventListener("click",()=>openTracker(actor));}
function renderRuntime(app,html){injectTrackerStrip(app,html);queueMicrotask(()=>injectTrackerStrip(app,app?.element));}
function validateLevelChange(item,changes){if(!isMadaraClassMod(item))return;const proposed=foundry.utils.getProperty(changes,"system.levels");if(proposed==null)return;const next=clamp(Math.floor(Number(proposed)||1),1,5),actor=item.parent;if(actor?.documentName==="Actor"&&charLevel(actor)<LEVEL_REQUIREMENTS[next]){ui.notifications.warn(`Madara Cells level ${next} requires character level ${LEVEL_REQUIREMENTS[next]}+.`);return false;}}
function canUseLegacyJutsu(actor,item){const kind=configuredLegacyItem(actor,item);if(!kind)return;const cost=legacyJutsuCost(actor,item,kind),available=availableLegacy(actor);if(cost>available){ui.notifications.warn(`${item.name} requires ${cost} Legacy Chakra; only ${available} is available.`);return false;}}
async function processLegacyJutsuUse(actor,item){const kind=configuredLegacyItem(actor,item);if(kind)await spendLegacy(actor,legacyJutsuCost(actor,item,kind),item.name);}

Hooks.once("ready",async()=>{globalThis.N5eBMadaraCells=Object.freeze({openTracker,getTracker:readTracker,setTracker:writeTracker,syncActor:ensureActor,spendLegacy,spendDefence,activateMastered,hatredCheck,replenishSharingan,convertMangekyo,configureLegacyJutsu,attemptSynchronization,renderTrackerStrip:injectTrackerStrip});if(game.system.id!=="n5eb")return;for(const actor of game.actors??[])if(getClassMod(actor)&&actor.isOwner)await queue(actor,()=>ensureActor(actor));});
Hooks.on("getActorSheetHeaderButtons",(sheet,buttons)=>{const actor=actorFromContext(sheet);if(!actor||!getClassMod(actor))return;const state=readTracker(actor);buttons.unshift({label:`Legacy ${state.legacy}/${maxLegacy(actor)} · MD ${state.defence}/${maxDefence(actor)}`,class:"n5eb-madara-tracker-button",icon:"fas fa-eye",onclick:()=>openTracker(actor)});});
Hooks.on("getHeaderControlsApplicationV2",(app,controls)=>{const actor=actorFromContext(app);if(!actor||!getClassMod(actor))return;const state=readTracker(actor);controls.unshift({action:"n5ebMadaraTracker",label:`Madara Cells ${state.legacy}/${maxLegacy(actor)}`,icon:"fa-solid fa-eye",classes:"n5eb-madara-tracker-button",visible:true,ownership:"OWNER",onClick:()=>openTracker(actor)});});
Hooks.on("renderActorSheet",renderRuntime);Hooks.on("renderCharacterActorSheet",renderRuntime);Hooks.on("renderApplicationV2",renderRuntime);
Hooks.on("preCreateItem",(item,data,options,userId)=>{if(options?.[INTERNAL]||userId!==game.user.id||item.parent?.documentName!=="Actor"||!isMadaraClassMod(item))return;if(charLevel(item.parent)<LEVEL_REQUIREMENTS[1]){ui.notifications.warn(`Madara Cells requires character level ${LEVEL_REQUIREMENTS[1]}+.`);return false;}});
Hooks.on("preUpdateItem",(item,changes,options,userId)=>{if(options?.[INTERNAL]||userId!==game.user.id||item.parent?.documentName!=="Actor")return;return validateLevelChange(item,changes);});
Hooks.on("createItem",async(item,options,userId)=>{if(options?.[INTERNAL]||userId!==game.user.id||item.parent?.documentName!=="Actor")return;const actor=item.parent;if(isMadaraClassMod(item)||getClassMod(actor))await queue(actor,()=>ensureActor(actor));});
Hooks.on("updateItem",async(item,changes,options,userId)=>{if(options?.[INTERNAL]||userId!==game.user.id||item.parent?.documentName!=="Actor")return;const actor=item.parent;if(getClassMod(actor))await queue(actor,()=>ensureActor(actor));});
Hooks.on("deleteItem",async(item,options,userId)=>{if(options?.[INTERNAL]||userId!==game.user.id||item.parent?.documentName!=="Actor")return;const actor=item.parent;if(isMadaraClassMod(item))await cleanupActor(actor);else if(getClassMod(actor)){const state=readTracker(actor);if(state.legacyJutsu[item.id]){const next={...state.legacyJutsu};delete next[item.id];await writeTracker(actor,{legacyJutsu:next},{render:false});}await queue(actor,()=>ensureActor(actor));}});
Hooks.on("updateCombat",async(combat,changes,options,userId)=>{if(userId!==game.user.id||(!Object.hasOwn(changes,"turn")&&!Object.hasOwn(changes,"round")))return;const previousId=combatLastActor.get(combat.id),current=combat.combatant?.actor;if(previousId&&previousId!==current?.id){const previous=game.actors.get(previousId);if(previous&&getClassMod(previous))await queue(previous,()=>processTurnEnd(previous));}if(current){combatLastActor.set(combat.id,current.id);if(getClassMod(current))await queue(current,()=>processTurnStart(current,combat));}});
Hooks.on("deleteCombat",combat=>combatLastActor.delete(combat.id));
Hooks.on("dnd5e.preUseActivity",activity=>{const item=getActivityItem(activity),actor=activity?.actor??item?.actor;if(!actor||!getClassMod(actor)||!item)return;return canUseLegacyJutsu(actor,item);});
Hooks.on("dnd5e.postUseActivity",activity=>{const item=getActivityItem(activity),actor=activity?.actor??item?.actor;if(!actor||!getClassMod(actor)||!item||!configuredLegacyItem(actor,item))return;queue(actor,()=>processLegacyJutsuUse(actor,item)).catch(error=>{console.error(`${MODULE_ID} | Legacy Jutsu processing failed`,error);ui.notifications.error(`Madara Cells Legacy Chakra failed: ${error.message}`);});});
Hooks.on("dnd5e.restCompleted",(actor,result)=>{if(getClassMod(actor))queue(actor,()=>applyRest(actor,result?.type)).catch(console.error);});
Hooks.on("updateActor",async(actor,changes,options,userId)=>{if(options?.[INTERNAL]||userId!==game.user.id||!getClassMod(actor))return;const hp=foundry.utils.getProperty(changes,"system.attributes.hp.value");if(hp!==undefined){const state=readTracker(actor),maximum=Math.max(1,Number(actor.system?.attributes?.hp?.max??1)),patch={};if(Number(hp)>0&&state.zeroHatredTurns)patch.zeroHatredTurns=0;if(Number(hp)/maximum>=.25&&!state.hatred&&state.hatredDc!==16)patch.hatredDc=16;if(Object.keys(patch).length)await writeTracker(actor,patch,{render:false,effects:false,syncJutsu:false});}await queue(actor,()=>ensureActor(actor));refreshDialog(actor);});
