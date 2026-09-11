const MODULE_ID = "n5eb-classmod-library";
const CLASSMOD_ID = "cursed-seal";
const TRACKER_FLAG = "cursedSealTracker";
const TRACKER_VERSION = 3;
const INTERNAL = MODULE_ID;
const ICON = "systems/n5eb/assets/content/classmod-icons/cursed-seal/cursemark-second-state.webp";
const PACK_COLLECTION = "world.n5eb-custom-class-mods";
const CHAKRA_BY_LEVEL = Object.freeze({1:20,2:40,3:60,4:80,5:100});
const ARTS_BY_LEVEL = Object.freeze({1:2,2:4,3:6,4:8,5:10});
const LEVEL_CORRUPTION = Object.freeze({1:0,2:5,3:10,4:15,5:20});
const LEVEL_CHARACTER = Object.freeze({1:8,2:8,3:11,4:11,5:15});
const STAGE_REQUIREMENTS = Object.freeze({1:{level:1,corruption:1},2:{level:3,corruption:10},3:{level:5,corruption:20}});
const NORMAL_COST = Object.freeze({d:3,c:7,b:11,a:15,s:20,e:3});
const ART_COST = Object.freeze({d:2,c:4,b:7,a:10,s:15,e:2});
const CHOSEN_REDUCTION = Object.freeze({d:1,c:2,b:3,a:4,s:5,e:1});
const RANK_ORDER = Object.freeze({e:0,d:1,c:2,b:3,a:4,s:5});
const STANDARD_JUTSU_TYPES = new Set(["ninjutsu","genjutsu","taijutsu","bukijutsu"]);
const REPEATABLE_BOOSTS = new Set(["critical","effort","penetration"]);
const queues = new Map();
const dialogs = new Map();
let catalogCache = null;

const arr = value => Array.from(value ?? []);
const clamp = (n,min,max) => Math.min(max,Math.max(min,Number(n)||0));
const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const flag = (doc,key) => doc?.getFlag?.(MODULE_ID,key) ?? doc?.flags?.[MODULE_ID]?.[key];
function queue(actor, task){
  const key=actor?.uuid??actor?.id;
  if(!key)return Promise.resolve().then(task);
  const previous=queues.get(key)??Promise.resolve();
  const next=previous.catch(()=>{}).then(task);
  const tracked=next.finally(()=>{if(queues.get(key)===tracked)queues.delete(key);});
  queues.set(key,tracked);
  return tracked;
}
function actorFromContext(actor){return actor ?? canvas.tokens?.controlled?.[0]?.actor ?? game.user.character ?? null;}
function getClassMod(actor){return arr(actor?.items).find(i=>i.type==="classmod"&&i.system?.identifier===CLASSMOD_ID)??arr(actor?.items).find(i=>i.type==="classmod"&&flag(i,"classMod")===CLASSMOD_ID&&flag(i,"category")==="classmod")??null;}
function getLevel(actor){return Math.max(0,Number(getClassMod(actor)?.system?.levels??0));}
function charLevel(actor){return Math.max(0,Number(actor?.system?.details?.level??0));}
function prof(actor){return Math.max(0,Number(actor?.system?.attributes?.prof??0));}
function maxCursedChakra(actor){return CHAKRA_BY_LEVEL[Math.min(5,Math.max(1,getLevel(actor)))]??20;}
function artsKnown(actor){return ARTS_BY_LEVEL[Math.min(5,Math.max(1,getLevel(actor)))]??2;}
function normalizeRank(rank){const value=String(rank??"d").trim().toLowerCase();return Object.hasOwn(RANK_ORDER,value)?value:"d";}
function rankAtLeast(rank,minimum){return (RANK_ORDER[normalizeRank(rank)]??0)>=(RANK_ORDER[normalizeRank(minimum)]??0);}
function titleRank(rank){return normalizeRank(rank).toUpperCase();}
function artValues(actor){return {attack:Math.floor(charLevel(actor)/2)+getLevel(actor)+prof(actor),save:10+Math.floor(charLevel(actor)/2)+prof(actor)};}
function getActivityItem(activity){return activity?.item ?? activity?.parent?.item ?? null;}
function isCursedArt(item){return Boolean(flag(item,"cursedArt"));}
function jutsuType(item){return String(item?.system?.jutsu?.type??"").toLowerCase();}
function isNormalJutsu(item){return item?.type==="spell"&&STANDARD_JUTSU_TYPES.has(jutsuType(item))&&!isCursedArt(item);}
function keywords(item){return arr(item?.system?.jutsu?.keywords).map(k=>String(k).toLowerCase());}
function isCombination(item){return keywords(item).some(k=>k.includes("combination"));}
function cursedArts(actor){return arr(actor?.items).filter(isCursedArt);}
function getSealType(actor,state=readTracker(actor)){
  const owned=arr(actor?.items).map(i=>flag(i,"cursedSealType")).find(Boolean);
  return String(owned??state.sealType??"").toLowerCase();
}
function stageAvailable(actor,stage,state=readTracker(actor)){
  const req=STAGE_REQUIREMENTS[stage]; return Boolean(req&&getLevel(actor)>=req.level&&state.corruption>=req.corruption);
}
function highestStage(actor,state=readTracker(actor)){for(const stage of [3,2,1])if(stageAvailable(actor,stage,state))return stage;return 0;}
function stageDurationSeconds(actor,stage){
  const lvl=getLevel(actor); let seconds=60;
  if(stage===1){if(lvl>=5)seconds=3600;else if(lvl>=3)seconds=600;}
  else if(stage===2&&lvl>=4)seconds=600;
  if(lvl>=5)seconds*=10; // The Chosen
  return seconds;
}
function stageExitHitDice(stage){return stage===3?3:stage===2?2:stage===1?1:0;}
function trackerDefault(actor){const max=maxCursedChakra(actor);return {version:TRACKER_VERSION,cursedChakra:max,cursedChakraMax:max,corruption:0,activeStage:0,tempCursedChakra:0,sealType:"",drTypes:[],drTypesByStage:{1:[],2:[],3:[]},hitDicePenalty:0,initiativeActivationUsed:false,longActivationHpUsed:false,longActivationChakraUsed:false,stage3FreeArtsUsed:0,magnifiedArtId:"",magnifiedBoosts:[],magnifiedBoostChangeAvailable:true,peaceHalfCost:false,lastStageStartedAt:0};}
function normalizeTracker(raw,actor){
  const base=trackerDefault(actor), max=maxCursedChakra(actor), oldMax=Math.max(0,Number(raw?.cursedChakraMax??max));
  let current=Number(raw?.cursedChakra??max); if(!Number.isFinite(current))current=max;
  if(oldMax<max)current+=max-oldMax;
  const temp=Math.max(0,Math.floor(Number(raw?.tempCursedChakra??0)));
  const corruption=clamp(Math.floor(Number(raw?.corruption??0)),0,20);
  const activeStage=clamp(Math.floor(Number(raw?.activeStage??0)),0,3);
  const legacy=arr(raw?.drTypes).map(String);
  const stored=raw?.drTypesByStage??{};
  const drTypesByStage={1:arr(stored[1]??stored["1"]??(legacy.length===1?legacy:[])).map(String),2:arr(stored[2]??stored["2"]??(legacy.length===2?legacy:[])).map(String),3:arr(stored[3]??stored["3"]??(legacy.length>=3?legacy:[])).map(String)};
  const activeDr=activeStage?arr(drTypesByStage[activeStage]).slice(0,activeStage):legacy;
  return {...base,...raw,version:TRACKER_VERSION,cursedChakraMax:max,cursedChakra:clamp(current,0,max+temp),corruption,activeStage:stageAvailable(actor,activeStage,{...base,...raw,corruption})?activeStage:0,tempCursedChakra:temp,drTypes:activeDr,drTypesByStage,hitDicePenalty:Math.max(0,Math.floor(Number(raw?.hitDicePenalty??0))),stage3FreeArtsUsed:Math.max(0,Math.floor(Number(raw?.stage3FreeArtsUsed??0))),magnifiedBoosts:arr(raw?.magnifiedBoosts).map(String)};
}
function readTracker(actor){return normalizeTracker(actor?.getFlag?.(MODULE_ID,TRACKER_FLAG)??{},actor);}
async function writeTracker(actor,patch={}, {render=true,sync=true}={}){
  if(!actor?.isOwner)return readTracker(actor); const current=readTracker(actor), next=normalizeTracker({...current,...patch},actor);
  await actor.update({[`flags.${MODULE_ID}.${TRACKER_FLAG}`]:next},{[INTERNAL]:{cursedSealTracker:true}});
  if(sync)await syncActorMechanics(actor,next);
  if(render)actor.sheet?.render?.(false); refreshDialog(actor); return next;
}
async function ensureTracker(actor){const raw=actor?.getFlag?.(MODULE_ID,TRACKER_FLAG);const next=normalizeTracker(raw??{},actor);if(JSON.stringify(raw??{})!==JSON.stringify(next))await actor.update({[`flags.${MODULE_ID}.${TRACKER_FLAG}`]:next},{[INTERNAL]:{cursedSealTracker:true}});return next;}

function addChange(changes,key,value,mode=CONST.ACTIVE_EFFECT_MODES.ADD,priority=20){if(value===undefined||value===null||value==="")return;changes.push({key,mode,value:String(value),priority});}
function effectByFlag(actor,key){return arr(actor?.effects).find(e=>flag(e,key));}
async function syncCorruptionEffect(actor,state=readTracker(actor)){
  let effect=effectByFlag(actor,"cursedSealCorruptionEffect"); const changes=[];
  if(state.corruption>=13)for(const ability of ["str","dex","con","int","wis","cha"])addChange(changes,`system.abilities.${ability}.bonuses.save`,1);
  if(!changes.length){if(effect)await effect.delete({[INTERNAL]:{cursedSealEffect:true}});return;}
  const data={name:`Cursed Seal — Corruption ${state.corruption}`,img:ICON,disabled:false,transfer:false,changes,flags:{[MODULE_ID]:{cursedSealCorruptionEffect:true}}};
  if(!effect)[effect]=await actor.createEmbeddedDocuments("ActiveEffect",[data],{[INTERNAL]:{cursedSealEffect:true}});else if(JSON.stringify(effect.changes??[])!==JSON.stringify(changes)||effect.name!==data.name)await effect.update(data,{[INTERNAL]:{cursedSealEffect:true}});
}
function stageChanges(actor,state){
  const changes=[],stage=state.activeStage;if(!stage)return changes;const bonus=stage===1?1:2;
  for(const ability of ["str","dex","con","int","wis","cha"]){addChange(changes,`system.abilities.${ability}.bonuses.check`,bonus);addChange(changes,`system.abilities.${ability}.bonuses.save`,bonus);}
  const dr=stage===1?5:stage===2?10:15; const needed=stage;
  for(const type of arr(state.drTypes).slice(0,needed)){const key=String(type).toLowerCase();if(key)addChange(changes,`system.traits.dm.amount.${key}`,-dr);}
  return changes;
}
async function syncStageEffect(actor,state=readTracker(actor)){
  let effect=effectByFlag(actor,"cursedSealStageEffect");
  if(!state.activeStage){if(effect)await effect.delete({[INTERNAL]:{cursedSealEffect:true}});return;}
  const seconds=stageDurationSeconds(actor,state.activeStage), data={name:`Cursed Seal Release — Stage ${state.activeStage}`,img:ICON,disabled:false,transfer:false,duration:{seconds,startTime:Number(state.lastStageStartedAt||game.time.worldTime||0)},changes:stageChanges(actor,state),flags:{[MODULE_ID]:{cursedSealStageEffect:true,cursedSealStage:state.activeStage}}};
  if(!effect)[effect]=await actor.createEmbeddedDocuments("ActiveEffect",[data],{[INTERNAL]:{cursedSealEffect:true}});else {const changed=effect.name!==data.name||JSON.stringify(effect.changes??[])!==JSON.stringify(data.changes)||Number(effect.duration?.seconds??0)!==seconds;if(changed)await effect.update(data,{[INTERNAL]:{cursedSealEffect:true}});}
}
async function ensureClassModFormulas(actor){const cm=getClassMod(actor);if(!cm)return;const v=artValues(actor),expected={"system.attackBonus.value":String(v.attack),"system.attackBonus.formula":"floor(@details.level/2)+@classmods.cursed-seal.levels+@prof","system.attackBonus.scaling":"","system.save.value":String(v.save),"system.save.formula":"10+floor(@details.level/2)+@prof","system.save.scaling":""},updates={};for(const [path,val] of Object.entries(expected)){if(String(foundry.utils.getProperty(cm,path)??"")!==String(val))updates[path]=val;}if(Object.keys(updates).length)await cm.update(updates,{[INTERNAL]:{cursedSealFormula:true}});}

function cloneJson(value){return foundry.utils.deepClone(value??{});}
function addDiceToFormula(formula,amount){if(!amount)return String(formula??"");let used=false;return String(formula??"").replace(/(\d*)d(\d+)/i,(m,n,s)=>{if(used)return m;used=true;const count=Math.max(1,Number(n||1)+amount);return `${count}d${s}`;});}
function reduceDiceInFormula(formula,amount){if(!amount)return String(formula??"");let used=false;return String(formula??"").replace(/(\d*)d(\d+)/i,(m,n,s)=>{if(used)return m;used=true;const count=Math.max(1,Number(n||1)-amount);return `${count}d${s}`;});}
function stepDiceFormula(formula){const step={4:6,6:8,8:10,10:12,12:20};return String(formula??"").replace(/(\d*)d(4|6|8|10|12)/gi,(m,n,s)=>`${n||1}d${step[Number(s)]??s}`);}
function rerollLowFormula(formula){return String(formula??"").replace(/(\d*d\d+)(?![a-zA-Z0-9<>])/gi,(m)=>m.includes("r")?m:`${m}r<=2`);}
function updateDamageParts(baseDamage,{extraDice=0,power=false,reroll=false,flurry=false}={}){
  const damage=cloneJson(baseDamage??{parts:[],versatile:""}); damage.parts=arr(damage.parts).map(part=>arr(part));
  if(damage.parts.length&&extraDice)damage.parts[0][0]=addDiceToFormula(damage.parts[0][0],extraDice);
  if(power)for(const part of damage.parts)part[0]=stepDiceFormula(part[0]);
  if(flurry&&damage.parts.length)damage.parts[0][0]=reduceDiceInFormula(damage.parts[0][0],3);
  if(reroll)for(const part of damage.parts)part[0]=rerollLowFormula(part[0]);
  if(damage.versatile){if(extraDice)damage.versatile=addDiceToFormula(damage.versatile,extraDice);if(power)damage.versatile=stepDiceFormula(damage.versatile);if(flurry)damage.versatile=reduceDiceInFormula(damage.versatile,3);if(reroll)damage.versatile=rerollLowFormula(damage.versatile);}
  return damage;
}
function boostKeys(item,state=readTracker(item?.actor)){
  const base=arr(flag(item,"cursedArtBoosts")); if(state.magnifiedArtId===item.id)return [...base,...arr(state.magnifiedBoosts)]; return base;
}
function boostCount(boosts,key){return boosts.filter(b=>b===key).length;}
function currentArtCost(actor,item,state=readTracker(actor)){
  const rank=normalizeRank(flag(item,"cursedArtRank")??item.system?.rank), boosts=boostKeys(item,state), seal=getSealType(actor,state); let cost=ART_COST[rank]??2;
  cost-=2*boostCount(boosts,"efficiency");
  if(state.corruption>=17&&rankAtLeast(rank,"b"))cost-=2;
  if(seal==="stars"&&state.activeStage>=2&&rankAtLeast(rank,"b"))cost-=2;
  if(getLevel(actor)>=5)cost-=CHOSEN_REDUCTION[rank]??1;
  if(boostCount(boosts,"presence"))cost+=5;
  cost=Math.max(1,cost);
  if(state.activeStage>=3&&["heaven","sun"].includes(seal)&&state.stage3FreeArtsUsed<2)return 0;
  if(state.peaceHalfCost)cost=Math.max(1,Math.ceil(cost/2));
  return cost;
}
function currentNormalCost(item){let cost=NORMAL_COST[normalizeRank(item?.system?.rank)]??3;if(isCombination(item))cost+=5;return cost;}
function artBase(item){return cloneJson(flag(item,"cursedArtBase")??{});}
function curseSaveOptions(item){
  const type=jutsuType(item), keys=keywords(item);
  if(keys.includes("fuinjutsu"))return ["cha"];
  if(type==="genjutsu")return ["int","wis","cha"];
  if(type==="taijutsu")return ["str","dex","con"];
  return ["str","dex","con","wis"];
}
function curseSaveAbility(item){const chosen=String(flag(item,"cursedArtCurseSaveAbility")??"").toLowerCase();const allowed=curseSaveOptions(item);return allowed.includes(chosen)?chosen:(allowed.includes("dex")?"dex":allowed[0]??"dex");}
function damageTypes(item){return new Set(arr(item?.system?.damage?.parts).map(p=>String(p?.[1]??"").toLowerCase()).filter(Boolean));}
function hasDamage(item,type){return damageTypes(item).has(String(type).toLowerCase());}
function validateBoostForSource(key,item){
  const action=String(item?.system?.actionType??"").toLowerCase(), target=String(item?.system?.target?.type??"").toLowerCase(), keys=keywords(item), types=damageTypes(item);
  if(key==="curse"&&!action.includes("ak"))return "Corrupted Curse can only be applied to a Jutsu that makes an attack roll.";
  if(key==="healing"&&!keys.some(k=>k.includes("medical")))return "Corrupted Healing requires the Medical keyword.";
  if(key==="shapes"&&!new Set(["cube","radius","sphere","cone","cylinder","line"]).has(target))return "Corrupted Shapes requires a Cube, Radius/Sphere, Cone, Cylinder or Line shaped Jutsu.";
  const typed={flames:"fire",sky:"lightning",storm:"wind",earth:"earth",sea:"cold",mind:"psychic",sickness:"poison",decay:"necrotic"};
  if(typed[key]&&!types.has(typed[key]))return `${String(key).replaceAll("-"," ")} requires ${typed[key]} damage.`;
  if(key==="seals"&&!keys.some(k=>k.includes("fuinjutsu")))return "Corrupted Seals requires the Fuinjutsu keyword.";
  if(key.startsWith("element-")&&!types.size&&action!=="save")return "Corrupted Element boosts require an Art that deals damage or imposes an effect on a failed save.";
  return "";
}
async function chooseCurseSaveAbility(source){
  const options=curseSaveOptions(source); if(options.length===1)return options[0];
  const labels={str:"Strength",dex:"Dexterity",con:"Constitution",int:"Intelligence",wis:"Wisdom",cha:"Charisma"};
  return foundry.applications.api.DialogV2.wait({window:{title:"Corrupted Curse — Saving Throw"},content:`<form><p>Choose the saving throw used by the Corrupted Curse version of <strong>${esc(source.name)}</strong>.</p><div class="form-group"><label>Saving Throw<select name="ability">${options.map(a=>`<option value="${a}">${labels[a]}</option>`).join("")}</select></label></div></form>`,buttons:[{action:"choose",label:"Use Saving Throw",default:true,callback:(event,button)=>new FormDataExtended(button.form).object.ability},{action:"cancel",label:"Cancel"}],rejectClose:false});
}
function artAutomationDescription(actor,item,state,boosts,cost){
  const base=artBase(item), names=arr(flag(item,"cursedArtBoostNames")); const mag=state.magnifiedArtId===item.id?arr(state.magnifiedBoosts):[];
  const allNames=[...names,...mag.map(k=>String(k).split('-').map(s=>s[0]?.toUpperCase()+s.slice(1)).join(' '))];
  return `<section class="n5eb-cursed-art-summary"><p><strong>Cursed Art Automation</strong> — ${titleRank(base.rank??item.system?.rank)}-Rank; current cost <strong>${cost} Cursed Chakra</strong>.</p><p><strong>Corrupted Boosts:</strong> ${allNames.length?allNames.map(esc).join(', '):'None'}.</p><p>Damage dice, Cursed Art attack/save values, Cursed Power/Corruption bonuses, Stage 2+ rerolls, critical threat and supported boost math are synchronized automatically by the Cursed Seal runtime.</p></section>${base.descriptionValue??item.system?.description?.value??''}`;
}
async function syncOneCursedArt(actor,item,state=readTracker(actor)){
  const base=artBase(item); if(!base?.sourceName)return; const boosts=boostKeys(item,state), seal=getSealType(actor,state); let extra=0;
  if(state.corruption>=7)extra+=2; if(getLevel(actor)>=4&&state.activeStage>=2)extra+=2;
  const damage=updateDamageParts(base.damage,{extraDice:extra,power:boostCount(boosts,"power")>0,reroll:state.activeStage>=2,flurry:boostCount(boosts,"flurry")>0});
  // Corrupted Healing adds dice to the first healing-like damage part when represented in the item's damage data.
  const healingCount=boostCount(boosts,"healing"); if(healingCount&&damage.parts?.length){const index=damage.parts.findIndex(p=>String(p?.[1]??"").toLowerCase().includes("heal"));if(index>=0)damage.parts[index][0]=addDiceToFormula(damage.parts[index][0],(getLevel(actor)+2)*healingCount);}
  let critical=cloneJson(base.critical??{damage:"",threshold:null}); let threshold=Number(critical.threshold??20); if(!Number.isFinite(threshold)||!threshold)threshold=20; threshold-=boostCount(boosts,"critical"); if(seal==="heaven"&&state.activeStage>=2)threshold-=1; critical.threshold=Math.max(1,threshold);
  let range=cloneJson(base.range??{}); if(boostCount(boosts,"distance")){if(String(range.units??"").toLowerCase()==="touch"){range={...range,units:"ft",value:30,long:null};}else if(Number.isFinite(Number(range.value)))range.value=Number(range.value)*3; if(Number.isFinite(Number(range.long)))range.long=Number(range.long)*3;}
  let actionType=base.actionType??item.system?.actionType??"", save=cloneJson(base.save??item.system?.save??{}), attack=cloneJson(base.attack??item.system?.attack??{});
  if(boostCount(boosts,"curse")){actionType="save";save.ability=save.ability||curseSaveAbility(item);save.scaling="art";save.dc=null;attack.bonus="";}else {save.scaling=base.save?.scaling==="flat"?base.save.scaling:"art";if(save.scaling==="art")save.dc=null;attack.bonus="";}
  const cost=currentArtCost(actor,item,state), desired={img:ICON,name:`Corrupted ${base.sourceName}`,"system.damage":damage,"system.critical":critical,"system.range":range,"system.actionType":actionType,"system.save":save,"system.attack":attack,"system.chakra.cost":"0","system.chakra.special":`Cursed Chakra: ${cost} (automatic)`,"system.sourceItem":"classmod:cursed-seal","system.description.value":artAutomationDescription(actor,item,state,boosts,cost)};
  const update={_id:item.id};let changed=false;for(const [path,val] of Object.entries(desired)){const cur=foundry.utils.getProperty(item,path);if(JSON.stringify(cur)!==JSON.stringify(val)){foundry.utils.setProperty(update,path,val);changed=true;}}
  if(changed)await actor.updateEmbeddedDocuments("Item",[update],{[INTERNAL]:{cursedArtSync:true}});
}
async function syncCursedArts(actor,state=readTracker(actor)){for(const item of cursedArts(actor))await syncOneCursedArt(actor,item,state);}

async function syncNormalJutsu(actor,state=readTracker(actor)){
  const active=state.activeStage>0, updates=[];
  for(const item of arr(actor.items)){
    if(!isNormalJutsu(item))continue; const original=flag(item,"cursedSealOriginal");
    if(!active){
      if(!original)continue;
      const u={_id:item.id,
        "system.chakra":cloneJson(original.chakra),
        "system.damage":cloneJson(original.damage),
        "system.critical":cloneJson(original.critical),
        "system.sourceItem":original.sourceItem??"",
        "system.save":cloneJson(original.save),
        "system.attack":cloneJson(original.attack),
        [`flags.${MODULE_ID}.-=cursedSealOriginal`]:null};
      updates.push(u);continue;
    }
    const base=original??{
      chakra:cloneJson(item.system?.chakra),damage:cloneJson(item.system?.damage),critical:cloneJson(item.system?.critical),
      sourceItem:item.system?.sourceItem??"",save:cloneJson(item.system?.save),attack:cloneJson(item.system?.attack)};
    let extra=1;if(getLevel(actor)>=4&&state.activeStage>=2)extra+=1;
    const damage=updateDamageParts(base.damage,{extraDice:extra,reroll:state.activeStage>=2});
    const chakra=cloneJson(base.chakra??{});const cost=currentNormalCost(item);chakra.cost="0";chakra.special=`Cursed Chakra: ${cost} (automatic while released)`;
    const save=cloneJson(base.save??{});save.scaling="art";save.dc=null;
    const attack=cloneJson(base.attack??{});attack.bonus="";
    const u={_id:item.id,"system.chakra":chakra,"system.damage":damage,"system.sourceItem":"classmod:cursed-seal","system.save":save,"system.attack":attack};
    if(!original)u[`flags.${MODULE_ID}.cursedSealOriginal`]=base;updates.push(u);
  }
  if(updates.length)await actor.updateEmbeddedDocuments("Item",updates,{[INTERNAL]:{cursedSealJutsuSync:true}});
}
async function restoreNormalJutsu(actor){const state=readTracker(actor);if(state.activeStage)return;return syncNormalJutsu(actor,state);}

async function syncActorMechanics(actor,state=readTracker(actor)){if(!getClassMod(actor))return;await ensureClassModFormulas(actor);await syncCorruptionEffect(actor,state);await syncStageEffect(actor,state);await syncNormalJutsu(actor,state);await syncCursedArts(actor,state);}
async function ensureActor(actor){if(!getClassMod(actor))return;const state=await ensureTracker(actor);await syncActorMechanics(actor,state);}

function damageTypeOptions(){const cfg=CONFIG.DND5E?.damageTypes??CONFIG.N5EB?.damageTypes??{};const entries=Object.entries(cfg);if(entries.length)return entries.map(([k,v])=>[k,typeof v==="string"?v:(v?.label??k)]);return ["bludgeoning","piercing","slashing","earth","wind","fire","cold","lightning","acid","poison","necrotic","force","psychic","chakra"].map(k=>[k,k[0].toUpperCase()+k.slice(1)]);}
async function chooseDrTypes(actor,stage,state=readTracker(actor),{force=false}={}){
  const count=stage, saved=arr(state.drTypesByStage?.[stage]??state.drTypes).filter(Boolean).slice(0,count);
  if(!force&&saved.length===count)return saved;
  const opts=damageTypeOptions(); const fields=Array.from({length:count},(_,i)=>`<div class="form-group"><label>DR Type ${i+1}<select name="dr${i}">${opts.map(([k,l])=>`<option value="${esc(k)}" ${saved?.[i]===k?'selected':''}>${esc(l)}</option>`).join('')}</select></label></div>`).join('');
  const result=await foundry.applications.api.DialogV2.wait({window:{title:`Cursed Seal Stage ${stage} — Damage Reduction`},content:`<form><p>Choose ${count} damage ${count===1?'type':'types'} for Stage ${stage}. The tracker remembers this choice for later transformations.</p>${fields}</form>`,buttons:[{action:"save",label:"Save Damage Reduction",icon:"fa-solid fa-shield",default:true,callback:(event,button)=>{const o=new FormDataExtended(button.form).object;return Array.from({length:count},(_,i)=>String(o[`dr${i}`]??"")).filter(Boolean);}},{action:"cancel",label:"Cancel"}],rejectClose:false});
  if(!result)return null;
  const drTypesByStage={...(state.drTypesByStage??{}),[stage]:result};
  await writeTracker(actor,{drTypesByStage,drTypes:result},{render:false,sync:false});
  return result;
}
async function activateStage(actor,stage,{fromInitiative=false}={}){
  actor=actorFromContext(actor);if(!actor||!getClassMod(actor))return ui.notifications.warn("No Cursed Seal character is selected.");stage=Number(stage);let state=readTracker(actor);
  if(!stageAvailable(actor,stage,state)){const req=STAGE_REQUIREMENTS[stage];return ui.notifications.warn(`Stage ${stage} requires Cursed Seal level ${req.level} and ${req.corruption} Corruption.`);}
  if(state.cursedChakra<10)return ui.notifications.warn("Cursed Seal Release requires at least 10 Cursed Chakra.");
  let seal=getSealType(actor,state);if(!seal){seal=await chooseSealType(actor);if(!seal)return false;state=readTracker(actor);}
  const drTypes=await chooseDrTypes(actor,stage,state);if(!drTypes)return false;
  const patch={activeStage:stage,drTypes,lastStageStartedAt:Number(game.time.worldTime??0),sealType:seal};
  if(getLevel(actor)>=2&&!state.longActivationChakraUsed){patch.tempCursedChakra=state.corruption;patch.cursedChakra=Math.min(state.cursedChakraMax+state.corruption,state.cursedChakra+state.corruption);patch.longActivationChakraUsed=true;}
  if(state.corruption>=3&&!state.longActivationHpUsed){const amount=5*state.corruption,hp=actor.system?.attributes?.hp??{};await actor.update({"system.attributes.hp.temp":Math.max(Number(hp.temp??0),amount)},{[INTERNAL]:{cursedSealTempHp:true}});patch.longActivationHpUsed=true;}
  if(fromInitiative)patch.initiativeActivationUsed=true;
  state=await writeTracker(actor,patch,{render:false,sync:true});
  ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)}</strong> enters <strong>Cursed Seal Release — Stage ${stage}</strong>. Cursed Chakra: ${state.cursedChakra}/${state.cursedChakraMax}${state.tempCursedChakra?` + ${state.tempCursedChakra} temporary`:''}.</p>`});
  actor.sheet?.render?.(false);return true;
}
async function spendHitDiceOnExit(actor,amount){amount=Math.max(0,Math.floor(Number(amount)||0));if(!amount)return;const hd=actor.system?.attributes?.hd??{};const currentSpent=Number(hd.spent??0);await actor.update({"system.attributes.hd.spent":currentSpent+amount},{[INTERNAL]:{cursedSealHitDice:true}});}
async function removeCursedArtEffects(actor){const ids=arr(actor.effects).filter(effect=>{const origin=String(effect.origin??"");return cursedArts(actor).some(item=>origin.includes(`Item.${item.id}`));}).map(e=>e.id);if(ids.length)await actor.deleteEmbeddedDocuments("ActiveEffect",ids,{[INTERNAL]:{cursedSealEffect:true}});}
async function deactivateSeal(actor,{skipHitDice=false,silent=false}={}){
  actor=actorFromContext(actor);if(!actor||!getClassMod(actor))return;const state=readTracker(actor),stage=state.activeStage;if(!stage)return;
  const penalty=skipHitDice?0:stageExitHitDice(stage), patch={activeStage:0,tempCursedChakra:0,cursedChakra:Math.min(state.cursedChakra,state.cursedChakraMax),drTypes:[],lastStageStartedAt:0,peaceHalfCost:false,hitDicePenalty:state.hitDicePenalty+penalty};
  await actor.update({[`flags.${MODULE_ID}.${TRACKER_FLAG}`]:normalizeTracker({...state,...patch},actor)},{[INTERNAL]:{cursedSealTracker:true}});
  const effect=effectByFlag(actor,"cursedSealStageEffect");if(effect)await effect.delete({[INTERNAL]:{cursedSealEffect:true}});if(penalty)await spendHitDiceOnExit(actor,penalty);await removeCursedArtEffects(actor);await restoreNormalJutsu(actor);await syncCursedArts(actor,readTracker(actor));refreshDialog(actor);actor.sheet?.render?.(false);
  if(!silent)ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)}</strong> exits Cursed Seal Release.${penalty?` ${penalty} Hit ${penalty===1?'Die is':'Dice are'} exhausted until a Full Rest.`:''}</p>`});
}
async function changeCursedChakra(actor,delta,reason="Tracker adjustment"){const s=readTracker(actor),cap=s.cursedChakraMax+s.tempCursedChakra,next=clamp(s.cursedChakra+Number(delta||0),0,cap);await writeTracker(actor,{cursedChakra:next},{render:true,sync:true});if(reason)ui.notifications.info(`Cursed Chakra ${delta>=0?'+':''}${delta}: ${next}/${s.cursedChakraMax}.`);return next;}
async function changeCorruption(actor,delta,reason="Tracker adjustment"){const s=readTracker(actor),change=Number(delta||0);if(change<0){ui.notifications.warn("Corruption is permanent and cannot be reduced. Use the GM Reset only to correct setup mistakes.");return s.corruption;}const next=clamp(s.corruption+change,0,20);await writeTracker(actor,{corruption:next},{render:true,sync:true});ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)} — Corruption:</strong> ${s.corruption} → ${next}. Patron DC ${5+next}.</p>`});return next;}
async function spendCursedChakra(actor,amount,reason="Cursed Chakra"){amount=Math.max(0,Math.floor(Number(amount)||0));const s=readTracker(actor);if(amount>s.cursedChakra){ui.notifications.warn(`${reason} needs ${amount} Cursed Chakra; only ${s.cursedChakra} remains.`);return false;}await writeTracker(actor,{cursedChakra:s.cursedChakra-amount},{render:false,sync:false});return true;}
function findAvailableClassDie(actor,kind){const aggregate=arr(actor?.system?.attributes?.[kind]?.classes);return aggregate.find(item=>Number(item?.system?.[kind]?.value??0)>0)??arr(Object.values(actor?.classes??{})).find(item=>Number(item?.system?.[kind]?.value??0)>0);}
async function spendChakraDie(actor){actor=actorFromContext(actor);if(!actor||!getClassMod(actor))return;const cd=actor.system?.attributes?.cd??{};if(Number(cd.value??0)<1)return ui.notifications.warn("No Chakra Dice remain.");const denomination=Math.max(2,Number(cd.denomination??8));const roll=await(new Roll(`1d${denomination}`)).evaluate();await roll.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:`${actor.name} — Cursed Chakra Recovery`});const cls=findAvailableClassDie(actor,"cd");if(cls)await cls.update({"system.cd.spent":Number(cls.system?.cd?.spent??0)+1},{[INTERNAL]:{cursedSealRecovery:true}});else await actor.update({"system.attributes.cd.spent":Number(cd.spent??0)+1},{[INTERNAL]:{cursedSealRecovery:true}});
  const gained=Math.max(0,Number(roll.total??0)),chakra=actor.system?.attributes?.chakra??{},normalMax=Number(chakra.max??chakra.value??0),normal=Math.min(normalMax,Number(chakra.value??0)+gained);await actor.update({"system.attributes.chakra.value":normal},{[INTERNAL]:{cursedSealRecovery:true}});const state=readTracker(actor),cap=state.cursedChakraMax+state.tempCursedChakra,cursed=Math.min(cap,state.cursedChakra+(2*gained));await writeTracker(actor,{cursedChakra:cursed},{render:true,sync:false});ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>Cursed Chakra Recovery:</strong> +${gained} normal Chakra and +${2*gained} Cursed Chakra (${cursed}/${state.cursedChakraMax}).</p>`});
}

async function loadCatalog(){if(catalogCache)return catalogCache;const bundle=await foundry.utils.fetchJsonWithTimeout(`modules/${MODULE_ID}/data/cursed-seal.json`);catalogCache={boosts:(bundle.items??[]).filter(i=>i.flags?.[MODULE_ID]?.cursedSealBoost).map(i=>({key:i.flags[MODULE_ID].cursedSealBoost,name:i.name,repeatable:Boolean(i.flags[MODULE_ID].repeatable)})),seals:(bundle.items??[]).filter(i=>i.flags?.[MODULE_ID]?.cursedSealType).map(i=>({key:i.flags[MODULE_ID].cursedSealType,name:i.name,id:i._id,special:Boolean(i.flags[MODULE_ID].specialSeal)}))};return catalogCache;}
function validateBoostPair(keys){const counts={};for(const key of keys){if(!key)continue;counts[key]=(counts[key]??0)+1;if(counts[key]>1&&!REPEATABLE_BOOSTS.has(key))return false;if(counts[key]>2)return false;}return true;}
async function createCursedArt(actor){
  actor=actorFromContext(actor);if(!actor||!getClassMod(actor))return ui.notifications.warn("No Cursed Seal character is selected.");const existing=cursedArts(actor);if(existing.length>=artsKnown(actor))return ui.notifications.warn(`This Cursed Seal level supports ${artsKnown(actor)} Cursed Arts; the limit is already reached.`);
  const usedSources=new Set(existing.map(i=>flag(i,"cursedArtSourceId")));const candidates=arr(actor.items).filter(i=>isNormalJutsu(i)&&!usedSources.has(i.id)&&!rankAtLeast(i.system?.rank,"a"));if(!candidates.length)return ui.notifications.warn("No eligible known B-Rank-or-lower jutsu are available to corrupt.");const catalog=await loadCatalog();const boostOpts=catalog.boosts.map(b=>`<option value="${esc(b.key)}">${esc(b.name)}</option>`).join('');
  const content=`<form class="n5eb-cursed-art-builder"><p>Create a corrupted copy. The original jutsu stays untouched outside Cursed Seal Release.</p><div class="form-group"><label>Known Jutsu<select name="source">${candidates.map(i=>`<option value="${i.id}">${esc(i.name)} (${titleRank(i.system?.rank)})</option>`).join('')}</select></label></div><div class="form-group"><label>Corrupted Boost 1<select name="boost1">${boostOpts}</select></label></div><div class="form-group"><label>Corrupted Boost 2<select name="boost2">${boostOpts}</select></label></div></form>`;
  const result=await foundry.applications.api.DialogV2.wait({window:{title:`Create Cursed Art — ${actor.name}`},content,buttons:[{action:"create",label:"Create Cursed Art",icon:"fa-solid fa-wand-magic-sparkles",default:true,callback:(event,button)=>new FormDataExtended(button.form).object},{action:"cancel",label:"Cancel"}],rejectClose:false});if(!result)return;const source=actor.items.get(result.source);if(!source)return;const boosts=[String(result.boost1),String(result.boost2)];if(!validateBoostPair(boosts))return ui.notifications.warn("A Corrupted Boost can only be selected twice when its rules explicitly allow it (Critical, Effort or Penetration).");
  for(const key of boosts){const problem=validateBoostForSource(key,source);if(problem)return ui.notifications.warn(problem);}
  let curseAbility="";if(boosts.includes("curse")){curseAbility=String(await chooseCurseSaveAbility(source)??"");if(!curseAbility)return;}
  const data=source.toObject();delete data._id;delete data.folder;data.name=`Corrupted ${source.name}`;data.img=ICON;data.system=cloneJson(data.system);data.system.identifier=`corrupted-${source.system?.identifier??source.id}`;data.system.sourceItem="classmod:cursed-seal";data.system.chakra=cloneJson(data.system.chakra??{});data.system.chakra.cost="0";data.system.chakra.special="Cursed Chakra (automatic)";data.system.save=cloneJson(data.system.save??{});data.system.save.scaling="art";data.system.save.dc=null;data.system.attack=cloneJson(data.system.attack??{});data.system.attack.bonus="";data.system.jutsu=cloneJson(data.system.jutsu??{});data.system.jutsu.keywords=Array.from(new Set([...arr(data.system.jutsu.keywords),"class mod art","cursed art"]));
  const base={sourceName:source.name,sourceIdentifier:source.system?.identifier??source.id,rank:normalizeRank(source.system?.rank),damage:cloneJson(source.system?.damage),critical:cloneJson(source.system?.critical),range:cloneJson(source.system?.range),actionType:source.system?.actionType??"",save:cloneJson(source.system?.save),attack:cloneJson(source.system?.attack),chakra:cloneJson(source.system?.chakra),descriptionValue:source.system?.description?.value??""};const boostNames=boosts.map(key=>catalog.boosts.find(b=>b.key===key)?.name??key);
  data.flags=cloneJson(data.flags??{});data.flags[MODULE_ID]={...(data.flags[MODULE_ID]??{}),managed:false,classMod:CLASSMOD_ID,cursedArt:true,cursedArtSourceId:source.id,cursedArtSourceUuid:source.uuid,cursedArtRank:base.rank,cursedArtBoosts:boosts,cursedArtBoostNames:boostNames,cursedArtCurseSaveAbility:curseAbility,cursedArtBase:base};
  const [created]=await actor.createEmbeddedDocuments("Item",[data],{[INTERNAL]:{cursedArtCreate:true}});if(created){await syncOneCursedArt(actor,created,readTracker(actor));ui.notifications.info(`${created.name} was created with fully managed Cursed Chakra and damage math.`);}refreshDialog(actor);actor.sheet?.render?.(false);return created;
}
async function configureMagnifiedArt(actor){actor=actorFromContext(actor);if(!actor||getLevel(actor)<3)return ui.notifications.warn("Magnified Cursed Art unlocks at Cursed Seal level 3.");const state=readTracker(actor),arts=cursedArts(actor);if(!arts.length)return ui.notifications.warn("Create at least one Cursed Art first.");if(state.magnifiedArtId&&!state.magnifiedBoostChangeAvailable)return ui.notifications.warn("The Magnified Art's extra boosts can be changed after a Full Rest.");const catalog=await loadCatalog(),boostOpts=catalog.boosts.map(b=>`<option value="${esc(b.key)}">${esc(b.name)}</option>`).join('');const artField=state.magnifiedArtId?`<input type="hidden" name="art" value="${esc(state.magnifiedArtId)}"><p><strong>Magnified Art:</strong> ${esc(actor.items.get(state.magnifiedArtId)?.name??'Unknown')}</p>`:`<div class="form-group"><label>Magnified Cursed Art<select name="art">${arts.map(i=>`<option value="${i.id}">${esc(i.name)}</option>`).join('')}</select></label></div>`;const result=await foundry.applications.api.DialogV2.wait({window:{title:"Magnified Cursed Art"},content:`<form>${artField}<div class="form-group"><label>Extra Boost 1<select name="boost1">${boostOpts}</select></label></div><div class="form-group"><label>Extra Boost 2<select name="boost2">${boostOpts}</select></label></div></form>`,buttons:[{action:"save",label:"Apply",default:true,callback:(event,button)=>new FormDataExtended(button.form).object},{action:"cancel",label:"Cancel"}],rejectClose:false});if(!result)return;const art=actor.items.get(String(result.art));if(!art)return ui.notifications.warn("The selected Cursed Art no longer exists.");const boosts=[String(result.boost1),String(result.boost2)],combined=[...arr(flag(art,"cursedArtBoosts")),...boosts];if(!validateBoostPair(combined))return ui.notifications.warn("A Corrupted Boost can only be duplicated when its rules explicitly allow it (Critical, Effort or Penetration), and never more than twice total.");const source=actor.items.get(flag(art,"cursedArtSourceId"))??art;for(const key of boosts){const problem=validateBoostForSource(key,source);if(problem)return ui.notifications.warn(problem);}await writeTracker(actor,{magnifiedArtId:art.id,magnifiedBoosts:boosts,magnifiedBoostChangeAvailable:false});}
async function chooseSealType(actor){
  actor=actorFromContext(actor);if(!actor||!getClassMod(actor))return "";
  const existing=arr(actor.items).filter(i=>flag(i,"cursedSealType"));if(existing.length){const key=String(flag(existing[0],"cursedSealType")??"");if(key&&readTracker(actor).sealType!==key)await writeTracker(actor,{sealType:key},{render:false,sync:false});return key;}
  const cat=await loadCatalog();const result=await foundry.applications.api.DialogV2.wait({window:{title:"Choose Cursed Seal Type"},content:`<form><p>Choose the Cursed Seal Type bound to this character. The nine standard seals are the normal choices; Genesis and the Glitched/Unknown seal remain special GM options in the compendium.</p><div class="form-group"><label>Seal Type<select name="seal">${cat.seals.filter(s=>!s.special).map(s=>`<option value="${esc(s.key)}">${esc(s.name)}</option>`).join('')}</select></label></div></form>`,buttons:[{action:"choose",label:"Bind Cursed Seal",default:true,callback:(event,button)=>new FormDataExtended(button.form).object.seal},{action:"cancel",label:"Cancel"}],rejectClose:false});if(!result)return "";const source=cat.seals.find(s=>s.key===result);if(!source)return "";const pack=game.packs.get(PACK_COLLECTION);const doc=await pack?.getDocument(source.id);if(!doc){ui.notifications.error("Cursed Seal Type could not be loaded from the compendium.");return "";}const data=doc.toObject();delete data._id;await actor.createEmbeddedDocuments("Item",[data],{[INTERNAL]:{cursedSealType:true}});await writeTracker(actor,{sealType:source.key},{render:false,sync:false});return source.key;
}

async function quickToggleRelease(actor){
  actor=actorFromContext(actor);if(!actor||!getClassMod(actor))return;
  let state=readTracker(actor);if(state.activeStage)return deactivateSeal(actor);
  if(state.corruption<1){
    const accepted=await foundry.applications.api.DialogV2.confirm({window:{title:`Accept Corruption — ${actor.name}`},content:`<p>Activating the Cursed Seal for the first time requires accepting <strong>1 permanent rank of Corruption</strong>. This cannot normally be removed.</p><p>Accept Corruption and enter Stage 1?</p>`});
    if(!accepted)return false;await changeCorruption(actor,1,"Cursed Seal Release");state=readTracker(actor);
  }
  const stage=highestStage(actor,state);if(!stage)return ui.notifications.warn("No Cursed Seal Release Stage is currently available.");
  return activateStage(actor,stage);
}
function progressionStatus(actor,state=readTracker(actor)){
  const level=getLevel(actor);if(level>=5)return {ready:false,label:"Maximum Class Mod level reached."};
  const next=level+1,needCorruption=LEVEL_CORRUPTION[next]??0,needLevel=LEVEL_CHARACTER[next]??0;
  const ready=state.corruption>=needCorruption&&charLevel(actor)>=needLevel;
  return {ready,next,needCorruption,needLevel,label:ready?`Ready for Cursed Seal level ${next}`:`Level ${next} requires character level ${needLevel}+ and ${needCorruption} Corruption`};
}
function validateClassModLevelChange(item,changes){
  if(item?.type!=="classmod"||item?.system?.identifier!==CLASSMOD_ID)return;
  const proposed=foundry.utils.getProperty(changes,"system.levels");if(proposed==null)return;
  const current=Math.max(1,Number(item.system?.levels??1)),next=clamp(Math.floor(Number(proposed)||current),1,5);if(next<=current)return;
  const actor=item.parent;if(actor?.documentName!=="Actor")return;
  const state=readTracker(actor),needCorruption=LEVEL_CORRUPTION[next]??0,needLevel=LEVEL_CHARACTER[next]??0;
  if(charLevel(actor)<needLevel||state.corruption<needCorruption){ui.notifications.warn(`Cursed Seal level ${next} requires character level ${needLevel}+ and ${needCorruption} Corruption. Current: character level ${charLevel(actor)}, Corruption ${state.corruption}.`);return false;}
}


async function processActivityUse(actor,item){let state=readTracker(actor);if(isCursedArt(item)){const cost=currentArtCost(actor,item,state);if(!await spendCursedChakra(actor,cost,item.name))return;const patch={};const seal=getSealType(actor,state);if(cost===0&&state.activeStage>=3&&["heaven","sun"].includes(seal))patch.stage3FreeArtsUsed=state.stage3FreeArtsUsed+1;if(state.peaceHalfCost)patch.peaceHalfCost=false;if(Object.keys(patch).length)state=await writeTracker(actor,patch,{render:false,sync:true});}
  else if(isNormalJutsu(item)&&state.activeStage){const cost=currentNormalCost(item);await spendCursedChakra(actor,cost,item.name);}
  refreshDialog(actor);
}
function canUseActivity(actor,item){const state=readTracker(actor);if(isCursedArt(item)){if(!state.activeStage){ui.notifications.warn("Cursed Arts can only be used during Cursed Seal Release.");return false;}const cost=currentArtCost(actor,item,state);if(cost>state.cursedChakra){ui.notifications.warn(`${item.name} requires ${cost} Cursed Chakra; only ${state.cursedChakra} remains.`);return false;}}
  else if(isNormalJutsu(item)&&state.activeStage){const cost=currentNormalCost(item);if(cost>state.cursedChakra){ui.notifications.warn(`${item.name} requires ${cost} Cursed Chakra; only ${state.cursedChakra} remains.`);return false;}}
}

async function applyRest(actor,type){let state=readTracker(actor);if(type==="short"){const patch={initiativeActivationUsed:false};if(getLevel(actor)>=5)patch.cursedChakra=state.cursedChakraMax;await writeTracker(actor,patch,{render:false,sync:true});}
  else if(type==="long"){const patch={initiativeActivationUsed:false,longActivationHpUsed:false,longActivationChakraUsed:false};if(getLevel(actor)>=5)patch.cursedChakra=state.cursedChakraMax;await writeTracker(actor,patch,{render:false,sync:true});}
  else if(type==="full"){
    if(state.activeStage)await deactivateSeal(actor,{skipHitDice:true,silent:true});
    state=readTracker(actor);
    // Full Rest restores the Hit Dice that were specifically exhausted by leaving a Cursed Seal stage.
    // Clamp at zero because the system may already have restored them before this hook fires.
    if(state.hitDicePenalty>0){
      const hd=actor.system?.attributes?.hd??{};
      const spent=Math.max(0,Number(hd.spent??0));
      const restored=Math.max(0,spent-state.hitDicePenalty);
      if(restored!==spent)await actor.update({"system.attributes.hd.spent":restored},{[INTERNAL]:{cursedSealFullRest:true}});
    }
    await writeTracker(actor,{cursedChakra:state.cursedChakraMax,tempCursedChakra:0,hitDicePenalty:0,initiativeActivationUsed:false,longActivationHpUsed:false,longActivationChakraUsed:false,stage3FreeArtsUsed:0,magnifiedBoostChangeAvailable:state.magnifiedArtId?true:state.magnifiedBoostChangeAvailable,peaceHalfCost:false},{render:false,sync:true});
  }
  actor.sheet?.render?.(false);refreshDialog(actor);
}
async function cleanupActor(actor){if(!actor)return;let state=readTracker(actor);if(state.activeStage){state=normalizeTracker({...state,activeStage:0,tempCursedChakra:0,cursedChakra:Math.min(state.cursedChakra,state.cursedChakraMax),drTypes:[],lastStageStartedAt:0,peaceHalfCost:false},actor);await actor.update({[`flags.${MODULE_ID}.${TRACKER_FLAG}`]:state},{[INTERNAL]:{cursedSealCleanup:true}});}const effects=arr(actor.effects).filter(e=>flag(e,"cursedSealStageEffect")||flag(e,"cursedSealCorruptionEffect"));if(effects.length)await actor.deleteEmbeddedDocuments("ActiveEffect",effects.map(e=>e.id),{[INTERNAL]:{cursedSealEffect:true}});await syncNormalJutsu(actor,state);const arts=cursedArts(actor);if(arts.length)await actor.deleteEmbeddedDocuments("Item",arts.map(i=>i.id),{[INTERNAL]:{cursedSealCleanup:true}});if(actor.getFlag?.(MODULE_ID,TRACKER_FLAG)!==undefined)await actor.update({[`flags.${MODULE_ID}.-=${TRACKER_FLAG}`]:null},{[INTERNAL]:{cursedSealCleanup:true}});refreshDialog(actor);}

function corruptionMilestones(state){
  const c=state.corruption;
  const entries=[
    [1,"Release"],[3,"Activation THP"],[5,"Minor Order"],[7,"Cursed Arts +2 dice"],[10,"Major Order"],
    [13,"+1 Saves"],[15,"Minor + Major Order"],[17,"B+ Arts -2 cost"],[20,"Patron Dominion"]
  ];
  return entries.map(([rank,label])=>({rank,label,active:c>=rank}));
}
function nextCorruptionMilestone(state){return corruptionMilestones(state).find(entry=>!entry.active)??null;}
function sealLabel(key){return String(key||"None").split("-").map(part=>part?part[0].toUpperCase()+part.slice(1):part).join(" ");}
function ownedCursedSummary(actor){
  const items=arr(actor?.items);
  return {
    mutations:items.filter(i=>flag(i,"cursedSealMutation")).length,
    minorOrders:items.filter(i=>flag(i,"cursedSealOrder")&&flag(i,"orderType")==="minor").length,
    majorOrders:items.filter(i=>flag(i,"cursedSealOrder")&&flag(i,"orderType")==="major").length
  };
}
function cursedArtRows(actor,state){
  const arts=cursedArts(actor);
  if(!arts.length)return '<div class="cursed-empty">No Cursed Arts created yet.</div>';
  return arts.map(item=>{
    const rank=normalizeRank(flag(item,"cursedArtRank")??item.system?.rank);
    const boosts=[...arr(flag(item,"cursedArtBoostNames"))];
    if(state.magnifiedArtId===item.id)boosts.push(...arr(state.magnifiedBoosts).map(k=>sealLabel(k)));
    return `<div class="cursed-art-row"><div><strong>${esc(item.name)}</strong><small>${titleRank(rank)}-Rank${state.magnifiedArtId===item.id?' • Magnified':''}</small></div><span>${esc(boosts.join(' • ')||'No boosts')}</span><b>${currentArtCost(actor,item,state)} CC</b></div>`;
  }).join('');
}
function trackerHtml(actor){
  const s=readTracker(actor),level=getLevel(actor),values=artValues(actor),seal=getSealType(actor,s),arts=cursedArts(actor),highest=highestStage(actor,s),summary=ownedCursedSummary(actor),milestones=corruptionMilestones(s),next=nextCorruptionMilestone(s),progression=progressionStatus(actor,s);
  const corruptionPct=clamp((s.corruption/20)*100,0,100);
  const chakraCap=s.cursedChakraMax+s.tempCursedChakra;
  const chakraPct=chakraCap?clamp((s.cursedChakra/chakraCap)*100,0,100):0;
  const stagePills=[1,2,3].map(stage=>{
    const available=stageAvailable(actor,stage,s),active=s.activeStage===stage;
    return `<span class="${active?'active ':''}${available?'available':'locked'}">Stage ${stage}${active?' • Active':available?' • Ready':' • Locked'}</span>`;
  }).join('');
  return `<div class="n5eb-cursed-seal-tracker-dialog" data-cursed-seal-root>
    <p class="tracker-intro">All Cursed Seal resources are stored directly on <strong>${esc(actor.name)}</strong> and are synchronized with the Class Mod automatically. Normal item Uses fields are not used.</p>
    <div class="cursed-hero">
      <img src="${ICON}" alt="Cursed Seal">
      <div><strong>Cursed Seal</strong><span>Level ${level} • ${esc(sealLabel(seal))}</span></div>
      <div class="cursed-release-state ${s.activeStage?'active':''}">${s.activeStage?`Stage ${s.activeStage}`:'Dormant'}</div>
    </div>
    <div class="tracker-grid cursed-input-grid">
      <label>Cursed Chakra<input type="number" min="0" max="${chakraCap}" step="1" data-input="cursed-chakra" value="${s.cursedChakra}"></label>
      <label>Corruption<input type="number" min="${LEVEL_CORRUPTION[level]??0}" max="20" step="1" data-input="corruption" value="${s.corruption}"></label>
    </div>
    <section class="tracker-card"><header><strong>Cursed Chakra</strong><span>${s.cursedChakra} / ${s.cursedChakraMax}${s.tempCursedChakra?` + ${s.tempCursedChakra} temporary`:''}</span></header><div class="tracker-progress cursed-chakra-progress"><span style="width:${chakraPct}%"></span></div><small>While Release is active, supported Ninjutsu, Genjutsu, Taijutsu and Bukijutsu automatically spend this pool instead of normal Chakra.</small></section>
    <section class="tracker-card"><header><strong>Corruption</strong><span>Patron DC ${5+s.corruption}</span></header><div class="tracker-progress corruption-progress"><span style="width:${corruptionPct}%"></span></div><div class="milestone-pills">${milestones.map(m=>`<span class="${m.active?'active':''}">${m.rank}: ${esc(m.label)}</span>`).join('')}</div><small>${next?`Next milestone: ${next.rank} Corruption — ${esc(next.label)}.`:'Maximum Corruption reached.'}</small></section>
    <section class="tracker-card status"><header><strong>Release Status</strong><span>Highest available: ${highest?`Stage ${highest}`:'Locked'}</span></header><div class="status-pills"><span class="${s.activeStage?'':'active'}">Dormant</span>${stagePills}<span class="${seal?'active':''}">${esc(sealLabel(seal))}</span></div><small>${esc(progression.label)}</small></section>
    <section class="cursed-stat-grid">
      <div><span>Cursed Art Attack</span><strong>+${values.attack}</strong></div><div><span>Cursed Art Save</span><strong>DC ${values.save}</strong></div>
      <div><span>Cursed Arts</span><strong>${arts.length}/${artsKnown(actor)}</strong></div><div><span>Hit Dice Exhausted</span><strong>${s.hitDicePenalty}</strong></div>
      <div><span>Mutations Owned</span><strong>${summary.mutations}</strong></div><div><span>Orders Owned</span><strong>${summary.minorOrders} Minor / ${summary.majorOrders} Major</strong></div>
    </section>
    <section class="tracker-card cursed-arts-card"><header><strong>Cursed Arts</strong><span>Automatic cost & damage sync</span></header><div class="cursed-art-list">${cursedArtRows(actor,s)}</div></section>
    <div class="tracker-actions">
      <button type="button" data-action="save"><i class="fas fa-floppy-disk"></i> Save Values</button>
      <button type="button" data-action="corruption-plus"><i class="fas fa-skull"></i> Accept +1 Corruption</button>
      <button type="button" data-action="recover"><i class="fas fa-dice-d20"></i> Spend Chakra Die</button>
      ${!seal?'<button type="button" data-action="seal-type"><i class="fas fa-fingerprint"></i> Choose Seal Type</button>':''}
      <button type="button" data-action="quick-release" ${s.activeStage||highest||s.corruption<1?'':'disabled'}><i class="fas fa-bolt"></i> ${s.activeStage?'End Transformation':s.corruption<1?'Accept Corruption & Stage 1':'Transform — Highest Stage'}</button>
      <button type="button" data-action="configure-dr"><i class="fas fa-shield-halved"></i> Configure Stage DR</button>
      ${[1,2,3].map(stage=>`<button type="button" data-action="stage-${stage}" ${stageAvailable(actor,stage,s)&&!s.activeStage?'':'disabled'}><i class="fas fa-fire-flame-curved"></i> Stage ${stage}</button>`).join('')}
      <button type="button" data-action="deactivate" ${s.activeStage?'':'disabled'}><i class="fas fa-person"></i> End Release</button>
      <button type="button" data-action="create-art" ${arts.length<artsKnown(actor)?'':'disabled'}><i class="fas fa-wand-magic-sparkles"></i> Create Cursed Art</button>
      ${level>=3?`<button type="button" data-action="magnified"><i class="fas fa-burst"></i> ${s.magnifiedArtId?'Configure Magnified Art':'Choose Magnified Art'}</button>`:''}
      <button type="button" data-action="sync"><i class="fas fa-arrows-rotate"></i> Resync Automation</button>
      ${game.user.isGM?'<button type="button" data-action="reset"><i class="fas fa-rotate-left"></i> Reset Tracker</button>':''}
    </div>
  </div>`;
}
function dialogKey(actor){return actor?.uuid??actor?.id;}
function refreshDialog(actor){
  const dialog=dialogs.get(dialogKey(actor));
  if(!dialog?.element)return;
  const wrapper=dialog.element.querySelector('[data-cursed-seal-root]')?.parentElement;
  if(!wrapper)return;
  wrapper.innerHTML=trackerHtml(actor);
  activateTrackerDialog(dialog,actor);
}
async function saveTrackerValues(actor,root){
  const s=readTracker(actor),cap=s.cursedChakraMax+s.tempCursedChakra;
  const chakra=clamp(Number(root.querySelector('[data-input="cursed-chakra"]')?.value??s.cursedChakra),0,cap);
  const requestedCorruption=clamp(Number(root.querySelector('[data-input="corruption"]')?.value??s.corruption),0,20);
  const corruption=Math.max(s.corruption,requestedCorruption);
  await writeTracker(actor,{cursedChakra:chakra,corruption});
}
async function resetTracker(actor){
  if(!game.user.isGM)return;
  if(readTracker(actor).activeStage)await deactivateSeal(actor,{skipHitDice:true,silent:true});
  const fresh=trackerDefault(actor);fresh.sealType=getSealType(actor,readTracker(actor));
  await actor.update({[`flags.${MODULE_ID}.${TRACKER_FLAG}`]:normalizeTracker(fresh,actor)},{[INTERNAL]:{cursedSealTracker:true}});
  await ensureActor(actor);actor.sheet?.render?.(false);refreshDialog(actor);
}
async function openTracker(actor){
  actor=actorFromContext(actor);if(!actor||!getClassMod(actor))return ui.notifications.warn("No Cursed Seal Class Mod found.");
  await ensureActor(actor);const key=dialogKey(actor),existing=dialogs.get(key);if(existing)return existing.bringToFront?.();
  const content=document.createElement('div');content.innerHTML=trackerHtml(actor);
  const d=new foundry.applications.api.DialogV2({window:{title:`Cursed Seal Tracker — ${actor.name}`,icon:"fa-solid fa-skull",resizable:true},position:{width:680,height:"auto"},classes:["n5eb-cursed-seal-tracker-window"],content,buttons:[{action:"close",label:"Close",icon:"fa-solid fa-xmark"}]});
  dialogs.set(key,d);d.addEventListener("render",()=>activateTrackerDialog(d,actor));d.addEventListener("close",()=>dialogs.delete(key),{once:true});await d.render({force:true});return d;
}
function activateTrackerDialog(dialog,actor){
  const root=dialog.element?.querySelector?.('[data-cursed-seal-root]');if(!root||root.dataset.activated==="true")return;root.dataset.activated="true";
  root.addEventListener('click',event=>{
    const button=event.target.closest('button[data-action]');if(!button)return;const action=button.dataset.action;
    const run=fn=>Promise.resolve().then(fn).catch(error=>{console.error(`${MODULE_ID} | Cursed Seal tracker action failed`,error);ui.notifications.error(`Cursed Seal tracker failed: ${error.message}`);}).finally(()=>refreshDialog(actor));
    if(action==='save')run(()=>saveTrackerValues(actor,root));
    else if(action==='corruption-plus')run(()=>changeCorruption(actor,1,"Cursed Seal Tracker"));
    else if(action==='recover')run(()=>spendChakraDie(actor));
    else if(action==='seal-type')run(()=>chooseSealType(actor));
    else if(action==='quick-release')run(()=>quickToggleRelease(actor));
    else if(action==='configure-dr')run(async()=>{const s=readTracker(actor),stage=s.activeStage||highestStage(actor,s)||1;await chooseDrTypes(actor,stage,s,{force:true});await ensureActor(actor);});
    else if(action?.startsWith('stage-'))run(()=>activateStage(actor,Number(action.split('-')[1])));
    else if(action==='deactivate')run(()=>deactivateSeal(actor));
    else if(action==='create-art')run(()=>createCursedArt(actor));
    else if(action==='magnified')run(()=>configureMagnifiedArt(actor));
    else if(action==='sync')run(()=>ensureActor(actor));
    else if(action==='reset')run(()=>resetTracker(actor));
  });
}
function renderRoot(app,html){
  if(html?.querySelector)return html;
  if(html?.[0]?.querySelector)return html[0];
  if(app?.element?.querySelector)return app.element;
  if(app?.element?.[0]?.querySelector)return app.element[0];
  return null;
}
function renderStrip(app,html){
  const actor=app.actor??(app.document?.documentName==="Actor"?app.document:null);if(!getClassMod(actor))return;const root=renderRoot(app,html);if(!root||root.querySelector('[data-cursed-seal-strip]'))return;
  const target=root.querySelector('.jutsu-casting-overview')??root.querySelector('.sheet-body');if(!target)return;const s=readTracker(actor),seal=getSealType(actor,s),highest=highestStage(actor,s);
  const section=document.createElement('section');section.className='n5eb-cursed-seal-tracker-strip';section.dataset.cursedSealStrip='true';
  const quickLabel=s.activeStage?`Stage ${s.activeStage} Active`:(s.corruption<1?'Accept Mark':highest?`Stage ${highest} Ready`:'Dormant');
  section.innerHTML=`<button type="button" class="tracker-title" data-action="open-cursed-seal"><img src="${ICON}" alt=""><span>CURSED SEAL</span></button><div class="tracker-mini"><span>Cursed Chakra</span><strong>${s.cursedChakra}/${s.cursedChakraMax}${s.tempCursedChakra?` +${s.tempCursedChakra}`:''}</strong></div><div class="tracker-mini"><span>Corruption</span><strong>${s.corruption}/20</strong></div><div class="tracker-mini"><span>Patron DC</span><strong>${5+s.corruption}</strong></div><button type="button" class="tracker-mini status quick-release" data-action="quick-cursed-release"><span>${quickLabel}</span><strong>${esc(sealLabel(seal))}</strong></button>`;
  target.prepend(section);
  section.querySelector('[data-action="open-cursed-seal"]')?.addEventListener('click',()=>openTracker(actor));
  section.querySelector('[data-action="quick-cursed-release"]')?.addEventListener('click',()=>quickToggleRelease(actor));
}

Hooks.once("ready",async()=>{if(game.system.id!=="n5eb")return;globalThis.N5eBCursedSeal=Object.freeze({openTracker,getTracker:readTracker,activateStage,deactivateSeal,quickToggleRelease,createCursedArt,configureMagnifiedArt,chooseSealType,spendCursedChakra,changeCorruption,spendChakraDie,syncActor:ensureActor,currentArtCost,renderTrackerStrip:renderStrip});if(game.user.isGM)for(const actor of game.actors??[])if(getClassMod(actor))await queue(actor,()=>ensureActor(actor));});
Hooks.on("getActorSheetHeaderButtons",(sheet,buttons)=>{const actor=sheet.actor??sheet.document;if(!getClassMod(actor))return;const s=readTracker(actor),highest=highestStage(actor,s);buttons.unshift({label:`CC ${s.cursedChakra}/${s.cursedChakraMax} · Corr ${s.corruption}`,class:"n5eb-cursed-seal-tracker-button",icon:"fas fa-gauge-high",onclick:()=>openTracker(actor)});buttons.unshift({label:s.activeStage?`Cursed Seal S${s.activeStage}`:"Cursed Seal",class:"n5eb-cursed-seal-release-toggle",icon:"fas fa-skull",onclick:()=>s.activeStage?deactivateSeal(actor):(highest?activateStage(actor,highest):openTracker(actor))});});
Hooks.on("renderActorSheet",renderStrip);Hooks.on("renderCharacterActorSheet",renderStrip);Hooks.on("renderApplicationV2",renderStrip);
Hooks.on("preCreateItem",(item,data,options,userId)=>{if(options?.[INTERNAL]||userId!==game.user.id||item.parent?.documentName!=="Actor")return;if(item.type==="classmod"&&item.system?.identifier===CLASSMOD_ID&&charLevel(item.parent)<8){ui.notifications.warn(`Cursed Seal requires character level 8+. Current character level: ${charLevel(item.parent)}.`);return false;}});
Hooks.on("preUpdateItem",(item,changes,options,userId)=>{if(options?.[INTERNAL]||userId!==game.user.id||item.parent?.documentName!=="Actor")return;return validateClassModLevelChange(item,changes);});
Hooks.on("createItem",async(item,options,userId)=>{if(options?.[INTERNAL]||userId!==game.user.id||item.parent?.documentName!=="Actor")return;const actor=item.parent;if((item.type==="classmod"&&item.system?.identifier===CLASSMOD_ID)||getClassMod(actor))await queue(actor,()=>ensureActor(actor));});
Hooks.on("updateItem",async(item,changes,options,userId)=>{if(options?.[INTERNAL]||userId!==game.user.id||item.parent?.documentName!=="Actor")return;const actor=item.parent;if(!getClassMod(actor))return;await queue(actor,async()=>{if(!isCursedArt(item)){const linked=cursedArts(actor).filter(a=>flag(a,"cursedArtSourceId")===item.id);if(linked.length){for(const art of linked){const base=artBase(art);const update={sourceName:item.name,sourceIdentifier:item.system?.identifier??item.id,rank:normalizeRank(item.system?.rank),damage:cloneJson(item.system?.damage),critical:cloneJson(item.system?.critical),range:cloneJson(item.system?.range),actionType:item.system?.actionType??"",save:cloneJson(item.system?.save),attack:cloneJson(item.system?.attack),chakra:cloneJson(item.system?.chakra),descriptionValue:item.system?.description?.value??base.descriptionValue??""};await art.update({[`flags.${MODULE_ID}.cursedArtBase`]:update},{[INTERNAL]:{cursedArtBase:true}});}}}await ensureActor(actor);});});
Hooks.on("deleteItem",async(item,options,userId)=>{if(options?.[INTERNAL]||userId!==game.user.id||item.parent?.documentName!=="Actor")return;const actor=item.parent;if(item.type==="classmod"&&item.system?.identifier===CLASSMOD_ID)await cleanupActor(actor);else if(getClassMod(actor)){if(isCursedArt(item)&&readTracker(actor).magnifiedArtId===item.id)await writeTracker(actor,{magnifiedArtId:"",magnifiedBoosts:[],magnifiedBoostChangeAvailable:true},{render:false,sync:false});await queue(actor,()=>ensureActor(actor));}});
Hooks.on("updateActor",async(actor,changes,options,userId)=>{if(options?.[INTERNAL]||userId!==game.user.id||!getClassMod(actor))return;await queue(actor,()=>ensureActor(actor));});
Hooks.on("dnd5e.preUseActivity",activity=>{const item=getActivityItem(activity),actor=activity?.actor??item?.actor;if(!actor||!getClassMod(actor)||!item)return;return canUseActivity(actor,item);});
Hooks.on("dnd5e.postUseActivity",activity=>{const item=getActivityItem(activity),actor=activity?.actor??item?.actor;if(!actor||!getClassMod(actor)||!item||(!isCursedArt(item)&&!isNormalJutsu(item)))return;queue(actor,()=>processActivityUse(actor,item)).catch(error=>{console.error(`${MODULE_ID} | Cursed Seal use processing failed`,error);ui.notifications.error(`Cursed Seal use tracking failed: ${error.message}`);});});
Hooks.on("dnd5e.restCompleted",(actor,result)=>{if(getClassMod(actor))queue(actor,()=>applyRest(actor,result?.type)).catch(console.error);});
Hooks.on("updateCombatant",async(combatant,changes,options,userId)=>{if(userId!==game.user.id||!Object.hasOwn(changes,"initiative"))return;const actor=combatant.actor;if(!actor||getLevel(actor)<2)return;const state=readTracker(actor);if(state.activeStage||state.initiativeActivationUsed||!highestStage(actor,state))return;const yes=await foundry.applications.api.DialogV2.confirm({window:{title:`Cursed Power — ${actor.name}`},content:`<p>Activate Cursed Seal Release as part of rolling Initiative? This once-per-rest activation does not use your Bonus Action.</p>`});if(yes)await activateStage(actor,highestStage(actor,state),{fromInitiative:true});});
Hooks.on("deleteActiveEffect",async(effect,options,userId)=>{if(options?.[INTERNAL]||userId!==game.user.id||!flag(effect,"cursedSealStageEffect"))return;const actor=effect.parent;if(actor?.documentName==="Actor"&&getClassMod(actor)&&readTracker(actor).activeStage)await queue(actor,()=>deactivateSeal(actor));});
Hooks.on("updateActiveEffect",async(effect,changes,options,userId)=>{if(options?.[INTERNAL]||userId!==game.user.id||!flag(effect,"cursedSealStageEffect"))return;if(changes.disabled===true){const actor=effect.parent;if(actor?.documentName==="Actor"&&getClassMod(actor)&&readTracker(actor).activeStage)await queue(actor,()=>deactivateSeal(actor));}});
