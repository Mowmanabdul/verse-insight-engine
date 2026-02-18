import { useState, useEffect, useRef } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";
import { TranslatedAyah } from "@/hooks/useQuranData";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface AiPanelProps {
  ayah: TranslatedAyah | null;
  surahName: string;
  onClose: () => void;
}

const EXPLAIN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/explain-ayah`;

async function streamExplanation({
  arabicText,
  translation,
  surahName,
  ayahNumber,
  onDelta,
  onDone,
  onError,
  signal,
}: {
  arabicText: string;
  translation: string;
  surahName: string;
  ayahNumber: number;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
  signal: AbortSignal;
}) {
  try {
    const resp = await fetch(EXPLAIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ arabicText, translation, surahName, ayahNumber }),
      signal,
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Request failed" }));
      onError(err.error || `Error ${resp.status}`);
      return;
    }

    if (!resp.body) {
      onError("No response stream");
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          onDone();
          return;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    // Final flush
    if (buffer.trim()) {
      for (let raw of buffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  } catch (e: any) {
    if (e.name !== "AbortError") {
      onError(e.message || "Failed to get explanation");
    }
  }
}

const AiPanel = ({ ayah, surahName, onClose }: AiPanelProps) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastAyahRef = useRef<number | null>(null);
  const contentRef = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ayah || ayah.number === lastAyahRef.current) return;
    lastAyahRef.current = ayah.number;

    // Abort previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setContent("");
    setError(null);
    setLoading(true);
    contentRef.current = "";

    streamExplanation({
      arabicText: ayah.text,
      translation: ayah.translation,
      surahName,
      ayahNumber: ayah.numberInSurah,
      signal: controller.signal,
      onDelta: (delta) => {
        contentRef.current += delta;
        setContent(contentRef.current);
      },
      onDone: () => setLoading(false),
      onError: (msg) => {
        setError(msg);
        setLoading(false);
      },
    });

    return () => controller.abort();
  }, [ayah?.number]);

  // Reset when panel closes
  useEffect(() => {
    if (!ayah) {
      lastAyahRef.current = null;
      setContent("");
      setError(null);
    }
  }, [ayah]);

  return (
    <AnimatePresence>
      {ayah && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="h-full flex flex-col border-l border-border bg-card"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI Insights</span>
              {loading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-secondary text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Selected verse */}
          <div className="px-4 py-4 border-b border-border bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-2">
              {surahName} · Ayah {ayah.numberInSurah}
            </p>
            <p className="font-arabic text-base text-foreground leading-relaxed text-right" dir="rtl">
              {ayah.text}
            </p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{ayah.translation}</p>
          </div>

          {/* AI content */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 py-5">
            {error ? (
              <div className="text-center space-y-2">
                <p className="text-sm text-destructive">{error}</p>
                <button
                  onClick={() => {
                    lastAyahRef.current = null;
                    if (ayah) {
                      // Trigger re-fetch
                      lastAyahRef.current = null;
                      setContent("");
                      setError(null);
                      setLoading(true);
                      contentRef.current = "";
                      const controller = new AbortController();
                      abortRef.current = controller;
                      streamExplanation({
                        arabicText: ayah.text,
                        translation: ayah.translation,
                        surahName,
                        ayahNumber: ayah.numberInSurah,
                        signal: controller.signal,
                        onDelta: (delta) => {
                          contentRef.current += delta;
                          setContent(contentRef.current);
                        },
                        onDone: () => setLoading(false),
                        onError: (msg) => {
                          setError(msg);
                          setLoading(false);
                        },
                      });
                    }
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : content ? (
              <div className="prose prose-sm prose-invert max-w-none prose-headings:text-primary prose-headings:text-sm prose-headings:font-semibold prose-p:text-foreground/80 prose-p:text-sm prose-p:leading-relaxed prose-strong:text-foreground prose-li:text-foreground/80 prose-li:text-sm animate-fade-in">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                  <p className="text-xs text-muted-foreground">Generating explanation...</p>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AiPanel;
