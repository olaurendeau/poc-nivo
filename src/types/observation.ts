/** Indices nivologiques (Winter Journal). */
export const INDICE_KEYS = ["avalanche", "fissure", "woumpf"] as const;

/**
 * Résumé d'une observation pour l'affichage sur la carte (marqueurs).
 */
export type ObservationMapItem = {
  id: string;
  latitude: number;
  longitude: number;
  place_name?: string | null;
  /** Date de l'observation terrain (prioritaire pour le tri des marqueurs). */
  observed_at?: string;
  created_at?: string;
  elevation?: number | null;
  orientations?: string[];
  indices?: string[];
  observables?: string[];
  /** Indique si au moins une photo est associée à l'observation. */
  has_photos?: boolean;
  /** Nombre de photos associées à l'observation (optionnel). */
  photos_count?: number;
  /** Résultats des tests CT / ECT pour la popup */
  profile_tests?: {
    stabilityTests?: Array<{ type: string; score: string; depthCm: number }>;
  };
  /** Nom / pseudo de l'observateur. */
  observer_name?: string | null;
  /** Compétence de l'observateur. */
  observer_skill?: ObserverSkill | null;
};

export type IndiceKey = (typeof INDICE_KEYS)[number];

/** Observables nivologiques (Winter Journal). */
export const OBSERVABLE_KEYS = [
  "recentSnow",
  "wetSnow",
  "windSnow",
  "otherSurface",
] as const;
export type ObservableKey = (typeof OBSERVABLE_KEYS)[number];

/** Libellés pour l'UI. */
export const INDICE_LABELS: Record<IndiceKey, string> = {
  avalanche: "Avalanche récente",
  fissure: "Fissures qui propagent",
  woumpf: "Woumpf",
};

/** Détails optionnels pour l'indice Avalanche. */
export type AvalancheType = "spontane" | "provoque";
export type AvalancheCassure = "lineaire" | "ponctuelle";
export type AvalancheTaille = 1 | 2 | 3 | 4 | 5;

export type AvalancheDetails = {
  type?: AvalancheType;
  cassure?: AvalancheCassure;
  tailles?: AvalancheTaille[];
  /** Déclenchement à distance (avalanche déclenchée depuis une zone éloignée). */
  declenchementARemote?: boolean;
};

export const AVALANCHE_TYPE_LABELS: Record<AvalancheType, string> = {
  spontane: "Spontané",
  provoque: "Provoqué",
};

export const AVALANCHE_CASSURE_LABELS: Record<AvalancheCassure, string> = {
  lineaire: "Cassure linéaire",
  ponctuelle: "Cassure ponctuelle",
};

export const AVALANCHE_TAILLE_LABELS: Record<AvalancheTaille, string> = {
  1: "Petite avalanche",
  2: "Avalanche moyenne",
  3: "Grande avalanche",
  4: "Très grande avalanche",
  5: "Extrêmement grande avalanche",
};

export const OBSERVABLE_LABELS: Record<ObservableKey, string> = {
  recentSnow: "Neige récente",
  wetSnow: "Neige humide",
  windSnow: "Neige ventée",
  otherSurface: "Autres observations de surface",
};

/** Détails – Neige récente. */
export type RecentSnowDetails = {
  /** Épaisseur de neige récente en cm. */
  thicknessCm?: number;
  /** Présence de vent pendant ou après la chute. */
  wind?: boolean | null;
  /** Hausse marquée des températures. */
  warming?: boolean | null;
};

/** Détails – Neige humide. */
export type WetSnowDetails = {
  /** Épaisseur de la couche de neige humide en cm. */
  thicknessCm?: number;
  /** Première humidification de la saison / du manteau. */
  firstWetting?: boolean | null;
  /** Présence de boulettes ou purges. */
  rollersOrSluffs?: boolean | null;
};

/** Transport de neige ventée – localisation. */
export type WindSnowTransportLocation = "crests" | "everywhere";

/** Indices de surface pour neige ventée. */
export type WindSnowSurfaceIndex =
  | "erosions"
  | "accumulations"
  | "cornices";

/** Aspect des zones d'accumulation pour neige ventée. */
export type WindSnowAccumulationAspect = "hardSnow" | "softSnow";

/** Détails – Neige ventée. */
export type WindSnowDetails = {
  transportLocation?: WindSnowTransportLocation;
  surfaceIndices?: WindSnowSurfaceIndex[];
  accumulationAspect?: WindSnowAccumulationAspect;
};

/** Drapeaux pour autres observations de surface. */
export type OtherSurfaceFlags = {
  lowSnow?: boolean;
  surfaceFacet?: boolean;
  surfaceHoar?: boolean;
  surfaceCrust?: boolean;
  windCrust?: boolean;
};

/** Détails complets pour les observables. */
export type ObservablesDetails = {
  recentSnow?: RecentSnowDetails;
  wetSnow?: WetSnowDetails;
  windSnow?: WindSnowDetails;
  otherSurface?: OtherSurfaceFlags;
};

/** Orientations / expositions (rosace, 8 directions). */
export const ORIENTATION_KEYS = [
  "N",
  "NE",
  "E",
  "SE",
  "S",
  "SO",
  "O",
  "NO",
] as const;
export type OrientationKey = (typeof ORIENTATION_KEYS)[number];

export const ORIENTATION_LABELS: Record<OrientationKey, string> = {
  N: "Nord",
  NE: "Nord-Est",
  E: "Est",
  SE: "Sud-Est",
  S: "Sud",
  SO: "Sud-Ouest",
  O: "Ouest",
  NO: "Nord-Ouest",
};

/** Photo pour le formulaire (avant enregistrement). */
export type ObservationFormPhoto = {
  id: string;
  url: string;
  publicId: string;
  comment: string;
};

/** Type de test de stabilité (Winter Journal / avalanche.ca / SLF). */
export type StabilityTestType = "CT" | "ECT" | "RB" | "PST";

/** Résultats CT (caractère de rupture) – avalanche.ca */
export const CT_RESULT_OPTIONS = [
  {
    value: "SC",
    label: "SC – Rupture soudaine avec effondrement",
    description:
      "La rupture traverse la colonne en un chargement ET la couche s’effondre nettement.",
  },
  {
    value: "SP",
    label: "SP – Rupture plane soudaine",
    description:
      "Une rupture plane mince traverse la colonne en un chargement ET le bloc glisse facilement.",
  },
  {
    value: "RP",
    label: "RP – Rupture plane résistante",
    description:
      "Rupture plane nécessitant plusieurs coups pour glisser, ou le bloc ne glisse pas facilement.",
  },
  {
    value: "PC",
    label: "PC – Compression progressive",
    description: "La couche fragile s’affaisse sur une série de coups.",
  },
  {
    value: "B",
    label: "B – Break (cassure non plane)",
    description: "Rupture irrégulière, non plane (abréviation courante).",
  },
] as const;

/** Résultats ECT – avalanche.ca */
export const ECT_RESULT_OPTIONS = [
  {
    value: "P",
    label: "P – Propagation",
    description:
      "La rupture se propage sur toute la colonne au coup indiqué (ex. ECTP8 = coup 8).",
  },
  {
    value: "N",
    label: "N – Pas de propagation",
    description:
      "Rupture observée au coup indiqué mais ne se propage pas sur toute la colonne (ex. ECTN25).",
  },
  {
    value: "X",
    label: "X – Aucune rupture",
    description: "Aucune rupture observée pendant le test.",
  },
] as const;

/** Résultats Rutschblock (RB) – échelle 1 à 7, SLF */
export const RB_RESULT_OPTIONS = [
  { value: "1", label: "RB 1", description: "Le bloc glisse lors du dégagement ou avant isolation complète." },
  { value: "2", label: "RB 2", description: "Rupture quand le testeur monte sur la partie supérieure du bloc." },
  { value: "3", label: "RB 3", description: "Rupture avec compression genoux fléchis." },
  { value: "4", label: "RB 4", description: "Rupture au premier saut." },
  { value: "5", label: "RB 5", description: "Rupture au deuxième saut." },
  { value: "6", label: "RB 6", description: "Rupture après avoir enlevé les skis et sauté (plaques épaisses) ou sur sol mou." },
  { value: "7", label: "RB 7", description: "Aucune rupture plane nette (bloc stable)." },
] as const;

/** Résultats PST (Propagation Saw Test) – avalanche.ca / SLF */
export const PST_RESULT_OPTIONS = [
  {
    value: "End",
    label: "End – Propagation complète",
    description: "La rupture se propage jusqu'à l'extrémité de la colonne (propagation complète).",
  },
  {
    value: "Stop",
    label: "Stop – Arrêt de propagation",
    description: "La rupture s'arrête sans atteindre l'extrémité de la colonne.",
  },
  {
    value: "No",
    label: "No – Aucune propagation",
    description: "Aucune rupture ou propagation observée.",
  },
] as const;

/** Résultat d'un test CT, ECT, RB ou PST. Exemples : CT6SC@40cm, ECTP8@40cm, RB4@55cm, PST End@40cm */
export type StabilityTestResult = {
  /** CT = Compression Test, ECT = Extended Column Test */
  type: StabilityTestType;
  /**
   * Score : CT = "6SC" (6 taps, Sudden Collapse), "14B", "CTV", etc.
   * ECT = "P8" (propagation tap 8), "N25", "PV", "X"
   */
  score: string;
  /** Profondeur de la couche testée en cm */
  depthCm: number;
};

/** Image du profil de neige (Cloudinary). */
export type ProfileImageJson = {
  url: string;
  publicId: string;
};

/** Bloc profil de neige et tests (plusieurs résultats par coupe). */
export type ProfileTestsJson = {
  /** Hauteur totale du manteau en cm (optionnel) */
  totalHeightCm?: number;
  /** Image du profil de neige (schéma, photo de coupe, etc.) */
  profileImage?: ProfileImageJson;
  /** Résultats des tests CT, ECT, RB, PST */
  stabilityTests: StabilityTestResult[];
};

/** Niveau de compétence de l'observateur. */
export type ObserverSkill = "amateur" | "pro" | "obsNivo";

export const OBSERVER_SKILL_LABELS: Record<ObserverSkill, string> = {
  amateur: "Amateur",
  pro: "Professionnel",
  obsNivo: "Observateur nivologique",
};

/** Données de saisie d'une observation (formulaire). */
export type ObservationFormData = {
  latitude: number | null;
  longitude: number | null;
  place_name: string;
  elevation: number | null;
  orientations: OrientationKey[];
  indices: IndiceKey[];
  indiceDetails?: { avalanche?: AvalancheDetails };
  observables: ObservableKey[];
  observableDetails?: ObservablesDetails;
  photos: ObservationFormPhoto[];
  /** Date/heure de l'observation (format datetime-local: YYYY-MM-DDTHH:mm). */
  observed_at: string;
  /** Commentaire optionnel pour contextualiser l'observation. */
  comment?: string;
  /** Profils de neige et résultats CT / ECT */
  profileTests?: ProfileTestsJson;
  /** Nom ou pseudo de l'observateur. */
  observerName?: string;
  /** Compétence / profil de l'observateur. */
  observerSkill?: ObserverSkill | null;
};
