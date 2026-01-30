"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle, Mail, Heart, ArrowRight } from "lucide-react";
import api from "@/api/axios";

/**
 * Newsletter Unsubscribe Page
 *
 * This page is displayed when users click the unsubscribe link in newsletters.
 * It confirms their unsubscription and provides feedback options.
 *
 * Route: /newsletter/unsubscribe/:token
 */

export default function NewsletterUnsubscribe() {
  const params = useParams();
  const token = params.token as string;
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [alreadyUnsubscribed, setAlreadyUnsubscribed] = useState(false);

  useEffect(() => {
    const unsubscribe = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid unsubscribe link. No token provided.");
        return;
      }

      try {
        const response = await api.get(`/api/newsletter/unsubscribe/${token}/`);

        if (response.data.success) {
          setStatus("success");
          setMessage(response.data.message);
          setEmail(response.data.email || "");
          setAlreadyUnsubscribed(response.data.already_unsubscribed || false);
        } else {
          setStatus("error");
          setMessage(response.data.message || "Unsubscribe failed.");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Unsubscribe failed. The link may be invalid or expired.",
        );
      }
    };

    unsubscribe();
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
                Processing Request
              </h1>
              <p className="text-lg text-neutral-600 font-light">
                Please wait while we process your unsubscribe request...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-20 h-20 bg-neutral-100 border-2 border-neutral-300 rounded-full flex items-center justify-center mx-auto mb-8">
                <Check className="h-10 w-10 text-neutral-600" />
              </div>

              <h1 className="text-4xl md:text-5xl font-light text-black mb-4 leading-tight">
                {alreadyUnsubscribed
                  ? "Already Unsubscribed"
                  : "Successfully Unsubscribed"}
              </h1>

              <p className="text-lg text-neutral-600 font-light mb-4 leading-relaxed max-w-lg mx-auto">
                {message}
              </p>

              {email && (
                <p className="text-sm text-neutral-500 font-light mb-12">
                  Email: {email}
                </p>
              )}

              <div className="bg-neutral-50 border border-neutral-200 p-8 mb-8">
                <div className="flex items-start gap-4 text-left mb-6">
                  <Heart className="h-6 w-6 text-neutral-400 shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-black mb-2">
                      We're Sorry to See You Go
                    </h3>
                    <p className="text-neutral-600 font-light leading-relaxed mb-4">
                      You've been successfully removed from our mailing list.
                      You won't receive any more newsletters from us.
                    </p>
                    <p className="text-neutral-600 font-light leading-relaxed">
                      However, you're always welcome to visit our blog anytime
                      to read our latest articles and stay updated with
                      technology insights.
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-200">
                  <h4 className="text-sm font-medium text-black mb-3">
                    Why did you unsubscribe?
                  </h4>
                  <p className="text-xs text-neutral-500 font-light mb-4">
                    Your feedback helps us improve. (Optional)
                  </p>
                  <div className="space-y-2 text-left text-sm">
                    <label className="flex items-center gap-3 p-3 border border-neutral-200 hover:border-black transition-colors cursor-pointer">
                      <input type="radio" name="reason" className="w-4 h-4" />
                      <span className="font-light text-neutral-700">
                        Too many emails
                      </span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-neutral-200 hover:border-black transition-colors cursor-pointer">
                      <input type="radio" name="reason" className="w-4 h-4" />
                      <span className="font-light text-neutral-700">
                        Content not relevant
                      </span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-neutral-200 hover:border-black transition-colors cursor-pointer">
                      <input type="radio" name="reason" className="w-4 h-4" />
                      <span className="font-light text-neutral-700">
                        Never signed up
                      </span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-neutral-200 hover:border-black transition-colors cursor-pointer">
                      <input type="radio" name="reason" className="w-4 h-4" />
                      <span className="font-light text-neutral-700">
                        Other reason
                      </span>
                    </label>
                  </div>
                  <Button
                    className="w-full mt-4 bg-neutral-800 text-white hover:bg-black font-light rounded-none h-10"
                    onClick={() => alert("Thank you for your feedback!")}
                  >
                    Submit Feedback
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-neutral-600 font-light">
                  Changed your mind?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/">
                    <Button className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8 group">
                      Browse Our Blog
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/#subscribe">
                    <Button
                      variant="outline"
                      className="border-black text-black hover:bg-black hover:text-white font-light rounded-none h-12 px-8"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Resubscribe
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-neutral-200">
                <p className="text-xs text-neutral-500 font-light">
                  Please note: It may take up to 24 hours to fully process your
                  unsubscribe request. You may receive one final email during
                  this period.
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
                Unsubscribe Failed
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
                    <span>Try clicking the unsubscribe link again</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black mt-1">•</span>
                    <span>Check if you've already unsubscribed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black mt-1">•</span>
                    <span>Contact us directly for assistance</span>
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
