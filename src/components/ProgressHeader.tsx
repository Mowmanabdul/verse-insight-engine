import { BookOpen, Flame, LogOut, Target } from "lucide-react";

interface ProgressHeaderProps {
  currentSurah: string;
  totalSurahs: number;
  currentSurahNumber: number;
  streak?: number;
  dailyGoal?: number;
  ayahsReadToday?: number;
  userEmail?: string;
  onSignOut?: () => void;
}

const ProgressHeader = ({
  currentSurah, totalSurahs, currentSurahNumber,
  streak = 0, dailyGoal = 10, ayahsReadToday = 0,
  userEmail, onSignOut,
}: ProgressHeaderProps) => {
  const progress = Math.round((currentSurahNumber / totalSurahs) * 100);
  const goalProgress = Math.min(100, Math.round((ayahsReadToday / dailyGoal) * 100));

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h1 className="text-base font-semibold text-foreground tracking-tight">Quran Companion</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <span>Reading: {currentSurah}</span>
          <span className="text-primary/60">·</span>
          <span>{progress}% browsed</span>
        </div>

        {/* Daily goal progress */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary">
          <Target className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">{ayahsReadToday}/{dailyGoal}</span>
          <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary">
          <Flame className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">{streak} day{streak !== 1 ? "s" : ""}</span>
        </div>

        {/* Sign out */}
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title={userEmail || "Sign out"}
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};

export default ProgressHeader;
