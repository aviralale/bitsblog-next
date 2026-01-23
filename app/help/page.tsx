"use client";

import { useState } from "react";
import {
  Search,
  Book,
  UserCircle,
  Mail,
  Settings,
  Lock,
  MessageSquare,
  HelpCircle,
  FileText,
  ArrowRight,
  TrendingUp,
  Video,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  articles: HelpArticle[];
}

interface HelpArticle {
  id: number;
  title: string;
  description: string;
  slug: string;
  views: number;
  helpful: number;
}

const helpCategories: HelpCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics and get up and running quickly",
    icon: <Book className="h-6 w-6" />,
    articles: [
      {
        id: 1,
        title: "Welcome to Our Blog",
        description:
          "A quick introduction to our platform and what you can expect.",
        slug: "welcome-to-our-blog",
        views: 1520,
        helpful: 245,
      },
      {
        id: 2,
        title: "How to Navigate the Website",
        description:
          "Learn how to find content and use key features of the site.",
        slug: "how-to-navigate",
        views: 1340,
        helpful: 198,
      },
      {
        id: 3,
        title: "Creating Your First Account",
        description:
          "Step-by-step guide to setting up your account and profile.",
        slug: "creating-your-account",
        views: 2100,
        helpful: 312,
      },
      {
        id: 4,
        title: "Customizing Your Reading Experience",
        description:
          "Personalize your feed and adjust settings to your preferences.",
        slug: "customizing-experience",
        views: 890,
        helpful: 134,
      },
    ],
  },
  {
    id: "account-management",
    title: "Account Management",
    description: "Manage your account settings and preferences",
    icon: <UserCircle className="h-6 w-6" />,
    articles: [
      {
        id: 5,
        title: "Updating Your Profile Information",
        description: "How to change your name, email, and profile picture.",
        slug: "updating-profile",
        views: 1650,
        helpful: 221,
      },
      {
        id: 6,
        title: "Changing Your Password",
        description:
          "Learn how to update your password and keep your account secure.",
        slug: "changing-password",
        views: 1420,
        helpful: 189,
      },
      {
        id: 7,
        title: "Managing Email Preferences",
        description:
          "Control which emails you receive and how often you get them.",
        slug: "email-preferences",
        views: 980,
        helpful: 156,
      },
      {
        id: 8,
        title: "Deleting Your Account",
        description:
          "Information about permanently removing your account and data.",
        slug: "deleting-account",
        views: 560,
        helpful: 78,
      },
    ],
  },
  {
    id: "newsletter",
    title: "Newsletter & Subscriptions",
    description: "Everything about our newsletter and email updates",
    icon: <Mail className="h-6 w-6" />,
    articles: [
      {
        id: 9,
        title: "Subscribing to Our Newsletter",
        description: "How to sign up for weekly email updates.",
        slug: "subscribing-newsletter",
        views: 1890,
        helpful: 267,
      },
      {
        id: 10,
        title: "Managing Newsletter Preferences",
        description: "Customize which topics you receive newsletters about.",
        slug: "newsletter-preferences",
        views: 1120,
        helpful: 178,
      },
      {
        id: 11,
        title: "Unsubscribing from Emails",
        description: "How to stop receiving newsletters and marketing emails.",
        slug: "unsubscribing",
        views: 890,
        helpful: 143,
      },
      {
        id: 12,
        title: "Newsletter Delivery Issues",
        description: "Troubleshooting if you're not receiving our emails.",
        slug: "newsletter-issues",
        views: 670,
        helpful: 102,
      },
    ],
  },
  {
    id: "reading-content",
    title: "Reading & Content",
    description: "Tips for discovering and enjoying our content",
    icon: <FileText className="h-6 w-6" />,
    articles: [
      {
        id: 13,
        title: "Finding Articles by Category",
        description: "Browse content organized by topic and category.",
        slug: "finding-articles",
        views: 1340,
        helpful: 198,
      },
      {
        id: 14,
        title: "Using the Search Function",
        description: "Advanced tips for searching and filtering content.",
        slug: "using-search",
        views: 1120,
        helpful: 167,
      },
      {
        id: 15,
        title: "Saving Favorite Articles",
        description: "How to bookmark articles for easy access later.",
        slug: "saving-articles",
        views: 1560,
        helpful: 234,
      },
      {
        id: 16,
        title: "Sharing Content on Social Media",
        description: "Easy ways to share articles with your networks.",
        slug: "sharing-content",
        views: 890,
        helpful: 145,
      },
    ],
  },
  {
    id: "comments-engagement",
    title: "Comments & Engagement",
    description: "Join the conversation and interact with content",
    icon: <MessageSquare className="h-6 w-6" />,
    articles: [
      {
        id: 17,
        title: "Leaving Comments on Articles",
        description: "How to participate in discussions and leave feedback.",
        slug: "leaving-comments",
        views: 1450,
        helpful: 212,
      },
      {
        id: 18,
        title: "Comment Moderation Policy",
        description: "Understanding our community guidelines and moderation.",
        slug: "comment-policy",
        views: 780,
        helpful: 121,
      },
      {
        id: 19,
        title: "Editing and Deleting Comments",
        description: "How to modify or remove your comments.",
        slug: "editing-comments",
        views: 670,
        helpful: 98,
      },
      {
        id: 20,
        title: "Reporting Inappropriate Content",
        description: "How to flag comments that violate our guidelines.",
        slug: "reporting-content",
        views: 560,
        helpful: 89,
      },
    ],
  },
  {
    id: "privacy-security",
    title: "Privacy & Security",
    description: "Learn how we protect your data and privacy",
    icon: <Lock className="h-6 w-6" />,
    articles: [
      {
        id: 21,
        title: "Understanding Our Privacy Policy",
        description: "What data we collect and how we use it.",
        slug: "privacy-policy-explained",
        views: 1120,
        helpful: 178,
      },
      {
        id: 22,
        title: "Cookie Usage and Management",
        description: "How we use cookies and how to control them.",
        slug: "cookie-management",
        views: 890,
        helpful: 145,
      },
      {
        id: 23,
        title: "Data Security Measures",
        description: "How we keep your information safe and secure.",
        slug: "data-security",
        views: 1230,
        helpful: 189,
      },
      {
        id: 24,
        title: "Requesting Your Data",
        description: "How to get a copy of your personal information.",
        slug: "requesting-data",
        views: 670,
        helpful: 102,
      },
    ],
  },
  {
    id: "technical-support",
    title: "Technical Support",
    description: "Troubleshooting and technical assistance",
    icon: <Settings className="h-6 w-6" />,
    articles: [
      {
        id: 25,
        title: "Browser Compatibility",
        description: "Supported browsers and system requirements.",
        slug: "browser-compatibility",
        views: 980,
        helpful: 156,
      },
      {
        id: 26,
        title: "Mobile App Usage",
        description: "How to access our site on mobile devices.",
        slug: "mobile-usage",
        views: 1340,
        helpful: 201,
      },
      {
        id: 27,
        title: "Troubleshooting Loading Issues",
        description: "Solutions for slow loading or display problems.",
        slug: "loading-issues",
        views: 1120,
        helpful: 167,
      },
      {
        id: 28,
        title: "Clearing Cache and Cookies",
        description: "How to clear your browser data to fix issues.",
        slug: "clearing-cache",
        views: 890,
        helpful: 134,
      },
    ],
  },
];

const popularArticles = [
  {
    title: "Creating Your First Account",
    slug: "creating-your-account",
    category: "Getting Started",
  },
  {
    title: "Subscribing to Our Newsletter",
    slug: "subscribing-newsletter",
    category: "Newsletter",
  },
  {
    title: "Updating Your Profile Information",
    slug: "updating-profile",
    category: "Account Management",
  },
  {
    title: "Saving Favorite Articles",
    slug: "saving-articles",
    category: "Reading & Content",
  },
];

export const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");

  /**
   * Filter articles based on search
   */
  const searchResults = searchQuery
    ? helpCategories.flatMap((category) =>
        category.articles
          .filter(
            (article) =>
              article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              article.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase()),
          )
          .map((article) => ({
            ...article,
            category: category.title,
            categoryId: category.id,
          })),
      )
    : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <div className="container mx-auto px-6 py-16 max-w-6xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-12 bg-black"></div>
            <span className="text-sm font-medium text-black uppercase tracking-wider">
              Support
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-light text-black mb-6 leading-tight">
            Help Center
          </h1>
          <p className="text-lg text-neutral-600 font-light max-w-3xl mb-8">
            Browse help articles, guides, and tutorials to get the most out of
            our platform.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white border-neutral-300 focus:border-black rounded-none h-14 font-light text-lg"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-6xl">
        {/* Search Results */}
        {searchQuery && (
          <div className="mb-16">
            <h2 className="text-2xl font-light text-black mb-6">
              Search Results ({searchResults.length})
            </h2>
            {searchResults.length === 0 ? (
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardContent className="p-16 text-center">
                  <HelpCircle className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
                  <h3 className="text-xl font-light text-black mb-3">
                    No results found
                  </h3>
                  <p className="text-neutral-600 font-light mb-8">
                    Try different keywords or browse categories below
                  </p>
                  <Button
                    onClick={() => setSearchQuery("")}
                    variant="outline"
                    className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-12 px-8"
                  >
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((article) => (
                  <Card
                    key={article.id}
                    className="border-neutral-200 rounded-none shadow-none hover:shadow-md transition-all"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-neutral-500 font-light">
                          {article.category}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-medium text-black leading-relaxed">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="text-neutral-600 font-light">
                        {article.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link
                        href={`/help/${article.categoryId}/${article.slug}`}
                        className="text-sm text-black hover:underline inline-flex items-center gap-2"
                      >
                        Read Article <ArrowRight className="h-4 w-4" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Popular Articles */}
        {!searchQuery && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="h-6 w-6 text-black" />
              <h2 className="text-3xl font-light text-black">
                Popular Articles
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularArticles.map((article, index) => (
                <Link
                  key={index}
                  href={`/help/${article.slug}`}
                  className="group"
                >
                  <Card className="border-neutral-200 rounded-none shadow-none hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-xs text-neutral-500 font-light mb-2">
                            {article.category}
                          </p>
                          <h3 className="text-lg font-medium text-black group-hover:underline">
                            {article.title}
                          </h3>
                        </div>
                        <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-black transition-colors shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Help Categories */}
        {!searchQuery && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-light text-black mb-3">
                Browse by Category
              </h2>
              <p className="text-neutral-600 font-light">
                Select a category to view related help articles
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpCategories.map((category) => (
                <Card
                  key={category.id}
                  className="border-neutral-200 rounded-none shadow-none hover:shadow-md transition-all"
                >
                  <CardHeader className="border-b border-neutral-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                        {category.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-medium text-black">
                      {category.title}
                    </CardTitle>
                    <CardDescription className="text-neutral-600 font-light">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      {category.articles.slice(0, 4).map((article) => (
                        <li key={article.id}>
                          <Link
                            href={`/help/${category.id}/${article.slug}`}
                            className="text-sm text-neutral-600 hover:text-black transition-colors flex items-center gap-2 group"
                          >
                            <ArrowRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-black transition-colors" />
                            {article.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/help/${category.id}`}
                      className="text-sm text-black hover:underline inline-flex items-center gap-2 mt-4"
                    >
                      View all articles <ArrowRight className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Additional Resources */}
        <div className="mt-16 pt-16 border-t border-neutral-200">
          <h2 className="text-3xl font-light text-black mb-8">
            Additional Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <Video className="h-8 w-8 text-black mb-4" />
                <h3 className="text-lg font-medium text-black mb-2">
                  Video Tutorials
                </h3>
                <p className="text-sm text-neutral-600 font-light mb-4">
                  Watch step-by-step video guides to learn quickly.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                >
                  Watch Videos
                </Button>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <Download className="h-8 w-8 text-black mb-4" />
                <h3 className="text-lg font-medium text-black mb-2">
                  Download Guides
                </h3>
                <p className="text-sm text-neutral-600 font-light mb-4">
                  Get PDF guides for offline reference.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                >
                  Download PDFs
                </Button>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <MessageSquare className="h-8 w-8 text-black mb-4" />
                <h3 className="text-lg font-medium text-black mb-2">
                  Contact Support
                </h3>
                <p className="text-sm text-neutral-600 font-light mb-4">
                  Can't find what you need? We're here to help.
                </p>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    className="w-full border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                  >
                    Get in Touch
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-16 pt-16 border-t border-neutral-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="text-xl font-medium text-black mb-2">
                Still need help?
              </h3>
              <p className="text-neutral-600 font-light">
                Check out our other support resources
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/faq">
                <Button
                  variant="outline"
                  className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-12 px-6"
                >
                  View FAQ
                </Button>
              </Link>
              <Link href="/documentation">
                <Button
                  variant="outline"
                  className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-12 px-6"
                >
                  Documentation
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-6">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
