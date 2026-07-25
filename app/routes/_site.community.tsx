import type { Route } from "./+types/_site.community";
import { useLoaderData } from "react-router";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/server";
import { getAllCommunities, groupCommunitiesByRegion } from "@/lib/community";
import type { Community } from "@/lib/supabase/types";

export const meta = () => [
  { title: "Komunitas - MaduraDev" },
  { name: "description", content: "Daftar semua komunitas developer di Pulau Madura: Bangkalan Dev, Sampang Dev, Pamekasan Dev, Sumenep Dev, dan lainnya." },
  { name: "keywords", content: "komunitas developer madura, bangkalan dev, sampang dev, pamekasan dev, sumenep dev, komunitas programmer madura, peta komunitas madura" },
  { property: "og:title", content: "Komunitas Developer Madura - MaduraDev" },
  { property: "og:description", content: "Jelajahi semua komunitas developer yang tersebar di 4 kabupaten Pulau Madura." },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://madura.dev/community" },
  { property: "og:image", content: "https://madura.dev/image.jpg" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Komunitas Developer Madura - MaduraDev" },
  { name: "twitter:description", content: "Jelajahi semua komunitas developer yang tersebar di 4 kabupaten Pulau Madura." },
  { name: "twitter:image", content: "https://madura.dev/image.jpg" },
  { tagName: "link", rel: "canonical", href: "https://madura.dev/community" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const supabase = createClient(request);
  const communities = await getAllCommunities(supabase);
  return { communities };
}

function InstagramIcon({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function CommunityPage() {
  const { communities } = useLoaderData<typeof loader>();
  const grouped = groupCommunitiesByRegion(communities);
  const regionEntries = Object.entries(grouped);

  const communityItemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Komunitas Developer Madura",
    description: "Daftar komunitas developer yang tersebar di 4 kabupaten Pulau Madura.",
    url: "https://madura.dev/community",
    itemListElement: communities.map((comm, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Organization",
        name: comm.name,
        description: `Komunitas developer ${comm.name} di ${comm.region}, Madura.`,
        url: comm.instagram || "https://madura.dev/community",
        address: {
          "@type": "PostalAddress",
          addressLocality: comm.region,
          addressRegion: "Jawa Timur",
          addressCountry: "ID",
        },
      },
    })),
  };

  return (
    <div className="pt-20">
      {/* Schema.org Community List JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(communityItemListJsonLd) }}
      />
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full mb-6">
              <span className="font-label text-[10px] font-bold uppercase tracking-widest">
                Community
              </span>
              <span className="w-1 h-1 rounded-full bg-primary" />
              <span className="font-label text-[10px] font-bold uppercase tracking-widest">
                Madura Island
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-foreground leading-[1] tracking-tighter mb-4 font-display">
              Semua <span className="text-primary italic">Komunitas</span>
              <br />
              Developer Madura
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              {communities.length} komunitas developer aktif tersebar di 4
              kabupaten Pulau Madura.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Communities by Region */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          {regionEntries.map(([region, regionCommunities], regionIdx) => (
            <motion.div
              key={region}
              className="mb-12 last:mb-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: regionIdx * 0.15 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 rounded-full bg-primary" />
                <h2 className="text-2xl md:text-3xl font-black text-foreground font-display tracking-tight">
                  {region}
                </h2>
                <span className="ml-2 px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                  {regionCommunities.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regionCommunities.map((community: Community, i: number) => (
                  <motion.a
                    href={
                      community.instagram
                        ? `https://instagram.com/${community.instagram}`
                        : "#"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    key={community.id}
                    className="flex items-center gap-4 p-5 rounded-2xl bg-muted/20 border-2 border-border/50 hover:border-primary/30 hover:bg-muted/40 transition-all group active:scale-[0.98]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: regionIdx * 0.15 + i * 0.05 }}
                  >
                    <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-background border-2 border-border/50 overflow-hidden p-1 shrink-0 group-hover:border-primary/30 transition-colors">
                      <div className="relative w-full h-full rounded-full overflow-hidden">
                        {community.logo_url ? (
                          <img
                            src={community.logo_url}
                            alt={community.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                            {community.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-foreground font-black text-base group-hover:text-primary transition-colors font-display tracking-wide truncate">
                        {community.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-muted-foreground text-xs font-bold">
                          {community.region}
                        </span>
                        {community.instagram && (
                          <span className="flex items-center gap-1 text-muted-foreground text-xs group-hover:text-primary transition-colors">
                            <InstagramIcon size={12} />
                            {community.instagram}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          ))}

          {communities.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                Belum ada komunitas terdaftar.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
