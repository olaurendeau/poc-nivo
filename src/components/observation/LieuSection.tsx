"use client";

import { getCurrentPosition } from "@/lib/geo";
import dynamic from "next/dynamic";
import { useState } from "react";

const MyLocationIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-11c-4.42 0-8 3.58-8 8 0 5.5 8 13 8 13s8-7.5 8-13c0-4.42-3.58-8-8-8z" />
  </svg>
);

const DynamicLieuMapPicker = dynamic(
  () =>
    import("@/components/observation/LieuMapPicker").then((m) => ({
      default: m.LieuMapPicker,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[200px] items-center justify-center bg-zinc-100 text-zinc-500"
        aria-label="Chargement de la carte"
      >
        Chargement de la carte…
      </div>
    ),
  }
);

export type LieuState = {
  latitude: number | null;
  longitude: number | null;
  elevation?: number | null;
  elevationLoading?: boolean;
};

type LieuSectionProps = {
  value: LieuState;
  onChange: (latitude: number, longitude: number) => void;
};

export const LieuSection = ({ value, onChange }: LieuSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUseMyPosition = () => {
    setError(null);
    setIsLoading(true);
    getCurrentPosition()
      .then((pos) => {
        onChange(pos.latitude, pos.longitude);
      })
      .catch(() => {
        setError("Impossible d'obtenir la position. Vérifiez les autorisations.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleUseMyPosition();
    }
  };

  const hasPosition = value.latitude != null && value.longitude != null;
  const position =
    hasPosition && value.latitude != null && value.longitude != null
      ? { latitude: value.latitude, longitude: value.longitude }
      : null;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-zinc-900">Lieu</h2>
      <p className="mb-2 text-sm text-zinc-600">
        Cliquez sur la carte pour choisir un point, ou utilisez le bouton pour votre position.
      </p>
      <div className="relative mb-3 overflow-hidden rounded-xl border border-zinc-200">
        <DynamicLieuMapPicker position={position} onSelect={onChange} />
        <button
          type="button"
          onClick={handleUseMyPosition}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="absolute right-2 top-2 z-[1000] flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-60"
          aria-label="Utiliser ma position actuelle"
          tabIndex={0}
        >
          {isLoading ? (
            <span className="h-6 w-6 animate-pulse rounded-full bg-zinc-400" aria-hidden />
          ) : (
            <MyLocationIcon className="h-6 w-6 text-zinc-800" aria-hidden />
          )}
        </button>
      </div>
      {hasPosition ? (
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-600" role="status">
          <span className="flex items-center gap-1.5 font-medium text-emerald-600">
            <span aria-hidden>✓</span>
            Lieu enregistré
          </span>
          <span aria-hidden className="text-zinc-400">·</span>
          <span>
            {value.latitude?.toFixed(5)}, {value.longitude?.toFixed(5)}
          </span>
          {value.elevationLoading ? (
            <>
              <span aria-hidden className="text-zinc-400">·</span>
              <span>Altitude…</span>
            </>
          ) : value.elevation != null ? (
            <>
              <span aria-hidden className="text-zinc-400">·</span>
              <span className="font-medium text-zinc-700">
                {value.elevation.toLocaleString("fr-FR")} m
              </span>
            </>
          ) : null}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
};
