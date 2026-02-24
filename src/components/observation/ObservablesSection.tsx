"use client";

import { useState } from "react";
import type { ObservableKey, ObservablesDetails } from "@/types/observation";
import {
  OBSERVABLE_KEYS,
  OBSERVABLE_LABELS,
} from "@/types/observation";
import { ObservablesModal } from "@/components/observation/ObservablesModal";

const toggleObservable = (
  current: ObservableKey[],
  key: ObservableKey
): ObservableKey[] => {
  if (current.includes(key)) {
    return current.filter((k) => k !== key);
  }
  return [...current, key];
};

const formatObservableSummary = (
  key: ObservableKey,
  details?: ObservablesDetails
): string => {
  if (!details) return "";

  if (key === "recentSnow" && details.recentSnow) {
    const parts: string[] = [];
    if (details.recentSnow.thicknessCm != null) {
      parts.push(`${details.recentSnow.thicknessCm} cm`);
    }
    if (details.recentSnow.wind === true) {
      parts.push("Vent");
    }
    if (details.recentSnow.warming === true) {
      parts.push("Hausse T°");
    }
    return parts.join(" · ");
  }

  if (key === "wetSnow" && details.wetSnow) {
    const parts: string[] = [];
    if (details.wetSnow.thicknessCm != null) {
      parts.push(`${details.wetSnow.thicknessCm} cm humides`);
    }
    if (details.wetSnow.firstWetting === true) {
      parts.push("1ère humidification");
    }
    if (details.wetSnow.rollersOrSluffs === true) {
      parts.push("Boulettes / purges");
    }
    return parts.join(" · ");
  }

  if (key === "windSnow" && details.windSnow) {
    const parts: string[] = [];
    if (details.windSnow.transportLocation === "crests") {
      parts.push("Près des crêtes");
    } else if (details.windSnow.transportLocation === "everywhere") {
      parts.push("Partout");
    }
    if (details.windSnow.surfaceIndices?.length) {
      const labels = details.windSnow.surfaceIndices.map((s) => {
        if (s === "erosions") return "Érosions";
        if (s === "accumulations") return "Accumulations";
        if (s === "cornices") return "Corniches";
        return s;
      });
      parts.push(labels.join(", "));
    }
    if (details.windSnow.accumulationAspect === "hardSnow") {
      parts.push("Neige dure");
    } else if (details.windSnow.accumulationAspect === "softSnow") {
      parts.push("Neige friable");
    }
    return parts.join(" · ");
  }

  if (key === "otherSurface" && details.otherSurface) {
    const flags = details.otherSurface;
    const labels: string[] = [];
    if (flags.lowSnow) labels.push("Manque de neige");
    if (flags.surfaceFacet) labels.push("Frisette");
    if (flags.surfaceHoar) labels.push("Givre");
    if (flags.surfaceCrust) labels.push("Croûte en surface");
    if (flags.windCrust) labels.push("Cartonnée");
    return labels.join(" · ");
  }

  return "";
};

export const ObservablesSection = ({
  value,
  onChange,
  details,
  onDetailsChange,
}: {
  value: ObservableKey[];
  onChange: (observables: ObservableKey[]) => void;
  details?: ObservablesDetails;
  onDetailsChange?: (details: ObservablesDetails | undefined) => void;
}) => {
  const [activeObservable, setActiveObservable] =
    useState<ObservableKey | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleToggle = (key: ObservableKey) => {
    const isSelected = value.includes(key);
    if (!isSelected) {
      onChange(toggleObservable(value, key));
    }
    setActiveObservable(key);
    setModalOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent, key: ObservableKey) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle(key);
    }
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-zinc-900">Observables</h2>
      <ul
        className="flex flex-col gap-2"
        role="group"
        aria-label="Observables"
      >
        {OBSERVABLE_KEYS.map((key) => {
          const isSelected = value.includes(key);
          const summary = formatObservableSummary(key, details);
          const hasSecondLine = isSelected && summary.length > 0;

          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => handleToggle(key)}
                onKeyDown={(e) => handleKeyDown(e, key)}
                className={`flex min-h-[48px] w-full items-center justify-center rounded-xl border-2 px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ${
                  hasSecondLine ? "flex-col gap-0.5 py-2" : ""
                } ${
                  isSelected
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
                }`}
                aria-pressed={isSelected}
                aria-label={`${OBSERVABLE_LABELS[key]}${
                  summary ? `, ${summary}` : ""
                }${isSelected ? ", sélectionné" : ""}`}
                tabIndex={0}
              >
                <span>{OBSERVABLE_LABELS[key]}</span>
                {hasSecondLine ? (
                  <span className="text-xs font-normal opacity-90">
                    {summary}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      <ObservablesModal
        open={modalOpen && Boolean(activeObservable)}
        observableKey={activeObservable}
        value={details ?? {}}
        onChange={(updated) => {
          if (!onDetailsChange) return;
          onDetailsChange(updated);
        }}
        onClose={() => setModalOpen(false)}
        onRemove={() => {
          if (!activeObservable) return;
          onChange(toggleObservable(value, activeObservable));
          if (onDetailsChange) {
            const next: ObservablesDetails = { ...(details ?? {}) };
            delete next[activeObservable];
            if (Object.keys(next).length === 0) {
              onDetailsChange(undefined);
            } else {
              onDetailsChange(next);
            }
          }
          setModalOpen(false);
        }}
      />
    </section>
  );
};
