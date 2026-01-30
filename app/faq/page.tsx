"use client";
import { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Mail,
  Book,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Head from "next/head";
import Link from "next/link";

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  // General Questions
  {
    id: 1,
    category: "General",
    question: "What is this blog about?",
    answer:
      "Our blog covers a wide range of topics including technology, lifestyle, business, and more. We aim to provide high-quality, informative content that adds value to our readers' lives. Our team of expert writers creates in-depth articles, tutorials, and guides to help you stay informed and inspired.",
  },
  {
    id: 2,
    category: "General",
    question: "How often do you publish new content?",
    answer:
      "We publish new articles multiple times per week. To stay updated with our latest posts, you can subscribe to our newsletter or follow us on social media. You'll receive notifications whenever we publish new content that matches your interests.",
  },
  {
    id: 3,
    category: "General",
    question: "Can I suggest topics for articles?",
    answer:
      "Absolutely! We love hearing from our readers. You can suggest topics by contacting us through our contact page or by leaving a comment on any article. We review all suggestions and consider them for future content.",
  },
  {
    id: 4,
    category: "General",
    question: "Who writes the content?",
    answer:
      "Our content is created by a team of experienced writers and subject matter experts. Each author brings their unique perspective and expertise to ensure our articles are accurate, engaging, and valuable. You can learn more about our team on the About page.",
  },

  // Account & Registration
  {
    id: 5,
    category: "Account",
    question: "Do I need an account to read articles?",
    answer:
      "No, you can read all of our articles without creating an account. However, having an account allows you to save favorite articles, leave comments, and receive personalized content recommendations.",
  },
  {
    id: 6,
    category: "Account",
    question: "How do I create an account?",
    answer:
      "Click on the 'Sign Up' button in the top navigation. Fill in your email address, create a password, and verify your email. Once verified, you'll have full access to all account features including commenting and saving articles.",
  },
  {
    id: 7,
    category: "Account",
    question: "I forgot my password. What should I do?",
    answer:
      "Click on 'Login' and then select 'Forgot Password'. Enter your email address and we'll send you instructions to reset your password. If you don't receive the email within a few minutes, check your spam folder.",
  },
  {
    id: 8,
    category: "Account",
    question: "How do I delete my account?",
    answer:
      "To delete your account, log in and go to Account Settings. Scroll down to find the 'Delete Account' option. Please note that this action is permanent and cannot be undone. All your saved articles and comments will be removed.",
  },

  // Newsletter & Subscriptions
  {
    id: 9,
    category: "Newsletter",
    question: "How do I subscribe to the newsletter?",
    answer:
      "You can subscribe to our newsletter by entering your email address in the subscription form located in the footer of every page or in the sidebar of articles. You'll receive a confirmation email to verify your subscription.",
  },
  {
    id: 10,
    category: "Newsletter",
    question: "How often will I receive newsletters?",
    answer:
      "We send newsletters weekly with our latest articles and curated content. You can adjust your email preferences in your account settings to receive newsletters more or less frequently, or to focus on specific topics.",
  },
  {
    id: 11,
    category: "Newsletter",
    question: "How do I unsubscribe from the newsletter?",
    answer:
      "Every newsletter contains an 'Unsubscribe' link at the bottom. Click this link to instantly unsubscribe. Alternatively, you can manage your subscription preferences in your account settings if you're logged in.",
  },
  {
    id: 12,
    category: "Newsletter",
    question: "Can I choose which topics to receive newsletters about?",
    answer:
      "Yes! In your account settings, you can customize your newsletter preferences to receive updates only on specific categories that interest you. This ensures you only get content that's relevant to you.",
  },

  // Comments & Engagement
  {
    id: 13,
    category: "Comments",
    question: "How do I leave a comment on an article?",
    answer:
      "Scroll to the bottom of any article and you'll find the comments section. You need to be logged in to leave a comment. Simply type your comment in the text box and click 'Post Comment'. Your comment will appear after moderation.",
  },
  {
    id: 14,
    category: "Comments",
    question: "Are comments moderated?",
    answer:
      "Yes, all comments are moderated to ensure a respectful and constructive discussion environment. Comments are typically approved within a few hours. We reserve the right to remove comments that violate our community guidelines.",
  },
  {
    id: 15,
    category: "Comments",
    question: "Can I edit or delete my comments?",
    answer:
      "Yes, you can edit or delete your comments within 24 hours of posting. Look for the 'Edit' or 'Delete' options next to your comment. After 24 hours, please contact us if you need to modify or remove a comment.",
  },
  {
    id: 16,
    category: "Comments",
    question: "What are the community guidelines for comments?",
    answer:
      "Please be respectful and constructive. No spam, hate speech, personal attacks, or off-topic content. Keep discussions relevant to the article. Promotional content and external links are subject to removal. Repeated violations may result in account suspension.",
  },

  // Privacy & Security
  {
    id: 17,
    category: "Privacy",
    question: "How is my personal information used?",
    answer:
      "We use your information only to provide and improve our services. We never sell your personal data to third parties. For detailed information about data collection and usage, please read our Privacy Policy.",
  },
  {
    id: 18,
    category: "Privacy",
    question: "Do you use cookies?",
    answer:
      "Yes, we use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie preferences in your browser settings. Essential cookies are required for the site to function properly.",
  },
  {
    id: 19,
    category: "Privacy",
    question: "Is my payment information secure?",
    answer:
      "If we process payments, all payment information is encrypted and processed through secure, PCI-compliant payment processors. We never store complete credit card information on our servers.",
  },
  {
    id: 20,
    category: "Privacy",
    question: "Can I request a copy of my data?",
    answer:
      "Yes, you have the right to request a copy of all personal data we hold about you. Contact us through our contact page with a data request, and we'll provide your information within 30 days in a commonly used format.",
  },

  // Technical Issues
  {
    id: 21,
    category: "Technical",
    question: "The website isn't loading properly. What should I do?",
    answer:
      "Try clearing your browser cache and cookies, then refresh the page. Make sure you're using an updated browser. If problems persist, try accessing the site from a different browser or device. Contact us if the issue continues.",
  },
  {
    id: 22,
    category: "Technical",
    question: "Are you mobile-friendly?",
    answer:
      "Yes! Our website is fully responsive and optimized for all devices including smartphones, tablets, and desktop computers. You'll have a great reading experience regardless of your device.",
  },
  {
    id: 23,
    category: "Technical",
    question: "Why can't I see images in articles?",
    answer:
      "This could be due to slow internet connection, browser settings, or ad blockers. Try disabling ad blockers for our site, checking your internet connection, or clearing your browser cache. Images should load automatically.",
  },
  {
    id: 24,
    category: "Technical",
    question: "Which browsers do you support?",
    answer:
      "We support all modern browsers including Chrome, Firefox, Safari, Edge, and Opera. For the best experience, please use the latest version of your preferred browser. Internet Explorer is not fully supported.",
  },

  // Content & Copyright
  {
    id: 25,
    category: "Content",
    question: "Can I share your articles on social media?",
    answer:
      "Absolutely! We encourage sharing our content. Use the social sharing buttons on each article, or copy the URL to share. Please don't copy entire articles without permission. Sharing excerpts with proper attribution is welcome.",
  },
  {
    id: 26,
    category: "Content",
    question: "Can I use your content on my website?",
    answer:
      "You may share brief excerpts (up to 200 words) with proper attribution and a link back to the original article. For republishing full articles or using content commercially, please contact us for permission.",
  },
  {
    id: 27,
    category: "Content",
    question: "How do I report copyright infringement?",
    answer:
      "If you believe content on our site infringes your copyright, please contact us immediately through our contact page with details of the infringement. We take copyright seriously and will investigate all claims promptly.",
  },

];

const categories = [
  "All",
  "General",
  "Account",
  "Newsletter",
  "Comments",
  "Privacy",
  "Technical",
  "Content",
];

// Helper function to get absolute URL
const getAbsoluteUrl = (path: string): string => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "https://blog.ctrlbits.com";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

export const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  /**
   * Filter FAQs based on search and category
   */
  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  /**
   * Toggle FAQ item expansion
   */
  const toggleItem = (id: number) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  /**
   * Expand all items
   */
  const expandAll = () => {
    setExpandedItems(filteredFAQs.map((faq) => faq.id));
  };

  /**
   * Collapse all items
   */
  const collapseAll = () => {
    setExpandedItems([]);
  };

  // SEO Data
  const pageTitle = searchQuery
    ? `Search: "${searchQuery}" in FAQ | BitsBlog`
    : selectedCategory !== "All"
    ? `${selectedCategory} FAQs | BitsBlog`
    : "Frequently Asked Questions | BitsBlog";

  const pageDescription = searchQuery
    ? `Search results for "${searchQuery}" in our FAQ. Found ${filteredFAQs.length} matching questions.`
    : selectedCategory !== "All"
    ? `Frequently asked questions about ${selectedCategory.toLowerCase()}. Find answers to common questions about our blog, accounts, newsletters, and more.`
    : "Find answers to frequently asked questions about BitsBlog. Learn about accounts, newsletters, comments, privacy, technical issues, and content guidelines.";

  const pageUrl = getAbsoluteUrl("/faq");
  const ogImage = getAbsoluteUrl("/og-faq.jpg");
  const keywords =
    "FAQ, frequently asked questions, help, support, account help, newsletter, comments, privacy, technical support, blog help, customer support";

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
        name: "FAQ",
        item: pageUrl,
      },
    ],
  };

  // FAQPage structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />

        {/* Canonical Link */}
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content="BitsBlog" />
        <meta property="og:image" content={ogImage} />
        <meta
          property="og:image:alt"
          content="BitsBlog FAQ - Find answers to your questions"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content="BitsBlog FAQ" />
        <meta name="twitter:site" content="@ctrl_bits" />

        {/* Structured Data - Breadcrumb */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>

        {/* Structured Data - FAQPage */}
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-6 py-16 max-w-6xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-12 bg-black"></div>
              <span className="text-sm font-medium text-black uppercase tracking-wider">
                Support
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-light text-black mb-6 leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-neutral-600 font-light max-w-3xl">
              Find answers to common questions about our blog, accounts,
              newsletters, and more. Can't find what you're looking for? Check
              our{" "}
              <Link href="/help" className="underline hover:text-black">
                Help Center
              </Link>{" "}
              or{" "}
              <Link href="/contact" className="underline hover:text-black">
                contact us
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6 py-16 max-w-6xl">
          {/* Search and Filters */}
          <div className="mb-12">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 border-neutral-300 focus:border-black rounded-none h-14 font-light text-lg"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 text-sm font-light border transition-colors ${
                      selectedCategory === category
                        ? "border-black bg-black text-white"
                        : "border-neutral-300 text-neutral-600 hover:border-black hover:text-black"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={expandAll}
                  className="text-sm font-light"
                >
                  Expand All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={collapseAll}
                  className="text-sm font-light"
                >
                  Collapse All
                </Button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          {searchQuery && (
            <div className="mb-6">
              <p className="text-sm text-neutral-600 font-light">
                Found {filteredFAQs.length} result
                {filteredFAQs.length !== 1 ? "s" : ""} for "{searchQuery}"
              </p>
            </div>
          )}

          {/* FAQ Items */}
          {filteredFAQs.length === 0 ? (
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="p-16 text-center">
                <HelpCircle className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
                <h3 className="text-2xl font-light text-black mb-3">
                  No results found
                </h3>
                <p className="text-neutral-600 font-light mb-8">
                  We couldn't find any questions matching your search. Try
                  different keywords or browse by category.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  variant="outline"
                  className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-12 px-8"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq) => {
                const isExpanded = expandedItems.includes(faq.id);

                return (
                  <Card
                    key={faq.id}
                    className="border-neutral-200 rounded-none shadow-none hover:shadow-md transition-all"
                  >
                    <CardHeader
                      className="cursor-pointer"
                      onClick={() => toggleItem(faq.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500 border border-neutral-300 px-2 py-1">
                              {faq.category}
                            </span>
                          </div>
                          <CardTitle className="text-lg font-medium text-black leading-relaxed">
                            {faq.question}
                          </CardTitle>
                        </div>
                        <div className="shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-neutral-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-neutral-400" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent className="border-t border-neutral-200 pt-6">
                        <p className="text-neutral-600 font-light leading-relaxed">
                          {faq.answer}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Still Need Help Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <Book className="h-8 w-8 text-black mb-4" />
                <h3 className="text-lg font-medium text-black mb-2">
                  Documentation
                </h3>
                <p className="text-sm text-neutral-600 font-light mb-4">
                  Detailed guides and tutorials for using our platform.
                </p>
                <Link href="/documentation">
                  <Button
                    variant="outline"
                    className="w-full border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                  >
                    Browse Docs
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <HelpCircle className="h-8 w-8 text-black mb-4" />
                <h3 className="text-lg font-medium text-black mb-2">
                  Help Center
                </h3>
                <p className="text-sm text-neutral-600 font-light mb-4">
                  Browse articles and troubleshooting guides.
                </p>
                <Link href="/help">
                  <Button
                    variant="outline"
                    className="w-full border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                  >
                    Get Help
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <Mail className="h-8 w-8 text-black mb-4" />
                <h3 className="text-lg font-medium text-black mb-2">
                  Contact Support
                </h3>
                <p className="text-sm text-neutral-600 font-light mb-4">
                  Can't find an answer? We're here to help.
                </p>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    className="w-full border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                  >
                    Contact Us
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQ;
