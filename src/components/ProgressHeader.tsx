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
    <header className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-card/90 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-primary shrink-0" />
        <div className="leading-none">
          <h1 className="text-sm font-semibold text-foreground tracking-tight">Quran Companion</h1>
          {displayName && (
            <p className="text-[10px] text-muted-foreground">{greeting}, {displayName}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Daily goal - compact */}
        <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/60 text-[11px]">
          <Target className="w-3 h-3 text-primary" />
          <span className="font-medium text-foreground tabular-nums">{ayahsReadToday}/{dailyGoal}</span>
          <div className="w-8 h-1 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${goalProgress}%` }} />
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/60">
          <Flame className={`w-3 h-3 ${streak > 0 ? "text-primary" : "text-muted-foreground"}`} />
          <span className="text-[11px] font-medium text-foreground tabular-nums">{streak}</span>
        </div>

        <Link to="/dashboard" className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Dashboard">
          <BarChart3 className="w-3.5 h-3.5" />
        </Link>
        <Link to="/settings" className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Settings">
          <Settings className="w-3.5 h-3.5" />
        </Link>
        {onSignOut && (
          <button onClick={onSignOut} className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title={userEmail || "Sign out"}>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};

export default ProgressHeader;
