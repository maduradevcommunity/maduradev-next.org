import type { Route } from "./+types/_site.media.$slug";
import { Link, useLoaderData } from "react-router";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMediaPostBySlug, getAllMediaPosts } from "@/lib/media";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { motion } from "motion/react";
import {
  Calendar,
  Clock,
  Newspaper,
  ArrowLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const meta: Route.MetaFunction = ({ data }) => {
  if (!data?.post) return [{ title: "Artikel tidak ditemukan" }];
  const post = data.post;
  const imageUrl = post.image_url
    ? (post.image_url.startsWith("http") ? post.image_url : `https://madura.dev${post.image_url.startsWith("/") ? "" : "/"}${post.image_url}`)
    : undefined;

  return [
    { title: `${post.title} - MaduraDev` },
    { name: "description", content: post.summary },
    {
      name: "keywords",
      content: `blog developer, kabar komunitas, ${post.title}, programmer madura`,
    },
    { property: "og:title", content: `${post.title} - MaduraDev Media` },
    { property: "og:description", content: post.summary },
    { property: "og:type", content: "article" },
    { property: "og:url", content: `https://madura.dev/media/${post.slug}` },
    ...(imageUrl ? [{ property: "og:image", content: imageUrl }] : []),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: post.title },
    { name: "twitter:description", content: post.summary },
    ...(imageUrl ? [{ name: "twitter:image", content: imageUrl }] : []),
    {
      tagName: "link",
      rel: "canonical",
      href: `https://madura.dev/media/${post.slug}`,
    },
  ];
};

export async function loader({ params }: Route.LoaderArgs) {
  const supabase = createAdminClient();
  const post = await getMediaPostBySlug(supabase, params.slug);

  if (!post) {
    throw new Response("Post not found", { status: 404 });
  }

  // Fetch recent posts for recommendations (excluding current)
  const allPosts = await getAllMediaPosts(supabase, {
    status: "published",
    limit: 4,
  });
  const recommendations = allPosts.filter((p) => p.id !== post.id).slice(0, 3);

  return { post, recommendations };
}

export default function MediaDetailPage() {
  const { post, recommendations } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pt-28 pb-16">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": post.type === "blog" ? "BlogPosting" : "NewsArticle",
            headline: post.title,
            image: post.image_url ? [post.image_url] : ["https://madura.dev/image.jpg"],
            datePublished: post.published_at || post.created_at,
            dateModified: post.updated_at || post.published_at || post.created_at,
            author: [
              {
                "@type": "Person",
                name: post.author?.name || "MaduraDev",
                url: "https://madura.dev",
              },
            ],
            publisher: {
              "@type": "Organization",
              name: "MaduraDev",
              logo: {
                "@type": "ImageObject",
                url: "https://madura.dev/image.jpg",
              },
            },
            description: post.summary,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://madura.dev/media/${post.slug}`,
            },
          }),
        }}
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

      <div className="relative z-10 container px-6 max-w-4xl mx-auto space-y-8">
        {/* Back navigation */}
        <div className="flex items-center">
          <Button
            asChild
            variant="ghost"
            className="gap-2 -ml-4 text-muted-foreground hover:text-foreground"
          >
            <Link to="/media">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Media
            </Link>
          </Button>
        </div>

        {/* Article Metadata Header */}
        <div className="space-y-4">
          <div>
            <span
              className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${
                post.type === "kabar"
                  ? "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {post.type === "kabar" ? "Kabar Dev" : "Blog Dev"}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black font-display text-foreground leading-[1.15] tracking-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-2">
            {/* Author info */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted overflow-hidden border border-border">
                {post.author?.avatar_url ? (
                  <img
                    src={post.author.avatar_url}
                    alt={post.author.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-[10px] font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
              <span className="font-semibold text-foreground text-xs">
                {post.author?.name || "MaduraDev Admin"}
              </span>
            </div>

            <span className="text-muted-foreground/30">•</span>

            <div className="flex items-center gap-1.5 text-xs">
              <Calendar className="w-4 h-4" />
              <span>{post.tanggal}</span>
            </div>

            <span className="text-muted-foreground/30">•</span>

            <div className="flex items-center gap-1.5 text-xs">
              <Clock className="w-4 h-4" />
              <span>{post.read_time}</span>
            </div>
          </div>
        </div>

        {/* Large Cover Image */}
        {post.image_url && (
          <div className="w-full h-64 md:h-[420px] rounded-3xl overflow-hidden bg-muted border border-border/50 shadow-sm relative">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Main Article Content */}
        <article className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-md p-8 md:p-12 editorial-shadow">
          <MarkdownRenderer content={post.content} />
        </article>

        {/* Recommendation Section */}
        {recommendations.length > 0 && (
          <div className="pt-12 border-t border-border/60 space-y-6">
            <h3 className="text-xl font-bold font-display text-foreground">
              Artikel Rekomendasi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="group flex flex-col justify-between p-4 bg-muted/20 border border-border/40 hover:border-primary/20 rounded-2xl transition-all duration-300"
                >
                  <div className="space-y-3">
                    {/* Category */}
                    <div>
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider ${
                          rec.type === "kabar"
                            ? "text-blue-500"
                            : "text-emerald-500"
                        }`}
                      >
                        {rec.type === "kabar" ? "Kabar Dev" : "Blog Dev"}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold font-display text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      <Link to={`/media/${rec.slug}`}>{rec.title}</Link>
                    </h4>
                  </div>

                  <Link
                    to={`/media/${rec.slug}`}
                    className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-primary hover:underline mt-4 pt-3 border-t border-border/20"
                  >
                    Baca Artikel <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
