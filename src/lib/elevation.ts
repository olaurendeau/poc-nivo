"use server";

const OPEN_METEO_ELEVATION_URL = "https://api.open-meteo.com/v1/elevation";

/**
 * Récupère l'altitude (m) au point (lat, lng) via Open-Meteo (Copernicus DEM 90 m).
 * Usage non commercial uniquement.
 */
export const getElevationAction = async (
  latitude: number,
  longitude: number
): Promise<{ elevation: number | null }> => {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
  });
  const url = `${OPEN_METEO_ELEVATION_URL}?${params.toString()}`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return { elevation: null };
    const data = (await res.json()) as { elevation?: number[] };
    const elevation = data.elevation?.[0] ?? null;
    return { elevation: elevation != null ? Math.round(elevation) : null };
  } catch {
    return { elevation: null };
  }
};
