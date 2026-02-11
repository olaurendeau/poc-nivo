"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, Marker } from "react-leaflet";
import { MapLayersMenu } from "@/components/map/MapLayersMenu";
import { MapTileLayers } from "@/components/map/MapTileLayers";
import {
  getStoredOverlays,
  getStoredTileLayer,
  type MapBackgroundId,
  type MapOverlayId,
} from "@/lib/map-layers";

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
}: ObservationDetailMapProps) => {
  const [tileLayer, setTileLayer] = useState<MapBackgroundId>("topo");
  const [activeOverlays, setActiveOverlays] = useState<MapOverlayId[]>([]);

  useEffect(() => {
    setTileLayer(getStoredTileLayer());
    setActiveOverlays(getStoredOverlays());
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 shadow-sm"
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
        <MapTileLayers tileLayer={tileLayer} activeOverlays={activeOverlays} />
        <Marker position={[latitude, longitude]} icon={markerIcon} />
      </MapContainer>
      <div className="absolute right-2 top-2 z-[500]">
        <MapLayersMenu
          tileLayer={tileLayer}
          activeOverlays={activeOverlays}
          onTileLayerChange={setTileLayer}
          onOverlaysChange={setActiveOverlays}
          usePortal
        />
      </div>
    </div>
  );
};
