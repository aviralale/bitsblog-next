/**
 * SEO Metadata Generator for Client Components
 * Provides consistent SEO, AEO, and GEO optimization across all pages
 */

export interface PageSEO {
  title: string;
  description: string;
  keywords: string[];
  url: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generate comprehensive SEO metadata for client components
 */
export const generateSEOTags = (seo: PageSEO) => {
  const {
    title,
    description,
    keywords,
    url,
    image = 'https://blog.ctrlbits.com/og-default.jpg',
    type = 'website',
    author,
    publishedTime,
    modifiedTime,
  } = seo;

  return {
    basic: {
      title,
      description,
      keywords: keywords.join(', '),
      robots: 'index, follow',
      canonical: url,
      author: author || 'Ctrl Bits',
    },
    openGraph: {
      type,
      title,
      description,
      url,
      siteName: 'BitsBlog',
      locale: 'en_US',
      image,
      imageAlt: title,
      imageWidth: '1200',
      imageHeight: '630',
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      site: '@ctrl_bits',
      creator: '@ctrl_bits',
      title,
      description,
      image,
      imageAlt: title,
    },
  };
};

/**
 * Generate Breadcrumb Schema
 */
export const generateBreadcrumbSchema = (items: BreadcrumbItem[]) => {
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
};

/**
 * Generate Organization Schema (for homepage/about)
 */
export const generateOrganizationSchema = (url: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ctrl Bits',
    url: url,
    logo: `${url}/logo.png`,
    description: 'Digital innovation and web development company specializing in modern web applications, AI solutions, and software architecture in Nepal.',
    foundingDate: '2020',
    foundingLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'NP',
        addressLocality: 'Kathmandu',
      },
    },
    sameAs: [
      'https://facebook.com/ctrlbits',
      'https://twitter.com/ctrl_bits',
      'https://linkedin.com/company/ctrlbits',
      'https://github.com/ctrlbits',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hi@ctrlbits.com',
      contactType: 'Customer Service',
      availableLanguage: ['English', 'Nepali'],
    },
  };
};

/**
 * Generate Website Schema
 */
export const generateWebsiteSchema = (url: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BitsBlog',
    url: url,
    description: "Nepal's premier technology blog and blog directory showcasing the best blogs in Nepal",
    publisher: {
      '@type': 'Organization',
      name: 'Ctrl Bits',
      logo: {
        '@type': 'ImageObject',
        url: `${url}/logo.png`,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
};

/**
 * Generate Contact Page Schema
 */
export const generateContactPageSchema = (url: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact BitsBlog',
    url: url,
    description: 'Get in touch with the BitsBlog team. We are here to help with questions, feedback, and partnership opportunities.',
    mainEntity: {
      '@type': 'Organization',
      name: 'Ctrl Bits',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'hi@ctrlbits.com',
        contactType: 'Customer Service',
        availableLanguage: ['English', 'Nepali'],
      },
    },
  };
};

/**
 * Common keywords for BitsBlog
 */
export const COMMON_KEYWORDS = [
  'BitsBlog',
  'Ctrl Bits',
  'Nepal tech blog',
  'technology blog Nepal',
  'web development Nepal',
  'programming tutorials',
  'software engineering',
  'best blogs Nepal',
  'Nepali tech community',
];

/**
 * E-E-A-T Keywords for authority
 */
export const EEAT_KEYWORDS = [
  'expert tech insights',
  'verified tech content',
  'trusted Nepal tech blog',
  'authoritative technology articles',
  'experienced developers Nepal',
];
