"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import {
  PenSquare,
  LogOut,
  User,
  Home,
  Search,
  FolderOpen,
  Archive,
  FileText,
  Star,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export const ResponsiveNavbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false);
        setOpenDropdown(null);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close mobile menu when a link is clicked
  const handleLinkClick = () => {
    setIsOpen(false);
    setOpenDropdown(null);
  };

  const mainNavItems: NavItem[] = [
    { label: "Home", href: "/", icon: <Home className="h-4 w-4" /> },
    {
      label: "Articles",
      href: "/articles",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: "Categories",
      href: "/categories",
      icon: <FolderOpen className="h-4 w-4" />,
    },
    {
      label: "Archives",
      href: "/archives",
      icon: <Archive className="h-4 w-4" />,
    },
    { label: "Search", href: "/search", icon: <Search className="h-4 w-4" /> },
  ];

  const handleDropdownToggle = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <nav
      className="border-b border-neutral-200 bg-white sticky top-0 z-50 transition-all duration-200"
      role="navigation"
      aria-label="Main navigation"
      ref={navRef}
    >
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 sm:px-6 py-4 max-w-7xl">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 md:gap-3 group shrink-0"
              aria-label="BitsBlog home"
            >
              <Image
                src="/favicon.png"
                className="h-8 w-8 transition-opacity group-hover:opacity-70"
                alt="BitsBlog logo"
                width={32}
                height={32}
                priority
              />
              <div className="hidden lg:flex flex-col">
                <span className="text-sm font-semibold text-black leading-tight">
                  BitsBlog
                </span>
                <span className="text-xs text-neutral-500 font-light">
                  by Ctrl Bits
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Items */}
            <div className="flex items-center gap-1 flex-1 justify-center lg:justify-start lg:ml-8">
              {mainNavItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-neutral-700 hover:text-black hover:bg-neutral-100 font-light rounded-none h-10 px-3 gap-2 whitespace-nowrap"
                    aria-label={item.label}
                  >
                    {item.icon}
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              ))}
            </div>

            {/* Right Side Auth Items */}
            <div className="flex items-center gap-1">
              {isAuthenticated ? (
                <>
                  {user?.is_staff && (
                    <Link href="/dashboard">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-neutral-700 hover:text-black hover:bg-neutral-100 font-light rounded-none h-10 px-3 gap-2 whitespace-nowrap"
                        aria-label="Dashboard"
                      >
                        <PenSquare className="h-4 w-4" />
                        <span className="hidden sm:inline">Dashboard</span>
                      </Button>
                    </Link>
                  )}

                  <Link href={`/profile/${user?.username}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-neutral-700 hover:text-black hover:bg-neutral-100 font-light rounded-none h-10 px-3 gap-2 whitespace-nowrap"
                      aria-label={`Profile of ${user?.username}`}
                    >
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline text-xs truncate max-w-[100px]">
                        {user?.username}
                      </span>
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-neutral-700 hover:text-black hover:bg-neutral-100 font-light rounded-none h-10 px-3 gap-2 whitespace-nowrap"
                    aria-label="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-neutral-700 hover:text-black hover:bg-neutral-100 font-light rounded-none h-10 px-4"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      size="sm"
                      className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-10 px-6"
                    >
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          {/* Mobile Header */}
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group shrink-0"
              aria-label="BitsBlog home"
              onClick={handleLinkClick}
            >
              <Image
                src="/favicon.png"
                className="h-7 w-7 transition-opacity group-hover:opacity-70"
                alt="BitsBlog logo"
                width={32}
                height={32}
                priority
              />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-black leading-tight">
                  BitsBlog
                </span>
                <span className="text-xs text-neutral-500 font-light hidden xs:block">
                  Ctrl Bits
                </span>
              </div>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="h-6 w-6 text-neutral-700" />
              ) : (
                <Menu className="h-6 w-6 text-neutral-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="mt-3 space-y-1 border-t border-neutral-200 pt-3 pb-2">
              {/* Main Navigation */}
              {mainNavItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-neutral-700 hover:text-black hover:bg-neutral-100 font-light rounded-none h-10 px-4 gap-3"
                    onClick={handleLinkClick}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Button>
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="border-t border-neutral-200 my-2 pt-2">
                    {user?.is_staff && (
                      <Link href="/dashboard">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-neutral-700 hover:text-black hover:bg-neutral-100 font-light rounded-none h-10 px-4 gap-3"
                          onClick={handleLinkClick}
                        >
                          <PenSquare className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Button>
                      </Link>
                    )}

                    <Link href={`/profile/${user?.username}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-neutral-700 hover:text-black hover:bg-neutral-100 font-light rounded-none h-10 px-4 gap-3"
                        onClick={handleLinkClick}
                      >
                        <User className="h-4 w-4" />
                        <span>Profile: {user?.username}</span>
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        logout();
                        handleLinkClick();
                      }}
                      className="w-full justify-start text-neutral-700 hover:text-black hover:bg-neutral-100 font-light rounded-none h-10 px-4 gap-3"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="border-t border-neutral-200 my-2 pt-2 space-y-2">
                  <Link href="/login" className="block">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-neutral-700 hover:text-black hover:bg-neutral-100 font-light rounded-none h-10 px-4"
                      onClick={handleLinkClick}
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" className="block">
                    <Button
                      size="sm"
                      className="w-full bg-black text-white hover:bg-neutral-800 font-light rounded-none h-10 px-6"
                      onClick={handleLinkClick}
                    >
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
