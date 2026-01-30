import { MetadataRoute } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ctrlbits.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Fetch all published posts
    const postsResponse = await fetch(`${API_URL}/api/posts/?status=published`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    const postsData = await postsResponse.json();
    const posts = postsData.results || [];

    // Fetch all categories
    const categoriesResponse = await fetch(`${API_URL}/api/categories/`, {
      next: { revalidate: 3600 },
    });
    const categories = await categoriesResponse.json();

    // Fetch all tags
    const tagsResponse = await fetch(`${API_URL}/api/tags/`, {
      next: { revalidate: 3600 },
    });
    const tags = await tagsResponse.json();

    // Static pages
    const staticPages = [
      {
        url: SITE_URL,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1.0,
      },
      {
        url: `${SITE_URL}/best-blogs-nepal`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 1.0,
      },
      {
        url: `${SITE_URL}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/articles`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/categories`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/tags`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/archives`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/search`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      },
      {
        url: `${SITE_URL}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/faq`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      },
      {
        url: `${SITE_URL}/privacy`,
        lastModified: new Date(),
        changeFrequency: "yearly" as const,
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/terms`,
        lastModified: new Date(),
        changeFrequency: "yearly" as const,
        priority: 0.5,
      },
    ];

    // Post pages
    const postPages = posts.map((post: any) => ({
      url: `${SITE_URL}/post/${post.slug}`,
      lastModified: new Date(post.updated_at || post.published_at || post.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    // Category pages
    const categoryPages = categories.map((category: any) => ({
      url: `${SITE_URL}/categories/${category.slug}`,
      lastModified: new Date(category.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // Tag pages
    const tagPages = tags.map((tag: any) => ({
      url: `${SITE_URL}/tags/${tag.slug}`,
      lastModified: new Date(tag.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...postPages, ...categoryPages, ...tagPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return at least the static pages if API fails
    return [
      {
        url: SITE_URL,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1.0,
      },
    ];
  }
}
