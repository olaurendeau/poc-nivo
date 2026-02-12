"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StabilityTestResult, StabilityTestType } from "@/types/observation";
import {
  CT_RESULT_OPTIONS,
  ECT_RESULT_OPTIONS,
  RB_RESULT_OPTIONS,
  PST_RESULT_OPTIONS,
} from "@/types/observation";

type ProfileModalProps = {
  open: boolean;
  onClose: () => void;
  onAddTest: (test: StabilityTestResult) => void;
};

export const ProfileModal = ({
  open,
  onClose,
  onAddTest,
}: ProfileModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [type, setType] = useState<StabilityTestType>("CT");
  const [taps, setTaps] = useState("");
  const [result, setResult] = useState("");
  const [depthCm, setDepthCm] = useState("");

  const resultOptions =
    type === "CT"
      ? CT_RESULT_OPTIONS
      : type === "ECT"
        ? ECT_RESULT_OPTIONS
        : type === "RB"
          ? RB_RESULT_OPTIONS
          : PST_RESULT_OPTIONS;
  const needsTaps = type === "CT" || (type === "ECT" && (result === "P" || result === "N"));

  const resetForm = useCallback(() => {
    setType("CT");
    setTaps("");
    setResult("");
    setDepthCm("");
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  const buildScore = useCallback((): string => {
    if (type === "CT") {
      return `${taps}${result}`;
    }
    if (type === "ECT") {
      if (result === "X") return result;
      return `${result}${taps}`;
    }
    if (type === "RB") {
      return result;
    }
    return result;
  }, [type, taps, result]);

  const performSubmit = useCallback(() => {
    const depth = Number.parseInt(depthCm, 10);
    if (Number.isNaN(depth) || depth < 0) return;
    if (needsTaps) {
      const tapsNum = Number.parseInt(taps, 10);
      if (Number.isNaN(tapsNum) || tapsNum < 0) return;
    }
    if (!result) return;

    const score = buildScore();
    onAddTest({ type, score, depthCm: depth });
    resetForm();
    onClose();
  }, [type, taps, result, depthCm, needsTaps, buildScore, onAddTest, resetForm, onClose]);

  useEffect(() => {
    if (!open) return;
    resetForm();
  }, [open, resetForm]);

  useEffect(() => {
    if (!open) return;
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      'input, select, button, [href], [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
  }, [open]);

  useEffect(() => {
    setResult("");
  }, [type]);

  if (!open) return null;

  const depthNum = Number.parseInt(depthCm, 10);
  const tapsNum = Number.parseInt(taps, 10);
  const canSubmit =
    result.length > 0 &&
    !Number.isNaN(depthNum) &&
    depthNum >= 0 &&
    (!needsTaps || (!Number.isNaN(tapsNum) && tapsNum >= 0));

  const showResultFirst = type === "ECT" || type === "RB" || type === "PST";
  const showTapsField = type === "CT" || (type === "ECT" && (result === "P" || result === "N"));

  const selectedOption = resultOptions.find((o) => o.value === result);

  return (
    <div
      className="fixed inset-0 z-[2100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute inset-0 bg-zinc-900/60"
        aria-hidden
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="relative z-10 max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl"
      >
        <h3
          id="profile-modal-title"
          className="mb-3 text-lg font-semibold text-zinc-900"
        >
          Ajouter un test
        </h3>
        <div
          className="flex flex-col gap-4"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
              e.preventDefault();
              performSubmit();
            }
          }}
        >
          <div>
            <label
              htmlFor="profile-test-type"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Type
            </label>
            <select
              id="profile-test-type"
              value={type}
              onChange={(e) => setType(e.target.value as StabilityTestType)}
              className="flex min-h-[48px] w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
              aria-label="Type de test"
            >
              <option value="CT">CT (Compression Test)</option>
              <option value="ECT">ECT (Extended Column Test)</option>
              <option value="RB">RB (Rutschblock)</option>
              <option value="PST">PST (Propagation Saw Test)</option>
            </select>
          </div>

          {showResultFirst ? (
            <>
              <div>
                <label
                  htmlFor="profile-test-result"
                  className="mb-1 block text-sm font-medium text-zinc-700"
                >
                  Résultat
                </label>
                <select
                  id="profile-test-result"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="flex min-h-[48px] w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
                  aria-label="Résultat du test"
                >
                  <option value="">Choisir…</option>
                  {resultOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {selectedOption ? (
                  <p className="mt-1 text-xs text-zinc-500">
                    {selectedOption.description}
                  </p>
                ) : null}
              </div>
              {showTapsField ? (
                <div>
                  <label
                    htmlFor="profile-test-taps"
                    className="mb-1 block text-sm font-medium text-zinc-700"
                  >
                    Nombre de coups
                  </label>
                  <input
                    id="profile-test-taps"
                    type="number"
                    min={0}
                    max={30}
                    value={taps}
                    onChange={(e) => setTaps(e.target.value)}
                    placeholder="ex: 8 (pour ECTP8)"
                    className="flex min-h-[48px] w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
                    aria-label="Nombre de coups"
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    Numéro du coup auquel la rupture a eu lieu
                  </p>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div>
                <label
                  htmlFor="profile-test-taps"
                  className="mb-1 block text-sm font-medium text-zinc-700"
                >
                  Nombre de coups
                </label>
                <input
                  id="profile-test-taps"
                  type="number"
                  min={0}
                  max={30}
                  value={taps}
                  onChange={(e) => setTaps(e.target.value)}
                  placeholder="ex: 6"
                  className="flex min-h-[48px] w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
                  aria-label="Nombre de coups"
                />
              </div>
              <div>
                <label
                  htmlFor="profile-test-result"
                  className="mb-1 block text-sm font-medium text-zinc-700"
                >
                  Résultat
                </label>
                <select
                  id="profile-test-result"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="flex min-h-[48px] w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
                  aria-label="Résultat du test"
                >
                  <option value="">Choisir…</option>
                  {resultOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {selectedOption ? (
                  <p className="mt-1 text-xs text-zinc-500">
                    {selectedOption.description}
                  </p>
                ) : null}
              </div>
            </>
          )}

          <div>
            <label
              htmlFor="profile-test-depth"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Profondeur (cm)
            </label>
            <input
              id="profile-test-depth"
              type="number"
              min={0}
              max={999}
              value={depthCm}
              onChange={(e) => setDepthCm(e.target.value)}
              placeholder="ex: 40"
              className="flex min-h-[48px] w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
              aria-label="Profondeur en centimètres"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl border-2 border-zinc-300 bg-white px-4 py-3 text-base font-medium text-zinc-700 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
              aria-label="Annuler"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={performSubmit}
              disabled={!canSubmit}
              className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-base font-medium text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Ajouter le test"
            >
              Ajouter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
