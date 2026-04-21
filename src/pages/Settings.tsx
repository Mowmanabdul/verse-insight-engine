import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTheme } from "@/hooks/useTheme";
import { useArabicFontSize } from "@/hooks/useArabicFontSize";
import { Link } from "react-router-dom";
import { ArrowLeft, User, Target, Save, Loader2, Palette, Type, LogOut, Sun, Moon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { profile, loading, updateProfile } = useProfile(user?.id);
  const { theme, setTheme } = useTheme();
  const { size: arabicSize, setSize: setArabicSize, min, max } = useArabicFontSize();

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
    await updateProfile({ display_name: displayName.trim() || null, daily_reading_goal: dailyGoal });
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

  const goalLabel =
    dailyGoal <= 5 ? "Light reading" :
    dailyGoal <= 15 ? "Moderate reading" :
    dailyGoal <= 30 ? "Dedicated reader" : "Scholar mode";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-md">
        <Link
          to="/"
          className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to reading"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-semibold text-foreground tracking-tight">Settings</h1>
      </header>

      <div className="max-w-xl mx-auto px-6 py-10 space-y-12">
        {/* Editorial intro */}
        <div className="text-center space-y-2">
          <p className="font-arabic text-3xl text-primary gold-glow leading-none" dir="rtl">
            ﷽
          </p>
          <p className="text-xs text-muted-foreground/80 italic">
            Tailor your companion to suit your journey
          </p>
        </div>

        {/* Profile */}
        <Section icon={<User className="w-4 h-4" />} title="Profile">
          <div className="space-y-4">
            <Field label="Display Name">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                maxLength={60}
              />
            </Field>
            <Field label="Email">
              <Input value={user?.email || ""} disabled className="bg-muted text-muted-foreground" />
            </Field>
          </div>
        </Section>

        <Separator className="opacity-60" />

        {/* Reading goal */}
        <Section icon={<Target className="w-4 h-4" />} title="Reading Goal">
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <Label className="text-xs font-medium text-muted-foreground">Daily ayahs</Label>
              <span className="text-2xl font-semibold text-foreground tabular-nums">{dailyGoal}</span>
            </div>
            <Slider
              min={1}
              max={50}
              step={1}
              value={[dailyGoal]}
              onValueChange={(v) => setDailyGoal(v[0])}
            />
            <p className="text-[11px] text-muted-foreground italic">{goalLabel}</p>
          </div>
        </Section>

        <Separator className="opacity-60" />

        {/* Appearance */}
        <Section icon={<Palette className="w-4 h-4" />} title="Appearance">
          <div className="space-y-5">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Theme</Label>
              <div className="grid grid-cols-2 gap-2">
                <ThemeOption
                  active={theme === "light"}
                  onClick={() => setTheme("light")}
                  icon={<Sun className="w-4 h-4" />}
                  label="Light"
                />
                <ThemeOption
                  active={theme === "dark"}
                  onClick={() => setTheme("dark")}
                  icon={<Moon className="w-4 h-4" />}
                  label="Dark"
                />
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-2">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Type className="w-3 h-3" /> Arabic Text Size
                </Label>
                <span className="text-[11px] text-muted-foreground tabular-nums">{arabicSize.toFixed(2)} rem</span>
              </div>
              <Slider
                min={min}
                max={max}
                step={0.05}
                value={[arabicSize]}
                onValueChange={(v) => setArabicSize(v[0])}
              />
              <p
                className="font-arabic text-primary mt-3 text-center leading-loose"
                style={{ fontSize: `${arabicSize}rem` }}
                dir="rtl"
              >
                بِسْمِ اللَّهِ
              </p>
            </div>
          </div>
        </Section>

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-11 gap-2 shadow-sm shadow-primary/20"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>

        <Separator className="opacity-60" />

        {/* Sign out */}
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full h-10 gap-2 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <section className="space-y-4">
    <div className="flex items-center gap-2 text-foreground">
      <span className="text-primary">{icon}</span>
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
    </div>
    {children}
  </section>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
    {children}
  </div>
);

const ThemeOption = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-center gap-2 h-10 rounded-lg border text-sm font-medium transition-all ${
      active
        ? "border-primary bg-primary/10 text-primary"
        : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
    }`}
    aria-pressed={active}
  >
    {icon}
    {label}
  </button>
);

export default Settings;
