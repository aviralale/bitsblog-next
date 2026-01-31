"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { postAPI } from "@/api/services";
import { type Post } from "@/types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import AdminRoute from "@/components/AdminRoute";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  PlusCircle,
  Edit,
  Trash,
  Eye,
  FileText,
  MessageSquare,
  TrendingUp,
  Search,
  Filter,
  Calendar,
  ShieldAlert,
  Send,
  Archive,
  Mail,
  Users,
  UserCheck,
  UserX,
  Clock,
  BarChart3,
  Activity,
  DollarSign,
  MousePointerClick,
  Image,
  PlayCircle,
  Code,
  CheckCircle,
  XCircle,
  PhoneCall,
  AlertCircle,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/api/axios";

/**
 * Subscriber statistics interface
 */
interface SubscriberStats {
  total: number;
  active: number;
  pending: number;
  unsubscribed: number;
  recent?: number;
  active_percentage?: number;
}

/**
 * Recent subscriber interface
 */
interface RecentSubscriber {
  id: number;
  email: string;
  status: "active" | "pending" | "unsubscribed";
  subscribed_at: string;
  verified_at: string | null;
  source: string;
}

/**
 * Newsletter stats interface
 */
interface NewsletterOverview {
  total_sent: number;
  avg_open_rate: number;
  avg_click_rate: number;
  total_recipients: number;
}

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
 * Advertisement interface
 */
interface Advertisement {
  id: number;
  title: string;
  slug: string;
  ad_type: "image" | "video" | "html";
  ad_type_display: string;
  image?: string;
  video_url?: string;
  html_content?: string;
  link_url: string;
  placement: string;
  placement_display: string;
  priority: number;
  impressions: number;
  clicks: number;
  click_through_rate: number;
  is_active: boolean;
  created_at: string;
}

/**
 * Ad statistics interface
 */
interface AdStats {
  total_ads: number;
  active_ads: number;
  total_impressions: number;
  total_clicks: number;
  avg_ctr: number;
}

interface ContactStats {
  total: number;
  new: number;
  in_progress: number;
  resolved: number;
  urgent_pending: number;
  recent_7_days: number;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  category_display: string;
  message: string;
  status: "new" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
  replies_count: number;
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

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [queryTab, setQueryTab] = useState<string | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Newsletter subscription state
  const [subscriberStats, setSubscriberStats] = useState<SubscriberStats>({
    total: 0,
    active: 0,
    pending: 0,
    unsubscribed: 0,
    recent: 0,
    active_percentage: 0,
  });
  const [recentSubscribers, setRecentSubscribers] = useState<
    RecentSubscriber[]
  >([]);
  const [newsletterOverview, setNewsletterOverview] =
    useState<NewsletterOverview>({
      total_sent: 0,
      avg_open_rate: 0,
      avg_click_rate: 0,
      total_recipients: 0,
    });
  const [subscribersLoading, setSubscribersLoading] = useState(false);

  // Newsletter state
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [newsletterStats, setNewsletterStats] = useState<NewsletterStats>({
    total: 0,
    sent: 0,
    scheduled: 0,
    drafts: 0,
  });
  const [newslettersLoading, setNewslettersLoading] = useState(false);

  // Advertisement state
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [adStats, setAdStats] = useState<AdStats>({
    total_ads: 0,
    active_ads: 0,
    total_impressions: 0,
    total_clicks: 0,
    avg_ctr: 0,
  });
  const [adsLoading, setAdsLoading] = useState(false);

  // Active tab state - get from URL params or default to 'posts'
  const [activeTab, setActiveTab] = useState<string>("posts");

  // State for the publish dialog
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [postToPublish, setPostToPublish] = useState<Post | null>(null);
  const [publishLoading, setPublishLoading] = useState(false);

  const [contactStats, setContactStats] = useState<ContactStats>({
    total: 0,
    new: 0,
    in_progress: 0,
    resolved: 0,
    urgent_pending: 0,
    recent_7_days: 0,
  });
  const [recentContactMessages, setRecentContactMessages] = useState<
    ContactMessage[]
  >([]);
  const [contactLoading, setContactLoading] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!user?.is_staff) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.is_staff) {
      loadMyPosts();
      loadSubscriberStats();
      loadRecentSubscribers();
      loadNewsletterOverview();
      loadNewsletters();
      loadAds();
      loadAdStats();
      loadContactStats();
      loadRecentContactMessages();
    }
  }, [user]);

  useEffect(() => {
    filterPosts();
  }, [posts, searchQuery, statusFilter]);

  /**
   * Load contact statistics
   */
  const loadContactStats = async () => {
    try {
      const response = await api.get<ContactStats>("/api/messages/stats/");
      setContactStats(response.data);
    } catch (error) {
      console.error("Failed to load contact stats:", error);
    }
  };

  const loadRecentContactMessages = async () => {
    try {
      setContactLoading(true);
      const response = await api.get<
        PaginatedResponse<ContactMessage> | ContactMessage[]
      >("/api/messages/?ordering=-created_at&limit=10");

      if (response.data && typeof response.data === "object") {
        if ("results" in response.data) {
          setRecentContactMessages(
            Array.isArray(response.data.results) ? response.data.results : [],
          );
        } else if (Array.isArray(response.data)) {
          setRecentContactMessages(response.data);
        } else {
          setRecentContactMessages([]);
        }
      } else {
        setRecentContactMessages([]);
      }
    } catch (error) {
      console.error("Failed to load contact messages:", error);
      setRecentContactMessages([]);
    } finally {
      setContactLoading(false);
    }
  };

  const loadMyPosts = async () => {
    try {
      const response = await postAPI.getMyPosts();
      setPosts(response.data);
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load subscriber statistics from the backend
   */
  const loadSubscriberStats = async () => {
    try {
      const response = await api.get<SubscriberStats>(
        "/api/newsletter/subscribers/stats/",
      );
      setSubscriberStats(response.data);
    } catch (error) {
      console.error("Failed to load subscriber stats:", error);
    }
  };

  /**
   * Load recent subscribers (last 10)
   */
  const loadRecentSubscribers = async () => {
    try {
      setSubscribersLoading(true);

      const response = await api.get<
        PaginatedResponse<RecentSubscriber> | RecentSubscriber[]
      >("/api/newsletter/subscribers/?ordering=-subscribed_at&limit=10");

      if (response.data && typeof response.data === "object") {
        if ("results" in response.data) {
          setRecentSubscribers(
            Array.isArray(response.data.results) ? response.data.results : [],
          );
        } else if (Array.isArray(response.data)) {
          setRecentSubscribers(response.data);
        } else {
          setRecentSubscribers([]);
        }
      } else {
        setRecentSubscribers([]);
      }
    } catch (error) {
      console.error("Failed to load recent subscribers:", error);
      setRecentSubscribers([]);
    } finally {
      setSubscribersLoading(false);
    }
  };

  /**
   * Load newsletter overview statistics
   */
  const loadNewsletterOverview = async () => {
    try {
      const response = await api.get<NewsletterOverview>(
        "/api/newsletter/newsletters/overview/",
      );
      setNewsletterOverview(response.data);
    } catch (error) {
      console.error("Failed to load newsletter overview:", error);
    }
  };

  /**
   * Load newsletters
   */
  const loadNewsletters = async () => {
    try {
      setNewslettersLoading(true);
      const response = await api.get<
        PaginatedResponse<Newsletter> | Newsletter[]
      >("/api/newsletter/newsletters/?ordering=-created_at&limit=10");

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
      calculateNewsletterStats(newsletterData);
    } catch (error) {
      console.error("Failed to load newsletters:", error);
      setNewsletters([]);
    } finally {
      setNewslettersLoading(false);
    }
  };

  /**
   * Calculate newsletter statistics
   */
  const calculateNewsletterStats = (data: Newsletter[]) => {
    setNewsletterStats({
      total: data.length,
      sent: data.filter((n) => n.status === "sent").length,
      scheduled: data.filter((n) => n.status === "scheduled").length,
      drafts: data.filter((n) => n.status === "draft").length,
    });
  };

  /**
   * Load advertisements
   */
  const loadAds = async () => {
    try {
      setAdsLoading(true);
      const response = await api.get<
        PaginatedResponse<Advertisement> | Advertisement[]
      >("/api/ads/?ordering=-created_at");

      // Handle both paginated and non-paginated responses
      if (response.data && typeof response.data === "object") {
        if ("results" in response.data) {
          // Paginated response - extract the results array
          const ads = Array.isArray(response.data.results)
            ? response.data.results
            : [];
          setAds(ads.slice(0, 10)); // Take first 10
        } else if (Array.isArray(response.data)) {
          // Direct array response
          setAds(response.data.slice(0, 10));
        } else {
          setAds([]);
        }
      } else {
        setAds([]);
      }
    } catch (error) {
      console.error("Failed to load ads:", error);
      setAds([]);
    } finally {
      setAdsLoading(false);
    }
  };

  /**
   * Load advertisement statistics
   */
  const loadAdStats = async () => {
    try {
      const response = await api.get<
        PaginatedResponse<Advertisement> | Advertisement[]
      >("/api/ads/");

      // Handle paginated response
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

      const stats = {
        total_ads: adsData.length,
        active_ads: adsData.filter((ad) => ad.is_active).length,
        total_impressions: adsData.reduce((sum, ad) => sum + ad.impressions, 0),
        total_clicks: adsData.reduce((sum, ad) => sum + ad.clicks, 0),
        avg_ctr: 0,
      };

      if (stats.total_impressions > 0) {
        stats.avg_ctr = (stats.total_clicks / stats.total_impressions) * 100;
      }

      setAdStats(stats);
    } catch (error) {
      console.error("Failed to load ad stats:", error);
    }
  };

  const filterPosts = () => {
    let filtered = [...posts];

    if (statusFilter !== "all") {
      filtered = filtered.filter((post) => post.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredPosts(filtered);
  };

  const handlePublishClick = (post: Post) => {
    setPostToPublish(post);
    setPublishDialogOpen(true);
  };

  const handleConfirmPublish = async () => {
    if (!postToPublish) return;

    setPublishLoading(true);
    try {
      await postAPI.update(postToPublish.slug, {
        status: "published",
      });

      setPosts(
        posts.map((p) =>
          p.id === postToPublish.id
            ? { ...p, status: "published" as const }
            : p,
        ),
      );

      setPublishDialogOpen(false);
      setPostToPublish(null);
    } catch (error) {
      console.error("Failed to publish post:", error);
      alert("Failed to publish post. Please try again.");
    } finally {
      setPublishLoading(false);
    }
  };

  const handleUnpublish = async (post: Post) => {
    if (
      !confirm(
        "Are you sure you want to unpublish this post and set it back to draft?",
      )
    ) {
      return;
    }

    try {
      await postAPI.update(post.slug, {
        status: "draft",
      });

      setPosts(
        posts.map((p) =>
          p.id === post.id ? { ...p, status: "draft" as const } : p,
        ),
      );
    } catch (error) {
      console.error("Failed to unpublish post:", error);
      alert("Failed to unpublish post. Please try again.");
    }
  };

  const handleDelete = async (slug: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this post? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await postAPI.delete(slug);
      setPosts(posts.filter((p) => p.slug !== slug));
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete post");
    }
  };

  /**
   * Get contact status badge
   */
  const getContactStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
            <AlertCircle className="h-3 w-3" />
            New
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
            <Clock className="h-3 w-3" />
            In Progress
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
            <CheckCircle className="h-3 w-3" />
            Resolved
          </span>
        );
      default:
        return null;
    }
  };

  /**
   * Get contact priority badge
   */
  const getContactPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold bg-red-600 text-white rounded">
            Urgent
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
            High
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
            Medium
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 rounded">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  /**
   * Get newsletter status badge
   */
  const getNewsletterStatusBadge = (status: string) => {
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
   * Get ad type icon
   */
  const getAdTypeIcon = (adType: string) => {
    switch (adType) {
      case "image":
        return <Image className="h-4 w-4" />;
      case "video":
        return <PlayCircle className="h-4 w-4" />;
      case "html":
        return <Code className="h-4 w-4" />;
      default:
        return <Image className="h-4 w-4" />;
    }
  };

  /**
   * Format date for display
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
   * Quick Actions Component
   */
  const QuickActions = () => (
    <Card className="border-neutral-200 rounded-none shadow-none">
      <CardHeader className="border-b border-neutral-200">
        <CardTitle className="text-lg font-medium uppercase tracking-wider">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/new")}
            className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-12 justify-start"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Post
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/newsletter/new")}
            className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-12 justify-start"
          >
            <Mail className="h-4 w-4 mr-2" />
            Create Newsletter
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/ads/new")}
            className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-12 justify-start"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Create Ad
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/newsletters")}
            className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-12 justify-start"
          >
            <Activity className="h-4 w-4 mr-2" />
            View All Newsletters
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    draft: posts.filter((p) => p.status === "draft").length,
    totalViews: posts.reduce((sum, post) => sum + post.views, 0),
    totalComments: posts.reduce((sum, post) => sum + post.comments_count, 0),
  };

  // Don't render dashboard if not admin
  if (!user?.is_staff) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <ShieldAlert className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
            <h2 className="text-2xl font-light text-black mb-3">
              Access Denied
            </h2>
            <p className="text-neutral-600 font-light mb-8">
              You need administrator privileges to access the dashboard.
            </p>
            <Link href="/">
              <Button className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </AdminRoute>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-6 py-12 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-12 bg-black"></div>
                  <span className="text-sm font-medium text-black uppercase tracking-wider">
                    Admin Dashboard
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl font-light text-black mb-4 leading-tight">
                  Content Management
                </h1>
                <p className="text-lg text-neutral-600 font-light">
                  Manage your posts, newsletters, subscribers, and
                  advertisements
                </p>
              </div>
              <Link href="/dashboard/new">
                <Button className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8 group">
                  <PlusCircle className="h-4 w-4 mr-2 transition-transform group-hover:rotate-90 duration-200" />
                  New Post
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-7xl">
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(tab) => {
              setActiveTab(tab);
              router.push(`?tab=${tab}`, { scroll: false });
            }}
            className="space-y-8"
          >
            <TabsList className="inline-flex h-12 items-center justify-center rounded-none bg-neutral-100 p-1 text-neutral-500">
              <TabsTrigger
                value="posts"
                className="rounded-none px-6 py-2 text-sm font-light data-[state=active]:bg-black data-[state=active]:text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Posts
              </TabsTrigger>
              <TabsTrigger
                value="newsletters"
                className="rounded-none px-6 py-2 text-sm font-light data-[state=active]:bg-black data-[state=active]:text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                Newsletters
              </TabsTrigger>
              <TabsTrigger
                value="subscribers"
                className="rounded-none px-6 py-2 text-sm font-light data-[state=active]:bg-black data-[state=active]:text-white"
              >
                <Mail className="h-4 w-4 mr-2" />
                Subscribers
              </TabsTrigger>
              <TabsTrigger
                value="ads"
                className="rounded-none px-6 py-2 text-sm font-light data-[state=active]:bg-black data-[state=active]:text-white"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Advertisements
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="rounded-none px-6 py-2 text-sm font-light data-[state=active]:bg-black data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="rounded-none px-6 py-2 text-sm font-light data-[state=active]:bg-black data-[state=active]:text-white"
              >
                <PhoneCall className="h-4 w-4 mr-2" />
                Contact Messages
              </TabsTrigger>
            </TabsList>

            {/* Posts Tab */}
            <TabsContent value="posts" className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <FileText className="h-5 w-5 text-neutral-400" />
                    </div>
                    <div className="text-3xl font-light text-black mb-1">
                      {stats.total}
                    </div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">
                      Total Posts
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <TrendingUp className="h-5 w-5 text-neutral-400" />
                    </div>
                    <div className="text-3xl font-light text-black mb-1">
                      {stats.published}
                    </div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">
                      Published
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <Edit className="h-5 w-5 text-neutral-400" />
                    </div>
                    <div className="text-3xl font-light text-black mb-1">
                      {stats.draft}
                    </div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">
                      Drafts
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <Eye className="h-5 w-5 text-neutral-400" />
                    </div>
                    <div className="text-3xl font-light text-black mb-1">
                      {stats.totalViews.toLocaleString()}
                    </div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">
                      Total Views
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <MessageSquare className="h-5 w-5 text-neutral-400" />
                    </div>
                    <div className="text-3xl font-light text-black mb-1">
                      {stats.totalComments}
                    </div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">
                      Comments
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 border-neutral-300 focus:border-black rounded-none h-12 font-light"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48 border-neutral-300 focus:border-black rounded-none h-12 font-light">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Posts List */}
              {filteredPosts.length === 0 ? (
                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="p-16 text-center">
                    <FileText className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-light text-black mb-3">
                      {posts.length === 0 ? "No posts yet" : "No posts found"}
                    </h3>
                    <p className="text-neutral-600 font-light mb-8">
                      {posts.length === 0
                        ? "Start creating amazing content for your audience"
                        : "Try adjusting your search or filters"}
                    </p>
                    {posts.length === 0 && (
                      <Link href="/dashboard/new">
                        <Button className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8">
                          Create Your First Post
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="p-0">
                    <div className="divide-y divide-neutral-200">
                      {filteredPosts.map((post) => (
                        <div
                          key={post.id}
                          className="p-6 hover:bg-neutral-50 transition-colors group"
                        >
                          <div className="flex items-start gap-6">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-3">
                                <span
                                  className={`text-xs font-medium uppercase tracking-wider px-3 py-1 border ${
                                    post.status === "published"
                                      ? "border-black text-black"
                                      : "border-neutral-300 text-neutral-500"
                                  }`}
                                >
                                  {post.status}
                                </span>
                                {post.category && (
                                  <span className="text-xs text-neutral-500 border border-neutral-300 px-3 py-1">
                                    {post.category.name}
                                  </span>
                                )}
                              </div>

                              <h3 className="text-xl font-light text-black mb-2 group-hover:text-neutral-700 transition-colors">
                                {post.title}
                              </h3>

                              <p className="text-neutral-600 font-light text-sm line-clamp-2 mb-4 leading-relaxed">
                                {post.excerpt || post.content.substring(0, 150)}
                                ...
                              </p>

                              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                                <div className="flex items-center gap-2">
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>{post.views} views</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="h-3.5 w-3.5" />
                                  <span>{post.comments_count} comments</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>
                                    {new Date(
                                      post.created_at,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 shrink-0">
                              <Link href={`/post/${post.slug}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-neutral-200 rounded-none h-10 w-10 p-0"
                                  title="View Post"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/dashboard/edit/${post.slug}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-neutral-200 rounded-none h-10 w-10 p-0"
                                  title="Edit Post"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>

                              {post.status === "draft" ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePublishClick(post)}
                                  className="hover:bg-green-50 hover:text-green-600 rounded-none h-10 w-10 p-0"
                                  title="Publish Post"
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnpublish(post)}
                                  className="hover:bg-amber-50 hover:text-amber-600 rounded-none h-10 w-10 p-0"
                                  title="Unpublish Post"
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(post.slug)}
                                className="hover:bg-red-50 hover:text-red-600 rounded-none h-10 w-10 p-0"
                                title="Delete Post"
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

              {filteredPosts.length > 0 && (
                <div className="text-center">
                  <p className="text-sm text-neutral-500 font-light">
                    Showing {filteredPosts.length} of {posts.length} posts
                  </p>
                </div>
              )}

              {/* Quick Actions */}
              <QuickActions />
            </TabsContent>

            {/* Newsletters Tab */}
            <TabsContent value="newsletters" className="space-y-8">
              {/* Newsletter Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <Mail className="h-5 w-5 text-neutral-400" />
                    </div>
                    <div className="text-3xl font-light text-black mb-1">
                      {newsletterStats.total}
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
                      {newsletterStats.sent}
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
                      {newsletterStats.scheduled}
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
                      {newsletterStats.drafts}
                    </div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">
                      Drafts
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Newsletters */}
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardHeader className="border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-medium uppercase tracking-wider">
                        Recent Newsletters
                      </CardTitle>
                      <CardDescription className="text-neutral-600 font-light mt-1">
                        Latest newsletter campaigns
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/dashboard/newsletters")}
                      className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {newslettersLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : newsletters.length === 0 ? (
                    <div className="p-16 text-center">
                      <Mail className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
                      <h3 className="text-xl font-light text-black mb-3">
                        No newsletters yet
                      </h3>
                      <p className="text-neutral-600 font-light mb-8">
                        Create your first newsletter to engage with your
                        subscribers
                      </p>
                      <Button
                        onClick={() => router.push("/dashboard/newsletter/new")}
                        className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8"
                      >
                        Create First Newsletter
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-200">
                      {newsletters.map((newsletter) => (
                        <div
                          key={newsletter.id}
                          className="p-4 hover:bg-neutral-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium text-black truncate">
                                  {newsletter.subject}
                                </h4>
                                {getNewsletterStatusBadge(newsletter.status)}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-neutral-500 mb-3">
                                <span>
                                  {newsletter.status === "sent" &&
                                    `Sent ${timeAgo(newsletter.sent_at || "")}`}
                                  {newsletter.status === "scheduled" &&
                                    `Scheduled for ${formatDate(
                                      newsletter.scheduled_for,
                                    )}`}
                                  {newsletter.status === "draft" &&
                                    `Created ${timeAgo(newsletter.created_at)}`}
                                </span>
                                <span>â€¢</span>
                                <span>
                                  {newsletter.total_recipients} recipients
                                </span>
                              </div>
                              {newsletter.status === "sent" && (
                                <div className="flex items-center gap-6 text-xs text-neutral-600">
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>
                                      {newsletter.opened_count} opened
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MousePointerClick className="h-3.5 w-3.5" />
                                    <span>
                                      {newsletter.clicked_count} clicked
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <QuickActions />
            </TabsContent>

            {/* Subscribers Tab */}
            <TabsContent value="subscribers" className="space-y-8">
              {/* Subscriber Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <Users className="h-5 w-5 text-neutral-400" />
                    </div>
                    <div className="text-3xl font-light text-black mb-1">
                      {subscriberStats.total}
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
                    <div className="text-3xl font-light text-black mb-1">
                      {subscriberStats.active}
                    </div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">
                      Active
                    </div>
                    {subscriberStats.total > 0 && (
                      <div className="text-xs text-green-600 mt-1">
                        {subscriberStats.active_percentage?.toFixed(1)}%
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="text-3xl font-light text-black mb-1">
                      {subscriberStats.pending}
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
                    <div className="text-3xl font-light text-black mb-1">
                      {subscriberStats.unsubscribed}
                    </div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">
                      Unsubscribed
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Subscribers */}
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardHeader className="border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-medium uppercase tracking-wider">
                        Recent Subscribers
                      </CardTitle>
                      <CardDescription className="text-neutral-600 font-light mt-1">
                        Latest newsletter signups
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/dashboard/subscribers")}
                      className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {subscribersLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : recentSubscribers.length === 0 ? (
                    <div className="p-16 text-center">
                      <Mail className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
                      <h3 className="text-xl font-light text-black mb-3">
                        No subscribers yet
                      </h3>
                      <p className="text-neutral-600 font-light">
                        Subscribers will appear here when they sign up
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-200">
                      {recentSubscribers.map((subscriber) => (
                        <div
                          key={subscriber.id}
                          className="p-4 hover:bg-neutral-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <p className="font-light text-black truncate">
                                  {subscriber.email}
                                </p>
                                <span
                                  className={`text-xs font-medium uppercase tracking-wider px-2 py-1 border ${
                                    subscriber.status === "active"
                                      ? "border-green-500 text-green-700 bg-green-50"
                                      : subscriber.status === "pending"
                                        ? "border-amber-500 text-amber-700 bg-amber-50"
                                        : "border-red-500 text-red-700 bg-red-50"
                                  }`}
                                >
                                  {subscriber.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-neutral-500">
                                <span>{timeAgo(subscriber.subscribed_at)}</span>
                                {subscriber.source && (
                                  <>
                                    <span>â€¢</span>
                                    <span>from {subscriber.source}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <QuickActions />
            </TabsContent>

            {/* Advertisements Tab */}
            <TabsContent value="ads" className="space-y-8">
              {/* Ad Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <DollarSign className="h-5 w-5 text-neutral-400" />
                    </div>
                    <div className="text-3xl font-light text-black mb-1">
                      {adStats.total_ads}
                    </div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">
                      Total Ads
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <Activity className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-light text-black mb-1">
                      {adStats.active_ads}
                    </div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">
                      Active
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <Eye className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-3xl font-light text-black mb-1">
                      {formatNumber(adStats.total_impressions)}
                    </div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">
                      Impressions
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <MousePointerClick className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="text-3xl font-light text-black mb-1">
                      {formatNumber(adStats.total_clicks)}
                    </div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">
                      Clicks
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="text-3xl font-light text-black mb-1">
                      {adStats.avg_ctr.toFixed(2)}%
                    </div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">
                      Avg CTR
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Ads */}
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardHeader className="border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-medium uppercase tracking-wider">
                        Recent Advertisements
                      </CardTitle>
                      <CardDescription className="text-neutral-600 font-light mt-1">
                        Latest created ads and their performance
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/dashboard/ads")}
                      className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                    >
                      Manage Ads
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {adsLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : ads.length === 0 ? (
                    <div className="p-16 text-center">
                      <DollarSign className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
                      <h3 className="text-xl font-light text-black mb-3">
                        No advertisements yet
                      </h3>
                      <p className="text-neutral-600 font-light mb-8">
                        Create your first ad to start monetizing your blog
                      </p>
                      <Button
                        onClick={() => router.push("/dashboard/ads/new")}
                        className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8"
                      >
                        Create First Ad
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-200">
                      {ads.map((ad) => (
                        <div
                          key={ad.id}
                          className="p-4 hover:bg-neutral-50 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            {/* Ad Image/Icon */}
                            <div className="w-20 h-20 bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                              {ad.image ? (
                                <img
                                  src={ad.image}
                                  alt={ad.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                getAdTypeIcon(ad.ad_type)
                              )}
                            </div>

                            {/* Ad Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium text-black truncate">
                                  {ad.title}
                                </h4>
                                <span
                                  className={`text-xs font-medium uppercase tracking-wider px-2 py-1 border ${
                                    ad.is_active
                                      ? "border-green-500 text-green-700 bg-green-50"
                                      : "border-neutral-300 text-neutral-500 bg-neutral-50"
                                  }`}
                                >
                                  {ad.is_active ? "Active" : "Inactive"}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-xs text-neutral-500 mb-2">
                                <span className="flex items-center gap-1">
                                  {getAdTypeIcon(ad.ad_type)}
                                  {ad.ad_type_display}
                                </span>
                                <span>â€¢</span>
                                <span>{ad.placement_display}</span>
                                <span>â€¢</span>
                                <span>Priority: {ad.priority}</span>
                              </div>

                              {/* Ad Metrics */}
                              <div className="flex items-center gap-6 text-xs">
                                <div className="flex items-center gap-2 text-neutral-600">
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>
                                    {formatNumber(ad.impressions)} views
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-neutral-600">
                                  <MousePointerClick className="h-3.5 w-3.5" />
                                  <span>{formatNumber(ad.clicks)} clicks</span>
                                </div>
                                <div className="flex items-center gap-2 text-neutral-600">
                                  <TrendingUp className="h-3.5 w-3.5" />
                                  <span>
                                    {ad.click_through_rate.toFixed(2)}% CTR
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/ads/edit/${ad.slug}`,
                                    )
                                  }
                                  className="hover:bg-neutral-200 rounded-none h-10 w-10 p-0"
                                  title="Edit Ad"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <QuickActions />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Newsletter Performance */}
                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardHeader className="border-b border-neutral-200">
                    <CardTitle className="text-lg font-medium uppercase tracking-wider">
                      Newsletter Performance
                    </CardTitle>
                    <CardDescription className="text-neutral-600 font-light mt-1">
                      Average engagement metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-600 font-light">
                          Average Open Rate
                        </span>
                        <span className="text-2xl font-light text-black">
                          {newsletterOverview.avg_open_rate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{
                            width: `${Math.min(
                              newsletterOverview.avg_open_rate,
                              100,
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-600 font-light">
                          Average Click Rate
                        </span>
                        <span className="text-2xl font-light text-black">
                          {newsletterOverview.avg_click_rate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{
                            width: `${Math.min(
                              newsletterOverview.avg_click_rate,
                              100,
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-neutral-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-neutral-600 font-light mb-1">
                            Total Sent
                          </div>
                          <div className="text-2xl font-light text-black">
                            {newsletterOverview.total_sent}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-neutral-600 font-light mb-1">
                            Total Recipients
                          </div>
                          <div className="text-2xl font-light text-black">
                            {newsletterOverview.total_recipients.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ad Performance */}
                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardHeader className="border-b border-neutral-200">
                    <CardTitle className="text-lg font-medium uppercase tracking-wider">
                      Advertisement Performance
                    </CardTitle>
                    <CardDescription className="text-neutral-600 font-light mt-1">
                      Overall ad campaign metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-600 font-light">
                          Click-Through Rate
                        </span>
                        <span className="text-2xl font-light text-black">
                          {adStats.avg_ctr.toFixed(2)}%
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 transition-all"
                          style={{
                            width: `${Math.min(adStats.avg_ctr * 10, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-neutral-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-neutral-600 font-light mb-1">
                            Total Impressions
                          </div>
                          <div className="text-2xl font-light text-black">
                            {formatNumber(adStats.total_impressions)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-neutral-600 font-light mb-1">
                            Total Clicks
                          </div>
                          <div className="text-2xl font-light text-black">
                            {formatNumber(adStats.total_clicks)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-neutral-200">
                      <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard/analytics/ads")}
                        className="w-full border-black text-black hover:bg-black hover:text-white font-light rounded-none h-12"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Detailed Ad Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <QuickActions />
            </TabsContent>

            {/* Contact Messages Tab */}
            <TabsContent value="contact" className="space-y-8">
              {/* Contact Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <PhoneCall className="h-5 w-5 text-neutral-400" />
                    </div>
                    <div className="text-3xl font-light text-black mb-1">
                      {contactStats.total}
                    </div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">
                      Total Messages
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="text-3xl font-light text-black mb-1">
                      {contactStats.new}
                    </div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">
                      New
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-3xl font-light text-black mb-1">
                      {contactStats.in_progress}
                    </div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">
                      In Progress
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-light text-black mb-1">
                      {contactStats.resolved}
                    </div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">
                      Resolved
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <ShieldAlert className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="text-3xl font-light text-black mb-1">
                      {contactStats.urgent_pending}
                    </div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">
                      Urgent Pending
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <Activity className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="text-3xl font-light text-black mb-1">
                      {contactStats.recent_7_days}
                    </div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">
                      Last 7 Days
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Contact Messages */}
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardHeader className="border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-medium uppercase tracking-wider">
                        Recent Contact Messages
                      </CardTitle>
                      <CardDescription className="text-neutral-600 font-light mt-1">
                        Latest submissions from your contact form
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/dashboard/contact")}
                      className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {contactLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : recentContactMessages.length === 0 ? (
                    <div className="p-16 text-center">
                      <PhoneCall className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
                      <h3 className="text-xl font-light text-black mb-3">
                        No contact messages yet
                      </h3>
                      <p className="text-neutral-600 font-light">
                        Messages from your contact form will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-200">
                      {recentContactMessages.map((message) => (
                        <Link
                          key={message.id}
                          href={`/dashboard/contact/${message.id}`}
                          className="block p-4 hover:bg-neutral-50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h4 className="font-medium text-black truncate">
                                  {message.subject}
                                </h4>
                                {getContactStatusBadge(message.status)}
                                {getContactPriorityBadge(message.priority)}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-neutral-500 mb-2">
                                <span className="flex items-center gap-1">
                                  <User className="h-3.5 w-3.5" />
                                  {message.name}
                                </span>
                                <span>â€¢</span>
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3.5 w-3.5" />
                                  {message.email}
                                </span>
                                <span>â€¢</span>
                                <span>{timeAgo(message.created_at)}</span>
                              </div>
                              <p className="text-sm text-neutral-600 font-light line-clamp-2">
                                {message.message}
                              </p>
                            </div>
                            {message.replies_count > 0 && (
                              <div className="text-xs text-blue-600 border border-blue-300 bg-blue-50 px-2 py-1 rounded shrink-0">
                                {message.replies_count} replies
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <QuickActions />
            </TabsContent>
          </Tabs>
        </div>

        {/* Publish Confirmation Dialog */}
        <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-none border-neutral-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black">
                Publish Post
              </DialogTitle>
              <DialogDescription className="text-neutral-600 font-light pt-2">
                You are about to publish the following post. This will make it
                visible to all visitors on your blog.
              </DialogDescription>
            </DialogHeader>

            {postToPublish && (
              <div className="py-4 border-y border-neutral-200 my-4">
                <h4 className="font-medium text-black mb-2">
                  {postToPublish.title}
                </h4>
                <p className="text-sm text-neutral-600 font-light line-clamp-3">
                  {postToPublish.excerpt ||
                    postToPublish.content.substring(0, 200)}
                  ...
                </p>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPublishDialogOpen(false)}
                disabled={publishLoading}
                className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmPublish}
                disabled={publishLoading}
                className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-10"
              >
                {publishLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Publishing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Publish Now
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminRoute>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
