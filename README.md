# Medlemskap Analyse

## Teknisk stack

- **Frontend**: Next.js 16 med App Router
- **Autentisering**: Azure AD via Wonderwall og Oasis
- **Backend integrasjon**: OBO (On-Behalf-Of) token exchange mot medlemskap-saga
- **Deployment**: NAIS på GCP

## Kom i gang

### Forutsetninger

- Node.js 20 eller høyere
- npm

### Installasjon

1. Klon repositoriet:

\`\`\`bash
git clone <repository-url>
cd medlemskap-analyse
\`\`\`

2. Installer avhengigheter:

\`\`\`bash
npm install
\`\`\`

3. Start utviklingsserveren:

\`\`\`bash
npm run dev
\`\`\`

4. Åpne [http://localhost:3000](http://localhost:3000) i nettleseren

### Tilgjengelige scripts

- `npm run dev` - Starter utviklingsserveren
- `npm run build` - Bygger applikasjonen for produksjon
- `npm run start` - Starter produksjonsserveren
- `npm run lint` - Kjører ESLint

## Deployment

Applikasjonen deployes automatisk til NAIS på GCP via GitHub Actions.

### Miljøer

- **Dev**: https://medlemskap-analyse.intern.dev.nav.no

