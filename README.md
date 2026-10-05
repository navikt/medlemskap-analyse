# Medlemskap Analyse

`medlemskap-analyse` er et internt verktøy for å jobbe med medlemskap- og sykepengeflyt i NAV. Appen brukes både til å starte analysejobber og til å teste integrasjoner mot tilhørende tjenester.

## Hva gjør appen?

Appen har to hovedflater:

- **Analyse**: brukes til å starte generering av uttrekk for en valgt periode.
- **Testrammeverk**: brukes til å teste og simulere kall mot ulike endepunkter i utviklingsmiljø.

Målet med appen er å gjøre det enklere å verifisere og teste flyten mellom frontend, backend og de tilhørende tjenestene i medlemskap-løsningen.

## Hvilke komponenter bruker vi?

Appen er koblet mot to sentrale backend-komponenter:

### `medlemskap-saga`
Brukes av **Analyse**-delen. Når en bruker sender inn en forespørsel om uttrekk, sendes det et kall videre mot saga-løsningen som håndterer videre prosessering.

### `medlemskap-sykepenger-listener`
Brukes av **Testrammeverk**. Komponenten brukes til å simulere og teste kall mot lytteren, slik at vi kan verifisere håndteringen av sykepengerelaterte hendelser og vurderinger i et kontrollert testmiljø.

I tillegg bruker appen NAVs innloggingsløsning og autentisering via Azure AD, samt intern dekoratør for standard NAV-oppsett i grensesnittet.

## Tilgang i produksjon

Appen er tilgjengelig i NAVs interne produksjonsmiljø og krever innlogging med NAV-konto.

Produksjonsadressene er:

- https://medlemskap-analyse.intern.nav.no
- https://medlemskap-analyse.ansatt.nav.no

Tilgangen styres av NAVs vanlige tilgangs- og autentiseringsmekanismer.  
Merk at **Testrammeverk** ikke er tilgjengelig i produksjon, men kun i dev-miljø.

## Forskjellen på Analyse og Testrammeverk

### Analyse
Analyse-delen brukes for å starte en faktisk analysejobb for en valgt periode. Dette er den delen som er mest relevant i ordinær drift, og som brukes når man vil trigge generering av uttrekk.

Typisk bruk:
- velg periode
- send forespørsel
- følg opp at uttrekket blir generert og gjort tilgjengelig videre i løsningen

### Testrammeverk
Testrammeverket er laget for testing og verifisering i utviklingsmiljø. Her kan man simulere ulike typer kall uten å bruke manuelle verktøy som Postman.

Testrammeverket har blant annet egne faner for:
- Brukerspørsmål
- Publiser
- Nullstilling
- Speil
- Medlemskapsstatus
- Nyeste brukersvar

Dette gjør det enklere å teste flyten ende til ende direkte i nettleseren.

## Lokal kjøring

### Forutsetninger
- Node.js installert
- pnpm installert

### Installer avhengigheter
```bash
pnpm install
