# Hotfix 0.19.3 — Rasengan-Actor-Update

Behebt den Fehler `Actor is not a valid embedded Document within the Actor Document` beim Speichern des Rasengan-Trackers.

Rasengan verwendete ein gemeinsames Optionsobjekt für eingebettete Item-/Effektoperationen und Actor-Updates. Foundry ergänzt Operationsoptionen um Datenbankinformationen wie `parent` und `pack`. Dadurch übernahm ein späteres Actor-Update einen Actor als Parent und wurde als unzulässiger eingebetteter Actor behandelt. Auch Vorgänge auf einem zweiten Charakter konnten die Optionen des ersten übernehmen.

Jeder Aufruf erhält jetzt ein neues Optionsobjekt samt eigenem internen Modul-Flag. Dies betrifft Tracker-Speicherung, Art-Erstellung, Feature-Zuweisung, Zahlenwerte im Charakterbogen, Kauf-Rollback, normale Chakra-Zahlungen und Echo-Effekte auf Zielen. Token-Actors werden weiterhin über ihre native `update`-Methode gespeichert.

## Installation

Alle Dateien direkt ins Repository übernehmen und **Build Foundry Release** mit **v0.19.3** starten. Nach dem Modulupdate Foundry vollständig neu laden, damit das alte Optionsobjekt nicht mehr im Speicher ist. Die Class Mod muss nicht gelöscht oder neu hinzugefügt werden. Punkte, gelernte Arts, Planetary Chakra und Echoes bleiben erhalten.

## Prüfung

34 automatisierte Tests bestehen. Zwei neue Regressionstests bilden die Mutation von Datenbankoptionen nach und prüfen Kauf, Art-Formung und Tracker-Speicherung bei Welt- und Token-Actors. Vor der Korrektur scheiterten beide Tests, danach bestehen sie. Die lokale Chromium-Prüfung verwendet ebenfalls veränderliche Operationsoptionen und prüft die bestehende Sidebar-/Kauf-/Kāma-Bedienung.

Kein Live-Test in einer Foundry-/N5eB-Welt; geprüft wurden die Laufzeitfunktionen mit nachgebildeten Dokument-APIs und der lokale Browser.
