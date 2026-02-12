"use client";

import {
  CRITICALITY_ATTENUATION_DAYS,
  CRITICALITY_LABELS,
} from "@/lib/criticality";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type CriticalityCalculationModalProps = {
  open: boolean;
  onClose: () => void;
};

const CALCULATION_LINES = [
  {
    title: "Avalanche avec tailles",
    detail: "1–3 → Marqué, 4 → Fort, 5 → Très fort",
  },
  {
    title: "Déclenchement à distance",
    detail: "Signe typique de risque fort à très fort → niveau minimum Fort (4)",
  },
  {
    title: "Sans avalanche",
    detail: "score = indices×2 + observables → 0→Faible, 1–2→Limité, 3–4→Marqué, 5–6→Fort, 7+→Très fort",
  },
  {
    title: "Atténuation dans le temps",
    detail: `−1 palier tous les ${CRITICALITY_ATTENUATION_DAYS} jours (minimum Faible)`,
  },
] as const;

export const CriticalityCalculationModal = ({
  open,
  onClose,
}: CriticalityCalculationModalProps) => {
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
      'button, [href], [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
  }, [open]);

  if (!open) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[2000] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="criticality-modal-title"
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute inset-0 bg-zinc-900/60"
        aria-hidden
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="relative z-10 w-full max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-x border-zinc-200 bg-white p-6 shadow-xl sm:max-h-none sm:max-w-md sm:rounded-2xl sm:border"
      >
        <h3
          id="criticality-modal-title"
          className="mb-4 text-lg font-semibold text-zinc-900"
        >
          Calcul de la criticité
        </h3>

        <div className="space-y-4">
          {CALCULATION_LINES.map(({ title, detail }) => (
            <div key={title}>
              <p className="text-sm font-medium text-zinc-800">{title}</p>
              <p className="mt-1 text-sm text-zinc-600">{detail}</p>
            </div>
          ))}

          <div className="rounded-lg bg-zinc-50 p-3">
            <p className="text-xs font-medium text-zinc-500">
              Échelle : 1 = {CRITICALITY_LABELS[1]}, 2 = {CRITICALITY_LABELS[2]},{" "}
              3 = {CRITICALITY_LABELS[3]}, 4 = {CRITICALITY_LABELS[4]}, 5 ={" "}
              {CRITICALITY_LABELS[5]}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 flex min-h-[48px] w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-base font-medium text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
          aria-label="Fermer"
        >
          Fermer
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
