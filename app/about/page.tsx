import { Metadata } from "next";
import { Suspense } from "react";
import AboutContent from "./AboutContent";

export const dynamic = 'force-dynamic';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ctrlbits.com";

export const metadata: Metadata = {
  title: "About Ctrl Bits - Technology Innovation & Web Development",
  description:
    "Learn about Ctrl Bits, a technology company dedicated to digital innovation, web development, and modern software solutions. We empower businesses in Nepal through cutting-edge technology.",
  keywords: [
    "Ctrl Bits",
    "technology company Nepal",
    "web development Nepal",
    "software development Nepal",
    "digital innovation",
    "tech company Nepal",
  ],
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "About Ctrl Bits - Technology Innovation & Web Development",
    description:
      "Learn about Ctrl Bits, a technology company dedicated to digital innovation and modern software solutions in Nepal.",
    url: `${SITE_URL}/about`,
    siteName: "BitsBlog",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "About Ctrl Bits",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Ctrl Bits | Technology Innovation",
    description:
      "Learn about Ctrl Bits, a technology company dedicated to digital innovation.",
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

export default function AboutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AboutContent />
    </Suspense>
  );
}

