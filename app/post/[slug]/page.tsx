import { Metadata } from "next";
import PostViewPageClient from "./PostViewPageClient";
import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ctrlbits.com";

// Helper function to strip HTML tags
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, "");
};

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 155): string => {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (
    (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "..."
  );
};

// Fetch post data
async function getPost(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/posts/${slug}/`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

// Generate metadata for the post
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: "Post Not Found | BitsBlog",
      description: "The requested blog post could not be found.",
    };
  }

  const title = `${post.title} | BitsBlog`;
  const description = truncateText(
    post.excerpt || stripHtml(post.content),
    155
  );
  const url = `${SITE_URL}/post/${post.slug}`;
  const imageUrl = post.featured_image || `${SITE_URL}/og-default.jpg`;
  const publishedTime = new Date(
    post.published_at || post.created_at
  ).toISOString();
  const modifiedTime = new Date(
    post.updated_at || post.published_at || post.created_at
  ).toISOString();

  const keywords = [
    ...post.tags.map((tag: any) => tag.name),
    post.category?.name,
    "tech blog",
    "programming",
    "web development",
  ].filter(Boolean);

  return {
    title,
    description,
    keywords,
    authors: [
      {
        name: post.author.first_name && post.author.last_name
          ? `${post.author.first_name} ${post.author.last_name}`
          : post.author.username,
        url: `${SITE_URL}/profile/${post.author.username}`,
      },
    ],
    creator: post.author.username,
    publisher: "Ctrl Bits",
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "BitsBlog",
      locale: "en_US",
      type: "article",
      publishedTime,
      modifiedTime,
      authors: [
        post.author.first_name && post.author.last_name
          ? `${post.author.first_name} ${post.author.last_name}`
          : post.author.username,
      ],
      tags: post.tags.map((tag: any) => tag.name),
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@ctrl_bits",
      site: "@ctrl_bits",
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

// Generate static params for popular posts (optional, for static generation)
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/api/posts/?status=published&page_size=50`);
    const data = await res.json();
    const posts = data.results || [];

    return posts.map((post: any) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function PostViewPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  // Generate Article Schema (JSON-LD)
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: truncateText(post.excerpt || stripHtml(post.content), 155),
    image: post.featured_image || `${SITE_URL}/og-default.jpg`,
    datePublished: new Date(
      post.published_at || post.created_at
    ).toISOString(),
    dateModified: new Date(
      post.updated_at || post.published_at || post.created_at
    ).toISOString(),
    author: {
      "@type": "Person",
      name:
        post.author.first_name && post.author.last_name
          ? `${post.author.first_name} ${post.author.last_name}`
          : post.author.username,
      url: `${SITE_URL}/profile/${post.author.username}`,
    },
    publisher: {
      "@type": "Organization",
      name: "Ctrl Bits",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/post/${post.slug}`,
    },
    keywords: post.tags.map((tag: any) => tag.name).join(", "),
    articleSection: post.category?.name || "Technology",
    wordCount: stripHtml(post.content).split(/\s+/).length,
    commentCount: post.comments_count || 0,
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/ViewAction",
        userInteractionCount: post.views || 0,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: post.comments_count || 0,
      },
    ],
  };

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
        name: "Articles",
        item: `${SITE_URL}/articles`,
      },
      ...(post.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: post.category.name,
              item: `${SITE_URL}/categories/${post.category.slug}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: post.title,
              item: `${SITE_URL}/post/${post.slug}`,
            },
          ]
        : [
            {
              "@type": "ListItem",
              position: 3,
              name: post.title,
              item: `${SITE_URL}/post/${post.slug}`,
            },
          ]),
    ],
  };

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      {/* Render the client component with the post data */}
      <PostViewPageClient initialPost={post} />
    </>
  );
}
