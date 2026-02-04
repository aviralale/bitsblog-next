import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Space_Grotesk } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

import { ResponsiveNavbar } from "@/components/ResponsiveNavbar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { WebVitals } from "./web-vitals";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";

export const dynamic = "force-dynamic";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://blog.ctrlbits.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default:
      "BitsBlog - Best Blogs in Nepal | Digital Infrastructure & Tech Policy Analysis",
    template: "%s | BitsBlog",
  },

  description:
    "Discover the best blogs in Nepal and read in-depth analysis on digital infrastructure, tech policy, and digital transformation. Explore top Nepali bloggers, investigative tech journalism, and critical takes on technology ecosystems across Nepal and global markets.",

  keywords: [
    // Primary Keywords - Blog Directory
    "best blogs in nepal",
    "nepal blog",
    "nepali bloggers",
    "best blog sites",
    "top bloggers nepal",

    // Digital Infrastructure & Policy
    "digital infrastructure nepal",
    "tech policy analysis",
    "digital transformation nepal",
    "technology policy",
    "digital governance",

    // Nepal Digital Ecosystem
    "nepal digital economy",
    "nepal tech ecosystem",
    "digital infrastructure analysis",
    "nepal internet infrastructure",
    "nepal technology development",
    "digital nepal",

    // Blog Topics
    "best blog topics",
    "technology blogs nepal",
    "tech journalism nepal",
    "investigative journalism",

    // Global Tech Analysis
    "global digital infrastructure",
    "country tech comparison",
    "digital economy analysis",
    "tech policy research",
    "digital government",

    // Investigative & Critical
    "tech policy critique",
    "digital rights nepal",
    "technology regulation",
    "internet freedom",
    "tech industry analysis",
    "digital divide nepal",

    // Infrastructure Topics
    "5g infrastructure nepal",
    "broadband access nepal",
    "digital payment systems",
    "e-governance nepal",
    "smart city nepal",
    "cybersecurity nepal",
    "data privacy",
    "tech regulation",

    // Blog Discovery
    "blog directory",
    "blog recommendations",
    "quality blogs nepal",

    // Ctrl Bits branded + agency intent
    "ctrl bits",
    "ctrlbits",
    "ctrl bits nepal",
    "ctrlbits nepal",
    "ctrl bits blog",
    "bitsblog",
    "ctrl bits digital agency",
    "ctrl bits web development",
    "ctrl bits seo",
    "ctrl bits branding",
    "ctrl bits video editing",
    "ctrl bits motion graphics",
    "ctrl bits social media management",
    "ctrl bits content marketing",
    "ctrl bits growth marketing",

    // Nepal agency + service keywords
    "web development company nepal",
    "website design nepal",
    "seo agency nepal",
    "digital marketing agency nepal",
    "branding agency nepal",
    "video editing agency nepal",
    "motion graphics nepal",
    "social media marketing nepal",
    "content creation nepal",
    "performance marketing nepal",
    "ui ux design nepal",
    "startup marketing nepal",
    "sme digital marketing nepal",
  ],

  authors: [{ name: "Ctrl Bits" }],
  creator: "Ctrl Bits",
  publisher: "Ctrl Bits",
  category: "Blog Directory & Nepal Blogging Community",

  // ✅ FAVICON FIX (App Router)
  icons: {
    icon: [
      { url: "/favicon.ico" }, // best compatibility
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
    shortcut: ["/favicon.ico"],
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "BitsBlog - Best Blogs in Nepal",
    title: "BitsBlog - Discover the Best Blogs in Nepal | Top Nepali Bloggers",
    description:
      "Explore the best blogs in Nepal. Find top Nepali bloggers, trending blog topics, best blogging platforms, and curated blog recommendations. Your guide to Nepal's best blog sites and blogging community.",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "BitsBlog",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "BitsBlog - Best Blogs in Nepal | Top Nepali Bloggers",
    description:
      "Discover the best blogs in Nepal, top blog sites, trending blog topics, and Nepal's vibrant blogging community.",
    site: "@ctrl_bits",
    creator: "@ctrl_bits",
    images: ["/og-default.jpg"],
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

  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // WebSite Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BitsBlog - Best Blogs in Nepal & Digital Infrastructure Analysis",
    alternateName: ["BitsBlog", "BitsBlog Nepal", "Best Nepal Blog Directory"],
    url: SITE_URL,
    description:
      "Premier blog directory showcasing the best blogs in Nepal, featuring top Nepali bloggers and original investigative journalism on digital infrastructure, technology policy, and digital transformation across Nepal and global markets.",
    about: [
      {
        "@type": "Thing",
        name: "Best Blogs in Nepal",
        description: "Curated directory of top blogs and bloggers from Nepal",
      },
      {
        "@type": "Thing",
        name: "Digital Infrastructure Analysis",
        description:
          "Investigative reporting on digital infrastructure, tech policy, and controversial technology topics",
      },
    ],
    audience: {
      "@type": "Audience",
      audienceType:
        "Content Readers, Blog Enthusiasts, Policymakers, Tech Professionals, Researchers, Digital Rights Advocates",
    },
    keywords:
      "best blogs in nepal, digital infrastructure, tech policy, nepali bloggers, technology analysis, digital transformation, investigative journalism",
    publisher: {
      "@type": "Organization",
      name: "Ctrl Bits",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.png`,
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en-US",
  };

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ctrl Bits",
    alternateName: "BitsBlog - Nepal's Blog Directory & Tech Analysis Platform",
    url: SITE_URL,
    areaServed: [
      { "@type": "Country", name: "Nepal" },
      { "@type": "Place", name: "Global" },
    ],
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/favicon.png`,
      width: 512,
      height: 512,
    },
    description:
      "Digital media organization showcasing the best blogs in Nepal while providing original investigative journalism and critical analysis of digital infrastructure, technology policy, and digital transformation in Nepal and globally.",
    knowsAbout: [
      "Nepal Blogging Community",
      "Blog Directory",
      "Digital Infrastructure",
      "Technology Policy",
      "Digital Transformation",
      "Tech Journalism",
      "Digital Governance",
      "Internet Infrastructure",
      "Digital Rights",
      "Technology Regulation",
      "Nepali Bloggers",
    ],
    sameAs: [
      "https://github.com/ctrlbits",
      "https://twitter.com/ctrl_bits",
      "https://linkedin.com/company/ctrlbits",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "hi@ctrlbits.com",
      availableLanguage: ["en"],
    },
  };

  // LocalBusiness Schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Ctrl Bits - BitsBlog",
    alternateName: "BitsBlog - Nepal Blog Directory & Tech Analysis",
    description:
      "Digital media organization based in Nepal, curating the best blogs from Nepal's blogging community while publishing original investigative journalism on digital infrastructure, technology policy, and controversial tech topics across Nepal and global markets.",
    url: SITE_URL,
    address: {
      "@type": "PostalAddress",
      addressCountry: "NP",
      addressRegion: "Bagmati",
      addressLocality: "Kathmandu",
      postalCode: "44600",
    },
    areaServed: { "@type": "Country", name: "Nepal" },
    priceRange: "Free",
    telephone: "+977-1-XXXX-XXXX",
    email: "hi@ctrlbits.com",
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/favicon.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}/favicon.png`,
    sameAs: [
      "https://github.com/ctrlbits",
      "https://twitter.com/ctrl_bits",
      "https://linkedin.com/company/ctrlbits",
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "hi@ctrlbits.com",
      availableLanguage: ["en", "ne"],
    },
    geo: { "@type": "GeoCoordinates", latitude: 27.7172, longitude: 85.324 },
  };

  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-54BJK9BG');`,
          }}
        />
        {/* End Google Tag Manager */}
        
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />

        {/* Preconnect to API domain for faster resource loading */}
        <link
          rel="preconnect"
          href="https://api-blog.ctrlbits.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://api-blog.ctrlbits.com" />

        {/* JSON-LD Schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-B3Z5X0ZL4B"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-B3Z5X0ZL4B');
          `}
        </Script>
      </head>

      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-54BJK9BG"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
        <AuthProvider>
          <WebVitals />
          <AdvancedAnalytics />

          <div className="flex flex-col min-h-screen">
            <Suspense
              fallback={
                <div className="h-16 md:h-20 border-b border-neutral-200 bg-white" />
              }
            >
              <ResponsiveNavbar />
            </Suspense>

            <main className="grow">{children}</main>

            <Suspense
              fallback={
                <div className="h-64 border-t border-neutral-200 bg-white" />
              }
            >
              <Footer />
            </Suspense>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
