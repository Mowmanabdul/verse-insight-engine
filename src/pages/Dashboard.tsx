import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useLastRead } from "@/hooks/useLastRead";
import { Link } from "react-router-dom";
import { ArrowLeft, Flame, BookOpen, Clock, Calendar, Target, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const Dashboard = () => {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { dailyReadings, surahBreakdown, totalAyahs, totalMinutes, totalSessions, loading } = useDashboardData(user?.id);
  const { getLastRead } = useLastRead(user?.id);
  const lastRead = getLastRead();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayData = dailyReadings.find(d => d.date === today);
  const goal = profile?.daily_reading_goal ?? 10;
  const todayAyahs = todayData?.ayahsRead ?? 0;
  const goalPct = Math.min(100, Math.round((todayAyahs / goal) * 100));

  // Streak calendar: last 28 days in 4 rows of 7
  const calendarDays = dailyReadings.slice(-28);

  const chartData = dailyReadings.map(d => ({
    ...d,
    label: new Date(d.date + "T00:00:00").toLocaleDateString("en", { month: "short", day: "numeric" }),
  }));

  // Theme-aware tooltip styles via CSS variables
  const tooltipStyle = {
    backgroundColor: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "0.5rem",
    fontSize: 12,
    color: "hsl(var(--popover-foreground))",
  };
  const labelStyle = { color: "hsl(var(--popover-foreground))" };
  const axisTick = { fontSize: 10, fill: "hsl(var(--muted-foreground))" };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();
  const name = profile?.display_name?.trim();

  const encouragement =
    todayAyahs === 0 ? "Begin today with an ayah" :
    goalPct < 50 ? "A beautiful start" :
    goalPct < 100 ? "Halfway through your goal" :
    "Goal complete — barakAllahu feek";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-md">
        <Link
          to="/"
          className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to reading"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-semibold text-foreground tracking-tight">Dashboard</h1>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-8">
        {/* Editorial greeting */}
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70 font-medium">{greeting}{name ? `,` : ""}</p>
          <h2 className="font-arabic text-3xl md:text-4xl text-foreground leading-tight">
            {name ?? "Welcome back"}
          </h2>
          <p className="text-sm text-muted-foreground italic mt-1">{encouragement}</p>
        </div>

        {/* Continue reading CTA */}
        {lastRead && (
          <Link
            to="/"
            className="group flex items-center justify-between gap-4 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/8 via-card to-card p-5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all"
          >
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-primary/80 font-medium mb-1">Continue reading</p>
              <p className="text-base font-semibold text-foreground truncate">{lastRead.surahName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Pick up where you left off</p>
            </div>
            <div className="shrink-0 w-10 h-10 rounded-full bg-primary/15 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center text-primary transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        )}

        {/* Today's progress — hero card */}
        <div className="rounded-xl border border-border bg-card p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground tracking-tight">Today's Goal</h2>
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">{goalPct}%</span>
          </div>
          <div className="space-y-3">
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500"
                style={{ width: `${goalPct}%` }}
              />
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground font-semibold tabular-nums">{todayAyahs}</span>
                <span className="mx-1">of</span>
                <span className="tabular-nums">{goal}</span> ayahs today
              </p>
              {goalPct >= 100 && (
                <span className="inline-flex items-center gap-1 text-[11px] text-primary font-medium">
                  <Sparkles className="w-3 h-3" /> Complete
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<Flame className="w-4 h-4 text-primary" />} label="Current Streak" value={`${profile?.current_streak ?? 0}`} unit="days" />
          <StatCard icon={<TrendingUp className="w-4 h-4 text-primary" />} label="Longest Streak" value={`${profile?.longest_streak ?? 0}`} unit="days" />
          <StatCard icon={<BookOpen className="w-4 h-4 text-primary" />} label="Ayahs (30d)" value={String(totalAyahs)} />
          <StatCard icon={<Clock className="w-4 h-4 text-primary" />} label="Time (30d)" value={String(totalMinutes)} unit="min" />
        </div>

        {/* Reading history chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground tracking-tight">Ayahs Read — Last 30 Days</h2>
          </div>
          {totalSessions === 0 ? (
            <EmptyChart message="Your reading history will appear here once you've read your first ayah." />
          ) : (
            <div className="h-48 md:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ayahGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} width={30} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.2 }} />
                  <Area type="monotone" dataKey="ayahsRead" stroke="hsl(var(--primary))" fill="url(#ayahGrad)" strokeWidth={2} name="Ayahs" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Streak calendar + surah breakdown */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground tracking-tight">Streak Calendar</h2>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} className="text-[10px] text-muted-foreground text-center font-medium">{d}</div>
              ))}
              {(() => {
                const firstDay = calendarDays[0] ? new Date(calendarDays[0].date + "T00:00:00").getDay() : 0;
                const pads = [];
                for (let i = 0; i < firstDay; i++) pads.push(<div key={`pad-${i}`} />);
                return pads;
              })()}
              {calendarDays.map((d) => {
                const intensity = d.ayahsRead === 0 ? 0 : d.ayahsRead < 5 ? 1 : d.ayahsRead < 15 ? 2 : 3;
                return (
                  <div
                    key={d.date}
                    title={`${d.date}: ${d.ayahsRead} ayahs`}
                    className={`aspect-square rounded-sm transition-colors ${
                      intensity === 0 ? "bg-muted" :
                      intensity === 1 ? "bg-primary/25" :
                      intensity === 2 ? "bg-primary/55" : "bg-primary"
                    }`}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-3 justify-end">
              <span className="text-[10px] text-muted-foreground">Less</span>
              <div className="w-3 h-3 rounded-sm bg-muted" />
              <div className="w-3 h-3 rounded-sm bg-primary/25" />
              <div className="w-3 h-3 rounded-sm bg-primary/55" />
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span className="text-[10px] text-muted-foreground">More</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground tracking-tight">Most Read Surahs</h2>
            </div>
            {surahBreakdown.length === 0 ? (
              <EmptyChart message="Your most-read surahs will surface here as you read." />
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={surahBreakdown} layout="vertical" margin={{ top: 0, right: 5, left: 0, bottom: 0 }}>
                    <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="surahName"
                      tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      width={90}
                    />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} cursor={{ fill: "hsl(var(--primary))", fillOpacity: 0.08 }} />
                    <Bar dataKey="ayahsRead" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Ayahs" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground italic pt-2">
          {totalSessions} reading session{totalSessions !== 1 ? "s" : ""} in the last 30 days · Allah knows best
        </p>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: string; unit?: string }) => (
  <div className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors">
    <div className="flex items-center gap-1.5 mb-1.5">
      {icon}
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
    <p className="text-xl font-semibold text-foreground tabular-nums leading-none">
      {value}
      {unit && <span className="text-xs text-muted-foreground font-normal ml-1">{unit}</span>}
    </p>
  </div>
);

const EmptyChart = ({ message }: { message: string }) => (
  <div className="h-48 flex items-center justify-center text-center px-6">
    <p className="text-xs text-muted-foreground italic max-w-xs">{message}</p>
  </div>
);

export default Dashboard;
