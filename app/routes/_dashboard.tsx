import { redirect } from "react-router";
import type { Route } from "./+types/_dashboard";
import { Outlet } from "react-router";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const adminOnlyPaths = [
  "/dashboard/events",
  "/dashboard/team",
  "/dashboard/settings",
  "/dashboard/custom-domains",
  "/dashboard/media",
  "/dashboard/twibbon-editor",
];

export const meta: Route.MetaFunction = () => [
  { title: "Dashboard - MaduraDev" },
];

export function shouldRevalidate() {
  return true;
}

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
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    throw redirect("/login");
  }

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/$/, "");

  if (profile.role === "core_team") {
    const isEventPath = pathname.startsWith("/dashboard/events");
    const isMediaPath = pathname.startsWith("/dashboard/media");

    if (isEventPath && !profile.can_manage_events) {
      throw redirect("/dashboard");
    }
    if (isMediaPath && !profile.can_manage_media) {
      throw redirect("/dashboard");
    }

    const isStrictAdmin = [
      "/dashboard/team",
      "/dashboard/settings",
      "/dashboard/custom-domains",
      "/dashboard/communities",
      "/dashboard/twibbon-editor",
    ].some((path) => pathname.startsWith(path));

    if (isStrictAdmin) {
      throw redirect("/dashboard");
    }
  }

  const { data: teamMember } = await adminClient
    .from("core_team")
    .select("name, avatar_url, position, is_active, description")
    .eq("user_id", user.id)
    .maybeSingle();

  return { user, profile, teamMember };
}

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="relative flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
        {/* Subtle Ambient Background Glow */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full bg-primary/5 blur-[130px] dark:bg-primary/10" />
          <div className="absolute top-[40%] -right-24 w-[450px] h-[450px] rounded-full bg-accent/20 blur-[140px] dark:bg-accent/10" />
        </div>

        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "hsl(var(--card))",
            color: "hsl(var(--card-foreground))",
            border: "1px solid hsl(var(--border))",
          },
        }}
      />
    </SidebarProvider>
  );
}
