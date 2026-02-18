import { X, Sparkles } from "lucide-react";
import { TranslatedAyah } from "@/hooks/useQuranData";
import { motion, AnimatePresence } from "framer-motion";

interface AiPanelProps {
  ayah: TranslatedAyah | null;
  surahName: string;
  onClose: () => void;
}

const AiPanel = ({ ayah, surahName, onClose }: AiPanelProps) => {
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
            <p className="text-arabic text-sm text-foreground leading-relaxed">{ayah.text}</p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{ayah.translation}</p>
          </div>

          {/* AI content placeholder */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">AI Explanations Coming Soon</h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-[240px] mx-auto">
                  Enable Lovable Cloud to unlock AI-powered explanations, tafsir, key lessons, and
                  reflection questions for every ayah.
                </p>
              </div>
              <div className="space-y-3 text-left max-w-[260px] mx-auto">
                {["Simple explanation", "Historical context", "3 key lessons", "Life application", "Reflection question"].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                      <span>{item}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AiPanel;
