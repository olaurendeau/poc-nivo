"use client";

import type { AvalancheDetails, IndiceKey } from "@/types/observation";
import {
  AVALANCHE_TYPE_LABELS,
  INDICE_KEYS,
  INDICE_LABELS,
} from "@/types/observation";
import { useState } from "react";
import { AvalancheModal } from "@/components/observation/AvalancheModal";
import {
  IconAvalanche,
  IconFissure,
  IconWoumpf,
} from "@/components/observation/IndiceIcons";

const formatAvalancheSummary = (d: AvalancheDetails): string => {
  const parts: string[] = [];
  if (d.type) parts.push(AVALANCHE_TYPE_LABELS[d.type]);
  if (d.cassure) parts.push(d.cassure === "lineaire" ? "Linéaire" : "Ponctuelle");
  if (d.tailles?.length) parts.push(d.tailles.join(", "));
  return parts.join(" · ");
};

type IndicesSectionProps = {
  value: IndiceKey[];
  onChange: (indices: IndiceKey[]) => void;
  avalancheDetails?: AvalancheDetails;
  onAvalancheDetailsChange?: (details: AvalancheDetails) => void;
};

const toggleIndice = (
  current: IndiceKey[],
  key: IndiceKey
): IndiceKey[] => {
  if (current.includes(key)) {
    return current.filter((k) => k !== key);
  }
  return [...current, key];
};

const INDICE_ICONS: Record<IndiceKey, React.ComponentType<{ className?: string }>> = {
  avalanche: IconAvalanche,
  fissure: IconFissure,
  woumpf: IconWoumpf,
};

export const IndicesSection = ({
  value,
  onChange,
  avalancheDetails = {},
  onAvalancheDetailsChange,
}: IndicesSectionProps) => {
  const [avalancheModalOpen, setAvalancheModalOpen] = useState(false);

  const handleToggle = (key: IndiceKey) => {
    const willBeSelected = !value.includes(key);
    if (key === "avalanche" && willBeSelected) {
      onChange(toggleIndice(value, key));
      setAvalancheModalOpen(true);
    } else {
      onChange(toggleIndice(value, key));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, key: IndiceKey) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle(key);
    }
  };

  const handleCloseAvalancheModal = () => {
    setAvalancheModalOpen(false);
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-zinc-900">Indices</h2>
      <ul className="flex flex-col gap-2" role="group" aria-label="Indices observés">
        {INDICE_KEYS.map((key) => {
          const isSelected = value.includes(key);
          const Icon = INDICE_ICONS[key];
          const isAvalanche = key === "avalanche";
          const avalancheSummary =
            isAvalanche && isSelected && avalancheDetails
              ? formatAvalancheSummary(avalancheDetails)
              : "";
          const hasSecondLine = isAvalanche && avalancheSummary.length > 0;
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => handleToggle(key)}
                onKeyDown={(e) => handleKeyDown(e, key)}
                className={`flex min-h-[48px] w-full items-center justify-center gap-3 rounded-xl border-2 px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ${
                  hasSecondLine ? "flex-col gap-0.5 py-2" : ""
                } ${
                  isSelected
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
                }`}
                aria-pressed={isSelected}
                aria-label={`${INDICE_LABELS[key]}${avalancheSummary ? `, ${avalancheSummary}` : ""}${isSelected ? ", sélectionné" : ""}`}
                tabIndex={0}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-6 w-6 shrink-0" />
                  {INDICE_LABELS[key]}
                </span>
                {hasSecondLine ? (
                  <span className="text-xs font-normal opacity-90">
                    {avalancheSummary}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      <AvalancheModal
        open={avalancheModalOpen}
        value={avalancheDetails}
        onChange={onAvalancheDetailsChange ?? (() => {})}
        onClose={handleCloseAvalancheModal}
      />
    </section>
  );
};
