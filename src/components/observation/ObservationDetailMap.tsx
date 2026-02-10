"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

const OPEN_TOPO_MAP_URL = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
const DEFAULT_ZOOM = 14;

const markerIcon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type ObservationDetailMapProps = {
  latitude: number;
  longitude: number;
};

export const ObservationDetailMap = ({
  latitude,
  longitude,
}: ObservationDetailMapProps) => (
  <div
    className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 shadow-sm"
    style={{ height: 200 }}
    aria-label="Carte de localisation de l'observation"
  >
    <MapContainer
      center={[latitude, longitude]}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
    scrollWheelZoom
    attributionControl={false}
    >
      <TileLayer url={OPEN_TOPO_MAP_URL} />
      <Marker position={[latitude, longitude]} icon={markerIcon} />
    </MapContainer>
  </div>
);
