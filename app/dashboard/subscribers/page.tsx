"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export const dynamic = 'force-dynamic';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Search,
  Filter,
  Mail,
  Users,
  UserCheck,
  UserX,
  Clock,
  Download,
  Trash,
  AlertCircle,
  Calendar,
  MapPin,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import AdminRoute from "@/components/AdminRoute";

/**
 * Subscriber interface
 */
interface Subscriber {
  id: number;
  email: string;
  status: "active" | "pending" | "unsubscribed";
  subscribed_at: string;
  verified_at: string | null;
  unsubscribed_at: string | null;
  source: string;
  ip_address?: string;
}

/**
 * Subscriber statistics interface
 */
interface SubscriberStats {
  total: number;
  active: number;
  pending: number;
  unsubscribed: number;
  active_percentage: number;
  growth_rate?: number;
}

/**
 * Paginated API response
 */
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const ViewAllSubscribers = () => {
  const { user } = useAuth();
  const router = useRouter();

  // State
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  // Stats
  const [stats, setStats] = useState<SubscriberStats>({
    total: 0,
    active: 0,
    pending: 0,
    unsubscribed: 0,
    active_percentage: 0,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] =
    useState<Subscriber | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Verify dialog
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [subscriberToVerify, setSubscriberToVerify] =
    useState<Subscriber | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Export loading
  const [exportLoading, setExportLoading] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!user?.is_staff) {
      router.push("/");
    }
  }, [user, router]);

  // Load subscribers on mount
  useEffect(() => {
    if (user?.is_staff) {
      loadSubscribers();
      loadStats();
    }
  }, [user, currentPage]);

  // Filter subscribers when filters change
  useEffect(() => {
    filterSubscribers();
  }, [subscribers, searchQuery, statusFilter, sourceFilter]);

  /**
   * Load subscribers from API
   */
  const loadSubscribers = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await api.get<
        PaginatedResponse<Subscriber> | Subscriber[]
      >(
        `/api/newsletter/subscribers/?ordering=-subscribed_at&limit=${itemsPerPage}&offset=${offset}`,
      );

      if (response.data && typeof response.data === "object") {
        if ("results" in response.data) {
          // Paginated response
          setSubscribers(
            Array.isArray(response.data.results) ? response.data.results : [],
          );
          setTotalCount(response.data.count || 0);
          setTotalPages(Math.ceil((response.data.count || 0) / itemsPerPage));
        } else if (Array.isArray(response.data)) {
          // Direct array response
          setSubscribers(response.data);
          setTotalCount(response.data.length);
          setTotalPages(Math.ceil(response.data.length / itemsPerPage));
        } else {
          setSubscribers([]);
        }
      } else {
        setSubscribers([]);
      }
    } catch (error) {
      console.error("Failed to load subscribers:", error);
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load subscriber statistics
   */
  const loadStats = async () => {
    try {
      const response = await api.get<SubscriberStats>(
        "/api/newsletter/subscribers/stats/",
      );
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  /**
   * Filter subscribers based on search and filters
   */
  const filterSubscribers = () => {
    let filtered = [...subscribers];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    // Source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter((sub) => sub.source === sourceFilter);
    }

    // Search query
    if (searchQuery) {
      filtered = filtered.filter((sub) =>
        sub.email.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredSubscribers(filtered);
  };

  /**
   * Handle delete button click
   */
  const handleDeleteClick = (subscriber: Subscriber) => {
    setSubscriberToDelete(subscriber);
    setDeleteDialogOpen(true);
  };

  /**
   * Confirm delete
   */
  const handleConfirmDelete = async () => {
    if (!subscriberToDelete) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/api/newsletter/subscribers/${subscriberToDelete.id}/`);
      setSubscribers(
        subscribers.filter((sub) => sub.id !== subscriberToDelete.id),
      );
      setDeleteDialogOpen(false);
      setSubscriberToDelete(null);
      loadStats(); // Refresh stats
    } catch (error) {
      console.error("Failed to delete subscriber:", error);
      alert("Failed to delete subscriber. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  /**
   * Handle verify button click
   */
  const handleVerifyClick = (subscriber: Subscriber) => {
    setSubscriberToVerify(subscriber);
    setVerifyDialogOpen(true);
  };

  /**
   * Confirm verify
   */
  const handleConfirmVerify = async () => {
    if (!subscriberToVerify) return;

    setVerifyLoading(true);
    try {
      const response = await api.patch(
        `/api/newsletter/subscribers/${subscriberToVerify.id}/`,
        {
          status: "active",
          verified_at: new Date().toISOString(),
        },
      );

      // Update subscriber in state
      setSubscribers(
        subscribers.map((sub) =>
          sub.id === subscriberToVerify.id ? { ...sub, ...response.data } : sub,
        ),
      );

      setVerifyDialogOpen(false);
      setSubscriberToVerify(null);
      loadStats(); // Refresh stats
    } catch (error) {
      console.error("Failed to verify subscriber:", error);
      alert("Failed to verify subscriber. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  };

  /**
   * Export subscribers to CSV
   */
  const handleExport = async () => {
    try {
      setExportLoading(true);

      // Get all subscribers (not paginated)
      const response = await api.get<
        PaginatedResponse<Subscriber> | Subscriber[]
      >("/api/newsletter/subscribers/?limit=10000");

      let allSubscribers: Subscriber[] = [];
      if (response.data && typeof response.data === "object") {
        if ("results" in response.data) {
          allSubscribers = Array.isArray(response.data.results)
            ? response.data.results
            : [];
        } else if (Array.isArray(response.data)) {
          allSubscribers = response.data;
        }
      }

      // Create CSV content
      const headers = [
        "Email",
        "Status",
        "Subscribed At",
        "Verified At",
        "Source",
      ];
      const csvContent = [
        headers.join(","),
        ...allSubscribers.map((sub) =>
          [
            sub.email,
            sub.status,
            new Date(sub.subscribed_at).toLocaleString(),
            sub.verified_at
              ? new Date(sub.verified_at).toLocaleString()
              : "Not verified",
            sub.source || "Unknown",
          ].join(","),
        ),
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export subscribers:", error);
      alert("Failed to export subscribers. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "border-green-500 text-green-700 bg-green-50";
      case "pending":
        return "border-amber-500 text-amber-700 bg-amber-50";
      case "unsubscribed":
        return "border-red-500 text-red-700 bg-red-50";
      default:
        return "border-neutral-300 text-neutral-600 bg-neutral-50";
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "unsubscribed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Format time ago
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

  // Unique sources for filter
  const uniqueSources = Array.from(
    new Set(subscribers.map((sub) => sub.source).filter(Boolean)),
  );

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
                <Link href="/dashboard?tab=subscribers">
                  <Button
                    variant="ghost"
                    className="hover:bg-neutral-100 rounded-none h-10 w-10 p-0"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-light text-black">
                    Newsletter Subscribers
                  </h1>
                  <p className="text-sm text-neutral-500 mt-1">
                    Manage all newsletter subscribers
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={exportLoading}
                  className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                >
                  {exportLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => loadSubscribers()}
                  className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-7xl">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <Users className="h-5 w-5 text-neutral-400" />
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  {stats.total}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Total Subscribers
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <UserCheck className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-3xl font-light text-green-600 mb-1">
                  {stats.active}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Active
                </div>
                {stats.total > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    {stats.active_percentage.toFixed(1)}%
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div className="text-3xl font-light text-amber-600 mb-1">
                  {stats.pending}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Pending
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <UserX className="h-5 w-5 text-red-500" />
                </div>
                <div className="text-3xl font-light text-red-600 mb-1">
                  {stats.unsubscribed}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Unsubscribed
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 border-neutral-300 focus:border-black rounded-none h-12 font-light"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-neutral-300 focus:border-black rounded-none h-12 font-light">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending Verification</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="border-neutral-300 focus:border-black rounded-none h-12 font-light">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="all">All Sources</SelectItem>
                {uniqueSources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subscribers List */}
          {filteredSubscribers.length === 0 ? (
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="p-16 text-center">
                <Mail className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
                <h3 className="text-2xl font-light text-black mb-3">
                  {subscribers.length === 0
                    ? "No subscribers yet"
                    : "No subscribers match your filters"}
                </h3>
                <p className="text-neutral-600 font-light">
                  {subscribers.length === 0
                    ? "Subscribers will appear here when they sign up for your newsletter"
                    : "Try adjusting your search or filter criteria"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="p-0">
                {/* Table Header */}
                <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
                  <div className="grid grid-cols-12 gap-4 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                    <div className="col-span-4">Email</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Source</div>
                    <div className="col-span-2">Subscribed</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-neutral-200">
                  {filteredSubscribers.map((subscriber) => (
                    <div
                      key={subscriber.id}
                      className="px-6 py-4 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Email */}
                        <div className="col-span-4 min-w-0">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                            <p className="font-light text-black truncate">
                              {subscriber.email}
                            </p>
                          </div>
                          {subscriber.verified_at && (
                            <p className="text-xs text-neutral-500 mt-1">
                              Verified: {timeAgo(subscriber.verified_at)}
                            </p>
                          )}
                        </div>

                        {/* Status */}
                        <div className="col-span-2">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider px-3 py-1 border ${getStatusColor(
                              subscriber.status,
                            )}`}
                          >
                            {getStatusIcon(subscriber.status)}
                            {subscriber.status}
                          </span>
                        </div>

                        {/* Source */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-1 text-sm text-neutral-600">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">
                              {subscriber.source || "Unknown"}
                            </span>
                          </div>
                        </div>

                        {/* Subscribed Date */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-1 text-sm text-neutral-600">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="truncate">
                              {timeAgo(subscriber.subscribed_at)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="col-span-2 flex justify-end gap-2">
                          {subscriber.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerifyClick(subscriber)}
                              className="hover:bg-green-50 hover:text-green-600 rounded-none h-8 px-3"
                              title="Verify Subscriber"
                            >
                              <UserCheck className="h-3.5 w-3.5 mr-1" />
                              Verify
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(subscriber)}
                            className="hover:bg-red-50 hover:text-red-600 rounded-none h-8 w-8 p-0"
                            title="Delete Subscriber"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm text-neutral-500 font-light">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalCount)} of{" "}
                {totalCount} subscribers
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                >
                  Previous
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1,
                    )
                    .map((page, index, array) => (
                      <>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span
                            key={`ellipsis-${page}`}
                            className="px-3 py-2 text-neutral-400"
                          >
                            ...
                          </span>
                        )}
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                          className={`${
                            currentPage === page
                              ? "bg-black text-white"
                              : "border-neutral-300 text-neutral-600 hover:border-black hover:text-black"
                          } font-light rounded-none h-10 w-10`}
                        >
                          {page}
                        </Button>
                      </>
                    ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-none border-neutral-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-600" />
                Delete Subscriber
              </DialogTitle>
              <DialogDescription className="text-neutral-600 font-light pt-2">
                Are you sure you want to delete this subscriber? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>

            {subscriberToDelete && (
              <div className="py-4 border-y border-neutral-200 my-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-neutral-400" />
                  <p className="font-medium text-black">
                    {subscriberToDelete.email}
                  </p>
                </div>
                <div className="text-sm text-neutral-600">
                  <p>Status: {subscriberToDelete.status}</p>
                  <p>
                    Subscribed: {formatDate(subscriberToDelete.subscribed_at)}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleteLoading}
                className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="bg-red-600 text-white hover:bg-red-700 font-light rounded-none h-10"
              >
                {deleteLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Trash className="h-4 w-4" />
                    Delete Permanently
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Verify Confirmation Dialog */}
        <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-none border-neutral-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black">
                Verify Subscriber
              </DialogTitle>
              <DialogDescription className="text-neutral-600 font-light pt-2">
                This will mark the subscriber as verified and change their
                status to active.
              </DialogDescription>
            </DialogHeader>

            {subscriberToVerify && (
              <div className="py-4 border-y border-neutral-200 my-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-neutral-400" />
                  <p className="font-medium text-black">
                    {subscriberToVerify.email}
                  </p>
                </div>
                <div className="text-sm text-neutral-600">
                  <p>Current Status: {subscriberToVerify.status}</p>
                  <p>
                    Subscribed: {formatDate(subscriberToVerify.subscribed_at)}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVerifyDialogOpen(false)}
                disabled={verifyLoading}
                className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmVerify}
                disabled={verifyLoading}
                className="bg-green-600 text-white hover:bg-green-700 font-light rounded-none h-10"
              >
                {verifyLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Verify Subscriber
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

export default ViewAllSubscribers;
