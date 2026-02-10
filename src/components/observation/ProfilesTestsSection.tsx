"use client";

import { useState } from "react";
import { ProfileModal } from "@/components/observation/ProfileModal";

const IconProfile = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 19c1.5-3 4-5 7-5s5.5 2 7 5" />
  </svg>
);

export const ProfilesTestsSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpen();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-zinc-900">
        Profils &amp; tests
      </h2>
      <p className="mb-3 text-sm text-zinc-600">
        À venir : profils de neige et tests CT / ECT.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleOpen}
          onKeyDown={handleKeyDown}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-3 rounded-xl border-2 border-zinc-300 bg-white px-4 py-3 text-base font-medium text-zinc-700 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
          aria-label="Ouvrir la section Profil (en construction)"
          tabIndex={0}
        >
          <IconProfile className="h-6 w-6 shrink-0" />
          Profil (en construction)
        </button>
        <button
          type="button"
          onClick={handleOpen}
          onKeyDown={handleKeyDown}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-3 rounded-xl border-2 border-zinc-300 bg-white px-4 py-3 text-base font-medium text-zinc-700 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
          aria-label="Ouvrir la section Tests (en construction)"
          tabIndex={0}
        >
          <IconProfile className="h-6 w-6 shrink-0" />
          Tests (en construction)
        </button>
      </div>
      <ProfileModal open={isOpen} onClose={handleClose} />
    </section>
  );
};

