const MODULE_ID = "n5eb-classmod-library";
const PACK_NAME = "n5eb-custom-class-mods";
const PACK_COLLECTION = `world.${PACK_NAME}`;
const CONTENT_VERSION = "0.13.15";
const KAMA_REWRITE_STEP = 5;
const KAMA_TEMP_HP_FLAG = "kamaTemporaryHitPoints";
const KAMA_TRACKER_FLAG = "kamaTracker";
const KAMA_TRACKER_VERSION = 1;
const KAMA_ATTACK_FORMULA = "floor(@details.level/2)+@classmods.kama-seal.levels+@prof";
const KAMA_SAVE_FORMULA = "10+floor(@details.level/2)+@prof";
const FTG_ATTACK_FORMULA = "2*@abilities.dex.mod+2*@classmods.flying-thunder-god.levels";
const FTG_SAVE_FORMULA = "10+2*@abilities.dex.mod+floor(@details.level/4)";
const KAMA_INTERNAL_OPTION = MODULE_ID;
const TENSEIGAN_TRACKER_FLAG = "tenseiganTracker";
const TENSEIGAN_TRACKER_VERSION = 1;
const TENSEIGAN_ATTACK_FORMULA = "floor(@details.level/2)+@classmods.tenseigan.levels+@prof";
const TENSEIGAN_SAVE_FORMULA = "10+floor(@details.level/2)+@prof";
const TENSEIGAN_STRAIN_MAX = 30;
const TENSEIGAN_CHAKRA_BY_LEVEL = Object.freeze({1:75, 2:150, 3:250, 4:350, 5:500});
const TENSEIGAN_FALLBACK_ICON = `modules/${MODULE_ID}/assets/tenseigan-eye.png`;
const SEALED_BEAST_TRACKER_FLAG = "sealedBeastTracker";
const SEALED_BEAST_TRACKER_VERSION = 1;
const SEALED_BEAST_ATTACK_FORMULA = "2*@prof+@classmods.sealed-beast-redux.levels";
const SEALED_BEAST_SAVE_FORMULA = "12+@classmods.sealed-beast-redux.levels+@prof";
const EDO_TENSEI_ATTACK_FORMULA = "@classmods.edo-tensei.levels+2*@prof";
const EDO_TENSEI_SAVE_FORMULA = "12+@prof+floor(@details.level/2)";
const SEALED_BEAST_AWAKENING_BY_LEVEL = Object.freeze({1:45, 2:110, 3:175, 4:220, 5:275});
const TENSEIGAN_LEGACY_ICONS = new Set([
  "icons/magic/perception/eye-ringed-glow-angry-small-blue.webp",
  "icons/magic/light/explosion-star-glow-blue.webp",
  "icons/magic/control/debuff-energy-hold-levitate-blue.webp",
  "icons/magic/life/heart-cross-blue.webp",
  "icons/magic/light/aura-hand-blue.webp",
  "icons/magic/light/orbs-smoke-pink.webp",
  "icons/magic/perception/eye-ringed-glow-angry-large-blue.webp",
  "icons/magic/light/explosion-star-blue.webp"
]);
const CLASS_MOD_IDENTIFIERS = new Set(["flying-thunder-god", "kama-seal", "tenseigan", "sealed-beast-redux", "superior-shinobi", "edo-tensei"]);

const SEAL_TYPE_KEYS = Object.freeze([
  "all-rounder", "absorber", "assault-type", "tank-type", "speed-type", "sensor-type", "white-kama-seal"
]);

/**
 * N5eB 3.1.0 keeps choices from earlier ItemChoice levels in the current pool.
 * Patch the flow for this library so non-repeatable selections are not offered again.
 */
function patchClassModItemChoiceFlow() {
  const Flow = globalThis.dnd5e?.applications?.advancement?.ItemChoiceFlow;
  const prototype = Flow?.prototype;
  if (!prototype || prototype.__n5ebClassModNoRepeatPatch) return Boolean(prototype);
  const original = prototype._prepareContentContext;
  if (typeof original !== "function") return false;

  Object.defineProperty(prototype, "__n5ebClassModNoRepeatPatch", {value:true, configurable:false});
  prototype._prepareContentContext = async function(context, options) {
    const result = await original.call(this, context, options);
    try {
      const identifier = this.item?.system?.identifier ?? this.advancement?.item?.system?.identifier;
      if (!CLASS_MOD_IDENTIFIERS.has(identifier)) return result;

      const level = Number(this.level ?? 0);
      const levelConfig = this.advancement?.configuration?.choices?.[this.level]
        ?? this.advancement?.configuration?.choices?.[String(this.level)];
      if (!level || levelConfig?.replacement) return result;

      const priorSelections = new Set();
      for (const [selectedLevel, selectedItems] of Object.entries(this.advancement?.value?.added ?? {})) {
        if (Number(selectedLevel) >= level) continue;
        for (const uuid of Object.values(selectedItems ?? {})) if (uuid) priorSelections.add(uuid);
      }
      if (!priorSelections.size) return result;

      const poolByUuid = new Map((this.pool ?? []).map(item => [item.flags?.n5eb?.sourceId ?? item.uuid, item]));
      const sections = Array.from(context.sections ?? []);
      for (const section of sections) {
        if (!section?.isCurrentLevel || !Array.isArray(section.items)) continue;
        section.items = section.items.filter(entry => {
          if (entry.checked || !priorSelections.has(entry.uuid)) return true;
          const source = poolByUuid.get(entry.uuid);
          return Boolean(source?.system?.prerequisites?.repeatable || source?.flags?.[MODULE_ID]?.repeatable);
        });
      }
      context.sections = sections;
    } catch (error) {
      console.warn(`${MODULE_ID} | Could not filter previously selected Class Mod choices`, error);
    }
    return result;
  };
  return true;
}

Hooks.once("init", () => {
  patchClassModItemChoiceFlow();
  game.settings.register(MODULE_ID, "contentVersion", {
    name: "Installed Class Mod Content Version",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });
  game.settings.register(MODULE_ID, "autoSync", {
    name: "Automatically update the Class Mod compendium",
    hint: "Synchronizes module-managed entries whenever the bundled content version changes.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
});

Hooks.once("ready", async () => {
  patchClassModItemChoiceFlow();
  globalThis.N5eBClassMods = Object.freeze({
    sync: (options={}) => syncLibrary({force: true, ...options}),
    open: openLibrary,
    collection: PACK_COLLECTION,
    toggleKama,
    openKamaTracker,
    getKamaTracker: readKamaTracker,
    setKamaTracker: updateKamaTracker,
    syncKamaRewrite,
    syncResonanceDisruption,
    syncSealEvolution,
    refreshKamaEffect,
    syncClassModArts: syncClassModArtsForActor,
    toggleTenseigan,
    toggleCelestialChakraMode,
    openTenseiganTracker,
    getTenseiganTracker: readTenseiganTracker,
    setTenseiganTracker: updateTenseiganTracker,
    syncCelestialStrain: syncCelestialStrainEffect,
    openSealedBeastTracker,
    getSealedBeastTracker: readSealedBeastTracker,
    setSealedBeastTracker: updateSealedBeastTracker,
    toggleDormantBeast,
    setSealedBeastFrenzy,
    rollDesperateRage,
    clearSealedBeastTransformation
  });
  globalThis.SyncN5eBClassMods = () => syncLibrary({force: true});

  if (game.system.id !== "n5eb") {
    if (game.user.isGM) ui.notifications.warn("N5eB Class Mod Library is intended for the n5eb system only.");
    return;
  }

  if (game.user.isGM) {
    const installed = game.settings.get(MODULE_ID, "contentVersion");
    if (game.settings.get(MODULE_ID, "autoSync") && installed !== CONTENT_VERSION) {
      await syncLibrary({force: true, notify: true});
    }
    await migrateExistingClassModActors();
  }
});

async function loadContent() {
  const index = await foundry.utils.fetchJsonWithTimeout(`modules/${MODULE_ID}/data/index.json`);
  const bundles = await Promise.all(index.files.map(file =>
    foundry.utils.fetchJsonWithTimeout(`modules/${MODULE_ID}/data/${file}`)
  ));
  const folders = bundles.flatMap(bundle => bundle.folders ?? []);
  const items = bundles.flatMap(bundle => bundle.items ?? []);
  for (const item of items) {
    if (!item.img) item.img = item.type === "classmod" ? "icons/svg/book.svg" : "icons/svg/item-bag.svg";
    for (const effect of item.effects ?? []) if (!effect.img) effect.img = item.img;
  }
  return {folders, items};
}

async function ensurePack() {
  let pack = game.packs.get(PACK_COLLECTION);
  if (pack) return pack;
  const CollectionClass = foundry.documents?.collections?.CompendiumCollection ?? globalThis.CompendiumCollection;
  if (!CollectionClass?.createCompendium) throw new Error("Foundry CompendiumCollection.createCompendium API was not found.");
  pack = await CollectionClass.createCompendium({
    type: "Item",
    label: "N5eB Custom Class Mods",
    name: PACK_NAME,
    package: "world"
  });
  return pack;
}

async function syncLibrary({force=false, notify=false}={}) {
  if (!game.user.isGM) return ui.notifications.warn("Only a GM can synchronize the Class Mod compendium.");
  if (game.system.id !== "n5eb") return ui.notifications.error("This library requires the N5eB system.");
  const installed = game.settings.get(MODULE_ID, "contentVersion");
  if (!force && installed === CONTENT_VERSION) return game.packs.get(PACK_COLLECTION);

  try {
    const pack = await ensurePack();
    await pack.configure({locked: false, private: false});
    const {folders, items} = await loadContent();
    const desiredItemIds = new Set(items.map(item => item._id));
    const desiredFolderIds = new Set(folders.map(folder => folder._id));
    const FolderClass = CONFIG.Folder?.documentClass ?? foundry.documents?.Folder ?? globalThis.Folder;
    if (!FolderClass) throw new Error("Foundry Folder document class was not found.");

    const folderCollection = pack.folders;
    const packFolders = folderCollection ? Array.from(folderCollection) : [];
    const obsoleteSuperiorFolders = packFolders.filter(folder => {
      if (desiredFolderIds.has(folder.id)) return false;
      const classMod = folder.getFlag?.(MODULE_ID, "classMod");
      if (classMod === "superior-shinobi") return true;
      const name = String(folder.name ?? "").toLowerCase();
      if (!name.includes("superior shinobi")) return false;
      return folder.getFlag?.(MODULE_ID, "managed") || !folder.folder;
    });
    const obsoleteSuperiorFolderIds = new Set(obsoleteSuperiorFolders.map(folder => folder.id));

    const docs = await pack.getDocuments();
    const removableIds = docs.filter(doc => {
      if (doc.getFlag(MODULE_ID, "managed")) return true;
      if (obsoleteSuperiorFolderIds.has(doc.folder?.id ?? doc.folder)) return true;
      const identifier = doc.system?.identifier;
      const classMod = doc.getFlag?.(MODULE_ID, "classMod");
      return !desiredItemIds.has(doc.id) && (identifier === "superior-shinobi" || classMod === "superior-shinobi");
    }).map(doc => doc.id);
    if (removableIds.length) await Item.implementation.deleteDocuments(removableIds, {pack: pack.collection});

    // Remove obsolete module-managed folders, including the original duplicate Superior Shinobi tree.
    const staleFolders = packFolders.filter(folder => !desiredFolderIds.has(folder.id) && (
      folder.getFlag?.(MODULE_ID, "managed") || obsoleteSuperiorFolderIds.has(folder.id)
    ));
    if (staleFolders.length) {
      const staleIds = new Set(staleFolders.map(folder => folder.id));
      const depth = folder => {
        let value = 0;
        let parent = folder.folder?.id ?? folder.folder;
        const seen = new Set();
        while (parent && staleIds.has(parent) && !seen.has(parent)) {
          seen.add(parent);
          value += 1;
          parent = folderCollection?.get(parent)?.folder?.id ?? folderCollection?.get(parent)?.folder;
        }
        return value;
      };
      for (const folder of [...staleFolders].sort((a,b) => depth(b) - depth(a))) {
        try {
          await FolderClass.deleteDocuments([folder.id], {pack: pack.collection, deleteSubfolders: true, deleteContents: false});
        } catch (error) {
          console.warn(`${MODULE_ID} | Could not remove obsolete folder ${folder.name}`, error);
        }
      }
    }
    const existingFolders = folders.filter(folder => folderCollection?.has(folder._id));
    const missingFolders = folders.filter(folder => !folderCollection?.has(folder._id));
    if (existingFolders.length) await FolderClass.updateDocuments(existingFolders, {pack: pack.collection});
    if (missingFolders.length) {
      const byId = new Map(folders.map(folder => [folder._id, folder]));
      const depthOf = folder => {
        let depth = 0;
        let parentId = folder.folder;
        const visited = new Set();
        while (parentId && byId.has(parentId) && !visited.has(parentId)) {
          visited.add(parentId);
          depth += 1;
          parentId = byId.get(parentId).folder;
        }
        return depth;
      };
      const depths = [...new Set(missingFolders.map(depthOf))].sort((a, b) => a - b);
      for (const depth of depths) {
        const level = missingFolders.filter(folder => depthOf(folder) === depth);
        await FolderClass.createDocuments(level, {pack: pack.collection, keepId: true});
      }
    }

    const ordered = [...items].sort((a,b) => Number(a.type === "classmod") - Number(b.type === "classmod"));
    await Item.implementation.createDocuments(ordered, {pack: pack.collection, keepId: true});
    await game.settings.set(MODULE_ID, "contentVersion", CONTENT_VERSION);
    if (notify) ui.notifications.info(`N5eB Class Mods: synchronized ${ordered.length} entries in ${folders.length} folders.`);
    return pack;
  } catch (error) {
    console.error(`${MODULE_ID} | Synchronization failed`, error);
    ui.notifications.error(`N5eB Class Mods could not be created: ${error.message}`);
    throw error;
  }
}

async function openLibrary() {
  let pack = game.packs.get(PACK_COLLECTION);
  if (!pack && game.user.isGM) pack = await syncLibrary({force:true});
  if (!pack) return ui.notifications.warn("The Class Mod compendium has not been created by a GM yet.");
  return pack.render(true);
}


/* ------------------------------------------------------------ */
/* Kāma runtime helpers                                          */
/* ------------------------------------------------------------ */

const kamaQueues = new Map();
const kamaTrackerDialogs = new Map();

function asArray(collection) {
  if (!collection) return [];
  return Array.isArray(collection) ? collection : Array.from(collection);
}

function queueKamaTask(actor, task) {
  if (!actor) return Promise.resolve();
  const key = actor.uuid ?? actor.id ?? actor.name;
  const previous = kamaQueues.get(key) ?? Promise.resolve();
  const current = previous.catch(() => undefined).then(task);
  const tracked = current.finally(() => {
    if (kamaQueues.get(key) === tracked) kamaQueues.delete(key);
  });
  kamaQueues.set(key, tracked);
  return tracked;
}

function getClassMod(actor, identifier) {
  return asArray(actor?.items).find(item => item.type === "classmod" && item.system?.identifier === identifier);
}

function getKamaClassMod(actor) {
  return getClassMod(actor, "kama-seal");
}

function getFlyingThunderGodClassMod(actor) {
  return getClassMod(actor, "flying-thunder-god");
}

function getTenseiganClassMod(actor) {
  return getClassMod(actor, "tenseigan");
}

function getSealedBeastClassMod(actor) {
  return getClassMod(actor, "sealed-beast-redux");
}

function getEdoTenseiClassMod(actor) {
  return getClassMod(actor, "edo-tensei");
}

function getManagedActorItem(actor, flag) {
  return asArray(actor?.items).find(item => item.getFlag?.(MODULE_ID, flag));
}

function getKamaController(actor) {
  return getManagedActorItem(actor, "kamaSealController")
    ?? asArray(actor?.items).find(item => item.system?.identifier === "kama-seal" && item.type === "feat");
}

function getKamaEffect(actor) {
  return asArray(getKamaController(actor)?.effects).find(effect => effect.getFlag?.(MODULE_ID, "kamaSealEffect"));
}

function getKamaActorFromEffect(effect) {
  if (effect?.parent?.documentName === "Actor") return effect.parent;
  if (effect?.parent?.documentName === "Item" && effect.parent.parent?.documentName === "Actor") return effect.parent.parent;
  return null;
}

function getSealTypeKey(item) {
  const explicit = item?.getFlag?.(MODULE_ID, "sealTypeKey");
  if (SEAL_TYPE_KEYS.includes(explicit)) return explicit;
  const identifier = String(item?.system?.identifier ?? "");
  if (!identifier.startsWith("seal-type-")) return null;
  const key = identifier.slice("seal-type-".length);
  return SEAL_TYPE_KEYS.includes(key) ? key : null;
}

function getSealEvolutionKey(item) {
  const explicit = item?.getFlag?.(MODULE_ID, "sealEvolutionFor");
  if (SEAL_TYPE_KEYS.includes(explicit)) return explicit;
  const identifier = String(item?.system?.identifier ?? "");
  if (!identifier.startsWith("seal-evolution-")) return null;
  const key = identifier.slice("seal-evolution-".length);
  return SEAL_TYPE_KEYS.includes(key) ? key : null;
}

function getSelectedSealType(actor) {
  return asArray(actor?.items).find(item => getSealTypeKey(item)) ?? null;
}

function getSelectedInfluence(actor) {
  return asArray(actor?.items).find(item => String(item.system?.identifier ?? "").startsWith("influence-")
    && item.system?.identifier !== "influence") ?? null;
}

function getKamaLevel(actor) {
  return Math.max(1, Number(getKamaClassMod(actor)?.system?.levels ?? 1));
}

function defaultKamaTracker() {
  return {
    version: KAMA_TRACKER_VERSION,
    divineRewrite: 0,
    resonanceDisruption: 0,
    activationsSinceFullRest: 0
  };
}

function normalizeKamaTracker(value) {
  const source = foundry.utils.getType?.(value) === "Object" ? value : (value && typeof value === "object" ? value : {});
  return {
    version: KAMA_TRACKER_VERSION,
    divineRewrite: Math.clamp(Number(source.divineRewrite ?? 0), 0, 100),
    resonanceDisruption: Math.clamp(Number(source.resonanceDisruption ?? 0), 0, 5),
    activationsSinceFullRest: Math.max(0, Math.floor(Number(source.activationsSinceFullRest ?? 0)))
  };
}

function readKamaTracker(actor) {
  return normalizeKamaTracker(actor?.getFlag?.(MODULE_ID, KAMA_TRACKER_FLAG));
}

async function updateKamaTracker(actor, patch={}, {sync=true, render=true, allowRewriteDecrease=false}={}) {
  if (!actor?.isOwner) return readKamaTracker(actor);
  const current = readKamaTracker(actor);
  const next = normalizeKamaTracker({...current, ...patch});
  if (!game.user.isGM && !allowRewriteDecrease && next.divineRewrite < current.divineRewrite) {
    next.divineRewrite = current.divineRewrite;
    ui.notifications.warn("Divine Rewrite cannot be reduced without GM permission.");
  }
  await actor.update({[`flags.${MODULE_ID}.${KAMA_TRACKER_FLAG}`]: next}, {[KAMA_INTERNAL_OPTION]: {tracker: true}});
  if (sync) {
    await syncKamaRewrite(actor, next);
    await syncResonanceDisruption(actor, next);
  }
  if (render) actor.sheet?.render?.(false);
  refreshOpenTracker(actor);
  return next;
}

async function ensureKamaTracker(actor, {fresh=false}={}) {
  const raw = actor?.getFlag?.(MODULE_ID, KAMA_TRACKER_FLAG);
  if (!fresh && raw && Number(raw.version) === KAMA_TRACKER_VERSION) return readKamaTracker(actor);
  const state = defaultKamaTracker();
  await actor.update({[`flags.${MODULE_ID}.${KAMA_TRACKER_FLAG}`]: state}, {[KAMA_INTERNAL_OPTION]: {tracker: true}});
  return state;
}

function addChange(changes, key, value, mode=CONST.ACTIVE_EFFECT_MODES.ADD, priority=20) {
  changes.push({key, mode, value: String(value), priority});
}

function addJutsuAttackAndDC(changes, value) {
  for (const type of ["ninjutsu", "genjutsu", "taijutsu"]) {
    addChange(changes, `system.attributes.jutsu.${type}.bonuses.attack`, value);
    addChange(changes, `system.attributes.jutsu.${type}.bonuses.dc`, value);
  }
}

function addAllAbilityScores(changes, value) {
  for (const ability of ["str", "dex", "con", "int", "wis", "cha"]) {
    addChange(changes, `system.abilities.${ability}.value`, value);
  }
}

function buildKamaChanges(actor) {
  const level = getKamaLevel(actor);
  const evolved = level >= 3;
  const greater = level >= 4;
  const sealType = getSealTypeKey(getSelectedSealType(actor));
  const changes = [];

  addChange(changes, "system.attributes.ac.bonus", greater ? 3 : 2);
  addChange(changes, "system.attributes.movement.walk", greater ? 60 : 30);
  addChange(changes, "system.abilities.str.bonuses.save", greater ? 5 : 3);
  addChange(changes, "system.abilities.dex.bonuses.save", greater ? 5 : 3);
  addChange(changes, "system.abilities.con.bonuses.save", greater ? 5 : 3);

  switch (sealType) {
    case "all-rounder":
      addChange(changes, "system.attributes.prof", 1);
      if (evolved) addAllAbilityScores(changes, 2);
      break;
    case "assault-type":
      addChange(changes, "system.abilities.str.bonuses.save", -1);
      addChange(changes, "system.abilities.dex.bonuses.save", -1);
      addChange(changes, "system.abilities.con.bonuses.save", -1);
      break;
    case "tank-type":
      addChange(changes, "system.abilities.con.bonuses.save", evolved ? 3 : 2);
      if (evolved) addChange(changes, "system.abilities.str.bonuses.save", 1);
      break;
    case "speed-type":
      addChange(changes, "system.attributes.movement.walk", evolved ? 60 : 30);
      addChange(changes, "system.attributes.ac.bonus", evolved ? 3 : 2);
      addChange(changes, "system.abilities.dex.bonuses.save", 2);
      break;
    case "sensor-type":
      addChange(changes, "system.skills.prc.bonuses.check", evolved ? 15 : 10);
      addChange(changes, "system.skills.prc.bonuses.passive", evolved ? 15 : 10);
      break;
    case "white-kama-seal":
      addChange(changes, "system.attributes.movement.walk", -5);
      addChange(changes, "system.abilities.str.bonuses.save", -1);
      addChange(changes, "system.abilities.dex.bonuses.save", -1);
      addChange(changes, "system.abilities.con.bonuses.save", -1);
      addJutsuAttackAndDC(changes, 1);
      if (evolved) addAllAbilityScores(changes, 2);
      break;
  }
  return changes;
}

function calculateKamaPoints(actor) {
  const level = getKamaLevel(actor);
  const sealType = getSealTypeKey(getSelectedSealType(actor));
  if (sealType === "speed-type") return 10 * level;
  if (sealType === "white-kama-seal") return 15 * level;
  return 20 * level;
}

async function refreshKamaEffect(actor) {
  if (!actor?.isOwner) return;
  const effect = getKamaEffect(actor);
  if (!effect) return;
  const sealType = getSelectedSealType(actor)?.name;
  await effect.update({
    name: sealType ? `Kāma Seal — ${sealType}` : "Kāma Seal — Active",
    changes: buildKamaChanges(actor)
  }, {[KAMA_INTERNAL_OPTION]: {refreshEffect: true}});
  if (!effect.disabled) await grantOrAdjustKamaPoints(actor);
}

async function grantOrAdjustKamaPoints(actor) {
  const amount = calculateKamaPoints(actor);
  const current = Number(actor.system?.attributes?.hp?.temp ?? 0);
  const state = actor.getFlag(MODULE_ID, KAMA_TEMP_HP_FLAG);

  if (!state?.active) {
    await actor.update({
      "system.attributes.hp.temp": current + amount,
      [`flags.${MODULE_ID}.${KAMA_TEMP_HP_FLAG}`]: {active: true, baseline: current, granted: amount}
    }, {[KAMA_INTERNAL_OPTION]: {kamaPoints: true}});
    return;
  }

  const baseline = Math.max(0, Number(state.baseline ?? 0));
  const previous = Math.max(0, Number(state.granted ?? 0));
  let next = current;
  if (amount > previous) next += amount - previous;
  else if (amount < previous) {
    const visibleKamaPoints = Math.max(0, current - baseline);
    next -= Math.min(previous - amount, visibleKamaPoints);
  }
  await actor.update({
    "system.attributes.hp.temp": Math.max(0, next),
    [`flags.${MODULE_ID}.${KAMA_TEMP_HP_FLAG}`]: {active: true, baseline, granted: amount}
  }, {[KAMA_INTERNAL_OPTION]: {kamaPoints: true}});
}

async function removeKamaPoints(actor) {
  const state = actor?.getFlag?.(MODULE_ID, KAMA_TEMP_HP_FLAG);
  if (!state?.active) return;
  const current = Number(actor.system?.attributes?.hp?.temp ?? 0);
  const baseline = Math.max(0, Number(state.baseline ?? 0));
  await actor.update({
    "system.attributes.hp.temp": Math.min(current, baseline),
    [`flags.${MODULE_ID}.-=${KAMA_TEMP_HP_FLAG}`]: null
  }, {[KAMA_INTERNAL_OPTION]: {kamaPoints: true}});
}

function calculateKamaArtValues(actor) {
  const characterLevel = Math.max(0, Number(actor?.system?.details?.level ?? 0));
  const proficiency = Math.max(0, Number(actor?.system?.attributes?.prof ?? 0));
  const classModLevel = Math.max(1, Number(getKamaClassMod(actor)?.system?.levels ?? 1));
  return {
    attack: Math.floor(characterLevel / 2) + classModLevel + proficiency,
    save: 10 + Math.floor(characterLevel / 2) + proficiency
  };
}

function calculateFlyingThunderGodArtValues(actor) {
  const characterLevel = Math.max(0, Number(actor?.system?.details?.level ?? 0));
  const dexterity = actor?.system?.abilities?.dex ?? {};
  const dexterityModifier = Number.isFinite(Number(dexterity.mod))
    ? Number(dexterity.mod)
    : Math.floor((Number(dexterity.value ?? 10) - 10) / 2);
  const classModLevel = Math.max(1, Number(getFlyingThunderGodClassMod(actor)?.system?.levels ?? 1));
  return {
    attack: (2 * dexterityModifier) + (2 * classModLevel),
    save: 10 + (2 * dexterityModifier) + Math.floor(characterLevel / 4)
  };
}

function calculateEdoTenseiArtValues(actor) {
  const characterLevel = Math.max(0, Number(actor?.system?.details?.level ?? 0));
  const proficiency = Math.max(0, Number(actor?.system?.attributes?.prof ?? 0));
  const classModLevel = Math.max(1, Number(getEdoTenseiClassMod(actor)?.system?.levels ?? 1));
  return {
    attack: classModLevel + (2 * proficiency),
    save: 12 + proficiency + Math.floor(characterLevel / 2)
  };
}

function getClassModArtsConfiguration(identifier) {
  if (identifier === "kama-seal") return {
    item: getKamaClassMod,
    calculate: calculateKamaArtValues,
    attackFormula: KAMA_ATTACK_FORMULA,
    saveFormula: KAMA_SAVE_FORMULA
  };
  if (identifier === "flying-thunder-god") return {
    item: getFlyingThunderGodClassMod,
    calculate: calculateFlyingThunderGodArtValues,
    attackFormula: FTG_ATTACK_FORMULA,
    saveFormula: FTG_SAVE_FORMULA
  };
  if (identifier === "tenseigan") return {
    item: getTenseiganClassMod,
    calculate: calculateTenseiganArtValues,
    attackFormula: TENSEIGAN_ATTACK_FORMULA,
    saveFormula: TENSEIGAN_SAVE_FORMULA
  };
  if (identifier === "sealed-beast-redux") return {
    item: getSealedBeastClassMod,
    calculate: calculateSealedBeastArtValues,
    attackFormula: SEALED_BEAST_ATTACK_FORMULA,
    saveFormula: SEALED_BEAST_SAVE_FORMULA
  };
  if (identifier === "edo-tensei") return {
    item: getEdoTenseiClassMod,
    calculate: calculateEdoTenseiArtValues,
    attackFormula: EDO_TENSEI_ATTACK_FORMULA,
    saveFormula: EDO_TENSEI_SAVE_FORMULA
  };
  return null;
}

async function ensureClassModArtsValues(actor, identifier) {
  const config = getClassModArtsConfiguration(identifier);
  const classMod = config?.item(actor);
  if (!classMod) return;
  const values = config.calculate(actor);
  const updates = {};
  const expected = {
    "system.attackBonus.value": String(values.attack),
    "system.attackBonus.formula": config.attackFormula,
    "system.attackBonus.scaling": "",
    "system.save.value": String(values.save),
    "system.save.formula": config.saveFormula,
    "system.save.scaling": ""
  };
  for (const [path, value] of Object.entries(expected)) {
    const current = foundry.utils.getProperty(classMod, path);
    if (String(current ?? "") !== value) updates[path] = value;
  }
  if (Object.keys(updates).length) {
    await classMod.update(updates, {[KAMA_INTERNAL_OPTION]: {formulaRepair: true, identifier}});
    actor.prepareData?.();
  }
}

async function ensureKamaArtsFormulas(actor) {
  return ensureClassModArtsValues(actor, "kama-seal");
}

async function ensureFlyingThunderGodArtsFormulas(actor) {
  return ensureClassModArtsValues(actor, "flying-thunder-god");
}

async function ensureTenseiganArtsFormulas(actor) {
  return ensureClassModArtsValues(actor, "tenseigan");
}

async function ensureSealedBeastArtsFormulas(actor) {
  return ensureClassModArtsValues(actor, "sealed-beast-redux");
}

async function ensureEdoTenseiArtsFormulas(actor) {
  return ensureClassModArtsValues(actor, "edo-tensei");
}

async function syncClassModArtsForActor(actor) {
  if (!actor?.isOwner) return;
  await ensureKamaArtsFormulas(actor);
  await ensureFlyingThunderGodArtsFormulas(actor);
  await ensureTenseiganArtsFormulas(actor);
  await ensureSealedBeastArtsFormulas(actor);
  await ensureEdoTenseiArtsFormulas(actor);
}

function calculateResonanceGain(actor, state) {
  if (getSealTypeKey(getSelectedSealType(actor)) === "white-kama-seal") return 0;
  const priorActivations = state.activationsSinceFullRest;
  let gain = 2 + priorActivations;
  const influence = getSelectedInfluence(actor)?.system?.identifier;
  if (influence === "influence-no-influence" && priorActivations > 0) gain += 1;
  if (influence === "influence-heavy-influence") gain = Math.max(1, gain - 1);
  return gain;
}

async function handleKamaActivation(actor) {
  const state = await ensureKamaTracker(actor);
  const resonanceGain = calculateResonanceGain(actor, state);
  const next = {
    divineRewrite: Math.min(100, state.divineRewrite + KAMA_REWRITE_STEP),
    resonanceDisruption: Math.min(5, state.resonanceDisruption + resonanceGain),
    activationsSinceFullRest: state.activationsSinceFullRest + 1
  };
  await updateKamaTracker(actor, next, {render: false});
  await grantOrAdjustKamaPoints(actor);
  actor.sheet?.render?.(false);
}

async function toggleKama(actor) {
  actor ??= canvas.tokens?.controlled?.[0]?.actor ?? game.user.character;
  if (!actor) return ui.notifications.warn("No character is selected for Kāma.");
  const controller = getKamaController(actor);
  if (!controller) return ui.notifications.warn("This character does not possess the Kāma Seal feature.");
  const effect = getKamaEffect(actor);
  if (!effect) return ui.notifications.error("The Kāma Seal Active Effect was not found.");

  const activating = effect.disabled;
  const update = {disabled: !activating, changes: buildKamaChanges(actor)};
  if (activating) {
    update["duration.startTime"] = game.time.worldTime;
    update["duration.startRound"] = game.combat?.round ?? null;
    update["duration.startTurn"] = game.combat?.turn ?? null;
    update["duration.seconds"] = 60;
    update["duration.rounds"] = 10;
  }
  await effect.update(update, {[KAMA_INTERNAL_OPTION]: {toggleKama: true}});
  ui.notifications.info(`Kāma Seal ${activating ? "activated" : "deactivated"}.`);
}

function getRewriteMilestoneItems(actor) {
  return asArray(actor?.items).filter(item => Number(item.getFlag?.(MODULE_ID, "activeRewriteMilestone")) >= 10);
}

async function syncKamaRewrite(actor, suppliedState) {
  if (!actor?.isOwner) return;
  const state = suppliedState ?? readKamaTracker(actor);
  const threshold = Math.floor(state.divineRewrite / 10) * 10;
  const current = getRewriteMilestoneItems(actor);
  const matching = current.find(item => Number(item.getFlag(MODULE_ID, "activeRewriteMilestone")) === threshold);
  const remove = current.filter(item => item !== matching).map(item => item.id);
  if (remove.length) await actor.deleteEmbeddedDocuments("Item", remove, {[KAMA_INTERNAL_OPTION]: {rewriteSync: true}});
  if (threshold < 10 || matching) return;

  const pack = game.packs.get(PACK_COLLECTION);
  if (!pack) return;
  const index = await pack.getIndex({fields:["flags"]});
  const row = index.find(item => Number(foundry.utils.getProperty(item, `flags.${MODULE_ID}.rewriteThreshold`)) === threshold);
  if (!row) return console.warn(`${MODULE_ID} | Divine Rewrite ${threshold}% milestone missing`);
  const sourceDoc = await pack.getDocument(row._id);
  const source = sourceDoc.toObject();
  delete source._id;
  delete source.folder;
  foundry.utils.setProperty(source, `flags.${MODULE_ID}.activeRewriteMilestone`, threshold);
  await actor.createEmbeddedDocuments("Item", [source], {[KAMA_INTERNAL_OPTION]: {rewriteSync: true}});
}

function getResonanceEffect(actor) {
  return asArray(actor?.effects).find(effect => effect.getFlag?.(MODULE_ID, "resonanceEffect"));
}

async function removeLegacyTrackerEffects(actor) {
  for (const item of asArray(actor?.items)) {
    const legacy = asArray(item.effects).filter(effect => effect.getFlag?.(MODULE_ID, "resonanceEffect"));
    if (legacy.length) await item.deleteEmbeddedDocuments("ActiveEffect", legacy.map(effect => effect.id), {[KAMA_INTERNAL_OPTION]: {migration: true}});
  }
}

async function syncResonanceDisruption(actor, suppliedState) {
  if (!actor?.isOwner) return;
  const state = suppliedState ?? readKamaTracker(actor);
  const rank = state.resonanceDisruption;
  let effect = getResonanceEffect(actor);
  const changes = [];
  if (rank >= 1) {
    const penalty = -rank;
    changes.push({key:"system.bonuses.abilities.save", mode:CONST.ACTIVE_EFFECT_MODES.ADD, value:String(penalty), priority:20});
    for (const type of ["ninjutsu", "genjutsu", "taijutsu"]) {
      changes.push(
        {key:`system.attributes.jutsu.${type}.bonuses.attack`, mode:CONST.ACTIVE_EFFECT_MODES.ADD, value:String(penalty), priority:20},
        {key:`system.attributes.jutsu.${type}.bonuses.dc`, mode:CONST.ACTIVE_EFFECT_MODES.ADD, value:String(penalty), priority:20}
      );
    }
  }
  if (rank >= 2) changes.push({key:"system.attributes.ac.bonus", mode:CONST.ACTIVE_EFFECT_MODES.ADD, value:"-3", priority:20});

  if (!effect) {
    const [created] = await actor.createEmbeddedDocuments("ActiveEffect", [{
      name:"Resonance Disruption",
      img:"modules/n5eb-classmod-library/assets/kama-seal.png",
      disabled:rank === 0,
      transfer:false,
      changes,
      flags:{[MODULE_ID]:{resonanceEffect:true}}
    }], {[KAMA_INTERNAL_OPTION]: {resonanceSync: true}});
    effect = created;
  } else {
    await effect.update({disabled:rank === 0, changes}, {[KAMA_INTERNAL_OPTION]: {resonanceSync: true}});
  }
}

async function syncSealEvolution(actor) {
  if (!actor?.isOwner) return;
  const classMod = getKamaClassMod(actor);
  if (!classMod) return;
  const level = getKamaLevel(actor);
  const sealType = getSelectedSealType(actor);
  const key = getSealTypeKey(sealType);
  const evolutions = asArray(actor.items).filter(item => getSealEvolutionKey(item));
  const correct = evolutions.find(item => getSealEvolutionKey(item) === key);
  const remove = evolutions.filter(item => level < 3 || !key || item !== correct).map(item => item.id);
  if (remove.length) await actor.deleteEmbeddedDocuments("Item", remove, {[KAMA_INTERNAL_OPTION]: {sealEvolution: true}});
  if (level < 3 || !key || correct) return;

  const pack = game.packs.get(PACK_COLLECTION);
  if (!pack) return;
  const index = await pack.getIndex({fields:["flags", "system.identifier"]});
  const row = index.find(item => {
    const flag = foundry.utils.getProperty(item, `flags.${MODULE_ID}.sealEvolutionFor`);
    const identifier = foundry.utils.getProperty(item, "system.identifier");
    return flag === key || identifier === `seal-evolution-${key}`;
  });
  if (!row) return console.warn(`${MODULE_ID} | Seal evolution for ${key} is missing`);
  const sourceDoc = await pack.getDocument(row._id);
  const source = sourceDoc.toObject();
  delete source._id;
  delete source.folder;
  foundry.utils.setProperty(source, `flags.${MODULE_ID}.automaticSealEvolution`, true);
  await actor.createEmbeddedDocuments("Item", [source], {[KAMA_INTERNAL_OPTION]: {sealEvolution: true}});
}

async function cleanLegacyTrackerFeatures(actor) {
  for (const item of asArray(actor?.items)) {
    const identifier = item.system?.identifier;
    if (!["divine-rewrite", "resonance-disruption"].includes(identifier)) continue;
    const updates = {};
    if (item.system?.uses?.value != null) updates["system.uses.value"] = null;
    if (item.system?.uses?.max) updates["system.uses.max"] = "";
    if (Object.keys(updates).length) await item.update(updates, {[KAMA_INTERNAL_OPTION]: {migration: true}});
  }
}

async function migrateKamaActor(actor) {
  if (!getKamaClassMod(actor)) return;
  const migrated = actor.getFlag(MODULE_ID, "trackerV06Migrated");
  if (!migrated) {
    await ensureKamaTracker(actor, {fresh: true});
    const milestones = getRewriteMilestoneItems(actor);
    if (milestones.length) await actor.deleteEmbeddedDocuments("Item", milestones.map(item => item.id), {[KAMA_INTERNAL_OPTION]: {migration: true}});
    await actor.update({
      [`flags.${MODULE_ID}.trackerV06Migrated`]: true,
      [`flags.${MODULE_ID}.-=rewritePhysicalApplied`]: null
    }, {[KAMA_INTERNAL_OPTION]: {migration: true}});
  } else await ensureKamaTracker(actor);

  const classMod = getKamaClassMod(actor);
  if (classMod?.system?.advancement?.sealEvolution) {
    const advancement = foundry.utils.deepClone(classMod.system.advancement);
    delete advancement.sealEvolution;
    await classMod.update({"system.advancement": advancement}, {[KAMA_INTERNAL_OPTION]: {migration: true}});
  }

  await cleanLegacyTrackerFeatures(actor);
  await removeLegacyTrackerEffects(actor);
  await ensureKamaArtsFormulas(actor);
  await syncSealEvolution(actor);
  await syncKamaRewrite(actor);
  await syncResonanceDisruption(actor);
  await refreshKamaEffect(actor);
}

async function migrateExistingClassModActors() {
  for (const actor of game.actors ?? []) {
    try {
      await queueKamaTask(actor, async () => {
        if (getKamaClassMod(actor)) await migrateKamaActor(actor);
        if (getTenseiganClassMod(actor)) await migrateTenseiganActor(actor);
        if (getSealedBeastClassMod(actor)) await migrateSealedBeastActor(actor);
        await ensureFlyingThunderGodArtsFormulas(actor);
        await ensureEdoTenseiArtsFormulas(actor);
      });
    } catch (error) {
      console.error(`${MODULE_ID} | Failed to migrate Class Mod actor ${actor.name}`, error);
    }
  }
}

/* ------------------------------------------------------------ */
/* Kāma tracker UI                                               */
/* ------------------------------------------------------------ */

function trackerDialogKey(actor) {
  return actor?.uuid ?? actor?.id;
}

function buildKamaTrackerHtml(actor) {
  const state = readKamaTracker(actor);
  const rewriteMin = game.user.isGM ? 0 : state.divineRewrite;
  return `
    <div class="n5eb-kama-tracker-dialog" data-kama-tracker-root>
      <p class="tracker-intro">These values are stored directly on <strong>${foundry.utils.escapeHTML?.(actor.name) ?? actor.name}</strong>. They are not item uses.</p>
      <section class="tracker-card rewrite">
        <header><span>Divine Rewrite</span><strong data-value="rewrite">${state.divineRewrite}%</strong></header>
        <div class="tracker-progress"><span data-bar="rewrite" style="width:${state.divineRewrite}%"></span></div>
        <div class="tracker-controls">
          ${game.user.isGM ? '<button type="button" data-action="rewrite-minus"><i class="fas fa-minus"></i> 5</button>' : ''}
          <input type="number" data-input="rewrite" min="${rewriteMin}" max="100" step="5" value="${state.divineRewrite}">
          <button type="button" data-action="rewrite-plus"><i class="fas fa-plus"></i> 5</button>
        </div>
      </section>
      <section class="tracker-card resonance">
        <header><span>Resonance Disruption</span><strong data-value="resonance">${state.resonanceDisruption} / 5</strong></header>
        <div class="tracker-pips" data-pips="resonance">${[1,2,3,4,5].map(rank => `<span class="${rank <= state.resonanceDisruption ? 'filled' : ''}"></span>`).join('')}</div>
        <div class="tracker-controls">
          <button type="button" data-action="resonance-minus"><i class="fas fa-minus"></i> 1</button>
          <input type="number" data-input="resonance" min="0" max="5" step="1" value="${state.resonanceDisruption}">
          <button type="button" data-action="resonance-plus"><i class="fas fa-plus"></i> 1</button>
        </div>
      </section>
      <div class="tracker-meta">Activations since Full Rest: <strong data-value="activations">${state.activationsSinceFullRest}</strong></div>
      <div class="tracker-actions">
        <button type="button" data-action="save"><i class="fas fa-floppy-disk"></i> Save Values</button>
        <button type="button" data-action="long-rest"><i class="fas fa-campground"></i> Long Rest</button>
        <button type="button" data-action="full-rest"><i class="fas fa-bed"></i> Full Rest</button>
        ${game.user.isGM ? '<button type="button" data-action="reset"><i class="fas fa-rotate-left"></i> Reset to 0</button>' : ''}
      </div>
    </div>`;
}

function refreshTrackerRoot(root, actor) {
  if (!root) return;
  const state = readKamaTracker(actor);
  const rewriteInput = root.querySelector('[data-input="rewrite"]');
  const resonanceInput = root.querySelector('[data-input="resonance"]');
  if (rewriteInput) {
    rewriteInput.value = state.divineRewrite;
    if (!game.user.isGM) rewriteInput.min = state.divineRewrite;
  }
  if (resonanceInput) resonanceInput.value = state.resonanceDisruption;
  const rewriteValue = root.querySelector('[data-value="rewrite"]');
  const resonanceValue = root.querySelector('[data-value="resonance"]');
  const activationsValue = root.querySelector('[data-value="activations"]');
  if (rewriteValue) rewriteValue.textContent = `${state.divineRewrite}%`;
  if (resonanceValue) resonanceValue.textContent = `${state.resonanceDisruption} / 5`;
  if (activationsValue) activationsValue.textContent = state.activationsSinceFullRest;
  const bar = root.querySelector('[data-bar="rewrite"]');
  if (bar) bar.style.width = `${state.divineRewrite}%`;
  root.querySelectorAll('[data-pips="resonance"] span').forEach((pip, index) => pip.classList.toggle("filled", index < state.resonanceDisruption));
}

function refreshOpenTracker(actor) {
  const dialog = kamaTrackerDialogs.get(trackerDialogKey(actor));
  const root = dialog?.element?.querySelector?.("[data-kama-tracker-root]");
  refreshTrackerRoot(root, actor);
}

function activateKamaTrackerDialog(dialog, actor) {
  const root = dialog.element.querySelector("[data-kama-tracker-root]");
  if (!root || root.dataset.activated === "true") return;
  root.dataset.activated = "true";
  root.addEventListener("click", async event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    const state = readKamaTracker(actor);
    try {
      if (action === "rewrite-plus") await updateKamaTracker(actor, {divineRewrite: state.divineRewrite + 5});
      else if (action === "rewrite-minus") await updateKamaTracker(actor, {divineRewrite: state.divineRewrite - 5}, {allowRewriteDecrease: game.user.isGM});
      else if (action === "resonance-plus") await updateKamaTracker(actor, {resonanceDisruption: state.resonanceDisruption + 1});
      else if (action === "resonance-minus") await updateKamaTracker(actor, {resonanceDisruption: state.resonanceDisruption - 1});
      else if (action === "save") {
        const rewrite = Number(root.querySelector('[data-input="rewrite"]')?.value ?? state.divineRewrite);
        const resonance = Number(root.querySelector('[data-input="resonance"]')?.value ?? state.resonanceDisruption);
        await updateKamaTracker(actor, {divineRewrite: rewrite, resonanceDisruption: resonance}, {allowRewriteDecrease: game.user.isGM});
      } else if (action === "long-rest") {
        await updateKamaTracker(actor, {resonanceDisruption: Math.max(0, state.resonanceDisruption - 1)});
      } else if (action === "full-rest") {
        await updateKamaTracker(actor, {
          resonanceDisruption: Math.max(0, state.resonanceDisruption - 2),
          activationsSinceFullRest: 0
        });
      } else if (action === "reset" && game.user.isGM) {
        await updateKamaTracker(actor, defaultKamaTracker(), {allowRewriteDecrease: true});
      }
    } catch (error) {
      console.error(`${MODULE_ID} | Kāma tracker update failed`, error);
      ui.notifications.error(`Kāma tracker could not be updated: ${error.message}`);
    }
    refreshTrackerRoot(root, actor);
  });
}

async function openKamaTracker(actor) {
  actor ??= canvas.tokens?.controlled?.[0]?.actor ?? game.user.character;
  if (!actor || !getKamaClassMod(actor)) return ui.notifications.warn("No Kāma character is selected.");
  const key = trackerDialogKey(actor);
  const existing = kamaTrackerDialogs.get(key);
  if (existing) return existing.bringToFront?.();
  await ensureKamaTracker(actor);

  const content = document.createElement("div");
  content.innerHTML = buildKamaTrackerHtml(actor);
  const DialogV2 = foundry.applications.api.DialogV2;
  const dialog = new DialogV2({
    window:{title:`Kāma Tracker — ${actor.name}`, icon:"fa-solid fa-diamond", resizable:true},
    position:{width:520, height:"auto"},
    classes:["n5eb-kama-tracker-window"],
    content,
    buttons:[{action:"close", label:"Close", icon:"fa-solid fa-xmark"}]
  });
  kamaTrackerDialogs.set(key, dialog);
  dialog.addEventListener("render", () => activateKamaTrackerDialog(dialog, actor));
  dialog.addEventListener("close", () => kamaTrackerDialogs.delete(key), {once:true});
  await dialog.render({force:true});
  return dialog;
}

function getRenderRoot(app, html) {
  if (html?.querySelector) return html;
  if (html?.[0]?.querySelector) return html[0];
  if (app?.element?.querySelector) return app.element;
  if (app?.element?.[0]?.querySelector) return app.element[0];
  return null;
}

function renderKamaTrackerStrip(app, html) {
  const actor = app.actor ?? app.document;
  if (!getKamaClassMod(actor)) return;
  const root = getRenderRoot(app, html);
  if (!root || root.querySelector("[data-kama-tracker-strip]")) return;
  const target = root.querySelector(".jutsu-casting-overview") ?? root.querySelector(".sheet-body");
  if (!target) return;
  const state = readKamaTracker(actor);
  const section = document.createElement("section");
  section.className = "n5eb-kama-tracker-strip";
  section.dataset.kamaTrackerStrip = "true";
  section.innerHTML = `
    <button type="button" class="tracker-title" data-action="open-kama-tracker"><i class="fas fa-diamond"></i> Kāma Tracking</button>
    <div class="tracker-mini rewrite"><span>Divine Rewrite</span><div><i style="width:${state.divineRewrite}%"></i></div><strong>${state.divineRewrite}%</strong></div>
    <div class="tracker-mini resonance"><span>Resonance</span><div>${[1,2,3,4,5].map(rank => `<i class="${rank <= state.resonanceDisruption ? 'filled' : ''}"></i>`).join('')}</div><strong>${state.resonanceDisruption}/5</strong></div>`;
  target.prepend(section);
  section.querySelector('[data-action="open-kama-tracker"]')?.addEventListener("click", () => openKamaTracker(actor));
}


/* ------------------------------------------------------------ */
/* Tenseigan runtime helpers                                     */
/* ------------------------------------------------------------ */

const tenseiganTrackerDialogs = new Map();

function getTenseiganLevel(actor) {
  return Math.clamp(Number(getTenseiganClassMod(actor)?.system?.levels ?? 1), 1, 5);
}

function getTenseiganChakraMaximum(actor) {
  return TENSEIGAN_CHAKRA_BY_LEVEL[getTenseiganLevel(actor)] ?? 75;
}

function getTenseiganController(actor) {
  return getManagedActorItem(actor, "tenseiganController")
    ?? asArray(actor?.items).find(item => item.system?.identifier === "tenseigan-eye");
}

function getCelestialModeController(actor) {
  return getManagedActorItem(actor, "celestialChakraModeController")
    ?? asArray(actor?.items).find(item => item.system?.identifier === "celestial-chakra-mode");
}

function getTenseiganEffect(actor) {
  return asArray(getTenseiganController(actor)?.effects).find(effect => effect.getFlag?.(MODULE_ID, "tenseiganEffect"));
}

function getCelestialModeEffect(actor) {
  return asArray(getCelestialModeController(actor)?.effects)
    .find(effect => effect.getFlag?.(MODULE_ID, "celestialChakraModeEffect"));
}

function isTenseiganActive(actor) {
  return getTenseiganEffect(actor)?.disabled === false;
}

function isCelestialModeActive(actor) {
  return getCelestialModeEffect(actor)?.disabled === false;
}

function getOwnedCelestialArts(actor) {
  return asArray(actor?.items).filter(item => item.getFlag?.(MODULE_ID, "celestialArt") === true);
}

function defaultTenseiganTracker(actor) {
  const maximum = getTenseiganChakraMaximum(actor);
  return {
    version: TENSEIGAN_TRACKER_VERSION,
    classModLevel: getTenseiganLevel(actor),
    celestialChakra: maximum,
    celestialChakraMax: maximum,
    celestialStrain: 0,
    truthSeekingOrbs: getTenseiganLevel(actor) >= 4 ? 6 : 0,
    shortRestRecoveries: 0,
    longRestRecoveryUsed: false,
    masteryTarget: 0,
    artUses: {}
  };
}

function normalizeTenseiganTracker(value, actor) {
  const source = value && typeof value === "object" ? value : {};
  const maximum = getTenseiganChakraMaximum(actor);
  const previousMaximum = Math.max(0, Number(source.celestialChakraMax ?? maximum));
  const previousCurrent = Math.max(0, Number(source.celestialChakra ?? maximum));
  const gainedMaximum = Math.max(0, maximum - previousMaximum);
  const level = getTenseiganLevel(actor);
  const unlockedOrbs = level >= 4;
  const artUses = source.artUses && typeof source.artUses === "object" ? source.artUses : {};
  return {
    version: TENSEIGAN_TRACKER_VERSION,
    classModLevel: level,
    celestialChakra: Math.clamp(previousCurrent + gainedMaximum, 0, maximum),
    celestialChakraMax: maximum,
    celestialStrain: Math.clamp(Math.floor(Number(source.celestialStrain ?? 0)), 0, TENSEIGAN_STRAIN_MAX),
    truthSeekingOrbs: unlockedOrbs ? Math.clamp(Math.floor(Number(source.truthSeekingOrbs ?? 6)), 0, 6) : 0,
    shortRestRecoveries: Math.clamp(Math.floor(Number(source.shortRestRecoveries ?? 0)), 0, 2),
    longRestRecoveryUsed: Boolean(source.longRestRecoveryUsed),
    masteryTarget: Math.max(0, Math.floor(Number(source.masteryTarget ?? 0))),
    artUses: Object.fromEntries(Object.entries(artUses).map(([key, count]) => [key, Math.max(0, Math.floor(Number(count) || 0))]))
  };
}

function readTenseiganTracker(actor) {
  return normalizeTenseiganTracker(actor?.getFlag?.(MODULE_ID, TENSEIGAN_TRACKER_FLAG), actor);
}

async function rollTenseiganMasteryTarget() {
  const roll = await new Roll("3d4+3").evaluate();
  return Number(roll.total ?? 6);
}

async function ensureTenseiganTracker(actor, {fresh=false}={}) {
  const raw = actor?.getFlag?.(MODULE_ID, TENSEIGAN_TRACKER_FLAG);
  let state = fresh ? defaultTenseiganTracker(actor) : normalizeTenseiganTracker(raw, actor);
  if (!raw || fresh || !state.masteryTarget) state.masteryTarget = await rollTenseiganMasteryTarget();
  const changed = !raw || JSON.stringify(state) !== JSON.stringify(normalizeTenseiganTracker(raw, actor));
  if (changed || fresh) {
    await actor.update({[`flags.${MODULE_ID}.${TENSEIGAN_TRACKER_FLAG}`]: state}, {[KAMA_INTERNAL_OPTION]: {tenseiganTracker:true}});
  }
  return state;
}

async function updateTenseiganTracker(actor, patch={}, {sync=true, render=true}={}) {
  if (!actor?.isOwner) return readTenseiganTracker(actor);
  const current = await ensureTenseiganTracker(actor);
  const next = normalizeTenseiganTracker({...current, ...patch}, actor);
  await actor.update({[`flags.${MODULE_ID}.${TENSEIGAN_TRACKER_FLAG}`]: next}, {[KAMA_INTERNAL_OPTION]: {tenseiganTracker:true}});
  if (sync) {
    await syncCelestialStrainEffect(actor, next);
    await ensureTenseiganArtsFormulas(actor);
  }
  if (next.celestialChakra <= 0 && isTenseiganActive(actor)) {
    const mode = getCelestialModeEffect(actor);
    if (mode && !mode.disabled) await mode.update({disabled:true}, {[KAMA_INTERNAL_OPTION]: {toggleCelestialMode:true}});
    const eye = getTenseiganEffect(actor);
    if (eye && !eye.disabled) await eye.update({disabled:true}, {[KAMA_INTERNAL_OPTION]: {toggleTenseigan:true}});
  }
  if (render) actor.sheet?.render?.(false);
  refreshOpenTenseiganTracker(actor);
  return next;
}

function calculateTenseiganArtValues(actor) {
  const characterLevel = Math.max(0, Number(actor?.system?.details?.level ?? 0));
  const proficiency = Math.max(0, Number(actor?.system?.attributes?.prof ?? 0));
  const classModLevel = getTenseiganLevel(actor);
  let attack = Math.floor(characterLevel / 2) + classModLevel + proficiency;
  let save = 10 + Math.floor(characterLevel / 2) + proficiency;
  if (isCelestialModeActive(actor)) {
    if (classModLevel >= 5) { attack += 5; save += 3; }
    else { attack += 3; save += 2; }
  }
  return {attack, save};
}

function buildTenseiganChanges(actor) {
  const changes = [];
  // Perfect Vision and Celestial Oversight are minimum ranges rather than additive bonuses.
  addChange(changes, "system.attributes.senses.ranges.truesight", 500, CONST.ACTIVE_EFFECT_MODES.UPGRADE, 30);
  addChange(changes, "system.attributes.senses.ranges.darkvision", 15840, CONST.ACTIVE_EFFECT_MODES.UPGRADE, 30);
  addChange(changes, "system.attributes.senses.ranges.chakrasight", 5280, CONST.ACTIVE_EFFECT_MODES.UPGRADE, 30);
  addChange(changes, "system.attributes.senses.special", "Otherworldly Sight: pocket dimensions, spatial distortions, and living or dead souls", CONST.ACTIVE_EFFECT_MODES.ADD, 20);
  if (getTenseiganLevel(actor) >= 2) {
    addChange(changes, "system.traits.ci.value", "blinded", CONST.ACTIVE_EFFECT_MODES.ADD);
    addChange(changes, "system.traits.ci.value", "dazzled", CONST.ACTIVE_EFFECT_MODES.ADD);
  }
  return changes;
}

function getSourceMovement(actor, key, fallback=0) {
  const source = actor?._source?.system?.attributes?.movement?.[key];
  if (Number.isFinite(Number(source))) return Math.max(0, Number(source));
  return Math.max(0, Number(actor?.system?.attributes?.movement?.[key] ?? fallback));
}

function buildCelestialModeChanges(actor) {
  const changes = [];
  const eternal = getTenseiganLevel(actor) >= 5;
  const score = eternal ? 30 : 24;
  const baseWalk = getSourceMovement(actor, "walk", 30);
  const modeWalk = eternal ? baseWalk + 300 : baseWalk;
  addChange(changes, "system.abilities.str.value", score, CONST.ACTIVE_EFFECT_MODES.OVERRIDE, 30);
  addChange(changes, "system.abilities.dex.value", score, CONST.ACTIVE_EFFECT_MODES.OVERRIDE, 30);
  addChange(changes, "system.abilities.wis.value", score, CONST.ACTIVE_EFFECT_MODES.OVERRIDE, 30);
  if (eternal) addChange(changes, "system.attributes.movement.walk", 300, CONST.ACTIVE_EFFECT_MODES.ADD, 20);
  addChange(changes, "system.attributes.movement.fly", modeWalk, CONST.ACTIVE_EFFECT_MODES.OVERRIDE, 30);
  addChange(changes, "system.traits.dm.amount.ALL", eternal ? -25 : -10, CONST.ACTIVE_EFFECT_MODES.ADD, 20);
  addChange(changes, "system.attributes.ac.bonus", eternal ? 3 : 2, CONST.ACTIVE_EFFECT_MODES.ADD, 20);
  return changes;
}

async function refreshTenseiganEffects(actor) {
  const eye = getTenseiganEffect(actor);
  if (eye) await eye.update({changes:buildTenseiganChanges(actor)}, {[KAMA_INTERNAL_OPTION]: {refreshTenseigan:true}});
  const mode = getCelestialModeEffect(actor);
  if (mode) await mode.update({
    name:getTenseiganLevel(actor) >= 5 ? "Eternal Celestial Chakra Mode — Active" : "Celestial Chakra Mode — Active",
    changes:buildCelestialModeChanges(actor)
  }, {[KAMA_INTERNAL_OPTION]: {refreshCelestialMode:true}});
  await ensureTenseiganArtsFormulas(actor);
}

async function toggleTenseigan(actor) {
  actor ??= canvas.tokens?.controlled?.[0]?.actor ?? game.user.character;
  if (!actor) return ui.notifications.warn("No character is selected for Tenseigan.");
  const effect = getTenseiganEffect(actor);
  if (!effect) return ui.notifications.warn("This character does not possess the Tenseigan feature.");
  await ensureTenseiganTracker(actor);
  const activating = effect.disabled;
  if (activating) {
    const chakra = Number(actor.system?.attributes?.chakra?.value ?? 0);
    if (chakra < 4) return ui.notifications.warn("Tenseigan requires 4 Chakra to activate.");
    await actor.update({"system.attributes.chakra.value": chakra - 4}, {[KAMA_INTERNAL_OPTION]: {tenseiganActivation:true}});
  }
  const permanent = getTenseiganLevel(actor) >= 3;
  await effect.update({
    disabled:!activating,
    changes:buildTenseiganChanges(actor),
    "duration.startTime":activating ? game.time.worldTime : null,
    "duration.startRound":activating ? (game.combat?.round ?? null) : null,
    "duration.startTurn":activating ? (game.combat?.turn ?? null) : null,
    "duration.seconds":activating && !permanent ? 600 : null,
    "duration.rounds":activating && !permanent ? 100 : null
  }, {[KAMA_INTERNAL_OPTION]: {toggleTenseigan:true}});
  if (!activating) {
    const mode = getCelestialModeEffect(actor);
    if (mode && !mode.disabled) await mode.update({disabled:true}, {[KAMA_INTERNAL_OPTION]: {toggleCelestialMode:true}});
  }
  await ensureTenseiganArtsFormulas(actor);
  ui.notifications.info(`Tenseigan ${activating ? "activated" : "deactivated"}.`);
}

async function toggleCelestialChakraMode(actor) {
  actor ??= canvas.tokens?.controlled?.[0]?.actor ?? game.user.character;
  if (!actor) return ui.notifications.warn("No character is selected for Celestial Chakra Mode.");
  if (getTenseiganLevel(actor) < 3) return ui.notifications.warn("Celestial Chakra Mode requires Tenseigan Class Mod level 3.");
  if (!isTenseiganActive(actor)) return ui.notifications.warn("Activate the Tenseigan first.");
  const effect = getCelestialModeEffect(actor);
  if (!effect) return ui.notifications.warn("The Celestial Chakra Mode feature is missing.");
  const activating = effect.disabled;
  await effect.update({
    disabled:!activating,
    changes:buildCelestialModeChanges(actor),
    "duration.startTime":activating ? game.time.worldTime : null,
    "duration.startRound":activating ? (game.combat?.round ?? null) : null,
    "duration.startTurn":activating ? (game.combat?.turn ?? null) : null,
    "duration.seconds":activating ? 600 : null,
    "duration.rounds":activating ? 100 : null
  }, {[KAMA_INTERNAL_OPTION]: {toggleCelestialMode:true}});
  await ensureTenseiganArtsFormulas(actor);
  actor.sheet?.render?.(false);
  ui.notifications.info(`Celestial Chakra Mode ${activating ? "activated" : "deactivated"}.`);
}

function getCelestialStrainEffect(actor) {
  return asArray(actor?.effects).find(effect => effect.getFlag?.(MODULE_ID, "celestialStrainEffect"));
}

async function syncCelestialStrainEffect(actor, suppliedState) {
  if (!actor?.isOwner) return;
  const state = suppliedState ?? readTenseiganTracker(actor);
  const rank = state.celestialStrain;
  const changes = [];
  if (rank >= 1) addChange(changes, "system.attributes.hp.bonuses.overall", -(rank * (rank >= 25 ? 4 : 2)));
  const penalize = (ability, amount) => {
    addChange(changes, `system.abilities.${ability}.bonuses.check`, amount);
    addChange(changes, `system.abilities.${ability}.bonuses.save`, amount);
  };
  if (rank >= 5) penalize("con", -2);
  if (rank >= 8) penalize("str", -2);
  if (rank >= 11) penalize("dex", -2);
  if (rank >= 23) for (const ability of ["str","dex","con"]) penalize(ability, -2);
  let effect = getCelestialStrainEffect(actor);
  const data = {
    name:`Celestial Strain — ${rank}`,
    img:"icons/magic/control/debuff-energy-hold-levitate-blue.webp",
    disabled:rank === 0,
    transfer:false,
    changes,
    flags:{[MODULE_ID]:{celestialStrainEffect:true}}
  };
  if (!effect) [effect] = await actor.createEmbeddedDocuments("ActiveEffect", [data], {[KAMA_INTERNAL_OPTION]: {celestialStrain:true}});
  else await effect.update(data, {[KAMA_INTERNAL_OPTION]: {celestialStrain:true}});
}

function findAvailableClassDie(actor, kind) {
  const classes = asArray(actor?.system?.attributes?.[kind]?.classes);
  return classes.find(item => Number(item?.system?.[kind]?.value ?? 0) > 0)
    ?? asArray(Object.values(actor?.classes ?? {})).find(item => Number(item?.system?.[kind]?.value ?? 0) > 0);
}

async function spendActorClassDie(actor, kind, optionKey) {
  const aggregate = Number(actor?.system?.attributes?.[kind]?.value ?? 0);
  if (aggregate < 1) return false;
  const cls = findAvailableClassDie(actor, kind);
  if (cls) {
    const spent = Number(cls.system?.[kind]?.spent ?? 0);
    await cls.update({[`system.${kind}.spent`]:spent + 1}, {[KAMA_INTERNAL_OPTION]: {[optionKey]:true}});
    return true;
  }
  const spent = Number(actor?._source?.system?.attributes?.[kind]?.spent ?? actor?.system?.attributes?.[kind]?.spent ?? 0);
  await actor.update({[`system.attributes.${kind}.spent`]:spent + 1}, {[KAMA_INTERNAL_OPTION]: {[optionKey]:true}});
  return true;
}

async function spendTenseiganHitDie(actor) {
  const state = readTenseiganTracker(actor);
  if (getTenseiganLevel(actor) < 3) return ui.notifications.warn("This option unlocks at Tenseigan Class Mod level 3.");
  if (state.celestialStrain <= 0) return ui.notifications.warn("There is no Celestial Strain to reduce.");
  if (!await spendActorClassDie(actor, "hd", "tenseiganHitDie")) return ui.notifications.warn("No Hit Dice remain.");
  await updateTenseiganTracker(actor, {celestialStrain:state.celestialStrain - 1});
}

async function restoreTenseiganOrb(actor) {
  const state = readTenseiganTracker(actor);
  if (getTenseiganLevel(actor) < 4 || state.truthSeekingOrbs >= 6) return;
  if (!await spendActorClassDie(actor, "cd", "tenseiganOrb")) return ui.notifications.warn("No Chakra Dice remain.");
  await updateTenseiganTracker(actor, {truthSeekingOrbs:state.truthSeekingOrbs + 1});
}

async function recuperateCelestialStrain(actor) {
  const state = readTenseiganTracker(actor);
  const roll = await new Roll("2d4").evaluate();
  await roll.toMessage({flavor:`${actor.name}: one week of Celestial Strain recuperation`, speaker:ChatMessage.getSpeaker({actor})});
  await updateTenseiganTracker(actor, {celestialStrain:Math.max(0, state.celestialStrain - Number(roll.total ?? 0))});
}

async function applyTenseiganRest(actor, type) {
  const state = await ensureTenseiganTracker(actor);
  if (type === "short") {
    if (state.celestialChakra >= state.celestialChakraMax) return;
    if (state.shortRestRecoveries >= 2) return ui.notifications.warn("Celestial Chakra has already been recovered twice since the last Long Rest.");
    await updateTenseiganTracker(actor, {
      celestialChakra:Math.min(state.celestialChakraMax, state.celestialChakra + Math.ceil(state.celestialChakraMax / 2)),
      shortRestRecoveries:state.shortRestRecoveries + 1
    });
  } else if (type === "long") {
    await updateTenseiganTracker(actor, {
      celestialChakra:state.longRestRecoveryUsed ? state.celestialChakra : state.celestialChakraMax,
      longRestRecoveryUsed:true,
      shortRestRecoveries:0,
      truthSeekingOrbs:getTenseiganLevel(actor) >= 4 ? 6 : 0
    });
  } else if (type === "full") {
    await updateTenseiganTracker(actor, {
      celestialChakra:state.celestialChakraMax,
      celestialStrain:Math.max(0, state.celestialStrain - 1),
      shortRestRecoveries:0,
      longRestRecoveryUsed:false,
      truthSeekingOrbs:getTenseiganLevel(actor) >= 4 ? 6 : 0
    });
  }
}

function getTenseiganActivityItem(activity) {
  return activity?.item ?? activity?.parent?.item ?? null;
}

function itemRequiresConcentration(item) {
  const properties = item?.system?.properties;
  const propertyList = properties?.has ? properties : new Set(asArray(properties));
  return propertyList.has?.("concentration") || item?.system?.components?.concentration === true;
}

function checkTenseiganActivityUse(activity) {
  const item = getTenseiganActivityItem(activity);
  const actor = activity?.actor ?? item?.actor;
  if (!actor || !getTenseiganClassMod(actor)) return;
  const state = readTenseiganTracker(actor);
  if (isTenseiganActive(actor) && state.celestialStrain >= 20 && itemRequiresConcentration(item)) {
    ui.notifications.warn("Celestial Strain 20 prevents maintaining Concentration while the Tenseigan is active.");
    return false;
  }
  const chakraCost = Number(item?.getFlag?.(MODULE_ID, "celestialChakraCost") ?? 0);
  const orbCost = Number(item?.getFlag?.(MODULE_ID, "truthSeekingOrbCost") ?? 0);
  if (!chakraCost && !orbCost) return;
  if (!isTenseiganActive(actor)) {
    ui.notifications.warn("The Tenseigan must be active to use this technique.");
    return false;
  }
  if (chakraCost > state.celestialChakra) {
    ui.notifications.warn(`${item.name} requires ${chakraCost} Celestial Chakra; only ${state.celestialChakra} remains.`);
    return false;
  }
  if (orbCost > state.truthSeekingOrbs) {
    ui.notifications.warn(`${item.name} requires ${orbCost} Truth-Seeking Orbs; only ${state.truthSeekingOrbs} remain.`);
    return false;
  }
}

async function processTenseiganActivityUse(activity) {
  const item = getTenseiganActivityItem(activity);
  const actor = activity?.actor ?? item?.actor;
  if (!actor || !getTenseiganClassMod(actor)) return;
  const chakraCost = Number(item?.getFlag?.(MODULE_ID, "celestialChakraCost") ?? 0);
  const orbCost = Number(item?.getFlag?.(MODULE_ID, "truthSeekingOrbCost") ?? 0);
  if (!chakraCost && !orbCost) return;
  const state = await ensureTenseiganTracker(actor);
  const patch = {
    celestialChakra:Math.max(0, state.celestialChakra - chakraCost),
    celestialStrain:Math.min(TENSEIGAN_STRAIN_MAX, state.celestialStrain + (chakraCost ? 2 : 0)),
    truthSeekingOrbs:Math.max(0, state.truthSeekingOrbs - orbCost)
  };
  if (item.getFlag?.(MODULE_ID, "celestialArt")) {
    const identifier = item.system?.identifier ?? item.id;
    const artUses = {...state.artUses, [identifier]:(state.artUses?.[identifier] ?? 0) + 1};
    patch.artUses = artUses;
    if (artUses[identifier] === state.masteryTarget) ui.notifications.info(`${item.name} is now Mastered.`);
  }
  await updateTenseiganTracker(actor, patch);
}

function isTenseiganLibraryItem(item) {
  if (!item) return false;
  if (item.type === "classmod" && item.system?.identifier === "tenseigan") return true;
  if (item.getFlag?.(MODULE_ID, "classMod") === "tenseigan") return true;
  return Boolean(
    item.getFlag?.(MODULE_ID, "celestialArt")
    || item.getFlag?.(MODULE_ID, "tenseiganController")
    || item.getFlag?.(MODULE_ID, "celestialChakraModeController")
    || item.getFlag?.(MODULE_ID, "truthSeekingOrbCost")
  );
}

async function migrateTenseiganIcons(actor) {
  const updates = asArray(actor?.items)
    .filter(isTenseiganLibraryItem)
    .filter(item => !item.img || TENSEIGAN_LEGACY_ICONS.has(item.img))
    .map(item => ({_id:item.id, img:TENSEIGAN_FALLBACK_ICON}));
  if (updates.length) await actor.updateEmbeddedDocuments("Item", updates, {[KAMA_INTERNAL_OPTION]: {tenseiganIconMigration:true}});
}

async function migrateTenseiganActor(actor) {
  if (!getTenseiganClassMod(actor)) return;
  await migrateTenseiganIcons(actor);
  await ensureTenseiganTracker(actor);
  await ensureTenseiganArtsFormulas(actor);
  await syncCelestialStrainEffect(actor);
  await refreshTenseiganEffects(actor);
}

function tenseiganTrackerDialogKey(actor) {
  return actor?.uuid ?? actor?.id ?? actor?.name;
}

function buildTenseiganTrackerHtml(actor) {
  const state = readTenseiganTracker(actor);
  const arts = getOwnedCelestialArts(actor).sort((a,b) => a.name.localeCompare(b.name));
  const requiredMastered = Math.max(0, getTenseiganLevel(actor) - 1);
  const mastered = arts.filter(item => (state.artUses[item.system?.identifier ?? item.id] ?? 0) >= state.masteryTarget).length;
  const artRows = arts.length ? arts.map(item => {
    const id = item.system?.identifier ?? item.id;
    const count = state.artUses[id] ?? 0;
    const done = state.masteryTarget > 0 && count >= state.masteryTarget;
    return `<div class="mastery-row ${done ? 'mastered' : ''}"><span>${foundry.utils.escapeHTML?.(item.name) ?? item.name}</span><strong>${count}/${state.masteryTarget}</strong></div>`;
  }).join("") : '<p class="empty">No Celestial Arts are currently owned.</p>';
  return `<div class="n5eb-tenseigan-tracker-dialog" data-tenseigan-tracker-root>
    <p class="tracker-intro">All values are stored directly on <strong>${foundry.utils.escapeHTML?.(actor.name) ?? actor.name}</strong>; no item Uses fields are used.</p>
    <section class="tracker-card chakra"><header><strong>Celestial Chakra</strong><span data-value="chakra">${state.celestialChakra}/${state.celestialChakraMax}</span></header>
      <div class="tracker-progress"><span data-bar="chakra" style="width:${state.celestialChakraMax ? state.celestialChakra/state.celestialChakraMax*100 : 0}%"></span></div>
      <div class="tracker-controls"><button data-action="chakra-minus-5">−5</button><button data-action="chakra-minus">−1</button><input data-input="chakra" type="number" min="0" max="${state.celestialChakraMax}" value="${state.celestialChakra}"><button data-action="chakra-plus">+1</button><button data-action="chakra-plus-5">+5</button></div></section>
    <section class="tracker-card strain"><header><strong>Celestial Strain</strong><span data-value="strain">${state.celestialStrain}/${TENSEIGAN_STRAIN_MAX}</span></header>
      <div class="tracker-progress danger"><span data-bar="strain" style="width:${state.celestialStrain/TENSEIGAN_STRAIN_MAX*100}%"></span></div>
      <div class="tracker-controls"><button data-action="strain-minus">−1</button><input data-input="strain" type="number" min="0" max="${TENSEIGAN_STRAIN_MAX}" value="${state.celestialStrain}"><button data-action="strain-plus">+1</button></div>
      <p class="strain-warning">${state.celestialStrain >= 30 ? '4d6+4 Necrotic and Chakra damage at the start of each turn while Tenseigan is active.' : state.celestialStrain >= 20 ? 'Concentration cannot be maintained while Tenseigan is active.' : state.celestialStrain >= 15 ? '2d4+2 Necrotic and Chakra damage at the start of each turn while Tenseigan is active.' : 'No manual threshold effect is currently active.'}</p></section>
    <section class="tracker-card orbs"><header><strong>Truth-Seeking Orbs</strong><span data-value="orbs">${state.truthSeekingOrbs}/6</span></header><div class="orb-pips">${[1,2,3,4,5,6].map(i=>`<i class="${i<=state.truthSeekingOrbs?'filled':''}"></i>`).join('')}</div></section>
    <section class="tracker-card mastery"><header><strong>Celestial Art Mastery</strong><span>${mastered}/${requiredMastered} required for next level</span></header><p>Mastery target: <strong>${state.masteryTarget}</strong> uses per Art.</p><div class="mastery-list">${artRows}</div></section>
    <div class="tracker-actions"><button data-action="save"><i class="fas fa-floppy-disk"></i> Save Values</button><button data-action="short-rest"><i class="fas fa-campground"></i> Short Rest Recovery</button><button data-action="long-rest"><i class="fas fa-moon"></i> Long Rest Recovery</button><button data-action="full-rest"><i class="fas fa-bed"></i> Full Rest</button><button data-action="spend-hit-die">Spend Hit Die: −1 Strain</button><button data-action="restore-orb">Spend Chakra Die: +1 Orb</button><button data-action="recuperate">1 Week Recuperation (2d4)</button>${game.user.isGM?'<button data-action="reroll-mastery">Reroll Mastery Target</button><button data-action="reset">GM Reset</button>':''}</div>
  </div>`;
}

function refreshTenseiganTrackerRoot(root, actor) {
  if (!root) return;
  const replacement = document.createElement("div");
  replacement.innerHTML = buildTenseiganTrackerHtml(actor);
  root.replaceWith(replacement.firstElementChild);
}

function refreshOpenTenseiganTracker(actor) {
  const dialog = tenseiganTrackerDialogs.get(tenseiganTrackerDialogKey(actor));
  const root = dialog?.element?.querySelector?.("[data-tenseigan-tracker-root]");
  if (root) {
    refreshTenseiganTrackerRoot(root, actor);
    activateTenseiganTrackerDialog(dialog, actor);
  }
}

function activateTenseiganTrackerDialog(dialog, actor) {
  const root = dialog.element?.querySelector?.("[data-tenseigan-tracker-root]");
  if (!root || root.dataset.bound === "true") return;
  root.dataset.bound = "true";
  root.addEventListener("click", async event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    const state = readTenseiganTracker(actor);
    try {
      if (action === "chakra-minus") await updateTenseiganTracker(actor,{celestialChakra:state.celestialChakra-1});
      else if (action === "chakra-minus-5") await updateTenseiganTracker(actor,{celestialChakra:state.celestialChakra-5});
      else if (action === "chakra-plus") await updateTenseiganTracker(actor,{celestialChakra:state.celestialChakra+1});
      else if (action === "chakra-plus-5") await updateTenseiganTracker(actor,{celestialChakra:state.celestialChakra+5});
      else if (action === "strain-minus") await updateTenseiganTracker(actor,{celestialStrain:state.celestialStrain-1});
      else if (action === "strain-plus") await updateTenseiganTracker(actor,{celestialStrain:state.celestialStrain+1});
      else if (action === "save") await updateTenseiganTracker(actor,{celestialChakra:Number(root.querySelector('[data-input="chakra"]')?.value ?? state.celestialChakra),celestialStrain:Number(root.querySelector('[data-input="strain"]')?.value ?? state.celestialStrain)});
      else if (action === "short-rest") await applyTenseiganRest(actor,"short");
      else if (action === "long-rest") await applyTenseiganRest(actor,"long");
      else if (action === "full-rest") await applyTenseiganRest(actor,"full");
      else if (action === "spend-hit-die") await spendTenseiganHitDie(actor);
      else if (action === "restore-orb") await restoreTenseiganOrb(actor);
      else if (action === "recuperate") await recuperateCelestialStrain(actor);
      else if (action === "reroll-mastery" && game.user.isGM) await updateTenseiganTracker(actor,{masteryTarget:await rollTenseiganMasteryTarget(),artUses:{}});
      else if (action === "reset" && game.user.isGM) await updateTenseiganTracker(actor,{...defaultTenseiganTracker(actor),masteryTarget:await rollTenseiganMasteryTarget()});
    } catch (error) {
      console.error(`${MODULE_ID} | Tenseigan tracker update failed`, error);
      ui.notifications.error(`Tenseigan tracker could not be updated: ${error.message}`);
    }
  });
}

async function openTenseiganTracker(actor) {
  actor ??= canvas.tokens?.controlled?.[0]?.actor ?? game.user.character;
  if (!actor || !getTenseiganClassMod(actor)) return ui.notifications.warn("No Tenseigan character is selected.");
  const key = tenseiganTrackerDialogKey(actor);
  const existing = tenseiganTrackerDialogs.get(key);
  if (existing) return existing.bringToFront?.();
  await ensureTenseiganTracker(actor);
  const content = document.createElement("div");
  content.innerHTML = buildTenseiganTrackerHtml(actor);
  const DialogV2 = foundry.applications.api.DialogV2;
  const dialog = new DialogV2({window:{title:`Tenseigan Tracker — ${actor.name}`,icon:"fa-solid fa-eye",resizable:true},position:{width:620,height:"auto"},classes:["n5eb-tenseigan-tracker-window"],content,buttons:[{action:"close",label:"Close",icon:"fa-solid fa-xmark"}]});
  tenseiganTrackerDialogs.set(key,dialog);
  dialog.addEventListener("render",()=>activateTenseiganTrackerDialog(dialog,actor));
  dialog.addEventListener("close",()=>tenseiganTrackerDialogs.delete(key),{once:true});
  await dialog.render({force:true});
  return dialog;
}

function renderTenseiganTrackerStrip(app, html) {
  const actor = app.actor ?? app.document;
  if (!getTenseiganClassMod(actor)) return;
  const root = getRenderRoot(app, html);
  if (!root || root.querySelector("[data-tenseigan-tracker-strip]")) return;
  const target = root.querySelector(".jutsu-casting-overview") ?? root.querySelector(".sheet-body");
  if (!target) return;
  const state = readTenseiganTracker(actor);
  const section = document.createElement("section");
  section.className = "n5eb-tenseigan-tracker-strip";
  section.dataset.tenseiganTrackerStrip = "true";
  section.innerHTML = `<button type="button" class="tracker-title" data-action="open-tenseigan-tracker"><i class="fas fa-eye"></i> Tenseigan Tracking</button><div class="tracker-mini chakra"><span>Celestial Chakra</span><div><i style="width:${state.celestialChakraMax?state.celestialChakra/state.celestialChakraMax*100:0}%"></i></div><strong>${state.celestialChakra}/${state.celestialChakraMax}</strong></div><div class="tracker-mini strain"><span>Strain</span><div><i style="width:${state.celestialStrain/TENSEIGAN_STRAIN_MAX*100}%"></i></div><strong>${state.celestialStrain}</strong></div><div class="tracker-mini orbs"><span>Orbs</span><div class="orb-pips">${[1,2,3,4,5,6].map(i=>`<i class="${i<=state.truthSeekingOrbs?'filled':''}"></i>`).join('')}</div><strong>${state.truthSeekingOrbs}/6</strong></div>`;
  target.prepend(section);
  section.querySelector('[data-action="open-tenseigan-tracker"]')?.addEventListener("click",()=>openTenseiganTracker(actor));
}

/* ------------------------------------------------------------ */
/* Sealed Beast Redux runtime                                   */
/* ------------------------------------------------------------ */

const sealedBeastTrackerDialogs = new Map();

function clampSealed(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function getSealedBeastLevel(actor) {
  return Math.max(1, Number(getSealedBeastClassMod(actor)?.system?.levels ?? 1));
}

function getSealedBeastPath(actor) {
  return asArray(actor?.items).find(item => item.getFlag?.(MODULE_ID, "sealedBeastPath")) ?? null;
}

function getSealedBeastPathKey(actor) {
  return getSealedBeastPath(actor)?.getFlag?.(MODULE_ID, "sealedBeastPath") ?? "";
}

function getTwistedAwakeningMaximum(actor) {
  return SEALED_BEAST_AWAKENING_BY_LEVEL[getSealedBeastLevel(actor)] ?? 45;
}

function getTwistedAwakeningSpent(actor) {
  return asArray(actor?.items).reduce((total, item) => total + Math.max(0, Number(item.getFlag?.(MODULE_ID, "awakeningCost") ?? 0)), 0);
}

function getTwistedAwakeningBudget(actor) {
  const maximum = getTwistedAwakeningMaximum(actor);
  const spent = getTwistedAwakeningSpent(actor);
  return {maximum, spent, remaining: maximum - spent};
}

function defaultSealedBeastTracker() {
  return {
    version: SEALED_BEAST_TRACKER_VERSION,
    twistedChakra: 0,
    twistedHitPoints: 0,
    twistedHitPointsMax: 0,
    disposition: 50,
    dormantBeast: false,
    frenzy: false,
    transformation: "",
    transformationName: "None",
    transformationTier: 0,
    beastConquered: false,
    pactOfTrust: false,
    rageTriggerUsed: false,
    lastProcessedTurn: ""
  };
}

function normalizeSealedBeastTracker(value) {
  const base = {...defaultSealedBeastTracker(), ...(value ?? {})};
  return {
    version: SEALED_BEAST_TRACKER_VERSION,
    twistedChakra: Math.max(0, Math.floor(Number(base.twistedChakra) || 0)),
    twistedHitPoints: Math.max(0, Math.floor(Number(base.twistedHitPoints) || 0)),
    twistedHitPointsMax: Math.max(0, Math.floor(Number(base.twistedHitPointsMax) || 0)),
    disposition: clampSealed(Math.floor(Number(base.disposition) || 0), 0, 100),
    dormantBeast: Boolean(base.dormantBeast),
    frenzy: Boolean(base.frenzy),
    transformation: String(base.transformation ?? ""),
    transformationName: String(base.transformationName ?? "None"),
    transformationTier: Math.max(0, Math.floor(Number(base.transformationTier) || 0)),
    beastConquered: Boolean(base.beastConquered),
    pactOfTrust: Boolean(base.pactOfTrust),
    rageTriggerUsed: Boolean(base.rageTriggerUsed),
    lastProcessedTurn: String(base.lastProcessedTurn ?? "")
  };
}

function readSealedBeastTracker(actor) {
  return normalizeSealedBeastTracker(actor?.getFlag?.(MODULE_ID, SEALED_BEAST_TRACKER_FLAG));
}

async function ensureSealedBeastTracker(actor, {fresh=false}={}) {
  const existing = actor?.getFlag?.(MODULE_ID, SEALED_BEAST_TRACKER_FLAG);
  const state = fresh || !existing ? defaultSealedBeastTracker() : normalizeSealedBeastTracker(existing);
  if (fresh || !existing || JSON.stringify(existing) !== JSON.stringify(state)) {
    await actor.update({[`flags.${MODULE_ID}.${SEALED_BEAST_TRACKER_FLAG}`]:state}, {[KAMA_INTERNAL_OPTION]:{sealedTracker:true}});
  }
  return state;
}

async function updateSealedBeastTracker(actor, patch={}, {sync=true, render=true, autoFrenzy=true}={}) {
  if (!actor) return defaultSealedBeastTracker();
  const current = readSealedBeastTracker(actor);
  const next = normalizeSealedBeastTracker({...current, ...patch});
  if (next.twistedHitPoints > next.twistedHitPointsMax) next.twistedHitPoints = next.twistedHitPointsMax;
  await actor.update({[`flags.${MODULE_ID}.${SEALED_BEAST_TRACKER_FLAG}`]:next}, {[KAMA_INTERNAL_OPTION]:{sealedTracker:true}});
  if (sync) await refreshSealedBeastEffects(actor, next);
  if (autoFrenzy) await checkSealedBeastAutomaticFrenzy(actor, next);
  if (render) {
    refreshOpenSealedBeastTracker(actor);
    actor.sheet?.render?.(false);
  }
  return readSealedBeastTracker(actor);
}

function calculateSealedBeastArtValues(actor) {
  const proficiency = Math.max(0, Number(actor?.system?.attributes?.prof ?? 0));
  const classModLevel = getSealedBeastLevel(actor);
  return {attack:(2 * proficiency) + classModLevel, save:12 + classModLevel + proficiency};
}

function getSealedManagedEffect(actor, flag) {
  return asArray(actor?.effects).find(effect => effect.getFlag?.(MODULE_ID, flag));
}

async function upsertSealedEffect(actor, flag, name, img, active, changes) {
  let effect = getSealedManagedEffect(actor, flag);
  const data = {name, img, disabled:!active, transfer:false, changes, flags:{[MODULE_ID]:{[flag]:true}}};
  if (!effect) {
    [effect] = await actor.createEmbeddedDocuments("ActiveEffect", [data], {[KAMA_INTERNAL_OPTION]:{sealedEffect:true}});
  } else {
    await effect.update({name, img, disabled:!active, changes}, {[KAMA_INTERNAL_OPTION]:{sealedEffect:true}});
  }
  return effect;
}

function buildDormantBeastChanges() {
  return [
    {key:"system.abilities.str.value",mode:CONST.ACTIVE_EFFECT_MODES.ADD,value:"2",priority:20},
    {key:"system.abilities.dex.value",mode:CONST.ACTIVE_EFFECT_MODES.ADD,value:"2",priority:20}
  ];
}

function buildFrenzyChanges(actor) {
  const changes = [];
  for (const ability of ["str","dex"]) {
    const value = Number(actor?.system?.abilities?.[ability]?.value ?? 10);
    if (value < 18) changes.push({key:`system.abilities.${ability}.value`,mode:CONST.ACTIVE_EFFECT_MODES.ADD,value:String(18-value),priority:30});
  }
  changes.push({key:"system.attributes.movement.walk",mode:CONST.ACTIVE_EFFECT_MODES.MULTIPLY,value:"2",priority:30});
  return changes;
}

function findOwnedTransformation(actor, key) {
  return asArray(actor?.items).find(item => item.getFlag?.(MODULE_ID, "sealedTransformation")?.key === key) ?? null;
}

function buildTransformationChanges(actor, state) {
  const item = findOwnedTransformation(actor, state.transformation);
  const data = item?.getFlag?.(MODULE_ID, "sealedTransformation") ?? {};
  const changes = [];
  const speed = Number(data.speed ?? 0);
  const ability = Number(data.ability ?? 0);
  const save = Number(data.save ?? 0);
  if (speed) changes.push({key:"system.attributes.movement.walk",mode:CONST.ACTIVE_EFFECT_MODES.ADD,value:String(speed),priority:25});
  if (ability) {
    changes.push(
      {key:"system.abilities.str.value",mode:CONST.ACTIVE_EFFECT_MODES.ADD,value:String(ability),priority:25},
      {key:"system.abilities.dex.value",mode:CONST.ACTIVE_EFFECT_MODES.ADD,value:String(ability),priority:25}
    );
  }
  if (save) changes.push({key:"system.bonuses.abilities.save",mode:CONST.ACTIVE_EFFECT_MODES.ADD,value:String(save),priority:25});
  if (data.attackByLevel) {
    const bonus = 2 * getSealedBeastLevel(actor);
    for (const key of ["mwak","rwak","msak","rsak"]) changes.push({key:`system.bonuses.${key}.attack`,mode:CONST.ACTIVE_EFFECT_MODES.ADD,value:String(bonus),priority:25});
    for (const type of ["ninjutsu","genjutsu","taijutsu"]) changes.push({key:`system.attributes.jutsu.${type}.bonuses.attack`,mode:CONST.ACTIVE_EFFECT_MODES.ADD,value:String(bonus),priority:25});
  }
  return changes;
}

async function refreshSealedBeastEffects(actor, suppliedState) {
  if (!actor?.isOwner || !getSealedBeastClassMod(actor)) return;
  const state = suppliedState ?? readSealedBeastTracker(actor);
  await upsertSealedEffect(actor,"dormantBeastEffect","Dormant Beast","modules/n5eb-classmod-library/assets/sealed-beast-redux.png",state.dormantBeast,buildDormantBeastChanges());
  await upsertSealedEffect(actor,"sealedFrenzyEffect","Frenzy","modules/n5eb-classmod-library/assets/sealed-beast-redux.png",state.frenzy,buildFrenzyChanges(actor));
  await upsertSealedEffect(actor,"sealedTransformationEffect",state.transformationName || "Sealed Beast Transformation","modules/n5eb-classmod-library/assets/sealed-beast-redux.png",Boolean(state.transformation),buildTransformationChanges(actor,state));
}

function getNormalChakra(actor) {
  return Math.max(0, Number(actor?.system?.attributes?.chakra?.value ?? 0));
}

function getNormalChakraMaximum(actor) {
  return Math.max(0, Number(actor?.system?.attributes?.chakra?.max ?? actor?.system?.attributes?.chakra?.value ?? 0));
}

async function setNormalChakra(actor, value) {
  await actor.update({"system.attributes.chakra.value":clampSealed(Math.floor(value),0,getNormalChakraMaximum(actor))}, {[KAMA_INTERNAL_OPTION]:{sealedResource:true}});
}

function calculateDesperateRageDC(actor) {
  const level = getSealedBeastLevel(actor);
  const path = getSealedBeastPathKey(actor);
  if (path === "path-of-dominion") {
    if (level >= 4) return Math.max(1, 12 - level);
    if (level >= 3) return 12;
  }
  if (path === "path-of-partnership" && level >= 4) return 12;
  return 12 + level;
}

function calculateDispositionRageBonus(actor, state=readSealedBeastTracker(actor)) {
  const level = getSealedBeastLevel(actor);
  if (state.disposition >= 75) return level;
  if (state.disposition <= 25) return -level;
  return 0;
}

function transformationPreventsFrenzy(actor, state=readSealedBeastTracker(actor)) {
  const item = findOwnedTransformation(actor,state.transformation);
  return Boolean(item?.getFlag?.(MODULE_ID,"sealedTransformation")?.preventsFrenzy);
}

async function checkSealedBeastAutomaticFrenzy(actor, suppliedState) {
  const state = suppliedState ?? readSealedBeastTracker(actor);
  if (state.frenzy || transformationPreventsFrenzy(actor,state)) return;
  if (getSealedBeastPathKey(actor) === "path-of-dominion") return;
  if (getSealedBeastPathKey(actor) === "path-of-the-beast" && state.pactOfTrust) return;
  if (state.twistedChakra > getNormalChakra(actor)) await setSealedBeastFrenzy(actor,true,{reason:"Twisted Chakra exceeded normal Chakra"});
}

async function toggleDormantBeast(actor) {
  actor ??= canvas.tokens?.controlled?.[0]?.actor ?? game.user.character;
  if (!actor || !getSealedBeastClassMod(actor)) return ui.notifications.warn("No Sealed Beast Redux character is selected.");
  const state = await ensureSealedBeastTracker(actor);
  const active = !state.dormantBeast;
  await updateSealedBeastTracker(actor,{dormantBeast:active},{autoFrenzy:false});
  if (active) await processDormantBeastTurn(actor,{activation:true});
  ui.notifications.info(`Dormant Beast ${active ? "activated" : "deactivated"}.`);
}

async function setSealedBeastFrenzy(actor, active, {reason=""}={}) {
  const state = await ensureSealedBeastTracker(actor);
  if (state.frenzy === active) return state;
  if (active) {
    const hp = actor.system?.attributes?.hp ?? {};
    const maximum = Number(hp.max ?? 0);
    const current = Number(hp.value ?? 0);
    const temporary = Number(hp.temp ?? 0);
    const healed = current + 25;
    const overflow = Math.max(0, healed - maximum);
    await actor.update({
      "system.attributes.hp.value":Math.min(maximum,healed),
      "system.attributes.hp.temp":Math.max(temporary,overflow)
    }, {[KAMA_INTERNAL_OPTION]:{sealedFrenzy:true}});
    await updateSealedBeastTracker(actor,{frenzy:true,dormantBeast:true},{autoFrenzy:false});
    if (reason) ui.notifications.warn(`Frenzy: ${reason}`);
  } else await updateSealedBeastTracker(actor,{frenzy:false},{autoFrenzy:false});
  return readSealedBeastTracker(actor);
}

async function rollSealedBeastCheck(actor, ability, label, bonus=0) {
  const data = actor.getRollData?.() ?? actor.system ?? {};
  const roll = await (new Roll(`1d20 + @abilities.${ability}.mod + ${Number(bonus)||0}`,data)).evaluate();
  await roll.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:label});
  return roll.total;
}

async function rollDesperateRage(actor) {
  actor ??= canvas.tokens?.controlled?.[0]?.actor ?? game.user.character;
  if (!actor || !getSealedBeastClassMod(actor)) return ui.notifications.warn("No Sealed Beast Redux character is selected.");
  const state = await ensureSealedBeastTracker(actor);
  const dc = calculateDesperateRageDC(actor);
  const bonus = calculateDispositionRageBonus(actor,state);
  const total = await rollSealedBeastCheck(actor,"cha",`Desperate Rage Check vs DC ${dc}`,bonus);
  if (total >= dc) return ui.notifications.info(`Desperate Rage resisted (${total} vs DC ${dc}).`);
  const amount = Math.min(getNormalChakra(actor),2 * Math.max(0,Number(actor.system?.details?.level ?? 0)));
  await setNormalChakra(actor,getNormalChakra(actor)-amount);
  await updateSealedBeastTracker(actor,{twistedChakra:state.twistedChakra+amount,rageTriggerUsed:true},{autoFrenzy:false,render:false});
  await setSealedBeastFrenzy(actor,true,{reason:`failed Desperate Rage check (${total} vs DC ${dc})`});
}

async function attemptEndSealedBeastFrenzy(actor) {
  actor ??= canvas.tokens?.controlled?.[0]?.actor ?? game.user.character;
  if (!actor || !getSealedBeastClassMod(actor)) return;
  const state = readSealedBeastTracker(actor);
  if (!state.frenzy) return ui.notifications.info("This character is not Frenzied.");
  const dc = calculateDesperateRageDC(actor);
  const total = await rollSealedBeastCheck(actor,"cha",`End Frenzy Check vs DC ${dc}`,calculateDispositionRageBonus(actor,state));
  if (total < dc) return ui.notifications.warn(`Frenzy continues (${total} vs DC ${dc}).`);
  const nextTwisted = Math.floor(state.twistedChakra / 2);
  const reduced = state.twistedChakra - nextTwisted;
  const damage = getSealedBeastLevel(actor) >= 3 ? Math.floor(reduced/2) : reduced;
  const hp = Number(actor.system?.attributes?.hp?.value ?? 0);
  await actor.update({"system.attributes.hp.value":Math.max(0,hp-damage)}, {[KAMA_INTERNAL_OPTION]:{sealedFrenzy:true}});
  await updateSealedBeastTracker(actor,{twistedChakra:nextTwisted,frenzy:nextTwisted >= getNormalChakra(actor)},{autoFrenzy:false});
  ui.notifications.info(`Twisted Chakra reduced by ${reduced}; ${damage} unavoidable Necrotic damage applied.${nextTwisted >= getNormalChakra(actor) ? " Frenzy continues because Twisted Chakra is not below normal Chakra." : " Frenzy ends."}`);
}

function getDormantConversion(actor,state) {
  const level = getSealedBeastLevel(actor);
  const path = getSealedBeastPathKey(actor);
  if (path === "path-of-dominion") return level >= 5 ? 4 : 2;
  if (path === "path-of-wrath") return clampSealed(level,2,5);
  if (path === "path-of-the-beast" && state.beastConquered && level >= 4) return 4;
  return 1;
}

async function processDormantBeastTurn(actor,{activation=false}={}) {
  const state = await ensureSealedBeastTracker(actor);
  if (!state.dormantBeast) return;
  const path = getSealedBeastPathKey(actor);
  if (path === "path-of-the-beast" && state.pactOfTrust && getSealedBeastLevel(actor) >= 5) {
    await updateSealedBeastTracker(actor,{twistedChakra:Math.max(state.twistedChakra,500)},{autoFrenzy:false});
    return;
  }
  const proficiency = Math.max(1,Number(actor.system?.attributes?.prof ?? 1));
  const loss = proficiency * (state.frenzy ? 2 : 1);
  const available = getNormalChakra(actor);
  const actualLoss = Math.min(available,loss);
  const gain = actualLoss * getDormantConversion(actor,state);
  await setNormalChakra(actor,available-actualLoss);
  await updateSealedBeastTracker(actor,{twistedChakra:state.twistedChakra+gain},{render:false});
  if (state.frenzy && getNormalChakra(actor) <= 0 && path !== "path-of-wrath") ui.notifications.error(`${actor.name} has reached 0 Chakra during Frenzy; the sealed beast is released unless the GM rules otherwise.`);
  if (activation) actor.sheet?.render?.(false);
}

async function grantSealedTransformationTempHP(actor, amount) {
  const current = Number(actor.system?.attributes?.hp?.temp ?? 0);
  const prior = actor.getFlag(MODULE_ID,"sealedTransformationTempHP");
  const baseline = prior?.active ? Number(prior.baseline ?? current) : current;
  const next = Math.max(current,Math.max(0,amount));
  await actor.update({
    "system.attributes.hp.temp":next,
    [`flags.${MODULE_ID}.sealedTransformationTempHP`]:{active:true,baseline,granted:Math.max(0,amount)}
  }, {[KAMA_INTERNAL_OPTION]:{sealedTransformation:true}});
}

async function removeSealedTransformationTempHP(actor) {
  const prior = actor.getFlag(MODULE_ID,"sealedTransformationTempHP");
  if (!prior?.active) return;
  const current = Number(actor.system?.attributes?.hp?.temp ?? 0);
  await actor.update({
    "system.attributes.hp.temp":Math.min(current,Math.max(0,Number(prior.baseline ?? 0))),
    [`flags.${MODULE_ID}.-=sealedTransformationTempHP`]:null
  }, {[KAMA_INTERNAL_OPTION]:{sealedTransformation:true}});
}

async function activateSealedBeastTransformation(actor,item) {
  const data = item?.getFlag?.(MODULE_ID,"sealedTransformation");
  if (!data) return;
  await removeSealedTransformationTempHP(actor);
  const resilience = asArray(actor.items).some(i => i.system?.identifier === "twisted-resilience");
  const tier = Math.max(1,Number(data.tier ?? 1));
  const bonus = resilience ? 5*tier : 0;
  const maxTwistedHP = Math.max(0,Number(data.twistedHP ?? 0)+bonus);
  const patch = {
    transformation:data.key,
    transformationName:item.name,
    transformationTier:tier,
    twistedHitPoints:maxTwistedHP,
    twistedHitPointsMax:maxTwistedHP,
    ...(data.preventsFrenzy ? {frenzy:false} : {})
  };
  await updateSealedBeastTracker(actor,patch,{autoFrenzy:false,render:false});
  await grantSealedTransformationTempHP(actor,Number(data.temporaryHP ?? 0));
  await refreshSealedBeastEffects(actor,readSealedBeastTracker(actor));
  actor.sheet?.render?.(false);
  ui.notifications.info(`${item.name} activated.`);
}

async function clearSealedBeastTransformation(actor) {
  actor ??= canvas.tokens?.controlled?.[0]?.actor ?? game.user.character;
  if (!actor || !getSealedBeastClassMod(actor)) return;
  await removeSealedTransformationTempHP(actor);
  await updateSealedBeastTracker(actor,{transformation:"",transformationName:"None",transformationTier:0,twistedHitPoints:0,twistedHitPointsMax:0},{autoFrenzy:true});
}

async function processSealedBeastTurn(actor,combat) {
  if (!actor || !getSealedBeastClassMod(actor)) return;
  const state = await ensureSealedBeastTracker(actor);
  const turnKey = `${combat?.id ?? "combat"}:${combat?.round ?? 0}:${combat?.turn ?? 0}`;
  if (state.lastProcessedTurn === turnKey) return;
  const patch = {lastProcessedTurn:turnKey};
  if (state.transformation && state.twistedHitPointsMax > 0) patch.twistedHitPoints=state.twistedHitPointsMax;
  await updateSealedBeastTracker(actor,patch,{autoFrenzy:false,render:false});
  if (state.dormantBeast) await processDormantBeastTurn(actor);
  if (state.frenzy && getSealedBeastLevel(actor) >= 2) ui.notifications.warn(`${actor.name} is Frenzied: a Wisdom check against Desperate Rage DC ${calculateDesperateRageDC(actor)} is required for Frenzied Drawbacks.`);
}

function checkSealedBeastActivityUse(activity) {
  const item = getTenseiganActivityItem(activity);
  const actor = activity?.actor ?? item?.actor;
  if (!actor || !getSealedBeastClassMod(actor)) return;
  const cost = Math.max(0,Number(item?.getFlag?.(MODULE_ID,"twistedChakraCost") ?? 0));
  if (!cost) return;
  const state = readSealedBeastTracker(actor);
  if (cost > state.twistedChakra) {
    ui.notifications.warn(`${item.name} requires ${cost} Twisted Chakra; only ${state.twistedChakra} remains.`);
    return false;
  }
  const requiresTransformation = Boolean(item.getFlag?.(MODULE_ID,"requiresTransformation"));
  const minimumTier = Number(item.getFlag?.(MODULE_ID,"minimumTransformationTier") ?? 0);
  if (requiresTransformation && !state.frenzy && !state.transformation) {
    ui.notifications.warn(`${item.name} requires an active Transformation Art or Frenzy.`);
    return false;
  }
  if (minimumTier && !state.frenzy && state.transformationTier < minimumTier) {
    ui.notifications.warn(`${item.name} requires a Tier ${minimumTier} Transformation Art or Frenzy.`);
    return false;
  }
}

async function processSealedBeastActivityUse(activity) {
  const item = getTenseiganActivityItem(activity);
  const actor = activity?.actor ?? item?.actor;
  if (!actor || !getSealedBeastClassMod(actor)) return;
  const cost = Math.max(0,Number(item?.getFlag?.(MODULE_ID,"twistedChakraCost") ?? 0));
  if (!cost) return;
  const state = await ensureSealedBeastTracker(actor);
  await updateSealedBeastTracker(actor,{twistedChakra:Math.max(0,state.twistedChakra-cost)},{autoFrenzy:false,render:false});
  if (state.frenzy) await setNormalChakra(actor,getNormalChakra(actor)-cost);
  if (item.getFlag?.(MODULE_ID,"sealedTransformation")) await activateSealedBeastTransformation(actor,item);
  else actor.sheet?.render?.(false);
}

function validateSealedBeastTalentCreation(item) {
  const actor = item?.parent;
  if (actor?.documentName !== "Actor") return;
  const cost = Math.max(0,Number(item.getFlag?.(MODULE_ID,"awakeningCost") ?? 0));
  if (!cost) return;
  if (!getSealedBeastClassMod(actor)) {
    ui.notifications.warn(`${item.name} requires the Sealed Beast Redux Class Mod.`);
    return false;
  }
  const identifier = item.system?.identifier;
  if (identifier && asArray(actor.items).some(owned => owned.system?.identifier === identifier)) {
    ui.notifications.warn(`${item.name} is already owned.`);
    return false;
  }
  const level = getSealedBeastLevel(actor);
  const minimum = Math.max(1,Number(item.getFlag?.(MODULE_ID,"minimumClassModLevel") ?? 1));
  if (level < minimum) {
    ui.notifications.warn(`${item.name} requires Sealed Beast Redux level ${minimum}.`);
    return false;
  }
  const ownedIdentifiers = new Set(asArray(actor.items).map(owned => owned.system?.identifier).filter(Boolean));
  const prerequisites = asArray(item.getFlag?.(MODULE_ID,"prerequisites"));
  const missing = prerequisites.filter(required => !ownedIdentifiers.has(required));
  if (missing.length) {
    ui.notifications.warn(`${item.name} is missing prerequisites: ${missing.join(", ")}.`);
    return false;
  }
  const budget = getTwistedAwakeningBudget(actor);
  if (cost > budget.remaining) {
    ui.notifications.warn(`${item.name} costs ${cost} Twisted Awakening Points; only ${budget.remaining} remain.`);
    return false;
  }
}

async function migrateSealedBeastActor(actor) {
  if (!getSealedBeastClassMod(actor)) return;
  await ensureSealedBeastTracker(actor);
  await ensureClassModArtsValues(actor,"sealed-beast-redux");
  await refreshSealedBeastEffects(actor);
}

function sealedTrackerDialogKey(actor) {
  return actor?.uuid ?? actor?.id;
}

function buildSealedBeastTrackerHtml(actor) {
  const state = readSealedBeastTracker(actor);
  const budget = getTwistedAwakeningBudget(actor);
  const dc = calculateDesperateRageDC(actor);
  return `<div class="n5eb-sealed-beast-tracker-dialog" data-sealed-beast-tracker-root>
    <p class="tracker-intro">All values are stored directly on <strong>${foundry.utils.escapeHTML?.(actor.name) ?? actor.name}</strong>. No item Uses fields are used.</p>
    <div class="tracker-grid">
      <label>Twisted Chakra<input type="number" min="0" step="1" data-input="twisted" value="${state.twistedChakra}"></label>
      <label>Twisted HP<input type="number" min="0" step="1" data-input="twisted-hp" value="${state.twistedHitPoints}"></label>
      <label>Twisted HP Maximum<input type="number" min="0" step="1" data-input="twisted-hp-max" value="${state.twistedHitPointsMax}"></label>
      <label>Disposition<input type="number" min="0" max="100" step="1" data-input="disposition" value="${state.disposition}"></label>
    </div>
    <section class="tracker-card"><header><strong>Twisted Awakening</strong><span>${budget.remaining} remaining / ${budget.maximum}</span></header><div class="tracker-progress"><span style="width:${budget.maximum ? clampSealed(budget.spent/budget.maximum*100,0,100) : 0}%"></span></div><small>${budget.spent} points spent by owned talents.</small></section>
    <section class="tracker-card status"><header><strong>Status</strong><span>Desperate Rage DC ${dc}</span></header>
      <div class="status-pills"><span class="${state.dormantBeast?'active':''}">Dormant Beast</span><span class="${state.frenzy?'active danger':''}">Frenzy</span><span class="${state.transformation?'active':''}">${foundry.utils.escapeHTML?.(state.transformationName) ?? state.transformationName}</span></div>
      <label><input type="checkbox" data-input="conquered" ${state.beastConquered?'checked':''}> Beast Conquered</label>
      <label><input type="checkbox" data-input="pact" ${state.pactOfTrust?'checked':''}> Pact of Trust</label>
    </section>
    <div class="tracker-actions">
      <button type="button" data-action="save"><i class="fas fa-floppy-disk"></i> Save Values</button>
      <button type="button" data-action="toggle-dormant"><i class="fas fa-paw"></i> Toggle Dormant Beast</button>
      <button type="button" data-action="rage-check"><i class="fas fa-dice-d20"></i> Desperate Rage Check</button>
      <button type="button" data-action="toggle-frenzy"><i class="fas fa-fire"></i> ${state.frenzy?'End Frenzy Check':'Enter Frenzy'}</button>
      <button type="button" data-action="process-turn"><i class="fas fa-forward-step"></i> Process Dormant Turn</button>
      <button type="button" data-action="clear-transformation"><i class="fas fa-person"></i> End Transformation</button>
      ${game.user.isGM?'<button type="button" data-action="reset"><i class="fas fa-rotate-left"></i> Reset Tracker</button>':''}
    </div>
  </div>`;
}

function refreshOpenSealedBeastTracker(actor) {
  const dialog = sealedBeastTrackerDialogs.get(sealedTrackerDialogKey(actor));
  if (!dialog?.element) return;
  const wrapper = dialog.element.querySelector("[data-sealed-beast-tracker-root]")?.parentElement;
  if (!wrapper) return;
  wrapper.innerHTML = buildSealedBeastTrackerHtml(actor);
  activateSealedBeastTrackerDialog(dialog,actor);
}

function activateSealedBeastTrackerDialog(dialog,actor) {
  const root = dialog.element.querySelector("[data-sealed-beast-tracker-root]");
  if (!root || root.dataset.activated === "true") return;
  root.dataset.activated="true";
  root.addEventListener("click",async event => {
    const button=event.target.closest("button[data-action]");
    if (!button) return;
    const action=button.dataset.action;
    try {
      if (action === "save") {
        await updateSealedBeastTracker(actor,{
          twistedChakra:Number(root.querySelector('[data-input="twisted"]')?.value ?? 0),
          twistedHitPoints:Number(root.querySelector('[data-input="twisted-hp"]')?.value ?? 0),
          twistedHitPointsMax:Number(root.querySelector('[data-input="twisted-hp-max"]')?.value ?? 0),
          disposition:Number(root.querySelector('[data-input="disposition"]')?.value ?? 50),
          beastConquered:Boolean(root.querySelector('[data-input="conquered"]')?.checked),
          pactOfTrust:Boolean(root.querySelector('[data-input="pact"]')?.checked)
        });
      } else if (action === "toggle-dormant") await toggleDormantBeast(actor);
      else if (action === "rage-check") await rollDesperateRage(actor);
      else if (action === "toggle-frenzy") {
        if (readSealedBeastTracker(actor).frenzy) await attemptEndSealedBeastFrenzy(actor);
        else await setSealedBeastFrenzy(actor,true,{reason:"manually activated"});
      } else if (action === "process-turn") await processDormantBeastTurn(actor);
      else if (action === "clear-transformation") await clearSealedBeastTransformation(actor);
      else if (action === "reset" && game.user.isGM) await updateSealedBeastTracker(actor,defaultSealedBeastTracker(),{autoFrenzy:false});
    } catch(error) {
      console.error(`${MODULE_ID} | Sealed Beast tracker action failed`,error);
      ui.notifications.error(`Sealed Beast tracker failed: ${error.message}`);
    }
    refreshOpenSealedBeastTracker(actor);
  });
}

async function openSealedBeastTracker(actor) {
  actor ??= canvas.tokens?.controlled?.[0]?.actor ?? game.user.character;
  if (!actor || !getSealedBeastClassMod(actor)) return ui.notifications.warn("No Sealed Beast Redux character is selected.");
  const key=sealedTrackerDialogKey(actor);
  const existing=sealedBeastTrackerDialogs.get(key);
  if (existing) return existing.bringToFront?.();
  await ensureSealedBeastTracker(actor);
  const content=document.createElement("div"); content.innerHTML=buildSealedBeastTrackerHtml(actor);
  const DialogV2=foundry.applications.api.DialogV2;
  const dialog=new DialogV2({window:{title:`Sealed Beast Tracker — ${actor.name}`,icon:"fa-solid fa-paw",resizable:true},position:{width:650,height:"auto"},classes:["n5eb-sealed-beast-tracker-window"],content,buttons:[{action:"close",label:"Close",icon:"fa-solid fa-xmark"}]});
  sealedBeastTrackerDialogs.set(key,dialog);
  dialog.addEventListener("render",()=>activateSealedBeastTrackerDialog(dialog,actor));
  dialog.addEventListener("close",()=>sealedBeastTrackerDialogs.delete(key),{once:true});
  await dialog.render({force:true}); return dialog;
}

function renderSealedBeastTrackerStrip(app,html) {
  const actor=app.actor ?? app.document;
  if (!getSealedBeastClassMod(actor)) return;
  const root=getRenderRoot(app,html);
  if (!root || root.querySelector("[data-sealed-beast-tracker-strip]")) return;
  const target=root.querySelector(".jutsu-casting-overview") ?? root.querySelector(".sheet-body");
  if (!target) return;
  const state=readSealedBeastTracker(actor); const budget=getTwistedAwakeningBudget(actor);
  const section=document.createElement("section"); section.className="n5eb-sealed-beast-tracker-strip"; section.dataset.sealedBeastTrackerStrip="true";
  section.innerHTML=`<button type="button" class="tracker-title" data-action="open-sealed-beast-tracker"><i class="fas fa-paw"></i> Sealed Beast</button><div class="tracker-mini"><span>Twisted Chakra</span><strong>${state.twistedChakra}</strong></div><div class="tracker-mini"><span>Twisted HP</span><strong>${state.twistedHitPoints}/${state.twistedHitPointsMax}</strong></div><div class="tracker-mini"><span>Awakening</span><strong>${budget.remaining}/${budget.maximum}</strong></div><div class="tracker-mini status"><span>${state.frenzy?'Frenzy':state.dormantBeast?'Dormant Beast':state.transformationName}</span></div>`;
  target.prepend(section);
  section.querySelector('[data-action="open-sealed-beast-tracker"]')?.addEventListener("click",()=>openSealedBeastTracker(actor));
}


/* ------------------------------------------------------------ */
/* Hooks                                                         */
/* ------------------------------------------------------------ */

Hooks.on("getActorSheetHeaderButtons", (sheet, buttons) => {
  const actor = sheet.actor ?? sheet.document;
  if (getKamaClassMod(actor)) {
    const active = getKamaEffect(actor)?.disabled === false;
    const tracker = readKamaTracker(actor);
    buttons.unshift({label:`DR ${tracker.divineRewrite}% · RD ${tracker.resonanceDisruption}`,class:"n5eb-kama-tracker-button",icon:"fas fa-chart-simple",onclick:() => openKamaTracker(actor)});
    buttons.unshift({label:active ? "Kāma Active" : "Kāma",class:"n5eb-kama-toggle",icon:"fas fa-diamond",onclick:() => toggleKama(actor)});
  }
  if (getTenseiganClassMod(actor)) {
    const tracker = readTenseiganTracker(actor);
    buttons.unshift({label:`CC ${tracker.celestialChakra}/${tracker.celestialChakraMax} · CS ${tracker.celestialStrain}`,class:"n5eb-tenseigan-tracker-button",icon:"fas fa-gauge-high",onclick:() => openTenseiganTracker(actor)});
    if (getTenseiganLevel(actor) >= 3) buttons.unshift({label:isCelestialModeActive(actor) ? "Celestial Mode Active" : "Celestial Mode",class:"n5eb-celestial-mode-toggle",icon:"fas fa-sun",onclick:() => toggleCelestialChakraMode(actor)});
    buttons.unshift({label:isTenseiganActive(actor) ? "Tenseigan Active" : "Tenseigan",class:"n5eb-tenseigan-toggle",icon:"fas fa-eye",onclick:() => toggleTenseigan(actor)});
  }
  if (getSealedBeastClassMod(actor)) {
    const tracker = readSealedBeastTracker(actor);
    buttons.unshift({label:`TC ${tracker.twistedChakra} · THP ${tracker.twistedHitPoints}/${tracker.twistedHitPointsMax}`,class:"n5eb-sealed-beast-tracker-button",icon:"fas fa-gauge-high",onclick:() => openSealedBeastTracker(actor)});
    buttons.unshift({label:tracker.dormantBeast ? "Dormant Beast Active" : "Dormant Beast",class:"n5eb-dormant-beast-toggle",icon:"fas fa-paw",onclick:() => toggleDormantBeast(actor)});
  }
});

function renderClassModRuntime(app, html) {
  renderKamaTrackerStrip(app, html);
  renderTenseiganTrackerStrip(app, html);
  renderSealedBeastTrackerStrip(app, html);
  const actor = app.actor ?? app.document;
  if (!actor?.isOwner || (!getKamaClassMod(actor) && !getFlyingThunderGodClassMod(actor) && !getTenseiganClassMod(actor) && !getSealedBeastClassMod(actor) && !getEdoTenseiClassMod(actor))) return;
  queueKamaTask(actor, () => syncClassModArtsForActor(actor)).catch(error =>
    console.error(`${MODULE_ID} | Failed to refresh Class Mod Arts values for ${actor.name}`, error)
  );
}

Hooks.on("renderActorSheet", renderClassModRuntime);
Hooks.on("renderCharacterActorSheet", renderClassModRuntime);
Hooks.on("renderApplicationV2", renderClassModRuntime);

Hooks.on("preCreateItem", (item, data, options, userId) => {
  if (options?.[KAMA_INTERNAL_OPTION] || userId !== game.user.id || item.parent?.documentName !== "Actor") return;
  return validateSealedBeastTalentCreation(item);
});

Hooks.on("createItem", async (item, options, userId) => {
  if (options?.[KAMA_INTERNAL_OPTION] || userId !== game.user.id || item.parent?.documentName !== "Actor") return;
  const actor = item.parent;
  const isKamaClassMod = item.type === "classmod" && item.system?.identifier === "kama-seal";
  const isFtgClassMod = item.type === "classmod" && item.system?.identifier === "flying-thunder-god";
  const isTenseiganClassMod = item.type === "classmod" && item.system?.identifier === "tenseigan";
  const isSealedBeastClassMod = item.type === "classmod" && item.system?.identifier === "sealed-beast-redux";
  const isEdoTenseiClassMod = item.type === "classmod" && item.system?.identifier === "edo-tensei";
  const kamaRelevant = isKamaClassMod || getSealTypeKey(item) || getSealEvolutionKey(item) || ["divine-rewrite","resonance-disruption","kama-seal"].includes(item.system?.identifier);
  const tenseiganRelevant = isTenseiganClassMod || item.getFlag?.(MODULE_ID,"celestialArt") || item.getFlag?.(MODULE_ID,"tenseiganController") || item.getFlag?.(MODULE_ID,"celestialChakraModeController");
  const sealedRelevant = isSealedBeastClassMod || item.getFlag?.(MODULE_ID,"classMod") === "sealed-beast-redux" || item.getFlag?.(MODULE_ID,"sealedBeastPath") || item.getFlag?.(MODULE_ID,"sealedTransformation");
  if (!kamaRelevant && !isFtgClassMod && !tenseiganRelevant && !sealedRelevant && !isEdoTenseiClassMod && !getKamaClassMod(actor) && !getFlyingThunderGodClassMod(actor) && !getTenseiganClassMod(actor) && !getSealedBeastClassMod(actor) && !getEdoTenseiClassMod(actor)) return;
  await queueKamaTask(actor, async () => {
    if (getKamaClassMod(actor) && (kamaRelevant || isKamaClassMod)) await migrateKamaActor(actor);
    if (getTenseiganClassMod(actor) && (tenseiganRelevant || isTenseiganClassMod)) await migrateTenseiganActor(actor);
    if (getSealedBeastClassMod(actor) && (sealedRelevant || isSealedBeastClassMod)) await migrateSealedBeastActor(actor);
    await syncClassModArtsForActor(actor);
  });
});

Hooks.on("updateItem", async (item, changes, options, userId) => {
  if (options?.[KAMA_INTERNAL_OPTION] || userId !== game.user.id || item.parent?.documentName !== "Actor") return;
  const actor = item.parent;
  const hasKama = Boolean(getKamaClassMod(actor));
  const hasFtg = Boolean(getFlyingThunderGodClassMod(actor));
  const hasTenseigan = Boolean(getTenseiganClassMod(actor));
  const hasSealedBeast = Boolean(getSealedBeastClassMod(actor));
  const hasEdoTensei = Boolean(getEdoTenseiClassMod(actor));
  if (!hasKama && !hasFtg && !hasTenseigan && !hasSealedBeast && !hasEdoTensei) return;
  const isKamaClassMod = item.type === "classmod" && item.system?.identifier === "kama-seal";
  const isFtgClassMod = item.type === "classmod" && item.system?.identifier === "flying-thunder-god";
  const isTenseiganClassMod = item.type === "classmod" && item.system?.identifier === "tenseigan";
  const isSealedBeastClassMod = item.type === "classmod" && item.system?.identifier === "sealed-beast-redux";
  const isEdoTenseiClassMod = item.type === "classmod" && item.system?.identifier === "edo-tensei";
  const isSeal = getSealTypeKey(item) || getSealEvolutionKey(item);
  const isSealedRelevant = isSealedBeastClassMod || item.getFlag?.(MODULE_ID,"classMod") === "sealed-beast-redux" || item.getFlag?.(MODULE_ID,"sealedBeastPath") || item.getFlag?.(MODULE_ID,"sealedTransformation");
  if (!isKamaClassMod && !isFtgClassMod && !isTenseiganClassMod && !isEdoTenseiClassMod && !isSeal && !isSealedRelevant) return;
  await queueKamaTask(actor, async () => {
    await syncClassModArtsForActor(actor);
    if (hasKama && (isKamaClassMod || isSeal)) { await syncSealEvolution(actor); await refreshKamaEffect(actor); }
    if (hasTenseigan && isTenseiganClassMod) { await ensureTenseiganTracker(actor); await refreshTenseiganEffects(actor); await syncCelestialStrainEffect(actor); }
    if (hasSealedBeast && isSealedRelevant) await migrateSealedBeastActor(actor);
  });
});

Hooks.on("deleteItem", async (item, options, userId) => {
  if (options?.[KAMA_INTERNAL_OPTION] || userId !== game.user.id || item.parent?.documentName !== "Actor") return;
  const actor = item.parent;
  const kamaRelevant = getSealTypeKey(item) || getSealEvolutionKey(item);
  const sealedRelevant = item.getFlag?.(MODULE_ID,"classMod") === "sealed-beast-redux" || item.getFlag?.(MODULE_ID,"sealedBeastPath") || item.getFlag?.(MODULE_ID,"sealedTransformation") || item.system?.identifier === "sealed-beast-redux";
  if (!kamaRelevant && !sealedRelevant) return;
  await queueKamaTask(actor, async () => {
    if (getKamaClassMod(actor) && kamaRelevant) { await syncSealEvolution(actor); await refreshKamaEffect(actor); }
    if (getSealedBeastClassMod(actor)) { await ensureSealedBeastTracker(actor); await refreshSealedBeastEffects(actor); actor.sheet?.render?.(false); }
  });
});

Hooks.on("preUpdateActor", (actor, changes, options, userId) => {
  if (options?.[KAMA_INTERNAL_OPTION] || userId !== game.user.id || !getSealedBeastClassMod(actor)) return;
  const proposed = foundry.utils.getProperty(changes,"system.attributes.hp.value");
  if (proposed == null) return;
  const current = Number(actor.system?.attributes?.hp?.value ?? 0);
  const next = Number(proposed);
  const state = readSealedBeastTracker(actor);
  if (!state.transformation || !state.twistedHitPoints || next >= current) return;
  const incoming = current - next;
  const absorbed = Math.min(incoming,state.twistedHitPoints);
  if (!absorbed) return;
  foundry.utils.setProperty(changes,"system.attributes.hp.value",next+absorbed);
  foundry.utils.setProperty(changes,`flags.${MODULE_ID}.${SEALED_BEAST_TRACKER_FLAG}`,normalizeSealedBeastTracker({...state,twistedHitPoints:state.twistedHitPoints-absorbed}));
  ui.notifications.info(`${actor.name}'s Twisted Hit Points absorbed ${absorbed} damage.`);
});

Hooks.on("updateActor", async (actor, changes, options, userId) => {
  if (options?.[KAMA_INTERNAL_OPTION] || userId !== game.user.id) return;
  if (!getKamaClassMod(actor) && !getFlyingThunderGodClassMod(actor) && !getTenseiganClassMod(actor) && !getSealedBeastClassMod(actor) && !getEdoTenseiClassMod(actor)) return;
  await queueKamaTask(actor, async () => {
    await syncClassModArtsForActor(actor);
    if (getTenseiganClassMod(actor)) {
      const chakra = Number(actor.system?.attributes?.chakra?.value ?? 0);
      if (chakra <= 0 && isTenseiganActive(actor)) await toggleTenseigan(actor);
    }
    if (getSealedBeastClassMod(actor)) {
      await checkSealedBeastAutomaticFrenzy(actor);
      refreshOpenSealedBeastTracker(actor);
    }
  });
});

Hooks.on("createActiveEffect", async (effect, options, userId) => {
  if (options?.[KAMA_INTERNAL_OPTION] || userId !== game.user.id) return;
  const actor = getKamaActorFromEffect(effect);
  if (!actor || (!getKamaClassMod(actor) && !getFlyingThunderGodClassMod(actor) && !getTenseiganClassMod(actor) && !getSealedBeastClassMod(actor) && !getEdoTenseiClassMod(actor))) return;
  await queueKamaTask(actor, () => syncClassModArtsForActor(actor));
});

Hooks.on("updateActiveEffect", async (effect, changes, options, userId) => {
  if (userId !== game.user.id) return;
  const isKamaSealEffect = Boolean(effect.getFlag?.(MODULE_ID,"kamaSealEffect"));
  const isTenseiganEyeEffect = Boolean(effect.getFlag?.(MODULE_ID,"tenseiganEffect"));
  const isCelestialModeEffect = Boolean(effect.getFlag?.(MODULE_ID,"celestialChakraModeEffect"));
  const toggledManaged = Object.hasOwn(changes,"disabled") && (isKamaSealEffect || isTenseiganEyeEffect || isCelestialModeEffect);
  if (options?.[KAMA_INTERNAL_OPTION] && !toggledManaged) return;
  const actor = getKamaActorFromEffect(effect);
  if (!actor) return;
  await queueKamaTask(actor, async () => {
    if (isKamaSealEffect && Object.hasOwn(changes,"disabled")) {
      if (changes.disabled === false) await handleKamaActivation(actor);
      else if (changes.disabled === true) await removeKamaPoints(actor);
    }
    if (isTenseiganEyeEffect && changes.disabled === true) {
      const mode = getCelestialModeEffect(actor);
      if (mode && !mode.disabled) await mode.update({disabled:true}, {[KAMA_INTERNAL_OPTION]: {toggleCelestialMode:true}});
    }
    if (isTenseiganEyeEffect || isCelestialModeEffect) await ensureTenseiganArtsFormulas(actor);
    await syncClassModArtsForActor(actor);
  });
});

Hooks.on("deleteActiveEffect", async (effect, options, userId) => {
  if (options?.[KAMA_INTERNAL_OPTION] || userId !== game.user.id) return;
  const actor = getKamaActorFromEffect(effect);
  if (!actor) return;
  await queueKamaTask(actor, async () => {
    if (effect.getFlag?.(MODULE_ID,"kamaSealEffect")) await removeKamaPoints(actor);
    if (effect.getFlag?.(MODULE_ID,"tenseiganEffect") || effect.getFlag?.(MODULE_ID,"celestialChakraModeEffect")) await ensureTenseiganArtsFormulas(actor);
    await syncClassModArtsForActor(actor);
  });
});

Hooks.on("dnd5e.restCompleted", async (actor, result) => {
  await queueKamaTask(actor, async () => {
    if (getKamaClassMod(actor) && ["long","full"].includes(result?.type)) {
      const state = readKamaTracker(actor);
      await updateKamaTracker(actor, {
        resonanceDisruption:Math.max(0,state.resonanceDisruption-(result.type === "full" ? 2 : 1)),
        ...(result.type === "full" ? {activationsSinceFullRest:0} : {})
      });
    }
    if (getTenseiganClassMod(actor)) await applyTenseiganRest(actor,result?.type);
    if (getSealedBeastClassMod(actor)) {
      const state = readSealedBeastTracker(actor);
      await updateSealedBeastTracker(actor,{rageTriggerUsed:false,lastProcessedTurn:""},{autoFrenzy:false});
      if (result?.type === "full" && state.frenzy) await setSealedBeastFrenzy(actor,false);
    }
  });
});

Hooks.on("dnd5e.preUseActivity", (activity) => {
  if (checkTenseiganActivityUse(activity) === false) return false;
  return checkSealedBeastActivityUse(activity);
});
Hooks.on("dnd5e.postUseActivity", (activity) => {
  const actor = activity?.actor ?? getTenseiganActivityItem(activity)?.actor;
  if (!actor) return;
  if (getTenseiganClassMod(actor)) {
    queueKamaTask(actor, () => processTenseiganActivityUse(activity)).catch(error => {
      console.error(`${MODULE_ID} | Failed to process Celestial Art use`, error);
      ui.notifications.error(`Celestial Chakra tracking failed: ${error.message}`);
    });
  }
  if (getSealedBeastClassMod(actor)) {
    queueKamaTask(actor, () => processSealedBeastActivityUse(activity)).catch(error => {
      console.error(`${MODULE_ID} | Failed to process Vermillion Art use`, error);
      ui.notifications.error(`Twisted Chakra tracking failed: ${error.message}`);
    });
  }
});

Hooks.on("updateCombat", async (combat, changes, options, userId) => {
  if (!game.user.isGM || userId !== game.user.id || (!Object.hasOwn(changes,"turn") && !Object.hasOwn(changes,"round"))) return;
  const actor = combat.combatant?.actor;
  if (!actor || !getSealedBeastClassMod(actor)) return;
  await queueKamaTask(actor, () => processSealedBeastTurn(actor,combat));
});
