import type { Route } from "./+types/_site.teams.$slug";
import TeamDetailClient from "@/components/teams/TeamDetailClient";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlaceholderAvatarUrl } from "@/lib/placeholder";

export const meta = ({ data, params }: Route.MetaArgs) => {
  const member = data?.member;
  const canonicalUrl = `https://madura.dev/teams/${params.slug}`;
  const avatarUrl = member?.avatar_url
    ? (member.avatar_url.startsWith("http") ? member.avatar_url : `https://madura.dev${member.avatar_url.startsWith("/") ? "" : "/"}${member.avatar_url}`)
    : "https://madura.dev/image.jpg";
  const desc = member
    ? `${member.name} - ${member.position} di MaduraDev. ${member.description || ""}`
    : "Profil anggota tim inti MaduraDev.";
  const title = member ? `${member.name} - Core Team MaduraDev` : "Team - MaduraDev";

  return [
    { title },
    { name: "description", content: desc },
    { property: "og:title", content: title },
    { property: "og:description", content: desc },
    { property: "og:type", content: "profile" },
    { property: "og:url", content: canonicalUrl },
    { property: "og:image", content: avatarUrl },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: desc },
    { name: "twitter:image", content: avatarUrl },
    { tagName: "link", rel: "canonical", href: canonicalUrl },
  ];
};

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function loader({ params }: Route.LoaderArgs) {
  const adminClient = createAdminClient();
  const slug = params.slug;

  const { data: members, error } = await adminClient
    .from("core_team")
    .select("*")
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  if (error || !members) {
    throw new Response("Not Found", { status: 404 });
  }

  const member = members.find((m: any) => nameToSlug(m.name) === slug);

  if (!member) {
    throw new Response("Not Found", { status: 404 });
  }

  // Find prev/next members
  const currentIndex = members.findIndex((m: any) => m.id === member.id);
  const prevMember = currentIndex > 0
    ? { name: members[currentIndex - 1].name, slug: nameToSlug(members[currentIndex - 1].name) }
    : null;
  const nextMember = currentIndex < members.length - 1
    ? { name: members[currentIndex + 1].name, slug: nameToSlug(members[currentIndex + 1].name) }
    : null;

  return {
    member: {
      id: member.id,
      name: member.name,
      position: member.position,
      description: member.description,
      avatar_url: member.avatar_url || getPlaceholderAvatarUrl(member.name),
      linkedin: member.linkedin || "",
      github: member.github || "",
      instagram: member.instagram || "",
      portfolio: member.portfolio || "",
    },
    prevMember,
    nextMember,
  };
}

export default function TeamDetailPage({ loaderData, params }: Route.ComponentProps) {
  const { member, prevMember, nextMember } = loaderData;

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.position,
    description: member.description,
    image: member.avatar_url,
    url: `https://madura.dev/teams/${params.slug}`,
    sameAs: [
      member.github,
      member.linkedin,
      member.instagram,
      member.portfolio,
    ].filter(Boolean),
    worksFor: {
      "@type": "Organization",
      name: "MaduraDev",
      url: "https://madura.dev",
    },
  };

  return (
    <div className="pt-5">
      {/* Schema.org Person JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <TeamDetailClient member={member} prevMember={prevMember} nextMember={nextMember} />
    </div>
  );
}
