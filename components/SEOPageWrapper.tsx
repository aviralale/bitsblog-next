/**
 * SEO Page Wrapper Component
 * Ensures every page has:
 * - H1 title for accessibility and SEO
 * - Complete Open Graph tags  
 * - Complete Twitter Card tags
 * - Proper schema.org structured data
 * - Accessible heading hierarchy
 */

import { ReactNode } from 'react';
import Head from 'next/head';

interface SEOPageWrapperProps {
  /**
   * Primary page heading (will become H1)
   * Should be descriptive and under 60 characters
   */
  heading: string;

  /**
   * Page title for <title> tag (with brand suffix)
   */
  title: string;

  /**
   * Meta description (120-160 characters)
   */
  description: string;

  /**
   * Full page URL (must be absolute)
   */
  url: string;

  /**
   * OG image URL (must be 1200x630 or 1.91:1 aspect ratio)
   */
  image?: string;

  /**  
   * Structured data JSON-LD blocks to inject
   */
  schemas?: Array<Record<string, any>>;

  /**
   * Optional breadcrumb items for BreadcrumbList schema
   */
  breadcrumbs?: Array<{ name: string; url: string }>;

  /**
   * Page type for OG (website, article, profile, etc.)
   */
  type?: 'website' | 'article' | 'profile' | 'business.business';

  /**
   * Keywords for the page
   */
  keywords?: string[];

  /**
   * Article specific fields
   */
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };

  /**
   * Page content
   */
  children: ReactNode;

  /**
   * Optional CSS class for heading  styling
   */
  headingClassName?: string;

  /**
   * Optional: Skip rendering H1 if false
   */
  skipH1?: boolean;

  /**
   * Optional: Skip Head tag injection for server-side metadata approaches
   */
  skipHeadInject?: boolean;
}

/**
 * Format heading as proper title case
 */
function formatHeading(text: string): string {
  return text
    .split(' ')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.toLowerCase().slice(1),
    )
    .join(' ');
}

/**
 * Create BreadcrumbList schema
 */
function createBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function SEOPageWrapper({
  heading,
  title,
  description,
  url,
  image = 'https://blog.ctrlbits.com/og-default.jpg',
  schemas = [],
  breadcrumbs = [],
  type = 'website',
  keywords = [],
  article,
  children,
  headingClassName = 'text-3xl md:text-4xl lg:text-5xl font-bold mb-6',
  skipH1 = false,
  skipHeadInject = false,
}: SEOPageWrapperProps) {
  // Ensure URL is absolute
  const absoluteUrl = url.startsWith('http') 
    ? url 
    : `https://blog.ctrlbits.com${url.startsWith('/') ? url : `/${url}`}`;

  // Build schemas array
  const allSchemas = [...schemas];

  // Add breadcrumb schema if provided
  if (breadcrumbs.length > 0) {
    allSchemas.push(createBreadcrumbSchema(breadcrumbs));
  }

  // Build keyword list
  const allKeywords = [
    ...keywords,
    'BitsBlog',
    'Nepal tech blog',
    'technology blog',
  ].filter(Boolean);

  return (
    <>
      {!skipHeadInject && (
        <Head>
          {/* Basic Meta Tags */}
          <title>{title}</title>
          <meta name="description" content={description} />
          {allKeywords.length > 0 && (
            <meta name="keywords" content={allKeywords.join(', ')} />
          )}
          <meta name="robots" content="index, follow" />
          <meta name="author" content="Ctrl Bits" />

          {/* Canonical Link */}
          <link rel="canonical" href={absoluteUrl} />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content={type} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:url" content={absoluteUrl} />
          <meta property="og:site_name" content="BitsBlog" />
          <meta property="og:image" content={image} />
          <meta property="og:image:alt" content={title} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:locale" content="en_US" />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:image" content={image} />
          <meta name="twitter:image:alt" content={title} />
          <meta name="twitter:site" content="@ctrl_bits" />
          <meta name="twitter:creator" content="@ctrl_bits" />

          {/* Article Meta Tags */}
          {article && (
            <>
              {article.publishedTime && (
                <meta property="article:published_time" content={article.publishedTime} />
              )}
              {article.modifiedTime && (
                <meta property="article:modified_time" content={article.modifiedTime} />
              )}
              {article.author && (
                <meta property="article:author" content={article.author} />
              )}
              {article.section && (
                <meta property="article:section" content={article.section} />
              )}
              {article.tags?.map((tag) => (
                <meta key={tag} property="article:tag" content={tag} />
              ))}
            </>
          )}
        </Head>
      )}

      {/* Inject Structured Data */}
      {allSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}

      {/* Page Content */}
      <div className="w-full">
        {/* H1 Heading - CRITICAL FOR SEO & ACCESSIBILITY */}
        {!skipH1 && (
          <h1 className={headingClassName} id="page-heading">
            {formatHeading(heading)}
          </h1>
        )}

        {/* Page Children */}
        {children}
      </div>
    </>
  );
}

export default SEOPageWrapper;
