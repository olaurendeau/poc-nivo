import type { ObservationMapItem } from "@/types/observation";

/**
 * Récupère les observations récentes pour affichage sur la carte.
 * TODO: brancher sur Drizzle/Neon quand la DB sera en place.
 */
export const getObservationsForMap = async (): Promise<ObservationMapItem[]> => {
  return [];
};
