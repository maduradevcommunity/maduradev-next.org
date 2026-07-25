import { useRef, useState, useEffect, useCallback } from "react";
import {
  Camera,
  Download,
  RefreshCcw,
  ArrowLeft,
  Loader2,
  Upload,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

function SwitchCameraIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" /><path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
      <circle cx="12" cy="12" r="3" /><path d="m18 22-3-3 3-3" /><path d="m6 2 3 3-3 3" />
    </svg>
  );
}

export const meta = () => [
  { title: "Twibbon - MaduraDev" },
  { name: "description", content: "Download twibbon MaduraDev untuk mendukung komunitas developer Madura. Bagikan di media sosial!" },
  { name: "keywords", content: "twibbon maduradev, twibbon developer madura, frame foto komunitas madura" },
  { property: "og:title", content: "Twibbon - MaduraDev" },
  { property: "og:description", content: "Download twibbon MaduraDev untuk mendukung komunitas developer Madura." },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://madura.dev/twibbon" },
  { property: "og:image", content: "https://madura.dev/image.jpg" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Twibbon - MaduraDev" },
  { name: "twitter:description", content: "Download twibbon MaduraDev untuk mendukung komunitas developer Madura." },
  { name: "twitter:image", content: "https://madura.dev/image.jpg" },
  { tagName: "link", rel: "canonical", href: "https://madura.dev/twibbon" },
];

export default function TwibbonPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isCapturing, setIsCapturing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const facingModeRef = useRef<"user" | "environment">("user");

  // Custom Twibbon and Photo Alignment States
  const [rawPhoto, setRawPhoto] = useState<string | null>(null);
  const [customTemplateUrl, setCustomTemplateUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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
        const msg = err instanceof Error ? err.message : "Tidak dapat mengakses kamera.";
        setCameraError(msg);
      }
    },
    [],
  );

  useEffect(() => {
    startCamera("user");

    const checkCustomTemplate = async () => {
      const supabase = createBrowserClient();
      if (!supabase) return;
      const { data: { publicUrl } } = supabase.storage
        .from("images")
        .getPublicUrl("twibbon/template.png");

      try {
        const res = await fetch(publicUrl, { method: "HEAD" });
        if (res.ok) {
          setCustomTemplateUrl(`${publicUrl}?t=${Date.now()}`);
        } else {
          setCustomTemplateUrl(null);
        }
      } catch (err) {
        console.error("Custom template check error:", err);
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
  }, []);

  const toggleCamera = () => {
    const next = facingModeRef.current === "user" ? "environment" : "user";
    startCamera(next);
  };

  // Dragging event handlers
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

  const drawTwibbon = (
    ctx: CanvasRenderingContext2D,
    S: number,
    logoImg: HTMLImageElement | null,
  ) => {
    // Grid lines
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    const step = S / 8;
    for (let i = 1; i < 8; i++) {
      ctx.beginPath(); ctx.moveTo(i * step, 0); ctx.lineTo(i * step, S); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * step); ctx.lineTo(S, i * step); ctx.stroke();
    }
    ctx.restore();

    // Corner vignette
    const vig = ctx.createLinearGradient(0, 0, S, S);
    vig.addColorStop(0, "rgba(0,88,190,0.2)");
    vig.addColorStop(0.45, "rgba(0,0,0,0)");
    vig.addColorStop(0.55, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(182,23,34,0.2)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, S, S);

    // Outer gradient border
    const bGrad = ctx.createLinearGradient(0, 0, S, S);
    bGrad.addColorStop(0, "#0058BE");
    bGrad.addColorStop(0.5, "#7B1FA2");
    bGrad.addColorStop(1, "#B61722");
    ctx.strokeStyle = bGrad;
    ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, S - 16, S - 16);

    // TOP BANNER
    const bannerH = 115;
    const topGrad = ctx.createLinearGradient(0, 0, S, 0);
    topGrad.addColorStop(0, "rgba(182,23,34,0.96)");
    topGrad.addColorStop(1, "rgba(136,14,27,0.93)");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, S, bannerH);

    // Logo
    if (logoImg && logoImg.naturalWidth > 0) {
      const lw = S * 0.2;
      const lh = (logoImg.naturalHeight / logoImg.naturalWidth) * lw;
      const ly = bannerH - lh * 0.6;
      ctx.drawImage(logoImg, S / 2 - lw / 2, ly, lw, lh);
    } else {
      const fs = Math.round(S * 0.028);
      ctx.font = `bold ${fs}px 'Inter','Segoe UI',Arial,sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("Madura", S / 2 - fs * 1.5, bannerH * 0.82);
      ctx.fillStyle = "#FFCDD2";
      ctx.fillText("Dev", S / 2 + fs * 1.08, bannerH * 0.82);
    }

    // Corner brackets
    const pad = 85, brkLen = 140, bw = 9;
    const bY1 = bannerH + 28, bY2 = S - bannerH - 28;
    ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = bw; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(pad, bY1 + brkLen); ctx.lineTo(pad, bY1); ctx.lineTo(pad + brkLen, bY1); ctx.stroke();
    drawDot(ctx, pad, bY1, 8, "#0058BE");
    ctx.beginPath(); ctx.moveTo(S - pad - brkLen, bY1); ctx.lineTo(S - pad, bY1); ctx.lineTo(S - pad, bY1 + brkLen); ctx.stroke();
    drawDot(ctx, S - pad, bY1, 8, "#0058BE");
    ctx.beginPath(); ctx.moveTo(pad, bY2 - brkLen); ctx.lineTo(pad, bY2); ctx.lineTo(pad + brkLen, bY2); ctx.stroke();
    drawDot(ctx, pad, bY2, 8, "#B61722");
    ctx.beginPath(); ctx.moveTo(S - pad - brkLen, bY2); ctx.lineTo(S - pad, bY2); ctx.lineTo(S - pad, bY2 - brkLen); ctx.stroke();
    drawDot(ctx, S - pad, bY2, 8, "#B61722");

    // BOTTOM BANNER
    const botH = 115;
    const botGrad = ctx.createLinearGradient(0, 0, S, 0);
    botGrad.addColorStop(0, "rgba(0,70,200,0.96)");
    botGrad.addColorStop(1, "rgba(21,101,192,0.93)");
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, S - botH, S, botH);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold ${Math.round(S * 0.034)}px 'Inter','Segoe UI',Arial,sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("LOCAL TECH HUB", S / 2, S - botH * 0.37);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) {
      alert("Kamera belum siap, tunggu sebentar lalu coba lagi.");
      return;
    }

    const snapCanvas = document.createElement("canvas");
    const SIZE = 1080;
    snapCanvas.width = SIZE;
    snapCanvas.height = SIZE;
    const sCtx = snapCanvas.getContext("2d")!;
    
    let sx = 0, sy = 0, sw = vw, sh = vh;
    if (vw > vh) { sw = vh; sx = (vw - sw) / 2; }
    else { sh = vw; sy = (vh - sh) / 2; }

    if (facingModeRef.current === "user") {
      sCtx.translate(SIZE, 0); sCtx.scale(-1, 1);
    }
    sCtx.drawImage(video, sx, sy, sw, sh, 0, 0, SIZE, SIZE);

    setRawPhoto(snapCanvas.toDataURL("image/png", 1.0));
    setScale(1);
    setPosition({ x: 0, y: 0 });

    if (stream) { stream.getTracks().forEach((t) => t.stop()); setStream(null); }
  };

  const retakePhoto = () => {
    setPhotoURL(null);
    setRawPhoto(null);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    startCamera(facingModeRef.current);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setRawPhoto(event.target?.result as string);
      setScale(1);
      setPosition({ x: 0, y: 0 });

      if (stream) { stream.getTracks().forEach((t) => t.stop()); setStream(null); }
    };
    reader.readAsDataURL(file);
  };

  const composeFinalImage = () => {
    if (!rawPhoto) return;

    setIsCapturing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const SIZE = 1080;
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d")!;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.save();
      
      // Calculate translation offset relative to the canvas 1080px size
      const containerElement = canvas.parentElement?.querySelector(".aspect-square");
      const previewSize = containerElement?.clientWidth || 343;
      const scaleMultiplier = SIZE / previewSize;
      
      // Translate to center, apply preview translation offset, then apply scale
      ctx.translate(SIZE / 2, SIZE / 2);
      ctx.translate(position.x * scaleMultiplier, position.y * scaleMultiplier);
      ctx.scale(scale, scale);
      
      // Calculate draw size to achieve "object-fit: cover" centering
      let drawWidth = SIZE;
      let drawHeight = SIZE;
      if (img.naturalWidth > img.naturalHeight) {
        drawHeight = SIZE;
        drawWidth = SIZE * (img.naturalWidth / img.naturalHeight);
      } else if (img.naturalWidth < img.naturalHeight) {
        drawWidth = SIZE;
        drawHeight = SIZE * (img.naturalHeight / img.naturalWidth);
      }

      // Draw the user image centered
      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      const drawOverlay = (twibbonImg: HTMLImageElement | null) => {
        if (twibbonImg) {
          ctx.drawImage(twibbonImg, 0, 0, SIZE, SIZE);
        } else {
          drawTwibbon(ctx, SIZE, null);
        }
        setPhotoURL(canvas.toDataURL("image/png", 1.0));
        setIsCapturing(false);
      };

      if (customTemplateUrl) {
        const twibbon = new Image();
        twibbon.crossOrigin = "anonymous";
        twibbon.src = customTemplateUrl;
        twibbon.onload = () => drawOverlay(twibbon);
        twibbon.onerror = () => drawOverlay(null);
      } else {
        const logo = new Image();
        logo.crossOrigin = "anonymous";
        logo.src = "/logos/logo_madura_light.png";
        logo.onload = () => drawOverlay(null);
        logo.onerror = () => drawOverlay(null);
      }
    };
    img.src = rawPhoto;
  };

  const handleDownload = () => {
    if (!photoURL) return;
    setIsDownloading(true);
    setTimeout(() => {
      const timestamp = new Date().getTime();
      const filename = `MaduraDev_Twibbon_${timestamp}.png`;
      const link = document.createElement("a");
      link.href = photoURL; link.download = filename;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      setIsDownloading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden overflow-y-auto flex flex-col pt-28 pb-32">
      <div className="fixed inset-0 opacity-5 pointer-events-none z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, #0058be 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 w-full flex-grow flex flex-col items-center">
        <div className="w-full flex items-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Link>
          <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full">
            <span className="font-label text-[10px] font-bold uppercase tracking-widest">Twibbon</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-foreground font-display tracking-tight mb-2">
            MaduraDev <span className="text-primary italic">Camera</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Tunjukkan semangatmu sebagai bagian dari MaduraDev!
          </p>
        </div>

        <div className="w-full aspect-square relative rounded-[2.5rem] overflow-hidden editorial-shadow mb-8 bg-black flex items-center justify-center">
          {photoURL ? (
            <img src={photoURL} alt="Twibbon Result" className="w-full h-full object-cover" />
          ) : rawPhoto ? (
            /* Interactive Drag-and-Drop Editor Preview */
            <div 
              className="absolute inset-0 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={rawPhoto}
                alt="Raw Preview"
                className="absolute w-full h-full object-cover pointer-events-none"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  transition: isDragging ? "none" : "transform 0.1s ease-out"
                }}
              />
              {/* Twibbon Overlay Frame */}
              <div className="absolute inset-0 pointer-events-none">
                {customTemplateUrl ? (
                  <img src={customTemplateUrl} alt="Twibbon Template" className="w-full h-full object-contain" />
                ) : (
                  <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 right-0 h-[11%] rounded-t-[2.5rem]" style={{ background: "rgba(182,23,34,0.9)" }} />
                    <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "1%", width: "25%" }}>
                      <img src="/logos/logo_madura_light.png" alt="MaduraDev" className="w-full h-auto drop-shadow-lg"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                    <div className="absolute border-white/90 border-t-[4px] border-l-[4px] w-10 h-10 sm:w-12 sm:h-12" style={{ top: "13%", left: "8%" }} />
                    <div className="absolute border-white/90 border-t-[4px] border-r-[4px] w-10 h-10 sm:w-12 sm:h-12" style={{ top: "13%", right: "8%" }} />
                    <div className="absolute border-white/90 border-b-[4px] border-l-[4px] w-10 h-10 sm:w-12 sm:h-12" style={{ bottom: "13%", left: "8%" }} />
                    <div className="absolute border-white/90 border-b-[4px] border-r-[4px] w-10 h-10 sm:w-12 sm:h-12" style={{ bottom: "13%", right: "8%" }} />
                    <div className="absolute bottom-0 left-0 right-0 h-[11%] rounded-b-[2.5rem] flex items-center justify-center" style={{ background: "rgba(0,80,200,0.9)" }}>
                      <span className="text-white font-bold text-[9px] sm:text-[11px] tracking-[0.28em] uppercase">LOCAL TECH HUB</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : cameraError ? (
            <div className="text-center p-6 bg-slate-900 w-full h-full flex flex-col justify-center items-center">
              <p className="text-destructive font-bold mb-2">Oops!</p>
              <p className="text-sm text-muted-foreground">{cameraError}</p>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted
                className={`absolute inset-0 w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`} />
              <button onClick={toggleCamera}
                className="absolute top-4 right-4 z-50 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all border border-white/20">
                <SwitchCameraIcon className="w-5 h-5" />
              </button>
              {/* Preview twibbon overlay for active camera view */}
              <div className="absolute inset-0 pointer-events-none">
                {customTemplateUrl ? (
                  <img src={customTemplateUrl} alt="Twibbon Template" className="w-full h-full object-contain" />
                ) : (
                  <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 right-0 h-[11%] rounded-t-[2.5rem]" style={{ background: "rgba(182,23,34,0.9)" }} />
                    <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "1%", width: "25%" }}>
                      <img src="/logos/logo_madura_light.png" alt="MaduraDev" className="w-full h-auto drop-shadow-lg"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                    <div className="absolute border-white/90 border-t-[4px] border-l-[4px] w-10 h-10 sm:w-12 sm:h-12" style={{ top: "13%", left: "8%" }} />
                    <div className="absolute border-white/90 border-t-[4px] border-r-[4px] w-10 h-10 sm:w-12 sm:h-12" style={{ top: "13%", right: "8%" }} />
                    <div className="absolute border-white/90 border-b-[4px] border-l-[4px] w-10 h-10 sm:w-12 sm:h-12" style={{ bottom: "13%", left: "8%" }} />
                    <div className="absolute border-white/90 border-b-[4px] border-r-[4px] w-10 h-10 sm:w-12 sm:h-12" style={{ bottom: "13%", right: "8%" }} />
                    <div className="absolute bottom-0 left-0 right-0 h-[11%] rounded-b-[2.5rem] flex items-center justify-center" style={{ background: "rgba(0,80,200,0.9)" }}>
                      <span className="text-white font-bold text-[9px] sm:text-[11px] tracking-[0.28em] uppercase">LOCAL TECH HUB</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {isCapturing && (
            <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center rounded-[2.5rem]">
              <span className="text-white font-bold text-sm animate-pulse">Memproses...</span>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Zoom Control Slider (visible only during adjustment) */}
        {rawPhoto && !photoURL && (
          <div className="w-full space-y-2 mb-6">
            <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span>Perbesar Gambar</span>
              <span>{Math.round(scale * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.01"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-0"
            />
            <p className="text-[11px] text-muted-foreground text-center">
              Seret/geser foto di dalam bingkai untuk memposisikannya secara tepat.
            </p>
          </div>
        )}

        <div className="flex gap-4 w-full">
          {photoURL ? (
            /* Composed Twibbon View: Download Options */
            <>
              <Button onClick={retakePhoto} variant="outline"
                className="w-1/2 h-16 rounded-2xl font-bold border-border text-foreground hover:bg-muted transition-all duration-300 flex items-center justify-center gap-2">
                <RefreshCcw className="w-5 h-5" /> Ulangi
              </Button>
              <Button onClick={handleDownload} disabled={isDownloading}
                className="w-1/2 h-16 rounded-2xl font-bold text-primary-foreground bg-primary hover:bg-primary/90 editorial-shadow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70">
                {isDownloading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</>
                ) : (
                  <><Download className="w-5 h-5" /> Simpan</>
                )}
              </Button>
            </>
          ) : rawPhoto ? (
            /* Adjustment View: Dragging options */
            <>
              <Button onClick={retakePhoto} variant="outline"
                className="w-1/2 h-16 rounded-2xl font-bold border-border text-foreground hover:bg-muted transition-all duration-300 flex items-center justify-center gap-2">
                <RefreshCcw className="w-5 h-5" /> Ulangi
              </Button>
              <Button onClick={composeFinalImage} disabled={isCapturing}
                className="w-1/2 bg-primary text-primary-foreground hover:bg-primary/90 h-16 rounded-2xl font-bold text-lg editorial-shadow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60">
                {isCapturing ? "Memproses..." : "Proses Twibbon"}
              </Button>
            </>
          ) : (
            /* Initial View: Choose image sources */
            cameraError ? (
              <Button onClick={() => fileInputRef.current?.click()} disabled={isCapturing}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-16 rounded-2xl font-bold text-lg editorial-shadow transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-60">
                <Upload className="w-6 h-6" />
                Pilih dari Galeri
              </Button>
            ) : (
              <>
                <Button onClick={() => fileInputRef.current?.click()} disabled={isCapturing} variant="outline"
                  className="w-1/2 h-16 rounded-2xl font-bold border-border text-foreground hover:bg-muted transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60">
                  <Upload className="w-5 h-5" /> Galeri
                </Button>
                <Button onClick={capturePhoto} disabled={isCapturing}
                  className="w-1/2 bg-primary text-primary-foreground hover:bg-primary/90 h-16 rounded-2xl font-bold text-lg editorial-shadow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60">
                  <Camera className="w-5 h-5" /> Ambil Foto
                </Button>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function drawDot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
}
