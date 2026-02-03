import { Metadata } from "next";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ctrlbits.com";

export const metadata: Metadata = {
  title: "Browse All Tech Categories - Web Development, AI, Programming | BitsBlog Nepal",
  description:
    "Browse technology articles by category. Explore topics including web development, AI, software architecture, programming tutorials, and more. Find the best tech content organized by category.",
  keywords: [
    "tech categories",
    "programming topics",
    "web development categories",
    "AI categories",
    "software engineering topics",
    "coding categories",
    "technology topics",
    "Nepal tech blog",
  ],
  alternates: {
    canonical: `${SITE_URL}/categories`,
  },
  openGraph: {
    title: "Browse All Tech Categories | BitsBlog Nepal",
    description:
      "Browse technology articles by category. Explore web development, AI, software architecture, and programming tutorials.",
    url: `${SITE_URL}/categories`,
    siteName: "BitsBlog",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "BitsBlog Categories",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse All Tech Categories | BitsBlog Nepal",
    description:
      "Browse technology articles by category. Explore web development, AI, software architecture, and more.",
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

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
