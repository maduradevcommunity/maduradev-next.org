import type { Route } from "./+types/_site._index";
import { useLoaderData } from "react-router";
import { createClient } from "@/lib/supabase/server";
import { getAllCommunities } from "@/lib/community";
import Hero from "@/components/hero";
import Features from "@/components/features";
import Community from "@/components/community";
import CallToAction from "@/components/call-to-action";
import MapCommunityMadura from "@/components/map-community-madura";

export const meta: Route.MetaFunction = () => [
  { title: "MaduraDev - Komunitas Developer Madura" },
  {
    name: "description",
    content:
      "Gabung dengan komunitas developer terbesar di Pulau Madura. Events, workshop, bootcamp, dan networking untuk programmer dari Bangkalan, Sampang, Pamekasan, dan Sumenep.",
  },
  { name: "keywords", content: "komunitas developer madura, bangkalan dev, sampang dev, pamekasan dev, sumenep dev, programmer madura" },
  { property: "og:title", content: "MaduraDev - Komunitas Developer Madura" },
  {
    property: "og:description",
    content:
      "Komunitas programming dan developer di Pulau Madura. Events, workshop, dan networking.",
  },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://madura.dev" },
  { property: "og:image", content: "https://madura.dev/image.jpg" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "MaduraDev - Komunitas Developer Madura" },
  { name: "twitter:description", content: "Komunitas programming dan developer di Pulau Madura." },
  { name: "twitter:image", content: "https://madura.dev/image.jpg" },
  { tagName: "link", rel: "canonical", href: "https://madura.dev" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const supabase = createClient(request);
  const communities = await getAllCommunities(supabase);
  return { communities };
}

export default function Home() {
  const { communities } = useLoaderData<typeof loader>();

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MaduraDev",
    url: "https://madura.dev",
    logo: "https://madura.dev/image.jpg",
    sameAs: [
      "https://github.com/maduradevcommunity",
      "https://instagram.com/madura.dev",
    ],
    description: "Komunitas pengembang teknologi dan perangkat lunak di Pulau Madura.",
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MaduraDev",
    url: "https://madura.dev",
  };

  return (
    <main className="flex-1">
      {/* Schema.org Organization & WebSite JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <Hero />
      <Features />
      <Community />
      <MapCommunityMadura communities={communities} maxLegend={1} />
      <CallToAction />
    </main>
  );
}
