"use client";

import { useCallback, useEffect, useRef } from "react";

type ProfileModalProps = {
  open: boolean;
  onClose: () => void;
};

export const ProfileModal = ({ open, onClose }: ProfileModalProps) => {
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

  return (
    <div
      className="fixed inset-0 z-[2100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
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
          id="profile-modal-title"
          className="mb-3 text-lg font-semibold text-zinc-900"
        >
          Profils &amp; tests
        </h3>
        <p className="text-sm text-zinc-600">
          En construction pour le moment. Cette section permettra de saisir les
          profils de neige et les tests CT / ECT.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-base font-medium text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
          aria-label="Fermer la modale Profils et tests"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

