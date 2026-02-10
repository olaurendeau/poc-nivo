/**
 * Résumé d'une observation pour l'affichage sur la carte (marqueurs).
 */
export type ObservationMapItem = {
  id: string;
  latitude: number;
  longitude: number;
  place_name?: string | null;
  created_at?: string;
};

/** Indices nivologiques (Winter Journal). */
export const INDICE_KEYS = ["avalanche", "fissure", "woumpf"] as const;
export type IndiceKey = (typeof INDICE_KEYS)[number];

/** Observables nivologiques (Winter Journal). */
export const OBSERVABLE_KEYS = ["transport", "surcharge", "humidification"] as const;
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
};

export const AVALANCHE_TYPE_LABELS: Record<AvalancheType, string> = {
  spontane: "Spontané",
  provoque: "Provoqué",
};

export const AVALANCHE_CASSURE_LABELS: Record<AvalancheCassure, string> = {
  lineaire: "Cassure linéaire",
  ponctuelle: "Cassure ponctuelle",
};

export const OBSERVABLE_LABELS: Record<ObservableKey, string> = {
  transport: "Transport",
  surcharge: "Surcharge",
  humidification: "Humidification",
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
};
