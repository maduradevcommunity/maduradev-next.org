import type { Route } from "./+types/_dashboard.events";
import { Link, useLoaderData } from "react-router";
import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isEventNew } from "@/lib/event";
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
import { 
  Plus, 
  Pencil, 
  ExternalLink, 
  Users, 
  Search,
  SlidersHorizontal,
  CalendarCheck
} from "lucide-react";
import { DeleteEventButton } from "@/components/dashboard/delete-event-button";

export const meta: Route.MetaFunction = () => [
  { title: "Events - Dashboard MaduraDev" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const supabase = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminClient = createAdminClient();

  let role: UserRole = "core_team";
  if (user) {
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role) role = profile.role;
  }

  const { data: events, error: eventsError } = await adminClient
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (eventsError) {
    console.error("Error fetching events:", eventsError);
    return { events: [], currentUserId: user?.id || null, role };
  }

  // Fetch event registrations count
  const { data: registrations, error: regError } = await adminClient
    .from("event_registrations")
    .select("event_id");

  const counts: Record<string, number> = {};
  if (!regError && registrations) {
    registrations.forEach((reg: any) => {
      counts[reg.event_id] = (counts[reg.event_id] || 0) + 1;
    });
  }

  const eventsWithCount = (events || []).map((event: any) => ({
    ...event,
    registrations_count: counts[event.id] || 0,
  }));

  return { events: eventsWithCount, currentUserId: user?.id || null, role };
}

export default function DashboardEventsPage() {
  const { events, currentUserId, role } = useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "upcoming" | "past"

  const filteredEvents = useMemo(() => {
    return events.filter((event: any) => {
      // 1. Search filter
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            event.slug.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Status filter
      const isUpcoming = isEventNew(event.event_date, event.event_time);
      let matchesStatus = true;
      if (statusFilter === "upcoming") {
        matchesStatus = isUpcoming;
      } else if (statusFilter === "past") {
        matchesStatus = !isUpcoming;
      }

      return matchesSearch && matchesStatus;
    });
  }, [events, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Kelola semua event komunitas MaduraDev
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/events/create">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Event
          </Link>
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari judul atau slug event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex bg-muted p-1 rounded-lg border text-sm self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-1.5 rounded-md font-medium transition-all ${
              statusFilter === "all"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setStatusFilter("upcoming")}
            className={`px-4 py-1.5 rounded-md font-medium transition-all ${
              statusFilter === "upcoming"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mendatang
          </button>
          <button
            onClick={() => setStatusFilter("past")}
            className={`px-4 py-1.5 rounded-md font-medium transition-all ${
              statusFilter === "past"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Selesai
          </button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground mb-4">Event tidak ditemukan</p>
          {events.length === 0 && (
            <Button asChild>
              <Link to="/dashboard/events/create">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Event Pertama
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Format & Tipe</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jumlah Peserta</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event: any) => {
                const isUpcoming = isEventNew(event.event_date, event.event_time);
                return (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-foreground">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.slug}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge variant="secondary" className="capitalize">{event.format}</Badge>
                        <Badge variant="outline" className="capitalize text-[10px]">{event.type || "internal"}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{event.event_date}</p>
                        <p className="text-xs text-muted-foreground">{event.event_time}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.rsvp_enabled ? (
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="font-bold text-sm">
                            {event.registrations_count}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            / {event.max_attendees || "∞"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge variant={event.is_published ? "default" : "outline"}>
                          {event.is_published ? "Published" : "Draft"}
                        </Badge>
                        {isUpcoming ? (
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] uppercase tracking-wider">Mendatang</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-muted text-muted-foreground text-[9px] uppercase tracking-wider">Selesai</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {(() => {
                        const canManage = role === "admin" || (event.author_id && event.author_id === currentUserId);
                        return (
                          <div className="flex items-center justify-end gap-2">
                            {event.rsvp_enabled && (
                              <Button variant="ghost" size="icon" asChild title="Lihat RSVP Peserta">
                                <Link to={`/dashboard/events/${event.id}`}>
                                  <Users className="h-4 w-4 text-primary" />
                                </Link>
                              </Button>
                            )}
                            {event.url && (
                              <Button variant="ghost" size="icon" asChild title="Buka URL Event">
                                <a href={event.url} target="_blank" rel="noopener">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            {canManage ? (
                              <>
                                <Button variant="ghost" size="icon" asChild title="Edit Event">
                                  <Link to={`/dashboard/events/${event.id}/edit`}>
                                    <Pencil className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <DeleteEventButton id={event.id} title={event.title} />
                              </>
                            ) : (
                              <span
                                className="text-[11px] text-muted-foreground/50 px-2 py-1 italic select-none"
                                title="Hanya pembuat atau Admin yang dapat mengedit/menghapus event ini"
                              >
                                Hanya Baca
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
