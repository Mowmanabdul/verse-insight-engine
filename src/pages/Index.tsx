import { useState, useEffect, useRef } from "react";
import { TranslatedAyah, useSurahVerses } from "@/hooks/useQuranData";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useDbInsights } from "@/hooks/useDbInsights";
import { useReadingSessions } from "@/hooks/useReadingSessions";
import { useLastRead } from "@/hooks/useLastRead";
import SurahList from "@/components/SurahList";
import VerseDisplay from "@/components/VerseDisplay";
import ProgressHeader from "@/components/ProgressHeader";
import RightPanelContent, { RightTab } from "@/components/RightPanelContent";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu, X, Sparkles, Bookmark } from "lucide-react";

const Index = () => {
  const { user, signOut } = useAuth();
  const { profile, updateStreak } = useProfile(user?.id);
  const { insights, saveInsight, deleteInsight, isInsightSaved } = useDbInsights(user?.id);
  const { logSession } = useReadingSessions(user?.id);
  const { saveLastRead, getLastRead } = useLastRead(user?.id);

  // Restore last read position
  const lastRead = getLastRead();
  const [selectedSurah, setSelectedSurah] = useState(lastRead?.surahNumber ?? 1);
  const [surahName, setSurahName] = useState(lastRead?.surahName ?? "Al-Faatiha");

  const [selectedAyah, setSelectedAyah] = useState<TranslatedAyah | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>("insights");
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const [readAyahs, setReadAyahs] = useState<Set<number>>(new Set());
  const sessionStartRef = useRef(Date.now());

  const { verses } = useSurahVerses(selectedSurah);

  const handleSurahSelect = (num: number, name: string) => {
    if (readAyahs.size > 0) {
      const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
      logSession(selectedSurah, surahName, Array.from(readAyahs), duration);
    }
    setSelectedSurah(num);
    setSurahName(name);
    setSelectedAyah(null);
    setShowSidebar(false);
    setReadAyahs(new Set());
    sessionStartRef.current = Date.now();
    saveLastRead(num, name);
  };

  const handleAyahClick = (ayah: TranslatedAyah) => {
    const isDeselect = selectedAyah?.number === ayah.number;
    setSelectedAyah(isDeselect ? null : ayah);

    if (!isDeselect) {
      setReadAyahs((prev) => new Set(prev).add(ayah.numberInSurah));
      updateStreak();
      setRightTab("insights");
      setShowRightPanel(true);
      setMobileSheetOpen(true);
    }
  };

  useEffect(() => {
    if (!selectedAyah && rightTab === "insights") {
      setMobileSheetOpen(false);
    }
  }, [selectedAyah]);

  // Log session on unmount
  useEffect(() => {
    return () => {
      if (readAyahs.size > 0) {
        const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
        logSession(selectedSurah, surahName, Array.from(readAyahs), duration);
      }
    };
  }, []);

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

  const adaptedInsights = insights.map((i) => ({
    id: i.id,
    type: i.type as "ayah" | "reflection",
    surahName: i.surah_name,
    surahNumber: i.surah_number,
    ayahNumber: i.ayah_number ?? undefined,
    arabicText: i.arabic_text ?? undefined,
    translation: i.translation ?? undefined,
    content: i.content,
    savedAt: i.created_at,
  }));

  const panelProps = {
    rightTab, onTabChange: (tab: RightTab) => setRightTab(tab),
    selectedAyah, surahName, surahNumber: selectedSurah, verses,
    insights: adaptedInsights, onCloseAyah: handleCloseAyah, onSaveAyahInsight: handleSaveAyahInsight,
    onSaveReflection: handleSaveReflection, onDeleteInsight: deleteInsight,
    isCurrentAyahSaved,
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <ProgressHeader
        currentSurah={surahName}
        totalSurahs={114}
        currentSurahNumber={selectedSurah}
        streak={profile?.current_streak ?? 0}
        dailyGoal={profile?.daily_reading_goal ?? 10}
        ayahsReadToday={readAyahs.size}
        userEmail={user?.email}
        displayName={profile?.display_name ?? undefined}
        onSignOut={signOut}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile menu button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="lg:hidden fixed bottom-4 left-4 z-50 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25"
        >
          {showSidebar ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Mobile right panel FABs */}
        <div className="md:hidden fixed bottom-4 right-4 z-50 flex flex-col gap-1.5">
          <button
            onClick={() => { setRightTab("saved"); setMobileSheetOpen(true); }}
            className="w-10 h-10 rounded-full bg-secondary text-foreground flex items-center justify-center shadow-lg border border-border"
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setRightTab("insights"); setMobileSheetOpen(true); }}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25"
          >
            <Sparkles className="w-3.5 h-3.5" />
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
