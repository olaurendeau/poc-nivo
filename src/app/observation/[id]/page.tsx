import Link from "next/link";
import { notFound } from "next/navigation";
import { getObservationById } from "@/lib/observations";
import type { IndiceKey, OrientationKey } from "@/types/observation";
import { OBSERVABLE_LABELS } from "@/types/observation";
import { DeleteObservationButton } from "@/components/observation/DeleteObservationButton";
import { IndicesDisplay } from "@/components/observation/IndicesDisplay";
import { ObservationMapSection } from "@/components/observation/ObservationMapSection";
import { ObservationPhotosGallery } from "@/components/observation/ObservationPhotosGallery";
import { OrientationBadges } from "@/components/observation/OrientationBadges";
import { CRITICALITY_EXPLANATION } from "@/lib/criticality";
import { RiskBadge } from "@/components/observation/RiskBadge";

type ObservationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ObservationPage({ params }: ObservationPageProps) {
  const { id } = await params;
  const obs = await getObservationById(id);

  if (!obs) {
    notFound();
  }

  const formattedDate = obs.createdAt
    ? new Date(obs.createdAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const avalancheDetails = obs.indices.details?.avalanche as
    | { type?: string; cassure?: string; tailles?: number[] }
    | undefined;

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 p-4 pb-8">
      <header className="mb-6">
        <Link
          href="/"
          className="inline-flex min-h-[48px] min-w-[48px] items-center gap-2 text-zinc-600 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          tabIndex={0}
          aria-label="Retour à la carte"
        >
          ← Retour
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-zinc-900">
            {obs.placeName ?? `Observation du ${formattedDate}`}
          </h1>
          <RiskBadge level={obs.criticality_level} />
        </div>
        <p className="mt-1 text-sm text-zinc-500">{formattedDate}</p>
        <p className="mt-2 text-xs text-zinc-500">
          {CRITICALITY_EXPLANATION}
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-zinc-900">
            Localisation
          </h2>
          <ObservationMapSection
            latitude={obs.latitude}
            longitude={obs.longitude}
          />
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-700">
            <span>
              {obs.latitude.toFixed(5)}° N, {obs.longitude.toFixed(5)}° E
            </span>
            {obs.elevation != null ? (
              <>
                <span className="text-zinc-400">·</span>
                <span>Altitude {obs.elevation.toLocaleString("fr-FR")} m</span>
              </>
            ) : null}
          </div>
        </section>

        {obs.orientations.length > 0 ? (
          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              Orientations
            </h2>
            <OrientationBadges
              orientations={obs.orientations as OrientationKey[]}
            />
          </section>
        ) : null}

        {obs.indices.keys.length > 0 ? (
          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              Indices nivologiques
            </h2>
            <IndicesDisplay
              indices={obs.indices.keys as IndiceKey[]}
              avalancheDetails={avalancheDetails}
            />
          </section>
        ) : null}

        {obs.observables.length > 0 ? (
          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              Observables
            </h2>
            <ul className="flex flex-wrap gap-2">
              {obs.observables.map((o) => (
                <li key={o}>
                  <span className="inline-flex items-center rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-800">
                    {OBSERVABLE_LABELS[o as keyof typeof OBSERVABLE_LABELS] ??
                      o}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {obs.photos.length > 0 ? (
          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              Photos
            </h2>
            <ObservationPhotosGallery photos={obs.photos} />
          </section>
        ) : null}

        {obs.comment ? (
          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              Commentaire
            </h2>
            <p className="whitespace-pre-wrap text-sm text-zinc-700">
              {obs.comment}
            </p>
          </section>
        ) : null}

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900">
            Actions
          </h2>
          <DeleteObservationButton observationId={obs.id} />
        </section>
      </div>
    </div>
  );
}
