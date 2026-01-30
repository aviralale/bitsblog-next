import { Metadata } from "next";
import CategoryViewPageClient from "./CategoryViewPageClient";
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

// Fetch category data
async function getCategory(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/categories/${slug}/`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}

// Fetch posts for category
async function getCategoryPosts(slug: string) {
  try {
    const res = await fetch(
      `${API_URL}/api/posts/?category__slug=${slug}&status=published`,
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
    console.error("Error fetching category posts:", error);
    return [];
  }
}

// Generate metadata for the category
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await getCategory(params.slug);

  if (!category) {
    return {
      title: "Category Not Found | BitsBlog",
      description: "The category you're looking for doesn't exist.",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const title = `${category.name} Articles | BitsBlog`;
  const description = category.description
    ? truncateText(
        `${category.description} Browse ${category.posts_count} article${
          category.posts_count !== 1 ? "s" : ""
        } in ${category.name} category.`,
        155
      )
    : `Explore ${category.posts_count} article${
        category.posts_count !== 1 ? "s" : ""
      } in ${
        category.name
      } category. In-depth tutorials, guides, and insights on ${category.name.toLowerCase()}.`;

  const keywords = `${category.name}, ${category.name} articles, ${category.name} tutorials, ${category.name} guides, tech blog, programming, web development`;
  const url = `${SITE_URL}/categories/${category.slug}`;
  const ogImage = `${SITE_URL}/og-categories.jpg`;

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
          alt: `${category.name} articles on BitsBlog`,
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

// Generate static params for all categories
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/api/categories/`);
    const categories = await res.json();

    return categories.map((category: any) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function CategoryViewPage({
  params,
}: {
  params: { slug: string };
}) {
  const [category, posts] = await Promise.all([
    getCategory(params.slug),
    getCategoryPosts(params.slug),
  ]);

  if (!category) {
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
        name: "Categories",
        item: `${SITE_URL}/categories`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: `${SITE_URL}/categories/${category.slug}`,
      },
    ],
  };

  // CollectionPage Schema
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} Articles`,
    description:
      category.description ||
      `Articles and tutorials about ${category.name}`,
    url: `${SITE_URL}/categories/${category.slug}`,
    numberOfItems: posts.length,
    about: {
      "@type": "Thing",
      name: category.name,
      description: category.description || `Articles about ${category.name}`,
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
      <CategoryViewPageClient
        initialCategory={category}
        initialPosts={posts}
        slug={params.slug}
      />
    </>
  );
}
