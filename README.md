# N5eB Class Mod Library 0.18.0
## Version 0.18.0 — Cursed Seal Class Mod

- Adds the complete **Hashirama Cells (Remastered)** Class Mod with five-level progression, 10 Perfected Wood Arts, and 10 Passive Legacy Arts.
- Adds an Actor-based **Legacy Chakra** tracker (20/40/60/80/100), long/full-rest restoration, Perfect Match 3:1 regular-Chakra conversion, and Perfected Art spending.
- Automates **Senju Durability**, Level 4 physical ability-check bonuses, Mental/Physical Perfection saves, **Passive Regeneration**, **Wooden Hostility** checks and 2d4 turn damage, Partial Match rest temp HP, Extraordinary Mutation skill proficiency/expertise choices, and dynamic Tree Bind Flourish Burial bonus damage.
- Wooden Hostility blocks chakra-molding jutsu while active and can be contested from the tracker; Perfect Match automatically disables the Hostility state.
- Adds tracker controls for **Overwhelming Splinters** and Perfected Wood Art activation.
- Uses the supplied Hashirama artwork for all bundled Hashirama Cells entries.
- Changes every bundled **Crimson Priest** Item and its runtime tracker/effects to `systems/n5eb/assets/content/items/triplescythe.webp`.
- Keeps the 0.15.0 retroactive Heavenly Gates / Eight Gates damage migration intact.

## Version 0.15.0 — Crimson Priest + Damage Automation

- Adds the complete **Crimson Priest** Class Mod from the supplied v1.1 document: 5 levels, 16 Pacts, 3 Death Oaths, 9 Blood Arts, and 18 Oath Arts.
- Adds a Piety tracker with Standard / Elite / Solo gains, Oath Art Piety spending, Blood Art HP / Hit-Die spending, Doctrine of Carnage selections, and Jashin's Mandate controls.
- Applies the direct Oath ability-score/chakra/movement bonuses that can be represented safely with N5eB Active Effects.
- Adds native damage formulas to damage-dealing Crimson Priest Arts and dynamic actor-side formulas where the damage depends on current Class Mod state.
- Adds native damage to Heavenly Gates techniques and **retroactively migrates the new damage data onto already-owned Heavenly Gates / Eight Gates Arts** by stable item identifier; no re-import is required.
- Keeps complex conditional/secondary damage in the rules text when combining it into the primary roll would apply damage to the wrong target or at the wrong time.

## Version 0.14.2 — Heavenly Gates Duplicate Grant Fix

- Serializes Heavenly Gates Actor synchronization so overlapping Foundry Class Mod advancement/update hooks cannot grant the same Gate or Heavenly Breath twice.
- Makes Gate/Breath grants idempotent by using path + stage as the unique stage identity instead of relying only on a snapshot of Actor item identifiers.
- Automatically removes duplicate or stale Heavenly Gates stage items already present on an Actor the next time that Actor is synchronized.
- Adopts matching legacy stage items into managed Heavenly Gates state instead of creating an additional copy.
- Keeps stage cleanup deterministic when changing path, lowering the Class Mod level, or removing Heavenly Gates.

## Version 0.14.1 — Runtime / Sheet Stability Fixes

- Removes all Actor/Item mutation work from sheet render hooks, preventing render → update → render feedback loops and the resulting flood of browser form/accessibility warnings.
- Fixes the Superior Shinobi tracker update recursion by making tracker/effect initialization idempotent and using internal Actor updates instead of recursive `setFlag` calls.
- Adds explicit `type="button"` to every injected module button so tracker controls can never submit an N5eB Actor form accidentally.
- Gives every injected `input`/`select` a `name` plus an associated/wrapped label or `aria-label`, eliminating the module-side `form field should have an id or name` / `No label associated with a form field` warnings.
- Makes Edo Tensei sheet rendering side-effect free and moves tracker/profile flag writes to internal Actor updates.
- Hardens Heavenly Gates runtime state: path/level changes no longer silently mutate an active release, Class Mod deletion cleans managed stages/effects/tracker state, and release-effect refreshes no longer reset the one-minute duration.
- Heavenly Gates now tracks only Temporary HP/Chakra granted by the release, converts only that tracked temporary resource at turn start, and removes remaining release-granted temporary resources when the release ends.
- Heavenly Gates now correctly deactivates when activation/self-damage reduces the user to 0 HP.
- Keeps every Heavenly Gates Item/Active Effect on `systems/n5eb/assets/content/jutsu-icons/7th-inner-gate.webp`.

## Version 0.14.0 — Heavenly Gates

- Adds the complete **Heavenly Gates** Class Mod with both the **Eight Gates** and **Seven Heavenly Breaths** paths.
- Includes the five-level progression, Advanced Conditioning choices, all Superhuman Affinities, Limitless features, 15 Abilities, and 25 Techniques.
- Automatically grants/removes the legal Gate/Breath stage controllers for the selected path and current Class Mod level.
- Adds an Actor tracker for the active stage, Hit/Chakra Dice costs, temporary HP/Chakra overflow, cumulative ability/speed boosts, activation damage, Art self-damage, and numeric deactivation backlash.
- Enforces path/stage prerequisites for bundled Heavenly/Beastly Arts and synchronizes their Class Mod attack/save values.
- Ranked N5eB backlash conditions and post-release vulnerabilities are surfaced as explicit tracker/chat reminders rather than guessed condition-rank mutations.
- Uses `systems/n5eb/assets/content/jutsu-icons/7th-inner-gate.webp` for every bundled Heavenly Gates Item and Active Effect.

## Version 0.13.5 creator fix

- Fixes the DialogV2 nested-form bug that caused the Creator wrapper to be discarded by the browser. This was the reason the layout appeared as unstyled text and all step buttons were inactive.
- The Normal / Elite / Solo selection remains the first window.
- The selected tier then opens the complete four-step creator: rank and role, base data, ability scores, saves and skills, and Unholy Blessings.
- Restores the intended card layout, separate scrolling areas, live preview, validation, and working Back / Next / step-navigation buttons.
- Adds a post-render activation fallback for Foundry 13/14 and supports both HTMLElement and legacy jQuery-style application elements.
- Keeps the existing Standard, Elite, and Solo calculations unchanged.


Creates the world compendium **N5eB Custom Class Mods** for N5eB 3.1.0 on Foundry VTT 13/14.

Included Class Mods:
- Flying Thunder God
- Kāma Seal
- Tenseigan
- Sealed Beast Redux
- Superior Shinobi
- Edo Tensei
- Heavenly Gates
- Crimson Priest
- Hashirama Cells

All bundled descriptions are written in English. Each Class Mod has its own colored folder tree inside the same world compendium.

## Sealed Beast Redux

Sealed Beast Redux includes:
- the complete five-level progression
- all four Paths: Dominion, Wrath, Partnership, and Path of the Beast
- Transformation Arts from Twisted Chakra Mode through Sealed Beast Mode
- Beast Bomb and Beast Claw talent trees
- Vermillion Abilities and Vermillion Passives
- Beast Summoning and its summon chassis
- an Actor-based tracker for Twisted Chakra, Twisted Hit Points, Disposition, Frenzy, Dormant Beast, transformations, and Twisted Awakening points
- automatic Vermillion Art Attack Bonus and Save DC calculation
- automatic bundled Art costs and transformation activation
- prerequisite, Class Mod level, duplicate, and Twisted Awakening budget validation when talents are dragged onto an Actor
- automatic Dormant Beast turn conversion and Transformation Active Effects

The Sealed Beast folder tree uses orange (`#f28c18`).

### Sealed Beast controls

Open the tracker for a selected token or assigned character:

```js
N5eBClassMods.openSealedBeastTracker();
```

Toggle Dormant Beast:

```js
N5eBClassMods.toggleDormantBeast();
```

The tracker does not use item Uses. It stores its values directly on the Actor.

## Tenseigan

The Tenseigan Class Mod includes:
- the complete five-level progression
- 14 Celestial Arts
- all 8 Celestial Truth-Seeking Orb techniques
- Celestial Chakra, Celestial Strain, Truth-Seeking Orb, and Art Mastery tracking
- Actor-based tracking data instead of item Uses
- Tenseigan and Celestial Chakra Mode sheet controls
- automatic Celestial Art Attack Bonus and Save DC calculation
- automatic Celestial Chakra and Orb spending when bundled activities are used
- automatic Celestial Strain gain from Celestial Arts
- short, long, and full-rest recovery controls
- automatic numerical effects for Tenseigan vision, Celestial Chakra Mode, Eternal Tenseigan, and Celestial Strain thresholds

The Tenseigan folder tree uses celestial blue-violet (`#7687e8`).

## Existing trackers

Kāma Divine Rewrite and Resonance Disruption, Tenseigan resources, Sealed Beast resources, the Heavenly Gates release tracker, and Hashirama Cells Legacy Chakra/Hostility state are stored directly on the Actor. Flying Thunder God, Kāma, Tenseigan, Sealed Beast, Edo Tensei, and Heavenly Gates Art formulas are written as current numeric values to the owned Class Mod so the sheet display and rolls use the same result.

## Manual synchronization

```js
await N5eBClassMods.sync();
```

Open the compendium:

```js
N5eBClassMods.open();
```

Open trackers for a selected token or assigned character:

```js
N5eBClassMods.openKamaTracker();
N5eBClassMods.openTenseiganTracker();
N5eBClassMods.openSealedBeastTracker();
N5eBHeavenlyGates.openTracker();
N5eBHashiramaCells.openTracker();
N5eBCursedSeal.openTracker();
```

## GitHub distribution

Manifest URL:

```text
https://github.com/Kirai124/Naruto-Module/releases/latest/download/module.json
```

The release workflow builds a ZIP whenever a tag beginning with `v` is created. The tag and `module.json` version must match.

## 0.9.0

- Added Sealed Beast Redux.
- Added direct Actor tracking for Twisted Chakra, Twisted Hit Points, Disposition, Frenzy, Dormant Beast, and transformations.
- Added automatic Vermillion Art formulas and bundled Twisted Chakra spending.
- Added Twisted Awakening point-budget and prerequisite validation.
- Added orange folder organization for all Sealed Beast content.


## 0.10.0

- Added Superior Shinobi as a new Class Mod pack.
- Included core Superior Shinobi features, 15 Epithets as individual entries, grouped Superior Technique reference entries, example unique techniques, Superior Shinobi feats, and Superior Adversary reference pages.
- Added placeholder image normalization for any items that do not define an image.


## 0.10.1

- Fixed the bundled content version so Foundry automatically synchronizes Superior Shinobi into the world compendium.
- Added Superior Shinobi to the Class Mod choice de-duplication patch.


## 0.11.0 - Superior Shinobi Rebuild

- Rebuilt Superior Shinobi from scratch.
- Added all 118 Superior Techniques as individual selectable entries.
- Added all 15 Epithets with full benefits, Level 5 benefits, and Burden tables.
- Added complete progression grants, 4-point ASI advancements at levels 1 and 3, two Technique choices at every Class Mod level, and the Epithet choice at level 3.
- Added all five Superior Shinobi feats, three Unique Technique examples, three Adversary superiority tiers, special Epithet interactions, and fourteen Adversary Superior Traits.
- Added Actor-based Reserve Dice, Burden, combat-spending, Technique free-use, and Prophesised-cost tracking.
- Added automatic Superior/Burden numeric effects and rest recovery.
- Added image fallback normalization for every current and future Class Mod entry that has no image.

## Edo Tensei (0.12.0)

The Edo Tensei Class Mod is included as a complete compendium tree with its five-level progression, Unholy Arts, Unholy Blessings, rank features, roles, and Standard/Elite/Solo construction rules.

After adding **Edo Tensei** to a character, the character sheet gains an **Edo Tensei tracker** and **Create Edo Tensei** button. The creator builds a linked NPC summon and calculates:

- Rank level, ability-score cap and increase budget
- Armor Class, hit points, speed, Jutsu Slots, role modifiers, and Elite Actions
- DNA DC, Summoning DC, vessel modifier, Blessing cost, and Unholy Charge cost
- Standard, Elite, and Solo multipliers and restrictions

Generated Edo Tensei Actors have **Summon / Return** and **Recalculate Edo** sheet buttons. The module also removes obsolete module-managed folder trees during synchronization, including the old duplicate Superior Shinobi tree, while retaining the current Superior Shinobi implementation.


## Madara Cells (0.18.0)
Madara Cells is included with the supplied Madara artwork for all of its entries. Automation covers Legacy Chakra, Mastered Defence, Hatred Surge / Overcome with Hatred turn handling, Extraordinary Talent choices, Partial/Perfect Match movement/resource rules, Mastered Technique activation, Sharingan-use replenishment where the owned N5eB item exposes a uses pool, Mangekyō charge conversion where a compatible uses pool is present, and passive score/save/movement bonuses.


## Cursed Seal Class Mod

Version 0.18.0 adds the complete Cursed Seal Class Mod from *Secrets of Power - Class Modification Compendium*, including Cursed Chakra/Corruption tracking, stage automation, actor-owned Cursed Art generation with Corrupted Boosts, automatic Cursed Chakra cost substitution, dynamic damage dice/rerolls, Mutations, Orders, seal types and the lower-power Cursed Seal feat track. All Cursed Seal content uses `systems/n5eb/assets/content/classmod-icons/cursed-seal/cursemark-second-state.webp`.
