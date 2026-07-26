# N5eB Class Mod Library 0.11.0

Creates the world compendium **N5eB Custom Class Mods** for N5eB 3.1.0 on Foundry VTT 13/14.

Included Class Mods:
- Flying Thunder God
- Kāma Seal
- Tenseigan
- Sealed Beast Redux
- Superior Shinobi

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

Kāma Divine Rewrite and Resonance Disruption, Tenseigan resources, and Sealed Beast resources are stored directly on the Actor. Flying Thunder God, Kāma, Tenseigan, and Sealed Beast Art formulas are written as current numeric values to the owned Class Mod so the sheet display and rolls use the same result.

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
