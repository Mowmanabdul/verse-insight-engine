import { BookOpen, Flame, LogOut, Target, BarChart3, Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface ProgressHeaderProps {
  currentSurah: string;
  totalSurahs: number;
  currentSurahNumber: number;
  streak?: number;
  dailyGoal?: number;
  ayahsReadToday?: number;
  userEmail?: string;
  displayName?: string;
  onSignOut?: () => void;
}

const ProgressHeader = ({
  currentSurah, totalSurahs, currentSurahNumber,
  streak = 0, dailyGoal = 10, ayahsReadToday = 0,
  userEmail, displayName, onSignOut,
}: ProgressHeaderProps) => {
  const progress = Math.round((currentSurahNumber / totalSurahs) * 100);
  const goalProgress = Math.min(100, Math.round((ayahsReadToday / dailyGoal) * 100));

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "صباح الخير";
    if (hour < 17) return "مساء الخير";
    return "مساء النور";
  })();

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-base font-semibold text-foreground tracking-tight leading-none">Quran Companion</h1>
            {displayName && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {greeting}, {displayName}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground mr-1">
          <span className="truncate max-w-[120px]">{currentSurah}</span>
          <span className="text-primary/60">·</span>
          <span>{progress}%</span>
        </div>

        {/* Daily goal progress */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary">
          <Target className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground tabular-nums">{ayahsReadToday}/{dailyGoal}</span>
          <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary">
          <Flame className={`w-3.5 h-3.5 ${streak > 0 ? "text-primary" : "text-muted-foreground"}`} />
          <span className="text-xs font-medium text-foreground tabular-nums">{streak}</span>
        </div>

        {/* Dashboard */}
        <Link
          to="/dashboard"
          className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          title="Dashboard"
        >
          <BarChart3 className="w-4 h-4" />
        </Link>

        {/* Settings */}
        <Link
          to="/settings"
          className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>

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
