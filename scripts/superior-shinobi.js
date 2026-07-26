const MODULE_ID = "n5eb-classmod-library";
const TRACKER_FLAG = "superiorShinobiTracker";
const EFFECT_FLAG = "superiorShinobiManagedEffect";
const INTERNAL = "n5eb-classmod-library";
const CLASSMOD_ID = "superior-shinobi";
const BURDEN_RESERVE_REDUCTION = Object.freeze({5:1,10:2,15:4,20:5,25:7,30:10});
const dialogs = new Map();

function arr(value){ return value ? (Array.isArray(value) ? value : Array.from(value)) : []; }
function getClassMod(actor){ return arr(actor?.items).find(i=>i.type==="classmod" && i.system?.identifier===CLASSMOD_ID) ?? null; }
function getLevel(actor){ return Math.max(0,Math.min(5,Number(getClassMod(actor)?.system?.levels ?? 0))); }
function proficiency(actor){ return Number(actor?.system?.attributes?.prof ?? actor?.system?.prof ?? 0); }
function actorFromContext(actor){ return actor ?? canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character ?? null; }
function trackerKey(actor){ return actor?.uuid ?? actor?.id; }
function burdenReserveReduction(burden){ let value=0; for(const [rank,reduction] of Object.entries(BURDEN_RESERVE_REDUCTION)) if(burden>=Number(rank)) value=Number(reduction); return value; }
function baseReserveMax(actor){ return getLevel(actor)*2; }
function effectiveReserveMax(actor,burden){ return Math.max(0,baseReserveMax(actor)-burdenReserveReduction(burden)); }
function normalize(actor,source={}){
  const burden=Math.clamp(Number(source.burden ?? 0),0,30);
  const max=effectiveReserveMax(actor,burden);
  const freeUsesSpent=source.freeUsesSpent && typeof source.freeUsesSpent==="object" ? source.freeUsesSpent : {};
  return {version:2,burden,reserveCurrent:Math.clamp(Number(source.reserveCurrent ?? max),0,max),reserveMax:max,combatDiceSpent:Math.max(0,Number(source.combatDiceSpent ?? 0)),freeUsesSpent,prophesisedTechniqueId:String(source.prophesisedTechniqueId ?? "")};
}
function readTracker(actor){ return normalize(actor,actor?.getFlag?.(MODULE_ID,TRACKER_FLAG) ?? {}); }
async function writeTracker(actor,patch={},options={}){
  const previous=readTracker(actor); const next=normalize(actor,{...previous,...patch});
  await actor.setFlag(MODULE_ID,TRACKER_FLAG,next);
  await refreshEffect(actor,next);
  actor.sheet?.render?.(false);
  refreshDialog(actor);
  return next;
}
function freeUsesMax(actor){ return Math.max(0,proficiency(actor)-2); }
function techniqueFlag(item,key){ return item?.getFlag?.(MODULE_ID,key) ?? item?.flags?.[MODULE_ID]?.[key]; }
function isTechnique(item){ return Boolean(techniqueFlag(item,"superiorTechnique")); }
function techniqueIdentifier(item){ return item?.system?.identifier ?? item?.id ?? item?.name; }
function hasOwnedItem(actor,identifier){ return arr(actor?.items).some(item=>item.system?.identifier===identifier); }
function prophesisedCost(actor,item,cost){
  const state=readTracker(actor);
  if(!hasOwnedItem(actor,"the-prophesised") || state.burden>=15) return cost;
  return state.prophesisedTechniqueId===techniqueIdentifier(item) ? Math.max(0,cost-1) : cost;
}
function availableDice(actor,type){ return Number(actor?.system?.attributes?.[type]?.value ?? 0); }

async function ensureTracker(actor){ if(!getClassMod(actor)) return null; const state=readTracker(actor); await actor.setFlag(MODULE_ID,TRACKER_FLAG,state); await refreshEffect(actor,state); return state; }
function effectChanges(actor,state){
  const level=getLevel(actor), burden=state.burden;
  let ac=(level>=1?1:0)+(level>=3?2:0), speed=(level>=1?30:0)+(level>=3?30:0), save=(level>=1?1:0)+(level>=3?1:0), attack=(level>=3?1:0);
  if(burden>=20){ ac=0; speed=0; save=0; attack=0; }
  else if(burden>=10){ ac=Math.floor(ac/2); speed=Math.floor(speed/2); save=Math.floor(save/2); attack=Math.floor(attack/2); }
  const skill=burden>=15?-4:burden>=5?-2:0;
  const burdenAttack=burden>=20?-3:burden>=10?-1:0;
  const netAttack=attack+burdenAttack;
  const changes=[]; const add=(key,value,mode=2)=>{ if(Number(value)) changes.push({key,mode,value:String(value),priority:20}); };
  add("system.attributes.ac.bonus",ac); add("system.attributes.movement.walk",speed); add("system.bonuses.abilities.save",save); add("system.bonuses.abilities.skill",skill);
  for(const type of ["mwak","rwak","msak","rsak"]) add(`system.bonuses.${type}.attack`,netAttack);
  add("system.bonuses.spell.dc",netAttack);
  if(burden>=30){ changes.push({key:"system.attributes.hp.max",mode:1,value:"0.5",priority:30}); changes.push({key:"system.attributes.chakra.max",mode:1,value:"0.5",priority:30}); }
  return changes;
}
async function refreshEffect(actor,state=readTracker(actor)){
  if(!getClassMod(actor)) return;
  let effect=arr(actor.effects).find(e=>e.getFlag?.(MODULE_ID,EFFECT_FLAG));
  const data={name:"Superior Shinobi — Superior & Burden",img:"icons/magic/control/buff-strength-muscle-damage-red.webp",disabled:false,transfer:false,duration:{},changes:effectChanges(actor,state),flags:{[MODULE_ID]:{[EFFECT_FLAG]:true}}};
  if(effect) await effect.update(data,{[INTERNAL]:{superior:true}}); else await actor.createEmbeddedDocuments("ActiveEffect",[data],{[INTERNAL]:{superior:true}});
}

async function rollDie(formula,label){ const roll=await (new Roll(formula)).evaluate(); await roll.toMessage({flavor:label}); return Number(roll.total ?? 0); }
async function useReserve(actor){
  actor=actorFromContext(actor); if(!actor || !getClassMod(actor)) return ui.notifications.warn("No Superior Shinobi character is selected.");
  const state=readTracker(actor); const hd=actor.system?.attributes?.hd ?? {}; const cd=actor.system?.attributes?.cd ?? {};
  const content=`<form class="n5eb-superior-pay"><p>Choose the resource gained and the die source.</p><div class="form-group"><label>Resource</label><select name="resource"><option value="health">Health (double as Temporary HP)</option><option value="chakra">Chakra (Temporary Chakra)</option></select></div><div class="form-group"><label>Source</label><select name="source">${state.reserveCurrent>0?`<option value="reserve">Reserve Die (${state.reserveCurrent}/${state.reserveMax})</option>`:""}${availableDice(actor,"hd")>0?`<option value="hd">Hit Die (${hd.value})</option>`:""}${availableDice(actor,"cd")>0?`<option value="cd">Chakra Die (${cd.value})</option>`:""}</select></div></form>`;
  const result=await foundry.applications.api.DialogV2.wait({window:{title:`Superior Reserves — ${actor.name}`},content,buttons:[{action:"use",label:"Use Reserve",icon:"fa-solid fa-battery-three-quarters",default:true,callback:(event,button)=>new FormDataExtended(button.form).object},{action:"cancel",label:"Cancel"}],rejectClose:false});
  if(!result?.source) return;
  const resource=result.resource; const source=result.source; let formula;
  if(resource==="health") formula=`d${Number(hd.denomination ?? 10)}`; else formula=`d${Number(cd.denomination ?? 8)}`;
  const total=await rollDie(formula,`${actor.name} — Superior Reserves (${resource})`); const burdenHalf=state.burden>=25; const gained=Math.floor((resource==="health"?total*2:total)*(burdenHalf?0.5:1));
  const updates={}; let patch={};
  if(source==="reserve") patch.reserveCurrent=state.reserveCurrent-1;
  else if(source==="hd") updates["system.attributes.hd.spent"]=Number(hd.spent ?? 0)+1;
  else if(source==="cd") updates["system.attributes.cd.spent"]=Number(cd.spent ?? 0)+1;
  if(source!=="reserve") patch.combatDiceSpent=state.combatDiceSpent+1; else patch.combatDiceSpent=state.combatDiceSpent+1;
  if(resource==="health") updates["system.attributes.hp.temp"]=Number(actor.system?.attributes?.hp?.temp ?? 0)+gained;
  else updates["system.attributes.chakra.temp"]=Number(actor.system?.attributes?.chakra?.temp ?? 0)+gained;
  if(Object.keys(updates).length) await actor.update(updates,{[INTERNAL]:{superior:true}}); await writeTracker(actor,patch); ui.notifications.info(`${actor.name} gains ${gained} Temporary ${resource==="health"?"Hit":"Chakra"} Points.`);
}

async function payTechnique(actor,item){
  const base=Number(techniqueFlag(item,"activeCost") ?? 1), cost=prophesisedCost(actor,item,base), state=readTracker(actor), id=techniqueIdentifier(item), max=freeUsesMax(actor), spent=Number(state.freeUsesSpent[id] ?? 0), free=Math.max(0,max-spent);
  if(cost===0){ ui.notifications.info(`${item.name} has no die cost due to The Prophesised.`); return true; }
  const options=[]; if(free>0) options.push(`<option value="free">Free Use (${free}/${max} remaining)</option>`); if(availableDice(actor,"hd")>=cost) options.push(`<option value="hd">Spend ${cost} Hit ${cost===1?"Die":"Dice"}</option>`); if(availableDice(actor,"cd")>=cost) options.push(`<option value="cd">Spend ${cost} Chakra ${cost===1?"Die":"Dice"}</option>`);
  if(!options.length){ ui.notifications.error(`${item.name} cannot be paid: no free uses or dice remain.`); return false; }
  const result=await foundry.applications.api.DialogV2.wait({window:{title:`Pay ${item.name}`},content:`<form><p><strong>Active Cost:</strong> ${cost} Hit or Chakra ${cost===1?"Die":"Dice"}.</p><div class="form-group"><label>Payment</label><select name="payment">${options.join("")}</select></div></form>`,buttons:[{action:"pay",label:"Pay",icon:"fa-solid fa-coins",default:true,callback:(event,button)=>new FormDataExtended(button.form).object.payment},{action:"cancel",label:"Cancel"}],rejectClose:false});
  if(!result) return false;
  if(result==="free"){ const map={...state.freeUsesSpent,[id]:spent+1}; await writeTracker(actor,{freeUsesSpent:map}); }
  else { const key=result==="hd"?"hd":"cd", data=actor.system.attributes[key]; await actor.update({[`system.attributes.${key}.spent`]:Number(data.spent ?? 0)+cost},{[INTERNAL]:{superior:true}}); await writeTracker(actor,{combatDiceSpent:state.combatDiceSpent+cost}); }
  return true;
}
function getActivityItem(activity){ return activity?.item ?? activity?.parent?.item ?? null; }

async function applyCombatBurden(actor){
  const state=readTracker(actor), gained=Math.floor(state.combatDiceSpent/2);
  if(!gained && !state.combatDiceSpent) return;
  const raw=state.burden+gained, overflow=Math.max(0,raw-30);
  await writeTracker(actor,{burden:Math.min(30,raw),combatDiceSpent:0});
  if(gained) ui.notifications.warn(`${actor.name} gains ${gained} Burden from Superior Shinobi.`);
  if(overflow>0){
    const damage=await rollDie(`${overflow}d12`,`${actor.name} — Excess Burden Damage`);
    const hp=Math.max(0,Number(actor.system?.attributes?.hp?.value ?? 0)-damage);
    await actor.update({"system.attributes.hp.value":hp},{[INTERNAL]:{superior:true}});
    ui.notifications.error(`${actor.name} takes ${damage} unavoidable Necrotic damage from ${overflow} excess Burden.`);
  }
}
async function applyRest(actor,type){ const state=readTracker(actor); let burden=state.burden,reserve=state.reserveCurrent,free=state.freeUsesSpent; const max=effectiveReserveMax(actor,burden);
  if(type==="short"){ burden=Math.max(0,burden-2); reserve=Math.min(effectiveReserveMax(actor,burden),reserve+Math.floor(max/2)); }
  else if(type==="long"){ burden=Math.max(0,burden-8); reserve=effectiveReserveMax(actor,burden); free={}; }
  else if(type==="full"){ burden=Math.max(0,burden-14); reserve=effectiveReserveMax(actor,burden); free={}; }
  await writeTracker(actor,{burden,reserveCurrent:reserve,freeUsesSpent:free}); }

function burdenText(b){ if(b>=30) return "Maximum HP and Chakra halved; Reserve -10"; if(b>=25) return "Half recovery; Perfect Hit disabled; Reserve -7"; if(b>=20) return "Superior suppressed; -3 Attacks/DCs; Reserve -5"; if(b>=15) return "-4 Skills; weakened Perfect Hit; Reserve -4"; if(b>=10) return "Half Superior; -1 Attacks/DCs; Reserve -2"; if(b>=5) return "-2 Skills; Reserve -1"; return "No Burden detriment"; }
function ownedTechniques(actor){ return arr(actor.items).filter(isTechnique); }
function trackerHtml(actor){
  const s=readTracker(actor), maxFree=freeUsesMax(actor), techniques=ownedTechniques(actor);
  const opts=['<option value="">No Prophesised reduction</option>',...techniques.map(i=>`<option value="${techniqueIdentifier(i)}" ${s.prophesisedTechniqueId===techniqueIdentifier(i)?"selected":""}>${foundry.utils.escapeHTML(i.name)}</option>`)].join('');
  const prophesised=hasOwnedItem(actor,"the-prophesised")
    ? `<section class="tracker-card"><header><span>The Prophesised</span><strong>${s.burden>=15?"Disabled by Burden":"Active"}</strong></header><select data-input="prophesised" ${s.burden>=15?"disabled":""}>${opts}</select></section>` : "";
  return `<div class="n5eb-superior-tracker-dialog" data-superior-root><p>Actor-based tracking: no Item Uses are used.</p><section class="tracker-card"><header><span>Reserve Dice</span><strong>${s.reserveCurrent}/${s.reserveMax}</strong></header><div class="tracker-controls"><button data-action="reserve-minus">-1</button><button data-action="use-reserve"><i class="fas fa-battery-three-quarters"></i> Use Superior Reserve</button><button data-action="reserve-plus">+1</button></div></section><section class="tracker-card"><header><span>Burden</span><strong>${s.burden}/30</strong></header><div class="tracker-progress"><span style="width:${s.burden/30*100}%"></span></div><p>${burdenText(s.burden)}</p><div class="tracker-controls"><button data-action="burden-minus">-1</button><input data-input="burden" type="number" min="0" max="30" value="${s.burden}"><button data-action="burden-plus">+1</button></div></section><section class="tracker-card"><header><span>Combat Dice Spent</span><strong>${s.combatDiceSpent}</strong></header><button data-action="apply-burden">Finish Combat & Apply Burden</button></section><section class="tracker-card"><header><span>Technique Free Uses</span><strong>${maxFree} each / Long Rest</strong></header><div class="technique-use-list">${techniques.map(i=>{const id=techniqueIdentifier(i),used=Number(s.freeUsesSpent[id]??0);return `<div><span>${foundry.utils.escapeHTML(i.name)}</span><strong>${Math.max(0,maxFree-used)}/${maxFree}</strong></div>`}).join('')||'<em>No owned Superior Techniques.</em>'}</div><button data-action="reset-free">Reset Free Uses</button></section>${prophesised}<footer><button data-action="short-rest">Short Rest</button><button data-action="long-rest">Long Rest</button><button data-action="full-rest">Full Rest</button></footer></div>`;
}
async function openTracker(actor){ actor=actorFromContext(actor); if(!actor||!getClassMod(actor)) return ui.notifications.warn("No Superior Shinobi character is selected."); await ensureTracker(actor); const key=trackerKey(actor); if(dialogs.get(key)?.rendered) return dialogs.get(key).bringToFront(); const DialogV2=foundry.applications.api.DialogV2; const dialog=new DialogV2({window:{title:`Superior Shinobi Tracker — ${actor.name}`,icon:"fa-solid fa-star",resizable:true},position:{width:680,height:"auto"},classes:["n5eb-superior-tracker-window"],content:trackerHtml(actor),buttons:[{action:"close",label:"Close"}]}); dialogs.set(key,dialog); dialog.addEventListener("render",()=>activateDialog(dialog,actor)); dialog.addEventListener("close",()=>dialogs.delete(key),{once:true}); await dialog.render({force:true}); return dialog; }
function refreshDialog(actor){ const d=dialogs.get(trackerKey(actor)); if(d?.rendered) d.render({force:true}); }
function activateDialog(dialog,actor){ const root=dialog.element?.querySelector?.('[data-superior-root]'); if(!root) return; const act=async action=>{const s=readTracker(actor); if(action==='reserve-minus') await writeTracker(actor,{reserveCurrent:s.reserveCurrent-1}); if(action==='reserve-plus') await writeTracker(actor,{reserveCurrent:s.reserveCurrent+1}); if(action==='use-reserve') await useReserve(actor); if(action==='burden-minus') await writeTracker(actor,{burden:s.burden-1}); if(action==='burden-plus') await writeTracker(actor,{burden:s.burden+1}); if(action==='apply-burden') await applyCombatBurden(actor); if(action==='reset-free') await writeTracker(actor,{freeUsesSpent:{}}); if(action==='short-rest') await applyRest(actor,'short'); if(action==='long-rest') await applyRest(actor,'long'); if(action==='full-rest') await applyRest(actor,'full'); };
  root.querySelectorAll('button[data-action]').forEach(b=>b.addEventListener('click',()=>act(b.dataset.action).catch(console.error)));
  root.querySelector('[data-input="burden"]')?.addEventListener('change',e=>writeTracker(actor,{burden:Number(e.currentTarget.value)})); root.querySelector('[data-input="prophesised"]')?.addEventListener('change',e=>writeTracker(actor,{prophesisedTechniqueId:String(e.currentTarget.value)})); }
function renderRoot(app,html){ return html?.[0] ?? html ?? app.element?.[0] ?? app.element; }
function renderStrip(app,html){ const actor=app.actor??app.document; if(!getClassMod(actor)) return; const root=renderRoot(app,html); if(!root||root.querySelector('[data-superior-strip]')) return; const target=root.querySelector('.jutsu-casting-overview')??root.querySelector('.sheet-body'); if(!target) return; const s=readTracker(actor); const section=document.createElement('section'); section.className='n5eb-superior-tracker-strip'; section.dataset.superiorStrip='true'; section.innerHTML=`<button class="tracker-title" data-action="open-superior"><i class="fas fa-star"></i> Superior Shinobi</button><div class="tracker-mini"><span>Reserve</span><strong>${s.reserveCurrent}/${s.reserveMax}</strong></div><div class="tracker-mini"><span>Burden</span><strong>${s.burden}/30</strong></div><div class="tracker-mini"><span>Combat Dice</span><strong>${s.combatDiceSpent}</strong></div>`; target.prepend(section); section.querySelector('[data-action="open-superior"]')?.addEventListener('click',()=>openTracker(actor)); }

Hooks.once('ready',async()=>{ globalThis.N5eBSuperior=Object.freeze({openTracker,useReserve,getTracker:readTracker,setTracker:writeTracker,applyCombatBurden}); if(game.system.id!=="n5eb") return; if(game.user.isGM) for(const actor of game.actors??[]) if(getClassMod(actor)) await ensureTracker(actor); });
Hooks.on('getActorSheetHeaderButtons',(sheet,buttons)=>{const actor=sheet.actor??sheet.document;if(!getClassMod(actor))return;const s=readTracker(actor);buttons.unshift({label:`Reserve ${s.reserveCurrent}/${s.reserveMax} · Burden ${s.burden}`,class:'n5eb-superior-tracker-button',icon:'fas fa-star',onclick:()=>openTracker(actor)});});
Hooks.on('renderActorSheet',renderStrip); Hooks.on('renderCharacterActorSheet',renderStrip);
Hooks.on('createItem',async(item,options,userId)=>{if(options?.[INTERNAL]||userId!==game.user.id||item.parent?.documentName!=="Actor")return;const actor=item.parent;if(item.type==='classmod'&&item.system?.identifier===CLASSMOD_ID||getClassMod(actor)&&isTechnique(item))await ensureTracker(actor);});
Hooks.on('updateItem',async(item,changes,options,userId)=>{if(options?.[INTERNAL]||userId!==game.user.id||item.parent?.documentName!=="Actor")return;const actor=item.parent;if(getClassMod(actor)&&item.type==='classmod'&&item.system?.identifier===CLASSMOD_ID)await ensureTracker(actor);});
Hooks.on('updateActor',async(actor,changes,options,userId)=>{if(options?.[INTERNAL]||userId!==game.user.id||!getClassMod(actor))return;await ensureTracker(actor);});
Hooks.on('dnd5e.postUseActivity',activity=>{const item=getActivityItem(activity),actor=activity?.actor??item?.actor;if(!actor||!isTechnique(item)||!getClassMod(actor))return;payTechnique(actor,item).catch(error=>{console.error(`${MODULE_ID} | Superior Technique payment failed`,error);ui.notifications.error(`Superior Technique tracking failed: ${error.message}`);});});
Hooks.on('dnd5e.restCompleted',(actor,result)=>{if(getClassMod(actor))applyRest(actor,result?.type).catch(console.error);});
Hooks.on('deleteCombat',combat=>{if(!game.user.isGM)return;const actors=new Set(arr(combat.combatants).map(c=>c.actor).filter(a=>a&&getClassMod(a)));for(const actor of actors)applyCombatBurden(actor).catch(console.error);});
