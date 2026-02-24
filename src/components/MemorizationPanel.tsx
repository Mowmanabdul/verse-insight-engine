import { useState, useCallback, useMemo } from "react";
import { TranslatedAyah } from "@/hooks/useQuranData";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, RotateCcw, ChevronRight, ChevronLeft, Brain, RefreshCw } from "lucide-react";

interface MemorizationPanelProps {
  verses: TranslatedAyah[];
  surahName: string;
}

type RevealMode = "hidden" | "word-by-word" | "revealed";

const MemorizationPanel = ({ verses, surahName }: MemorizationPanelProps) => {
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [revealMode, setRevealMode] = useState<RevealMode>("hidden");
  const [revealedWordCount, setRevealedWordCount] = useState(0);
  const [repetitions, setRepetitions] = useState<Map<number, number>>(new Map());
  const [showTranslation, setShowTranslation] = useState(false);

  const currentVerse = verses[currentVerseIndex];

  const words = useMemo(
    () => (currentVerse?.text ?? "").split(/\s+/).filter(Boolean),
    [currentVerse?.text]
  );

  const currentReps = repetitions.get(currentVerse?.numberInSurah ?? 0) ?? 0;

  const addRepetition = useCallback(() => {
    if (!currentVerse) return;
    setRepetitions((prev) => {
      const next = new Map(prev);
      next.set(currentVerse.numberInSurah, (next.get(currentVerse.numberInSurah) ?? 0) + 1);
      return next;
    });
  }, [currentVerse]);

  const resetVerse = useCallback(() => {
    setRevealMode("hidden");
    setRevealedWordCount(0);
    setShowTranslation(false);
  }, []);

  const goToVerse = useCallback((index: number) => {
    setCurrentVerseIndex(index);
    resetVerse();
  }, [resetVerse]);

  const revealNextWord = useCallback(() => {
    if (revealedWordCount < words.length) {
      setRevealedWordCount((c) => c + 1);
      setRevealMode("word-by-word");
    } else {
      setRevealMode("revealed");
    }
  }, [revealedWordCount, words.length]);

  const toggleFullReveal = useCallback(() => {
    if (revealMode === "revealed") {
      resetVerse();
    } else {
      setRevealMode("revealed");
      setRevealedWordCount(words.length);
    }
  }, [revealMode, words.length, resetVerse]);

  if (verses.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6 text-center">
        <div className="space-y-2">
          <Brain className="w-8 h-8 mx-auto text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Loading verses…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Header */}
      <div className="text-center space-y-1 shrink-0">
        <div className="flex items-center justify-center gap-1.5">
          <Brain className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Memorisation Mode</h3>
        </div>
        <p className="text-xs text-muted-foreground">{surahName}</p>
      </div>

      {/* Verse navigator */}
      <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-2 shrink-0">
        <button
          onClick={() => goToVerse(Math.max(0, currentVerseIndex - 1))}
          disabled={currentVerseIndex === 0}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-medium text-foreground">
          Ayah {currentVerse?.numberInSurah} / {verses.length}
        </span>
        <button
          onClick={() => goToVerse(Math.min(verses.length - 1, currentVerseIndex + 1))}
          disabled={currentVerseIndex === verses.length - 1}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Arabic text area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="bg-secondary/30 rounded-xl p-5 min-h-[120px] flex items-center justify-center" dir="rtl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentVerse?.number}-${revealMode}-${revealedWordCount}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              {revealMode === "hidden" && (
                <div className="space-y-3">
                  <div className="flex flex-wrap justify-center gap-2" dir="rtl">
                    {words.map((_, i) => (
                      <div
                        key={i}
                        className="h-6 bg-muted/60 rounded-md"
                        style={{ width: `${Math.max(30, Math.random() * 40 + 30)}px` }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{words.length} words hidden</p>
                </div>
              )}

              {revealMode === "word-by-word" && (
                <p className="font-arabic text-xl leading-loose text-foreground">
                  {words.map((word, i) => (
                    <span key={i}>
                      {i < revealedWordCount ? (
                        <motion.span
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={i === revealedWordCount - 1 ? "text-primary gold-glow" : ""}
                        >
                          {word}
                        </motion.span>
                      ) : (
                        <span className="inline-block w-8 h-5 bg-muted/40 rounded mx-0.5 align-middle" />
                      )}
                      {" "}
                    </span>
                  ))}
                  <span className="block text-xs text-muted-foreground mt-2 font-sans" dir="ltr">
                    {revealedWordCount}/{words.length} words
                  </span>
                </p>
              )}

              {revealMode === "revealed" && (
                <p className="font-arabic text-xl leading-loose text-primary gold-glow">
                  {currentVerse?.text}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Translation toggle */}
        <div className="mt-3">
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showTranslation ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showTranslation ? "Hide" : "Show"} Translation
          </button>
          <AnimatePresence>
            {showTranslation && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-muted-foreground leading-relaxed mt-2"
              >
                {currentVerse?.translation}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="shrink-0 space-y-3">
        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={revealNextWord}
            disabled={revealMode === "revealed"}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            Next Word
          </button>
          <button
            onClick={toggleFullReveal}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-all"
          >
            {revealMode === "revealed" ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                Hide All
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                Reveal All
              </>
            )}
          </button>
        </div>

        {/* Repetition counter + reset */}
        <div className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Repetitions</span>
            <span className="text-sm font-bold text-primary">{currentReps}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { addRepetition(); resetVerse(); }}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
            >
              +1 & Reset
            </button>
            <button
              onClick={resetVerse}
              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Reset verse"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemorizationPanel;
