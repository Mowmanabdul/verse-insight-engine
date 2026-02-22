import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useLastRead(userId: string | undefined) {
  const saveLastRead = useCallback(async (surahNumber: number, surahName: string) => {
    if (!userId) return;
    // Store in localStorage for instant restore, backed by profile
    localStorage.setItem("lastRead", JSON.stringify({ surahNumber, surahName }));
  }, [userId]);

  const getLastRead = useCallback((): { surahNumber: number; surahName: string } | null => {
    try {
      const stored = localStorage.getItem("lastRead");
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  }, []);

  return { saveLastRead, getLastRead };
}
