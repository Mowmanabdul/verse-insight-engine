import { useState, useEffect } from "react";
import { TranslatedAyah, useSurahVerses } from "@/hooks/useQuranData";
import { useSavedInsights } from "@/hooks/useSavedInsights";
import SurahList from "@/components/SurahList";
import VerseDisplay from "@/components/VerseDisplay";
import ProgressHeader from "@/components/ProgressHeader";
import RightPanelContent, { RightTab } from "@/components/RightPanelContent";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu, X, Sparkles, Bookmark } from "lucide-react";

const Index = () => {
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [selectedAyah, setSelectedAyah] = useState<TranslatedAyah | null>(null);
  const [surahName, setSurahName] = useState("Al-Faatiha");
  const [showSidebar, setShowSidebar] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>("insights");
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

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
      setMobileSheetOpen(true);
    }
  };

  // Close mobile sheet when ayah deselected
  useEffect(() => {
    if (!selectedAyah && rightTab === "insights") {
      setMobileSheetOpen(false);
    }
  }, [selectedAyah]);

  const handleSaveAyahInsight = (content: string) => {
    if (!selectedAyah) return;
    saveInsight({
      type: "ayah", surahName, surahNumber: selectedSurah,
      ayahNumber: selectedAyah.numberInSurah, arabicText: selectedAyah.text,
      translation: selectedAyah.translation, content,
    });
  };

  const handleSaveReflection = (content: string) => {
    saveInsight({ type: "reflection", surahName, surahNumber: selectedSurah, content });
  };

  const isCurrentAyahSaved = selectedAyah
    ? isInsightSaved("ayah", selectedSurah, selectedAyah.numberInSurah)
    : false;

  const showRight = showRightPanel || selectedAyah;

  const handleCloseAyah = () => {
    setSelectedAyah(null);
    setShowRightPanel(false);
    setMobileSheetOpen(false);
  };

  const panelProps = {
    rightTab, onTabChange: (tab: RightTab) => setRightTab(tab),
    selectedAyah, surahName, surahNumber: selectedSurah, verses,
    insights, onCloseAyah: handleCloseAyah, onSaveAyahInsight: handleSaveAyahInsight,
    onSaveReflection: handleSaveReflection, onDeleteInsight: deleteInsight,
    isCurrentAyahSaved,
  };

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

        {/* Mobile right panel FABs */}
        <div className="md:hidden fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          <button
            onClick={() => { setRightTab("saved"); setMobileSheetOpen(true); }}
            className="w-11 h-11 rounded-full bg-secondary text-foreground flex items-center justify-center shadow-lg border border-border"
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setRightTab("insights"); setMobileSheetOpen(true); }}
            className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile slide-up sheet */}
        <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <SheetContent side="bottom" className="md:hidden h-[85vh] rounded-t-2xl p-0 bg-card border-border">
            <RightPanelContent {...panelProps} />
          </SheetContent>
        </Sheet>

        {/* Surah sidebar */}
        <div
          className={`${showSidebar ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 bg-card border-r border-border transition-transform lg:transition-none`}
        >
          <SurahList selectedSurah={selectedSurah} onSelectSurah={handleSurahSelect} />
        </div>

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

        {/* Desktop right panel */}
        <div className={`${showRight ? "w-80 xl:w-96" : "w-0"} hidden md:block transition-all overflow-hidden`}>
          <div className="h-full border-l border-border bg-card">
            <RightPanelContent {...panelProps} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
