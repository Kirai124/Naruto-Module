const MODULE_ID = "n5eb-classmod-library";
const CLASSMOD_ID = "crimson-priest";
const PACK_COLLECTION = "world.n5eb-custom-class-mods";
const TRACKER_FLAG = "crimsonPriestTracker";
const EFFECT_FLAG = "crimsonPriestOathEffect";
const INTERNAL = MODULE_ID;
const ICON = "systems/n5eb/assets/content/jutsu-icons/7th-inner-gate.webp";
const dialogs = new Map();
const queues = new Map();
let sourceCache = null;

function arr(value){ return value ? (Array.isArray(value) ? value : Array.from(value)) : []; }
function esc(value){ return foundry.utils.escapeHTML(String(value ?? "")); }
function getClassMod(actor){ return arr(actor?.items).find(item => item.type === "classmod" && item.system?.identifier === CLASSMOD_ID) ?? null; }
function getLevel(actor){ return Math.max(0, Math.min(5, Number(getClassMod(actor)?.system?.levels ?? 0))); }
function getActivityItem(activity){ return activity?.item ?? activity?.parent?.item ?? null; }
function flag(document,key){ return document?.getFlag?.(MODULE_ID,key) ?? document?.flags?.[MODULE_ID]?.[key]; }
function actorKey(actor){ return actor?.uuid ?? actor?.id ?? null; }
function queue(actor, task){
  const key=actorKey(actor); if(!key) return Promise.resolve().then(task);
  const prev=queues.get(key) ?? Promise.resolve(); const current=prev.catch(()=>{}).then(task);
  queues.set(key,current); return current.finally(()=>{if(queues.get(key)===current) queues.delete(key);});
}
function clamp(v,min,max){ return Math.min(max,Math.max(min,Number(v)||0)); }
function prof(actor){ return Math.max(0,Number(actor?.system?.attributes?.prof ?? 0)); }
function charLevel(actor){ return Math.max(0,Number(actor?.system?.details?.level ?? 0)); }
function abilityMod(actor,key){ const a=actor?.system?.abilities?.[key]??{}; return Number.isFinite(Number(a.mod))?Number(a.mod):Math.floor((Number(a.value??10)-10)/2); }
function maxPiety(actor){ return 5 + (getLevel(actor)*5); }
function getOath(actor){
  const item=arr(actor?.items).find(i => flag(i,"category")==="oath" && ["predator","acolyte","nightmare"].includes(flag(i,"crimsonPriestOath")));
  return item ? flag(item,"crimsonPriestOath") : null;
}
function hasIdentifier(actor,id){ return arr(actor?.items).some(i=>i.system?.identifier===id); }
function defaultTracker(){ return {version:1,piety:0,costMode:"auto",doctrineBloodArt:"",doctrineOathArt:"",doctrineBloodFreeUsed:false,lastDamageTaken:0,overflowRemainder:0,lastCombatId:"",scarletMartyrRound:""}; }
function normalizeTracker(actor,value={}){
  return {version:1,piety:clamp(value.piety,0,maxPiety(actor)),costMode:["auto","hp","hd"].includes(value.costMode)?value.costMode:"auto",doctrineBloodArt:String(value.doctrineBloodArt??""),doctrineOathArt:String(value.doctrineOathArt??""),doctrineBloodFreeUsed:Boolean(value.doctrineBloodFreeUsed),lastDamageTaken:Math.max(0,Number(value.lastDamageTaken??0)),overflowRemainder:Math.max(0,Number(value.overflowRemainder??0)),lastCombatId:String(value.lastCombatId??""),scarletMartyrRound:String(value.scarletMartyrRound??"")};
}
function readTracker(actor){ return normalizeTracker(actor,actor?.getFlag?.(MODULE_ID,TRACKER_FLAG) ?? defaultTracker()); }
async function writeTracker(actor,patch={}, {render=true,refresh=true}={}){
  const next=normalizeTracker(actor,{...readTracker(actor),...patch});
  const raw=actor?.getFlag?.(MODULE_ID,TRACKER_FLAG);
  if(!raw || JSON.stringify(raw)!==JSON.stringify(next)) await actor.update({[`flags.${MODULE_ID}.${TRACKER_FLAG}`]:next},{[INTERNAL]:{crimsonPriestTracker:true}});
  if(refresh) await refreshOathEffect(actor,next);
  if(render){ actor.sheet?.render?.(false); refreshDialog(actor); }
  return next;
}
function addChange(changes,key,value,mode=CONST.ACTIVE_EFFECT_MODES.ADD,priority=20){ if(Number(value)) changes.push({key,mode,value:String(value),priority}); }
function oathChanges(actor,state=readTracker(actor)){
  const level=getLevel(actor), oath=getOath(actor), changes=[];
  if(oath==="predator" && level>=2){ const bonus=level>=4?4:2; for(const a of ["str","dex"]){addChange(changes,`system.abilities.${a}.value`,bonus);addChange(changes,`system.abilities.${a}.max`,bonus);} addChange(changes,"system.attributes.movement.walk",5*state.piety); }
  if(oath==="acolyte" && level>=2){ const bonus=level>=4?4:2; for(const a of ["int","con"]){addChange(changes,`system.abilities.${a}.value`,bonus);addChange(changes,`system.abilities.${a}.max`,bonus);} addChange(changes,"system.attributes.chakra.bonuses.overall",10*level); }
  if(oath==="nightmare" && level>=3){ const bonus=level>=4?4:2; for(const a of ["wis","cha"]){addChange(changes,`system.abilities.${a}.value`,bonus);addChange(changes,`system.abilities.${a}.max`,bonus);} addChange(changes,"system.attributes.chakra.bonuses.overall",10*level); }
  return changes;
}
async function refreshOathEffect(actor,state=readTracker(actor)){
  let effect=arr(actor?.effects).find(e=>flag(e,EFFECT_FLAG)); const oath=getOath(actor), changes=oathChanges(actor,state);
  if(!getClassMod(actor) || !oath || !changes.length){ if(effect) await effect.delete({[INTERNAL]:{crimsonPriest:true}}); return; }
  const data={name:`Crimson Priest — ${oath[0].toUpperCase()+oath.slice(1)} Oath`,img:ICON,disabled:false,transfer:false,duration:{},changes,statuses:[],flags:{[MODULE_ID]:{[EFFECT_FLAG]:true,oath}}};
  if(!effect){ await actor.createEmbeddedDocuments("ActiveEffect",[data],{[INTERNAL]:{crimsonPriest:true}}); return; }
  if(effect.name!==data.name || effect.img!==data.img || effect.disabled || JSON.stringify(effect.changes??[])!==JSON.stringify(changes) || flag(effect,"oath")!==oath) await effect.update(data,{[INTERNAL]:{crimsonPriest:true}});
}
function aggregateDie(actor,kind){ return actor?.system?.attributes?.[kind] ?? {}; }
function availableDice(actor,kind){ return Math.max(0,Number(aggregateDie(actor,kind)?.value ?? 0)); }
function findAvailableClassDie(actor,kind){ const classes=arr(actor?.system?.attributes?.[kind]?.classes); return classes.find(item=>Number(item?.system?.[kind]?.value??0)>0) ?? arr(Object.values(actor?.classes??{})).find(item=>Number(item?.system?.[kind]?.value??0)>0); }
async function spendOneDie(actor,kind){
  if(availableDice(actor,kind)<1) return false; const cls=findAvailableClassDie(actor,kind);
  if(cls){ const spent=Number(cls.system?.[kind]?.spent??0); await cls.update({[`system.${kind}.spent`]:spent+1},{[INTERNAL]:{crimsonPriest:true}}); return true; }
  const spent=Number(actor?._source?.system?.attributes?.[kind]?.spent ?? actor?.system?.attributes?.[kind]?.spent ?? 0); await actor.update({[`system.attributes.${kind}.spent`]:spent+1},{[INTERNAL]:{crimsonPriest:true}}); return true;
}
async function spendDice(actor,kind,count){ if(availableDice(actor,kind)<count) return false; for(let i=0;i<count;i++) if(!await spendOneDie(actor,kind)) return false; return true; }
function artKind(item){ return flag(item,"crimsonPriestArtKind"); }
function ownedArt(actor,id){ return arr(actor?.items).find(i=>i.system?.identifier===id) ?? null; }
function effectivePietyCost(actor,item){ let cost=Math.max(0,Number(flag(item,"pietyCost")??0)); const s=readTracker(actor); if(getLevel(actor)>=4 && s.doctrineOathArt===item.system?.identifier) cost=Math.max(1,Math.ceil(cost/2)); return cost; }
function chooseBloodCost(actor,item){
  const s=readTracker(actor), hp=Math.max(0,Number(flag(item,"bloodHpCost")??0)), hd=Math.max(0,Number(flag(item,"bloodHdCost")??0));
  if(getLevel(actor)>=4 && s.doctrineBloodArt===item.system?.identifier && !s.doctrineBloodFreeUsed) return {kind:"free",amount:0};
  if(s.costMode==="hp" && hp) return {kind:"hp",amount:hp}; if(s.costMode==="hd" && hd) return {kind:"hd",amount:hd};
  const currentHp=Number(actor.system?.attributes?.hp?.value??0); if(hp && currentHp>=hp) return {kind:"hp",amount:hp}; if(hd && availableDice(actor,"hd")>=hd) return {kind:"hd",amount:hd}; if(hp) return {kind:"hp",amount:hp}; return {kind:"hd",amount:hd};
}
function canUseArt(actor,item,{notify=true}={}){
  const kind=artKind(item); if(!kind) return true;
  if(kind==="oath"){
    const required=flag(item,"crimsonPriestOath"), oath=getOath(actor); if(required && oath && required!==oath){ if(notify) ui.notifications.warn(`${item.name} belongs to the ${required} Oath.`); return false; }
    const cost=effectivePietyCost(actor,item); if(readTracker(actor).piety<cost){ if(notify) ui.notifications.warn(`${item.name} needs ${cost} Piety.`); return false; }
  }
  if(kind==="blood"){
    const choice=chooseBloodCost(actor,item); if(choice.kind==="hd" && availableDice(actor,"hd")<choice.amount){ if(notify) ui.notifications.warn(`${item.name} needs ${choice.amount} remaining Hit Dice.`); return false; }
  }
  return true;
}
async function payBloodCost(actor,item){
  const choice=chooseBloodCost(actor,item), s=readTracker(actor); if(choice.kind==="free"){ await writeTracker(actor,{doctrineBloodFreeUsed:true},{render:false}); ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)} — Doctrine of Carnage:</strong> ${esc(item.name)} costs 0 HP/Hit Dice for this use.</p>`}); return; }
  if(choice.kind==="hd"){ if(await spendDice(actor,"hd",choice.amount)) ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)}:</strong> spent ${choice.amount} Hit ${choice.amount===1?"Die":"Dice"} for ${esc(item.name)}.</p>`}); return; }
  const hp=Number(actor.system?.attributes?.hp?.value??0), next=Math.max(0,hp-choice.amount), overflow=Math.max(0,choice.amount-hp); await actor.update({"system.attributes.hp.value":next},{[INTERNAL]:{crimsonPriest:true}});
  let extra=""; if(overflow){ const total=s.overflowRemainder+overflow, ranks=Math.floor(total/15), remainder=total%15; await writeTracker(actor,{overflowRemainder:remainder},{render:false}); if(ranks) extra=` This crosses ${ranks} × 15 damage past 0 HP: apply ${ranks} Exhaustion rank${ranks===1?"":"s"} from My Lord's Gift.`; }
  ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)}:</strong> paid ${choice.amount} HP for ${esc(item.name)}.${esc(extra)}</p>`});
}
async function processArtUse(actor,item){
  if(artKind(item)==="oath"){
    const cost=effectivePietyCost(actor,item); if(cost){ await changePiety(actor,-cost,{reason:item.name,render:false}); }
  } else if(artKind(item)==="blood") await payBloodCost(actor,item);
}
async function changePiety(actor,amount,{reason="",render=true}={}){
  const s=readTracker(actor), next=clamp(s.piety+Number(amount||0),0,maxPiety(actor)); const spent=Math.max(0,s.piety-next); await writeTracker(actor,{piety:next},{render,refresh:true});
  if(spent && getLevel(actor)>=3){ const gain=Math.max(0,3*abilityMod(actor,"con")); if(gain){ const hp=actor.system?.attributes?.hp??{}, current=Math.max(0,Number(hp.temp??0)); await actor.update({"system.attributes.hp.temp":Math.max(current,gain)},{[INTERNAL]:{crimsonPriest:true}}); } }
  if(reason) ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)} — Piety:</strong> ${amount>=0?"+":""}${Number(amount)} (${esc(reason)}). Current: ${next}/${maxPiety(actor)}.</p>`});
  return next;
}

async function sourceMap(){
  if(sourceCache) return sourceCache;
  // Read bundled definitions directly so retroactive damage migration does not depend
  // on the world compendium having finished its async ready-time sync yet.
  const bundles=await Promise.all(["heavenly-gates.json","crimson-priest.json"].map(file=>foundry.utils.fetchJsonWithTimeout(`modules/${MODULE_ID}/data/${file}`)));
  const docs=bundles.flatMap(bundle=>bundle.items??[]);
  sourceCache=new Map(docs.map(d=>[d.system?.identifier,d]).filter(([key])=>key));
  return sourceCache;
}
function managedDamageItem(item){ const cm=flag(item,"classMod"); return cm==="heavenly-gates" || cm===CLASSMOD_ID || String(item.system?.identifier??"").startsWith("hg-art-") || String(item.system?.identifier??"").startsWith("blood-art-") || String(item.system?.identifier??"").startsWith("oath-art-"); }
function crimsonOathValues(actor){ const p=prof(actor), l=getLevel(actor); return {attack:(2*p)+(2*l),save:10+l+(2*p)}; }
function dynamicDamage(actor,item,sourceDamage){
  const id=item.system?.identifier, damage=foundry.utils.deepClone(sourceDamage ?? {parts:[],versatile:""});
  if(id==="oath-art-mark-of-the-blood-hunter") damage.parts=[[`${Math.max(0,4*getLevel(actor))}d8`,"acid"]];
  if(id==="blood-art-red-retribution") damage.parts=[[`${readTracker(actor).lastDamageTaken}+${2*getLevel(actor)}`,"psychic"]];
  if(id==="hg-art-technique-heavy-soul-free-spirit") { const stage=Math.max(1,Number(actor.getFlag?.(MODULE_ID,"heavenlyGatesTracker")?.activeStage??1)), base=getLevelFrom(actor,"heavenly-gates")*stage; damage.parts=[[String(base),"bludgeoning"]]; damage.versatile=String(base*2); }
  if(id==="hg-art-technique-little-toe-attack") { const str=Math.max(0,Number(actor.system?.abilities?.str?.value??10)), jump=2*str, dice=Math.max(1,Math.floor(jump/10)), stage=Math.max(1,Number(actor.getFlag?.(MODULE_ID,"heavenlyGatesTracker")?.activeStage??3)), size=stage>=8?12:stage>=7?10:stage>=5?8:6; damage.parts=[[`${dice}d${size}`,"bludgeoning"]]; }
  return damage;
}
function getLevelFrom(actor,id){ return Math.max(0,Number(arr(actor?.items).find(i=>i.type==="classmod"&&i.system?.identifier===id)?.system?.levels??0)); }
async function syncCombatData(actor){
  if(!actor?.isOwner) return 0; const sources=await sourceMap(), updates=[];
  for(const item of arr(actor.items)){
    if(!managedDamageItem(item)) continue; const src=sources.get(item.system?.identifier); if(!src) continue; const cm=flag(src,"classMod"); if(!["heavenly-gates",CLASSMOD_ID].includes(cm)) continue;
    const update={_id:item.id}; let changed=false; const sourceDamage=dynamicDamage(actor,item,src.system?.damage);
    const desired={"system.damage":sourceDamage,"system.actionType":src.system?.actionType ?? "","system.save.ability":src.system?.save?.ability ?? ""};
    if(cm===CLASSMOD_ID && flag(src,"crimsonPriestArtKind")==="oath"){
      const values=crimsonOathValues(actor); desired["system.save.scaling"]="flat"; desired["system.save.dc"]=values.save;
      const base=Math.floor(charLevel(actor)/2)+getLevel(actor)+prof(actor); desired["system.attack.bonus"]=String(values.attack-base);
    } else if(cm===CLASSMOD_ID){ desired["system.save.scaling"]="art"; desired["system.save.dc"]=null; desired["system.attack.bonus"]=""; }
    for(const [path,val] of Object.entries(desired)){ const cur=foundry.utils.getProperty(item,path); if(JSON.stringify(cur)!==JSON.stringify(val)){ foundry.utils.setProperty(update,path,val); changed=true; } }
    if(changed) updates.push(update);
  }
  if(updates.length) await actor.updateEmbeddedDocuments("Item",updates,{[INTERNAL]:{combatDataSync:true}});
  return updates.length;
}
async function syncAllCombatData(){ let total=0; sourceCache=null; for(const actor of game.actors??[]) if(actor.isOwner && (getClassMod(actor)||getLevelFrom(actor,"heavenly-gates"))) total+=await queue(actor,()=>syncCombatData(actor)); return total; }

async function ensureActor(actor){ if(!getClassMod(actor)) return; await writeTracker(actor,{}, {render:false,refresh:true}); await syncCombatData(actor); }
async function cleanupActor(actor){ const effect=arr(actor?.effects).find(e=>flag(e,EFFECT_FLAG)); if(effect) await effect.delete({[INTERNAL]:{crimsonPriest:true}}); }
function currentRoundKey(){ const c=game.combat; return c?.started ? `${c.id}:${c.round}` : ""; }

function zeroHpStatus(effect){
  const statuses=arr(effect?.statuses).map(value=>String(value).toLowerCase());
  const name=String(effect?.name??effect?._source?.name??"").toLowerCase();
  return statuses.some(value=>value.includes("dying")||value.includes("unconscious")) || name.includes("dying") || name.includes("unconscious");
}

function trackerHtml(actor){ const s=readTracker(actor), oath=getOath(actor)??"None"; return `<div class="n5eb-crimson-tracker" data-crimson-root><header><div><h2>Crimson Priest</h2><p>Death Oath: ${esc(oath)}</p></div><div class="piety-orb">${s.piety}<small>/${maxPiety(actor)}</small></div></header><section class="crimson-grid"><div><span>Blood Cost</span><strong>${esc(s.costMode.toUpperCase())}</strong></div><div><span>Last Damage</span><strong>${s.lastDamageTaken}</strong></div><div><span>Doctrine Blood</span><strong>${esc(ownedArt(actor,s.doctrineBloodArt)?.name??"—")}</strong></div><div><span>Doctrine Oath</span><strong>${esc(ownedArt(actor,s.doctrineOathArt)?.name??"—")}</strong></div></section><footer><button type="button" data-piety="1">+1 Standard</button><button type="button" data-piety="4">+4 Elite</button><button type="button" data-piety="8">+8 Solo</button><button type="button" data-piety="-1">-1</button><button type="button" data-action="mode">Cost: ${esc(s.costMode)}</button>${getLevel(actor)>=5?'<button type="button" data-action="mandate">Jashin\'s Mandate</button>':''}<button type="button" data-action="doctrine" ${getLevel(actor)<4?'disabled':''}>Doctrine</button></footer></div>`; }
function key(actor){ return actor?.uuid??actor?.id; } function refreshDialog(actor){ const d=dialogs.get(key(actor)); if(d?.rendered)d.render({force:true}); }
async function openTracker(actor){ if(!getClassMod(actor)) return ui.notifications.warn("No Crimson Priest Class Mod on this Actor."); await ensureActor(actor); const k=key(actor); if(dialogs.get(k)?.rendered)return dialogs.get(k).bringToFront(); const DialogV2=foundry.applications.api.DialogV2; const d=new DialogV2({window:{title:`Crimson Priest — ${actor.name}`,icon:"fa-solid fa-droplet",resizable:true},position:{width:700,height:"auto"},classes:["n5eb-crimson-tracker-window"],content:trackerHtml(actor),buttons:[{action:"close",label:"Close"}]}); dialogs.set(k,d); d.addEventListener("render",()=>activateDialog(d,actor)); d.addEventListener("close",()=>dialogs.delete(k),{once:true}); await d.render({force:true}); return d; }
function activateDialog(dialog,actor){ const root=dialog.element?.querySelector?.('[data-crimson-root]'); if(!root)return; root.querySelectorAll('[data-piety]').forEach(b=>b.addEventListener('click',()=>changePiety(actor,Number(b.dataset.piety),{reason:'Crimson Rite'}).catch(console.error))); root.querySelector('[data-action="mode"]')?.addEventListener('click',async()=>{const s=readTracker(actor),m=s.costMode==='auto'?'hp':s.costMode==='hp'?'hd':'auto';await writeTracker(actor,{costMode:m});}); root.querySelector('[data-action="mandate"]')?.addEventListener('click',()=>openMandate(actor)); root.querySelector('[data-action="doctrine"]')?.addEventListener('click',()=>openDoctrine(actor)); }
async function openMandate(actor){ const s=readTracker(actor); const result=await foundry.applications.api.DialogV2.wait({window:{title:"Jashin's Mandate"},content:`<p>Current Piety: <strong>${s.piety}</strong></p>`,buttons:[{action:"action",label:"Action — 20 Piety"},{action:"bonus",label:"Bonus Action — 13 Piety"},{action:"reaction",label:"Reaction — 7 Piety"},{action:"cancel",label:"Cancel"}],rejectClose:false}); const costs={action:20,bonus:13,reaction:7}; if(costs[result]){ if(s.piety<costs[result])return ui.notifications.warn("Not enough Piety."); await changePiety(actor,-costs[result],{reason:`Jashin's Mandate — ${result}`}); ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)}</strong> gains one extra ${esc(result)} from Jashin's Mandate.</p>`}); } }
async function openDoctrine(actor){ const blood=arr(actor.items).filter(i=>artKind(i)==='blood'), oath=arr(actor.items).filter(i=>artKind(i)==='oath'); const options=(list,selected)=>`<option value="">—</option>`+list.map(i=>`<option value="${esc(i.system.identifier)}" ${i.system.identifier===selected?'selected':''}>${esc(i.name)}</option>`).join(''); const s=readTracker(actor); const result=await foundry.applications.api.DialogV2.wait({window:{title:"Doctrine of Carnage"},content:`<form><div class="form-group"><label for="cp-doctrine-blood">Blood Art (first use/rest free)</label><select id="cp-doctrine-blood" name="blood">${options(blood,s.doctrineBloodArt)}</select></div><div class="form-group"><label for="cp-doctrine-oath">Oath Art (half Piety, min 1)</label><select id="cp-doctrine-oath" name="oath">${options(oath,s.doctrineOathArt)}</select></div></form>`,buttons:[{action:"save",label:"Save",default:true,callback:(event,button)=>{const data=new FormDataExtended(button.form).object;return {blood:data.blood??"",oath:data.oath??""};}},{action:"cancel",label:"Cancel"}],rejectClose:false}); if(result&&typeof result==='object') await writeTracker(actor,{doctrineBloodArt:result.blood,doctrineOathArt:result.oath,doctrineBloodFreeUsed:false}); }
function renderRoot(app,html){return html?.[0]??html??app.element?.[0]??app.element;} function renderStrip(app,html){const actor=app.actor??app.document;if(!getClassMod(actor))return;const root=renderRoot(app,html);if(!root||root.querySelector('[data-crimson-strip]'))return;const target=root.querySelector('.jutsu-casting-overview')??root.querySelector('.sheet-body');if(!target)return;const s=readTracker(actor),o=getOath(actor)??'Choose';const section=document.createElement('section');section.className='n5eb-crimson-tracker-strip';section.dataset.crimsonStrip='true';section.innerHTML=`<button type="button" class="tracker-title" data-action="open-crimson"><img src="${ICON}"> Crimson Priest</button><div class="tracker-mini"><span>Piety</span><strong>${s.piety}/${maxPiety(actor)}</strong></div><div class="tracker-mini"><span>Oath</span><strong>${esc(o)}</strong></div><div class="tracker-mini"><span>Cost</span><strong>${esc(s.costMode)}</strong></div>`;target.prepend(section);section.querySelector('[data-action="open-crimson"]')?.addEventListener('click',()=>openTracker(actor));}

Hooks.once("ready",async()=>{
  if(game.system.id!=="n5eb") return;
  globalThis.N5eBCrimsonPriest=Object.freeze({openTracker,changePiety,syncDamageAutomation:syncAllCombatData,getTracker:readTracker});
  // main.js performs the world-pack sync in its ready hook. Foundry does not await
  // async hook listeners, so wait briefly for the 0.15.0 pack before caching sources.
  if(game.user.isGM){
    for(let attempt=0;attempt<50;attempt++){
      if(game.settings.get(MODULE_ID,"contentVersion")==="0.15.0" && game.packs.get(PACK_COLLECTION)) break;
      await new Promise(resolve=>setTimeout(resolve,100));
    }
  }
  sourceCache=null;
  for(const actor of game.actors??[]) if(actor.isOwner && getClassMod(actor)) await queue(actor,()=>ensureActor(actor));
  const migrated=await syncAllCombatData(); if(game.user.isGM && migrated) console.info(`${MODULE_ID} | Damage automation migrated ${migrated} owned Art documents (Crimson Priest / Heavenly Gates).`);
});

Hooks.on("preCreateActiveEffect",(effect,data,options,userId)=>{
  if(userId!==game.user.id) return; const actor=effect.parent?.documentName==="Actor"?effect.parent:null;
  if(!actor||!getClassMod(actor)||Number(actor.system?.attributes?.hp?.value??1)>0) return;
  if(zeroHpStatus(effect)){ ui.notifications.info(`${actor.name} ignores Dying/Unconscious at 0 HP through My Lord's Gift.`); return false; }
});
Hooks.on("getActorSheetHeaderButtons",(sheet,buttons)=>{const actor=sheet.actor??sheet.document;if(!getClassMod(actor))return;const s=readTracker(actor);buttons.unshift({label:`Piety ${s.piety}/${maxPiety(actor)}`,class:"n5eb-crimson-tracker-button",icon:"fas fa-droplet",onclick:()=>openTracker(actor)});});
Hooks.on("renderActorSheet",renderStrip); Hooks.on("renderCharacterActorSheet",renderStrip); Hooks.on("renderApplicationV2",renderStrip);
Hooks.on("createItem",async(item,options,userId)=>{if(options?.[INTERNAL]?.combatDataSync||userId!==game.user.id||item.parent?.documentName!=="Actor")return;const actor=item.parent;if((item.type==='classmod'&&item.system?.identifier===CLASSMOD_ID)||getClassMod(actor))await queue(actor,()=>ensureActor(actor));});
Hooks.on("updateItem",async(item,changes,options,userId)=>{if(options?.[INTERNAL]?.combatDataSync||userId!==game.user.id||item.parent?.documentName!=="Actor")return;const actor=item.parent;if(getClassMod(actor)||getLevelFrom(actor,'heavenly-gates'))await queue(actor,async()=>{if(getClassMod(actor))await refreshOathEffect(actor);await syncCombatData(actor);});});
Hooks.on("deleteItem",async(item,options,userId)=>{if(options?.[INTERNAL]?.combatDataSync||userId!==game.user.id||item.parent?.documentName!=="Actor")return;const actor=item.parent;if(item.type==='classmod'&&item.system?.identifier===CLASSMOD_ID)await cleanupActor(actor);else if(getClassMod(actor))await queue(actor,()=>ensureActor(actor));});
Hooks.on("preUpdateActor",(actor,changes,options,userId)=>{if(options?.[INTERNAL]?.crimsonPriest||userId!==game.user.id||!getClassMod(actor))return;const proposed=foundry.utils.getProperty(changes,'system.attributes.hp.value');if(proposed==null)return;const current=Number(actor.system?.attributes?.hp?.value??0),next=Number(proposed);if(next>=current)return;const incoming=current-next,s=readTracker(actor),patch={...s,lastDamageTaken:incoming};if(hasIdentifier(actor,'pact-scarlet-martyr')){const rk=currentRoundKey();if(!rk||s.scarletMartyrRound!==rk){const gain=Math.floor(incoming/2),temp=Math.max(0,Number(actor.system?.attributes?.hp?.temp??0));foundry.utils.setProperty(changes,'system.attributes.hp.temp',Math.max(temp,gain));patch.scarletMartyrRound=rk;}}foundry.utils.setProperty(changes,`flags.${MODULE_ID}.${TRACKER_FLAG}`,normalizeTracker(actor,patch));});
Hooks.on("updateActor",async(actor,changes,options,userId)=>{if(options?.[INTERNAL]?.combatDataSync||userId!==game.user.id)return;if(getClassMod(actor)||getLevelFrom(actor,'heavenly-gates'))await queue(actor,async()=>{if(getClassMod(actor))await refreshOathEffect(actor);await syncCombatData(actor);});});
Hooks.on("dnd5e.preUseActivity",activity=>{const item=getActivityItem(activity),actor=activity?.actor??item?.actor;if(!actor||!getClassMod(actor)||!item)return;if(artKind(item))return canUseArt(actor,item);});
Hooks.on("dnd5e.postUseActivity",activity=>{const item=getActivityItem(activity),actor=activity?.actor??item?.actor;if(!actor||!getClassMod(actor)||!item||!artKind(item))return;queue(actor,()=>processArtUse(actor,item)).catch(error=>{console.error(`${MODULE_ID} | Crimson Priest Art processing failed`,error);ui.notifications.error(`Crimson Priest automation failed: ${error.message}`);});});
Hooks.on("dnd5e.restCompleted",async(actor,result)=>{if(!getClassMod(actor))return;await queue(actor,()=>writeTracker(actor,{doctrineBloodFreeUsed:false,overflowRemainder:0},{render:false}));});
Hooks.on("updateCombat",async(combat,changes,options,userId)=>{if(userId!==game.user.id||(!Object.hasOwn(changes,'turn')&&!Object.hasOwn(changes,'round')))return;const actor=combat.combatant?.actor;if(!actor||!getClassMod(actor))return;await queue(actor,async()=>{const level=getLevel(actor),s=readTracker(actor);if(hasIdentifier(actor,'pact-endless-flesh')&&Number(actor.system?.attributes?.hp?.value??0)>=1){const heal=Math.max(0,abilityMod(actor,'con')+(2*level)),hp=actor.system.attributes.hp;const next=Math.min(Number(hp.max??hp.value),Number(hp.value??0)+heal);if(next>Number(hp.value??0))await actor.update({'system.attributes.hp.value':next},{[INTERNAL]:{crimsonPriest:true}});}if(hasIdentifier(actor,'pact-unending-war')&&s.lastCombatId!==combat.id){const gain=Math.max(0,(abilityMod(actor,'con')+level)*5),temp=Math.max(0,Number(actor.system?.attributes?.hp?.temp??0));await actor.update({'system.attributes.hp.temp':Math.max(temp,gain)},{[INTERNAL]:{crimsonPriest:true}});await writeTracker(actor,{lastCombatId:combat.id},{render:false});}});});
