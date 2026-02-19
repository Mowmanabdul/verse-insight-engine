import { TranslatedAyah } from "@/hooks/useQuranData";
import { SavedInsight } from "@/hooks/useSavedInsights";
import AiPanel from "@/components/AiPanel";
import ReflectionPanel from "@/components/ReflectionPanel";
import SavedInsightsPanel from "@/components/SavedInsightsPanel";
import { BookOpen, Bookmark } from "lucide-react";

export type RightTab = "insights" | "reflection" | "saved";

interface RightPanelContentProps {
  rightTab: RightTab;
  onTabChange: (tab: RightTab) => void;
  selectedAyah: TranslatedAyah | null;
  surahName: string;
  surahNumber: number;
  verses: TranslatedAyah[];
  insights: SavedInsight[];
  onCloseAyah: () => void;
  onSaveAyahInsight: (content: string) => void;
  onSaveReflection: (content: string) => void;
  onDeleteInsight: (id: string) => void;
  isCurrentAyahSaved: boolean;
}

const tabs: { value: RightTab; label: string; icon: React.ReactNode }[] = [
  { value: "insights", label: "Insights", icon: null },
  { value: "reflection", label: "Reflect", icon: <BookOpen className="w-3 h-3" /> },
  { value: "saved", label: "Saved", icon: <Bookmark className="w-3 h-3" /> },
];

const RightPanelContent = ({
  rightTab, onTabChange, selectedAyah, surahName, surahNumber, verses,
  insights, onCloseAyah, onSaveAyahInsight, onSaveReflection, onDeleteInsight, isCurrentAyahSaved,
}: RightPanelContentProps) => (
  <div className="flex flex-col h-full">
    {/* Tab bar */}
    <div className="flex border-b border-border shrink-0">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-medium transition-colors ${
            rightTab === tab.value
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.icon}
          {tab.label}
          {tab.value === "saved" && insights.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center">
              {insights.length}
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
      {rightTab === "saved" && (
        <div className="p-3">
          <SavedInsightsPanel insights={insights} onDelete={onDeleteInsight} />
        </div>
      )}
    </div>
  </div>
);

export default RightPanelContent;
