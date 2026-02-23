import { useState, useRef, useEffect } from "react";
import { useSurahVerses, TranslatedAyah } from "@/hooks/useQuranData";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { motion } from "framer-motion";
import { Play, Pause, Loader2 } from "lucide-react";

type DisplayMode = "both" | "arabic" | "english";

interface VerseDisplayProps {
  surahNumber: number;
  onAyahClick: (ayah: TranslatedAyah) => void;
  selectedAyah: number | null;
}

const VerseDisplay = ({ surahNumber, onAyahClick, selectedAyah }: VerseDisplayProps) => {
  const { verses, loading, surahInfo } = useSurahVerses(surahNumber);
  const { playingAyah, isLoading: audioLoading, play, stop } = useAudioPlayer();
  const [displayMode, setDisplayMode] = useState<DisplayMode>("both");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to top when surah changes
  // Stop audio & scroll to top when surah changes
  useEffect(() => {
    stop();
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [surahNumber]);

  // Keyboard: Escape to deselect
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedAyah) {
        onAyahClick({ numberInSurah: selectedAyah } as TranslatedAyah); // trigger deselect
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedAyah, onAyahClick]);

  const modes: { value: DisplayMode; label: string }[] = [
    { value: "both", label: "Both" },
    { value: "arabic", label: "عربي" },
    { value: "english", label: "English" },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading verses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Surah header */}
      <div className="px-6 py-5 border-b border-border text-center">
        {surahInfo && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="font-arabic text-2xl text-primary gold-glow">{surahInfo.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {surahInfo.englishName} — {surahInfo.englishNameTranslation}
            </p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                surahInfo.revelationType === "Meccan"
                  ? "bg-primary/10 text-primary/70"
                  : "bg-accent/30 text-accent-foreground/70"
              }`}>
                {surahInfo.revelationType}
              </span>
              <span className="text-xs text-muted-foreground">{surahInfo.numberOfAyahs} Ayahs</span>
            </div>
          </motion.div>
        )}

        {/* Display mode toggle */}
        <div className="flex items-center justify-center gap-1 mt-4">
          {modes.map((m) => (
            <button
              key={m.value}
              onClick={() => setDisplayMode(m.value)}
              className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                displayMode === m.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bismillah */}
      {surahNumber !== 1 && surahNumber !== 9 && (
        <div className="text-center py-6 text-arabic text-primary/70 border-b border-border/30">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
      )}

      {/* Verses */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 pb-8">
        {verses.map((ayah, i) => (
          <motion.div
            key={ayah.number}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(i * 0.02, 0.8) }}
            onClick={() => onAyahClick(ayah)}
            className={`group cursor-pointer px-4 py-4 rounded-lg mb-1 transition-all ${
              selectedAyah === ayah.numberInSurah
                ? "bg-primary/10 ring-1 ring-primary/30 shadow-sm shadow-primary/5"
                : "hover:bg-secondary/50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 flex flex-col items-center gap-1.5 mt-1">
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-medium transition-colors ${
                  selectedAyah === ayah.numberInSurah
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                }`}>
                  {ayah.numberInSurah}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); play(ayah.number); }}
                  className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                    playingAyah === ayah.number
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "bg-secondary/70 text-muted-foreground hover:bg-primary/20 hover:text-primary"
                  }`}
                  aria-label={playingAyah === ayah.number ? "Pause recitation" : "Play recitation"}
                >
                  {playingAyah === ayah.number && audioLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : playingAyah === ayah.number ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5 ml-0.5" />
                  )}
                </button>
              </div>
              <div className="flex-1 space-y-3">
                {(displayMode === "both" || displayMode === "arabic") && (
                  <p className="text-arabic text-foreground leading-loose">{ayah.text}</p>
                )}
                {(displayMode === "both" || displayMode === "english") && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {ayah.translation}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VerseDisplay;
