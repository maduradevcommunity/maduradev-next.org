import { type RouteConfig, route, layout, index } from "@react-router/dev/routes";

export default [
  // Site layout
  layout("routes/_site.tsx", [
    index("routes/_site._index.tsx"),
    route("events", "routes/_site.events.tsx"),
    route("events/:slug", "routes/_site.events.$slug.tsx"),
    route("teams", "routes/_site.teams.tsx"),
    route("teams/:slug", "routes/_site.teams.$slug.tsx"),
    route("twibbon", "routes/_site.twibbon.tsx"),
    route("community", "routes/_site.community.tsx"),
    route("media", "routes/_site.media.tsx"),
    route("media/:slug", "routes/_site.media.$slug.tsx"),
    route("privacy-policy", "routes/_site.privacy-policy.tsx"),
    route("terms-of-service", "routes/_site.terms-of-service.tsx"),
  ]),

  // Public ticket page (no auth required)
  route("ticket/:token", "routes/ticket.$token.tsx"),

  // Dashboard layout - creates /dashboard/* URL segment
  route("dashboard", "routes/_dashboard.tsx", [
    index("routes/_dashboard._index.tsx"),
    route("events", "routes/_dashboard.events.tsx"),
    route("events/create", "routes/_dashboard.events.create.tsx"),
    route("events/:id/edit", "routes/_dashboard.events.$id.edit.tsx"),
    route("events/:id/checkin", "routes/_dashboard.events.$id.checkin.tsx"),
    route("events/:id", "routes/_dashboard.events.$id.tsx"),
    route("team", "routes/_dashboard.team.tsx"),
    route("team/create", "routes/_dashboard.team.create.tsx"),
    route("team/:id/edit", "routes/_dashboard.team.$id.edit.tsx"),
    route("profile", "routes/_dashboard.profile.tsx"),
    route("settings", "routes/_dashboard.settings.tsx"),
    route("communities", "routes/_dashboard.communities.tsx"),
    route("communities/create", "routes/_dashboard.communities.create.tsx"),
    route("communities/:id/edit", "routes/_dashboard.communities.$id.edit.tsx"),
    route("custom-domains", "routes/_dashboard.custom-domains.tsx"),
    route("media", "routes/_dashboard.media.tsx"),
    route("media/create", "routes/_dashboard.media.create.tsx"),
    route("media/:id/edit", "routes/_dashboard.media.$id.edit.tsx"),
  ]),

  // Login
  route("login", "routes/login.tsx"),

  // Auth action routes
  route("logout", "routes/logout.tsx"),
  route("auth/generate-account", "routes/auth.generate-account.tsx"),
  route("auth/delete-event", "routes/auth.delete-event.tsx"),
  route("auth/delete-team", "routes/auth.delete-team.tsx"),
  route("auth/delete-community", "routes/auth.delete-community.tsx"),
  route("auth/delete-media-post", "routes/auth.delete-media-post.tsx"),
  route("api/pakasir-webhook", "routes/api.pakasir-webhook.ts"),
  route("api/regional", "routes/api.regional.ts"),

  // Social redirect routes
  route("instagram", "routes/instagram.tsx"),
  route("telegram", "routes/telegram.tsx"),
  route("facebook", "routes/facebook.tsx"),
  route("github", "routes/github.tsx"),

  // Catch-all 404
  route("*", "routes/$.tsx"),

  // SEO
  route("sitemap.xml", "routes/sitemap[.xml].tsx"),
  route("robots.txt", "routes/robots[.txt].tsx"),
] satisfies RouteConfig;
