"use client";

import type { ObservationMapItem } from "@/types/observation";
import type { CriticalityLevel } from "@/lib/criticality";
import { CRITICALITY_LABELS } from "@/lib/criticality";
import { getCurrentPosition } from "@/lib/geo";
import { RangeSlider } from "@/components/ui/RangeSlider";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MARKER_SCALE_MIN = 0.5;
const MARKER_SCALE_MAX = 2;
const MARKER_SCALE_DEFAULT = 1;
const STORAGE_KEY = "poc-nivo-marker-scale";

const getStoredMarkerScale = (): number => {
  if (typeof window === "undefined") return MARKER_SCALE_DEFAULT;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored == null) return MARKER_SCALE_DEFAULT;
    const value = Number.parseFloat(stored);
    if (Number.isNaN(value)) return MARKER_SCALE_DEFAULT;
    return Math.max(
      MARKER_SCALE_MIN,
      Math.min(MARKER_SCALE_MAX, value)
    );
  } catch {
    return MARKER_SCALE_DEFAULT;
  }
};

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

const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const FilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

type HomeMapViewProps = {
  observations: ObservationMapItem[];
};

const FRESHNESS_VALUES_MS = [
  0,
  24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
  30 * 24 * 60 * 60 * 1000,
  Infinity,
] as const;
const FRESHNESS_LABELS = ["—", "24h", "7j", "1 mois", "Tout"] as const;

export const HomeMapView = ({ observations }: HomeMapViewProps) => {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [markerScale, setMarkerScale] = useState(MARKER_SCALE_DEFAULT);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterRiskMin, setFilterRiskMin] = useState<CriticalityLevel>(1);
  const [filterRiskMax, setFilterRiskMax] = useState<CriticalityLevel>(5);
  const [filterFreshnessMinIndex, setFilterFreshnessMinIndex] = useState(0);
  const [filterFreshnessMaxIndex, setFilterFreshnessMaxIndex] = useState(4);
  const [longPressLocation, setLongPressLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  const handleMarkerScaleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      setMarkerScale(value);
      try {
        localStorage.setItem(STORAGE_KEY, String(value));
      } catch {
        // Ignore localStorage errors (private mode, quota, etc.)
      }
    },
    []
  );

  const handleToggleSettings = useCallback(() => {
    setIsFilterOpen(false);
    setIsSettingsOpen((prev) => !prev);
  }, []);

  const handleToggleFilter = useCallback(() => {
    setIsSettingsOpen(false);
    setIsFilterOpen((prev) => !prev);
  }, []);

  const handleFilterRiskChange = useCallback((low: number, high: number) => {
    setFilterRiskMin(low as CriticalityLevel);
    setFilterRiskMax(high as CriticalityLevel);
  }, []);

  const handleFilterFreshnessChange = useCallback((low: number, high: number) => {
    setFilterFreshnessMinIndex(low);
    setFilterFreshnessMaxIndex(high);
  }, []);

  const filteredObservations = useMemo(() => {
    const minAgeMs = FRESHNESS_VALUES_MS[filterFreshnessMinIndex] ?? 0;
    const maxAgeMs = FRESHNESS_VALUES_MS[filterFreshnessMaxIndex] ?? Infinity;
    return observations.filter((obs) => {
      const withinRisk =
        obs.criticality_level >= filterRiskMin &&
        obs.criticality_level <= filterRiskMax;
      if (!withinRisk) return false;
      const createdAt = obs.created_at ? new Date(obs.created_at).getTime() : 0;
      const ageMs = Date.now() - createdAt;
      if (ageMs < minAgeMs) return false;
      if (maxAgeMs !== Infinity && ageMs > maxAgeMs) return false;
      return true;
    });
  }, [
    observations,
    filterRiskMin,
    filterRiskMax,
    filterFreshnessMinIndex,
    filterFreshnessMaxIndex,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSettingsOpen(false);
        setIsFilterOpen(false);
        setLongPressLocation(null);
      }
    },
    []
  );

  const handleMapLongPress = useCallback((lat: number, lng: number) => {
    setLongPressLocation({ lat, lng });
  }, []);

  const handleDismissLongPress = useCallback(() => {
    setLongPressLocation(null);
  }, []);

  useEffect(() => {
    setMarkerScale(getStoredMarkerScale());
  }, []);

  useEffect(() => {
    getCurrentPosition()
      .then((pos) => {
        setUserLocation({
          latitude: pos.latitude,
          longitude: pos.longitude,
        });
      })
      .catch(() => {
        // En cas d'échec, on garde le centre par défaut de la carte.
      });
  }, []);

  useEffect(() => {
    if (longPressLocation == null) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismissLongPress();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [longPressLocation, handleDismissLongPress]);

  useEffect(() => {
    if (!isSettingsOpen && !isFilterOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        controlsRef.current != null &&
        !controlsRef.current.contains(e.target as Node)
      ) {
        setIsSettingsOpen(false);
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSettingsOpen, isFilterOpen]);

  const newObservationHref =
    userLocation != null
      ? `/observation/new?lat=${userLocation.latitude}&lng=${userLocation.longitude}`
      : "/observation/new";

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <DynamicMap
          observations={filteredObservations}
          initialCenter={
            userLocation
              ? [userLocation.latitude, userLocation.longitude]
              : undefined
          }
          markerScale={markerScale}
          onLongPress={handleMapLongPress}
        />
      </div>
      <div
        ref={controlsRef}
        className="absolute right-3 top-3 z-[500] flex flex-col items-end gap-2"
        onKeyDown={handleKeyDown}
      >
        <div className="flex flex-row-reverse items-start gap-2">
          <button
            type="button"
            onClick={handleToggleSettings}
            className="flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-xl bg-zinc-900 p-3 text-white shadow-lg transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 active:bg-zinc-800"
            aria-expanded={isSettingsOpen}
            aria-haspopup="menu"
            aria-label="Ouvrir les paramètres"
          >
            <SettingsIcon />
          </button>
          {isSettingsOpen && (
            <div
              role="menu"
              className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:min-w-[200px]"
              aria-label="Menu paramètres"
            >
            <div
              role="group"
              aria-label="Taille des marqueurs"
              className="flex flex-col gap-2"
            >
              <span className="text-sm font-medium text-zinc-700">
                Taille des marqueurs
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={MARKER_SCALE_MIN}
                  max={MARKER_SCALE_MAX}
                  step={0.1}
                  value={markerScale}
                  onChange={handleMarkerScaleChange}
                  role="slider"
                  className="h-3 w-32 cursor-pointer appearance-none rounded-full bg-zinc-200 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-900 [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:transition-colors hover:[&::-webkit-slider-thumb]:bg-zinc-700"
                  aria-valuemin={MARKER_SCALE_MIN}
                  aria-valuemax={MARKER_SCALE_MAX}
                  aria-valuenow={markerScale}
                  aria-label="Grossir ou réduire les marqueurs"
                />
                <span className="min-w-[2rem] text-right text-sm font-medium text-zinc-600">
                  {markerScale.toFixed(1)}×
                </span>
              </div>
            </div>
          </div>
          )}
        </div>
        <div className="flex flex-row-reverse items-start gap-2">
          <button
            type="button"
            onClick={handleToggleFilter}
            className="flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-xl bg-zinc-900 p-3 text-white shadow-lg transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 active:bg-zinc-800"
            aria-expanded={isFilterOpen}
            aria-haspopup="menu"
            aria-label="Filtrer les observations"
          >
            <FilterIcon />
          </button>
          {isFilterOpen && (
          <div
            role="menu"
            className="flex w-[calc(100vw-5rem)] min-w-0 flex-col gap-4 rounded-xl border border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:w-80"
            aria-label="Filtre des observations"
          >
            <div
              role="group"
              aria-label="Plage de risque"
              className="flex flex-col gap-2"
            >
              <span className="text-sm font-medium text-zinc-700">
                Risque : {CRITICALITY_LABELS[filterRiskMin]} →{" "}
                {CRITICALITY_LABELS[filterRiskMax]}
              </span>
              <RangeSlider
                min={1}
                max={5}
                step={1}
                valueLow={filterRiskMin}
                valueHigh={filterRiskMax}
                onChange={handleFilterRiskChange}
                ariaLabelLow="Risque minimum"
                ariaLabelHigh="Risque maximum"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>1</span>
                <span>5</span>
              </div>
            </div>
            <div
              role="group"
              aria-label="Plage de fraîcheur"
              className="flex flex-col gap-2"
            >
              <span className="text-sm font-medium text-zinc-700">
                Fraîcheur : {FRESHNESS_LABELS[filterFreshnessMinIndex]} →{" "}
                {FRESHNESS_LABELS[filterFreshnessMaxIndex]}
              </span>
              <RangeSlider
                min={0}
                max={4}
                step={1}
                valueLow={filterFreshnessMinIndex}
                valueHigh={filterFreshnessMaxIndex}
                onChange={handleFilterFreshnessChange}
                ariaLabelLow="Âge minimum des observations"
                ariaLabelHigh="Âge maximum des observations"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>—</span>
                <span>Tout</span>
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              {filteredObservations.length} observation
              {filteredObservations.length !== 1 ? "s" : ""} affichée
              {filteredObservations.length !== 1 ? "s" : ""}
            </p>
          </div>
          )}
        </div>
      </div>
      <Link
        href={newObservationHref}
        className="absolute bottom-6 right-6 z-[1000] flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full bg-zinc-900 text-2xl font-light text-white shadow-lg transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 active:bg-zinc-800"
        tabIndex={0}
        aria-label="Nouvelle observation"
      >
        +
      </Link>

      {longPressLocation != null ? (
        <div
          className="absolute inset-0 z-[1100] flex items-end justify-center bg-black/30 p-4 pb-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="long-press-title"
          aria-describedby="long-press-desc"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleDismissLongPress();
          }}
        >
          <div
            className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="long-press-title"
              className="text-lg font-semibold text-zinc-900"
            >
              Créer une observation ici ?
            </h2>
            <p id="long-press-desc" className="text-sm text-zinc-600">
              Vous pouvez créer une nouvelle observation à cet emplacement sur la
              carte.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDismissLongPress}
                className="min-h-[48px] flex-1 rounded-xl border border-zinc-300 bg-white px-4 font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 active:bg-zinc-100"
                tabIndex={0}
                aria-label="Annuler"
              >
                Annuler
              </button>
              <Link
                href={`/observation/new?lat=${longPressLocation.lat}&lng=${longPressLocation.lng}`}
                className="min-h-[48px] flex-1 rounded-xl bg-zinc-900 px-4 py-3 text-center font-semibold text-white transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 active:bg-zinc-800"
                tabIndex={0}
                aria-label="Créer une observation à cet endroit"
              >
                Créer
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
