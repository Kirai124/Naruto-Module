const EDO_MODULE_ID = "n5eb-classmod-library";
const EDO_CLASSMOD_ID = "edo-tensei";
const EDO_TRACKER_FLAG = "edoTenseiTracker";
const EDO_SUMMON_FLAG = "edoTenseiSummon";
const EDO_EFFECT_FLAG = "edoTenseiManagedEffect";
const EDO_PACK = "world.n5eb-custom-class-mods";
const EDO_INTERNAL = "n5eb-classmod-library";
const EDO_ACTOR_FOLDER = "Edo Tensei Summons";
const EDO_ACCENT = "#7a2725";

const EDO_CHARGES = Object.freeze({1: 2, 2: 6, 3: 9, 4: 13, 5: 18});
const EDO_ACTIVE_LIMIT = Object.freeze({1: 1, 2: 2, 3: 3, 4: 4, 5: 5});
const EDO_MAX_RANK = Object.freeze({1: "d", 2: "c", 3: "b", 4: "a", 5: "s"});
const EDO_RANK_ORDER = Object.freeze(["d", "c", "b", "a", "s"]);
const EDO_RANKS = Object.freeze({
  d: {label: "D-Rank", level: 8, slots: 10, speed: 30, cap: 18},
  c: {label: "C-Rank", level: 11, slots: 14, speed: 45, cap: 20},
  b: {label: "B-Rank", level: 14, slots: 18, speed: 60, cap: 22},
  a: {label: "A-Rank", level: 17, slots: 22, speed: 75, cap: 24},
  s: {label: "S-Rank", level: 20, slots: 26, speed: 90, cap: 26}
});
const EDO_TIERS = Object.freeze({
  standard: {label: "Standard", hp: 1, slots: 1, charge: 1, dc: 0, eliteActions: 0, extraSkills: 0},
  elite: {label: "Elite", hp: 2, slots: 2, charge: 2, dc: 2, eliteActions: 1, extraSkills: 3},
  solo: {label: "Solo", hp: 3, slots: 3, charge: 3, dc: 4, eliteActions: 2, extraSkills: 5}
});
const EDO_ROLES = Object.freeze({
  striker: {label: "Striker", description: "Melee combatant with a Multiattack-style two-attack routine."},
  caster: {label: "Caster", description: "Ranged caster with additional Jutsu Slots based on rank."},
  controller: {label: "Controller", description: "Debuffer whose Save DC increases based on rank."},
  defender: {label: "Defender", description: "Defensive summon whose AC increases based on rank."},
  lurker: {label: "Lurker", description: "Stealth attacker that gains the Lethal Attack trait."},
  supporter: {label: "Supporter", description: "Support summon whose healing and temporary HP gain extra dice."}
});
const EDO_ROLE_PRIORITIES = Object.freeze({
  striker: ["str", "dex", "con", "wis", "int", "cha"],
  caster: ["int", "wis", "con", "dex", "cha", "str"],
  controller: ["int", "wis", "cha", "con", "dex", "str"],
  defender: ["con", "str", "dex", "wis", "int", "cha"],
  lurker: ["dex", "wis", "int", "con", "str", "cha"],
  supporter: ["wis", "int", "cha", "con", "dex", "str"]
});
const EDO_SKILL_PRESETS = Object.freeze({
  striker: ["ath", "mar", "prc", "sur", "ins"],
  caster: ["nsh", "ccl", "inv", "his", "prc"],
  controller: ["nsh", "ill", "ins", "inv", "prc"],
  defender: ["ath", "ccl", "prc", "ins", "sur"],
  lurker: ["ste", "acr", "prc", "sur", "slt"],
  supporter: ["med", "ins", "nsh", "ccl", "prc"]
});
const EDO_ABILITY_KEYS = Object.freeze(["str", "dex", "con", "int", "wis", "cha"]);
const EDO_CREATOR_DIALOGS = new Map();
const EDO_TRACKER_DIALOGS = new Map();

function edoArray(value) { return value ? (Array.isArray(value) ? value : Array.from(value)) : []; }
function edoClamp(value, min, max) { const n = Number(value); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min; }
function edoEscape(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c]); }
function edoActorFromContext(actor) { return actor ?? canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character ?? null; }
function edoClassMod(actor) { return edoArray(actor?.items).find(item => item.type === "classmod" && item.system?.identifier === EDO_CLASSMOD_ID) ?? null; }
function edoLevel(actor) { return edoClamp(edoClassMod(actor)?.system?.levels ?? 0, 0, 5); }
function edoCharacterLevel(actor) { return Number(actor?.system?.details?.level ?? actor?.system?.details?.cr ?? 0); }
function edoProficiency(actor) { return Number(actor?.system?.attributes?.prof ?? actor?.system?.prof ?? 0); }
function edoHasItem(actor, identifier) { return edoArray(actor?.items).some(item => item.system?.identifier === identifier); }
function edoFlag(document, key) { return document?.getFlag?.(EDO_MODULE_ID, key) ?? document?.flags?.[EDO_MODULE_ID]?.[key]; }
function edoIsArt(item) { return Boolean(edoFlag(item, "edoArt")); }
function edoIsBlessing(item) { return Boolean(edoFlag(item, "unholyBlessing")); }
function edoRankIndex(rank) { return Math.max(0, EDO_RANK_ORDER.indexOf(String(rank).toLowerCase())); }
function edoRankAllowed(actor, rank) { return edoRankIndex(rank) <= edoRankIndex(EDO_MAX_RANK[edoLevel(actor)] ?? "d"); }
function edoMod(score) { return Math.floor((Number(score) - 10) / 2); }
function edoRankRoleBonus(rank) { const index = edoRankIndex(rank); return index <= 1 ? 1 : index <= 3 ? 2 : 3; }

function edoTrackerMax(actor, state = {}) {
  return Math.max(0, Number(EDO_CHARGES[edoLevel(actor)] ?? 0) - Math.max(0, Number(state.permanentChargeLoss ?? 0)));
}
function edoNormalizeTracker(actor, source = {}) {
  const max = edoTrackerMax(actor, source);
  return {
    version: 1,
    chargesMax: max,
    chargesCurrent: edoClamp(source.chargesCurrent ?? max, 0, max),
    permanentChargeLoss: Math.max(0, Number(source.permanentChargeLoss ?? 0)),
    shortRestRecoveriesUsed: edoClamp(source.shortRestRecoveriesUsed ?? 0, 0, 2)
  };
}
function edoReadTracker(actor) { return edoNormalizeTracker(actor, actor?.getFlag?.(EDO_MODULE_ID, EDO_TRACKER_FLAG) ?? {}); }
async function edoWriteTracker(actor, patch = {}) {
  const next = edoNormalizeTracker(actor, {...edoReadTracker(actor), ...patch});
  await actor.setFlag(EDO_MODULE_ID, EDO_TRACKER_FLAG, next);
  actor.sheet?.render?.(false);
  edoRefreshTrackerDialog(actor);
  return next;
}
function edoArtAttack(actor) { return edoLevel(actor) + 2 * edoProficiency(actor); }
function edoArtSave(actor) { return 12 + edoProficiency(actor) + Math.floor(edoCharacterLevel(actor) / 2); }
async function edoRefreshEffect(actor) {
  const level = edoLevel(actor);
  const existing = edoArray(actor?.effects).find(effect => effect.getFlag?.(EDO_MODULE_ID, EDO_EFFECT_FLAG));
  if (!level) {
    if (existing) await existing.delete({[EDO_INTERNAL]: {edoTensei: true}});
    return;
  }
  const bonus = level >= 4 ? 4 : level >= 2 ? 2 : 0;
  const changes = [];
  if (bonus) for (const ability of ["int", "wis"]) {
    changes.push({key:`system.abilities.${ability}.value`,mode:2,value:String(bonus),priority:20});
    changes.push({key:`system.abilities.${ability}.max`,mode:2,value:String(bonus),priority:20});
  }
  const data = {name:"Edo Tensei — Forbidden Insight",img:"icons/magic/knowledge/book-glowing-purple.webp",disabled:false,transfer:false,duration:{},changes,flags:{[EDO_MODULE_ID]:{[EDO_EFFECT_FLAG]:true}}};
  if (existing) await existing.update(data,{[EDO_INTERNAL]:{edoTensei:true}});
  else await actor.createEmbeddedDocuments("ActiveEffect",[data],{[EDO_INTERNAL]:{edoTensei:true}});
}
async function edoSyncClassMod(actor) {
  const item = edoClassMod(actor);
  if (!item) return;
  const attack = edoArtAttack(actor), save = edoArtSave(actor);
  const updates = {};
  if (String(item.system?.attackBonus?.value ?? "") !== String(attack)) {
    updates["system.attackBonus.value"] = String(attack);
    updates["system.attackBonus.formula"] = String(attack);
  }
  if (String(item.system?.save?.value ?? "") !== String(save)) {
    updates["system.save.value"] = String(save);
    updates["system.save.formula"] = String(save);
  }
  if (Object.keys(updates).length) await item.update(updates, {[EDO_INTERNAL]: {edoTensei: true}});
  const state = edoReadTracker(actor);
  await actor.setFlag(EDO_MODULE_ID, EDO_TRACKER_FLAG, state);
  await edoRefreshEffect(actor);
}

function edoSummonData(actor) { return actor?.getFlag?.(EDO_MODULE_ID, EDO_SUMMON_FLAG) ?? null; }
function edoSummonsFor(summoner, {activeOnly = false} = {}) {
  return edoArray(game.actors).filter(actor => {
    const data = edoSummonData(actor);
    if (!data || data.summonerUuid !== summoner.uuid) return false;
    return !activeOnly || Boolean(data.active);
  });
}
function edoControlLimit(actor) { return Number(EDO_ACTIVE_LIMIT[edoLevel(actor)] ?? 0) + (edoHasItem(actor, "infinite-binding") ? 1 : 0); }
function edoControlledActiveSummons(actor) { return edoSummonsFor(actor,{activeOnly:true}).filter(summon => edoSummonData(summon)?.controlled !== false); }
async function edoSetSummonActive(actor, active) {
  const data = edoSummonData(actor);
  if (!data) return;
  await actor.setFlag(EDO_MODULE_ID, EDO_SUMMON_FLAG, {...data, active: Boolean(active)});
  actor.sheet?.render?.(false);
}

async function edoSpendCharges(actor, amount) {
  const state = edoReadTracker(actor);
  amount = Math.max(0, Number(amount ?? 0));
  if (state.chargesCurrent < amount) {
    ui.notifications.error(`${actor.name} needs ${amount} Unholy Charges but only has ${state.chargesCurrent}.`);
    return false;
  }
  await edoWriteTracker(actor, {chargesCurrent: state.chargesCurrent - amount});
  return true;
}
async function edoApplyRest(actor, type) {
  const state = edoReadTracker(actor);
  if (type === "short") {
    if (state.shortRestRecoveriesUsed >= 2) return ui.notifications.warn("Both Short Rest Unholy Charge recoveries have already been used since the last Long Rest.");
    await edoWriteTracker(actor, {chargesCurrent: state.chargesCurrent + edoLevel(actor), shortRestRecoveriesUsed: state.shortRestRecoveriesUsed + 1});
  } else if (type === "long") {
    await edoWriteTracker(actor, {chargesCurrent: state.chargesCurrent + Math.floor(state.chargesMax / 2), shortRestRecoveriesUsed: 0});
  } else if (type === "full") {
    await edoWriteTracker(actor, {chargesCurrent: state.chargesMax, shortRestRecoveriesUsed: 0});
  }
}

async function edoUseArt(actor, item) {
  const cost = Number(edoFlag(item, "unholyCost") ?? 0);
  if (item.system?.identifier === "summoning-edo-tensei") return edoOpenCreator(actor);
  if (cost > 0 && !(await edoSpendCharges(actor, cost))) return;
  const description = item.system?.description?.value ?? "";
  await ChatMessage.create({speaker: ChatMessage.getSpeaker({actor}), flavor: `<strong>${edoEscape(item.name)}</strong>${cost ? ` · ${cost} Unholy Charge${cost === 1 ? "" : "s"}` : ""}`, content: description});
}

function edoTrackerHtml(actor) {
  const state = edoReadTracker(actor), summons = edoSummonsFor(actor), active = edoControlledActiveSummons(actor);
  const arts = edoArray(actor.items).filter(edoIsArt).sort((a,b) => a.name.localeCompare(b.name));
  return `<div class="n5eb-edo-tracker" data-edo-tracker-root>
    <section class="edo-summary">
      <header><h2><i class="fa-solid fa-skull"></i> Edo Tensei</h2><span>Class Mod Level ${edoLevel(actor)}</span></header>
      <div class="edo-stat-grid">
        <div><span>Unholy Charges</span><strong>${state.chargesCurrent}/${state.chargesMax}</strong></div>
        <div><span>Unholy Art Attack</span><strong>+${edoArtAttack(actor)}</strong></div>
        <div><span>Unholy Art Save DC</span><strong>${edoArtSave(actor)}</strong></div>
        <div><span>Active Edo</span><strong>${active.length}/${edoControlLimit(actor)}</strong></div>
      </div>
      <div class="edo-actions">
        <button type="button" data-action="create"><i class="fa-solid fa-person-circle-plus"></i> Create Edo Tensei</button>
        <button type="button" data-action="charge-minus"><i class="fa-solid fa-minus"></i> Charge</button>
        <button type="button" data-action="charge-plus"><i class="fa-solid fa-plus"></i> Charge</button>
        <button type="button" data-action="max-minus"><i class="fa-solid fa-skull-crossbones"></i> Lose Max Charge</button>
        <button type="button" data-action="max-plus"><i class="fa-solid fa-heart"></i> Restore Max Charge</button>
        <button type="button" data-action="short-rest">Short Rest</button>
        <button type="button" data-action="long-rest">Long Rest</button>
        <button type="button" data-action="full-rest">Full Rest</button>
      </div>
      <p class="hint">Short Rest recovery may be used twice per Long Rest and restores charges equal to Class Mod level. Long Rest restores half maximum and resets those uses. Full Rest restores all. Permanent maximum loss supports Reversed Summoning.</p>
    </section>
    <section><header><h3>Unholy Arts</h3><span>${arts.length}</span></header>
      <div class="edo-list">${arts.length ? arts.map(item => `<article><img src="${edoEscape(item.img)}"><div><strong>${edoEscape(item.name)}</strong><small>${edoEscape(String(edoFlag(item,"artType") ?? "Art"))} · ${Number(edoFlag(item,"unholyCost") ?? 0)} charge</small></div><button type="button" data-action="use-art" data-item-id="${item.id}">Use</button></article>`).join("") : "<p>No Unholy Arts are owned.</p>"}</div>
    </section>
    <section><header><h3>Created Edo Tensei</h3><span>${summons.length}</span></header>
      <div class="edo-list">${summons.length ? summons.map(summon => { const data = edoSummonData(summon); return `<article><img src="${edoEscape(summon.img)}"><div><strong>${edoEscape(summon.name)}</strong><small>${String(data.rank ?? "").toUpperCase()} · ${edoEscape(data.tier ?? "standard")} · ${edoEscape(data.role ?? "")}${data.active ? " · active" : ""}${data.controlled === false ? " · uncontrolled" : ""}</small></div><button type="button" data-action="open-summon" data-actor-id="${summon.id}">Open</button><button type="button" data-action="toggle-summon" data-actor-id="${summon.id}">${data.active ? "Release" : "Activate"}</button></article>`; }).join("") : "<p>No Edo Tensei have been created yet.</p>"}</div>
    </section>
  </div>`;
}
async function edoOpenTracker(actor = null) {
  actor = edoActorFromContext(actor);
  if (!actor || !edoClassMod(actor)) return ui.notifications.warn("Select a character with the Edo Tensei Class Mod.");
  const key = actor.uuid;
  const existing = EDO_TRACKER_DIALOGS.get(key);
  if (existing?.rendered) return existing.bringToFront?.();
  const DialogV2 = foundry.applications.api.DialogV2;
  const dialog = new DialogV2({window:{title:`Edo Tensei — ${actor.name}`,icon:"fa-solid fa-skull",resizable:true,minimizable:true},position:{width:800,height:720},classes:["n5eb-edo-tracker-window"],content:edoTrackerHtml(actor),buttons:[{action:"close",label:"Close",icon:"fa-solid fa-xmark"}]});
  dialog.addEventListener("render", () => edoActivateTracker(dialog, actor));
  dialog.addEventListener("close", () => EDO_TRACKER_DIALOGS.delete(key), {once:true});
  EDO_TRACKER_DIALOGS.set(key, dialog);
  await dialog.render({force:true});
}
function edoRefreshTrackerDialog(actor) {
  const dialog = EDO_TRACKER_DIALOGS.get(actor?.uuid);
  if (dialog?.rendered) dialog.render({force:true});
}
function edoActivateTracker(dialog, actor) {
  const root = dialog.element?.querySelector?.("[data-edo-tracker-root]");
  if (!root || root.dataset.activated === "true") return;
  root.dataset.activated = "true";
  root.addEventListener("click", async event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const action = button.dataset.action, state = edoReadTracker(actor);
    try {
      if (action === "create") await edoOpenCreator(actor);
      else if (action === "charge-minus") await edoWriteTracker(actor,{chargesCurrent:state.chargesCurrent-1});
      else if (action === "charge-plus") await edoWriteTracker(actor,{chargesCurrent:state.chargesCurrent+1});
      else if (action === "max-minus") await edoWriteTracker(actor,{permanentChargeLoss:state.permanentChargeLoss+1});
      else if (action === "max-plus") await edoWriteTracker(actor,{permanentChargeLoss:Math.max(0,state.permanentChargeLoss-1)});
      else if (action === "short-rest") await edoApplyRest(actor,"short");
      else if (action === "long-rest") await edoApplyRest(actor,"long");
      else if (action === "full-rest") await edoApplyRest(actor,"full");
      else if (action === "use-art") { const item = actor.items.get(button.dataset.itemId); if (item) await edoUseArt(actor,item); }
      else if (action === "open-summon") game.actors.get(button.dataset.actorId)?.sheet?.render(true);
      else if (action === "toggle-summon") {
        const summon = game.actors.get(button.dataset.actorId); if (!summon) return;
        const data = edoSummonData(summon); const next = !data.active;
        if (next && edoSummonData(summon)?.controlled !== false && edoControlledActiveSummons(actor).length >= edoControlLimit(actor)) return ui.notifications.error("The active Edo Tensei control limit has been reached.");
        await edoSetSummonActive(summon,next); edoRefreshTrackerDialog(actor);
      }
    } catch (error) { console.error(`${EDO_MODULE_ID} | Edo tracker action failed`, error); ui.notifications.error(error.message); }
  });
}

async function edoLoadLibrary() {
  const pack = game.packs.get(EDO_PACK);
  if (!pack) throw new Error("The N5eB Custom Class Mods compendium has not been synchronized.");
  const docs = await pack.getDocuments();
  return {
    blessings: docs.filter(edoIsBlessing).sort((a,b) => Number(edoFlag(a,"blessingCost"))-Number(edoFlag(b,"blessingCost")) || a.name.localeCompare(b.name)),
    traits: docs.filter(item => edoFlag(item,"edoSummonTrait")).sort((a,b) => edoRankIndex(edoFlag(a,"traitRank"))-edoRankIndex(edoFlag(b,"traitRank")) || a.name.localeCompare(b.name))
  };
}
function edoDefaultAbilities(rank, role) {
  const result = Object.fromEntries(EDO_ABILITY_KEYS.map(key => [key,16]));
  const index = edoRankIndex(rank), points = index * 6, cap = EDO_RANKS[rank].cap, priorities = EDO_ROLE_PRIORITIES[role] ?? EDO_ROLE_PRIORITIES.striker;
  let remaining = points, cursor = 0;
  while (remaining > 0) {
    const key = priorities[cursor % priorities.length];
    if (result[key] < cap) { result[key] += 1; remaining -= 1; }
    cursor += 1;
    if (cursor > 1000) break;
  }
  return result;
}
function edoCasterSlotBonus(rank) { const i = edoRankIndex(rank); return i <= 1 ? 3 : i <= 3 ? 5 : 7; }
function edoEffectiveBlessingCost(item, rank) {
  let cost = Number(edoFlag(item,"blessingCost") ?? 1);
  if (item.system?.identifier === "soul-fragment" && rank === "s") cost = 2;
  return cost;
}
function edoBlessingAllowed(item, tier) {
  const prereq = String(edoFlag(item,"blessingPrerequisite") ?? "").toLowerCase();
  if (!prereq) return true;
  if (prereq.includes("solo")) return tier === "solo";
  if (prereq.includes("elite")) return tier === "elite" || tier === "solo";
  return true;
}
function edoCalculateBuild(options) {
  const rank = options.rank, tier = options.tier, role = options.role;
  const rankData = EDO_RANKS[rank], tierData = EDO_TIERS[tier];
  if (!rankData || !tierData) throw new Error("Invalid Edo Tensei rank or tier.");
  if (tier === "solo" && rank !== "s") throw new Error("Solo Edo Tensei are restricted to S-Rank souls.");
  const abilities = options.abilities;
  const conMod = edoMod(abilities.con), defensiveMod = edoMod(abilities[options.defensiveAbility] ?? abilities.dex);
  let ac = 10 + Math.floor(rankData.level / 2) + defensiveMod;
  if (role === "defender" || options.allRoles) ac += edoRankRoleBonus(rank);
  if (options.blessingIdentifiers.includes("iron-husk")) ac += 3;
  if (options.armored && options.blessingIdentifiers.includes("gravebound-arsenal")) ac += 1;
  let speed = rankData.speed;
  if (options.blessingIdentifiers.includes("shadow-gale-movement")) speed += 30;
  let slots = rankData.slots + (role === "caster" || options.allRoles ? edoCasterSlotBonus(rank) : 0);
  slots *= tierData.slots;
  const hp = Math.max(1,(10 + conMod) * rankData.level * tierData.hp);
  const vesselMod = options.vessel === "decayed" ? 3 : options.vessel === "living" ? -edoClamp(options.livingReduction || 1,1,5) : 0;
  const blessingCost = Number(options.blessingCost ?? 0);
  const summoningDC = 15 + edoRankIndex(rank) + tierData.dc + blessingCost + vesselMod;
  const dnaDC = 15 - options.classModLevel + (tier === "elite" ? 1 : tier === "solo" ? 2 : 0);
  const blessingBudget = options.classModLevel >= 5 ? 5 : options.dnaTotal >= dnaDC ? edoClamp(Math.floor((options.dnaTotal - dnaDC) / 2),0,5) : 0;
  const controllerBonus = role === "controller" || options.allRoles ? edoRankRoleBonus(rank) : 0;
  const supporterDice = role === "supporter" || options.allRoles ? edoRankRoleBonus(rank) : 0;
  return {rank, tier, role, level:rankData.level, abilities, hp, ac, speed, slots, chargeCost:tierData.charge, eliteActions:tierData.eliteActions, extraSkills:tierData.extraSkills, summoningDC,dnaDC,blessingBudget,blessingCost,controllerBonus,supporterDice,vesselMod};
}

function edoCreatorHtml(actor, library) {
  const level = edoLevel(actor), maxRank = EDO_MAX_RANK[level] ?? "d", defaultRank = maxRank, abilities = edoDefaultAbilities(defaultRank,"striker");
  const sourceActors = edoArray(game.actors).filter(a => a.id !== actor.id && a.type !== "vehicle").sort((a,b)=>a.name.localeCompare(b.name));
  const blessingRows = library.blessings.map(item => {
    const cost = Number(edoFlag(item,"blessingCost") ?? 1), prereq = edoFlag(item,"blessingPrerequisite") ?? "";
    return `<label class="edo-choice" data-blessing-row data-identifier="${edoEscape(item.system?.identifier)}" data-base-cost="${cost}" data-prerequisite="${edoEscape(prereq)}"><input type="checkbox" data-blessing-uuid="${item.uuid}"><img src="${edoEscape(item.img)}"><span><strong>${edoEscape(item.name)}</strong><small>${cost} point${cost===1?"":"s"}${prereq?` · ${edoEscape(prereq)}`:""}</small></span></label>`;
  }).join("");
  const traitSelect = rank => `<label>${rank.toUpperCase()}-Rank Trait<select data-trait-rank="${rank}"><option value="">None</option>${library.traits.filter(i=>edoFlag(i,"traitRank")===rank).map(i=>`<option value="${i.uuid}">${edoEscape(i.name)}</option>`).join("")}</select></label>`;
  return `<div class="n5eb-edo-creator" data-edo-creator-root>
    <header class="edo-hero"><div><p class="eyebrow">Direct N5eB Actor creation</p><h2>Forge an Edo Tensei</h2><p>Standard, Elite, and Solo values use the Class Mod’s exact level, HP, AC, slot, role, vessel, DNA, Blessing, and Summoning DC calculations.</p></div><img src="modules/${EDO_MODULE_ID}/assets/edo-tensei-cover.png"></header>
    <section class="edo-config-grid">
      <label>Name<input type="text" data-field="name" value="Reanimated Shinobi"></label>
      <label>Source Actor<select data-field="sourceActor"><option value="">Build from scratch</option>${sourceActors.map(a=>`<option value="${a.id}">${edoEscape(a.name)}</option>`).join("")}</select></label>
      <label>Rank<select data-field="rank">${EDO_RANK_ORDER.filter(r=>edoRankIndex(r)<=edoRankIndex(maxRank)).map(r=>`<option value="${r}" ${r===defaultRank?"selected":""}>${EDO_RANKS[r].label}</option>`).join("")}</select></label>
      <label>Tier<select data-field="tier"><option value="standard">Standard</option><option value="elite">Elite</option><option value="solo" ${defaultRank!=="s"?"disabled":""}>Solo (S-Rank only)</option></select></label>
      <label>Combat Role<select data-field="role">${Object.entries(EDO_ROLES).map(([key,v])=>`<option value="${key}">${v.label}</option>`).join("")}</select></label>
      <label>Defensive Ability<select data-field="defensiveAbility">${EDO_ABILITY_KEYS.map(k=>`<option value="${k}" ${k==="dex"?"selected":""}>${k.toUpperCase()}</option>`).join("")}</select></label>
      <label>Vessel<select data-field="vessel"><option value="intact">Intact body</option><option value="decayed">Rotting / decayed (+3 DC)</option><option value="living">Living host (-1 to -5 DC)</option></select></label>
      <label>Living Host Reduction<input type="number" data-field="livingReduction" min="1" max="5" value="1"></label>
      <label>DNA Check Total<div class="edo-inline"><input type="number" data-field="dnaTotal" value="30"><button type="button" data-action="roll-dna" title="Roll an Intelligence Check"><i class="fa-solid fa-dice-d20"></i></button></div></label>
      <label class="checkbox"><input type="checkbox" data-field="armored"> Summon is wearing armor</label>
      <label class="checkbox"><input type="checkbox" data-field="copyItems" checked> Copy source Jutsu, Clan, and Features</label>
      <label class="checkbox"><input type="checkbox" data-field="resolve" checked> Resolve Summoning Check and spend charges</label>
      <label class="checkbox"><input type="checkbox" data-field="advantage"> Summoning Check with advantage</label>
      <label class="checkbox"><input type="checkbox" data-field="openSheet" checked> Open created Actor sheet</label>
    </section>
    <section><header><h3>Ability Scores</h3><button type="button" data-action="reset-abilities"><i class="fa-solid fa-rotate"></i> Role Defaults</button></header><div class="edo-ability-grid">${EDO_ABILITY_KEYS.map(k=>`<label><span>${k.toUpperCase()}</span><input type="number" data-ability="${k}" min="1" max="30" value="${abilities[k]}"></label>`).join("")}</div></section>
    <section><header><h3>Rank Traits</h3><span>Choose up to one trait at each attained rank.</span></header><div class="edo-trait-grid">${EDO_RANK_ORDER.map(traitSelect).join("")}</div></section>
    <section><header><h3>Unholy Blessings</h3><span data-blessing-summary>0 / 0 points</span></header><div class="edo-choice-grid">${blessingRows}</div></section>
    <section class="edo-preview" data-preview></section>
    <footer><p data-status></p><button type="button" data-action="create"><i class="fa-solid fa-skull"></i> Create Edo Tensei</button></footer>
  </div>`;
}

async function edoOpenCreator(actor = null) {
  actor = edoActorFromContext(actor);
  if (!actor || !edoClassMod(actor)) return ui.notifications.warn("Select a character with the Edo Tensei Class Mod.");
  if (!game.user.isGM) return ui.notifications.error("Only a GM can create Edo Tensei Actors.");
  const existing = EDO_CREATOR_DIALOGS.get(actor.uuid);
  if (existing?.rendered) return existing.bringToFront?.();
  const library = await edoLoadLibrary();
  const DialogV2 = foundry.applications.api.DialogV2;
  const dialog = new DialogV2({window:{title:`Create Edo Tensei — ${actor.name}`,icon:"fa-solid fa-person-circle-plus",resizable:true,minimizable:true},position:{width:1080,height:820},classes:["n5eb-edo-creator-window"],content:edoCreatorHtml(actor,library),buttons:[{action:"close",label:"Close",icon:"fa-solid fa-xmark"}]});
  dialog.addEventListener("render",()=>edoActivateCreator(dialog,actor,library));
  dialog.addEventListener("close",()=>EDO_CREATOR_DIALOGS.delete(actor.uuid),{once:true});
  EDO_CREATOR_DIALOGS.set(actor.uuid,dialog);
  await dialog.render({force:true});
}
function edoReadCreator(root, actor) {
  const val = field => root.querySelector(`[data-field="${field}"]`)?.value;
  const checked = field => Boolean(root.querySelector(`[data-field="${field}"]`)?.checked);
  const abilities = Object.fromEntries(EDO_ABILITY_KEYS.map(k=>[k,edoClamp(root.querySelector(`[data-ability="${k}"]`)?.value ?? 16,1,30)]));
  const blessingInputs = [...root.querySelectorAll("input[data-blessing-uuid]:checked")];
  const blessingIdentifiers = blessingInputs.map(input=>input.closest("[data-blessing-row]")?.dataset.identifier).filter(Boolean);
  const rank = val("rank"), tier = val("tier");
  const blessingCost = blessingInputs.reduce((sum,input)=>{
    const row=input.closest("[data-blessing-row]"); let cost=Number(row?.dataset.baseCost ?? 1);
    if(row?.dataset.identifier==="soul-fragment"&&rank==="s") cost=2;
    return sum+cost;
  },0);
  return {
    name: val("name")?.trim() || "Reanimated Shinobi", sourceActorId: val("sourceActor"), rank, tier, role:val("role"), defensiveAbility:val("defensiveAbility"), vessel:val("vessel"), livingReduction:Number(val("livingReduction")??1), dnaTotal:Number(val("dnaTotal")??0), armored:checked("armored"),copyItems:checked("copyItems"),resolve:checked("resolve"),advantage:checked("advantage"),openSheet:checked("openSheet"),abilities,classModLevel:edoLevel(actor),blessingUuids:blessingInputs.map(i=>i.dataset.blessingUuid),blessingIdentifiers,blessingCost,traitUuids:[...root.querySelectorAll("select[data-trait-rank]")].filter(s=>s.value&&edoRankIndex(s.dataset.traitRank)<=edoRankIndex(rank)).map(s=>s.value)
  };
}
function edoValidateCreator(options, calc, actor, root) {
  if (!edoRankAllowed(actor,options.rank)) throw new Error(`${options.rank.toUpperCase()}-Rank is not unlocked at this Class Mod level.`);
  if (options.tier === "solo" && options.rank !== "s") throw new Error("Solo Edo Tensei are S-Rank only.");
  if (calc.blessingCost > calc.blessingBudget) throw new Error(`Selected Blessings cost ${calc.blessingCost}, but the DNA result provides only ${calc.blessingBudget} points.`);
  for (const row of root.querySelectorAll("input[data-blessing-uuid]:checked")) {
    const prereq = row.closest("[data-blessing-row]")?.dataset.prerequisite?.toLowerCase() ?? "";
    if (prereq.includes("solo") && options.tier !== "solo") throw new Error("Abyssal Reclamation requires a Solo Edo Tensei.");
    if (prereq.includes("elite") && !["elite","solo"].includes(options.tier)) throw new Error("Profane Ascension and Blasphemous Transcription require an Elite or Solo Edo Tensei.");
  }
  if (options.resolve && edoReadTracker(actor).chargesCurrent < calc.chargeCost) throw new Error(`Not enough Unholy Charges. ${calc.chargeCost} required.`);
  if (options.resolve && edoControlledActiveSummons(actor).length >= edoControlLimit(actor)) throw new Error("The active Edo Tensei control limit has been reached.");
}
function edoPreviewHtml(options,calc) {
  const result = options.classModLevel>=5 ? "Automatic success (Absolute Edo Tensei)" : `Ninshou check vs DC ${calc.summoningDC}`;
  return `<header><h3>Calculated Edo Tensei</h3><span>${EDO_RANKS[options.rank].label} ${EDO_TIERS[options.tier].label} ${options.allRoles?"All Roles (Echoes of Past Lives)":EDO_ROLES[options.role].label}</span></header><div class="edo-stat-grid"><div><span>Level</span><strong>${calc.level}</strong></div><div><span>HP</span><strong>${calc.hp}</strong></div><div><span>AC</span><strong>${calc.ac}</strong></div><div><span>Speed</span><strong>${calc.speed} ft</strong></div><div><span>Jutsu Slots</span><strong>${calc.slots}</strong></div><div><span>Elite Actions</span><strong>${calc.eliteActions}</strong></div><div><span>DNA DC</span><strong>${calc.dnaDC}</strong></div><div><span>Blessing Points</span><strong>${calc.blessingCost}/${calc.blessingBudget}</strong></div><div><span>Summoning</span><strong>${result}</strong></div><div><span>Charge Cost</span><strong>${calc.chargeCost}</strong></div></div><p>${options.allRoles?"Echoes of Past Lives applies every Summoning Role simultaneously.":edoEscape(EDO_ROLES[options.role].description)}${calc.controllerBonus?` Save DC +${calc.controllerBonus}.`:""}${calc.supporterDice?` Healing / temp HP +${calc.supporterDice} dice.`:""}</p>`;
}
function edoActivateCreator(dialog, actor, library) {
  const root = dialog.element?.querySelector?.("[data-edo-creator-root]");
  if (!root || root.dataset.activated === "true") return;
  root.dataset.activated = "true";
  const status = root.querySelector("[data-status]");
  const update = () => {
    try {
      const rankSelect=root.querySelector('[data-field="rank"]');
      const tierSelect=root.querySelector('[data-field="tier"]');
      if(rankSelect?.value!=="s" && tierSelect?.value==="solo") tierSelect.value="elite";
      const options=edoReadCreator(root,actor),calc=edoCalculateBuild(options);
      root.querySelector("[data-preview]").innerHTML=edoPreviewHtml(options,calc);
      root.querySelector("[data-blessing-summary]").textContent=`${calc.blessingCost} / ${calc.blessingBudget} points`;
      root.querySelectorAll("[data-blessing-row]").forEach(row=>{const allowed=edoBlessingAllowed({system:{identifier:row.dataset.identifier},flags:{[EDO_MODULE_ID]:{blessingPrerequisite:row.dataset.prerequisite}}},options.tier);row.classList.toggle("disabled",!allowed);row.querySelector("input").disabled=!allowed;if(!allowed)row.querySelector("input").checked=false;});
      root.querySelectorAll("select[data-trait-rank]").forEach(select=>{select.disabled=edoRankIndex(select.dataset.traitRank)>edoRankIndex(options.rank);if(select.disabled)select.value="";});
      const solo=root.querySelector('[data-field="tier"] option[value="solo"]'); if(solo)solo.disabled=options.rank!=="s"; if(options.rank!=="s"&&options.tier==="solo")root.querySelector('[data-field="tier"]').value="elite";
      status.textContent="";
    } catch(error){status.textContent=error.message;status.dataset.kind="error";}
  };
  root.querySelectorAll("input,select").forEach(el=>el.addEventListener("change",update));
  root.querySelector('[data-field="sourceActor"]')?.addEventListener("change",event=>{
    const source=game.actors.get(event.currentTarget.value);if(!source)return;
    root.querySelector('[data-field="name"]').value=`${source.name} — Edo Tensei`;
    for(const key of EDO_ABILITY_KEYS){const score=source.system?.abilities?.[key]?.value;if(Number.isFinite(Number(score)))root.querySelector(`[data-ability="${key}"]`).value=score;}
    update();
  });
  root.querySelector('[data-action="reset-abilities"]')?.addEventListener("click",()=>{const rank=root.querySelector('[data-field="rank"]').value,role=root.querySelector('[data-field="role"]').value,defaults=edoDefaultAbilities(rank,role);for(const key of EDO_ABILITY_KEYS)root.querySelector(`[data-ability="${key}"]`).value=defaults[key];update();});
  root.querySelector('[data-action="roll-dna"]')?.addEventListener("click",async()=>{const bonus=edoMod(actor.system?.abilities?.int?.value??10);const roll=await(new Roll("1d20 + @bonus",{bonus})).evaluate();await roll.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:"Edo Tensei DNA Check"});root.querySelector('[data-field="dnaTotal"]').value=Number(roll.total??0);update();});
  root.querySelector('[data-action="create"]')?.addEventListener("click",async event=>{
    const button=event.currentTarget;button.disabled=true;status.textContent="Creating Edo Tensei…";status.dataset.kind="working";
    try{const options=edoReadCreator(root,actor),calc=edoCalculateBuild(options);edoValidateCreator(options,calc,actor,root);const created=await edoCreateSummon(actor,options,calc,library);if(created){status.textContent=`${created.name} was created.`;status.dataset.kind="success";ui.notifications.info(`${created.name} was created.`);if(options.openSheet)created.sheet?.render(true);edoRefreshTrackerDialog(actor);}else{status.textContent="The Summoning Check failed; no controlled Edo Tensei was created.";status.dataset.kind="error";}}
    catch(error){console.error(`${EDO_MODULE_ID} | Edo Tensei creation failed`,error);status.textContent=error.message;status.dataset.kind="error";ui.notifications.error(error.message);}finally{button.disabled=false;}
  });
  update();
}

function edoNinshouBonus(actor) {
  const skill=actor?.system?.skills?.nsh ?? {};
  for(const candidate of [skill.total,skill.mod,skill.bonus,skill.passive]) if(Number.isFinite(Number(candidate))) return Number(candidate);
  return edoMod(actor?.system?.abilities?.int?.value ?? 10)+edoProficiency(actor);
}
async function edoResolveSummoning(actor,options,calc) {
  if (!(await edoSpendCharges(actor,calc.chargeCost))) return {success:false,critical:false};
  if (edoLevel(actor)>=5) {
    await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p><strong>Absolute Edo Tensei:</strong> ${edoEscape(options.name)} is summoned automatically against DC ${calc.summoningDC}.</p>`});
    return {success:true,critical:false,total:null};
  }
  const bonus=edoNinshouBonus(actor),formula=options.advantage?"2d20kh + @bonus":"1d20 + @bonus";
  const roll=await (new Roll(formula,{bonus})).evaluate();
  await roll.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:`Summoning Edo Tensei — DC ${calc.summoningDC}`});
  const total=Number(roll.total??0),success=total>=calc.summoningDC,critical=!success&&total<=calc.summoningDC-5;
  return {success,critical,total};
}
async function edoGetFolder() {
  let folder=game.folders.find(f=>f.type==="Actor"&&f.name===EDO_ACTOR_FOLDER);
  if(!folder)folder=await Folder.implementation.create({name:EDO_ACTOR_FOLDER,type:"Actor",sorting:"a"});
  return folder;
}
function edoBuildSkills(source, role, extra) {
  const skills=source ? foundry.utils.deepClone(source.system?.skills ?? {}) : {};
  const preset=EDO_SKILL_PRESETS[role] ?? [];
  const needed=Math.max(5,preset.length)+extra;
  const all=[...new Set([...preset,"ath","acr","ccl","nsh","ill","ins","inv","med","prc","ste","sur","slt","his","cra","mar"] )];
  for(const key of all.slice(0,needed)) {
    const current=skills[key] ?? {};
    skills[key]={...current,value:Math.max(1,Number(current.value??0)),mastery:Number(current.mastery??0)+(extra>0&&preset.includes(key)?1:0)};
  }
  return skills;
}
function edoAbilityData(options) {
  const saveProficiencies = options.role === "caster" ? ["int","wis","con"] : options.role === "lurker" ? ["dex","wis","int"] : ["str","con","wis"];
  return Object.fromEntries(EDO_ABILITY_KEYS.map(key=>[key,{value:Number(options.abilities[key]),proficient:saveProficiencies.includes(key)?1:0,max:null,bonuses:{check:"",save:""}}]));
}
function edoBiography(summoner,options,calc,result) {
  return `<h2>Edo Tensei</h2><p><strong>Summoner:</strong> ${edoEscape(summoner.name)}<br><strong>Rank:</strong> ${options.rank.toUpperCase()}<br><strong>Tier:</strong> ${edoEscape(EDO_TIERS[options.tier].label)}<br><strong>Role:</strong> ${edoEscape(EDO_ROLES[options.role].label)}<br><strong>Vessel:</strong> ${edoEscape(options.vessel)}<br><strong>Summoning DC:</strong> ${calc.summoningDC}<br><strong>Unholy Blessing Points:</strong> ${calc.blessingCost}/${calc.blessingBudget}<br><strong>Control:</strong> ${result.critical?"Uncontrolled for 24 hours":options.resolve?"Controlled":"Prepared, not currently summoned"}</p><p><strong>Calculated values:</strong> HP ${calc.hp}; AC ${calc.ac}; Speed ${calc.speed} ft; Jutsu Slots ${calc.slots}; Elite Actions ${calc.eliteActions}.</p><p>${edoEscape(EDO_ROLES[options.role].description)}</p>`;
}
async function edoCloneItemData(document) {
  const data=document.pack&&game.items?.fromCompendium?game.items.fromCompendium(document,{keepId:false}):document.toObject();
  delete data._id;delete data.folder;delete data.ownership;
  return data;
}
async function edoCreateSummon(summoner,options,calc,library) {
  let result={success:true,critical:false,total:null};
  if(options.resolve){result=await edoResolveSummoning(summoner,options,calc);if(!result.success&&!result.critical)return null;}
  const source=options.sourceActorId?game.actors.get(options.sourceActorId):null;
  const folder=await edoGetFolder();
  const controlled=!result.critical,active=Boolean(options.resolve),disposition=controlled?CONST.TOKEN_DISPOSITIONS.FRIENDLY:CONST.TOKEN_DISPOSITIONS.HOSTILE;
  const image=source?.img||"modules/n5eb-classmod-library/assets/edo-tensei-cover.png";
  const tierData=EDO_TIERS[options.tier];
  const actorData={name:options.name,type:"npc",img:image,folder:folder?.id??null,ownership:foundry.utils.deepClone(summoner.ownership??{default:0}),prototypeToken:{name:options.name,displayName:CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,displayBars:CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,disposition,actorLink:false,texture:{src:image},bar1:{attribute:"attributes.hp"},bar2:{attribute:"attributes.chakra"}},system:{abilities:edoAbilityData(options),skills:edoBuildSkills(source,options.role,tierData.extraSkills),attributes:{hp:{value:calc.hp,max:calc.hp,temp:0,tempmax:0,formula:""},chakra:{value:calc.slots,max:calc.slots,temp:0,tempmax:0,formula:""},ac:{calc:"flat",flat:calc.ac,formula:""},movement:{walk:calc.speed,units:"ft",hover:false},spellcasting:options.role==="supporter"?"wis":options.role==="striker"?"str":"int",jutsu:{ninjutsu:{ability:"int",bonuses:{attack:"",dc:String(calc.controllerBonus||"")}},taijutsu:{ability:options.role==="striker"?"str":"dex",bonuses:{attack:"",dc:String(calc.controllerBonus||"")}},genjutsu:{ability:options.role==="controller"?"int":"wis",bonuses:{attack:"",dc:String(calc.controllerBonus||"")}},known:{value:0,max:calc.slots,maxRank:options.rank}}},details:{cr:calc.level,type:{value:"undead",subtype:"edo tensei",custom:"",swarm:""},biography:{value:edoBiography(summoner,options,calc,result),public:""},adversary:{enabled:true,level:calc.level,rank:options.rank,class:options.tier,role:options.role,discipline:"edo-tensei",clan:"",affiliation:"",specialRoles:[],suppressedAutoPassives:[],fixedJutsuCost:true,migrated:true},summon:{enabled:true}},resources:{tenacity:{max:options.tier==="solo"?calc.level:options.tier==="elite"?Math.floor(calc.level/2):0,spent:0,softMax:0},eliteact:{max:calc.eliteActions,spent:0}},traits:{size:"med",affinity:{value:[],custom:""},important:options.tier!=="standard"},source:{book:"Edo Tensei Class Mod v1.3"}},flags:{[EDO_MODULE_ID]:{[EDO_SUMMON_FLAG]:{summonerUuid:summoner.uuid,rank:options.rank,tier:options.tier,role:options.role,controlled,active,prepared:!options.resolve,createdAt:Date.now(),calculations:calc}}}};
  const created=await Actor.implementation.create(actorData,{renderSheet:false});
  if(!created)throw new Error("The Edo Tensei Actor could not be created.");
  const embed=[];
  if(source&&options.copyItems){for(const item of edoArray(source.items)){if(item.type==="classmod")continue;if(!["spell","jutsu","feat","clan"].includes(item.type))continue;embed.push(await edoCloneItemData(item));}}
  for(const uuid of [...options.blessingUuids,...options.traitUuids]){const doc=await fromUuid(uuid);if(doc?.documentName==="Item")embed.push(await edoCloneItemData(doc));}
  const roleFeature={name:`Edo Tensei Role — ${options.allRoles?"All Roles":EDO_ROLES[options.role].label}`,type:"feat",img:"icons/skills/social/intimidation-impressing.webp",system:{description:{chat:"",value:`<p>${options.allRoles?"Echoes of Past Lives grants the benefits of Striker, Caster, Controller, Defender, Lurker, and Supporter simultaneously.":edoEscape(EDO_ROLES[options.role].description)}</p>${calc.controllerBonus?`<p>Save DC bonus: +${calc.controllerBonus}.</p>`:""}${calc.supporterDice?`<p>Healing and temporary HP gain +${calc.supporterDice} dice.</p>`:""}`},identifier:`edo-role-${options.role}`,requirements:"Edo Tensei",source:{book:"Homebrew",custom:"Edo Tensei Class Mod",rules:"n5eb"},activation:{type:"none",cost:null,condition:""},uses:{value:null,max:"",per:null,recovery:"",prompt:true},type:{value:"classmod",subtype:"",nestedsubtype:""}},flags:{[EDO_MODULE_ID]:{generatedRole:true}}};
  embed.push(roleFeature);
  if(embed.length)for(let i=0;i<embed.length;i+=40)await created.createEmbeddedDocuments("Item",embed.slice(i,i+40),{keepId:false});
  await created.update({"system.attributes.jutsu.known.value":edoArray(created.items).filter(i=>["spell","jutsu"].includes(i.type)).length,"system.attributes.jutsu.known.max":calc.slots},{[EDO_INTERNAL]:{edoTensei:true}});
  return created;
}

function edoRenderRoot(app,html){return html?.[0]??html??app.element?.[0]??app.element;}
function edoRenderSheetStrip(app,html){const actor=app.actor??app.document;if(!edoClassMod(actor))return;const root=edoRenderRoot(app,html);if(!root||root.querySelector("[data-edo-strip]"))return;const target=root.querySelector(".jutsu-casting-overview")??root.querySelector(".sheet-body");if(!target)return;const state=edoReadTracker(actor),active=edoControlledActiveSummons(actor).length;const section=document.createElement("section");section.className="n5eb-edo-tracker-strip";section.dataset.edoStrip="true";section.innerHTML=`<button type="button" data-action="open"><i class="fa-solid fa-skull"></i> Edo Tensei</button><div><span>Charges</span><strong>${state.chargesCurrent}/${state.chargesMax}</strong></div><div><span>Active</span><strong>${active}/${edoControlLimit(actor)}</strong></div><button type="button" data-action="create"><i class="fa-solid fa-person-circle-plus"></i> Create</button>`;target.prepend(section);section.querySelector('[data-action="open"]').addEventListener("click",()=>edoOpenTracker(actor));section.querySelector('[data-action="create"]').addEventListener("click",()=>edoOpenCreator(actor));}

Hooks.once("ready",async()=>{
  globalThis.N5eBEdoTensei=Object.freeze({openTracker:edoOpenTracker,openCreator:edoOpenCreator,getTracker:edoReadTracker,setTracker:edoWriteTracker,createSummon:edoCreateSummon,recalculate:edoCalculateBuild});
  if(game.system.id!=="n5eb")return;
  for(const actor of game.actors??[])if(edoClassMod(actor))await edoSyncClassMod(actor);
});
Hooks.on("getActorSheetHeaderButtons",(sheet,buttons)=>{const actor=sheet.actor??sheet.document;if(!edoClassMod(actor))return;const state=edoReadTracker(actor);buttons.unshift({label:`Edo ${state.chargesCurrent}/${state.chargesMax}`,class:"n5eb-edo-tracker-button",icon:"fas fa-skull",onclick:()=>edoOpenTracker(actor)});});
Hooks.on("renderActorSheet",edoRenderSheetStrip);Hooks.on("renderCharacterActorSheet",edoRenderSheetStrip);
Hooks.on("createItem",async(item,options,userId)=>{if(options?.[EDO_INTERNAL]||userId!==game.user.id||item.parent?.documentName!=="Actor")return;const actor=item.parent;if(item.type==="classmod"&&item.system?.identifier===EDO_CLASSMOD_ID){await edoSyncClassMod(actor);return;}if(!edoClassMod(actor)||!edoIsArt(item))return;const type=String(edoFlag(item,"artType")??"");if(!["passive","ability"].includes(type))return;const owned=edoArray(actor.items).filter(i=>i.id!==item.id&&edoIsArt(i)&&String(edoFlag(i,"artType"))===type);if(owned.length>=2){ui.notifications.error(`Only two ${type} Unholy Arts may be known.`);await item.delete({[EDO_INTERNAL]:{edoTensei:true}});}});
Hooks.on("updateItem",async(item,changes,options,userId)=>{if(options?.[EDO_INTERNAL]||userId!==game.user.id||item.parent?.documentName!=="Actor")return;if(item.type==="classmod"&&item.system?.identifier===EDO_CLASSMOD_ID)await edoSyncClassMod(item.parent);});
Hooks.on("updateActor",async(actor,changes,options,userId)=>{if(options?.[EDO_INTERNAL]||userId!==game.user.id||!edoClassMod(actor))return;await edoSyncClassMod(actor);});
Hooks.on("deleteItem",async(item,options,userId)=>{if(options?.[EDO_INTERNAL]||userId!==game.user.id||item.parent?.documentName!=="Actor")return;if(item.type==="classmod"&&item.system?.identifier===EDO_CLASSMOD_ID)await edoRefreshEffect(item.parent);});
Hooks.on("dnd5e.restCompleted",(actor,result)=>{if(edoClassMod(actor))edoApplyRest(actor,result?.type).catch(console.error);});
