"use client";
import {
  FileText,
  Scale,
  AlertCircle,
  Shield,
  Ban,
  UserCheck,
} from "lucide-react";
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

export const TermsOfService = () => {
  // SEO Data
  const pageTitle = "Terms of Service - Usage Policy & Guidelines | BitsBlog Nepal";
  const pageDescription =
    "Read BitsBlog Nepal's terms of service and usage policy. Understand your rights, responsibilities, content guidelines, and acceptable use when using our technology blog platform.";
  const pageUrl = getAbsoluteUrl("/terms");
  const keywords =
    "terms of service, usage policy, user agreement, acceptable use, terms and conditions, service guidelines, BitsBlog terms, usage rules Nepal, content policy, legal terms";

  // WebPage structured data
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms of Service",
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
        name: "Terms of Service",
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
            Terms of Service
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
            Welcome to our blog. By accessing or using our website, you agree to
            be bound by these Terms of Service and all applicable laws and
            regulations. If you do not agree with any of these terms, you are
            prohibited from using or accessing this site.
          </p>
        </div>

        {/* Quick Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="border-neutral-200 rounded-none shadow-none">
            <CardContent className="pt-6">
              <Scale className="h-8 w-8 text-black mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">
                Fair Usage
              </h3>
              <p className="text-sm text-neutral-600 font-light">
                Use our services responsibly and respect other users.
              </p>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 rounded-none shadow-none">
            <CardContent className="pt-6">
              <Shield className="h-8 w-8 text-black mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">
                Your Content
              </h3>
              <p className="text-sm text-neutral-600 font-light">
                You retain rights to your content but grant us usage rights.
              </p>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 rounded-none shadow-none">
            <CardContent className="pt-6">
              <AlertCircle className="h-8 w-8 text-black mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">Liability</h3>
              <p className="text-sm text-neutral-600 font-light">
                We provide content as-is without warranties.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Acceptance of Terms */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <UserCheck className="h-6 w-6 text-black" />
              <h2 className="text-3xl font-light text-black">
                Acceptance of Terms
              </h2>
            </div>
            <div className="ml-9 space-y-4">
              <p className="text-neutral-600 font-light leading-relaxed">
                By accessing and using this website, you accept and agree to be
                bound by the terms and provision of this agreement. If you do
                not agree to abide by the above, please do not use this service.
              </p>
              <p className="text-neutral-600 font-light leading-relaxed">
                We reserve the right to update or modify these Terms of Service
                at any time without prior notice. Your use of the website
                following any such change constitutes your agreement to follow
                and be bound by the Terms of Service as changed.
              </p>
            </div>
          </section>

          {/* Use License */}
          <section className="border-t border-neutral-200 pt-12">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-6 w-6 text-black" />
              <h2 className="text-3xl font-light text-black">Use License</h2>
            </div>
            <div className="ml-9 space-y-4">
              <p className="text-neutral-600 font-light leading-relaxed">
                Permission is granted to temporarily access the materials
                (information or software) on our website for personal,
                non-commercial transitory viewing only. This is the grant of a
                license, not a transfer of title, and under this license you may
                not:
              </p>
              <ul className="space-y-3 text-neutral-600 font-light ml-6">
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>Modify or copy the materials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    Use the materials for any commercial purpose or for any
                    public display
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    Attempt to reverse engineer any software contained on our
                    website
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    Remove any copyright or other proprietary notations from the
                    materials
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    Transfer the materials to another person or "mirror" the
                    materials on any other server
                  </span>
                </li>
              </ul>
              <p className="text-neutral-600 font-light leading-relaxed">
                This license shall automatically terminate if you violate any of
                these restrictions and may be terminated by us at any time.
              </p>
            </div>
          </section>

          {/* User Accounts */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-3xl font-light text-black mb-6">
              User Accounts
            </h2>
            <div className="space-y-4">
              <p className="text-neutral-600 font-light leading-relaxed">
                When you create an account with us, you must provide information
                that is accurate, complete, and current at all times. Failure to
                do so constitutes a breach of the Terms, which may result in
                immediate termination of your account.
              </p>
              <p className="text-neutral-600 font-light leading-relaxed">
                You are responsible for:
              </p>
              <ul className="space-y-2 text-neutral-600 font-light ml-6">
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    Safeguarding the password that you use to access the service
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    Any activities or actions under your password, whether your
                    password is with our service or a third-party service
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    Notifying us immediately upon becoming aware of any security
                    breach
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* User Content */}
          <section className="border-t border-neutral-200 pt-12">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-black" />
              <h2 className="text-3xl font-light text-black">
                User-Generated Content
              </h2>
            </div>
            <div className="ml-9 space-y-4">
              <p className="text-neutral-600 font-light leading-relaxed">
                Our website may allow you to post, link, store, share and
                otherwise make available certain information, text, graphics,
                videos, or other material ("Content"). You are responsible for
                the Content that you post, including its legality, reliability,
                and appropriateness.
              </p>
              <p className="text-neutral-600 font-light leading-relaxed">
                By posting Content on our website, you grant us the right and
                license to use, modify, publicly perform, publicly display,
                reproduce, and distribute such Content on and through our
                website. You retain any and all of your rights to any Content
                you submit, post or display on or through the website and you
                are responsible for protecting those rights.
              </p>
              <p className="text-neutral-600 font-light leading-relaxed">
                You represent and warrant that:
              </p>
              <ul className="space-y-2 text-neutral-600 font-light ml-6">
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    The Content is yours (you own it) or you have the right to
                    use it
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    The posting of your Content does not violate the privacy
                    rights, publicity rights, copyrights, contract rights or any
                    other rights of any person
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Prohibited Uses */}
          <section className="border-t border-neutral-200 pt-12">
            <div className="flex items-center gap-3 mb-6">
              <Ban className="h-6 w-6 text-black" />
              <h2 className="text-3xl font-light text-black">
                Prohibited Uses
              </h2>
            </div>
            <div className="ml-9 space-y-4">
              <p className="text-neutral-600 font-light leading-relaxed">
                You may not use our website:
              </p>
              <ul className="space-y-3 text-neutral-600 font-light ml-6">
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    In any way that violates any applicable national or
                    international law or regulation
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    To transmit, or procure the sending of, any advertising or
                    promotional material, including any "junk mail," "chain
                    letter," "spam," or any other similar solicitation
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    To impersonate or attempt to impersonate the company, a
                    company employee, another user, or any other person or
                    entity
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    In any way that infringes upon the rights of others, or in
                    any way is illegal, threatening, fraudulent, or harmful, or
                    in connection with any unlawful, illegal, fraudulent, or
                    harmful purpose or activity
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    To engage in any other conduct that restricts or inhibits
                    anyone's use or enjoyment of the website, or which, as
                    determined by us, may harm or offend us or users of the
                    website or expose them to liability
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-3xl font-light text-black mb-6">
              Intellectual Property
            </h2>
            <div className="space-y-4">
              <p className="text-neutral-600 font-light leading-relaxed">
                The website and its original content (excluding Content provided
                by users), features and functionality are and will remain the
                exclusive property of our company and its licensors. The website
                is protected by copyright, trademark, and other laws of both the
                United States and foreign countries.
              </p>
              <p className="text-neutral-600 font-light leading-relaxed">
                Our trademarks and trade dress may not be used in connection
                with any product or service without our prior written consent.
              </p>
            </div>
          </section>

          {/* Copyright Policy */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-3xl font-light text-black mb-6">
              Copyright Policy
            </h2>
            <div className="space-y-4">
              <p className="text-neutral-600 font-light leading-relaxed">
                We respect the intellectual property rights of others. It is our
                policy to respond to any claim that Content posted on the
                website infringes on the copyright or other intellectual
                property rights ("Infringement") of any person or entity.
              </p>
              <p className="text-neutral-600 font-light leading-relaxed">
                If you are a copyright owner, or authorized on behalf of one,
                and you believe that the copyrighted work has been copied in a
                way that constitutes copyright infringement, please submit your
                claim via our contact page with a detailed description of the
                alleged Infringement.
              </p>
            </div>
          </section>

          {/* Links to Other Websites */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-3xl font-light text-black mb-6">
              Links to Other Websites
            </h2>
            <p className="text-neutral-600 font-light leading-relaxed">
              Our website may contain links to third-party websites or services
              that are not owned or controlled by us. We have no control over,
              and assume no responsibility for, the content, privacy policies,
              or practices of any third-party websites or services. We do not
              warrant the offerings of any of these entities/individuals or
              their websites.
            </p>
          </section>

          {/* Disclaimer */}
          <section className="border-t border-neutral-200 pt-12">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="h-6 w-6 text-black" />
              <h2 className="text-3xl font-light text-black">Disclaimer</h2>
            </div>
            <div className="ml-9 space-y-4">
              <p className="text-neutral-600 font-light leading-relaxed">
                The materials on our website are provided on an 'as is' basis.
                We make no warranties, expressed or implied, and hereby disclaim
                and negate all other warranties including, without limitation,
                implied warranties or conditions of merchantability, fitness for
                a particular purpose, or non-infringement of intellectual
                property or other violation of rights.
              </p>
              <p className="text-neutral-600 font-light leading-relaxed">
                Further, we do not warrant or make any representations
                concerning the accuracy, likely results, or reliability of the
                use of the materials on our website or otherwise relating to
                such materials or on any sites linked to this site.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-3xl font-light text-black mb-6">
              Limitation of Liability
            </h2>
            <p className="text-neutral-600 font-light leading-relaxed">
              In no event shall we or our suppliers be liable for any damages
              (including, without limitation, damages for loss of data or
              profit, or due to business interruption) arising out of the use or
              inability to use the materials on our website, even if we or our
              authorized representative has been notified orally or in writing
              of the possibility of such damage.
            </p>
          </section>

          {/* Governing Law */}
          <section className="border-t border-neutral-200 pt-12">
            <div className="flex items-center gap-3 mb-6">
              <Scale className="h-6 w-6 text-black" />
              <h2 className="text-3xl font-light text-black">Governing Law</h2>
            </div>
            <div className="ml-9">
              <p className="text-neutral-600 font-light leading-relaxed">
                These Terms shall be governed and construed in accordance with
                the laws of your jurisdiction, without regard to its conflict of
                law provisions. Our failure to enforce any right or provision of
                these Terms will not be considered a waiver of those rights.
              </p>
            </div>
          </section>

          {/* Termination */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-3xl font-light text-black mb-6">Termination</h2>
            <div className="space-y-4">
              <p className="text-neutral-600 font-light leading-relaxed">
                We may terminate or suspend your account and bar access to the
                website immediately, without prior notice or liability, under
                our sole discretion, for any reason whatsoever and without
                limitation, including but not limited to a breach of the Terms.
              </p>
              <p className="text-neutral-600 font-light leading-relaxed">
                If you wish to terminate your account, you may simply
                discontinue using the website or contact us to request account
                deletion.
              </p>
              <p className="text-neutral-600 font-light leading-relaxed">
                All provisions of the Terms which by their nature should survive
                termination shall survive termination, including, without
                limitation, ownership provisions, warranty disclaimers,
                indemnity and limitations of liability.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-3xl font-light text-black mb-6">Contact Us</h2>
            <div className="space-y-4">
              <p className="text-neutral-600 font-light leading-relaxed">
                If you have any questions about these Terms of Service, please
                contact us:
              </p>
              <div className="bg-neutral-50 border border-neutral-200 p-6">
                <p className="text-neutral-600 font-light">
                  Email:{" "}
                  <a
                    href="mailto:legal@ctrlbits.com"
                    className="text-black underline hover:no-underline"
                  >
                    legal@ctrlbits.com
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

export default TermsOfService;
