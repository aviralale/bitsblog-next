"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { postAPI, commentAPI } from "@/api/services";
import { type Post, type BlogComment } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Eye,
  User,
  MessageSquare,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Twitter,
  Linkedin,
  Mail,
  Facebook,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrism from "rehype-prism-plus";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import "highlight.js/styles/github-dark.css";
import Image from "next/image";
import { AdComponent } from "@/components/ad-component";
import SavePostButton from "@/components/save-posts-button";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

// Helper function to truncate text for meta description
const truncateText = (text: string, maxLength: number = 155): string => {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (
    (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "..."
  );
};

// Helper function to get absolute URL
const getAbsoluteUrl = (path: string): string => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "https://blog.ctrlbits.com";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

// Helper function to strip HTML tags
const stripHtml = (html: string): string => {
  if (typeof document === "undefined") return html;
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

interface PostViewPageClientProps {
  initialPost: Post;
}

export default function PostViewPageClient({
  initialPost,
}: PostViewPageClientProps) {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [post, setPost] = useState<Post | null>(initialPost);
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(
    null,
  );
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [toc, setToc] = useState<TocItem[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialPost?.content && contentRef.current) {
      generateTOC();
      observeSections();
      serializeMDX();
    }
  }, [initialPost]);

  const serializeMDX = async () => {
    if (!initialPost) return;

    try {
      const mdxContent = await serialize(initialPost.content, {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: "wrap" }],
            rehypePrism,
          ],
        },
      });
      setMdxSource(mdxContent);
    } catch (error) {
      console.error("Failed to serialize MDX:", error);
    }
  };

  const loadPost = async () => {
    try {
      const response = await postAPI.getBySlug(slug);
      const postData = response.data;
      setPost(postData);

      // Serialize the markdown content
      const mdxContent = await serialize(postData.content, {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: "wrap" }],
            rehypePrism,
          ],
        },
      });
      setMdxSource(mdxContent);
    } catch (error) {
      console.error("Failed to load post:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateTOC = () => {
    if (!contentRef.current) return;

    const headings = contentRef.current.querySelectorAll(
      "h1, h2, h3, h4, h5, h6",
    );
    const tocItems: TocItem[] = [];

    headings.forEach((heading, index) => {
      const id = `heading-${index}`;
      heading.id = id;
      const level = parseInt(heading.tagName.substring(1));

      tocItems.push({
        id,
        text: heading.textContent || "",
        level,
      });
    });

    setToc(tocItems);
  };

  const observeSections = () => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -80% 0px" },
    );

    const headings = contentRef.current?.querySelectorAll(
      "h1, h2, h3, h4, h5, h6",
    );
    headings?.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !newComment.trim()) return;

    try {
      await commentAPI.create({
        post: post.id,
        content: newComment,
      });
      setNewComment("");
      loadPost();
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const shareToTwitter = () => {
    if (!post) return;
    const text = `${post.title}`;
    const url = window.location.href;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text,
      )}&url=${encodeURIComponent(url)}`,
      "_blank",
      "width=550,height=420",
    );
  };

  const shareToLinkedIn = () => {
    const url = window.location.href;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url,
      )}`,
      "_blank",
      "width=550,height=420",
    );
  };

  const shareToFacebook = () => {
    const url = window.location.href;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
      "width=550,height=420",
    );
  };

  const shareViaEmail = () => {
    if (!post) return;
    const subject = `Check out: ${post.title}`;
    const body = `I thought you might be interested in this article:\n\n${post.title}\n${window.location.href}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  };

  const renderComment = (comment: BlogComment) => (
    <div
      key={comment.id}
      className="border-b border-neutral-200 py-6 last:border-b-0"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="font-medium text-black text-sm">
            {comment.author.username}
          </span>
          <span className="text-xs text-neutral-500 ml-3">
            {formatDate(comment.created_at)}
          </span>
        </div>
      </div>
      <p className="text-neutral-700 font-light whitespace-pre-wrap leading-relaxed ml-11">
        {comment.content}
      </p>
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 mt-4 border-l border-neutral-200 pl-6">
          {comment.replies.map(renderComment)}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light text-black mb-4">
            Post not found
          </h2>
          <Link href="/">
            <Button
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white font-light rounded-none"
            >
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Generate SEO data
  const pageTitle = `${post.title} | BitsBlog`;
  const pageDescription = truncateText(
    post.excerpt || stripHtml(post.content),
    155,
  );
  const pageUrl = getAbsoluteUrl(`/post/${post.slug}`);

  // Ensure we ALWAYS have an image URL (fixes the OG warning)
  const imageUrl = post.featured_image
    ? getAbsoluteUrl(post.featured_image)
    : "https://blog.ctrlbits.com/og-default.jpg"; // Fallback to absolute URL

  const keywords = post.tags.map((tag) => tag.name).join(", ");
  const publishedDate = new Date(
    post.published_at || post.created_at,
  ).toISOString();
  const modifiedDate = new Date(
    post.updated_at || post.created_at,
  ).toISOString();

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
        name: "Articles",
        item: getAbsoluteUrl("/articles"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: pageUrl,
      },
    ],
  };

  // Article structured data
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: pageDescription,
    image: imageUrl,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      "@type": "Person",
      name: post.author.username,
      url: getAbsoluteUrl(`/profile/${post.author.username}`),
    },
    publisher: {
      "@type": "Organization",
      name: "Ctrl Bits",
      logo: {
        "@type": "ImageObject",
        url: getAbsoluteUrl("/logo.png"),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    keywords: keywords,
    articleSection: post.category?.name,
    wordCount: post.content.split(/\s+/).length,
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Header Banner Ad */}
        <div className="border-b border-neutral-200 bg-neutral-50 py-2 sm:py-3 overflow-hidden flex justify-center">
          <div
            className="px-4 sm:px-6 w-full flex justify-center"
            style={{ maxWidth: "100%" }}
          >
            <div
              style={{
                maxWidth: "100%",
                transform: "scale(min(1, 100vw / 728))",
                transformOrigin: "top center",
              }}
            >
              <AdComponent
                placement="header_banner"
                postSlug={post.slug}
                className="h-auto"
              />
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 max-w-7xl">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-neutral-600 hover:text-black font-light transition-colors"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              Back to articles
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
            {/* Main Content */}
            <article className="flex-1 w-full lg:max-w-3xl">
              {/* Featured Image */}
              {post.featured_image && (
                <div
                  className="mb-8 sm:mb-12 bg-neutral-100 overflow-hidden relative w-full"
                  style={{ aspectRatio: "2400 / 1260" }}
                >
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, (max-width: 1280px) 800px, 900px"
                  />
                </div>
              )}

              {/* Meta Info */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                  {post.category && (
                    <Link
                      href={`/categories/${post.category.slug}`}
                      className="text-xs font-medium text-black uppercase tracking-wider border border-neutral-300 px-2 sm:px-3 py-1 hover:bg-black hover:text-white transition-colors"
                    >
                      {post.category.name}
                    </Link>
                  )}
                  {post.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tags/${tag.slug}`}
                      className="text-xs text-neutral-500 border border-neutral-300 px-2 sm:px-3 py-1 hover:border-black hover:text-black transition-colors"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-black mb-4 sm:mb-8 leading-tight">
                  {post.title}
                </h1>

                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">
                  <Link
                    href={`/profile/${post.author.username}`}
                    className="flex items-center gap-2 hover:text-black transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span className="font-medium">{post.author.username}</span>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(post.published_at || post.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{post.views} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.comments_count} comments</span>
                  </div>
                </div>

                {/* Action Buttons - Save & Share */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <SavePostButton
                    postId={post.id}
                    postSlug={post.slug}
                    variant="outline"
                    size="default"
                    showText={true}
                    className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-9 sm:h-10 text-xs sm:text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setShareDialogOpen(true)}
                    className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-9 sm:h-10 text-xs sm:text-sm"
                  >
                    <Share2 className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </div>
              </div>

              <div className="w-full h-px bg-neutral-200 my-6 sm:my-12"></div>

              {/* In-Content Top Ad */}
              <div className="my-6 sm:my-12 overflow-hidden flex justify-center w-full">
                <div
                  className="w-full sm:w-auto px-4 sm:px-0"
                  style={{ maxWidth: "100%" }}
                >
                  <div
                    style={{
                      maxWidth: "100%",
                      transform: "scale(min(1, 100vw / 728))",
                      transformOrigin: "top center",
                    }}
                  >
                    <AdComponent
                      placement="in_content_top"
                      postSlug={post.slug}
                    />
                  </div>
                </div>
              </div>

              {/* Markdown Content */}
              <div
                ref={contentRef}
                className="font-inter prose prose-neutral prose-sm sm:prose-base lg:prose-lg max-w-none mb-12 sm:mb-16 
                  prose-headings:text-black prose-headings:tracking-tight prose-headings:font-inter
                  prose-h1:font-light prose-h1:mb-6 sm:prose-h1:mb-10 prose-h1:mt-8 sm:prose-h1:mt-16 prose-h1:leading-tight prose-h1:border-b prose-h1:border-neutral-200 prose-h1:pb-3 sm:prose-h1:pb-6
                  prose-h2:font-light prose-h2:mb-4 sm:prose-h2:mb-8 prose-h2:mt-6 sm:prose-h2:mt-14 prose-h2:leading-tight prose-h2:border-b prose-h2:border-neutral-200 prose-h2:pb-2 sm:prose-h2:pb-4
                  prose-h3:font-light prose-h3:mb-3 sm:prose-h3:mb-6 prose-h3:mt-4 sm:prose-h3:mt-12 prose-h3:leading-tight
                  prose-h4:font-normal prose-h4:mb-2 sm:prose-h4:mb-5 prose-h4:mt-4 sm:prose-h4:mt-10
                  prose-h5:font-normal prose-h5:mb-2 sm:prose-h5:mb-4 prose-h5:mt-3 sm:prose-h5:mt-8
                  prose-h6:font-normal prose-h6:mb-2 sm:prose-h6:mb-3 prose-h6:mt-2 sm:prose-h6:mt-6
                  prose-p:text-neutral-700 prose-p:leading-relaxed prose-p:mb-4 sm:prose-p:mb-6 prose-p:font-light
                  prose-a:text-black prose-a:underline prose-a:underline-offset-4 prose-a:decoration-1 hover:prose-a:decoration-2
                  prose-strong:text-black prose-strong:font-semibold
                  prose-code:text-black prose-code:bg-neutral-100 prose-code:px-2 prose-code:py-1 prose-code:rounded-none prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']
                  prose-pre:bg-neutral-900 prose-pre:text-neutral-100 prose-pre:rounded-none prose-pre:border prose-pre:border-neutral-800 prose-pre:p-3 sm:prose-pre:p-4 prose-pre:overflow-x-auto
                  prose-blockquote:border-l-4 prose-blockquote:border-black prose-blockquote:pl-3 sm:prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-neutral-600 prose-blockquote:font-light prose-blockquote:my-4 sm:prose-blockquote:my-6
                  prose-ul:my-4 sm:prose-ul:my-6 prose-ul:list-disc prose-ul:pl-4 sm:prose-ul:pl-6
                  prose-ol:my-4 sm:prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-4 sm:prose-ol:pl-6
                  prose-li:text-neutral-700 prose-li:leading-relaxed prose-li:font-light prose-li:my-1 sm:prose-li:my-2
                  prose-img:rounded-none prose-img:border prose-img:border-neutral-200 prose-img:my-4 sm:prose-img:my-8
                  prose-hr:border-neutral-200 prose-hr:my-6 sm:prose-hr:my-12
                  prose-table:border-collapse prose-table:border prose-table:border-neutral-200 prose-table:w-full prose-table:text-sm
                  prose-thead:bg-neutral-50
                  prose-th:bg-neutral-100 prose-th:font-medium prose-th:text-black prose-th:border prose-th:border-neutral-200 prose-th:px-2 sm:prose-th:px-4 prose-th:py-2 sm:prose-th:py-3 prose-th:text-left
                  prose-td:border prose-td:border-neutral-200 prose-td:px-2 sm:prose-td:px-4 prose-td:py-2 sm:prose-td:py-3 prose-td:text-neutral-700"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
                  components={{
                    // Custom component for code blocks
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline ? (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    // Custom component for images
                    img({ node, ...props }: any) {
                      return (
                        <img
                          {...props}
                          loading="lazy"
                          className="rounded-none border border-neutral-200 my-8"
                        />
                      );
                    },
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* Tags at Bottom */}
              {post.tags.length > 0 && (
                <div className="my-8 sm:my-12 pt-6 sm:pt-8 border-t border-neutral-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-black"></div>
                    <span className="text-xs font-medium text-black uppercase tracking-wider">
                      Tags
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/tags/${tag.slug}`}
                        className="text-xs text-neutral-600 border border-neutral-300 px-3 py-2 hover:bg-black hover:text-white hover:border-black transition-colors font-light"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* In-Content Bottom Ad */}
              <div className="my-6 sm:my-12 overflow-hidden flex justify-center w-full">
                <div
                  className="w-full sm:w-auto px-4 sm:px-0"
                  style={{ maxWidth: "100%" }}
                >
                  <div
                    style={{
                      maxWidth: "100%",
                      transform: "scale(min(1, 100vw / 728))",
                      transformOrigin: "top center",
                    }}
                  >
                    <AdComponent
                      placement="in_content_bottom"
                      postSlug={post.slug}
                    />
                  </div>
                </div>
              </div>
            </article>

            {/* Sidebar with TOC and Ads */}
            <aside className="hidden lg:block w-80 shrink-0">
              <div className="sticky top-24 space-y-6 lg:space-y-8">
                {/* Sidebar Top Ad (300×250) */}
                <div className="flex justify-center">
                  <AdComponent placement="sidebar_top" postSlug={post.slug} />
                </div>

                {/* Table of Contents */}
                {toc.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1 h-6 bg-black"></div>
                      <span className="text-xs font-medium text-black uppercase tracking-wider">
                        Table of Contents
                      </span>
                    </div>
                    <nav className="space-y-1">
                      {toc.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className={`
                            block w-full text-left text-sm font-light transition-colors
                            ${
                              item.level === 1
                                ? "pl-0"
                                : `pl-${(item.level - 1) * 4}`
                            }
                            ${
                              activeSection === item.id
                                ? "text-black font-medium border-l-2 border-black pl-4"
                                : "text-neutral-500 hover:text-black border-l-2 border-transparent pl-4 hover:border-neutral-300"
                            }
                            py-2
                          `}
                        >
                          {item.text}
                        </button>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Sidebar Middle Ad */}
                <div className="flex justify-center">
                  <AdComponent
                    placement="sidebar_middle"
                    postSlug={post.slug}
                  />
                </div>

                {/* Sidebar Bottom Ad */}
                <div className="flex justify-center">
                  <AdComponent
                    placement="sidebar_bottom"
                    postSlug={post.slug}
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Before Comments Ad */}
        <div className="border-t border-neutral-200 bg-neutral-50 py-4 sm:py-8 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl flex justify-center w-full">
            <div className="w-full sm:w-auto" style={{ maxWidth: "100%" }}>
              <div
                style={{
                  maxWidth: "100%",
                  transform: "scale(min(1, 100vw / 728))",
                  transformOrigin: "top center",
                }}
              >
                <AdComponent placement="before_comments" postSlug={post.slug} />
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="border-t border-neutral-200 bg-neutral-50">
          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16 max-w-3xl">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-1 h-6 sm:h-8 bg-black"></div>
              <h2 className="text-2xl sm:text-3xl font-light text-black">
                Comments {post.comments_count > 0 && `(${post.comments_count})`}
              </h2>
            </div>

            {isAuthenticated ? (
              <form onSubmit={handleCommentSubmit} className="mb-8 sm:mb-12">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-3 sm:mb-4 border-neutral-300 focus:border-black rounded-none min-h-[100px] sm:min-h-[120px] font-light resize-none text-sm"
                  rows={4}
                />
                <Button
                  type="submit"
                  className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-9 sm:h-10 px-4 sm:px-6 text-sm"
                >
                  Post Comment
                </Button>
              </form>
            ) : (
              <div className="mb-8 sm:mb-12 p-4 sm:p-6 border border-neutral-200 bg-white">
                <p className="text-neutral-600 font-light mb-4 text-sm">
                  Please log in to join the conversation
                </p>
                <Link href="/login">
                  <Button className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-9 sm:h-10 px-4 sm:px-6 text-sm">
                    Login to Comment
                  </Button>
                </Link>
              </div>
            )}

            <div className="bg-white border border-neutral-200 p-4 sm:p-6">
              {post.comments && post.comments.length > 0 ? (
                <div>{post.comments.map(renderComment)}</div>
              ) : (
                <p className="text-center text-neutral-500 font-light py-6 sm:py-8 text-sm">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Ad */}
        <div className="border-t border-neutral-200 py-4 sm:py-8 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl flex justify-center w-full">
            <div className="w-full sm:w-auto" style={{ maxWidth: "100%" }}>
              <div
                style={{
                  maxWidth: "100%",
                  transform: "scale(min(1, 100vw / 728))",
                  transformOrigin: "top center",
                }}
              >
                <AdComponent placement="footer" postSlug={post.slug} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-none border-neutral-200 mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-light text-black">
              Share Article
            </DialogTitle>
            <DialogDescription className="text-neutral-600 font-light pt-2 text-xs sm:text-sm">
              Share this article with your network
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-4">
            {/* Copy Link */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={
                  typeof window !== "undefined" ? window.location.href : ""
                }
                readOnly
                className="flex-1 px-3 py-2 border border-neutral-300 text-xs sm:text-sm text-neutral-600 font-light rounded-none"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="border-neutral-300 hover:border-black rounded-none h-9 sm:h-10 w-9 sm:w-10 p-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {copied && (
              <p className="text-xs sm:text-sm text-green-600 font-light">
                Link copied to clipboard!
              </p>
            )}

            {/* Social Share Buttons */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2 sm:pt-4">
              <Button
                onClick={shareToTwitter}
                variant="outline"
                className="border-neutral-300 hover:border-black hover:bg-neutral-50 font-light rounded-none h-10 sm:h-12 text-xs sm:text-sm justify-start"
              >
                <Twitter className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Twitter</span>
                <span className="sm:hidden">X</span>
              </Button>

              <Button
                onClick={shareToLinkedIn}
                variant="outline"
                className="border-neutral-300 hover:border-black hover:bg-neutral-50 font-light rounded-none h-10 sm:h-12 text-xs sm:text-sm justify-start"
              >
                <Linkedin className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">LinkedIn</span>
                <span className="sm:hidden">In</span>
              </Button>

              <Button
                onClick={shareToFacebook}
                variant="outline"
                className="border-neutral-300 hover:border-black hover:bg-neutral-50 font-light rounded-none h-10 sm:h-12 text-xs sm:text-sm justify-start"
              >
                <Facebook className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Facebook</span>
                <span className="sm:hidden">FB</span>
              </Button>

              <Button
                onClick={shareViaEmail}
                variant="outline"
                className="border-neutral-300 hover:border-black hover:bg-neutral-50 font-light rounded-none h-10 sm:h-12 text-xs sm:text-sm justify-start"
              >
                <Mail className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Email</span>
                <span className="sm:hidden">📧</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
