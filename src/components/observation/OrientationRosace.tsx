"use client";

import type { OrientationKey } from "@/types/observation";
import { ORIENTATION_KEYS } from "@/types/observation";

const RADIUS = 70;
const CENTER = 100;
const SIZE = 200;
const BUTTON_SIZE = 48;

/** Angle en degrés pour placer N en haut, sens horaire. */
const ORIENTATION_ANGLE: Record<OrientationKey, number> = {
  N: 90,
  NE: 45,
  E: 0,
  SE: 315,
  S: 270,
  SO: 225,
  O: 180,
  NO: 135,
};

const angleToPosition = (angleDeg: number) => {
  const rad = (angleDeg * Math.PI) / 180;
  const x = CENTER + RADIUS * Math.cos(rad);
  const y = CENTER - RADIUS * Math.sin(rad);
  return { x: x - BUTTON_SIZE / 2, y: y - BUTTON_SIZE / 2 };
};

type OrientationRosaceProps = {
  value: OrientationKey[];
  onChange: (orientations: OrientationKey[]) => void;
};

const toggleOrientation = (
  current: OrientationKey[],
  key: OrientationKey
): OrientationKey[] => {
  if (current.includes(key)) {
    return current.filter((k) => k !== key);
  }
  return [...current, key];
};

export const OrientationRosace = ({
  value,
  onChange,
}: OrientationRosaceProps) => {
  const handleToggle = (key: OrientationKey) => {
    onChange(toggleOrientation(value, key));
  };

  const handleKeyDown = (e: React.KeyboardEvent, key: OrientationKey) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle(key);
    }
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-lg font-semibold text-zinc-900">
        Orientation(s) de la pente
      </h2>
      <p className="mb-3 text-sm text-zinc-600">
        Une ou plusieurs expositions.
      </p>
      <div
        className="relative mx-auto"
        style={{ width: SIZE, height: SIZE }}
        role="group"
        aria-label="Orientations de la pente"
      >
        {/* Cercle de fond (décoratif) */}
        <div
          className="absolute rounded-full border-2 border-zinc-200"
          style={{
            width: RADIUS * 2,
            height: RADIUS * 2,
            left: CENTER - RADIUS,
            top: CENTER - RADIUS,
          }}
        />
        {ORIENTATION_KEYS.map((key) => {
          const isSelected = value.includes(key);
          const { x, y } = angleToPosition(ORIENTATION_ANGLE[key]);
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleToggle(key)}
              onKeyDown={(e) => handleKeyDown(e, key)}
              className={`absolute flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full border-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ${
                isSelected
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
              }`}
              style={{
                left: x,
                top: y,
                width: BUTTON_SIZE,
                height: BUTTON_SIZE,
              }}
              aria-pressed={isSelected}
              aria-label={`${key}${isSelected ? ", sélectionné" : ""}`}
              tabIndex={0}
              title={key}
            >
              {key}
            </button>
          );
        })}
      </div>
    </section>
  );
};
