import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DailyReading {
  date: string;
  ayahsRead: number;
  minutesRead: number;
  sessions: number;
}

export interface SurahBreakdown {
  surahName: string;
  ayahsRead: number;
}

export function useDashboardData(userId: string | undefined) {
  const [dailyReadings, setDailyReadings] = useState<DailyReading[]>([]);
  const [surahBreakdown, setSurahBreakdown] = useState<SurahBreakdown[]>([]);
  const [totalAyahs, setTotalAyahs] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!userId) { setLoading(false); return; }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    const { data: sessions } = await supabase
      .from("reading_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("session_date", thirtyDaysAgo)
      .order("session_date", { ascending: true });

    if (!sessions) { setLoading(false); return; }

    // Aggregate by day
    const byDay = new Map<string, DailyReading>();
    const bySurah = new Map<string, number>();
    let tAyahs = 0, tMinutes = 0;

    for (const s of sessions) {
      const day = s.session_date.slice(0, 10);
      const ayahs = s.ayahs_read?.length ?? 0;
      const mins = Math.round(s.duration_seconds / 60);

      const existing = byDay.get(day) || { date: day, ayahsRead: 0, minutesRead: 0, sessions: 0 };
      existing.ayahsRead += ayahs;
      existing.minutesRead += mins;
      existing.sessions += 1;
      byDay.set(day, existing);

      bySurah.set(s.surah_name, (bySurah.get(s.surah_name) || 0) + ayahs);
      tAyahs += ayahs;
      tMinutes += mins;
    }

    // Fill in missing days with zeros for a complete 30-day chart
    const filled: DailyReading[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      filled.push(byDay.get(d) || { date: d, ayahsRead: 0, minutesRead: 0, sessions: 0 });
    }

    setDailyReadings(filled);
    setSurahBreakdown(
      Array.from(bySurah.entries())
        .map(([surahName, ayahsRead]) => ({ surahName, ayahsRead }))
        .sort((a, b) => b.ayahsRead - a.ayahsRead)
        .slice(0, 10)
    );
    setTotalAyahs(tAyahs);
    setTotalMinutes(tMinutes);
    setTotalSessions(sessions.length);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { dailyReadings, surahBreakdown, totalAyahs, totalMinutes, totalSessions, loading };
}
