# Daily City Quiz — UI-Redesign „Transit“ (Design-Spec)

**Datum:** 15.11.2026
**Status:** Entwurf, wartet auf Freigabe
**Verbindliche visuelle Referenz:** `docs/superpowers/mockups/2026-11-15-ui-richtungen/transit.html`

## Ziel & Hintergrund

Erstes Spieler-Feedback zu v1: Spiel gut, UI „okay, aber nicht umwerfend“. Das aktuelle UI ist ein generischer dunkler App-Look ohne eigene Bildsprache. Dieses Redesign gibt dem Spiel eine eigenständige Art Direction: **Transit** — Abflugtafel am Flughafen plus Metro-Vokabular. Die Spielmechanik liefert die Metaphern frei Haus: 6 Hinweise = 6 Haltestellen einer Linie, das Erraten = Ankommen, das Ergebnis = Bordkarte, der Reveal = Fallblatt-Anzeige, die umspringt.

**Umfang:** Alle Screens, inklusive Motion. **Reine Präsentationsschicht** — Spiellogik, Storage, Datenformat und Share-Text bleiben unverändert (eine Ausnahme: M3, siehe QuizScreen).

## Design-Sprache (Tokens)

Farben (als Tailwind-4-`@theme`-Tokens in `src/index.css`):

| Token | Wert | Rolle |
|---|---|---|
| `--color-bg` | `#131519` | Seitenhintergrund |
| `--color-board` | `#0f1113` | Tafel-Flächen (Header, Modals) |
| `--color-cell` | `#1a1d21` | Zellen/Karten (Hinweise, Durchsagen) |
| `--color-edge` | `#24282e` | Rahmen, Trennlinien |
| `--color-amber` | `#ffc83d` | Tafel-Schrift, Akzent, CTA — trägt Information, nie Deko |
| `--color-bright` | `#e8e9eb` | Fließtext |
| `--color-dim` | `#9aa0a8` | Nebentexte (nur ≥ 12 px) |
| `--color-miss` | `#ff7a6b` | Status „daneben“ (nur dafür) |
| `--color-hit` | `#4fbf78` | Status „richtig/angekommen“ (nur dafür) |
| `--color-paper` | `#f7f3e8` | Ticket/Bordkarte — nur, wo der Spieler etwas „in der Hand hält“ |
| `--color-ink` | `#15171a` | Text auf Papier |

Schriften (selbst gehostet via `@fontsource`-Pakete, kein Google-Request zur Laufzeit):

- **Oswald** (400–600): Tafel-Display — Stadtnamen, CTA, kurze Versal-Labels.
- **B612** (400/700 + Italic): Fließtext — Hinweise, Marco, Fragen. Immer Mixed Case.
- **B612 Mono** (400/700): Daten — Nummern, Kilometer, Timer, Spaltenköpfe, Tags.

Grundsätze:

- Versalien **nur per CSS `text-transform`**, nie im Markup — Tests und Screenreader sehen normalen Text.
- Versalien nur für kurze Tafel-Labels und Daten; Hinweis-/Marco-Texte nie.
- Layout bleibt mobile-first, zentrierte Spalte `max-w` ≈ 430 px, Safe-Area-Padding wie bisher.

## Screens

### App-Rahmen: die Tafel (App.tsx + neuer Board-Header)

Ein Tafel-Header ersetzt den bisherigen App-Header und erscheint auf allen Spiel-Screens:

- Zeile 1 (mono, amber, gesperrt): `DAILY CITY QUIZ` links, Wochentag + Datum rechts (`SA 15 NOV`).
- Zeile 2: Label `ZIEL` + Fallblatt-Zellen. Vor dem Lösen: `???` (3 Zellen). Nach dem Reveal: der Stadtname in Zellen (bei langen Namen schmalere Zellen, Umbruch ab ~12 Zeichen vermeiden durch kleinere Schriftgröße).
- Zeile 3 (mono): `RÄTSEL 001` links, `SERIE n` (effectiveStreak) rechts; daneben Statistik-Zugang als mono-Textbutton `STATISTIK`.

### StartScreen

Wie Mockup: Tafel-Header, Durchsage-Panel (Tag `DURCHSAGE`, Marco-Intro, Signatur `MARCO, REISELEITUNG`), CTA „Los geht’s!“ (amber, Oswald, uppercase per CSS), Spielregeln als mono-Zentrattext.

### GuessScreen

- **Metro-Linie:** 6 Stationen auf einer Linie; aufgedeckte Hinweise = gefüllte Stationen (amber), aktuelle Station mit Puls-Ring, Caption `HALTESTELLE x VON 6` (ersetzt die bisherige „Hinweis x von 6“-Anzeige).
- **Hinweise:** Zeilen mit mono-Tag `H1`…`H6` links, Text in B612.
- **Tipps:** Tafel-Tabelle mit Spaltenköpfen `TIPP | RICHTUNG | STATUS`; Stadtname in Oswald-Versalien, Richtung mono amber (`500 KM WESTLICH`, volle Richtungswörter aus `describeMiss`), Status-Chip `DANEBEN` in Rot. Duplikat-Feedback („schon probiert“) bleibt erhalten, als dim-Zeile unter der Tabelle.
- **Marco-Spruch** nach Fehlversuch: kursiv, dim.
- **Ticket:** Papier-Block mit Seitenkerben, Label `DEIN TIPP`, Eingabefeld (Unterstrich-Stil), Button `RATEN` (ink auf Papier). Die **Autocomplete-Liste** klappt unterhalb des Felds im Ticket auf: Papier-Hintergrund, Ink-Text, aktive Zeile invertiert (ink-Fläche, Papier-Text). Ranking/Verhalten unverändert.

### Reveal (RevealScreen, Übergang Akt 1 → Akt 2)

Der zentrale Moment des Redesigns:

- Die Fallblatt-Zellen im Header **buchstabieren den Stadtnamen**: Zellen durchlaufen von links nach rechts zufällige Zeichen und rasten nacheinander ein (Gesamtdauer ~1,2 s). Bei `prefers-reduced-motion`: sofortige Anzeige ohne Animation.
- Statuszeile: bei Treffer grüner Chip `ANGEKOMMEN` + erreichte Akt-1-Punkte; nach 6 Fehlversuchen roter Chip `VERPASST`.
- Marcos Reveal-Text als Durchsage-Panel.
- Weiter-CTA: „Zur Bonusrunde“.

### QuizScreen

- Frage in B612 im Durchsage-Panel, Fragen-Zähler mono (`FRAGE 1 VON 3`).
- Countdown als mono-Anzeige im Panel (`0:10` herunterzählend); unter 3 s wechselt er auf Rot mit dezentem Puls. Zusätzlich bleibt er als Text lesbar (kein rein visuelles Signal).
- 4 Antworten als Tafel-Zeilen. Nach der Antwort: richtige Zeile bekommt grünen Chip `RICHTIG`; **die gewählte falsche Zeile bekommt einen roten Chip `DANEBEN`** — das behebt den bisher offenen Minor-Punkt M3 (falsche Wahl war nicht markiert).
- Marcos Kommentar (hostCorrect/hostWrong) danach wie bisher.

### ResultScreen

- Ergebnis als **Bordkarte** (Papier): Kopf `BORDKARTE`, Zeilen `ZIEL <Stadt>`, Datum, `RÄTSEL 001`; Perforationslinie; darunter `PUNKTE` gesamt, Akt-1-Grid (✖/✅ wie im Share-Text), `BONUS x/3`, `SERIE n`.
- **Stempel-Motion:** Beim Einblenden knallt ein Stempel schräg auf die Karte — grün `ANGEKOMMEN` bei gelöstem Rätsel, rot `VERPASST` sonst (~350 ms, Scale + Rotation; reduced-motion: statisch).
- Teilen-Button amber (`Teilen`); **Share-Text bleibt unverändert.**
- Countdown zum nächsten Rätsel: `NÄCHSTE ABFAHRT IN 07:12:33` (mono). Statistik-Zugang bleibt.

### StatsModal & EmptyScreen

- StatsModal: dunkles Tafel-Panel (board/edge), Zahlen mono, Verteilungs-Balken amber; leere Balken weiterhin ohne Innen-Füllung. Verhalten (Dialog, Escape) unverändert.
- EmptyScreen (kein Rätsel für heutiges Datum): Tafel mit `KEINE ABFAHRT` in Fallblatt-Zellen + erklärender Text.

### index.html

- `theme-color` → `#131519`.
- Favicon und OG-Tags bleiben (Brand unverändert).

## Motion-Inventar

Alle Animationen hinter `prefers-reduced-motion: reduce` (dann: Endzustand sofort):

| Moment | Trigger | Dauer |
|---|---|---|
| Fallblatt-Flip der `???`-Zellen | Laden des StartScreens | 2 Flips, ~1 s |
| Stadtname buchstabiert sich | Reveal | ~1,2 s |
| Neuer Hinweis fährt als Zeile ein | Hinweis aufdecken | ~300 ms |
| Station füllt sich + Puls | Hinweis aufdecken | ~400 ms einmalig; aktueller Stations-Ring pulsiert dezent |
| Timer-Puls rot | Countdown < 3 s | bis Ablauf |
| Stempel auf Bordkarte | ResultScreen erscheint | ~350 ms |

Keine Scroll-Entrance-Effekte, keine Hover-Deko, keine Dauerschleifen darüber hinaus.

## Nicht-Ziele

- Keine Änderungen an Spiellogik, Reducer, Storage, Datenformat, Punktesystem (einzige Ausnahme: M3-Markierung im QuizScreen, rein darstellend).
- Share-Text unverändert.
- Keine neuen Features (kein Archiv, kein Leaderboard, keine PWA).
- Desktop bleibt zentrierte mobile Spalte auf `--color-bg`.

## Barrierefreiheit & Qualität

- Kontraste: amber auf board > 10:1; bright auf bg > 12:1; dim (#9aa0a8) nur für Nebentexte ≥ 12 px (~4,6:1).
- Fokus-Ringe amber (`:focus-visible`), durchgängig.
- Fallblatt-Animation ist dekorativ: der Stadtname steht als regulärer Text im DOM (für Screenreader per `aria-label`/visually-hidden abgesichert), `aria-live`-Verhalten für neue Hinweise bleibt.
- Status nie nur über Farbe: Chips tragen Text (`DANEBEN`, `RICHTIG`, `ANGEKOMMEN`, `VERPASST`).

## Teststrategie

- Alle 62 bestehenden Tests bleiben grün; `game/*` ist unberührt. Komponenten-Tests werden an neues Markup angepasst, geprüftes Verhalten bleibt identisch (Texte bleiben Mixed Case im DOM, daher minimale Anpassungen).
- Neue Tests: QuizScreen markiert gewählte falsche Antwort (M3); Reveal zeigt Stadtnamen auch bei reduced-motion sofort.
- E2E im Browser-Pane: kompletter Playthrough (Lösen + Nicht-Lösen), mobile 375 px + Desktop, einmal mit emuliertem `prefers-reduced-motion`.
