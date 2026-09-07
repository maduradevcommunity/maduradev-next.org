import type { Route } from "./+types/sitemap[.xml]";
import { createAdminClient } from "@/lib/supabase/admin";

const SITE_URL = "https://madura.dev";

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/events", priority: "0.9", changefreq: "weekly" },
  { path: "/teams", priority: "0.8", changefreq: "monthly" },
  { path: "/media", priority: "0.8", changefreq: "monthly" },
  { path: "/community", priority: "0.8", changefreq: "monthly" },
  { path: "/twibbon", priority: "0.6", changefreq: "monthly" },
  { path: "/privacy-policy", priority: "0.5", changefreq: "yearly" },
  { path: "/terms-of-service", priority: "0.5", changefreq: "yearly" },
];

export async function loader({ request }: Route.LoaderArgs) {
  // Dynamic event pages
  let eventEntriesData: { slug: string; updated_at: string }[] = [];
  try {
    const adminClient = createAdminClient();
    const { data: events } = await adminClient
      .from("events")
      .select("slug, updated_at")
      .eq("is_published", true);
    eventEntriesData = (events || []).map((e: any) => ({
      slug: e.slug,
      updated_at: e.updated_at || new Date().toISOString(),
    }));
  } catch (e) {
    console.error("Sitemap: failed to fetch events", e);
  }

  // Dynamic media pages
  let mediaEntriesData: { slug: string; updated_at: string }[] = [];
  try {
    const adminClient = createAdminClient();
    const { data: posts } = await adminClient
      .from("media_posts")
      .select("slug, updated_at")
      .eq("status", "published");
    mediaEntriesData = (posts || []).map((p: any) => ({
      slug: p.slug,
      updated_at: p.updated_at || new Date().toISOString(),
    }));
  } catch (e) {
    console.error("Sitemap: failed to fetch media posts", e);
  }

  const now = new Date().toISOString();

  const staticEntries = STATIC_PAGES.map(
    (page) => `
    <url>
      <loc>${SITE_URL}${page.path}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>`,
  ).join("");

  const eventEntries = eventEntriesData
    .map(
      (e) => `
    <url>
      <loc>${SITE_URL}/events/${e.slug}</loc>
      <lastmod>${new Date(e.updated_at).toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`,
    )
    .join("");

  const mediaEntries = mediaEntriesData
    .map(
      (m) => `
    <url>
      <loc>${SITE_URL}/media/${m.slug}</loc>
      <lastmod>${new Date(m.updated_at).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`,
    )
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticEntries}
  ${eventEntries}
  ${mediaEntries}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
