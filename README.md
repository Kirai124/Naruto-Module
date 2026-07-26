# N5eB Class Mod Library 0.8.2

Creates the world compendium **N5eB Custom Class Mods** for N5eB 3.1.0 on Foundry VTT 13/14.

Included Class Mods:
- Flying Thunder God
- Kāma Seal
- Tenseigan

All bundled descriptions are written in English. Each Class Mod has its own colored folder tree inside the same world compendium.

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

The new Tenseigan folder tree uses a celestial blue-violet color (`#7687e8`).

## Existing trackers

Kāma Divine Rewrite and Resonance Disruption remain stored directly on the Actor. Flying Thunder God, Kāma, and Tenseigan Art formulas are written as current numeric values to the owned Class Mod so the sheet display and rolls use the same result.

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
```

## 0.8.1 fixes

- Previously selected non-repeatable Class Mod choices are removed from later ItemChoice lists. This fixes Celestial Arts appearing again at later Tenseigan levels and also protects future bundled Class Mods from the same N5eB ItemChoice issue.
- All Tenseigan entries use `assets/tenseigan-eye.png` as the bundled fallback image. Existing actor items using the old generic placeholder icons are migrated automatically.

## 0.8.2 distribution update

- Added the GitHub repository URL.
- Added a stable Foundry manifest URL using the latest GitHub Release.
- Added the versioned GitHub Release download URL.
- Future versions can be installed through Foundry's Check Update / Update All flow.
