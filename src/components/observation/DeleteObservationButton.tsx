"use client";

import { deleteObservationAction } from "@/lib/db/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteObservationButtonProps = {
  observationId: string;
};

export const DeleteObservationButton = ({
  observationId,
}: DeleteObservationButtonProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (
      !window.confirm(
        "Supprimer cette observation ? Cette action est irréversible."
      )
    ) {
      return;
    }
    setIsDeleting(true);
    setError(null);
    const result = await deleteObservationAction(observationId);
    if (result.ok) {
      router.push("/");
      return;
    }
    setError(result.error);
    setIsDeleting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={isDeleting}
        className="flex min-h-[48px] items-center justify-center rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
        aria-label="Supprimer l'observation"
        tabIndex={0}
      >
        {isDeleting ? "Suppression…" : "Supprimer l'observation"}
      </button>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};
