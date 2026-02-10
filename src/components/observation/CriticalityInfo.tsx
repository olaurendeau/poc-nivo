"use client";

import { CriticalityCalculationModal } from "@/components/observation/CriticalityCalculationModal";
import { CRITICALITY_EXPLANATION } from "@/lib/criticality";
import { useState } from "react";

export const CriticalityInfo = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  return (
    <>
      <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
        <span>{CRITICALITY_EXPLANATION}</span>
        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex min-h-[24px] min-w-[24px] shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-600 hover:bg-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
          aria-label="Voir le détail du calcul de criticité"
        >
          ?
        </button>
      </p>

      <CriticalityCalculationModal open={modalOpen} onClose={handleCloseModal} />
    </>
  );
};
