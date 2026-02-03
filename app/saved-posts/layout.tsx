import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Saved Posts | BitsBlog",
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function SavedPostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
