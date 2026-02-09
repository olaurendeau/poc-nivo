# POC Nivologie

POC **Next.js** pour une application de **retours terrain nivologiques** : saisie et consultation d’indices, observables, profils et tests de stabilité, utilisable par amateurs, professionnels et nivologues. Référence méthodologique : **Winter Journal** (Ortovox & Ben Reuters). Cible finale envisagée : **React Native** pour un usage hors ligne sur le terrain.

---

## Contexte

Il n’existe pas aujourd’hui d’application française dédiée aux retours terrain nivologiques facilement utilisable sur le terrain. Ce POC vise à démontrer l’intérêt d’une telle application auprès des financeurs publics et à valider les parcours utilisateur avant une version mobile native.

---

## Contraintes UX

- **Mobile first** : tout le design part du mobile.
- **Utilisation avec gants** : zones tactiles larges, boutons d’au moins 44–48 px, espacement généreux entre les contrôles.

---

## Écrans prévus

| Écran | Rôle |
|-------|------|
| **Carte** | Affiche les observations récentes aux coordonnées de chaque point. |
| **Saisie d’observation** | Création d’une observation avec enregistrement progressif. |
| **Consultation** | Détail et lecture d’une observation existante. |

### Formulaire de saisie (ordre logique)

1. **Lieu** — coordonnées / position  
2. **Photos**  
3. **Indices** — Avalanche, Fissure, Woumpf  
4. **Observables** — Transport, Surcharge, Humidification  
5. **Profil & tests** — CT (Compression Test), ECT (Extended Column Test)  

---

## Stack technique

| Domaine | Technologie |
|---------|-------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Langage | TypeScript |
| UI | React 19, TailwindCSS 4 |
| Tests unitaires | Vitest |
| Tests e2e | Playwright |

---

## Démarrage

### Prérequis

- Node.js 20+
- npm (ou yarn / pnpm / bun)

### Installation

```bash
npm install
```

### Lancer en développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

### Build de production

```bash
npm run build
npm start
```

### Tests

```bash
# Tests unitaires (Vitest)
npm test

# Tests e2e (Playwright)
npm run test:e2e
```

### Lint

```bash
npm run lint
```

---

## Structure du projet

- **`src/app/`** — Pages et layout Next.js (App Router)
- **`src/components/`** — Composants réutilisables
- **`e2e/`** — Scénarios Playwright
- **`.cursor/ARCHITECTURE.md`** — Architecture détaillée, flux métier et conventions

Les imports utilisent la notation racine `@/...`.

---

## Références

- [Winter Journal](https://www.ortovox.com/fr/winter-journal) — Méthodologie et vocabulaire de référence (Ortovox & Ben Reuters)
- [Next.js Documentation](https://nextjs.org/docs)

---

## Licence

Projet privé — POC à usage interne et démonstration.
