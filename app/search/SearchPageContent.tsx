"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";
import { postAPI, categoryAPI, tagAPI } from "../../api/services";
import { type Post, type Category, type Tag } from "../../types";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Search as SearchIcon,
  X,
  Calendar,
  Eye,
  MessageSquare,
  Filter,
  Loader2,
  FileText,
  Tag as TagIcon,
  Folder,
  ArrowUpDown,
} from "lucide-react";

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

export default function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params for persistence
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "all",
  );
  const [selectedTag, setSelectedTag] = useState<string>(
    searchParams.get("tag") || "all",
  );
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sort") || "recent",
  );

  useEffect(() => {
    loadCategories();
    loadTags();
    // If URL has any query params, perform search on load
    const hasParams =
      searchParams.get("q") ||
      searchParams.get("category") ||
      searchParams.get("tag") ||
      searchParams.get("sort");
    if (hasParams) {
      performSearch();
    }
  }, []);

  // Re-sync state when URL changes (browser back/forward)
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const cat = searchParams.get("category") || "all";
    const tag = searchParams.get("tag") || "all";
    const sort = searchParams.get("sort") || "recent";
    setSearchQuery(q);
    setSelectedCategory(cat);
    setSelectedTag(tag);
    setSortBy(sort);
  }, [searchParams]);

  // Auto-search when filters/sort change (only if already searched)
  useEffect(() => {
    if (hasSearched) {
      performSearch();
      updateURLParams();
    }
  }, [selectedCategory, selectedTag, sortBy]);

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      const raw: any = response.data;
      const categoriesData: Category[] = Array.isArray(raw)
        ? raw
        : (raw && (raw.results ?? raw.items)) || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadTags = async () => {
    try {
      const response = await tagAPI.getAll();
      const raw: any = response.data;
      const tagsData: Tag[] = Array.isArray(raw)
        ? raw
        : (raw && (raw.results ?? raw.items)) || [];
      setTags(tagsData);
    } catch (error) {
      console.error("Failed to load tags:", error);
    }
  };

  const getOrderingParam = (sortOption: string): string => {
    const sortMap: Record<string, string> = {
      recent: "-created_at",
      oldest: "created_at",
      popular: "-views",
      "title-asc": "title",
      "title-desc": "-title",
    };
    return sortMap[sortOption] || "-created_at";
  };

  const performSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const params: Record<string, any> = {
        status: "published",
      };

      // Add search query
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      // Add category filter
      if (selectedCategory && selectedCategory !== "all") {
        params.category__slug = selectedCategory;
      }

      // Add tag filter
      if (selectedTag && selectedTag !== "all") {
        params.tags__slug = selectedTag;
      }

      // Add ordering/sorting - SEND TO BACKEND
      params.ordering = getOrderingParam(sortBy);

      console.log("Search params being sent to backend:", params);

      const response = await postAPI.getAll(params);
      const results = response.data.results || response.data;
      setPosts(Array.isArray(results) ? results : []);
      console.log(`Found ${results.length} posts`);
    } catch (error) {
      console.error("Search failed:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateURLParams = () => {
    const params = new URLSearchParams();
    if (searchQuery && searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    if (selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }
    if (selectedTag !== "all") {
      params.set("tag", selectedTag);
    }
    if (sortBy !== "recent") {
      params.set("sort", sortBy);
    }

    const queryString = params.toString();
    router.push(`/search${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURLParams();
    performSearch();
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedTag("all");
    setSortBy("recent");
    router.push("/search", { scroll: false });
    setPosts([]);
    setHasSearched(false);
  };

  const removeFilter = (filterType: "query" | "category" | "tag") => {
    if (filterType === "query") {
      setSearchQuery("");
    } else if (filterType === "category") {
      setSelectedCategory("all");
    } else if (filterType === "tag") {
      setSelectedTag("all");
    }
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== "all" || selectedTag !== "all";

  const getSortLabel = (sortValue: string): string => {
    const labels: Record<string, string> = {
      recent: "Most Recent",
      oldest: "Oldest First",
      popular: "Most Popular",
      "title-asc": "Title (A-Z)",
      "title-desc": "Title (Z-A)",
    };
    return labels[sortValue] || "Most Recent";
  };

  // Generate dynamic SEO data
  const generateSEOData = () => {
    const categoryName =
      selectedCategory !== "all"
        ? categories.find((c) => c.slug === selectedCategory)?.name
        : null;
    const tagName =
      selectedTag !== "all"
        ? tags.find((t) => t.slug === selectedTag)?.name
        : null;

    let title = "Search";
    let description =
      "Search through our collection of expert technology articles, tutorials, web development guides, AI insights, and programming content from Nepal's leading tech blog.";

    if (hasSearched) {
      if (searchQuery) {
        title = `Search: "${searchQuery}" | BitsBlog Nepal`;
        description = `Search results for "${searchQuery}" on BitsBlog Nepal. Found ${
          posts.length
        } expert article${posts.length !== 1 ? "s" : ""} matching your query on web development, AI/ML, programming, and software engineering.`;
      } else if (categoryName && tagName) {
        title = `${categoryName} - ${tagName} Articles | BitsBlog Nepal`;
        description = `Browse ${posts.length} expert article${
          posts.length !== 1 ? "s" : ""
        } in ${categoryName} category tagged with ${tagName} from Nepal's trusted tech blog.`;
      } else if (categoryName) {
        title = `${categoryName} Articles | BitsBlog Nepal`;
        description = `Explore ${posts.length} expert article${
          posts.length !== 1 ? "s" : ""
        } in ${categoryName} category covering web development, programming, and technology.`;
      } else if (tagName) {
        title = `${tagName} Articles | BitsBlog Nepal`;
        description = `Discover ${posts.length} expert article${
          posts.length !== 1 ? "s" : ""
        } tagged with ${tagName} on BitsBlog Nepal.`;
      } else {
        title = "All Technology Articles | BitsBlog Nepal";
        description = `Browse ${posts.length} published expert article${
          posts.length !== 1 ? "s" : ""
        } on BitsBlog Nepal covering web development, AI, programming, and software engineering.`;
      }
    }

    if (!hasSearched) {
      title = "Search Technology Articles - Find Tech Tutorials & Guides | BitsBlog Nepal";
    }

    const keywords = [
      "search tech articles Nepal",
      "bit blogs",
      "find blog posts",
      "search technology content",
      searchQuery,
      categoryName,
      tagName,
      "tech blog search",
      "bit blogs search",
      "programming tutorials search",
      "web development articles",
      "AI guides Nepal",
      "find tutorials",
      "search programming content"
    ]
      .filter(Boolean)
      .join(", ");

    const canonicalUrl = getAbsoluteUrl("/search");
    const ogImage = getAbsoluteUrl("/og-search.jpg");

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
        name: "Search",
        item: seoData.canonicalUrl,
      },
    ],
  };

  // SearchResultsPage structured data
  const searchResultsSchema =
    hasSearched && posts.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "SearchResultsPage",
          name: seoData.title,
          url: getAbsoluteUrl(
            `/search${
              typeof window !== "undefined" ? window.location.search : ""
            }`,
          ),
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: posts.length,
            itemListElement: posts.map((post, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Article",
                "@id": getAbsoluteUrl(`/post/${post.slug}`),
                headline: post.title,
                description: post.excerpt || post.content.substring(0, 200),
                url: getAbsoluteUrl(`/post/${post.slug}`),
                image: post.featured_image
                  ? getAbsoluteUrl(post.featured_image)
                  : undefined,
                datePublished: post.published_at || post.created_at,
                author: {
                  "@type": "Person",
                  name: post.author.username,
                },
              },
            })),
          },
        }
      : null;

  return (
    <>
      <Head>
        {/* SEO meta Tags */}
        <title>{seoData.title}</title>

        {/* Basic meta Tags */}
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        {/* Prevent indexing of search result pages to avoid duplicate content */}
        <meta name="robots" content="noindex, follow" />

        {/* Canonical Link - always point to clean search page */}
        <link rel="canonical" href={seoData.canonicalUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:url" content={seoData.canonicalUrl} />
        <meta property="og:site_name" content="BitsBlog" />
        <meta property="og:image" content={seoData.ogImage} />
        <meta property="og:image:alt" content="BitsBlog Search" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content={seoData.ogImage} />
        <meta name="twitter:image:alt" content="BitsBlog Search" />
        <meta name="twitter:site" content="@ctrl_bits" />
      </Head>

      {/* Structured Data - Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      {/* Structured Data - SearchResultsPage */}
      {searchResultsSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(searchResultsSchema),
          }}
        />
      )}

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-neutral-200 bg-neutral-50">
          <div className="container mx-auto px-6 py-12 max-w-6xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-12 bg-black"></div>
              <span className="text-sm font-medium text-black uppercase tracking-wider">
                Search & Discover
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-light text-black mb-4 leading-tight">
              Find Your Content
            </h1>
            <p className="text-lg text-neutral-600 font-light">
              Search through our collection of articles and posts
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-6xl">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search Input */}
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-12 border-neutral-300 focus:border-black rounded-none h-14 font-light text-lg"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Search Button */}
              <Button
                type="submit"
                disabled={loading}
                className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-14 px-8 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <SearchIcon className="h-5 w-5 mr-2" />
                    Search
                  </>
                )}
              </Button>

              {/* Clear Search Button */}
              {hasSearched && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearSearch}
                  className="border-neutral-300 hover:border-red-500 hover:text-red-600 hover:bg-red-50 font-light rounded-none h-14 px-6 transition-colors"
                >
                  <X className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
              )}
            </div>

            {/* Filters and Sorting */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Category Filter */}
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="border-neutral-300 focus:border-black rounded-none h-12 font-light">
                  <Folder className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Tag Filter */}
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="border-neutral-300 focus:border-black rounded-none h-12 font-light">
                  <TagIcon className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tag" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="all">All Tags</SelectItem>
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.slug}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Options */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-neutral-300 focus:border-black rounded-none h-12 font-light">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter Summary */}
              <div className="border border-neutral-200 px-4 h-12 flex items-center justify-center text-sm text-neutral-500 font-light">
                <Filter className="h-4 w-4 mr-2" />
                {hasActiveFilters ? (
                  <span>
                    {[
                      searchQuery && "Query",
                      selectedCategory !== "all" && "Category",
                      selectedTag !== "all" && "Tag",
                    ]
                      .filter(Boolean)
                      .join(" + ")}
                  </span>
                ) : (
                  <span>No Filters</span>
                )}
              </div>
            </div>
          </form>

          {/* Active Filters Display */}
          {hasSearched && hasActiveFilters && (
            <div className="mb-8 flex flex-wrap items-center gap-2">
              <span className="text-sm text-neutral-500 font-light">
                Active filters:
              </span>
              {searchQuery && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 border border-neutral-300 text-sm">
                  <SearchIcon className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="font-medium">"{searchQuery}"</span>
                  <button
                    type="button"
                    onClick={() => removeFilter("query")}
                    className="text-neutral-400 hover:text-black ml-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {selectedCategory !== "all" && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 border border-neutral-300 text-sm">
                  <Folder className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="font-medium">
                    {categories.find((c) => c.slug === selectedCategory)?.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFilter("category")}
                    className="text-neutral-400 hover:text-black ml-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {selectedTag !== "all" && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 border border-neutral-300 text-sm">
                  <TagIcon className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="font-medium">
                    {tags.find((t) => t.slug === selectedTag)?.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFilter("tag")}
                    className="text-neutral-400 hover:text-black ml-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500 font-light">Searching...</p>
              </div>
            </div>
          ) : hasSearched ? (
            posts.length > 0 ? (
              <>
                <div className="mb-6 flex items-center justify-between border-b border-neutral-200 pb-4">
                  <p className="text-sm text-neutral-500 font-light">
                    Found {posts.length}{" "}
                    {posts.length === 1 ? "result" : "results"}
                  </p>
                  <p className="text-xs text-neutral-400 font-light">
                    Sorted by: {getSortLabel(sortBy)}
                  </p>
                </div>

                <div className="space-y-1">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.slug}`}
                      className="block border-b border-neutral-200 last:border-b-0 hover:bg-neutral-50 transition-colors group"
                    >
                      <div className="py-6 flex items-start gap-6">
                        {post.featured_image && (
                          <div className="hidden md:block w-48 h-32 shrink-0 overflow-hidden border border-neutral-200">
                            <img
                              src={post.featured_image}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            {post.category && (
                              <span className="text-xs text-neutral-500 border border-neutral-300 px-3 py-1 uppercase tracking-wider">
                                {post.category.name}
                              </span>
                            )}
                            {post.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag.id}
                                className="text-xs text-neutral-400 border border-neutral-200 px-2 py-1"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                          <h2 className="text-2xl font-light text-black mb-2 group-hover:text-neutral-700 transition-colors">
                            {post.title}
                          </h2>
                          <p className="text-neutral-600 font-light text-sm line-clamp-2 mb-4 leading-relaxed">
                            {post.excerpt || post.content.substring(0, 200)}...
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                            <div className="flex items-center gap-2">
                              <Eye className="h-3.5 w-3.5" />
                              <span>{post.views} views</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>{post.comments_count} comments</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>
                                {new Date(post.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="border border-neutral-200 p-16 text-center">
                <div className="max-w-md mx-auto">
                  <FileText className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-light text-black mb-3">
                    No Results Found
                  </h3>
                  <p className="text-neutral-600 font-light mb-8">
                    We couldn't find any posts matching your search criteria.
                    Try adjusting your filters or search terms.
                  </p>
                  <Button
                    onClick={clearSearch}
                    className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8"
                  >
                    Clear Search
                  </Button>
                </div>
              </div>
            )
          ) : (
            <div className="border border-neutral-200 p-16 text-center">
              <div className="max-w-md mx-auto">
                <SearchIcon className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
                <h3 className="text-2xl font-light text-black mb-3">
                  Start Searching
                </h3>
                <p className="text-neutral-600 font-light mb-4">
                  Enter keywords, select filters, or both to find articles
                </p>
                <div className="flex flex-wrap gap-2 justify-center text-sm text-neutral-500">
                  <span className="px-3 py-1 border border-neutral-200">
                    Search by keyword
                  </span>
                  <span className="px-3 py-1 border border-neutral-200">
                    Filter by category
                  </span>
                  <span className="px-3 py-1 border border-neutral-200">
                    Filter by tag
                  </span>
                  <span className="px-3 py-1 border border-neutral-200">
                    Sort results
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
