"use client";

import { useEffect } from "react";
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
  ArrowLeft,
  Settings,
  Users,
  FileText,
  Mail,
  DollarSign,
  MessageSquare,
  Image as ImageIcon,
  Shield,
  Database,
  Activity,
  BarChart3,
  ExternalLink,
  Zap,
  Globe,
  Palette,
  Bell,
  Lock,
  UserCog,
  Code,
  Package,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AdminRoute from "@/components/AdminRoute";

/**
 * Admin section interface
 */
interface AdminSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  color: string;
  items?: {
    label: string;
    url: string;
  }[];
}

// Helper function to get absolute URL
const getAbsoluteUrl = (path: string): string => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

export default function AdminPanelOverview() {
  const { user } = useAuth();
  const router = useRouter();

  // Check if user is admin
  useEffect(() => {
    if (!user?.is_staff) {
      router.push("/");
    }
  }, [user, router]);

  const adminSections: AdminSection[] = [
    {
      id: "content",
      title: "Content Management",
      description: "Manage blog posts, categories, and tags",
      icon: <FileText className="h-6 w-6" />,
      url: "/admin/blog/",
      color: "bg-blue-500",
      items: [
        { label: "Posts", url: "/dashboard/" },
        { label: "Categories", url: "/dashboard/categories" },
        { label: "Tags", url: "/dashboard/tags" },
      ],
    },
    {
      id: "comments",
      title: "Comments",
      description: "Moderate and manage user comments",
      icon: <MessageSquare className="h-6 w-6" />,
      url: "/admin/comments/",
      color: "bg-green-500",
      items: [
        { label: "All Comments", url: "/dashboard/contact" },
        { label: "Pending Review", url: "/dashboard/contact" },
      ],
    },
    {
      id: "users",
      title: "User Management",
      description: "Manage users and permissions",
      icon: <Users className="h-6 w-6" />,
      url: "/admin/auth/user/",
      color: "bg-purple-500",
      items: [
        { label: "Users", url: "/admin/auth/user/" },
        { label: "Permissions", url: "/admin/auth/permission/" },
      ],
    },
    {
      id: "media",
      title: "Media & Files",
      description: "Manage uploaded images and files",
      icon: <ImageIcon className="h-6 w-6" />,
      url: "/admin/filer/folder/",
      color: "bg-yellow-500",
    },
    {
      id: "analytics",
      title: "Analytics & Reports",
      description: "View traffic, engagement, and performance metrics",
      icon: <BarChart3 className="h-6 w-6" />,
      url: "/dashboard/analytics/ads",
      color: "bg-red-500",
      items: [
        { label: "Traffic Analytics", url: "/dashboard/analytics/ads" },
        { label: "Page Views", url: "/dashboard/analytics/ads" },
        { label: "User Behavior", url: "/dashboard/analytics/ads" },
      ],
    },
    {
      id: "newsletters",
      title: "Newsletters",
      description: "Manage email campaigns and subscribers",
      icon: <Mail className="h-6 w-6" />,
      url: "/dashboard/newsletters",
      color: "bg-pink-500",
      items: [
        { label: "Newsletters", url: "/dashboard/newsletters" },
        { label: "Subscribers", url: "/dashboard/subscribers" },
        { label: "Templates", url: "/dashboard/newsletter/templates" },
      ],
    },
    {
      id: "ads",
      title: "Advertisements",
      description: "Manage ad spaces and campaigns",
      icon: <Zap className="h-6 w-6" />,
      url: "/dashboard/ads",
      color: "bg-cyan-500",
      items: [
        { label: "All Ads", url: "/dashboard/ads" },
        { label: "Create Ad", url: "/dashboard/ads/new" },
      ],
    },
    {
      id: "settings",
      title: "Site Settings",
      description: "Configure general site settings and preferences",
      icon: <Globe className="h-6 w-6" />,
      url: "/admin/",
      color: "bg-indigo-500",
      items: [
        { label: "General Settings", url: "/admin/" },
        { label: "Email Configuration", url: "/admin/email/" },
      ],
    },
  ];

  return (
    <AdminRoute>
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-black mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-black mb-2">
            Admin Panel Overview
          </h1>
          <p className="text-neutral-600">
            Welcome to the admin panel. Manage all aspects of your blog from
            here.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <Card className="border-neutral-200 rounded-none shadow-none bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-black">—</p>
              <p className="text-xs text-neutral-500 mt-1">Admin Dashboard</p>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 rounded-none shadow-none bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-black">—</p>
              <p className="text-xs text-neutral-500 mt-1">Curated Content</p>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 rounded-none shadow-none bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-black">—</p>
              <p className="text-xs text-neutral-500 mt-1">User Engagement</p>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 rounded-none shadow-none bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Site Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-black">—</p>
              <p className="text-xs text-neutral-500 mt-1">Last 24 Hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {adminSections.map((section) => (
            <Card
              key={section.id}
              className="border-neutral-200 rounded-none shadow-none bg-white hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => window.open(getAbsoluteUrl(section.url), "_blank")}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 ${section.color} flex items-center justify-center text-white rounded`}
                    >
                      {section.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-black">
                        {section.title}
                      </CardTitle>
                      <CardDescription className="text-neutral-600 font-light">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                  <ExternalLink className="h-5 w-5 text-neutral-400" />
                </div>
              </CardHeader>

              {section.items && (
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, index) => (
                      <li
                        key={index}
                        className="text-sm text-neutral-600 font-light flex items-center gap-2"
                      >
                        <span className="h-1 w-1 bg-neutral-400 rounded-full"></span>
                        <span>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Important Info Box */}
        <Card className="border-neutral-200 rounded-none shadow-none bg-neutral-50 mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Shield className="h-5 w-5" />
              Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-black mb-2">
                  Direct Admin Access
                </h3>
                <p className="text-sm text-neutral-600 font-light mb-3">
                  For more detailed control, you can access the Django admin
                  panel directly. This is the backend administration interface
                  for advanced management.
                </p>
                <Button
                  onClick={() =>
                    window.open(
                      "https://api-blog.ctrlbits.com/admin/",
                      "_blank",
                    )
                  }
                  className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-10"
                >
                  Django Admin Panel
                  <span className="ml-2" aria-hidden="true"></span>
                </Button>
              </div>
              <div>
                <h3 className="font-medium text-black mb-2">
                  Advertisement Insights
                </h3>
                <p className="text-sm text-neutral-600 font-light mb-3">
                  View detailed analytics about your advertisements, including
                  impressions, clicks, and revenue. Optimize your ad strategy
                  based on performance data.
                </p>
                <ul className="text-xs text-neutral-600 font-light space-y-1">
                  <li>
                    <span className="mr-2" aria-hidden="true"></span>
                    <span>Advertisement insights</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="border-neutral-200 rounded-none shadow-none bg-neutral-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 bg-blue-100 flex items-center justify-center text-blue-600 shrink-0"
                aria-hidden="true"
              >
                <UserCog className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-black mb-2">
                  Need Help?
                </h3>
                <p className="text-neutral-600 font-light mb-4">
                  Access comprehensive documentation, tutorials, and support
                  resources to help you manage your blog effectively.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open("https://docs.djangoproject.com/", "_blank")
                    }
                    className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                  >
                    Documentation
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(
                        "https://docs.djangoproject.com/en/stable/ref/contrib/admin/",
                        "_blank",
                      )
                    }
                    className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                  >
                    Django Admin Guide
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminRoute>
  );
}
