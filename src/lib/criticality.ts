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

/** Message court sur la criticité (sans détail du calcul). */
export const CRITICALITY_EXPLANATION =
  "Indices d'instabilité observés sur le terrain.";

/** Nombre de jours pour perdre un palier de criticité. */
export const CRITICALITY_ATTENUATION_DAYS = 3;

type ObservationInput = {
  indices: string[];
  observables: string[];
  /** Tailles avalanche (1-5) si indice avalanche présent. Prioritaire pour la criticité. */
  avalancheTailles?: number[];
};

/**
 * Calcule le niveau de criticité (1-5) à partir des indices et observables.
 * Si avalanche avec tailles : 1-3 → Marqué (3), 4 → Fort (4), 5 → Très fort (5).
 * Sinon : indices poids 2, observables poids 1. Score 0 → 1, 1-2 → 2, 3-4 → 3, 5-6 → 4, 7+ → 5.
 */
export const computeCriticality = (input: ObservationInput): CriticalityLevel => {
  const hasAvalanche = input.indices?.includes("avalanche") ?? false;
  const tailles = input.avalancheTailles ?? [];

  if (hasAvalanche && tailles.length > 0) {
    const maxTaille = Math.max(...tailles);
    if (maxTaille <= 3) return 3; // Marqué (tailles 1, 2, 3)
    if (maxTaille === 4) return 4; // Fort
    return 5; // Très fort (taille 5)
  }

  const indicesCount = input.indices?.length ?? 0;
  const observablesCount = input.observables?.length ?? 0;
  const score = indicesCount * 2 + observablesCount;

  if (score === 0) return 1;
  if (score <= 2) return 2;
  if (score <= 4) return 3;
  if (score <= 6) return 4;
  return 5;
};

/**
 * Atténue la criticité dans le temps : -1 palier tous les 3 jours.
 * La criticité ne descend pas en dessous de 1 (Faible).
 */
export const applyCriticalityTimeAttenuation = (
  baseLevel: CriticalityLevel,
  observedAt: string | Date
): CriticalityLevel => {
  const observed = new Date(observedAt).getTime();
  const now = Date.now();
  const daysSince = (now - observed) / (24 * 60 * 60 * 1000);
  const paliers = Math.floor(daysSince / CRITICALITY_ATTENUATION_DAYS);
  const attenuated = baseLevel - paliers;
  return Math.max(1, Math.min(5, attenuated)) as CriticalityLevel;
};
