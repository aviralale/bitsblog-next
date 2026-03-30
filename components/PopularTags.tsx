/**
 * PopularTags Component
 * Displays most popular tags for internal linking
 * FIXES: Orphan pages, weak internal links
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tag } from "lucide-react";
import api from "@/api/axios";

interface TagData {
  id: number;
  name: string;
  slug: string;
  posts_count?: number;
  description?: string;
}

interface PopularTagsProps {
  /**
   * Number of tags to display
   */
  limit?: number;

  /**
   * Show post count badge
   */
  showCount?: boolean;

  /**
   * Section title
   */
  title?: string;

  /**
   * CSS columns for display
   */
  columns?: "2" | "3" | "4" | "6";
}

export function PopularTags({
  limit = 12,
  showCount = true,
  title = "Popular Tags",
  columns = "3",
}: PopularTagsProps) {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTags = async () => {
      try {
        setLoading(true);
        const response = await api.get<{ results: TagData[] }>(
          `/api/tags/?page_size=${limit}`
        );

        // Sort by posts count descending if available
        const sorted = (response.data.results || []).sort(
          (a, b) => (b.posts_count || 0) - (a.posts_count || 0)
        );

        setTags(sorted.slice(0, limit));
      } catch (error) {
        console.error("Failed to load popular tags:", error);
        setTags([]);
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, [limit]);

  if (loading) {
    return (
      <div className="py-6 animate-pulse">
        <div className="h-5 bg-neutral-200 w-32 mb-4"></div>
        <div className={`grid grid-cols-${columns} gap-2`}>
          {[...Array(parseInt(columns) * 2)].map((_, i) => (
            <div key={i} className="h-8 bg-neutral-100"></div>
          ))}
        </div>
      </div>
    );
  }

  if (tags.length === 0) {
    return null;
  }

  const gridColsClass = {
    "2": "grid-cols-2",
    "3": "grid-cols-3",
    "4": "grid-cols-4",
    "6": "grid-cols-6",
  };

  return (
    <section className="py-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-black">
        <Tag className="w-4 h-4" />
        {title}
      </h3>

      <div className={`grid ${gridColsClass[columns]} gap-2`}>
        {tags.map((tag) => (
          <Link
            key={tag.slug}
            href={`/tags/${tag.slug}`}
            className="px-3 py-2 bg-neutral-50 text-neutral-700 hover:bg-black hover:text-white transition-colors rounded-none text-sm font-medium flex items-center justify-between group"
          >
            <span className="truncate">{tag.name}</span>
            {showCount && (
              <span className="text-xs opacity-70 group-hover:opacity-100 ml-1">
                {tag.posts_count || 0}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default PopularTags;
