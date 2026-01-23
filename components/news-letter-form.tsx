"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Mail, Check, AlertCircle } from "lucide-react";
import api from "@/api/axios";

/**
 * Newsletter subscription component.
 *
 * This component can be placed anywhere on your blog - homepage, sidebar,
 * footer, or dedicated landing pages. It handles the complete subscription
 * flow including validation, API calls, and user feedback.
 *
 * Props:
 * @param source - Optional string to track where subscriptions come from
 * @param variant - 'inline' | 'card' | 'modal' - Different display styles
 * @param className - Additional CSS classes
 */

interface NewsletterFormProps {
  source?: string;
  variant?: "inline" | "card" | "modal";
  className?: string;
}

export const NewsletterForm: React.FC<NewsletterFormProps> = ({
  source = "unknown",
  variant = "inline",
  className = "",
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  /**
   * Handle form submission.
   * Sends subscription request to the Django backend.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await api.post("/api/newsletter/subscribe/", {
        email: email.trim().toLowerCase(),
        source: source,
      });

      if (response.data.success) {
        setStatus("success");
        setMessage(response.data.message);
        setEmail(""); // Clear the input

        // Reset success message after 10 seconds
        setTimeout(() => {
          setStatus("idle");
          setMessage("");
        }, 10000);
      }
    } catch (error: any) {
      setStatus("error");

      // Handle different types of errors
      if (error.response?.data?.errors?.email) {
        setMessage(error.response.data.errors.email[0]);
      } else if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Something went wrong. Please try again.");
      }

      // Reset error message after 5 seconds
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Render inline variant (default)
   * Best for homepage hero sections or prominent CTAs
   */
  if (variant === "inline") {
    return (
      <div className={`${className}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={loading}
                className="border-neutral-300 focus:border-black rounded-none h-12 font-light pl-4"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading || status === "success"}
              className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8 whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Subscribing...
                </span>
              ) : status === "success" ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Subscribed!
                </span>
              ) : (
                "Subscribe"
              )}
            </Button>
          </div>

          {/* Status messages */}
          {status === "success" && message && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 text-green-800 text-sm font-light">
              <Check className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{message}</p>
            </div>
          )}

          {status === "error" && message && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-800 text-sm font-light">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{message}</p>
            </div>
          )}

          <p className="text-xs text-neutral-500 font-light">
            Join our community of developers. No spam, unsubscribe anytime.
          </p>
        </form>
      </div>
    );
  }

  /**
   * Render card variant
   * Best for sidebars or dedicated sections
   */
  if (variant === "card") {
    return (
      <div className={`border border-neutral-200 p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-black flex items-center justify-center">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-black text-lg">
              Subscribe to Newsletter
            </h3>
          </div>
        </div>

        <p className="text-sm text-neutral-600 font-light mb-4 leading-relaxed">
          Get the latest articles and insights delivered directly to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={loading}
            className="border-neutral-300 focus:border-black rounded-none h-10 font-light"
            required
          />

          <Button
            type="submit"
            disabled={loading || status === "success"}
            className="w-full bg-black text-white hover:bg-neutral-800 font-light rounded-none h-10"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Subscribing...
              </span>
            ) : status === "success" ? (
              <span className="flex items-center gap-2 justify-center">
                <Check className="h-4 w-4" />
                Subscribed!
              </span>
            ) : (
              "Subscribe"
            )}
          </Button>

          {status === "success" && message && (
            <div className="flex items-start gap-2 p-2 bg-green-50 border border-green-200 text-green-800 text-xs font-light">
              <Check className="h-3 w-3 shrink-0 mt-0.5" />
              <p>{message}</p>
            </div>
          )}

          {status === "error" && message && (
            <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 text-red-800 text-xs font-light">
              <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
              <p>{message}</p>
            </div>
          )}

          <p className="text-xs text-neutral-500 font-light">
            No spam. Unsubscribe anytime.
          </p>
        </form>
      </div>
    );
  }

  /**
   * Render modal variant
   * Best for popups or modal dialogs
   */
  return (
    <div className={`${className}`}>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-black flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-light text-black mb-2">
          Stay in the Loop
        </h2>
        <p className="text-neutral-600 font-light">
          Subscribe to get our latest content by email.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={loading}
          className="border-neutral-300 focus:border-black rounded-none h-12 font-light text-center"
          required
        />

        <Button
          type="submit"
          disabled={loading || status === "success"}
          className="w-full bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12"
        >
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Subscribing...
            </span>
          ) : status === "success" ? (
            <span className="flex items-center gap-2 justify-center">
              <Check className="h-4 w-4" />
              Successfully Subscribed!
            </span>
          ) : (
            "Subscribe to Newsletter"
          )}
        </Button>

        {status === "success" && message && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 text-green-800 text-sm font-light">
            <Check className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{message}</p>
          </div>
        )}

        {status === "error" && message && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-800 text-sm font-light">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{message}</p>
          </div>
        )}

        <p className="text-xs text-neutral-500 font-light text-center">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </form>
    </div>
  );
};
