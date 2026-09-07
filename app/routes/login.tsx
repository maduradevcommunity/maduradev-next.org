import { useState } from "react";
import { redirect, useNavigate, Link } from "react-router";
import type { Route } from "./+types/login";
import { createClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  MapPin,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SimpleThemeToggle } from "@/components/simple-theme-toggle";
import { appleSprings } from "@/lib/springs";
import { triggerHaptic } from "@/lib/haptics";

export const meta: Route.MetaFunction = () => [
  { title: "Login - MaduraDev" },
  {
    name: "description",
    content: "Masuk ke Dashboard Admin & Core Team MaduraDev untuk mengelola komunitas, event, twibbon, dan artikel.",
  },
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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic("medium");
    setLoading(true);
    setError(null);

    const supabase = createBrowserClient();
    if (!supabase) {
      setError("Koneksi Supabase tidak tersedia. Silakan muat ulang halaman.");
      triggerHaptic("error");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message === "Invalid login credentials"
        ? "Email atau password yang Anda masukkan tidak sesuai."
        : authError.message
      );
      triggerHaptic("error");
      setLoading(false);
      return;
    }

    triggerHaptic("success");
    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col justify-center">
      {/* Ambient Atmospheric Glows (Apple Liquid Mesh) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-15%] left-[-10%] w-[650px] h-[650px] rounded-full bg-primary/15 blur-[140px] dark:bg-primary/20" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-secondary/20 blur-[150px] dark:bg-secondary/15" />
        <div className="absolute top-[40%] right-[25%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      {/* Subtle Dot Grid Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1.5px 1.5px, currentColor 1.5px, transparent 0)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Floating Top Navigation Pill */}
      <header className="absolute top-5 inset-x-0 z-40 px-6 max-w-7xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          onClick={() => triggerHaptic("light")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-card/70 hover:bg-card text-muted-foreground hover:text-foreground border border-border/60 shadow-2xs backdrop-blur-xl transition-all duration-150 active:scale-95 text-xs font-semibold select-none"
        >
          <ArrowLeft size={15} />
          <span>Kembali ke Beranda</span>
        </Link>
        <div className="p-1 rounded-2xl bg-card/70 border border-border/60 shadow-2xs backdrop-blur-xl">
          <SimpleThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <div className="relative z-10 w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Left Column: Brand & Interactive Showcase (Desktop Only) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={appleSprings.default}
          className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between p-12 xl:p-20 relative border-r border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden"
        >
          {/* Subtle Glass Noise Overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.04] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Middle Showcase Content */}
          <div className="relative z-10 max-w-lg space-y-8 my-auto py-10">
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-black text-foreground font-display tracking-tight leading-[1.08]">
                Wadah Kolaborasi <br />
                <span className="text-primary italic">Developer Madura.</span>
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed">
                Portal terintegrasi untuk mengelola kegiatan, jejaring komunitas di 4 kabupaten, twibbon interaktif, dan materi edukasi.
              </p>
            </div>

            {/* Apple-style Translucent Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: 4 Kabupaten */}
              <div className="p-4 rounded-2xl bg-card/70 dark:bg-card/40 border border-border/60 shadow-xs backdrop-blur-md space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <MapPin size={15} className="text-primary" />
                  <span>4 Kabupaten</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Bangkalan", "Sampang", "Pamekasan", "Sumenep"].map((kab) => (
                    <span
                      key={kab}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-muted/60 text-muted-foreground font-medium border border-border/40"
                    >
                      {kab}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card 2: Keamanan & Role */}
              <div className="p-4 rounded-2xl bg-card/70 dark:bg-card/40 border border-border/60 shadow-xs backdrop-blur-md space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <ShieldCheck size={15} className="text-emerald-500" />
                  <span>Akses Terproteksi</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Otentikasi aman berbasis peran untuk Super Admin & tim inti penggerak.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Footer Information */}
          <div className="relative z-10 flex items-center justify-between pt-6 border-t border-border/40 text-[11px] text-muted-foreground">
            <p className="font-medium">
              © {new Date().getFullYear()} MaduraDev Community.
            </p>
            <div className="flex items-center gap-4 font-semibold">
              <a
                href="/telegram"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Telegram
              </a>
              <span className="text-border">•</span>
              <a
                href="/github"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Form Container */}
        <div className="col-span-1 lg:col-span-6 xl:col-span-5 flex flex-col justify-center items-center px-4 sm:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={appleSprings.default}
            className="w-full max-w-md"
          >

            {/* Apple Liquid Glass Authentication Card */}
            <div className="relative rounded-[28px] border border-border/80 bg-card/85 dark:bg-zinc-900/80 backdrop-blur-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12),inset_0_1.5px_2px_rgba(255,255,255,0.7),inset_0_-1px_1px_rgba(0,0,0,0.05)] dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1.5px_rgba(255,255,255,0.15)] overflow-hidden transition-all p-7 sm:p-9">
              {/* Top Rim Light Highlight */}
              <div className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/25 to-transparent" />

              {/* Card Header */}
              <div className="text-center mb-7 space-y-2">
                <div className="w-13 h-13 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs mb-3">
                  <KeyRound size={24} strokeWidth={2.2} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-foreground">
                  Sign In
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Masuk untuk mengelola ekosistem teknologi Madura
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Error Banner with iOS Shake Effect */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        x: [0, -8, 8, -6, 6, -3, 3, 0],
                      }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="rounded-2xl bg-destructive/10 border border-destructive/25 p-3.5 flex items-start gap-2.5 text-xs font-semibold text-destructive shadow-2xs"
                    >
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span className="leading-snug">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Input Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs font-bold uppercase tracking-wider text-foreground/90 select-none block"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
                    />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="nama@madura.dev"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="flex h-12 w-full rounded-xl border border-border/70 bg-background/50 pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:border-primary/60 transition-all font-medium disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Password Input Field with Show/Hide Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-xs font-bold uppercase tracking-wider text-foreground/90 select-none"
                    >
                      Password
                    </Label>
                    <a
                      href="https://t.me/maduradev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-primary hover:underline select-none"
                    >
                      Lupa password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
                    />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="flex h-12 w-full rounded-xl border border-border/70 bg-background/50 pl-10 pr-11 py-2 text-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:border-primary/60 transition-all font-medium disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setShowPassword(!showPassword);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg active:scale-90 cursor-pointer select-none"
                      title={showPassword ? "Sembunyikan password" : "Lihat password"}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm select-none transition-all duration-100 ease-out active:scale-[0.98] active:opacity-90 shadow-md shadow-primary/25 flex items-center justify-center gap-2 mt-3 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memverifikasi akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Dashboard</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Support Info */}
              <div className="mt-7 pt-5 border-t border-border/40 text-center">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Belum memiliki akun pengurus?{" "}
                  <a
                    href="https://t.me/maduradev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-primary hover:underline"
                  >
                    Hubungi Super Admin
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
