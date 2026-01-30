"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route component that only allows admin users
 * Redirects to login if not authenticated, shows access denied if not admin
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!user?.is_staff) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <ShieldAlert className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
          <h2 className="text-2xl font-light text-black mb-3">Access Denied</h2>
          <p className="text-neutral-600 font-light mb-8">
            You need administrator privileges to access this page.
          </p>
          <Link href="/">
            <Button className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // User is authenticated and is admin
  return <>{children}</>;
}
