"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Video as VideoIcon,
  Code,
  X,
  AlertCircle,
  CheckCircle2,
  Info,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import AdminRoute from "@/components/AdminRoute";

interface AdPlacement {
  value: string;
  label: string;
  description: string;
  recommendedSize?: string;
}

const AD_PLACEMENTS: AdPlacement[] = [
  {
    value: "header_banner",
    label: "Header Banner",
    description: "Top of the page, high visibility",
    recommendedSize: "728×90px or 970×250px",
  },
  {
    value: "sidebar_top",
    label: "Sidebar Top",
    description: "Top of sidebar, persistent",
    recommendedSize: "300×250px",
  },
  {
    value: "sidebar_middle",
    label: "Sidebar Middle",
    description: "Middle sidebar position",
    recommendedSize: "300×250px or 300×600px",
  },
  {
    value: "sidebar_bottom",
    label: "Sidebar Bottom",
    description: "Bottom of sidebar",
    recommendedSize: "300×250px",
  },
  {
    value: "in_content_top",
    label: "In Content Top",
    description: "After first paragraph",
    recommendedSize: "728×90px or 300×250px",
  },
  {
    value: "in_content_middle",
    label: "In Content Middle",
    description: "Middle of content",
    recommendedSize: "728×90px or 300×250px",
  },
  {
    value: "in_content_bottom",
    label: "In Content Bottom",
    description: "End of content",
    recommendedSize: "728×90px or 300×250px",
  },
  {
    value: "before_comments",
    label: "Before Comments",
    description: "Above comment section",
    recommendedSize: "728×90px",
  },
  {
    value: "footer",
    label: "Footer",
    description: "Bottom of page",
    recommendedSize: "728×90px",
  },
];

const AdCreation = () => {
  const params = useParams<{ slug: string }>();
  const slugStr = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const router = useRouter();
  const { user } = useAuth();
  const isEdit = Boolean(slugStr);

  // Form state
  const [title, setTitle] = useState("");
  const [adType, setAdType] = useState<"image" | "video" | "html">("image");
  const [placement, setPlacement] = useState("");
  const [priority, setPriority] = useState("50");
  const [linkUrl, setLinkUrl] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(true);
  const [status, setStatus] = useState<"draft" | "active" | "paused">("draft");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Image ad fields
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageAlt, setImageAlt] = useState("");

  // Video ad fields
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

  // HTML ad fields
  const [htmlContent, setHtmlContent] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (!user?.is_staff) {
      router.push("/");
    }
    if (isEdit && slugStr) {
      loadAd();
    }
  }, [user, router, isEdit, slugStr]);

  const loadAd = async () => {
    if (!slugStr) return;
    setLoading(true);
    try {
      const response = await api.get(`/api/ads/${slugStr}/`);
      const ad = response.data;

      setTitle(ad.title);
      setAdType(ad.ad_type);
      setPlacement(ad.placement);
      setPriority(ad.priority.toString());
      setLinkUrl(ad.link_url);
      setCtaText(ad.cta_text || "");
      setOpenInNewTab(ad.open_in_new_tab);
      setStatus(ad.status);

      if (ad.start_date) setStartDate(ad.start_date.split("T")[0]);
      if (ad.end_date) setEndDate(ad.end_date.split("T")[0]);

      if (ad.ad_type === "image") {
        setImagePreview(ad.image || "");
        setImageAlt(ad.image_alt || "");
      } else if (ad.ad_type === "video") {
        setVideoUrl(ad.video_url || "");
        setThumbnailPreview(ad.video_thumbnail || "");
      } else if (ad.ad_type === "html") {
        setHtmlContent(ad.html_content || "");
      }
    } catch (error) {
      console.error("Failed to load ad:", error);
      alert("Failed to load advertisement");
      router.push("/dashboard?tab=ads");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 200 * 1024) {
      setErrors({ ...errors, image: "Image must be less than 200KB" });
      return;
    }

    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      setErrors({ ...errors, image: "Only JPG and PNG files are allowed" });
      return;
    }

    setImageFile(file);
    setErrors({ ...errors, image: "" });

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      setErrors({ ...errors, thumbnail: "Thumbnail must be less than 500KB" });
      return;
    }

    setThumbnailFile(file);
    setErrors({ ...errors, thumbnail: "" });

    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview("");
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!placement) {
      newErrors.placement = "Placement is required";
    }

    if (!linkUrl.trim()) {
      newErrors.linkUrl = "Link URL is required";
    } else {
      try {
        new URL(linkUrl);
      } catch {
        newErrors.linkUrl = "Please enter a valid URL";
      }
    }

    if (adType === "image" && !imageFile && !imagePreview) {
      newErrors.image = "Image is required for image ads";
    }

    if (adType === "video" && !videoUrl.trim()) {
      newErrors.videoUrl = "Video URL is required for video ads";
    }

    if (adType === "html" && !htmlContent.trim()) {
      newErrors.htmlContent = "HTML content is required for HTML ads";
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setActiveTab("basic");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("ad_type", adType);
      formData.append("placement", placement);
      formData.append("priority", priority);
      formData.append("link_url", linkUrl);
      formData.append("cta_text", ctaText);
      formData.append("open_in_new_tab", openInNewTab.toString());
      formData.append("status", status);

      if (startDate)
        formData.append("start_date", new Date(startDate).toISOString());
      if (endDate) formData.append("end_date", new Date(endDate).toISOString());

      if (adType === "image") {
        if (imageFile) formData.append("image", imageFile);
        formData.append("image_alt", imageAlt);
      } else if (adType === "video") {
        formData.append("video_url", videoUrl);
        if (thumbnailFile) formData.append("video_thumbnail", thumbnailFile);
      } else if (adType === "html") {
        formData.append("html_content", htmlContent);
      }

      if (isEdit && slugStr) {
        await api.patch(`/api/ads/${slugStr}/`, formData);
      } else {
        await api.post("/api/ads/", formData);
      }

      router.push("/dashboard?tab=ads");
    } catch (error: any) {
      console.error("Failed to save ad:", error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        alert("Failed to save advertisement. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminRoute>
    );
  }

  if (!user?.is_staff) {
    return null;
  }

  const selectedPlacement = AD_PLACEMENTS.find((p) => p.value === placement);

  // Generate page title and description
  const pageTitle = isEdit
    ? `Edit ${title || "Advertisement"} | BitsBlog Admin`
    : "Create New Advertisement | BitsBlog Admin";
  const pageDescription = isEdit
    ? `Edit advertisement: ${title}. ${adType} ad for ${
        selectedPlacement?.label || "placement"
      }.`
    : "Create a new advertisement campaign for your blog. Set up image, video, or HTML ads with custom placements and targeting.";

  return (
    <AdminRoute>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-6 py-8 max-w-6xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard?tab=ads">
                  <Button
                    variant="ghost"
                    className="hover:bg-neutral-100 rounded-none h-10 w-10 p-0"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-light text-black">
                    {isEdit ? "Edit Advertisement" : "Create Advertisement"}
                  </h1>
                  <p className="text-sm text-neutral-500 mt-1">
                    {isEdit
                      ? "Update advertisement details"
                      : "Set up a new advertisement campaign"}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-10 px-6"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Advertisement"}
              </Button>
            </div>
          </div>
        </div>

        {/* Content - keeping all the existing form content exactly as is */}
        <div className="container mx-auto px-6 py-12 max-w-6xl">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-8"
          >
            <TabsList className="inline-flex h-12 items-center justify-center rounded-none bg-neutral-100 p-1 text-neutral-500">
              <TabsTrigger
                value="basic"
                className="rounded-none px-6 py-2 text-sm font-light data-[state=active]:bg-black data-[state=active]:text-white"
              >
                <Info className="h-4 w-4 mr-2" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="rounded-none px-6 py-2 text-sm font-light data-[state=active]:bg-black data-[state=active]:text-white"
              >
                {adType === "image" ? (
                  <ImageIcon className="h-4 w-4 mr-2" />
                ) : adType === "video" ? (
                  <VideoIcon className="h-4 w-4 mr-2" />
                ) : (
                  <Code className="h-4 w-4 mr-2" />
                )}
                Ad Content
              </TabsTrigger>
              <TabsTrigger
                value="guidelines"
                className="rounded-none px-6 py-2 text-sm font-light data-[state=active]:bg-black data-[state=active]:text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Guidelines
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Form Fields */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Advertisement Title *
                    </label>
                    <Input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Summer Sale Banner"
                      className="border-neutral-300 focus:border-black rounded-none h-12 font-light"
                    />
                    {errors.title && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.title}
                      </p>
                    )}
                    <p className="text-xs text-neutral-500 mt-1">
                      Internal name for this advertisement
                    </p>
                  </div>

                  {/* Ad Type */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Ad Type *
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() => setAdType("image")}
                        className={`p-4 border-2 transition-colors ${
                          adType === "image"
                            ? "border-black bg-black text-white"
                            : "border-neutral-300 hover:border-black"
                        }`}
                      >
                        <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                        <span className="text-sm font-medium">Image</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdType("video")}
                        className={`p-4 border-2 transition-colors ${
                          adType === "video"
                            ? "border-black bg-black text-white"
                            : "border-neutral-300 hover:border-black"
                        }`}
                      >
                        <VideoIcon className="h-8 w-8 mx-auto mb-2" />
                        <span className="text-sm font-medium">Video</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdType("html")}
                        className={`p-4 border-2 transition-colors ${
                          adType === "html"
                            ? "border-black bg-black text-white"
                            : "border-neutral-300 hover:border-black"
                        }`}
                      >
                        <Code className="h-8 w-8 mx-auto mb-2" />
                        <span className="text-sm font-medium">HTML</span>
                      </button>
                    </div>
                  </div>

                  {/* Placement */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Ad Placement *
                    </label>
                    <Select value={placement} onValueChange={setPlacement}>
                      <SelectTrigger className="border-neutral-300 focus:border-black rounded-none h-12 font-light">
                        <SelectValue placeholder="Select placement" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none">
                        {AD_PLACEMENTS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            <div>
                              <div className="font-medium">{p.label}</div>
                              <div className="text-xs text-neutral-500">
                                {p.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.placement && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.placement}
                      </p>
                    )}
                    {selectedPlacement?.recommendedSize && (
                      <p className="text-xs text-neutral-500 mt-1">
                        Recommended size: {selectedPlacement.recommendedSize}
                      </p>
                    )}
                  </div>

                  {/* Link URL */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Link URL *
                    </label>
                    <Input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="border-neutral-300 focus:border-black rounded-none h-12 font-light"
                    />
                    {errors.linkUrl && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.linkUrl}
                      </p>
                    )}
                    <p className="text-xs text-neutral-500 mt-1">
                      Where the ad should link to when clicked
                    </p>
                  </div>

                  {/* CTA Text */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Call-to-Action Text
                    </label>
                    <Input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="e.g., Learn More, Shop Now"
                      className="border-neutral-300 focus:border-black rounded-none h-12 font-light"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      Optional button text (for supported ad types)
                    </p>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Priority (0-100)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="border-neutral-300 focus:border-black rounded-none h-12 font-light"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      Higher priority ads show first (default: 50)
                    </p>
                  </div>
                </div>

                {/* Right Column - Settings */}
                <div className="space-y-6">
                  {/* Status */}
                  <Card className="border-neutral-200 rounded-none shadow-none">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium uppercase tracking-wider">
                        Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select
                        value={status}
                        onValueChange={(v: any) => setStatus(v)}
                      >
                        <SelectTrigger className="border-neutral-300 focus:border-black rounded-none h-10 font-light">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Schedule */}
                  <Card className="border-neutral-200 rounded-none shadow-none">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium uppercase tracking-wider">
                        Schedule
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Optional start and end dates
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-xs text-neutral-600 mb-1">
                          Start Date
                        </label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="border-neutral-300 focus:border-black rounded-none h-10 font-light"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-600 mb-1">
                          End Date
                        </label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="border-neutral-300 focus:border-black rounded-none h-10 font-light"
                        />
                        {errors.endDate && (
                          <p className="text-red-600 text-xs mt-1">
                            {errors.endDate}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Settings */}
                  <Card className="border-neutral-200 rounded-none shadow-none">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium uppercase tracking-wider">
                        Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={openInNewTab}
                          onChange={(e) => setOpenInNewTab(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Open link in new tab</span>
                      </label>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Ad Content Tab */}
            <TabsContent value="content" className="space-y-6">
              {adType === "image" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Ad Image *
                    </label>
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full border border-neutral-200"
                        />
                        <button
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-black text-white p-2 hover:bg-neutral-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-neutral-300 hover:border-black cursor-pointer transition-colors">
                        <ImageIcon className="h-12 w-12 text-neutral-400 mb-2" />
                        <span className="text-sm text-neutral-500 font-light">
                          Click to upload image
                        </span>
                        <span className="text-xs text-neutral-400 mt-1">
                          JPG or PNG, max 200KB
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                    {errors.image && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.image}
                      </p>
                    )}

                    {/* Alt Text */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-black mb-2">
                        Alt Text
                      </label>
                      <Input
                        type="text"
                        value={imageAlt}
                        onChange={(e) => setImageAlt(e.target.value)}
                        placeholder="Describe the image"
                        className="border-neutral-300 focus:border-black rounded-none h-10 font-light"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        For accessibility and SEO
                      </p>
                    </div>
                  </div>

                  {/* Image Guidelines */}
                  <Card className="border-neutral-200 rounded-none shadow-none">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium uppercase tracking-wider">
                        Image Ad Guidelines
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-black mb-2">
                          Recommended Dimensions:
                        </h4>
                        <ul className="text-xs text-neutral-600 space-y-1">
                          <li>• Sidebar: 300×250px or 300×600px</li>
                          <li>• Banner: 728×90px or 970×250px</li>
                          <li>• Mobile: 320×50px or 320×100px</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-black mb-2">
                          File Requirements:
                        </h4>
                        <ul className="text-xs text-neutral-600 space-y-1">
                          <li>• Format: JPG or PNG</li>
                          <li>• Max size: 200KB</li>
                          <li>• 2x resolution for retina (optional)</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-black mb-2">
                          Design Tips:
                        </h4>
                        <ul className="text-xs text-neutral-600 space-y-1">
                          <li>✓ Clear, readable text</li>
                          <li>✓ Single focal point</li>
                          <li>✓ Brand colors</li>
                          <li>✓ Strong CTA button</li>
                          <li>✗ No misleading content</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {adType === "video" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {/* Video URL */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Video URL *
                      </label>
                      <Input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://example.com/video.mp4"
                        className="border-neutral-300 focus:border-black rounded-none h-12 font-light"
                      />
                      {errors.videoUrl && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.videoUrl}
                        </p>
                      )}
                      <p className="text-xs text-neutral-500 mt-1">
                        Direct link to MP4 or WebM file, or YouTube/Vimeo embed
                        URL
                      </p>
                    </div>

                    {/* Thumbnail */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Video Thumbnail
                      </label>
                      {thumbnailPreview ? (
                        <div className="relative">
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail"
                            className="w-full border border-neutral-200"
                          />
                          <button
                            onClick={removeThumbnail}
                            className="absolute top-2 right-2 bg-black text-white p-2 hover:bg-neutral-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-neutral-300 hover:border-black cursor-pointer transition-colors">
                          <VideoIcon className="h-12 w-12 text-neutral-400 mb-2" />
                          <span className="text-sm text-neutral-500 font-light">
                            Click to upload thumbnail
                          </span>
                          <span className="text-xs text-neutral-400 mt-1">
                            Max 500KB
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleThumbnailChange}
                          />
                        </label>
                      )}
                      {errors.thumbnail && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.thumbnail}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Video Guidelines */}
                  <Card className="border-neutral-200 rounded-none shadow-none">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium uppercase tracking-wider">
                        Video Ad Guidelines
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-black mb-2">
                          Specifications:
                        </h4>
                        <ul className="text-xs text-neutral-600 space-y-1">
                          <li>• Format: MP4 or WebM</li>
                          <li>• Resolution: 720p or 1080p</li>
                          <li>• Aspect Ratio: 16:9</li>
                          <li>• Max Duration: 30 seconds</li>
                          <li>• Max File Size: 50MB</li>
                          <li>• No auto-play sound</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-black mb-2">
                          Design Tips:
                        </h4>
                        <ul className="text-xs text-neutral-600 space-y-1">
                          <li>✓ Hook in first 3 seconds</li>
                          <li>✓ Clear product benefit</li>
                          <li>✓ End screen with CTA</li>
                          <li>✓ Thumbnail matches video</li>
                          <li>✓ Subtitles for silent viewing</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {adType === "html" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      HTML/Script Code *
                    </label>
                    <Textarea
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      placeholder='<div class="ad">
  <!-- Your ad code here -->
  <script async src="..."></script>
</div>'
                      className="border-neutral-300 focus:border-black rounded-none font-mono text-xs min-h-[400px]"
                    />
                    {errors.htmlContent && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.htmlContent}
                      </p>
                    )}
                    <p className="text-xs text-neutral-500 mt-2">
                      Paste your ad network code (Google AdSense, etc.)
                    </p>
                  </div>

                  {/* HTML Guidelines */}
                  <Card className="border-neutral-200 rounded-none shadow-none">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium uppercase tracking-wider">
                        HTML Ad Guidelines
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-black mb-2">
                          Best Practices:
                        </h4>
                        <ul className="text-xs text-neutral-600 space-y-1">
                          <li>✓ Test before deploying</li>
                          <li>✓ Ensure responsive</li>
                          <li>✗ No malicious scripts</li>
                          <li>✓ Follow ad network guidelines</li>
                          <li>✓ Monitor performance</li>
                        </ul>
                      </div>

                      <Alert className="border-amber-500 bg-amber-50 rounded-none">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-xs text-amber-800 mt-1">
                          Always verify HTML/script code from trusted sources.
                          Malicious code can harm your site and users.
                        </AlertDescription>
                      </Alert>

                      <div>
                        <h4 className="text-sm font-medium text-black mb-2">
                          Common Ad Networks:
                        </h4>
                        <ul className="text-xs text-neutral-600 space-y-2">
                          <li>
                            <a
                              href="https://www.google.com/adsense/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-black"
                            >
                              Google AdSense{" "}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </li>
                          <li>
                            <a
                              href="https://www.media.net/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-black"
                            >
                              Media.net <ExternalLink className="h-3 w-3" />
                            </a>
                          </li>
                          <li>
                            <a
                              href="https://www.propellerads.com/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-black"
                            >
                              PropellerAds <ExternalLink className="h-3 w-3" />
                            </a>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Guidelines Tab */}
            <TabsContent value="guidelines" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Compliance Checklist */}
                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium uppercase tracking-wider">
                      Compliance Checklist
                    </CardTitle>
                    <CardDescription>
                      Ensure your ad meets these requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <label className="flex items-start gap-3">
                        <input type="checkbox" className="mt-1" />
                        <div>
                          <div className="text-sm font-medium text-black">
                            No misleading claims
                          </div>
                          <div className="text-xs text-neutral-600">
                            All statements must be truthful and verifiable
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3">
                        <input type="checkbox" className="mt-1" />
                        <div>
                          <div className="text-sm font-medium text-black">
                            Clear disclosure
                          </div>
                          <div className="text-xs text-neutral-600">
                            Clearly labeled as advertisement or sponsored
                            content
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3">
                        <input type="checkbox" className="mt-1" />
                        <div>
                          <div className="text-sm font-medium text-black">
                            Privacy compliance
                          </div>
                          <div className="text-xs text-neutral-600">
                            GDPR/CCPA compliant if collecting user data
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3">
                        <input type="checkbox" className="mt-1" />
                        <div>
                          <div className="text-sm font-medium text-black">
                            Age-appropriate
                          </div>
                          <div className="text-xs text-neutral-600">
                            Content suitable for your audience
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3">
                        <input type="checkbox" className="mt-1" />
                        <div>
                          <div className="text-sm font-medium text-black">
                            No prohibited content
                          </div>
                          <div className="text-xs text-neutral-600">
                            No illegal, adult, or harmful content
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3">
                        <input type="checkbox" className="mt-1" />
                        <div>
                          <div className="text-sm font-medium text-black">
                            Mobile-friendly
                          </div>
                          <div className="text-xs text-neutral-600">
                            Responsive and works on all devices
                          </div>
                        </div>
                      </label>
                    </div>
                  </CardContent>
                </Card>

                {/* Best Practices */}
                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium uppercase tracking-wider">
                      Performance Best Practices
                    </CardTitle>
                    <CardDescription>
                      Tips for better ad performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-black mb-2">
                        Design Excellence:
                      </h4>
                      <ul className="text-xs text-neutral-600 space-y-1">
                        <li>• Use high-contrast colors for CTA buttons</li>
                        <li>• Keep text minimal and readable</li>
                        <li>• Test multiple variations (A/B testing)</li>
                        <li>• Match your brand style consistently</li>
                        <li>• Use urgency sparingly and honestly</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-black mb-2">
                        Targeting & Placement:
                      </h4>
                      <ul className="text-xs text-neutral-600 space-y-1">
                        <li>• Choose relevant placement locations</li>
                        <li>• Consider user journey and intent</li>
                        <li>• Avoid ad overload on single page</li>
                        <li>• Rotate ads to prevent fatigue</li>
                        <li>• Track performance by placement</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-black mb-2">
                        Analytics & Optimization:
                      </h4>
                      <ul className="text-xs text-neutral-600 space-y-1">
                        <li>• Monitor CTR and conversion rates</li>
                        <li>• Review weekly performance reports</li>
                        <li>• Pause underperforming ads</li>
                        <li>• Scale successful campaigns</li>
                        <li>• Continuously test and improve</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Resources */}
                <Card className="border-neutral-200 rounded-none shadow-none lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium uppercase tracking-wider">
                      Helpful Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <a
                        href="https://www.iab.com/guidelines/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 border border-neutral-300 hover:border-black transition-colors"
                      >
                        <h5 className="text-sm font-medium text-black mb-1">
                          IAB Standards
                        </h5>
                        <p className="text-xs text-neutral-600">
                          Industry standard ad sizes and formats
                        </p>
                      </a>

                      <a
                        href="https://support.google.com/adsense/answer/9725"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 border border-neutral-300 hover:border-black transition-colors"
                      >
                        <h5 className="text-sm font-medium text-black mb-1">
                          AdSense Policies
                        </h5>
                        <p className="text-xs text-neutral-600">
                          Google's ad content policies
                        </p>
                      </a>

                      <a
                        href="https://www.canva.com/create/banner-ads/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 border border-neutral-300 hover:border-black transition-colors"
                      >
                        <h5 className="text-sm font-medium text-black mb-1">
                          Design Tools
                        </h5>
                        <p className="text-xs text-neutral-600">
                          Free ad design resources
                        </p>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdCreation;
