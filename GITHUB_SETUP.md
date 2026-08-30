const MODULE_ID = "n5eb-classmod-library";
const CLASSMOD_ID = "heavenly-gates";
const PACK_COLLECTION = "world.n5eb-custom-class-mods";
const TRACKER_FLAG = "heavenlyGatesTracker";
const EFFECT_FLAG = "heavenlyGatesReleaseEffect";
const GRANTED_STAGE_FLAG = "heavenlyGatesGrantedStage";
const INTERNAL = MODULE_ID;
const ICON = "systems/n5eb/assets/content/jutsu-icons/7th-inner-gate.webp";
const dialogs = new Map();

const MAX_STAGE = Object.freeze({
  gates: Object.freeze({1:2, 2:4, 3:6, 4:7, 5:8}),
  breaths: Object.freeze({1:2, 2:4, 3:5, 4:6, 5:7})
});

const STAGES = Object.freeze({
  gates: Object.freeze({
    1:{name:"Gate of Opening", str:2,dex:2,con:0,speed:10,dice:1,kind:"cd",perArt:"1d4"},
    2:{name:"Gate of Healing", str:2,dex:2,con:0,speed:15,dice:1,kind:"cd",perArt:"1d4",extraHitDice:2,activationReminder:"Remove all ranks of one listed condition from the Gate of Healing feature, if applicable.",conditions:["1 rank Weakened"]},
    3:{name:"Gate of Life", str:4,dex:2,con:0,speed:10,dice:1,kind:"cd",perArt:"1d6",backlash:"1d12+3"},
    4:{name:"Gate of Pain", str:2,dex:4,con:0,speed:20,dice:1,kind:"cd",perArt:"1d6",activationDamage:"1d12+4",backlash:"1d12+4",conditions:["1 rank Slowed"]},
    5:{name:"Gate of Limit", str:4,dex:2,con:0,speed:10,dice:1,kind:"cd",perArt:"1d8",backlash:"1d12+5",conditions:["1 rank Weakened"]},
    6:{name:"Gate of View", str:4,dex:4,con:0,speed:20,dice:2,kind:"cd",perArt:"1d8",backlash:"2d12+6",conditions:["1 rank Exhaustion"]},
    7:{name:"Gate of Wonder", str:6,dex:4,con:0,speed:0,dice:2,kind:"cd",perArt:"1d10",backlash:"2d12+7",conditions:["1 rank Weakened","1 rank Slowed","Vulnerability to all damage for 1 minute after deactivation"]},
    8:{name:"Gate of Death", str:6,dex:6,con:0,speed:0,dice:2,kind:"cd",perArt:"1d12",speedMultiplier:3,fatal:true}
  }),
  breaths: Object.freeze({
    1:{name:"First Heavenly Breath: Inhale", str:2,dex:0,con:2,speed:5,dice:1,kind:"hd",perArt:"1d4"},
    2:{name:"Second Heavenly Breath: Panting", str:2,dex:0,con:2,speed:10,dice:1,kind:"hd",perArt:"1d4",activationReminder:"Remove all ranks of two listed conditions from the Second Heavenly Breath feature, if applicable.",conditions:["1 rank Weakened"]},
    3:{name:"Third Heavenly Breath: Breathe", str:4,dex:0,con:2,speed:5,dice:1,kind:"hd",perArt:"1d6",backlash:"2d12",conditions:["1 rank Exhaustion"]},
    4:{name:"Fourth Heavenly Breath: Wheeze", str:4,dex:0,con:4,speed:10,dice:2,kind:"hd",perArt:"1d6",backlash:"2d12",conditions:["1 rank Weakened","1 rank Exhaustion"]},
    5:{name:"Fifth Heavenly Breath: Respire", str:6,dex:0,con:4,speed:15,dice:2,kind:"hd",perArt:"1d8",activationDamage:"1d12",backlash:"2d12",conditions:["1 rank Bleeding","Vulnerability to bleeding damage"]},
    6:{name:"Sixth Heavenly Breath: Gasp", str:6,dex:0,con:6,speed:20,dice:2,kind:"hd",perArt:"1d10",activationDamage:"1d20",backlash:"2d12",conditions:["2 ranks Bleeding","1 rank Exhaustion","Vulnerability to all damage for 1 minute after deactivation"]},
    7:{name:"Seventh Heavenly Breath: Exhale", str:6,dex:0,con:6,speed:0,dice:2,kind:"hd",perArt:"1d12",speedMultiplier:2,fatal:true}
  })
});

function arr(value){ return value ? (Array.isArray(value) ? value : Array.from(value)) : []; }
function actorFromContext(actor){ return actor ?? canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character ?? null; }
function getClassMod(actor){ return arr(actor?.items).find(i=>i.type==="classmod" && i.system?.identifier===CLASSMOD_ID) ?? null; }
function getLevel(actor){ return Math.max(0,Math.min(5,Number(getClassMod(actor)?.system?.levels ?? 0))); }
function moduleFlag(document,key){ return document?.getFlag?.(MODULE_ID,key) ?? document?.flags?.[MODULE_ID]?.[key]; }
function getPath(actor){
  if(arr(actor?.items).some(i=>moduleFlag(i,"heavenlyGatesPath")==="gates" || i.system?.identifier==="unstoppable-force-eight-gates")) return "gates";
  if(arr(actor?.items).some(i=>moduleFlag(i,"heavenlyGatesPath")==="breaths" || i.system?.identifier==="immovable-object-seven-heavenly-breaths")) return "breaths";
  return null;
}
function maxStage(actor,path=getPath(actor)){ return path ? Number(MAX_STAGE[path]?.[getLevel(actor)] ?? 0) : 0; }
function stageLabel(path,stage){ if(!path||!stage) return "Inactive"; return `${STAGES[path]?.[stage]?.name ?? `Stage ${stage}`} (${stage}/${maxStageFromLevel(path,5)})`; }
function maxStageFromLevel(path,level){ return Number(MAX_STAGE[path]?.[level] ?? 0); }
function aggregateDie(actor,kind){ return actor?.system?.attributes?.[kind] ?? {}; }
function availableDice(actor,kind){ return Number(aggregateDie(actor,kind)?.value ?? 0); }
function dieDenomination(actor,kind){ return Math.max(2,Number(aggregateDie(actor,kind)?.denomination ?? (kind==="hd"?10:8))); }
function conMod(actor){ const con=actor?.system?.abilities?.con ?? {}; return Number.isFinite(Number(con.mod)) ? Number(con.mod) : Math.floor((Number(con.value ?? 10)-10)/2); }
function clamp(v,min,max){ return Math.min(max,Math.max(min,Number(v)||0)); }
function esc(v){ return foundry.utils.escapeHTML(String(v ?? "")); }
function getActivityItem(activity){ return activity?.item ?? activity?.parent?.item ?? null; }

function defaultTracker(actor){
  return {version:2,path:getPath(actor),activeStage:0,startedAt:0,lastBacklash:"",lastSelfDamage:0,lastRecovery:0,tempHpBaseline:0,tempHpGranted:0,tempChakraBaseline:0,tempChakraGranted:0};
}
function normalizeTracker(actor,value={}){
  const selectedPath=getPath(actor);
  const storedPath=value.path === "gates" || value.path === "breaths" ? value.path : null;
  const rawStage=Math.max(0,Math.floor(Number(value.activeStage ?? 0) || 0));
  // While a release is active, preserve the path it was opened with so a path/level
  // edit can be detected and resolved instead of silently transforming the release.
  const path=rawStage>0 ? (storedPath ?? selectedPath) : selectedPath;
  const hardMaximum=path === "gates" ? 8 : path === "breaths" ? 7 : 0;
  const activeStage=clamp(rawStage,0,hardMaximum);
  return {
    version:2,
    path,
    activeStage,
    startedAt:Number(value.startedAt ?? 0),
    lastBacklash:String(value.lastBacklash ?? ""),
    lastSelfDamage:Math.max(0,Number(value.lastSelfDamage ?? 0)),
    lastRecovery:Math.max(0,Number(value.lastRecovery ?? 0)),
    tempHpBaseline:Math.max(0,Number(value.tempHpBaseline ?? 0)),
    tempHpGranted:Math.max(0,Number(value.tempHpGranted ?? 0)),
    tempChakraBaseline:Math.max(0,Number(value.tempChakraBaseline ?? 0)),
    tempChakraGranted:Math.max(0,Number(value.tempChakraGranted ?? 0))
  };
}
function readTracker(actor){ return normalizeTracker(actor,actor?.getFlag?.(MODULE_ID,TRACKER_FLAG) ?? defaultTracker(actor)); }
async function writeTracker(actor,patch={}, {render=true,refresh=true}={}){
  const next=normalizeTracker(actor,{...readTracker(actor),...patch});
  const raw=actor?.getFlag?.(MODULE_ID,TRACKER_FLAG);
  if(!raw || JSON.stringify(raw)!==JSON.stringify(next)) {
    await actor.update({[`flags.${MODULE_ID}.${TRACKER_FLAG}`]:next},{[INTERNAL]:{heavenlyGatesTracker:true}});
  }
  if(refresh) await refreshReleaseEffect(actor,next);
  if(render){ actor.sheet?.render?.(false); refreshDialog(actor); }
  return next;
}

function add(changes,key,value,mode=CONST.ACTIVE_EFFECT_MODES.ADD,priority=20){
  if(Number(value)) changes.push({key,mode,value:String(value),priority});
}
function cumulativeBonuses(path,stage){
  const total={str:0,dex:0,con:0,speed:0,multiplier:1};
  for(let n=1;n<=stage;n++){
    const s=STAGES[path]?.[n]; if(!s) continue;
    total.str+=Number(s.str??0); total.dex+=Number(s.dex??0); total.con+=Number(s.con??0); total.speed+=Number(s.speed??0);
    if(s.speedMultiplier) total.multiplier*=Number(s.speedMultiplier);
  }
  return total;
}
function effectChanges(path,stage){
  const b=cumulativeBonuses(path,stage), changes=[];
  add(changes,"system.abilities.str.value",b.str);
  add(changes,"system.abilities.dex.value",b.dex);
  add(changes,"system.abilities.con.value",b.con);
  // First Gate/Breath removes the relevant ability-score caps for the release.
  if(path==="gates"){ add(changes,"system.abilities.str.max",100); add(changes,"system.abilities.dex.max",100); }
  if(path==="breaths"){ add(changes,"system.abilities.str.max",100); add(changes,"system.abilities.con.max",100); }
  add(changes,"system.attributes.movement.walk",b.speed,CONST.ACTIVE_EFFECT_MODES.ADD,20);
  if(b.multiplier!==1) changes.push({key:"system.attributes.movement.walk",mode:CONST.ACTIVE_EFFECT_MODES.MULTIPLY,value:String(b.multiplier),priority:40});
  return changes;
}
async function refreshReleaseEffect(actor,state=readTracker(actor)){
  let effect=arr(actor?.effects).find(e=>moduleFlag(e,EFFECT_FLAG));
  if(!state.path || !state.activeStage){
    if(effect) await effect.delete({[INTERNAL]:{heavenlyGates:true}});
    return;
  }
  const sameStage=Boolean(effect && moduleFlag(effect,"path")===state.path && Number(moduleFlag(effect,"stage"))===state.activeStage);
  const startTime=sameStage ? Number(effect.duration?.startTime ?? game.time?.worldTime ?? 0) : Number(game.time?.worldTime ?? 0);
  const data={
    name:`Heavenly Gates — ${STAGES[state.path]?.[state.activeStage]?.name ?? `Stage ${state.activeStage}`}`,
    img:ICON,disabled:false,transfer:false,
    duration:{seconds:60,rounds:10,startTime},
    changes:effectChanges(state.path,state.activeStage),statuses:[],flags:{[MODULE_ID]:{[EFFECT_FLAG]:true,path:state.path,stage:state.activeStage}}
  };
  if(!effect) {
    await actor.createEmbeddedDocuments("ActiveEffect",[data],{[INTERNAL]:{heavenlyGates:true}});
    return;
  }
  const changed=effect.name!==data.name || effect.img!==data.img || effect.disabled!==false || effect.transfer!==false || Number(effect.duration?.seconds??0)!==60 || Number(effect.duration?.rounds??0)!==10 || JSON.stringify(effect.changes??[])!==JSON.stringify(data.changes) || moduleFlag(effect,"path")!==state.path || Number(moduleFlag(effect,"stage"))!==state.activeStage;
  if(changed) await effect.update(data,{[INTERNAL]:{heavenlyGates:true}});
}

function findAvailableClassDie(actor,kind){
  const classes=arr(actor?.system?.attributes?.[kind]?.classes);
  return classes.find(item=>Number(item?.system?.[kind]?.value ?? 0)>0)
    ?? arr(Object.values(actor?.classes ?? {})).find(item=>Number(item?.system?.[kind]?.value ?? 0)>0);
}
async function spendOneDie(actor,kind){
  if(availableDice(actor,kind)<1) return false;
  const cls=findAvailableClassDie(actor,kind);
  if(cls){
    const spent=Number(cls.system?.[kind]?.spent ?? 0);
    await cls.update({[`system.${kind}.spent`]:spent+1},{[INTERNAL]:{heavenlyGates:true}});
    return true;
  }
  const spent=Number(actor?._source?.system?.attributes?.[kind]?.spent ?? actor?.system?.attributes?.[kind]?.spent ?? 0);
  await actor.update({[`system.attributes.${kind}.spent`]:spent+1},{[INTERNAL]:{heavenlyGates:true}});
  return true;
}
async function spendDice(actor,kind,count){
  count=Math.max(0,Number(count)||0); if(availableDice(actor,kind)<count) return false;
  for(let i=0;i<count;i++) if(!await spendOneDie(actor,kind)) return false;
  return true;
}
async function rollFormula(actor,formula,label){
  const roll=await new Roll(formula).evaluate();
  await roll.toMessage({flavor:`${actor.name} — ${label}`,speaker:ChatMessage.getSpeaker({actor})});
  return Number(roll.total ?? 0);
}
async function recoverResource(actor,path,diceCount,label){
  const kind=path==="gates"?"cd":"hd", denom=dieDenomination(actor,kind), con=conMod(actor);
  const formula=`${diceCount}d${denom}${con*diceCount>=0?'+':''}${con*diceCount}`;
  const gained=Math.max(0,await rollFormula(actor,formula,label));
  const root=path==="gates"?"chakra":"hp";
  const resource=actor.system?.attributes?.[root] ?? {}, current=Number(resource.value??0), maximum=Number(resource.max??current), temp=Number(resource.temp??0);
  const direct=Math.min(gained,Math.max(0,maximum-current)), overflow=Math.max(0,gained-direct);
  await actor.update({[`system.attributes.${root}.value`]:current+direct,[`system.attributes.${root}.temp`]:temp+overflow},{[INTERNAL]:{heavenlyGates:true}});
  return {gained,direct,overflow};
}
async function convertReleaseTemporary(actor){
  const state=readTracker(actor); if(!state.path || !state.activeStage) return 0;
  const isGates=state.path==="gates", root=isGates?"chakra":"hp", grantKey=isGates?"tempChakraGranted":"tempHpGranted";
  const resource=actor.system?.attributes?.[root] ?? {}, current=Number(resource.value??0), maximum=Number(resource.max??current), temp=Number(resource.temp??0), granted=Math.max(0,Number(state[grantKey]??0));
  const amount=Math.min(25,Math.max(0,maximum-current),Math.max(0,temp),granted); if(!amount) return 0;
  const next=normalizeTracker(actor,{...state,[grantKey]:Math.max(0,granted-amount)});
  await actor.update({[`system.attributes.${root}.value`]:current+amount,[`system.attributes.${root}.temp`]:temp-amount,[`flags.${MODULE_ID}.${TRACKER_FLAG}`]:next},{[INTERNAL]:{heavenlyGates:true}});
  refreshDialog(actor);
  ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)} — Heavenly Gates:</strong> ${amount} Temporary ${isGates?"Chakra":"HP"} converted into regular ${isGates?"Chakra":"HP"} at the start of the turn.</p>`});
  return amount;
}
async function recoverGateHealing(actor){
  const denom=dieDenomination(actor,"hd"), con=conMod(actor);
  const gained=Math.max(0,await rollFormula(actor,`2d${denom}${2*con>=0?'+':''}${2*con}`,"Gate of Healing — Hit Dice"));
  const hp=actor.system?.attributes?.hp ?? {}, current=Number(hp.value??0), maximum=Number(hp.max??current), temp=Number(hp.temp??0);
  const direct=Math.min(gained,Math.max(0,maximum-current)), overflow=Math.max(0,gained-direct);
  await actor.update({"system.attributes.hp.value":current+direct,"system.attributes.hp.temp":temp+overflow},{[INTERNAL]:{heavenlyGates:true}});
  return {gained,direct,overflow};
}
function releaseTempBaseline(actor){
  return {tempHpBaseline:Math.max(0,Number(actor.system?.attributes?.hp?.temp??0)),tempChakraBaseline:Math.max(0,Number(actor.system?.attributes?.chakra?.temp??0)),tempHpGranted:0,tempChakraGranted:0};
}
async function clearReleaseTemporary(actor,state=readTracker(actor)){
  const updates={};
  for(const [root,baselineKey,grantKey] of [["hp","tempHpBaseline","tempHpGranted"],["chakra","tempChakraBaseline","tempChakraGranted"]]){
    const granted=Math.max(0,Number(state[grantKey]??0)); if(!granted) continue;
    const current=Math.max(0,Number(actor.system?.attributes?.[root]?.temp??0)), baseline=Math.max(0,Number(state[baselineKey]??0));
    const visibleGrant=Math.max(0,current-baseline), remove=Math.min(granted,visibleGrant);
    if(remove>0) updates[`system.attributes.${root}.temp`]=Math.max(0,current-remove);
  }
  if(Object.keys(updates).length) await actor.update(updates,{[INTERNAL]:{heavenlyGates:true}});
}
async function applyUnavoidableDamage(actor,amount,reason){
  amount=Math.max(0,Math.floor(Number(amount)||0)); if(!amount) return 0;
  const hp=Number(actor.system?.attributes?.hp?.value ?? 0), next=Math.max(0,hp-amount);
  await actor.update({"system.attributes.hp.value":next},{[INTERNAL]:{heavenlyGates:true}});
  ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)} — ${esc(reason)}:</strong> ${amount} unavoidable Necrotic damage (Temporary HP bypassed).</p>`});
  return amount;
}

function canActivate(actor,requestedStage=null,{notify=true}={}){
  const path=getPath(actor), state=readTracker(actor), level=getLevel(actor);
  if(!getClassMod(actor)){ if(notify) ui.notifications.warn("This Actor does not have the Heavenly Gates Class Mod."); return false; }
  if(!path){ if(notify) ui.notifications.warn("Choose the Eight Gates or Seven Heavenly Breaths path first."); return false; }
  const next=state.activeStage+1, stage=requestedStage ?? next, maximum=maxStage(actor,path);
  if(stage!==next){ if(notify) ui.notifications.warn(`You must advance sequentially. The next stage is ${next}.`); return false; }
  if(stage>maximum){ if(notify) ui.notifications.warn(`Class Mod level ${level} only allows ${path==="gates"?"Gate":"Breath"} ${maximum}.`); return false; }
  const data=STAGES[path]?.[stage]; if(!data) return false;
  if(availableDice(actor,data.kind)<data.dice){ if(notify) ui.notifications.warn(`You need ${data.dice} remaining ${data.kind==="cd"?"Chakra":"Hit"} ${data.dice===1?"Die":"Dice"}.`); return false; }
  if(path==="gates" && stage===2 && availableDice(actor,"hd")<2){ if(notify) ui.notifications.warn("Gate of Healing also requires 2 remaining Hit Dice."); return false; }
  return true;
}

async function activateNext(actor,{requestedStage=null}={}){
  actor=actorFromContext(actor); if(!actor || !canActivate(actor,requestedStage)) return false;
  const path=getPath(actor), state=readTracker(actor), stage=requestedStage ?? state.activeStage+1, data=STAGES[path][stage];
  const starting=state.activeStage===0, baseline=starting?releaseTempBaseline(actor):{};
  if(!await spendDice(actor,data.kind,data.dice)) return ui.notifications.error("The required class dice could not be spent.");
  if(path==="gates" && stage===2 && !await spendDice(actor,"hd",2)) return ui.notifications.error("Gate of Healing could not spend its 2 Hit Dice.");
  const recovered=await recoverResource(actor,path,data.dice,`${data.name} — ${path==="gates"?"Chakra":"Hit"} Die Recovery`);
  let extra={gained:0,direct:0,overflow:0};
  if(path==="gates" && stage===2) extra=await recoverGateHealing(actor);
  const patch={path,activeStage:stage,startedAt:Number(game.time?.worldTime ?? Date.now()/1000),lastRecovery:recovered.gained+extra.gained,lastBacklash:"",...baseline};
  if(path==="gates") patch.tempChakraGranted=(starting?0:state.tempChakraGranted)+recovered.overflow;
  else patch.tempHpGranted=(starting?0:state.tempHpGranted)+recovered.overflow;
  if(extra.overflow) patch.tempHpGranted=(starting?0:state.tempHpGranted)+extra.overflow;
  await writeTracker(actor,patch);
  if(data.activationDamage){
    const dmg=await rollFormula(actor,data.activationDamage,`${data.name} — Activation Damage`);
    await applyUnavoidableDamage(actor,dmg,`${data.name} activation`);
  }
  const per=data.perArt;
  ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)} opens ${esc(data.name)}.</strong></p><p>Release stage ${stage}/${maxStage(actor,path)}. Current self-damage: <strong>${esc(per)} Necrotic per Heavenly/Beastly Art</strong> (half for other jutsu).${extra.gained?` Gate of Healing restored ${extra.gained} additional HP/Temporary HP.`:""}</p>${data.activationReminder?`<p><strong>Activation reminder:</strong> ${esc(data.activationReminder)}</p>`:""}`});
  if(Number(actor.system?.attributes?.hp?.value??0)<=0) await deactivate(actor,{reason:"ended on unconsciousness"});
  return true;
}

function hardenedLimit(actor,path,activeStage){
  const level=getLevel(actor); if(level<3 || !arr(actor.items).some(i=>i.system?.identifier==="hardened-physique")) return 0;
  if(level>=5) return path==="gates"?7:6;
  return Math.floor(activeStage/2);
}
async function calculateBacklash(actor,path,activeStage){
  const resistanceLimit=hardenedLimit(actor,path,activeStage); let total=0; const parts=[]; const conditions=[];
  for(let n=1;n<=activeStage;n++){
    const data=STAGES[path]?.[n]; if(!data) continue;
    if(data.backlash){
      let value=await rollFormula(actor,data.backlash,`${data.name} — Deactivation Backlash`);
      const resisted=n<=resistanceLimit;
      if(resisted) value=Math.floor(value/2);
      total+=value; parts.push(`${data.name}: ${value}${resisted?" (Hardened Physique)":""}`);
    }
    for(const c of data.conditions??[]) conditions.push(`${data.name}: ${c}`);
  }
  return {total,parts,conditions};
}
async function deactivate(actor,{reason="deactivated"}={}){
  actor=actorFromContext(actor); if(!actor) return false;
  const state=readTracker(actor); if(!state.path || !state.activeStage) return false;
  const path=state.path, stage=state.activeStage, fatal=Boolean(STAGES[path]?.[stage]?.fatal);
  let summary="";
  if(fatal){
    await actor.update({"system.attributes.hp.value":0},{[INTERNAL]:{heavenlyGates:true}});
    summary=`${STAGES[path][stage].name}: fatal deactivation. HP set to 0; the source rule states the character dies and cannot be revived by normal or Class Mod means.`;
  } else {
    const backlash=await calculateBacklash(actor,path,stage);
    if(backlash.total) await applyUnavoidableDamage(actor,backlash.total,"Heavenly Gates deactivation backlash");
    summary=[`Numeric backlash: ${backlash.total} unavoidable Necrotic damage.`,...backlash.parts,backlash.conditions.length?`Apply/verify ranked conditions manually: ${backlash.conditions.join("; ")}`:""] .filter(Boolean).join(" ");
  }
  await clearReleaseTemporary(actor,state);
  await writeTracker(actor,{activeStage:0,startedAt:0,lastBacklash:summary,tempHpBaseline:0,tempHpGranted:0,tempChakraBaseline:0,tempChakraGranted:0},{refresh:true});
  ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>${esc(actor.name)} — Heavenly Gates ${esc(reason)}.</strong></p><p>${esc(summary)}</p>`});
  return true;
}

async function payAbilityChakra(actor,item){
  const cost=Number(moduleFlag(item,"heavenlyGatesAbilityChakraCost") ?? 0); if(!cost) return true;
  const chakra=actor.system?.attributes?.chakra ?? {}, value=Number(chakra.value??0);
  if(value<cost) return false;
  await actor.update({"system.attributes.chakra.value":value-cost},{[INTERNAL]:{heavenlyGates:true}}); return true;
}
function artPrerequisiteCheck(actor,item,{notify=true}={}){
  const path=getPath(actor), state=readTracker(actor), artPath=moduleFlag(item,"heavenlyGatesArtPath") ?? "both", req=Number(moduleFlag(item,"heavenlyGatesRequiredStage") ?? 1);
  if(!getClassMod(actor)) return true;
  if(artPath!=="both" && path!==artPath){ if(notify) ui.notifications.warn(`${item.name} requires the ${artPath==="gates"?"Eight Gates":"Seven Heavenly Breaths"} path.`); return false; }
  if(!state.activeStage || state.activeStage<req){ if(notify) ui.notifications.warn(`${item.name} requires release stage ${req} or higher.`); return false; }
  const abilityCost=Number(moduleFlag(item,"heavenlyGatesAbilityChakraCost") ?? 0);
  if(abilityCost && Number(actor.system?.attributes?.chakra?.value ?? 0)<abilityCost){ if(notify) ui.notifications.warn(`${item.name} requires ${abilityCost} Chakra.`); return false; }
  return true;
}
async function processArtUse(actor,item){
  if(moduleFlag(item,"heavenlyGatesAbilityChakraCost")){
    if(!await payAbilityChakra(actor,item)) return ui.notifications.error(`${item.name}: Chakra payment failed.`);
  }
  const state=readTracker(actor); if(!state.activeStage || !state.path) return;
  const data=STAGES[state.path]?.[state.activeStage]; if(!data?.perArt) return;
  const full=await rollFormula(actor,data.perArt,`${item.name} — Heavenly Gates Self-Damage`);
  const amount=moduleFlag(item,"heavenlyGatesArt") ? full : Math.floor(full/2);
  await applyUnavoidableDamage(actor,amount,`${item.name} self-damage`);
  await writeTracker(actor,{lastSelfDamage:amount},{refresh:false});
  if(Number(actor.system?.attributes?.hp?.value??0)<=0) await deactivate(actor,{reason:"ended on unconsciousness"});
  else if(moduleFlag(item,"heavenlyGatesLethalFinisher")) await deactivate(actor,{reason:`ended by ${item.name}`});
}

async function getPackDocuments(){ const pack=game.packs.get(PACK_COLLECTION); return pack ? await pack.getDocuments() : []; }
async function syncStageItems(actor){
  const cm=getClassMod(actor); if(!cm) return;
  const path=getPath(actor), maximum=maxStage(actor,path), docs=await getPackDocuments();
  const desired=docs.filter(d=>{ const st=moduleFlag(d,"heavenlyGatesStage"); return st?.path===path && Number(st.stage)<=maximum; });
  const desiredIds=new Set(desired.map(d=>d.system?.identifier));
  const owned=arr(actor.items).filter(i=>moduleFlag(i,GRANTED_STAGE_FLAG));
  const remove=owned.filter(i=>!desiredIds.has(i.system?.identifier));
  if(remove.length) await actor.deleteEmbeddedDocuments("Item",remove.map(i=>i.id),{[INTERNAL]:{heavenlyGates:true}});
  const have=new Set(arr(actor.items).map(i=>i.system?.identifier));
  const create=desired.filter(d=>!have.has(d.system?.identifier)).map(d=>{
    const source=d.toObject(); delete source._id;
    source.flags=foundry.utils.mergeObject(source.flags??{},{[MODULE_ID]:{[GRANTED_STAGE_FLAG]:true}},{inplace:false,overwrite:true});
    return source;
  });
  if(create.length) await actor.createEmbeddedDocuments("Item",create,{[INTERNAL]:{heavenlyGates:true}});
}
async function ensureActor(actor){
  if(!getClassMod(actor)) return;
  const selected=getPath(actor), state=readTracker(actor);
  if(state.activeStage>0 && (!selected || selected!==state.path)) {
    await deactivate(actor,{reason:"ended because the Heavenly Gates path changed"});
  } else if(state.activeStage>maxStage(actor,state.path)) {
    await deactivate(actor,{reason:"ended because the Class Mod level no longer supports the active stage"});
  }
  await syncStageItems(actor);
  const normalized=readTracker(actor), raw=actor?.getFlag?.(MODULE_ID,TRACKER_FLAG);
  if(!raw || JSON.stringify(raw)!==JSON.stringify(normalized)) {
    await actor.update({[`flags.${MODULE_ID}.${TRACKER_FLAG}`]:normalized},{[INTERNAL]:{heavenlyGatesTracker:true}});
  }
  await refreshReleaseEffect(actor,normalized);
}
async function cleanupActor(actor){
  const state=readTracker(actor);
  await clearReleaseTemporary(actor,state);
  const stages=arr(actor?.items).filter(i=>moduleFlag(i,GRANTED_STAGE_FLAG));
  if(stages.length) await actor.deleteEmbeddedDocuments("Item",stages.map(i=>i.id),{[INTERNAL]:{heavenlyGates:true}});
  const effects=arr(actor?.effects).filter(e=>moduleFlag(e,EFFECT_FLAG));
  if(effects.length) await actor.deleteEmbeddedDocuments("ActiveEffect",effects.map(e=>e.id),{[INTERNAL]:{heavenlyGates:true}});
  if(actor?.getFlag?.(MODULE_ID,TRACKER_FLAG)!==undefined) await actor.update({[`flags.${MODULE_ID}.-=${TRACKER_FLAG}`]:null},{[INTERNAL]:{heavenlyGates:true}});
  refreshDialog(actor);
}
function isRelevantClassModItem(item){
  return item?.type==="classmod" && item.system?.identifier===CLASSMOD_ID;
}
function isRelevantPathItem(item){
  return moduleFlag(item,"heavenlyGatesPath") || ["unstoppable-force-eight-gates","immovable-object-seven-heavenly-breaths"].includes(item?.system?.identifier);
}

function trackerKey(actor){ return actor?.uuid ?? actor?.id; }
function currentSummary(actor){
  const s=readTracker(actor); if(!s.path||!s.activeStage) return "No release is active.";
  const b=cumulativeBonuses(s.path,s.activeStage), mult=b.multiplier!==1?` ×${b.multiplier} final speed`:"";
  return `STR +${b.str}, DEX +${b.dex}, CON +${b.con}, Speed +${b.speed} ft${mult}; self-damage ${STAGES[s.path][s.activeStage].perArt} per Art.`;
}
function trackerHtml(actor){
  const s=readTracker(actor), path=s.path, maximum=maxStage(actor,path), hd=availableDice(actor,"hd"), cd=availableDice(actor,"cd");
  const pathName=path==="gates"?"Eight Gates":path==="breaths"?"Seven Heavenly Breaths":"No path selected";
  const current=s.activeStage?STAGES[path]?.[s.activeStage]?.name:"Inactive";
  const next=s.activeStage<maximum?STAGES[path]?.[s.activeStage+1]?.name:"—";
  return `<div class="n5eb-heavenly-tracker" data-heavenly-root>
    <header><div><h2>Heavenly Gates</h2><p>${esc(pathName)}</p></div><div class="stage-orb">${s.activeStage}<small>/${maximum}</small></div></header>
    <section class="heavenly-grid"><div><span>Current</span><strong>${esc(current)}</strong></div><div><span>Next</span><strong>${esc(next)}</strong></div><div><span>Hit Dice</span><strong>${hd}</strong></div><div><span>Chakra Dice</span><strong>${cd}</strong></div></section>
    <section class="heavenly-summary"><h3>Automated bonuses</h3><p>${esc(currentSummary(actor))}</p>${s.lastRecovery?`<p><strong>Last recovery:</strong> ${s.lastRecovery}</p>`:""}${s.lastSelfDamage?`<p><strong>Last self-damage:</strong> ${s.lastSelfDamage}</p>`:""}${s.lastBacklash?`<p class="backlash"><strong>Last backlash:</strong> ${esc(s.lastBacklash)}</p>`:""}</section>
    <footer><button type="button" data-action="advance" ${!path||s.activeStage>=maximum?"disabled":""}><i class="fas fa-forward"></i> Open Next Stage</button><button type="button" data-action="deactivate" ${!s.activeStage?"disabled":""}><i class="fas fa-hand"></i> Deactivate</button>${game.user.isGM?'<button type="button" data-action="reset"><i class="fas fa-rotate-left"></i> GM Reset Tracker</button>':''}</footer>
  </div>`;
}
async function openTracker(actor){
  actor=actorFromContext(actor); if(!actor||!getClassMod(actor)) return ui.notifications.warn("No Heavenly Gates character is selected.");
  await ensureActor(actor); const key=trackerKey(actor); if(dialogs.get(key)?.rendered) return dialogs.get(key).bringToFront();
  const DialogV2=foundry.applications.api.DialogV2;
  const dialog=new DialogV2({window:{title:`Heavenly Gates — ${actor.name}`,icon:"fa-solid fa-fire-flame-curved",resizable:true},position:{width:650,height:"auto"},classes:["n5eb-heavenly-tracker-window"],content:trackerHtml(actor),buttons:[{action:"close",label:"Close"}]});
  dialogs.set(key,dialog); dialog.addEventListener("render",()=>activateDialog(dialog,actor)); dialog.addEventListener("close",()=>dialogs.delete(key),{once:true}); await dialog.render({force:true}); return dialog;
}
function refreshDialog(actor){ const d=dialogs.get(trackerKey(actor)); if(d?.rendered) d.render({force:true}); }
function activateDialog(dialog,actor){
  const root=dialog.element?.querySelector?.('[data-heavenly-root]'); if(!root) return;
  root.querySelector('[data-action="advance"]')?.addEventListener('click',()=>activateNext(actor).catch(console.error));
  root.querySelector('[data-action="deactivate"]')?.addEventListener('click',()=>deactivate(actor).catch(console.error));
  root.querySelector('[data-action="reset"]')?.addEventListener('click',async()=>{ const state=readTracker(actor); await clearReleaseTemporary(actor,state); await writeTracker(actor,{activeStage:0,startedAt:0,lastBacklash:"",lastSelfDamage:0,lastRecovery:0,tempHpBaseline:0,tempHpGranted:0,tempChakraBaseline:0,tempChakraGranted:0}); });
}
function renderRoot(app,html){ return html?.[0] ?? html ?? app.element?.[0] ?? app.element; }
function renderStrip(app,html){
  const actor=app.actor??app.document; if(!getClassMod(actor)) return;
  const root=renderRoot(app,html); if(!root||root.querySelector('[data-heavenly-strip]')) return;
  const target=root.querySelector('.jutsu-casting-overview')??root.querySelector('.sheet-body'); if(!target) return;
  const s=readTracker(actor), path=s.path, maximum=maxStage(actor,path), data=s.activeStage?STAGES[path]?.[s.activeStage]:null;
  const section=document.createElement('section'); section.className='n5eb-heavenly-tracker-strip'; section.dataset.heavenlyStrip='true';
  section.innerHTML=`<button type="button" class="tracker-title" data-action="open-heavenly"><img src="${ICON}"> Heavenly Gates</button><div class="tracker-mini"><span>Path</span><strong>${path==="gates"?"Gates":path==="breaths"?"Breaths":"Choose"}</strong></div><div class="tracker-mini"><span>Stage</span><strong>${s.activeStage}/${maximum}</strong></div><div class="tracker-mini"><span>Self-Dmg</span><strong>${data?.perArt??"—"}</strong></div>`;
  target.prepend(section); section.querySelector('[data-action="open-heavenly"]')?.addEventListener('click',()=>openTracker(actor));
}

Hooks.once("ready",async()=>{
  globalThis.N5eBHeavenlyGates=Object.freeze({openTracker,activateNext,deactivate,getTracker:readTracker,setTracker:writeTracker,syncStages:syncStageItems});
  if(game.system.id!=="n5eb") return;
  if(game.user.isGM) for(const actor of game.actors??[]) if(getClassMod(actor)) await ensureActor(actor);
});
Hooks.on("getActorSheetHeaderButtons",(sheet,buttons)=>{
  const actor=sheet.actor??sheet.document; if(!getClassMod(actor)) return; const s=readTracker(actor), maximum=maxStage(actor,s.path);
  buttons.unshift({label:`Heavenly ${s.activeStage}/${maximum}`,class:"n5eb-heavenly-tracker-button",icon:"fas fa-fire-flame-curved",onclick:()=>openTracker(actor)});
});
Hooks.on("renderActorSheet",renderStrip); Hooks.on("renderCharacterActorSheet",renderStrip); Hooks.on("renderApplicationV2",renderStrip);
Hooks.on("createItem",async(item,options,userId)=>{
  if(options?.[INTERNAL]||userId!==game.user.id||item.parent?.documentName!=="Actor") return; const actor=item.parent;
  if(isRelevantClassModItem(item) || (getClassMod(actor)&&isRelevantPathItem(item))) await ensureActor(actor);
});
Hooks.on("updateItem",async(item,changes,options,userId)=>{
  if(options?.[INTERNAL]||userId!==game.user.id||item.parent?.documentName!=="Actor") return; const actor=item.parent;
  if(getClassMod(actor) && (isRelevantClassModItem(item)||isRelevantPathItem(item))) await ensureActor(actor);
});
Hooks.on("deleteItem",async(item,options,userId)=>{
  if(options?.[INTERNAL]||userId!==game.user.id||item.parent?.documentName!=="Actor") return; const actor=item.parent;
  if(isRelevantClassModItem(item)) await cleanupActor(actor);
  else if(getClassMod(actor)&&isRelevantPathItem(item)) await ensureActor(actor);
});
Hooks.on("updateActor",async(actor,changes,options,userId)=>{
  if(options?.[INTERNAL]||userId!==game.user.id||!getClassMod(actor)) return;
  const hp=foundry.utils.getProperty(changes,"system.attributes.hp.value");
  if(hp!==undefined && Number(hp)<=0 && readTracker(actor).activeStage>0) await deactivate(actor,{reason:"ended on unconsciousness"});
});
Hooks.on("deleteActiveEffect",async(effect,options,userId)=>{
  if(options?.[INTERNAL]||userId!==game.user.id||!moduleFlag(effect,EFFECT_FLAG)) return; const actor=effect.parent;
  if(actor?.documentName==="Actor" && readTracker(actor).activeStage>0) await deactivate(actor,{reason:"expired"});
});
Hooks.on("updateActiveEffect",async(effect,changes,options,userId)=>{
  if(options?.[INTERNAL]||userId!==game.user.id||!moduleFlag(effect,EFFECT_FLAG)||!changes.disabled) return; const actor=effect.parent;
  if(actor?.documentName==="Actor" && readTracker(actor).activeStage>0) await deactivate(actor,{reason:"disabled"});
});
Hooks.on("dnd5e.preUseActivity",activity=>{
  const item=getActivityItem(activity), actor=activity?.actor??item?.actor; if(!actor||!getClassMod(actor)||!item) return;
  const stage=moduleFlag(item,"heavenlyGatesStage");
  if(stage){ if(stage.path!==getPath(actor)){ ui.notifications.warn(`${item.name} is not part of your Heavenly Gates path.`); return false; } return canActivate(actor,Number(stage.stage)); }
  if(moduleFlag(item,"heavenlyGatesArt")) return artPrerequisiteCheck(actor,item);
  return;
});
Hooks.on("updateCombat",async(combat,changes,options,userId)=>{
  if(userId!==game.user.id || (!Object.hasOwn(changes,"turn") && !Object.hasOwn(changes,"round"))) return;
  const actor=combat.combatant?.actor; if(!actor||!getClassMod(actor)||readTracker(actor).activeStage<=0) return;
  await convertReleaseTemporary(actor);
});
Hooks.on("dnd5e.postUseActivity",activity=>{
  const item=getActivityItem(activity), actor=activity?.actor??item?.actor; if(!actor||!getClassMod(actor)||!item) return;
  const stage=moduleFlag(item,"heavenlyGatesStage");
  if(stage){ activateNext(actor,{requestedStage:Number(stage.stage)}).catch(error=>{console.error(`${MODULE_ID} | Heavenly Gates stage activation failed`,error);ui.notifications.error(`Heavenly Gates activation failed: ${error.message}`);}); return; }
  if(moduleFlag(item,"heavenlyGatesReleaseController")){ (readTracker(actor).activeStage?deactivate(actor):activateNext(actor)).catch(console.error); return; }
  if(moduleFlag(item,"heavenlyGatesArt")) processArtUse(actor,item).catch(error=>{console.error(`${MODULE_ID} | Heavenly Gates Art processing failed`,error);ui.notifications.error(`Heavenly Gates Art automation failed: ${error.message}`);});
  else if(readTracker(actor).activeStage>0 && item.type==="spell" && item.system?.jutsu) processArtUse(actor,item).catch(console.error);
});
