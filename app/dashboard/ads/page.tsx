"use client";

export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";
import Link from "next/link";
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
  PlusCircle,
  Search,
  Filter,
  Edit,
  Trash,
  Eye,
  Image as ImageIcon,
  PlayCircle,
  Code,
  TrendingUp,
  MousePointerClick,
  Calendar,
  Play,
  Pause,
  AlertCircle,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import AdminRoute from "@/components/AdminRoute";

/**
 * Advertisement interface
 */
interface Advertisement {
  id: number;
  title: string;
  slug: string;
  ad_type: "image" | "video" | "html";
  ad_type_display: string;
  image?: string;
  image_alt?: string;
  video_url?: string;
  video_thumbnail?: string;
  html_content?: string;
  link_url: string;
  cta_text?: string;
  open_in_new_tab: boolean;
  placement: string;
  placement_display: string;
  status: "draft" | "active" | "paused" | "expired";
  status_display: string;
  start_date?: string;
  end_date?: string;
  priority: number;
  impressions: number;
  clicks: number;
  click_through_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

/**
 * Ad statistics interface
 */
interface AdStats {
  total_ads: number;
  active_ads: number;
  paused_ads: number;
  expired_ads: number;
  draft_ads: number;
  total_impressions: number;
  total_clicks: number;
  avg_ctr: number;
}

export const ManageAds = () => {
  const { user } = useAuth();
  const router = useRouter();

  // State
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [filteredAds, setFilteredAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [placementFilter, setPlacementFilter] = useState<string>("all");

  // Stats
  const [stats, setStats] = useState<AdStats>({
    total_ads: 0,
    active_ads: 0,
    paused_ads: 0,
    expired_ads: 0,
    draft_ads: 0,
    total_impressions: 0,
    total_clicks: 0,
    avg_ctr: 0,
  });

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<Advertisement | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Status change dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [adToChangeStatus, setAdToChangeStatus] =
    useState<Advertisement | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [statusLoading, setStatusLoading] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!user?.is_staff) {
      router.push("/");
    }
  }, [user, router]);

  // Load ads on mount
  useEffect(() => {
    if (user?.is_staff) {
      loadAds();
    }
  }, [user]);

  // Filter ads when filters change
  useEffect(() => {
    filterAds();
  }, [ads, searchQuery, statusFilter, typeFilter, placementFilter]);

  /**
   * Load advertisements from API
   */
  const loadAds = async () => {
    try {
      setLoading(true);
      const response = await api.get<
        PaginatedResponse<Advertisement> | Advertisement[]
      >("/api/ads/?ordering=-created_at");

      let adsData: Advertisement[] = [];
      if (response.data && typeof response.data === "object") {
        if ("results" in response.data) {
          adsData = Array.isArray(response.data.results)
            ? response.data.results
            : [];
        } else if (Array.isArray(response.data)) {
          adsData = response.data;
        }
      }

      setAds(adsData);
      calculateStats(adsData);
    } catch (error) {
      console.error("Failed to load ads:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate statistics from ads data
   */
  const calculateStats = (adsData: Advertisement[]) => {
    const stats = {
      total_ads: adsData.length,
      active_ads: adsData.filter((ad) => ad.status === "active").length,
      paused_ads: adsData.filter((ad) => ad.status === "paused").length,
      expired_ads: adsData.filter((ad) => ad.status === "expired").length,
      draft_ads: adsData.filter((ad) => ad.status === "draft").length,
      total_impressions: adsData.reduce((sum, ad) => sum + ad.impressions, 0),
      total_clicks: adsData.reduce((sum, ad) => sum + ad.clicks, 0),
      avg_ctr: 0,
    };

    if (stats.total_impressions > 0) {
      stats.avg_ctr = (stats.total_clicks / stats.total_impressions) * 100;
    }

    setStats(stats);
  };

  /**
   * Filter ads based on search and filters
   */
  const filterAds = () => {
    let filtered = [...ads];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((ad) => ad.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((ad) => ad.ad_type === typeFilter);
    }

    // Placement filter
    if (placementFilter !== "all") {
      filtered = filtered.filter((ad) => ad.placement === placementFilter);
    }

    // Search query
    if (searchQuery) {
      filtered = filtered.filter(
        (ad) =>
          ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ad.placement_display
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredAds(filtered);
  };

  /**
   * Handle delete button click
   */
  const handleDeleteClick = (ad: Advertisement) => {
    setAdToDelete(ad);
    setDeleteDialogOpen(true);
  };

  /**
   * Confirm delete
   */
  const handleConfirmDelete = async () => {
    if (!adToDelete) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/api/ads/${adToDelete.slug}/`);
      setAds(ads.filter((ad) => ad.id !== adToDelete.id));
      setDeleteDialogOpen(false);
      setAdToDelete(null);
    } catch (error) {
      console.error("Failed to delete ad:", error);
      alert("Failed to delete advertisement. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  /**
   * Handle status change click
   */
  const handleStatusChangeClick = (
    ad: Advertisement,
    status: "active" | "paused",
  ) => {
    setAdToChangeStatus(ad);
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  /**
   * Confirm status change
   */
  const handleConfirmStatusChange = async () => {
    if (!adToChangeStatus) return;

    setStatusLoading(true);
    try {
      const response = await api.patch(`/api/ads/${adToChangeStatus.slug}/`, {
        status: newStatus,
      });

      // Update the ad in state
      setAds(
        ads.map((ad) =>
          ad.id === adToChangeStatus.id ? { ...ad, ...response.data } : ad,
        ),
      );

      setStatusDialogOpen(false);
      setAdToChangeStatus(null);
      setNewStatus("");
    } catch (error) {
      console.error("Failed to change status:", error);
      alert("Failed to change advertisement status. Please try again.");
    } finally {
      setStatusLoading(false);
    }
  };

  /**
   * Manually trigger ad expiration
   */
  const handleExpireOldAds = async () => {
    try {
      const response = await api.post("/api/ads/expire_ads/");
      alert(response.data.message);
      loadAds(); // Reload to show updated statuses
    } catch (error) {
      console.error("Failed to expire ads:", error);
      alert("Failed to expire old advertisements.");
    }
  };

  /**
   * Get ad type icon
   */
  const getAdTypeIcon = (adType: string) => {
    switch (adType) {
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      case "video":
        return <PlayCircle className="h-4 w-4" />;
      case "html":
        return <Code className="h-4 w-4" />;
      default:
        return <ImageIcon className="h-4 w-4" />;
    }
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "border-green-500 text-green-700 bg-green-50";
      case "paused":
        return "border-amber-500 text-amber-700 bg-amber-50";
      case "expired":
        return "border-red-500 text-red-700 bg-red-50";
      case "draft":
        return "border-neutral-300 text-neutral-600 bg-neutral-50";
      default:
        return "border-neutral-300 text-neutral-600 bg-neutral-50";
    }
  };

  /**
   * Format number with K/M suffix
   */
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
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

  // Unique placements for filter
  const uniquePlacements = Array.from(new Set(ads.map((ad) => ad.placement)));

  if (loading) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminRoute>
    );
  }

  // Generate page metadata
  const pageTitle = `Manage Advertisements (${stats.total_ads}) | BitsBlog Admin`;
  const pageDescription = `Manage ${stats.total_ads} advertisements: ${
    stats.active_ads
  } active, ${stats.paused_ads} paused. ${formatNumber(
    stats.total_impressions,
  )} total impressions with ${stats.avg_ctr.toFixed(2)}% average CTR.`;

  return (
    <AdminRoute>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard?tab=ads">
                  <Button
                    variant="ghost"
                    className="hover:bg-neutral-100 rounded-none h-10 w-10 p-0"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-light text-black">
                    Manage Advertisements
                  </h1>
                  <p className="text-sm text-neutral-500 mt-1">
                    View and manage all your advertisement campaigns
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleExpireOldAds}
                  className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                  title="Manually expire old ads"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Expire Old Ads
                </Button>
                <Link href="/dashboard/ads/new">
                  <Button className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-10 px-6">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Advertisement
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-7xl">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="text-2xl font-light text-black mb-1">
                  {stats.total_ads}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Total
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="text-2xl font-light text-green-600 mb-1">
                  {stats.active_ads}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Active
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="text-2xl font-light text-amber-600 mb-1">
                  {stats.paused_ads}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Paused
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="text-2xl font-light text-red-600 mb-1">
                  {stats.expired_ads}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Expired
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="text-2xl font-light text-neutral-600 mb-1">
                  {stats.draft_ads}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Drafts
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="text-2xl font-light text-black mb-1">
                  {formatNumber(stats.total_impressions)}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Views
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="text-2xl font-light text-black mb-1">
                  {formatNumber(stats.total_clicks)}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Clicks
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="text-2xl font-light text-black mb-1">
                  {stats.avg_ctr.toFixed(2)}%
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Avg CTR
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search ads..."
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
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="border-neutral-300 focus:border-black rounded-none h-12 font-light">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Image Ads</SelectItem>
                <SelectItem value="video">Video Ads</SelectItem>
                <SelectItem value="html">HTML Ads</SelectItem>
              </SelectContent>
            </Select>

            <Select value={placementFilter} onValueChange={setPlacementFilter}>
              <SelectTrigger className="border-neutral-300 focus:border-black rounded-none h-12 font-light">
                <SelectValue placeholder="All Placements" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="all">All Placements</SelectItem>
                {uniquePlacements.map((placement) => {
                  const ad = ads.find((a) => a.placement === placement);
                  return (
                    <SelectItem key={placement} value={placement}>
                      {ad?.placement_display || placement}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Ads List */}
          {filteredAds.length === 0 ? (
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="p-16 text-center">
                <BarChart3 className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
                <h3 className="text-2xl font-light text-black mb-3">
                  {ads.length === 0
                    ? "No advertisements yet"
                    : "No ads match your filters"}
                </h3>
                <p className="text-neutral-600 font-light mb-8">
                  {ads.length === 0
                    ? "Create your first ad to start monetizing your blog"
                    : "Try adjusting your search or filter criteria"}
                </p>
                {ads.length === 0 && (
                  <Link href="/dashboard/ads/new">
                    <Button className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8">
                      Create Your First Ad
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="p-0">
                <div className="divide-y divide-neutral-200">
                  {filteredAds.map((ad) => (
                    <div
                      key={ad.id}
                      className="p-6 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-start gap-6">
                        {/* Ad Preview */}
                        <div className="w-24 h-24 bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                          {ad.image ? (
                            <img
                              src={ad.image}
                              alt={ad.image_alt || ad.title}
                              className="w-full h-full object-cover"
                            />
                          ) : ad.video_thumbnail ? (
                            <img
                              src={ad.video_thumbnail}
                              alt={ad.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-neutral-400">
                              {getAdTypeIcon(ad.ad_type)}
                            </div>
                          )}
                        </div>

                        {/* Ad Details */}
                        <div className="flex-1 min-w-0">
                          {/* Title and Status */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-light text-black mb-2 truncate">
                                {ad.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`text-xs font-medium uppercase tracking-wider px-3 py-1 border ${getStatusColor(
                                    ad.status,
                                  )}`}
                                >
                                  {ad.status_display}
                                </span>
                                <span className="text-xs border border-neutral-300 px-3 py-1 flex items-center gap-1">
                                  {getAdTypeIcon(ad.ad_type)}
                                  {ad.ad_type_display}
                                </span>
                                <span className="text-xs border border-neutral-300 px-3 py-1">
                                  {ad.placement_display}
                                </span>
                                <span className="text-xs text-neutral-500">
                                  Priority: {ad.priority}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Dates */}
                          {(ad.start_date || ad.end_date) && (
                            <div className="flex items-center gap-4 text-xs text-neutral-600 mb-3">
                              {ad.start_date && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  Start: {formatDate(ad.start_date)}
                                </div>
                              )}
                              {ad.end_date && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  End: {formatDate(ad.end_date)}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Metrics */}
                          <div className="flex flex-wrap items-center gap-6 text-sm">
                            <div className="flex items-center gap-2 text-neutral-600">
                              <Eye className="h-4 w-4" />
                              <span>{formatNumber(ad.impressions)} views</span>
                            </div>
                            <div className="flex items-center gap-2 text-neutral-600">
                              <MousePointerClick className="h-4 w-4" />
                              <span>{formatNumber(ad.clicks)} clicks</span>
                            </div>
                            <div className="flex items-center gap-2 text-neutral-600">
                              <TrendingUp className="h-4 w-4" />
                              <span>
                                {ad.click_through_rate.toFixed(2)}% CTR
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 shrink-0">
                          <Link href={`/dashboard/ads/edit/${ad.slug}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-neutral-200 rounded-none h-10 w-10 p-0"
                              title="Edit Ad"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>

                          {ad.status === "active" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleStatusChangeClick(ad, "paused")
                              }
                              className="hover:bg-amber-50 hover:text-amber-600 rounded-none h-10 w-10 p-0"
                              title="Pause Ad"
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : ad.status === "paused" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleStatusChangeClick(ad, "active")
                              }
                              className="hover:bg-green-50 hover:text-green-600 rounded-none h-10 w-10 p-0"
                              title="Activate Ad"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          ) : null}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(ad)}
                            className="hover:bg-red-50 hover:text-red-600 rounded-none h-10 w-10 p-0"
                            title="Delete Ad"
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

          {/* Results count */}
          {filteredAds.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-neutral-500 font-light">
                Showing {filteredAds.length} of {ads.length} advertisements
              </p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-none border-neutral-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-600" />
                Delete Advertisement
              </DialogTitle>
              <DialogDescription className="text-neutral-600 font-light pt-2">
                Are you sure you want to delete this advertisement? This action
                cannot be undone. All analytics data will be permanently lost.
              </DialogDescription>
            </DialogHeader>

            {adToDelete && (
              <div className="py-4 border-y border-neutral-200 my-4">
                <h4 className="font-medium text-black mb-2">
                  {adToDelete.title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <span>{adToDelete.placement_display}</span>
                  <span>â€¢</span>
                  <span>
                    {formatNumber(adToDelete.impressions)} impressions
                  </span>
                  <span>â€¢</span>
                  <span>{formatNumber(adToDelete.clicks)} clicks</span>
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

        {/* Status Change Dialog */}
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-none border-neutral-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black">
                {newStatus === "active" ? "Activate" : "Pause"} Advertisement
              </DialogTitle>
              <DialogDescription className="text-neutral-600 font-light pt-2">
                {newStatus === "active"
                  ? "This will make the advertisement active and visible to users."
                  : "This will pause the advertisement. It won't be shown to users until reactivated."}
              </DialogDescription>
            </DialogHeader>

            {adToChangeStatus && (
              <div className="py-4 border-y border-neutral-200 my-4">
                <h4 className="font-medium text-black mb-2">
                  {adToChangeStatus.title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <span>{adToChangeStatus.placement_display}</span>
                  <span>â€¢</span>
                  <span>Current: {adToChangeStatus.status_display}</span>
                </div>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStatusDialogOpen(false)}
                disabled={statusLoading}
                className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={statusLoading}
                className={`${
                  newStatus === "active"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-amber-600 hover:bg-amber-700"
                } text-white font-light rounded-none h-10`}
              >
                {statusLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {newStatus === "active" ? (
                      <Play className="h-4 w-4" />
                    ) : (
                      <Pause className="h-4 w-4" />
                    )}
                    {newStatus === "active" ? "Activate" : "Pause"} Ad
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

export default ManageAds;

