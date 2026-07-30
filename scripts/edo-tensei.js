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
const TIER_UI = Object.freeze({
  standard: {
    label:"Normal Edo Tensei", shortLabel:"Normal", icon:"fa-solid fa-user",
    tagline:"Der klassische wiederbelebte Shinobi.",
    description:"Ein vollständiger Edo Tensei ohne Elite- oder Solo-Modifikatoren. Ideal für einzelne Gefolgsleute und reguläre Beschwörungen.",
    details:["Normale HP und Jutsu Slots", "5 Creature Skills", "Keine Elite Actions"]
  },
  elite: {
    label:"Elite Edo Tensei", shortLabel:"Elite", icon:"fa-solid fa-user-shield",
    tagline:"Stärker, zäher und selbstständiger.",
    description:"Für besonders mächtige Seelen oder Anführer. Elite Edo Tensei erhalten verdoppelte Ressourcen und eine zusätzliche Aktion.",
    details:["Doppelte HP und Jutsu Slots", "8 Creature Skills", "1 Elite Action"]
  },
  solo: {
    label:"Solo Edo Tensei", shortLabel:"Solo", icon:"fa-solid fa-crown",
    tagline:"Eine einzelne Beschwörung als Bossgegner.",
    description:"Die mächtigste Variante. Nur für S-Rank-Seelen und erst verfügbar, sobald dein Edo-Tensei-Class-Mod S-Rank beherrscht.",
    details:["Dreifache HP und Jutsu Slots", "10 Creature Skills", "2 Elite Actions"]
  }
});
const ROLE_LABELS = Object.freeze({caster:"Caster", controller:"Controller", defender:"Defender", lurker:"Lurker", striker:"Striker", supporter:"Supporter"});
const dialogs = new Map();
const sheetObservers = new WeakMap();

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
  if (field instanceof HTMLInputElement && ["checkbox","radio"].includes(field.type)) return field.checked ? [field.value] : [];
  if (field.selectedOptions) return Array.from(field.selectedOptions).map(option => option.value);
  return field.value ? [field.value] : [];
}
function optionsFromConfig(config) {
  return Object.entries(config ?? {}).map(([key, data]) => {
    const labelKey = typeof data === "string" ? data : data?.label;
    return [key, labelKey ? game.i18n.localize(labelKey) : key.toUpperCase()];
  });
}
function creatorFormData(form) {
  const data = new FormDataExtended(form).object;
  data.skills = selectedValues(form, "skills");
  data.saves = selectedValues(form, "saves");
  data.blessings = selectedValues(form, "blessings");
  return data;
}
function creatorChoiceChips(values, labels, fallback = "Nichts ausgewählt") {
  if (!values?.length) return `<span class="empty">${esc(fallback)}</span>`;
  return values.map(value => `<span class="chip">${esc(labels?.[value] ?? value)}</span>`).join("");
}
function tierAvailable(actor, tier) {
  if (tier === "solo") return classModLevel(actor) >= 5;
  return Boolean(TIER_DATA[tier]);
}
function tierChooserHtml(actor) {
  const cmLevel = classModLevel(actor);
  const state = readTracker(actor);
  const cards = Object.entries(TIER_UI).map(([tier, ui]) => {
    const data = TIER_DATA[tier];
    const available = tierAvailable(actor, tier);
    const lockText = tier === "solo" && !available ? `Benötigt Class-Mod-Level 5 · Aktuell ${cmLevel}` : "";
    return `<button type="button" class="edo-tier-card tier-${tier}" data-edo-tier="${tier}" ${available ? "" : "disabled"}>
      <span class="tier-icon"><i class="${ui.icon}"></i></span>
      <span class="tier-copy">
        <span class="tier-kicker">${esc(ui.shortLabel)} · ${data.chargeCost} Unholy Charge${data.chargeCost === 1 ? "" : "s"}</span>
        <strong>${esc(ui.label)}</strong>
        <em>${esc(ui.tagline)}</em>
        <span class="tier-description">${esc(ui.description)}</span>
        <span class="tier-details">${ui.details.map(detail => `<span><i class="fas fa-check"></i>${esc(detail)}</span>`).join("")}</span>
        ${lockText ? `<span class="tier-lock"><i class="fas fa-lock"></i>${esc(lockText)}</span>` : ""}
      </span>
      <span class="tier-arrow"><i class="fas fa-chevron-right"></i></span>
    </button>`;
  }).join("");
  return `<div class="n5eb-edo-tier-picker">
    <header class="tier-picker-header">
      <div>
        <p class="eyebrow">Edo Tensei Creator</p>
        <h1>Welche Art möchtest du erstellen?</h1>
        <p>Wähle zuerst die Stärke der Beschwörung. Danach öffnet sich ein eigener, passend berechneter Creator.</p>
      </div>
      <div class="tier-picker-status">
        <span>Class Mod</span><strong>Level ${cmLevel}</strong>
        <span>Unholy Charges</span><strong>${state.chargesCurrent}/${state.chargesMax}</strong>
      </div>
    </header>
    <section class="tier-card-grid">${cards}</section>
    <footer class="tier-picker-note"><i class="fas fa-circle-info"></i><span>Normal, Elite und Solo verwenden unterschiedliche HP-, Jutsu-Slot-, Skill- und Action-Berechnungen.</span></footer>
  </div>`;
}
async function chooseEdoTier(actor) {
  return new Promise(resolve => {
    let settled = false;
    const finish = value => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    const dialog = new foundry.applications.api.DialogV2({
      window:{title:`Edo Tensei auswählen — ${actor.name}`,icon:"fa-solid fa-skull",resizable:true},
      position:{width:920,height:"auto"},
      classes:["n5eb-edo-tier-picker-window"],
      content:tierChooserHtml(actor),
      buttons:[{action:"cancel",label:"Abbrechen",icon:"fa-solid fa-xmark",callback:()=>finish(null)}],
      rejectClose:false
    });
    dialog.addEventListener("render",()=>{
      dialog.element?.querySelectorAll?.("[data-edo-tier]").forEach(button => button.addEventListener("click",async()=>{
        const tier = button.dataset.edoTier;
        if (!tierAvailable(actor,tier)) return;
        finish(tier);
        await dialog.close();
      }));
    });
    dialog.addEventListener("close",()=>finish(null),{once:true});
    dialog.render({force:true});
  });
}
function creatorPreviewHtml(actor, formData, blessingDocs) {
  const cmLevel = classModLevel(actor);
  const blessingMap = new Map(blessingDocs.map(doc => [doc.id, doc]));
  const chosenBlessings = (formData.blessings ?? []).map(id => blessingMap.get(id)).filter(Boolean);
  const saveLabels = Object.fromEntries(optionsFromConfig(CONFIG.DND5E.abilities));
  const skillLabels = Object.fromEntries(optionsFromConfig(CONFIG.DND5E.skills));
  const tier = String(formData.tier ?? "standard").toLowerCase();
  const tierData = TIER_DATA[tier] ?? TIER_DATA.standard;
  const tierUi = TIER_UI[tier] ?? TIER_UI.standard;
  const rank = String(formData.rank ?? "d").toLowerCase();
  const role = String(formData.role ?? "striker").toLowerCase();
  const maxSkills = 5 + tierData.extraSkills;
  const blessingCost = chosenBlessings.reduce((sum, doc) => sum + effectiveBlessingCost(doc, rank), 0);

  let calc = null;
  const errors = [];
  if ((formData.saves ?? []).length > 3) errors.push("Es dürfen höchstens 3 Saving Throws ausgewählt werden.");
  if ((formData.skills ?? []).length > maxSkills) errors.push(`${tierUi.shortLabel} Edo Tensei dürfen höchstens ${maxSkills} Creature Skills besitzen.`);
  if (blessingCost > 5) errors.push(`Die ausgewählten Unholy Blessings kosten ${blessingCost}; maximal erlaubt sind 5.`);
  try {
    calc = calculateEdoTensei({...formData, classModLevel: cmLevel}, chosenBlessings);
  } catch (err) {
    errors.push(err?.message ?? String(err));
  }
  const error = errors[0] ?? "";

  const headerName = String(formData.name || tierUi.label).trim() || tierUi.label;
  const rankLabel = RANK_DATA[rank]?.label ?? rank;
  const stat = (label, value, hint = "") => `<div class="preview-stat"><span>${esc(label)}</span><strong>${esc(value)}</strong>${hint ? `<small>${esc(hint)}</small>` : ""}</div>`;
  const abilityCard = (key, value) => `<div class="ability-card"><span>${key.toUpperCase()}</span><strong>${esc(value ?? "—")}</strong></div>`;

  const statsHtml = calc ? [
    stat("HP", calc.hitPoints, `${tierData.hp}× Basis`),
    stat("AC", calc.armorClass),
    stat("Bewegung", `${calc.speed} ft.`),
    stat("Stufe", calc.level, rankLabel),
    stat("Jutsu Slots", calc.jutsuSlots, `${tierData.slots}× Basis`),
    stat("Summon DC", calc.automaticChecks ? "Auto" : calc.summoningDC)
  ].join("") : [
    stat("HP", "—"), stat("AC", "—"), stat("Bewegung", "—"), stat("Stufe", RANK_DATA[rank]?.level ?? "—"), stat("Jutsu Slots", "—"), stat("Summon DC", "—")
  ].join("");

  const abilityHtml = ["str","dex","con","int","wis","cha"].map(key => abilityCard(key, formData[key] ?? 16)).join("");
  const summaryHtml = [
    stat("DNA DC", calc ? (calc.automaticChecks ? "Auto" : calc.dnaDC) : "—"),
    stat("Blessings", `${blessingCost}/5`, `${chosenBlessings.length} gewählt`),
    stat("Elite Actions", calc ? calc.eliteActions : tierData.eliteActions),
    stat("Skills", `${(formData.skills ?? []).length}/${maxSkills}`),
    stat("Rolle", ROLE_LABELS[role] ?? role),
    stat("Kosten", `${tierData.chargeCost} Charge${tierData.chargeCost === 1 ? "" : "s"}`)
  ].join("");

  const blessingList = chosenBlessings.length
    ? chosenBlessings.map(doc => `<div class="preview-list-row"><strong>${esc(doc.name)}</strong><span>Kosten ${effectiveBlessingCost(doc, rank)}</span></div>`).join("")
    : `<div class="preview-list-row empty"><span>Keine Unholy Blessings ausgewählt.</span></div>`;

  return `<div class="creator-preview-card tier-${tier}" data-preview-valid="${error ? 0 : 1}">
    <section class="preview-hero">
      <div>
        <p class="eyebrow">Live-Vorschau · ${esc(tierUi.shortLabel)}</p>
        <h2>${esc(headerName)}</h2>
        <div class="subline">${esc(String(formData.clan || "Kein Clan"))} · ${esc(rankLabel)} · ${esc(ROLE_LABELS[role] ?? role)}</div>
      </div>
      <div class="hero-badge"><i class="${tierUi.icon}"></i><span>${esc(tierUi.shortLabel)}</span></div>
    </section>
    <section class="preview-tier-summary">
      <span><strong>${tierData.hp}×</strong> HP</span>
      <span><strong>${tierData.slots}×</strong> Slots</span>
      <span><strong>${tierData.eliteActions}</strong> Elite Actions</span>
      <span><strong>${maxSkills}</strong> Skills</span>
    </section>
    ${error ? `<div class="preview-error"><i class="fas fa-triangle-exclamation"></i><span>${esc(error)}</span></div>` : ""}
    <section class="preview-stat-grid">${statsHtml}</section>
    <section class="preview-ability-grid">${abilityHtml}</section>
    <section class="preview-summary-grid">${summaryHtml}</section>
    <section class="preview-block">
      <header><span>Saving Throws</span><strong>${(formData.saves ?? []).length}/3</strong></header>
      <div class="chip-wrap">${creatorChoiceChips(formData.saves ?? [], saveLabels, "Keine Saving Throws ausgewählt")}</div>
    </section>
    <section class="preview-block">
      <header><span>Creature Skills</span><strong>${(formData.skills ?? []).length}/${maxSkills}</strong></header>
      <div class="chip-wrap">${creatorChoiceChips(formData.skills ?? [], skillLabels, "Keine Creature Skills ausgewählt")}</div>
    </section>
    <section class="preview-block preview-list-block">
      <header><span>Unholy Blessings</span><strong>${blessingCost}/5</strong></header>
      <div class="preview-list">${blessingList}</div>
    </section>
  </div>`;
}
function updateCreatorPreview(dialog, actor, blessingDocs) {
  const root = dialog.element;
  const form = root?.querySelector?.("[data-edo-creator-form]");
  const preview = root?.querySelector?.("[data-edo-creator-preview]");
  const createButton = root?.querySelector?.('button[data-action="create"]');
  if (!form || !preview) return;
  const data = creatorFormData(form);
  preview.innerHTML = creatorPreviewHtml(actor, data, blessingDocs);
  const tier = String(data.tier ?? "standard");
  const blessingMap = new Map(blessingDocs.map(doc => [doc.id, doc]));
  const selectedBlessings = (data.blessings ?? []).map(id=>blessingMap.get(id)).filter(Boolean);
  const currentRank = String(data.rank ?? "d");
  const blessingCost = selectedBlessings.reduce((sum,doc)=>sum+effectiveBlessingCost(doc,currentRank),0);
  root.querySelectorAll?.("[data-blessing-id]").forEach(row => {
    const doc = blessingMap.get(row.dataset.blessingId);
    const badge = row.querySelector(".check-badge");
    if (doc && badge) badge.textContent = `${effectiveBlessingCost(doc,currentRank)} P`;
  });
  root.querySelector?.("[data-save-count]")?.replaceChildren(document.createTextNode(`${data.saves.length}/3`));
  root.querySelector?.("[data-skill-count]")?.replaceChildren(document.createTextNode(`${data.skills.length}/${5 + (TIER_DATA[tier]?.extraSkills ?? 0)}`));
  root.querySelector?.("[data-blessing-count]")?.replaceChildren(document.createTextNode(`${blessingCost}/5`));
  const valid = preview.querySelector('[data-preview-valid="1"]');
  if (createButton) createButton.disabled = !Boolean(valid);
}
function enforceCreatorChoiceLimit(form, blessingDocs, event) {
  const target = event?.target;
  if (!(target instanceof HTMLInputElement) || target.type !== "checkbox" || !target.checked) return;
  const data = creatorFormData(form);
  const tier = String(data.tier ?? "standard");
  if (target.name === "saves" && data.saves.length > 3) {
    target.checked = false;
    ui.notifications.warn("Du kannst höchstens 3 Saving Throws auswählen.");
  }
  if (target.name === "skills") {
    const max = 5 + (TIER_DATA[tier]?.extraSkills ?? 0);
    if (data.skills.length > max) {
      target.checked = false;
      ui.notifications.warn(`${TIER_UI[tier]?.shortLabel ?? "Dieses"} Edo Tensei kann höchstens ${max} Creature Skills besitzen.`);
    }
  }
  if (target.name === "blessings") {
    const rank = String(form.elements.namedItem("rank")?.value ?? "d");
    const map = new Map(blessingDocs.map(doc => [doc.id,doc]));
    const selected = selectedValues(form,"blessings").map(id=>map.get(id)).filter(Boolean);
    const cost = selected.reduce((sum,doc)=>sum+effectiveBlessingCost(doc,rank),0);
    if (cost > 5) {
      target.checked = false;
      ui.notifications.warn("Unholy Blessings dürfen zusammen höchstens 5 Punkte kosten.");
    }
  }
}
function activateCreator(dialog, actor, blessingDocs) {
  const root = dialog.element;
  const form = root?.querySelector?.("[data-edo-creator-form]");
  if (!form) return;
  const refresh = () => {
    const living = form.elements.namedItem("vessel")?.value === "living";
    form.querySelector(".living-modifier")?.classList.toggle("is-hidden", !living);
    updateCreatorPreview(dialog, actor, blessingDocs);
  };
  form.addEventListener("input", refresh);
  form.addEventListener("change",event=>{
    enforceCreatorChoiceLimit(form,blessingDocs,event);
    refresh();
  });
  refresh();
}
function checklistOption({name,value,label,subtext="",disabled=false,badge="",dataAttributes=""}) {
  return `<label class="creator-check-option ${disabled ? "disabled" : ""}" ${dataAttributes}>
    <input type="checkbox" name="${esc(name)}" value="${esc(value)}" ${disabled ? "disabled" : ""}>
    <span class="check-box"><i class="fas fa-check"></i></span>
    <span class="check-copy"><strong>${esc(label)}</strong>${subtext ? `<small>${esc(subtext)}</small>` : ""}</span>
    ${badge ? `<span class="check-badge">${esc(badge)}</span>` : ""}
  </label>`;
}
function creatorHtml(actor, blessingDocs, fixedTier) {
  const cmLevel = classModLevel(actor);
  const tier = String(fixedTier ?? "standard");
  const tierData = TIER_DATA[tier] ?? TIER_DATA.standard;
  const tierUi = TIER_UI[tier] ?? TIER_UI.standard;
  const rankKeys = tier === "solo" ? ["s"] : RANK_ORDER.slice(0, cmLevel);
  const rankOptions = rankKeys.map(rank => `<option value="${rank}">${RANK_DATA[rank].label} · Level ${RANK_DATA[rank].level}</option>`).join("");
  const abilities = optionsFromConfig(CONFIG.DND5E.abilities).map(([key,label]) => `<option value="${key}">${esc(label)}</option>`).join("");
  const saveOptions = optionsFromConfig(CONFIG.DND5E.abilities).map(([key,label]) => checklistOption({name:"saves",value:key,label,subtext:key.toUpperCase()})).join("");
  const skillOptions = optionsFromConfig(CONFIG.DND5E.skills).map(([key,label]) => checklistOption({name:"skills",value:key,label,subtext:key.toUpperCase()})).join("");
  const blessingOptions = blessingDocs.slice().sort((a,b) => Number(moduleFlag(a,"blessingCost"))-Number(moduleFlag(b,"blessingCost")) || a.name.localeCompare(b.name)).map(doc => {
    const initialRank = tier === "solo" ? "s" : "d";
    const cost = effectiveBlessingCost(doc, initialRank);
    const minimum = moduleFlag(doc,"minimumTier") ?? "standard";
    const allowed = tierMeets(tier, minimum);
    const requirement = allowed ? `Unholy Blessing${minimum === "standard" ? "" : ` · ab ${TIER_UI[minimum]?.shortLabel ?? minimum}`}` : `Benötigt ${TIER_UI[minimum]?.shortLabel ?? minimum}`;
    return checklistOption({name:"blessings",value:doc.id,label:doc.name,subtext:requirement,disabled:!allowed,badge:`${cost} P`,dataAttributes:`data-blessing-id="${doc.id}"`});
  }).join("");
  const scoreInputs = ["str","dex","con","int","wis","cha"].map(a => `<label class="ability-input"><span>${a.toUpperCase()}</span><input type="number" name="${a}" value="16" min="1" max="26"></label>`).join("");
  const maxSkills = 5 + tierData.extraSkills;

  return `<form class="n5eb-edo-creator-form n5eb-edo-creator-shell tier-${tier}" data-edo-creator-form>
    <input type="hidden" name="tier" value="${tier}">
    <section class="creator-left">
      <div class="creator-topline">
        <div class="creator-heading">
          <span class="creator-tier-icon"><i class="${tierUi.icon}"></i></span>
          <div>
            <p class="eyebrow">N5eB · ${esc(tierUi.shortLabel)} Creator</p>
            <h1>${esc(tierUi.label)} erstellen</h1>
            <p class="creator-note">${esc(tierUi.description)}</p>
          </div>
        </div>
        <div class="creator-counter"><strong>${tierData.chargeCost}</strong><span>Unholy Charge${tierData.chargeCost === 1 ? "" : "s"}</span></div>
      </div>

      <section class="creator-tier-banner">
        <span><strong>${tierData.hp}×</strong> HP</span>
        <span><strong>${tierData.slots}×</strong> Jutsu Slots</span>
        <span><strong>${maxSkills}</strong> Skills</span>
        <span><strong>${tierData.eliteActions}</strong> Elite Actions</span>
      </section>

      <section class="creator-card">
        <header><h3>1. Grunddaten</h3><span>Identität und Berechnung</span></header>
        <div class="creator-grid creator-grid-main">
          <label><span>Name</span><input name="name" value="${esc(tierUi.label)}" required></label>
          <label><span>Clan / Lineage</span><input name="clan" placeholder="Optional"></label>
          <label><span>Rank</span><select name="rank">${rankOptions}</select></label>
          <label><span>Primary Role</span><select name="role">${Object.entries(ROLE_LABELS).map(([k,v])=>`<option value="${k}" ${k==='striker'?'selected':''}>${v}</option>`).join('')}</select></label>
          <label><span>Toughness</span><input type="number" name="toughness" value="10" min="0"></label>
          <label><span>Defensive Ability</span><select name="defenseAbility">${abilities.replace('value="dex"','value="dex" selected')}</select></label>
          <label><span>Jutsu Ability</span><select name="jutsuAbility">${abilities.replace('value="int"','value="int" selected')}</select></label>
          <label><span>Vessel</span><select name="vessel"><option value="intact">Intact</option><option value="decayed">Rotting / Decayed (+3 DC)</option><option value="living">Living Host (-1 to -5 DC)</option></select></label>
          <label class="living-modifier"><span>Living Host Modifier</span><input type="number" name="livingModifier" value="1" min="1" max="5"></label>
        </div>
      </section>

      <section class="creator-card">
        <header><h3>2. Ability Scores</h3><span>Base 16</span></header>
        <p class="helper-text">C/B/A/S-Rank verteilen insgesamt 6 / 12 / 18 / 24 zusätzliche Punkte. Die Höchstwerte liegen bei 20 / 22 / 24 / 26.</p>
        <div class="ability-grid modern">${scoreInputs}</div>
      </section>

      <section class="creator-card selection-card">
        <header><h3>3. Saving Throws</h3><span data-save-count>0/3</span></header>
        <p class="helper-text">Wähle bis zu drei Saving-Throw-Proficiencies.</p>
        <div class="creator-check-grid saves">${saveOptions}</div>
      </section>

      <section class="creator-card selection-card">
        <header><h3>4. Creature Skills</h3><span data-skill-count>0/${maxSkills}</span></header>
        <p class="helper-text">${esc(tierUi.shortLabel)} Edo Tensei können bis zu ${maxSkills} Skills erhalten. Auswahlen nach dem fünften Skill erhalten automatisch Mastery.</p>
        <div class="creator-check-list skills">${skillOptions}</div>
      </section>

      <section class="creator-card selection-card">
        <header><h3>5. Unholy Blessings</h3><span data-blessing-count>0/5</span></header>
        <p class="helper-text">Die Gesamtkosten dürfen 5 Punkte nicht überschreiten. Nicht verfügbare Blessings werden ausgegraut.</p>
        <div class="creator-check-list blessings">${blessingOptions}</div>
      </section>
    </section>
    <aside class="creator-right" data-edo-creator-preview></aside>
  </form>`;
}

async function openEdoCreator(actor, requestedTier=null) {
  actor = actorFromContext(actor);
  if (!actor || !getClassMod(actor)) return ui.notifications.warn("Select an Actor that owns the Edo Tensei Class Mod.");
  if (!actor.isOwner) return ui.notifications.warn("You do not own this Actor.");

  const tier = requestedTier ?? await chooseEdoTier(actor);
  if (!tier) return null;
  if (!tierAvailable(actor,tier)) {
    ui.notifications.warn("Solo Edo Tensei require Edo Tensei Class Mod level 5 and an S-Rank soul.");
    return null;
  }

  const docs = await getPackDocuments();
  const blessings = docs.filter(doc => moduleFlag(doc,"edoBlessing"));
  const tierUi = TIER_UI[tier] ?? TIER_UI.standard;

  const result = await new Promise(resolve => {
    let settled = false;
    const finish = value => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    const dialog = new foundry.applications.api.DialogV2({
      window:{title:`${tierUi.label} erstellen — ${actor.name}`,icon:tierUi.icon,resizable:true},
      position:{width:1320,height:"auto"},
      classes:["n5eb-edo-creator-window",`tier-${tier}`],
      content:creatorHtml(actor, blessings, tier),
      buttons:[
        {action:"back",label:"Andere Art wählen",icon:"fa-solid fa-arrow-left",callback:()=>finish("back")},
        {action:"create",label:`${tierUi.shortLabel} Edo erstellen`,icon:"fa-solid fa-wand-magic-sparkles",default:true,callback:async(event,button)=>{
          const form = button.form ?? dialog.element?.querySelector?.("[data-edo-creator-form]");
          const data = creatorFormData(form);
          try {
            finish(await createEdoTensei(actor, data, blessings));
          } catch (error) {
            console.error(`${MODULE_ID} | Edo Tensei creation failed`, error);
            ui.notifications.error(error.message);
            return false;
          }
        }},
        {action:"cancel",label:"Abbrechen",icon:"fa-solid fa-xmark",callback:()=>finish(null)}
      ],
      rejectClose:false
    });
    dialog.addEventListener("render",()=>activateCreator(dialog, actor, blessings));
    dialog.addEventListener("close",()=>finish(null),{once:true});
    dialog.render({force:true});
  });

  if (result === "back") return openEdoCreator(actor,null);
  return result;
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

function renderRoot(app, html) {
  if (html instanceof HTMLElement) return html;
  if (html?.[0] instanceof HTMLElement) return html[0];
  if (app?.element instanceof HTMLElement) return app.element;
  if (app?.element?.[0] instanceof HTMLElement) return app.element[0];
  return null;
}

function actorFromSheetApplication(app) {
  const actor = app?.actor ?? app?.document;
  return actor?.documentName === "Actor" ? actor : null;
}

function buildSummonerStrip(actor) {
  const state = readTracker(actor);
  const active = activeEdoFor(actor).length;
  const section = document.createElement("section");
  section.className = "n5eb-edo-tracker-strip";
  section.dataset.edoStrip = "true";
  section.innerHTML = `<button type="button" class="tracker-title" data-action="open-edo-tracker"><i class="fas fa-skull"></i> Edo Tensei</button><div class="tracker-mini"><span>Unholy Charges</span><strong>${state.chargesCurrent}/${state.chargesMax}</strong></div><div class="tracker-mini"><span>Active Edo</span><strong>${active}/${maxActive(actor)}</strong></div><button type="button" class="create-edo" data-action="create-edo"><i class="fas fa-plus"></i> Create Edo Tensei</button>`;
  section.querySelector('[data-action="open-edo-tracker"]')?.addEventListener("click", event => {
    event.preventDefault();
    openTracker(actor);
  });
  section.querySelector('[data-action="create-edo"]')?.addEventListener("click", event => {
    event.preventDefault();
    openEdoCreator(actor);
  });
  return section;
}

function injectSummonerStrip(root, actor) {
  if (!root?.querySelector || root.querySelector("[data-edo-strip]")) return false;
  const spellsTab = root.matches?.('.tab[data-tab="spells"]')
    ? root
    : root.querySelector('.tab[data-tab="spells"]');
  const overview = root.matches?.(".jutsu-casting-overview")
    ? root
    : (spellsTab?.querySelector(".jutsu-casting-overview") ?? root.querySelector(".jutsu-casting-overview"));
  const target = overview ?? spellsTab;
  if (!target) return false;
  const section = buildSummonerStrip(actor);
  if (overview?.parentElement) overview.before(section);
  else target.prepend(section);
  return true;
}

function injectGeneratedEdoStrip(root, actor) {
  const profile = actor?.getFlag?.(MODULE_ID, PROFILE_FLAG);
  if (!profile || !root?.querySelector || root.querySelector("[data-edo-actor-strip]")) return false;
  const body = root.querySelector(".sheet-body") ?? root.querySelector(".tab-body") ?? root;
  if (!body?.prepend) return false;
  const calc = profile.calculations ?? {};
  const section = document.createElement("section");
  section.className = "n5eb-edo-actor-strip";
  section.dataset.edoActorStrip = "true";
  section.innerHTML = `<div><strong><i class="fas fa-skull"></i> Generated Edo Tensei</strong><span>${esc(RANK_DATA[profile.rank]?.label ?? profile.rank)} · ${esc(TIER_DATA[profile.tier]?.label ?? profile.tier)} · AC ${calc.armorClass ?? "?"} · HP ${calc.hitPoints ?? "?"}</span></div><div class="edo-actor-actions"><button type="button" data-action="recalculate-edo"><i class="fas fa-calculator"></i> Recalculate</button><button type="button" data-action="toggle-edo"><i class="fas ${profile.active ? "fa-door-open" : "fa-hand-sparkles"}"></i> ${profile.active ? "Return" : "Summon"}</button></div>`;
  section.querySelector('[data-action="recalculate-edo"]')?.addEventListener("click", event => {
    event.preventDefault();
    recalculateEdoActor(actor);
  });
  section.querySelector('[data-action="toggle-edo"]')?.addEventListener("click", event => {
    event.preventDefault();
    profile.active ? setEdoActive(actor, false) : performSummoningCheck(actor);
  });
  body.prepend(section);
  return true;
}

function injectHeaderQuickButton(app, actor) {
  const root = renderRoot(app, app?.element);
  if (!root?.querySelector) return false;
  const header = root.querySelector(".window-header");
  if (!header) return false;
  const controls = header.querySelector(".window-controls") ?? header;
  const isSummoner = Boolean(getClassMod(actor));
  const profile = actor.getFlag?.(MODULE_ID, PROFILE_FLAG);
  const key = isSummoner ? "create" : profile ? "toggle" : null;
  if (!key || controls.querySelector(`[data-edo-header-action="${key}"]`)) return false;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "header-control n5eb-edo-header-quick";
  button.dataset.edoHeaderAction = key;
  if (isSummoner) {
    button.title = "Create Edo Tensei";
    button.setAttribute("aria-label", "Create Edo Tensei");
    button.innerHTML = '<i class="fas fa-skull"></i><i class="fas fa-plus edo-plus"></i>';
    button.addEventListener("click", event => { event.preventDefault(); openEdoCreator(actor); });
  } else {
    button.title = profile.active ? "Return Edo Tensei" : "Summon Edo Tensei";
    button.setAttribute("aria-label", button.title);
    button.innerHTML = `<i class="fas ${profile.active ? "fa-door-open" : "fa-hand-sparkles"}"></i>`;
    button.addEventListener("click", event => {
      event.preventDefault();
      profile.active ? setEdoActive(actor, false) : performSummoningCheck(actor);
    });
  }
  controls.prepend(button);
  return true;
}

function observeActorSheet(app, actor) {
  const root = renderRoot(app, app?.element);
  if (!root || sheetObservers.has(app) || typeof MutationObserver === "undefined") return;
  const observer = new MutationObserver(() => {
    if (getClassMod(actor)) injectSummonerStrip(root, actor);
    else injectGeneratedEdoStrip(root, actor);
    injectHeaderQuickButton(app, actor);
  });
  observer.observe(root, {childList:true, subtree:true});
  sheetObservers.set(app, observer);
}

function renderEdoSheetRuntime(app, html) {
  const actor = actorFromSheetApplication(app);
  if (!actor) return;
  const isSummoner = Boolean(getClassMod(actor));
  const isGenerated = Boolean(actor.getFlag?.(MODULE_ID, PROFILE_FLAG));
  if (!isSummoner && !isGenerated) return;
  const root = renderRoot(app, html);
  if (isSummoner) {
    ensureTracker(actor).catch(error => console.error(`${MODULE_ID} | Could not initialize Edo Tensei tracker`, error));
    globalThis.N5eBClassMods?.syncClassModArts?.(actor)?.catch?.(error =>
      console.error(`${MODULE_ID} | Could not update Edo Tensei Arts values`, error)
    );
    injectSummonerStrip(root, actor);
  } else injectGeneratedEdoStrip(root, actor);
  injectHeaderQuickButton(app, actor);
  queueMicrotask(() => {
    const liveRoot = renderRoot(app, app?.element);
    if (isSummoner) injectSummonerStrip(liveRoot, actor);
    else injectGeneratedEdoStrip(liveRoot, actor);
    injectHeaderQuickButton(app, actor);
    observeActorSheet(app, actor);
  });
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
Hooks.on("renderActorSheet",renderEdoSheetRuntime);
Hooks.on("renderCharacterActorSheet",renderEdoSheetRuntime);
Hooks.on("renderNPCActorSheet",renderEdoSheetRuntime);
Hooks.on("renderApplicationV2",renderEdoSheetRuntime);
Hooks.on("closeApplicationV2",app=>{
  sheetObservers.get(app)?.disconnect?.();
  sheetObservers.delete(app);
});
Hooks.on("getHeaderControlsApplicationV2",(app,controls)=>{
  const actor = actorFromSheetApplication(app);
  if (!actor) return;
  if (getClassMod(actor)) {
    const state = readTracker(actor);
    controls.unshift({action:"n5ebEdoTracker",label:`Edo Tracker ${state.chargesCurrent}/${state.chargesMax}`,icon:"fa-solid fa-skull",classes:"n5eb-edo-tracker-button",visible:true,ownership:"OWNER",onClick:()=>openTracker(actor)});
    controls.unshift({action:"n5ebCreateEdo",label:"Create Edo Tensei",icon:"fa-solid fa-plus",classes:"n5eb-edo-create-button",visible:true,ownership:"OWNER",onClick:()=>openEdoCreator(actor)});
    return;
  }
  const profile = actor.getFlag?.(MODULE_ID,PROFILE_FLAG);
  if (!profile) return;
  controls.unshift({action:"n5ebRecalculateEdo",label:"Recalculate Edo",icon:"fa-solid fa-calculator",classes:"n5eb-edo-recalculate-button",visible:true,ownership:"OWNER",onClick:()=>recalculateEdoActor(actor)});
  controls.unshift({action:"n5ebToggleEdo",label:profile.active?"Return Edo Tensei":"Summon Edo Tensei",icon:profile.active?"fa-solid fa-door-open":"fa-solid fa-hand-sparkles",classes:"n5eb-edo-summon-button",visible:true,ownership:"OWNER",onClick:()=>profile.active?setEdoActive(actor,false):performSummoningCheck(actor)});
});
Hooks.on("createItem",async(item,options,userId)=>{
  if (options?.[INTERNAL] || userId !== game.user.id || item.parent?.documentName !== "Actor") return;
  const actor = item.parent;
  if (item.type === "classmod" && item.system?.identifier === CLASSMOD_ID) await ensureTracker(actor);
});
Hooks.on("updateItem",async(item,changes,options,userId)=>{
  if (options?.[INTERNAL] || userId !== game.user.id || item.parent?.documentName !== "Actor") return;
  if (item.type === "classmod" && item.system?.identifier === CLASSMOD_ID) await ensureTracker(item.parent);
});
Hooks.on("updateActor",(actor,changes,options,userId)=>{
  if (options?.[INTERNAL] || userId !== game.user.id || !getClassMod(actor)) return;
  globalThis.N5eBClassMods?.syncClassModArts?.(actor)?.catch?.(error => console.error(`${MODULE_ID} | Edo Tensei Arts sync failed`, error));
  refreshTracker(actor);
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
