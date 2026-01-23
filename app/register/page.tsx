"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight, AlertCircle } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password_confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
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
              Join BitsBlog
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-light text-black mb-4 leading-tight">
            Register
          </h1>
          <p className="text-lg text-neutral-600 font-light">
            Create your account and start sharing
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
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="border-neutral-300 focus:border-black rounded-none h-12 font-light text-black placeholder:text-neutral-400"
                  placeholder="Choose a username"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-black uppercase tracking-wider"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="border-neutral-300 focus:border-black rounded-none h-12 font-light text-black placeholder:text-neutral-400"
                  placeholder="your@email.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="first_name"
                    className="text-sm font-medium text-black uppercase tracking-wider"
                  >
                    First Name
                  </Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="border-neutral-300 focus:border-black rounded-none h-12 font-light text-black placeholder:text-neutral-400"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="last_name"
                    className="text-sm font-medium text-black uppercase tracking-wider"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="border-neutral-300 focus:border-black rounded-none h-12 font-light text-black placeholder:text-neutral-400"
                    placeholder="Doe"
                  />
                </div>
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
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="border-neutral-300 focus:border-black rounded-none h-12 font-light text-black placeholder:text-neutral-400"
                  placeholder="Create a password"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password_confirm"
                  className="text-sm font-medium text-black uppercase tracking-wider"
                >
                  Confirm Password
                </Label>
                <Input
                  id="password_confirm"
                  name="password_confirm"
                  type="password"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  required
                  className="border-neutral-300 focus:border-black rounded-none h-12 font-light text-black placeholder:text-neutral-400"
                  placeholder="Confirm your password"
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
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Register
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                )}
              </Button>

              <div className="w-full h-px bg-neutral-200"></div>

              <p className="text-sm text-center text-neutral-600 font-light">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-black font-medium hover:underline underline-offset-4 transition-all"
                >
                  Login here
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
