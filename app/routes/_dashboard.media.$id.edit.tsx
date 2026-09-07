import { useState, useEffect } from "react";
import { useNavigate, Link, useLoaderData, redirect } from "react-router";
import { createClient } from "@/lib/supabase/client";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMediaPostById } from "@/lib/media";
import type { Route } from "./+types/_dashboard.media.$id.edit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ControlledSelect, SelectItem } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowLeft, Eye, PenTool } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { DeleteMediaPostButton } from "@/components/dashboard/delete-media-post-button";
import { marked } from "marked";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export const meta = ({ data }: { data: any }) => [
  { title: `Edit Artikel: ${data?.post?.title || "Detail"} - Dashboard MaduraDev` },
];

export async function loader({ params, request }: Route.LoaderArgs) {
  const supabase = createServerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw redirect("/login");
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const post = await getMediaPostById(adminClient, params.id);

  if (!post) {
    throw new Response("Artikel tidak ditemukan", { status: 404 });
  }

  const role = profile?.role ?? "core_team";
  const isOwner = post.author_id && post.author_id === user.id;

  if (role !== "admin" && !isOwner) {
    throw redirect("/dashboard/media");
  }

  return { post, currentUserId: user.id, role };
}

export default function EditMediaPostPage() {
  const { post, currentUserId, role } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [htmlPreview, setHtmlPreview] = useState("");

  // Format published_at datetime string from UTC to Local timezone format for datetime-local input
  const getInitialDateTime = () => {
    if (!post.published_at) return "";
    const dateVal = new Date(post.published_at);
    const offset = dateVal.getTimezoneOffset();
    return new Date(dateVal.getTime() - (offset * 60 * 1000)).toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    title: post.title || "",
    slug: post.slug || "",
    summary: post.summary || "",
    content: post.content || "",
    image_url: post.image_url || null,
    type: (post.type || "kabar") as "kabar" | "blog",
    status: (post.status || "draft") as "published" | "draft",
    published_at: getInitialDateTime(),
  });

  useEffect(() => {
    if (activeTab === "preview") {
      try {
        const parsed = marked.parse(formData.content || "") as string;
        setHtmlPreview(parsed);
      } catch (e) {
        setHtmlPreview("<p className='text-destructive'>Gagal mengurai Markdown.</p>");
      }
    }
  }, [activeTab, formData.content]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    if (!supabase) {
      toast.error("Supabase client tidak tersedia");
      setLoading(false);
      return;
    }

    // Ownership guard check
    if (role !== "admin" && post.author_id !== currentUserId) {
      toast.error("Anda hanya dapat mengedit artikel karya Anda sendiri.");
      setLoading(false);
      return;
    }

    // Format local datetime input string into standard UTC ISOString for PostgreSQL
    const publishDate = formData.published_at 
      ? new Date(formData.published_at).toISOString() 
      : new Date().toISOString();

    const payload = {
      title: formData.title,
      slug: formData.slug,
      summary: formData.summary,
      content: formData.content,
      image_url: formData.image_url,
      type: formData.type,
      status: formData.status,
      published_at: publishDate,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("media_posts")
      .update(payload)
      .eq("id", post.id);

    if (error) {
      toast.error("Gagal memperbarui artikel: " + error.message);
      setLoading(false);
      return;
    }

    toast.success("Artikel berhasil diperbarui");
    navigate("/dashboard/media");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/media">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Artikel</h1>
          <p className="text-muted-foreground">
            Perbarui konten, jenis artikel, atau ubah status publikasi
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Konten Artikel</CardTitle>
                <CardDescription>Masukkan isi utama tulisan Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Artikel *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="Judul artikel menarik..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Ringkasan Singkat (Summary) *</Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, summary: e.target.value }))
                    }
                    placeholder="Ringkasan singkat untuk list artikel..."
                    rows={3}
                    required
                  />
                </div>

                {/* Editor vs Preview Tabs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <Label>Isi Konten (Markdown) *</Label>
                    <div className="flex gap-1.5 p-0.5 bg-muted rounded-lg border">
                      <button
                        type="button"
                        onClick={() => setActiveTab("edit")}
                        className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
                          activeTab === "edit"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <PenTool className="w-3.5 h-3.5" /> Tulis
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("preview")}
                        className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
                          activeTab === "preview"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" /> Pratinjau
                      </button>
                    </div>
                  </div>

                  {activeTab === "edit" ? (
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, content: e.target.value }))
                      }
                      placeholder="Tulis artikel menggunakan format Markdown..."
                      rows={15}
                      className="font-mono text-sm leading-relaxed"
                      required
                    />
                  ) : (
                    <div className="border rounded-lg p-6 bg-card/50 min-h-[340px] max-h-[500px] overflow-y-auto">
                      <MarkdownRenderer content={htmlPreview} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Publikasi</CardTitle>
                <CardDescription>Konfigurasi publikasi artikel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug Artikel *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="slug-artikel-ini"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipe Artikel *</Label>
                  <ControlledSelect
                    value={formData.type}
                    onValueChange={(value: string) =>
                      setFormData((prev) => ({ ...prev, type: value as "kabar" | "blog" }))
                    }
                  >
                    <SelectItem value="kabar">Kabar Dev</SelectItem>
                    <SelectItem value="blog">Blog Dev</SelectItem>
                  </ControlledSelect>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <ControlledSelect
                    value={formData.status}
                    onValueChange={(value: string) =>
                      setFormData((prev) => ({ ...prev, status: value as "published" | "draft" }))
                    }
                  >
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Diterbitkan</SelectItem>
                  </ControlledSelect>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="published_at">Tanggal Terbit</Label>
                  <Input
                    id="published_at"
                    type="datetime-local"
                    value={formData.published_at}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, published_at: e.target.value }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cover Image</CardTitle>
                <CardDescription>Gambar thumbnail artikel</CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) =>
                    setFormData((prev) => ({ ...prev, image_url: url }))
                  }
                  folder="media"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Perbarui Artikel"
            )}
          </Button>
          <DeleteMediaPostButton
            id={post.id}
            title={post.title}
            variant="button"
            onSuccess={() => navigate("/dashboard/media")}
          />
          <Button type="button" variant="outline" asChild>
            <Link to="/dashboard/media">Batal</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
