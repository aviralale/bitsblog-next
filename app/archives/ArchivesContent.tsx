"use client";
import { useState, useEffect } from "react";

export const dynamic = 'force-dynamic';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  FileText,
  Eye,
  MessageSquare,
  Archive as ArchiveIcon,
  Filter,
  X,
} from "lucide-react";
import api from "../../api/axios";
import Head from "next/head";
import Link from "next/link";

/**
 * Type definitions for the archives data structure
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
}

interface MonthArchive {
  month: number;
  month_name: string;
  post_count: number;
  posts?: Post[];
}

interface YearArchive {
  year: number;
  post_count: number;
  months: MonthArchive[];
}

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

const ArchivesPage = () => {
  const [archives, setArchives] = useState<YearArchive[]>([]);
  const [allAvailableYears, setAllAvailableYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // Filter states
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  /**
   * Load ALL available years on mount (for the filter dropdown)
   */
  useEffect(() => {
    const loadAllYears = async () => {
      try {
        const response = await api.get<YearArchive[]>("/api/posts/archives/", {
          params: { posts: "false" },
        });
        const years = response.data.map((a) => a.year);
        setAllAvailableYears(years);
        console.log("All available years:", years);
      } catch (error) {
        console.error("Failed to load years:", error);
      }
    };
    loadAllYears();
  }, []);

  /**
   * Load archives structure based on current filters
   */
  useEffect(() => {
    const loadArchives = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const params: any = { posts: "false" };

        if (selectedYear) {
          params.year = selectedYear;
        }
        if (selectedMonth && selectedYear) {
          params.month = selectedMonth;
        }

        console.log("Loading archives with params:", params);

        const response = await api.get<YearArchive[]>("/api/posts/archives/", {
          params,
        });

        console.log("Archives loaded:", response.data);
        console.log("Total years:", response.data.length);

        // Log details of each year
        response.data.forEach((year) => {
          console.log(
            `Year ${year.year}: ${year.post_count} posts, ${year.months.length} months`
          );
          year.months.forEach((month) => {
            console.log(`  - ${month.month_name}: ${month.post_count} posts`);
          });
        });

        setArchives(response.data);

        // Auto-expand the first year
        if (response.data.length > 0) {
          setExpandedYears(new Set([response.data[0].year]));
        }
      } catch (error) {
        console.error("Failed to load archives:", error);
      } finally {
        setLoading(false);
      }
    };

    loadArchives();
  }, [selectedYear, selectedMonth]);

  /**
   * Toggle year expansion
   */
  const toggleYear = (year: number) => {
    setExpandedYears((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(year)) {
        newSet.delete(year);
        // Collapse all months in this year
        setExpandedMonths((monthSet) => {
          const newMonthSet = new Set(monthSet);
          archives
            .find((a) => a.year === year)
            ?.months.forEach((m) => {
              newMonthSet.delete(`${year}-${m.month}`);
            });
          return newMonthSet;
        });
      } else {
        newSet.add(year);
      }
      return newSet;
    });
  };

  /**
   * Toggle month expansion and load posts if needed
   */
  const toggleMonth = async (year: number, month: number) => {
    const monthKey = `${year}-${month}`;
    const willExpand = !expandedMonths.has(monthKey);

    // Toggle expansion state
    setExpandedMonths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(monthKey)) {
        newSet.delete(monthKey);
      } else {
        newSet.add(monthKey);
      }
      return newSet;
    });

    // If expanding and posts not loaded yet, fetch them
    if (willExpand) {
      const yearData = archives.find((a) => a.year === year);
      const monthData = yearData?.months.find((m) => m.month === month);

      if (monthData && !monthData.posts) {
        try {
          console.log(`Loading posts for ${year}-${month}`);

          const response = await api.get(
            `/api/posts/archives/?year=${year}&month=${month}`
          );

          console.log(`Posts loaded for ${year}-${month}:`, response.data);

          // Update archives state with the loaded posts
          setArchives((prevArchives) =>
            prevArchives.map((yearArchive) => {
              if (yearArchive.year === year) {
                return {
                  ...yearArchive,
                  months: yearArchive.months.map((monthArchive) => {
                    if (monthArchive.month === month) {
                      return {
                        ...monthArchive,
                        posts: response.data.posts || [],
                      };
                    }
                    return monthArchive;
                  }),
                };
              }
              return yearArchive;
            })
          );
        } catch (error) {
          console.error(`Failed to load posts for ${year}-${month}:`, error);
        }
      }
    }
  };

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
   * Clear all filters
   */
  const clearFilters = () => {
    setSelectedYear(null);
    setSelectedMonth(null);
    setExpandedYears(new Set());
    setExpandedMonths(new Set());
  };

  /**
   * Get available months for the selected year
   */
  const availableMonths =
    archives.length > 0 && archives[0].year === selectedYear
      ? archives[0].months
      : [];

  /**
   * Calculate statistics
   */
  const totalPosts = archives.reduce((sum, year) => sum + year.post_count, 0);
  const totalYears = archives.length;

  // SEO Data
  const pageTitle = selectedYear
    ? selectedMonth
      ? `Archives - ${
          availableMonths.find((m) => m.month === selectedMonth)?.month_name
        } ${selectedYear} | BitsBlog Nepal`
      : `Archives - ${selectedYear} Technology Articles | BitsBlog Nepal`
    : "Blog Archives - Complete Historical Content | BitsBlog Nepal";

  const pageDescription = selectedYear
    ? selectedMonth
      ? `Explore all ${totalPosts} technology articles published in ${
          availableMonths.find((m) => m.month === selectedMonth)?.month_name
        } ${selectedYear}. Browse expert web development tutorials, AI guides, programming insights, and software architecture content from Nepal's leading tech blog.`
      : `Explore all ${totalPosts} expert articles published in ${selectedYear}. Browse our technology content organized by month, covering web development, AI/ML, software engineering, and programming from Nepal.`
    : `Browse BitsBlog's complete archive of ${totalPosts} technology articles organized chronologically. Explore historical content from ${
        allAvailableYears.length > 0
          ? `${allAvailableYears[allAvailableYears.length - 1]} to ${
              allAvailableYears[0]
            }`
          : "all years"
      } covering web development, AI, programming, and software engineering from Nepal's trusted tech community.`;

  const pageUrl = getAbsoluteUrl("/archives");
  const ogImage = getAbsoluteUrl("/og-archives.jpg");

  const keywords = selectedYear
    ? `blog archives ${selectedYear}, ${selectedYear} tech articles Nepal, tech posts ${selectedYear}, blog history, historical content, past articles, Nepal technology blog ${selectedYear}`
    : "blog archives Nepal, article history, chronological posts, tech blog timeline, all articles, historical content, past tech articles, Nepal blog archives, web development history, programming archives";

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
        name: "Archives",
        item: pageUrl,
      },
    ],
  };

  // CollectionPage structured data
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: selectedYear ? `Blog Archives - ${selectedYear}` : "Blog Archives",
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
      <Head>
        {/* SEO meta Tags */}
        <title>{pageTitle}</title>

        {/* Basic meta Tags */}
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
          content="BitsBlog Archives - Browse articles by date"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content="BitsBlog Archives" />
        <meta name="twitter:site" content="@ctrl_bits" />
      </Head>

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

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-6 py-12 max-w-6xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-12 bg-black"></div>
              <span className="text-sm font-medium text-black uppercase tracking-wider">
                Blog Archives
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-light text-black mb-4 leading-tight">
              Explore by Date
            </h1>
            <p className="text-lg text-neutral-600 font-light max-w-2xl">
              Browse through our complete collection of articles organized by
              publication date.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-6xl">
          {/* Filters */}
          <div className="mb-8">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">
                {showFilters ? "Hide Filters" : "Show Filters"}
              </span>
              {(selectedYear || selectedMonth) && (
                <span className="ml-2 px-2 py-0.5 bg-black text-white text-xs rounded">
                  Active
                </span>
              )}
            </button>

            {showFilters && (
              <div className="mt-4 p-4 border border-neutral-200 bg-neutral-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Year Filter */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Filter by Year
                    </label>
                    <select
                      value={selectedYear || ""}
                      onChange={(e) => {
                        const newYear = e.target.value
                          ? Number(e.target.value)
                          : null;
                        setSelectedYear(newYear);
                        setSelectedMonth(null);
                        setExpandedYears(new Set());
                        setExpandedMonths(new Set());
                      }}
                      className="w-full px-3 py-2 border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">All Years</option>
                      {allAvailableYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Month Filter */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Filter by Month
                    </label>
                    <select
                      value={selectedMonth || ""}
                      onChange={(e) => {
                        setSelectedMonth(
                          e.target.value ? Number(e.target.value) : null
                        );
                        setExpandedYears(new Set());
                        setExpandedMonths(new Set());
                      }}
                      disabled={!selectedYear}
                      className="w-full px-3 py-2 border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-black disabled:bg-neutral-100 disabled:cursor-not-allowed"
                    >
                      <option value="">All Months</option>
                      {selectedYear &&
                        availableMonths.map((month) => (
                          <option key={month.month} value={month.month}>
                            {month.month_name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Clear Button */}
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      disabled={!selectedYear && !selectedMonth}
                      className="w-full px-4 py-2 border border-neutral-300 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      <span className="text-sm">Clear Filters</span>
                    </button>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(selectedYear || selectedMonth) && (
                  <div className="mt-4 pt-4 border-t border-neutral-300">
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <span className="text-neutral-600">Active filters:</span>
                      {selectedYear && (
                        <span className="px-2 py-1 bg-black text-white rounded text-xs">
                          Year: {selectedYear}
                        </span>
                      )}
                      {selectedMonth && (
                        <span className="px-2 py-1 bg-black text-white rounded text-xs">
                          Month:{" "}
                          {
                            availableMonths.find(
                              (m) => m.month === selectedMonth
                            )?.month_name
                          }
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <FileText className="h-5 w-5 text-neutral-400 mb-3" />
                <div className="text-3xl font-light text-black mb-1">
                  {totalPosts}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  {selectedYear || selectedMonth ? "Filtered" : "Total"}{" "}
                  Articles
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <Calendar className="h-5 w-5 text-neutral-400 mb-3" />
                <div className="text-3xl font-light text-black mb-1">
                  {totalYears}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Years of Content
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <ArchiveIcon className="h-5 w-5 text-neutral-400 mb-3" />
                <div className="text-3xl font-light text-black mb-1">
                  {archives.length > 0
                    ? archives.length === 1
                      ? archives[0].year
                      : `${archives[0].year} - ${
                          archives[archives.length - 1].year
                        }`
                    : "N/A"}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Timeline Span
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Archives List */}
          {archives.length === 0 ? (
            <div className="border border-neutral-200 p-16 text-center">
              <ArchiveIcon className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
              <h3 className="text-2xl font-light text-black mb-3">
                No Archives Found
              </h3>
              <p className="text-neutral-600 font-light mb-4">
                {selectedYear || selectedMonth
                  ? "No posts found for the selected filters."
                  : "Published posts will appear here."}
              </p>
              {(selectedYear || selectedMonth) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-black text-white hover:bg-neutral-800 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {archives.map((yearArchive) => (
                <Card
                  key={yearArchive.year}
                  className="border-neutral-200 rounded-none shadow-none overflow-hidden"
                >
                  {/* Year Header */}
                  <button
                    onClick={() => toggleYear(yearArchive.year)}
                    className="w-full"
                  >
                    <CardHeader className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-8 bg-black"></div>
                            <CardTitle className="text-2xl font-light text-black">
                              {yearArchive.year}
                            </CardTitle>
                          </div>
                          <span className="text-sm text-neutral-500 font-light">
                            {yearArchive.post_count} article
                            {yearArchive.post_count !== 1 ? "s" : ""}
                          </span>
                        </div>
                        {expandedYears.has(yearArchive.year) ? (
                          <ChevronUp className="h-5 w-5 text-neutral-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-neutral-400" />
                        )}
                      </div>
                    </CardHeader>
                  </button>

                  {/* Months List */}
                  {expandedYears.has(yearArchive.year) && (
                    <CardContent className="p-0">
                      <div className="divide-y divide-neutral-200">
                        {yearArchive.months.map((monthArchive) => {
                          const monthKey = `${yearArchive.year}-${monthArchive.month}`;
                          const isMonthExpanded = expandedMonths.has(monthKey);

                          return (
                            <div key={monthKey}>
                              {/* Month Header */}
                              <button
                                onClick={() =>
                                  toggleMonth(
                                    yearArchive.year,
                                    monthArchive.month
                                  )
                                }
                                className="w-full px-6 py-4 hover:bg-neutral-50 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <Calendar className="h-4 w-4 text-neutral-400" />
                                    <span className="font-light text-black">
                                      {monthArchive.month_name}
                                    </span>
                                    <span className="text-sm text-neutral-500 font-light">
                                      {monthArchive.post_count} post
                                      {monthArchive.post_count !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                  {isMonthExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-neutral-400" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-neutral-400" />
                                  )}
                                </div>
                              </button>

                              {/* Posts List */}
                              {isMonthExpanded && (
                                <div className="px-6 pb-4">
                                  {monthArchive.posts ? (
                                    monthArchive.posts.length > 0 ? (
                                      <div className="space-y-4 pl-8">
                                        {monthArchive.posts.map((post) => (
                                          <Link
                                            key={post.id}
                                            href={`/post/${post.slug}`}
                                            className="block border-l-2 border-neutral-200 pl-4 py-2 hover:border-black transition-colors group"
                                          >
                                            <h4 className="font-light text-black mb-2 group-hover:text-neutral-700 transition-colors">
                                              {post.title}
                                            </h4>

                                            {post.excerpt && (
                                              <p className="text-sm text-neutral-600 font-light mb-3 line-clamp-2">
                                                {post.excerpt}
                                              </p>
                                            )}

                                            <div className="flex items-center gap-4 text-xs text-neutral-500">
                                              <span>
                                                {formatDate(post.published_at)}
                                              </span>
                                              <span>•</span>
                                              <div className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />
                                                <span>{post.views}</span>
                                              </div>
                                              <span>•</span>
                                              <div className="flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3" />
                                                <span>
                                                  {post.comments_count}
                                                </span>
                                              </div>
                                            </div>
                                          </Link>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center py-8 text-neutral-500">
                                        No posts found
                                      </div>
                                    )
                                  ) : (
                                    <div className="flex justify-center py-8">
                                      <div className="w-6 h-6 border-2 border-neutral-300 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Footer Note */}
          {archives.length > 0 && (
            <div className="mt-12 pt-8 border-t border-neutral-200 text-center">
              <p className="text-sm text-neutral-500 font-light">
                Click on any year or month to explore articles from that period
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ArchivesPage;