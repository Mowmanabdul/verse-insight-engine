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
        <div className="py-6 border-b border-border/20">
          <div className="bismillah-ornament">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
          <div className="verse-ornament mt-2"><span>۞</span></div>
        </div>
      )}

      {/* Verses */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-8 pb-10">
        <div className="max-w-3xl mx-auto">
          {verses.map((ayah, i) => {
            const isPlaying = playingAyah === ayah.number;
            const isSelected = selectedAyah === ayah.numberInSurah;
            const hasNote = notedAyahs?.has(ayah.numberInSurah) ?? false;
            const isHighlighted = isPlaying || isSelected;

            return (
              <motion.article
                key={ayah.number}
                ref={(el) => setVerseRef(ayah.number, el)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.015, 0.6) }}
                onClick={() => onAyahClick(ayah)}
                className={`group relative cursor-pointer px-4 sm:px-6 py-6 rounded-xl transition-all ${
                  isHighlighted
                    ? "bg-primary/[0.04] ring-1 ring-primary/20"
                    : "hover:bg-secondary/30"
                }`}
              >
                {/* Top meta row: ayah disc + actions */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className={`ayah-number-disc ${isHighlighted ? "is-active" : ""}`}>
                      {ayah.numberInSurah}
                    </span>
                    {hasNote && (
                      <span
                        className="flex items-center gap-1 text-[10px] font-medium text-primary/70 uppercase tracking-wider"
                        title="You have a personal note on this ayah"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Note
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                      Juz {ayah.juz} · Page {ayah.page}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {playMode === "ayah" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); play(ayah.number); }}
                        className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                          isPlaying
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground/50 hover:bg-primary/15 hover:text-primary opacity-0 group-hover:opacity-100"
                        }`}
                        aria-label={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying && audioLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isPlaying ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5 ml-px" />
                        )}
                      </button>
                    )}
                    {playMode === "surah" && isPlaying && (
                      <Volume2 className="w-3.5 h-3.5 text-primary animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Arabic */}
                {(displayMode === "both" || displayMode === "arabic") && (
                  <p
                    dir="rtl"
                    className={`text-arabic text-right transition-colors ${
                      isHighlighted ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {ayah.text}
                    <span className="ayah-marker mx-1" aria-hidden="true">
                      {ayah.numberInSurah}
                    </span>
                  </p>
                )}

                {/* Translation — editorial serif */}
                {(displayMode === "both" || displayMode === "english") && (
                  <p
                    className={`verse-translation mt-4 transition-colors ${
                      isHighlighted ? "text-foreground" : ""
                    }`}
                  >
                    {ayah.translation}
                  </p>
                )}

                {/* Subtle ornamental divider between verses */}
                {i < verses.length - 1 && (
                  <div className="verse-ornament mt-6" aria-hidden="true">
                    <span>۩</span>
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VerseDisplay;
