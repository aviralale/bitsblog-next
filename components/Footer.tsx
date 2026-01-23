import { Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";
import { NewsletterForm } from "./news-letter-form";
import Link from "next/link";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-white mt-auto">
      {/* Main Footer */}
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.png" className="h-8 invert" alt="BitsBlog" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-black leading-none">
                  BitsBlog
                </span>
                <span className="text-xs text-neutral-500 font-light">
                  by Ctrl Bits
                </span>
              </div>
            </div>
            <p className="text-neutral-600 font-light leading-relaxed mb-6 max-w-md">
              Where technology meets insight. Exploring the intersection of
              code, design, and innovation through thoughtful content that
              matters.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/ctrlbits"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-neutral-300 hover:border-black hover:bg-black hover:text-white transition-all duration-200 flex items-center justify-center"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/ctrlbits"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-neutral-300 hover:border-black hover:bg-black hover:text-white transition-all duration-200 flex items-center justify-center"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/company/ctrlbits"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-neutral-300 hover:border-black hover:bg-black hover:text-white transition-all duration-200 flex items-center justify-center"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="mailto:hello@ctrlbits.com"
                className="w-10 h-10 border border-neutral-300 hover:border-black hover:bg-black hover:text-white transition-all duration-200 flex items-center justify-center"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-medium text-black uppercase tracking-wider mb-6">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-neutral-600 hover:text-black font-light transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-neutral-600 hover:text-black font-light transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-neutral-600 hover:text-black font-light transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/archive"
                  className="text-neutral-600 hover:text-black font-light transition-colors"
                >
                  Archive
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-medium text-black uppercase tracking-wider mb-6">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/dashboard"
                  className="text-neutral-600 hover:text-black font-light transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-neutral-600 hover:text-black font-light transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-neutral-600 hover:text-black font-light transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-neutral-600 hover:text-black font-light transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-neutral-200 pt-12 mb-12">
          <div className="max-w-md">
            <h3 className="text-sm font-medium text-black uppercase tracking-wider mb-4">
              Stay Updated
            </h3>
            <p className="text-neutral-600 font-light mb-4 text-sm">
              Get the latest articles and insights delivered to your inbox
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-200">
        <div className="container mx-auto px-6 py-6 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-neutral-500 font-light">
              © {currentYear} Ctrl Bits. All rights reserved.
            </p>
            <p className="text-sm text-neutral-500 font-light flex items-center gap-2">
              Made with <Heart className="h-3 w-3 text-neutral-400" /> by Ctrl
              Bits
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
