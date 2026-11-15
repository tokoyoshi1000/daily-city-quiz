# Wachstums-Paket — Design

**Datum:** 15.11.2026 · **Status:** vom User freigegeben (Richtung „Mehr Spieler", Kanal „Freunde + Shares, dann Communities", Sprache bleibt Deutsch, Zuschnitt „Komplett")

## Ziel

Jede Station des Wegs **Link sehen → klicken → spielen → teilen → wiederkommen** wird gut, und über anonyme Analytics wird erstmals sichtbar, wo Besucher abspringen. Die Spiellogik, das Punktesystem und das localStorage-Format bleiben unangetastet.

## Kontext (Ist-Zustand)

- Kein `og:image`, Favicon ist ein Inline-SVG-Emoji 🌍, keine Icon-Dateien.
- Teilen: nur `navigator.clipboard.writeText` mit `window.prompt`-Fallback ([ResultScreen.tsx](../../../src/components/ResultScreen.tsx)).
- `src/data/puzzles.json` (328 kB) und `src/data/cities.json` (40 kB) werden ins JS-Bundle einkompiliert → Hauptbundle ~553 kB.
- Keine PWA (kein Manifest, kein Service Worker), keine Analytics.
- Storage-Keys haben das Präfix `dcq:` (`dcq:state`, `dcq:stats`).

---

## Baustein A — Link-Vorschau & echte Icons

**Was:** Ein geteilter Link zeigt in Messengern (WhatsApp, Signal, Discord, Slack) ein Vorschaubild im Transit-Look statt grauem Text.

- `public/og.png`, 1200×630: Hintergrund `#131519`, zentriertes Board-Panel (`#0f1113`, Rahmen `#24282e`), darin Fallblatt-Zellen „DAILY CITY QUIZ" (Amber `#ffc83d` auf `#1a1d21`, Oswald), darunter in B612 Mono (dim `#9aa0a8`): „ERRATE DIE STADT DES TAGES · 6 HINWEISE · JEDEN TAG NEU".
- Meta-Tags in `index.html`: `og:image` (absolute URL), `og:image:width/height`, `twitter:card: summary_large_image`.
- **Icon-Set** (ersetzt das Emoji-Favicon): ein Motiv — eine Fallblatt-Zelle mit amberfarbenem „D" in Oswald, horizontale Teilungslinie, abgerundetes Quadrat auf `#1a1d21`. Daraus: `favicon.png` (32), `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (Motiv mit Sicherheitsrand), alle unter `public/`.
- **Erzeugung:** `asset-studio.html` im Projekt-Root — eine Dev-Seite, die nur der Vite-Dev-Server ausliefert (Vite baut ausschließlich `index.html`); sie rendert OG-Bild und Icons und nutzt dafür die Zeichen-Helfer aus `shareCard.ts` (Fallblatt-Zellen, Panels), plus eigenes Layout für OG/Icons. Die erzeugten PNGs werden einmalig exportiert und eingecheckt. Die Seite wird nie deployt.

## Baustein B — Teilen mit Bild

**Was:** Der TEILEN-Button öffnet am Handy den nativen Teilen-Dialog, mit einer Bordkarten-Grafik als Bild.

- **Kein Spoiler:** Das Share-Bild zeigt den Stadtnamen NICHT. Statt des Namens stehen Fallblatt-Zellen mit `???` — das Rätsel bleibt für Empfänger offen und macht neugierig.
- Bildinhalt (1080×1350, Hochformat): Bordkarten-Papier (`#f7f3e8`) auf dunklem Grund, Kopf „BORDKARTE / RÄTSEL 00N", Datumszeile, ZIEL-Zeile mit `???`-Fallblatt-Zellen, Metro-Linie mit markierter Treffer-Station (bzw. ohne Treffer bei Niederlage), Stempel ANGEKOMMEN (`#1f7a45`) oder VERPASST (`#c0392b`), Punkt- und Quiz-Zeile (`N PUNKTE · QUIZ k/3`), Fußzeile mit URL `tokoyoshi1000.github.io/daily-city-quiz`.
- **Neues Modul `src/game/shareCard.ts`:**
  - `buildShareCardLayout(input): ShareCardLayout` — pure Funktion, berechnet alle Texte/Positionen/Farben aus `{ number, dateLabel, points, solvedAtHint | null, quizCorrect, quizTotal }`. Unit-testbar ohne Canvas.
  - `renderShareCard(layout): Promise<Blob>` — zeichnet das Layout auf ein Canvas (DPR-fest 1080×1350) und liefert ein PNG-Blob. Kein DOM-Screenshot.
- **Teilen-Kette** in `ResultScreen` (Funktion `share()`):
  1. `navigator.canShare?.({ files: [pngFile] })` → `navigator.share({ files, text })` (Text = bisheriger Emoji-Raster-Share-Text),
  2. sonst `navigator.share({ text })`,
  3. sonst Clipboard wie heute (inkl. `window.prompt`-Fallback).
  - Abbruch durch den User (`AbortError`) ist kein Fehler: kein Feedback-Wechsel, kein Tracking.
- Der Share-**Text** (`buildShareText`) bleibt byte-identisch.

## Baustein C — Schneller Start + PWA

**Was:** Daten raus aus dem Bundle, App-Shell installierbar und offlinefähig — ohne dass der Cache je ein altes Tagesrätsel festhalten kann.

- **Datenlader:** `puzzles.json` und `cities.json` ziehen von `src/data/` nach `public/data/`. Neues Modul `src/data/loader.ts`: `loadGameData(): Promise<GameData>` lädt beide per `fetch(import.meta.env.BASE_URL + "data/…")`, prüft die Grobform (Arrays vorhanden, Pflichtfelder am ersten Element) und wirft sonst. `src/data/validate.test.ts` importiert die JSONs weiter direkt per relativem Pfad — die Tiefenvalidierung bleibt Testsache.
- **App-Zustände:** `App` bekommt einen Ladezustand vor dem Spiel: `laden → bereit | störung`.
  - Laden: Board-Panel mit Wortmarke und mono-Zeile „ANZEIGETAFEL WIRD GELADEN …" (erscheint erst nach 300 ms, um Flackern bei schnellem Netz zu vermeiden).
  - Störung: Durchsage im Transit-Stil („Signalstörung — die Anzeigetafel ist gerade nicht erreichbar.") mit Button „Erneut versuchen" (ruft `loadGameData` erneut).
  - Danach alles wie bisher (inkl. `EmptyScreen`, wenn für heute kein Rätsel in den Daten ist).
- **PWA** via `vite-plugin-pwa` (devDependency, `generateSW`):
  - Precache: App-Shell (HTML, JS, CSS, Fonts, Icons). `og.png` ausgeschlossen (offline unnötig).
  - `runtimeCaching`: `NetworkFirst` für `data/*.json` (Timeout 4 s, Fallback Cache) → nach Mitternacht kommt immer der frische Stand; offline gilt der letzte, der ohnehin alle 90 datierten Rätsel enthält.
  - `registerType: "autoUpdate"` → neue Shell aktiviert sich beim nächsten Besuch selbst; kein „Update verfügbar"-UI.
  - Manifest: `name` „Daily City Quiz", `short_name` „City Quiz", `lang` de, `display` standalone, `start_url`/`scope` relativ (funktioniert mit `--base=/daily-city-quiz/`), `background_color`/`theme_color` `#131519`, Icons 192/512/maskable.

## Baustein D — Wiederkommen-Anker (Install-Moment)

**Was:** Auf dem Ergebnis-Screen lädt eine dezente Zeile zum Installieren ein — sie erscheint, solange weder installiert noch abgewiesen wurde, und nie als Popup.

- Neue Komponente `src/components/InstallHint.tsx`, eingebunden am Ende des `ResultScreen`.
- Sichtbar nur wenn: nicht im Standalone-Modus (`display-mode: standalone` bzw. `navigator.standalone`) UND nicht zuvor abgewiesen (`dcq:installHint` = `"done"`).
- Android/Chromium: `beforeinstallprompt` wird in `App` abgefangen und gehalten; die Zeile zeigt „Als App aufs Handy?" mit Button „Installieren" (ruft `prompt()` auf) und „×". Nach `appinstalled` oder „×": Key setzen, Zeile verschwindet dauerhaft.
- iOS Safari (kein `beforeinstallprompt`): statische Zeile „Als App: Teilen-Menü → ‚Zum Home-Bildschirm'" mit „×".
- Desktop-Browser ohne Install-Support zeigen nichts.

## Baustein E — Anonyme Analytics

**Was:** GoatCounter — kostenlos, cookielos, ohne personenbezogene Daten; zählt Seitenaufrufe und eine Handvoll Spiel-Events.

- Neues Modul `src/analytics.ts`:
  - `const GOATCOUNTER_ENDPOINT = ""` — leer heißt: komplett aus (kein Script, `track` ist No-op). Sobald der User seinen GoatCounter-Account hat, wird hier `https://<code>.goatcounter.com/count` eingetragen und deployt.
  - `initAnalytics()`: injiziert das GoatCounter-Script (zählt den Pageview automatisch); No-op wenn Endpoint leer oder `navigator.doNotTrack === "1"`.
  - `track(event: string)`: `window.goatcounter?.count({ path: event, event: true })`, fängt Fehler still.
- **Events** (Aufrufe liegen in den Komponenten/`App`, nie im Reducer — die Spiellogik bleibt pur): `spiel-gestartet`, `geloest-h1` … `geloest-h6`, `verloren`, `quiz-beendet`, `geteilt-bild` / `geteilt-text` / `geteilt-clipboard`, `installiert`.
- Kein Consent-Banner: keine Cookies, keine personenbezogenen Daten, DNT wird respektiert.

---

## Dateien (neu/geändert)

| Datei | Zweck |
|---|---|
| `public/og.png`, `public/favicon.png`, `public/apple-touch-icon.png`, `public/icon-192.png`, `public/icon-512.png`, `public/icon-maskable-512.png` | generierte Assets (A) |
| `public/data/puzzles.json`, `public/data/cities.json` | verschoben aus `src/data/` (C) |
| `asset-studio.html` (Root, nur Dev) | erzeugt OG-Bild + Icons aus dem Canvas-Code (A) |
| `index.html` | OG-/Twitter-Meta, Icon-Links (A) |
| `src/game/shareCard.ts` + Test | Layout + Canvas-Rendering des Share-Bilds (B) |
| `src/components/ResultScreen.tsx` | Teilen-Kette mit Bild (B), InstallHint-Einbindung (D), Track-Aufrufe (E) |
| `src/data/loader.ts` + Test | Laufzeit-Datenlader (C) |
| `src/App.tsx` | Ladezustand, `beforeinstallprompt`-Capture, `initAnalytics` (C/D/E) |
| `src/components/LoadingScreen.tsx`, `src/components/ErrorScreen.tsx` | Lade-/Störungsanzeige (C) |
| `src/components/InstallHint.tsx` + Test | Install-Zeile (D) |
| `src/analytics.ts` + Test | GoatCounter-Wrapper (E) |
| `vite.config.ts`, `package.json` | `vite-plugin-pwa`, Manifest (C) |

## Nicht-Ziele

Kein Archiv/Trainingsmodus, kein Backend, keine Accounts, keine zweite Sprache, keine Push-Notifications, kein Consent-Banner, kein „Update verfügbar"-UI. Reducer, Scoring, Share-Text und die Keys `dcq:state`/`dcq:stats` bleiben unverändert.

## Risiken

- **SW-Caching vs. Tagesrätsel** (größtes Risiko): entschärft durch NetworkFirst für `data/*.json` und autoUpdate der Shell. E2E-Probe: Spiel laden → Datum simulieren/Daten ändern → Reload muss frische Daten zeigen.
- **`navigator.share` mit Dateien** ist uneinheitlich (Desktop-Browser oft ohne): die dreistufige Kette degradiert sauber; Clipboard-Verhalten bleibt als Boden.
- **GitHub-Pages-Cache** (~10 min CDN): unkritisch, da NetworkFirst ohnehin das Netz fragt und die Daten sich nur beim Deploy ändern.
- **Bundle-Split ändert Startreihenfolge:** `EmptyScreen`-Fall und Reload-Idempotenz müssen nach dem Umbau explizit nachgetestet werden.

## Teststrategie

- **Unit (Vitest):** `buildShareCardLayout` (Treffer/Niederlage/Quiz-Varianten), Teilen-Methodenwahl (gemockte `navigator`-Fähigkeiten), `loadGameData` (ok / kaputtes JSON / Netzfehler, gemocktes `fetch`), `analytics` (No-op ohne Endpoint/mit DNT), InstallHint-Sichtbarkeitslogik (pure Helferfunktion).
- **Bestand:** alle 67 Tests bleiben grün; `validate.test.ts` nur mit angepassten Importpfaden.
- **E2E (Browser-Pane):** kompletter Durchlauf nach Umbau (Reload-Idempotenz, EmptyScreen), Lade-/Störungszustand (Netz drosseln/Offline), Manifest + SW-Registrierung + Installierbarkeits-Check, Share-Bild-Sichtprüfung über `asset-studio.html`, Mobile 375 px.
- **Deploy:** `npm run build -- --base=/daily-city-quiz/` muss SW/Manifest mit korrekten Pfaden erzeugen; nach Deploy Live-Check von `og.png`, Manifest und Datenladen.
