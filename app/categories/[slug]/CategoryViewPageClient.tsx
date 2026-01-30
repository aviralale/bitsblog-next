"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  FolderOpen,
  Calendar,
  Eye,
  MessageSquare,
  ArrowLeft,
  FileText,
} from "lucide-react";
import api from "@/api/axios";

/**
 * Type definitions
 */
interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  posts_count: number;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  views: number;
  created_at: string;
  published_at: string;
  comments_count: number;
  author: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
}

interface CategoryViewPageClientProps {
  initialCategory: Category;
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
      : process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";
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

export default function CategoryViewPageClient({
  initialCategory,
  initialPosts,
  slug,
}: CategoryViewPageClientProps) {
  const params = useParams();

  const [category, setCategory] = useState<Category | null>(initialCategory);
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
    if (!category) {
      return {
        title: "Category Not Found | BitsBlog",
        description: "The category you're looking for doesn't exist.",
        keywords: "blog, categories",
        canonicalUrl: getAbsoluteUrl("/categories"),
        ogImage: getAbsoluteUrl("/og-default.jpg"),
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

    const canonicalUrl = getAbsoluteUrl(`/category/${slug}`);
    const ogImage = getAbsoluteUrl("/og-categories.jpg");

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
  const breadcrumbSchema = category
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
            name: "Categories",
            item: getAbsoluteUrl("/categories"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: category.name,
            item: seoData.canonicalUrl,
          },
        ],
      }
    : null;

  // CollectionPage structured data
  const collectionSchema = category
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${category.name} Articles`,
        description: seoData.description,
        url: seoData.canonicalUrl,
        numberOfItems: posts.length,
        about: {
          "@type": "Thing",
          name: category.name,
          description:
            category.description || `Articles about ${category.name}`,
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

  if (error || !category) {
    return (
      <>
        <Head>
          <title>Category Not Found | BitsBlog</title>
          <meta name="robots" content="noindex, follow" />
        </Head>

        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-6 py-12 max-w-6xl">
            <div className="border border-neutral-200 p-16 text-center">
              <FolderOpen className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
              <h3 className="text-2xl font-light text-black mb-3">
                {error || "Category Not Found"}
              </h3>
              <p className="text-neutral-600 font-light mb-6">
                The category you're looking for doesn't exist or has been
                removed.
              </p>
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-neutral-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Browse All Categories</span>
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
          content={`${category.name} articles on BitsBlog`}
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content={seoData.ogImage} />
        <meta name="twitter:image:alt" content={`${category.name} articles`} />
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
              <Link
                href="/categories"
                className="hover:text-black transition-colors"
              >
                Categories
              </Link>
              <span>/</span>
              <span className="text-black">{category.name}</span>
            </div>

            <div className="flex items-start gap-6 mb-6">
              <div className="w-16 h-16 bg-neutral-100 flex items-center justify-center shrink-0">
                <FolderOpen className="h-8 w-8 text-neutral-600" />
              </div>

              <div className="flex-1">
                <h1 className="text-5xl md:text-6xl font-light text-black mb-4 leading-tight">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-lg text-neutral-600 font-light max-w-2xl">
                    {category.description}
                  </p>
                )}
              </div>
            </div>

            {/* Category Stats */}
            <div className="flex items-center gap-6 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>
                  {category.posts_count}{" "}
                  {category.posts_count === 1 ? "article" : "articles"}
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(category.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-6xl">
          {/* Back Button */}
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-black transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Categories</span>
          </Link>

          {/* Posts List */}
          {posts.length === 0 ? (
            <div className="border border-neutral-200 p-16 text-center">
              <FileText className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
              <h3 className="text-2xl font-light text-black mb-3">
                No Articles Yet
              </h3>
              <p className="text-neutral-600 font-light">
                There are no published articles in this category yet.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-light text-black">
                  All Articles in {category.name}
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
                          {/* Featured Image */}
                          {post.featured_image && (
                            <div className="md:w-1/3 h-48 md:h-auto overflow-hidden bg-neutral-100 relative min-h-[250px]">
                              <Image
                                src={post.featured_image}
                                alt={post.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 768px) 100vw, 33vw"
                              />
                            </div>
                          )}

                          {/* Content */}
                          <div
                            className={`flex-1 p-6 ${
                              !post.featured_image ? "md:w-full" : ""
                            }`}
                          >
                            <h3 className="text-2xl font-light text-black mb-3 group-hover:text-neutral-700 transition-colors">
                              {post.title}
                            </h3>

                            {post.excerpt && (
                              <p className="text-neutral-600 font-light mb-4 line-clamp-3">
                                {post.excerpt}
                              </p>
                            )}

                            {/* Meta Information */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                              <span>By {getAuthorName(post.author)}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(post.published_at)}</span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{post.views} views</span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>
                                  {post.comments_count}{" "}
                                  {post.comments_count === 1
                                    ? "comment"
                                    : "comments"}
                                </span>
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
                {posts.length === 1 ? "article" : "articles"} in {category.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
