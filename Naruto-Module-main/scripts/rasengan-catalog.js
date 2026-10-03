// Generated from docs/Rasengan-rules-source.md.
export const ARTS = [
  {
    "id": "rasengan",
    "itemId": "6dfd57a62ea4c90a",
    "name": "Rasengan",
    "points": 2,
    "cost": 8,
    "costText": "8 Planetary Chakra",
    "parts": [
      {
        "formula": "6d8",
        "type": "chakra"
      }
    ],
    "mode": "attack",
    "ranged": false,
    "save": null,
    "half": false,
    "maxTargets": 1,
    "rangeText": "5 feet",
    "description": "<p><strong>Rasengan Points:</strong> 2</p><p><strong>Cost:</strong> 8 Planetary Chakra  </p><p><strong>Range:</strong> 5 feet   </p><p><strong>Duration:</strong> Instantaneous</p><p>You form a dense sphere of rapidly rotating chakra in the palm of your hand.</p><p>Make a Melee Rasengan Art Attack against one creature within your reach.</p><p>On a hit, the target takes <strong>6d8 Chakra Damage</strong>.</p><p>If the target is Large or smaller, you may push it up to 30 feet away from you.</p>",
    "requiresArts": [],
    "requires": []
  },
  {
    "id": "spiralling-serial-spheres-rasengan",
    "itemId": "ca786fbb3073635c",
    "name": "Spiralling Serial Spheres Rasengan",
    "points": 2,
    "cost": 16,
    "costText": "16 Planetary Chakra",
    "parts": [
      {
        "formula": "10d8",
        "type": "chakra"
      }
    ],
    "mode": "attack",
    "ranged": true,
    "save": null,
    "half": false,
    "maxTargets": 1,
    "rangeText": "5 feet",
    "description": "<p><strong>Rasengan Points:</strong> 2</p><p><strong>Cost:</strong> 16 Planetary Chakra  </p><p><strong>Range:</strong> 5 feet  </p><p><strong>Duration:</strong> Instantaneous</p><p>You form a dense sphere of rapidly rotating chakra in the palm of each of your hands.</p><p>Make a Ranged Rasengan Art Attack against one creature within range.</p><p>On a hit, the target takes <strong>10d8 Chakra Damage</strong>.</p>",
    "requiresArts": [],
    "requires": []
  },
  {
    "id": "rasenshuriken",
    "itemId": "e83c50629dc11b94",
    "name": "Rasenshuriken",
    "points": 3,
    "cost": 12,
    "costText": "12 Planetary Chakra",
    "parts": [
      {
        "formula": "8d8",
        "type": "chakra"
      }
    ],
    "mode": "attack",
    "ranged": true,
    "save": null,
    "half": false,
    "maxTargets": 1,
    "rangeText": "30 feet",
    "description": "<p><strong>Rasengan Points:</strong> 3</p><p><strong>Cost:</strong> 12 Planetary Chakra  </p><p><strong>Range:</strong> 30 feet  </p><p><strong>Duration:</strong> Instantaneous</p><p>You form a dense sphere of rapidly rotating chakra that takes the form of a Shuriken in the palm of one of your free hands.</p><p>Make a Rasengan Art Attack against one creature within your reach.</p><p>On a hit, the target takes <strong>8d8 Chakra Damage</strong>.</p><p>The target does not gain the benefits of Half Cover or Three-Quarters Cover against this attack.</p><p>If the target is within a 5 feet range of you, you have disadvantage on the Attack Roll.</p>",
    "requiresArts": [],
    "requires": []
  },
  {
    "id": "big-ball-rasengan",
    "itemId": "7eaef7bae9b35327",
    "name": "Big Ball Rasengan",
    "points": 2,
    "cost": 20,
    "costText": "20 Planetary Chakra",
    "parts": [
      {
        "formula": "4d8",
        "type": "chakra"
      }
    ],
    "mode": "save",
    "ranged": false,
    "save": null,
    "half": false,
    "maxTargets": 99,
    "rangeText": "5 feet",
    "description": "<p><strong>Rasengan Points:</strong> 2</p><p><strong>Cost:</strong> 20 Planetary Chakra  </p><p><strong>Range:</strong> 5 feet  </p><p><strong>Duration:</strong> Instantaneous</p><p>You form a dense sphere of rapidly rotating chakra in the palm of your hand thats significantly larger then the normal Rasengan.</p><p>Every creature in a 15 feet radius must make a save against your Rasengan Save DC.</p><p>On a failed save, each target takes <strong>4d8 Chakra Damage</strong>.</p>",
    "requiresArts": [],
    "requires": []
  },
  {
    "id": "ultra-big-ball-rasengan",
    "itemId": "771a26a015a3e1bd",
    "name": "Ultra Big Ball Rasengan",
    "points": 3,
    "cost": 30,
    "costText": "30 Planetary Chakra",
    "parts": [
      {
        "formula": "6d8",
        "type": "chakra"
      }
    ],
    "mode": "save",
    "ranged": false,
    "save": null,
    "half": false,
    "maxTargets": 99,
    "rangeText": "Touch",
    "description": "<p><strong>Rasengan Points:</strong> 3</p><p><strong>Cost:</strong> 30 Planetary Chakra  </p><p><strong>Range:</strong> Touch  </p><p><strong>Duration:</strong> Instantaneous</p><p><strong>Prerequisite:</strong> Big Ball Rasengan</p><p>You form a dense sphere of rapidly rotating chakra in the palm of your hand thats significantly larger then the normal Big Ball Rasengan.</p><p>Every creature in a 25 feet radius must make a save against your Rasengan Save DC.</p><p>On a failed save, each target takes <strong>6d8 Chakra Damage</strong>.</p>",
    "requiresArts": [
      "big-ball-rasengan"
    ],
    "requires": [],
    "prerequisiteText": "Big Ball Rasengan"
  },
  {
    "id": "rasengan-flash",
    "itemId": "9b8e46214838037a",
    "name": "Rasengan: Flash",
    "points": 2,
    "cost": 14,
    "costText": "14 Planetary Chakra",
    "parts": [
      {
        "formula": "4d8",
        "type": "chakra"
      }
    ],
    "mode": "attack",
    "ranged": false,
    "save": null,
    "half": false,
    "maxTargets": 99,
    "rangeText": "20 feet line",
    "description": "<p><strong>Rasengan Points:</strong> 2</p><p><strong>Cost:</strong> 14 Planetary Chakra  </p><p><strong>Range:</strong> 20 feet line  </p><p><strong>Duration:</strong> Instantaneous</p><p>You form a dense sphere of rapidly rotating chakra in the palm of your hand which then fires as a beam in a 20 feet long and 5 feet wide line.</p><p>Make a Melee Rasengan Art Attack against all creatures within the line.</p><p>On a hit, the target takes <strong>4d8 Chakra Damage</strong>.</p>",
    "requiresArts": [],
    "requires": []
  },
  {
    "id": "super-ultra-big-ball-rasengan",
    "itemId": "58e64d9fbc70c7dc",
    "name": "Super-Ultra-Big Ball Rasengan",
    "points": 4,
    "cost": 35,
    "costText": "35 Planetary Chakra",
    "parts": [
      {
        "formula": "8d8",
        "type": "chakra"
      }
    ],
    "mode": "save",
    "ranged": false,
    "save": null,
    "half": false,
    "maxTargets": 99,
    "rangeText": "Touch",
    "description": "<p><strong>Rasengan Points:</strong> 4</p><p><strong>Cost:</strong> 35 Planetary Chakra  </p><p><strong>Range:</strong> Touch  </p><p><strong>Duration:</strong> Instantaneous</p><p><strong>Prerequisite:</strong> Ultra Big Ball Rasengan</p><p>You form a dense sphere of rapidly rotating chakra in the palm of your hand thats significantly larger then the Ultra Big Ball Rasengan.</p><p>Every creature in a 40 feet radius must make a save against your Rasengan Save DC.</p><p>On a failed save, each target takes <strong>8d8 Chakra Damage</strong>.</p>",
    "requiresArts": [
      "ultra-big-ball-rasengan"
    ],
    "requires": [],
    "prerequisiteText": "Ultra Big Ball Rasengan"
  },
  {
    "id": "rasendan",
    "itemId": "888861e2441d8512",
    "name": "Rasendan",
    "points": 2,
    "cost": 8,
    "costText": "8 Planetary Chakra",
    "parts": [
      {
        "formula": "4d8",
        "type": "chakra"
      }
    ],
    "mode": "attack",
    "ranged": true,
    "save": null,
    "half": false,
    "maxTargets": 1,
    "rangeText": "30 feet",
    "description": "<p><strong>Rasengan Points:</strong> 2</p><p><strong>Cost:</strong> 8 Planetary Chakra  </p><p><strong>Range:</strong> 30 feet  </p><p><strong>Duration:</strong> Instantaneous</p><p>You form a dense sphere of rapidly rotating chakra in the palm of your hand.</p><p>Make a Melee Rasengan Art Attack against one creature within your reach.</p><p>On a hit, the target takes <strong>4d8 Chakra Damage</strong>.</p>",
    "requiresArts": [],
    "requires": []
  },
  {
    "id": "multi-shot-rasendan",
    "itemId": "70b47635d8aaefca",
    "name": "Multi Shot Rasendan",
    "points": 2,
    "cost": 16,
    "costText": "16 Planetary Chakra",
    "parts": [
      {
        "formula": "4d8",
        "type": "chakra"
      }
    ],
    "mode": "attack",
    "ranged": true,
    "save": null,
    "half": false,
    "maxTargets": 3,
    "rangeText": "30 feet",
    "description": "<p><strong>Rasengan Points:</strong> 2</p><p><strong>Cost:</strong> 16 Planetary Chakra  </p><p><strong>Range:</strong> 30 feet  </p><p><strong>Duration:</strong> Instantaneous</p><p><strong>Prerequisite:</strong> Rasendan</p><p>You form a dense sphere of rapidly rotating chakra in the palm of your hand</p><p>Make a Melee Rasengan Art Attack against three creatures within your reach.</p><p>On a hit, the target takes <strong>4d8 Chakra Damage</strong>.</p>",
    "requiresArts": [
      "rasendan"
    ],
    "requires": [],
    "prerequisiteText": "Rasendan"
  },
  {
    "id": "planetary-rasengan",
    "itemId": "19c0cf2375f455bb",
    "name": "Planetary Rasengan",
    "points": 3,
    "cost": 12,
    "costText": "12 Planetary Chakra",
    "parts": [
      {
        "formula": "8d8",
        "type": "chakra"
      }
    ],
    "mode": "attack",
    "ranged": false,
    "save": null,
    "half": false,
    "maxTargets": 1,
    "rangeText": "Touch",
    "description": "<p><strong>Rasengan Points:</strong> 3</p><p><strong>Cost:</strong> 12 Planetary Chakra  </p><p><strong>Range:</strong> Touch  </p><p><strong>Duration:</strong> Instantaneous</p><p>You compress Planetary Chakra into the Rasengan, causing the sphere to become significantly denser.</p><p>Make a Melee Rasengan Art Attack against one creature within your reach.</p><p>On a hit, the target takes <strong>8d8 Chakra Damage</strong>.</p><p>The target must succeed on a Strength Saving Throw or be pushed up to 20 feet away from you and knocked Prone.</p>",
    "requiresArts": [],
    "requires": []
  },
  {
    "id": "vanishing-rasengan",
    "itemId": "bf8267d097dc7a4b",
    "name": "Vanishing Rasengan",
    "points": 2,
    "cost": 1,
    "costText": "1 Planetary Chakra",
    "parts": [
      {
        "formula": "5d8",
        "type": "chakra"
      }
    ],
    "mode": "attack",
    "ranged": true,
    "save": null,
    "half": false,
    "maxTargets": 1,
    "rangeText": "30 feet",
    "description": "<p><strong>Rasengan Points:</strong> 2</p><p><strong>Cost:</strong> 1 Planetary Chakra  </p><p><strong>Range:</strong> 30 feet  </p><p><strong>Duration:</strong> 1 Round</p><p>You alter the chakra structure of your Rasengan, causing it to disappear from sight immediately after being thrown.</p><p>Make a Ranged Rasengan Art Attack against one creature within range.</p><p>On a hit, the target takes <strong>5d8 Chakra Damage</strong>.</p><p>The target does not gain the benefits of Half Cover or Three-Quarters Cover against this attack.</p><p>The target cannot take reactions against this Rasengan Art.</p>",
    "requiresArts": [],
    "requires": []
  },
  {
    "id": "portal-rasengan",
    "itemId": "51344d07a14eecb6",
    "name": "Portal Rasengan",
    "points": 3,
    "cost": 10,
    "costText": "10 Planetary Chakra",
    "parts": [
      {
        "formula": "6d8",
        "type": "chakra"
      }
    ],
    "mode": "save",
    "ranged": false,
    "save": null,
    "half": false,
    "maxTargets": 1,
    "rangeText": "Sight",
    "description": "<p><strong>Rasengan Points:</strong> 3</p><p><strong>Cost:</strong> 10 Planetary Chakra  </p><p><strong>Range:</strong> Sight</p><p><strong>Duration:</strong> Instantaneous</p><p><strong>Prerequisite:</strong> Yomotsu Hirasaka</p><p>You alter the chakra structure of your Rasengan, causing it to disappear into a Portal that reappears behind the Target.</p><p>The creature must make a save against your Rasengan Save DC.</p><p>On a hit, the target takes <strong>6d8 Chakra Damage</strong>.</p><p>The target does not gain the benefits of Half Cover or Three-Quarters Cover against this attack.</p>",
    "requiresArts": [],
    "requires": [
      "yomotsu-hirasaka"
    ],
    "prerequisiteText": "Yomotsu Hirasaka"
  },
  {
    "id": "crescent-moon-rasengan",
    "itemId": "4c909f22eaeeea51",
    "name": "Crescent Moon Rasengan",
    "points": 3,
    "cost": 10,
    "costText": "10 Planetary Chakra & 10 Celestial Chakra",
    "parts": [
      {
        "formula": "10d8",
        "type": "chakra"
      }
    ],
    "mode": "attack",
    "ranged": true,
    "save": null,
    "half": false,
    "maxTargets": 1,
    "rangeText": "30 feet",
    "description": "<p><strong>Rasengan Points:</strong> 3</p><p><strong>Cost:</strong> 10 Planetary Chakra &amp; 10 Celestial Chakra </p><p><strong>Range:</strong> 30 feet  </p><p><strong>Duration:</strong> Instantaneous</p><p><strong>Prerequisite:</strong> Tenseigan</p><p>By fusing your Celestial Chakra with the Planetary Chakra your harnessed the size of the Rasengan is increased, which glows a bright white, light-purple colour, and forms a white crescent moon with a star inside of it.</p><p>Make a Ranged Rasengan Art Attack against one creature within range.</p><p>On a hit, the target takes <strong>10d8 Chakra Damage</strong>.</p>",
    "requiresArts": [],
    "requires": [
      "tenseigan"
    ],
    "prerequisiteText": "Tenseigan",
    "celestialCost": 10
  },
  {
    "id": "deep-crimson-rasengan",
    "itemId": "84234f943af167ec",
    "name": "Deep Crimson Rasengan",
    "points": 3,
    "cost": 15,
    "costText": "15 Planetary Chakra",
    "parts": [
      {
        "formula": "10d8",
        "type": "chakra"
      }
    ],
    "mode": "attack",
    "ranged": false,
    "save": null,
    "half": false,
    "maxTargets": 1,
    "rangeText": "touch",
    "description": "<p><strong>Rasengan Points:</strong> 3</p><p><strong>Cost:</strong> 15 Planetary Chakra  </p><p><strong>Range:</strong> touch </p><p><strong>Duration:</strong> Instantaneous</p><p><strong>Prerequisite:</strong> Kāma Seal</p><p>You alter the chakra structure of your Rasengan, using the Power of the Ōtsutsuki that resides within you. When you harness their Power for this Rasengan Art, the Rasengan becomes massive and takes on a deep red Color.</p><p>Make a Meele Rasengan Art Attack against one creature within range.</p><p>On a hit, the target takes <strong>10d8 Chakra Damage</strong>.</p>",
    "requiresArts": [],
    "requires": [
      "kama-seal"
    ],
    "prerequisiteText": "Kāma Seal"
  },
  {
    "id": "meteoriten-rasengan",
    "itemId": "8c73ba5e1c508e60",
    "name": "Meteoriten Rasengan",
    "points": 4,
    "cost": 45,
    "costText": "45 Planetary Chakra",
    "parts": [
      {
        "formula": "10d8",
        "type": "chakra"
      }
    ],
    "mode": "save",
    "ranged": false,
    "save": "dex",
    "half": true,
    "maxTargets": 99,
    "rangeText": "60 feet",
    "description": "<p><strong>Rasengan Points:</strong> 4</p><p><strong>Cost:</strong> 45 Planetary Chakra  </p><p><strong>Range:</strong> 60 feet  </p><p><strong>Duration:</strong> Instantaneous</p><p>You launch a massive sphere of compressed Planetary Chakra.</p><p>Choose a point within range. Each creature within a 50-foot-radius sphere centered on that point must make a Dexterity Saving Throw.</p><p>On a failed save, a creature takes <strong>10d8 Chakra Damage</strong> and is pushed 20 feet away from the center.</p><p>On a successful save, the creature takes half as much damage and is not pushed.</p>",
    "requiresArts": [],
    "requires": []
  },
  {
    "id": "spiral-rasengan",
    "itemId": "fd1c9e293c9f9d51",
    "name": "Spiral Rasengan",
    "points": 3,
    "cost": 15,
    "costText": "15 Planetary Chakra",
    "parts": [
      {
        "formula": "10d8",
        "type": "chakra"
      }
    ],
    "mode": "attack",
    "ranged": false,
    "save": null,
    "half": false,
    "maxTargets": 1,
    "rangeText": "Touch",
    "description": "<p><strong>Rasengan Points:</strong> 3</p><p><strong>Cost:</strong> 15 Planetary Chakra  </p><p><strong>Range:</strong> Touch  </p><p><strong>Duration:</strong> Instantaneous</p><p>You manipulate the rotation of the Rasengan into multiple layers of opposing rotation.</p><p>Make a Melee Rasengan Art Attack.</p><p>On a hit, the target takes <strong>10d8 Chakra Damage</strong>.</p><p>The target must then succeed on a Constitution Saving Throw.</p><p>On a failure, the target cannot regain Hit Points until the start of your next turn.</p>",
    "requiresArts": [],
    "requires": []
  },
  {
    "id": "planetary-rasengan-cataclysm",
    "itemId": "9605af9a572042af",
    "name": "Planetary Rasengan: Cataclysm",
    "points": 5,
    "cost": 60,
    "costText": "60 Planetary Chakra",
    "parts": [
      {
        "formula": "12d10",
        "type": "chakra"
      }
    ],
    "mode": "save",
    "ranged": false,
    "save": "dex",
    "half": true,
    "maxTargets": 99,
    "rangeText": "120 feet",
    "description": "<p><strong>Rasengan Points:</strong> 5</p><p><strong>Cost:</strong> 60 Planetary Chakra  </p><p><strong>Range:</strong> 120 feet  </p><p><strong>Duration:</strong> Instantaneous</p><p>You compress an immense amount of Planetary Chakra into a single Rasengan.</p><p>Choose a point within range.</p><p>Each creature within a 60-foot-radius sphere centered on that point must make a Dexterity Saving Throw.</p><p>On a failed save, a creature takes <strong>12d10 Chakra Damage</strong> and is pushed up to 30 feet away from the center. On a successful save, the creature takes half as much damage.</p><p>Creatures that fail the Saving Throw are also knocked Prone.</p>",
    "requiresArts": [],
    "requires": []
  },
  {
    "id": "ultimate-rasengan",
    "itemId": "50244206237c4353",
    "name": "Ultimate Rasengan",
    "points": 3,
    "cost": 0,
    "costText": "0 Planetary Chakra",
    "parts": [
      {
        "formula": "20d10",
        "type": "chakra"
      }
    ],
    "mode": "attack",
    "ranged": false,
    "save": null,
    "half": false,
    "maxTargets": 1,
    "rangeText": "Touch",
    "description": "<p><strong>Rasengan Points:</strong> 3</p><p><strong>Cost:</strong> 0 Planetary Chakra  </p><p><strong>Range:</strong> Touch  </p><p><strong>Duration:</strong> Instantaneous</p><p>You concentrate everything you have learned about chakra rotation and Planetary Chakra into a single Rasengan.</p><p>Make a Melee Rasengan Art Attack.</p><p>On a hit, the target takes <strong>20d10 Chakra Damage</strong>.</p><p>The target must then succeed on a Constitution Saving Throw.</p><p>On a failure, the target is pushed 30 feet away from you and knocked Prone.</p><p>A creature that succeeds on the Saving Throw is pushed 15 feet instead.</p><p>This Technique can only be used while you have 1 Hit Point remaining.</p><p>The user falls unconscious after this Rasengan Art.</p>",
    "requiresArts": [],
    "requires": []
  },
  {
    "id": "ch-jik-raisen-senkai-rasen-chidori-s-kyoku-h-ten-jigen-retsudan-messh-sh",
    "itemId": "26d862cda7138787",
    "name": "Chōjikū Raisen Senkai: Rasen Chidori Sōkyoku Hōten Jigen Retsudan Messhōshō",
    "points": 5,
    "cost": 50,
    "costText": "50 Planetary Chakra",
    "parts": [
      {
        "formula": "25d10",
        "type": "chakra"
      },
      {
        "formula": "25d10",
        "type": "lightning"
      }
    ],
    "mode": "attack",
    "ranged": false,
    "save": null,
    "half": false,
    "maxTargets": 1,
    "rangeText": "Touch",
    "description": "<p><strong>Rasengan Points:</strong> 5</p><p><strong>Cost:</strong> 50 Planetary Chakra</p><p><strong>Range:</strong> Touch</p><p><strong>Duration:</strong> Instantaneous</p><p><strong>Prerequisite:</strong> Character with a Chidori next to the User.</p><p>The Users press their Rasengan and Chidori into each other, combining it into one singular Force. </p><p>Both users rush forward with the Jutsu in Hand and attack the Target.</p><p>Because the Energy of this Jutsu is too high it goes directly through the Target and Shoots back out behind it, leaving open a rift in the current Dimension.</p><p>Make a Melee Rasengan Art Attack.</p><p>On a hit, the target takes <strong>25d10 Chakra Damage</strong> and <strong>25d10 Lightning damage</strong>.</p><p>Both users cant mold Chakra until they finish a Full Rest. This Technique cant be just again until 1 Month after the Full Rest.</p>",
    "requiresArts": [],
    "requires": [],
    "prerequisiteText": "Character with a Chidori next to the User.",
    "partner": true
  },
  {
    "id": "flying-raijin-jiku-shippu-senko-rennodan-zeroshiki",
    "itemId": "1799041ec534a49f",
    "name": "Flying Raijin Jiku Shippu Senko Rennodan Zeroshiki",
    "points": 4,
    "cost": 0,
    "costText": "Rasengan Art & 35 Chakra",
    "parts": [
      {
        "formula": "12d8",
        "type": "chakra"
      }
    ],
    "mode": "attack",
    "ranged": false,
    "save": null,
    "half": false,
    "maxTargets": 1,
    "rangeText": "Touch",
    "description": "<p><strong>Rasengan Points:</strong> 4</p><p><strong>Cost:</strong> Rasengan Art &amp; 35 Chakra</p><p><strong>Range:</strong> Touch </p><p><strong>Duration:</strong> Instantaneous</p><p><strong>Prerequisite:</strong> Flying Thunder God</p><p>The User kicks the Target away and sends it flying in a straight line. The user then throws Items marked the Hiraishin Seal after the target and teleports between them whil constintely hitting the target. After moving 60 feet the user can then use their bonus action to finish the combo with a Rasengan Art.</p><p>Make a Melee Rasengan Art Attack.</p><p>On a hit, the target takes <strong>12d8</strong> and <strong>the Rasengan Art damage</strong>.</p>",
    "requiresArts": [],
    "requires": [
      "flying-thunder-god"
    ],
    "prerequisiteText": "Flying Thunder God",
    "chakraCost": 35,
    "combo": true
  }
];
