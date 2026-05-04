"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "poc-nivo-welcome-seen";

export const WelcomeModal = () => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  const handleClose = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    },
    [handleClose]
  );

  useEffect(() => {
    if (!open) return;
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute inset-0 bg-zinc-900/60"
        aria-hidden
        onClick={handleClose}
      />
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl"
      >
        <h2
          id="welcome-modal-title"
          className="mb-3 text-lg font-semibold text-zinc-900"
        >
          Bienvenue sur le POC Nivologie
        </h2>

        <div className="flex flex-col gap-3 text-sm leading-relaxed text-zinc-700">
          <p>
            Cette application est un <strong>prototype</strong> démontrant
            l'intérêt d'un outil dédié aux{" "}
            <strong>retours terrain nivologiques quantitatifs</strong> :
            indices, observables, profils et tests de stabilité.
          </p>
          <p>
            Elle n'est <strong>pas un outil de prévision</strong> du risque
            avalanche. Les données saisies sont partagées publiquement à titre
            expérimental.
          </p>
          <p>
            La méthodologie s'inspire du{" "}
            <strong>Winter Journal</strong> (Ortovox & Ben Reuters).
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-base font-medium text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
          >
            Commencer
          </button>
          <Link
            href="/a-propos"
            onClick={handleClose}
            className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-600 hover:border-zinc-500 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
          >
            En savoir plus
          </Link>
        </div>
      </div>
    </div>
  );
};
