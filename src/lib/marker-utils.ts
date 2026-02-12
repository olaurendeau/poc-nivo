/**
 * Utilitaires pour l'affichage des marqueurs carte.
 */

/** Tranche la plus proche arrondie à 100 m (ex: 2134 → "2100"). */
export const getElevationRoundedLabel = (
  elevation: number | null | undefined
): string | null => {
  if (elevation == null) return null;
  const rounded = Math.round(elevation / 100) * 100;
  return String(rounded);
};

/** Angle en degrés pour chaque orientation (N = haut, sens horaire). */
export const ORIENTATION_ANGLES: Record<string, number> = {
  N: -90,
  NE: -45,
  E: 0,
  SE: 45,
  S: 90,
  SO: 135,
  O: 180,
  NO: -135,
};

/** Date/heure formatée pour le popup (ex: "Aujourd'hui 14h", "12 fév. 9h"). */
export const formatObservedAt = (
  observedAt: string | null | undefined
): string => {
  if (!observedAt) return "";
  const d = new Date(observedAt);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000)
  );

  const timeStr = d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffDays === 0) return `Aujourd'hui ${timeStr}`;
  if (diffDays === 1) return `Hier ${timeStr}`;
  return `${d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  })} ${timeStr}`;
};

/** Fraîcheur relative (ex: "2h", "3j", "1sem"). */
export const getFreshnessLabel = (
  createdAt: string | null | undefined
): string => {
  if (!createdAt) return "";
  const then = new Date(createdAt).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffJ = Math.floor(diffMs / 86400000);
  const diffSem = Math.floor(diffMs / 604800000);

  if (diffMin < 1) return "<1min";
  if (diffMin < 60) return `${diffMin}min`;
  if (diffH < 24) return `${diffH}h`;
  if (diffJ < 7) return `${diffJ}j`;
  if (diffSem < 4) return `${diffSem}sem`;
  return `${Math.floor(diffJ / 30)}m`;
};
