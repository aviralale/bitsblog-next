"use client";
import { Shield, Eye, Lock, Database, Cookie, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Head from "next/head";

// Helper function to get absolute URL
const getAbsoluteUrl = (path: string): string => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

export const PrivacyPolicy = () => {
  // SEO Data
  const pageTitle = "Privacy Policy - Data Protection & User Privacy | BitsBlog Nepal";
  const pageDescription =
    "Read BitsBlog Nepal's privacy policy. Learn how we collect, use, protect your personal data, and safeguard user privacy. Transparent data practices for Nepal's tech community. GDPR compliant.";
  const pageUrl = getAbsoluteUrl("/privacy");
  const keywords =
    "privacy policy, data protection Nepal, user privacy, personal information, GDPR compliance, data security, privacy rights, BitsBlog privacy, data collection Nepal, user data protection, privacy transparency";

  // WebPage structured data
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy Policy",
    description: pageDescription,
    url: pageUrl,
    publisher: {
      "@type": "Organization",
      name: "Ctrl Bits",
      logo: {
        "@type": "ImageObject",
        url: getAbsoluteUrl("/logo.png"),
      },
    },
  };

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
        name: "Privacy Policy",
        item: pageUrl,
      },
    ],
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

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:site" content="@ctrl_bits" />

        {/* Structured Data - WebPage */}
        <script type="application/ld+json">
          {JSON.stringify(webPageSchema)}
        </script>

        {/* Structured Data - Breadcrumb */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Head>

    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200">
        <div className="container mx-auto px-6 py-16 max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-12 bg-black"></div>
            <span className="text-sm font-medium text-black uppercase tracking-wider">
              Legal
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-light text-black mb-6 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-lg text-neutral-600 font-light">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-4xl">
        {/* Introduction */}
        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-neutral-600 font-light leading-relaxed">
            At our blog, we take your privacy seriously. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you visit our website. Please read this privacy
            policy carefully. If you do not agree with the terms of this privacy
            policy, please do not access the site.
          </p>
        </div>

        {/* Quick Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="border-neutral-200 rounded-none shadow-none">
            <CardContent className="pt-6">
              <Shield className="h-8 w-8 text-black mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">
                Your Data is Protected
              </h3>
              <p className="text-sm text-neutral-600 font-light">
                We use industry-standard security measures to protect your
                personal information.
              </p>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 rounded-none shadow-none">
            <CardContent className="pt-6">
              <Eye className="h-8 w-8 text-black mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">
                Transparency First
              </h3>
              <p className="text-sm text-neutral-600 font-light">
                We're open about what data we collect and how we use it.
              </p>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 rounded-none shadow-none">
            <CardContent className="pt-6">
              <Lock className="h-8 w-8 text-black mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">
                You're in Control
              </h3>
              <p className="text-sm text-neutral-600 font-light">
                You can request to view, update, or delete your data at any
                time.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Information We Collect */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Database className="h-6 w-6 text-black" />
              <h2 className="text-3xl font-light text-black">
                Information We Collect
              </h2>
            </div>
            <div className="space-y-6 ml-9">
              <div>
                <h3 className="text-xl font-medium text-black mb-3">
                  Personal Information
                </h3>
                <p className="text-neutral-600 font-light leading-relaxed mb-4">
                  We may collect personal information that you voluntarily
                  provide to us when you:
                </p>
                <ul className="space-y-2 text-neutral-600 font-light">
                  <li className="flex items-start gap-2">
                    <span className="text-black mt-1">•</span>
                    <span>Subscribe to our newsletter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black mt-1">•</span>
                    <span>Leave comments on our blog posts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black mt-1">•</span>
                    <span>Contact us through our contact form</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black mt-1">•</span>
                    <span>Create an account on our website</span>
                  </li>
                </ul>
                <p className="text-neutral-600 font-light leading-relaxed mt-4">
                  This information may include your name, email address, and any
                  other information you choose to provide.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium text-black mb-3">
                  Automatically Collected Information
                </h3>
                <p className="text-neutral-600 font-light leading-relaxed">
                  When you visit our website, we may automatically collect
                  certain information about your device, including information
                  about your web browser, IP address, time zone, and some of the
                  cookies that are installed on your device. We may also collect
                  information about your browsing behavior, such as the pages
                  you view and the links you click.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="border-t border-neutral-200 pt-12">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="h-6 w-6 text-black" />
              <h2 className="text-3xl font-light text-black">
                How We Use Your Information
              </h2>
            </div>
            <div className="ml-9">
              <p className="text-neutral-600 font-light leading-relaxed mb-4">
                We use the information we collect in the following ways:
              </p>
              <ul className="space-y-3 text-neutral-600 font-light">
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>To provide, operate, and maintain our website</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>To improve, personalize, and expand our website</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>To understand and analyze how you use our website</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    To develop new products, services, features, and
                    functionality
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    To communicate with you, either directly or through one of
                    our partners, including for customer service, to provide you
                    with updates and other information relating to the website,
                    and for marketing and promotional purposes
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>To send you newsletters and email updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>To detect and prevent fraud</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section className="border-t border-neutral-200 pt-12">
            <div className="flex items-center gap-3 mb-6">
              <Cookie className="h-6 w-6 text-black" />
              <h2 className="text-3xl font-light text-black">
                Cookies and Tracking Technologies
              </h2>
            </div>
            <div className="ml-9 space-y-4">
              <p className="text-neutral-600 font-light leading-relaxed">
                We use cookies and similar tracking technologies to track the
                activity on our website and store certain information. Cookies
                are files with a small amount of data which may include an
                anonymous unique identifier.
              </p>
              <p className="text-neutral-600 font-light leading-relaxed">
                You can instruct your browser to refuse all cookies or to
                indicate when a cookie is being sent. However, if you do not
                accept cookies, you may not be able to use some portions of our
                website.
              </p>
            </div>
          </section>

          {/* Third-Party Services */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-3xl font-light text-black mb-6">
              Third-Party Services
            </h2>
            <div className="space-y-4">
              <p className="text-neutral-600 font-light leading-relaxed">
                We may employ third-party companies and individuals to
                facilitate our website, provide the service on our behalf,
                perform website-related services, or assist us in analyzing how
                our website is used.
              </p>
              <p className="text-neutral-600 font-light leading-relaxed">
                These third parties may include:
              </p>
              <ul className="space-y-2 text-neutral-600 font-light ml-6">
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>Analytics providers (e.g., Google Analytics)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>Email marketing services</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>Advertising networks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>Social media platforms</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section className="border-t border-neutral-200 pt-12">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="h-6 w-6 text-black" />
              <h2 className="text-3xl font-light text-black">Data Security</h2>
            </div>
            <div className="ml-9">
              <p className="text-neutral-600 font-light leading-relaxed">
                The security of your personal information is important to us. We
                strive to use commercially acceptable means to protect your
                personal information, but remember that no method of
                transmission over the Internet or method of electronic storage
                is 100% secure. While we strive to use commercially acceptable
                means to protect your personal information, we cannot guarantee
                its absolute security.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-3xl font-light text-black mb-6">Your Rights</h2>
            <div className="space-y-4">
              <p className="text-neutral-600 font-light leading-relaxed">
                Depending on your location, you may have certain rights
                regarding your personal information, including:
              </p>
              <ul className="space-y-3 text-neutral-600 font-light ml-6">
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    <strong className="text-black font-medium">Access:</strong>{" "}
                    The right to request copies of your personal information
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    <strong className="text-black font-medium">
                      Rectification:
                    </strong>{" "}
                    The right to request that we correct any information you
                    believe is inaccurate
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    <strong className="text-black font-medium">Erasure:</strong>{" "}
                    The right to request that we erase your personal information
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    <strong className="text-black font-medium">
                      Restrict processing:
                    </strong>{" "}
                    The right to request that we restrict the processing of your
                    personal information
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    <strong className="text-black font-medium">
                      Data portability:
                    </strong>{" "}
                    The right to request that we transfer your data to another
                    organization or directly to you
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    <strong className="text-black font-medium">Opt-out:</strong>{" "}
                    The right to opt out of marketing communications
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-3xl font-light text-black mb-6">
              Children's Privacy
            </h2>
            <p className="text-neutral-600 font-light leading-relaxed">
              Our website does not address anyone under the age of 13. We do not
              knowingly collect personally identifiable information from
              children under 13. If you are a parent or guardian and you are
              aware that your child has provided us with personal information,
              please contact us. If we become aware that we have collected
              personal information from children without verification of
              parental consent, we take steps to remove that information from
              our servers.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-3xl font-light text-black mb-6">
              Changes to This Privacy Policy
            </h2>
            <p className="text-neutral-600 font-light leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the "Last updated" date at the top of this Privacy
              Policy. You are advised to review this Privacy Policy periodically
              for any changes. Changes to this Privacy Policy are effective when
              they are posted on this page.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-neutral-200 pt-12">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="h-6 w-6 text-black" />
              <h2 className="text-3xl font-light text-black">Contact Us</h2>
            </div>
            <div className="ml-9">
              <p className="text-neutral-600 font-light leading-relaxed mb-6">
                If you have any questions about this Privacy Policy, please
                contact us:
              </p>
              <div className="bg-neutral-50 border border-neutral-200 p-6">
                <p className="text-neutral-600 font-light">
                  Email:{" "}
                  <a
                    href="mailto:privacy@ctrlbits.com"
                    className="text-black underline hover:no-underline"
                  >
                    privacy@ctrlbits.com
                  </a>
                </p>
                <p className="text-neutral-600 font-light mt-2">
                  Or visit our{" "}
                  <a
                    href="/contact"
                    className="text-black underline hover:no-underline"
                  >
                    contact page
                  </a>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
    </>
  );
};

export default PrivacyPolicy;
