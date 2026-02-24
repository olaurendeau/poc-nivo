"use client";

import { useCallback, useEffect, useRef } from "react";
import type {
  ObservableKey,
  ObservablesDetails,
} from "@/types/observation";

type ObservablesModalProps = {
  open: boolean;
  observableKey: ObservableKey | null;
  value: ObservablesDetails;
  onChange: (details: ObservablesDetails) => void;
  onClose: () => void;
  onRemove?: () => void;
};

const IconTrash = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const ObservablesModal = ({
  open,
  observableKey,
  value,
  onChange,
  onClose,
  onRemove,
}: ObservablesModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
  }, [open]);

  if (!open || !observableKey) return null;

  const updateDetails = (partial: Partial<ObservablesDetails>) => {
    onChange({
      ...value,
      ...partial,
    });
  };

  const renderRecentSnow = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700">
          Épaisseur de neige récente (cm)
          <input
            type="number"
            inputMode="numeric"
            min={0}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-base text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            value={value.recentSnow?.thicknessCm ?? ""}
            onChange={(e) =>
              updateDetails({
                recentSnow: {
                  ...value.recentSnow,
                  thicknessCm: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                },
              })
            }
          />
        </label>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-700">Vent&nbsp;?</p>
        <div className="flex gap-2">
          {([true, false] as const).map((flag) => {
            const isSelected = value.recentSnow?.wind === flag;
            return (
              <button
                key={String(flag)}
                type="button"
                className={`flex min-h-[44px] flex-1 items-center justify-center rounded-xl border-2 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ${
                  isSelected
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
                }`}
                aria-pressed={isSelected}
                onClick={() =>
                  updateDetails({
                    recentSnow: {
                      ...value.recentSnow,
                      wind: flag,
                    },
                  })
                }
              >
                {flag ? "Oui" : "Non"}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-700">
          Hausse des températures&nbsp;?
        </p>
        <div className="flex gap-2">
          {([true, false] as const).map((flag) => {
            const isSelected = value.recentSnow?.warming === flag;
            return (
              <button
                key={String(flag)}
                type="button"
                className={`flex min-h-[44px] flex-1 items-center justify-center rounded-xl border-2 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ${
                  isSelected
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
                }`}
                aria-pressed={isSelected}
                onClick={() =>
                  updateDetails({
                    recentSnow: {
                      ...value.recentSnow,
                      warming: flag,
                    },
                  })
                }
              >
                {flag ? "Oui" : "Non"}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderWetSnow = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700">
          Épaisseur de neige humide (cm)
          <input
            type="number"
            inputMode="numeric"
            min={0}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-base text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            value={value.wetSnow?.thicknessCm ?? ""}
            onChange={(e) =>
              updateDetails({
                wetSnow: {
                  ...value.wetSnow,
                  thicknessCm: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                },
              })
            }
          />
        </label>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-700">
          Première humidification&nbsp;?
        </p>
        <div className="flex gap-2">
          {([true, false] as const).map((flag) => {
            const isSelected = value.wetSnow?.firstWetting === flag;
            return (
              <button
                key={String(flag)}
                type="button"
                className={`flex min-h-[44px] flex-1 items-center justify-center rounded-xl border-2 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ${
                  isSelected
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
                }`}
                aria-pressed={isSelected}
                onClick={() =>
                  updateDetails({
                    wetSnow: {
                      ...value.wetSnow,
                      firstWetting: flag,
                    },
                  })
                }
              >
                {flag ? "Oui" : "Non"}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-700">
          Boulettes ou purges&nbsp;?
        </p>
        <div className="flex gap-2">
          {([true, false] as const).map((flag) => {
            const isSelected = value.wetSnow?.rollersOrSluffs === flag;
            return (
              <button
                key={String(flag)}
                type="button"
                className={`flex min-h-[44px] flex-1 items-center justify-center rounded-xl border-2 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ${
                  isSelected
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
                }`}
                aria-pressed={isSelected}
                onClick={() =>
                  updateDetails({
                    wetSnow: {
                      ...value.wetSnow,
                      rollersOrSluffs: flag,
                    },
                  })
                }
              >
                {flag ? "Oui" : "Non"}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderWindSnow = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-700">
          Transport de neige&nbsp;?
        </p>
        <div className="flex gap-2">
          {[
            { key: "crests", label: "Près des crêtes" },
            { key: "everywhere", label: "Partout" },
          ].map((opt) => {
            const isSelected = value.windSnow?.transportLocation === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                className={`flex min-h-[44px] flex-1 items-center justify-center rounded-xl border-2 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ${
                  isSelected
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
                }`}
                aria-pressed={isSelected}
                onClick={() =>
                  updateDetails({
                    windSnow: {
                      ...value.windSnow,
                      transportLocation: opt.key as
                        | "crests"
                        | "everywhere",
                    },
                  })
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-700">
          Indices de surface
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "erosions", label: "Érosions" },
            { key: "accumulations", label: "Accumulations" },
            { key: "cornices", label: "Corniches" },
          ].map((opt) => {
            const current = value.windSnow?.surfaceIndices ?? [];
            const isSelected = current.includes(
              opt.key as "erosions" | "accumulations" | "cornices"
            );
            return (
              <button
                key={opt.key}
                type="button"
                className={`flex min-h-[48px] flex-1 items-center justify-center rounded-xl border-2 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ${
                  isSelected
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
                }`}
                aria-pressed={isSelected}
                onClick={() => {
                  const next = isSelected
                    ? current.filter((k) => k !== opt.key)
                    : [...current, opt.key];
                  updateDetails({
                    windSnow: {
                      ...value.windSnow,
                      surfaceIndices: next,
                    },
                  });
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-700">
          Aspect zones d&apos;accumulation
        </p>
        <div className="flex gap-2">
          {[
            { key: "hardSnow", label: "Neige dure" },
            { key: "softSnow", label: "Neige friable" },
          ].map((opt) => {
            const isSelected = value.windSnow?.accumulationAspect === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                className={`flex min-h-[44px] flex-1 items-center justify-center rounded-xl border-2 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ${
                  isSelected
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
                }`}
                aria-pressed={isSelected}
                onClick={() =>
                  updateDetails({
                    windSnow: {
                      ...value.windSnow,
                      accumulationAspect: opt.key as "hardSnow" | "softSnow",
                    },
                  })
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderOtherSurface = () => {
    const flags = value.otherSurface ?? {};
    const toggleFlag = (key: keyof typeof flags) => {
      const next = { ...flags, [key]: !flags[key] };
      onChange({
        ...value,
        otherSurface: next,
      });
    };

    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-zinc-700">
          Autres observations de surface (optionnel)
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "lowSnow", label: "Manque de neige" },
            { key: "surfaceFacet", label: "Frisette" },
            { key: "surfaceHoar", label: "Givre" },
            { key: "surfaceCrust", label: "Croûte en surface" },
            { key: "windCrust", label: "Cartonnée" },
          ].map((opt) => {
            const isSelected = Boolean(
              (flags as Record<string, boolean | undefined>)[opt.key]
            );
            return (
              <button
                key={opt.key}
                type="button"
                className={`flex min-h-[48px] flex-1 items-center justify-center rounded-xl border-2 px-4 py-2 text-xs font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ${
                  isSelected
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
                }`}
                aria-pressed={isSelected}
                onClick={() => toggleFlag(opt.key as keyof typeof flags)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (observableKey === "recentSnow") return renderRecentSnow();
    if (observableKey === "wetSnow") return renderWetSnow();
    if (observableKey === "windSnow") return renderWindSnow();
    if (observableKey === "otherSurface") return renderOtherSurface();
    return null;
  };

  const titleMap: Record<ObservableKey, string> = {
    recentSnow: "Détails neige récente (optionnel)",
    wetSnow: "Détails neige humide (optionnel)",
    windSnow: "Détails neige ventée (optionnel)",
    otherSurface: "Autres observations de surface (optionnel)",
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="observables-modal-title"
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute inset-0 bg-zinc-900/60"
        aria-hidden
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl"
      >
        <h3
          id="observables-modal-title"
          className="mb-4 text-lg font-semibold text-zinc-900"
        >
          {titleMap[observableKey]}
        </h3>
        {renderContent()}
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-base font-medium text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
            aria-label="Fermer le détail de l'observable"
          >
            Fermer
          </button>
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-xl border-2 border-zinc-300 bg-white text-zinc-600 hover:border-zinc-500 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
              aria-label="Retirer cet observable"
            >
              <IconTrash className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

