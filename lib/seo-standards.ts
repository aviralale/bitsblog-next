/**
 * SEO Metadata Standardization Utilities
 * Ensures all pages meet Ahrefs audit requirements:
 * - Meta descriptions: 120-160 characters
 * - Page titles: 50-60 characters (without brand suffix)
 * - Proper Open Graph & Twitter Card tags
 * - Valid schema.org structured data
 * - Accessible robots.txt and sitemap
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.ctrlbits.com';
const SITE_NAME = 'BitsBlog';

/**
 * Optimize title by truncating to ideal length (50-60 chars, excluding suffix)
 */
export function optimizeTitle(title: string, suffix = SITE_NAME): string {
  const maxBaseLength = 60;
  let baseTitleTrimmed = title;

  if (title.length > maxBaseLength) {
    baseTitleTrimmed = title.substring(0, maxBaseLength).trim();
    // Remove trailing words to make it natural
    const lastSpace = baseTitleTrimmed.lastIndexOf(' ');
    if (lastSpace > 40) {
      baseTitleTrimmed = baseTitleTrimmed.substring(0, lastSpace);
    }
  }

  const fullTitle = `${baseTitleTrimmed} | ${suffix}`;
  return fullTitle.length > 60 ? baseTitleTrimmed : fullTitle;
}

/**
 * Optimize description to be 120-160 characters
 */
export function optimizeDescription(
  text: string,
  minLength = 120,
  maxLength = 160,
): string {
  if (!text) return '';
  
  let cleaned = text
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();

  // If too short, use as-is (will fail audit but preserve content)
  if (cleaned.length < minLength) {
    return cleaned;
  }

  // If within range, perfect
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  // If too long, truncate intelligently
  let truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > minLength) {
    truncated = truncated.substring(0, lastSpace) + '...';
  }

  return truncated.substring(0, maxLength);
}

/**
 * Create valid JSON-LD Article schema with all required fields
 * Fixes schema.org validation errors
 */
export function createArticleSchema(data: {
  title: string;
  description?: string;
  content?: string;
  image?: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  author?: {
    name: string;
    url?: string;
  };
  wordCount?: number;
}) {
  const url = data.url.startsWith('http') ? data.url : `${SITE_URL}${data.url}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title.substring(0, 110), // Schema.org recommends max 110 chars
    description: data.description || 'Read this article on BitsBlog.',
    image: {
      '@type': 'ImageObject',
      url: data.image || `${SITE_URL}/og-default.jpg`,
      width: 1200,
      height: 630,
      alt: data.title,
    },
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    datePublished: data.datePublished || new Date().toISOString(),
    dateModified: data.dateModified || new Date().toISOString(),
    ...(data.author && {
      author: {
        '@type': 'Person',
        name: data.author.name,
        ...(data.author.url && { url: data.author.url }),
      },
    }),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.png`,
        width: 512,
        height: 512,
      },
    },
    ...(data.wordCount && { wordCount: data.wordCount }),
    inLanguage: 'en-US',
  };
}

/**
 * Create valid JSON-LD WebPage schema
 */
export function createWebPageSchema(data: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
}) {
  const url = data.url.startsWith('http') ? data.url : `${SITE_URL}${data.url}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: data.title,
    description: data.description,
    url,
    image: {
      '@type': 'ImageObject',
      url: data.image || `${SITE_URL}/og-default.jpg`,
      width: 1200,
      height: 630,
      alt: data.title,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.png`,
        width: 512,
        height: 512,
      },
    },
    inLanguage: 'en-US',
    ...(data.datePublished && { datePublished: data.datePublished }),
    ...(data.dateModified && { dateModified: data.dateModified }),
  };
}

/**
 * Create valid JSON-LD BreadcrumbList schema
 * IMPORTANT: This must match actual page breadcrumbs exactly
 */
export function createBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  // Always add home as first item
  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    ...items,
  ];

  // Remove duplicates keeping first occurrence
  const uniqueBreadcrumbs = breadcrumbs.reduce((acc, current) => {
    if (!acc.find((item) => item.url === current.url)) {
      acc.push(current);
    }
    return acc;
  }, [] as typeof breadcrumbs);

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: uniqueBreadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Validate a schema.org JSON-LD object has required fields
 * Returns validation errors array (empty = valid)
 */
export function validateSchema(schema: any): string[] {
  const errors: string[] = [];

  if (!schema['@context']) {
    errors.push('Missing @context');
  }
  if (!schema['@type']) {
    errors.push('Missing @type');
  }

  // Type-specific required fields
  const type = schema['@type'];
  if (type === 'BlogPosting' || type === 'Article') {
    if (!schema.headline) errors.push('BlogPosting: Missing headline');
    if (!schema.datePublished) errors.push('BlogPosting: Missing datePublished');
    if (!schema.author) errors.push('BlogPosting: Missing author');
    if (!schema.publisher) errors.push('BlogPosting: Missing publisher');
    if (!schema.image) errors.push('BlogPosting: Missing image');
  } else if (type === 'BreadcrumbList') {
    if (!schema.itemListElement || !Array.isArray(schema.itemListElement)) {
      errors.push('BreadcrumbList: Missing itemListElement array');
    }
  } else if (type === 'WebPage' || type === 'WebSite') {
    if (!schema.name) errors.push(`${type}: Missing name`);
    if (!schema.url) errors.push(`${type}: Missing url`);
  }

  return errors;
}

/**
 * Get Ahrefs-friendly Open Graph image (must be 1200x630 or aspect ratio 1.91:1)
 */
export function getOGImage(imageUrl?: string): {
  url: string;
  width: 1200;
  height: 630;
  alt: string;
} {
  return {
    url: imageUrl || `${SITE_URL}/og-default.jpg`,
    width: 1200,
    height: 630,
    alt: 'BitsBlog',
  };
}

/**
 * Ensure URL is absolute (required by schema.org)
 */
export function getAbsoluteUrl(path?: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Create Complete Page Metadata Object (Next.js Metadata format)
 * Use this to ensure all pages have complete OG and Twitter tags
 */
export function createPageMetadata(data: {
  title: string;
  description: string;
  keywords?: string[];
  url: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  datePublished?: string;
  dateModified?: string;
  author?: string;
  canonical?: string;
}) {
  const ogImage = getOGImage(data.image);
  const absoluteUrl = getAbsoluteUrl(data.url);

  return {
    title: optimizeTitle(data.title),
    description: optimizeDescription(data.description),
    ...(data.keywords && { keywords: data.keywords }),
    authors: data.author ? [{ name: data.author }] : [{ name: 'Ctrl Bits' }],
    creator: 'Ctrl Bits',
    publisher: 'Ctrl Bits',
    alternates: {
      canonical: data.canonical || absoluteUrl,
    },
    openGraph: {
      type: data.type === 'article' ? 'article' : 'website',
      url: absoluteUrl,
      title: optimizeTitle(data.title),
      description: optimizeDescription(data.description),
      siteName: SITE_NAME,
      locale: 'en_US',
      images: [ogImage],
      ...(data.type === 'article' && {
        publishedTime: data.datePublished,
        modifiedTime: data.dateModified,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: optimizeTitle(data.title),
      description: optimizeDescription(data.description),
      site: '@ctrl_bits',
      creator: '@ctrl_bits',
      images: [ogImage.url],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
