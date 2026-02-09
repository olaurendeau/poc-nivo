# Architecture du projet – POC Nivologie

## 1. Contexte métier

- **Problème** : Il n’existe pas aujourd’hui d’application française dédiée aux **retours terrain nivologiques** (indices, observables, profils & tests) facilement utilisable sur le terrain par amateurs, pros et nivologues.
- **Référence méthodo & jargon** : s’inspirer du **Winter Journal** (Ortovox & Ben Reuters).
- **POC** : Ce projet Next.js est un POC très basique pour démontrer aux **financeurs publics** l’intérêt d’une telle application.
- **Cible finale** : L’application finale sera plutôt en **React Native** pour un mode hors ligne performant.

## 2. Contraintes UX / design

- **Mobile first** : tout le design part du mobile.
- **Utilisation avec gants** : prévoir une utilisation très facile avec gants — **gros boutons**, zones de touch larges, espacement suffisant.
- **Saisie du lieu** : doit être **hyper facile** — privilégier un tap (ex. « Utiliser ma position ») plutôt qu’une saisie manuelle (voir § 3).

## 3. Écrans du POC

| Écran | Rôle |
|-------|------|
| **Home / Carte** | Carte plein écran sur mobile, affiche les observations récentes aux coordonnées de chaque observation. |
| **Saisie d’observation** | Création d’une observation, **enregistrement au fur et à mesure**. |
| **Consultation d’observation** | Détail / lecture d’une observation existante. |

### Détail de l’écran de saisie (formulaire)

Données saisies, dans l’ordre logique :

1. **Lieu** (coordonnées / position) — voir § 3.1 ci‑dessous
2. **Photos**
3. **Indices (possible multiples)** : Avalanche, Fissure, Woumpf
4. **Observables (possible multiples)** : Transport, Surcharge, Humidification
5. **Profil & Tests** : méthode **CT** (Compression Test) et **ECT** (Extended Column Test)

### 3.1 UX saisie du lieu (priorité)

- **Un tap = position enregistrée** : bouton principal type « Utiliser ma position » qui appelle `navigator.geolocation.getCurrentPosition` et enregistre lat/lng (Server Action). Pas de saisie manuelle de coordonnées sur le terrain.
- **Création immédiate** : optionnel — dès l’arrivée sur l’écran, proposer d’enregistrer la position actuelle en un tap, puis afficher « Lieu enregistré ✓ » et passer aux photos / indices.
- **Ajustement optionnel** : si besoin, une mini‑carte avec marqueur déplaçable pour affiner le point (surtout en desktop ou pour correction).
- **Gros bouton** : le CTA « Ma position » doit être très visible et tactile (zone ≥ 48px).

## 4. Structure des dossiers (proposition)

```
src/
├── app/
│   ├── (routes)
│   │   ├── page.tsx                 # Carte (home)
│   │   ├── observation/
│   │   │   ├── new/page.tsx         # Saisie
│   │   │   └── [id]/page.tsx        # Consultation
│   │   └── api/                     # Route handlers si besoin
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── map/                         # Carte + marqueurs
│   ├── observation/                 # Formulaire, cartes de consultation
│   └── ui/                          # Boutons, champs (touch-friendly)
├── lib/
│   ├── db/                          # Client DB, schéma, requêtes
│   ├── observations.ts              # Logique métier observations
│   └── geo.ts                       # Géoloc / coordonnées
├── types/
│   └── observation.ts               # Types Observation, Indices, etc.
└── ...
```

## 5. Modèle de données (validé : JSON pour indices/observables/tests)

- **Table principale `observations`**  
  - `id`, `created_at`, `updated_at`  
  - `latitude`, `longitude` (obligatoire pour affichage carte)  
  - Optionnel : `place_name`, `elevation`  
  - Indices, observables, profil/tests : soit **colonnes JSON** (POC simple), soit **tables liées** (plus propre si on prévoit filtres/requêtes).

- **Indices** (par observation) : Avalanche (oui/non + détail), Fissure (idem), Woumpf (idem).  
  → Structure type : `{ avalanche?: {...}, fissure?: {...}, woumpf?: {...} }`.

- **Observables** : Transport, Surcharge, Humidification — chaque élément avec type/valeur/commentaire selon le jargon Winter Journal.

- **Profil & tests** : blocs CT / ECT (résultats, profondeur, etc.).  
  → Un bloc JSON par observation ou table `observation_tests` avec type (CT | ECT).

- **Photos** : Neon ne stocke pas les fichiers.  
  → Stockage **Cloudinary**. Table ou colonne `observation_photos` : `observation_id`, `url` (ou `public_id` Cloudinary).

## 6. Choix techniques (validés)

| Sujet | Choix |
|-------|--------|
| **ORM / DB** | **Drizzle** + Neon PostgreSQL |
| **Carte** | **OpenTopoMap** (fond topo). Leaflet ou MapLibre pour le rendu. |
| **Photos** | **Cloudinary** (upload Server Action, URL en DB) |
| **Auth** | **Aucune** — soumissions anonymes |
| **Sauvegarde progressive** | **Server Actions** par section ; **lieu** : UX « un tap = ma position » (§ 3.1) |
| **Indices / Observables / Tests** | **JSON** dans la table `observations` pour le POC |

## 7. APIs et données

- **DB** : Neon PostgreSQL, accès depuis le serveur Next uniquement (pas d’exposition directe).
- **Lecture** : Server Components pour la carte et la consultation ; chargement des observations récentes (avec coordonnées) pour les marqueurs.
- **Écriture** : Server Actions pour créer/mettre à jour une observation (création dès la saisie du lieu, puis PATCH par blocs).
- **Photos** : upload via Server Action → **Cloudinary** → enregistrement de l’URL (ou `public_id`) en DB.

## 8. Flux et parcours utilisateur

- **Carte** → observations récentes en marqueurs → clic marqueur → navigation vers `/observation/[id]`.
- **Nouvelle observation** → bouton depuis la carte (ou header) → `/observation/new` → formulaire multi-étapes, enregistrement progressif.
- **Consultation** → `/observation/[id]` (depuis la carte ou lien direct).

## 9. Conventions de nommage et patterns

- **Routes** : `app/` App Router ; pas de `pages/`.
- **Composants** : PascalCase ; un composant par fichier dans `components/`.
- **Server Actions** : dans `lib/` ou colocalisées dans le module concerné ; nom en `action...` ou suffixe `Action`.
- **Types** : dans `types/`, réexportés si besoin depuis `lib/`.
- **Env** : `DATABASE_URL` (Neon) ; `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (ou variables fournies par le SDK Cloudinary) pour les photos.
