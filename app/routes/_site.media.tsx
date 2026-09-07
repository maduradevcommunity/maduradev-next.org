import type { Route } from "./+types/_site.media";
import { useState, useMemo } from "react";
import { Link } from "react-router";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllMediaPosts } from "@/lib/media";
import { motion, type Variants } from "motion/react";
import { Calendar, Clock, Newspaper, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appleSprings } from "@/lib/springs";
import { triggerHaptic } from "@/lib/haptics";

export const meta: Route.MetaFunction = () => [
  { title: "Media - MaduraDev" },
  { name: "description", content: "MaduraDev Media: Kabar kegiatan komunitas developer Madura dan Blog teknis/tutorial programming." },
  { name: "keywords", content: "blog developer madura, kabar maduradev, tutorial programming, komunitas programmer madura" },
  { property: "og:title", content: "Media - MaduraDev" },
  { property: "og:description", content: "Kabar kegiatan komunitas developer Madura dan Blog teknis/tutorial programming." },
  { property: "og:type", content: "website" },
  { property: "og:image", content: "https://madura.dev/image.jpg" },
  { property: "og:url", content: "https://madura.dev/media" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Media - MaduraDev" },
  { name: "twitter:description", content: "Kabar kegiatan komunitas developer Madura dan Blog teknis/tutorial programming." },
  { name: "twitter:image", content: "https://madura.dev/image.jpg" },
  {
    tagName: "link",
    rel: "canonical",
    href: "https://madura.dev/media",
  },
];

export async function loader() {
  const supabase = createAdminClient();
  const posts = await getAllMediaPosts(supabase, { status: "published" });
  return { posts };
}

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: appleSprings.default,
  }
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: appleSprings.default,
  }
};

export default function MediaPage({ loaderData }: Route.ComponentProps) {
  const { posts } = loaderData;
  const [activeFilter, setActiveFilter] = useState<"semua" | "kabar" | "blog">("semua");

  const filteredPosts = useMemo(() => {
    if (activeFilter === "semua") return posts;
    return posts.filter((post) => post.type === activeFilter);
  }, [posts, activeFilter]);

  // Find featured post (latest published post, if any)
  const featuredPost = useMemo(() => {
    return posts.length > 0 ? posts[0] : null;
  }, [posts]);

  // Rest of the posts for the grid (excluding featured if in 'semua' filter)
  const gridPosts = useMemo(() => {
    if (activeFilter === "semua" && featuredPost) {
      return filteredPosts.filter((post) => post.id !== featuredPost.id);
    }
    return filteredPosts;
  }, [filteredPosts, activeFilter, featuredPost]);

  const mediaItemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "MaduraDev Media & Blog",
    description: "Kabar kegiatan komunitas developer Madura dan Blog teknis/tutorial programming.",
    url: "https://madura.dev/media",
    itemListElement: posts.map((post, index) => {
      const fullImageUrl = post.image_url
        ? (post.image_url.startsWith("http") ? post.image_url : `https://madura.dev${post.image_url.startsWith("/") ? "" : "/"}${post.image_url}`)
        : undefined;

      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "BlogPosting",
          headline: post.title,
          description: post.summary,
          url: `https://madura.dev/media/${post.slug}`,
          datePublished: post.created_at,
          ...(fullImageUrl ? { image: [fullImageUrl] } : {}),
          author: {
            "@type": "Person",
            name: post.author?.name || "Tim MaduraDev",
          },
        },
      };
    }),
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pt-28 pb-16">
      {/* Schema.org Media ItemList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mediaItemListJsonLd) }}
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
            MaduraDev Media
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight font-display text-foreground leading-[1.1]">
            Kabar Dev & <span className="text-primary italic">Blog Tutorial</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl">
            Ikuti warta kegiatan terbaru dari komunitas MaduraDev, serta perluas pengetahuan teknis Anda melalui artikel tutorial pemrograman mendalam yang ditulis oleh para developer lokal.
          </p>
        </motion.div>

        {/* Tab switcher filter */}
        <div className="flex border-b border-border/60 pb-px">
          <div className="flex gap-2 p-1 bg-muted/40 rounded-xl border border-border/40">
            <button
              onClick={() => {
                triggerHaptic("light");
                setActiveFilter("semua");
              }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg select-none cursor-pointer transition-all active:scale-95 ${
                activeFilter === "semua"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => {
                triggerHaptic("light");
                setActiveFilter("kabar");
              }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg select-none cursor-pointer transition-all active:scale-95 ${
                activeFilter === "kabar"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Kabar Dev
            </button>
            <button
              onClick={() => {
                triggerHaptic("light");
                setActiveFilter("blog");
              }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg select-none cursor-pointer transition-all active:scale-95 ${
                activeFilter === "blog"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Blog Dev
            </button>
          </div>
        </div>

        {/* Featured Post (only shown when 'Semua' is active and posts exist) */}
        {activeFilter === "semua" && featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={appleSprings.default}
            className="group relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl border border-border/50 bg-card/60 backdrop-blur-md p-6 lg:p-8 editorial-shadow overflow-hidden"
          >
            <div className="lg:col-span-7 h-64 md:h-96 rounded-2xl overflow-hidden bg-muted relative">
              {featuredPost.image_url ? (
                <img
                  src={featuredPost.image_url}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30">
                  <Newspaper className="w-20 h-20 text-primary/30" />
                </div>
              )}
              {/* Type Badge */}
              <div className="absolute top-4 left-4">
                <span
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${
                    featuredPost.type === "kabar"
                      ? "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {featuredPost.type === "kabar" ? "Kabar Dev" : "Blog Dev"}
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{featuredPost.tanggal}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{featuredPost.read_time}</span>
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground leading-tight group-hover:text-primary transition-colors">
                <Link to={`/media/${featuredPost.slug}`}>
                  {featuredPost.title}
                </Link>
              </h2>

              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                {featuredPost.summary}
              </p>

              {/* Author & Read More */}
              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted overflow-hidden border border-border">
                    {featuredPost.author?.avatar_url ? (
                      <img
                        src={featuredPost.author.avatar_url}
                        alt={featuredPost.author.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-[10px] font-bold">
                        {featuredPost.author?.name ? featuredPost.author.name.charAt(0) : "A"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground leading-none">
                      {featuredPost.author?.name || "MaduraDev"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Penulis</p>
                  </div>
                </div>

                <Button asChild variant="ghost" size="sm" className="group/btn">
                  <Link to={`/media/${featuredPost.slug}`} className="flex items-center gap-1 text-primary">
                    Baca Artikel <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Media Grid */}
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="p-4 bg-muted rounded-full">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Belum Ada Artikel</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Belum ada artikel publikasi kategori ini untuk saat ini. Silakan kembali lagi nanti!
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {gridPosts.map((post) => (
              <motion.div
                key={post.id}
                variants={cardVariants}
                className="group flex flex-col justify-between rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-5 editorial-shadow overflow-hidden hover:border-primary/20 transition-all duration-300"
              >
                <div className="space-y-4">
                  {/* Thumbnail Image */}
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-muted relative">
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/15">
                        <Newspaper className="w-12 h-12 text-primary/20" />
                      </div>
                    )}
                    {/* Category Type Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full border shadow-sm ${
                          post.type === "kabar"
                            ? "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {post.type === "kabar" ? "Kabar Dev" : "Blog Dev"}
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{post.tanggal}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.read_time}</span>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold font-display text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      <Link to={`/media/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">
                      {post.summary}
                    </p>
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    <div className="w-6.5 h-6.5 rounded-full bg-muted overflow-hidden border border-border">
                      {post.author?.avatar_url ? (
                        <img
                          src={post.author.avatar_url}
                          alt={post.author.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-[8px] font-bold">
                          {post.author?.name ? post.author.name.charAt(0) : "A"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-foreground leading-none">
                        {post.author?.name || "MaduraDev"}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/media/${post.slug}`}
                    className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
                  >
                    Selengkapnya <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
