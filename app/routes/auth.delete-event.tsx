import { redirect } from "react-router";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const id = formData.get("id") as string;

  if (!id) {
    return { success: false, error: "ID is required" };
  }

  const supabase = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized: Please log in." };
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // 1. Get the event data to verify ownership and clean up storage
  const { data: eventData } = await adminClient
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!eventData) {
    return { success: false, error: "Event tidak ditemukan." };
  }

  const isAdmin = profile?.role === "admin";
  const isOwner = eventData.author_id && eventData.author_id === user.id;

  if (!isAdmin && !isOwner) {
    return { success: false, error: "Forbidden: Anda hanya dapat menghapus event karya Anda sendiri." };
  }

  if (eventData?.image_url) {
    try {
      const url = new URL(eventData.image_url);
      const pathParts = url.pathname.split("/storage/v1/object/public/");
      if (pathParts.length > 1) {
        const [bucketName, ...filePath] = pathParts[1].split("/");
        await adminClient.storage.from(bucketName).remove([filePath.join("/")]);
      }
    } catch (e) {
      console.error("Gagal menghapus gambar dari storage:", e);
    }
  }

  // 2. Delete the record from events table
  const { error } = await adminClient.from("events").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function loader() {
  throw redirect("/dashboard/events");
}

