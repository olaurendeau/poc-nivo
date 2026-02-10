"use client";

import type { IndiceKey } from "@/types/observation";
import { INDICE_LABELS } from "@/types/observation";
import { IconAvalanche, IconFissure, IconWoumpf } from "./IndiceIcons";

const INDICE_ICONS: Record<IndiceKey, React.ComponentType<{ className?: string }>> = {
  avalanche: IconAvalanche,
  fissure: IconFissure,
  woumpf: IconWoumpf,
};

type IndicesDisplayProps = {
  indices: IndiceKey[];
  avalancheDetails?: { type?: string; cassure?: string; tailles?: number[] };
};

export const IndicesDisplay = ({
  indices,
  avalancheDetails,
}: IndicesDisplayProps) => (
  <ul className="flex flex-col gap-2">
    {indices.map((key) => {
      const Icon = INDICE_ICONS[key];
      const label = INDICE_LABELS[key] ?? key;
      return (
        <li
          key={key}
          className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3"
        >
          {Icon ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-700">
              <Icon className="h-5 w-5" />
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-zinc-900">{label}</p>
            {key === "avalanche" && avalancheDetails ? (
              <AvalancheDetailsRow details={avalancheDetails} />
            ) : null}
          </div>
        </li>
      );
    })}
  </ul>
);

const AVALANCHE_TYPE_LABELS: Record<string, string> = {
  spontane: "Spontané",
  provoque: "Provoqué",
};

const AVALANCHE_CASSURE_LABELS: Record<string, string> = {
  lineaire: "Cassure linéaire",
  ponctuelle: "Cassure ponctuelle",
};

type AvalancheDetailsRowProps = {
  details: { type?: string; cassure?: string; tailles?: number[] };
};

const AvalancheDetailsRow = ({ details }: AvalancheDetailsRowProps) => {
  const parts: string[] = [];
  if (details.type) {
    parts.push(AVALANCHE_TYPE_LABELS[details.type] ?? details.type);
  }
  if (details.cassure) {
    parts.push(AVALANCHE_CASSURE_LABELS[details.cassure] ?? details.cassure);
  }
  if (details.tailles?.length) {
    parts.push(`Taille(s) : ${details.tailles.join(", ")}`);
  }
  if (parts.length === 0) return null;
  return (
    <p className="mt-0.5 text-sm text-zinc-600">{parts.join(" · ")}</p>
  );
};
