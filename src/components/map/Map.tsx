"use client";

import type { ObservationMapItem } from "@/types/observation";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

const OPEN_TOPO_MAP_URL = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";

const defaultIcon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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

type MapProps = {
  observations: ObservationMapItem[];
};

export const Map = ({ observations }: MapProps) => {
  const center: [number, number] =
    observations.length > 0
      ? [observations[0].latitude, observations[0].longitude]
      : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      scrollWheelZoom
      attributionControl={false}
    >
      <TileLayer url={OPEN_TOPO_MAP_URL} />
      <MapFitBounds observations={observations} />
      {observations.map((obs) => (
        <Marker
          key={obs.id}
          position={[obs.latitude, obs.longitude]}
          icon={defaultIcon}
        >
          <Popup>
            <div className="min-w-[120px]">
              {obs.place_name ? (
                <p className="font-medium text-zinc-900">{obs.place_name}</p>
              ) : null}
              <Link
                href={`/observation/${obs.id}`}
                className="mt-2 inline-block rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
                tabIndex={0}
                aria-label={`Voir l'observation ${obs.place_name ?? obs.id}`}
              >
                Voir l&apos;observation
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
