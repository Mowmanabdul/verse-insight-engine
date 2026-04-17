import { useState, useEffect } from "react";
import { TranslatedAyah } from "@/hooks/useQuranData";
import { PersonalNote } from "@/hooks/usePersonalNotes";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Trash2, NotebookPen } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface NotesPanelProps {
  ayah: TranslatedAyah | null;
  surahName: string;
  surahNumber: number;
  existingNote?: PersonalNote;
  allNotes: PersonalNote[];
  onSave: (params: {
    ayahNumber: number;
    arabicText: string;
    translation: string;
    content: string;
    existingId?: string;
  }) => Promise<void> | void;
  onDelete: (id: string) => void;
  onJumpToAyah?: (surahNumber: number, ayahNumber: number) => void;
}

const NotesPanel = ({
  ayah, surahName, surahNumber, existingNote, allNotes,
  onSave, onDelete, onJumpToAyah,
}: NotesPanelProps) => {
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(existingNote?.content ?? "");
  }, [existingNote?.id, ayah?.numberInSurah]);

  if (!ayah) {
    // Show all notes list when no ayah selected
    return (
      <div className="p-3 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <NotebookPen className="w-4 h-4 text-primary" />
          Your Notes
        </div>
        {allNotes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <NotebookPen className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p>Tap an ayah to write a personal reflection.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allNotes.map((note) => (
              <div
                key={note.id}
                className="p-3 rounded-lg border border-border bg-background/50 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <button
                    onClick={() => onJumpToAyah?.(note.surah_number, note.ayah_number)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {note.surah_name} {note.surah_number}:{note.ayah_number}
                  </button>
                  <button
                    onClick={() => onDelete(note.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {new Date(note.updated_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const handleSave = async () => {
    if (!draft.trim()) {
      toast({ title: "Note is empty", description: "Write something before saving." });
      return;
    }
    setSaving(true);
    await onSave({
      ayahNumber: ayah.numberInSurah,
      arabicText: ayah.text,
      translation: ayah.translation,
      content: draft.trim(),
      existingId: existingNote?.id,
    });
    setSaving(false);
    toast({ title: existingNote ? "Note updated" : "Note saved" });
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <NotebookPen className="w-4 h-4 text-primary" />
        {existingNote ? "Edit your note" : "Write a note"}
      </div>
      <div className="text-xs text-muted-foreground">
        {surahName} {surahNumber}:{ayah.numberInSurah}
      </div>
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Your personal reflection on this ayah..."
        className="min-h-[160px] resize-none text-sm"
      />
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving} size="sm" className="flex-1">
          <Save className="w-3.5 h-3.5 mr-1.5" />
          {saving ? "Saving..." : existingNote ? "Update" : "Save"}
        </Button>
        {existingNote && (
          <Button
            onClick={() => { onDelete(existingNote.id); setDraft(""); }}
            variant="outline"
            size="sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default NotesPanel;
