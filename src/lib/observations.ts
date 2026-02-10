import { desc, eq } from "drizzle-orm";
import { computeCriticality, type CriticalityLevel } from "@/lib/criticality";
import type { ObservationMapItem } from "@/types/observation";
import { db } from "@/lib/db";
import { observationsTable } from "@/lib/db/schema";

const LIMIT_RECENT = 100;

/**
 * Récupère les observations récentes pour affichage sur la carte.
 */
export const getObservationsForMap =
  async (): Promise<ObservationMapItem[]> => {
    const rows = await db
      .select({
        id: observationsTable.id,
        latitude: observationsTable.latitude,
        longitude: observationsTable.longitude,
        placeName: observationsTable.placeName,
        createdAt: observationsTable.createdAt,
        elevation: observationsTable.elevation,
        orientations: observationsTable.orientations,
        indices: observationsTable.indices,
        observables: observationsTable.observables,
      })
      .from(observationsTable)
      .orderBy(desc(observationsTable.createdAt))
      .limit(LIMIT_RECENT);

    return rows.map((r) => {
      const indices = (r.indices as { keys?: string[] } | null)?.keys ?? [];
      const observables = (r.observables as string[] | null) ?? [];
      const criticality_level = computeCriticality({ indices, observables });
      return {
        id: r.id,
        latitude: r.latitude,
        longitude: r.longitude,
        place_name: r.placeName ?? undefined,
        created_at: r.createdAt?.toISOString(),
        criticality_level,
        elevation: r.elevation ?? undefined,
        orientations: (r.orientations as string[] | null) ?? undefined,
      };
    });
  };

export type ObservationDetail = {
  id: string;
  latitude: number;
  longitude: number;
  placeName: string | null;
  elevation: number | null;
  orientations: string[];
  indices: { keys: string[]; details?: { avalanche?: unknown } };
  observables: string[];
  photos: { id: string; url: string; publicId: string; comment: string }[];
  createdAt: string;
  updatedAt: string;
  criticality_level: CriticalityLevel;
};

/**
 * Récupère une observation par son id.
 */
export const getObservationById = async (
  id: string
): Promise<ObservationDetail | null> => {
  const [row] = await db
    .select()
    .from(observationsTable)
    .where(eq(observationsTable.id, id))
    .limit(1);

  if (!row) return null;

  const rawPhotos = (row.photos ?? []) as {
    url: string;
    publicId: string;
    comment?: string;
  }[];

  const indices = (row.indices ?? { keys: [] }) as { keys: string[] };
  const observables = (row.observables ?? []) as string[];
  const criticality_level = computeCriticality({
    indices: indices.keys,
    observables,
  });

  return {
    id: row.id,
    latitude: row.latitude,
    longitude: row.longitude,
    placeName: row.placeName,
    elevation: row.elevation,
    orientations: (row.orientations ?? []) as string[],
    indices: (row.indices ?? { keys: [] }) as {
      keys: string[];
      details?: { avalanche?: unknown };
    },
    observables: (row.observables ?? []) as string[],
    photos: rawPhotos.map((p) => ({
      id: p.publicId,
      url: p.url,
      publicId: p.publicId,
      comment: p.comment ?? "",
    })),
    createdAt: row.createdAt?.toISOString() ?? "",
    updatedAt: row.updatedAt?.toISOString() ?? "",
    criticality_level,
  };
};
