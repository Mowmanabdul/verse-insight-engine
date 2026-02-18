import { useState } from "react";
import { useSurahVerses, TranslatedAyah } from "@/hooks/useQuranData";
import { motion } from "framer-motion";

type DisplayMode = "both" | "arabic" | "english";

interface VerseDisplayProps {
  surahNumber: number;
  onAyahClick: (ayah: TranslatedAyah) => void;
  selectedAyah: number | null;
}

const VerseDisplay = ({ surahNumber, onAyahClick, selectedAyah }: VerseDisplayProps) => {
  const { verses, loading, surahInfo } = useSurahVerses(surahNumber);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("both");

  const modes: { value: DisplayMode; label: string }[] = [
    { value: "both", label: "Both" },
    { value: "arabic", label: "Arabic" },
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
            <p className="text-xs text-muted-foreground mt-0.5">
              {surahInfo.revelationType} · {surahInfo.numberOfAyahs} Ayahs
            </p>
          </motion.div>
        )}

        {/* Display mode toggle */}
        <div className="flex items-center justify-center gap-1 mt-4">
          {modes.map((m) => (
            <button
              key={m.value}
              onClick={() => setDisplayMode(m.value)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                displayMode === m.value
                  ? "bg-primary text-primary-foreground"
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
        <div className="text-center py-6 text-arabic text-primary/70">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
      )}

      {/* Verses */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pb-8">
        {verses.map((ayah, i) => (
          <motion.div
            key={ayah.number}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(i * 0.03, 1) }}
            onClick={() => onAyahClick(ayah)}
            className={`group cursor-pointer px-4 py-4 rounded-lg mb-2 transition-all ${
              selectedAyah === ayah.numberInSurah
                ? "bg-primary/10 ring-1 ring-primary/20"
                : "hover:bg-secondary/60"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-secondary text-[10px] text-muted-foreground font-medium mt-1">
                {ayah.numberInSurah}
              </span>
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
