"use client";

import type {
  AvalancheCassure,
  AvalancheDetails,
  AvalancheTaille,
  AvalancheType,
} from "@/types/observation";
import {
  AVALANCHE_CASSURE_LABELS,
  AVALANCHE_TYPE_LABELS,
} from "@/types/observation";
import { useCallback, useEffect, useRef } from "react";

type AvalancheModalProps = {
  open: boolean;
  value: AvalancheDetails;
  onChange: (details: AvalancheDetails) => void;
  onClose: () => void;
  onRemove?: () => void;
};

const IconSpontane = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C8.5 2 6 4.5 6 8c0 2.5 1.5 5 3 7l3 4 3-4c1.5-2 3-4.5 3-7 0-3.5-2.5-6-6-6z" />
  </svg>
);

const IconProvoque = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const IconLineaire = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <line x1="4" y1="12" x2="20" y2="12" />
  </svg>
);

const IconPonctuel = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="12" r="4" />
  </svg>
);

const IconPoubelle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const AvalancheModal = ({
  open,
  value,
  onChange,
  onClose,
  onRemove,
}: AvalancheModalProps) => {
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

  if (!open) return null;

  const handleTypeChange = (type: AvalancheType) => {
    onChange({ ...value, type: value.type === type ? undefined : type });
  };

  const handleCassureChange = (cassure: AvalancheCassure) => {
    onChange({ ...value, cassure: value.cassure === cassure ? undefined : cassure });
  };

  const handleTailleToggle = (taille: AvalancheTaille) => {
    const current = value.tailles ?? [];
    const next = current.includes(taille)
      ? current.filter((t) => t !== taille)
      : [...current, taille].sort((a, b) => a - b);
    onChange({ ...value, tailles: next.length > 0 ? next : undefined });
  };

  const handleDeclenchementARemoteChange = (declenchementARemote: boolean) => {
    onChange({ ...value, declenchementARemote });
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="avalanche-modal-title"
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
        <h3 id="avalanche-modal-title" className="mb-4 text-lg font-semibold text-zinc-900">
          Détails avalanche (optionnel)
        </h3>

        <div className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-zinc-700">
              Type
            </legend>
            <div className="flex gap-2">
              {(["spontane", "provoque"] as const).map((type) => {
                const isSelected = value.type === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    className={`flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ${
                      isSelected
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
                    }`}
                    aria-pressed={isSelected}
                    aria-label={AVALANCHE_TYPE_LABELS[type]}
                  >
                    {type === "spontane" ? (
                      <IconSpontane className="h-5 w-5" />
                    ) : (
                      <IconProvoque className="h-5 w-5" />
                    )}
                    <span>{AVALANCHE_TYPE_LABELS[type]}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-zinc-700">
              Cassure
            </legend>
            <div className="flex gap-2">
              {(["lineaire", "ponctuelle"] as const).map((cassure) => {
                const isSelected = value.cassure === cassure;
                return (
                  <button
                    key={cassure}
                    type="button"
                    onClick={() => handleCassureChange(cassure)}
                    className={`flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ${
                      isSelected
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
                    }`}
                    aria-pressed={isSelected}
                    aria-label={AVALANCHE_CASSURE_LABELS[cassure]}
                  >
                    {cassure === "lineaire" ? (
                      <IconLineaire className="h-5 w-5" />
                    ) : (
                      <IconPonctuel className="h-5 w-5" />
                    )}
                    <span>{cassure === "lineaire" ? "Linéaire" : "Ponctuelle"}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-zinc-700">
              Déclenchement à distance
            </legend>
            <div className="flex gap-2">
              {([false, true] as const).map((flag) => {
                const isSelected =
                  (value.declenchementARemote ?? false) === flag;
                return (
                  <button
                    key={String(flag)}
                    type="button"
                    onClick={() => handleDeclenchementARemoteChange(flag)}
                    className={`flex min-h-[48px] flex-1 items-center justify-center rounded-xl border-2 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ${
                      isSelected
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
                    }`}
                    aria-pressed={isSelected}
                    aria-label={flag ? "Oui, déclenchement à distance" : "Non"}
                  >
                    {flag ? "Oui" : "Non"}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-zinc-700">
              Tailles (plusieurs possibles)
            </legend>
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as const).map((taille) => {
                const isSelected = (value.tailles ?? []).includes(taille);
                return (
                  <button
                    key={taille}
                    type="button"
                    onClick={() => handleTailleToggle(taille)}
                    className={`flex min-h-[48px] min-w-[48px] flex-1 items-center justify-center rounded-xl border-2 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ${
                      isSelected
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
                    }`}
                    aria-pressed={isSelected}
                    aria-label={`Taille ${taille}${isSelected ? ", sélectionné" : ""}`}
                  >
                    {taille}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-base font-medium text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
            aria-label="Fermer"
          >
            Fermer
          </button>
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-xl border-2 border-zinc-300 bg-white text-zinc-600 hover:border-zinc-500 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
              aria-label="Retirer l'indice avalanche"
            >
              <IconPoubelle className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
