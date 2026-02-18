import { useState } from "react";
import { TranslatedAyah } from "@/hooks/useQuranData";
import SurahList from "@/components/SurahList";
import VerseDisplay from "@/components/VerseDisplay";
import AiPanel from "@/components/AiPanel";
import ProgressHeader from "@/components/ProgressHeader";
import { Menu, X } from "lucide-react";

const Index = () => {
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [selectedAyah, setSelectedAyah] = useState<TranslatedAyah | null>(null);
  const [surahName, setSurahName] = useState("Al-Faatiha");
  const [showSidebar, setShowSidebar] = useState(false);

  const handleSurahSelect = (num: number) => {
    setSelectedSurah(num);
    setSelectedAyah(null);
    setShowSidebar(false);
  };

  const handleAyahClick = (ayah: TranslatedAyah) => {
    setSelectedAyah(selectedAyah?.number === ayah.number ? null : ayah);
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

        {/* Surah sidebar */}
        <div
          className={`${
            showSidebar ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 bg-card border-r border-border transition-transform lg:transition-none`}
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

        {/* AI Panel */}
        <div className={`${selectedAyah ? "w-80 xl:w-96" : "w-0"} hidden md:block transition-all overflow-hidden`}>
          <AiPanel
            ayah={selectedAyah}
            surahName={surahName}
            onClose={() => setSelectedAyah(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
