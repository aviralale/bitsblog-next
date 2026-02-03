import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unsubscribe | BitsBlog Newsletter",
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function UnsubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
