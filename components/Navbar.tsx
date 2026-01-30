"use client";
import Link from "next/link";
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
} from "lucide-react";

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="border-b border-neutral-200 bg-white" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-6 py-6 max-w-5xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="BitsBlog home">
            <img
              src="/favicon.png"
              className="h-8 transition-opacity group-hover:opacity-70"
              alt="BitsBlog logo"
              width="32"
              height="32"
            />
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-medium text-black leading-none">
                BitsBlog
              </span>
              <span className="text-xs text-neutral-500 font-light">
                by Ctrl Bits
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-2" role="menubar">{" "}
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-700 hover:text-black hover:bg-neutral-100 font-light rounded-none h-10 px-4"
                aria-label="Home"
              >
                <Home className="h-4 w-4 mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>

            <Link href="/articles">
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-700 hover:text-black hover:bg-neutral-100 font-light rounded-none h-10 px-4"
                aria-label="Articles"
              >
                <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Articles</span>
              </Button>
            </Link>

            <Link href="/categories">
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-700 hover:text-black hover:bg-neutral-100 font-light rounded-none h-10 px-4"
                aria-label="Categories"
              >
                <FolderOpen className="h-4 w-4 mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Categories</span>
              </Button>
            </Link>

            <Link href="/best-blogs-nepal">
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-700 hover:text-black hover:bg-neutral-100 font-light rounded-none h-10 px-4"
                aria-label="Best Blogs"
              >
                <Star className="h-4 w-4 mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Best Blogs</span>
              </Button>
            </Link>

            <Link href="/archives">
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-700 hover:text-black hover:bg-neutral-100 font-light rounded-none h-10 px-4"
                aria-label="Archives"
              >
                <Archive className="h-4 w-4 mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Archives</span>
              </Button>
            </Link>

            <Link href="/search">
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-700 hover:text-black hover:bg-neutral-100 font-light rounded-none h-10 px-4"
                aria-label="Search"
              >
                <Search className="h-4 w-4 mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </Link>

            {isAuthenticated ? (
              <>
                {user?.is_staff && (
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-neutral-700 hover:text-black hover:bg-neutral-100 font-light rounded-none h-10 px-4"
                      aria-label="Dashboard"
                    >
                      <PenSquare className="h-4 w-4 mr-2" aria-hidden="true" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </Button>
                  </Link>
                )}

                <Link href={`/profile/${user?.username}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-neutral-700 hover:text-black hover:bg-neutral-100 font-light rounded-none h-10 px-4"
                    aria-label={`Profile of ${user?.username}`}
                  >
                    <User className="h-4 w-4 mr-2" aria-hidden="true" />
                    <span className="hidden sm:inline">{user?.username}</span>
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-neutral-700 hover:text-black hover:bg-neutral-100 font-light rounded-none h-10 px-4"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4 sm:mr-2" aria-hidden="true" />
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
    </nav>
  );
};
