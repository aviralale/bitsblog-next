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

export const AdminPanelOverview = () => {
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
      url: "/admin/blog/comment/",
      color: "bg-purple-500",
      items: [
        { label: "All Comments", url: "/admin/blog/comment/" },
        {
          label: "Pending Approval",
          url: "/admin/blog/comment/?status=pending",
        },
      ],
    },
    {
      id: "newsletter",
      title: "Newsletter",
      description: "Manage subscribers and campaigns",
      icon: <Mail className="h-6 w-6" />,
      url: "/admin/newsletter/",
      color: "bg-green-500",
      items: [
        { label: "Subscribers", url: "/admin/newsletter/subscriber/" },
        { label: "Newsletters", url: "/admin/newsletter/newsletter/" },
        { label: "Templates", url: "/dashboard/newsletter/templates" },
      ],
    },
    {
      id: "ads",
      title: "Advertisements",
      description: "Manage ad campaigns and placements",
      icon: <DollarSign className="h-6 w-6" />,
      url: "/admin/ads/",
      color: "bg-emerald-500",
      items: [
        { label: "Advertisements", url: "/admin/ads/advertisement/" },
        { label: "Analytics", url: "/dashboard/analytics/ads" },
      ],
    },
    {
      id: "users",
      title: "User Management",
      description: "Manage users and permissions",
      icon: <Users className="h-6 w-6" />,
      url: "/admin/auth/user/",
      color: "bg-orange-500",
      items: [
        { label: "Users", url: "/admin/auth/user/" },
        { label: "Groups", url: "/admin/auth/group/" },
      ],
    },
    {
      id: "media",
      title: "Media Library",
      description: "Upload and manage media files",
      icon: <ImageIcon className="h-6 w-6" />,
      url: "/admin/",
      color: "bg-pink-500",
      items: [
        { label: "Images", url: "/admin/" },
        { label: "Documents", url: "/admin/" },
      ],
    },
    {
      id: "settings",
      title: "Site Settings",
      description: "Configure site-wide settings",
      icon: <Settings className="h-6 w-6" />,
      url: "/admin/",
      color: "bg-neutral-500",
      items: [
        { label: "General", url: "/admin/" },
        { label: "SEO", url: "/admin/" },
        { label: "Social Media", url: "/admin/" },
      ],
    },
    {
      id: "security",
      title: "Security",
      description: "Security and authentication settings",
      icon: <Shield className="h-6 w-6" />,
      url: "/admin/",
      color: "bg-red-500",
      items: [
        { label: "Sessions", url: "/admin/sessions/session/" },
        { label: "Logs", url: "/admin/" },
      ],
    },
  ];

  const quickActions = [
    {
      label: "Create New Post",
      icon: <FileText className="h-5 w-5" />,
      url: "/dashboard/new",
      color: "bg-blue-500",
    },
    {
      label: "Send Newsletter",
      icon: <Mail className="h-5 w-5" />,
      url: "/dashboard/newsletter/new",
      color: "bg-green-500",
    },
    {
      label: "Create Ad",
      icon: <DollarSign className="h-5 w-5" />,
      url: "/dashboard/ads/new",
      color: "bg-emerald-500",
    },
    {
      label: "Moderate Comments",
      icon: <MessageSquare className="h-5 w-5" />,
      url: "/admin/blog/comment/?status=pending",
      color: "bg-purple-500",
    },
  ];

  const systemInfo = [
    {
      label: "Django Admin",
      icon: <Code className="h-5 w-5" />,
      url: "/admin/",
      description: "Full Django admin interface",
    },
    {
      label: "REST API",
      icon: <Database className="h-5 w-5" />,
      url: "/api/",
      description: "API documentation",
    },
    {
      label: "Site Frontend",
      icon: <Globe className="h-5 w-5" />,
      url: "/",
      description: "View live site",
    },
  ];

  // SEO Data
  const pageTitle = "Administration Panel | BitsBlog";
  const pageDescription =
    "Complete control center for managing your blog. Manage posts, categories, tags, comments, newsletters, advertisements, users, and more.";
  const pageUrl = getAbsoluteUrl("/dashboard/admin");
  const imageUrl = getAbsoluteUrl("/og-admin.jpg");

  // Breadcrumb structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: getAbsoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Dashboard",
        item: getAbsoluteUrl("/dashboard"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Admin Panel",
        item: pageUrl,
      },
    ],
  };

  // WebPage structured data
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Administration Panel",
    description: pageDescription,
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "BitsBlog",
      url: getAbsoluteUrl("/"),
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbSchema.itemListElement,
    },
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="hover:bg-neutral-100 rounded-none h-10 w-10 p-0"
                    aria-label="Back to dashboard"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-light text-black">
                    Administration Panel
                  </h1>
                  <p className="text-sm text-neutral-500 mt-1">
                    Complete control center for your blog
                  </p>
                </div>
              </div>

              <Button
                onClick={() => window.open("/admin/", "_blank")}
                className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-10 px-6"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Django Admin
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-7xl space-y-12">
          {/* Quick Actions */}
          <section aria-labelledby="quick-actions-heading">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="h-6 w-6 text-neutral-400" aria-hidden="true" />
              <h2
                id="quick-actions-heading"
                className="text-2xl font-light text-black"
              >
                Quick Actions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.url}>
                  <Card className="border-neutral-200 rounded-none shadow-none hover:shadow-md transition-all group cursor-pointer">
                    <CardContent className="pt-6">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 ${action.color} text-white mb-4`}
                        aria-hidden="true"
                      >
                        {action.icon}
                      </div>
                      <h3 className="font-medium text-black group-hover:text-neutral-700 transition-colors">
                        {action.label}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Admin Sections */}
          <section aria-labelledby="management-areas-heading">
            <div className="flex items-center gap-3 mb-6">
              <Package
                className="h-6 w-6 text-neutral-400"
                aria-hidden="true"
              />
              <h2
                id="management-areas-heading"
                className="text-2xl font-light text-black"
              >
                Management Areas
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminSections.map((section) => (
                <Card
                  key={section.id}
                  className="border-neutral-200 rounded-none shadow-none hover:shadow-md transition-all group"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 ${section.color} text-white`}
                        aria-hidden="true"
                      >
                        {section.icon}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(section.url, "_blank")}
                        className="hover:bg-neutral-100 rounded-none h-8 w-8 p-0"
                        aria-label={`Open ${section.title} in new tab`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg font-medium">
                      {section.title}
                    </CardTitle>
                    <CardDescription className="text-neutral-600 font-light">
                      {section.description}
                    </CardDescription>
                  </CardHeader>
                  {section.items && (
                    <CardContent>
                      <nav
                        className="space-y-2"
                        aria-label={`${section.title} navigation`}
                      >
                        {section.items.map((item) => (
                          <button
                            key={item.label}
                            onClick={() => {
                              if (item.url.startsWith("/dashboard")) {
                                router.push(item.url);
                              } else {
                                window.open(item.url, "_blank");
                              }
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 transition-colors flex items-center justify-between group"
                          >
                            <span>{item.label}</span>
                            <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </nav>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </section>

          {/* System Links */}
          <section aria-labelledby="system-access-heading">
            <div className="flex items-center gap-3 mb-6">
              <Activity
                className="h-6 w-6 text-neutral-400"
                aria-hidden="true"
              />
              <h2
                id="system-access-heading"
                className="text-2xl font-light text-black"
              >
                System Access
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {systemInfo.map((item) => (
                <button
                  key={item.label}
                  onClick={() => window.open(item.url, "_blank")}
                  className="border border-neutral-200 p-6 hover:bg-neutral-50 transition-colors text-left group"
                  aria-label={`Open ${item.label}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 bg-neutral-100 flex items-center justify-center text-neutral-600 group-hover:bg-black group-hover:text-white transition-colors"
                      aria-hidden="true"
                    >
                      {item.icon}
                    </div>
                    <ExternalLink
                      className="h-4 w-4 text-neutral-400"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="font-medium text-black mb-1">{item.label}</h3>
                  <p className="text-sm text-neutral-600 font-light">
                    {item.description}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* Admin Resources */}
          <Card className="border-neutral-200 rounded-none shadow-none">
            <CardHeader className="border-b border-neutral-200">
              <CardTitle className="text-lg font-medium uppercase tracking-wider">
                Admin Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-black mb-3 flex items-center gap-2">
                    <Palette className="h-4 w-4" aria-hidden="true" />
                    Customization
                  </h4>
                  <ul className="space-y-2 text-sm text-neutral-600">
                    <li className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 bg-neutral-400 rounded-full"
                        aria-hidden="true"
                      ></span>
                      <span>Site appearance and branding</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 bg-neutral-400 rounded-full"
                        aria-hidden="true"
                      ></span>
                      <span>Email templates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 bg-neutral-400 rounded-full"
                        aria-hidden="true"
                      ></span>
                      <span>Newsletter templates</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-black mb-3 flex items-center gap-2">
                    <Bell className="h-4 w-4" aria-hidden="true" />
                    Notifications
                  </h4>
                  <ul className="space-y-2 text-sm text-neutral-600">
                    <li className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 bg-neutral-400 rounded-full"
                        aria-hidden="true"
                      ></span>
                      <span>Email notification settings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 bg-neutral-400 rounded-full"
                        aria-hidden="true"
                      ></span>
                      <span>Comment moderation alerts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 bg-neutral-400 rounded-full"
                        aria-hidden="true"
                      ></span>
                      <span>New subscriber notifications</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-black mb-3 flex items-center gap-2">
                    <Lock className="h-4 w-4" aria-hidden="true" />
                    Security
                  </h4>
                  <ul className="space-y-2 text-sm text-neutral-600">
                    <li className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 bg-neutral-400 rounded-full"
                        aria-hidden="true"
                      ></span>
                      <span>User authentication</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 bg-neutral-400 rounded-full"
                        aria-hidden="true"
                      ></span>
                      <span>Password policies</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 bg-neutral-400 rounded-full"
                        aria-hidden="true"
                      ></span>
                      <span>Session management</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-black mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" aria-hidden="true" />
                    Analytics
                  </h4>
                  <ul className="space-y-2 text-sm text-neutral-600">
                    <li className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 bg-neutral-400 rounded-full"
                        aria-hidden="true"
                      ></span>
                      <span>Post performance metrics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 bg-neutral-400 rounded-full"
                        aria-hidden="true"
                      ></span>
                      <span>Newsletter analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 bg-neutral-400 rounded-full"
                        aria-hidden="true"
                      ></span>
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
      </div>
    </AdminRoute>
  );
};

export default AdminPanelOverview;
