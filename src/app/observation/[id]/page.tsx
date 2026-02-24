import Link from "next/link";
import { notFound } from "next/navigation";
import { getObservationById } from "@/lib/observations";
import type {
  IndiceKey,
  OrientationKey,
  ObservableKey,
  ObservablesDetails,
  ObserverSkill,
} from "@/types/observation";
import {
  OBSERVABLE_LABELS,
  OBSERVER_SKILL_LABELS,
} from "@/types/observation";
import { DeleteObservationButton } from "@/components/observation/DeleteObservationButton";
import { IndicesDisplay } from "@/components/observation/IndicesDisplay";
import { ObservationMapSection } from "@/components/observation/ObservationMapSection";
import { ObservationPhotosGallery } from "@/components/observation/ObservationPhotosGallery";
import { OrientationBadges } from "@/components/observation/OrientationBadges";

const formatFreshness = (observedAt: string): string => {
  if (!observedAt) return "";
  const observed = new Date(observedAt);
  const now = new Date();
  const diffMs = now.getTime() - observed.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const observedStart = new Date(
    observed.getFullYear(),
    observed.getMonth(),
    observed.getDate()
  );

  if (diffDays < 0) return "À venir";
  if (observedStart.getTime() === todayStart.getTime()) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays >= 2 && diffDays <= 6) return `Il y a ${diffDays} jours`;
  if (diffDays >= 7 && diffDays <= 13) return "Il y a 1 semaine";
  if (diffDays >= 14 && diffDays <= 30)
    return `Il y a ${Math.floor(diffDays / 7)} semaines`;
  if (diffDays <= 60) return "Il y a 1 mois";
  if (diffDays <= 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
  return "Il y a plus d'un an";
};

const formatObservableDetail = (
  key: ObservableKey,
  details?: ObservablesDetails
): string => {
  if (!details) return "";

  if (key === "recentSnow" && details.recentSnow) {
    const parts: string[] = [];
    if (details.recentSnow.thicknessCm != null) {
      parts.push(`${details.recentSnow.thicknessCm} cm`);
    }
    if (details.recentSnow.wind) {
      parts.push("Vent");
    }
    if (details.recentSnow.warming) {
      parts.push("Hausse T°");
    }
    return parts.join(" · ");
  }

  if (key === "wetSnow" && details.wetSnow) {
    const parts: string[] = [];
    if (details.wetSnow.thicknessCm != null) {
      parts.push(`${details.wetSnow.thicknessCm} cm humides`);
    }
    if (details.wetSnow.firstWetting) {
      parts.push("1ère humidification");
    }
    if (details.wetSnow.rollersOrSluffs) {
      parts.push("Boulettes / purges");
    }
    return parts.join(" · ");
  }

  if (key === "windSnow" && details.windSnow) {
    const parts: string[] = [];
    if (details.windSnow.transportLocation === "crests") {
      parts.push("Près des crêtes");
    } else if (details.windSnow.transportLocation === "everywhere") {
      parts.push("Partout");
    }
    if (details.windSnow.surfaceIndices?.length) {
      const labels = details.windSnow.surfaceIndices.map((s) => {
        if (s === "erosions") return "Érosions";
        if (s === "accumulations") return "Accumulations";
        if (s === "cornices") return "Corniches";
        return s;
      });
      parts.push(labels.join(", "));
    }
    if (details.windSnow.accumulationAspect === "hardSnow") {
      parts.push("Neige dure");
    } else if (details.windSnow.accumulationAspect === "softSnow") {
      parts.push("Neige friable");
    }
    return parts.join(" · ");
  }

  if (key === "otherSurface" && details.otherSurface) {
    const flags = details.otherSurface;
    const labels: string[] = [];
    if (flags.lowSnow) labels.push("Manque de neige");
    if (flags.surfaceFacet) labels.push("Frisette");
    if (flags.surfaceHoar) labels.push("Givre");
    if (flags.surfaceCrust) labels.push("Croûte en surface");
    if (flags.windCrust) labels.push("Cartonnée");
    return labels.join(" · ");
  }

  return "";
};

type ObservationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ObservationPage({ params }: ObservationPageProps) {
  const { id } = await params;
  const obs = await getObservationById(id);

  if (!obs) {
    notFound();
  }

  const observedAt = obs.observedAt ?? obs.createdAt;
  const formattedDate = observedAt
    ? new Date(observedAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const freshness = formatFreshness(observedAt);

  const avalancheDetails = obs.indices.details?.avalanche as
    | { type?: string; cassure?: string; tailles?: number[]; declenchementARemote?: boolean }
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
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
          {obs.placeName
            ? `${obs.placeName} — ${freshness}`
            : `Observation — ${freshness}`}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{formattedDate}</p>
        {(() => {
          const observerSkillLabel = obs.observerSkill
            ? OBSERVER_SKILL_LABELS[
                obs.observerSkill as ObserverSkill
              ] ?? null
            : null;
          const observerParts = [
            obs.observerName ? obs.observerName.trim() : null,
            observerSkillLabel,
          ].filter((part): part is string => !!part);
          if (observerParts.length === 0) {
            return null;
          }
          return (
            <p className="mt-1 text-xs text-zinc-500">
              Observateur : {observerParts.join(" · ")}
            </p>
          );
        })()}
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
            <ul className="flex flex-col gap-2">
              {obs.observables.map((o) => {
                const key = o as ObservableKey;
                const summary = formatObservableDetail(
                  key,
                  obs.observablesDetails
                );
                const label =
                  OBSERVABLE_LABELS[key as keyof typeof OBSERVABLE_LABELS] ??
                  key;

                return (
                  <li key={o}>
                    <div className="rounded-xl bg-zinc-50 px-4 py-3">
                      <p className="text-sm font-semibold text-zinc-900">
                        {label}
                      </p>
                      {summary ? (
                        <p className="mt-0.5 text-xs text-zinc-600">
                          {summary}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {(obs.profileTests.profileImage ||
          obs.profileTests.stabilityTests.length > 0) ? (
          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              Profils &amp; tests
            </h2>
            {obs.profileTests.profileImage ? (
              <div className="mb-4 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                <img
                  src={obs.profileTests.profileImage.url}
                  alt="Profil de neige"
                  className="w-full object-contain"
                />
              </div>
            ) : null}
            {obs.profileTests.stabilityTests.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {[...obs.profileTests.stabilityTests]
                  .sort((a, b) => a.depthCm - b.depthCm)
                  .map((t, i) => (
                    <li
                      key={`${t.type}-${t.score}-${t.depthCm}-${i}`}
                      className="rounded-xl bg-zinc-50 px-4 py-3 text-sm font-medium tracking-wide text-zinc-800"
                    >
                      {t.type === "PST"
                        ? `${t.type} ${t.score}`
                        : `${t.type}${t.score}`}
                      @{t.depthCm}cm
                    </li>
                  ))}
              </ul>
            ) : null}
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={`/observation/${obs.id}/edit`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
              tabIndex={0}
              aria-label="Modifier cette observation"
            >
              Modifier l&apos;observation
            </Link>
            <DeleteObservationButton observationId={obs.id} />
          </div>
        </section>
      </div>
    </div>
  );
}
