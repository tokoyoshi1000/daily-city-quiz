# Daily City Quiz — Design-Spec

**Datum:** 2026-11-14
**Status:** Vom Auftraggeber freigegebenes Design (Brainstorming-Ergebnis)

## 1. Überblick

Daily City Quiz ist ein tägliches Rätselspiel im Browser, inspiriert von HQ Trivia und Wordle. Jeden Tag gibt es für alle Spieler dasselbe Rätsel: eine geheime Stadt irgendwo auf der Welt, die anhand von bis zu 6 nacheinander aufgedeckten Hinweisen erraten wird (Akt 1), gefolgt von einem kurzen Bonus-Quiz über die aufgelöste Stadt (Akt 2). Ein AI-generierter Host („Marco") moderiert mit Persönlichkeit. Das Ergebnis ist als spoilerfreier Emoji-Text teilbar.

Sprache: Deutsch. Städtepool: weltweit. Plattform: Mobile-first-Web-App, rein statisch, ohne Backend und ohne Accounts. Sämtlicher Content (Rätsel, Quizfragen, Host-Sprüche) wird per AI vorgeneriert und als Daten-Dateien mitgeliefert.

## 2. Zielgruppe

**Kern:** Die „Wordle-Generation" im DACH-Raum — Erwachsene ca. 25–55, die ein tägliches 3–5-Minuten-Ritual auf dem Handy pflegen und Ergebnisse in WhatsApp-Gruppen teilen. Verbreitung erfolgt organisch über geteilte Ergebnisse, nicht über Stores oder Werbung.

**Verstärkende Untergruppen:** Reise-/Geografie-Fans (GeoGuessr-/Worldle-affin, Streak-Jäger) und klassische Quiz-Fans (Quizduell-Fraktion, bleiben wegen Bonus-Quiz und Host).

**Konsequenzen fürs Design:**
- Gnädige Schwierigkeit: Die meisten Spieler sollen die Stadt bis Hinweis 4–5 haben. Die Punkteskala differenziert trotzdem.
- Marcos Humor: erwachsen, warm, leicht angeberisch — charmanter Vielflieger, nicht Klassenclown, nicht zynisch.
- Null Einstiegshürde: kein Login, kein Tutorial-Zwang, kein Download. Link öffnen, spielen.

**Explizit nicht Zielgruppe in V1:** Kinder/Schulen, internationaler (englischsprachiger) Markt.

## 3. Spieldesign

### 3.1 Akt 1 — Stadt erraten

- Pro Tag eine geheime Stadt, für alle Spieler identisch (datumsbasierte Auswahl, siehe 4.3).
- Bis zu 6 Hinweise werden nacheinander aufgedeckt, von kryptisch zu deutlich, in fester Reihenfolge:
  1. 🌡️ Klima & Lage
  2. 🍜 Kulinarik
  3. 📜 Geschichte & Kurioses
  4. 🔢 Zahlen & Fakten (Einwohner, Gründungsjahr, Höhe o. Ä.)
  5. 🧑‍🎤 Berühmte Persönlichkeit
  6. 🗼 Wahrzeichen (fast eindeutig)
- Nach jedem aufgedeckten Hinweis hat der Spieler genau einen Rateversuch. Geraten wird per Texteingabe mit Autocomplete; nur Städte aus `cities.json` sind gültige Eingaben (Tippfehler-Diskussionen entfallen damit).
- Falscher Versuch → Distanz-Feedback: Luftlinien-Entfernung (gerundet) und 8-stufige Himmelsrichtung von der geratenen Stadt zur gesuchten, z. B. „Die gesuchte Stadt liegt ca. 2.300 km südwestlich von Warschau." Danach wird der nächste Hinweis aufgedeckt.
- Treffer: Eine geratene Stadt gilt als richtig, wenn sie derselbe Eintrag wie die Zielstadt ist (Namens-/Alias-Match nach Normalisierung).
- Punkte Akt 1: Lösung nach Hinweis n ergibt `7 − n` Punkte (Hinweis 1 → 6 Punkte … Hinweis 6 → 1 Punkt). Nicht gelöst → 0 Punkte, die Stadt wird aufgelöst.

### 3.2 Akt 2 — Bonus-Quiz

- Direkt nach der Auflösung: 3 Multiple-Choice-Fragen (je 4 Antwortoptionen) über die Stadt des Tages.
- Pro Frage läuft ein 10-Sekunden-Countdown (HQ-Trivia-Dramaturgie). Zeitablauf zählt als falsche Antwort.
- Je richtige Antwort 1 Punkt. Das Bonus-Quiz findet immer statt, auch wenn Akt 1 verloren wurde.
- Tagesmaximum gesamt: 9 Punkte (6 + 3).

### 3.3 Host „Marco" 🧭

Persona: weitgereister, leicht angeberischer Weltenbummler (Anspielung auf Marco Polo). Alle Sprüche werden pro Rätsel vorgeneriert und mitgeliefert:

- **Intro** zur Begrüßung des Tagesrätsels.
- **Fehlversuch-Kommentare** (mehrere pro Rätsel, werden der Reihe nach verwendet) — beziehen sich gern auf die geratene Region, bleiben aber spoilerfrei bzgl. der Zielstadt.
- **Gewinn-Reaktionen**, gestaffelt nach Hinweis-Phase (früh/mittel/spät gelöst).
- **Niederlagen-Spruch** (warm, nie herablassend).
- **Auflösungs-Anekdote** zur Stadt.
- **Quiz-Reaktionen** je Frage (richtig/falsch).

### 3.4 Teilen, Streak & Statistik

- **Share-Text** (in Zwischenablage kopierbar, spoilerfrei), Format:

  ```
  🌍 Daily City Quiz #42
  🏙️ ✖️✖️✖️✅ 4/6 · 🧠 2/3 · 🔥 7
  ```

  (Rätselnummer, Rate-Verlauf mit Trefferposition, Bonus-Quiz-Ergebnis, aktueller Streak. Eine URL wird ergänzt, sobald das Spiel deployt ist.)
- **Streak:** zählt aufeinanderfolgende Tage, an denen das Tagesrätsel vollständig gespielt wurde (Akt 1 und 2 abgeschlossen, unabhängig vom Ergebnis). Ein verpasster Tag setzt den Streak auf 0 zurück.
- **Statistik (lokal):** gespielte Rätsel, Lösungsquote, Verteilung nach Hinweis-Nummer, aktueller und längster Streak, Punktedurchschnitt.

## 4. Technik

### 4.1 Stack

React + TypeScript + Vite + Tailwind CSS. Build als rein statische Website (keine Serverkomponente, keine laufenden Kosten, kostenlos hostbar z. B. auf Netlify/Vercel/GitHub Pages). State-Management mit React-Bordmitteln (`useReducer`/Context), keine zusätzliche State-Library.

### 4.2 Projektstruktur (Ziel)

```
src/
  components/    # Screens + wiederverwendbare UI-Bausteine
  game/          # Reine Spiellogik, frameworkfrei, vollständig getestet
  data/          # puzzles.json, cities.json
  storage/       # localStorage-Zugriff (Spielstand, Statistik)
docs/superpowers/specs/   # diese Spec
```

Die Spiellogik in `src/game/` ist bewusst frei von React und DOM: Scoring, Normalisierung, Distanz/Richtung, Rätselauswahl, Streak-/Statistik-Fortschreibung sind pure Funktionen mit klaren Ein-/Ausgaben.

### 4.3 Datenmodell

**`puzzles.json`** — vorgenerierter Vorrat (initial ~90 Rätsel, ab Starttag lückenlos datiert):

```jsonc
{
  "puzzles": [
    {
      "number": 1,                      // fortlaufend, für den Share-Text
      "date": "2026-11-17",             // lokales Datum, YYYY-MM-DD
      "city": {
        "name": "Lissabon",
        "aliases": ["Lisbon", "Lisboa"],
        "country": "Portugal",
        "lat": 38.7223,
        "lng": -9.1393
      },
      "hints": ["…", "…", "…", "…", "…", "…"],   // genau 6, Reihenfolge wie 3.1
      "quiz": [
        {
          "question": "…",
          "choices": ["…", "…", "…", "…"],
          "answerIndex": 2,
          "hostCorrect": "…",
          "hostWrong": "…"
        }
        // genau 3 Fragen
      ],
      "host": {
        "intro": "…",
        "wrongGuess": ["…", "…", "…", "…", "…"],
        "winEarly": "…", "winMid": "…", "winLate": "…",
        "lose": "…",
        "reveal": "…"
      }
    }
  ]
}
```

**`cities.json`** — Rateliste, deutlich größer als der Rätselpool (~500 Städte weltweit), damit die Autocomplete-Liste den Pool nicht verrät:

```jsonc
[
  { "name": "Warschau", "aliases": ["Warsaw", "Warszawa"], "country": "Polen", "lat": 52.2297, "lng": 21.0122 }
]
```

Jede Rätsel-Zielstadt muss identisch (Name, Koordinaten) auch in `cities.json` vorhanden sein; ein Validierungs-Test stellt das sicher.

**`localStorage`:**

- `dcq:state` — Spielstand des aktuellen Rätsels (Rätseldatum, aufgedeckte Hinweise, bisherige Versuche, Quiz-Fortschritt), damit ein Reload nichts verliert.
- `dcq:stats` — Statistik und Streak (siehe 3.4) inkl. `lastPlayedDate`.

Alle Lese-/Schreibzugriffe sind in try/catch gekapselt; ohne verfügbaren Storage läuft das Spiel trotzdem (dann ohne Persistenz).

### 4.4 Kernlogik

- **Rätselauswahl:** lokales Gerätedatum (`YYYY-MM-DD`) → Lookup über `puzzle.date`. Kein Eintrag für heute → „Vorrat leer"-Hinweis (siehe 6).
- **Eingabe-Normalisierung:** Kleinschreibung, Unicode-Diakritika entfernen (NFD), `ß→ss`; Match gegen Name und Aliase.
- **Distanz:** Haversine-Formel, Ausgabe gerundet (unter 100 km auf 10er, darüber auf 100er). **Richtung:** Anfangs-Bearing von geratener zu gesuchter Stadt, gemappt auf 8 deutsche Himmelsrichtungen (nördlich, nordöstlich, …).
- **Scoring & Streak:** wie 3.1/3.2/3.4, als pure Funktionen.

## 5. Screens & Ablauf

1. **Start:** Marco begrüßt, Rätselnummer + Datum, Streak-Flamme, „Spielen"-Button. Kurze Spielregel-Zeile für Erstspieler.
2. **Raten (Akt 1):** Aufgedeckte Hinweiskarten (neue Karte klappt animiert auf), 6 Versuchs-Slots, Texteingabe mit Autocomplete, Distanz-Feedback-Zeilen bei Fehlversuchen, Marco-Kommentar.
3. **Auflösung:** „Es war Lissabon!" mit Stadt, Land und Marcos Anekdote; Überleitung ins Bonus-Quiz.
4. **Bonus-Quiz (Akt 2):** 3 Fragen nacheinander, 4 Antwort-Buttons, 10-Sekunden-Countdown-Balken, sofortiges Richtig/Falsch-Feedback mit Marco-Spruch.
5. **Ergebnis:** Tagespunkte (x/9), Rate-Verlauf, Share-Button („Kopiert!"-Feedback), Statistik-Zugang, Countdown bis zum nächsten Rätsel.
6. **Statistik-Modal:** Kennzahlen aus 3.4, jederzeit über Icon erreichbar.

Design-Richtung: Mobile-first, dunkles „Abendshow"-Theme mit Spielshow-Energie (kräftige Akzentfarbe, großzügige Typo, Mikro-Animationen bei Hinweis-Aufdeckung, Treffer und Countdown). Desktop zeigt dasselbe Layout zentriert.

Wer das heutige Rätsel bereits beendet hat und die Seite erneut öffnet, landet direkt auf dem Ergebnis-Screen.

## 6. Edge Cases

- **Mitternachtswechsel während des Spielens:** Der Spielstand ist an das Rätseldatum gebunden; ein begonnenes Rätsel wird zu Ende gespielt. Beim nächsten Laden nach Mitternacht startet das neue Tagesrätsel.
- **Verpasster Tag:** bricht den Streak (Vergleich `lastPlayedDate` vs. gestern), sonst keine Nachholmöglichkeit in V1.
- **Rätselvorrat erschöpft / Datum vor Launch:** freundlicher Hinweis-Screen statt Fehler („Marco ist noch unterwegs…").
- **Reload / Tab-Schließen mitten im Spiel:** Zustand wird nach jedem Zug in `dcq:state` gesichert und wiederhergestellt; ein laufender Quiz-Countdown startet für die aktuelle Frage neu.
- **localStorage nicht verfügbar** (Privatmodus o. Ä.): Spiel läuft ohne Persistenz, Statistik zeigt entsprechenden Hinweis.
- **Doppelte Städtenamen** (z. B. „San José"): Anzeige in der Autocomplete-Liste immer mit Land.

## 7. Content-Pipeline

- Initialer Batch: ~90 Rätsel (≈ 3 Monate), per AI generiert, direkt als `puzzles.json` ins Repo. Nachschub wird bei Bedarf als weiterer Batch generiert und committet.
- **Qualitätsregeln für die Generierung:** Fakten müssen stimmen (keine erfundenen Zahlen/Anekdoten); Schwierigkeitsmix ca. 40 % leicht (weltberühmt), 40 % mittel, 20 % knifflig; keine zwei Städte desselben Landes an aufeinanderfolgenden Tagen; Hinweis 1 darf die Stadt nicht eindeutig machen, Hinweis 6 soll sie fast sicher machen; Quizfragen beziehen sich auf die Stadt, nicht auf die Hinweise.
- Ein automatischer Validierungs-Test prüft die Datenintegrität: Schema, genau 6 Hinweise und 3 Fragen, `answerIndex` gültig, lückenlose Datumsfolge, Zielstadt in `cities.json` vorhanden, keine Länder-Doppler an Folgetagen.

## 8. Testing

- **Vitest** für die gesamte Spiellogik in `src/game/` und `src/storage/`: Normalisierung (Umlaute, Akzente, Aliase), Haversine-Distanz und Richtungs-Mapping, Scoring, Rätselauswahl nach Datum, Streak-/Statistik-Fortschreibung, State-Reducer (Spielzüge inkl. Reload-Wiederherstellung).
- **Daten-Validierungstest** für `puzzles.json`/`cities.json` (siehe 7).
- **UI:** manuelle Prüfung im eingebauten Browser (mobil 375 px und Desktop), inkl. komplettem Spieldurchlauf, Share-Kopie und Reload-Verhalten. Keine automatisierten E2E-Tests in V1.

## 9. Nicht-Ziele (V1)

Kein Backend, keine Accounts, kein Leaderboard, keine Push-Notifications, keine englische Version, keine native App, keine Archiv-/Nachholfunktion für alte Rätsel, keine Live-AI-Generierung zur Laufzeit, keine Monetarisierung.
