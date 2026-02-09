"use client";

import type { ObservationMapItem } from "@/types/observation";
import dynamic from "next/dynamic";
import Link from "next/link";

const DynamicMap = dynamic(
  () => import("@/components/map/Map").then((m) => ({ default: m.Map })),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-500"
        aria-label="Chargement de la carte"
      >
        <span className="text-lg">Chargement de la carte…</span>
      </div>
    ),
  }
);

type HomeMapViewProps = {
  observations: ObservationMapItem[];
};

export const HomeMapView = ({ observations }: HomeMapViewProps) => {
  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <DynamicMap observations={observations} />
      </div>
      <Link
        href="/observation/new"
        className="absolute bottom-6 left-1/2 z-[1000] flex min-h-[48px] min-w-[48px] -translate-x-1/2 items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-base font-semibold text-white shadow-lg transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 active:bg-zinc-800"
        tabIndex={0}
        aria-label="Nouvelle observation"
      >
        Nouvelle observation
      </Link>
    </div>
  );
};
