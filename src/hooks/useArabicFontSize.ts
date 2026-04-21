import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "qc-arabic-size";
const DEFAULT_REM = 1.75;
const MIN_REM = 1.25;
const MAX_REM = 2.75;

function getInitial(): number {
  if (typeof window === "undefined") return DEFAULT_REM;
  const stored = localStorage.getItem(STORAGE_KEY);
  const n = stored ? parseFloat(stored) : NaN;
  return Number.isFinite(n) && n >= MIN_REM && n <= MAX_REM ? n : DEFAULT_REM;
}

function apply(rem: number) {
  document.documentElement.style.setProperty("--arabic-size", `${rem}rem`);
}

export function useArabicFontSize() {
  const [size, setSizeState] = useState<number>(getInitial);

  useEffect(() => {
    apply(size);
    localStorage.setItem(STORAGE_KEY, String(size));
  }, [size]);

  const setSize = useCallback((rem: number) => {
    const clamped = Math.min(MAX_REM, Math.max(MIN_REM, rem));
    setSizeState(clamped);
  }, []);

  return { size, setSize, min: MIN_REM, max: MAX_REM, default: DEFAULT_REM };
}
