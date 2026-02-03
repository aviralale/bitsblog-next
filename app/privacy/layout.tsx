import { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ctrlbits.com";

export const metadata: Metadata = {
  title: "Privacy Policy - Data Protection & User Privacy | BitsBlog Nepal",
  description:
    "Read BitsBlog Nepal's privacy policy. Learn how we collect, use, protect your personal data, and safeguard user privacy. Transparent data practices. GDPR compliant.",
  keywords: [
    "privacy policy",
    "data protection Nepal",
    "user privacy",
    "personal information",
    "GDPR compliance",
    "data security",
    "privacy rights",
  ],
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy | BitsBlog Nepal",
    description:
      "Learn how we collect, use, and protect your personal data. Transparent privacy practices.",
    url: `${SITE_URL}/privacy`,
    siteName: "BitsBlog",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "BitsBlog Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | BitsBlog Nepal",
    description: "Learn how we protect your personal data and user privacy.",
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

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
