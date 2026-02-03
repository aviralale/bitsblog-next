import { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ctrlbits.com";

export const metadata: Metadata = {
  title: "Blog Archives - Browse Articles by Date | BitsBlog Nepal",
  description:
    "Browse BitsBlog archives organized by year and month. Explore our historical tech articles, programming tutorials, and technology insights chronologically.",
  keywords: [
    "blog archives",
    "tech articles archive",
    "programming tutorials history",
    "technology blog archive",
    "Nepal tech blog",
  ],
  alternates: {
    canonical: `${SITE_URL}/archives`,
  },
  openGraph: {
    title: "Blog Archives - Browse Articles by Date | BitsBlog Nepal",
    description:
      "Browse BitsBlog archives organized by year and month. Explore historical tech articles and programming tutorials.",
    url: `${SITE_URL}/archives`,
    siteName: "BitsBlog",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "BitsBlog Archives",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog Archives | BitsBlog Nepal",
    description: "Browse articles organized by date.",
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

export default function ArchivesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
