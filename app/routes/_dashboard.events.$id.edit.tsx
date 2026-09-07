import type { Route } from "./+types/_dashboard.events.$id.edit";
import { useLoaderData, redirect } from "react-router";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { EditEventForm } from "@/components/dashboard/edit-event-form";

export const meta: Route.MetaFunction = () => [
  { title: "Edit Event - Dashboard MaduraDev" },
];

export async function loader({ request, params }: Route.LoaderArgs) {
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
    .select("role")
    .eq("id", user.id)
    .single();

  const { data, error } = await adminClient
    .from("events")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    throw new Response("Event not found", { status: 404 });
  }

  const role = profile?.role ?? "core_team";
  const isOwner = data.author_id && data.author_id === user.id;

  if (role !== "admin" && !isOwner) {
    throw redirect("/dashboard/events");
  }

  return { event: data };
}

export default function EditEventPage() {
  const { event } = useLoaderData<typeof loader>();
  return <EditEventForm event={event} />;
}
