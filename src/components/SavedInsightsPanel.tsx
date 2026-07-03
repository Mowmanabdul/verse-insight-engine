import { SavedInsight } from "@/hooks/useSavedInsights";
import { Bookmark, Trash2, BookOpen, Sparkles, ChevronDown } from "lucide-react";
import AiMarkdown from "@/components/AiMarkdown";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SavedInsightsPanelProps {
  insights: SavedInsight[];
  onDelete: (id: string) => void;
}

const SavedInsightsPanel = ({ insights, onDelete }: SavedInsightsPanelProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [collapsedSurahs, setCollapsedSurahs] = useState<Record<number, boolean>>({});

  const grouped = useMemo(() => {
    const map = new Map<number, { surahName: string; surahNumber: number; items: SavedInsight[] }>();
    for (const i of insights) {
      const existing = map.get(i.surahNumber);
      if (existing) existing.items.push(i);
      else map.set(i.surahNumber, { surahName: i.surahName, surahNumber: i.surahNumber, items: [i] });
    }
    return Array.from(map.values())
      .map((g) => ({
        ...g,
        items: [...g.items].sort((a, b) => {
          const ay = (a.ayahNumber ?? 0) - (b.ayahNumber ?? 0);
          if (ay !== 0) return ay;
          return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
        }),
      }))
      .sort((a, b) => a.surahNumber - b.surahNumber);
  }, [insights]);

  if (insights.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <Bookmark className="w-8 h-8 text-muted-foreground/40 mx-auto" />
        <p className="text-sm text-muted-foreground">No saved insights yet</p>
        <p className="text-xs text-muted-foreground/60">
          Click the save button on any AI explanation or reflection to keep it here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map((group) => {
        const collapsed = collapsedSurahs[group.surahNumber];
        return (
          <div key={group.surahNumber} className="space-y-2">
            <button
              onClick={() =>
                setCollapsedSurahs((prev) => ({ ...prev, [group.surahNumber]: !prev[group.surahNumber] }))
              }
              className="w-full flex items-center gap-2 px-1 py-1 text-left group"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${
                  collapsed ? "-rotate-90" : ""
                }`}
              />
              <span className="text-[10px] font-mono text-muted-foreground">
                {String(group.surahNumber).padStart(3, "0")}
              </span>
              <span className="text-xs font-semibold text-foreground tracking-wide uppercase">
                {group.surahName}
              </span>
              <span className="ml-auto text-[10px] text-muted-foreground bg-secondary/60 px-1.5 py-0.5 rounded-full">
                {group.items.length}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pl-2 border-l border-border/50 ml-2">
                    {group.items.map((insight) => (
                      <div
                        key={insight.id}
                        className="rounded-lg border border-border/60 overflow-hidden bg-card/40"
                      >
                        <button
                          onClick={() => setExpandedId(expandedId === insight.id ? null : insight.id)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-secondary/40 transition-colors"
                        >
                          {insight.type === "ayah" ? (
                            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                          ) : (
                            <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                              {insight.ayahNumber ? `Ayah ${insight.ayahNumber}` : "Surah Reflection"}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(insight.savedAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(insight.id);
                            }}
                            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </button>

                        <AnimatePresence>
                          {expandedId === insight.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 border-t border-border/40">
                                {insight.arabicText && (
                                  <p
                                    className="font-arabic text-sm text-foreground/80 text-right mt-3 mb-2"
                                    dir="rtl"
                                  >
                                    {insight.arabicText}
                                  </p>
                                )}
                                {insight.translation && (
                                  <p className="text-xs text-muted-foreground mb-3 italic">
                                    {insight.translation}
                                  </p>
                                )}
                                <AiMarkdown content={insight.content} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default SavedInsightsPanel;
