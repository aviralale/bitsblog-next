"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Head from "next/head";
import { tagAPI, postAPI } from "@/api/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tag as TagIcon,
  FileText,
  Calendar,
  ArrowLeft,
  User,
  MessageSquare,
  Eye,
} from "lucide-react";
import { Tag, Post } from "@/types";
import Image from "next/image";

interface TagViewPageClientProps {
  initialTag: Tag;
  initialPosts: Post[];
  slug: string;
}

// Helper function to get absolute URL
const getAbsoluteUrl = (path: string): string => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : process.env.NEXT_PUBLIC_SITE_URL;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

// Helper to truncate text
const truncateText = (text: string, maxLength: number = 155): string => {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (
    (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "..."
  );
};

export default function TagViewPageClient({
  initialTag,
  initialPosts,
  slug,
}: TagViewPageClientProps) {
  const params = useParams();

  const [tag, setTag] = useState<Tag | null>(initialTag);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Format date string
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /**
   * Get author display name
   */
  const getAuthorName = (author: Post["author"]) => {
    if (author.first_name || author.last_name) {
      return `${author.first_name} ${author.last_name}`.trim();
    }
    return author.username;
  };

  // Generate SEO data
  const generateSEOData = () => {
    if (!tag) {
      return {
        title: "Tag Not Found | BitsBlog",
        description: "The tag you're looking for doesn't exist.",
        keywords: "blog, tags",
        canonicalUrl: getAbsoluteUrl("/tags"),
        ogImage: getAbsoluteUrl("/og-default.jpg"),
      };
    }

    const title = `${tag.name} Articles | BitsBlog`;

    const description = tag.description
      ? truncateText(
          `${tag.description} Browse ${tag.posts_count} article${
            tag.posts_count !== 1 ? "s" : ""
          } tagged with ${tag.name}.`,
          155,
        )
      : `Explore ${tag.posts_count} article${
          tag.posts_count !== 1 ? "s" : ""
        } tagged with ${
          tag.name
        }. Find related content and insights on ${tag.name.toLowerCase()}.`;

    const keywords = `${tag.name}, ${tag.name} articles, ${tag.name} tutorials, ${tag.name} guides, tech blog, programming, web development`;

    const canonicalUrl = getAbsoluteUrl(`/tag/${slug}`);
    const ogImage = getAbsoluteUrl("/og-tags.jpg");

    return {
      title,
      description,
      keywords,
      canonicalUrl,
      ogImage,
    };
  };

  const seoData = generateSEOData();

  // Breadcrumb structured data
  const breadcrumbSchema = tag
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: getAbsoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tags",
            item: getAbsoluteUrl("/tags"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: tag.name,
            item: seoData.canonicalUrl,
          },
        ],
      }
    : null;

  // CollectionPage structured data
  const collectionSchema = tag
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${tag.name} Articles`,
        description: seoData.description,
        url: seoData.canonicalUrl,
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
            url: getAbsoluteUrl("/logo.png"),
          },
        },
      }
    : null;

  // ItemList structured data for posts
  const itemListSchema =
    posts.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          numberOfItems: posts.length,
          itemListElement: posts.map((post, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Article",
              "@id": getAbsoluteUrl(`/post/${post.slug}`),
              headline: post.title,
              description: post.excerpt || post.title,
              url: getAbsoluteUrl(`/post/${post.slug}`),
              datePublished: post.published_at,
              author: {
                "@type": "Person",
                name: getAuthorName(post.author),
              },
            },
          })),
        }
      : null;

  if (loading) {
    return (
      <>
        <Head>
          <title>{seoData.title}</title>
          <meta name="robots" content="noindex, follow" />
        </Head>

        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  if (error || !tag) {
    return (
      <>
        <Head>
          <title>Tag Not Found | BitsBlog</title>
          <meta name="robots" content="noindex, follow" />
        </Head>

        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-6 py-12 max-w-6xl">
            <div className="border border-neutral-200 p-16 text-center">
              <TagIcon className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
              <h3 className="text-2xl font-light text-black mb-3">
                {error || "Tag Not Found"}
              </h3>
              <p className="text-neutral-600 font-light mb-6">
                The tag you're looking for doesn't exist or has been removed.
              </p>
              <Link
                href="/tags"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-neutral-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Browse All Tags</span>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Head>
        <title>{seoData.title}</title>

        {/* Basic Meta Tags */}
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        <meta name="robots" content="index, follow" />

        {/* Canonical Link */}
        <link rel="canonical" href={seoData.canonicalUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:url" content={seoData.canonicalUrl} />
        <meta property="og:site_name" content="BitsBlog" />
        <meta property="og:image" content={seoData.ogImage} />
        <meta
          property="og:image:alt"
          content={`${tag.name} articles on BitsBlog`}
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content={seoData.ogImage} />
        <meta name="twitter:image:alt" content={`${tag.name} articles`} />
        <meta name="twitter:site" content="@ctrl_bits" />

        {/* Structured Data - Breadcrumb */}
        {breadcrumbSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(breadcrumbSchema),
            }}
          />
        )}

        {/* Structured Data - CollectionPage */}
        {collectionSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(collectionSchema),
            }}
          />
        )}

        {/* Structured Data - ItemList (posts) */}
        {itemListSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(itemListSchema),
            }}
          />
        )}
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-6 py-12 max-w-6xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
              <Link href="/tags" className="hover:text-black transition-colors">
                Tags
              </Link>
              <span>/</span>
              <span className="text-black">{tag.name}</span>
            </div>

            <div className="flex items-start gap-6 mb-6">
              <div className="w-16 h-16 bg-neutral-100 flex items-center justify-center shrink-0">
                <TagIcon className="h-8 w-8 text-neutral-600" />
              </div>

              <div className="flex-1">
                <h1 className="text-5xl md:text-6xl font-light text-black mb-4 leading-tight">
                  {tag.name}
                </h1>
                {tag.description && (
                  <p className="text-lg text-neutral-600 font-light max-w-2xl">
                    {tag.description}
                  </p>
                )}
              </div>
            </div>

            {/* Tag Stats */}
            <div className="flex items-center gap-6 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>
                  {tag.posts_count}{" "}
                  {tag.posts_count === 1 ? "article" : "articles"}
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(tag.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-6xl">
          {/* Back Button */}
          <Link
            href="/tags"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-black transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Tags</span>
          </Link>

          {/* Posts List */}
          {posts.length === 0 ? (
            <div className="border border-neutral-200 p-16 text-center">
              <FileText className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
              <h3 className="text-2xl font-light text-black mb-3">
                No Articles Yet
              </h3>
              <p className="text-neutral-600 font-light">
                There are no published articles with this tag yet.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-light text-black">
                  All Articles tagged with {tag.name}
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {posts.length} {posts.length === 1 ? "article" : "articles"}
                </p>
              </div>

              <div className="space-y-6">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.slug}`}
                    className="group block"
                  >
                    <Card className="border-neutral-200 rounded-none shadow-none hover:shadow-lg transition-all">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {post.featured_image && (
                            <div className="md:w-80 shrink-0">
                              <div className="aspect-16/10 bg-neutral-100 overflow-hidden">
                                <img
                                  src={post.featured_image}
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex-1 p-6">
                            <h3 className="text-xl font-light text-black mb-3 group-hover:underline">
                              {post.title}
                            </h3>

                            {post.excerpt && (
                              <p className="text-neutral-600 font-light text-sm mb-4 leading-relaxed">
                                {post.excerpt}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4">
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                <span>{getAuthorName(post.author)}</span>
                              </div>
                              <span>•</span>
                              <span>
                                {post.published_at
                                  ? formatDate(post.published_at)
                                  : "Draft"}
                              </span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{post.views}</span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{post.comments_count}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Bottom Note */}
          {posts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-neutral-200 text-center">
              <p className="text-sm text-neutral-500 font-light">
                Showing all {posts.length}{" "}
                {posts.length === 1 ? "article" : "articles"} tagged with{" "}
                {tag.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
