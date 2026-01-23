import type { Metadata } from "next";
// import "prismjs/themes/prism-tomorrow.css";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ctrlbits.com",
  ),
  title: {
    default: "BitsBlog - Technology Insights & Tutorials",
    template: "%s | BitsBlog",
  },
  description:
    "Explore in-depth articles on web development, AI, software engineering, and technology trends.",
  keywords: [
    "tech blog",
    "web development",
    "programming",
    "AI",
    "software engineering",
    "tutorials",
  ],
  authors: [{ name: "Ctrl Bits" }],
  creator: "Ctrl Bits",
  publisher: "Ctrl Bits",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "BitsBlog",
    title: "BitsBlog - Technology Insights & Tutorials",
    description:
      "Explore in-depth articles on web development, AI, software engineering, and technology trends.",
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
    title: "BitsBlog - Technology Insights & Tutorials",
    description:
      "Explore in-depth articles on web development, AI, software engineering, and technology trends.",
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
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="grow">{children}</main>
            <Footer />
          </div>
        </body>
      </html>
    </AuthProvider>
  );
}
