import { useState, useEffect, useCallback } from "react";

export interface SavedInsight {
  id: string;
  type: "ayah" | "reflection";
  surahName: string;
  surahNumber: number;
  ayahNumber?: number;
  arabicText?: string;
  translation?: string;
  content: string;
  savedAt: string;
}

const STORAGE_KEY = "quran-companion-insights";

function loadInsights(): SavedInsight[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useSavedInsights() {
  const [insights, setInsights] = useState<SavedInsight[]>(loadInsights);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(insights));
  }, [insights]);

  const saveInsight = useCallback((insight: Omit<SavedInsight, "id" | "savedAt">) => {
    const newInsight: SavedInsight = {
      ...insight,
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
    };
    setInsights((prev) => [newInsight, ...prev]);
    return newInsight;
  }, []);

  const deleteInsight = useCallback((id: string) => {
    setInsights((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const isInsightSaved = useCallback(
    (type: string, surahNumber: number, ayahNumber?: number) => {
      return insights.some(
        (i) =>
          i.type === type &&
          i.surahNumber === surahNumber &&
          (ayahNumber === undefined || i.ayahNumber === ayahNumber)
      );
    },
    [insights]
  );

  return { insights, saveInsight, deleteInsight, isInsightSaved };
}
