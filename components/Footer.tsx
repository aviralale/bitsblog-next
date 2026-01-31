import { Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";
import { NewsletterForm } from "./news-letter-form";
import Link from "next/link";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    quickLinks: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Categories", href: "/categories" },
      { label: "Archives", href: "/archives" },
    ],
    resources: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  };

  const socialLinks = [
    { icon: Github, label: "GitHub", href: "https://github.com/ctrlbits" },
    { icon: Twitter, label: "Twitter", href: "https://twitter.com/ctrlbits" },
    {
      icon: Linkedin,
      label: "LinkedIn",
      href: "https://linkedin.com/company/ctrlbits",
    },
    { icon: Mail, label: "Email", href: "mailto:hi@ctrlbits.com" },
  ];

  return (
    <footer className="border-t border-neutral-200 bg-white mt-auto">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <img
                src="/favicon.png"
                className="h-8 w-8"
                alt="BitsBlog logo"
                width="32"
                height="32"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-black leading-tight">
                  BitsBlog
                </span>
                <span className="text-xs text-neutral-500 font-light">
                  by Ctrl Bits
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed mb-4 sm:mb-6 max-w-md">
              Discovering Nepal's best blogs and providing in-depth analysis on
              digital infrastructure, technology policy, and digital
              transformation.
            </p>
            {/* Social Links - Responsive */}
            <div className="flex gap-3 sm:gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 sm:w-10 sm:h-10 border border-neutral-300 hover:border-black hover:bg-black hover:text-white transition-all duration-200 flex items-center justify-center rounded hover:rounded-sm"
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-black uppercase tracking-wider mb-4 sm:mb-6">
              Quick Links
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-neutral-600 hover:text-black font-light transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-black uppercase tracking-wider mb-4 sm:mb-6">
              Resources
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-neutral-600 hover:text-black font-light transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-neutral-200 pt-8 sm:pt-12 mb-8 sm:mb-12">
          <div className="max-w-md">
            <h3 className="text-xs sm:text-sm font-semibold text-black uppercase tracking-wider mb-3 sm:mb-4">
              Stay Updated
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 font-light mb-4">
              Get the latest articles delivered to your inbox
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-200">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-3 sm:gap-4 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-neutral-500 font-light">
              © {currentYear} Ctrl Bits. All rights reserved.
            </p>
            <p className="text-xs sm:text-sm text-neutral-500 font-light flex items-center gap-2 justify-center">
              Made with <Heart className="h-3 w-3 text-neutral-400" /> by Ctrl
              Bits
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
