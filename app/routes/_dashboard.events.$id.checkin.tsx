import type { Route } from "./+types/_dashboard.events.$id.checkin";
import { Link, useLoaderData, useFetcher } from "react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import jsQR from "jsqr";
import {
  ArrowLeft,
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  Users,
  ScanLine,
  AlertCircle,
  RefreshCw,
  Keyboard,
} from "lucide-react";
import { toast } from "sonner";
import { triggerHaptic } from "@/lib/haptics";

export const meta: Route.MetaFunction = ({ data }) => [
  {
    title: `Check-in Scanner${data?.event ? ` - ${data.event.title}` : ""} | Dashboard MaduraDev`,
  },
];

export async function loader({ params }: Route.LoaderArgs) {
  const adminClient = createAdminClient();

  const { data: event, error: eventError } = await adminClient
    .from("events")
    .select("id, title, slug, event_date, event_time")
    .eq("id", params.id)
    .single();

  if (eventError || !event) {
    throw new Response("Event tidak ditemukan", { status: 404 });
  }

  // Stats
  const { count: totalCount } = await adminClient
    .from("event_registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", event.id);

  const { count: checkedInCount } = await adminClient
    .from("event_registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", event.id)
    .not("checked_in_at", "is", null);

  // Recent check-ins today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data: recentCheckins } = await adminClient
    .from("event_registrations")
    .select("id, name, institution, kabupaten, checked_in_at")
    .eq("event_id", event.id)
    .not("checked_in_at", "is", null)
    .gte("checked_in_at", today.toISOString())
    .order("checked_in_at", { ascending: false })
    .limit(20);

  return {
    event,
    totalCount: totalCount ?? 0,
    checkedInCount: checkedInCount ?? 0,
    recentCheckins: recentCheckins ?? [],
  };
}

export async function action({ params, request }: Route.ActionArgs) {
  const adminClient = createAdminClient();
  const formData = await request.formData();
  const rawToken = (formData.get("token") as string || "").trim();

  if (!rawToken) {
    return { error: "Token tidak boleh kosong." };
  }

  // Extract UUID from scanned value (handles full URL or bare UUID)
  const uuidMatch = rawToken.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );
  const token = uuidMatch ? uuidMatch[0] : rawToken;

  // Fetch registration by token + verify it belongs to this event
  const { data: registration, error: fetchError } = await adminClient
    .from("event_registrations")
    .select("id, name, institution, kabupaten, checked_in_at, event_id")
    .eq("checkin_token", token)
    .single();

  if (fetchError || !registration) {
    return { error: "QR Code tidak valid. Tiket tidak ditemukan." };
  }

  if (registration.event_id !== params.id) {
    return { error: "QR Code ini bukan untuk event ini." };
  }

  if (registration.checked_in_at) {
    const checkedTime = new Date(registration.checked_in_at).toLocaleTimeString(
      "id-ID",
      { hour: "2-digit", minute: "2-digit" }
    );
    return {
      alreadyCheckedIn: true,
      participant: {
        name: registration.name,
        institution: registration.institution,
        kabupaten: registration.kabupaten,
      },
      message: `${registration.name} sudah check-in sebelumnya pukul ${checkedTime} WIB.`,
    };
  }

  // Mark as attended
  const { error: updateError } = await adminClient
    .from("event_registrations")
    .update({ checked_in_at: new Date().toISOString() })
    .eq("id", registration.id);

  if (updateError) {
    return { error: "Gagal menyimpan kehadiran. Coba lagi." };
  }

  return {
    success: true,
    participant: {
      name: registration.name,
      institution: registration.institution,
      kabupaten: registration.kabupaten,
    },
  };
}

// -------------------------------------------------------
// Camera QR Scanner (jsQR — works on all modern browsers)
// -------------------------------------------------------
interface ScannerProps {
  onScan: (value: string) => void;
  active: boolean;
}

function CameraScanner({ onScan, active }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const scannedRef = useRef(false);
  const [camError, setCamError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!active) {
      stopCamera();
      scannedRef.current = false;
      return;
    }

    setCamError(null);
    scannedRef.current = false;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const tick = () => {
          if (scannedRef.current) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (!video || !canvas) {
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
          if (video.readyState !== video.HAVE_ENOUGH_DATA) {
            rafRef.current = requestAnimationFrame(tick);
            return;
          }

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            rafRef.current = requestAnimationFrame(tick);
            return;
          }

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code && code.data) {
            scannedRef.current = true;
            stopCamera();
            triggerHaptic("medium");
            onScan(code.data);
            return;
          }

          rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
      } catch {
        setCamError(
          "Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browser, lalu coba lagi."
        );
      }
    };

    startCamera();
    return () => stopCamera();
  }, [active, onScan, stopCamera]);

  return (
    <div className="relative aspect-square w-full max-w-xs mx-auto rounded-2xl overflow-hidden bg-black">
      {/* Hidden canvas untuk jsQR decode */}
      <canvas ref={canvasRef} className="hidden" />

      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
      />

      {/* Crosshair overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 relative">
          <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
          <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
          <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
          <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
          {/* animated scan line */}
          <div
            className="absolute inset-x-2 h-0.5 bg-primary/80 rounded-full"
            style={{ animation: "scanLine 2s ease-in-out infinite", top: "8px" }}
          />
        </div>
      </div>

      {/* Scanning indicator */}
      {active && !camError && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center">
          <span className="bg-black/60 text-white text-[10px] font-medium px-3 py-1 rounded-full">
            Arahkan ke QR Code peserta...
          </span>
        </div>
      )}

      {camError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white text-xs text-center px-6 gap-3">
          <CameraOff className="w-8 h-8 text-red-400" />
          <p>{camError}</p>
        </div>
      )}
    </div>
  );
}


// -------------------------------------------------------
// Main Page
// -------------------------------------------------------
export default function EventCheckinPage() {
  const { event, totalCount, checkedInCount, recentCheckins } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const [scanning, setScanning] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const [useManual, setUseManual] = useState(false);
  const [lastResult, setLastResult] = useState<{
    type: "success" | "error" | "duplicate";
    name?: string;
    institution?: string;
    message: string;
  } | null>(null);

  const handleScan = useCallback(
    (value: string) => {
      setScanning(false);
      const fd = new FormData();
      fd.append("token", value);
      fetcher.submit(fd, { method: "POST" });
    },
    [fetcher]
  );

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    handleScan(manualToken.trim());
    setManualToken("");
  };

  // Process fetcher result
  useEffect(() => {
    const data = fetcher.data;
    if (!data) return;

    if (data.success) {
      triggerHaptic("success");
      setLastResult({
        type: "success",
        name: data.participant?.name,
        institution: data.participant?.institution,
        message: `${data.participant?.name} berhasil check-in!`,
      });
      toast.success(`✅ ${data.participant?.name} berhasil check-in!`);
    } else if (data.alreadyCheckedIn) {
      triggerHaptic("warning");
      setLastResult({
        type: "duplicate",
        name: data.participant?.name,
        institution: data.participant?.institution,
        message: data.message ?? "Peserta sudah check-in sebelumnya.",
      });
      toast.warning(data.message ?? "Peserta sudah check-in sebelumnya.");
    } else if (data.error) {
      triggerHaptic("error");
      setLastResult({ type: "error", message: data.error });
      toast.error(data.error);
    }
  }, [fetcher.data]);

  const notCheckedIn = totalCount - checkedInCount;
  const progressPct = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-5">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/dashboard/events/${event.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Check-in Scanner</h1>
          <p className="text-muted-foreground text-sm">
            Event:{" "}
            <span className="font-semibold text-foreground">{event.title}</span>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-card p-4 text-center shadow-sm">
          <p className="text-3xl font-black text-foreground">{totalCount}</p>
          <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1">
            Total Peserta
          </p>
        </div>
        <div className="rounded-2xl border bg-emerald-500/5 border-emerald-500/20 p-4 text-center shadow-sm">
          <p className="text-3xl font-black text-emerald-500">{checkedInCount}</p>
          <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1">
            Sudah Hadir
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-4 text-center shadow-sm">
          <p className="text-3xl font-black text-foreground">{notCheckedIn}</p>
          <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1">
            Belum Hadir
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground font-medium">Progress Kehadiran</span>
          <span className="font-bold text-foreground">{progressPct}%</span>
        </div>
        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scanner Panel */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <ScanLine className="w-4 h-4" />
              <span>Scanner QR Code</span>
            </div>

            {/* Last result */}
            {lastResult && (
              <div
                className={`rounded-xl p-4 flex items-start gap-3 ${
                  lastResult.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : lastResult.type === "duplicate"
                    ? "bg-amber-500/10 border border-amber-500/20"
                    : "bg-destructive/10 border border-destructive/20"
                }`}
              >
                {lastResult.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                ) : lastResult.type === "duplicate" ? (
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  <p
                    className={`font-bold ${
                      lastResult.type === "success"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : lastResult.type === "duplicate"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-destructive"
                    }`}
                  >
                    {lastResult.message}
                  </p>
                  {lastResult.institution && (
                    <p className="text-muted-foreground mt-0.5">
                      {lastResult.institution}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Camera Scanner */}
            {!useManual && (
              <>
                <div className="space-y-3">
                  <CameraScanner
                    active={scanning}
                    onScan={handleScan}
                  />
                  <div className="flex gap-2">
                    {!scanning ? (
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setLastResult(null);
                          setScanning(true);
                        }}
                        disabled={fetcher.state === "submitting"}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Mulai Scan Kamera
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setScanning(false)}
                      >
                        <CameraOff className="mr-2 h-4 w-4" />
                        Stop Kamera
                      </Button>
                    )}
                    {lastResult && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setLastResult(null);
                          setScanning(true);
                        }}
                        title="Scan berikutnya"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setUseManual(true)}
                  className="text-xs text-muted-foreground hover:text-foreground underline transition-colors flex items-center gap-1 w-full justify-center"
                >
                  <Keyboard className="w-3 h-3" />
                  Beralih ke input manual / barcode gun
                </button>
              </>
            )}

            {/* Manual input */}
            {useManual && (
              <div className="space-y-3">
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Tempel atau scan token UUID..."
                    autoFocus
                    className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                  />
                  <Button type="submit" size="sm" disabled={fetcher.state === "submitting"}>
                    {fetcher.state === "submitting" ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      "Check-in"
                    )}
                  </Button>
                </form>
                <p className="text-[10px] text-muted-foreground text-center">
                  Arahkan barcode gun/scanner ke QR Code peserta, atau paste token UUID secara manual.
                </p>
                <button
                  onClick={() => setUseManual(false)}
                  className="text-xs text-muted-foreground hover:text-foreground underline transition-colors flex items-center gap-1 w-full justify-center"
                >
                  <Camera className="w-3 h-3" />
                  Beralih ke scan kamera
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent check-ins */}
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Check-in Hari Ini
            </span>
            <span className="ml-auto text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {recentCheckins.length}
            </span>
          </div>

          <div className="divide-y divide-border/30 max-h-[480px] overflow-y-auto">
            {recentCheckins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ScanLine className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">
                  Belum ada peserta yang check-in hari ini.
                </p>
              </div>
            ) : (
              recentCheckins.map((reg: any, idx: number) => (
                <div
                  key={reg.id}
                  className="px-5 py-3 flex items-center gap-3 hover:bg-muted/20 transition-colors"
                >
                  <span className="text-[10px] text-muted-foreground font-mono w-5 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {reg.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {reg.institution} · {reg.kabupaten}
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-500 font-bold flex-shrink-0">
                    {new Date(reg.checked_in_at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
