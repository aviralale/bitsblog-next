import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search | BitsBlog",
  description: "Search articles, posts, and content on BitsBlog",
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
