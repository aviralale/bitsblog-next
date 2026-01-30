"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Home, Mail } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Text */}
        <div className="space-y-4">
          <h1 className="text-7xl md:text-8xl font-light text-black tracking-tight">
            404
          </h1>
          <p className="text-xl md:text-2xl text-neutral-600 font-light">
            Page Not Found
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3 max-w-md mx-auto">
          <p className="text-base text-neutral-500 font-light leading-relaxed">
            We couldn't find the page you're looking for. It might have been
            moved, deleted, or the URL might be incorrect.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/">
            <Button className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8 w-full sm:w-auto">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link href="/search">
            <Button
              variant="outline"
              className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-12 px-8 w-full sm:w-auto"
            >
              <Search className="h-4 w-4 mr-2" />
              Search Articles
            </Button>
          </Link>
        </div>

        {/* Additional Help */}
        <div className="border-t border-neutral-200 pt-8 mt-12">
          <p className="text-sm text-neutral-500 font-light mb-4">
            Need help? Get in touch with us
          </p>
          <Link href="/contact">
            <Button
              variant="ghost"
              className="text-neutral-600 hover:text-black font-light rounded-none h-10"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Us
            </Button>
          </Link>
        </div>

        {/* Suggestions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-neutral-200">
          <Link href="/articles" className="group">
            <div className="space-y-2 p-4 hover:bg-neutral-50 transition-colors rounded-none">
              <h3 className="text-sm font-medium text-black group-hover:underline">
                Browse Articles
              </h3>
              <p className="text-xs text-neutral-500">
                Explore our latest articles and tutorials
              </p>
            </div>
          </Link>
          <Link href="/categories" className="group">
            <div className="space-y-2 p-4 hover:bg-neutral-50 transition-colors rounded-none">
              <h3 className="text-sm font-medium text-black group-hover:underline">
                Browse Categories
              </h3>
              <p className="text-xs text-neutral-500">Find content by topic</p>
            </div>
          </Link>
          <Link href="/help" className="group">
            <div className="space-y-2 p-4 hover:bg-neutral-50 transition-colors rounded-none">
              <h3 className="text-sm font-medium text-black group-hover:underline">
                Help Center
              </h3>
              <p className="text-xs text-neutral-500">
                Get answers to common questions
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
