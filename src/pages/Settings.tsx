import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Link } from "react-router-dom";
import { ArrowLeft, User, Target, Save, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile(user?.id);
  const [displayName, setDisplayName] = useState("");
  const [dailyGoal, setDailyGoal] = useState(10);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setDailyGoal(profile.daily_reading_goal);
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ display_name: displayName || null, daily_reading_goal: dailyGoal });
    toast({ title: "Settings saved", description: "Your preferences have been updated." });
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <Link to="/" className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-semibold text-foreground tracking-tight">Settings</h1>
      </header>

      <div className="max-w-md mx-auto p-6 space-y-8">
        {/* Profile section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-foreground">
            <User className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Profile</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full h-10 rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>
        </section>

        {/* Reading goals section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-foreground">
            <Target className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Reading Goal</h2>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Daily ayah reading goal
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={50}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="flex-1 accent-primary h-2"
              />
              <span className="text-sm font-semibold text-foreground tabular-nums w-12 text-right">
                {dailyGoal}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {dailyGoal <= 5 ? "Light reading" : dailyGoal <= 15 ? "Moderate reading" : dailyGoal <= 30 ? "Dedicated reader" : "Scholar mode"} · {dailyGoal} ayahs per day
            </p>
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;
