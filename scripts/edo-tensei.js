const MODULE_ID = "n5eb-classmod-library";
const CLASSMOD_ID = "edo-tensei";
const PACK_COLLECTION = "world.n5eb-custom-class-mods";
const TRACKER_FLAG = "edoTenseiTracker";
const PROFILE_FLAG = "edoTenseiProfile";
const INTERNAL = "n5ebEdoTenseiInternal";
const COVER = `modules/${MODULE_ID}/assets/edo-tensei-cover.webp`;

const CHARGES_BY_LEVEL = Object.freeze({1:2, 2:6, 3:9, 4:13, 5:18});
const ACTIVE_BY_LEVEL = Object.freeze({1:1, 2:2, 3:3, 4:4, 5:5});
const RANK_ORDER = Object.freeze(["d", "c", "b", "a", "s"]);
const RANK_DATA = Object.freeze({
  d: {label:"D-Rank", level:8,  slots:10, speed:30, cap:16, budget:0},
  c: {label:"C-Rank", level:11, slots:14, speed:45, cap:20, budget:6},
  b: {label:"B-Rank", level:14, slots:18, speed:60, cap:22, budget:12},
  a: {label:"A-Rank", level:17, slots:22, speed:75, cap:24, budget:18},
  s: {label:"S-Rank", level:20, slots:26, speed:90, cap:26, budget:24}
});
const TIER_DATA = Object.freeze({
  standard: {label:"Standard", hp:1, slots:1, dc:0, dna:0, eliteActions:0, extraSkills:0, chargeCost:1},
  elite: {label:"Elite", hp:2, slots:2, dc:2, dna:1, eliteActions:1, extraSkills:3, chargeCost:2},
  solo: {label:"Solo", hp:3, slots:3, dc:4, dna:2, eliteActions:2, extraSkills:5, chargeCost:3}
});
const ROLE_LABELS = Object.freeze({caster:"Caster", controller:"Controller", defender:"Defender", lurker:"Lurker", striker:"Striker", supporter:"Supporter"});
const dialogs = new Map();

function asArray(collection) {
  if (!collection) return [];
  return Array.isArray(collection) ? collection : Array.from(collection);
}
function clamp(value, min, max) { return Math.min(max, Math.max(min, Number(value) || 0)); }
function esc(value) { return foundry.utils.escapeHTML(String(value ?? "")); }
function actorFromContext(actor) {
  if (actor?.documentName === "Actor") return actor;
  if (actor?.actor?.documentName === "Actor") return actor.actor;
  return canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character ?? null;
}
function getClassMod(actor) {
  return asArray(actor?.items).find(item => item.type === "classmod" && item.system?.identifier === CLASSMOD_ID) ?? null;
}
function classModLevel(actor) { return clamp(getClassMod(actor)?.system?.levels ?? 1, 1, 5); }
function maxCharges(actor) { return CHARGES_BY_LEVEL[classModLevel(actor)] ?? 2; }
function maxActive(actor) {
  const base = ACTIVE_BY_LEVEL[classModLevel(actor)] ?? 1;
  const extra = asArray(actor?.items).some(i => i.getFlag?.(MODULE_ID, "edoArtType") === "passive" && i.system?.identifier === "art-infinite-binding") ? 1 : 0;
  return base + extra;
}
function defaultTracker(actor) {
  const max = maxCharges(actor);
  return {version:1, chargesCurrent:max, chargesMax:max, shortRestRecoveriesUsed:0};
}
function normalizeTracker(actor, value) {
  const source = value && typeof value === "object" ? value : {};
  const max = maxCharges(actor);
  return {
    version:1,
    chargesCurrent:clamp(source.chargesCurrent ?? max, 0, max),
    chargesMax:max,
    shortRestRecoveriesUsed:clamp(source.shortRestRecoveriesUsed ?? 0, 0, 2)
  };
}
function readTracker(actor) { return normalizeTracker(actor, actor?.getFlag?.(MODULE_ID, TRACKER_FLAG)); }
async function writeTracker(actor, patch={}, {render=true}={}) {
  if (!actor?.isOwner) return readTracker(actor);
  const next = normalizeTracker(actor, {...readTracker(actor), ...patch});
  await actor.setFlag(MODULE_ID, TRACKER_FLAG, next, {[INTERNAL]:true});
  if (render) {
    actor.sheet?.render?.(false);
    refreshTracker(actor);
  }
  return next;
}
async function ensureTracker(actor) {
  if (!getClassMod(actor) || !actor?.isOwner) return null;
  const raw = actor.getFlag(MODULE_ID, TRACKER_FLAG);
  const normalized = normalizeTracker(actor, raw);
  if (!raw || JSON.stringify(raw) !== JSON.stringify(normalized)) await actor.setFlag(MODULE_ID, TRACKER_FLAG, normalized, {[INTERNAL]:true});
  return normalized;
}
async function spendCharges(actor, amount, {reason="Edo Tensei"}={}) {
  amount = Math.max(0, Math.floor(Number(amount) || 0));
  if (!amount) return true;
  const state = readTracker(actor);
  if (state.chargesCurrent < amount) {
    ui.notifications.warn(`${actor.name} needs ${amount} Unholy Charges for ${reason}, but only has ${state.chargesCurrent}.`);
    return false;
  }
  await writeTracker(actor, {chargesCurrent:state.chargesCurrent - amount});
  return true;
}
async function applyRest(actor, type) {
  const state = readTracker(actor);
  if (type === "short") {
    if (state.shortRestRecoveriesUsed >= 2) return;
    await writeTracker(actor, {
      chargesCurrent:Math.min(state.chargesMax, state.chargesCurrent + classModLevel(actor)),
      shortRestRecoveriesUsed:state.shortRestRecoveriesUsed + 1
    });
  } else if (type === "long") {
    await writeTracker(actor, {
      chargesCurrent:Math.min(state.chargesMax, state.chargesCurrent + Math.floor(state.chargesMax / 2)),
      shortRestRecoveriesUsed:0
    });
  } else if (type === "full") {
    await writeTracker(actor, {chargesCurrent:state.chargesMax, shortRestRecoveriesUsed:0});
    for (const edo of createdEdoFor(actor)) if (edo.getFlag(MODULE_ID, PROFILE_FLAG)?.active) await setEdoActive(edo, false, {render:false});
  }
}

function createdEdoFor(summoner) {
  const uuid = summoner?.uuid;
  return asArray(game.actors).filter(actor => actor.getFlag?.(MODULE_ID, PROFILE_FLAG)?.summonerUuid === uuid);
}
function activeEdoFor(summoner, {exclude=null}={}) {
  return createdEdoFor(summoner).filter(actor => actor !== exclude && actor.getFlag(MODULE_ID, PROFILE_FLAG)?.active);
}
function activeControlCost(summoner, exclude=null) {
  return activeEdoFor(summoner, {exclude}).reduce((sum, actor) => sum + (TIER_DATA[actor.getFlag(MODULE_ID, PROFILE_FLAG)?.tier]?.chargeCost ?? 1), 0);
}
async function setEdoActive(actor, active, {controlled=true,render=true}={}) {
  const profile = actor.getFlag(MODULE_ID, PROFILE_FLAG);
  if (!profile) return;
  await actor.setFlag(MODULE_ID, PROFILE_FLAG, {...profile, active:Boolean(active), controlled:Boolean(controlled)}, {[INTERNAL]:true});
  if (render) {
    actor.sheet?.render?.(false);
    const summoner = await fromUuid(profile.summonerUuid).catch(() => null);
    if (summoner) { summoner.sheet?.render?.(false); refreshTracker(summoner); }
  }
}

async function getPackDocuments() {
  let pack = game.packs.get(PACK_COLLECTION);
  if (!pack && game.user.isGM && globalThis.N5eBClassMods?.sync) {
    await globalThis.N5eBClassMods.sync({notify:false});
    pack = game.packs.get(PACK_COLLECTION);
  }
  if (!pack) throw new Error("The N5eB Custom Class Mods compendium is not available.");
  return pack.getDocuments();
}
function moduleFlag(document, key) { return document?.getFlag?.(MODULE_ID, key) ?? document?.flags?.[MODULE_ID]?.[key]; }

function abilityMod(score) { return Math.floor((Number(score) - 10) / 2); }
function rankStepBonus(rank, low, mid, high) {
  const index = RANK_ORDER.indexOf(rank);
  if (index <= 1) return low;
  if (index <= 3) return mid;
  return high;
}
function effectiveBlessingCost(document, rank) {
  const base = Number(moduleFlag(document, "blessingCost") ?? 0);
  return document?.name === "Soul Fragment" && rank === "s" ? 2 : base;
}
function tierMeets(tier, minimum) {
  const order = {standard:0, elite:1, solo:2};
  return (order[tier] ?? 0) >= (order[minimum] ?? 0);
}

function calculateEdoTensei(input, blessingDocuments=[]) {
  const rank = String(input.rank ?? "d").toLowerCase();
  const tier = String(input.tier ?? "standard").toLowerCase();
  const role = String(input.role ?? "striker").toLowerCase();
  const cmLevel = clamp(input.classModLevel ?? 1, 1, 5);
  const rd = RANK_DATA[rank];
  const td = TIER_DATA[tier];
  if (!rd || !td) throw new Error("Invalid Edo Tensei rank or tier.");
  if (RANK_ORDER.indexOf(rank) > cmLevel - 1) throw new Error(`Class Mod level ${cmLevel} cannot create ${rd.label}.`);
  if (tier === "solo" && rank !== "s") throw new Error("Solo Edo Tensei are reserved for S-Rank souls.");

  const abilities = {};
  for (const ability of ["str","dex","con","int","wis","cha"]) abilities[ability] = clamp(input[ability] ?? 16, 1, rd.cap);
  const increases = Object.values(abilities).reduce((sum, score) => sum + Math.max(0, score - 16), 0);
  if (increases > rd.budget) throw new Error(`${rd.label} permits ${rd.budget} total Ability Score Increases above the base 16; ${increases} were assigned.`);

  const blessingPoints = blessingDocuments.reduce((sum, doc) => sum + effectiveBlessingCost(doc, rank), 0);
  if (blessingPoints > 5) throw new Error(`Selected Unholy Blessings cost ${blessingPoints}; the maximum is 5.`);
  for (const doc of blessingDocuments) {
    const minimum = moduleFlag(doc, "minimumTier") ?? "standard";
    if (!tierMeets(tier, minimum)) throw new Error(`${doc.name} requires a ${minimum.titleCase?.() ?? minimum} Edo Tensei.`);
  }

  const allRoles = cmLevel >= 4;
  const hasRole = key => allRoles || role === key;
  const defenderBonus = hasRole("defender") ? rankStepBonus(rank, 1, 2, 3) : 0;
  const controllerBonus = hasRole("controller") ? rankStepBonus(rank, 1, 2, 3) : 0;
  const casterBonus = hasRole("caster") ? rankStepBonus(rank, 3, 5, 7) : 0;
  const supporterDice = hasRole("supporter") ? rankStepBonus(rank, 1, 2, 3) : 0;

  let blessingAc = 0;
  let speedBonus = 0;
  let climbEqualsWalk = false;
  for (const doc of blessingDocuments) {
    const calc = moduleFlag(doc, "calculation") ?? {};
    blessingAc += Number(calc.acBonus ?? 0);
    speedBonus += Number(calc.speedBonus ?? 0);
    climbEqualsWalk ||= Boolean(calc.climbEqualsWalk);
  }

  const defenseAbility = String(input.defenseAbility ?? "dex");
  const jutsuAbility = String(input.jutsuAbility ?? "int");
  const toughness = Math.max(0, Math.floor(Number(input.toughness) || 10));
  const armorClass = 10 + Math.floor(rd.level / 2) + abilityMod(abilities[defenseAbility]) + defenderBonus + blessingAc;
  const baseHp = Math.max(1, (toughness + abilityMod(abilities.con)) * rd.level);
  const hitPoints = Math.max(1, Math.floor(baseHp * td.hp));
  const jutsuSlots = Math.max(0, Math.floor((rd.slots + casterBonus) * td.slots));
  const speed = Math.max(0, rd.speed + speedBonus);

  let vesselModifier = 0;
  if (input.vessel === "decayed") vesselModifier = 3;
  else if (input.vessel === "living") vesselModifier = -clamp(input.livingModifier ?? 1, 1, 5);
  const summoningDC = 15 + RANK_ORDER.indexOf(rank) + td.dc + blessingPoints + vesselModifier;
  const dnaDC = 15 - cmLevel + td.dna;

  return {
    rank,tier,role,cmLevel,allRoles,abilities,toughness,defenseAbility,jutsuAbility,
    level:rd.level,abilityCap:rd.cap,abilityBudget:rd.budget,abilityIncreases:increases,
    armorClass,hitPoints,jutsuSlots,speed,climbEqualsWalk,
    defenderBonus,controllerBonus,casterBonus,supporterDice,
    blessingPoints,summoningDC,dnaDC,vesselModifier,
    eliteActions:td.eliteActions,extraSkills:td.extraSkills,unholyChargeCost:td.chargeCost,
    automaticChecks:cmLevel >= 5
  };
}

function selectedValues(form, name) {
  const field = form?.elements?.namedItem?.(name);
  if (!field) return [];
  if (field instanceof RadioNodeList) return Array.from(field).filter(el => el.checked).map(el => el.value);
  if (field.selectedOptions) return Array.from(field.selectedOptions).map(option => option.value);
  return field.value ? [field.value] : [];
}
function optionsFromConfig(config) {
  return Object.entries(config ?? {}).map(([key, data]) => {
    const labelKey = typeof data === "string" ? data : data?.label;
    return [key, labelKey ? game.i18n.localize(labelKey) : key.toUpperCase()];
  });
}
function creatorHtml(actor, blessingDocs) {
  const cmLevel = classModLevel(actor);
  const rankOptions = RANK_ORDER.slice(0, cmLevel).map(rank => `<option value="${rank}">${RANK_DATA[rank].label} · Level ${RANK_DATA[rank].level}</option>`).join("");
  const abilities = optionsFromConfig(CONFIG.DND5E.abilities).map(([key,label]) => `<option value="${key}">${esc(label)}</option>`).join("");
  const skills = optionsFromConfig(CONFIG.DND5E.skills).map(([key,label]) => `<option value="${key}">${esc(label)}</option>`).join("");
  const saves = optionsFromConfig(CONFIG.DND5E.abilities).map(([key,label]) => `<option value="${key}">${esc(label)}</option>`).join("");
  const blessingOptions = blessingDocs.sort((a,b) => Number(moduleFlag(a,"blessingCost"))-Number(moduleFlag(b,"blessingCost")) || a.name.localeCompare(b.name)).map(doc => {
    const cost = Number(moduleFlag(doc,"blessingCost") ?? 0);
    const minimum = moduleFlag(doc,"minimumTier") ?? "standard";
    const prereq = minimum === "standard" ? "" : ` · ${minimum}`;
    return `<option value="${doc.id}">[${cost}] ${esc(doc.name)}${prereq}</option>`;
  }).join("");
  const scoreInputs = ["str","dex","con","int","wis","cha"].map(a => `<label><span>${a.toUpperCase()}</span><input type="number" name="${a}" value="16" min="1" max="26"></label>`).join("");
  return `<form class="n5eb-edo-creator-form">
    <p class="creator-note">Creates a complete N5eB Summon Actor and performs the Standard, Elite, or Solo calculations from the Class Mod. You can edit the Actor afterward and use <strong>Recalculate Edo</strong>.</p>
    <div class="creator-grid">
      <label><span>Name</span><input name="name" value="Edo Tensei" required></label>
      <label><span>Rank</span><select name="rank">${rankOptions}</select></label>
      <label><span>Tier</span><select name="tier"><option value="standard">Standard</option><option value="elite">Elite</option>${cmLevel >= 5 ? '<option value="solo">Solo (S-Rank only)</option>' : ''}</select></label>
      <label><span>Primary Role</span><select name="role">${Object.entries(ROLE_LABELS).map(([k,v])=>`<option value="${k}" ${k==='striker'?'selected':''}>${v}</option>`).join('')}</select></label>
      <label><span>Clan / Lineage</span><input name="clan" placeholder="Optional"></label>
      <label><span>Toughness</span><input type="number" name="toughness" value="10" min="0"></label>
      <label><span>Defensive Ability</span><select name="defenseAbility">${abilities.replace('value="dex"','value="dex" selected')}</select></label>
      <label><span>Jutsu Ability</span><select name="jutsuAbility">${abilities.replace('value="int"','value="int" selected')}</select></label>
      <label><span>Vessel</span><select name="vessel"><option value="intact">Intact</option><option value="decayed">Rotting / Decayed (+3 DC)</option><option value="living">Living Host (-1 to -5 DC)</option></select></label>
      <label><span>Living Host Modifier</span><input type="number" name="livingModifier" value="1" min="1" max="5"></label>
    </div>
    <fieldset><legend>Ability Scores</legend><p>Base 16. C/B/A/S-Rank add a cumulative 6/12/18/24 points, with caps 20/22/24/26.</p><div class="ability-grid">${scoreInputs}</div></fieldset>
    <div class="creator-columns">
      <fieldset><legend>Saving Throw Proficiencies</legend><p>Select up to 3.</p><select name="saves" multiple size="8">${saves}</select></fieldset>
      <fieldset><legend>Creature Skills</legend><p>Select up to 5; Elite may select 8 and Solo 10. Extra selections receive 1 Mastery.</p><select name="skills" multiple size="12">${skills}</select></fieldset>
      <fieldset><legend>Unholy Blessings</legend><p>Selected costs may total up to 5. Soul Fragment costs 2 at S-Rank.</p><select name="blessings" multiple size="14">${blessingOptions}</select></fieldset>
    </div>
  </form>`;
}

async function openEdoCreator(actor) {
  actor = actorFromContext(actor);
  if (!actor || !getClassMod(actor)) return ui.notifications.warn("Select an Actor that owns the Edo Tensei Class Mod.");
  if (!actor.isOwner) return ui.notifications.warn("You do not own this Actor.");
  const docs = await getPackDocuments();
  const blessings = docs.filter(doc => moduleFlag(doc,"edoBlessing"));
  const result = await foundry.applications.api.DialogV2.wait({
    window:{title:`Create Edo Tensei — ${actor.name}`,icon:"fa-solid fa-skull",resizable:true},
    position:{width:920,height:"auto"},classes:["n5eb-edo-creator-window"],content:creatorHtml(actor, blessings),
    buttons:[
      {action:"create",label:"Create Edo Tensei",icon:"fa-solid fa-wand-magic-sparkles",default:true,callback:(event,button)=>{
        const data = new FormDataExtended(button.form).object;
        data.skills = selectedValues(button.form,"skills");
        data.saves = selectedValues(button.form,"saves");
        data.blessings = selectedValues(button.form,"blessings");
        return data;
      }},
      {action:"cancel",label:"Cancel",icon:"fa-solid fa-xmark"}
    ], rejectClose:false
  });
  if (!result || result === "cancel") return null;
  try { return await createEdoTensei(actor, result, blessings); }
  catch (error) {
    console.error(`${MODULE_ID} | Edo Tensei creation failed`, error);
    ui.notifications.error(error.message);
    return null;
  }
}

async function ensureActorFolder() {
  let folder = asArray(game.folders).find(f => f.type === "Actor" && f.name === "Edo Tensei");
  if (!folder && game.user.isGM) folder = await Folder.create({name:"Edo Tensei",type:"Actor",color:"#7d1f24",flags:{[MODULE_ID]:{managed:true,edoActorFolder:true}}});
  return folder ?? null;
}
function itemSource(doc) {
  const source = doc.toObject();
  delete source._id;
  delete source.folder;
  delete source.ownership;
  source.flags ??= {};
  source.flags[MODULE_ID] = {...source.flags[MODULE_ID], embeddedEdoFeature:true};
  return source;
}
function slotsItem(slots) {
  return {
    name:"Edo Tensei Jutsu Slots",type:"feat",img:"icons/magic/symbols/runes-triangle-blue.webp",
    flags:{[MODULE_ID]:{embeddedEdoFeature:true,edoJutsuSlots:true}},
    system:{
      ability:null,actionType:"",activation:{condition:"",cost:null,type:""},attack:{bonus:"",flat:false},chatFlavor:"",
      consume:{amount:null,scale:false,target:null,type:""},cover:null,crewed:false,critical:{damage:"",threshold:null},damage:{parts:[],versatile:""},
      description:{chat:"",value:`<p>This resource represents the Edo Tensei’s calculated Jutsu Slots. Short Rest: recover slots equal to Intelligence modifier. Long Rest: recover half maximum. Full Rest: recover all.</p><p><strong>Calculated Maximum:</strong> ${slots}</p>`},
      duration:{units:"",value:""},enchantment:null,formula:"",identifier:"edo-tensei-jutsu-slots",prerequisites:{level:null,repeatable:false},properties:[],range:{long:null,units:"",value:null},recharge:{charged:false,formula:"1d8",value:null},requirements:"Edo Tensei",save:{ability:"",dc:null,scaling:"spell"},
      source:{book:"Homebrew",custom:"Edo Tensei Class Mod v1.3",rules:"n5eb"},summons:null,target:{prompt:true,type:"",units:"",value:"",width:null},type:{nestedsubtype:"",subtype:"",value:"classmod"},uses:{max:String(slots),per:null,prompt:true,recovery:"",value:slots}
    }
  };
}
function skillSource(selected, extraSkills) {
  const result = {};
  selected.forEach((key,index) => result[key] = {value:1,mastery:index >= 5 && index < 5 + extraSkills ? 1 : 0});
  return result;
}
function saveSource(selected) {
  const result = {};
  for (const key of selected) result[key] = {proficient:1};
  return result;
}
async function createEdoTensei(summoner, form, blessingPool) {
  const chosen = (form.blessings ?? []).map(id => blessingPool.find(doc => doc.id === id)).filter(Boolean);
  const input = {...form,classModLevel:classModLevel(summoner)};
  let calc;
  try { calc = calculateEdoTensei(input, chosen); }
  catch (error) { ui.notifications.error(error.message); throw error; }

  const skills = Array.from(new Set(form.skills ?? [])).slice(0, 10);
  const maxSkills = 5 + calc.extraSkills;
  if (skills.length > maxSkills) throw new Error(`${TIER_DATA[calc.tier].label} Edo Tensei may select at most ${maxSkills} creature skills.`);
  const saves = Array.from(new Set(form.saves ?? [])).slice(0,3);
  if ((form.saves ?? []).length > 3) throw new Error("Choose at most three saving throw proficiencies.");
  if (skills.length < 5) ui.notifications.warn(`${form.name || "The Edo Tensei"} was created with fewer than the suggested five Creature Skills.`);

  const docs = await getPackDocuments();
  const profileDoc = docs.find(doc => moduleFlag(doc,"creationType") === "profile");
  const rankDocs = docs.filter(doc => moduleFlag(doc,"creationType") === "rank" && RANK_ORDER.indexOf(moduleFlag(doc,"rank")) <= RANK_ORDER.indexOf(calc.rank));
  const roleDocs = docs.filter(doc => moduleFlag(doc,"creationType") === "role" && (calc.allRoles || moduleFlag(doc,"role") === calc.role));
  const tierDoc = docs.find(doc => moduleFlag(doc,"creationType") === "tier" && moduleFlag(doc,"tier") === calc.tier);
  const embedded = [profileDoc,...rankDocs,...roleDocs,tierDoc,...chosen].filter(Boolean).map(itemSource);
  embedded.push(slotsItem(calc.jutsuSlots));

  const folder = await ensureActorFolder();
  const name = String(form.name || "Edo Tensei").trim() || "Edo Tensei";
  const profile = {
    version:1,summonerUuid:summoner.uuid,rank:calc.rank,tier:calc.tier,role:calc.role,clan:String(form.clan ?? ""),
    toughness:calc.toughness,defenseAbility:calc.defenseAbility,jutsuAbility:calc.jutsuAbility,vessel:String(form.vessel ?? "intact"),livingModifier:Number(form.livingModifier ?? 1),
    blessingSourceIds:chosen.map(doc => doc.id),blessingNames:chosen.map(doc => doc.name),skills,saves,active:false,controlled:true,calculations:calc
  };
  const controllerDc = calc.controllerBonus ? String(calc.controllerBonus) : "";
  const system = {
    abilities:Object.fromEntries(Object.entries(calc.abilities).map(([key,value]) => [key,{value,...(saves.includes(key)?{proficient:1}:{})}])),
    skills:skillSource(skills,calc.extraSkills),
    attributes:{
      ac:{calc:"flat",flat:calc.armorClass,formula:""},
      hp:{value:calc.hitPoints,max:calc.hitPoints,temp:0,tempmax:0,formula:String(calc.hitPoints)},
      movement:{walk:calc.speed,climb:calc.climbEqualsWalk?calc.speed:0,fly:0,swim:0,burrow:0,units:"ft",hover:false},
      jutsu:{
        ninjutsu:{ability:calc.jutsuAbility,bonuses:{attack:"",dc:controllerDc}},
        taijutsu:{ability:calc.jutsuAbility,bonuses:{attack:"",dc:controllerDc}},
        genjutsu:{ability:calc.jutsuAbility,bonuses:{attack:"",dc:controllerDc}},
        known:{value:0,max:0,maxRank:calc.rank}
      },
      spell:{level:calc.level}
    },
    details:{
      cr:calc.level,
      type:{value:"undead",subtype:"Edo Tensei",custom:""},
      biography:{value:`<p>Reanimated by ${esc(summoner.name)} using Edo Tensei.</p>`,public:""},
      summon:{enabled:true,level:calc.level,rank:calc.rank,category:"custom",tribe:"",variant:`${TIER_DATA[calc.tier].label} Edo Tensei`,role:calc.role,summonType:"",toughness:calc.toughness,defenseAbility:calc.defenseAbility,jutsuAbility:calc.jutsuAbility,migrated:true,sourceUuid:summoner.uuid},
      adversary:{enabled:false}
    },
    resources:{eliteact:{max:calc.eliteActions,spent:0}},
    traits:{size:"med"},
    source:{book:"Homebrew",custom:"Edo Tensei Class Mod v1.3",rules:"n5eb"}
  };
  const actorData = {
    name,type:"npc",img:COVER,folder:folder?.id ?? null,
    ownership:{default:0,[game.user.id]:3},
    prototypeToken:{name,actorLink:true,disposition:1,texture:{src:COVER}},
    flags:{[MODULE_ID]:{[PROFILE_FLAG]:profile}},system,items:embedded
  };
  const actor = await Actor.create(actorData,{renderSheet:false,[INTERNAL]:true});
  ui.notifications.info(`${name} created: AC ${calc.armorClass}, HP ${calc.hitPoints}, ${calc.jutsuSlots} Jutsu Slots, Summoning DC ${calc.summoningDC}.`);
  actor.sheet?.render?.(true);
  summoner.sheet?.render?.(false);
  refreshTracker(summoner);
  return actor;
}

async function applyEdoRecovery(actor, type) {
  const profile = actor?.getFlag?.(MODULE_ID, PROFILE_FLAG);
  if (!profile) return;
  const calc = profile.calculations ?? {};
  const hpMax = Number(actor.system.attributes?.hp?.max ?? calc.hitPoints ?? 0);
  const hpValue = Number(actor.system.attributes?.hp?.value ?? hpMax);
  let hpRecovery = 0;
  if (type === "short") hpRecovery = Number(calc.toughness ?? 0) * Math.floor(Number(calc.level ?? 0) / 2);
  else if (type === "long") hpRecovery = Math.floor(hpMax / 2);
  else if (type === "full") hpRecovery = hpMax;
  const updates = {};
  if (hpRecovery > 0) updates["system.attributes.hp.value"] = Math.min(hpMax, hpValue + hpRecovery);
  if (type === "full") updates["system.resources.eliteact.spent"] = 0;
  if (Object.keys(updates).length) await actor.update(updates,{[INTERNAL]:true});

  const slots = asArray(actor.items).find(item => moduleFlag(item,"edoJutsuSlots"));
  if (slots) {
    const maximum = Number(slots.system.uses?.max ?? calc.jutsuSlots ?? 0);
    const current = Number(slots.system.uses?.value ?? maximum);
    let recovery = 0;
    if (type === "short") recovery = Math.max(0, Number(actor.system.abilities?.int?.mod ?? abilityMod(actor.system.abilities?.int?.value ?? 10)));
    else if (type === "long") recovery = Math.floor(maximum / 2);
    else if (type === "full") recovery = maximum;
    if (recovery > 0) await slots.update({"system.uses.value":Math.min(maximum,current+recovery)},{[INTERNAL]:true});
  }
}

async function blessingDocumentsForActor(actor) {
  return asArray(actor.items).filter(item => moduleFlag(item,"edoBlessing"));
}
async function recalculateEdoActor(actor) {
  const profile = actor?.getFlag?.(MODULE_ID, PROFILE_FLAG);
  if (!profile) return ui.notifications.warn("This Actor was not created by the Edo Tensei creator.");
  const summoner = await fromUuid(profile.summonerUuid).catch(() => null);
  const cmLevel = summoner && getClassMod(summoner) ? classModLevel(summoner) : profile.calculations?.cmLevel ?? RANK_ORDER.indexOf(profile.rank)+1;
  const abilities = Object.fromEntries(["str","dex","con","int","wis","cha"].map(key => [key,actor.system.abilities?.[key]?.value ?? 16]));
  const blessings = await blessingDocumentsForActor(actor);
  const calc = calculateEdoTensei({...profile,...abilities,classModLevel:cmLevel},blessings);
  const oldMax = Number(actor.system.attributes.hp.max ?? calc.hitPoints);
  const oldValue = Number(actor.system.attributes.hp.value ?? oldMax);
  const damage = Math.max(0,oldMax-oldValue);
  const newValue = Math.max(0,calc.hitPoints-damage);
  const slots = asArray(actor.items).find(item => moduleFlag(item,"edoJutsuSlots"));
  const updates = {
    "system.attributes.ac.calc":"flat","system.attributes.ac.flat":calc.armorClass,
    "system.attributes.hp.max":calc.hitPoints,"system.attributes.hp.value":newValue,"system.attributes.hp.formula":String(calc.hitPoints),
    "system.attributes.movement.walk":calc.speed,"system.attributes.movement.climb":calc.climbEqualsWalk?calc.speed:0,
    "system.resources.eliteact.max":calc.eliteActions,"system.resources.eliteact.spent":Math.min(Number(actor.system.resources?.eliteact?.spent ?? 0),calc.eliteActions),
    "system.attributes.jutsu.ninjutsu.bonuses.dc":calc.controllerBonus?String(calc.controllerBonus):"",
    "system.attributes.jutsu.taijutsu.bonuses.dc":calc.controllerBonus?String(calc.controllerBonus):"",
    "system.attributes.jutsu.genjutsu.bonuses.dc":calc.controllerBonus?String(calc.controllerBonus):""
  };
  await actor.update(updates,{[INTERNAL]:true});
  if (slots) {
    const current = Number(slots.system.uses?.value ?? calc.jutsuSlots);
    const oldSlotsMax = Number(slots.system.uses?.max ?? calc.jutsuSlots);
    const spent = Math.max(0,oldSlotsMax-current);
    await slots.update({"system.uses.max":String(calc.jutsuSlots),"system.uses.value":Math.max(0,calc.jutsuSlots-spent)},{[INTERNAL]:true});
  }
  await actor.setFlag(MODULE_ID,PROFILE_FLAG,{...profile,calculations:calc},{[INTERNAL]:true});
  ui.notifications.info(`${actor.name} recalculated: AC ${calc.armorClass}, HP ${calc.hitPoints}, ${calc.jutsuSlots} Jutsu Slots.`);
  actor.sheet?.render?.(false);
  return calc;
}

async function performSummoningCheck(edoActor) {
  const profile = edoActor?.getFlag?.(MODULE_ID, PROFILE_FLAG);
  if (!profile) return ui.notifications.warn("This is not a generated Edo Tensei Actor.");
  const summoner = await fromUuid(profile.summonerUuid).catch(() => null);
  if (!summoner || !getClassMod(summoner)) return ui.notifications.error("The linked Edo Tensei summoner could not be found.");
  if (profile.active) return ui.notifications.warn(`${edoActor.name} is already marked as summoned.`);
  if (activeEdoFor(summoner).length >= maxActive(summoner)) return ui.notifications.warn(`${summoner.name} is already controlling the maximum ${maxActive(summoner)} active Edo Tensei.`);
  const calc = profile.calculations ?? {};
  const baseDC = Number(calc.summoningDC ?? 15);
  const extraDC = activeControlCost(summoner, edoActor);
  const dc = baseDC + extraDC;
  const cost = Number(calc.unholyChargeCost ?? TIER_DATA[profile.tier]?.chargeCost ?? 1);
  if (!(await spendCharges(summoner,cost,{reason:`summoning ${edoActor.name}`}))) return false;
  const automatic = classModLevel(summoner) >= 5;
  let total = dc;
  let roll = null;
  if (!automatic) {
    const bonus = Number(summoner.system.skills?.nsh?.total ?? 0);
    roll = await (new Roll(`1d20 + ${bonus}`)).evaluate();
    total = Number(roll.total);
  }
  const success = automatic || total >= dc;
  const criticalFailure = !automatic && total <= dc - 5;
  if (success) await setEdoActive(edoActor,true,{controlled:true});
  else if (criticalFailure) await setEdoActive(edoActor,true,{controlled:false});
  const state = success ? "SUCCESS" : criticalFailure ? "CRITICAL FAILURE — SUMMONED UNCONTROLLED" : "FAILURE";
  const content = `<div class="n5eb-edo-chat"><h3>Summoning: ${esc(edoActor.name)}</h3><p><strong>${state}</strong></p><p>DC ${dc} = base ${baseDC}${extraDC?` + active Edo ${extraDC}`:""}; cost ${cost} Unholy Charges.</p>${automatic?'<p>Absolute Edo Tensei automatically succeeds.</p>':`<p>Ninshou result: <strong>${total}</strong></p>`}</div>`;
  if (roll) await roll.toMessage({speaker:ChatMessage.getSpeaker({actor:summoner}),flavor:content});
  else await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor:summoner}),content});
  return success;
}

function trackerKey(actor) { return actor?.uuid ?? actor?.id; }
function trackerHtml(actor) {
  const state = readTracker(actor);
  const created = createdEdoFor(actor);
  const active = created.filter(a=>a.getFlag(MODULE_ID,PROFILE_FLAG)?.active);
  const rows = created.map(edo => {
    const p = edo.getFlag(MODULE_ID,PROFILE_FLAG);
    const calc = p?.calculations ?? {};
    return `<div class="edo-row" data-actor-id="${edo.id}"><div><strong>${esc(edo.name)}</strong><span>${esc(RANK_DATA[p?.rank]?.label ?? p?.rank)} · ${esc(TIER_DATA[p?.tier]?.label ?? p?.tier)} · AC ${calc.armorClass ?? '?'} · HP ${calc.hitPoints ?? '?'}</span></div><div class="row-actions"><button type="button" data-action="open-edo" title="Open"><i class="fas fa-external-link-alt"></i></button>${p?.active?`<button type="button" data-action="return-edo">Return</button>`:`<button type="button" data-action="summon-edo">Summon</button>`}<span class="status ${p?.active?(p?.controlled?'active':'danger'):''}">${p?.active?(p?.controlled?'Active':'Uncontrolled'):'Realm of Death'}</span></div></div>`;
  }).join("") || '<em>No Edo Tensei Actors created yet.</em>';
  return `<div class="n5eb-edo-tracker-dialog" data-edo-root>
    <p>Unholy Charges and generated Edo Tensei are stored on Actors, not Item Uses.</p>
    <section class="tracker-card"><header><span>Unholy Charges</span><strong>${state.chargesCurrent}/${state.chargesMax}</strong></header><div class="tracker-progress"><span style="width:${state.chargesMax?state.chargesCurrent/state.chargesMax*100:0}%"></span></div><div class="tracker-controls"><button data-action="charge-minus">-1</button><button data-action="create-edo"><i class="fas fa-skull"></i> Create Edo Tensei</button><button data-action="charge-plus">+1</button></div><p>Short-rest recoveries used: ${state.shortRestRecoveriesUsed}/2</p></section>
    <section class="tracker-card"><header><span>Created Edo Tensei</span><strong>${active.length}/${maxActive(actor)} Active</strong></header><div class="edo-list">${rows}</div></section>
    <footer><button data-action="short-rest">Short Rest</button><button data-action="long-rest">Long Rest</button><button data-action="full-rest">Full Rest</button></footer>
  </div>`;
}
async function openTracker(actor) {
  actor = actorFromContext(actor);
  if (!actor || !getClassMod(actor)) return ui.notifications.warn("No Edo Tensei character is selected.");
  await ensureTracker(actor);
  const key = trackerKey(actor);
  if (dialogs.get(key)?.rendered) return dialogs.get(key).bringToFront();
  const DialogV2 = foundry.applications.api.DialogV2;
  const dialog = new DialogV2({window:{title:`Edo Tensei Tracker — ${actor.name}`,icon:"fa-solid fa-skull",resizable:true},position:{width:760,height:"auto"},classes:["n5eb-edo-tracker-window"],content:trackerHtml(actor),buttons:[{action:"close",label:"Close",icon:"fa-solid fa-xmark"}]});
  dialogs.set(key,dialog);
  dialog.addEventListener("render",()=>activateTracker(dialog,actor));
  dialog.addEventListener("close",()=>dialogs.delete(key),{once:true});
  await dialog.render({force:true});
  return dialog;
}
function refreshTracker(actor) { const dialog = dialogs.get(trackerKey(actor)); if (dialog?.rendered) dialog.render({force:true}); }
function activateTracker(dialog,actor) {
  const root = dialog.element?.querySelector?.("[data-edo-root]");
  if (!root) return;
  root.querySelectorAll("button[data-action]").forEach(button => button.addEventListener("click",async event => {
    event.preventDefault();
    const action = button.dataset.action;
    const state = readTracker(actor);
    const row = button.closest("[data-actor-id]");
    const edo = row ? game.actors.get(row.dataset.actorId) : null;
    try {
      if (action === "charge-minus") await writeTracker(actor,{chargesCurrent:state.chargesCurrent-1});
      else if (action === "charge-plus") await writeTracker(actor,{chargesCurrent:state.chargesCurrent+1});
      else if (action === "create-edo") await openEdoCreator(actor);
      else if (action === "short-rest") await applyRest(actor,"short");
      else if (action === "long-rest") await applyRest(actor,"long");
      else if (action === "full-rest") await applyRest(actor,"full");
      else if (action === "open-edo") edo?.sheet?.render?.(true);
      else if (action === "summon-edo" && edo) await performSummoningCheck(edo);
      else if (action === "return-edo" && edo) await setEdoActive(edo,false);
    } catch (error) { console.error(`${MODULE_ID} | Edo Tensei tracker action failed`,error); ui.notifications.error(error.message); }
  }));
}

function renderRoot(app,html) { return html?.[0] ?? html ?? app.element?.[0] ?? app.element; }
function renderSummonerStrip(app,html) {
  const actor = app.actor ?? app.document;
  if (!getClassMod(actor)) return;
  const root = renderRoot(app,html);
  if (!root || root.querySelector("[data-edo-strip]")) return;
  const target = root.querySelector(".jutsu-casting-overview") ?? root.querySelector(".sheet-body");
  if (!target) return;
  const state = readTracker(actor);
  const active = activeEdoFor(actor).length;
  const section = document.createElement("section");
  section.className = "n5eb-edo-tracker-strip";
  section.dataset.edoStrip = "true";
  section.innerHTML = `<button class="tracker-title" data-action="open-edo-tracker"><i class="fas fa-skull"></i> Edo Tensei</button><div class="tracker-mini"><span>Unholy Charges</span><strong>${state.chargesCurrent}/${state.chargesMax}</strong></div><div class="tracker-mini"><span>Active Edo</span><strong>${active}/${maxActive(actor)}</strong></div><button class="create-edo" data-action="create-edo"><i class="fas fa-plus"></i> Create Edo Tensei</button>`;
  target.prepend(section);
  section.querySelector('[data-action="open-edo-tracker"]')?.addEventListener("click",()=>openTracker(actor));
  section.querySelector('[data-action="create-edo"]')?.addEventListener("click",()=>openEdoCreator(actor));
}

Hooks.once("ready",async()=>{
  globalThis.N5eBEdoTensei = Object.freeze({
    openTracker,openCreator:openEdoCreator,create:createEdoTensei,calculate:calculateEdoTensei,
    recalculate:recalculateEdoActor,summon:performSummoningCheck,setActive:setEdoActive,
    getTracker:readTracker,setTracker:writeTracker
  });
  if (game.system.id !== "n5eb") return;
  for (const actor of game.actors ?? []) if (getClassMod(actor) && actor.isOwner) await ensureTracker(actor);
});
Hooks.on("getActorSheetHeaderButtons",(sheet,buttons)=>{
  const actor = sheet.actor ?? sheet.document;
  if (getClassMod(actor)) {
    const state = readTracker(actor);
    buttons.unshift({label:`Edo ${state.chargesCurrent}/${state.chargesMax}`,class:"n5eb-edo-tracker-button",icon:"fas fa-skull",onclick:()=>openTracker(actor)});
    buttons.unshift({label:"Create Edo",class:"n5eb-edo-create-button",icon:"fas fa-plus",onclick:()=>openEdoCreator(actor)});
    return;
  }
  const profile = actor?.getFlag?.(MODULE_ID,PROFILE_FLAG);
  if (profile) {
    buttons.unshift({label:profile.active?"Return":"Summon",class:"n5eb-edo-summon-button",icon:profile.active?"fas fa-door-open":"fas fa-hand-sparkles",onclick:()=>profile.active?setEdoActive(actor,false):performSummoningCheck(actor)});
    buttons.unshift({label:"Recalculate Edo",class:"n5eb-edo-recalculate-button",icon:"fas fa-calculator",onclick:()=>recalculateEdoActor(actor)});
  }
});
Hooks.on("renderActorSheet",renderSummonerStrip);
Hooks.on("renderCharacterActorSheet",renderSummonerStrip);
Hooks.on("createItem",async(item,options,userId)=>{
  if (options?.[INTERNAL] || userId !== game.user.id || item.parent?.documentName !== "Actor") return;
  const actor = item.parent;
  if (item.type === "classmod" && item.system?.identifier === CLASSMOD_ID) await ensureTracker(actor);
});
Hooks.on("updateItem",async(item,changes,options,userId)=>{
  if (options?.[INTERNAL] || userId !== game.user.id || item.parent?.documentName !== "Actor") return;
  if (item.type === "classmod" && item.system?.identifier === CLASSMOD_ID) await ensureTracker(item.parent);
});
Hooks.on("preCreateItem",(item,data,options,userId)=>{
  const actor = item.parent;
  if (userId !== game.user.id || actor?.documentName !== "Actor" || !getClassMod(actor)) return;
  const artType = data.flags?.[MODULE_ID]?.edoArtType ?? item.getFlag?.(MODULE_ID,"edoArtType");
  if (!['passive','ability'].includes(artType)) return;
  const current = asArray(actor.items).filter(existing => existing.getFlag?.(MODULE_ID,"edoArtType") === artType).length;
  if (current >= 2) {
    ui.notifications.warn(`Edo Tensei permits a maximum of two ${artType === 'passive' ? 'Passive' : 'Ability'} Arts.`);
    return false;
  }
});
Hooks.on("dnd5e.postUseActivity",activity=>{
  const item = activity?.item ?? activity?.parent?.item ?? activity?.actor?.items?.get?.(activity?.itemId);
  const actor = activity?.actor ?? item?.actor;
  if (!actor || !item || !getClassMod(actor)) return;
  const cost = Number(item.getFlag?.(MODULE_ID,"unholyChargeCost") ?? 0);
  if (cost > 0) spendCharges(actor,cost,{reason:item.name}).catch(error=>console.error(`${MODULE_ID} | Unholy Art payment failed`,error));
});
Hooks.on("dnd5e.restCompleted",(actor,result)=>{
  if (actor?.getFlag?.(MODULE_ID,PROFILE_FLAG)) applyEdoRecovery(actor,result?.type).catch(console.error);
  else if (getClassMod(actor)) applyRest(actor,result?.type).catch(console.error);
});
