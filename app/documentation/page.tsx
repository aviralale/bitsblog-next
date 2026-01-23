"use client";
import { useState } from "react";
import {
  Book,
  Code,
  Terminal,
  Package,
  Zap,
  Shield,
  Database,
  Workflow,
  FileCode,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Search,
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
import Head from "next/head";
import Link from "next/link";

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  articles: DocArticle[];
}

interface DocArticle {
  id: number;
  title: string;
  description: string;
  slug: string;
}

const documentationSections: DocSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Quick start guides and basic concepts",
    icon: <Book className="h-6 w-6" />,
    articles: [
      {
        id: 1,
        title: "Introduction to Our Platform",
        description: "Overview of features and capabilities",
        slug: "introduction",
      },
      {
        id: 2,
        title: "Installation & Setup",
        description: "How to set up and configure your account",
        slug: "installation-setup",
      },
      {
        id: 3,
        title: "Quick Start Guide",
        description: "Get up and running in 5 minutes",
        slug: "quick-start",
      },
      {
        id: 4,
        title: "Core Concepts",
        description: "Understanding the fundamental principles",
        slug: "core-concepts",
      },
    ],
  },
  {
    id: "api-reference",
    title: "API Reference",
    description: "Complete API documentation and examples",
    icon: <Code className="h-6 w-6" />,
    articles: [
      {
        id: 5,
        title: "Authentication",
        description: "API keys, OAuth, and authentication methods",
        slug: "authentication",
      },
      {
        id: 6,
        title: "REST API Endpoints",
        description: "Complete list of available endpoints",
        slug: "rest-endpoints",
      },
      {
        id: 7,
        title: "GraphQL API",
        description: "Using GraphQL for flexible queries",
        slug: "graphql-api",
      },
      {
        id: 8,
        title: "Rate Limiting",
        description: "Understanding and handling rate limits",
        slug: "rate-limiting",
      },
    ],
  },
  {
    id: "guides",
    title: "Guides & Tutorials",
    description: "Step-by-step guides for common tasks",
    icon: <FileCode className="h-6 w-6" />,
    articles: [
      {
        id: 9,
        title: "Building Your First Integration",
        description: "Create a simple integration from scratch",
        slug: "first-integration",
      },
      {
        id: 10,
        title: "Working with Webhooks",
        description: "Real-time notifications and event handling",
        slug: "webhooks",
      },
      {
        id: 11,
        title: "Data Import & Export",
        description: "Bulk data operations and migrations",
        slug: "data-operations",
      },
      {
        id: 12,
        title: "Advanced Filtering",
        description: "Complex queries and search operations",
        slug: "advanced-filtering",
      },
    ],
  },
  {
    id: "sdks-libraries",
    title: "SDKs & Libraries",
    description: "Official SDKs and client libraries",
    icon: <Package className="h-6 w-6" />,
    articles: [
      {
        id: 13,
        title: "JavaScript/Node.js SDK",
        description: "Official JavaScript library and examples",
        slug: "javascript-sdk",
      },
      {
        id: 14,
        title: "Python SDK",
        description: "Python client library documentation",
        slug: "python-sdk",
      },
      {
        id: 15,
        title: "Ruby SDK",
        description: "Ruby gem documentation and usage",
        slug: "ruby-sdk",
      },
      {
        id: 16,
        title: "PHP SDK",
        description: "PHP library and integration guide",
        slug: "php-sdk",
      },
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "Connect with third-party services",
    icon: <Workflow className="h-6 w-6" />,
    articles: [
      {
        id: 17,
        title: "Zapier Integration",
        description: "Automate workflows with Zapier",
        slug: "zapier",
      },
      {
        id: 18,
        title: "WordPress Plugin",
        description: "Integrate with WordPress sites",
        slug: "wordpress",
      },
      {
        id: 19,
        title: "Slack Integration",
        description: "Send notifications to Slack channels",
        slug: "slack",
      },
      {
        id: 20,
        title: "Google Analytics",
        description: "Track analytics and user behavior",
        slug: "google-analytics",
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    description: "Security best practices and guidelines",
    icon: <Shield className="h-6 w-6" />,
    articles: [
      {
        id: 21,
        title: "Security Overview",
        description: "Our approach to security and privacy",
        slug: "security-overview",
      },
      {
        id: 22,
        title: "API Security Best Practices",
        description: "Secure your API integrations",
        slug: "api-security",
      },
      {
        id: 23,
        title: "Data Encryption",
        description: "How we encrypt data at rest and in transit",
        slug: "data-encryption",
      },
      {
        id: 24,
        title: "Compliance & Certifications",
        description: "GDPR, SOC 2, and other compliance standards",
        slug: "compliance",
      },
    ],
  },
];

const codeExamples = [
  {
    title: "Authentication",
    language: "JavaScript",
    code: `// Initialize the client
const client = new BlogAPI({
  apiKey: 'your_api_key_here'
});

// Make an authenticated request
const posts = await client.posts.list();
console.log(posts);`,
  },
  {
    title: "Create a Post",
    language: "Python",
    code: `# Import the SDK
from blog_api import BlogClient

# Initialize client
client = BlogClient(api_key='your_api_key')

# Create a new post
post = client.posts.create(
    title='Hello World',
    content='My first post',
    status='published'
)
print(post.id)`,
  },
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

export const Documentation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  /**
   * Copy code to clipboard
   */
  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  /**
   * Filter articles based on search
   */
  const searchResults = searchQuery
    ? documentationSections.flatMap((section) =>
        section.articles
          .filter(
            (article) =>
              article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              article.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
          )
          .map((article) => ({
            ...article,
            section: section.title,
            sectionId: section.id,
          }))
      )
    : [];

  // SEO Data
  const pageTitle = searchQuery
    ? `Search: "${searchQuery}" in Documentation | BitsBlog`
    : "Developer Documentation | BitsBlog";
  const pageDescription = searchQuery
    ? `Search results for "${searchQuery}" in our documentation. Found ${searchResults.length} matching articles.`
    : "Comprehensive developer documentation, API references, guides, and tutorials. Learn how to integrate and build with our platform using our REST API, GraphQL, and official SDKs.";
  const pageUrl = getAbsoluteUrl("/documentation");
  const ogImage = getAbsoluteUrl("/og-documentation.jpg");
  const keywords =
    "API documentation, developer docs, REST API, GraphQL API, SDK, JavaScript SDK, Python SDK, API reference, integration guide, webhooks, authentication, developer resources";

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
        name: "Documentation",
        item: pageUrl,
      },
    ],
  };

  // TechArticle structured data
  const techArticleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "Developer Documentation",
    description: pageDescription,
    url: pageUrl,
    publisher: {
      "@type": "Organization",
      name: "Ctrl Bits",
      logo: {
        "@type": "ImageObject",
        url: getAbsoluteUrl("/logo.png"),
      },
    },
    about: {
      "@type": "SoftwareApplication",
      name: "BitsBlog API",
      applicationCategory: "DeveloperApplication",
    },
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
          content="BitsBlog Developer Documentation"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content="BitsBlog Documentation" />
        <meta name="twitter:site" content="@ctrl_bits" />

        {/* Structured Data - Breadcrumb */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>

        {/* Structured Data - TechArticle */}
        <script type="application/ld+json">
          {JSON.stringify(techArticleSchema)}
        </script>
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-neutral-200 bg-neutral-50">
          <div className="container mx-auto px-6 py-16 max-w-7xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-12 bg-black"></div>
              <span className="text-sm font-medium text-black uppercase tracking-wider">
                Developer Resources
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-light text-black mb-6 leading-tight">
              Documentation
            </h1>
            <p className="text-lg text-neutral-600 font-light max-w-3xl mb-8">
              Comprehensive guides, API references, and tutorials to help you
              integrate and build with our platform.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white border-neutral-300 focus:border-black rounded-none h-14 font-light text-lg"
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-16 max-w-7xl">
          {/* Search Results */}
          {searchQuery && (
            <div className="mb-16">
              <h2 className="text-2xl font-light text-black mb-6">
                Search Results ({searchResults.length})
              </h2>
              {searchResults.length === 0 ? (
                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardContent className="p-16 text-center">
                    <Book className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
                    <h3 className="text-xl font-light text-black mb-3">
                      No results found
                    </h3>
                    <p className="text-neutral-600 font-light mb-8">
                      Try different keywords or browse sections below
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
                    <Link
                      key={article.id}
                      href={`/docs/${article.sectionId}/${article.slug}`}
                      className="group"
                    >
                      <Card className="border-neutral-200 rounded-none shadow-none hover:shadow-md transition-all h-full">
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-neutral-500 font-light">
                              {article.section}
                            </span>
                          </div>
                          <CardTitle className="text-lg font-medium text-black leading-relaxed group-hover:underline">
                            {article.title}
                          </CardTitle>
                          <CardDescription className="text-neutral-600 font-light">
                            {article.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Start Section */}
          {!searchQuery && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <Zap className="h-6 w-6 text-black" />
                <h2 className="text-3xl font-light text-black">Quick Start</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardHeader className="border-b border-neutral-200">
                    <CardTitle className="text-xl font-medium text-black">
                      For Developers
                    </CardTitle>
                    <CardDescription className="text-neutral-600 font-light">
                      Get started with our API in minutes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 border border-black flex items-center justify-center shrink-0 text-sm font-light">
                          1
                        </div>
                        <div>
                          <p className="font-medium text-black">
                            Get your API key
                          </p>
                          <p className="text-sm text-neutral-600 font-light">
                            Sign up and generate your API credentials
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 border border-black flex items-center justify-center shrink-0 text-sm font-light">
                          2
                        </div>
                        <div>
                          <p className="font-medium text-black">Install SDK</p>
                          <p className="text-sm text-neutral-600 font-light">
                            Choose your preferred language and install
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 border border-black flex items-center justify-center shrink-0 text-sm font-light">
                          3
                        </div>
                        <div>
                          <p className="font-medium text-black">
                            Make your first request
                          </p>
                          <p className="text-sm text-neutral-600 font-light">
                            Start building with our API
                          </p>
                        </div>
                      </div>
                    </div>
                    <Link href="/docs/getting-started/quick-start">
                      <Button className="w-full bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 mt-4">
                        Start Building <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardHeader className="border-b border-neutral-200">
                    <CardTitle className="text-xl font-medium text-black">
                      For Content Creators
                    </CardTitle>
                    <CardDescription className="text-neutral-600 font-light">
                      Learn how to maximize your blog's potential
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 border border-black flex items-center justify-center shrink-0 text-sm font-light">
                          1
                        </div>
                        <div>
                          <p className="font-medium text-black">
                            Set up your profile
                          </p>
                          <p className="text-sm text-neutral-600 font-light">
                            Customize your author profile and bio
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 border border-black flex items-center justify-center shrink-0 text-sm font-light">
                          2
                        </div>
                        <div>
                          <p className="font-medium text-black">
                            Create your first post
                          </p>
                          <p className="text-sm text-neutral-600 font-light">
                            Write and publish engaging content
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 border border-black flex items-center justify-center shrink-0 text-sm font-light">
                          3
                        </div>
                        <div>
                          <p className="font-medium text-black">
                            Grow your audience
                          </p>
                          <p className="text-sm text-neutral-600 font-light">
                            Learn SEO and promotion strategies
                          </p>
                        </div>
                      </div>
                    </div>
                    <Link href="/help">
                      <Button
                        variant="outline"
                        className="w-full border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-12 mt-4"
                      >
                        View Help Center{" "}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Code Examples */}
          {!searchQuery && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <Terminal className="h-6 w-6 text-black" />
                <h2 className="text-3xl font-light text-black">
                  Code Examples
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {codeExamples.map((example, index) => (
                  <Card
                    key={index}
                    className="border-neutral-200 rounded-none shadow-none"
                  >
                    <CardHeader className="border-b border-neutral-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-medium text-black">
                            {example.title}
                          </CardTitle>
                          <CardDescription className="text-neutral-600 font-light mt-1">
                            {example.language}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCode(example.code, index)}
                          className="rounded-none"
                        >
                          {copiedIndex === index ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <pre className="bg-neutral-900 text-neutral-100 p-6 overflow-x-auto">
                        <code className="text-sm font-mono">
                          {example.code}
                        </code>
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Documentation Sections */}
          {!searchQuery && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-light text-black mb-3">
                  Browse Documentation
                </h2>
                <p className="text-neutral-600 font-light">
                  Explore our comprehensive documentation by topic
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documentationSections.map((section) => (
                  <Card
                    key={section.id}
                    className="border-neutral-200 rounded-none shadow-none hover:shadow-md transition-all"
                  >
                    <CardHeader className="border-b border-neutral-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                          {section.icon}
                        </div>
                      </div>
                      <CardTitle className="text-xl font-medium text-black">
                        {section.title}
                      </CardTitle>
                      <CardDescription className="text-neutral-600 font-light">
                        {section.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ul className="space-y-3">
                        {section.articles.map((article) => (
                          <li key={article.id}>
                            <Link
                              href={`/docs/${section.id}/${article.slug}`}
                              className="text-sm text-neutral-600 hover:text-black transition-colors flex items-center gap-2 group"
                            >
                              <ChevronRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-black transition-colors" />
                              {article.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={`/docs/${section.id}`}
                        className="text-sm text-black hover:underline inline-flex items-center gap-2 mt-4"
                      >
                        View all <ChevronRight className="h-4 w-4" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardContent className="pt-6">
                  <Database className="h-8 w-8 text-black mb-4" />
                  <h3 className="text-lg font-medium text-black mb-2">
                    API Reference
                  </h3>
                  <p className="text-sm text-neutral-600 font-light mb-4">
                    Complete API endpoint documentation
                  </p>
                  <Link href="/docs/api-reference">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-9"
                    >
                      View API Docs
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardContent className="pt-6">
                  <ExternalLink className="h-8 w-8 text-black mb-4" />
                  <h3 className="text-lg font-medium text-black mb-2">
                    GitHub Repos
                  </h3>
                  <p className="text-sm text-neutral-600 font-light mb-4">
                    Explore our open-source projects
                  </p>
                  <a
                    href="https://github.com/yourblog"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-9"
                    >
                      View on GitHub
                    </Button>
                  </a>
                </CardContent>
              </Card>

              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardContent className="pt-6">
                  <Book className="h-8 w-8 text-black mb-4" />
                  <h3 className="text-lg font-medium text-black mb-2">
                    Help Center
                  </h3>
                  <p className="text-sm text-neutral-600 font-light mb-4">
                    User guides and tutorials
                  </p>
                  <Link href="/help">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-9"
                    >
                      Get Help
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardContent className="pt-6">
                  <Shield className="h-8 w-8 text-black mb-4" />
                  <h3 className="text-lg font-medium text-black mb-2">
                    Status Page
                  </h3>
                  <p className="text-sm text-neutral-600 font-light mb-4">
                    Check system status and uptime
                  </p>
                  <a
                    href="https://status.yourblog.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-9"
                    >
                      View Status
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Community & Support */}
          <div className="mt-16 pt-16 border-t border-neutral-200">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-light text-black mb-4">
                Need More Help?
              </h2>
              <p className="text-neutral-600 font-light mb-8">
                Can't find what you're looking for? Our support team is ready to
                assist you with any questions or issues.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/contact">
                  <Button className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8">
                    Contact Support
                  </Button>
                </Link>
                <Link href="/faq">
                  <Button
                    variant="outline"
                    className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-12 px-8"
                  >
                    View FAQ
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Documentation;
