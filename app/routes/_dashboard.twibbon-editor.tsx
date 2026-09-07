import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useFetcher, useLoaderData } from "react-router";
import {
  Sparkles,
  Upload,
  Download,
  RotateCcw,
  Eye,
  EyeOff,
  Wand2,
  Circle,
  Square,
  Shield,
  Star,
  Heart,
  Loader2,
  ArrowLeft,
  Trash2,
  Check,
  HelpCircle,
  Maximize2,
  Sliders,
  Image as ImageIcon,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const meta = () => [
  { title: "Studio Editor Template Twibbon - Dashboard MaduraDev" },
];

export async function loader({ request }: { request: Request }) {
  const supabase = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const adminClient = createAdminClient();
  const {
    data: { publicUrl },
  } = adminClient.storage.from("images").getPublicUrl("twibbon/template.png");

  let hasCustom = false;
  try {
    const res = await fetch(publicUrl, { method: "HEAD" });
    if (res.ok) hasCustom = true;
  } catch {
    hasCustom = false;
  }

  return {
    activeTemplateUrl: hasCustom ? `${publicUrl}?t=${Date.now()}` : null,
  };
}

export async function action({ request }: { request: Request }) {
  const supabase = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const adminClient = createAdminClient();

  if (intent === "upload_template") {
    const dataUrl = formData.get("template_data") as string;
    if (!dataUrl || !dataUrl.startsWith("data:image/png;base64,")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Format data gambar PNG tidak valid",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const { error } = await adminClient.storage
        .from("images")
        .upload("twibbon/template.png", buffer, {
          upsert: true,
          contentType: "image/png",
        });

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Template Twibbon transparan berhasil disimpan dan aktif!",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: err.message || "Gagal menyimpan template",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  if (intent === "reset_template") {
    try {
      const { error } = await adminClient.storage
        .from("images")
        .remove(["twibbon/template.png"]);

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Template kustom berhasil dihapus. Kembali ke template default.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: err.message || "Gagal mereset template",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(
    JSON.stringify({ success: false, error: "Intent tidak dikenal" }),
    { status: 400, headers: { "Content-Type": "application/json" } }
  );
}

// Available Cutout Shapes
type CutoutShape =
  | "circle"
  | "rect"
  | "rounded-rect"
  | "arch"
  | "hexagon"
  | "shield"
  | "star"
  | "heart";

const SHAPES: { id: CutoutShape; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "circle", label: "Lingkaran / Oval", icon: Circle },
  { id: "rect", label: "Persegi Panjang", icon: Square },
  { id: "rounded-rect", label: "Sudut Membulat", icon: Maximize2 },
  { id: "arch", label: "Kubah / Arch", icon: Compass },
  { id: "hexagon", label: "Hexagon", icon: Shield },
  { id: "shield", label: "Perisai", icon: Shield },
  { id: "star", label: "Bintang", icon: Star },
  { id: "heart", label: "Hati", icon: Heart },
];

export default function TwibbonEditorPage() {
  const { activeTemplateUrl } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Editor State
  const [activeTool, setActiveTool] = useState<"shape" | "wand">("shape");
  const [hasLoadedImage, setHasLoadedImage] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Shape Configuration
  const [shape, setShape] = useState<CutoutShape>("circle");
  const [centerX, setCenterX] = useState(540);
  const [centerY, setCenterY] = useState(540);
  const [width, setWidth] = useState(650);
  const [height, setHeight] = useState(650);
  const [cornerRadius, setCornerRadius] = useState(80);
  const [rotation, setRotation] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);

  // Magic Wand Configuration
  const [wandTolerance, setWandTolerance] = useState(30);
  const [wandMode, setWandMode] = useState<"contiguous" | "global">("contiguous");

  // Preview options
  const [showSamplePhoto, setShowSamplePhoto] = useState(false);
  const [sampleImg, setSampleImg] = useState<HTMLImageElement | null>(null);

  // Dragging interaction state
  const [isDraggingHole, setIsDraggingHole] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragStartCenter, setDragStartCenter] = useState<{ cx: number; cy: number }>({ cx: 540, cy: 540 });

  // Load sample participant photo for simulation
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src =
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1080&h=1080&fit=crop&crop=faces&q=80";
    img.onload = () => setSampleImg(img);
  }, []);

  // Save current canvas state to history
  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const snapshot = ctx.getImageData(0, 0, 1080, 1080);
    setHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1);
      next.push(snapshot);
      // Limit history to 12 steps
      if (next.length > 12) next.shift();
      return next;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 11));
  }, [historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prevIndex = historyIndex - 1;
    const targetState = history[prevIndex];
    if (targetState) {
      ctx.putImageData(targetState, 0, 0);
      setHistoryIndex(prevIndex);
      toast.info("Perubahan terakhir dibatalkan (Undo)");
    }
  }, [history, historyIndex]);

  // Initialize canvas with an image
  const loadImageToCanvas = useCallback(
    (source: string | HTMLImageElement) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const draw = (img: HTMLImageElement) => {
        canvas.width = 1080;
        canvas.height = 1080;
        ctx.clearRect(0, 0, 1080, 1080);

        // Draw image fit cover 1080x1080
        let dw = 1080;
        let dh = 1080;
        const imgRatio = img.naturalWidth / img.naturalHeight;
        if (imgRatio > 1) {
          dh = 1080;
          dw = 1080 * imgRatio;
        } else {
          dw = 1080;
          dh = 1080 / imgRatio;
        }

        ctx.drawImage(img, (1080 - dw) / 2, (1080 - dh) / 2, dw, dh);
        setHasLoadedImage(true);

        // Initial snapshot for history
        const initialSnap = ctx.getImageData(0, 0, 1080, 1080);
        setHistory([initialSnap]);
        setHistoryIndex(0);
      };

      if (typeof source === "string") {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = source;
        img.onload = () => draw(img);
        img.onerror = () => {
          toast.error("Gagal memuat gambar");
        };
      } else {
        draw(source);
      }
    },
    []
  );

  // Initialize with active template if exists, or blank frame
  useEffect(() => {
    if (activeTemplateUrl) {
      loadImageToCanvas(activeTemplateUrl);
    } else {
      // Default: create a clean starting demo template
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw elegant default poster background with header & footer
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, 1080, 1080);

      // Top branding banner
      const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
      grad.addColorStop(0, "#1e3a8a");
      grad.addColorStop(1, "#0f172a");
      ctx.fillStyle = grad;
      ctx.fillRect(40, 40, 1000, 1000);

      // Text prompt
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Silakan Unggah Template Gambar dari Canva / Komputer", 540, 540);

      const snap = ctx.getImageData(0, 0, 1080, 1080);
      setHistory([snap]);
      setHistoryIndex(0);
    }
  }, [activeTemplateUrl, loadImageToCanvas]);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) {
        loadImageToCanvas(result);
        toast.success("Gambar template berhasil dimuat ke editor!");
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to generate shape path on canvas
  const traceShapePath = (
    ctx: CanvasRenderingContext2D,
    s: CutoutShape,
    cx: number,
    cy: number,
    w: number,
    h: number,
    radius: number,
    rot: number
  ) => {
    ctx.save();
    ctx.translate(cx, cy);
    if (rot !== 0) {
      ctx.rotate((rot * Math.PI) / 180);
    }

    const halfW = w / 2;
    const halfH = h / 2;

    ctx.beginPath();
    if (s === "circle") {
      ctx.ellipse(0, 0, halfW, halfH, 0, 0, Math.PI * 2);
    } else if (s === "rect") {
      ctx.rect(-halfW, -halfH, w, h);
    } else if (s === "rounded-rect") {
      const r = Math.min(radius, halfW, halfH);
      if (typeof (ctx as any).roundRect === "function") {
        (ctx as any).roundRect(-halfW, -halfH, w, h, r);
      } else {
        // Fallback for older browsers
        ctx.moveTo(-halfW + r, -halfH);
        ctx.arcTo(halfW, -halfH, halfW, halfH, r);
        ctx.arcTo(halfW, halfH, -halfW, halfH, r);
        ctx.arcTo(-halfW, halfH, -halfW, -halfH, r);
        ctx.arcTo(-halfW, -halfH, halfW, -halfH, r);
        ctx.closePath();
      }
    } else if (s === "arch") {
      // Top dome semicircular, bottom flat
      const topDomeRadius = halfW;
      ctx.moveTo(-halfW, halfH);
      ctx.lineTo(halfW, halfH);
      ctx.lineTo(halfW, -halfH + topDomeRadius);
      ctx.arc(0, -halfH + topDomeRadius, topDomeRadius, 0, Math.PI, true);
      ctx.closePath();
    } else if (s === "hexagon") {
      for (let i = 0; i < 6; i++) {
        const angle = (i * 60 * Math.PI) / 180 - Math.PI / 2;
        const px = halfW * Math.cos(angle);
        const py = halfH * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else if (s === "shield") {
      ctx.moveTo(0, -halfH);
      ctx.lineTo(halfW, -halfH * 0.4);
      ctx.quadraticCurveTo(halfW * 0.9, halfH * 0.5, 0, halfH);
      ctx.quadraticCurveTo(-halfW * 0.9, halfH * 0.5, -halfW, -halfH * 0.4);
      ctx.closePath();
    } else if (s === "star") {
      const points = 5;
      const outerR = Math.min(halfW, halfH);
      const innerR = outerR * 0.48;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const px = r * Math.cos(angle);
        const py = r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else if (s === "heart") {
      ctx.moveTo(0, halfH * 0.35);
      ctx.bezierCurveTo(-halfW * 0.8, -halfH * 0.2, -halfW, -halfH * 0.8, -halfW * 0.38, -halfH * 0.85);
      ctx.bezierCurveTo(-halfW * 0.1, -halfH * 0.88, 0, -halfH * 0.5, 0, -halfH * 0.3);
      ctx.bezierCurveTo(0, -halfH * 0.5, halfW * 0.1, -halfH * 0.88, halfW * 0.38, -halfH * 0.85);
      ctx.bezierCurveTo(halfW, -halfH * 0.8, halfW * 0.8, -halfH * 0.2, 0, halfH * 0.7);
      ctx.closePath();
    }
    ctx.restore();
  };

  // Execute Shape Cutout (Punch Hole into Alpha Transparency)
  const applyShapeCutout = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    pushHistory();

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    traceShapePath(ctx, shape, centerX, centerY, width, height, cornerRadius, rotation);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.restore();

    toast.success("Area berhasil dipotong menjadi transparan!");
  };

  // Magic Wand Click Handler
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== "wand") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = 1080 / rect.width;
    const scaleY = 1080 / rect.height;

    const clickX = Math.floor((e.clientX - rect.left) * scaleX);
    const clickY = Math.floor((e.clientY - rect.top) * scaleY);

    if (clickX < 0 || clickX >= 1080 || clickY < 0 || clickY >= 1080) return;

    pushHistory();

    const imgData = ctx.getImageData(0, 0, 1080, 1080);
    const data = imgData.data;

    const startIdx = (clickY * 1080 + clickX) * 4;
    const tr = data[startIdx];
    const tg = data[startIdx + 1];
    const tb = data[startIdx + 2];
    const ta = data[startIdx + 3];

    if (ta === 0) {
      toast.info("Area ini sudah transparan");
      return;
    }

    const tol = (wandTolerance / 100) * 255;

    if (wandMode === "global") {
      // Remove all matching colors across entire image
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const diff = Math.sqrt((r - tr) ** 2 + (g - tg) ** 2 + (b - tb) ** 2);
        if (diff <= tol) {
          data[i + 3] = 0; // Alpha = 0 (pure transparent)
        }
      }
      ctx.putImageData(imgData, 0, 0);
      toast.success("Warna serupa di seluruh gambar berhasil diubah jadi transparan!");
    } else {
      // Contiguous BFS flood-fill
      const visited = new Uint8Array(1080 * 1080);
      const queue = [clickX + clickY * 1080];
      visited[clickX + clickY * 1080] = 1;

      while (queue.length > 0) {
        const pos = queue.pop()!;
        const px = pos % 1080;
        const py = Math.floor(pos / 1080);
        const idx = pos * 4;

        data[idx + 3] = 0; // Transparent

        const neighbors = [
          px > 0 ? pos - 1 : -1,
          px < 1079 ? pos + 1 : -1,
          py > 0 ? pos - 1080 : -1,
          py < 1079 ? pos + 1080 : -1,
        ];

        for (const nPos of neighbors) {
          if (nPos >= 0 && !visited[nPos]) {
            visited[nPos] = 1;
            const nIdx = nPos * 4;
            const nr = data[nIdx];
            const ng = data[nIdx + 1];
            const nb = data[nIdx + 2];
            const na = data[nIdx + 3];

            if (na > 0) {
              const diff = Math.sqrt((nr - tr) ** 2 + (ng - tg) ** 2 + (nb - tb) ** 2);
              if (diff <= tol) {
                queue.push(nPos);
              }
            }
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
      toast.success("Area warna terhubung berhasil diubah jadi transparan!");
    }
  };

  // Direct Drag on Guide overlay
  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== "shape") return;
    setIsDraggingHole(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setDragStartCenter({ cx: centerX, cy: centerY });
  };

  const handleOverlayMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingHole || activeTool !== "shape") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleFactor = 1080 / rect.width;

    const deltaX = (e.clientX - dragStartPos.x) * scaleFactor;
    const deltaY = (e.clientY - dragStartPos.y) * scaleFactor;

    setCenterX(Math.round(Math.max(0, Math.min(1080, dragStartCenter.cx + deltaX))));
    setCenterY(Math.round(Math.max(0, Math.min(1080, dragStartCenter.cy + deltaY))));
  };

  const handleOverlayMouseUp = () => {
    setIsDraggingHole(false);
  };

  // Preset centering
  const centerBoth = () => {
    setCenterX(540);
    setCenterY(540);
    toast.success("Posisi lubang dipusatkan di tengah");
  };

  // Save to Server
  const handleSaveToServer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const formData = new FormData();
    formData.append("intent", "upload_template");
    formData.append("template_data", dataUrl);

    fetcher.submit(formData, { method: "POST" });
  };

  // Reset to default
  const handleResetTemplate = () => {
    if (confirm("Apakah Anda yakin ingin menghapus template kustom dan kembali ke default?")) {
      const formData = new FormData();
      formData.append("intent", "reset_template");
      fetcher.submit(formData, { method: "POST" });
    }
  };

  // Download local copy
  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `MaduraDev_Twibbon_Template_${Date.now()}.png`;
    a.click();
    toast.success("File template PNG berhasil didownload!");
  };

  // Toast feedback on fetcher response
  useEffect(() => {
    if (fetcher.data?.success) {
      toast.success(fetcher.data.message || "Berhasil disimpan!");
    } else if (fetcher.data?.error) {
      toast.error(fetcher.data.error);
    }
  }, [fetcher.data]);

  const isSubmitting = fetcher.state === "submitting";

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard/settings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group mr-2"
            >
              <ArrowLeft
                size={14}
                className="transition-transform group-hover:-translate-x-0.5"
              />
              <span>Pengaturan</span>
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
              <Sparkles size={12} />
              <span>Studio Template</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground font-display tracking-tight">
            Editor Transparansi Twibbon
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Unggah bingkai Canva / JPG / PNG, lalu potong lubang transparan dengan ukuran dan bentuk bebas langsung di kanvas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPNG}
            className="flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Download PNG transparan ke komputer"
          >
            <Download size={14} />
            <span>Download PNG</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSaveToServer}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-md shadow-primary/25"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Menyimpan ke Server...</span>
              </>
            ) : (
              <>
                <Check size={14} />
                <span>Simpan Template Resmi</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Canvas Studio Stage (Col 7) */}
        <div className="xl:col-span-7 space-y-4">
          {/* Canvas Wrapper with Checkerboard Background */}
          <div
            ref={containerRef}
            className="relative w-full aspect-square max-w-[620px] mx-auto rounded-3xl border border-border/80 shadow-lg overflow-hidden bg-slate-950 flex items-center justify-center select-none"
            style={{
              backgroundImage: `
                linear-gradient(45deg, #1e2433 25%, transparent 25%),
                linear-gradient(-45deg, #1e2433 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #1e2433 75%),
                linear-gradient(-45deg, transparent 75%, #1e2433 75%)
              `,
              backgroundSize: "24px 24px",
              backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px",
              backgroundColor: "#0d1117",
            }}
            onMouseMove={handleOverlayMouseMove}
            onMouseUp={handleOverlayMouseUp}
          >
            {/* Optional Sample Participant Photo Simulation (Drawn underneath) */}
            {showSamplePhoto && sampleImg && (
              <img
                src={sampleImg.src}
                alt="Sample Participant"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
              />
            )}

            {/* Main Working Canvas */}
            <canvas
              ref={canvasRef}
              width={1080}
              height={1080}
              onClick={handleCanvasClick}
              className={`relative z-10 w-full h-full object-contain ${activeTool === "wand" ? "cursor-crosshair" : ""
                }`}
            />

            {/* Interactive Shape Guide Outline Overlay */}
            {activeTool === "shape" && (
              <svg
                className="absolute inset-0 w-full h-full z-20 pointer-events-none"
                viewBox="0 0 1080 1080"
              >
                {/* SVG path guide showing the active cutout area */}
                <g
                  transform={`translate(${centerX}, ${centerY}) rotate(${rotation})`}
                  className="pointer-events-auto cursor-grab active:cursor-grabbing"
                  onMouseDown={handleOverlayMouseDown}
                >
                  {shape === "circle" && (
                    <ellipse
                      cx={0}
                      cy={0}
                      rx={width / 2}
                      ry={height / 2}
                      fill="rgba(59, 130, 246, 0.15)"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      strokeDasharray="8 6"
                    />
                  )}

                  {shape === "rect" && (
                    <rect
                      x={-width / 2}
                      y={-height / 2}
                      width={width}
                      height={height}
                      fill="rgba(59, 130, 246, 0.15)"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      strokeDasharray="8 6"
                    />
                  )}

                  {shape === "rounded-rect" && (
                    <rect
                      x={-width / 2}
                      y={-height / 2}
                      width={width}
                      height={height}
                      rx={cornerRadius}
                      ry={cornerRadius}
                      fill="rgba(59, 130, 246, 0.15)"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      strokeDasharray="8 6"
                    />
                  )}

                  {shape === "arch" && (
                    <path
                      d={`M ${-width / 2} ${height / 2} L ${width / 2} ${height / 2} L ${width / 2
                        } ${-height / 2 + width / 2} A ${width / 2} ${width / 2} 0 0 0 ${-width / 2
                        } ${-height / 2 + width / 2} Z`}
                      fill="rgba(59, 130, 246, 0.15)"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      strokeDasharray="8 6"
                    />
                  )}

                  {(shape === "hexagon" ||
                    shape === "shield" ||
                    shape === "star" ||
                    shape === "heart") && (
                      <rect
                        x={-width / 2}
                        y={-height / 2}
                        width={width}
                        height={height}
                        rx={12}
                        fill="rgba(59, 130, 246, 0.15)"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        strokeDasharray="8 6"
                      />
                    )}

                  {/* Center Drag Handle Dot */}
                  <circle cx={0} cy={0} r={8} fill="#3b82f6" />
                  <circle cx={0} cy={0} r={16} fill="none" stroke="#ffffff" strokeWidth={2} />
                </g>
              </svg>
            )}

            {/* Coordinates & Status Badge */}
            <div className="absolute bottom-3 left-3 z-30 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-white/90">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {activeTool === "shape"
                  ? `Posisi: ${centerX}x${centerY} | ${width}x${height}px`
                  : `Mode Magic Wand (Toleransi: ${wandTolerance}%)`}
              </span>
            </div>
          </div>

          {/* Canvas Bottom Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border/60">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="flex items-center gap-1.5 text-xs cursor-pointer"
                title="Batalkan potongan terakhir"
              >
                <RotateCcw size={13} />
                <span>Undo</span>
              </Button>

              <Button
                variant={showSamplePhoto ? "default" : "outline"}
                size="sm"
                onClick={() => setShowSamplePhoto(!showSamplePhoto)}
                className="flex items-center gap-1.5 text-xs cursor-pointer"
              >
                {showSamplePhoto ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showSamplePhoto ? "Sembunyikan Foto Orang" : "Simulasi Foto Orang"}</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {activeTemplateUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetTemplate}
                  disabled={isSubmitting}
                  className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Reset Default</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Tool Deck (Col 5) */}
        <div className="xl:col-span-5 space-y-6">
          {/* Card 1: Upload Image Source */}
          <Card className="rounded-3xl border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ImageIcon size={18} className="text-primary" />
                  <span>1. Gambar Bingkai Template</span>
                </CardTitle>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
                  1080x1080 HD
                </span>
              </div>
              <CardDescription className="text-xs">
                Unggah desain bingkai Anda dari Canva atau komputer (format JPG atau PNG).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/40 transition-all text-xs font-semibold text-foreground">
                    <Upload size={14} className="text-primary" />
                    <span>Pilih Gambar Baru</span>
                  </div>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {activeTemplateUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadImageToCanvas(activeTemplateUrl)}
                    className="text-xs cursor-pointer"
                    title="Muat template yang saat ini aktif di server"
                  >
                    <span>Muat Ulang Aktif</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Tools (Shape Cutout vs Magic Wand) */}
          <Card className="rounded-3xl border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sliders size={18} className="text-primary" />
                  <span>2. Alat Pembuat Transparansi</span>
                </CardTitle>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTool("shape")}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTool === "shape"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Circle size={14} />
                  <span>Bentuk Geometris</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTool("wand")}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTool === "wand"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Wand2 size={14} />
                  <span>Magic Wand (Warna)</span>
                </button>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 pt-2">
              {/* TAB 1: GEOMETRIC SHAPE CUTTER */}
              {activeTool === "shape" && (
                <div className="space-y-4">
                  {/* Shape Selector Grid */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Pilihan Bentuk
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {SHAPES.map((s) => {
                        const Icon = s.icon;
                        const isSelected = shape === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setShape(s.id)}
                            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                              }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="truncate w-full text-center">{s.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sizing Controls */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold">Ukuran Lubang</Label>
                      <button
                        type="button"
                        onClick={() => setLockAspect(!lockAspect)}
                        className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors ${lockAspect
                          ? "bg-primary/10 text-primary font-bold"
                          : "bg-muted text-muted-foreground"
                          }`}
                      >
                        {lockAspect ? "Rasio 1:1 Terkunci" : "Bebas W x H"}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[11px] text-muted-foreground font-medium">
                          Lebar: {width}px
                        </span>
                        <input
                          type="range"
                          min="100"
                          max="1080"
                          step="5"
                          value={width}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setWidth(val);
                            if (lockAspect) setHeight(val);
                          }}
                          className="w-full accent-primary cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] text-muted-foreground font-medium">
                          Tinggi: {height}px
                        </span>
                        <input
                          type="range"
                          min="100"
                          max="1080"
                          step="5"
                          value={height}
                          disabled={lockAspect}
                          onChange={(e) => setHeight(Number(e.target.value))}
                          className="w-full accent-primary cursor-pointer disabled:opacity-40"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Position Controls */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold">Posisi Lubang (X & Y)</Label>
                      <button
                        type="button"
                        onClick={centerBoth}
                        className="text-[11px] text-primary hover:underline font-bold"
                      >
                        Pusatkan (Tengah)
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[11px] text-muted-foreground font-medium">
                          X: {centerX}px
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="1080"
                          step="5"
                          value={centerX}
                          onChange={(e) => setCenterX(Number(e.target.value))}
                          className="w-full accent-primary cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] text-muted-foreground font-medium">
                          Y: {centerY}px
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="1080"
                          step="5"
                          value={centerY}
                          onChange={(e) => setCenterY(Number(e.target.value))}
                          className="w-full accent-primary cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Corner Radius & Rotation */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {shape === "rounded-rect" && (
                      <div className="space-y-1 col-span-2">
                        <span className="text-[11px] text-muted-foreground font-medium">
                          Kelengkungan Sudut: {cornerRadius}px
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="300"
                          step="5"
                          value={cornerRadius}
                          onChange={(e) => setCornerRadius(Number(e.target.value))}
                          className="w-full accent-primary cursor-pointer"
                        />
                      </div>
                    )}

                    <div className="space-y-1 col-span-2">
                      <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                        <span>Rotasi: {rotation}°</span>
                        {rotation !== 0 && (
                          <button
                            type="button"
                            onClick={() => setRotation(0)}
                            className="text-primary hover:underline"
                          >
                            Reset 0°
                          </button>
                        )}
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="5"
                        value={rotation}
                        onChange={(e) => setRotation(Number(e.target.value))}
                        className="w-full accent-primary cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Apply Cutout Button */}
                  <Button
                    type="button"
                    onClick={applyShapeCutout}
                    className="w-full h-11 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20 mt-2"
                  >
                    <Sparkles size={15} />
                    <span>Potong Lubang Menjadi Transparan</span>
                  </Button>
                </div>
              )}

              {/* TAB 2: MAGIC WAND (COLOR ERASER) */}
              {activeTool === "wand" && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs">
                      <HelpCircle size={15} />
                      <span>Cara Pakai Magic Wand:</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Klik langsung pada area warna di kanvas (misal kotak putih di tengah dari Canva). Seluruh warna tersebut akan otomatis terhapus menjadi transparan!
                    </p>
                  </div>

                  {/* Wand Mode */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Jangkauan Penghapusan</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setWandMode("contiguous")}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${wandMode === "contiguous"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/60 hover:bg-muted text-muted-foreground"
                          }`}
                      >
                        Area Terhubung Saja
                      </button>
                      <button
                        type="button"
                        onClick={() => setWandMode("global")}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${wandMode === "global"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/60 hover:bg-muted text-muted-foreground"
                          }`}
                      >
                        Semua Warna Sama
                      </button>
                    </div>
                  </div>

                  {/* Wand Tolerance */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Toleransi Warna</span>
                      <span className="text-muted-foreground font-mono">{wandTolerance}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="80"
                      step="5"
                      value={wandTolerance}
                      onChange={(e) => setWandTolerance(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Nilai lebih tinggi akan mencakup variasi bayangan warna yang sedikit berbeda di sekitar tepi.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
