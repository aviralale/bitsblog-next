"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle, Mail, ArrowRight } from "lucide-react";
import api from "@/api/axios";

/**
 * Newsletter Email Verification Page
 *
 * This page is displayed when users click the verification link in their email.
 * It confirms their subscription and provides next steps.
 *
 * Route: /newsletter/verify/:token
 */

export default function NewsletterVerify() {
  const params = useParams();
  const token = params.token as string;
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const [alreadyVerified, setAlreadyVerified] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. No token provided.");
        return;
      }

      try {
        const response = await api.get(`/api/newsletter/verify/${token}/`);

        if (response.data.success) {
          setStatus("success");
          setMessage(response.data.message);
          setAlreadyVerified(response.data.already_verified || false);
        } else {
          setStatus("error");
          setMessage(response.data.message || "Verification failed.");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Verification failed. The link may be invalid or expired.",
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200">
        <div className="container mx-auto px-6 py-8 max-w-5xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-black hover:text-neutral-600 transition-colors"
          >
            <div className="w-1 h-8 bg-black"></div>
            <span className="text-sm font-medium uppercase tracking-wider">
              BitsBlog
            </span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-20 max-w-2xl">
        <div className="text-center">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
              <h1 className="text-4xl md:text-5xl font-light text-black mb-4 leading-tight">
                Verifying Your Email
              </h1>
              <p className="text-lg text-neutral-600 font-light">
                Please wait while we confirm your subscription...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-20 h-20 bg-green-50 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <Check className="h-10 w-10 text-green-500" />
              </div>

              <h1 className="text-4xl md:text-5xl font-light text-black mb-4 leading-tight">
                {alreadyVerified ? "Already Verified!" : "Email Verified!"}
              </h1>

              <p className="text-lg text-neutral-600 font-light mb-12 leading-relaxed max-w-lg mx-auto">
                {message}
              </p>

              <div className="bg-neutral-50 border border-neutral-200 p-8 mb-8">
                <div className="flex items-start gap-4 text-left">
                  <Mail className="h-6 w-6 text-black shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-black mb-2">
                      What's Next?
                    </h3>
                    <p className="text-neutral-600 font-light leading-relaxed">
                      You'll receive our latest articles, insights, and updates
                      directly in your inbox. We respect your time and only send
                      valuable content—no spam, ever.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8 group">
                    Browse Articles
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    variant="outline"
                    className="border-black text-black hover:bg-black hover:text-white font-light rounded-none h-12 px-8"
                  >
                    About Us
                  </Button>
                </Link>
              </div>

              <div className="mt-12 pt-8 border-t border-neutral-200">
                <p className="text-sm text-neutral-500 font-light">
                  Want to manage your subscription preferences?{" "}
                  <a
                    href="/newsletter/manage"
                    className="text-black underline hover:no-underline"
                  >
                    Click here
                  </a>
                </p>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-20 h-20 bg-red-50 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>

              <h1 className="text-4xl md:text-5xl font-light text-black mb-4 leading-tight">
                Verification Failed
              </h1>

              <p className="text-lg text-neutral-600 font-light mb-12 leading-relaxed max-w-lg mx-auto">
                {message}
              </p>

              <div className="bg-neutral-50 border border-neutral-200 p-8 mb-8">
                <h3 className="text-lg font-medium text-black mb-3">
                  What Can You Do?
                </h3>
                <ul className="text-left text-neutral-600 font-light space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-black mt-1">•</span>
                    <span>Check if you've already verified your email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black mt-1">•</span>
                    <span>Try subscribing again with your email address</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black mt-1">•</span>
                    <span>Contact us if the problem persists</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8">
                    Return to Homepage
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    className="border-black text-black hover:bg-black hover:text-white font-light rounded-none h-12 px-8"
                  >
                    Contact Support
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
