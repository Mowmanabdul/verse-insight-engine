import { useState, useEffect, useRef } from "react";
import { TranslatedAyah, useSurahVerses } from "@/hooks/useQuranData";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useDbInsights } from "@/hooks/useDbInsights";
import { usePersonalNotes } from "@/hooks/usePersonalNotes";
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
  const { notes, upsertNote, deleteNote, getNoteForAyah } = usePersonalNotes(user?.id);
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

  const currentNote = selectedAyah
    ? getNoteForAyah(selectedSurah, selectedAyah.numberInSurah)
    : undefined;

  const handleSaveNote = async (params: {
    ayahNumber: number;
    arabicText: string;
    translation: string;
    content: string;
    existingId?: string;
  }) => {
    await upsertNote({
      surahNumber: selectedSurah,
      surahName,
      ayahNumber: params.ayahNumber,
      arabicText: params.arabicText,
      translation: params.translation,
      content: params.content,
      existingId: params.existingId,
    });
  };

  const panelProps = {
    rightTab, onTabChange: (tab: RightTab) => setRightTab(tab),
    selectedAyah, surahName, surahNumber: selectedSurah, verses,
    insights: adaptedInsights, notes, currentNote,
    onCloseAyah: handleCloseAyah, onSaveAyahInsight: handleSaveAyahInsight,
    onSaveReflection: handleSaveReflection, onDeleteInsight: deleteInsight,
    onSaveNote: handleSaveNote, onDeleteNote: deleteNote,
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

        {/* Verse display — add bottom padding on mobile for nav bar */}
        <div className="flex-1 flex flex-col min-w-0 pb-12 md:pb-0">
          <VerseDisplay
            surahNumber={selectedSurah}
            onAyahClick={handleAyahClick}
            selectedAyah={selectedAyah?.numberInSurah ?? null}
          />
        </div>

        {/* Mobile slide-up sheet */}
        <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <SheetContent side="bottom" className="md:hidden h-[85vh] rounded-t-2xl p-0 bg-card border-border">
            <RightPanelContent {...panelProps} />
          </SheetContent>
        </Sheet>

        {/* Desktop right panel */}
        <div className={`${showRight ? "w-80 xl:w-96" : "w-0"} hidden md:block transition-all overflow-hidden`}>
          <div className="h-full border-l border-border bg-card">
            <RightPanelContent {...panelProps} />
          </div>
        </div>
      </div>

      {/* Mobile bottom nav bar — static, no overlay */}
      <div className="md:hidden flex items-center justify-around border-t border-border bg-card/95 backdrop-blur-sm px-2 py-1.5 shrink-0">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${showSidebar ? "text-primary" : "text-muted-foreground"}`}
        >
          {showSidebar ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span className="text-[9px] font-medium">Surahs</span>
        </button>
        <button
          onClick={() => { setRightTab("insights"); setMobileSheetOpen(true); }}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-muted-foreground hover:text-primary transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[9px] font-medium">Insights</span>
        </button>
        <button
          onClick={() => { setRightTab("saved"); setMobileSheetOpen(true); }}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-muted-foreground hover:text-primary transition-colors"
        >
          <Bookmark className="w-4 h-4" />
          <span className="text-[9px] font-medium">Saved</span>
        </button>
      </div>
    </div>
  );
};

export default Index;
