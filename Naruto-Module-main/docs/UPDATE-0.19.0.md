# Update 0.19.0 — Rasengan, Karma und optionale Mindestlevel

Die Rasengan-Class-Mod wurde nach dem beigefügten aktuellen Regeltext für Stufen 1–4 umgesetzt. Uzuhiko bleibt für ein späteres Update reserviert.

## Installation / GitHub

Dieses Archiv enthält den vollständigen Repository-Stand einschließlich `.github/workflows/release.yml`. Entpacke es und übernimm den Inhalt von `Naruto-Module-main` in dein Repository. Starte anschließend **Build Foundry Release** mit dem Tag **v0.19.0**, oder pushe diesen Tag. Die Action erstellt das installierbare Foundry-Modul mit `module.json` direkt im ZIP-Hauptverzeichnis. Die Downloadadresse im Manifest ist bereits auf v0.19.0 gesetzt.

Nach dem Foundry-Update die Welt neu laden. Die automatische Synchronisierung ergänzt Rasengan im vorhandenen Welt-Kompendium. Falls Auto-Sync ausgeschaltet ist: `N5eBClassMods.sync()` ausführen. Vorhandene Class Mods können auf ihren Charakteren bleiben.

## Rasengan bedienen

1. **Rasengan** aus dem Class-Mod-Kompendium auf den Charakter ziehen. Die Features werden entsprechend der Class-Mod-Stufe vergeben.
2. Im Charakterbogen **Rasengan Tracker** öffnen. Alternativ ein Makro mit `N5eBRasengan.openTracker()` verwenden, während der Charakter-Token ausgewählt ist.
3. Unter **Rasengan Arts** mit Punkten lernen. Pro Stufe gibt es 15 Punkte; auf Stufe 4 sind insgesamt 60 Punkte verfügbar. Die 20 Arts kosten zusammen genau 60 Punkte. Externe Voraussetzungen werden beim Benutzen geprüft; Voraussetzung-Arts müssen zuerst gelernt werden.
4. Eine Art direkt benutzen oder ab Stufe 2 formen und halten. Chakra wird beim Formen bezahlt. Zwei freie Hände können bis zu zwei gewöhnliche Kerne halten; Spiralling Serial Spheres benötigt beide Hände.
5. Unter **Overview** die gehaltenen Kerne freisetzen, als Bonusaktion umformen oder verwerfen. Kompression erhöht sich am Ende jedes eigenen Kampfzugs automatisch, höchstens auf 3. Außerhalb des Kampfes kann der End-Turn-Knopf den Fortschritt erfassen. Beim Umformen bleiben Kompression und Schadensart erhalten; nur positive Unterschiede der Planetary-Chakra-Kosten werden nachbezahlt.
6. Vor dem Freisetzen die betroffenen Tokens als Ziele markieren. Treffer werden nach Abwehr/Deckung bestätigt; Saving Throws verwenden, wenn zugänglich, den nativen Systemdialog. Bei einem nicht zugänglichen Ziel trägt der GM den tatsächlich gewürfelten Save ein.
7. Nach einem Treffer kann der Schaden als **Spiral Echo** gespeichert werden. Echoes enthalten die tatsächlich anfallenden Würfel einschließlich kritischer Treffer und Kompression. Sie verfallen nicht durch Zeit, Entfernung, Rasten oder Neustarts.
8. Unter **Spiral Echoes** beliebige einzelne Echoes eines Ziels als Bonusaktion oder Reaktion freisetzen. Mindestens drei Echoes ermöglichen den CON-Save zur Unterbrechung. Bei nativen Attack-/Save-/Cast-Activities und Jutsus pausiert der GM beziehungsweise der ausführende berechtigte Besitzer die Aktion über ein Reaktionsfenster; nach einem erfolgreichen Save wird sie fortgesetzt, nach einem fehlgeschlagenen Save abgebrochen.
9. Gerollter Schaden wird über einen Chatknopf mit der nativen `applyDamage`-API angewendet. Damit bleiben Schadensarten, Resistenzen und temporäre HP in der Systemabwicklung. Prone und Spiral Rasengans Heilungsblock können ebenfalls aus dem Chat angewendet werden. Der Heilungsblock endet zu Beginn des nächsten Zugs des Rasengan-Nutzers.
10. Abgebrochene Treffer-/Save-Abfragen und Echo-Freisetzungen stehen unter **Pending resolutions** zum Fortsetzen bereit. Ein gelöschtes Ziel verliert seine Echoes nicht: Der GM kann es auf den neu erstellten Token desselben NPCs umverknüpfen.

Planetary Chakra regeneriert sich beim **Full Rest**. Die Kostenreduktions-Anwendungen regenerieren sich beim **Long oder Full Rest**. Gelernte Arts und Echoes bleiben erhalten. Der Tracker berücksichtigt nur die von ihm ausgegebenen Reaktionen; andere Reaktionen des Charakters müssen bei der Entscheidung mitberücksichtigt werden.

## Karma-Siegel

Das große Trackerfenster hat eine feste Ausgangshöhe, einen scrollbareren Inhaltsbereich und eine erreichbare Schließen-Leiste. Unter **Karmic Dōjutsu** lässt sich das gewährte Augen-Feature aktivieren oder deaktivieren. Vorhandene native Transfer-Effekte oder daraus entstandene Actor-Effekte werden geschaltet; andernfalls wird die native Utility-Activity geöffnet. Fehlende/ungültige Attribute-Verbrauchsziele der vom Modul gewährten Latent-Augen werden entfernt. Fremde Sharingan-Items und eigenständige Genjutsu behalten ihre Verbrauchseinstellungen. Legitimer Item-Uses-Verbrauch wird im Utility-Fallback beibehalten.

## Mindestlevel

Unter Moduleinstellungen steht **Mindest-Charakterlevel für Class Mods erzwingen**. Standard: **aus**. Dies umfasst bestehende und neue Class Mods sowie die eingebauten Madara-/Curse-Seal-Levelblocker. Beim Einschalten gelten die ursprünglichen Charakter-Mindestlevel wieder. Anschließend neu laden. Voraussetzungen wie Class-Mod-Stufen, Corruption, vorangehende Arts und externe Features bleiben gültig.

## Regeltext und praktische Grenzen

- Einige Arts nennen einen Save ohne Attribut. Deshalb wird das Attribut beim Freisetzen vom GM gewählt; CON ist lediglich die Vorauswahl.
- Bei Rasenshuriken/Rasendan nennt der Text teilweise einen Nahkampfangriff trotz Reichweite. Die Reichweite wird angezeigt; für die Nähe-Disadvantage-Abfrage werden die Wurf-/Schussvarianten als Fernkampf behandelt. Der gemeinsame Attack-Bonus bleibt unverändert.
- Die Save-DC wird mit `floor(Character Level / 4)` berechnet. Jede Compression Level fügt einen primären Schadenswürfel hinzu (höchstens +3) sowie +1 Angriff/DC. Das Originaldokument ist unter `Rasengan-rules-source.md` unverändert beigelegt.
- Flächenschaden verwendet einen gemeinsamen Schadenswurf. Mastered Rasengans Reroll-Budget wird pro Art-Auflösung begrenzt; beim Speichern eines Echoes wird das noch verfügbare Budget mitgespeichert.
- Bewegung, Reichweitenprüfung, Flächenschablonen und Hindernisse werden auf der Szene vom GM festgelegt. Schubdistanzen und die gewählte Flächenverkleinerung stehen im Chat. Fremde Makros, die keinen nativen Activity-Hook auslösen, können nicht automatisch unterbrochen werden; dafür ist der Reaktionsknopf vorgesehen.
- Die Chidori-Kombination verlangt einen bestätigten benachbarten Partner. Die Chakra-Sperre des Rasengan-Nutzers wird bis zum Full Rest getrackt; dessen Full Rest startet die 30-Tage-Abklingzeit. Die Sperre und der Full Rest des fremden Partners werden auf dessen Bogen festgehalten. Im Tracker kann der GM die Abklingzeit an den Weltkalender anpassen.
- Die optionale Minimum-Level-Einstellung umgeht Charakter-Mindestlevel. Sie ermöglicht noch keine Rasengan-Stufe 5; dafür fehlt derzeit Uzuhikos endgültiger Regeltext.

## Prüfung

`npm test` beziehungsweise `node --test tests/*.test.js`: 24 bestandene Regressionstests. Geprüft wurden unter anderem doppelte Kauf-/Schadenklicks, Ressourcenverbrauch, Umformen, Kompression am Rundengrenzwechsel, persistente Echoes, fehlende Ziele, abgebrochene und fortsetzbare Saves, Activity-Unterbrechung, Reaktionsregeneration, gemischter Schaden, native Ressourcenreparatur und die reversible Minimum-Level-Einstellung. Alle 887 Items, 121 Ordner und internen Kompendium-Verweise wurden auf Konsistenz geprüft; alle JavaScript-Dateien auf Syntax geprüft.

Diese Prüfungen verwenden ein simuliertes Foundry-API-Umfeld. Die konkrete N5eB-Installation und ihr nativer Sharingan-Datensatz waren nicht enthalten. Eine vollständige Prüfung in einer laufenden Foundry-Welt und eine visuelle Prüfung der nativen Dialogfenster stehen deshalb noch aus.
