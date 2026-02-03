import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email | BitsBlog Newsletter",
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
