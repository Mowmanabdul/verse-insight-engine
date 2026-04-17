import { TranslatedAyah } from "@/hooks/useQuranData";
import { SavedInsight } from "@/hooks/useSavedInsights";
import { PersonalNote } from "@/hooks/usePersonalNotes";
import AiPanel from "@/components/AiPanel";
import ReflectionPanel from "@/components/ReflectionPanel";
import SavedInsightsPanel from "@/components/SavedInsightsPanel";
import MemorizationPanel from "@/components/MemorizationPanel";
import NotesPanel from "@/components/NotesPanel";
import { BookOpen, Bookmark, Brain, NotebookPen } from "lucide-react";

export type RightTab = "insights" | "notes" | "reflection" | "memorize" | "saved";

interface RightPanelContentProps {
  rightTab: RightTab;
  onTabChange: (tab: RightTab) => void;
  selectedAyah: TranslatedAyah | null;
  surahName: string;
  surahNumber: number;
  verses: TranslatedAyah[];
  insights: SavedInsight[];
  notes: PersonalNote[];
  currentNote?: PersonalNote;
  onCloseAyah: () => void;
  onSaveAyahInsight: (content: string) => void;
  onSaveReflection: (content: string) => void;
  onDeleteInsight: (id: string) => void;
  onSaveNote: (params: {
    ayahNumber: number;
    arabicText: string;
    translation: string;
    content: string;
    existingId?: string;
  }) => Promise<void> | void;
  onDeleteNote: (id: string) => void;
  isCurrentAyahSaved: boolean;
}

const tabs: { value: RightTab; label: string; icon: React.ReactNode }[] = [
  { value: "insights", label: "AI", icon: null },
  { value: "notes", label: "Notes", icon: <NotebookPen className="w-3 h-3" /> },
  { value: "reflection", label: "Reflect", icon: <BookOpen className="w-3 h-3" /> },
  { value: "memorize", label: "Memo", icon: <Brain className="w-3 h-3" /> },
  { value: "saved", label: "Saved", icon: <Bookmark className="w-3 h-3" /> },
];

const RightPanelContent = ({
  rightTab, onTabChange, selectedAyah, surahName, surahNumber, verses,
  insights, notes, currentNote, onCloseAyah, onSaveAyahInsight, onSaveReflection,
  onDeleteInsight, onSaveNote, onDeleteNote, isCurrentAyahSaved,
}: RightPanelContentProps) => (
  <div className="flex flex-col h-full">
    {/* Tab bar */}
    <div className="flex border-b border-border shrink-0">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`flex-1 flex items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors ${
            rightTab === tab.value
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.icon}
          {tab.label}
          {tab.value === "saved" && insights.length > 0 && (
            <span className="w-3.5 h-3.5 rounded-full bg-primary/20 text-primary text-[9px] flex items-center justify-center">
              {insights.length}
            </span>
          )}
          {tab.value === "notes" && notes.length > 0 && (
            <span className="w-3.5 h-3.5 rounded-full bg-primary/20 text-primary text-[9px] flex items-center justify-center">
              {notes.length}
            </span>
          )}
        </button>
      ))}
    </div>

    {/* Tab content */}
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      {rightTab === "insights" && (
        <AiPanel
          ayah={selectedAyah}
          surahName={surahName}
          onClose={onCloseAyah}
          onSave={onSaveAyahInsight}
          isSaved={isCurrentAyahSaved}
        />
      )}
      {rightTab === "notes" && (
        <NotesPanel
          ayah={selectedAyah}
          surahName={surahName}
          surahNumber={surahNumber}
          existingNote={currentNote}
          allNotes={notes}
          onSave={onSaveNote}
          onDelete={onDeleteNote}
        />
      )}
      {rightTab === "reflection" && (
        <div className="p-4">
          <ReflectionPanel
            surahName={surahName}
            surahNumber={surahNumber}
            verses={verses}
            onSave={onSaveReflection}
          />
        </div>
      )}
      {rightTab === "memorize" && (
        <MemorizationPanel verses={verses} surahName={surahName} />
      )}
      {rightTab === "saved" && (
        <div className="p-3">
          <SavedInsightsPanel insights={insights} onDelete={onDeleteInsight} />
        </div>
      )}
    </div>
  </div>
);

export default RightPanelContent;
