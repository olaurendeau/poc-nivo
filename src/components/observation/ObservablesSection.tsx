"use client";

import type { ObservableKey } from "@/types/observation";
import {
  OBSERVABLE_KEYS,
  OBSERVABLE_LABELS,
} from "@/types/observation";

type ObservablesSectionProps = {
  value: ObservableKey[];
  onChange: (observables: ObservableKey[]) => void;
};

const toggleObservable = (
  current: ObservableKey[],
  key: ObservableKey
): ObservableKey[] => {
  if (current.includes(key)) {
    return current.filter((k) => k !== key);
  }
  return [...current, key];
};

export const ObservablesSection = ({
  value,
  onChange,
}: ObservablesSectionProps) => {
  const handleToggle = (key: ObservableKey) => {
    onChange(toggleObservable(value, key));
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
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => handleToggle(key)}
                onKeyDown={(e) => handleKeyDown(e, key)}
                className={`flex min-h-[48px] w-full items-center justify-center rounded-xl border-2 px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ${
                  isSelected
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
                }`}
                aria-pressed={isSelected}
                aria-label={`${OBSERVABLE_LABELS[key]}${isSelected ? ", sélectionné" : ""}`}
                tabIndex={0}
              >
                {OBSERVABLE_LABELS[key]}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
