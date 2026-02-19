import { SavedInsight } from "@/hooks/useSavedInsights";
import { Bookmark, Trash2, BookOpen, Sparkles } from "lucide-react";
import AiMarkdown from "@/components/AiMarkdown";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SavedInsightsPanelProps {
  insights: SavedInsight[];
  onDelete: (id: string) => void;
}

const SavedInsightsPanel = ({ insights, onDelete }: SavedInsightsPanelProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    <div className="space-y-2">
      {insights.map((insight) => (
        <div key={insight.id} className="rounded-lg border border-border/60 overflow-hidden">
          <button
            onClick={() => setExpandedId(expandedId === insight.id ? null : insight.id)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/40 transition-colors"
          >
            {insight.type === "ayah" ? (
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
            ) : (
              <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {insight.surahName}
                {insight.ayahNumber ? ` · Ayah ${insight.ayahNumber}` : " · Reflection"}
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
                    <p className="font-arabic text-sm text-foreground/80 text-right mt-3 mb-2" dir="rtl">
                      {insight.arabicText}
                    </p>
                  )}
                  {insight.translation && (
                    <p className="text-xs text-muted-foreground mb-3 italic">{insight.translation}</p>
                  )}
                  <AiMarkdown content={insight.content} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default SavedInsightsPanel;
