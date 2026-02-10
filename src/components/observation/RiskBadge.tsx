"use client";

import type { CriticalityLevel } from "@/lib/criticality";
import {
  CRITICALITY_COLORS,
  CRITICALITY_EXPLANATION,
  CRITICALITY_LABELS,
} from "@/lib/criticality";

type RiskBadgeProps = {
  level: CriticalityLevel;
  size?: "sm" | "md";
  showLabel?: boolean;
};

export const RiskBadge = ({
  level,
  size = "md",
  showLabel = true,
}: RiskBadgeProps) => {
  const colors = CRITICALITY_COLORS[level];
  const label = CRITICALITY_LABELS[level];

  const sizeClasses =
    size === "sm"
      ? "min-h-[24px] px-2 py-0.5 text-xs"
      : "min-h-[32px] px-3 py-1.5 text-sm";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg border font-semibold ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses}`}
      aria-label={`Criticité : ${label} (niveau ${level}). ${CRITICALITY_EXPLANATION}`}
    >
      {showLabel ? label : level}
    </span>
  );
};
