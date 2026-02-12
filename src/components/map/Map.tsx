"use client";

import {
  formatObservedAt,
  getElevationRoundedLabel,
  getFreshnessLabel,
  ORIENTATION_ANGLES,
} from "@/lib/marker-utils";
import type { IndiceKey, ObservableKey } from "@/types/observation";
import {
  INDICE_LABELS,
  OBSERVABLE_LABELS,
  type ObservationMapItem,
} from "@/types/observation";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { MapLongPressHandler } from "@/components/map/MapLongPressHandler";
import {
  MAP_BACKGROUNDS,
  MAP_OVERLAYS,
  getPentesOverlayUrl,
  type MapBackgroundId,
  type MapOverlayId,
} from "@/lib/map-layers";

const BASE_MARKER_SIZE = 36;
const BASE_DIAMOND_SIZE = 7;
const BASE_DIAMOND_RADIUS = 18;

const createMarkerIcon = (
  color: string,
  elevationLabel: string | null,
  orientations: string[],
  freshnessLabel: string,
  scale: number
): L.DivIcon => {
  const orientSet = new Set(orientations ?? []);
  const visibleOrientations = Object.keys(ORIENTATION_ANGLES).filter((o) =>
    orientSet.has(o)
  );

  const MARKER_SIZE = Math.round(BASE_MARKER_SIZE * scale);
  const DIAMOND_SIZE = Math.round(BASE_DIAMOND_SIZE * scale);
  const DIAMOND_RADIUS = Math.round(BASE_DIAMOND_RADIUS * scale);
  const CONTAINER_SIZE = Math.round(56 * scale);
  const CENTER = CONTAINER_SIZE / 2;

  const diamondHtml = visibleOrientations
    .map((o) => {
      const deg = ORIENTATION_ANGLES[o] ?? 0;
      const rad = (deg * Math.PI) / 180;
      const x = CENTER + DIAMOND_RADIUS * Math.cos(rad);
      const y = CENTER + DIAMOND_RADIUS * Math.sin(rad);
      return `<div style="
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: ${DIAMOND_SIZE}px;
        height: ${DIAMOND_SIZE}px;
        margin: -${DIAMOND_SIZE / 2}px 0 0 -${DIAMOND_SIZE / 2}px;
        background: white;
        border: 1.5px solid rgba(0,0,0,0.4);
        transform: rotate(${deg - 45}deg);
        box-shadow: 0 1px 3px rgba(0,0,0,0.35);
      "></div>`;
    })
    .join("");

  const centerX = CENTER;
  const totalHeight = CONTAINER_SIZE;

  const elevationText = elevationLabel != null ? `${elevationLabel}m` : "—";

  return L.divIcon({
    className: "observation-marker",
    html: `
      <div style="position: relative; width: ${CONTAINER_SIZE}px; height: ${CONTAINER_SIZE}px;">
        <div style="
          position: absolute;
          left: 50%;
          top: 50%;
          width: ${MARKER_SIZE}px;
          height: ${MARKER_SIZE}px;
          margin: -${MARKER_SIZE / 2}px 0 0 -${MARKER_SIZE / 2}px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0;
        ">
          <span style="
            font-size: ${Math.round(7 * scale)}px;
            font-weight: 700;
            color: white;
            text-shadow: 0 0 2px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.5);
            font-family: system-ui, sans-serif;
            line-height: 1;
          ">${elevationText}</span>
          ${freshnessLabel ? `
          <span style="
            font-size: ${Math.round(7 * scale)}px;
            font-weight: 600;
            color: rgba(255,255,255,0.9);
            text-shadow: 0 0 1px rgba(0,0,0,0.5);
            font-family: system-ui, sans-serif;
            line-height: 1;
          ">${freshnessLabel}</span>
          ` : ""}
        </div>
        ${diamondHtml}
      </div>
    `,
    iconSize: [CONTAINER_SIZE, CONTAINER_SIZE],
    iconAnchor: [centerX, centerX],
    popupAnchor: [0, -centerX],
  });
};

const DEFAULT_CENTER: [number, number] = [45.5, 6.5];
const DEFAULT_ZOOM = 10;

type MapFitBoundsProps = {
  observations: ObservationMapItem[];
};

const MapFitBounds = ({ observations }: MapFitBoundsProps) => {
  const map = useMap();

  useEffect(() => {
    if (observations.length < 2) return;
    const bounds = L.latLngBounds(
      observations.map((o) => [o.latitude, o.longitude] as [number, number])
    );
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 });
  }, [map, observations]);

  return null;
};

export type { MapBackgroundId, MapOverlayId };

type MapProps = {
  observations: ObservationMapItem[];
  initialCenter?: [number, number];
  markerScale?: number;
  onLongPress?: (lat: number, lng: number) => void;
  tileLayer?: MapBackgroundId;
  activeOverlays?: MapOverlayId[];
};

/** Trie par date d'observation croissante pour que les plus récents soient rendus en dernier (au-dessus des plus anciens). */
const sortByObservedAtAsc = (
  items: ObservationMapItem[]
): ObservationMapItem[] =>
  [...items].sort((a, b) => {
    const tsA = (a.observed_at ?? a.created_at) ?? "";
    const tsB = (b.observed_at ?? b.created_at) ?? "";
    return new Date(tsA).getTime() - new Date(tsB).getTime();
  });

export const Map = ({
  observations,
  initialCenter,
  markerScale = 1,
  onLongPress,
  tileLayer = "topo",
  activeOverlays = [],
}: MapProps) => {
  const center: [number, number] =
    observations.length > 0
      ? [observations[0].latitude, observations[0].longitude]
      : initialCenter ?? DEFAULT_CENTER;

  const sortedForZIndex = sortByObservedAtAsc(observations);

  return (
    <MapContainer
      center={center}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      scrollWheelZoom
      attributionControl={false}
    >
      <TileLayer url={MAP_BACKGROUNDS[tileLayer].url} />
      {activeOverlays.map((id) => {
        if (id === "pentes") {
          const url = getPentesOverlayUrl();
          if (!url) return null;
          return <TileLayer key={id} url={url} opacity={0.7} zIndex={400} />;
        }
        const overlay = MAP_OVERLAYS[id];
        if (!overlay?.url) return null;
        return (
          <TileLayer
            key={id}
            url={overlay.url}
            opacity={0.8}
            zIndex={400}
          />
        );
      })}
      {onLongPress != null ? (
        <MapLongPressHandler onLongPress={onLongPress} />
      ) : null}
      <MapFitBounds observations={observations} />
      {sortedForZIndex.map((obs) => {
        const elevationLabel = getElevationRoundedLabel(obs.elevation);
        const freshnessLabel = getFreshnessLabel(
          obs.observed_at ?? obs.created_at
        );
        const icon = createMarkerIcon(
          "#52525b",
          elevationLabel,
          obs.orientations ?? [],
          freshnessLabel,
          markerScale
        );
        return (
        <Marker
          key={obs.id}
          position={[obs.latitude, obs.longitude]}
          icon={icon}
        >
          <Popup>
            <div className="min-w-[200px] space-y-2">
              {obs.place_name ? (
                <p className="font-semibold text-zinc-900">{obs.place_name}</p>
              ) : null}
              <dl className="space-y-1 text-sm text-zinc-600">
                {formatObservedAt(obs.observed_at ?? obs.created_at) ? (
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-medium text-zinc-500">Date</dt>
                    <dd>{formatObservedAt(obs.observed_at ?? obs.created_at)}</dd>
                  </div>
                ) : null}
                {obs.elevation != null ? (
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-medium text-zinc-500">Alt.</dt>
                    <dd>{obs.elevation.toLocaleString("fr-FR")} m</dd>
                  </div>
                ) : null}
                {(obs.orientations?.length ?? 0) > 0 ? (
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-medium text-zinc-500">Expos.</dt>
                    <dd>{obs.orientations?.join(", ") ?? "—"}</dd>
                  </div>
                ) : null}
                {(obs.indices?.length ?? 0) > 0 ? (
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-medium text-zinc-500">Indices</dt>
                    <dd>
                      {obs.indices
                        ?.map((k) => INDICE_LABELS[k as IndiceKey] ?? k)
                        .join(", ") ?? "—"}
                    </dd>
                  </div>
                ) : null}
                {(obs.observables?.length ?? 0) > 0 ? (
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-medium text-zinc-500">Observ.</dt>
                    <dd>
                      {obs.observables
                        ?.map((k) => OBSERVABLE_LABELS[k as ObservableKey] ?? k)
                        .join(", ") ?? "—"}
                    </dd>
                  </div>
                ) : null}
              </dl>
              <Link
                href={`/observation/${obs.id}`}
                className="mt-2 inline-block rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium !text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
                tabIndex={0}
                aria-label={`Voir l'observation ${obs.place_name ?? obs.id}`}
              >
                Voir l&apos;observation
              </Link>
            </div>
          </Popup>
        </Marker>
        );
      })}
    </MapContainer>
  );
};
