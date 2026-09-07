import type { Route } from "./+types/_dashboard._index";
import { Link, useLoaderData, redirect } from "react-router";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isEventNew } from "@/lib/event";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusCards } from "@/components/dashboard/status-cards";
import {
  Calendar,
  Users,
  MapPin,
  Ticket,
  Clock,
  ArrowRight,
  QrCode,
  Pencil,
  Sparkles,
  CalendarPlus,
  UserPlus,
  FileText,
  MapPinPlus,
  TrendingUp,
  ShieldCheck,
  Lock,
  UserCheck,
  Info,
} from "lucide-react";

export const meta: Route.MetaFunction = () => [
  { title: "Dashboard - MaduraDev" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const supabase = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw redirect("/login");
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role, can_manage_events, can_manage_media")
    .eq("id", user.id)
    .single();

  if (!profile) {
    throw redirect("/login");
  }

  const isAdmin = profile.role === "admin";
  const canManageEvents = isAdmin || !!profile.can_manage_events;
  const canManageMedia = isAdmin || !!profile.can_manage_media;

  // Fetch current user's core_team record if available
  const { data: currentTeamMember } = await adminClient
    .from("core_team")
    .select("name, avatar_url, position, is_active, description")
    .eq("user_id", user.id)
    .maybeSingle();

  if (isAdmin) {
    // Super Admin queries everything
    const [
      eventsResult,
      teamResult,
      communitiesResult,
      mediaResult,
      regResult,
    ] = await Promise.all([
      adminClient
        .from("events")
        .select("*")
        .order("created_at", { ascending: false }),
      adminClient.from("core_team").select("*", { count: "exact" }),
      adminClient.from("communities").select("*", { count: "exact" }),
      adminClient
        .from("media_posts")
        .select("id, title, slug, type, status, published_at, created_at, author_id")
        .order("created_at", { ascending: false })
        .limit(4),
      adminClient.from("event_registrations").select("event_id, status"),
    ]);

    const allEvents = eventsResult.data || [];
    const publishedEvents = allEvents.filter((e: any) => e.is_published).length;
    const draftEvents = allEvents.length - publishedEvents;

    const regCounts: Record<string, number> = {};
    if (regResult.data) {
      regResult.data.forEach((r: any) => {
        regCounts[r.event_id] = (regCounts[r.event_id] || 0) + 1;
      });
    }

    const eventsWithStats = allEvents.map((event: any) => ({
      ...event,
      registrations_count: regCounts[event.id] || 0,
      is_upcoming: isEventNew(event.event_date, event.event_time),
    }));

    const upcomingEvents = eventsWithStats.filter((e: any) => e.is_upcoming);
    const pastEvents = eventsWithStats.filter((e: any) => !e.is_upcoming);

    const sortedUpcoming = [...upcomingEvents].sort((a, b) => {
      return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
    });
    const nextUpcomingEvent = sortedUpcoming.length > 0 ? sortedUpcoming[0] : null;

    const stats = {
      totalEvents: allEvents.length,
      publishedEvents,
      draftEvents,
      upcomingCount: upcomingEvents.length,
      pastCount: pastEvents.length,
      totalRegistrations: regResult.data?.length || 0,
      totalTeam: teamResult.count || 0,
      activeTeam: teamResult.data?.filter((t: any) => t.is_active).length || 0,
      totalCommunities: communitiesResult.count || 0,
      activeCommunities:
        communitiesResult.data?.filter((c: any) => c.is_active).length || 0,
      totalMedia: mediaResult.data?.length || 0,
    };

    return {
      isAdmin: true,
      canManageEvents: true,
      canManageMedia: true,
      stats,
      nextUpcomingEvent,
      recentEvents: eventsWithStats.slice(0, 5),
      recentMedia: mediaResult.data || [],
      currentTeamMember,
      userEmail: user.email,
      currentUserId: user.id,
    };
  } else {
    // Core Team: ONLY query permitted data!
    const [eventsResult, regResult, mediaResult] = await Promise.all([
      canManageEvents
        ? adminClient
            .from("events")
            .select("*")
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] }),
      canManageEvents
        ? adminClient.from("event_registrations").select("event_id, status")
        : Promise.resolve({ data: [] }),
      canManageMedia
        ? adminClient
            .from("media_posts")
            .select("id, title, slug, type, status, published_at, created_at, author_id")
            .order("created_at", { ascending: false })
            .limit(4)
        : Promise.resolve({ data: [] }),
    ]);

    const allEvents = eventsResult.data || [];
    const publishedEvents = allEvents.filter((e: any) => e.is_published).length;
    const draftEvents = allEvents.length - publishedEvents;

    const regCounts: Record<string, number> = {};
    if (regResult.data) {
      regResult.data.forEach((r: any) => {
        regCounts[r.event_id] = (regCounts[r.event_id] || 0) + 1;
      });
    }

    const eventsWithStats = allEvents.map((event: any) => ({
      ...event,
      registrations_count: regCounts[event.id] || 0,
      is_upcoming: isEventNew(event.event_date, event.event_time),
    }));

    const upcomingEvents = eventsWithStats.filter((e: any) => e.is_upcoming);
    const sortedUpcoming = [...upcomingEvents].sort((a, b) => {
      return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
    });
    const nextUpcomingEvent = sortedUpcoming.length > 0 ? sortedUpcoming[0] : null;

    const stats = {
      totalEvents: allEvents.length,
      publishedEvents,
      draftEvents,
      upcomingCount: upcomingEvents.length,
      pastCount: allEvents.length - upcomingEvents.length,
      totalRegistrations: regResult.data?.length || 0,
      totalTeam: 0,
      activeTeam: 0,
      totalCommunities: 0,
      activeCommunities: 0,
      totalMedia: mediaResult.data?.length || 0,
    };

    return {
      isAdmin: false,
      canManageEvents,
      canManageMedia,
      stats,
      nextUpcomingEvent,
      recentEvents: eventsWithStats.slice(0, 5),
      recentMedia: mediaResult.data || [],
      currentTeamMember,
      userEmail: user.email,
      currentUserId: user.id,
    };
  }
}

export default function DashboardIndexPage() {
  const {
    isAdmin,
    canManageEvents,
    canManageMedia,
    stats,
    nextUpcomingEvent,
    recentEvents,
    recentMedia,
    currentTeamMember,
    userEmail,
    currentUserId,
  } = useLoaderData<typeof loader>();

  const displayName =
    currentTeamMember?.name || userEmail?.split("@")[0] || (isAdmin ? "Admin" : "Team Member");

  const todayFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* 1. Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-background p-4 sm:p-6 md:p-8 shadow-xs">
        {/* Ambient glow decoration */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 -bottom-20 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5 sm:gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-medium bg-background/80 border border-border/80 text-muted-foreground backdrop-blur-xs shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {todayFormatted}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-primary/15 text-primary border border-primary/20">
                {isAdmin ? "Super Admin Console" : "Portal Anggota Core Team"}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Selamat Datang, {displayName}! 👋
            </h1>

            <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {isAdmin
                ? "Pantau statistik aktivitas komunitas, kelola tiket event, publikasi media, dan koordinasi pengurus MaduraDev dari satu dashboard terpadu."
                : "Kelola kontribusi komunitas MaduraDev sesuai dengan hak akses yang diberikan oleh Super Admin."}
            </p>

            {/* Permission status tags for Core Team */}
            {!isAdmin && (
              <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground font-medium">Status Akses:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium ${
                    canManageEvents
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {canManageEvents ? (
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Lock className="h-3 w-3" />
                  )}
                  {canManageEvents ? "Izin Event Aktif" : "Izin Event Terkunci"}
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium ${
                    canManageMedia
                      ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {canManageMedia ? (
                    <ShieldCheck className="h-3 w-3 text-sky-500" />
                  ) : (
                    <Lock className="h-3 w-3" />
                  )}
                  {canManageMedia ? "Izin Media Aktif" : "Izin Media Terkunci"}
                </span>
              </div>
            )}
          </div>

          {/* Quick Action buttons on banner */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
            {canManageEvents && (
              <Button asChild size="sm" className="gap-2 shadow-sm font-medium flex-1 sm:flex-none justify-center">
                <Link to="/dashboard/events/create">
                  <CalendarPlus className="h-4 w-4" />
                  <span>Buat Event</span>
                </Link>
              </Button>
            )}

            {canManageMedia && (
              <Button
                asChild
                size="sm"
                variant={canManageEvents ? "outline" : "default"}
                className="gap-2 bg-background/60 backdrop-blur-xs font-medium flex-1 sm:flex-none justify-center"
              >
                <Link to="/dashboard/media/create">
                  <FileText className="h-4 w-4" />
                  <span>Tulis Artikel</span>
                </Link>
              </Button>
            )}

            <Button asChild size="sm" variant="outline" className="gap-2 bg-background/60 backdrop-blur-xs flex-1 sm:flex-none justify-center">
              <Link to="/dashboard/profile">
                <UserCheck className="h-4 w-4" />
                <span>Profil Saya</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Key KPI Metric Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>{isAdmin ? "Ringkasan Metrik Utama" : "Ringkasan Aktivitas Anda"}</span>
          </h2>
          <span className="text-[11px] sm:text-xs text-muted-foreground hidden sm:inline">Pembaruan real-time</span>
        </div>

        <div
          className={`grid grid-cols-2 ${
            isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3"
          } gap-2.5 sm:gap-4`}
        >
          {/* Admin Mode: Events Metric | Core Team Mode: Events Metric (if permitted) */}
          {canManageEvents && (
            <>
              <Link to="/dashboard/events" className="group">
                <Card className="relative overflow-hidden border border-border/70 bg-card/60 backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-500/40">
                  <CardContent className="p-3.5 sm:p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                        Events
                      </span>
                      <div className="flex h-7 w-7 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-blue-500/10 text-blue-500 transition-transform group-hover:scale-110">
                        <Calendar className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-3">
                      <div className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                        {stats.totalEvents}
                      </div>
                      <div className="mt-1 sm:mt-2 flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                          {stats.publishedEvents} pub
                        </span>
                        <span>·</span>
                        <span>{stats.draftEvents} draft</span>
                      </div>
                      <div className="mt-2 pt-1.5 sm:pt-2 border-t border-border/40 text-[10px] sm:text-[11px] text-muted-foreground flex items-center justify-between">
                        <span className="truncate">{stats.upcomingCount} Mendatang</span>
                        <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground transition-transform group-hover:translate-x-1 shrink-0" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* RSVP Metric */}
              <Link to="/dashboard/events" className="group">
                <Card className="relative overflow-hidden border border-border/70 bg-card/60 backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-500/40">
                  <CardContent className="p-3.5 sm:p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                        Peserta (RSVP)
                      </span>
                      <div className="flex h-7 w-7 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-500 transition-transform group-hover:scale-110">
                        <Ticket className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-3">
                      <div className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                        {stats.totalRegistrations}
                      </div>
                      <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground truncate">
                        Pendaftar seluruh event
                      </div>
                      <div className="mt-2 pt-1.5 sm:pt-2 border-t border-border/40 text-[10px] sm:text-[11px] text-muted-foreground flex items-center justify-between">
                        <span className="truncate">Presensi & Tiket</span>
                        <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground transition-transform group-hover:translate-x-1 shrink-0" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}

          {/* Core Team Profile Card (Shown for Core Team) */}
          {!isAdmin && (
            <Link to="/dashboard/profile" className="group">
              <Card className="relative overflow-hidden border border-border/70 bg-card/60 backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-purple-500/40">
                <CardContent className="p-3.5 sm:p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                      Status Tim
                    </span>
                    <div className="flex h-7 w-7 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-purple-500/10 text-purple-500 transition-transform group-hover:scale-110">
                      <Users className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-3">
                    <div className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate">{currentTeamMember?.is_active !== false ? "Aktif" : "Nonaktif"}</span>
                    </div>
                    <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground truncate">
                      {currentTeamMember?.position || "Core Team"}
                    </div>
                    <div className="mt-2 pt-1.5 sm:pt-2 border-t border-border/40 text-[10px] sm:text-[11px] text-muted-foreground flex items-center justify-between">
                      <span className="truncate">Buka Profil</span>
                      <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground transition-transform group-hover:translate-x-1 shrink-0" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Media Metric (for Core Team if permitted, or Admin) */}
          {canManageMedia && (
            <Link to="/dashboard/media" className="group">
              <Card className="relative overflow-hidden border border-border/70 bg-card/60 backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-sky-500/40">
                <CardContent className="p-3.5 sm:p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                      Media & Artikel
                    </span>
                    <div className="flex h-7 w-7 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-sky-500/10 text-sky-500 transition-transform group-hover:scale-110">
                      <FileText className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-3">
                    <div className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                      {stats.totalMedia}
                    </div>
                    <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground truncate">
                      Kabar & blog komunitas
                    </div>
                    <div className="mt-2 pt-1.5 sm:pt-2 border-t border-border/40 text-[10px] sm:text-[11px] text-muted-foreground flex items-center justify-between">
                      <span className="truncate">Kelola artikel</span>
                      <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground transition-transform group-hover:translate-x-1 shrink-0" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Admin Exclusive: Communities Metric */}
          {isAdmin && (
            <Link to="/dashboard/communities" className="group">
              <Card className="relative overflow-hidden border border-border/70 bg-card/60 backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-amber-500/40">
                <CardContent className="p-3.5 sm:p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                      Komunitas
                    </span>
                    <div className="flex h-7 w-7 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-500 transition-transform group-hover:scale-110">
                      <MapPin className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-3">
                    <div className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                      {stats.totalCommunities}
                    </div>
                    <div className="mt-1 sm:mt-2 flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                        {stats.activeCommunities} aktif
                      </span>
                    </div>
                    <div className="mt-2 pt-1.5 sm:pt-2 border-t border-border/40 text-[10px] sm:text-[11px] text-muted-foreground flex items-center justify-between">
                      <span className="truncate">Mitra regional</span>
                      <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground transition-transform group-hover:translate-x-1 shrink-0" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Admin Exclusive: Core Team Metric */}
          {isAdmin && (
            <Link to="/dashboard/team" className="group">
              <Card className="relative overflow-hidden border border-border/70 bg-card/60 backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-purple-500/40">
                <CardContent className="p-3.5 sm:p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                      Core Team
                    </span>
                    <div className="flex h-7 w-7 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-purple-500/10 text-purple-500 transition-transform group-hover:scale-110">
                      <Users className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-3">
                    <div className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                      {stats.totalTeam}
                    </div>
                    <div className="mt-1 sm:mt-2 flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium">
                        {stats.activeTeam} aktif
                      </span>
                    </div>
                    <div className="mt-2 pt-1.5 sm:pt-2 border-t border-border/40 text-[10px] sm:text-[11px] text-muted-foreground flex items-center justify-between">
                      <span className="truncate">Kelola akses</span>
                      <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground transition-transform group-hover:translate-x-1 shrink-0" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </div>

      {/* 3. Next Upcoming Event Spotlight (Only if user has Event Permission) */}
      {canManageEvents && nextUpcomingEvent && (
        <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-r from-card via-card to-primary/5 shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Calendar className="h-36 w-36 text-primary" />
          </div>

          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  Event Mendatang Terdekat
                </span>
                <Badge variant="outline" className="capitalize text-xs font-semibold">
                  {nextUpcomingEvent.format}
                </Badge>
                {nextUpcomingEvent.is_online ? (
                  <Badge variant="secondary" className="text-xs">
                    Online
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Offline
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {nextUpcomingEvent.event_date}{" "}
                {nextUpcomingEvent.event_time && `· ${nextUpcomingEvent.event_time}`}
              </span>
            </div>
            <CardTitle className="text-xl md:text-2xl font-bold tracking-tight mt-2 text-foreground">
              {nextUpcomingEvent.title}
            </CardTitle>
            <CardDescription className="line-clamp-2 max-w-3xl">
              {nextUpcomingEvent.description_small || nextUpcomingEvent.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-border/50">
              {/* Attendee capacity meter */}
              <div className="space-y-1.5 min-w-[240px]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Pendaftar Terisi:</span>
                  <span className="font-bold text-foreground">
                    {nextUpcomingEvent.registrations_count}
                    {nextUpcomingEvent.max_attendees
                      ? ` / ${nextUpcomingEvent.max_attendees}`
                      : " (Tanpa Batas)"}
                  </span>
                </div>
                {nextUpcomingEvent.max_attendees && (
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (nextUpcomingEvent.registrations_count /
                            nextUpcomingEvent.max_attendees) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Action shortcuts */}
              <div className="flex flex-wrap items-center gap-2.5">
                <Button asChild size="sm" className="gap-1.5">
                  <Link to={`/dashboard/events/${nextUpcomingEvent.id}/checkin`}>
                    <QrCode className="h-4 w-4" />
                    <span>Check-in QR</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <Link to={`/dashboard/events/${nextUpcomingEvent.id}`}>
                    <Users className="h-4 w-4" />
                    <span>Lihat Pendaftar ({nextUpcomingEvent.registrations_count})</span>
                  </Link>
                </Button>
                {(isAdmin || (nextUpcomingEvent.author_id && nextUpcomingEvent.author_id === currentUserId)) && (
                  <Button asChild variant="ghost" size="sm" className="gap-1.5">
                    <Link to={`/dashboard/events/${nextUpcomingEvent.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                      <span>Edit</span>
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. Quick Actions Hub (Strictly Filtered by Permissions) */}
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground mb-4">
          Aksi Cepat & Navigasi
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {canManageEvents && (
            <Link
              to="/dashboard/events/create"
              className="group flex flex-col p-3 sm:p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs hover:border-primary/50 hover:bg-card hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <CalendarPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate">
                    Tambah Event
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">
                    Workshop & meetup baru
                  </p>
                </div>
              </div>
            </Link>
          )}

          {canManageMedia && (
            <Link
              to="/dashboard/media/create"
              className="group flex flex-col p-3 sm:p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs hover:border-primary/50 hover:bg-card hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-sky-500/10 text-sky-500 group-hover:scale-110 transition-transform">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate">
                    Tulis Artikel
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">
                    Publikasi kabar atau blog
                  </p>
                </div>
              </div>
            </Link>
          )}

          {/* Admin-only quick actions */}
          {isAdmin && (
            <>
              <Link
                to="/dashboard/communities/create"
                className="group flex flex-col p-3 sm:p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs hover:border-primary/50 hover:bg-card hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                    <MapPinPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      Komunitas
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">
                      Mitra regional Madura
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/dashboard/team/create"
                className="group flex flex-col p-3 sm:p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs hover:border-primary/50 hover:bg-card hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
                    <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      Tambah Tim
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">
                      Kelola core team & hak akses
                    </p>
                  </div>
                </div>
              </Link>
            </>
          )}

          {/* Profile & Website Quick Actions for Core Team */}
          {!isAdmin && (
            <>
              <Link
                to="/dashboard/profile"
                className="group flex flex-col p-3 sm:p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs hover:border-primary/50 hover:bg-card hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
                    <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      Profil & Akun
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">
                      Perbarui biodata Anda
                    </p>
                  </div>
                </div>
              </Link>

              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col p-3 sm:p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs hover:border-primary/50 hover:bg-card hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      Lihat Website
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">madura.dev</p>
                  </div>
                </div>
              </a>
            </>
          )}
        </div>
      </div>

      {/* 5. Main Split Section: Content & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Events (if permitted) OR Profile Details for Core Team without event perms */}
        <div className="lg:col-span-7 space-y-4">
          {canManageEvents ? (
            <Card className="border border-border/70 bg-card/60 backdrop-blur-xs shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Event Terbaru
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Daftar event yang baru dibuat atau diperbarui
                  </CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
                  <Link to="/dashboard/events">
                    <span>Lihat Semua</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardHeader>

              <CardContent className="pt-0">
                {recentEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center rounded-lg border border-dashed border-border/80">
                    <Calendar className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">Belum ada event tercatat.</p>
                    <Button asChild size="sm" className="mt-3">
                      <Link to="/dashboard/events/create">Buat Event Pertama</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {recentEvents.map((event: any) => (
                      <div
                        key={event.id}
                        className="py-3.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {event.title}
                            </p>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                event.is_published
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {event.is_published ? "Published" : "Draft"}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.event_date}
                            </span>
                            <span>·</span>
                            <span className="capitalize">{event.format}</span>
                            {event.rsvp_enabled && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-1 font-medium text-foreground">
                                  <Ticket className="h-3 w-3 text-primary" />
                                  {event.registrations_count} pendaftar
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {event.rsvp_enabled && (
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              title="Lihat Peserta RSVP"
                            >
                              <Link to={`/dashboard/events/${event.id}`}>
                                <Users className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          {(isAdmin || (event.author_id && event.author_id === currentUserId)) && (
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title="Edit Event"
                            >
                              <Link to={`/dashboard/events/${event.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Information Card for Core Team without event perms */
            <Card className="border border-border/70 bg-card/60 backdrop-blur-xs shadow-xs">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base font-bold text-foreground">
                    Informasi Akses & Profil Core Team
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Status kepengurusan dan informasi hak akses Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-sm space-y-2">
                  <p className="text-foreground font-medium">
                    Saat ini Anda terdaftar sebagai{" "}
                    <span className="text-primary font-bold">
                      {currentTeamMember?.position || "Core Team"}
                    </span>
                    .
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Pengelolaan modul khusus (seperti Publikasi Event atau Media) diatur langsung
                    oleh Super Admin. Jika Anda memerlukan izin tambahan untuk mengelola konten,
                    silakan koordinasikan dengan Administrator komunitas MaduraDev.
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Lengkapi Profil Anda</p>
                    <p className="text-[11px] text-muted-foreground">
                      Foto profil, biodata, dan akun media sosial ditampilkan di halaman publik
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link to="/dashboard/profile">Buka Profil</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Media (if permitted) & System Status */}
        <div className="lg:col-span-5 space-y-6">
          {canManageMedia ? (
            <Card className="border border-border/70 bg-card/60 backdrop-blur-xs shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Media & Publikasi
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Artikel kabar dan blog komunitas
                  </CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
                  <Link to="/dashboard/media">
                    <span>Semua</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardHeader>

              <CardContent className="pt-0">
                {recentMedia.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    Belum ada artikel yang dipublikasikan.
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {recentMedia.map((post: any) => (
                      <div
                        key={post.id}
                        className="py-3 flex items-center justify-between gap-2 first:pt-0 last:pb-0 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {post.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <Badge
                              variant="outline"
                              className="capitalize text-[10px] py-0 px-1.5 h-4"
                            >
                              {post.type}
                            </Badge>
                            <span>
                              {post.published_at?.split("T")[0] ||
                                post.created_at?.split("T")[0]}
                            </span>
                          </div>
                        </div>

                        {(isAdmin || (post.author_id && post.author_id === currentUserId)) && (
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
                            title="Edit Artikel"
                          >
                            <Link to={`/dashboard/media/${post.id}/edit`}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {/* System & Connection Status */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Kesehatan Sistem
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <StatusCards />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
