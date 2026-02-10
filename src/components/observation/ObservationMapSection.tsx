"use client";

import dynamic from "next/dynamic";

const ObservationDetailMap = dynamic(
  () =>
    import("./ObservationDetailMap").then((m) => ({
      default: m.ObservationDetailMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[200px] items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-500"
        aria-label="Chargement de la carte"
      >
        Chargement de la carte…
      </div>
    ),
  }
);

type ObservationMapSectionProps = {
  latitude: number;
  longitude: number;
};

export const ObservationMapSection = ({
  latitude,
  longitude,
}: ObservationMapSectionProps) => (
  <ObservationDetailMap latitude={latitude} longitude={longitude} />
);
