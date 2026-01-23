"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  AlertCircle,
  Send,
  CheckCircle,
  Phone,
  //   MapPin,
  //   Clock,
} from "lucide-react";
import api from "@/api/axios";
import Head from "next/head";
import Link from "next/link";

// Helper function to get absolute URL
const getAbsoluteUrl = (path: string): string => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "https://blog.ctrlbits.com";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Replace with your actual API endpoint
      await api.post("/api/messages/", {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        category: formData.category,
        message: formData.message,
      });

      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "general",
        message: "",
      });

      // Reset submitted state after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error: any) {
      console.error("Failed to submit contact form:", error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        alert("Failed to send message. Please try again or email us directly.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle input change
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  // SEO Data
  const pageTitle = "Contact Us | BitsBlog";
  const pageDescription =
    "Get in touch with the BitsBlog team. We're here to help with questions, feedback, bug reports, and partnership inquiries. Contact us today.";
  const pageUrl = getAbsoluteUrl("/contact");
  const ogImage = getAbsoluteUrl("/og-contact.jpg");
  const keywords =
    "contact BitsBlog, customer support, feedback, bug report, partnership inquiry, contact form, get in touch";

  // Breadcrumb structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: getAbsoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Contact",
        item: pageUrl,
      },
    ],
  };

  // ContactPage structured data
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact BitsBlog",
    description: pageDescription,
    url: pageUrl,
    mainEntity: {
      "@type": "Organization",
      name: "Ctrl Bits",
      url: getAbsoluteUrl("/"),
      logo: {
        "@type": "ImageObject",
        url: getAbsoluteUrl("/logo.png"),
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+977-9709659012",
        contactType: "customer support",
        email: "hello@ctrlbits.com",
        availableLanguage: ["English"],
      },
      sameAs: [
        "https://x.com/ctrl_bits",
        "https://facebook.com/ctrlbits",
        "https://linkedin.com/company/ctrlbits",
        "https://instagram.com/ctrl.bits",
      ],
    },
  };

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />

        {/* Canonical Link */}
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content="BitsBlog" />
        <meta property="og:image" content={ogImage} />
        <meta
          property="og:image:alt"
          content="Contact BitsBlog - Get in touch"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content="Contact BitsBlog" />
        <meta name="twitter:site" content="@ctrl_bits" />

        {/* Structured Data - Breadcrumb */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>

        {/* Structured Data - ContactPage */}
        <script type="application/ld+json">
          {JSON.stringify(contactSchema)}
        </script>
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-6 py-16 max-w-6xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-12 bg-black"></div>
              <span className="text-sm font-medium text-black uppercase tracking-wider">
                Support
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-light text-black mb-6 leading-tight">
              Get in Touch
            </h1>
            <p className="text-lg text-neutral-600 font-light max-w-2xl">
              Have questions, feedback, or need to report an issue? We're here
              to help. Fill out the form below and we'll get back to you as soon
              as possible.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6 py-16 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardHeader className="border-b border-neutral-200">
                  <CardTitle className="text-2xl font-light text-black">
                    Send us a message
                  </CardTitle>
                  <CardDescription className="text-neutral-600 font-light">
                    We typically respond within 24-48 hours
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  {submitted ? (
                    <div className="py-12 text-center">
                      <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
                      <h3 className="text-2xl font-light text-black mb-3">
                        Message Sent!
                      </h3>
                      <p className="text-neutral-600 font-light mb-8">
                        Thank you for contacting us. We'll get back to you soon.
                      </p>
                      <Button
                        onClick={() => setSubmitted(false)}
                        variant="outline"
                        className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-12 px-8"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Name and Email */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">
                            Your Name *
                          </label>
                          <Input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className={`border-neutral-300 focus:border-black rounded-none h-12 font-light ${
                              errors.name ? "border-red-500" : ""
                            }`}
                          />
                          {errors.name && (
                            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5" />
                              {errors.name}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-black mb-2">
                            Email Address *
                          </label>
                          <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            className={`border-neutral-300 focus:border-black rounded-none h-12 font-light ${
                              errors.email ? "border-red-500" : ""
                            }`}
                          />
                          {errors.email && (
                            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5" />
                              {errors.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Category
                        </label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            setFormData({ ...formData, category: value })
                          }
                        >
                          <SelectTrigger className="border-neutral-300 focus:border-black rounded-none h-12 font-light">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-none">
                            <SelectItem value="general">
                              General Inquiry
                            </SelectItem>
                            <SelectItem value="feedback">Feedback</SelectItem>
                            <SelectItem value="bug">Report a Bug</SelectItem>
                            <SelectItem value="abuse">Report Abuse</SelectItem>
                            <SelectItem value="copyright">
                              Copyright Infringement
                            </SelectItem>
                            <SelectItem value="advertising">
                              Advertising Inquiry
                            </SelectItem>
                            <SelectItem value="partnership">
                              Partnership Opportunity
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Subject *
                        </label>
                        <Input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="Brief description of your message"
                          className={`border-neutral-300 focus:border-black rounded-none h-12 font-light ${
                            errors.subject ? "border-red-500" : ""
                          }`}
                        />
                        {errors.subject && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {errors.subject}
                          </p>
                        )}
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Message *
                        </label>
                        <Textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us more about your inquiry..."
                          className={`border-neutral-300 focus:border-black rounded-none font-light min-h-[200px] ${
                            errors.message ? "border-red-500" : ""
                          }`}
                        />
                        {errors.message && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {errors.message}
                          </p>
                        )}
                        <p className="text-xs text-neutral-500 mt-2">
                          Please provide as much detail as possible
                        </p>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-4">
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8 w-full md:w-auto"
                        >
                          {submitting ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Sending...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Send className="h-4 w-4" />
                              Send Message
                            </span>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Information Sidebar */}
            <div className="space-y-8">
              {/* Contact Methods */}
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardHeader className="border-b border-neutral-200">
                  <CardTitle className="text-lg font-medium uppercase tracking-wider">
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <h3 className="font-medium text-black mb-1">Email</h3>
                      <a
                        href="mailto:hello@ctrlbits.com"
                        className="text-sm text-neutral-600 hover:text-black transition-colors underline"
                      >
                        hello@ctrlbits.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <h3 className="font-medium text-black mb-1">Phone</h3>
                      <a
                        href="tel:+977-9709659012"
                        className="text-sm text-neutral-600 hover:text-black transition-colors"
                      >
                        +977-9709659012
                      </a>
                    </div>
                  </div>

                  {/* <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <h3 className="font-medium text-black mb-1">Address</h3>
                      <p className="text-sm text-neutral-600">
                        123 Blog Street
                        <br />
                        San Francisco, CA 94102
                        <br />
                        United States
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <h3 className="font-medium text-black mb-1">
                        Business Hours
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Monday - Friday
                        <br />
                        9:00 AM - 5:00 PM PST
                      </p>
                    </div>
                  </div> */}
                </CardContent>
              </Card>

              {/* FAQ Card */}
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardHeader className="border-b border-neutral-200">
                  <CardTitle className="text-lg font-medium uppercase tracking-wider">
                    Quick Help
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h3 className="font-medium text-black mb-2">
                      Before contacting us
                    </h3>
                    <p className="text-sm text-neutral-600 font-light mb-3">
                      You might find answers to common questions in our
                      resources:
                    </p>
                    <div className="space-y-2">
                      <Link
                        href="/faq"
                        className="block text-sm text-neutral-600 hover:text-black transition-colors underline"
                      >
                        Frequently Asked Questions
                      </Link>
                      <Link
                        href="/help"
                        className="block text-sm text-neutral-600 hover:text-black transition-colors underline"
                      >
                        Help Center
                      </Link>
                      <Link
                        href="/documentation"
                        className="block text-sm text-neutral-600 hover:text-black transition-colors underline"
                      >
                        Documentation
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Report Abuse */}
              <Card className="border-red-200 bg-red-50 rounded-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg font-medium uppercase tracking-wider text-red-900 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Report Abuse
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-800 font-light mb-3">
                    If you've encountered inappropriate content or behavior,
                    please report it immediately using the "Report Abuse"
                    category in the form.
                  </p>
                  <p className="text-xs text-red-700 font-light">
                    For urgent safety concerns, please contact local
                    authorities.
                  </p>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardHeader className="border-b border-neutral-200">
                  <CardTitle className="text-lg font-medium uppercase tracking-wider">
                    Follow Us
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-sm text-neutral-600 font-light mb-4">
                    Stay connected with us on social media for updates and news.
                  </p>
                  <div className="flex gap-3">
                    <a
                      href="https://x.com/ctrl_bits"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-neutral-100 border border-neutral-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                    <a
                      href="https://facebook.com/ctrlbits"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-neutral-100 border border-neutral-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                    <a
                      href="https://linkedin.com/company/ctrlbits"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-neutral-100 border border-neutral-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                    <a
                      href="https://instagram.com/ctrl.bits"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-neutral-100 border border-neutral-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
