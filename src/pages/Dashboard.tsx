import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Link } from "react-router-dom";
import { ArrowLeft, Flame, BookOpen, Clock, Calendar, Target, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const Dashboard = () => {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { dailyReadings, surahBreakdown, totalAyahs, totalMinutes, totalSessions, loading } = useDashboardData(user?.id);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayData = dailyReadings.find(d => d.date === today);

  // Streak calendar: last 28 days in 4 rows of 7
  const calendarDays = dailyReadings.slice(-28);

  // Chart data: shorten date labels
  const chartData = dailyReadings.map(d => ({
    ...d,
    label: new Date(d.date + "T00:00:00").toLocaleDateString("en", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <Link to="/" className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-semibold text-foreground tracking-tight">Reading Dashboard</h1>
      </header>

      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<Flame className="w-4 h-4 text-primary" />} label="Current Streak" value={`${profile?.current_streak ?? 0} days`} />
          <StatCard icon={<TrendingUp className="w-4 h-4 text-primary" />} label="Longest Streak" value={`${profile?.longest_streak ?? 0} days`} />
          <StatCard icon={<BookOpen className="w-4 h-4 text-primary" />} label="Ayahs Read (30d)" value={String(totalAyahs)} />
          <StatCard icon={<Clock className="w-4 h-4 text-primary" />} label="Time Reading (30d)" value={`${totalMinutes} min`} />
        </div>

        {/* Today's progress */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Today's Goal</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, ((todayData?.ayahsRead ?? 0) / (profile?.daily_reading_goal ?? 10)) * 100)}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-medium text-foreground tabular-nums">
              {todayData?.ayahsRead ?? 0} / {profile?.daily_reading_goal ?? 10} ayahs
            </span>
          </div>
        </div>

        {/* Reading history chart */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Ayahs Read – Last 30 Days</h2>
          </div>
          <div className="h-48 md:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="ayahGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(38, 72%, 50%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(38, 72%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "hsl(30, 12%, 50%)" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(30, 12%, 50%)" }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(28, 12%, 10%)",
                    border: "1px solid hsl(28, 8%, 16%)",
                    borderRadius: "0.5rem",
                    fontSize: 12,
                    color: "hsl(38, 25%, 88%)",
                  }}
                  labelStyle={{ color: "hsl(38, 25%, 88%)" }}
                />
                <Area type="monotone" dataKey="ayahsRead" stroke="hsl(38, 72%, 50%)" fill="url(#ayahGrad)" strokeWidth={2} name="Ayahs" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Streak calendar + surah breakdown side by side */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Streak calendar */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Streak Calendar</h2>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} className="text-[10px] text-muted-foreground text-center font-medium">{d}</div>
              ))}
              {/* Pad the first row to align with correct weekday */}
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
                      intensity === 0
                        ? "bg-muted"
                        : intensity === 1
                        ? "bg-primary/25"
                        : intensity === 2
                        ? "bg-primary/55"
                        : "bg-primary"
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

          {/* Top surahs */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Most Read Surahs</h2>
            </div>
            {surahBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reading sessions yet.</p>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={surahBreakdown} layout="vertical">
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: "hsl(30, 12%, 50%)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="surahName"
                      tick={{ fontSize: 11, fill: "hsl(38, 25%, 88%)" }}
                      axisLine={false}
                      tickLine={false}
                      width={90}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(28, 12%, 10%)",
                        border: "1px solid hsl(28, 8%, 16%)",
                        borderRadius: "0.5rem",
                        fontSize: 12,
                        color: "hsl(38, 25%, 88%)",
                      }}
                    />
                    <Bar dataKey="ayahsRead" fill="hsl(38, 72%, 50%)" radius={[0, 4, 4, 0]} name="Ayahs" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Session count */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            {totalSessions} reading session{totalSessions !== 1 ? "s" : ""} in the last 30 days
          </p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-lg border border-border bg-card p-3">
    <div className="flex items-center gap-1.5 mb-1">
      {icon}
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
    <p className="text-lg font-semibold text-foreground tabular-nums">{value}</p>
  </div>
);

export default Dashboard;
