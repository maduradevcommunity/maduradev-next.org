import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useRouteLoaderData } from "react-router";
import {
  Calendar,
  Settings,
  Users,
  LogOut,
  UserCircle,
  ChevronLeft,
  MapPin,
  Globe,
  Newspaper,
  LayoutDashboard,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarContext,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import ImageLogo from "../shared/logo-image";
import type { UserRole } from "@/lib/supabase/types";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export function DashboardSidebar() {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const { open, setOpen, isMobile } = useContext(SidebarContext);

  // Get user, profile & team member data from parent layout loader
  const loaderData = useRouteLoaderData("routes/_dashboard") as
    | {
        user?: { email?: string; id?: string };
        profile?: { role: UserRole; can_manage_events?: boolean; can_manage_media?: boolean };
        teamMember?: { name: string; avatar_url: string | null; position: string } | null;
      }
    | undefined;

  const role = loaderData?.profile?.role ?? "core_team";
  const userName =
    loaderData?.teamMember?.name ||
    loaderData?.user?.email?.split("@")[0] ||
    (role === "admin" ? "Administrator" : "Team Member");
  const userRoleLabel =
    role === "admin"
      ? "Super Admin"
      : loaderData?.teamMember?.position || "Core Team";
  const avatarUrl = loaderData?.teamMember?.avatar_url;

  // Close sidebar on mobile ONLY after actual route navigation
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      if (isMobile) {
        setOpen(false);
      }
    }
  }, [pathname, isMobile, setOpen]);

  const navGroups: NavGroup[] = useMemo(() => {
    if (role === "admin") {
      return [
        {
          label: "Menu Utama",
          items: [
            {
              title: "Dashboard",
              url: "/dashboard",
              icon: LayoutDashboard,
              exact: true,
            },
          ],
        },
        {
          label: "Manajemen Konten",
          items: [
            { title: "Events", url: "/dashboard/events", icon: Calendar },
            { title: "Media & Artikel", url: "/dashboard/media", icon: Newspaper },
            { title: "Komunitas", url: "/dashboard/communities", icon: MapPin },
            { title: "Editor Twibbon", url: "/dashboard/twibbon-editor", icon: Sparkles },
          ],
        },
        {
          label: "Sistem & Tim",
          items: [
            { title: "Core Team", url: "/dashboard/team", icon: Users },
            { title: "Custom Domains", url: "/dashboard/custom-domains", icon: Globe },
            { title: "Pengaturan", url: "/dashboard/settings", icon: Settings },
          ],
        },
      ];
    }

    // Core team role
    const primaryItems: NavItem[] = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      { title: "Profil Saya", url: "/dashboard/profile", icon: UserCircle },
    ];

    const contentItems: NavItem[] = [];
    if (loaderData?.profile?.can_manage_events) {
      contentItems.push({ title: "Events", url: "/dashboard/events", icon: Calendar });
    }
    if (loaderData?.profile?.can_manage_media) {
      contentItems.push({ title: "Media & Artikel", url: "/dashboard/media", icon: Newspaper });
    }

    const groups: NavGroup[] = [
      {
        label: "Menu Utama",
        items: primaryItems,
      },
    ];

    if (contentItems.length > 0) {
      groups.push({
        label: "Manajemen Konten",
        items: contentItems,
      });
    }

    return groups;
  }, [role, loaderData]);

  // Logout confirmation dialog states
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      const client = createClient();
      if (client) await client.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  const isItemActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.url || pathname === `${item.url}/`;
    }
    return pathname.startsWith(item.url);
  };

  return (
    <Sidebar className="border-r border-border/60 bg-sidebar/95 backdrop-blur-md">
      {/* Brand Header - exactly h-14 to match the top navigation bar height */}
      <SidebarHeader className="h-14 border-b border-border/50 px-3 flex items-center justify-between">
        {open ? (
          <div className="flex items-center justify-between w-full">
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 min-w-0 transition-opacity hover:opacity-85"
            >
              {/* Perfectly sized logo container */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card border border-border/70 p-1 shadow-2xs">
                <ImageLogo className="h-5 w-5 object-contain" />
              </div>

              <div className="flex flex-col min-w-0 leading-none gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-foreground tracking-tight">
                    MaduraDev
                  </span>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground truncate">
                  {role === "admin" ? "Admin Console" : "Core Team Portal"}
                </span>
              </div>
            </Link>

            {isMobile && (
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
                aria-label="Tutup sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <Link
            to="/dashboard"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-card border border-border/70 p-1 mx-auto hover:border-primary/40 transition-colors shadow-2xs"
            title="MaduraDev Dashboard"
          >
            <ImageLogo className="h-5 w-5 object-contain" />
          </Link>
        )}
      </SidebarHeader>

      {/* Navigation Groups */}
      <SidebarContent className="space-y-4 py-3">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] font-bold tracking-wider text-muted-foreground/60 uppercase px-3 mb-1">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isItemActive(item);

                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className={`relative rounded-lg transition-all duration-150 ${
                          active
                            ? "bg-primary text-white font-semibold shadow-xs shadow-primary/25 hover:bg-primary/95"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/70 font-medium"
                        }`}
                      >
                        <Link
                          to={item.url}
                          onClick={() => isMobile && setOpen(false)}
                          className={`flex items-center gap-3 w-full ${
                            active
                              ? "text-white font-semibold"
                              : "text-muted-foreground group-hover:text-foreground"
                          }`}
                        >
                          <item.icon
                            className={`h-4 w-4 shrink-0 transition-transform duration-150 ${
                              active
                                ? "text-white"
                                : "text-muted-foreground group-hover:text-foreground"
                            }`}
                          />
                          {open && (
                            <span className={`truncate ${active ? "text-white font-semibold" : ""}`}>
                              {item.title}
                            </span>
                          )}
                          {open && active && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/90 shrink-0" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Quick link to live public site */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Lihat Website"
                  className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
                >
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                    {open && (
                      <div className="flex items-center justify-between w-full min-w-0">
                        <span className="truncate text-xs">Website Publik</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                          madura.dev
                        </span>
                      </div>
                    )}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Card & Logout Footer */}
      <SidebarFooter className="border-t border-border/50 p-2.5">
        {open ? (
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-card/60 border border-border/60 shadow-2xs">
            <Avatar className="h-8 w-8 ring-1 ring-border/80 shrink-0">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">
                {userName.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1 leading-tight">
              <span className="text-xs font-semibold text-foreground truncate">
                {userName}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {userRoleLabel}
              </span>
            </div>
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer shrink-0"
              title="Keluar dari akun"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors mx-auto cursor-pointer"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </SidebarFooter>
      <SidebarRail />

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <LogOut className="h-5 w-5" />
              </div>
              <div className="text-left">
                <AlertDialogTitle className="text-base font-bold text-foreground">
                  Konfirmasi Keluar Akun
                </AlertDialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {userName} &middot; {userRoleLabel}
                </p>
              </div>
            </div>
            <AlertDialogDescription className="text-sm text-muted-foreground text-left">
              Apakah Anda yakin ingin keluar dari sesi Dashboard MaduraDev? Anda harus masuk kembali dengan kredensial akun untuk mengakses sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
            <AlertDialogCancel
              onClick={() => setShowLogoutDialog(false)}
              disabled={isLoggingOut}
              className="cursor-pointer"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              disabled={isLoggingOut}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2 cursor-pointer font-semibold shadow-xs"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mengeluarkan...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  <span>Ya, Keluar</span>
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
