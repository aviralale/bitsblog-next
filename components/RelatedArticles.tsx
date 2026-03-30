/**
 * RelatedArticles Component
 * Displays related posts from the same category/tags
 * FIXES: Orphan pages (123), weak internal links (32+8)
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FolderOpen } from "lucide-react";
import api from "@/api/axios";

interface RelatedPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  category?: { name: string; slug: string };
  tags?: Array<{ name: string; slug: string }>;
  created_at: string;
  views: number;
}

interface RelatedArticlesProps {
  /**
   * Current post's category for finding related posts
   */
  categorySlug?: string;

  /**
   * Current post's tags for finding related posts
   */
  tagSlugs?: string[];

  /**
   * Current post ID to exclude from results
   */
  excludePostId?: number;

  /**
   * Number of posts to display (max 6)
   */
  limit?: number;

  /**
   * Optional title for the section
   */
  title?: string;

  /**
   * Show images or text-only
   */
  showImages?: boolean;
}

/**
 * Formats date for display
 */
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Truncate text to specified length
 */
function truncateText(text: string, length: number = 100): string {
  if (!text || text.length <= length) return text || "";
  return text.substring(0, length).trim() + "...";
}

export function RelatedArticles({
  categorySlug,
  tagSlugs = [],
  excludePostId,
  limit = 3,
  title = "Related Articles",
  showImages = true,
}: RelatedArticlesProps) {
  const [posts, setPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRelatedPosts = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const params = new URLSearchParams();
        
        if (categorySlug) {
          params.append("category__slug", categorySlug);
        }
        
        if (tagSlugs.length > 0) {
          params.append("tags__slug__in", tagSlugs.join(","));
        }

        params.append("status", "published");
        params.append("page_size", String(limit + 5)); // Get more to filter

        const response = await api.get<{
          results: RelatedPost[];
          count: number;
        }>(`/api/posts/?${params.toString()}`);

        // Filter out the current post and limit results
        let filtered = response.data.results.filter(
          (post) => post.id !== excludePostId
        );

        // Remove duplicates by ID
        filtered = Array.from(
          new Map(filtered.map((post) => [post.id, post])).values()
        );

        // Limit to requested count
        setPosts(filtered.slice(0, limit));
      } catch (error) {
        console.error("Failed to load related articles:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    // Only load if we have category or tags
    if (categorySlug || tagSlugs.length > 0) {
      loadRelatedPosts();
    }
  }, [categorySlug, tagSlugs, excludePostId, limit]);

  if (loading) {
    return (
      <div className="py-8 animate-pulse">
        <div className="h-6 bg-neutral-200 w-40 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-neutral-100 h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 border-t border-neutral-200">
      <h2 className="text-2xl font-bold mb-8 text-black">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.slug}`}
            className="group no-underline"
          >
            <article className="flex flex-col h-full border border-neutral-200 hover:border-neutral-400 transition-all duration-300">
              {/* Image */}
              {showImages && post.featured_image && (
                <div className="relative h-40 w-full overflow-hidden bg-neutral-100">
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
              <div className="flex flex-col grow p-4">
                {/* Category badge */}
                {post.category && (
                  <div className="flex items-center gap-1 text-xs text-neutral-500 mb-2">
                    <FolderOpen className="w-3 h-3" />
                    <span>{post.category.name}</span>
                  </div>
                )}

                {/* Title */}
                <h3 className="font-semibold text-black mb-2 group-hover:underline line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-sm text-neutral-600 mb-3 flex-grow line-clamp-2">
                    {truncateText(post.excerpt, 120)}
                  </p>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag.slug}
                        className="text-xs px-2 py-1 bg-neutral-100 text-neutral-700"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-200">
                  <span>{formatDate(post.created_at)}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default RelatedArticles;
