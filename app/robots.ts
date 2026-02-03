import { MetadataRoute } from "next";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ctrlbits.com"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
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
          "/articles",
          "/articles/",
          "/post/",
          "/categories/",
          "/tags/",
          "/archives/",
          "/best-blogs-nepal/",
          "/about/",
        ],
        disallow: ["/cgi-bin/", "/api/", "/dashboard/", "/login", "/register"],
      },
      {
        userAgent: ["AhrefsBot", "SemrushBot", "MJ12bot"],
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
