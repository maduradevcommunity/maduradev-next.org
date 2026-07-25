import type { Route } from "./+types/_site.teams";
import TeamClient from "@/components/teams/TeamClient";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlaceholderAvatarUrl } from "@/lib/placeholder";

export const meta = () => [
  { title: "Core Team - MaduraDev" },
  {
    name: "description",
    content:
      "Tim inti MaduraDev: para developer dan kontributor aktif yang membangun komunitas developer di Pulau Madura.",
  },
  {
    name: "keywords",
    content:
      "core team maduradev, tim developer madura, kontributor maduradev, anggota komunitas madura",
  },
  { property: "og:title", content: "Core Team - MaduraDev" },
  {
    property: "og:description",
    content: "Kenali tim inti di balik komunitas developer MaduraDev.",
  },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://madura.dev/teams" },
  { property: "og:image", content: "https://madura.dev/image.jpg" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Core Team - MaduraDev" },
  { name: "twitter:description", content: "Kenali tim inti di balik komunitas developer MaduraDev." },
  { name: "twitter:image", content: "https://madura.dev/image.jpg" },
  { tagName: "link", rel: "canonical", href: "https://madura.dev/teams" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const adminClient = createAdminClient();

  const { data: members, error } = await adminClient
    .from("core_team")
    .select("*")
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  if (error || !members) {
    console.error("Error fetching team:", error);
    return { members: [] };
  }

  // Map members to include placeholder avatar if no avatar_url
  const mappedMembers = members.map((m: any) => ({
    id: m.id,
    name: m.name,
    position: m.position,
    description: m.description,
    avatar_url: m.avatar_url || getPlaceholderAvatarUrl(m.name),
    linkedin: m.linkedin || "",
    github: m.github || "",
    instagram: m.instagram || "",
    portfolio: m.portfolio || "",
  }));

  return { members: mappedMembers };
}

export default function TeamsPage({ loaderData }: Route.ComponentProps) {
  const { members } = loaderData;

  const teamItemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Core Team MaduraDev",
    description: "Tim inti di balik komunitas developer MaduraDev.",
    url: "https://madura.dev/teams",
    itemListElement: members.map((m, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Person",
        name: m.name,
        jobTitle: m.position,
        description: m.description,
        image: m.avatar_url,
        worksFor: {
          "@type": "Organization",
          name: "MaduraDev",
          url: "https://madura.dev",
        },
      },
    })),
  };

  return (
    <div className="pt-5">
      {/* Schema.org Team List JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(teamItemListJsonLd) }}
      />
      <TeamClient members={members} />
    </div>
  );
}
