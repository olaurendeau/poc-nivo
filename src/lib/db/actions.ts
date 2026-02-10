"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type {
  AvalancheDetails,
  IndiceKey,
  ObservableKey,
  ObservationFormData,
  ObservationFormPhoto,
  OrientationKey,
} from "@/types/observation";
import { db } from "@/lib/db";
import { observationsTable } from "@/lib/db/schema";

type SaveObservationResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const toDbPhotos = (photos: ObservationFormPhoto[]) =>
  photos.map(({ url, publicId, comment }) => ({
    url,
    publicId,
    comment: comment || undefined,
  }));

export const saveObservationAction = async (
  data: ObservationFormData
): Promise<SaveObservationResult> => {
  if (data.latitude == null || data.longitude == null) {
    return { ok: false, error: "Coordonnées obligatoires" };
  }

  try {
    const observedAt = data.observed_at
      ? new Date(data.observed_at)
      : new Date();

    const [row] = await db
      .insert(observationsTable)
      .values({
        latitude: data.latitude,
        longitude: data.longitude,
        placeName: data.place_name || null,
        elevation: data.elevation ?? null,
        orientations: data.orientations ?? [],
        indices: {
          keys: data.indices ?? [],
          details: data.indiceDetails,
        },
        observables: data.observables ?? [],
        photos: toDbPhotos(data.photos ?? []),
        createdAt: observedAt,
      })
      .returning({ id: observationsTable.id });

    if (!row?.id) {
      return { ok: false, error: "Échec de l'enregistrement" };
    }

    revalidatePath("/");
    return { ok: true, id: row.id };
  } catch (err) {
    console.error("saveObservationAction error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur serveur",
    };
  }
};

type DeleteObservationResult =
  | { ok: true }
  | { ok: false; error: string };

export const deleteObservationAction = async (
  id: string
): Promise<DeleteObservationResult> => {
  try {
    const result = await db
      .delete(observationsTable)
      .where(eq(observationsTable.id, id))
      .returning({ id: observationsTable.id });

    if (!result.length) {
      return { ok: false, error: "Observation introuvable" };
    }

    revalidatePath("/");
    redirect("/");
  } catch (err) {
    console.error("deleteObservationAction error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur serveur",
    };
  }
};
