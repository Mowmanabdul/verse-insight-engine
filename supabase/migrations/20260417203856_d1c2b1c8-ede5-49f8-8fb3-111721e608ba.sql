CREATE TABLE public.personal_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  surah_number INTEGER NOT NULL,
  surah_name TEXT NOT NULL,
  ayah_number INTEGER NOT NULL,
  arabic_text TEXT,
  translation TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.personal_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON public.personal_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON public.personal_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON public.personal_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON public.personal_notes
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_personal_notes_user_ayah ON public.personal_notes(user_id, surah_number, ayah_number);

CREATE TRIGGER update_personal_notes_updated_at
  BEFORE UPDATE ON public.personal_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();