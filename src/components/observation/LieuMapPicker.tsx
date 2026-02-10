"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useCallback, useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

const OPEN_TOPO_MAP_URL = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";

const markerIcon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DEFAULT_CENTER: [number, number] = [45.5, 6.5];
const DEFAULT_ZOOM = 11;

type MapClickHandlerProps = {
  onSelect: (lat: number, lng: number) => void;
};

const MapClickHandler = ({ onSelect }: MapClickHandlerProps) => {
  useMapEvents({
    click: (e) => {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

type MapCenterToPositionProps = {
  position: [number, number] | null;
};

const MapCenterToPosition = ({ position }: MapCenterToPositionProps) => {
  const map = useMap();
  useEffect(() => {
    if (!position) return;
    // Recentrer sans modifier le niveau de zoom courant.
    map.flyTo(position, map.getZoom(), { duration: 0.3 });
  }, [map, position]);
  return null;
};

type LieuMapPickerProps = {
  position: { latitude: number; longitude: number } | null;
  onSelect: (latitude: number, longitude: number) => void;
};

export const LieuMapPicker = ({ position, onSelect }: LieuMapPickerProps) => {
  const center: [number, number] = position
    ? [position.latitude, position.longitude]
    : DEFAULT_CENTER;

  const handleDragEnd = useCallback(
    (e: L.LeafletEvent) => {
      const marker = e.target as L.Marker;
      const latlng = marker.getLatLng();
      onSelect(latlng.lat, latlng.lng);
    },
    [onSelect]
  );

  return (
    <div
      className="overflow-hidden bg-zinc-100"
      style={{ height: 260 }}
    >
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        scrollWheelZoom
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url={OPEN_TOPO_MAP_URL} />
        <MapClickHandler onSelect={onSelect} />
        <MapCenterToPosition
          position={
            position ? [position.latitude, position.longitude] : null
          }
        />
        {position ? (
          <Marker
            position={[position.latitude, position.longitude]}
            icon={markerIcon}
            draggable
            eventHandlers={{ dragend: handleDragEnd }}
          />
        ) : null}
      </MapContainer>
    </div>
  );
};
