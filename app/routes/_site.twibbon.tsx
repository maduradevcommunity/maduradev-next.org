import { useRef, useState, useEffect, useCallback } from "react";
import {
  Camera,
  Download,
  RefreshCcw,
  ArrowLeft,
  Loader2,
  Upload,
  RotateCw,
  FlipHorizontal,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Share2,
  Copy,
  Check,
  Code2,
  Sliders,
  Maximize2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

function SwitchCameraIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
      <path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
      <circle cx="12" cy="12" r="3" />
      <path d="m18 22-3-3 3-3" />
      <path d="m6 2 3 3-3 3" />
    </svg>
  );
}

export const meta = () => [
  { title: "Twibbon Creator - MaduraDev" },
  {
    name: "description",
    content:
      "Buat dan download twibbon resmi MaduraDev dengan berbagai pilihan frame modern. Bagikan semangat komunitas developer Madura di media sosial!",
  },
  {
    name: "keywords",
    content:
      "twibbon maduradev, twibbon developer madura, frame foto komunitas madura, twibbon generator",
  },
  { property: "og:title", content: "Twibbon Creator - MaduraDev" },
  {
    property: "og:description",
    content:
      "Buat twibbon resmi MaduraDev secara instan dengan frame modern.",
  },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://madura.dev/twibbon" },
  { property: "og:image", content: "https://madura.dev/image.jpg" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Twibbon Creator - MaduraDev" },
  {
    name: "twitter:description",
    content:
      "Buat twibbon resmi MaduraDev secara instan dengan frame modern.",
  },
  { name: "twitter:image", content: "https://madura.dev/image.jpg" },
  { tagName: "link", rel: "canonical", href: "https://madura.dev/twibbon" },
];

export type FrameTemplate = "official" | "cyber" | "minimalist" | "custom";

export default function TwibbonPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraOverlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [flash, setFlash] = useState(false);
  const facingModeRef = useRef<"user" | "environment">("user");

  // Image source & loaded image object
  const [rawPhoto, setRawPhoto] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [customTemplateUrl, setCustomTemplateUrl] = useState<string | null>(null);
  const [customTemplateImg, setCustomTemplateImg] = useState<HTMLImageElement | null>(null);

  // Selected frame template
  const [selectedFrame, setSelectedFrame] = useState<FrameTemplate>("official");

  // Adjustments: scale, position, rotation, flip
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Dragging event state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Camera start callback
  const startCamera = useCallback(
    async (mode: "user" | "environment" = "user") => {
      try {
        if (videoRef.current?.srcObject) {
          (videoRef.current.srcObject as MediaStream)
            .getTracks()
            .forEach((t) => t.stop());
        }
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1080 },
            height: { ideal: 1080 },
          },
        });
        setStream(newStream);
        setFacingMode(mode);
        facingModeRef.current = mode;
        if (videoRef.current) videoRef.current.srcObject = newStream;
        setCameraError(null);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.";
        setCameraError(msg);
      }
    },
    [],
  );

  // Initial load: start camera, load logo & check custom template
  useEffect(() => {
    startCamera("user");

    // Preload MaduraDev logo
    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.src = "/logos/logo_madura_light.png";
    logo.onload = () => setLogoImage(logo);

    // Check custom template in Supabase
    const checkCustomTemplate = async () => {
      const supabase = createBrowserClient();
      if (!supabase) return;
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl("twibbon/template.png");

      try {
        const res = await fetch(publicUrl, { method: "HEAD" });
        if (res.ok) {
          const url = `${publicUrl}?t=${Date.now()}`;
          setCustomTemplateUrl(url);
          const tImg = new Image();
          tImg.crossOrigin = "anonymous";
          tImg.src = url;
          tImg.onload = () => setCustomTemplateImg(tImg);
        } else {
          setCustomTemplateUrl(null);
        }
      } catch {
        setCustomTemplateUrl(null);
      }
    };
    checkCustomTemplate();

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());
      }
    };
  }, [startCamera]);

  // Load rawPhoto into HTMLImageElement
  useEffect(() => {
    if (!rawPhoto) {
      setLoadedImage(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = rawPhoto;
    img.onload = () => {
      setLoadedImage(img);
    };
  }, [rawPhoto]);

  // Real-time canvas renderer (Single Source of Truth)
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImage) return;

    const SIZE = 1080;
    if (canvas.width !== SIZE || canvas.height !== SIZE) {
      canvas.width = SIZE;
      canvas.height = SIZE;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, SIZE, SIZE);

    // Calculate display ratio
    const displayWidth = containerRef.current?.clientWidth || 360;
    const ratio = SIZE / displayWidth;

    // 1. Draw User Photo with Transformations
    ctx.save();
    ctx.translate(SIZE / 2, SIZE / 2);
    ctx.translate(position.x * ratio, position.y * ratio);
    ctx.rotate((rotation * Math.PI) / 180);
    if (isFlipped) {
      ctx.scale(-1, 1);
    }
    ctx.scale(scale, scale);

    // Object-fit: cover sizing
    let dw = SIZE;
    let dh = SIZE;
    const imgRatio = loadedImage.naturalWidth / loadedImage.naturalHeight;
    if (imgRatio > 1) {
      dh = SIZE;
      dw = SIZE * imgRatio;
    } else {
      dw = SIZE;
      dh = SIZE / imgRatio;
    }
    ctx.drawImage(loadedImage, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();

    // 2. Draw Active Twibbon Frame Overlay
    if (selectedFrame === "custom" && customTemplateImg) {
      ctx.drawImage(customTemplateImg, 0, 0, SIZE, SIZE);
    } else if (selectedFrame === "cyber") {
      drawCyberFrame(ctx, SIZE);
    } else if (selectedFrame === "minimalist") {
      drawMinimalistFrame(ctx, SIZE, logoImage);
    } else {
      drawOfficialFrame(ctx, SIZE, logoImage);
    }
  }, [
    loadedImage,
    position,
    rotation,
    isFlipped,
    scale,
    selectedFrame,
    customTemplateImg,
    logoImage,
  ]);

  // Camera Live Overlay Renderer: overlays frame directly on the camera viewfinder
  const drawCameraOverlay = useCallback(() => {
    const canvas = cameraOverlayCanvasRef.current;
    if (!canvas || rawPhoto) return;

    const SIZE = 1080;
    if (canvas.width !== SIZE || canvas.height !== SIZE) {
      canvas.width = SIZE;
      canvas.height = SIZE;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, SIZE, SIZE);

    if (selectedFrame === "custom" && customTemplateImg) {
      ctx.drawImage(customTemplateImg, 0, 0, SIZE, SIZE);
    } else if (selectedFrame === "cyber") {
      drawCyberFrame(ctx, SIZE);
    } else if (selectedFrame === "minimalist") {
      drawMinimalistFrame(ctx, SIZE, logoImage);
    } else {
      drawOfficialFrame(ctx, SIZE, logoImage);
    }
  }, [rawPhoto, selectedFrame, customTemplateImg, logoImage]);

  // Re-draw canvas whenever state changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Re-draw camera overlay whenever selected frame or logo changes
  useEffect(() => {
    drawCameraOverlay();
  }, [drawCameraOverlay]);

  // Ensure canvas updates once web fonts are fully ready
  useEffect(() => {
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        drawCanvas();
        drawCameraOverlay();
      });
    }
  }, [drawCanvas, drawCameraOverlay]);

  const toggleCamera = () => {
    const next = facingModeRef.current === "user" ? "environment" : "user";
    startCamera(next);
  };

  // Dragging event handlers (mouse & touch)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!rawPhoto) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !rawPhoto) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!rawPhoto) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !rawPhoto) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Adjustments
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleResetAdjustments = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setIsFlipped(false);
    toast.info("Posisi foto telah di-reset ke tengah");
  };

  // Capture photo from video stream
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) {
      toast.error("Kamera belum siap, tunggu sebentar lalu coba lagi.");
      return;
    }

    // Trigger visual flash
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    const snapCanvas = document.createElement("canvas");
    const SIZE = 1080;
    snapCanvas.width = SIZE;
    snapCanvas.height = SIZE;
    const sCtx = snapCanvas.getContext("2d")!;

    let sx = 0,
      sy = 0,
      sw = vw,
      sh = vh;
    if (vw > vh) {
      sw = vh;
      sx = (vw - sw) / 2;
    } else {
      sh = vw;
      sy = (vh - sh) / 2;
    }

    // Mirror user-facing camera to match viewfinder
    if (facingModeRef.current === "user") {
      sCtx.translate(SIZE, 0);
      sCtx.scale(-1, 1);
    }
    sCtx.drawImage(video, sx, sy, sw, sh, 0, 0, SIZE, SIZE);

    setRawPhoto(snapCanvas.toDataURL("image/png", 1.0));
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setIsFlipped(false);

    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    toast.success("Foto berhasil diambil dengan frame " + selectedFrame.toUpperCase() + "!");
  };

  const retakePhoto = () => {
    setRawPhoto(null);
    setLoadedImage(null);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setIsFlipped(false);
    startCamera(facingModeRef.current);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Silakan pilih file gambar yang valid.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setRawPhoto(event.target?.result as string);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
      setIsFlipped(false);

      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
      toast.success("Foto berhasil diunggah!");
    };
    reader.readAsDataURL(file);
  };

  // Download directly from canvas (100% WYSIWYG)
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDownloading(true);
    setTimeout(() => {
      const timestamp = new Date().getTime();
      const filename = `MaduraDev_Twibbon_${selectedFrame}_${timestamp}.png`;
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsDownloading(false);
      toast.success("Twibbon 1080p berhasil didownload!");
    }, 400);
  };

  // Copy canvas to clipboard
  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error();
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setIsCopied(true);
        toast.success("Gambar Twibbon berhasil disalin ke clipboard!");
        setTimeout(() => setIsCopied(false), 2500);
      }, "image/png");
    } catch {
      toast.error("Gagal menyalin gambar. Silakan gunakan tombol Download.");
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      "Halo! Saya baru saja membuat Twibbon resmi MaduraDev untuk mendukung komunitas developer Madura! Buat twibbonmu juga di https://madura.dev/twibbon 🚀",
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const currentStep = rawPhoto ? 2 : 1;

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden overflow-y-auto flex flex-col pt-24 pb-36">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, currentColor 1.5px, transparent 0)",
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 w-full flex-grow flex flex-col items-center">
        {/* Top Navigation & Step Indicator */}
        <div className="w-full flex items-center justify-between mb-5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all text-xs font-semibold border border-border/40"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </Link>

          {/* Stepper Pills */}
          <div className="flex items-center gap-1.5 text-xs font-semibold bg-muted/40 p-1 rounded-full border border-border/40">
            <span
              className={`px-3 py-0.5 rounded-full transition-colors ${
                currentStep === 1
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              1. Pilih Frame & Foto
            </span>
            <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
            <span
              className={`px-3 py-0.5 rounded-full transition-colors ${
                currentStep === 2
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              2. Sesuaikan & Download
            </span>
          </div>
        </div>

        {/* Title Header */}
        <div className="text-center mb-5">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground font-display tracking-tight mb-1">
            MaduraDev <span className="text-primary italic">Twibbon</span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-md">
            {rawPhoto
              ? "Atur posisi, perbesar foto sesuai keinginanmu, dan ganti frame secara instan sebelum didownload."
              : "Pilih desain frame di bawah, lalu ambil foto selfie atau upload foto terbaikmu."}
          </p>
        </div>

        {/* 1. PERSISTENT FRAME SELECTOR CARDS (Always Visible & Interactive) */}
        <div className="w-full mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Pilihan Frame Desain:</span>
            </span>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
              {selectedFrame}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Official Theme */}
            <button
              type="button"
              onClick={() => setSelectedFrame("official")}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all text-left flex flex-col justify-between relative overflow-hidden ${
                selectedFrame === "official"
                  ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/30"
                  : "border-border/60 bg-card/80 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex -space-x-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-2 ring-background" />
                  <span className="w-3.5 h-3.5 rounded-full bg-red-600 ring-2 ring-background" />
                </div>
                {selectedFrame === "official" && (
                  <Check className="w-3.5 h-3.5 text-primary" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-foreground truncate">Official</p>
                <p className="text-[10px] text-muted-foreground truncate">Tech Red & Blue</p>
              </div>
            </button>

            {/* Cyber Dev Theme */}
            <button
              type="button"
              onClick={() => setSelectedFrame("cyber")}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all text-left flex flex-col justify-between relative overflow-hidden ${
                selectedFrame === "cyber"
                  ? "border-cyan-400 bg-cyan-950/25 shadow-sm ring-2 ring-cyan-400/30"
                  : "border-border/60 bg-card/80 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Code2 className="w-4 h-4 text-cyan-400" />
                {selectedFrame === "cyber" && (
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-foreground truncate">Cyber Dev</p>
                <p className="text-[10px] text-muted-foreground truncate">Neon Terminal</p>
              </div>
            </button>

            {/* Minimalist Theme */}
            <button
              type="button"
              onClick={() => setSelectedFrame("minimalist")}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all text-left flex flex-col justify-between relative overflow-hidden ${
                selectedFrame === "minimalist"
                  ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/30"
                  : "border-border/60 bg-card/80 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                {selectedFrame === "minimalist" && (
                  <Check className="w-3.5 h-3.5 text-primary" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-foreground truncate">Minimalist</p>
                <p className="text-[10px] text-muted-foreground truncate">Glass Badge</p>
              </div>
            </button>

            {/* Custom Community Template (if available) */}
            {customTemplateUrl && (
              <button
                type="button"
                onClick={() => setSelectedFrame("custom")}
                className={`col-span-3 p-3 rounded-2xl border transition-all text-left flex items-center justify-between ${
                  selectedFrame === "custom"
                    ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                    : "border-border/60 bg-card/80 hover:bg-muted/50"
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Custom Community Template
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Template resmi dari server komunitas MaduraDev
                  </p>
                </div>
                {selectedFrame === "custom" && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* 2. MAIN VIEWFINDER / LIVE CANVAS CONTAINER */}
        <div
          ref={containerRef}
          className="w-full aspect-square relative rounded-[2.2rem] overflow-hidden editorial-shadow mb-5 bg-zinc-950 border border-border/40 flex items-center justify-center select-none"
        >
          {/* Flash Effect on capture */}
          {flash && (
            <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-out fade-out duration-200" />
          )}

          {rawPhoto ? (
            /* Live Interactive Canvas Viewport (100% WYSIWYG Single Source of Truth) */
            <div
              className="relative w-full h-full cursor-grab active:cursor-grabbing select-none touch-none"
              style={{ touchAction: "none" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain block pointer-events-none"
              />

              {/* Floating Helper Guide Badge */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] text-white/95 font-medium flex items-center gap-1.5 pointer-events-none shadow-md">
                <Sliders className="w-3 h-3 text-primary" />
                <span>Geser foto untuk menyesuaikan posisi</span>
              </div>
            </div>
          ) : cameraError ? (
            /* Camera Permission Error State */
            <div className="text-center p-8 bg-zinc-900 w-full h-full flex flex-col justify-center items-center">
              <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-3">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-destructive font-bold text-sm mb-1">
                Kamera Tidak Aktif
              </p>
              <p className="text-xs text-muted-foreground max-w-xs mb-4">
                {cameraError}
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl text-xs gap-2"
              >
                <Upload className="w-4 h-4" /> Pilih dari Galeri
              </Button>
            </div>
          ) : (
            /* Live Camera Viewfinder with Selected Frame Overlaid */
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${
                  facingMode === "user" ? "scale-x-[-1]" : ""
                }`}
              />

              {/* Live Canvas Overlay of the chosen Frame over the camera feed */}
              <canvas
                ref={cameraOverlayCanvasRef}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 block"
              />

              {/* Top Camera Controls Bar */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-auto">
                <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] text-white font-semibold flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>PREVIEW: {selectedFrame.toUpperCase()}</span>
                </div>

                <button
                  type="button"
                  onClick={toggleCamera}
                  className="p-2.5 bg-black/60 hover:bg-black/80 active:scale-95 text-white rounded-full backdrop-blur-md transition-all border border-white/20 shadow-md"
                  title="Ganti Kamera Depan / Belakang"
                >
                  <SwitchCameraIcon className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* 3. PHOTO ADJUSTMENT TOOLS (Shown when photo is loaded) */}
        {rawPhoto && (
          <div className="w-full p-4 rounded-2xl bg-card border border-border/50 space-y-3 mb-5">
            {/* Zoom Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-muted-foreground mb-1.5">
                <span>Perbesar Gambar (Zoom)</span>
                <span className="text-primary font-mono font-bold">
                  {Math.round(scale * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
                  className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors"
                  title="Perkecil"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.02"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setScale((prev) => Math.min(3.0, prev + 0.1))}
                  className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors"
                  title="Perbesar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Transform Controls Row */}
            <div className="flex items-center gap-2 pt-1 border-t border-border/40">
              <button
                type="button"
                onClick={handleRotate}
                className="flex-1 py-2 px-2.5 rounded-xl bg-muted/60 hover:bg-muted text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5 text-primary" />
                <span>Putar 90°</span>
              </button>
              <button
                type="button"
                onClick={handleFlip}
                className="flex-1 py-2 px-2.5 rounded-xl bg-muted/60 hover:bg-muted text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-colors"
              >
                <FlipHorizontal className="w-3.5 h-3.5 text-primary" />
                <span>Flip Mirror</span>
              </button>
              <button
                type="button"
                onClick={handleResetAdjustments}
                className="py-2 px-3 rounded-xl bg-muted/60 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors"
                title="Reset Posisi & Skala"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. MAIN ACTION BUTTONS */}
        <div className="w-full">
          {rawPhoto ? (
            /* PHOTO LOADED STATE: DOWNLOAD & SHARE */
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  className="w-1/3 h-14 rounded-2xl font-bold border-border/80 text-foreground hover:bg-muted transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  <RefreshCcw className="w-4 h-4" />
                  <span>Ganti Foto</span>
                </Button>
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-2/3 h-14 rounded-2xl font-bold text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-70"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Twibbon (1080p)</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Quick Share Buttons */}
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-card border border-border/50">
                <button
                  type="button"
                  onClick={handleCopyImage}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-muted/60 hover:bg-muted text-xs font-semibold text-foreground transition-all flex items-center justify-center gap-1.5"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-bold">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-primary" />
                      <span>Salin Gambar</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share WhatsApp</span>
                </button>
              </div>
            </div>
          ) : (
            /* INITIAL STATE: CAMERA / GALLERY ACTIONS */
            <div className="flex gap-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex-1 h-14 rounded-2xl font-bold border-border/80 text-foreground hover:bg-muted transition-all flex items-center justify-center gap-2 text-xs sm:text-sm shadow-sm"
              >
                <Upload className="w-4 h-4 text-primary" />
                <span>Pilih dari Galeri</span>
              </Button>
              <Button
                onClick={capturePhoto}
                disabled={!!cameraError}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-14 rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Camera className="w-4 h-4" />
                <span>Ambil Foto</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Canvas Drawing Functions for each Frame Template
function drawOfficialFrame(
  ctx: CanvasRenderingContext2D,
  S: number,
  logoImg: HTMLImageElement | null,
) {
  // Outer gradient border
  const bGrad = ctx.createLinearGradient(0, 0, S, S);
  bGrad.addColorStop(0, "#0058BE");
  bGrad.addColorStop(0.5, "#7B1FA2");
  bGrad.addColorStop(1, "#B61722");
  ctx.strokeStyle = bGrad;
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, S - 14, S - 14);

  // TOP BANNER
  const bannerH = 120;
  const topGrad = ctx.createLinearGradient(0, 0, S, 0);
  topGrad.addColorStop(0, "rgba(182,23,34,0.96)");
  topGrad.addColorStop(1, "rgba(136,14,27,0.95)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, S, bannerH);

  // Logo
  if (logoImg && logoImg.naturalWidth > 0) {
    const lw = S * 0.22;
    const lh = (logoImg.naturalHeight / logoImg.naturalWidth) * lw;
    const ly = (bannerH - lh) / 2;
    ctx.drawImage(logoImg, S / 2 - lw / 2, ly, lw, lh);
  } else {
    const fs = Math.round(S * 0.03);
    ctx.font = `bold ${fs}px 'Inter','Segoe UI',Arial,sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("MADURADEV", S / 2, bannerH * 0.65);
  }

  // Corner brackets
  const pad = 70;
  const brkLen = 100;
  const bw = 8;
  const bY1 = bannerH + 25;
  const bY2 = S - bannerH - 25;

  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = bw;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Top-left
  ctx.beginPath();
  ctx.moveTo(pad, bY1 + brkLen);
  ctx.lineTo(pad, bY1);
  ctx.lineTo(pad + brkLen, bY1);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(S - pad - brkLen, bY1);
  ctx.lineTo(S - pad, bY1);
  ctx.lineTo(S - pad, bY1 + brkLen);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(pad, bY2 - brkLen);
  ctx.lineTo(pad, bY2);
  ctx.lineTo(pad + brkLen, bY2);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(S - pad - brkLen, bY2);
  ctx.lineTo(S - pad, bY2);
  ctx.lineTo(S - pad, bY2 - brkLen);
  ctx.stroke();

  // BOTTOM BANNER
  const botH = 120;
  const botGrad = ctx.createLinearGradient(0, 0, S, 0);
  botGrad.addColorStop(0, "rgba(0,70,200,0.96)");
  botGrad.addColorStop(1, "rgba(21,101,192,0.95)");
  ctx.fillStyle = botGrad;
  ctx.fillRect(0, S - botH, S, botH);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${Math.round(S * 0.035)}px 'Inter','Segoe UI',Arial,sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("LOCAL TECH HUB", S / 2, S - botH * 0.42);

  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.font = `600 ${Math.round(S * 0.016)}px 'Inter',sans-serif`;
  ctx.fillText("KOMUNITAS DEVELOPER MADURA", S / 2, S - botH * 0.16);
}

function drawCyberFrame(ctx: CanvasRenderingContext2D, S: number) {
  // Cyberpunk Neon Border
  const grad = ctx.createLinearGradient(0, 0, S, S);
  grad.addColorStop(0, "#00f2fe");
  grad.addColorStop(0.5, "#4facfe");
  grad.addColorStop(1, "#0058BE");
  ctx.strokeStyle = grad;
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, S - 14, S - 14);

  // Inner glowing cyan line
  ctx.strokeStyle = "rgba(0, 242, 254, 0.5)";
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, S - 48, S - 48);

  // Header pill badge
  const badgeW = 440;
  const badgeH = 80;
  const badgeX = (S - badgeW) / 2;
  const badgeY = 36;

  ctx.fillStyle = "rgba(10, 15, 30, 0.92)";
  ctx.strokeStyle = "#00f2fe";
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 20, true, true);

  // Terminal dots
  ctx.fillStyle = "#ff5f56";
  ctx.beginPath();
  ctx.arc(badgeX + 30, badgeY + badgeH / 2, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffbd2e";
  ctx.beginPath();
  ctx.arc(badgeX + 50, badgeY + badgeH / 2, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#27c93f";
  ctx.beginPath();
  ctx.arc(badgeX + 70, badgeY + badgeH / 2, 6, 0, Math.PI * 2);
  ctx.fill();

  // Text in pill
  ctx.fillStyle = "#00f2fe";
  ctx.font = `bold ${Math.round(S * 0.026)}px 'Fira Code',monospace,sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("< Madura.Dev />", S / 2 + 30, badgeY + badgeH * 0.62);

  // Bottom Tech Bar
  const bH = 120;
  ctx.fillStyle = "rgba(5, 10, 25, 0.96)";
  ctx.fillRect(0, S - bH, S, bH);

  ctx.strokeStyle = "#00f2fe";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, S - bH);
  ctx.lineTo(S, S - bH);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.round(S * 0.032)}px 'Inter',sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("BUILDING THE FUTURE OF TECH", S / 2, S - bH * 0.52);

  ctx.fillStyle = "rgba(0, 242, 254, 0.9)";
  ctx.font = `600 ${Math.round(S * 0.02)}px 'Fira Code',monospace`;
  ctx.fillText("$ git commit -m 'Proud Member'", S / 2, S - bH * 0.2);
}

function drawMinimalistFrame(
  ctx: CanvasRenderingContext2D,
  S: number,
  logoImg: HTMLImageElement | null,
) {
  // Elegant border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, S - 10, S - 10);

  // Bottom floating glass badge
  const badgeW = 480;
  const badgeH = 110;
  const badgeX = (S - badgeW) / 2;
  const badgeY = S - badgeH - 50;

  ctx.fillStyle = "rgba(10, 15, 25, 0.88)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 2.5;
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 24, true, true);

  if (logoImg && logoImg.naturalWidth > 0) {
    const lw = 130;
    const lh = (logoImg.naturalHeight / logoImg.naturalWidth) * lw;
    ctx.drawImage(logoImg, badgeX + 30, badgeY + (badgeH - lh) / 2, lw, lh);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold ${Math.round(S * 0.028)}px 'Inter',sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText("Member Resmi", badgeX + 180, badgeY + badgeH * 0.46);

    ctx.fillStyle = "#38bdf8";
    ctx.font = `600 ${Math.round(S * 0.022)}px 'Inter',sans-serif`;
    ctx.fillText("#MaduraDev", badgeX + 180, badgeY + badgeH * 0.74);
  } else {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold ${Math.round(S * 0.034)}px 'Inter',sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("MaduraDev Community", S / 2, badgeY + badgeH * 0.58);
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill = true,
  stroke = false,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}
