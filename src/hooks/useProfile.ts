import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  daily_reading_goal: number;
  current_streak: number;
  longest_streak: number;
  last_read_date: string | null;
}

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!userId) { setProfile(null); setLoading(false); return; }
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<Pick<Profile, "display_name" | "daily_reading_goal">>) => {
    if (!userId) return;
    await supabase.from("profiles").update(updates).eq("id", userId);
    await fetchProfile();
  }, [userId, fetchProfile]);

  const updateStreak = useCallback(async () => {
    if (!userId || !profile) return;
    const today = new Date().toISOString().slice(0, 10);
    if (profile.last_read_date === today) return; // already logged today

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newStreak = profile.last_read_date === yesterday ? profile.current_streak + 1 : 1;
    const newLongest = Math.max(newStreak, profile.longest_streak);

    await supabase.from("profiles").update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_read_date: today,
    }).eq("id", userId);
    await fetchProfile();
  }, [userId, profile, fetchProfile]);

  return { profile, loading, updateProfile, updateStreak };
}
