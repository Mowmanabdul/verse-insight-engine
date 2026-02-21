import { useState, useEffect, useRef } from "react";
import { Sparkles, Loader2, Bookmark, BookmarkCheck } from "lucide-react";
import { TranslatedAyah } from "@/hooks/useQuranData";
import AiMarkdown from "@/components/AiMarkdown";
import { toast } from "@/hooks/use-toast";

interface AiPanelProps {
  ayah: TranslatedAyah | null;
  surahName: string;
  onClose: () => void;
  onSave?: (content: string) => void;
  isSaved?: boolean;
}

const EXPLAIN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/explain-ayah`;

async function streamExplanation({
  arabicText, translation, surahName, ayahNumber, onDelta, onDone, onError, signal,
}: {
  arabicText: string; translation: string; surahName: string; ayahNumber: number;
  onDelta: (text: string) => void; onDone: () => void; onError: (msg: string) => void; signal: AbortSignal;
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
      onError(err.error || `Error ${resp.status}`); return;
    }
    if (!resp.body) { onError("No response stream"); return; }
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") { onDone(); return; }
        try {
          const parsed = JSON.parse(jsonStr);
          const c = parsed.choices?.[0]?.delta?.content;
          if (c) onDelta(c);
        } catch { buffer = line + "\n" + buffer; break; }
      }
    }
    if (buffer.trim()) {
      for (let raw of buffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const c = parsed.choices?.[0]?.delta?.content;
          if (c) onDelta(c);
        } catch { /* ignore */ }
      }
    }
    onDone();
  } catch (e: any) {
    if (e.name !== "AbortError") onError(e.message || "Failed to get explanation");
  }
}

const AiPanel = ({ ayah, surahName, onClose, onSave, isSaved }: AiPanelProps) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastAyahRef = useRef<number | null>(null);
  const contentRef = useRef("");

  useEffect(() => {
    if (!ayah || ayah.number === lastAyahRef.current) return;
    lastAyahRef.current = ayah.number;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setContent(""); setError(null); setLoading(true);
    contentRef.current = "";
    streamExplanation({
      arabicText: ayah.text, translation: ayah.translation, surahName,
      ayahNumber: ayah.numberInSurah, signal: controller.signal,
      onDelta: (delta) => { contentRef.current += delta; setContent(contentRef.current); },
      onDone: () => setLoading(false),
      onError: (msg) => { setError(msg); setLoading(false); },
    });
    return () => controller.abort();
  }, [ayah?.number, surahName]);

  useEffect(() => {
    if (!ayah) { lastAyahRef.current = null; setContent(""); setError(null); }
  }, [ayah]);

  const handleSave = () => {
    if (content && onSave) {
      onSave(content);
      toast({ title: "Insight saved", description: "You can view it in Saved Insights." });
    }
  };

  const retry = () => {
    if (!ayah) return;
    lastAyahRef.current = null;
    setContent(""); setError(null); setLoading(true);
    contentRef.current = "";
    const controller = new AbortController();
    abortRef.current = controller;
    streamExplanation({
      arabicText: ayah.text, translation: ayah.translation, surahName,
      ayahNumber: ayah.numberInSurah, signal: controller.signal,
      onDelta: (delta) => { contentRef.current += delta; setContent(contentRef.current); },
      onDone: () => setLoading(false),
      onError: (msg) => { setError(msg); setLoading(false); },
    });
  };

  if (!ayah) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <Sparkles className="w-6 h-6 text-muted-foreground/40 mx-auto" />
          <p className="text-sm text-muted-foreground">Click on an ayah to get AI insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with save */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Explanation</span>
          {loading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
        </div>
        {content && !loading && onSave && (
          <button
            onClick={handleSave}
            disabled={isSaved}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 transition-colors"
          >
            {isSaved ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
            {isSaved ? "Saved" : "Save"}
          </button>
        )}
      </div>

      {/* Verse context */}
      <div className="px-4 py-3 border-b border-border/40 bg-secondary/20">
        <p className="text-[11px] text-muted-foreground mb-1.5">{surahName} · Ayah {ayah.numberInSurah}</p>
        <p className="font-arabic text-sm text-foreground leading-relaxed text-right" dir="rtl">{ayah.text}</p>
        <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{ayah.translation}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4">
        {error ? (
          <div className="text-center space-y-2">
            <p className="text-sm text-destructive">{error}</p>
            <button onClick={retry} className="text-xs text-primary hover:underline">Try again</button>
          </div>
        ) : content ? (
          <div className="animate-fade-in"><AiMarkdown content={content} /></div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
              <p className="text-xs text-muted-foreground">Generating explanation...</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AiPanel;
