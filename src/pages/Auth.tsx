import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Loader2, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
    } else {
      const { error } = await signUp(email, password, displayName || undefined);
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Check your email", description: "We sent you a confirmation link to verify your account." });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Decorative side panel - hidden on mobile */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-card border-r border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="relative text-center space-y-6 p-12 max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="font-arabic text-4xl text-primary gold-glow leading-relaxed" dir="rtl">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              In the name of Allah, the Most Gracious, the Most Merciful
            </p>
          </motion.div>
          <div className="flex items-center justify-center gap-1.5 pt-4">
            {[0, 1, 2].map((i) => (
              <Star key={i} className="w-3 h-3 text-primary/40 fill-primary/40" />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              Your personal companion for reading, understanding, and reflecting on the Holy Quran with AI-powered insights.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-8"
        >
          {/* Logo */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Quran Companion</h1>
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Welcome back" : "Start your journey"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-medium text-foreground/70 mb-1.5 block">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-foreground/70 mb-1.5 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground/70 mb-1.5 block">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-primary/20"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
