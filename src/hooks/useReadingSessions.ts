import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useReadingSessions(userId: string | undefined) {
  const logSession = useCallback(async (
    surahNumber: number,
    surahName: string,
    ayahsRead: number[],
    durationSeconds: number,
  ) => {
    if (!userId) return;
    await supabase.from("reading_sessions").insert({
      user_id: userId,
      surah_number: surahNumber,
      surah_name: surahName,
      ayahs_read: ayahsRead,
      duration_seconds: durationSeconds,
    });
  }, [userId]);

  return { logSession };
}
