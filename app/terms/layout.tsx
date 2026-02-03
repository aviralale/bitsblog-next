import { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ctrlbits.com";

export const metadata: Metadata = {
  title: "Terms of Service - Usage Policy & Guidelines | BitsBlog Nepal",
  description:
    "Read BitsBlog Nepal's terms of service and usage policy. Understand your rights, responsibilities, content guidelines, and acceptable use when using our platform.",
  keywords: [
    "terms of service",
    "usage policy",
    "user agreement",
    "content guidelines",
    "acceptable use",
    "terms and conditions",
  ],
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
  openGraph: {
    title: "Terms of Service | BitsBlog Nepal",
    description:
      "Read our terms of service. Understand your rights, responsibilities, and content guidelines.",
    url: `${SITE_URL}/terms`,
    siteName: "BitsBlog",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "BitsBlog Terms of Service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | BitsBlog Nepal",
    description: "Read our terms of service and usage policy.",
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

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
