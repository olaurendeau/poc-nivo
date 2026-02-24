import Link from "next/link";
import { notFound } from "next/navigation";
import { getObservationById } from "@/lib/observations";
import type { ObservationFormData } from "@/types/observation";
import { ObservationForm } from "@/components/observation/ObservationForm";

type EditObservationPageProps = {
  params: Promise<{ id: string }>;
};

const formatDateTimeLocalFromIso = (iso: string | null | undefined): string => {
  const pad = (n: number) => String(n).padStart(2, "0");

  if (!iso) {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}`;
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}`;
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default async function EditObservationPage({
  params,
}: EditObservationPageProps) {
  const { id } = await params;
  const obs = await getObservationById(id);

  if (!obs) {
    notFound();
  }

  const observedAtLocal = formatDateTimeLocalFromIso(
    obs.observedAt ?? obs.createdAt
  );

  const initialData: ObservationFormData = {
    latitude: obs.latitude,
    longitude: obs.longitude,
    place_name: obs.placeName ?? "",
    elevation: obs.elevation,
    orientations: obs.orientations as ObservationFormData["orientations"],
    indices: obs.indices.keys as ObservationFormData["indices"],
    indiceDetails: obs.indices.details as ObservationFormData["indiceDetails"],
    observables: obs.observables as ObservationFormData["observables"],
    observableDetails: obs.observablesDetails,
    photos: obs.photos.map((p) => ({
      id: p.id,
      url: p.url,
      publicId: p.publicId,
      comment: p.comment,
    })),
    observed_at: observedAtLocal,
    comment: obs.comment ?? "",
    profileTests: obs.profileTests as ObservationFormData["profileTests"],
  };

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 p-4">
      <header className="mb-6">
        <Link
          href={`/observation/${obs.id}`}
          className="inline-flex min-h-[48px] min-w-[48px] items-center gap-2 text-zinc-600 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          tabIndex={0}
          aria-label="Retour à la fiche d'observation"
        >
          ← Retour
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
          Modifier l&apos;observation
        </h1>
      </header>
      <ObservationForm
        initialLocation={{
          latitude: obs.latitude,
          longitude: obs.longitude,
        }}
        initialData={initialData}
        observationId={obs.id}
      />
    </div>
  );
}

