"use client";

import { useEffect, useState } from "react";

import { postAPI } from "@/api/services";
import { type Post } from "@/types";
import { Button } from "@/components/ui/button";
import { Eye, User, MessageSquare, ArrowUpRight } from "lucide-react";
import { NewsletterForm } from "@/components/news-letter-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Head from "next/head";

// Helper function to get absolute URL
const getAbsoluteUrl = (path: string): string => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const router = useRouter();

  useEffect(() => {
    loadPosts();
  }, [page]);

  const loadPosts = async () => {
    try {
      const response = await postAPI.getAll({ page, status: "published" });
      setPosts((prev) =>
        page === 1
          ? response.data.results
          : [...prev, ...response.data.results],
      );
      setHasMore(!!response.data.next);
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // SEO Data
  const pageTitle = "BitsBlog - Nepal's Premier Tech Blog & Best Blogs Directory | Ctrl Bits";
  const pageDescription =
    "Nepal's leading technology blog and blog directory. Discover the best blogs in Nepal, expert web development tutorials, software architecture insights, AI/ML guides, and trusted programming content. Built by experienced developers in Nepal's tech community.";
  const pageUrl = getAbsoluteUrl("/");
  const ogImage = getAbsoluteUrl("/og-home.jpg");
  const keywords =
  const keywords = "BitsBlog, bit blogs, best blogs Nepal, Nepal tech blog, technology blog Nepal, web development Nepal, software engineering blog, programming tutorials Nepal, React tutorials, Django Python, Next.js guides, AI machine learning Nepal, Nepali tech community, expert tech insights, trusted technology blog, Ctrl Bits, full-stack development, software architecture Nepal, Nepal blog directory, bit blogs Nepal";

  // Organization structured data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ctrl Bits",
    url: getAbsoluteUrl("/"),
    logo: getAbsoluteUrl("/logo.png"),
    description:
      "Digital innovation and web development company specializing in modern web applications, AI solutions, and software architecture in Nepal. Empowering Nepal's tech ecosystem through expert content and community building.",
    foundingDate: "2020",
    foundingLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "NP",
        addressLocality: "Kathmandu"
      }
    },
    sameAs: [
      "https://facebook.com/ctrlbits",
      "https://twitter.com/ctrl_bits",
      "https://linkedin.com/company/ctrlbits",
      "https://github.com/ctrlbits",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "hi@ctrlbits.com",
      contactType: "Customer Service",
      availableLanguage: ["English", "Nepali"]
    }
  };

  // Website structured data
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BitsBlog",
    url: pageUrl,
    description: pageDescription,
    publisher: {
      "@type": "Organization",
      name: "Ctrl Bits",
      logo: {
        "@type": "ImageObject",
        url: getAbsoluteUrl("/logo.png"),
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${pageUrl}search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // Blog structured data
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "BitsBlog",
    description: pageDescription,
    url: pageUrl,
    publisher: {
      "@type": "Organization",
      name: "Ctrl Bits",
      logo: {
        "@type": "ImageObject",
        url: getAbsoluteUrl("/logo.png"),
      },
    },
  };

  // ItemList for featured posts (if we have posts)
  const itemListSchema =
    posts.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: posts.slice(0, 10).map((post, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Article",
              "@id": getAbsoluteUrl(`/post/${post.slug}`),
              headline: post.title,
              description: post.excerpt || post.content.substring(0, 200),
              image: post.featured_image
                ? getAbsoluteUrl(post.featured_image)
                : undefined,
              datePublished: post.published_at || post.created_at,
              author: {
                "@type": "Person",
                name: post.author.username,
              },
              url: getAbsoluteUrl(`/post/${post.slug}`),
            },
          })),
        }
      : null;

  if (loading && page === 1) {
    return (
      <>
        <Head>
          <title>{pageTitle}</title>
          <meta name="robots" content="noindex, follow" />
        </Head>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        {/* SEO meta Tags */}
        <title>{pageTitle}</title>

        {/* Basic meta Tags */}
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Ctrl Bits" />

        {/* Canonical Link */}
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content="BitsBlog" />
        <meta property="og:image" content={ogImage} />
        <meta
          property="og:image:alt"
          content="BitsBlog - Technology Insights by Ctrl Bits"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content="BitsBlog Homepage" />
        <meta name="twitter:site" content="@ctrl_bits" />
        <meta name="twitter:creator" content="@ctrlbits" />

        {/* Additional meta Tags */}
        <meta name="theme-color" content="#000000" />
        <meta name="application-name" content="BitsBlog" />
      </Head>

      {/* Structured Data - Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      {/* Structured Data - Website */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />

      {/* Structured Data - Blog */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogSchema),
        }}
      />

      {/* Structured Data - ItemList (Featured Posts) */}
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(itemListSchema),
          }}
        />
      )}

      <div className="min-h-screen bg-white">
        {/* Hero */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-6 py-32 max-w-5xl">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-12 bg-black"></div>
                <span className="text-sm font-medium text-black uppercase tracking-wider">
                  BitsBlog by Ctrl Bits
                </span>
              </div>

              <h1 className="text-6xl md:text-7xl font-light tracking-tight text-black mb-8 leading-[1.1]">
                Where Technology
                <br />
                Meets Insight
              </h1>

              <p className="text-xl md:text-2xl text-neutral-600 font-light mb-6 leading-relaxed">
                Exploring the intersection of code, design, and innovation. Deep
                dives into web development, software architecture, and the
                future of technology.
              </p>

              <p className="text-lg text-neutral-500 font-light mb-12 leading-relaxed">
                Built by developers, for developers. Ctrl Bits brings you
                thoughtful content that mattersâ€”no fluff, just bits of
                knowledge that elevate your craft.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  className="border-black bg-black text-white hover:bg-neutral-800 font-light px-8 h-12 rounded-none"
                  onClick={() => router.push("/articles")}
                >
                  Explore Articles
                </Button>
                <Button
                  variant="outline"
                  className="border-black text-black hover:bg-black hover:text-white font-light px-8 h-12 rounded-none transition-all duration-200"
                  onClick={() => router.push("/about")}
                >
                  About Ctrl Bits
                </Button>
              </div>
              <div className="mt-16">
                <NewsletterForm />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-6 py-16 max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-light text-black mb-2">
                  {posts.length}+
                </div>
                <div className="text-sm text-neutral-500 uppercase tracking-wider">
                  Articles
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-black mb-2">
                  {Math.floor(
                    posts.reduce((sum, post) => sum + post.views, 0) / 1000,
                  )}
                  K+
                </div>
                <div className="text-sm text-neutral-500 uppercase tracking-wider">
                  Readers
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-black mb-2">
                  {
                    new Set(
                      posts.map((post) => post.category?.name).filter(Boolean),
                    ).size
                  }
                  +
                </div>
                <div className="text-sm text-neutral-500 uppercase tracking-wider">
                  Categories
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-black mb-2">
                  {posts.reduce((sum, post) => sum + post.comments_count, 0)}+
                </div>
                <div className="text-sm text-neutral-500 uppercase tracking-wider">
                  Comments
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Post */}
        {posts.length > 0 && (
          <div className="border-b border-neutral-200">
            <div className="container mx-auto px-6 py-16 max-w-5xl">
              <div className="flex items-center gap-3 mb-12">
                <div className="w-1 h-8 bg-black"></div>
                <span className="text-sm font-medium text-black uppercase tracking-wider">
                  Featured
                </span>
              </div>

              <Link
                href={`/post/${posts[0].slug}`}
                className="group grid md:grid-cols-2 gap-12 items-center"
              >
                {posts[0].featured_image && (
                  <div className="overflow-hidden bg-neutral-100 aspect-4/3">
                    <img
                      src={posts[0].featured_image}
                      alt={posts[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {posts[0].category && (
                      <span className="text-xs font-medium text-black uppercase tracking-wider">
                        {posts[0].category.name}
                      </span>
                    )}
                    <span className="text-xs text-neutral-400">â€¢</span>
                    <span className="text-xs text-neutral-500">
                      {formatDate(posts[0].created_at)}
                    </span>
                  </div>

                  <h2 className="text-4xl md:text-5xl font-light text-black mb-6 leading-tight group-hover:text-neutral-700 transition-colors">
                    {posts[0].title}
                  </h2>

                  <p className="text-lg text-neutral-600 font-light mb-6 leading-relaxed">
                    {posts[0].excerpt || posts[0].content.substring(0, 250)}...
                  </p>

                  <div className="flex items-center gap-2 text-sm text-black font-medium">
                    <span>Read Article</span>
                    <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        <div className="container mx-auto px-6 py-16 max-w-5xl">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-1 h-8 bg-black"></div>
            <span className="text-sm font-medium text-black uppercase tracking-wider">
              All Posts
            </span>
          </div>

          <div className="space-y-1">
            {posts.slice(1).map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.slug}`}
                className="group block border-b border-neutral-200 last:border-b-0 hover:bg-neutral-50 transition-colors duration-200"
              >
                <div className="py-10 flex gap-8 items-start">
                  {/* Image */}
                  {post.featured_image && (
                    <div className="hidden md:block w-48 h-48 shrink-0 overflow-hidden bg-neutral-100">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      {post.category && (
                        <span className="text-xs font-medium text-black uppercase tracking-wider">
                          {post.category.name}
                        </span>
                      )}
                      <span className="text-xs text-neutral-400">â€¢</span>
                      <span className="text-xs text-neutral-500">
                        {formatDate(post.created_at)}
                      </span>
                    </div>

                    <h2 className="text-3xl font-light text-black mb-3 leading-snug group-hover:text-neutral-700 transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-neutral-600 font-light line-clamp-3 mb-4 leading-relaxed">
                      {post.excerpt || post.content.substring(0, 200)}...
                    </p>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag.id}
                            className="text-xs text-neutral-500 border border-neutral-300 px-2 py-1 hover:border-black hover:text-black transition-colors"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* meta */}
                    <div className="flex items-center gap-6 text-xs text-neutral-500">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5" />
                        <span>{post.author.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{post.comments_count}</span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:flex items-center justify-center w-10 h-10 shrink-0">
                    <ArrowUpRight className="h-5 w-5 text-neutral-400 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Newsletter CTA */}
          <div className="mt-20 pt-16 border-t border-neutral-200">
            <NewsletterForm variant="modal" />
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-16 pt-8 border-t border-neutral-200">
              <Button
                onClick={() => setPage((p) => p + 1)}
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white font-light px-8 h-12 rounded-none transition-all duration-200"
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="border-t border-neutral-200 bg-neutral-50">
          <div className="container mx-auto px-6 py-20 max-w-5xl">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-light text-black mb-6 leading-tight">
                Ready to dive deeper?
              </h2>
              <p className="text-lg text-neutral-600 font-light mb-8 leading-relaxed">
                Explore our archive of articles, tutorials, and insights across
                various topics
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  variant="outline"
                  className="border-black bg-black text-white hover:bg-neutral-800 font-light px-8 h-12 rounded-none"
                  onClick={() => router.push("/categories")}
                >
                  Browse All Categories
                </Button>
                <Button
                  variant="outline"
                  className="border-black text-black hover:bg-black hover:text-white font-light px-8 h-12 rounded-none transition-all duration-200"
                  onClick={() => router.push("/archives")}
                >
                  View Archive
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
