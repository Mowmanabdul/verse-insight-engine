import { useState, useRef } from "react";
import { BookOpen, Loader2, Bookmark } from "lucide-react";
import { TranslatedAyah } from "@/hooks/useQuranData";
import AiMarkdown from "@/components/AiMarkdown";
import { toast } from "@/hooks/use-toast";

const REFLECT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-reflection`;

interface ReflectionPanelProps {
  surahName: string;
  surahNumber: number;
  verses: TranslatedAyah[];
  onSave?: (content: string) => void;
}

async function streamReflection({
  surahName,
  surahNumber,
  versesRead,
  sampleVerses,
  onDelta,
  onDone,
  onError,
  signal,
}: {
  surahName: string;
  surahNumber: number;
  versesRead: number;
  sampleVerses: { arabic: string; translation: string; ayahNumber: number }[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
  signal: AbortSignal;
}) {
  try {
    const resp = await fetch(REFLECT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ surahName, surahNumber, versesRead, sampleVerses }),
      signal,
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Request failed" }));
      onError(err.error || `Error ${resp.status}`);
      return;
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
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
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
    if (e.name !== "AbortError") onError(e.message || "Failed to generate reflection");
  }
}

const ReflectionPanel = ({ surahName, surahNumber, verses, onSave }: ReflectionPanelProps) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const contentRef = useRef("");

  const generate = () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setContent("");
    setError(null);
    setLoading(true);
    contentRef.current = "";

    // Pick up to 5 sample verses spread across the surah
    const step = Math.max(1, Math.floor(verses.length / 5));
    const samples = verses
      .filter((_, i) => i % step === 0)
      .slice(0, 5)
      .map((v) => ({ arabic: v.text, translation: v.translation, ayahNumber: v.numberInSurah }));

    streamReflection({
      surahName,
      surahNumber,
      versesRead: verses.length,
      sampleVerses: samples,
      signal: controller.signal,
      onDelta: (delta) => {
        contentRef.current += delta;
        setContent(contentRef.current);
      },
      onDone: () => setLoading(false),
      onError: (msg) => { setError(msg); setLoading(false); },
    });
  };

  const handleSave = () => {
    if (content && onSave) {
      onSave(content);
      toast({ title: "Reflection saved", description: "You can view it in Saved Insights." });
    }
  };

  return (
    <div className="space-y-4">
      {!content && !loading && (
        <div className="text-center py-8 space-y-4">
          <BookOpen className="w-10 h-10 text-primary/40 mx-auto" />
          <div>
            <p className="text-sm text-foreground/70 mb-1">Finished reading {surahName}?</p>
            <p className="text-xs text-muted-foreground">Generate a reflection on themes, lessons, and a related dua</p>
          </div>
          <button
            onClick={generate}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Generate Reflection
          </button>
        </div>
      )}

      {loading && !content && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            <p className="text-xs text-muted-foreground">Generating reflection...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="text-center space-y-2 py-4">
          <p className="text-sm text-destructive">{error}</p>
          <button onClick={generate} className="text-xs text-primary hover:underline">Try again</button>
        </div>
      )}

      {content && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              {loading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
            </div>
            {!loading && onSave && (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Bookmark className="w-3 h-3" />
                Save Reflection
              </button>
            )}
          </div>
          <AiMarkdown content={content} />
          {!loading && (
            <button
              onClick={generate}
              className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Regenerate
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReflectionPanel;
