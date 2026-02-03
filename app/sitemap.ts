import { MetadataRoute } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ctrlbits.com"
).replace(/\/$/, "");

// Use a stable date for static pages (prevents “everything changed” signals)
const STATIC_LASTMOD = new Date("2026-01-30");

type CF =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

function asArray<T = any>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "daily" as CF,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/best-blogs-nepal`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "weekly" as CF,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/articles`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "daily" as CF,
      priority: 0.9,
    }, // <-- your real posts index
    {
      url: `${SITE_URL}/categories`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "weekly" as CF,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/tags`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "weekly" as CF,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/archives`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "weekly" as CF,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly" as CF,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly" as CF,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "yearly" as CF,
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "yearly" as CF,
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "yearly" as CF,
      priority: 0.5,
    },

    // Usually exclude /search from sitemap (often thin/param-based)
    // { url: `${SITE_URL}/search`, lastModified: STATIC_LASTMOD, changeFrequency: "monthly" as CF, priority: 0.3 },
  ];

  if (!API_URL) return staticPages;

  try {
    const [postsRes, categoriesRes, tagsRes] = await Promise.all([
      fetch(`${API_URL}/api/posts/?status=published`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${API_URL}/api/categories/`, { next: { revalidate: 3600 } }),
      fetch(`${API_URL}/api/tags/`, { next: { revalidate: 3600 } }),
    ]);

    const postsData = postsRes.ok ? await postsRes.json() : null;
    const categoriesData = categoriesRes.ok ? await categoriesRes.json() : null;
    const tagsData = tagsRes.ok ? await tagsRes.json() : null;

    const posts = asArray(postsData);
    const categories = asArray(categoriesData);
    const tags = asArray(tagsData);

    const postPages: MetadataRoute.Sitemap = posts
      .filter((p: any) => p?.slug)
      .map((post: any) => ({
        url: `${SITE_URL}/post/${post.slug}`,
        lastModified: new Date(
          post.updated_at ||
            post.published_at ||
            post.created_at ||
            STATIC_LASTMOD,
        ),
        changeFrequency: "weekly" as CF,
        priority: 0.9,
      }));

    const categoryPages: MetadataRoute.Sitemap = categories
      .filter((c: any) => c?.slug)
      .map((category: any) => ({
        url: `${SITE_URL}/categories/${category.slug}`,
        lastModified: new Date(
          category.updated_at || category.created_at || STATIC_LASTMOD,
        ),
        changeFrequency: "weekly" as CF,
        priority: 0.7,
      }));

    const tagPages: MetadataRoute.Sitemap = tags
      .filter((t: any) => t?.slug)
      .map((tag: any) => ({
        url: `${SITE_URL}/tags/${tag.slug}`,
        lastModified: new Date(
          tag.updated_at || tag.created_at || STATIC_LASTMOD,
        ),
        changeFrequency: "weekly" as CF,
        priority: 0.6,
      }));

    return [...staticPages, ...postPages, ...categoryPages, ...tagPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticPages;
  }
}
