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

  // 1. Get the post's author_id and image_url to verify ownership and clean up storage
  const { data: postData } = await adminClient
    .from("media_posts")
    .select("image_url, author_id")
    .eq("id", id)
    .single();

  if (!postData) {
    return { success: false, error: "Artikel tidak ditemukan." };
  }

  const isAdmin = profile?.role === "admin";
  const isOwner = postData.author_id && postData.author_id === user.id;

  if (!isAdmin && !isOwner) {
    return { success: false, error: "Forbidden: Anda hanya dapat menghapus artikel karya Anda sendiri." };
  }

  if (postData?.image_url) {
    try {
      const url = new URL(postData.image_url);
      const pathParts = url.pathname.split("/storage/v1/object/public/");
      if (pathParts.length > 1) {
        const [bucketName, ...filePath] = pathParts[1].split("/");
        await adminClient.storage.from(bucketName).remove([filePath.join("/")]);
      }
    } catch (e) {
      console.error("Gagal menghapus gambar dari storage:", e);
    }
  }

  // 2. Delete the record from media_posts table
  const { error } = await adminClient.from("media_posts").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function loader() {
  throw redirect("/dashboard/media");
}
