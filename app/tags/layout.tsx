import { Metadata } from "next";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ctrlbits.com";

export const metadata: Metadata = {
  title: "Browse All Tags - Technology Topics & Keywords | BitsBlog Nepal",
  description:
    "Browse all tags and keywords on BitsBlog. Find articles by specific topics including React, Next.js, Python, Django, AI, ML, DevOps, and more technology-related tags.",
  keywords: [
    "tech tags",
    "programming tags",
    "technology keywords",
    "blog tags",
    "article topics",
    "coding tags",
    "Nepal tech blog",
  ],
  alternates: {
    canonical: `${SITE_URL}/tags`,
  },
  openGraph: {
    title: "Browse All Tags - Technology Topics | BitsBlog Nepal",
    description:
      "Browse all tags and keywords. Find articles by specific topics including React, Next.js, Python, Django, AI, and more.",
    url: `${SITE_URL}/tags`,
    siteName: "BitsBlog",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "BitsBlog Tags",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse All Tags - Technology Topics | BitsBlog Nepal",
    description:
      "Browse all tags and keywords. Find articles by specific topics.",
    site: "@ctrl_bits",
    creator: "@ctrl_bits",
    images: [`${SITE_URL}/og-default.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function TagsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
