"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Calendar,
  Eye,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Search,
  Grid,
  List,
  User,
  FolderOpen,
  Tag,
} from "lucide-react";
import api from "@/api/axios";

/**
 * Type definitions
 */
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
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Post[];
}

type ViewMode = "grid" | "list";
type SortOption = "-created_at" | "-published_at" | "-views" | "title";

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

export default function ArticlesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "",
  );
  const [selectedTag, setSelectedTag] = useState<string>(
    searchParams.get("tag") || "",
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "-published_at",
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1"),
  );

  const pageSize = 12;

  /**
   * Update URL params when filters change
   */
  const updateURLParams = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // Remove default values
    if (params.get("sort") === "-published_at") params.delete("sort");
    if (params.get("page") === "1") params.delete("page");

    const queryString = params.toString();
    router.push(`/articles${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };

  /**
   * Load categories and tags for filters
   */
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          api.get("/api/categories/"),
          api.get("/api/tags/"),
        ]);

        const rawCategories: any = categoriesRes.data;
        const rawTags: any = tagsRes.data;

        const categoriesData: Category[] = Array.isArray(rawCategories)
          ? rawCategories
          : (rawCategories && (rawCategories.results ?? rawCategories.items)) ||
            [];

        const tagsData: Tag[] = Array.isArray(rawTags)
          ? rawTags
          : (rawTags && (rawTags.results ?? rawTags.items)) || [];

        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        console.error("Failed to load filters:", error);
      }
    };
    loadFilters();
  }, []);

  /**
   * Load posts based on current filters
   */
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const params: any = {
          page: currentPage,
          page_size: pageSize,
          ordering: sortBy,
          status: "published",
        };

        if (searchTerm) {
          params.search = searchTerm;
        }
        if (selectedCategory) {
          params.category__slug = selectedCategory;
        }
        if (selectedTag) {
          params.tags__slug = selectedTag;
        }

        console.log("Loading posts with params:", params);

        const response = await api.get<PaginatedResponse>("/api/posts/", {
          params,
        });

        setPosts(response.data.results);
        setTotalCount(response.data.count);

        console.log("Posts loaded:", response.data);
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [currentPage, sortBy, searchTerm, selectedCategory, selectedTag]);

  /**
   * Update URL params when filters change
   */
  useEffect(() => {
    updateURLParams({
      search: searchTerm || null,
      category: selectedCategory || null,
      tag: selectedTag || null,
      sort: sortBy !== "-published_at" ? sortBy : null,
      page: currentPage > 1 ? currentPage : null,
    });
  }, [searchTerm, selectedCategory, selectedTag, sortBy, currentPage]);

  /**
   * Format date string
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedTag("");
    setSortBy("-published_at");
    setCurrentPage(1);
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters =
    searchTerm || selectedCategory || selectedTag || sortBy !== "-published_at";

  /**
   * Calculate pagination
   */
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  /**
   * Get sort label
   */
  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case "-published_at":
        return "Latest First";
      case "-created_at":
        return "Recently Created";
      case "-views":
        return "Most Viewed";
      case "title":
        return "Title (A-Z)";
      default:
        return "Sort By";
    }
  };

  // Generate dynamic SEO data
  const generateSEOData = () => {
    const categoryName = selectedCategory
      ? categories.find((c) => c.slug === selectedCategory)?.name
      : null;
    const tagName = selectedTag
      ? tags.find((t) => t.slug === selectedTag)?.name
      : null;

    // Dynamic title
    let title = "All Articles";
    if (searchTerm) {
      title = `Search: "${searchTerm}"`;
    } else if (categoryName && tagName) {
      title = `${categoryName} - ${tagName} Articles`;
    } else if (categoryName) {
      title = `${categoryName} Articles`;
    } else if (tagName) {
      title = `${tagName} Articles`;
    }

    if (currentPage > 1) {
      title += ` - Page ${currentPage}`;
    }
    title += " | BitsBlog";

    // Dynamic description
    let description = "";
    if (searchTerm) {
      description = `Search results for "${searchTerm}" on BitsBlog. Found ${totalCount} article${
        totalCount !== 1 ? "s" : ""
      } matching your search.`;
    } else if (categoryName && tagName) {
      description = `Explore ${totalCount} article${
        totalCount !== 1 ? "s" : ""
      } about ${categoryName} tagged with ${tagName}. Technology insights, tutorials, and updates.`;
    } else if (categoryName) {
      description = `Browse ${totalCount} article${
        totalCount !== 1 ? "s" : ""
      } in ${categoryName} category. Latest technology news, guides, and expert insights.`;
    } else if (tagName) {
      description = `Discover ${totalCount} article${
        totalCount !== 1 ? "s" : ""
      } tagged with ${tagName}. In-depth content on web development, AI, and tech innovation.`;
    } else {
      description = `Browse our complete collection of ${totalCount} technology articles. Explore tutorials, guides, and insights on web development, AI, software engineering, and more.`;
    }

    // Dynamic keywords
    let keywords =
      "tech blog, technology articles, web development, software engineering, programming";
    if (categoryName) {
      keywords = `${categoryName}, ${categoryName} articles, ${keywords}`;
    }
    if (tagName) {
      keywords = `${tagName}, ${tagName} tutorials, ${keywords}`;
    }
    if (searchTerm) {
      keywords = `${searchTerm}, ${keywords}`;
    }

    // Canonical URL (always without query params for SEO)
    const canonicalUrl = getAbsoluteUrl("/articles");

    // Current URL (with query params)
    const currentUrl = getAbsoluteUrl(
      `/articles${typeof window !== "undefined" ? window.location.search : ""}`,
    );

    const ogImage = getAbsoluteUrl("/og-articles.jpg");

    return {
      title,
      description,
      keywords,
      canonicalUrl,
      currentUrl,
      ogImage,
    };
  };

  const seoData = generateSEOData();

  // Breadcrumb structured data
  const breadcrumbSchema = {
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
        name: "Articles",
        item: seoData.canonicalUrl,
      },
    ],
  };

  // CollectionPage structured data
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "BitsBlog Articles",
    description: seoData.description,
    url: seoData.canonicalUrl,
    numberOfItems: totalCount,
    publisher: {
      "@type": "Organization",
      name: "Ctrl Bits",
      logo: {
        "@type": "ImageObject",
        url: getAbsoluteUrl("/logo.png"),
      },
    },
  };

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
            url: getAbsoluteUrl(`/post/${post.slug}`),
          })),
        }
      : null;

  if (loading && posts.length === 0) {
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

  return (
    <>
      {/* SEO Meta Tags */}
      <Head>
        <title>{seoData.title}</title>

        {/* Basic Meta Tags */}
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        <meta
          name="robots"
          content={currentPage > 1 ? "noindex, follow" : "index, follow"}
        />

        {/* Canonical Link - always point to page without filters */}
        <link rel="canonical" href={seoData.canonicalUrl} />

        {/* Pagination */}
        {currentPage > 1 && (
          <link
            rel="prev"
            href={`${seoData.canonicalUrl}?page=${currentPage - 1}`}
          />
        )}
        {currentPage < totalPages && (
          <link
            rel="next"
            href={`${seoData.canonicalUrl}?page=${currentPage + 1}`}
          />
        )}

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:url" content={seoData.currentUrl} />
        <meta property="og:site_name" content="BitsBlog" />
        <meta property="og:image" content={seoData.ogImage} />
        <meta property="og:image:alt" content="BitsBlog Articles" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content={seoData.ogImage} />
        <meta name="twitter:image:alt" content="BitsBlog Articles" />
        <meta name="twitter:site" content="@ctrl_bits" />

        {/* Structured Data - Breadcrumb */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />

        {/* Structured Data - CollectionPage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(collectionSchema),
          }}
        />

        {/* Structured Data - ItemList (for posts) */}
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
        <div className="border-b border-neutral-200 bg-white">
          <div className="container mx-auto px-6 py-16 max-w-5xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-16 bg-black"></div>
              <div>
                <h1 className="text-4xl md:text-5xl font-light text-black mb-2">
                  All Articles
                </h1>
                <p className="text-neutral-600 font-light">
                  Browse our complete collection of {totalCount} articles
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-5xl">
          {/* Controls Bar */}
          <div className="mb-8 space-y-4">
            {/* Top Row: Search and View Toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 focus:outline-none focus:border-black transition-colors font-light"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 border ${
                    showFilters || hasActiveFilters
                      ? "border-black bg-black text-white"
                      : "border-neutral-200 hover:border-black"
                  } transition-colors font-light`}
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {hasActiveFilters && !showFilters && (
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                  )}
                </button>

                <div className="flex items-center border border-neutral-200">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 ${
                      viewMode === "grid"
                        ? "bg-black text-white"
                        : "bg-white text-neutral-600 hover:bg-neutral-50"
                    } transition-colors`}
                    aria-label="Grid view"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 ${
                      viewMode === "list"
                        ? "bg-black text-white"
                        : "bg-white text-neutral-600 hover:bg-neutral-50"
                    } transition-colors`}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="border border-neutral-200 p-6 bg-neutral-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value as SortOption);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2.5 border border-neutral-200 bg-white focus:outline-none focus:border-black font-light"
                    >
                      <option value="-published_at">Latest First</option>
                      <option value="-created_at">Recently Created</option>
                      <option value="-views">Most Viewed</option>
                      <option value="title">Title (A-Z)</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2.5 border border-neutral-200 bg-white focus:outline-none focus:border-black font-light"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tag Filter */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Tag
                    </label>
                    <select
                      value={selectedTag}
                      onChange={(e) => {
                        setSelectedTag(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2.5 border border-neutral-200 bg-white focus:outline-none focus:border-black font-light"
                    >
                      <option value="">All Tags</option>
                      {tags.map((tag) => (
                        <option key={tag.id} value={tag.slug}>
                          {tag.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      disabled={!hasActiveFilters}
                      className="w-full px-4 py-2.5 border border-neutral-200 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-light"
                    >
                      <X className="h-4 w-4" />
                      <span>Clear All</span>
                    </button>
                  </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <div className="mt-4 pt-4 border-t border-neutral-300">
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <span className="text-neutral-600 font-light">
                        Active filters:
                      </span>
                      {searchTerm && (
                        <span className="px-2 py-1 bg-black text-white text-xs font-light">
                          Search: "{searchTerm}"
                        </span>
                      )}
                      {selectedCategory && (
                        <span className="px-2 py-1 bg-black text-white text-xs font-light">
                          Category:{" "}
                          {
                            categories.find((c) => c.slug === selectedCategory)
                              ?.name
                          }
                        </span>
                      )}
                      {selectedTag && (
                        <span className="px-2 py-1 bg-black text-white text-xs font-light">
                          Tag: {tags.find((t) => t.slug === selectedTag)?.name}
                        </span>
                      )}
                      {sortBy !== "-published_at" && (
                        <span className="px-2 py-1 bg-black text-white text-xs font-light">
                          {getSortLabel(sortBy)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Results Info */}
            <div className="flex items-center justify-between text-sm text-neutral-600 font-light">
              <span>
                Showing {posts.length > 0 ? startIndex : 0} - {endIndex} of{" "}
                {totalCount} articles
              </span>
              {totalPages > 1 && (
                <span>
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>
          </div>

          {/* Posts Display */}
          {posts.length === 0 ? (
            <div className="border border-neutral-200 p-16 text-center">
              <FileText className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
              <h3 className="text-2xl font-light text-black mb-3">
                No Articles Found
              </h3>
              <p className="text-neutral-600 font-light mb-6">
                {hasActiveFilters
                  ? "No articles match your current filters. Try adjusting your search criteria."
                  : "There are no published articles yet."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-black text-white hover:bg-neutral-800 transition-colors font-light"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.slug}`}
                      className="group block"
                    >
                      <article className="border border-neutral-200 hover:border-black transition-all h-full flex flex-col">
                        {/* Featured Image */}
                        {post.featured_image && (
                          <div className="h-48 overflow-hidden bg-neutral-100 relative">
                            <Image
                              src={post.featured_image}
                              alt={post.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col">
                          {/* Category & Tags */}
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            {post.category && (
                              <span className="text-xs text-neutral-500 font-light">
                                {post.category.name}
                              </span>
                            )}
                            {post.tags.length > 0 && (
                              <>
                                {post.category && (
                                  <span className="text-neutral-300">•</span>
                                )}
                                <span className="text-xs text-neutral-500 font-light">
                                  {post.tags[0].name}
                                  {post.tags.length > 1 &&
                                    ` +${post.tags.length - 1}`}
                                </span>
                              </>
                            )}
                          </div>

                          <h3 className="text-lg font-light text-black mb-2 group-hover:underline line-clamp-2">
                            {post.title}
                          </h3>

                          {post.excerpt && (
                            <p className="text-sm text-neutral-600 font-light mb-4 line-clamp-3 flex-1">
                              {post.excerpt}
                            </p>
                          )}

                          {/* Meta */}
                          <div className="flex items-center gap-2 text-xs text-neutral-500 font-light pt-3 border-t border-neutral-100">
                            <span className="line-clamp-1">
                              {getAuthorName(post.author)}
                            </span>
                            <span className="text-neutral-300">•</span>
                            <span>{formatDate(post.published_at)}</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="space-y-6 mb-12">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.slug}`}
                      className="group block"
                    >
                      <article className="border border-neutral-200 hover:border-black transition-all">
                        <div className="flex flex-col md:flex-row">
                          {/* Featured Image */}
                          {post.featured_image && (
                            <div className="md:w-1/3 h-56 md:h-auto overflow-hidden bg-neutral-100 relative">
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
                            {/* Category & Tags */}
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                              {post.category && (
                                <Link
                                  href={`/categories/${post.category.slug}`}
                                  className="text-xs text-neutral-500 hover:text-black font-light"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FolderOpen className="h-3 w-3 inline mr-1" />
                                  {post.category.name}
                                </Link>
                              )}
                              {post.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag.id}
                                  className="text-xs text-neutral-500 font-light"
                                >
                                  <Tag className="h-3 w-3 inline mr-1" />
                                  {tag.name}
                                </span>
                              ))}
                            </div>

                            <h3 className="text-2xl font-light text-black mb-3 group-hover:underline">
                              {post.title}
                            </h3>

                            {post.excerpt && (
                              <p className="text-neutral-600 font-light mb-4 line-clamp-2">
                                {post.excerpt}
                              </p>
                            )}

                            {/* Meta Information */}
                            <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500 font-light">
                              <div className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" />
                                <span>{getAuthorName(post.author)}</span>
                              </div>
                              <span className="text-neutral-300">•</span>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{formatDate(post.published_at)}</span>
                              </div>
                              <span className="text-neutral-300">•</span>
                              <div className="flex items-center gap-1.5">
                                <Eye className="h-3.5 w-3.5" />
                                <span>{post.views}</span>
                              </div>
                              <span className="text-neutral-300">•</span>
                              <div className="flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>{post.comments_count}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-neutral-200 pt-8">
                  {/* Previous Button */}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 hover:border-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-neutral-200 transition-colors font-light"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Show first, last, current, and 2 pages around current
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center gap-2">
                          {/* Show ellipsis if there's a gap */}
                          {index > 0 && page - array[index - 1] > 1 && (
                            <span className="text-neutral-400">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 border ${
                              currentPage === page
                                ? "border-black bg-black text-white"
                                : "border-neutral-200 hover:border-black"
                            } transition-colors font-light`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 hover:border-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-neutral-200 transition-colors font-light"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
