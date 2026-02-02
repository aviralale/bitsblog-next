"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { postAPI, categoryAPI, tagAPI } from "@/api/services";
import { type Category, type Tag } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import SearchableTagsInput from "@/components/SearchableTagsInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Edit3,
  ArrowLeft,
  Save,
  Bold,
  Italic,
  Code,
  Link2,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import AdminRoute from "@/components/AdminRoute";

export default function EditPostPage() {
  const params = useParams<{ slug: string }>();
  const slugStr = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // State for the featured image - this can be either a File object (new upload) or a string (existing URL)
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category_id: "",
    tag_ids: [] as number[],
    status: "draft",
  });

  useEffect(() => {
    loadMetadata();
    if (slugStr) {
      loadPost();
    }
  }, [slugStr]);

  const loadMetadata = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        categoryAPI.getAll(),
        tagAPI.getAll(),
      ]);
      const rawCategories: any = categoriesRes.data;
      const rawTags: any = tagsRes.data;

      const categoriesData: Category[] = Array.isArray(rawCategories)
        ? rawCategories
        : (rawCategories && (rawCategories.results ?? rawCategories.items)) ||
          [];

      const tagsData: Tag[] = Array.isArray(rawTags)
        ? rawTags
        : (rawTags && (rawTags.results ?? rawTags.items)) || [];

      setCategories(categoriesData);
      setTags(tagsData);
    } catch (error) {
      console.error("Failed to load metadata:", error);
    }
  };

  const loadPost = async () => {
    try {
      const response = await postAPI.getBySlug(slugStr!);
      const post = response.data;
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || "",
        category_id: post.category?.id.toString() || "",
        tag_ids: post.tags.map((t) => t.id),
        status: post.status,
      });

      // If the post has a featured image, set the preview URL
      // The backend returns the full URL or relative path to the image
      if (post.featured_image) {
        setFeaturedImagePreview(post.featured_image);
      }
    } catch (error) {
      console.error("Failed to load post:", error);
    }
  };

  /**
   * Handles file selection for the featured image.
   * When a user selects an image file, we:
   * 1. Store the File object to upload later
   * 2. Create a local preview URL so the user can see what they selected
   */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate that it's an image file
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Store the file for later upload
      setFeaturedImage(file);

      // Create a preview URL using the browser's FileReader API
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeaturedImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Removes the selected featured image, clearing both the file and preview
   */
  const handleRemoveImage = () => {
    setFeaturedImage(null);
    setFeaturedImagePreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      /**
       * IMPORTANT FIX FOR FILE UPLOADS AND TAG_IDS:
       *
       * There are two key issues we're fixing here:
       *
       * 1. File Upload Issue:
       *    Django REST Framework expects files to be sent as multipart/form-data.
       *    When you create a FormData object and append a File to it, the browser
       *    automatically sets the Content-Type header to multipart/form-data with
       *    the correct boundary parameter. However, if Axios or your API service
       *    tries to manually set the Content-Type to application/json, it breaks
       *    the file upload.
       *
       * 2. Tag IDs Issue:
       *    Django REST Framework's ManyToManyField serializer expects tag_ids to be
       *    sent as a JSON array when using application/json, OR as multiple separate
       *    form fields when using multipart/form-data. The error "Expected pk value,
       *    received list" means we were sending the array incorrectly.
       *
       * The solution is to properly format the FormData:
       * - For simple fields: append them directly
       * - For the tags array: append each tag ID with the SAME field name multiple times
       *   Example: tag_ids=1&tag_ids=2&tag_ids=3
       *   This is how HTML forms naturally send multiple values for the same field
       */

      const formDataToSend = new FormData();

      // Add all the simple text fields to the FormData
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("excerpt", formData.excerpt);
      formDataToSend.append("status", formData.status);

      // Only add category_id if one is selected
      if (formData.category_id) {
        formDataToSend.append("category_id", formData.category_id);
      }

      /**
       * CRITICAL FIX: How to send tag_ids correctly
       *
       * Django REST Framework expects many-to-many relationships in FormData
       * to be sent as multiple form fields with the SAME name, not as a JSON array.
       *
       * WRONG way (what was causing the error):
       * formDataToSend.append("tag_ids", JSON.stringify([1, 2, 3]))
       * or:
       * formDataToSend.append("tag_ids", [1, 2, 3])
       *
       * CORRECT way:
       * formDataToSend.append("tag_ids", "1")
       * formDataToSend.append("tag_ids", "2")
       * formDataToSend.append("tag_ids", "3")
       *
       * This creates a query string like: tag_ids=1&tag_ids=2&tag_ids=3
       * which Django correctly interprets as a list of integers.
       */
      formData.tag_ids.forEach((tagId) => {
        formDataToSend.append("tag_ids", tagId.toString());
      });

      /**
       * Add the featured image file if one was selected
       *
       * When you append a File object to FormData, the browser handles all
       * the encoding automatically. The Content-Type will be set to
       * multipart/form-data with a unique boundary string, and each field
       * (including the file) will be properly encoded in the request body.
       */
      if (featuredImage) {
        formDataToSend.append("featured_image", featuredImage);
      }

      /**
       * Now send the FormData to your API
       *
       * Make sure your API service (in services.ts) does NOT manually set
       * the Content-Type header when it detects FormData. Let the browser
       * handle it automatically. See the services-fix.ts file for the
       * correct implementation.
       */
      if (slugStr) {
        await postAPI.update(slugStr, formDataToSend);
      } else {
        await postAPI.create(formDataToSend);
      }

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Failed to save post:", error);

      // Better error handling to show what went wrong
      if (error.response?.data) {
        const errors = error.response.data;
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${messages}`)
          .join("\n");
        alert(`Failed to save post:\n\n${errorMessages}`);
      } else {
        alert(
          "Failed to save post. Please check your connection and try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Inserts markdown syntax at the cursor position in the textarea.
   * This helper function makes it easy to add formatting without typing markdown manually.
   */
  const insertMarkdown = (syntax: string, placeholder: string = "") => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    const replacement = selectedText || placeholder;

    let newText = "";
    let cursorPosition = start;

    switch (syntax) {
      case "bold":
        newText =
          formData.content.substring(0, start) +
          `**${replacement}**` +
          formData.content.substring(end);
        cursorPosition = start + 2 + replacement.length;
        break;
      case "italic":
        newText =
          formData.content.substring(0, start) +
          `*${replacement}*` +
          formData.content.substring(end);
        cursorPosition = start + 1 + replacement.length;
        break;
      case "code":
        newText =
          formData.content.substring(0, start) +
          `\`${replacement}\`` +
          formData.content.substring(end);
        cursorPosition = start + 1 + replacement.length;
        break;
      case "h1":
        newText =
          formData.content.substring(0, start) +
          `# ${replacement}` +
          formData.content.substring(end);
        cursorPosition = start + 2 + replacement.length;
        break;
      case "h2":
        newText =
          formData.content.substring(0, start) +
          `## ${replacement}` +
          formData.content.substring(end);
        cursorPosition = start + 3 + replacement.length;
        break;
      case "link":
        newText =
          formData.content.substring(0, start) +
          `[${replacement}](url)` +
          formData.content.substring(end);
        cursorPosition = start + replacement.length + 3;
        break;
      case "image":
        newText =
          formData.content.substring(0, start) +
          `![alt text](image-url)` +
          formData.content.substring(end);
        cursorPosition = start + 21;
        break;
      case "ul":
        newText =
          formData.content.substring(0, start) +
          `\n- ${replacement}` +
          formData.content.substring(end);
        cursorPosition = start + 3 + replacement.length;
        break;
      case "ol":
        newText =
          formData.content.substring(0, start) +
          `\n1. ${replacement}` +
          formData.content.substring(end);
        cursorPosition = start + 4 + replacement.length;
        break;
      case "quote":
        newText =
          formData.content.substring(0, start) +
          `> ${replacement}` +
          formData.content.substring(end);
        cursorPosition = start + 2 + replacement.length;
        break;
      default:
        return;
    }

    setFormData({ ...formData, content: newText });

    // Return focus to the textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-6 py-6 max-w-7xl">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-black font-light transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </button>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-black uppercase tracking-wider">
                  {slugStr ? "Edit Post" : "New Post"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-7xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title and Excerpt Section */}
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-sm font-medium text-black uppercase tracking-wider"
                    >
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                      className="border-neutral-300 focus:border-black rounded-none h-12 font-light text-lg"
                      placeholder="Enter post title..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="excerpt"
                      className="text-sm font-medium text-black uppercase tracking-wider"
                    >
                      Excerpt
                    </Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) =>
                        setFormData({ ...formData, excerpt: e.target.value })
                      }
                      rows={3}
                      maxLength={500}
                      className="border-neutral-300 focus:border-black rounded-none font-light resize-none"
                      placeholder="Brief summary of your post (max 500 characters)..."
                    />
                    <p className="text-xs text-neutral-500 font-light">
                      {formData.excerpt.length}/500 characters
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Image Section */}
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardHeader className="border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-black"></div>
                  <CardTitle className="text-lg font-medium uppercase tracking-wider">
                    Featured Image
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Image preview area */}
                  {featuredImagePreview ? (
                    <div className="relative">
                      <img
                        src={featuredImagePreview}
                        alt="Featured image preview"
                        className="w-full h-64 object-cover border border-neutral-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-2 bg-black text-white hover:bg-neutral-800 transition-colors"
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    // Upload prompt area when no image is selected
                    <div className="border-2 border-dashed border-neutral-300 rounded-none p-12 text-center hover:border-black transition-colors">
                      <Upload className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                      <p className="text-neutral-600 font-light mb-2">
                        No featured image selected
                      </p>
                      <p className="text-sm text-neutral-500 font-light">
                        Click the button below to upload an image
                      </p>
                    </div>
                  )}

                  {/* File input - hidden, triggered by button */}
                  <input
                    type="file"
                    id="featured-image-input"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  {/* Upload button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("featured-image-input")?.click()
                    }
                    className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {featuredImagePreview ? "Change Image" : "Upload Image"}
                  </Button>

                  <p className="text-xs text-neutral-500 font-light">
                    Recommended size: 1200x630px. Supported formats: JPG, PNG,
                    WebP
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardHeader className="border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-black"></div>
                    <CardTitle className="text-lg font-medium uppercase tracking-wider">
                      Content
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(false)}
                      className={`rounded-none font-light ${
                        !showPreview
                          ? "bg-black text-white border-black"
                          : "border-neutral-300 text-neutral-600 hover:border-black hover:text-black"
                      }`}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Write
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(true)}
                      className={`rounded-none font-light ${
                        showPreview
                          ? "bg-black text-white border-black"
                          : "border-neutral-300 text-neutral-600 hover:border-black hover:text-black"
                      }`}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {!showPreview ? (
                  <>
                    {/* Markdown Toolbar */}
                    <div className="border-b border-neutral-200 p-3 flex flex-wrap gap-2 bg-neutral-50">
                      <button
                        type="button"
                        onClick={() => insertMarkdown("bold", "bold text")}
                        className="p-2 hover:bg-white border border-transparent hover:border-neutral-300 transition-colors"
                        title="Bold"
                      >
                        <Bold className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("italic", "italic text")}
                        className="p-2 hover:bg-white border border-transparent hover:border-neutral-300 transition-colors"
                        title="Italic"
                      >
                        <Italic className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("code", "code")}
                        className="p-2 hover:bg-white border border-transparent hover:border-neutral-300 transition-colors"
                        title="Inline Code"
                      >
                        <Code className="h-4 w-4" />
                      </button>
                      <div className="w-px h-8 bg-neutral-300"></div>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("h1", "Heading 1")}
                        className="p-2 hover:bg-white border border-transparent hover:border-neutral-300 transition-colors"
                        title="Heading 1"
                      >
                        <Heading1 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("h2", "Heading 2")}
                        className="p-2 hover:bg-white border border-transparent hover:border-neutral-300 transition-colors"
                        title="Heading 2"
                      >
                        <Heading2 className="h-4 w-4" />
                      </button>
                      <div className="w-px h-8 bg-neutral-300"></div>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("link", "link text")}
                        className="p-2 hover:bg-white border border-transparent hover:border-neutral-300 transition-colors"
                        title="Link"
                      >
                        <Link2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("image")}
                        className="p-2 hover:bg-white border border-transparent hover:border-neutral-300 transition-colors"
                        title="Image"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </button>
                      <div className="w-px h-8 bg-neutral-300"></div>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("ul", "list item")}
                        className="p-2 hover:bg-white border border-transparent hover:border-neutral-300 transition-colors"
                        title="Bullet List"
                      >
                        <List className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("ol", "list item")}
                        className="p-2 hover:bg-white border border-transparent hover:border-neutral-300 transition-colors"
                        title="Numbered List"
                      >
                        <ListOrdered className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("quote", "quote text")}
                        className="p-2 hover:bg-white border border-transparent hover:border-neutral-300 transition-colors"
                        title="Quote"
                      >
                        <Quote className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Textarea */}
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      rows={20}
                      required
                      className="border-0 rounded-none font-mono text-sm font-light resize-none focus-visible:ring-0"
                      placeholder="Write your post content in markdown..."
                    />
                  </>
                ) : (
                  <div
                    className="p-8 prose prose-neutral max-w-none
                    prose-headings:font-light prose-headings:text-black prose-headings:tracking-tight
                    prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-12 prose-h1:border-b prose-h1:border-neutral-200 prose-h1:pb-4
                    prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-10
                    prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8
                    prose-p:text-neutral-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:font-light prose-p:text-lg
                    prose-a:text-black prose-a:underline prose-a:underline-offset-4 prose-a:decoration-1 hover:prose-a:decoration-2
                    prose-strong:text-black prose-strong:font-semibold
                    prose-code:text-black prose-code:bg-neutral-100 prose-code:px-2 prose-code:py-1 prose-code:rounded-none prose-code:font-mono prose-code:text-sm
                    prose-pre:bg-neutral-900 prose-pre:text-neutral-100 prose-pre:rounded-none prose-pre:border prose-pre:border-neutral-800
                    prose-blockquote:border-l-2 prose-blockquote:border-black prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-neutral-600
                    prose-ul:my-6 prose-ol:my-6
                    prose-li:text-neutral-700 prose-li:leading-relaxed prose-li:font-light
                    prose-img:rounded-none prose-img:border prose-img:border-neutral-200
                    prose-hr:border-neutral-200 prose-hr:my-12
                    prose-table:border prose-table:border-neutral-200
                    prose-th:bg-neutral-100 prose-th:font-medium prose-th:text-black prose-th:border prose-th:border-neutral-200 prose-th:px-4 prose-th:py-2
                    prose-td:border prose-td:border-neutral-200 prose-td:px-4 prose-td:py-2
                    min-h-[500px]"
                  >
                    {formData.content ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, rehypeSanitize]}
                      >
                        {formData.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-neutral-400 font-light">
                        Preview will appear here...
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardHeader className="border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-black"></div>
                  <CardTitle className="text-lg font-medium uppercase tracking-wider">
                    Post Settings
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="category"
                        className="text-sm font-medium text-black uppercase tracking-wider"
                      >
                        Category
                      </Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category_id: value })
                        }
                      >
                        <SelectTrigger className="border-neutral-300 focus:border-black rounded-none h-12 font-light">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="status"
                        className="text-sm font-medium text-black uppercase tracking-wider"
                      >
                        Status
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger className="border-neutral-300 focus:border-black rounded-none h-12 font-light">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-neutral-500 font-light">
                        Publishing will set the published date automatically
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-black uppercase tracking-wider">
                      Tags
                    </Label>
                    <SearchableTagsInput
                      selectedTags={formData.tag_ids}
                      onTagsChange={(tagIds) =>
                        setFormData({ ...formData, tag_ids: tagIds })
                      }
                      onSearch={async (query) => {
                        try {
                          const response = await tagAPI.search(query);
                          const rawData: any = response.data;
                          // Handle different response formats from the API
                          const tagsArray: Tag[] = Array.isArray(rawData)
                            ? rawData
                            : (rawData && (rawData.results ?? rawData.items)) ||
                              [];
                          return tagsArray;
                        } catch (error) {
                          console.error("Failed to search tags:", error);
                          return [];
                        }
                      }}
                      placeholder="Search and select tags..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 justify-end border-t border-neutral-200 pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-12 px-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {slugStr ? "Update Post" : "Create Post"}
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminRoute>
  );
}
