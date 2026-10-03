# Update 0.19.5 — Aktive Madara-Techniken

Alle Dateien ins Repository übernehmen und **Build Foundry Release** mit **v0.19.5** ausführen. Danach das Modul aktualisieren und Foundry vollständig neu laden. Dieses ZIP enthält den Release-Quellcode und wurde nicht in eine laufende Foundry-Welt installiert. Die Änderungen aus 0.19.4 sind enthalten.

## Active techniques

Der neue seitliche Bereich zeigt laufende Mastered Flame Flower/Red Star und die an einen konkreten Cast gebundenen Entfernungswürfe. Die Laufzeitdaten liegen am nativen Konzentrationseffekt und bleiben beim Schließen des Trackers und beim Neuladen erhalten. Keine vollständigen Compendium-Ladevorgänge auf Item- oder Effektänderungen.

Neue Casts müssen mit der nativen Konzentrationsoption gewirkt werden. Casts aus älteren Modulversionen besitzen die Zuordnungsdaten noch nicht und müssen neu gewirkt werden, um die neuen Kontrollen zu erhalten. Die besessenen Techniken und bisherigen Ressourcen bleiben erhalten.

## Flame Flower

- Start mit 8 Sphären. Genau ein Ziel auswählen und im Bereich Active techniques **Free attack** oder **Bonus-action attack** drücken.
- Native Angriffswürfe mit Legacy Attack, Schaden 5d8+4 einschließlich Apex-Bonus. Ein Treffer oder Fehlschlag verbraucht eine Sphäre; ein abgebrochener Angriffsdialog verbraucht nichts. Keine erneuten Chakra- oder Mastered-Kosten.
- Der freie Angriff ist einmal pro Kampfrunde verfügbar. Die Bonusaktion ist auf den eigenen Turn beschränkt und getrennt vom freien Angriff verfügbar. Weitere Bonusaktionen desselben Flame-Flower-Turns werden abgefangen. Andere verbrauchte Bonusaktionen muss der Spieler weiterhin berücksichtigen.
- Die native Chatkarte erlaubt Schaden und Burned-Effekt erst nach einem abgeschlossenen Angriff. Der Angriff wird über den Tracker gestartet; die Karte bietet keine zweite kostenlose Attack-Aktion. Kritische Treffer werden für den Schadensdialog übernommen. Burned erst bei bestätigtem Treffer über die nativen Effektkontrollen anwenden.
- Ende der Konzentration oder Ablauf nach einer Minute sperrt weitere Sphären. Die kostenlose Konzentration aus 0.19.4 bleibt erhalten.

## Red Star

Den modifizierten Effekt **nach einem fehlgeschlagenen Save** über die native Chatkarte auf die tatsächlich betroffenen Ziele anwenden. Ein ausgewähltes Ziel allein gilt noch nicht als betroffen.

Der Effekt verwendet native Demoralized-Ränge, beginnt mit Rang 2 und erhält zu Turn-Beginn des betroffenen Actors einen zusätzlichen Rang bis maximal 5. Der Cast muss noch unter Konzentration stehen. Doppelte Combat-Updates verändern den Rang nicht mehrfach. Mit aktivem GM verarbeitet dessen Client die Turns, ansonsten der ausführende berechtigte Besitzer.

Würde ein Ziel bei Rang 5 einen weiteren Rang erhalten, wird der zusätzliche Crash-Schaden von **10d8 psychic** gewürfelt und über die native `applyDamage`-Methode angewendet. Resistenzen und Schadensminderungen bleiben damit in der System-Abwicklung. Rangänderung, Turn-Zuordnung und Schadensphase werden gespeichert; bereits angewandter Schaden wird nicht erneut angewandt. Wird ein Netzwerk-/Dokumentvorgang während der Anwendung unterbrochen, ist eine automatische Wiederholung gesperrt, bis der GM HP überprüft. Ein noch nicht angewandter, bereits gewürfelter Crash kann über **Resolve pending crash** fortgesetzt werden.

Bei Konzentrationsende werden die Effekte des zugehörigen Casts entfernt. Hat ein anderer Effekt inzwischen ihre Origin ersetzt, bleibt die Bedingung erhalten und nur die alte Red-Star-Zuordnung wird entfernt. Die normalen Red-Star-Regeln für Licht, Dunkelheit, erneute Saves und normalen Turn-Schaden bleiben situative Entscheidungen; die hier ergänzte Turn-Automatik betrifft den zusätzlichen Mastered-Rang und seinen Überlauf.

## Entfernungswürfe

**Shuriken Rain:** Der Restrained-Effekt speichert den Legacy Save DC des tatsächlichen Casts. **Attempt removal** würfelt den nativen STR-Save des betroffenen Actors gegen diesen DC und entfernt bei Erfolg genau den gebundenen Effekt.

**Searing Flames:** Der Burned-Effekt speichert DC `15 + Madara-Class-Mod-Level`. Der Button würfelt einen nativen DEX-(Survival)-Check. Erfolg entfernt den gebundenen Burned-Effekt. Ein abgebrochener oder fehlgeschlagener Wurf erhält die Bedingung.

Die Würfe verlangen die Rechte des betroffenen Charakters beziehungsweise des GMs. Der Cast-Besitzer kann fremde Actor-Dokumente nicht allein durch die Tracker-Auswahl verändern.

## Prüfung und verbleibende Regeln

63 automatisierte Tests bestanden, zusätzlich lokale Chromium-Prüfung von Sidebar, Active-techniques-Tab, Sphärenverbrauch, Round-Sperre und Entfernungswurf. Die bisherigen Rasengan-/Kāma-/Madara-Regressionen sind enthalten. Build- und Syntaxprüfung bestanden. Native Schnittstellen wurden gegen den N5eB-Quellcode abgeglichen; kein Live-Test in Foundry/N5eB.

Awaiting Stances situationsabhängige Folgeaktionen, Ephemeras Aufgaben und Entscheidungen über Erfüllung sowie die einzelnen Flame-Spiral-Konstrukte bleiben manuell. Bestehende Automationsmodule können native Würfel- und Effektabläufe verändern.
