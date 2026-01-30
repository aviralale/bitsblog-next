import { Metadata } from "next";
import TagViewPageClient from "./TagViewPageClient";
import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ctrlbits.com";

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 155): string => {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (
    (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "..."
  );
};

// Fetch tag data
async function getTag(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/tags/${slug}/`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching tag:", error);
    return null;
  }
}

// Fetch posts for tag
async function getTagPosts(slug: string) {
  try {
    const res = await fetch(
      `${API_URL}/api/posts/?tags__slug=${slug}&status=published`,
      {
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    console.error("Error fetching tag posts:", error);
    return [];
  }
}

// Generate metadata for the tag
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const tag = await getTag(params.slug);

  if (!tag) {
    return {
      title: "Tag Not Found | BitsBlog",
      description: "The tag you're looking for doesn't exist.",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const title = `${tag.name} Articles | BitsBlog`;
  const description = tag.description
    ? truncateText(
        `${tag.description} Browse ${tag.posts_count} article${
          tag.posts_count !== 1 ? "s" : ""
        } tagged with ${tag.name}.`,
        155
      )
    : `Explore ${tag.posts_count} article${
        tag.posts_count !== 1 ? "s" : ""
      } tagged with ${tag.name}. Discover in-depth tutorials, guides, and insights on ${tag.name.toLowerCase()}.`;

  const keywords = `${tag.name}, ${tag.name} articles, ${tag.name} tutorials, ${tag.name} guides, tech blog, programming, web development`;
  const url = `${SITE_URL}/tags/${tag.slug}`;
  const ogImage = `${SITE_URL}/og-tags.jpg`;

  return {
    title,
    description,
    keywords: keywords.split(", "),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "BitsBlog",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${tag.name} articles on BitsBlog`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "@ctrl_bits",
      creator: "@ctrl_bits",
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

// Generate static params for all tags
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/api/tags/`);
    const tags = await res.json();

    return tags.map((tag: any) => ({
      slug: tag.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function TagViewPage({
  params,
}: {
  params: { slug: string };
}) {
  const [tag, posts] = await Promise.all([
    getTag(params.slug),
    getTagPosts(params.slug),
  ]);

  if (!tag) {
    notFound();
  }

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tags",
        item: `${SITE_URL}/tags`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tag.name,
        item: `${SITE_URL}/tags/${tag.slug}`,
      },
    ],
  };

  // CollectionPage Schema
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${tag.name} Articles`,
    description:
      tag.description || `Articles and tutorials tagged with ${tag.name}`,
    url: `${SITE_URL}/tags/${tag.slug}`,
    numberOfItems: posts.length,
    about: {
      "@type": "Thing",
      name: tag.name,
      description: tag.description || `Articles tagged with ${tag.name}`,
    },
    publisher: {
      "@type": "Organization",
      name: "Ctrl Bits",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.png`,
      },
    },
  };

  // ItemList Schema for posts
  const itemListSchema =
    posts.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          numberOfItems: posts.length,
          itemListElement: posts.map((post: any, index: number) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Article",
              "@id": `${SITE_URL}/post/${post.slug}`,
              headline: post.title,
              description: post.excerpt || post.title,
              url: `${SITE_URL}/post/${post.slug}`,
              datePublished: post.published_at || post.created_at,
              author: {
                "@type": "Person",
                name:
                  post.author.first_name && post.author.last_name
                    ? `${post.author.first_name} ${post.author.last_name}`
                    : post.author.username,
              },
            },
          })),
        }
      : null;

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}

      {/* Render the client component */}
      <TagViewPageClient
        initialTag={tag}
        initialPosts={posts}
        slug={params.slug}
      />
    </>
  );
}
