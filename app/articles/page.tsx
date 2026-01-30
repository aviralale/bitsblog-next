import { Metadata } from "next";
import { Suspense } from "react";
import ArticlesPageContent from "./ArticlesPageContent";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ctrlbits.com";

export const metadata: Metadata = {
  title: "All Articles | BitsBlog",
  description: "Browse all articles on web development, AI, software engineering, programming tutorials, and technology insights. Stay updated with the latest tech trends and in-depth guides.",
  keywords: [
    "tech articles",
    "programming tutorials",
    "web development",
    "AI articles",
    "software engineering",
    "coding tutorials",
    "technology blog",
  ],
  alternates: {
    canonical: `${SITE_URL}/articles`,
  },
  openGraph: {
    title: "All Articles | BitsBlog",
    description: "Browse all articles on web development, AI, software engineering, and technology insights.",
    url: `${SITE_URL}/articles`,
    siteName: "BitsBlog",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "BitsBlog Articles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "All Articles | BitsBlog",
    description: "Browse all articles on web development, AI, software engineering, and technology insights.",
    site: "@ctrl_bits",
    creator: "@ctrl_bits",
    images: [`${SITE_URL}/og-default.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ArticlesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <ArticlesPageContent />
    </Suspense>
  );
}
