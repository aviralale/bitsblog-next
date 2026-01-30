"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Folder,
  Search,
  PlusCircle,
  Edit,
  Trash,
  FileText,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import AdminRoute from "@/components/AdminRoute";

/**
 * Category interface
 */
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  posts_count: number;
}

export const ManageCategories = () => {
  const { user } = useAuth();
  const router = useRouter();

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  // Selected category for edit/delete
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  // Loading states
  const [submitting, setSubmitting] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!user?.is_staff) {
      router.push("/");
    }
  }, [user, router]);

  // Load categories on mount
  useEffect(() => {
    if (user?.is_staff) {
      loadCategories();
    }
  }, [user]);

  // Filter categories when search changes
  useEffect(() => {
    filterCategories();
  }, [categories, searchQuery]);

  /**
   * Load categories from API
   */
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/categories/");

      // Handle both paginated and non-paginated responses
      if (response.data && typeof response.data === "object") {
        if (
          "results" in response.data &&
          Array.isArray(response.data.results)
        ) {
          setCategories(response.data.results);
        } else if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          setCategories([]);
        }
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter categories based on search
   */
  const filterCategories = () => {
    if (!searchQuery) {
      setFilteredCategories(categories);
      return;
    }

    const filtered = categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredCategories(filtered);
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors: { name?: string; description?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Reset form
   */
  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setErrors({});
  };

  /**
   * Open create dialog
   */
  const handleCreateClick = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  /**
   * Create category
   */
  const handleCreate = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await api.post("/api/categories/", {
        name: formData.name,
        description: formData.description || null,
      });

      setCreateDialogOpen(false);
      resetForm();
      loadCategories();
    } catch (error: any) {
      console.error("Failed to create category:", error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        alert("Failed to create category. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Open edit dialog
   */
  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setErrors({});
    setEditDialogOpen(true);
  };

  /**
   * Update category
   */
  const handleUpdate = async () => {
    if (!selectedCategory || !validateForm()) return;

    setSubmitting(true);
    try {
      await api.patch(`/api/categories/${selectedCategory.slug}/`, {
        name: formData.name,
        description: formData.description || null,
      });

      setEditDialogOpen(false);
      setSelectedCategory(null);
      resetForm();
      loadCategories();
    } catch (error: any) {
      console.error("Failed to update category:", error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        alert("Failed to update category. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Open delete dialog
   */
  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  /**
   * Delete category
   */
  const handleDelete = async () => {
    if (!selectedCategory) return;

    setSubmitting(true);
    try {
      await api.delete(`/api/categories/${selectedCategory.slug}/`);
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
      loadCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category. Please try again.");
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
                    Manage Categories
                  </h1>
                  <p className="text-sm text-neutral-500 mt-1">
                    Organize your blog posts with categories
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={loadCategories}
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
                  New Category
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
                  <Folder className="h-5 w-5 text-neutral-400" />
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  {categories.length}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Total Categories
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <FileText className="h-5 w-5 text-neutral-400" />
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  {categories.reduce((sum, cat) => sum + cat.posts_count, 0)}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Total Posts
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  {categories.filter((cat) => cat.posts_count > 0).length}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Categories In Use
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
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 border-neutral-300 focus:border-black rounded-none h-12 font-light"
              />
            </div>
          </div>

          {/* Categories List */}
          {filteredCategories.length === 0 ? (
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="p-16 text-center">
                <Folder className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
                <h3 className="text-2xl font-light text-black mb-3">
                  {categories.length === 0
                    ? "No categories yet"
                    : "No categories found"}
                </h3>
                <p className="text-neutral-600 font-light mb-8">
                  {categories.length === 0
                    ? "Create your first category to organize your blog posts"
                    : "Try adjusting your search query"}
                </p>
                {categories.length === 0 && (
                  <Button
                    onClick={handleCreateClick}
                    className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8"
                  >
                    Create Your First Category
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="p-0">
                <div className="divide-y divide-neutral-200">
                  {filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      className="p-6 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <Folder className="h-5 w-5 text-neutral-400 shrink-0" />
                            <h3 className="text-xl font-light text-black">
                              {category.name}
                            </h3>
                            <span className="px-3 py-1 text-xs bg-neutral-100 text-neutral-600 border border-neutral-200">
                              {category.posts_count} post
                              {category.posts_count !== 1 ? "s" : ""}
                            </span>
                          </div>

                          {category.description && (
                            <p className="text-neutral-600 font-light text-sm mb-3 leading-relaxed">
                              {category.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-neutral-500">
                            <span>Slug: {category.slug}</span>
                            <span>•</span>
                            <span>
                              Created {formatDate(category.created_at)}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(category)}
                            className="hover:bg-neutral-200 rounded-none h-10 w-10 p-0"
                            title="Edit Category"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(category)}
                            className="hover:bg-red-50 hover:text-red-600 rounded-none h-10 w-10 p-0"
                            title="Delete Category"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {filteredCategories.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-neutral-500 font-light">
                Showing {filteredCategories.length} of {categories.length}{" "}
                categories
              </p>
            </div>
          )}
        </div>

        {/* Create Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-lg rounded-none border-neutral-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black">
                Create New Category
              </DialogTitle>
              <DialogDescription className="text-neutral-600 font-light pt-2">
                Add a new category to organize your blog posts
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Category Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  placeholder="e.g., Technology, Travel, Food"
                  className={`border-neutral-300 focus:border-black rounded-none h-12 font-light ${
                    errors.name ? "border-red-500" : ""
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Description (Optional)
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of this category..."
                  className="border-neutral-300 focus:border-black rounded-none font-light min-h-[100px]"
                />
              </div>
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
                    Create Category
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-lg rounded-none border-neutral-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black">
                Edit Category
              </DialogTitle>
              <DialogDescription className="text-neutral-600 font-light pt-2">
                Update category information
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Category Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  placeholder="e.g., Technology, Travel, Food"
                  className={`border-neutral-300 focus:border-black rounded-none h-12 font-light ${
                    errors.name ? "border-red-500" : ""
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Description (Optional)
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of this category..."
                  className="border-neutral-300 focus:border-black rounded-none font-light min-h-[100px]"
                />
              </div>

              {selectedCategory && (
                <div className="p-4 bg-neutral-50 border border-neutral-200">
                  <p className="text-xs text-neutral-600">
                    <span className="font-medium">Slug:</span>{" "}
                    {selectedCategory.slug}
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    <span className="font-medium">Posts:</span>{" "}
                    {selectedCategory.posts_count}
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
                Delete Category
              </DialogTitle>
              <DialogDescription className="text-neutral-600 font-light pt-2">
                Are you sure you want to delete this category? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>

            {selectedCategory && (
              <div className="py-4 border-y border-neutral-200 my-4">
                <h4 className="font-medium text-black mb-2">
                  {selectedCategory.name}
                </h4>
                <p className="text-sm text-neutral-600">
                  This category has {selectedCategory.posts_count} post
                  {selectedCategory.posts_count !== 1 ? "s" : ""}. Posts will
                  not be deleted, but will lose this category assignment.
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
                    Delete Category
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

export default ManageCategories;
