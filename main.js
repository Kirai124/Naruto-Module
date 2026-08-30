{
  "id": "flying-thunder-god",
  "version": "0.6.0",
  "label": "Flying Thunder God",
  "folders": [
    {
      "_id": "yCQTTLxTMz8wZ49Z",
      "name": "Flying Thunder God",
      "type": "Item",
      "folder": null,
      "sorting": "a",
      "sort": 0,
      "color": "#d9a400",
      "description": "",
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "classMod": "flying-thunder-god",
          "folderKey": "root"
        }
      }
    },
    {
      "_id": "MMG2y0oBcaDHmehD",
      "name": "Class Mod Features",
      "type": "Item",
      "folder": "yCQTTLxTMz8wZ49Z",
      "sorting": "a",
      "sort": 0,
      "color": "#d9a400",
      "description": "",
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "classMod": "flying-thunder-god",
          "folderKey": "features"
        }
      }
    },
    {
      "_id": "CRpMRibpNWhUzb0M",
      "name": "Hiraishin Arts",
      "type": "Item",
      "folder": "MMG2y0oBcaDHmehD",
      "sorting": "a",
      "sort": 100000,
      "color": "#d9a400",
      "description": "",
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "classMod": "flying-thunder-god",
          "folderKey": "arts"
        }
      }
    },
    {
      "_id": "Ac7kxnSK8xzz6rxV",
      "name": "Riftstep Reactions",
      "type": "Item",
      "folder": "MMG2y0oBcaDHmehD",
      "sorting": "a",
      "sort": 200000,
      "color": "#d9a400",
      "description": "",
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "classMod": "flying-thunder-god",
          "folderKey": "rifts"
        }
      }
    },
    {
      "_id": "bpNI1Vg0pxbbT1C7",
      "name": "Raijin Seals",
      "type": "Item",
      "folder": "MMG2y0oBcaDHmehD",
      "sorting": "a",
      "sort": 300000,
      "color": "#d9a400",
      "description": "",
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "classMod": "flying-thunder-god",
          "folderKey": "seals"
        }
      }
    },
    {
      "_id": "x2mm0NNQlCbnDQw5",
      "name": "Flying Thunder God Feats",
      "type": "Item",
      "folder": "yCQTTLxTMz8wZ49Z",
      "sorting": "a",
      "sort": 100000,
      "color": "#d9a400",
      "description": "",
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "classMod": "flying-thunder-god",
          "folderKey": "feats"
        }
      }
    }
  ],
  "items": [
    {
      "_id": "O7EhDYnonq164hkG",
      "name": "God's Rising",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Prerequisite:</strong> Character level 8 and completion of the narrative awakening described in the source PDF.</p><p>You unlock the foundation of the Hiraishin. Its rules are represented by Flying Thunder God Seal, Thunder God Reactions, Master of Movement, Hiraishin Arts, and Dimensional Overload.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 1",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "gods-rising"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "feature",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "MMG2y0oBcaDHmehD"
    },
    {
      "_id": "sN5OP36BZq3qDqWA",
      "name": "Flying Thunder God Seal",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Bonus Action:</strong> Touch a creature, object, or surface and place an invisible Flying Thunder God Seal on it. The seal lasts indefinitely until you remove it.</p><p>You can maintain <strong>2 + your Class Mod level</strong> seals at once. If you exceed this maximum, remove one of your existing seals. Placing or removing a seal costs no chakra.</p><p>The module does not automatically track seal locations. Place markers or tokens on the scene manually.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "bonus",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 1",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "flying-thunder-god-seal"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "feature",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "MMG2y0oBcaDHmehD"
    },
    {
      "_id": "RT4FclozwBPHR92z",
      "name": "Thunder God Reactions",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>You gain 2 additional reactions each round, plus 1 additional reaction for every Class Mod level beyond 1st. These reactions can only activate features, Riftstep Reactions, or Hiraishin Arts from this Class Mod.</p><p>You can spend up to two Class Mod reactions on the same trigger, provided both reactions come from this Class Mod.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 1",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "thunder-god-reactions"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "feature",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "MMG2y0oBcaDHmehD"
    },
    {
      "_id": "rHmEk9O5Zn78F5Gu",
      "name": "Master of Movement",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Your Dexterity score increases by 2, and its maximum becomes 22. Your walking speed increases by 20 feet for each level in this Class Mod.</p><p>Whenever a feature, effect, or jutsu outside this Class Mod grants bonus movement, you gain an additional 5 × your Class Mod level feet of movement for the same duration.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 1",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "master-of-movement"
      },
      "effects": [
        {
          "_id": "ju7tW9gIRutLZPhP",
          "name": "Master of Movement",
          "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
          "origin": null,
          "disabled": false,
          "duration": {},
          "changes": [
            {
              "key": "system.abilities.dex.value",
              "mode": 2,
              "value": "2",
              "priority": 20
            },
            {
              "key": "system.attributes.movement.walk",
              "mode": 2,
              "value": "20 * @classmods.flying-thunder-god.levels",
              "priority": 20
            }
          ],
          "transfer": true,
          "statuses": [],
          "flags": {}
        }
      ],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "feature",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "MMG2y0oBcaDHmehD"
    },
    {
      "_id": "GIrg7HvcWrn0LeI1",
      "name": "Hiraishin Arts",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Hiraishin Arts are special Class Mod techniques. You can only use them while at least one Flying Thunder God Seal is active in the area, on an object, or on a creature.</p><p>Each Art expends 1 FTG Charge, the listed number of seals, and its listed chakra cost. Attack rolls and saving throw DCs use your Flying Thunder God Class Mod values.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 1",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "hiraishin-arts"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "feature",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "MMG2y0oBcaDHmehD"
    },
    {
      "_id": "UciHlw5N59dLjwDU",
      "name": "Dimensional Overload",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Your FTG Charges follow the Class Mod progression: 4/5/6/7/8. Each Hiraishin Art expends 1 charge. Once you have no charges remaining, the next Art costs 3 additional chakra, and each further use increases this surcharge by another 3 chakra.</p><p><strong>Overload Reduction:</strong> Spend your Action or Flying Action to reduce the current overload by two steps. All overload resets when combat ends.</p><p>Because the surcharge depends on combat usage, enter the additional chakra cost manually.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 1",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "dimensional-overload"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "feature",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "MMG2y0oBcaDHmehD"
    },
    {
      "_id": "h6ApdWbTsAy5eYlP",
      "name": "Flashpoint Reversal",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Your Passive Perception increases by 10. When rolling Initiative, you may roll <strong>ceil(Class Mod level ÷ 2)d8</strong> and add the result to the roll.</p><p>Once per rest, you may spend two reactions at the same time to respond to an effect that would normally prevent or suppress reactions. You cannot be surprised during the first round of combat.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "ceil(@classmods.flying-thunder-god.levels / 2)d8",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "flashpoint-reversal"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "feature",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "MMG2y0oBcaDHmehD"
    },
    {
      "_id": "qgCYUswEaQnuiPkH",
      "name": "Riftstep Reactions",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>You learn two Riftstep Reactions at 2nd level, one additional reaction at 4th level, and one additional reaction at 5th level.</p><p>At the start of each of your turns, you generate one temporary Riftstep Die for each Riftstep Reaction you know. These dice begin as d6s, must be spent during that turn, and expire at the start of your next turn.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "riftstep-reactions"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "feature",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "MMG2y0oBcaDHmehD"
    },
    {
      "_id": "vbrCpQyW8N2f7Zfw",
      "name": "Raijin Seal",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Choose one Raijin Seal at 3rd level and another at 4th level. Raijin Seals are permanent passive upgrades to your seals, movement, Riftstep Reactions, and Hiraishin Arts.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "raijin-seal"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "feature",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "MMG2y0oBcaDHmehD"
    },
    {
      "_id": "vGAKsq50CIcfmMn9",
      "name": "Turnover",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Your Dexterity score increases by 2, to a maximum of 24. You gain one additional Bonus Action that can only be used for Class Mod features or Arts, and your walking speed increases by 20 feet.</p><p>After moving at least 50 feet during your turn, your next melee weapon attack before the end of the turn deals additional force damage equal to your Dexterity modifier + your Class Mod level.</p><p>Once per round, when a creature misses you with an attack or you succeed on a saving throw caused by it, you may teleport up to 30 feet without spending movement or a reaction.</p><p>When you roll Initiative, gain temporary AC equal to twice your Class Mod level and one free reaction that can be used before the first round begins. The temporary AC lasts 1 + 1d4 rounds.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d4",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "turnover"
      },
      "effects": [
        {
          "_id": "wV3X7QdGRYfy5YpG",
          "name": "Turnover",
          "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
          "origin": null,
          "disabled": false,
          "duration": {},
          "changes": [
            {
              "key": "system.abilities.dex.value",
              "mode": 2,
              "value": "2",
              "priority": 20
            },
            {
              "key": "system.attributes.movement.walk",
              "mode": 2,
              "value": "20",
              "priority": 20
            }
          ],
          "transfer": true,
          "statuses": [],
          "flags": {}
        }
      ],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "feature",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "MMG2y0oBcaDHmehD"
    },
    {
      "_id": "jOUExOfdhnkDdTDx",
      "name": "Godspeed Precision",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Whenever you make an attack roll, roll 2d20 and use the higher result. This applies to melee attacks, ranged attacks, jutsu, and Hiraishin Arts that require an attack roll.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 4",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "godspeed-precision"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "feature",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "MMG2y0oBcaDHmehD"
    },
    {
      "_id": "X67mku07Iz7sSMjb",
      "name": "Turnover Mastery",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Your Dexterity score increases by another 2, to a maximum of 26. You gain a second additional Bonus Action for Class Mod features or Arts, and your walking speed increases by another 20 feet.</p><p>Bonus movement from sources outside this Class Mod now grants an additional 15 × your Class Mod level feet instead.</p><p>Once per Long Rest, when a creature you can see is reduced to 0 hit points within 20 feet of one of your seals, you may use your reaction to teleport it to that seal and bring it with you to an unoccupied space within 50 feet. The creature remains at 1 hit point and is stabilized.</p><p>The temporary AC granted by Turnover now lasts 2 + 1d6 rounds.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 5",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "turnover-mastery"
      },
      "effects": [
        {
          "_id": "jwQglhOPZwaD0uw6",
          "name": "Turnover Mastery",
          "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
          "origin": null,
          "disabled": false,
          "duration": {},
          "changes": [
            {
              "key": "system.abilities.dex.value",
              "mode": 2,
              "value": "2",
              "priority": 20
            },
            {
              "key": "system.attributes.movement.walk",
              "mode": 2,
              "value": "20",
              "priority": 20
            }
          ],
          "transfer": true,
          "statuses": [],
          "flags": {}
        }
      ],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "feature",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "MMG2y0oBcaDHmehD"
    },
    {
      "_id": "fGdLICffmbwuZHJ0",
      "name": "Flying Action",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Once per round, at the end of any turn, you may use your Flying Action to take the Attack Action, cast a jutsu, or activate a Hiraishin Art that would normally require an Action.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "special",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 5",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "flying-action"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "feature",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "MMG2y0oBcaDHmehD"
    },
    {
      "_id": "8Y2DHqcGjlJHXJAX",
      "name": "Hiraishin no Jutsu",
      "type": "spell",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Bonus Action:</strong> Teleport yourself and up to one adjacent creature to an active Flying Thunder God Seal. You enter Flow after arriving.</p><p><strong>Reaction:</strong> When you would take damage from an attack or make a Strength, Dexterity, or Constitution saving throw, teleport to an active seal. If this movement places you outside the attack’s reach or area, you avoid the effect entirely.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "bonus",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": "inst"
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": "self"
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "charges",
          "target": "@scale.flying-thunder-god.ftg-charges",
          "amount": 1,
          "scale": false
        },
        "ability": "art",
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "art"
        },
        "level": 9,
        "rank": "s",
        "school": "trs",
        "materials": {
          "value": "",
          "consumed": false,
          "cost": 0,
          "supply": 0
        },
        "preparation": {
          "mode": "prepared",
          "prepared": false
        },
        "scaling": {
          "mode": "none",
          "formula": ""
        },
        "versatileScaling": {
          "formula": "",
          "mode": "none"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "recharge": {
          "value": null,
          "formula": "1d8",
          "charged": false
        },
        "properties": [],
        "identifier": "hiraishin-no-jutsu",
        "jutsu": {
          "components": [
            "cm",
            "cs"
          ],
          "keywords": [
            "hijutsu",
            "ninjutsu",
            "fuinjutsu"
          ],
          "countsKnown": true,
          "ability": "",
          "type": "ninjutsu"
        },
        "chakra": {
          "cost": "7",
          "scaling": {
            "mode": "none",
            "value": 0
          },
          "special": "Consumes 1 active Flying Thunder God Seal(s)."
        },
        "method": "spell",
        "prepared": 0,
        "sourceItem": "classmod:flying-thunder-god"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb": {
          "classmodArt": {
            "classmod": "flying-thunder-god"
          }
        },
        "n5eb-classmod-library": {
          "managed": true,
          "category": "art",
          "classMod": "flying-thunder-god",
          "seals": 1
        }
      },
      "folder": "CRpMRibpNWhUzb0M"
    },
    {
      "_id": "qbPaTcLFeGiKAW7y",
      "name": "Hiraishin: Dōrai",
      "type": "spell",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>When you are targeted by an attack or forced to make a Dexterity saving throw, create a spatial barrier and redirect the attack or effect to another active Flying Thunder God Seal within 120 feet.</p><p>If the triggering effect has an area, its point of origin moves to the new seal. If you remain within the redirected area, resolve the saving throw normally.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": "inst"
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": "self"
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "charges",
          "target": "@scale.flying-thunder-god.ftg-charges",
          "amount": 1,
          "scale": false
        },
        "ability": "art",
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "art"
        },
        "level": 9,
        "rank": "s",
        "school": "trs",
        "materials": {
          "value": "",
          "consumed": false,
          "cost": 0,
          "supply": 0
        },
        "preparation": {
          "mode": "prepared",
          "prepared": false
        },
        "scaling": {
          "mode": "none",
          "formula": ""
        },
        "versatileScaling": {
          "formula": "",
          "mode": "none"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "recharge": {
          "value": null,
          "formula": "1d8",
          "charged": false
        },
        "properties": [],
        "identifier": "hiraishin-dorai",
        "jutsu": {
          "components": [
            "cm",
            "cs"
          ],
          "keywords": [
            "hijutsu",
            "ninjutsu",
            "fuinjutsu"
          ],
          "countsKnown": true,
          "ability": "",
          "type": "ninjutsu"
        },
        "chakra": {
          "cost": "10",
          "scaling": {
            "mode": "none",
            "value": 0
          },
          "special": "Consumes 2 active Flying Thunder God Seal(s)."
        },
        "method": "spell",
        "prepared": 0,
        "sourceItem": "classmod:flying-thunder-god"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb": {
          "classmodArt": {
            "classmod": "flying-thunder-god"
          }
        },
        "n5eb-classmod-library": {
          "managed": true,
          "category": "art",
          "classMod": "flying-thunder-god",
          "seals": 2
        }
      },
      "folder": "CRpMRibpNWhUzb0M"
    },
    {
      "_id": "Tcb3AB0zQ29XmLDE",
      "name": "Hiraishin: Ni no Dan",
      "type": "spell",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Throw a kunai bearing your seal at a target within 60 feet and make a ranged Hiraishin Art attack. On a hit, deal the weapon’s normal damage + 7d8 piercing damage, then teleport to an unoccupied space within 5 feet of the target.</p><p>On a miss, you still teleport to the kunai and immediately make a melee weapon attack against the same target. On a hit, deal the weapon’s normal damage + 7d8 lightning damage. After teleporting, you may place a Flying Thunder God Seal on the target as a Bonus Action.</p><p><strong>Flow:</strong> Use your reaction to cast a melee jutsu of B-Rank or lower that requires an attack roll and normally takes an Action.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "action",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": "inst"
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": 60,
          "long": null,
          "units": "ft"
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "charges",
          "target": "@scale.flying-thunder-god.ftg-charges",
          "amount": 1,
          "scale": false
        },
        "ability": "art",
        "actionType": "rsak",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [
            [
              "7d8",
              "piercing"
            ]
          ],
          "versatile": "7d8 lightning"
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "art"
        },
        "level": 9,
        "rank": "s",
        "school": "trs",
        "materials": {
          "value": "",
          "consumed": false,
          "cost": 0,
          "supply": 0
        },
        "preparation": {
          "mode": "prepared",
          "prepared": false
        },
        "scaling": {
          "mode": "none",
          "formula": ""
        },
        "versatileScaling": {
          "formula": "",
          "mode": "none"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "recharge": {
          "value": null,
          "formula": "1d8",
          "charged": false
        },
        "properties": [],
        "identifier": "hiraishin-ni-no-dan",
        "jutsu": {
          "components": [
            "cm",
            "cs"
          ],
          "keywords": [
            "hijutsu",
            "ninjutsu",
            "fuinjutsu"
          ],
          "countsKnown": true,
          "ability": "",
          "type": "ninjutsu"
        },
        "chakra": {
          "cost": "10",
          "scaling": {
            "mode": "none",
            "value": 0
          },
          "special": "Consumes 1 active Flying Thunder God Seal(s)."
        },
        "method": "spell",
        "prepared": 0,
        "sourceItem": "classmod:flying-thunder-god"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb": {
          "classmodArt": {
            "classmod": "flying-thunder-god"
          }
        },
        "n5eb-classmod-library": {
          "managed": true,
          "category": "art",
          "classMod": "flying-thunder-god",
          "seals": 1
        }
      },
      "folder": "CRpMRibpNWhUzb0M"
    },
    {
      "_id": "axvSYZE51Ek0Gv01",
      "name": "Hiraishingiri",
      "type": "spell",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Teleport to an active seal within 120 feet and make a melee Hiraishin Art attack with advantage against a creature near that seal.</p><p>On a hit, deal the weapon’s normal damage + 10d6 piercing damage. This damage ignores resistance and damage reduction. If the target has not acted yet, cannot clearly see you, or is surprised, deal an additional 3d6 damage.</p><p><strong>Flow:</strong> Ignore AC bonuses granted by the target’s traits, features, or jutsu. The target cannot use reactions against this Art.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "action",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": "inst"
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": 120,
          "long": null,
          "units": "ft"
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "charges",
          "target": "@scale.flying-thunder-god.ftg-charges",
          "amount": 1,
          "scale": false
        },
        "ability": "art",
        "actionType": "msak",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [
            [
              "10d6",
              "piercing"
            ]
          ],
          "versatile": "13d6 piercing"
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "art"
        },
        "level": 9,
        "rank": "s",
        "school": "trs",
        "materials": {
          "value": "",
          "consumed": false,
          "cost": 0,
          "supply": 0
        },
        "preparation": {
          "mode": "prepared",
          "prepared": false
        },
        "scaling": {
          "mode": "none",
          "formula": ""
        },
        "versatileScaling": {
          "formula": "",
          "mode": "none"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "recharge": {
          "value": null,
          "formula": "1d8",
          "charged": false
        },
        "properties": [],
        "identifier": "hiraishingiri",
        "jutsu": {
          "components": [
            "cm",
            "cs"
          ],
          "keywords": [
            "hijutsu",
            "ninjutsu",
            "fuinjutsu"
          ],
          "countsKnown": true,
          "ability": "",
          "type": "ninjutsu"
        },
        "chakra": {
          "cost": "9",
          "scaling": {
            "mode": "none",
            "value": 0
          },
          "special": "Consumes 1 active Flying Thunder God Seal(s)."
        },
        "method": "spell",
        "prepared": 0,
        "sourceItem": "classmod:flying-thunder-god"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb": {
          "classmodArt": {
            "classmod": "flying-thunder-god"
          }
        },
        "n5eb-classmod-library": {
          "managed": true,
          "category": "art",
          "classMod": "flying-thunder-god",
          "seals": 1
        }
      },
      "folder": "CRpMRibpNWhUzb0M"
    },
    {
      "_id": "dNBQRTKxghX7AoRC",
      "name": "Rasen Senkō Chō Rinbukō Sanshiki",
      "type": "spell",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Whirl two sealed kunai around yourself and teleport between them. Creatures of your choice within 25 feet must make a Dexterity saving throw.</p><p>On a failed save, a creature takes 13d6 piercing damage and falls prone. On a success, it takes half damage and suffers no additional effect.</p><p><strong>Flow:</strong> Affected creatures make the saving throw with disadvantage.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "action",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": "inst"
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": 25,
          "width": null,
          "units": "ft",
          "type": "radius",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": "self"
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "charges",
          "target": "@scale.flying-thunder-god.ftg-charges",
          "amount": 1,
          "scale": false
        },
        "ability": "art",
        "actionType": "save",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [
            [
              "13d6",
              "piercing"
            ]
          ],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "dex",
          "dc": null,
          "scaling": "art"
        },
        "level": 9,
        "rank": "s",
        "school": "trs",
        "materials": {
          "value": "",
          "consumed": false,
          "cost": 0,
          "supply": 0
        },
        "preparation": {
          "mode": "prepared",
          "prepared": false
        },
        "scaling": {
          "mode": "none",
          "formula": ""
        },
        "versatileScaling": {
          "formula": "",
          "mode": "none"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "recharge": {
          "value": null,
          "formula": "1d8",
          "charged": false
        },
        "properties": [],
        "identifier": "rasen-senko-cho-rinbuko-sanshiki",
        "jutsu": {
          "components": [
            "cm",
            "cs"
          ],
          "keywords": [
            "hijutsu",
            "ninjutsu",
            "fuinjutsu"
          ],
          "countsKnown": true,
          "ability": "",
          "type": "ninjutsu"
        },
        "chakra": {
          "cost": "10",
          "scaling": {
            "mode": "none",
            "value": 0
          },
          "special": "Consumes 2 active Flying Thunder God Seal(s)."
        },
        "method": "spell",
        "prepared": 0,
        "sourceItem": "classmod:flying-thunder-god"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb": {
          "classmodArt": {
            "classmod": "flying-thunder-god"
          }
        },
        "n5eb-classmod-library": {
          "managed": true,
          "category": "art",
          "classMod": "flying-thunder-god",
          "seals": 2
        }
      },
      "folder": "CRpMRibpNWhUzb0M"
    },
    {
      "_id": "MIbCS33tL0CZDk8G",
      "name": "Rekku Tenkō Zankūsen Reishiki",
      "type": "spell",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Scatter sealed kunai throughout a 20-foot radius and tear apart the space between them. Creatures of your choice in the area must make a Dexterity saving throw.</p><p>On a failed save, a creature takes 15d8 force damage and gains 2 ranks of Lacerated. On a success, it takes half damage and gains no Lacerated ranks.</p><p><strong>Flow:</strong> Increase the radius by 10 feet. A creature that fails the save by 5 or more is stunned until the start of its next turn.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "action",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": "inst"
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": 20,
          "width": null,
          "units": "ft",
          "type": "radius",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": "self"
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "charges",
          "target": "@scale.flying-thunder-god.ftg-charges",
          "amount": 1,
          "scale": false
        },
        "ability": "art",
        "actionType": "save",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [
            [
              "15d8",
              "force"
            ]
          ],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "dex",
          "dc": null,
          "scaling": "art"
        },
        "level": 9,
        "rank": "s",
        "school": "trs",
        "materials": {
          "value": "",
          "consumed": false,
          "cost": 0,
          "supply": 0
        },
        "preparation": {
          "mode": "prepared",
          "prepared": false
        },
        "scaling": {
          "mode": "none",
          "formula": ""
        },
        "versatileScaling": {
          "formula": "",
          "mode": "none"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "recharge": {
          "value": null,
          "formula": "1d8",
          "charged": false
        },
        "properties": [],
        "identifier": "rekku-tenko-zankusen-reishiki",
        "jutsu": {
          "components": [
            "cm",
            "cs"
          ],
          "keywords": [
            "hijutsu",
            "ninjutsu",
            "fuinjutsu"
          ],
          "countsKnown": true,
          "ability": "",
          "type": "ninjutsu"
        },
        "chakra": {
          "cost": "15",
          "scaling": {
            "mode": "none",
            "value": 0
          },
          "special": "Consumes 3 active Flying Thunder God Seal(s)."
        },
        "method": "spell",
        "prepared": 0,
        "sourceItem": "classmod:flying-thunder-god"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb": {
          "classmodArt": {
            "classmod": "flying-thunder-god"
          }
        },
        "n5eb-classmod-library": {
          "managed": true,
          "category": "art",
          "classMod": "flying-thunder-god",
          "seals": 3
        }
      },
      "folder": "CRpMRibpNWhUzb0M"
    },
    {
      "_id": "uzx6y2ALSisNWdir",
      "name": "Hiraishin: Iikū Shippū Senkō Ren no Dan: Zero Shiki",
      "type": "spell",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Throw two sealed kunai and teleport to the first. Make a melee Hiraishin Art attack. On a hit, deal the weapon’s normal damage + 8d10 force damage. The target must then make a Strength saving throw; on a failure, it is pushed 30 feet and becomes Dazed and Concussed.</p><p>Immediately teleport to the second seal. As part of this Art, you may spend your reaction to cast a melee jutsu of B-Rank or lower that requires an attack roll and normally takes an Action.</p><p><strong>Flow:</strong> Both attacks deal an additional 3d8 damage, and the target makes the Strength saving throw with disadvantage.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "action",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": "inst"
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": 120,
          "long": null,
          "units": "ft"
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "charges",
          "target": "@scale.flying-thunder-god.ftg-charges",
          "amount": 1,
          "scale": false
        },
        "ability": "art",
        "actionType": "msak",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [
            [
              "8d10",
              "force"
            ]
          ],
          "versatile": "3d8 force"
        },
        "formula": "",
        "save": {
          "ability": "str",
          "dc": null,
          "scaling": "art"
        },
        "level": 9,
        "rank": "s",
        "school": "trs",
        "materials": {
          "value": "",
          "consumed": false,
          "cost": 0,
          "supply": 0
        },
        "preparation": {
          "mode": "prepared",
          "prepared": false
        },
        "scaling": {
          "mode": "none",
          "formula": ""
        },
        "versatileScaling": {
          "formula": "",
          "mode": "none"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "recharge": {
          "value": null,
          "formula": "1d8",
          "charged": false
        },
        "properties": [],
        "identifier": "hiraishin-iiku-shippu-senko-ren-no-dan-zero-shiki",
        "jutsu": {
          "components": [
            "cm",
            "cs"
          ],
          "keywords": [
            "hijutsu",
            "ninjutsu",
            "fuinjutsu"
          ],
          "countsKnown": true,
          "ability": "",
          "type": "ninjutsu"
        },
        "chakra": {
          "cost": "12",
          "scaling": {
            "mode": "none",
            "value": 0
          },
          "special": "Consumes 2 active Flying Thunder God Seal(s)."
        },
        "method": "spell",
        "prepared": 0,
        "sourceItem": "classmod:flying-thunder-god"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb": {
          "classmodArt": {
            "classmod": "flying-thunder-god"
          }
        },
        "n5eb-classmod-library": {
          "managed": true,
          "category": "art",
          "classMod": "flying-thunder-god",
          "seals": 2
        }
      },
      "folder": "CRpMRibpNWhUzb0M"
    },
    {
      "_id": "zhN6trK78P0wnXr4",
      "name": "Hiraishin: Hakai Senkō",
      "type": "spell",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Teleport to an active seal within 60 feet. Creatures within 15 feet of your arrival point must make a Wisdom saving throw. On a failure, a creature has disadvantage on its next attack roll or saving throw.</p><p>You may immediately make a melee Hiraishin Art attack with advantage against one affected creature. On a hit, deal 12d10 force damage.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "action",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": "inst"
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": 15,
          "width": null,
          "units": "ft",
          "type": "radius",
          "prompt": true
        },
        "range": {
          "value": 60,
          "long": null,
          "units": "ft"
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "charges",
          "target": "@scale.flying-thunder-god.ftg-charges",
          "amount": 1,
          "scale": false
        },
        "ability": "art",
        "actionType": "msak",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [
            [
              "12d10",
              "force"
            ]
          ],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "wis",
          "dc": null,
          "scaling": "art"
        },
        "level": 9,
        "rank": "s",
        "school": "trs",
        "materials": {
          "value": "",
          "consumed": false,
          "cost": 0,
          "supply": 0
        },
        "preparation": {
          "mode": "prepared",
          "prepared": false
        },
        "scaling": {
          "mode": "none",
          "formula": ""
        },
        "versatileScaling": {
          "formula": "",
          "mode": "none"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "recharge": {
          "value": null,
          "formula": "1d8",
          "charged": false
        },
        "properties": [],
        "identifier": "hiraishin-hakai-senko",
        "jutsu": {
          "components": [
            "cm",
            "cs"
          ],
          "keywords": [
            "hijutsu",
            "ninjutsu",
            "fuinjutsu"
          ],
          "countsKnown": true,
          "ability": "",
          "type": "ninjutsu"
        },
        "chakra": {
          "cost": "9",
          "scaling": {
            "mode": "none",
            "value": 0
          },
          "special": "Consumes 2 active Flying Thunder God Seal(s)."
        },
        "method": "spell",
        "prepared": 0,
        "sourceItem": "classmod:flying-thunder-god"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb": {
          "classmodArt": {
            "classmod": "flying-thunder-god"
          }
        },
        "n5eb-classmod-library": {
          "managed": true,
          "category": "art",
          "classMod": "flying-thunder-god",
          "seals": 2
        }
      },
      "folder": "CRpMRibpNWhUzb0M"
    },
    {
      "_id": "aWZELhpdUJzjN4gR",
      "name": "Hiraishin: Kyūen Senkō",
      "type": "spell",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Use this reaction when an ally within 60 feet is targeted by an attack or forced to make a saving throw. Teleport to an unoccupied space within 5 feet of the ally, then teleport both of you to an active seal within 120 feet.</p><p>If the teleport places both of you outside the triggering attack’s reach or area, the effect is negated for both of you. Otherwise, resolve it normally.</p><p><strong>Flow:</strong> You and the ally gain advantage on the next saving throw each of you makes before the end of your next turn.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": "inst"
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": 60,
          "long": null,
          "units": "ft"
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "charges",
          "target": "@scale.flying-thunder-god.ftg-charges",
          "amount": 1,
          "scale": false
        },
        "ability": "art",
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "art"
        },
        "level": 9,
        "rank": "s",
        "school": "trs",
        "materials": {
          "value": "",
          "consumed": false,
          "cost": 0,
          "supply": 0
        },
        "preparation": {
          "mode": "prepared",
          "prepared": false
        },
        "scaling": {
          "mode": "none",
          "formula": ""
        },
        "versatileScaling": {
          "formula": "",
          "mode": "none"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "recharge": {
          "value": null,
          "formula": "1d8",
          "charged": false
        },
        "properties": [],
        "identifier": "hiraishin-kyuen-senko",
        "jutsu": {
          "components": [
            "cm",
            "cs"
          ],
          "keywords": [
            "hijutsu",
            "ninjutsu",
            "fuinjutsu"
          ],
          "countsKnown": true,
          "ability": "",
          "type": "ninjutsu"
        },
        "chakra": {
          "cost": "8",
          "scaling": {
            "mode": "none",
            "value": 0
          },
          "special": "Consumes 2 active Flying Thunder God Seal(s)."
        },
        "method": "spell",
        "prepared": 0,
        "sourceItem": "classmod:flying-thunder-god"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb": {
          "classmodArt": {
            "classmod": "flying-thunder-god"
          }
        },
        "n5eb-classmod-library": {
          "managed": true,
          "category": "art",
          "classMod": "flying-thunder-god",
          "seals": 2
        }
      },
      "folder": "CRpMRibpNWhUzb0M"
    },
    {
      "_id": "yMiVynFmnhvEBlYY",
      "name": "Hiraishin: Senkō Shokei",
      "type": "spell",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Choose a creature within 120 feet that is marked by one of your seals. Teleport to an unoccupied space within 5 feet of it and make a melee Hiraishin Art attack with advantage.</p><p>On a hit, deal the weapon’s normal damage + 25d8 force damage. The target must succeed on a Constitution saving throw or be stunned until the end of its next turn.</p><p><strong>Flow:</strong> This attack scores a critical hit on a roll of 18–20.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "action",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": "inst"
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": 120,
          "long": null,
          "units": "ft"
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "charges",
          "target": "@scale.flying-thunder-god.ftg-charges",
          "amount": 1,
          "scale": false
        },
        "ability": "art",
        "actionType": "msak",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [
            [
              "25d8",
              "force"
            ]
          ],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "con",
          "dc": null,
          "scaling": "art"
        },
        "level": 9,
        "rank": "s",
        "school": "trs",
        "materials": {
          "value": "",
          "consumed": false,
          "cost": 0,
          "supply": 0
        },
        "preparation": {
          "mode": "prepared",
          "prepared": false
        },
        "scaling": {
          "mode": "none",
          "formula": ""
        },
        "versatileScaling": {
          "formula": "",
          "mode": "none"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "recharge": {
          "value": null,
          "formula": "1d8",
          "charged": false
        },
        "properties": [],
        "identifier": "hiraishin-senko-shokei",
        "jutsu": {
          "components": [
            "cm",
            "cs"
          ],
          "keywords": [
            "hijutsu",
            "ninjutsu",
            "fuinjutsu"
          ],
          "countsKnown": true,
          "ability": "",
          "type": "ninjutsu"
        },
        "chakra": {
          "cost": "15",
          "scaling": {
            "mode": "none",
            "value": 0
          },
          "special": "Consumes 3 active Flying Thunder God Seal(s)."
        },
        "method": "spell",
        "prepared": 0,
        "sourceItem": "classmod:flying-thunder-god"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb": {
          "classmodArt": {
            "classmod": "flying-thunder-god"
          }
        },
        "n5eb-classmod-library": {
          "managed": true,
          "category": "art",
          "classMod": "flying-thunder-god",
          "seals": 3
        }
      },
      "folder": "CRpMRibpNWhUzb0M"
    },
    {
      "_id": "rD0ZqibOXakEXR1G",
      "name": "Hiraishin: Hangeki Senkō",
      "type": "spell",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Use this reaction when you are targeted by a melee attack. Make a melee Hiraishin Art attack and compare your result to the attacker’s roll.</p><p>If your result is higher, cancel the triggering attack and deal 7d8 piercing damage that cannot be reduced. You then teleport to an active seal within 60 feet.</p><p>If your roll misses or does not exceed the attacker’s roll, you still teleport, but only reduce the incoming damage by half.</p><p><strong>Flow:</strong> Make the counterattack with advantage, and increase the teleport range to 120 feet.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": "inst"
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": 60,
          "long": null,
          "units": "ft"
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "charges",
          "target": "@scale.flying-thunder-god.ftg-charges",
          "amount": 1,
          "scale": false
        },
        "ability": "art",
        "actionType": "msak",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [
            [
              "7d8",
              "piercing"
            ]
          ],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "art"
        },
        "level": 9,
        "rank": "s",
        "school": "trs",
        "materials": {
          "value": "",
          "consumed": false,
          "cost": 0,
          "supply": 0
        },
        "preparation": {
          "mode": "prepared",
          "prepared": false
        },
        "scaling": {
          "mode": "none",
          "formula": ""
        },
        "versatileScaling": {
          "formula": "",
          "mode": "none"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "recharge": {
          "value": null,
          "formula": "1d8",
          "charged": false
        },
        "properties": [],
        "identifier": "hiraishin-hangeki-senko",
        "jutsu": {
          "components": [
            "cm",
            "cs"
          ],
          "keywords": [
            "hijutsu",
            "ninjutsu",
            "fuinjutsu"
          ],
          "countsKnown": true,
          "ability": "",
          "type": "ninjutsu"
        },
        "chakra": {
          "cost": "8",
          "scaling": {
            "mode": "none",
            "value": 0
          },
          "special": "Consumes 1 active Flying Thunder God Seal(s)."
        },
        "method": "spell",
        "prepared": 0,
        "sourceItem": "classmod:flying-thunder-god"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb": {
          "classmodArt": {
            "classmod": "flying-thunder-god"
          }
        },
        "n5eb-classmod-library": {
          "managed": true,
          "category": "art",
          "classMod": "flying-thunder-god",
          "seals": 1
        }
      },
      "folder": "CRpMRibpNWhUzb0M"
    },
    {
      "_id": "yfdkSZUJAAibxrEl",
      "name": "Hiraishin: Kyōsei Ten'i",
      "type": "spell",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Choose a creature within 90 feet that is marked by one of your seals. It must make a Constitution saving throw.</p><p>On a failed save, teleport the creature to another active seal within 120 feet and deal 15d8 force damage. Choose an unoccupied space within 5 feet of the destination seal.</p><p><strong>Flow:</strong> The target makes the saving throw with disadvantage.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "action",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": "inst"
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": 90,
          "long": null,
          "units": "ft"
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "charges",
          "target": "@scale.flying-thunder-god.ftg-charges",
          "amount": 1,
          "scale": false
        },
        "ability": "art",
        "actionType": "save",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [
            [
              "15d8",
              "force"
            ]
          ],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "con",
          "dc": null,
          "scaling": "art"
        },
        "level": 9,
        "rank": "s",
        "school": "trs",
        "materials": {
          "value": "",
          "consumed": false,
          "cost": 0,
          "supply": 0
        },
        "preparation": {
          "mode": "prepared",
          "prepared": false
        },
        "scaling": {
          "mode": "none",
          "formula": ""
        },
        "versatileScaling": {
          "formula": "",
          "mode": "none"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "recharge": {
          "value": null,
          "formula": "1d8",
          "charged": false
        },
        "properties": [],
        "identifier": "hiraishin-kyosei-teni",
        "jutsu": {
          "components": [
            "cm",
            "cs"
          ],
          "keywords": [
            "hijutsu",
            "ninjutsu",
            "fuinjutsu"
          ],
          "countsKnown": true,
          "ability": "",
          "type": "ninjutsu"
        },
        "chakra": {
          "cost": "9",
          "scaling": {
            "mode": "none",
            "value": 0
          },
          "special": "Consumes 2 active Flying Thunder God Seal(s)."
        },
        "method": "spell",
        "prepared": 0,
        "sourceItem": "classmod:flying-thunder-god"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb": {
          "classmodArt": {
            "classmod": "flying-thunder-god"
          }
        },
        "n5eb-classmod-library": {
          "managed": true,
          "category": "art",
          "classMod": "flying-thunder-god",
          "seals": 2
        }
      },
      "folder": "CRpMRibpNWhUzb0M"
    },
    {
      "_id": "ar8WXEOiNtwBNoCz",
      "name": "Hiraishin: Yugami no Ashi",
      "type": "spell",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Use this reaction when a creature moves within 15 feet of you or targets you with an attack. Teleport to an active seal within 60 feet.</p><p>The triggering creature must make a Wisdom saving throw. On a failure, its speed becomes 0 for the rest of the current turn, and its next saving throw before the end of your next turn is made with disadvantage.</p><p><strong>Flow:</strong> The creature also takes 8d8 psychic damage and gains 2 ranks of Slowed for 1 minute.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": "inst"
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": 60,
          "long": null,
          "units": "ft"
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "charges",
          "target": "@scale.flying-thunder-god.ftg-charges",
          "amount": 1,
          "scale": false
        },
        "ability": "art",
        "actionType": "save",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [
            [
              "8d8",
              "psychic"
            ]
          ],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "wis",
          "dc": null,
          "scaling": "art"
        },
        "level": 9,
        "rank": "s",
        "school": "trs",
        "materials": {
          "value": "",
          "consumed": false,
          "cost": 0,
          "supply": 0
        },
        "preparation": {
          "mode": "prepared",
          "prepared": false
        },
        "scaling": {
          "mode": "none",
          "formula": ""
        },
        "versatileScaling": {
          "formula": "",
          "mode": "none"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "recharge": {
          "value": null,
          "formula": "1d8",
          "charged": false
        },
        "properties": [],
        "identifier": "hiraishin-yugami-no-ashi",
        "jutsu": {
          "components": [
            "cm",
            "cs"
          ],
          "keywords": [
            "hijutsu",
            "ninjutsu",
            "fuinjutsu"
          ],
          "countsKnown": true,
          "ability": "",
          "type": "ninjutsu"
        },
        "chakra": {
          "cost": "8",
          "scaling": {
            "mode": "none",
            "value": 0
          },
          "special": "Consumes 1 active Flying Thunder God Seal(s)."
        },
        "method": "spell",
        "prepared": 0,
        "sourceItem": "classmod:flying-thunder-god"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb": {
          "classmodArt": {
            "classmod": "flying-thunder-god"
          }
        },
        "n5eb-classmod-library": {
          "managed": true,
          "category": "art",
          "classMod": "flying-thunder-god",
          "seals": 1
        }
      },
      "folder": "CRpMRibpNWhUzb0M"
    },
    {
      "_id": "2r1ynddxfHW4lzIm",
      "name": "Hiraishin: Senkō Junbi",
      "type": "spell",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Choose up to three active seals within 120 feet. For the duration, the first attack you make immediately after teleporting to one of those seals deals an additional 5d8 damage, and your movement speed increases by 30 feet until the end of the current turn.</p><p>While you maintain concentration on this Art, you are considered to be in Flow.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "bonus",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": 1,
          "units": "minute"
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": "self"
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "charges",
          "target": "@scale.flying-thunder-god.ftg-charges",
          "amount": 1,
          "scale": false
        },
        "ability": "art",
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [
            [
              "5d8",
              "force"
            ]
          ],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "art"
        },
        "level": 9,
        "rank": "s",
        "school": "trs",
        "materials": {
          "value": "",
          "consumed": false,
          "cost": 0,
          "supply": 0
        },
        "preparation": {
          "mode": "prepared",
          "prepared": false
        },
        "scaling": {
          "mode": "none",
          "formula": ""
        },
        "versatileScaling": {
          "formula": "",
          "mode": "none"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "recharge": {
          "value": null,
          "formula": "1d8",
          "charged": false
        },
        "properties": [
          "concentration"
        ],
        "identifier": "hiraishin-senko-junbi",
        "jutsu": {
          "components": [
            "cm",
            "cs"
          ],
          "keywords": [
            "hijutsu",
            "ninjutsu",
            "fuinjutsu"
          ],
          "countsKnown": true,
          "ability": "",
          "type": "ninjutsu"
        },
        "chakra": {
          "cost": "15",
          "scaling": {
            "mode": "none",
            "value": 0
          },
          "special": "Consumes 3 active Flying Thunder God Seal(s)."
        },
        "method": "spell",
        "prepared": 0,
        "sourceItem": "classmod:flying-thunder-god"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb": {
          "classmodArt": {
            "classmod": "flying-thunder-god"
          }
        },
        "n5eb-classmod-library": {
          "managed": true,
          "category": "art",
          "classMod": "flying-thunder-god",
          "seals": 3
        }
      },
      "folder": "CRpMRibpNWhUzb0M"
    },
    {
      "_id": "KLLb8o93WjUDTFzL",
      "name": "Riftstep: Critical Warp",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Trigger:</strong> See the effect below.</p><p>When you make an attack roll, make a Wisdom ability check against the target’s AC, to a maximum DC of 23. On a success, increase the attack’s critical threat range by 2.</p><p>Using this reaction expends one temporary Riftstep Die and one of your Class Mod reactions.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "riftstep-critical-warp"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "riftstep",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "Ac7kxnSK8xzz6rxV"
    },
    {
      "_id": "BgtYG9zYkp5Y3c7X",
      "name": "Riftstep: Rift Mark",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Trigger:</strong> See the effect below.</p><p>When you damage a creature with a melee attack, make a Sleight of Hand check against its Passive Perception. On a success, place a Flying Thunder God Seal on the target.</p><p>Using this reaction expends one temporary Riftstep Die and one of your Class Mod reactions.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "riftstep-rift-mark"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "riftstep",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "Ac7kxnSK8xzz6rxV"
    },
    {
      "_id": "6XVwHCqqS1QEhkpR",
      "name": "Riftstep: Temporal Precision",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Trigger:</strong> See the effect below.</p><p>When you miss an attack roll, make an Insight check against the target’s AC. On a success, roll up to 2 Riftstep Dice and add their total to the attack roll.</p><p>Using this reaction expends one temporary Riftstep Die and one of your Class Mod reactions.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "2d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "riftstep-temporal-precision"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "riftstep",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "Ac7kxnSK8xzz6rxV"
    },
    {
      "_id": "wRo8LvgnvZkE6LGn",
      "name": "Riftstep: Accelerated Chakra Flow",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Trigger:</strong> See the effect below.</p><p>After casting a damaging Hiraishin Art, make a DC 25 Chakra Control check. On a success, the next damaging Hiraishin Art you cast before the end of your next turn gains X additional damage dice, where X is the result of a Riftstep Die.</p><p>Using this reaction expends one temporary Riftstep Die and one of your Class Mod reactions.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "riftstep-accelerated-chakra-flow"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "riftstep",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "Ac7kxnSK8xzz6rxV"
    },
    {
      "_id": "wkZcGE9kdfvBYRSz",
      "name": "Riftstep: Reflexive Seal",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Trigger:</strong> See the effect below.</p><p>When a creature within 60 feet takes damage, make a Chakra Control check against a DC equal to the damage taken + 2. On a success, reduce that damage by half, then you may teleport to an active seal within 30 feet.</p><p>Using this reaction expends one temporary Riftstep Die and one of your Class Mod reactions.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "riftstep-reflexive-seal"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "riftstep",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "Ac7kxnSK8xzz6rxV"
    },
    {
      "_id": "KQRoKwbI8VZq0EtO",
      "name": "Riftstep: Space-Time Feint",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Trigger:</strong> See the effect below.</p><p>When you teleport within 5 feet of an enemy, make a Deception check contested by its Insight. On a success, your next attack is treated as a critical roll, though this does not guarantee a hit.</p><p>Using this reaction expends one temporary Riftstep Die and one of your Class Mod reactions.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "riftstep-space-time-feint"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "riftstep",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "Ac7kxnSK8xzz6rxV"
    },
    {
      "_id": "fmumpMlIUznlgi8e",
      "name": "Riftstep: Flowing Momentum",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Trigger:</strong> See the effect below.</p><p>After succeeding on a Dexterity saving throw, make a DC 25 Acrobatics check. On a success, your next melee attack before the end of your next turn deals Xd6 + your proficiency bonus additional damage, where X is the result of a Riftstep Die.</p><p>Using this reaction expends one temporary Riftstep Die and one of your Class Mod reactions.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "riftstep-flowing-momentum"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "riftstep",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "Ac7kxnSK8xzz6rxV"
    },
    {
      "_id": "ksbHkNidigoscZD5",
      "name": "Riftstep: Displacement Maneuver",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Trigger:</strong> See the effect below.</p><p>When you are targeted by an attack, make a Perception check against the attacker’s Passive Perception. On a success, its next attack against you has disadvantage, and your next attack against it has advantage.</p><p>Using this reaction expends one temporary Riftstep Die and one of your Class Mod reactions.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "riftstep-displacement-maneuver"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "riftstep",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "Ac7kxnSK8xzz6rxV"
    },
    {
      "_id": "RKM1XCeDtLUlKWyD",
      "name": "Riftstep: Thunderous Entry",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Trigger:</strong> See the effect below.</p><p>Immediately after teleporting to a seal, creatures within 10 feet of your arrival point must succeed on a Strength saving throw against your Hiraishin Art save DC or fall prone.</p><p>Using this reaction expends one temporary Riftstep Die and one of your Class Mod reactions.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "riftstep-thunderous-entry"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "riftstep",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "Ac7kxnSK8xzz6rxV"
    },
    {
      "_id": "9y6pPA9GrHMSgeQc",
      "name": "Riftstep: Blink Counter",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Trigger:</strong> See the effect below.</p><p>When an enemy misses you with a melee attack, teleport behind it and immediately make a melee weapon attack. The attack deals an additional Xd8 damage, where X is the result of a Riftstep Die.</p><p>Using this reaction expends one temporary Riftstep Die and one of your Class Mod reactions.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "riftstep-blink-counter"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "riftstep",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "Ac7kxnSK8xzz6rxV"
    },
    {
      "_id": "4NIbnCuDzCQFQK7B",
      "name": "Riftstep: Temporal Aggression",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Trigger:</strong> See the effect below.</p><p>When you roll Initiative, roll a Riftstep Die and add it to the result. Your first attack roll or saving throw in that combat gains an additional bonus equal to half the die result, rounded up.</p><p>Using this reaction expends one temporary Riftstep Die and one of your Class Mod reactions.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "riftstep-temporal-aggression"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "riftstep",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "Ac7kxnSK8xzz6rxV"
    },
    {
      "_id": "Esaigymdb6DVHDZy",
      "name": "Riftstep: Seal Resonance",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Trigger:</strong> See the effect below.</p><p>When you or an ally within 30 feet restores hit points or chakra, make a DC 25 Chakra Control check. On a success, increase the healing or chakra recovery by 3 additional dice.</p><p>Using this reaction expends one temporary Riftstep Die and one of your Class Mod reactions.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "riftstep-seal-resonance"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "riftstep",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "Ac7kxnSK8xzz6rxV"
    },
    {
      "_id": "lsGbHZ2PlSKofYK9",
      "name": "Riftstep: Dimensional Pressure",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Trigger:</strong> See the effect below.</p><p>When you successfully apply a condition to an enemy, make an Intimidation check contested by its Insight. On a success, the creature subtracts one Riftstep Die from saving throws made to remove conditions until the end of its next turn.</p><p>Using this reaction expends one temporary Riftstep Die and one of your Class Mod reactions.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "riftstep-dimensional-pressure"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "riftstep",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "Ac7kxnSK8xzz6rxV"
    },
    {
      "_id": "grRgRlw3cMDBg4hG",
      "name": "Riftstep: Flash Acceleration",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Trigger:</strong> See the effect below.</p><p>When you reduce a creature to 0 hit points, immediately teleport to an active seal within 30 feet and gain the benefits of Dash or Disengage until the end of your turn.</p><p>Using this reaction expends one temporary Riftstep Die and one of your Class Mod reactions.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "riftstep-flash-acceleration"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "riftstep",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "Ac7kxnSK8xzz6rxV"
    },
    {
      "_id": "MZxkDtTKu7wzivPr",
      "name": "Riftstep: Fractured Space",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Trigger:</strong> See the effect below.</p><p>When you are targeted by an attack or an effect that requires a saving throw, roll a Riftstep Die. Until the start of your next turn, increase your AC and saving throws by the result.</p><p>Using this reaction expends one temporary Riftstep Die and one of your Class Mod reactions.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "riftstep-fractured-space"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "riftstep",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "Ac7kxnSK8xzz6rxV"
    },
    {
      "_id": "e7xepfGDMH5m1j0T",
      "name": "Riftstep: Warping Edge",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Trigger:</strong> See the effect below.</p><p>When you make a melee attack, roll a Riftstep Die. Reduce the target’s AC by the result until the end of your next turn.</p><p>Using this reaction expends one temporary Riftstep Die and one of your Class Mod reactions.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "riftstep-warping-edge"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "riftstep",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "Ac7kxnSK8xzz6rxV"
    },
    {
      "_id": "IKeYHCCs8UyHGCJi",
      "name": "Riftstep: Displacement Surge",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Trigger:</strong> See the effect below.</p><p>When you use movement to approach an enemy marked by one of your seals, roll a Riftstep Die. Gain bonus movement toward that creature equal to the result × 5 feet, and your next attack against it this turn deals additional damage equal to twice the result.</p><p>Using this reaction expends one temporary Riftstep Die and one of your Class Mod reactions.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "riftstep-displacement-surge"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "riftstep",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "Ac7kxnSK8xzz6rxV"
    },
    {
      "_id": "Tqtoi8C0dmNUXtSP",
      "name": "Riftstep: Spatial Restoration",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Trigger:</strong> See the effect below.</p><p>When you teleport with a Hiraishin Art to escape danger, roll a Riftstep Die. Restore hit points equal to twice the result, and gain advantage on your next saving throw made within 1 minute.</p><p>Using this reaction expends one temporary Riftstep Die and one of your Class Mod reactions.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "riftstep-spatial-restoration"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "riftstep",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "Ac7kxnSK8xzz6rxV"
    },
    {
      "_id": "QJZ0OilZl3LsiCnL",
      "name": "Riftstep: Chakra Surge",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Trigger:</strong> See the effect below.</p><p>When you spend chakra to cast a Hiraishin Art, roll a Riftstep Die and immediately regain chakra equal to the result.</p><p>Using this reaction expends one temporary Riftstep Die and one of your Class Mod reactions.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "riftstep-chakra-surge"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "riftstep",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "Ac7kxnSK8xzz6rxV"
    },
    {
      "_id": "mUoWs5pFgasUhQwR",
      "name": "Riftstep: Dimensional Sabotage",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p><strong>Trigger:</strong> See the effect below.</p><p>When an enemy within 30 feet teleports, moves, or is forcibly moved, roll a Riftstep Die. The target must make a Constitution saving throw; on a failure, it takes force damage equal to twice the result and loses movement equal to the result × 5 feet until the end of its next turn.</p><p>Using this reaction expends one temporary Riftstep Die and one of your Class Mod reactions.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "reaction",
          "cost": 1,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "other",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "1d6",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 2",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "riftstep-dimensional-sabotage"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "riftstep",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "Ac7kxnSK8xzz6rxV"
    },
    {
      "_id": "xSIS1qHUsv4EPmYr",
      "name": "Seal of Conservation",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Reduce the chakra cost of every Hiraishin Art you cast by 2, to a minimum cost of 5.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "seal-of-conservation"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "raijin-seal",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "bpNI1Vg0pxbbT1C7"
    },
    {
      "_id": "zFrTh2QfAehWJ0Us",
      "name": "Seal of Expansion",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Increase your maximum number of Flying Thunder God Seals by 1 for each level in this Class Mod.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "seal-of-expansion"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "raijin-seal",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "bpNI1Vg0pxbbT1C7"
    },
    {
      "_id": "p786ZCP6UBsBCoGF",
      "name": "Seal of Reflexive Surge",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Gain 2 additional Riftstep Reaction charges per Long Rest.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "seal-of-reflexive-surge"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "raijin-seal",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "bpNI1Vg0pxbbT1C7"
    },
    {
      "_id": "EcLGJ6zuCrd4TexT",
      "name": "Seal of the Riftmaster",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Your Riftstep Die becomes a d8 instead of a d6.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "seal-of-the-riftmaster"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "raijin-seal",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "bpNI1Vg0pxbbT1C7"
    },
    {
      "_id": "bnPXgit486AwjwHS",
      "name": "Seal of Flowing Focus",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Whenever you enter Flow, gain temporary hit points equal to twice your Class Mod level.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "seal-of-flowing-focus"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "raijin-seal",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "bpNI1Vg0pxbbT1C7"
    },
    {
      "_id": "L77JFqavlKzhsssN",
      "name": "Seal of the Spatial Reservoir",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Increase your maximum FTG Charges by 2. At the end of a Short Rest, regain 1 expended FTG Charge.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "seal-of-the-spatial-reservoir"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "raijin-seal",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "bpNI1Vg0pxbbT1C7"
    },
    {
      "_id": "1WSxkyFV3uOnL64j",
      "name": "Seal of Dimensional Guard",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>After casting a Hiraishin Art, gain +2 AC until the start of your next turn.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "seal-of-dimensional-guard"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "raijin-seal",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "bpNI1Vg0pxbbT1C7"
    },
    {
      "_id": "GJWRssKWw0GXOfEg",
      "name": "Seal of Instant Impact",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Once per turn, after teleporting, your next melee attack before the end of the turn deals bonus damage equal to twice your proficiency bonus.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "seal-of-instant-impact"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "raijin-seal",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "bpNI1Vg0pxbbT1C7"
    },
    {
      "_id": "50sBtcwb2AvM8DPG",
      "name": "Seal of Marked Mobility",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>As a Bonus Action, move one Flying Thunder God Seal you maintain up to 30 feet to an unoccupied space you can see.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "seal-of-marked-mobility"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "raijin-seal",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "bpNI1Vg0pxbbT1C7"
    },
    {
      "_id": "p07OB32TbDzm1CqP",
      "name": "Seal of Critical Flow",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Increase your critical threat range by 1 when attacking a creature marked by one of your seals.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "seal-of-critical-flow"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "raijin-seal",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "bpNI1Vg0pxbbT1C7"
    },
    {
      "_id": "D57Km01TQVqumQph",
      "name": "Seal of Anchoring Space",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Creatures marked by your seals have disadvantage on saving throws against being teleported, forcibly moved, or spatially displaced by your effects.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "seal-of-anchoring-space"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "raijin-seal",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "bpNI1Vg0pxbbT1C7"
    },
    {
      "_id": "a5ZKFFuZLX4qZ3OE",
      "name": "Seal of the Lightning Chain",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>When you hit with a melee attack immediately after teleporting, choose a second creature within 10 feet of the original target. It takes half the damage dealt.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "seal-of-the-lightning-chain"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "raijin-seal",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "bpNI1Vg0pxbbT1C7"
    },
    {
      "_id": "fLAOLel6iHDhnUHC",
      "name": "Seal of Dimensional Echoes",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Whenever you cast a Hiraishin Art, roll 1d6. On a 6, the Art costs no chakra.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "seal-of-dimensional-echoes"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "raijin-seal",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "bpNI1Vg0pxbbT1C7"
    },
    {
      "_id": "p0VDhhViRZdgoakP",
      "name": "Seal of Unseen Step",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>While you are in Flow, opportunity attacks against you are made with disadvantage. Teleporting through threatened spaces does not provoke opportunity attacks.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "seal-of-unseen-step"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "raijin-seal",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "bpNI1Vg0pxbbT1C7"
    },
    {
      "_id": "wgqo0lf7HY1K8oP0",
      "name": "Seal of Perfect Timing",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Once per turn, when making a check as part of a Riftstep Reaction, roll twice and use the higher result.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "seal-of-perfect-timing"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "raijin-seal",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "bpNI1Vg0pxbbT1C7"
    },
    {
      "_id": "EbFPi4XK6RRPC9Ag",
      "name": "Seal of Phase Stability",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Gain resistance to force damage and advantage on saving throws against being Grappled, Restrained, or Paralyzed.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "seal-of-phase-stability"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "raijin-seal",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "bpNI1Vg0pxbbT1C7"
    },
    {
      "_id": "YklWLKUrpb1tbWfj",
      "name": "Seal of Split Strikes",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Once per turn, after teleporting and hitting with a melee weapon attack, make one additional melee attack against a different creature within your reach as part of the same action.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "seal-of-split-strikes"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "raijin-seal",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "bpNI1Vg0pxbbT1C7"
    },
    {
      "_id": "J1Q6K8ZfQgPRLtN3",
      "name": "Seal of Temporal Lock",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Creatures you hit while in Flow cannot take reactions until the start of their next turn.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "seal-of-temporal-lock"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "raijin-seal",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "bpNI1Vg0pxbbT1C7"
    },
    {
      "_id": "egwepjQJa47PJx17",
      "name": "Seal of the Flash Brand",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Once per turn, when you damage a creature that is not marked by one of your seals, you may place a Flying Thunder God Seal on it without using an action.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "seal-of-the-flash-brand"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "raijin-seal",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "bpNI1Vg0pxbbT1C7"
    },
    {
      "_id": "sAETGuo0Nc87ZQx2",
      "name": "Seal of Arc Precision",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Hiraishin Arts that require attack rolls ignore half cover and three-quarters cover. Attacks made immediately after teleporting ignore AC bonuses granted by shields or jutsu.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "seal-of-arc-precision"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "raijin-seal",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "bpNI1Vg0pxbbT1C7"
    },
    {
      "_id": "v84R8lF7jKCVYwGD",
      "name": "Seal of Reversal Step",
      "type": "feat",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>Once per Short Rest, when you fail a saving throw, teleport to an active Flying Thunder God Seal and reroll the saving throw. You must use the new result.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "activation": {
          "type": "none",
          "cost": null,
          "condition": ""
        },
        "duration": {
          "value": "",
          "units": ""
        },
        "cover": null,
        "crewed": false,
        "target": {
          "value": "",
          "width": null,
          "units": "",
          "type": "",
          "prompt": true
        },
        "range": {
          "value": null,
          "long": null,
          "units": ""
        },
        "uses": {
          "value": null,
          "max": "",
          "per": null,
          "recovery": "",
          "prompt": true
        },
        "consume": {
          "type": "",
          "target": null,
          "amount": null,
          "scale": false
        },
        "ability": null,
        "actionType": "",
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        },
        "type": {
          "value": "classmod",
          "subtype": "",
          "nestedsubtype": ""
        },
        "requirements": "Flying Thunder God Class Mod 3",
        "recharge": {
          "value": null,
          "charged": false,
          "formula": "1d8"
        },
        "attack": {
          "bonus": "",
          "flat": false
        },
        "enchantment": null,
        "summons": null,
        "prerequisites": {
          "level": null
        },
        "properties": [],
        "identifier": "seal-of-reversal-step"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "raijin-seal",
          "classMod": "flying-thunder-god"
        }
      },
      "folder": "bpNI1Vg0pxbbT1C7"
    },
    {
      "_id": "g6ZiEv4VaZYIqvCh",
      "name": "Flying Thunder God",
      "type": "classmod",
      "img": "modules/n5eb-classmod-library/assets/flying-thunder-god.png",
      "system": {
        "description": {
          "value": "<p>A Hiraishin Class Mod for masters of space-time movement. Drag this entry from the compendium onto a character, then advance its Class Mod level through the standard N5eB Advancement dialog.</p><table><thead><tr><th>Level</th><th>Minimum Character Level</th><th>Arts Known</th><th>FTG Charges</th><th>Riftstep Reactions</th><th>Raijin Seals</th></tr></thead><tbody><tr><td>1</td><td>8</td><td>2</td><td>4</td><td>–</td><td>–</td></tr><tr><td>2</td><td>11</td><td>2</td><td>5</td><td>2</td><td>–</td></tr><tr><td>3</td><td>14</td><td>3</td><td>6</td><td>2</td><td>1</td></tr><tr><td>4</td><td>17</td><td>3</td><td>7</td><td>3</td><td>2</td></tr><tr><td>5</td><td>20</td><td>4</td><td>8</td><td>4</td><td>2</td></tr></tbody></table><p><strong>Level-Up Requirement:</strong> To gain each additional Class Mod level, defeat an Elite enemy of at least your level or a Solo enemy no more than two levels below you without active allies, then complete a Long Rest spent meditating on the spatial currents left by the battle.</p><p><strong>Automation Note:</strong> Attack rolls, saving throws, damage, chakra costs, FTG Charges, Advancement choices, and passive numerical bonuses are prepared. Seal positions and highly situational reactions remain under player and GM control.</p>",
          "chat": ""
        },
        "source": {
          "custom": "Flying Thunder God Class Mod v1.2",
          "rules": "n5eb",
          "book": "Homebrew"
        },
        "identifier": "flying-thunder-god",
        "levels": 1,
        "advancement": {
          "grant1": {
            "_id": "8RFjPnmnNwavJdZk",
            "type": "ItemGrant",
            "configuration": {
              "items": [
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.O7EhDYnonq164hkG",
                  "optional": false
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.sN5OP36BZq3qDqWA",
                  "optional": false
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.RT4FclozwBPHR92z",
                  "optional": false
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.rHmEk9O5Zn78F5Gu",
                  "optional": false
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.GIrg7HvcWrn0LeI1",
                  "optional": false
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.UciHlw5N59dLjwDU",
                  "optional": false
                }
              ],
              "optional": false,
              "spell": null
            },
            "value": {},
            "level": 1,
            "title": "",
            "hint": ""
          },
          "grant2": {
            "_id": "9ZEToFKzDis04tH0",
            "type": "ItemGrant",
            "configuration": {
              "items": [
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.h6ApdWbTsAy5eYlP",
                  "optional": false
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.qgCYUswEaQnuiPkH",
                  "optional": false
                }
              ],
              "optional": false,
              "spell": null
            },
            "value": {},
            "level": 2,
            "title": "",
            "hint": ""
          },
          "grant3": {
            "_id": "vrHJyPRq6VjcBQc9",
            "type": "ItemGrant",
            "configuration": {
              "items": [
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.vbrCpQyW8N2f7Zfw",
                  "optional": false
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.vGAKsq50CIcfmMn9",
                  "optional": false
                }
              ],
              "optional": false,
              "spell": null
            },
            "value": {},
            "level": 3,
            "title": "",
            "hint": ""
          },
          "grant4": {
            "_id": "wOHfTcMpzGfZUGi7",
            "type": "ItemGrant",
            "configuration": {
              "items": [
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.jOUExOfdhnkDdTDx",
                  "optional": false
                }
              ],
              "optional": false,
              "spell": null
            },
            "value": {},
            "level": 4,
            "title": "",
            "hint": ""
          },
          "grant5": {
            "_id": "cysD3fC2p2OSw0BI",
            "type": "ItemGrant",
            "configuration": {
              "items": [
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.X67mku07Iz7sSMjb",
                  "optional": false
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.fGdLICffmbwuZHJ0",
                  "optional": false
                }
              ],
              "optional": false,
              "spell": null
            },
            "value": {},
            "level": 5,
            "title": "",
            "hint": ""
          },
          "arts": {
            "_id": "jXUZXOawniWVBNQS",
            "type": "ItemChoice",
            "configuration": {
              "choices": {
                "1": {
                  "count": 2,
                  "replacement": false
                },
                "3": {
                  "count": 1,
                  "replacement": false
                },
                "5": {
                  "count": 1,
                  "replacement": false
                }
              },
              "allowDrops": false,
              "type": null,
              "pool": [
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.8Y2DHqcGjlJHXJAX"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.qbPaTcLFeGiKAW7y"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.Tcb3AB0zQ29XmLDE"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.axvSYZE51Ek0Gv01"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.dNBQRTKxghX7AoRC"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.MIbCS33tL0CZDk8G"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.uzx6y2ALSisNWdir"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.zhN6trK78P0wnXr4"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.aWZELhpdUJzjN4gR"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.yMiVynFmnhvEBlYY"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.rD0ZqibOXakEXR1G"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.yfdkSZUJAAibxrEl"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.ar8WXEOiNtwBNoCz"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.2r1ynddxfHW4lzIm"
                }
              ],
              "spell": null,
              "restriction": {}
            },
            "value": {
              "added": {},
              "replaced": {}
            },
            "title": "Hiraishin Arts",
            "hint": "Choose 2 Arts at 1st level, one additional Art at 3rd level, and one additional Art at 5th level."
          },
          "rifts": {
            "_id": "THR8hoHWPYiabzaA",
            "type": "ItemChoice",
            "configuration": {
              "choices": {
                "2": {
                  "count": 2,
                  "replacement": false
                },
                "4": {
                  "count": 1,
                  "replacement": false
                },
                "5": {
                  "count": 1,
                  "replacement": false
                }
              },
              "allowDrops": false,
              "type": null,
              "pool": [
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.KLLb8o93WjUDTFzL"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.BgtYG9zYkp5Y3c7X"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.6XVwHCqqS1QEhkpR"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.wRo8LvgnvZkE6LGn"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.wkZcGE9kdfvBYRSz"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.KQRoKwbI8VZq0EtO"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.fmumpMlIUznlgi8e"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.ksbHkNidigoscZD5"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.RKM1XCeDtLUlKWyD"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.9y6pPA9GrHMSgeQc"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.4NIbnCuDzCQFQK7B"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.Esaigymdb6DVHDZy"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.lsGbHZ2PlSKofYK9"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.grRgRlw3cMDBg4hG"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.MZxkDtTKu7wzivPr"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.e7xepfGDMH5m1j0T"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.IKeYHCCs8UyHGCJi"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.Tqtoi8C0dmNUXtSP"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.QJZ0OilZl3LsiCnL"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.mUoWs5pFgasUhQwR"
                }
              ],
              "spell": null,
              "restriction": {}
            },
            "value": {
              "added": {},
              "replaced": {}
            },
            "title": "Riftstep Reactions",
            "hint": "Choose 2 Riftstep Reactions at 2nd level, one additional reaction at 4th level, and one additional reaction at 5th level."
          },
          "seals": {
            "_id": "Giw6b2Owh3YskDFG",
            "type": "ItemChoice",
            "configuration": {
              "choices": {
                "3": {
                  "count": 1,
                  "replacement": false
                },
                "4": {
                  "count": 1,
                  "replacement": false
                }
              },
              "allowDrops": false,
              "type": null,
              "pool": [
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.xSIS1qHUsv4EPmYr"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.zFrTh2QfAehWJ0Us"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.p786ZCP6UBsBCoGF"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.EcLGJ6zuCrd4TexT"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.bnPXgit486AwjwHS"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.L77JFqavlKzhsssN"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.1WSxkyFV3uOnL64j"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.GJWRssKWw0GXOfEg"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.50sBtcwb2AvM8DPG"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.p07OB32TbDzm1CqP"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.D57Km01TQVqumQph"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.a5ZKFFuZLX4qZ3OE"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.fLAOLel6iHDhnUHC"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.p0VDhhViRZdgoakP"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.wgqo0lf7HY1K8oP0"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.EbFPi4XK6RRPC9Ag"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.YklWLKUrpb1tbWfj"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.J1Q6K8ZfQgPRLtN3"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.egwepjQJa47PJx17"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.sAETGuo0Nc87ZQx2"
                },
                {
                  "uuid": "Compendium.world.n5eb-custom-class-mods.Item.v84R8lF7jKCVYwGD"
                }
              ],
              "spell": null,
              "restriction": {}
            },
            "value": {
              "added": {},
              "replaced": {}
            },
            "title": "Raijin Seals",
            "hint": "Choose one Raijin Seal at 3rd level and one additional Raijin Seal at 4th level."
          },
          "charges": {
            "_id": "OtPeaqYuLDHVPeAh",
            "type": "ScaleValue",
            "configuration": {
              "identifier": "ftg-charges",
              "type": "number",
              "distance": {
                "units": ""
              },
              "scale": {
                "1": {
                  "value": 4
                },
                "2": {
                  "value": 5
                },
                "3": {
                  "value": 6
                },
                "4": {
                  "value": 7
                },
                "5": {
                  "value": 8
                }
              }
            },
            "value": {},
            "title": "FTG Charges",
            "hint": ""
          },
          "artsKnown": {
            "_id": "v8O3NMDBLpsuVxz7",
            "type": "ScaleValue",
            "configuration": {
              "identifier": "arts-known",
              "type": "number",
              "distance": {
                "units": ""
              },
              "scale": {
                "1": {
                  "value": 2
                },
                "2": {
                  "value": 2
                },
                "3": {
                  "value": 3
                },
                "4": {
                  "value": 3
                },
                "5": {
                  "value": 4
                }
              }
            },
            "value": {},
            "title": "Hiraishin Arts Known",
            "hint": ""
          },
          "riftKnown": {
            "_id": "rjR4T6onQdP3IkNg",
            "type": "ScaleValue",
            "configuration": {
              "identifier": "riftstep-known",
              "type": "number",
              "distance": {
                "units": ""
              },
              "scale": {
                "1": {
                  "value": 0
                },
                "2": {
                  "value": 2
                },
                "3": {
                  "value": 2
                },
                "4": {
                  "value": 3
                },
                "5": {
                  "value": 4
                }
              }
            },
            "value": {},
            "title": "Riftstep Reactions Known",
            "hint": ""
          },
          "sealKnown": {
            "_id": "VHYPHehnXASa0sxt",
            "type": "ScaleValue",
            "configuration": {
              "identifier": "raijin-seals-known",
              "type": "number",
              "distance": {
                "units": ""
              },
              "scale": {
                "1": {
                  "value": 0
                },
                "2": {
                  "value": 0
                },
                "3": {
                  "value": 1
                },
                "4": {
                  "value": 2
                },
                "5": {
                  "value": 2
                }
              }
            },
            "value": {},
            "title": "Raijin Seals Known",
            "hint": ""
          }
        },
        "save": {
          "formula": "10+2*@abilities.dex.mod+floor(@details.level/4)",
          "value": "10+2*@abilities.dex.mod+floor(@details.level/4)",
          "scaling": ""
        },
        "attackBonus": {
          "formula": "2*@abilities.dex.mod+2*@classmods.flying-thunder-god.levels",
          "value": "2*@abilities.dex.mod+2*@classmods.flying-thunder-god.levels",
          "scaling": ""
        },
        "color": "#f2c94c"
      },
      "effects": [],
      "sort": 0,
      "ownership": {
        "default": 0
      },
      "flags": {
        "n5eb-classmod-library": {
          "managed": true,
          "category": "classmod",
          "contentVersion": "0.2.0"
        }
      },
      "folder": "x2mm0NNQlCbnDQw5"
    }
  ]
}
