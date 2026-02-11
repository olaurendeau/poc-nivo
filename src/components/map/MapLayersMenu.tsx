"use client";

import { Layers } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  MAP_BACKGROUNDS,
  MAP_OVERLAYS,
  MAP_OVERLAY_IDS,
  isPentesOverlayAvailable,
  saveOverlays,
  saveTileLayer,
  type MapBackgroundId,
  type MapOverlayId,
} from "@/lib/map-layers";

type MapLayersMenuProps = {
  tileLayer: MapBackgroundId;
  activeOverlays: MapOverlayId[];
  onTileLayerChange: (id: MapBackgroundId) => void;
  onOverlaysChange: (ids: MapOverlayId[]) => void;
  className?: string;
  /** Si true, le menu s'ouvre via un portail (évite la troncature par overflow). */
  usePortal?: boolean;
};

export const MapLayersMenu = ({
  tileLayer,
  activeOverlays,
  onTileLayerChange,
  onOverlaysChange,
  className = "",
  usePortal = false,
}: MapLayersMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleToggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const handleBackgroundChange = useCallback(
    (id: MapBackgroundId) => {
      saveTileLayer(id);
      onTileLayerChange(id);
    },
    [onTileLayerChange]
  );

  const handleOverlayToggle = useCallback(
    (id: MapOverlayId) => {
      const next = activeOverlays.includes(id)
        ? activeOverlays.filter((o) => o !== id)
        : [...activeOverlays, id];
      saveOverlays(next);
      onOverlaysChange(next);
    },
    [activeOverlays, onOverlaysChange]
  );

  useLayoutEffect(() => {
    if (!isOpen || !usePortal || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const gap = 8;
    setMenuPosition({
      top: rect.top,
      right: window.innerWidth - rect.left + gap,
    });
  }, [isOpen, usePortal]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const inButton = ref.current?.contains(target);
      const inMenu = menuRef.current?.contains(target);
      if (!inButton && !inMenu) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const menuContent = isOpen ? (
    <div
      ref={(el) => {
        menuRef.current = el;
      }}
      role="menu"
      className="flex w-[min(calc(100vw-2rem),18rem)] flex-col gap-4 rounded-xl border border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur"
      aria-label="Fond de carte et calques"
      style={
        usePortal
          ? {
              position: "fixed",
              top: menuPosition.top,
              right: menuPosition.right,
              zIndex: 9999,
            }
          : undefined
      }
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
  ) : null;

  return (
    <div ref={ref} className={`relative ${className}`.trim()}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-xl bg-zinc-900 p-3 text-white shadow-lg transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 active:bg-zinc-800"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Fond de carte et calques"
        tabIndex={0}
      >
        <Layers size={24} aria-hidden />
      </button>
      {usePortal && menuContent
        ? createPortal(menuContent, document.body)
        : !usePortal && (
            <div
              className="absolute right-full top-0 z-50 mr-2"
              style={{ maxWidth: "min(calc(100vw - 5rem), 18rem)" }}
            >
              {menuContent}
            </div>
          )}
    </div>
  );
};
