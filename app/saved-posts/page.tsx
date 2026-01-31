"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  ArrowLeft,
  Bookmark,
  Search,
  Trash,
  Eye,
  Calendar,
  User,
  Tag,
  AlertCircle,
  FileText,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import ProtectedRoute from "@/components/ProtectedRoute";

/**
 * Saved Post interface
 */
interface SavedPost {
  id: number;
  post: {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string;
    author: {
      username: string;
      first_name: string;
      last_name: string;
    };
    category: {
      name: string;
      slug: string;
    } | null;
    tags: Array<{
      name: string;
      slug: string;
    }>;
    views: number;
    created_at: string;
    published_at: string;
    comments_count: number;
  };
  notes: string;
  saved_at: string;
}

/**
 * Paginated response interface
 */
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export default function SavedPosts() {
  const { user } = useAuth();

  // State
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SavedPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load saved posts on mount
  useEffect(() => {
    if (user) {
      loadSavedPosts();
    }
  }, [user]);

  // Filter posts when search changes
  useEffect(() => {
    filterPosts();
  }, [savedPosts, searchQuery]);

  /**
   * Load saved posts from API
   */
  const loadSavedPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get<
        PaginatedResponse<SavedPost> | SavedPost[]
      >("/api/saved-posts/");

      // Handle both paginated and non-paginated responses
      if (response.data && typeof response.data === "object") {
        if (
          "results" in response.data &&
          Array.isArray(response.data.results)
        ) {
          setSavedPosts(response.data.results);
        } else if (Array.isArray(response.data)) {
          setSavedPosts(response.data);
        } else {
          setSavedPosts([]);
        }
      } else {
        setSavedPosts([]);
      }
    } catch (error) {
      console.error("Failed to load saved posts:", error);
      setSavedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter posts based on search
   */
  const filterPosts = () => {
    if (!searchQuery) {
      setFilteredPosts(savedPosts);
      return;
    }

    const filtered = savedPosts.filter(
      (saved) =>
        saved.post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        saved.post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        saved.post.author.username
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );
    setFilteredPosts(filtered);
  };

  /**
   * Open delete dialog
   */
  const handleDeleteClick = (savedPost: SavedPost) => {
    setSelectedPost(savedPost);
    setDeleteDialogOpen(true);
  };

  /**
   * Remove saved post
   */
  const handleDelete = async () => {
    if (!selectedPost) return;

    setDeleting(true);
    try {
      await api.delete(`/api/saved-posts/${selectedPost.id}/`);
      setDeleteDialogOpen(false);
      setSelectedPost(null);
      loadSavedPosts();
    } catch (error) {
      console.error("Failed to remove saved post:", error);
      alert("Failed to remove saved post. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /**
   * Time ago helper
   */
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button
                    variant="ghost"
                    className="hover:bg-neutral-100 rounded-none h-10 w-10 p-0"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-light text-black">
                    Saved Posts
                  </h1>
                  <p className="text-sm text-neutral-500 mt-1">
                    Your bookmarked articles for later reading
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={loadSavedPosts}
                className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-7xl">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <Bookmark className="h-5 w-5 text-neutral-400" />
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  {savedPosts.length}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Saved Posts
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <FileText className="h-5 w-5 text-neutral-400" />
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  {savedPosts.length > 0
                    ? new Set(savedPosts.map((s) => s.post.category?.name)).size
                    : 0}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Categories
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <Calendar className="h-5 w-5 text-neutral-400" />
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  {savedPosts.length > 0
                    ? timeAgo(savedPosts[0].saved_at)
                    : "N/A"}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Last Saved
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search saved posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 border-neutral-300 focus:border-black rounded-none h-12 font-light"
              />
            </div>
          </div>

          {/* Saved Posts List */}
          {filteredPosts.length === 0 ? (
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="p-16 text-center">
                <Bookmark className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
                <h3 className="text-2xl font-light text-black mb-3">
                  {savedPosts.length === 0
                    ? "No saved posts yet"
                    : "No posts found"}
                </h3>
                <p className="text-neutral-600 font-light mb-8">
                  {savedPosts.length === 0
                    ? "Start bookmarking articles you want to read later"
                    : "Try adjusting your search query"}
                </p>
                {savedPosts.length === 0 && (
                  <Link href="/">
                    <Button className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8">
                      Explore Posts
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map((savedPost) => (
                <Card
                  key={savedPost.id}
                  className="border-neutral-200 rounded-none shadow-none hover:shadow-md transition-all"
                >
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Featured Image */}
                      {savedPost.post.featured_image && (
                        <div className="w-48 h-32 shrink-0">
                          <img
                            src={savedPost.post.featured_image}
                            alt={savedPost.post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {savedPost.post.category && (
                                <span className="text-xs px-3 py-1 border border-neutral-300 text-neutral-600">
                                  {savedPost.post.category.name}
                                </span>
                              )}
                              <span className="text-xs text-neutral-500">
                                Saved {timeAgo(savedPost.saved_at)}
                              </span>
                            </div>

                            <Link href={`/post/${savedPost.post.slug}`}>
                              <h3 className="text-xl font-light text-black hover:text-neutral-700 transition-colors mb-2">
                                {savedPost.post.title}
                              </h3>
                            </Link>

                            <p className="text-neutral-600 font-light text-sm line-clamp-2 mb-3">
                              {savedPost.post.excerpt}
                            </p>

                            {/* Metadata */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                              <div className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                <span>{savedPost.post.author.username}</span>
                              </div>
                              <span>â€¢</span>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                <span>{savedPost.post.views} views</span>
                              </div>
                              <span>â€¢</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>
                                  {formatDate(savedPost.post.published_at)}
                                </span>
                              </div>
                            </div>

                            {/* Tags */}
                            {savedPost.post.tags.length > 0 && (
                              <div className="flex items-center gap-2 mt-3">
                                <Tag className="h-3.5 w-3.5 text-neutral-400" />
                                <div className="flex flex-wrap gap-2">
                                  {savedPost.post.tags.map((tag) => (
                                    <span
                                      key={tag.slug}
                                      className="text-xs text-neutral-500"
                                    >
                                      #{tag.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Notes */}
                            {savedPost.notes && (
                              <div className="mt-3 p-3 bg-neutral-50 border-l-2 border-neutral-300">
                                <p className="text-sm text-neutral-600 italic">
                                  "{savedPost.notes}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                          <Link href={`/post/${savedPost.post.slug}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-9"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              Read
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(savedPost)}
                            className="hover:bg-red-50 hover:text-red-600 rounded-none h-9"
                          >
                            <Trash className="h-3.5 w-3.5 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredPosts.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-neutral-500 font-light">
                Showing {filteredPosts.length} of {savedPosts.length} saved
                posts
              </p>
            </div>
          )}
        </div>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-none border-neutral-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-600" />
                Remove Saved Post
              </DialogTitle>
              <DialogDescription className="text-neutral-600 font-light pt-2">
                Are you sure you want to remove this post from your saved items?
              </DialogDescription>
            </DialogHeader>

            {selectedPost && (
              <div className="py-4 border-y border-neutral-200 my-4">
                <h4 className="font-medium text-black mb-2">
                  {selectedPost.post.title}
                </h4>
                <p className="text-sm text-neutral-600">
                  by {selectedPost.post.author.username}
                </p>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
                className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 text-white hover:bg-red-700 font-light rounded-none h-10"
              >
                {deleting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Removing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Trash className="h-4 w-4" />
                    Remove
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
