"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Tag as TagIcon,
  Search,
  PlusCircle,
  Edit,
  Trash,
  FileText,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Hash,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import AdminRoute from "@/components/AdminRoute";

/**
 * Tag interface
 */
interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  posts_count: number;
}

export const ManageTags = () => {
  const { user } = useAuth();
  const router = useRouter();

  // State
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form state
  const [tagName, setTagName] = useState("");
  const [error, setError] = useState("");

  // Selected tag for edit/delete
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  // Loading states
  const [submitting, setSubmitting] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!user?.is_staff) {
      router.push("/");
    }
  }, [user, router]);

  // Load tags on mount
  useEffect(() => {
    if (user?.is_staff) {
      loadTags();
    }
  }, [user]);

  // Filter tags when search changes
  useEffect(() => {
    filterTags();
  }, [tags, searchQuery]);

  /**
   * Load tags from API
   */
  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/tags/");

      // Handle both paginated and non-paginated responses
      if (response.data && typeof response.data === "object") {
        if (
          "results" in response.data &&
          Array.isArray(response.data.results)
        ) {
          setTags(response.data.results);
        } else if (Array.isArray(response.data)) {
          setTags(response.data);
        } else {
          setTags([]);
        }
      } else {
        setTags([]);
      }
    } catch (error) {
      console.error("Failed to load tags:", error);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter tags based on search
   */
  const filterTags = () => {
    if (!searchQuery) {
      setFilteredTags(tags);
      return;
    }

    const filtered = tags.filter((tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredTags(filtered);
  };

  /**
   * Validate tag name
   */
  const validateTagName = () => {
    if (!tagName.trim()) {
      setError("Tag name is required");
      return false;
    }
    setError("");
    return true;
  };

  /**
   * Reset form
   */
  const resetForm = () => {
    setTagName("");
    setError("");
  };

  /**
   * Open create dialog
   */
  const handleCreateClick = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  /**
   * Create tag
   */
  const handleCreate = async () => {
    if (!validateTagName()) return;

    setSubmitting(true);
    try {
      await api.post("/api/tags/", { name: tagName });
      setCreateDialogOpen(false);
      resetForm();
      loadTags();
    } catch (error: any) {
      console.error("Failed to create tag:", error);
      if (error.response?.data?.name) {
        setError(error.response.data.name[0]);
      } else {
        alert("Failed to create tag. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Open edit dialog
   */
  const handleEditClick = (tag: Tag) => {
    setSelectedTag(tag);
    setTagName(tag.name);
    setError("");
    setEditDialogOpen(true);
  };

  /**
   * Update tag
   */
  const handleUpdate = async () => {
    if (!selectedTag || !validateTagName()) return;

    setSubmitting(true);
    try {
      await api.patch(`/api/tags/${selectedTag.slug}/`, { name: tagName });
      setEditDialogOpen(false);
      setSelectedTag(null);
      resetForm();
      loadTags();
    } catch (error: any) {
      console.error("Failed to update tag:", error);
      if (error.response?.data?.name) {
        setError(error.response.data.name[0]);
      } else {
        alert("Failed to update tag. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Open delete dialog
   */
  const handleDeleteClick = (tag: Tag) => {
    setSelectedTag(tag);
    setDeleteDialogOpen(true);
  };

  /**
   * Delete tag
   */
  const handleDelete = async () => {
    if (!selectedTag) return;

    setSubmitting(true);
    try {
      await api.delete(`/api/tags/${selectedTag.slug}/`);
      setDeleteDialogOpen(false);
      setSelectedTag(null);
      loadTags();
    } catch (error) {
      console.error("Failed to delete tag:", error);
      alert("Failed to delete tag. Please try again.");
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard/admin">
                  <Button
                    variant="ghost"
                    className="hover:bg-neutral-100 rounded-none h-10 w-10 p-0"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-light text-black">
                    Manage Tags
                  </h1>
                  <p className="text-sm text-neutral-500 mt-1">
                    Add keywords and topics to your posts
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={loadTags}
                  className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  onClick={handleCreateClick}
                  className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-10 px-6"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Tag
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-7xl">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <TagIcon className="h-5 w-5 text-neutral-400" />
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  {tags.length}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Total Tags
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <FileText className="h-5 w-5 text-neutral-400" />
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  {tags.reduce((sum, tag) => sum + tag.posts_count, 0)}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Total Tagged Posts
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  {tags.filter((tag) => tag.posts_count > 0).length}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Tags In Use
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
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 border-neutral-300 focus:border-black rounded-none h-12 font-light"
              />
            </div>
          </div>

          {/* Tags List */}
          {filteredTags.length === 0 ? (
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="p-16 text-center">
                <TagIcon className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
                <h3 className="text-2xl font-light text-black mb-3">
                  {tags.length === 0 ? "No tags yet" : "No tags found"}
                </h3>
                <p className="text-neutral-600 font-light mb-8">
                  {tags.length === 0
                    ? "Create your first tag to add keywords to your posts"
                    : "Try adjusting your search query"}
                </p>
                {tags.length === 0 && (
                  <Button
                    onClick={handleCreateClick}
                    className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8"
                  >
                    Create Your First Tag
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="p-0">
                {/* Tag Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {filteredTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="border border-neutral-200 p-4 hover:bg-neutral-50 transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Hash className="h-4 w-4 text-neutral-400 shrink-0" />
                          <h4 className="font-medium text-black truncate">
                            {tag.name}
                          </h4>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(tag)}
                            className="hover:bg-neutral-200 rounded-none h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Edit Tag"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(tag)}
                            className="hover:bg-red-50 hover:text-red-600 rounded-none h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete Tag"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>
                          {tag.posts_count} post
                          {tag.posts_count !== 1 ? "s" : ""}
                        </span>
                        <span>{formatDate(tag.created_at)}</span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-neutral-100">
                        <p className="text-xs text-neutral-400">
                          slug: {tag.slug}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {filteredTags.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-neutral-500 font-light">
                Showing {filteredTags.length} of {tags.length} tags
              </p>
            </div>
          )}
        </div>

        {/* Create Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-none border-neutral-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black">
                Create New Tag
              </DialogTitle>
              <DialogDescription className="text-neutral-600 font-light pt-2">
                Add a new tag to categorize your posts
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <label className="block text-sm font-medium text-black mb-2">
                Tag Name *
              </label>
              <Input
                type="text"
                value={tagName}
                onChange={(e) => {
                  setTagName(e.target.value);
                  setError("");
                }}
                placeholder="e.g., JavaScript, Design, Tutorial"
                className={`border-neutral-300 focus:border-black rounded-none h-12 font-light ${
                  error ? "border-red-500" : ""
                }`}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleCreate();
                  }
                }}
              />
              {error && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {error}
                </p>
              )}
              <p className="text-xs text-neutral-500 mt-2">
                Tags help readers find related content
              </p>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={submitting}
                className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={submitting}
                className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-10"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Create Tag
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-none border-neutral-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black">
                Edit Tag
              </DialogTitle>
              <DialogDescription className="text-neutral-600 font-light pt-2">
                Update tag name
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Tag Name *
                </label>
                <Input
                  type="text"
                  value={tagName}
                  onChange={(e) => {
                    setTagName(e.target.value);
                    setError("");
                  }}
                  placeholder="e.g., JavaScript, Design, Tutorial"
                  className={`border-neutral-300 focus:border-black rounded-none h-12 font-light ${
                    error ? "border-red-500" : ""
                  }`}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleUpdate();
                    }
                  }}
                />
                {error && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {error}
                  </p>
                )}
              </div>

              {selectedTag && (
                <div className="p-4 bg-neutral-50 border border-neutral-200">
                  <p className="text-xs text-neutral-600">
                    <span className="font-medium">Slug:</span>{" "}
                    {selectedTag.slug}
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    <span className="font-medium">Posts:</span>{" "}
                    {selectedTag.posts_count}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={submitting}
                className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={submitting}
                className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-10"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Save Changes
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-none border-neutral-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-600" />
                Delete Tag
              </DialogTitle>
              <DialogDescription className="text-neutral-600 font-light pt-2">
                Are you sure you want to delete this tag? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>

            {selectedTag && (
              <div className="py-4 border-y border-neutral-200 my-4">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-neutral-400" />
                  <h4 className="font-medium text-black">{selectedTag.name}</h4>
                </div>
                <p className="text-sm text-neutral-600">
                  This tag is used in {selectedTag.posts_count} post
                  {selectedTag.posts_count !== 1 ? "s" : ""}. Posts will not be
                  deleted, but will lose this tag.
                </p>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={submitting}
                className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={submitting}
                className="bg-red-600 text-white hover:bg-red-700 font-light rounded-none h-10"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Trash className="h-4 w-4" />
                    Delete Tag
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminRoute>
  );
};

export default ManageTags;
