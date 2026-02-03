"use client";

import { useState, useEffect } from "react";

import {
  FolderOpen,
  FileText,
  ChevronRight,
  Grid,
  List,
  Search,
} from "lucide-react";
import api from "../../api/axios";
import Head from "next/head";
import Link from "next/link";

/**
 * Type definition for Category
 */
interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  posts_count: number;
}

type ViewMode = "grid" | "list";

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

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * Load all categories from the API
   */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/categories/");
        const raw: any = response.data;
        const categoriesData: Category[] = Array.isArray(raw)
          ? raw
          : (raw && (raw.results ?? raw.items)) || [];
        setCategories(categoriesData);
        console.log("Categories loaded:", categoriesData);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  /**
   * Filter categories based on search term
   */
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  /**
   * Calculate total posts across all categories
   */
  const totalPosts = categories.reduce((sum, cat) => sum + cat.posts_count, 0);

  // SEO Data
  const pageTitle = searchTerm
    ? `Search: "${searchTerm}" in Categories | BitsBlog Nepal`
    : "Browse All Tech Categories - Web Development, AI, Programming | BitsBlog Nepal";

  const pageDescription = searchTerm
    ? `Search results for "${searchTerm}" in categories. Found ${
        filteredCategories.length
      } matching ${
        filteredCategories.length === 1 ? "category" : "categories"
      }.`
    : `Browse technology articles by category. Explore ${categories.length} topic ${
        categories.length === 1 ? "category" : "categories"
      } covering web development, AI/ML, software engineering, programming tutorials, React, Django, and more from Nepal's leading tech blog. ${totalPosts} total expert articles.`;

  const pageUrl = getAbsoluteUrl("/categories");
  const ogImage = getAbsoluteUrl("/og-categories.jpg");

  // Get top categories for keywords
  const topCategories = [...categories]
    .sort((a, b) => b.posts_count - a.posts_count)
    .slice(0, 5)
    .map((c) => c.name)
    .join(", ");

  const keywords = searchTerm
    ? `${searchTerm}, blog categories Nepal, bit blogs, article topics, tech categories, ${topCategories}`
    : `blog categories, bit blogs, tech categories Nepal, article topics, programming categories Nepal, web development topics, AI categories, software engineering, technology topics Nepal, ${topCategories}, web development, AI, programming tutorials, React, Django, Next.js, Python, JavaScript, bit blogs categories`;

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
        name: "Categories",
        item: pageUrl,
      },
    ],
  };

  // CollectionPage structured data
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Blog Categories",
    description: pageDescription,
    url: pageUrl,
    numberOfItems: categories.length,
    publisher: {
      "@type": "Organization",
      name: "Ctrl Bits",
      logo: {
        "@type": "ImageObject",
        url: getAbsoluteUrl("/logo.png"),
      },
    },
  };

  // ItemList structured data for categories
  const itemListSchema =
    categories.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          numberOfItems: categories.length,
          itemListElement: categories.map((category, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Thing",
              "@id": getAbsoluteUrl(`/categories/${category.slug}`),
              name: category.name,
              description:
                category.description || `Articles about ${category.name}`,
              url: getAbsoluteUrl(`/categories/${category.slug}`),
            },
          })),
        }
      : null;

  if (loading) {
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
      {/* SEO Meta Tags */}
      <Head>
        <title>{pageTitle}</title>

        {/* Basic Meta Tags */}
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />

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
          content="BitsBlog Categories - Browse by topic"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content="BitsBlog Categories" />
        <meta name="twitter:site" content="@ctrl_bits" />

        {/* Structured Data - Breadcrumb */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>

        {/* Structured Data - CollectionPage */}
        <script type="application/ld+json">
          {JSON.stringify(collectionSchema)}
        </script>

        {/* Structured Data - ItemList (categories) */}
        {itemListSchema && (
          <script type="application/ld+json">
            {JSON.stringify(itemListSchema)}
          </script>
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
                  Categories
                </h1>
                <p className="text-neutral-600 font-light">
                  Browse articles by topic
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-5xl">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 focus:outline-none focus:border-black transition-colors font-light"
              />
            </div>

            {/* View Mode Toggle */}
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

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div className="border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center">
                  <FolderOpen className="h-5 w-5 text-neutral-600" />
                </div>
              </div>
              <div className="text-3xl font-light text-black mb-1">
                {categories.length}
              </div>
              <div className="text-sm text-neutral-500 font-light">
                Total Categories
              </div>
            </div>

            <div className="border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-neutral-600" />
                </div>
              </div>
              <div className="text-3xl font-light text-black mb-1">
                {totalPosts}
              </div>
              <div className="text-sm text-neutral-500 font-light">
                Total Articles
              </div>
            </div>

            <div className="border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-neutral-600" />
                </div>
              </div>
              <div className="text-3xl font-light text-black mb-1">
                {categories.length > 0
                  ? Math.round(totalPosts / categories.length)
                  : 0}
              </div>
              <div className="text-sm text-neutral-500 font-light">
                Avg. per Category
              </div>
            </div>
          </div>

          {/* Categories Display */}
          {filteredCategories.length === 0 ? (
            <div className="border border-neutral-200 p-16 text-center">
              <FolderOpen className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
              <h3 className="text-2xl font-light text-black mb-3">
                {searchTerm ? "No Categories Found" : "No Categories Yet"}
              </h3>
              <p className="text-neutral-600 font-light mb-6">
                {searchTerm
                  ? `No categories match "${searchTerm}". Try a different search.`
                  : "Categories will appear here once they are created."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-6 py-3 bg-black text-white hover:bg-neutral-800 transition-colors font-light"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="group"
                    >
                      <div className="border border-neutral-200 hover:border-black transition-all h-full">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-6">
                            <div className="w-12 h-12 bg-neutral-100 flex items-center justify-center group-hover:bg-black transition-colors">
                              <FolderOpen className="h-6 w-6 text-neutral-600 group-hover:text-white transition-colors" />
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-light text-black">
                                {category.posts_count}
                              </div>
                              <div className="text-xs text-neutral-500 uppercase tracking-wider font-light">
                                {category.posts_count === 1 ? "Post" : "Posts"}
                              </div>
                            </div>
                          </div>

                          <h3 className="text-xl font-light text-black mb-3 group-hover:underline">
                            {category.name}
                          </h3>

                          {category.description && (
                            <p className="text-sm text-neutral-600 font-light mb-4 line-clamp-3">
                              {category.description}
                            </p>
                          )}

                          <div className="flex items-center text-sm text-neutral-500 font-light mt-auto">
                            <span>View articles</span>
                            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="space-y-4">
                  {filteredCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="group block"
                    >
                      <div className="border border-neutral-200 hover:border-black transition-all">
                        <div className="p-6">
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-12 h-12 bg-neutral-100 flex items-center justify-center group-hover:bg-black transition-colors shrink-0">
                                <FolderOpen className="h-6 w-6 text-neutral-600 group-hover:text-white transition-colors" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-light text-black mb-2 group-hover:underline">
                                  {category.name}
                                </h3>

                                {category.description && (
                                  <p className="text-sm text-neutral-600 font-light mb-3 line-clamp-2">
                                    {category.description}
                                  </p>
                                )}

                                <div className="flex items-center gap-2 text-sm text-neutral-500 font-light">
                                  <FileText className="h-3.5 w-3.5" />
                                  <span>
                                    {category.posts_count}{" "}
                                    {category.posts_count === 1
                                      ? "article"
                                      : "articles"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center text-sm text-neutral-500 font-light shrink-0">
                              <span className="hidden sm:inline">View</span>
                              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Results Count */}
          {searchTerm && filteredCategories.length > 0 && (
            <div className="mt-12 pt-8 border-t border-neutral-200 text-center">
              <p className="text-sm text-neutral-500 font-light">
                Showing {filteredCategories.length} of {categories.length}{" "}
                {categories.length === 1 ? "category" : "categories"}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoriesPage;
