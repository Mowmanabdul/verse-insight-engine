import { useState, useRef, useEffect, useCallback } from "react";
import { useSurahVerses, TranslatedAyah } from "@/hooks/useQuranData";
import { useAudioPlayer, PlayMode } from "@/hooks/useAudioPlayer";
import { motion } from "framer-motion";
import { Play, Pause, Loader2, Volume2, Square } from "lucide-react";

type DisplayMode = "both" | "arabic" | "english";

interface VerseDisplayProps {
  surahNumber: number;
  onAyahClick: (ayah: TranslatedAyah) => void;
  selectedAyah: number | null;
  notedAyahs?: Set<number>;
}

const VerseDisplay = ({ surahNumber, onAyahClick, selectedAyah, notedAyahs }: VerseDisplayProps) => {
  const { verses, loading, surahInfo } = useSurahVerses(surahNumber);
  const {
    playingAyah, isLoading: audioLoading, playMode, setPlayMode,
    isPlayingSurah, play, playSurah, stop, setSurahRange,
  } = useAudioPlayer();
  const [displayMode, setDisplayMode] = useState<DisplayMode>("both");
  const scrollRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Set surah range when verses load
  useEffect(() => {
    if (verses.length > 0) {
      setSurahRange(verses[0].number, verses[verses.length - 1].number);
    }
  }, [verses, setSurahRange]);

  // Stop audio & scroll to top when surah changes
  useEffect(() => {
    stop();
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [surahNumber]);

  // Auto-scroll to currently playing ayah
  useEffect(() => {
    if (!playingAyah || !scrollRef.current) return;
    const el = verseRefs.current.get(playingAyah);
    if (el) {
      const container = scrollRef.current;
      const elTop = el.offsetTop - container.offsetTop;
      const scrollTarget = elTop - container.clientHeight / 4;
      container.scrollTo({ top: scrollTarget, behavior: "smooth" });
    }
  }, [playingAyah]);

  // Keyboard: Escape to deselect
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedAyah) {
        onAyahClick({ numberInSurah: selectedAyah } as TranslatedAyah);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedAyah, onAyahClick]);

  const setVerseRef = useCallback((globalNumber: number, el: HTMLDivElement | null) => {
    if (el) verseRefs.current.set(globalNumber, el);
    else verseRefs.current.delete(globalNumber);
  }, []);

  const displayModes: { value: DisplayMode; label: string }[] = [
    { value: "both", label: "Both" },
    { value: "arabic", label: "عربي" },
    { value: "english", label: "English" },
  ];

  const playModes: { value: PlayMode; label: string }[] = [
    { value: "ayah", label: "Per Ayah" },
    { value: "surah", label: "Full Surah" },
  ];

  const handlePlaySurah = () => {
    if (verses.length === 0) return;
    playSurah(verses[0].number, verses[verses.length - 1].number);
  };

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
      {/* Compact surah header + controls in one bar */}
      <div className="px-3 py-2 border-b border-border flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {surahInfo && (
          <div className="flex items-center gap-2 mr-auto min-w-0">
            <h2 className="font-arabic text-lg text-primary gold-glow shrink-0">{surahInfo.name}</h2>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
              <span className="truncate">{surahInfo.englishName}</span>
              <span className="text-border">·</span>
              <span className={`px-1.5 py-px rounded font-medium ${
                surahInfo.revelationType === "Meccan"
                  ? "bg-primary/10 text-primary/70"
                  : "bg-accent/30 text-accent-foreground/70"
              }`}>
                {surahInfo.revelationType}
              </span>
              <span>{surahInfo.numberOfAyahs} Ayahs</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-secondary/50 rounded-md p-px">
            {displayModes.map((m) => (
              <button
                key={m.value}
                onClick={() => setDisplayMode(m.value)}
                className={`px-2 py-1 text-[11px] rounded transition-all ${
                  displayMode === m.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-secondary/50 rounded-md p-px">
            {playModes.map((m) => (
              <button
                key={m.value}
                onClick={() => { setPlayMode(m.value); if (isPlayingSurah) stop(); }}
                className={`px-2 py-1 text-[11px] rounded transition-all ${
                  playMode === m.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {playMode === "surah" && (
            <button
              onClick={handlePlaySurah}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-md transition-all ${
                isPlayingSurah
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {isPlayingSurah ? <><Square className="w-2.5 h-2.5" /> Stop</> : <><Volume2 className="w-2.5 h-2.5" /> Play</>}
            </button>
          )}
        </div>
      </div>

      {/* Bismillah */}
      {surahNumber !== 1 && surahNumber !== 9 && (
        <div className="text-center py-3 font-arabic text-lg text-primary/60 border-b border-border/20">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
      )}

      {/* Verses */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-3 sm:px-5 pb-6">
        {verses.map((ayah, i) => {
          const isPlaying = playingAyah === ayah.number;
          const isSelected = selectedAyah === ayah.numberInSurah;
          const hasNote = notedAyahs?.has(ayah.numberInSurah) ?? false;

          return (
            <motion.div
              key={ayah.number}
              ref={(el) => setVerseRef(ayah.number, el)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.015, 0.6) }}
              onClick={() => onAyahClick(ayah)}
              className={`group cursor-pointer px-3 py-3 rounded-lg mb-px transition-all ${
                isPlaying
                  ? "bg-primary/12 ring-1 ring-primary/30"
                  : isSelected
                    ? "bg-primary/8 ring-1 ring-primary/20"
                    : "hover:bg-secondary/40"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="shrink-0 flex flex-col items-center gap-1 pt-0.5">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[9px] font-semibold transition-colors ${
                    isPlaying
                      ? "bg-primary text-primary-foreground"
                      : isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                  }`}>
                    {ayah.numberInSurah}
                  </span>
                  {playMode === "ayah" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); play(ayah.number); }}
                      className={`w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                        isPlaying
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground/50 hover:bg-primary/20 hover:text-primary opacity-0 group-hover:opacity-100"
                      }`}
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying && audioLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="w-3 h-3" />
                      ) : (
                        <Play className="w-3 h-3 ml-px" />
                      )}
                    </button>
                  )}
                  {playMode === "surah" && isPlaying && (
                    <Volume2 className="w-3 h-3 text-primary animate-pulse" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  {(displayMode === "both" || displayMode === "arabic") && (
                    <p className={`text-arabic leading-loose transition-colors ${
                      isPlaying ? "text-primary" : "text-foreground"
                    }`}>{ayah.text}</p>
                  )}
                  {(displayMode === "both" || displayMode === "english") && (
                    <p className={`text-[13px] leading-relaxed transition-colors ${
                      isPlaying ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {ayah.translation}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default VerseDisplay;
