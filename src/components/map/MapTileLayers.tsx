"use client";

import { TileLayer } from "react-leaflet";
import {
  MAP_BACKGROUNDS,
  MAP_OVERLAYS,
  getPentesOverlayUrl,
  type MapBackgroundId,
  type MapOverlayId,
} from "@/lib/map-layers";

type MapTileLayersProps = {
  tileLayer: MapBackgroundId;
  activeOverlays: MapOverlayId[];
};

export const MapTileLayers = ({ tileLayer, activeOverlays }: MapTileLayersProps) => (
  <>
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
        <TileLayer key={id} url={overlay.url} opacity={0.8} zIndex={400} />
      );
    })}
  </>
);
