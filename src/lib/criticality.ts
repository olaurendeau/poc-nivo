/**
 * Échelle de criticité inspirée du BERA (Bulletin d'Estimation du Risque d'Avalanche).
 * Algorithme basique : indices + observables → niveau 1-5.
 * À faire évoluer (poids par type, profil neige, etc.).
 */

export const CRITICALITY_LEVELS = [1, 2, 3, 4, 5] as const;
export type CriticalityLevel = (typeof CRITICALITY_LEVELS)[number];

export const CRITICALITY_LABELS: Record<CriticalityLevel, string> = {
  1: "Faible",
  2: "Limité",
  3: "Marqué",
  4: "Fort",
  5: "Très fort",
};

/** Couleurs BERA standard (fond + texte). */
export const CRITICALITY_COLORS: Record<
  CriticalityLevel,
  { bg: string; text: string; border: string }
> = {
  1: { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300" },
  2: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300" },
  3: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
  4: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  5: { bg: "bg-red-200", text: "text-red-900", border: "border-red-500" },
};

/** Couleurs pour les marqueurs carte (hex, style BERA). */
export const CRITICALITY_MARKER_COLORS: Record<CriticalityLevel, string> = {
  1: "#10b981",
  2: "#eab308",
  3: "#f97316",
  4: "#ef4444",
  5: "#b91c1c",
};

export const CRITICALITY_EXPLANATION =
  "Cette criticité reflète la typicité de la présence des indices d'instabilité (avalanches, fissures, woumpfs, observables) observés sur le terrain.";

type ObservationInput = {
  indices: string[];
  observables: string[];
};

/**
 * Calcule le niveau de criticité (1-5) à partir des indices et observables.
 * Algo basique : indices ont un poids 2, observables poids 1.
 * Score 0 → 1, 1-2 → 2, 3-4 → 3, 5-6 → 4, 7+ → 5.
 */
export const computeCriticality = (input: ObservationInput): CriticalityLevel => {
  const indicesCount = input.indices?.length ?? 0;
  const observablesCount = input.observables?.length ?? 0;
  const score = indicesCount * 2 + observablesCount;

  if (score === 0) return 1;
  if (score <= 2) return 2;
  if (score <= 4) return 3;
  if (score <= 6) return 4;
  return 5;
};
