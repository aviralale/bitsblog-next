"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Mail,
  Search,
  PlusCircle,
  Edit,
  Trash,
  Eye,
  Copy,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  FileText,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import AdminRoute from "@/components/AdminRoute";

/**
 * Newsletter Template interface
 */
interface NewsletterTemplate {
  id: number;
  name: string;
  subject_line: string;
  content: string;
  created_at: string;
  updated_at: string;
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

export const NewsletterTemplates = () => {
  const { user } = useAuth();
  const router = useRouter();

  // State
  const [templates, setTemplates] = useState<NewsletterTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<
    NewsletterTemplate[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    subject_line: "",
    content: "",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    subject_line?: string;
    content?: string;
  }>({});

  // Selected template for edit/delete/preview
  const [selectedTemplate, setSelectedTemplate] =
    useState<NewsletterTemplate | null>(null);

  // Loading states
  const [submitting, setSubmitting] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!user?.is_staff) {
      router.push("/");
    }
  }, [user, router]);

  // Load templates on mount
  useEffect(() => {
    if (user?.is_staff) {
      loadTemplates();
    }
  }, [user]);

  // Filter templates when search changes
  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery]);

  /**
   * Load templates from API
   */
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get<
        PaginatedResponse<NewsletterTemplate> | NewsletterTemplate[]
      >("/api/newsletter/templates/");

      // Handle both paginated and non-paginated responses
      if (response.data && typeof response.data === "object") {
        if (
          "results" in response.data &&
          Array.isArray(response.data.results)
        ) {
          setTemplates(response.data.results);
        } else if (Array.isArray(response.data)) {
          setTemplates(response.data);
        } else {
          setTemplates([]);
        }
      } else {
        setTemplates([]);
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter templates based on search
   */
  const filterTemplates = () => {
    if (!searchQuery) {
      setFilteredTemplates(templates);
      return;
    }

    const filtered = templates.filter(
      (template) =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.subject_line.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredTemplates(filtered);
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors: {
      name?: string;
      subject_line?: string;
      content?: string;
    } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Template name is required";
    }

    if (!formData.subject_line.trim()) {
      newErrors.subject_line = "Subject line is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Reset form
   */
  const resetForm = () => {
    setFormData({ name: "", subject_line: "", content: "" });
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
   * Create template
   */
  const handleCreate = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await api.post("/api/newsletter/templates/", {
        name: formData.name,
        subject_line: formData.subject_line,
        content: formData.content,
      });

      setCreateDialogOpen(false);
      resetForm();
      loadTemplates();
    } catch (error: any) {
      console.error("Failed to create template:", error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        alert("Failed to create template. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Open edit dialog
   */
  const handleEditClick = (template: NewsletterTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject_line: template.subject_line,
      content: template.content,
    });
    setErrors({});
    setEditDialogOpen(true);
  };

  /**
   * Update template
   */
  const handleUpdate = async () => {
    if (!selectedTemplate || !validateForm()) return;

    setSubmitting(true);
    try {
      await api.patch(`/api/newsletter/templates/${selectedTemplate.id}/`, {
        name: formData.name,
        subject_line: formData.subject_line,
        content: formData.content,
      });

      setEditDialogOpen(false);
      setSelectedTemplate(null);
      resetForm();
      loadTemplates();
    } catch (error: any) {
      console.error("Failed to update template:", error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        alert("Failed to update template. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Open delete dialog
   */
  const handleDeleteClick = (template: NewsletterTemplate) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  /**
   * Delete template
   */
  const handleDelete = async () => {
    if (!selectedTemplate) return;

    setSubmitting(true);
    try {
      await api.delete(`/api/newsletter/templates/${selectedTemplate.id}/`);
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
      loadTemplates();
    } catch (error) {
      console.error("Failed to delete template:", error);
      alert("Failed to delete template. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Open preview dialog
   */
  const handlePreviewClick = (template: NewsletterTemplate) => {
    setSelectedTemplate(template);
    setPreviewDialogOpen(true);
  };

  /**
   * Duplicate template
   */
  const handleDuplicate = async (template: NewsletterTemplate) => {
    setSubmitting(true);
    try {
      await api.post("/api/newsletter/templates/", {
        name: `${template.name} (Copy)`,
        subject_line: template.subject_line,
        content: template.content,
      });
      loadTemplates();
    } catch (error) {
      console.error("Failed to duplicate template:", error);
      alert("Failed to duplicate template. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Use template for new newsletter
   */
  const handleUseTemplate = (template: NewsletterTemplate) => {
    // Navigate to create newsletter with template pre-filled
    router.push(
      `/dashboard/newsletter/new?templateId=${template.id}&subject=${encodeURIComponent(template.subject_line)}&content=${encodeURIComponent(template.content)}`,
    );
  };

  /**
   * Insert merge tag
   */
  const insertMergeTag = (tag: string) => {
    const textarea = document.querySelector("textarea");
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        formData.content.substring(0, start) +
        tag +
        formData.content.substring(end);
      setFormData({ ...formData, content: newContent });

      // Set cursor position after inserted tag
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
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
                <Link href="/dashboard?tab=analytics">
                  <Button
                    variant="ghost"
                    className="hover:bg-neutral-100 rounded-none h-10 w-10 p-0"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-light text-black">
                    Newsletter Templates
                  </h1>
                  <p className="text-sm text-neutral-500 mt-1">
                    Create and manage reusable templates
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={loadTemplates}
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
                  New Template
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
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  {templates.length}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Total Templates
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  {templates.length > 0
                    ? formatDate(templates[0].created_at)
                    : "None"}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Latest Template
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <FileText className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  {templates.length > 0 ? "Active" : "Empty"}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Library Status
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
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 border-neutral-300 focus:border-black rounded-none h-12 font-light"
              />
            </div>
          </div>

          {/* Templates List */}
          {filteredTemplates.length === 0 ? (
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="p-16 text-center">
                <Mail className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
                <h3 className="text-2xl font-light text-black mb-3">
                  {templates.length === 0
                    ? "No templates yet"
                    : "No templates found"}
                </h3>
                <p className="text-neutral-600 font-light mb-8">
                  {templates.length === 0
                    ? "Create your first template to speed up newsletter creation"
                    : "Try adjusting your search query"}
                </p>
                {templates.length === 0 && (
                  <Button
                    onClick={handleCreateClick}
                    className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8"
                  >
                    Create Your First Template
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="border-neutral-200 rounded-none shadow-none hover:shadow-md transition-all group"
                >
                  <CardHeader className="border-b border-neutral-200">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-medium text-black truncate">
                          {template.name}
                        </CardTitle>
                        <CardDescription className="text-xs text-neutral-500 mt-1 truncate">
                          {template.subject_line}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    <p className="text-sm text-neutral-600 font-light mb-4 line-clamp-3">
                      {template.content.replace(/<[^>]*>/g, "")}
                    </p>

                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-4">
                      <span>Created {formatDate(template.created_at)}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewClick(template)}
                        className="flex-1 border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-9 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicate(template)}
                        className="flex-1 border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-9 p-0"
                        disabled={submitting}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(template)}
                        className="flex-1 border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-9 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(template)}
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50 font-light rounded-none h-9 p-0"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      onClick={() => handleUseTemplate(template)}
                      className="w-full mt-3 bg-black text-white hover:bg-neutral-800 font-light rounded-none h-10"
                      size="sm"
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredTemplates.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-neutral-500 font-light">
                Showing {filteredTemplates.length} of {templates.length}{" "}
                templates
              </p>
            </div>
          )}
        </div>

        {/* Create Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-2xl rounded-none border-neutral-200 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black">
                Create New Template
              </DialogTitle>
              <DialogDescription className="text-neutral-600 font-light pt-2">
                Create a reusable template for your newsletters
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Template Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  placeholder="e.g., Weekly Update, Product Launch"
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
                  Default Subject Line *
                </label>
                <Input
                  type="text"
                  value={formData.subject_line}
                  onChange={(e) => {
                    setFormData({ ...formData, subject_line: e.target.value });
                    if (errors.subject_line)
                      setErrors({ ...errors, subject_line: undefined });
                  }}
                  placeholder="Your newsletter subject..."
                  className={`border-neutral-300 focus:border-black rounded-none h-12 font-light ${
                    errors.subject_line ? "border-red-500" : ""
                  }`}
                />
                {errors.subject_line && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.subject_line}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-black">
                    Content *
                  </label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => insertMergeTag("{{first_name}}")}
                      className="text-xs border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-8"
                    >
                      {"{{first_name}}"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => insertMergeTag("{{email}}")}
                      className="text-xs border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-8"
                    >
                      {"{{email}}"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => insertMergeTag("{{date}}")}
                      className="text-xs border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-8"
                    >
                      {"{{date}}"}
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={formData.content}
                  onChange={(e) => {
                    setFormData({ ...formData, content: e.target.value });
                    if (errors.content)
                      setErrors({ ...errors, content: undefined });
                  }}
                  placeholder="Write your newsletter template... You can use HTML tags."
                  className={`border-neutral-300 focus:border-black rounded-none font-light min-h-[300px] ${
                    errors.content ? "border-red-500" : ""
                  }`}
                />
                {errors.content && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.content}
                  </p>
                )}
                <p className="text-xs text-neutral-500 mt-2">
                  Use merge tags like {`{{first_name}}`} to personalize content
                </p>
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
                    Create Template
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl rounded-none border-neutral-200 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black">
                Edit Template
              </DialogTitle>
              <DialogDescription className="text-neutral-600 font-light pt-2">
                Update template information
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Template Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  placeholder="e.g., Weekly Update, Product Launch"
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
                  Default Subject Line *
                </label>
                <Input
                  type="text"
                  value={formData.subject_line}
                  onChange={(e) => {
                    setFormData({ ...formData, subject_line: e.target.value });
                    if (errors.subject_line)
                      setErrors({ ...errors, subject_line: undefined });
                  }}
                  placeholder="Your newsletter subject..."
                  className={`border-neutral-300 focus:border-black rounded-none h-12 font-light ${
                    errors.subject_line ? "border-red-500" : ""
                  }`}
                />
                {errors.subject_line && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.subject_line}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-black">
                    Content *
                  </label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => insertMergeTag("{{first_name}}")}
                      className="text-xs border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-8"
                    >
                      {"{{first_name}}"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => insertMergeTag("{{email}}")}
                      className="text-xs border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-8"
                    >
                      {"{{email}}"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => insertMergeTag("{{date}}")}
                      className="text-xs border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-8"
                    >
                      {"{{date}}"}
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={formData.content}
                  onChange={(e) => {
                    setFormData({ ...formData, content: e.target.value });
                    if (errors.content)
                      setErrors({ ...errors, content: undefined });
                  }}
                  placeholder="Write your newsletter template... You can use HTML tags."
                  className={`border-neutral-300 focus:border-black rounded-none font-light min-h-[300px] ${
                    errors.content ? "border-red-500" : ""
                  }`}
                />
                {errors.content && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.content}
                  </p>
                )}
              </div>
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

        {/* Preview Dialog */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="sm:max-w-2xl rounded-none border-neutral-200 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black">
                Template Preview
              </DialogTitle>
            </DialogHeader>

            {selectedTemplate && (
              <div className="py-4">
                <div className="mb-6 pb-4 border-b border-neutral-200">
                  <h3 className="text-lg font-medium text-black mb-2">
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-sm text-neutral-500 mb-3">
                    Subject: {selectedTemplate.subject_line}
                  </p>
                </div>

                <div className="border border-neutral-200 p-6 bg-neutral-50">
                  <div
                    className="prose max-w-none text-neutral-700 font-light"
                    dangerouslySetInnerHTML={{
                      __html: selectedTemplate.content,
                    }}
                  ></div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPreviewDialogOpen(false)}
                className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
              >
                Close
              </Button>
              {selectedTemplate && (
                <Button
                  onClick={() => {
                    setPreviewDialogOpen(false);
                    handleUseTemplate(selectedTemplate);
                  }}
                  className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-10"
                >
                  Use Template
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-none border-neutral-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-600" />
                Delete Template
              </DialogTitle>
              <DialogDescription className="text-neutral-600 font-light pt-2">
                Are you sure you want to delete this template? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>

            {selectedTemplate && (
              <div className="py-4 border-y border-neutral-200 my-4">
                <h4 className="font-medium text-black mb-2">
                  {selectedTemplate.name}
                </h4>
                <p className="text-sm text-neutral-600">
                  Subject: {selectedTemplate.subject_line}
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
                    Delete Template
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

export default NewsletterTemplates;
