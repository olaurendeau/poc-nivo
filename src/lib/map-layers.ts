/**
 * Configuration des fonds de carte et calques superposés.
 * Centralise les URLs et métadonnées pour faciliter l’ajout de nouveaux calques.
 */

/** Identifiants des fonds de carte (base). */
export const MAP_BACKGROUND_IDS = ["topo", "satellite"] as const;
export type MapBackgroundId = (typeof MAP_BACKGROUND_IDS)[number];

/** Identifiants des calques superposés. */
export const MAP_OVERLAY_IDS = ["pistes", "pentes"] as const;
export type MapOverlayId = (typeof MAP_OVERLAY_IDS)[number];

export const MAP_BACKGROUNDS: Record<
  MapBackgroundId,
  { url: string; label: string }
> = {
  topo: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    label: "Topo (OpenTopoMap)",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    label: "Satellite (ESRI)",
  },
};

/** Calques superposés : affichés au-dessus du fond, activables individuellement. */
export const MAP_OVERLAYS: Record<
  MapOverlayId,
  { url: string; label: string; attribution?: string }
> = {
  /** Pistes de ski (OpenSnowMap) */
  pistes: {
    url: "https://tiles.opensnowmap.org/pistes/{z}/{x}/{y}.png",
    label: "Pistes de ski",
    attribution: "© OpenSnowMap",
  },
  /**
   * Pentes (classes d’angle) – IGN Géoportail.
   * Nécessite NEXT_PUBLIC_IGN_API_KEY pour fonctionner.
   * WMTS : GEOGRAPHICALGRIDSYSTEMS.SLOPES
   */
  pentes: {
    url: "", // Construit dynamiquement via getPentesOverlayUrl() si clé IGN
    label: "Pentes (IGN)",
    attribution: "© IGN",
  },
};

/** Construit l’URL WMTS IGN pour le calque pentes (nécessite clé API). */
const buildPentesWmtsUrl = (apiKey: string): string =>
  `https://wxs.ign.fr/${apiKey}/geoportail/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.SLOPES&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fpng`;

/**
 * Retourne l’URL du calque pentes si la clé IGN est configurée, sinon null.
 */
export const getPentesOverlayUrl = (): string | null => {
  const key =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_IGN_API_KEY
      ? process.env.NEXT_PUBLIC_IGN_API_KEY.trim()
      : "";
  if (!key) return null;
  return buildPentesWmtsUrl(key);
};

/** Vérifie si le calque pentes est disponible (clé IGN configurée). */
export const isPentesOverlayAvailable = (): boolean =>
  Boolean(getPentesOverlayUrl());

const TILE_LAYER_STORAGE_KEY = "poc-nivo-tile-layer";
const OVERLAYS_STORAGE_KEY = "poc-nivo-map-overlays";

export const getStoredTileLayer = (): MapBackgroundId => {
  if (typeof window === "undefined") return "topo";
  try {
    const stored = localStorage.getItem(TILE_LAYER_STORAGE_KEY);
    if (stored === "topo" || stored === "satellite") return stored;
    return "topo";
  } catch {
    return "topo";
  }
};

export const getStoredOverlays = (): MapOverlayId[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(OVERLAYS_STORAGE_KEY);
    if (!stored) return [];
    const arr = JSON.parse(stored) as unknown[];
    if (!Array.isArray(arr)) return [];
    return arr.filter((id): id is MapOverlayId =>
      MAP_OVERLAY_IDS.includes(id as MapOverlayId)
    );
  } catch {
    return [];
  }
};

export const saveTileLayer = (id: MapBackgroundId): void => {
  try {
    localStorage.setItem(TILE_LAYER_STORAGE_KEY, id);
  } catch {
    // Ignore
  }
};

export const saveOverlays = (ids: MapOverlayId[]): void => {
  try {
    localStorage.setItem(OVERLAYS_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore
  }
};
