import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DbInsight {
  id: string;
  type: "ayah" | "reflection";
  surah_name: string;
  surah_number: number;
  ayah_number: number | null;
  arabic_text: string | null;
  translation: string | null;
  content: string;
  created_at: string;
}

export function useDbInsights(userId: string | undefined) {
  const [insights, setInsights] = useState<DbInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInsights = useCallback(async () => {
    if (!userId) { setInsights([]); setLoading(false); return; }
    const { data } = await supabase
      .from("saved_insights")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setInsights((data as DbInsight[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchInsights(); }, [fetchInsights]);

  const saveInsight = useCallback(async (insight: {
    type: "ayah" | "reflection";
    surahName: string;
    surahNumber: number;
    ayahNumber?: number;
    arabicText?: string;
    translation?: string;
    content: string;
  }) => {
    if (!userId) return;
    await supabase.from("saved_insights").insert({
      user_id: userId,
      type: insight.type,
      surah_name: insight.surahName,
      surah_number: insight.surahNumber,
      ayah_number: insight.ayahNumber ?? null,
      arabic_text: insight.arabicText ?? null,
      translation: insight.translation ?? null,
      content: insight.content,
    });
    await fetchInsights();
  }, [userId, fetchInsights]);

  const deleteInsight = useCallback(async (id: string) => {
    await supabase.from("saved_insights").delete().eq("id", id);
    setInsights((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const isInsightSaved = useCallback(
    (type: string, surahNumber: number, ayahNumber?: number) =>
      insights.some(
        (i) => i.type === type && i.surah_number === surahNumber &&
          (ayahNumber === undefined || i.ayah_number === ayahNumber)
      ),
    [insights]
  );

  return { insights, loading, saveInsight, deleteInsight, isInsightSaved };
}
