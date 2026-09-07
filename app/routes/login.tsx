import { useState } from "react";
import { redirect, useNavigate, Link } from "react-router";
import type { Route } from "./+types/login";
import { createClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { SimpleThemeToggle } from "@/components/simple-theme-toggle";

export const meta: Route.MetaFunction = () => [
  { title: "Login - MaduraDev" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const supabase = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin" || profile?.role === "core_team") {
      throw redirect("/dashboard");
    }
    throw redirect("/login");
  }

  return {};
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createBrowserClient();
    if (!supabase) {
      setError("Supabase client not available");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col justify-center items-center lg:block">
      {/* Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-full bg-destructive/5 blur-[100px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }} />

      {/* Floating Theme Toggle and Navigation */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={16} /> Home
        </Link>
        <SimpleThemeToggle />
      </div>

      <div className="relative z-10 w-full min-h-screen grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Brand (Hidden on Mobile) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:flex lg:col-span-5 bg-slate-950 text-slate-100 flex-col justify-between p-16 relative overflow-hidden border-r border-slate-900"
        >
          {/* Abstract Grid Glow inside Left Panel */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, #ffffff 1px, transparent 0)",
            backgroundSize: "24px 24px"
          }} />
          <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-destructive/15 blur-[120px]" />

          <div className="relative z-10">
            <Link to="/" className="text-3xl font-black tracking-tighter text-primary block mb-2 hover:opacity-80 transition-opacity">
              MaduraDev
            </Link>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              Login Console
            </span>
          </div>

          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-5xl font-black font-display tracking-tight leading-[1.1]">
              Empowering <br />
              <span className="text-primary italic">Tech Talents</span> <br />
              in Madura Island.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Akses dashboard admin untuk mengelola acara, komunitas kabupaten, twibbon, dan kolaborator.
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-8 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <p>© {new Date().getFullYear()} MaduraDev</p>
            <div className="flex gap-4">
              <a href="/telegram" className="hover:text-slate-300 transition-colors">Telegram</a>
              <a href="/github" className="hover:text-slate-300 transition-colors">GitHub</a>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Form Container */}
        <div className="col-span-1 lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md"
          >
            {/* Brand Icon for Mobile Only */}
            <div className="lg:hidden text-center mb-8 flex flex-col items-center">
              <Link to="/" className="text-4xl font-black tracking-tighter text-primary mb-2">
                MaduraDev
              </Link>
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                Login Console
              </span>
            </div>

            <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-black font-display tracking-tight text-foreground">
                  Sign In
                </CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground">
                  Masuk untuk mengelola ekosistem teknologi Madura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-5">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4 text-xs font-semibold text-destructive text-center"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Email Address
                    </Label>
                    <input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="flex h-12 w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Password
                    </Label>
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="flex h-12 w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-2 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
