import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link, useLocation, useRouteLoaderData } from "react-router";
import { SimpleThemeToggle } from "@/components/simple-theme-toggle";
import { ExternalLink } from "lucide-react";
import type { UserRole } from "@/lib/supabase/types";

const pathNameMap: Record<string, string> = {
  dashboard: "Dashboard",
  events: "Events",
  team: "Core Team",
  communities: "Komunitas",
  media: "Media & Artikel",
  "custom-domains": "Custom Domains",
  settings: "Pengaturan",
  profile: "Profil Saya",
  create: "Tambah Baru",
  edit: "Edit",
  checkin: "Check-in QR",
};

export function DashboardHeader() {
  const pathname = useLocation().pathname;
  const segments = pathname.split("/").filter(Boolean);

  const loaderData = useRouteLoaderData("routes/_dashboard") as
    | {
        profile?: { role: UserRole };
      }
    | undefined;

  const role = loaderData?.profile?.role ?? "core_team";

  // Check if we are on root /dashboard
  const isRootDashboard = segments.length <= 1;

  // Compute hierarchical breadcrumbs
  const subSegments = segments.slice(1);
  const currentSegment = subSegments[subSegments.length - 1];
  const currentTitle = pathNameMap[currentSegment] || currentSegment || "Detail";

  const parentSegment = subSegments.length > 1 ? subSegments[0] : null;
  const parentTitle = parentSegment ? pathNameMap[parentSegment] || parentSegment : null;
  const parentUrl = parentSegment ? `/dashboard/${parentSegment}` : null;

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 md:px-6 transition-all">
      {/* Left side: Clean Trigger & Minimalist Page Indicator */}
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger />

        <div className="h-4 w-px bg-border/60 hidden sm:block shrink-0" />

        {/* Clean Page Title / Path Indicator */}
        <div className="flex items-center min-w-0">
          {isRootDashboard ? (
            <span className="font-bold text-sm text-foreground tracking-tight">
              Dashboard
            </span>
          ) : (
            <nav className="flex items-center gap-1.5 text-xs sm:text-sm min-w-0">
              <Link
                to="/dashboard"
                className="text-muted-foreground/80 hover:text-foreground transition-colors font-medium shrink-0"
              >
                Dashboard
              </Link>
              <span className="text-muted-foreground/30 font-normal shrink-0">/</span>

              {parentSegment && parentTitle && parentUrl && (
                <>
                  <Link
                    to={parentUrl}
                    className="text-muted-foreground/80 hover:text-foreground transition-colors font-medium truncate"
                  >
                    {parentTitle}
                  </Link>
                  <span className="text-muted-foreground/30 font-normal shrink-0">/</span>
                </>
              )}

              <span className="font-semibold text-foreground truncate">
                {currentTitle}
              </span>
            </nav>
          )}
        </div>
      </div>

      {/* Right side: Role, Website shortcut, Theme toggle */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Role badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted/60 border border-border/60">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground capitalize">
            {role === "admin" ? "Super Admin" : "Core Team"}
          </span>
        </div>

        {/* Website Shortcut Button */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground bg-card hover:bg-muted border border-border/70 shadow-2xs transition-colors"
          title="Buka Website MaduraDev di tab baru"
        >
          <span>Website</span>
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </a>

        {/* Theme Toggle */}
        <SimpleThemeToggle />
      </div>
    </header>
  );
}
