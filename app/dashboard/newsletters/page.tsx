"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Search,
  PlusCircle,
  Eye,
  Trash,
  Send,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Filter,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import AdminRoute from "@/components/AdminRoute";

/**
 * Newsletter interface
 */
interface Newsletter {
  id: number;
  subject: string;
  content: string;
  status: "draft" | "scheduled" | "sent" | "failed";
  recipient_filter: string;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  total_recipients: number;
  opened_count: number;
  clicked_count: number;
}

/**
 * Newsletter stats interface
 */
interface NewsletterStats {
  total: number;
  sent: number;
  scheduled: number;
  drafts: number;
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

export const Newsletters = () => {
  const { user } = useAuth();
  const router = useRouter();

  // State
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [filteredNewsletters, setFilteredNewsletters] = useState<Newsletter[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Stats
  const [stats, setStats] = useState<NewsletterStats>({
    total: 0,
    sent: 0,
    scheduled: 0,
    drafts: 0,
  });

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] =
    useState<Newsletter | null>(null);

  // Loading states
  const [submitting, setSubmitting] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!user?.is_staff) {
      router.push("/");
    }
  }, [user, router]);

  // Load newsletters on mount
  useEffect(() => {
    if (user?.is_staff) {
      loadNewsletters();
    }
  }, [user]);

  // Filter newsletters when search or filter changes
  useEffect(() => {
    filterNewsletters();
  }, [newsletters, searchQuery, statusFilter]);

  /**
   * Load newsletters from API
   */
  const loadNewsletters = async () => {
    try {
      setLoading(true);
      const response = await api.get<
        PaginatedResponse<Newsletter> | Newsletter[]
      >("/api/newsletter/newsletters/");

      let newsletterData: Newsletter[] = [];

      if (response.data && typeof response.data === "object") {
        if (
          "results" in response.data &&
          Array.isArray(response.data.results)
        ) {
          newsletterData = response.data.results;
        } else if (Array.isArray(response.data)) {
          newsletterData = response.data;
        }
      }

      setNewsletters(newsletterData);
      calculateStats(newsletterData);
    } catch (error) {
      console.error("Failed to load newsletters:", error);
      setNewsletters([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate statistics
   */
  const calculateStats = (data: Newsletter[]) => {
    setStats({
      total: data.length,
      sent: data.filter((n) => n.status === "sent").length,
      scheduled: data.filter((n) => n.status === "scheduled").length,
      drafts: data.filter((n) => n.status === "draft").length,
    });
  };

  /**
   * Filter newsletters based on search and status
   */
  const filterNewsletters = () => {
    let filtered = newsletters;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((n) => n.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((n) =>
        n.subject.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Sort by created date (newest first)
    filtered = filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    setFilteredNewsletters(filtered);
  };

  /**
   * Open delete dialog
   */
  const handleDeleteClick = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
    setDeleteDialogOpen(true);
  };

  /**
   * Delete newsletter
   */
  const handleDelete = async () => {
    if (!selectedNewsletter) return;

    setSubmitting(true);
    try {
      await api.delete(`/api/newsletter/newsletters/${selectedNewsletter.id}/`);
      setDeleteDialogOpen(false);
      setSelectedNewsletter(null);
      loadNewsletters();
    } catch (error) {
      console.error("Failed to delete newsletter:", error);
      alert("Failed to delete newsletter. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Open preview dialog
   */
  const handlePreviewClick = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
    setPreviewDialogOpen(true);
  };

  /**
   * Get status badge color
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
            <CheckCircle className="h-3 w-3" />
            Sent
          </span>
        );
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
            <Clock className="h-3 w-3" />
            Scheduled
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-800 rounded">
            <FileText className="h-3 w-3" />
            Draft
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
            <XCircle className="h-3 w-3" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Get open rate percentage
   */
  const getOpenRate = (newsletter: Newsletter) => {
    if (newsletter.total_recipients === 0) return 0;
    return Math.round(
      (newsletter.opened_count / newsletter.total_recipients) * 100,
    );
  };

  /**
   * Get click rate percentage
   */
  const getClickRate = (newsletter: Newsletter) => {
    if (newsletter.total_recipients === 0) return 0;
    return Math.round(
      (newsletter.clicked_count / newsletter.total_recipients) * 100,
    );
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
              <div>
                <h1 className="text-3xl font-light text-black">Newsletters</h1>
                <p className="text-sm text-neutral-500 mt-1">
                  Manage your newsletter campaigns
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={loadNewsletters}
                  className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Link href="/dashboard/newsletter/templates">
                  <Button
                    variant="outline"
                    className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Templates
                  </Button>
                </Link>
                <Link href="/dashboard/newsletter/new">
                  <Button className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-10 px-6">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Newsletter
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-7xl">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  {stats.total}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Total Newsletters
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  {stats.sent}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Sent
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  {stats.scheduled}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Scheduled
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <FileText className="h-5 w-5 text-neutral-400" />
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  {stats.drafts}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Drafts
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search newsletters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 border-neutral-300 focus:border-black rounded-none h-12 font-light"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-neutral-300 focus:border-black rounded-none h-12 font-light">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Newsletters List */}
          {filteredNewsletters.length === 0 ? (
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="p-16 text-center">
                <Mail className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
                <h3 className="text-2xl font-light text-black mb-3">
                  {newsletters.length === 0
                    ? "No newsletters yet"
                    : "No newsletters found"}
                </h3>
                <p className="text-neutral-600 font-light mb-8">
                  {newsletters.length === 0
                    ? "Create your first newsletter to engage with your subscribers"
                    : "Try adjusting your filters or search query"}
                </p>
                {newsletters.length === 0 && (
                  <Link href="/dashboard/newsletter/new">
                    <Button className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8">
                      Create Your First Newsletter
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredNewsletters.map((newsletter) => (
                <Card
                  key={newsletter.id}
                  className="border-neutral-200 rounded-none shadow-none hover:shadow-md transition-all"
                >
                  <CardHeader className="border-b border-neutral-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg font-medium truncate">
                            {newsletter.subject}
                          </CardTitle>
                          {getStatusBadge(newsletter.status)}
                        </div>
                        <CardDescription className="text-neutral-600 font-light">
                          {newsletter.status === "sent" &&
                            `Sent on ${formatDate(newsletter.sent_at)}`}
                          {newsletter.status === "scheduled" &&
                            `Scheduled for ${formatDate(
                              newsletter.scheduled_for,
                            )}`}
                          {newsletter.status === "draft" &&
                            `Created ${formatDate(newsletter.created_at)}`}
                          {newsletter.status === "failed" && "Failed to send"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                      <div>
                        <div className="text-xs text-neutral-500 mb-1">
                          Recipients
                        </div>
                        <div className="text-lg font-medium text-black">
                          {newsletter.total_recipients || 0}
                        </div>
                      </div>

                      {newsletter.status === "sent" && (
                        <>
                          <div>
                            <div className="text-xs text-neutral-500 mb-1">
                              Opened
                            </div>
                            <div className="text-lg font-medium text-black">
                              {newsletter.opened_count || 0} (
                              {getOpenRate(newsletter)}%)
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-neutral-500 mb-1">
                              Clicked
                            </div>
                            <div className="text-lg font-medium text-black">
                              {newsletter.clicked_count || 0} (
                              {getClickRate(newsletter)}%)
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-neutral-500 mb-1">
                              Engagement
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="flex-1 bg-neutral-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full transition-all"
                                  style={{
                                    width: `${getOpenRate(newsletter)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewClick(newsletter)}
                        className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-9"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Preview
                      </Button>

                      {newsletter.status === "sent" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-9"
                        >
                          <BarChart3 className="h-3.5 w-3.5 mr-1" />
                          View Analytics
                        </Button>
                      )}

                      {newsletter.status === "draft" && (
                        <Link
                          href={{
                            pathname: "/dashboard/newsletter/new",
                            query: {
                              subject: newsletter.subject,
                              content: newsletter.content,
                            },
                          }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-9"
                          >
                            <Send className="h-3.5 w-3.5 mr-1" />
                            Continue Editing
                          </Button>
                        </Link>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(newsletter)}
                        className="hover:bg-red-50 hover:text-red-600 rounded-none h-9 ml-auto"
                      >
                        <Trash className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredNewsletters.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-neutral-500 font-light">
                Showing {filteredNewsletters.length} of {newsletters.length}{" "}
                newsletters
              </p>
            </div>
          )}
        </div>

        {/* Preview Dialog */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="sm:max-w-2xl rounded-none border-neutral-200 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black">
                Newsletter Preview
              </DialogTitle>
            </DialogHeader>

            {selectedNewsletter && (
              <div className="py-4">
                <div className="mb-6 pb-4 border-b border-neutral-200">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-medium text-black">
                      {selectedNewsletter.subject}
                    </h3>
                    {getStatusBadge(selectedNewsletter.status)}
                  </div>
                  <p className="text-sm text-neutral-500">
                    {selectedNewsletter.status === "sent" &&
                      `Sent on ${formatDate(selectedNewsletter.sent_at)}`}
                    {selectedNewsletter.status === "scheduled" &&
                      `Scheduled for ${formatDate(
                        selectedNewsletter.scheduled_for,
                      )}`}
                    {selectedNewsletter.status === "draft" &&
                      `Created ${formatDate(selectedNewsletter.created_at)}`}
                  </p>
                </div>

                <div className="border border-neutral-200 p-6 bg-neutral-50 max-h-[400px] overflow-y-auto">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: selectedNewsletter.content
                        .replace(
                          /{{first_name}}/g,
                          "<strong>[First Name]</strong>",
                        )
                        .replace(/{{email}}/g, "<strong>[Email]</strong>")
                        .replace(/\n/g, "<br />"),
                    }}
                  />
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
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-none border-neutral-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-600" />
                Delete Newsletter
              </DialogTitle>
              <DialogDescription className="text-neutral-600 font-light pt-2">
                Are you sure you want to delete this newsletter? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>

            {selectedNewsletter && (
              <div className="py-4 border-y border-neutral-200 my-4">
                <h4 className="font-medium text-black mb-2">
                  {selectedNewsletter.subject}
                </h4>
                <p className="text-sm text-neutral-600">
                  Status: {selectedNewsletter.status}
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
                    Delete Newsletter
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

export default Newsletters;
