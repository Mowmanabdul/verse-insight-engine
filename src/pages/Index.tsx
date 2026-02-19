import { useState } from "react";
import { TranslatedAyah, useSurahVerses } from "@/hooks/useQuranData";
import { useSavedInsights } from "@/hooks/useSavedInsights";
import SurahList from "@/components/SurahList";
import VerseDisplay from "@/components/VerseDisplay";
import AiPanel from "@/components/AiPanel";
import ProgressHeader from "@/components/ProgressHeader";
import ReflectionPanel from "@/components/ReflectionPanel";
import SavedInsightsPanel from "@/components/SavedInsightsPanel";
import { Menu, X, BookOpen, Bookmark } from "lucide-react";

type RightTab = "insights" | "reflection" | "saved";

const Index = () => {
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [selectedAyah, setSelectedAyah] = useState<TranslatedAyah | null>(null);
  const [surahName, setSurahName] = useState("Al-Faatiha");
  const [showSidebar, setShowSidebar] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>("insights");
  const [showRightPanel, setShowRightPanel] = useState(false);

  const { verses } = useSurahVerses(selectedSurah);
  const { insights, saveInsight, deleteInsight, isInsightSaved } = useSavedInsights();

  const handleSurahSelect = (num: number) => {
    setSelectedSurah(num);
    setSelectedAyah(null);
    setShowSidebar(false);
  };

  const handleAyahClick = (ayah: TranslatedAyah) => {
    const isDeselect = selectedAyah?.number === ayah.number;
    setSelectedAyah(isDeselect ? null : ayah);
    if (!isDeselect) {
      setRightTab("insights");
      setShowRightPanel(true);
    }
  };

  const handleSaveAyahInsight = (content: string) => {
    if (!selectedAyah) return;
    saveInsight({
      type: "ayah",
      surahName,
      surahNumber: selectedSurah,
      ayahNumber: selectedAyah.numberInSurah,
      arabicText: selectedAyah.text,
      translation: selectedAyah.translation,
      content,
    });
  };

  const handleSaveReflection = (content: string) => {
    saveInsight({
      type: "reflection",
      surahName,
      surahNumber: selectedSurah,
      content,
    });
  };

  const rightTabs: { value: RightTab; label: string; icon: React.ReactNode }[] = [
    { value: "insights", label: "Insights", icon: null },
    { value: "reflection", label: "Reflect", icon: <BookOpen className="w-3 h-3" /> },
    { value: "saved", label: "Saved", icon: <Bookmark className="w-3 h-3" /> },
  ];

  const isCurrentAyahSaved = selectedAyah
    ? isInsightSaved("ayah", selectedSurah, selectedAyah.numberInSurah)
    : false;

  const showRight = showRightPanel || selectedAyah;

  return (
    <div className="h-screen flex flex-col bg-background">
      <ProgressHeader
        currentSurah={surahName}
        totalSurahs={114}
        currentSurahNumber={selectedSurah}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile menu button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="lg:hidden fixed bottom-4 left-4 z-50 w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
        >
          {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Mobile right panel toggle */}
        <button
          onClick={() => { setShowRightPanel(!showRightPanel); if (!showRightPanel) setRightTab("saved"); }}
          className="md:hidden fixed bottom-4 right-4 z-50 w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
        >
          <Bookmark className="w-5 h-5" />
        </button>

        {/* Surah sidebar */}
        <div
          className={`${showSidebar ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 bg-card border-r border-border transition-transform lg:transition-none`}
        >
          <SurahList selectedSurah={selectedSurah} onSelectSurah={handleSurahSelect} />
        </div>

        {/* Overlay for mobile sidebar */}
        {showSidebar && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-background/60 backdrop-blur-sm"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Verse display */}
        <div className="flex-1 flex flex-col min-w-0">
          <VerseDisplay
            surahNumber={selectedSurah}
            onAyahClick={handleAyahClick}
            selectedAyah={selectedAyah?.numberInSurah ?? null}
          />
        </div>

        {/* Right panel */}
        <div className={`${showRight ? "w-80 xl:w-96" : "w-0"} hidden md:block transition-all overflow-hidden`}>
          <div className="h-full flex flex-col border-l border-border bg-card">
            {/* Tab bar */}
            <div className="flex border-b border-border">
              {rightTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => { setRightTab(tab.value); setShowRightPanel(true); }}
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
                  onClose={() => { setSelectedAyah(null); setShowRightPanel(false); }}
                  onSave={handleSaveAyahInsight}
                  isSaved={isCurrentAyahSaved}
                />
              )}
              {rightTab === "reflection" && (
                <div className="p-4">
                  <ReflectionPanel
                    surahName={surahName}
                    surahNumber={selectedSurah}
                    verses={verses}
                    onSave={handleSaveReflection}
                  />
                </div>
              )}
              {rightTab === "saved" && (
                <div className="p-3">
                  <SavedInsightsPanel insights={insights} onDelete={deleteInsight} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
