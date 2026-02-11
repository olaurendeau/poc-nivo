"use client";

import type { ObservationMapItem } from "@/types/observation";
import type { CriticalityLevel } from "@/lib/criticality";
import { CRITICALITY_LABELS } from "@/lib/criticality";
import { getCurrentPosition } from "@/lib/geo";
import { RangeSlider } from "@/components/ui/RangeSlider";
import type { MapBackgroundId, MapOverlayId } from "@/components/map/Map";
import {
  MAP_BACKGROUNDS,
  MAP_OVERLAYS,
  MAP_OVERLAY_IDS,
  getStoredOverlays,
  getStoredTileLayer,
  isPentesOverlayAvailable,
  saveOverlays,
  saveTileLayer,
} from "@/lib/map-layers";
import { Layers } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

const RefreshIcon = ({ spinning = false }: { spinning?: boolean }) => (
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
    className={spinning ? "animate-spin" : undefined}
  >
    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" />
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

export const HomeMapView = ({ observations: initialObservations }: HomeMapViewProps) => {
  const router = useRouter();
  const [observations, setObservations] = useState<ObservationMapItem[]>(initialObservations);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [markerScale, setMarkerScale] = useState(MARKER_SCALE_DEFAULT);
  const [tileLayer, setTileLayer] = useState<MapBackgroundId>("topo");
  const [activeOverlays, setActiveOverlays] = useState<MapOverlayId[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [filterRiskMin, setFilterRiskMin] = useState<CriticalityLevel>(1);
  const [filterRiskMax, setFilterRiskMax] = useState<CriticalityLevel>(5);
  const [filterFreshnessMinIndex, setFilterFreshnessMinIndex] = useState(0);
  /** Index 2 = 7 jours (valeur initiale du filtre). */
  const [filterFreshnessMaxIndex, setFilterFreshnessMaxIndex] = useState(2);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newObservationsCount, setNewObservationsCount] = useState<number | null>(null);
  const [longPressLocation, setLongPressLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setObservations(initialObservations);
  }, [initialObservations]);

  useEffect(() => {
    router.refresh();
  }, [router]);

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
    setIsLayersOpen(false);
    setIsSettingsOpen((prev) => !prev);
  }, []);

  const handleToggleFilter = useCallback(() => {
    setIsSettingsOpen(false);
    setIsLayersOpen(false);
    setIsFilterOpen((prev) => !prev);
  }, []);

  const handleToggleLayers = useCallback(() => {
    setIsSettingsOpen(false);
    setIsFilterOpen(false);
    setIsLayersOpen((prev) => !prev);
  }, []);

  const handleFilterRiskChange = useCallback((low: number, high: number) => {
    setFilterRiskMin(low as CriticalityLevel);
    setFilterRiskMax(high as CriticalityLevel);
  }, []);

  const handleFilterFreshnessChange = useCallback((low: number, high: number) => {
    setFilterFreshnessMinIndex(low);
    setFilterFreshnessMaxIndex(high);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setNewObservationsCount(null);
    try {
      const res = await fetch("/api/observations");
      if (!res.ok) return;
      const fresh: ObservationMapItem[] = await res.json();
      const previousIds = new Set(observations.map((o) => o.id));
      const newCount = fresh.filter((o) => !previousIds.has(o.id)).length;
      setObservations(fresh);
      setNewObservationsCount(newCount);
    } finally {
      setIsRefreshing(false);
    }
  }, [observations]);

  useEffect(() => {
    if (newObservationsCount === null) return;
    const id = setTimeout(() => setNewObservationsCount(null), 5000);
    return () => clearTimeout(id);
  }, [newObservationsCount]);

  const handleRefreshKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleRefresh();
    }
  }, [handleRefresh]);

  const filteredObservations = useMemo(() => {
    const minAgeMs = FRESHNESS_VALUES_MS[filterFreshnessMinIndex] ?? 0;
    const maxAgeMs = FRESHNESS_VALUES_MS[filterFreshnessMaxIndex] ?? Infinity;
    return observations.filter((obs) => {
      const withinRisk =
        obs.criticality_level >= filterRiskMin &&
        obs.criticality_level <= filterRiskMax;
      if (!withinRisk) return false;
      const observedAt = obs.observed_at ?? obs.created_at;
      const observedTs = observedAt ? new Date(observedAt).getTime() : 0;
      const ageMs = Date.now() - observedTs;
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
        setIsLayersOpen(false);
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
    setTileLayer(getStoredTileLayer());
    setActiveOverlays(getStoredOverlays());
  }, []);

  const handleBackgroundChange = useCallback((id: MapBackgroundId) => {
    saveTileLayer(id);
    setTileLayer(id);
  }, []);

  const handleOverlayToggle = useCallback(
    (id: MapOverlayId) => {
      const next = activeOverlays.includes(id)
        ? activeOverlays.filter((o) => o !== id)
        : [...activeOverlays, id];
      saveOverlays(next);
      setActiveOverlays(next);
    },
    [activeOverlays]
  );

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
    if (!isSettingsOpen && !isFilterOpen && !isLayersOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        controlsRef.current != null &&
        !controlsRef.current.contains(e.target as Node)
      ) {
        setIsSettingsOpen(false);
        setIsFilterOpen(false);
        setIsLayersOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSettingsOpen, isFilterOpen, isLayersOpen]);

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
          tileLayer={tileLayer}
          activeOverlays={activeOverlays}
          onLongPress={handleMapLongPress}
        />
      </div>
      <div
        ref={controlsRef}
        className="absolute right-3 top-3 z-[500] flex flex-col items-end gap-2"
        onKeyDown={handleKeyDown}
      >
        <div className="relative flex flex-row-reverse items-start gap-2">
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
              className="absolute right-full top-0 mr-2 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:min-w-[200px]"
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
            <a
              href="https://github.com/olaurendeau/poc-nivo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 active:bg-zinc-200"
              tabIndex={0}
              aria-label="Voir le dépôt GitHub du projet"
              role="menuitem"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
          )}
        </div>
        <div className="relative flex flex-row-reverse items-start gap-2">
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
            className="absolute right-full top-0 mr-2 flex w-[calc(100vw-5rem)] min-w-0 flex-col gap-4 rounded-xl border border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:w-80"
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
        <div className="relative flex flex-row-reverse items-start gap-2">
          <button
            type="button"
            onClick={handleToggleLayers}
            className="flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-xl bg-zinc-900 p-3 text-white shadow-lg transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 active:bg-zinc-800"
            aria-expanded={isLayersOpen}
            aria-haspopup="menu"
            aria-label="Fond de carte et calques"
            tabIndex={0}
          >
            <Layers size={24} aria-hidden />
          </button>
          {isLayersOpen && (
            <div
              role="menu"
              className="absolute right-full top-0 mr-2 flex w-[calc(100vw-5rem)] min-w-0 flex-col gap-4 rounded-xl border border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:w-72"
              aria-label="Fond de carte et calques"
            >
              <div
                role="group"
                aria-label="Fond de carte"
                className="flex flex-col gap-2"
              >
                <span className="text-sm font-medium text-zinc-700">
                  Fond de carte
                </span>
                <div className="flex flex-col gap-1.5">
                  {(["topo", "satellite"] as const).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleBackgroundChange(id)}
                      className={`min-h-[48px] flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ${
                        tileLayer === id
                          ? "bg-zinc-900 text-white"
                          : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200"
                      }`}
                      aria-pressed={tileLayer === id}
                      aria-label={`Fond : ${MAP_BACKGROUNDS[id].label}`}
                      tabIndex={0}
                    >
                      {MAP_BACKGROUNDS[id].label}
                      {tileLayer === id ? (
                        <span className="text-emerald-400" aria-hidden>
                          ✓
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
              <div
                role="group"
                aria-label="Calques superposés"
                className="flex flex-col gap-2"
              >
                <span className="text-sm font-medium text-zinc-700">Calques</span>
                <div className="flex flex-col gap-1.5">
                  {MAP_OVERLAY_IDS.map((id) => {
                    const overlay = MAP_OVERLAYS[id];
                    const isPentes = id === "pentes";
                    const isAvailable = isPentes
                      ? isPentesOverlayAvailable()
                      : true;
                    const isChecked = activeOverlays.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => isAvailable && handleOverlayToggle(id)}
                        disabled={!isAvailable}
                        className={`min-h-[48px] flex min-w-0 items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ${
                          isAvailable
                            ? isChecked
                              ? "bg-zinc-900 text-white"
                              : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200"
                            : "cursor-not-allowed bg-zinc-100 text-zinc-400"
                        }`}
                        aria-pressed={isChecked}
                        aria-label={`${overlay.label}${!isAvailable ? " (non disponible)" : ""}`}
                        aria-disabled={!isAvailable}
                        tabIndex={isAvailable ? 0 : -1}
                      >
                        {overlay.label}
                        {isAvailable ? (
                          <span
                            className={`min-w-[1.5rem] text-right ${
                              isChecked ? "text-emerald-400" : "text-zinc-400"
                            }`}
                            aria-hidden
                          >
                            {isChecked ? "✓" : "—"}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-500">
                            Clé IGN requise
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={handleRefresh}
            onKeyDown={handleRefreshKeyDown}
            disabled={isRefreshing}
            className="flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-xl bg-zinc-900 p-3 text-white shadow-lg transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 active:bg-zinc-800"
            aria-label={isRefreshing ? "Rechargement en cours…" : "Recharger les observations"}
            tabIndex={0}
          >
            <RefreshIcon spinning={isRefreshing} />
          </button>
          {newObservationsCount !== null ? (
            <span
              className="rounded-lg border border-zinc-200 bg-white/95 px-2 py-1.5 text-xs font-medium text-emerald-700 shadow-md backdrop-blur"
              role="status"
              aria-live="polite"
            >
              {newObservationsCount} nouvelle
              {newObservationsCount !== 1 ? "s" : ""} obs récupérée
              {newObservationsCount !== 1 ? "s" : ""}
            </span>
          ) : null}
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
