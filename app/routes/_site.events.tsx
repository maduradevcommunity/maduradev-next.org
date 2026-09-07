import type { Route } from "./+types/_site.events";
import { createClient } from "@/lib/supabase/server";
import { getAllEvents } from "@/lib/event";
import ListEvent from "@/components/event/list-event";
import { motion, type Variants } from "motion/react";
import { appleSprings } from "@/lib/springs";

export const meta: Route.MetaFunction = () => [
  { title: "Events - MaduraDev" },
  { name: "description", content: "Semua event MaduraDev: workshop, webinar, bootcamp, dan bincang-bincang untuk developer Madura." },
  { name: "keywords", content: "event developer madura, workshop programming madura, webinar developer, bootcamp coding madura" },
  { property: "og:title", content: "Events - MaduraDev" },
  { property: "og:description", content: "Workshop, webinar, bootcamp, dan bincang-bincang untuk developer Madura." },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://madura.dev/events" },
  { property: "og:image", content: "https://madura.dev/image.jpg" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Events - MaduraDev" },
  { name: "twitter:description", content: "Workshop, webinar, bootcamp, dan bincang-bincang untuk developer Madura." },
  { name: "twitter:image", content: "https://madura.dev/image.jpg" },
  { tagName: "link", rel: "canonical", href: "https://madura.dev/events" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const supabase = createClient(request);
  const events = await getAllEvents(supabase);
  return { events };
}

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: appleSprings.default,
  },
};

export default function EventsPage({ loaderData }: Route.ComponentProps) {
  const { events } = loaderData;

  const eventsItemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "MaduraDev Events",
    description: "Daftar workshop, webinar, bootcamp, dan bincang-bincang untuk developer Madura.",
    url: "https://madura.dev/events",
    itemListElement: events.map((event, index) => {
      let startDateISO = event.event_date;
      if (event.event_date) {
        const timeMatch = event.event_time?.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          const hh = timeMatch[1].padStart(2, "0");
          const mm = timeMatch[2];
          startDateISO = `${event.event_date}T${hh}:${mm}:00+07:00`;
        } else {
          startDateISO = `${event.event_date}T00:00:00+07:00`;
        }
      }

      const cleanLocation = event.location ? event.location.replace(/<[^>]*>?/gm, "").trim() : "";
      const fullImageUrl = event.image
        ? (event.image.startsWith("http") ? event.image : `https://madura.dev${event.image.startsWith("/") ? "" : "/"}${event.image}`)
        : undefined;

      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Event",
          name: event.title,
          description: event.description_small,
          startDate: startDateISO,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: event.online
            ? "https://schema.org/OnlineEventAttendanceMode"
            : "https://schema.org/OfflineEventAttendanceMode",
          location: event.online
            ? {
              "@type": "VirtualLocation",
              url: `https://madura.dev/events/${event.slug}`,
            }
            : {
              "@type": "Place",
              name: cleanLocation || "Madura",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Madura",
                addressRegion: "Jawa Timur",
                addressCountry: "ID",
              },
            },
          organizer: {
            "@type": "Organization",
            name: "MaduraDev",
            url: "https://madura.dev",
          },
          ...(fullImageUrl ? { image: [fullImageUrl] } : {}),
          url: `https://madura.dev/events/${event.slug}`,
        },
      };
    }),
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pt-28 pb-16">
      {/* Schema.org Event List JSON-LD for Google Search Console */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventsItemListJsonLd) }}
      />

      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Dot Grid Background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, #0058be 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 container px-6 max-w-7xl mx-auto space-y-12">
        {/* Animated Page Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={headerVariants}
          className="max-w-3xl space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
            Event Directory
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight font-display text-foreground leading-[1.1]">
            Jelajahi <span className="text-primary italic">Event & Workshop</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl">
            Tingkatkan keahlian coding, ikuti bedah buku teknologi terbaru, dan perluas jaringan profesional Anda bersama komunitas pengembang di Madura.
          </p>
        </motion.div>

        {/* Event List Component with filters and grids */}
        <ListEvent events={events} />
      </div>
    </div>
  );
}
