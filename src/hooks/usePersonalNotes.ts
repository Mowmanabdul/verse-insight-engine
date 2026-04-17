import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PersonalNote {
  id: string;
  surah_number: number;
  surah_name: string;
  ayah_number: number;
  arabic_text: string | null;
  translation: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export function usePersonalNotes(userId: string | undefined) {
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    if (!userId) { setNotes([]); setLoading(false); return; }
    const { data } = await supabase
      .from("personal_notes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    setNotes((data as PersonalNote[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const upsertNote = useCallback(async (params: {
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    arabicText?: string;
    translation?: string;
    content: string;
    existingId?: string;
  }) => {
    if (!userId) return;
    if (params.existingId) {
      await supabase.from("personal_notes")
        .update({ content: params.content })
        .eq("id", params.existingId);
    } else {
      await supabase.from("personal_notes").insert({
        user_id: userId,
        surah_number: params.surahNumber,
        surah_name: params.surahName,
        ayah_number: params.ayahNumber,
        arabic_text: params.arabicText ?? null,
        translation: params.translation ?? null,
        content: params.content,
      });
    }
    await fetchNotes();
  }, [userId, fetchNotes]);

  const deleteNote = useCallback(async (id: string) => {
    await supabase.from("personal_notes").delete().eq("id", id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const getNoteForAyah = useCallback(
    (surahNumber: number, ayahNumber: number) =>
      notes.find((n) => n.surah_number === surahNumber && n.ayah_number === ayahNumber),
    [notes]
  );

  return { notes, loading, upsertNote, deleteNote, getNoteForAyah };
}
