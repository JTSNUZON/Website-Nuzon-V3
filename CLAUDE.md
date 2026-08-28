# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Werkwijze voor dit project

## Git — committen mag, pushen naar main niet zomaar
Na elke afgeronde wijziging: `git add -A` en committen met een korte
Nederlandse beschrijving. Dat hoeft niet gevraagd te worden.

**Pushen naar main gebeurt nooit uit jezelf.** Wacht op een expliciete
bevestiging van de gebruiker in de chat met het woord "push". Doe dan
EERST `git pull` om te checken of iemand anders intussen iets heeft
gepusht, en pas daarna `git push`. Zo voorkomen we dubbel werk en dat
iemands wijzigingen overschreven worden. Levert die pull conflicten op,
los die dan eerst zichtbaar op (of vraag het na) voor je pusht.

Voor je begint te werken: ook dan eerst `git pull` om werk van anderen
op te halen.

## Context
- Project: NuZon website V3 (nuzon-frontpage)
- Eigenaar: Tjark Boot, NuZon B.V. / JTS Installatietechniek
- NuZon huisstijl: amber/bruin — #B66112, #7A3E0C, #FAC61F
- JTS huisstijl: blauw #004AAD
- Communiceer in het Nederlands, informeel en direct
- Code, klassenamen en commentaar in de bestanden zijn ook Nederlands — hou dat zo

## Zelf controleren voor je oplevert
Elke wijziging aan de site eerst zelf in de browser bekijken — screenshot of
Playwright-scriptje — voordat je 'm afmeldt. Niet alleen de code nalezen: de
pagina echt openen, het gedrag aandrijven (hoveren, klikken, toetsenbord,
telefoonformaat) en het beeld vastleggen. Laat daarna een voorbeeld zien van
wat je gemaakt hebt.

## Commando's
Er is geen buildstap, geen packagemanager, geen testsuite en geen linter.
De map `nuzon-frontpage/` is letterlijk wat er live staat.

```bash
# lokale preview (zelfde config als .claude/launch.json)
python3 -m http.server 4173 --directory nuzon-frontpage

# syntaxcontrole van het script na een wijziging
node --check nuzon-frontpage/js/site.js
```

Visueel controleren kan met Playwright; die staat globaal geïnstalleerd
(`require('/opt/node22/lib/node_modules/playwright')`, Chromium in
`/opt/pw-browsers`). Nooit `playwright install` draaien.

Let op bij de preview: Vercel serveert met `cleanUrls`, dus alle interne
links zijn zonder `.html` geschreven (`/opwekken`, niet `/opwekken.html`).
Een kale `python3 -m http.server` lost die niet op — open de preview met
`.html` erachter of gebruik een server die extensieloze URL's aankan.

## Architectuur

**Statische site, drie bestanden die alles dragen.** Elf HTML-pagina's in
`nuzon-frontpage/`, één `css/site.css` en één `js/site.js`. Geen frameworks,
geen dependencies, geen templating.

**De topbalk, de menupanelen en de footer staan gedupliceerd in alle elf de
pagina's.** Er is geen include-mechanisme. Wijzig je iets aan de navigatie,
dan moet dat in elk bestand identiek gebeuren — doe dat met een scriptje
(`python3` over `glob('*.html')`) en niet met de hand, anders lopen pagina's
uit elkaar.

**`css/site.css` is token-gestuurd.** Bovenaan staan de custom properties;
componenten verwijzen alleen naar die tokens. Daardoor kan de homepage
zijn donkere verloop maken met de kleurtrap `.trap` + `.trap--1` t/m
`.trap--7`: elke band herdefinieert alleen de tokens, en kaarten, koppen
en knoppen erbinnen kleuren vanzelf mee. Wil je een sectie donker maken,
geef 'm dan een trap-klasse in plaats van losse kleuren te schrijven.
De logo-tokens (`--font-merk`, `--merk-goud`, `--merk-inkt`, `--merk-tag*`)
komen uit het aangeleverde logobestand en blijven ongemoeid.

**`js/site.js` draait op elke pagina** en doet vier dingen:
- *Introscherm*: het logo dekt de pagina bij elke paginawissel af, zet de
  scroll op slot en herstelt die zelf (`history.scrollRestoration = 'manual'`).
  Sluiten kan van buitenaf via `window.nuzonSluitIntro()`; daarna volgt het
  event `nuzon:intro-klaar`.
- *Topbalk*: `.is-scrolled` zodra je voorbij 8px scrollt, alleen op pagina's
  met `body.has-hero`.
- *Menupanelen*: een lijstje knop-paneel-paren (`#megaBtn`/`#mega`,
  `#prodBtn`/`#prodMega`). Er staat er altijd hooguit één open; hover opent,
  `mouseleave` op de hele `.topbar` sluit. Een derde menu voeg je toe door
  het paar aan die lijst te hangen — de logica hoeft niet mee te veranderen.
- *WhatsApp-knop*: nummer en standaardbericht staan als constanten bovenin.

**`index.html` heeft daarnaast een eigen inline script** onderaan met alles
wat alleen de homepage nodig heeft:
- `var REVIEWS = [...]` — hier beheer je de reviews. Teksten staan letterlijk
  zoals de klant ze op Google schreef; niet herschrijven of corrigeren.
- de hero-video: laadt pas na de intro, wisselt tussen `hero.mp4` en
  `hero-mobiel.mp4`, pauzeert buiten beeld en roept `nuzonSluitIntro` aan.
- de voordeel-calculator en het jaartal in de footer.

**Cachebuster:** css en js worden geladen als `site.css?v=N` / `site.js?v=N`.
Wijzig je een van die twee, verhoog dan `N` in alle elf de pagina's.
