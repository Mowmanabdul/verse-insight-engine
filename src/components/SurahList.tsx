import { useState } from "react";
import { Search } from "lucide-react";
import { useSurahList } from "@/hooks/useQuranData";
import { motion } from "framer-motion";

interface SurahListProps {
  selectedSurah: number;
  onSelectSurah: (num: number, name: string) => void;
}

const SurahList = ({ selectedSurah, onSelectSurah }: SurahListProps) => {
  const { surahs, loading } = useSurahList();
  const [search, setSearch] = useState("");

  const filtered = surahs.filter(
    (s) =>
      s.englishName.toLowerCase().includes(search.toLowerCase()) ||
      s.englishNameTranslation.toLowerCase().includes(search.toLowerCase()) ||
      s.number.toString() === search
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search surahs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-secondary text-foreground rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-shadow"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-14 bg-secondary/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No surahs found</p>
          </div>
        ) : (
          <div className="p-2">
            {filtered.map((surah, i) => (
              <motion.button
                key={surah.number}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.015, 0.4) }}
                onClick={() => onSelectSurah(surah.number, surah.englishName)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  selectedSurah === surah.number
                    ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                    : "hover:bg-secondary text-foreground"
                }`}
              >
                <span className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium ${
                  selectedSurah === surah.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}>
                  {surah.number}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{surah.englishName}</span>
                    <span className="font-arabic text-base text-primary/80 shrink-0">{surah.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      surah.revelationType === "Meccan"
                        ? "bg-primary/10 text-primary/70"
                        : "bg-accent/30 text-accent-foreground/70"
                    }`}>
                      {surah.revelationType}
                    </span>
                    <span>{surah.numberOfAyahs} ayahs</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurahList;
