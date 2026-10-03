# Update 0.19.2 — Rasengan-Performance, Art-Käufe und Tracker

## Installation

Den vollständigen Archivinhalt direkt in das Hauptverzeichnis des Repositorys übernehmen, einschließlich `scripts/tracker-window.js` und `.github`. Danach **Build Foundry Release** mit **v0.19.2** starten. Das erzeugte Release in Foundry installieren und die Welt neu laden. Keine bereits vorhandene Rasengan Class Mod entfernen: Das Update erhält gelernte Arts, Punkte, Planetary Chakra und Spiral Echoes.

Falls Auto-Sync deaktiviert ist, als GM `await N5eBClassMods.sync({notify:true})` ausführen.

## Änderungen

- Keine vollständigen Kompendium-Ladevorgänge bei gewöhnlichen Item-Änderungen. Die kleine Rasengan-Datendatei wird einmal zwischengespeichert; Feature-Initialisierung läuft bei Start, Öffnen und Rasengan-Leveländerungen.
- Flag-Änderungen des Rasengan-Trackers bauen den Charakterbogen nicht jedes Mal neu auf. Ressourcen im vorhandenen Rasengan-Balken werden direkt aktualisiert.
- Rasengan und Kāma verwenden eigene ApplicationV2-Fenster mit fester linker Navigation und einem scrollbaren Inhaltsbereich. Interne Knöpfe können keine Dialog-Bestätigung oder Schließaktion auslösen.
- Art-Käufe erstellen zuerst das native Item. Erst danach wird die gelernte Art im Punkte-Ledger gespeichert. Fehlgeschlagene oder abgebrochene Item-Erstellung zieht keine Punkte ab; ein fehlgeschlagener Ledger-Speichervorgang entfernt das gerade erstellte Item wieder.
- Käufe aus 0.19.1, bei denen Punkte bereits abgezogen wurden, aber das native Item fehlt, werden beim Öffnen ergänzt, ohne erneut Punkte zu berechnen.
- Rasengan-Angriff und Save DC im Charakterbogen werden numerisch mit den Tracker-Werten synchronisiert.
- Kāma hat die Bereiche Overview, Karmic Dōjutsu, Possession und Take-Over. Jedes gewährte Latent-Augen-Tier zeigt seinen Status und einen direkten Aktivierungs-/Deaktivierungsknopf. Aktivierungen über systemeigene Activities bleiben für Augen ohne übertragbare Effekte erhalten.
- Beide Fenster behalten ihren aktiven Tab und die Scrollposition bei Werteänderungen. Mehrfachklicks während einer Aktion werden blockiert.

## Prüfung

32 automatisierte Regel-, Kauf-, Kompatibilitäts- und Paketprüfungen; Build-Prüfung für 887 Items, 121 Ordner und alle importierten Laufzeitdateien. Zusätzlich lokale Chromium-Prüfung von Sidebar-Position, Tabwechsel, Kauf per Klick, Item-Erstellung, Reparatur alter Käufe, Scrollen der 20 Arts, Augen-Aktivierung und Kāma-Rast in einem niedrigen Fenster.

Die Browserprüfung nutzt einen nachgebildeten ApplicationV2-Rahmen und Dokument-APIs; sie ist kein Test in einer laufenden Foundry-/N5eB-Welt. Die gemeldete Lag-Ursache ist im Code entfernt, die Performance deiner Welt kann hier nicht gemessen werden.

Optional lässt sich die Browserprüfung mit installiertem Playwright über `node tests/tracker-ui.cjs` starten. Ein vorhandenes Chromium kann mit `CHROMIUM_EXECUTABLE` ausgewählt werden.
