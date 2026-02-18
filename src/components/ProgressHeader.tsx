import { BookOpen, Flame } from "lucide-react";

interface ProgressHeaderProps {
  currentSurah: string;
  totalSurahs: number;
  currentSurahNumber: number;
}

const ProgressHeader = ({ currentSurah, totalSurahs, currentSurahNumber }: ProgressHeaderProps) => {
  const progress = Math.round((currentSurahNumber / totalSurahs) * 100);

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h1 className="text-base font-semibold text-foreground tracking-tight">Quran Companion</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <span>Reading: {currentSurah}</span>
          <span className="text-primary/60">·</span>
          <span>{progress}% browsed</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary">
          <Flame className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">0 day streak</span>
        </div>
      </div>
    </header>
  );
};

export default ProgressHeader;
