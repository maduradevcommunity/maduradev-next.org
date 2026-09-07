import type { Route } from "./+types/_dashboard.media";
import { Link, useLoaderData } from "react-router";
import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllMediaPosts } from "@/lib/media";
import type { UserRole } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, ExternalLink, Search, SlidersHorizontal, Newspaper, Lock } from "lucide-react";
import { DeleteMediaPostButton } from "@/components/dashboard/delete-media-post-button";

export const meta: Route.MetaFunction = () => [
  { title: "Media - Dashboard MaduraDev" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const supabase = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminClient = createAdminClient();
  const posts = await getAllMediaPosts(adminClient);

  let role: UserRole = "core_team";
  if (user) {
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role) role = profile.role;
  }

  return { posts, currentUserId: user?.id || null, role };
}

export default function DashboardMediaPage() {
  const { posts, currentUserId, role } = useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // "all" | "kabar" | "blog"
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "published" | "draft"

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // 1. Search filter
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.slug.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Type filter
      const matchesType = typeFilter === "all" || post.type === typeFilter;

      // 3. Status filter
      const matchesStatus = statusFilter === "all" || post.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [posts, searchQuery, typeFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media</h1>
          <p className="text-muted-foreground">
            Kelola kabar kegiatan komunitas dan artikel blog teknis MaduraDev
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/media/create">
            <Plus className="mr-2 h-4 w-4" /> Tambah Artikel
          </Link>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari judul atau slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filter:</span>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-muted border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-foreground"
          >
            <option value="all">Semua Tipe</option>
            <option value="kabar">Kabar Dev</option>
            <option value="blog">Blog Dev</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-muted border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-foreground"
          >
            <option value="all">Semua Status</option>
            <option value="published">Diterbitkan</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Cover</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Penulis</TableHead>
              <TableHead>Tgl Diterbitkan</TableHead>
              <TableHead className="w-[120px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Tidak ada artikel ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post) => (
                <TableRow key={post.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="w-12 h-8 rounded-lg overflow-hidden bg-muted border border-border relative flex items-center justify-center">
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Newspaper className="w-4 h-4 text-muted-foreground/40" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    <div className="max-w-[280px] truncate" title={post.title}>
                      {post.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[280px]">
                      /{post.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wide ${
                        post.type === "kabar" ? "text-blue-500" : "text-emerald-500"
                      }`}
                    >
                      {post.type === "kabar" ? "Kabar Dev" : "Blog Dev"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.status === "published" ? "default" : "secondary"}>
                      {post.status === "published" ? "Diterbitkan" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {post.author?.name || "-"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {post.tanggal}
                  </TableCell>
                  <TableCell className="text-right">
                    {(() => {
                      const canManage = role === "admin" || (post.author_id && post.author_id === currentUserId);
                      return (
                        <div className="flex items-center justify-end gap-1.5">
                          {post.status === "published" && (
                            <Button variant="ghost" size="icon" asChild title="Lihat Artikel">
                              <a href={`/media/${post.slug}`} target="_blank" rel="noreferrer">
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                              </a>
                            </Button>
                          )}
                          {canManage ? (
                            <>
                              <Button variant="ghost" size="icon" asChild title="Edit Artikel">
                                <Link to={`/dashboard/media/${post.id}/edit`}>
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                              <DeleteMediaPostButton
                                id={post.id}
                                title={post.title}
                                onSuccess={() => {
                                  window.location.reload();
                                }}
                              />
                            </>
                          ) : (
                            <span
                              className="text-[11px] text-muted-foreground/50 px-2 py-1 italic select-none"
                              title="Hanya penulis atau Admin yang dapat mengedit/menghapus artikel ini"
                            >
                              Hanya Baca
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
