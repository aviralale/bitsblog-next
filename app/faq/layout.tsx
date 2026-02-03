import { Metadata } from "next";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ctrlbits.com";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) - Help & Support | BitsBlog Nepal",
  description:
    "Find answers to frequently asked questions about BitsBlog. Get help with accounts, posting, newsletters, and more. Your comprehensive FAQ guide.",
  keywords: [
    "BitsBlog FAQ",
    "tech blog help",
    "BitsBlog support",
    "blog questions",
    "Nepal tech blog FAQ",
  ],
  alternates: {
    canonical: `${SITE_URL}/faq`,
  },
  openGraph: {
    title: "Frequently Asked Questions | BitsBlog Nepal",
    description:
      "Find answers to frequently asked questions about BitsBlog.",
    url: `${SITE_URL}/faq`,
    siteName: "BitsBlog",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "BitsBlog FAQ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ | BitsBlog Nepal",
    description: "Find answers to frequently asked questions.",
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

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
