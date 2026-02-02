"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight, AlertCircle } from "lucide-react";

function LoginContent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ username, password });
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-1 h-12 bg-black"></div>
            <span className="text-sm font-medium text-black uppercase tracking-wider">
              Welcome Back
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-light text-black mb-4 leading-tight">
            Login
          </h1>
          <p className="text-lg text-neutral-600 font-light">
            Access your BitsBlog account
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-neutral-200 rounded-none shadow-none">
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-8 pb-8">
              {error && (
                <div className="border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 font-light">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-medium text-black uppercase tracking-wider"
                >
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="border-neutral-300 focus:border-black rounded-none h-12 font-light text-black placeholder:text-neutral-400"
                  placeholder="Enter your username"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-black uppercase tracking-wider"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-neutral-300 focus:border-black rounded-none h-12 font-light text-black placeholder:text-neutral-400"
                  placeholder="Enter your password"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-6 pb-8">
              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-neutral-800 font-light h-12 rounded-none group transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Login
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                )}
              </Button>

              <div className="w-full h-px bg-neutral-200"></div>

              <p className="text-sm text-center text-neutral-600 font-light">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-black font-medium hover:underline underline-offset-4 transition-all"
                >
                  Register here
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-black font-light transition-colors inline-flex items-center gap-2"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
