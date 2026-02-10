"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type RangeSliderProps = {
  min: number;
  max: number;
  step?: number;
  valueLow: number;
  valueHigh: number;
  onChange: (low: number, high: number) => void;
  ariaLabelLow?: string;
  ariaLabelHigh?: string;
};

const THUMB_SIZE = 24;

export const RangeSlider = ({
  min,
  max,
  step = 1,
  valueLow,
  valueHigh,
  onChange,
  ariaLabelLow,
  ariaLabelHigh,
}: RangeSliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeThumb, setActiveThumb] = useState<"low" | "high" | null>(null);

  const clampValue = useCallback(
    (v: number) => {
      const stepped = Math.round((v - min) / step) * step + min;
      return Math.max(min, Math.min(max, stepped));
    },
    [min, max, step]
  );

  const valueToPercent = useCallback(
    (v: number) => ((v - min) / (max - min)) * 100,
    [min, max]
  );

  const percentToValue = useCallback(
    (p: number) => {
      const v = min + (p / 100) * (max - min);
      return clampValue(v);
    },
    [min, max, clampValue]
  );

  const getPercentFromEvent = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return 0;
      const rect = track.getBoundingClientRect();
      const x = clientX - rect.left;
      return Math.max(0, Math.min(100, (x / rect.width) * 100));
    },
    []
  );

  const handlePointerDown = useCallback(
    (thumb: "low" | "high") => (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setActiveThumb(thumb);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (activeThumb == null) return;
      const percent = getPercentFromEvent(e.clientX);
      const value = percentToValue(percent);
      if (activeThumb === "low") {
        const high = Math.max(value, valueHigh);
        onChange(value, high);
      } else {
        const low = Math.min(value, valueLow);
        onChange(low, value);
      }
    },
    [activeThumb, valueLow, valueHigh, getPercentFromEvent, percentToValue, onChange]
  );

  const handlePointerUp = useCallback(() => {
    setActiveThumb(null);
  }, []);

  const handleLowKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        const next = clampValue(valueLow + step);
        onChange(next, Math.max(next, valueHigh));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = clampValue(valueLow - step);
        onChange(next, valueHigh);
      }
    },
    [valueLow, valueHigh, step, clampValue, onChange]
  );

  const handleHighKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        const next = clampValue(valueHigh + step);
        onChange(valueLow, next);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = clampValue(valueHigh - step);
        onChange(Math.min(next, valueLow), next);
      }
    },
    [valueLow, valueHigh, step, clampValue, onChange]
  );

  useEffect(() => {
    if (activeThumb == null) return;
    const handleUp = () => setActiveThumb(null);
    window.addEventListener("pointerup", handleUp);
    return () => window.removeEventListener("pointerup", handleUp);
  }, [activeThumb]);

  const lowPercent = valueToPercent(valueLow);
  const highPercent = valueToPercent(valueHigh);

  const sliderClasses =
    "h-3 w-full rounded-full bg-zinc-200 relative touch-none select-none";
  const thumbClasses =
    "absolute top-1/2 -translate-y-1/2 z-[1] w-6 h-6 cursor-grab active:cursor-grabbing rounded-full bg-zinc-900 shadow transition-colors hover:bg-zinc-700 active:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2";

  return (
    <div ref={trackRef} className={`${sliderClasses} overflow-visible`}>
      <div
        className="absolute top-1/2 -translate-y-1/2 h-3 rounded-full bg-zinc-400 z-0"
        style={{
          left: `calc(${lowPercent}% - ${THUMB_SIZE / 2}px)`,
          width: `max(0px, calc(${highPercent - lowPercent}% + ${THUMB_SIZE}px))`,
        }}
        aria-hidden
      />
      <button
        type="button"
        role="slider"
        tabIndex={0}
        aria-valuemin={min}
        aria-valuemax={valueHigh}
        aria-valuenow={valueLow}
        aria-label={ariaLabelLow}
        className={`${thumbClasses} ${activeThumb === "low" ? "z-10" : ""}`}
        style={{ left: `calc(${lowPercent}% - ${THUMB_SIZE / 2}px)` }}
        onPointerDown={handlePointerDown("low")}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onKeyDown={handleLowKeyDown}
      />
      <button
        type="button"
        role="slider"
        tabIndex={0}
        aria-valuemin={valueLow}
        aria-valuemax={max}
        aria-valuenow={valueHigh}
        aria-label={ariaLabelHigh}
        className={`${thumbClasses} ${activeThumb === "high" ? "z-10" : ""}`}
        style={{ left: `calc(${highPercent}% - ${THUMB_SIZE / 2}px)` }}
        onPointerDown={handlePointerDown("high")}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onKeyDown={handleHighKeyDown}
      />
    </div>
  );
};
