import { MetadataRoute } from "next";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ctrlbits.com"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      /**
       * Default rule for all crawlers
       * Search engines + unknown bots
       */
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cgi-bin/",
          "/api/",
          "/dashboard/",
          "/login",
          "/register",
          "/profile/*/edit",
          "/saved-posts",
          "/newsletter/verify/*",
          "/newsletter/unsubscribe/*",
          "/_next/",
          "/wp-admin/",
        ],
      },

      /**
       * AI / Answer Engine Crawlers
       * Explicitly allow public editorial content
       */
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "Claude-Web",
          "anthropic-ai",
          "PerplexityBot",
        ],
        allow: [
          "/",
          "/post/",
          "/categories/",
          "/tags/",
          "/archives/",
          "/best-blogs-nepal/",
          "/about/",
        ],
        disallow: ["/cgi-bin/", "/api/", "/dashboard/", "/login", "/register"],
      },

      /**
       * SEO intelligence crawlers (rate-limited)
       */
      {
        userAgent: ["AhrefsBot", "SemrushBot", "MJ12bot"],
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
