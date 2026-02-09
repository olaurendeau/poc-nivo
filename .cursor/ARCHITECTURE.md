# Architecture du projet – POC Nivologie

## 1. Contexte métier

- **Problème** : Il n’existe pas aujourd’hui d’application française dédiée aux **retours terrain nivologiques** (indices, observables, profils & tests) facilement utilisable sur le terrain par amateurs, pros et nivologues.
- **Référence méthodo & jargon** : s’inspirer du **Winter Journal** (Ortovox & Ben Reuters).
- **POC** : Ce projet Next.js est un POC très basique pour démontrer aux **financeurs publics** l’intérêt d’une telle application.
- **Cible finale** : L’application finale sera plutôt en **React Native** pour un mode hors ligne performant.

## 2. Contraintes UX / design

- **Mobile first** : tout le design part du mobile.
- **Utilisation avec gants** : prévoir une utilisation très facile avec gants — **gros boutons**, zones de touch larges, espacement suffisant.

## 3. Écrans du POC

| Écran | Rôle |
|-------|------|
| **Carte** | Affiche les observations récentes aux coordonnées de chaque observation. |
| **Saisie d’observation** | Création d’une observation, **enregistrement au fur et à mesure**. |
| **Consultation d’observation** | Détail / lecture d’une observation existante. |

### Détail de l’écran de saisie (formulaire)

Données saisies, dans l’ordre logique :

1. **Lieu** (coordonnées / position)
2. **Photos**
3. **Indices** : Avalanche, Fissure, Woumpf
4. **Observables** : Transport, Surcharge, Humidification
5. **Profil & Tests** : méthode **CT** (Compression Test) et **ECT** (Extended Column Test)

## 4. Structure des dossiers

- (à préciser au fil du setup : app/, components/, lib/, types/, etc.)

## 5. Modules / domaines métier

- Observations (création, consultation, liste/carte)
- Lieu / géolocalisation
- Indices (Avalanche, Fissure, Woumpf)
- Observables (Transport, Surcharge, Humidification)
- Profil & tests (CT, ECT)

## 6. Flux et parcours utilisateur

- Carte → voir les observations récentes → clic pour aller en consultation.
- Depuis la carte ou un menu : « Nouvelle observation » → formulaire de saisie (enregistrement progressif).
- Consultation : accès depuis la carte (marqueur) ou depuis une liste.

## 7. APIs et données

- (à préciser : stockage local / API backend, format des observations, coordonnées.)

## 8. Conventions de nommage et patterns

- (à compléter avec les choix techniques du projet.)
