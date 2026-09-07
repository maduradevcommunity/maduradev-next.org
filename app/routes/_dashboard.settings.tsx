import { useState, useEffect } from "react";
import { useFetcher, Link } from "react-router";
import { createClient } from "@/lib/supabase/client";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Upload, Image, Trash, Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const meta = () => [
  { title: "Settings - Dashboard MaduraDev" },
];

export async function action({ request }: { request: Request }) {
  const supabase = createServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "upload_template") {
    const file = formData.get("template") as File;
    if (!file) {
      return new Response(JSON.stringify({ success: false, intent: "upload_template", error: "File template tidak ditemukan" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error } = await adminClient.storage
        .from("images")
        .upload("twibbon/template.png", buffer, {
          upsert: true,
          contentType: "image/png"
        });

      if (error) {
        return new Response(JSON.stringify({ success: false, intent: "upload_template", error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, intent: "upload_template" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, intent: "upload_template", error: err.message || "Gagal mengunggah file" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (intent === "reset_template") {
    try {
      const { error } = await adminClient.storage
        .from("images")
        .remove(["twibbon/template.png"]);

      if (error) {
        return new Response(JSON.stringify({ success: false, intent: "reset_template", error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, intent: "reset_template" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, intent: "reset_template", error: err.message || "Gagal menghapus file" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ success: false, intent: intent || "unknown", error: "Aksi tidak dikenal" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

export default function SettingsPage() {
  const supabase = createClient();
  const fetcher = useFetcher<{ success: boolean; intent: string; error?: string }>();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [templatePreview, setTemplatePreview] = useState<string | null>(null);
  const [templateTimestamp, setTemplateTimestamp] = useState(Date.now());
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [hasCustomTemplate, setHasCustomTemplate] = useState(false);

  const uploadingTemplate = fetcher.state !== "idle" && fetcher.formData?.get("intent") === "upload_template";
  const resettingTemplate = fetcher.state !== "idle" && fetcher.formData?.get("intent") === "reset_template";

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setEmail(user.email);
    };
    getUser();

    const fetchTemplate = async () => {
      if (!supabase) return;
      const { data: { publicUrl } } = supabase.storage
        .from("images")
        .getPublicUrl("twibbon/template.png");
      
      try {
        const res = await fetch(publicUrl, { method: "HEAD" });
        if (res.ok) {
          setTemplatePreview(publicUrl);
          setHasCustomTemplate(true);
        }
      } catch (err) {
        console.error("Template check error:", err);
      }
    };
    fetchTemplate();
  }, []);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success) {
        if (fetcher.data.intent === "upload_template") {
          toast.success("Template Twibbon berhasil diperbarui");
          setTemplateFile(null);
          setHasCustomTemplate(true);
        } else if (fetcher.data.intent === "reset_template") {
          toast.success("Template kustom berhasil dihapus. Kembali ke bingkai default.");
          setTemplatePreview(null);
          setHasCustomTemplate(false);
          setTemplateFile(null);
        }
        setTemplateTimestamp(Date.now());
      } else {
        toast.error("Gagal: " + (fetcher.data.error || "Terjadi kesalahan"));
      }
    }
  }, [fetcher.state, fetcher.data]);

  const handleTemplateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "image/png") {
        toast.error("Format file harus PNG (transparan)");
        return;
      }
      setTemplateFile(file);
      setTemplatePreview(URL.createObjectURL(file));
    }
  };

  const handleTemplateUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateFile) return;

    const formData = new FormData();
    formData.append("intent", "upload_template");
    formData.append("template", templateFile);

    fetcher.submit(formData, {
      method: "POST",
      encType: "multipart/form-data",
    });
  };

  const handleResetTemplate = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus template kustom dan kembali ke template default?")) {
      return;
    }

    const formData = new FormData();
    formData.append("intent", "reset_template");

    fetcher.submit(formData, {
      method: "POST",
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    if (passwords.new !== passwords.confirm) {
      toast.error("Password baru tidak cocok");
      return;
    }
    if (passwords.new.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.new });

    if (error) {
      toast.error("Gagal mengubah password: " + error.message);
      setLoading(false);
      return;
    }

    toast.success("Password berhasil diubah");
    setPasswords({ new: "", confirm: "" });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Kelola pengaturan akun admin</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil Admin</CardTitle>
          <CardDescription>Informasi akun yang sedang login</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} disabled />
            <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Template Twibbon</CardTitle>
          <CardDescription>
            Unggah bingkai template Twibbon kustom (format PNG transparan)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTemplateUpload} className="space-y-6">
            <div className="space-y-4">
              <Label>Preview Bingkai Aktif</Label>
              <div className="flex items-start gap-6 flex-col md:flex-row">
                <div className="relative w-36 h-36 rounded-2xl border border-dashed flex items-center justify-center bg-slate-900 overflow-hidden shrink-0">
                  {templatePreview && hasCustomTemplate ? (
                    <img
                      src={`${templatePreview}?t=${templateTimestamp}`}
                      alt="Active Twibbon Template"
                      className="w-full h-full object-contain"
                      onError={() => setHasCustomTemplate(false)}
                    />
                  ) : (
                    <div className="text-center p-3 text-xs text-muted-foreground flex flex-col items-center gap-2">
                      <Image className="h-8 w-8 opacity-40" />
                      <span>Bingkai Default Aktif</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3 flex-1">
                  <Input
                    type="file"
                    accept="image/png"
                    onChange={handleTemplateFileChange}
                    className="max-w-xs"
                    disabled={uploadingTemplate}
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Unggah file gambar kustom format **PNG transparan** dengan aspek rasio **1:1 (Square)**, disarankan resolusi **1080x1080px**. Gambar ini akan menimpa bingkai bawaan pada halaman Twibbon.
                  </p>
                  <div className="flex gap-2 flex-wrap items-center">
                    <Link
                      to="/dashboard/twibbon-editor"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-all shadow-xs"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Buka Studio Editor (Potong Transparansi)</span>
                    </Link>
                    {templateFile && (
                      <Button type="submit" disabled={uploadingTemplate} className="flex items-center gap-2">
                        {uploadingTemplate ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Mengunggah...</>
                        ) : (
                          <><Upload className="h-4 w-4" /> Perbarui Template</>
                        )}
                      </Button>
                    )}
                    {hasCustomTemplate && !templateFile && (
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={resettingTemplate}
                        onClick={handleResetTemplate}
                        className="flex items-center gap-2"
                      >
                        {resettingTemplate ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Menghapus...</>
                        ) : (
                          <><Trash className="h-4 w-4" /> Reset ke Default</>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
          <CardDescription>Perbarui password akun untuk keamanan</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Password Baru</Label>
              <Input id="new-password" type="password" value={passwords.new} onChange={(e) => setPasswords((prev) => ({ ...prev, new: e.target.value }))} placeholder="Minimal 6 karakter" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Konfirmasi Password</Label>
              <Input id="confirm-password" type="password" value={passwords.confirm} onChange={(e) => setPasswords((prev) => ({ ...prev, confirm: e.target.value }))} placeholder="Ulangi password baru" required />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>) : "Ubah Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
