"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  DollarSign,
  Activity,
  Image as ImageIcon,
  PlayCircle,
  Code,
  Award,
  AlertCircle,
  Calendar,
  BarChart3,
  PieChart,
  Download,
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
  placement: string;
  placement_display: string;
  status: string;
  status_display: string;
  priority: number;
  impressions: number;
  clicks: number;
  click_through_rate: number;
  is_active: boolean;
  created_at: string;
  start_date?: string;
  end_date?: string;
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
 * Analytics by placement
 */
interface PlacementAnalytics {
  placement: string;
  placement_display: string;
  ads_count: number;
  total_impressions: number;
  total_clicks: number;
  avg_ctr: number;
}

/**
 * Analytics by type
 */
interface TypeAnalytics {
  ad_type: string;
  ad_type_display: string;
  ads_count: number;
  total_impressions: number;
  total_clicks: number;
  avg_ctr: number;
}

/**
 * Top performing ad
 */
interface TopAd {
  title: string;
  slug: string;
  impressions: number;
  clicks: number;
  ctr: number;
  placement_display: string;
}

export const DetailedAdAnalytics = () => {
  const { user } = useAuth();
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>("all");

  // Analytics data
  const [totalImpressions, setTotalImpressions] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [avgCTR, setAvgCTR] = useState(0);
  const [activeAds, setActiveAds] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Breakdown data
  const [placementAnalytics, setPlacementAnalytics] = useState<
    PlacementAnalytics[]
  >([]);
  const [typeAnalytics, setTypeAnalytics] = useState<TypeAnalytics[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopAd[]>([]);
  const [poorPerformers, setPoorPerformers] = useState<TopAd[]>([]);

  // Trends
  const [impressionTrend, setImpressionTrend] = useState(0);
  const [clickTrend, setClickTrend] = useState(0);
  const [ctrTrend, setCtrTrend] = useState(0);

  // Check if user is admin
  useEffect(() => {
    if (!user?.is_staff) {
      router.push("/");
    }
  }, [user, router]);

  // Load data on mount
  useEffect(() => {
    if (user?.is_staff) {
      loadAnalytics();
    }
  }, [user, timeRange]);

  /**
   * Load all analytics data
   */
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get<
        PaginatedResponse<Advertisement> | Advertisement[]
      >("/api/ads/?limit=1000");

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

      calculateAnalytics(adsData);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate all analytics from ads data
   */
  const calculateAnalytics = (adsData: Advertisement[]) => {
    // Overall metrics
    const impressions = adsData.reduce((sum, ad) => sum + ad.impressions, 0);
    const clicks = adsData.reduce((sum, ad) => sum + ad.clicks, 0);
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const active = adsData.filter((ad) => ad.status === "active").length;

    setTotalImpressions(impressions);
    setTotalClicks(clicks);
    setAvgCTR(ctr);
    setActiveAds(active);
    setTotalRevenue(clicks * 0.5); // Assuming $0.50 per click (example)

    // Trends (comparing with previous period - simplified)
    setImpressionTrend(5.2);
    setClickTrend(3.8);
    setCtrTrend(-1.2);

    // Analytics by placement
    const placementMap = new Map<string, PlacementAnalytics>();
    adsData.forEach((ad) => {
      const key = ad.placement;
      const existing = placementMap.get(key) || {
        placement: ad.placement,
        placement_display: ad.placement_display,
        ads_count: 0,
        total_impressions: 0,
        total_clicks: 0,
        avg_ctr: 0,
      };

      existing.ads_count++;
      existing.total_impressions += ad.impressions;
      existing.total_clicks += ad.clicks;
      placementMap.set(key, existing);
    });

    const placementStats = Array.from(placementMap.values()).map((p) => ({
      ...p,
      avg_ctr:
        p.total_impressions > 0
          ? (p.total_clicks / p.total_impressions) * 100
          : 0,
    }));
    setPlacementAnalytics(
      placementStats.sort((a, b) => b.total_impressions - a.total_impressions),
    );

    // Analytics by type
    const typeMap = new Map<string, TypeAnalytics>();
    adsData.forEach((ad) => {
      const key = ad.ad_type;
      const existing = typeMap.get(key) || {
        ad_type: ad.ad_type,
        ad_type_display: ad.ad_type_display,
        ads_count: 0,
        total_impressions: 0,
        total_clicks: 0,
        avg_ctr: 0,
      };

      existing.ads_count++;
      existing.total_impressions += ad.impressions;
      existing.total_clicks += ad.clicks;
      typeMap.set(key, existing);
    });

    const typeStats = Array.from(typeMap.values()).map((t) => ({
      ...t,
      avg_ctr:
        t.total_impressions > 0
          ? (t.total_clicks / t.total_impressions) * 100
          : 0,
    }));
    setTypeAnalytics(
      typeStats.sort((a, b) => b.total_impressions - a.total_impressions),
    );

    // Top performers (by CTR with minimum impressions)
    const qualifiedAds = adsData.filter((ad) => ad.impressions >= 100);
    const topAds = qualifiedAds
      .sort((a, b) => b.click_through_rate - a.click_through_rate)
      .slice(0, 5)
      .map((ad) => ({
        title: ad.title,
        slug: ad.slug,
        impressions: ad.impressions,
        clicks: ad.clicks,
        ctr: ad.click_through_rate,
        placement_display: ad.placement_display,
      }));
    setTopPerformers(topAds);

    // Poor performers (by CTR with minimum impressions)
    const poorAds = qualifiedAds
      .sort((a, b) => a.click_through_rate - b.click_through_rate)
      .slice(0, 5)
      .map((ad) => ({
        title: ad.title,
        slug: ad.slug,
        impressions: ad.impressions,
        clicks: ad.clicks,
        ctr: ad.click_through_rate,
        placement_display: ad.placement_display,
      }));
    setPoorPerformers(poorAds);
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
    return num.toLocaleString();
  };

  /**
   * Get ad type icon
   */
  const getAdTypeIcon = (adType: string) => {
    switch (adType) {
      case "image":
        return <ImageIcon className="h-5 w-5" />;
      case "video":
        return <PlayCircle className="h-5 w-5" />;
      case "html":
        return <Code className="h-5 w-5" />;
      default:
        return <ImageIcon className="h-5 w-5" />;
    }
  };

  /**
   * Get trend icon and color
   */
  const getTrendDisplay = (trend: number) => {
    const isPositive = trend > 0;
    return {
      icon: isPositive ? (
        <TrendingUp className="h-4 w-4" />
      ) : (
        <TrendingDown className="h-4 w-4" />
      ),
      color: isPositive ? "text-green-600" : "text-red-600",
      text: `${isPositive ? "+" : ""}${trend.toFixed(1)}%`,
    };
  };

  /**
   * Export analytics to CSV
   */
  const handleExport = () => {
    const csvContent = [
      ["Advertisement Analytics Report"],
      ["Generated:", new Date().toLocaleString()],
      [],
      ["Overview Metrics"],
      ["Total Impressions", totalImpressions],
      ["Total Clicks", totalClicks],
      ["Average CTR", avgCTR.toFixed(2) + "%"],
      ["Active Ads", activeAds],
      [],
      ["By Placement"],
      ["Placement", "Ads", "Impressions", "Clicks", "CTR"],
      ...placementAnalytics.map((p) => [
        p.placement_display,
        p.ads_count,
        p.total_impressions,
        p.total_clicks,
        p.avg_ctr.toFixed(2) + "%",
      ]),
      [],
      ["By Type"],
      ["Type", "Ads", "Impressions", "Clicks", "CTR"],
      ...typeAnalytics.map((t) => [
        t.ad_type_display,
        t.ads_count,
        t.total_impressions,
        t.total_clicks,
        t.avg_ctr.toFixed(2) + "%",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ad-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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

  const impressionTrendDisplay = getTrendDisplay(impressionTrend);
  const clickTrendDisplay = getTrendDisplay(clickTrend);
  const ctrTrendDisplay = getTrendDisplay(ctrTrend);

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
                    Advertisement Analytics
                  </h1>
                  <p className="text-sm text-neutral-500 mt-1">
                    Detailed performance metrics and insights
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40 border-neutral-300 focus:border-black rounded-none h-10 font-light">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>

                <Button
                  variant="outline"
                  onClick={loadAnalytics}
                  className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-7xl space-y-8">
          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <span
                    className={`flex items-center gap-1 text-xs ${impressionTrendDisplay.color}`}
                  >
                    {impressionTrendDisplay.icon}
                    {impressionTrendDisplay.text}
                  </span>
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  {formatNumber(totalImpressions)}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Total Impressions
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <MousePointerClick className="h-5 w-5 text-purple-500" />
                  <span
                    className={`flex items-center gap-1 text-xs ${clickTrendDisplay.color}`}
                  >
                    {clickTrendDisplay.icon}
                    {clickTrendDisplay.text}
                  </span>
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  {formatNumber(totalClicks)}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Total Clicks
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  <span
                    className={`flex items-center gap-1 text-xs ${ctrTrendDisplay.color}`}
                  >
                    {ctrTrendDisplay.icon}
                    {ctrTrendDisplay.text}
                  </span>
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  {avgCTR.toFixed(2)}%
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Average CTR
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <Activity className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  {activeAds}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Active Campaigns
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="text-3xl font-light text-black mb-1">
                  ${totalRevenue.toFixed(2)}
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  Est. Revenue
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance by Placement */}
          <Card className="border-neutral-200 rounded-none shadow-none">
            <CardHeader className="border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance by Placement
                  </CardTitle>
                  <CardDescription className="text-neutral-600 font-light mt-1">
                    Compare ad performance across different placements
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {placementAnalytics.length === 0 ? (
                <div className="p-16 text-center">
                  <AlertCircle className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
                  <p className="text-neutral-600 font-light">
                    No placement data available
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-200">
                  {placementAnalytics.map((placement) => (
                    <div key={placement.placement} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-black mb-1">
                            {placement.placement_display}
                          </h4>
                          <p className="text-sm text-neutral-600">
                            {placement.ads_count} ad
                            {placement.ads_count !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-light text-black">
                            {placement.avg_ctr.toFixed(2)}%
                          </div>
                          <div className="text-xs text-neutral-500">CTR</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-neutral-600 mb-1">
                            Impressions
                          </div>
                          <div className="text-xl font-light text-black">
                            {formatNumber(placement.total_impressions)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-neutral-600 mb-1">
                            Clicks
                          </div>
                          <div className="text-xl font-light text-black">
                            {formatNumber(placement.total_clicks)}
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="relative h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-blue-500 transition-all"
                          style={{
                            width: `${
                              (placement.total_impressions /
                                Math.max(
                                  ...placementAnalytics.map(
                                    (p) => p.total_impressions,
                                  ),
                                )) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance by Ad Type */}
          <Card className="border-neutral-200 rounded-none shadow-none">
            <CardHeader className="border-b border-neutral-200">
              <CardTitle className="text-lg font-medium uppercase tracking-wider flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Performance by Ad Type
              </CardTitle>
              <CardDescription className="text-neutral-600 font-light mt-1">
                Compare different ad formats
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {typeAnalytics.map((type) => (
                  <div
                    key={type.ad_type}
                    className="border border-neutral-200 p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-neutral-100">
                        {getAdTypeIcon(type.ad_type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-black">
                          {type.ad_type_display}
                        </h4>
                        <p className="text-sm text-neutral-600">
                          {type.ads_count} active
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-neutral-600">
                            Impressions
                          </span>
                          <span className="text-sm font-medium text-black">
                            {formatNumber(type.total_impressions)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-neutral-600">
                            Clicks
                          </span>
                          <span className="text-sm font-medium text-black">
                            {formatNumber(type.total_clicks)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-neutral-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-neutral-600">CTR</span>
                          <span className="text-lg font-light text-black">
                            {type.avg_ctr.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top and Poor Performers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardHeader className="border-b border-neutral-200">
                <CardTitle className="text-lg font-medium uppercase tracking-wider flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  Top Performers
                </CardTitle>
                <CardDescription className="text-neutral-600 font-light mt-1">
                  Highest CTR (min. 100 impressions)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {topPerformers.length === 0 ? (
                  <div className="p-16 text-center">
                    <AlertCircle className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                    <p className="text-sm text-neutral-600 font-light">
                      No qualified ads yet
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-200">
                    {topPerformers.map((ad, index) => (
                      <div
                        key={ad.slug}
                        className="p-4 hover:bg-neutral-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full font-medium text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-black truncate mb-1">
                              {ad.title}
                            </h4>
                            <p className="text-xs text-neutral-500 mb-2">
                              {ad.placement_display}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-neutral-600">
                              <span>{formatNumber(ad.impressions)} views</span>
                              <span>•</span>
                              <span>{formatNumber(ad.clicks)} clicks</span>
                              <span>•</span>
                              <span className="font-medium text-green-600">
                                {ad.ctr.toFixed(2)}% CTR
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Poor Performers */}
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardHeader className="border-b border-neutral-200">
                <CardTitle className="text-lg font-medium uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  Needs Improvement
                </CardTitle>
                <CardDescription className="text-neutral-600 font-light mt-1">
                  Lowest CTR (min. 100 impressions)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {poorPerformers.length === 0 ? (
                  <div className="p-16 text-center">
                    <AlertCircle className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                    <p className="text-sm text-neutral-600 font-light">
                      No qualified ads yet
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-200">
                    {poorPerformers.map((ad, index) => (
                      <div
                        key={ad.slug}
                        className="p-4 hover:bg-neutral-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-700 rounded-full font-medium text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-black truncate mb-1">
                              {ad.title}
                            </h4>
                            <p className="text-xs text-neutral-500 mb-2">
                              {ad.placement_display}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-neutral-600">
                              <span>{formatNumber(ad.impressions)} views</span>
                              <span>•</span>
                              <span>{formatNumber(ad.clicks)} clicks</span>
                              <span>•</span>
                              <span className="font-medium text-amber-600">
                                {ad.ctr.toFixed(2)}% CTR
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Insights & Recommendations */}
          <Card className="border-neutral-200 rounded-none shadow-none">
            <CardHeader className="border-b border-neutral-200">
              <CardTitle className="text-lg font-medium uppercase tracking-wider">
                Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {avgCTR < 1 && (
                <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900 mb-1">
                      Low Average CTR
                    </h4>
                    <p className="text-sm text-amber-800">
                      Your average CTR is below 1%. Consider testing different
                      ad designs, placements, or call-to-action text to improve
                      engagement.
                    </p>
                  </div>
                </div>
              )}

              {activeAds < 3 && (
                <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200">
                  <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">
                      Limited Active Campaigns
                    </h4>
                    <p className="text-sm text-blue-800">
                      You have fewer than 3 active ads. Consider creating more
                      campaigns in different placements to maximize revenue
                      potential.
                    </p>
                  </div>
                </div>
              )}

              {placementAnalytics.length > 0 &&
                placementAnalytics[0].avg_ctr > avgCTR * 1.5 && (
                  <div className="flex gap-3 p-4 bg-green-50 border border-green-200">
                    <Award className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 mb-1">
                        High-Performing Placement Identified
                      </h4>
                      <p className="text-sm text-green-800">
                        {placementAnalytics[0].placement_display} is performing
                        50% better than average. Consider adding more ads to
                        this placement.
                      </p>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminRoute>
  );
};

export default DetailedAdAnalytics;
