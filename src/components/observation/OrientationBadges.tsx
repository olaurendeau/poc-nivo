"use client";

import type { OrientationKey } from "@/types/observation";
import { ORIENTATION_LABELS } from "@/types/observation";

type OrientationBadgesProps = {
  orientations: OrientationKey[];
};

export const OrientationBadges = ({ orientations }: OrientationBadgesProps) => (
  <div className="flex flex-wrap gap-2">
    {orientations.map((key) => (
      <span
        key={key}
        className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-800"
      >
        {ORIENTATION_LABELS[key] ?? key}
      </span>
    ))}
  </div>
);
