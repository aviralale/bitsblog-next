import { Metadata } from "next";
import { Suspense } from "react";
import AboutContent from "./AboutContent";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "About Ctrl Bits - Technology Innovation & Web Development",
  description:
    "Learn about Ctrl Bits, a technology company dedicated to digital innovation, web development, and modern software solutions.",
};
export default function AboutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AboutContent />
    </Suspense>
  );
}

