"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { postAPI, categoryAPI } from "@/api/services";
import {
  Code,
  Lightbulb,
  Users,
  Target,
  Mail,
  Twitter,
  Linkedin,
  Github,
  ArrowRight,
  Heart,
  Zap,
  Shield,
} from "lucide-react";
import Link from "next/link";

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

export default function AboutContent() {
  // State for real statistics
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalCategories: 0,
    totalComments: 0,
    loading: true,
  });

  // Load real statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Fetch posts with all data
        const postsResponse = await postAPI.getAll({
          status: "published",
          page_size: 1000, // Get all posts to calculate accurate stats
        });
        const posts = postsResponse.data.results || postsResponse.data;

        // Fetch categories
        const categoriesResponse = await categoryAPI.getAll();
        const rawCategories: any = categoriesResponse.data;
        const categories = Array.isArray(rawCategories)
          ? rawCategories
          : (rawCategories && (rawCategories.results ?? rawCategories.items)) ||
            [];

        // Calculate statistics
        const totalViews = posts.reduce(
          (sum: number, post: any) => sum + (post.views || 0),
          0,
        );
        const totalComments = posts.reduce(
          (sum: number, post: any) => sum + (post.comments_count || 0),
          0,
        );

        setStats({
          totalPosts: posts.length,
          totalViews,
          totalCategories: categories.length,
          totalComments,
          loading: false,
        });

        console.log("Stats loaded:", {
          posts: posts.length,
          views: totalViews,
          categories: categories.length,
          comments: totalComments,
        });
      } catch (error) {
        console.error("Failed to load stats:", error);
        // Set default values on error
        setStats({
          totalPosts: 0,
          totalViews: 0,
          totalCategories: 0,
          totalComments: 0,
          loading: false,
        });
      }
    };

    loadStats();
  }, []);

  // Format number with K suffix for thousands
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${Math.floor(num / 1000)}K+`;
    }
    return `${num}+`;
  };

  const values = [
    {
      icon: Code,
      title: "Technical Excellence",
      description:
        "We believe in writing clean, maintainable code and following industry best practices. Quality is never an accident.",
    },
    {
      icon: Lightbulb,
      title: "Innovation First",
      description:
        "Embracing new technologies and methodologies to solve complex problems in creative ways.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description:
        "We learn from and contribute to the developer community. Open source is in our DNA.",
    },
    {
      icon: Heart,
      title: "User-Centric Design",
      description:
        "Building solutions that prioritize user experience and accessibility above all else.",
    },
    {
      icon: Zap,
      title: "Speed & Performance",
      description:
        "Optimizing every byte and millisecond to deliver lightning-fast experiences.",
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description:
        "Implementing robust security measures to protect user data and maintain trust.",
    },
  ];

  const expertise = [
    {
      title: "Web Development",
      description:
        "Full-stack development with modern frameworks like React, Next.js, Django, and FastAPI.",
      technologies: ["React", "Next.js", "Django", "FastAPI", "TypeScript"],
    },
    {
      title: "AI & Machine Learning",
      description:
        "Implementing intelligent solutions with natural language processing and computer vision.",
      technologies: [
        "TensorFlow",
        "PyTorch",
        "OpenAI",
        "Hugging Face",
        "LangChain",
      ],
    },
    {
      title: "Cloud & DevOps",
      description:
        "Scalable infrastructure and CI/CD pipelines for reliable deployments.",
      technologies: [
        "AWS",
        "Docker",
        "Kubernetes",
        "GitHub Actions",
        "Terraform",
      ],
    },
    {
      title: "UI/UX Design",
      description:
        "Creating beautiful, intuitive interfaces with modern design systems.",
      technologies: [
        "Figma",
        "Tailwind CSS",
        "shadcn/ui",
        "Framer Motion",
        "Radix UI",
      ],
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-6 py-32 max-w-5xl">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-12 bg-black"></div>
                <span className="text-sm font-medium text-black uppercase tracking-wider">
                  About Us
                </span>
              </div>

              <h1 className="text-6xl md:text-7xl font-light tracking-tight text-black mb-8 leading-[1.1]">
                Building the Future,
                <br />
                One Bit at a Time
              </h1>

              <p className="text-xl md:text-2xl text-neutral-600 font-light mb-6 leading-relaxed">
                We're{" "}
                <strong className="font-medium text-black">Ctrl Bits</strong>, a
                technology company passionate about digital innovation, clean
                code, and building solutions that make a difference.
              </p>

              <p className="text-lg text-neutral-500 font-light leading-relaxed">
                From web applications to AI-powered solutions, we transform
                ideas into reality with precision, creativity, and a relentless
                focus on quality.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="border-b border-neutral-200 bg-neutral-50">
          <div className="container mx-auto px-6 py-20 max-w-5xl">
            <div className="max-w-3xl mx-auto text-center">
              <Target className="h-12 w-12 text-black mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-light text-black mb-6 leading-tight">
                Our Mission
              </h2>
              <p className="text-xl text-neutral-600 font-light leading-relaxed">
                To empower businesses and developers with cutting-edge
                technology solutions while sharing knowledge through our
                platform. We believe in the power of open source, continuous
                learning, and building tools that elevate the entire tech
                community.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-6 py-20 max-w-6xl">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-1 h-8 bg-black"></div>
              <h2 className="text-3xl font-light text-black">Our Values</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div
                    key={index}
                    className="border border-neutral-200 p-8 hover:border-black transition-colors group"
                  >
                    <div className="w-12 h-12 bg-neutral-100 flex items-center justify-center mb-6 group-hover:bg-black transition-colors">
                      <Icon className="h-6 w-6 text-neutral-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-light text-black mb-3">
                      {value.title}
                    </h3>
                    <p className="text-neutral-600 font-light leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Expertise */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-6 py-20 max-w-6xl">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-1 h-8 bg-black"></div>
              <h2 className="text-3xl font-light text-black">Our Expertise</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {expertise.map((area, index) => (
                <div
                  key={index}
                  className="border border-neutral-200 p-8 hover:bg-neutral-50 transition-colors"
                >
                  <h3 className="text-2xl font-light text-black mb-3">
                    {area.title}
                  </h3>
                  <p className="text-neutral-600 font-light mb-6 leading-relaxed">
                    {area.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {area.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="text-xs px-3 py-1.5 border border-neutral-300 text-neutral-600 hover:border-black hover:text-black transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What We Do */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-6 py-20 max-w-5xl">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-1 h-8 bg-black"></div>
              <h2 className="text-3xl font-light text-black">What We Do</h2>
            </div>

            <div className="space-y-16">
              {/* Blog Platform */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-light text-black mb-4">
                    BitsBlog Platform
                  </h3>
                  <p className="text-neutral-600 font-light leading-relaxed mb-6">
                    Our flagship blog platform where we share insights,
                    tutorials, and deep dives into modern web development, AI,
                    software architecture, and emerging technologies.
                  </p>
                  <Link href="/articles">
                    <Button
                      variant="outline"
                      className="border-black text-black hover:bg-black hover:text-white font-light rounded-none"
                    >
                      Explore Articles
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
                <div className="bg-neutral-100 h-64 flex items-center justify-center border border-neutral-200">
                  <Code className="h-24 w-24 text-neutral-400" />
                </div>
              </div>

              {/* Development Services */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 bg-neutral-100 h-64 flex items-center justify-center border border-neutral-200">
                  <Lightbulb className="h-24 w-24 text-neutral-400" />
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="text-2xl font-light text-black mb-4">
                    Custom Development
                  </h3>
                  <p className="text-neutral-600 font-light leading-relaxed mb-6">
                    We build custom web applications, APIs, and digital products
                    tailored to your specific needs. From MVPs to enterprise
                    solutions, we deliver quality at every scale.
                  </p>
                  <Button
                    variant="outline"
                    className="border-black text-black hover:bg-black hover:text-white font-light rounded-none"
                  >
                    Get in Touch
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Open Source */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-light text-black mb-4">
                    Open Source Contributions
                  </h3>
                  <p className="text-neutral-600 font-light leading-relaxed mb-6">
                    We actively contribute to the open-source community, sharing
                    tools, libraries, and resources that help developers
                    worldwide build better software.
                  </p>
                  <a
                    href="https://github.com/ctrlbits"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      className="border-black text-black hover:bg-black hover:text-white font-light rounded-none"
                    >
                      View on GitHub
                      <Github className="h-4 w-4 ml-2" />
                    </Button>
                  </a>
                </div>
                <div className="bg-neutral-100 h-64 flex items-center justify-center border border-neutral-200">
                  <Github className="h-24 w-24 text-neutral-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="border-b border-neutral-200 bg-neutral-50">
          <div className="container mx-auto px-6 py-16 max-w-5xl">
            {stats.loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-light text-black mb-2">
                    {formatNumber(stats.totalPosts)}
                  </div>
                  <div className="text-sm text-neutral-500 uppercase tracking-wider">
                    Articles Published
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-light text-black mb-2">
                    {formatNumber(stats.totalViews)}
                  </div>
                  <div className="text-sm text-neutral-500 uppercase tracking-wider">
                    Total Views
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-light text-black mb-2">
                    {formatNumber(stats.totalCategories)}
                  </div>
                  <div className="text-sm text-neutral-500 uppercase tracking-wider">
                    Categories
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-light text-black mb-2">
                    {formatNumber(stats.totalComments)}
                  </div>
                  <div className="text-sm text-neutral-500 uppercase tracking-wider">
                    Comments
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Connect Section */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-6 py-20 max-w-5xl">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-light text-black mb-6 leading-tight">
                Let's Connect
              </h2>
              <p className="text-lg text-neutral-600 font-light mb-12 leading-relaxed">
                Whether you're interested in collaboration, have a project in
                mind, or just want to say hello, we'd love to hear from you.
              </p>

              {/* Social Links */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <a
                  href="mailto:hi@ctrlbits.com"
                  className="flex items-center gap-2 px-6 py-3 border border-neutral-300 hover:border-black hover:bg-black hover:text-white transition-all group"
                >
                  <Mail className="h-5 w-5" />
                  <span className="font-light">Email Us</span>
                </a>
                <a
                  href="https://twitter.com/ctrlbits"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 border border-neutral-300 hover:border-black hover:bg-black hover:text-white transition-all group"
                >
                  <Twitter className="h-5 w-5" />
                  <span className="font-light">Twitter</span>
                </a>
                <a
                  href="https://linkedin.com/company/ctrlbits"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 border border-neutral-300 hover:border-black hover:bg-black hover:text-white transition-all group"
                >
                  <Linkedin className="h-5 w-5" />
                  <span className="font-light">LinkedIn</span>
                </a>
                <a
                  href="https://github.com/ctrlbits"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 border border-neutral-300 hover:border-black hover:bg-black hover:text-white transition-all group"
                >
                  <Github className="h-5 w-5" />
                  <span className="font-light">GitHub</span>
                </a>
              </div>

              <div className="text-sm text-neutral-500 font-light">
                <p>Ctrl Bits © {new Date().getFullYear()}</p>
                <p className="mt-2">Based in Kathmandu, Nepal 🇳🇵</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-black text-white">
          <div className="container mx-auto px-6 py-20 max-w-5xl">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-light mb-6 leading-tight">
                Ready to Start Reading?
              </h2>
              <p className="text-lg text-neutral-300 font-light mb-8 leading-relaxed">
                Explore our growing collection of articles on web development,
                AI, software architecture, and more.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/articles">
                  <Button
                    variant="outline"
                    className="border-white bg-white text-black hover:bg-neutral-200 font-light rounded-none h-12 px-8"
                  >
                    Browse Articles
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-black font-light rounded-none h-12 px-8"
                  >
                    View Categories
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
