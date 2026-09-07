import type { Route } from "./+types/_dashboard.communities";
import { Link, useLoaderData } from "react-router";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, MapPin } from "lucide-react";
import { DeleteCommunityButton } from "@/components/dashboard/delete-community-button";
import type { Community } from "@/lib/supabase/types";

export const meta: Route.MetaFunction = () => [
  { title: "Communities - Dashboard MaduraDev" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("communities")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching communities:", error);
    return { communities: [] };
  }
  return { communities: (data as Community[]) || [] };
}

export default function DashboardCommunitiesPage() {
  const { communities } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Communities</h1>
          <p className="text-muted-foreground">
            Kelola komunitas yang ditampilkan di peta Madura
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/communities/create">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Komunitas
          </Link>
        </Button>
      </div>

      {communities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <MapPin className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-4">
            Belum ada komunitas terdaftar
          </p>
          <Button asChild>
            <Link to="/dashboard/communities/create">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Komunitas Pertama
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Instagram</TableHead>
                <TableHead>Koordinat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {communities.map((community: Community) => (
                <TableRow key={community.id}>
                  <TableCell>
                    <div className="w-10 h-10 rounded-full overflow-hidden border bg-background flex items-center justify-center">
                      {community.logo_url ? (
                        <img
                          src={community.logo_url}
                          alt={community.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground">
                          {community.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{community.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {community.slug}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{community.region}</Badge>
                  </TableCell>
                  <TableCell>
                    {community.instagram ? (
                      <a
                        href={`https://instagram.com/${community.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        @{community.instagram}
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {community.latitude.toFixed(4)},{" "}
                    {community.longitude.toFixed(4)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={community.is_active ? "default" : "outline"}
                    >
                      {community.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link
                          to={`/dashboard/communities/${community.id}/edit`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteCommunityButton
                        id={community.id}
                        name={community.name}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
