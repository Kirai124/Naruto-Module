# Update 0.19.4 — Madara Cells und Partnerauswahl

## Installation

Den gesamten ZIP-Inhalt direkt ins Hauptverzeichnis des bestehenden Repositories übernehmen. **Build Foundry Release** mit **v0.19.4** ausführen, danach das Modul in Foundry aktualisieren und Foundry vollständig neu laden. Dies ist der Quellcode für den Release-Build; diese ZIP wurde nicht in eine laufende Foundry-Welt installiert.

Die Class Mods nicht löschen und neu hinzufügen. Bestehende Legacy-/Defence-Pools, Mutationen, Mastered-Auswahlen und Rasengan-Daten werden übernommen. Die früheren permanenten Nullkosten-Overrides werden beim Synchronisieren des Madara-Actors beziehungsweise beim Öffnen seines Trackers aus dem gespeicherten Original wiederhergestellt.

## Rasengan

Bei **Chōjikū Raisen Senkai: Rasen Chidori Sōkyoku Hōten Jigen Retsudan Messhōshō** wird der Partner aus einem Dropdown der sichtbaren Charakter-Actors gewählt. Der eigene Charakter und NPC-Actors werden ausgeschlossen. Gespeichert werden Actor-UUID und Anzeigename; freier Text oder inzwischen ungültige Auswahl werden vor der Zahlung abgewiesen. Chidori-Verfügbarkeit und die benachbarte Position müssen weiterhin erfüllt sein und werden nicht allein durch die Auswahl nachgewiesen.

## Madara-Tracker

Seitliche Bereiche: Overview, Techniques, Sharingan, Adaptation, Hatred Surge. Die Sidebar bleibt beim Scrollen der Inhalte stehen. Tabs und Scrollposition bleiben bei Ressourcenänderungen erhalten. Bereits offene Tracker werden wiederverwendet. Fremde Actor-bezogene Dialoge erhalten weder Header-Einträge noch Tracker-Streifen; diese erscheinen ausschließlich im Actor Sheet.

Unabhängige Item-Änderungen lösen keine vollständige Madara-Synchronisation mehr aus. Compendium-Dokumente werden nach dem Laden wiederverwendet. Aktualisierungen des Trackers erfordern kein wiederholtes Rendern des ganzen Charakterbogens.

## Mastered-Casts

Die besessenen Mastered Techniques sind im Techniques-Bereich direkt castbar. Fehlende Basis-Jutsu werden aus `n5eb.clan` ergänzt und zählen nicht zum normalen Known-Jutsu-Limit. Ein bestehendes Basis-Jutsu wird weiterverwendet. Nur vom Modul erzeugte Basis-Jutsu werden beim Entfernen der zugehörigen Mastered-Auswahl wieder entfernt.

Jeder Cast fragt nach **Legacy Chakra** oder **Normal Chakra** und öffnet die native Activity-Abwicklung des Systems. Ein Abbruch zahlt keine Cast-Kosten. Bei fehlenden Ressourcen wird die native Consumption abgewiesen. Temp Chakra wird bei regulärer Zahlung zuerst verwendet. Der Mastered-Kostenzuschlag bleibt gemäß Apex Sharingan erhalten:

| Auswahl | Jutsu-Kosten | Mastered-Aktivierung |
| --- | --- | --- |
| Legacy Chakra | Uchiha: 1 Legacy je 2 Chakra, aufgerundet | 2 Legacy zusätzlich |
| Normal Chakra, Class-Mod-Level 1–4 | reguläre Chakra-Kosten | 2 Legacy zusätzlich |
| Normal Chakra, Class-Mod-Level 5 | reguläre Chakra-Kosten | 6 normale Chakra durch Perfect Match |

Bereits bekannte Uchiha-Techniken erhalten die Kostenreduktion um den Class-Mod-Level, mindestens 1. Neu durch die Mastered-Auswahl ergänzte Techniken erhalten diese Reduktion nicht. Ab Perfect Match kann ein Legacy-Fehlbetrag für 3 normale Chakra je Legacy bezahlt werden.

Die Cast-Kopie verwendet Legacy-Angriff/DC, den zusätzlichen Schadenswürfel für Uchiha-/Fire-Jutsu und die passenden Mastered-Modifikationen. Die besessenen Jutsu und ihre regulären Kosten werden nicht umgeschrieben. Die Chatkarte speichert die Cast-Kopie, damit die späteren nativen Attack-, Damage-, Save- und Effect-Buttons die Boni behalten. Native Refunds verwenden die dokumentierten Ressourcen-Deltas; nach einer Rückerstattung erneut über den Tracker casten.

Zusätzliche automatisierte Änderungen:

- Genjutsu: Sharingan: Komponenten und Visual-Anforderung der Cast-Kopie entfernen.
- Great Assault: zusätzlicher Rank als Vorgabe; Bruised-Effekt in den anwendbaren Effekten.
- Shuriken Rain: zwei 10-ft-Sphären, größere Schadenswürfel einschließlich Scaling und keine Shuriken-/Kunai-Kosten.
- Ember Bullet: Deckungsabfrage; bei fehlender Deckung Advantage als Vorgabe für den Angriff. Zusätzlicher Burned-Rank im nativen Effekt.
- Genjutsu: Deflect: Wisdom-Saves über die Chatkarte erhalten Disadvantage als Vorgabe.
- Flame Ball: 6d10+6 vor Apex-Bonus, zusätzliche 2d6+2 pro Rank, größere Reichweite und Flächenabmessungen.
- Flame Flower: Konzentration ohne Chakra-Erhaltungskosten; Burned-Effekt in den anwendbaren Effekten.
- Flame Spiral: vier Zylinder-Vorlagen, 5-ft-Radius und 30-ft-Höhe.

Treffer-/Save-abhängige Effekte erst nach Auflösung über die nativen Effect-Buttons anwenden. Red Stars zusätzliche Ränge zu Turn-Beginn, Awaiting Stances weitere Angriffe, Ephemeras neue Aufgaben, Flame Flowers freie Angriffe pro Runde sowie AC/Resistenzen der Flame-Spiral-Konstrukte bleiben bei Spieler/GM. Das Modul erstellt keine eigenen NPC-Konstrukte. Shuriken Rains STR-Save zum Entfernen von Restrained nutzt manuell den angezeigten Legacy-DC; Searing Flames erhöht Burned-Ränge automatisch, sein höherer Entfernungs-DC wird am Effekt vermerkt und muss bei der Entfernung berücksichtigt werden. Situative Deckung und externe Automationsmodule können Würfelvorgaben verändern.

## Sharingan, Kampf und Erholung

Sharingan-Aktivierung erstellt einen tatsächlichen **Sharingan ActiveEffect** am Actor und verbraucht bei temporärer Aktivierung einen verfügbaren Sharingan-Use. Deaktivieren entfernt den verwalteten Effekt; nach 10 Minuten World Time endet die temporäre Aktivierung. Ab Indirect Reincarnation ist Sharingan permanent und verbraucht keine weiteren Uses. Passive Augenboni folgen dem Aktivierungszustand. Der Tracker verwaltet nur seine eigenen Sharingan-Effekte.

Sharingan- und Mangekyō-Aufladen unterstützt moderne `uses.spent` und ältere `uses.value`-Pools. Volle Pools kosten nichts; größere Mangekyō-Anfragen werden auf die fehlenden Charges begrenzt.

Mastered Defence prüft einmal pro Turn und die maximalen zusätzlichen Reaktionen pro Round. Ein Refill erneuert den Pool, ohne laufende Turn-/Round-Limits zu umgehen. Long/Full Rest stellen Legacy Chakra und Mastered Defence wieder her. Tracker-Rest-Buttons führen diese Modul-Erholung aus; für die allgemeine Charakter-Erholung den nativen Rest verwenden.

Hatred Surge prüft automatisch unter 25 % HP zu Turn-Beginn und erlaubt die Kontrollprüfung zu Turn-Ende. Der 0-HP-Countdown funktioniert auch bei einem Kampf mit nur einem Charakter. Nach drei Turns wird HP auf 1 gesetzt und GM-Takeover markiert. Markierte Stabilisierung stoppt den Countdown. Tatsächliche Zielwahl und Übergabe der Charakterkontrolle liegen beim GM. Synchronisierung würfelt die vorgegebenen DCs, schaltet den Medicine-Fallback frei und protokolliert Fehlschläge, Inkompatibilität und permanenten Hit-Dice-Verlust; die nötige Downtime muss eingehalten werden.

## Prüfung

Automatisierte Zustands-/Ressourcentests und eine lokale Chromium-Prüfung mit nachgebildeten Foundry-Dokumenten und ApplicationV2. Geprüft wurden unter anderem Cast-Abbrüche, Legacy/Normal/Temp-Zahlung, Snapshots, Sharingan-Effekt/Ablauf, volle Uses-Pools, fremde Menüs, Reaktionslimits, Solo-Combat-Countdown sowie Sidebar und Scrollen. Der Build-Validator prüft Manifest, Laufzeitimporte, Daten-Versionen, Items und Advancement-Ziele.

Kein Live-Test in einer Foundry-/N5eB-Welt. Der native Cast-Pfad wurde gegen den N5eB-Quellcode abgeglichen; Integration mit weiteren Automationsmodulen bleibt dort zu prüfen.
