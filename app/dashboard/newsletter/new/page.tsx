"use client";

export const dynamic = "force-dynamic";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Send,
  Save,
  Eye,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import AdminRoute from "@/components/AdminRoute";

/**
 * Newsletter template interface
 */
interface NewsletterTemplate {
  id: number;
  name: string;
  subject_line: string;
  content: string;
}

/**
 * Subscriber stats interface
 */
interface SubscriberStats {
  total: number;
  active: number;
  pending: number;
}

function CreateNewsletterContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [recipientFilter, setRecipientFilter] = useState<string>("active");

  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  // Data
  const [templates, setTemplates] = useState<NewsletterTemplate[]>([]);
  const [subscriberStats, setSubscriberStats] = useState<SubscriberStats>({
    total: 0,
    active: 0,
    pending: 0,
  });

  // Dialog states
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{
    subject?: string;
    content?: string;
  }>({});

  // Check if user is admin
  useEffect(() => {
    if (!user?.is_staff) {
      router.push("/");
    }
  }, [user, router]);

  // Load initial data
  useEffect(() => {
    if (user?.is_staff) {
      loadTemplates();
      loadSubscriberStats();
    }
  }, [user]);

  // Handle template data from navigation state
  useEffect(() => {
    // Get template data from URL search params if available
    const templateId = searchParams.get("templateId");
    const templateSubject = searchParams.get("subject");
    const templateContent = searchParams.get("content");

    if (templateId) {
      setSelectedTemplate(templateId);
    }
    if (templateSubject) {
      setSubject(decodeURIComponent(templateSubject));
    }
    if (templateContent) {
      setContent(decodeURIComponent(templateContent));
    }
  }, [searchParams]);

  /**
   * Load newsletter templates
   */
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/newsletter/templates/");
      if (response.data && typeof response.data === "object") {
        if (
          "results" in response.data &&
          Array.isArray(response.data.results)
        ) {
          setTemplates(response.data.results);
        } else if (Array.isArray(response.data)) {
          setTemplates(response.data);
        } else {
          setTemplates([]);
        }
      } else {
        setTemplates([]);
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load subscriber statistics
   */
  const loadSubscriberStats = async () => {
    try {
      const response = await api.get("/api/newsletter/subscribers/stats/");
      setSubscriberStats(response.data);
    } catch (error) {
      console.error("Failed to load subscriber stats:", error);
    }
  };

  /**
   * Handle template selection
   */
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id.toString() === templateId);
    if (template) {
      setSubject(template.subject_line);
      setContent(template.content);
    }
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors: { subject?: string; content?: string } = {};

    if (!subject.trim()) {
      newErrors.subject = "Subject line is required";
    }

    if (!content.trim()) {
      newErrors.content = "Newsletter content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Save as draft
   */
  const handleSaveAsDraft = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await api.post("/api/newsletter/newsletters/", {
        subject: subject,
        content: content,
        status: "draft",
        recipient_filter: recipientFilter,
        scheduled_for: scheduledFor || null,
      });

      alert("Newsletter saved as draft successfully!");
      router.push("/dashboard/newsletters");
    } catch (error) {
      console.error("Failed to save newsletter:", error);
      alert("Failed to save newsletter. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Open send confirmation dialog
   */
  const handleSendClick = () => {
    if (!validateForm()) return;
    setSendDialogOpen(true);
  };

  /**
   * Send newsletter
   */
  const handleConfirmSend = async () => {
    setSending(true);
    try {
      await api.post("/api/newsletter/newsletters/", {
        subject: subject,
        content: content,
        status: scheduledFor ? "scheduled" : "sent",
        recipient_filter: recipientFilter,
        scheduled_for: scheduledFor || null,
      });

      setSendDialogOpen(false);
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error("Failed to send newsletter:", error);
      alert("Failed to send newsletter. Please try again.");
    } finally {
      setSending(false);
    }
  };

  /**
   * Get recipient count based on filter
   */
  const getRecipientCount = () => {
    switch (recipientFilter) {
      case "active":
        return subscriberStats.active;
      case "pending":
        return subscriberStats.pending;
      case "all":
        return subscriberStats.total;
      default:
        return subscriberStats.active;
    }
  };

  /**
   * Insert merge tag
   */
  const insertMergeTag = (tag: string) => {
    const textarea = document.querySelector("textarea");
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        content.substring(0, start) + tag + content.substring(end);
      setContent(newContent);

      // Set cursor position after inserted tag
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
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

  return (
    <AdminRoute>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-6 py-8 max-w-5xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard/newsletters">
                  <Button
                    variant="ghost"
                    className="hover:bg-neutral-100 rounded-none h-10 w-10 p-0"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-light text-black">
                    Create Newsletter
                  </h1>
                  <p className="text-sm text-neutral-500 mt-1">
                    Compose and send newsletters to your subscribers
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setPreviewDialogOpen(true)}
                  disabled={!subject || !content}
                  className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSaveAsDraft}
                  disabled={saving || !subject || !content}
                  className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button
                  onClick={handleSendClick}
                  disabled={sending || !subject || !content}
                  className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-10 px-6"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {scheduledFor ? "Schedule" : "Send Now"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Template Selection */}
              {templates.length > 0 && (
                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium uppercase tracking-wider">
                      Quick Start
                    </CardTitle>
                    <CardDescription className="text-neutral-600 font-light">
                      Choose a template or start from scratch
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={selectedTemplate}
                      onValueChange={handleTemplateSelect}
                    >
                      <SelectTrigger className="border-neutral-300 focus:border-black rounded-none h-12 font-light">
                        <Sparkles className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Select a template (optional)" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none">
                        <SelectItem value="blank">Blank Newsletter</SelectItem>
                        {templates.map((template) => (
                          <SelectItem
                            key={template.id}
                            value={template.id.toString()}
                          >
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}

              {/* Newsletter Content */}
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg font-medium uppercase tracking-wider">
                    Newsletter Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Subject Line */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Subject Line *
                    </label>
                    <Input
                      type="text"
                      value={subject}
                      onChange={(e) => {
                        setSubject(e.target.value);
                        if (errors.subject) {
                          setErrors({ ...errors, subject: undefined });
                        }
                      }}
                      placeholder="Enter your newsletter subject..."
                      className={`border-neutral-300 focus:border-black rounded-none h-12 font-light ${
                        errors.subject ? "border-red-500" : ""
                      }`}
                    />
                    {errors.subject && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-black">
                        Content *
                      </label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMergeTag("{{first_name}}")}
                          className="text-xs h-7 px-2"
                        >
                          + First Name
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMergeTag("{{email}}")}
                          className="text-xs h-7 px-2"
                        >
                          + Email
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                        if (errors.content) {
                          setErrors({ ...errors, content: undefined });
                        }
                      }}
                      placeholder="Write your newsletter content here... You can use HTML tags for formatting."
                      className={`border-neutral-300 focus:border-black rounded-none font-light min-h-[400px] ${
                        errors.content ? "border-red-500" : ""
                      }`}
                    />
                    {errors.content && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.content}
                      </p>
                    )}
                    <p className="text-xs text-neutral-500 mt-2">
                      Tip: Use merge tags like {`{{first_name}}`} to personalize
                      your newsletter
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recipients */}
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg font-medium uppercase tracking-wider">
                    Recipients
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value={recipientFilter}
                    onValueChange={setRecipientFilter}
                  >
                    <SelectTrigger className="border-neutral-300 focus:border-black rounded-none h-12 font-light">
                      <Users className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      <SelectItem value="active">Active Subscribers</SelectItem>
                      <SelectItem value="pending">
                        Pending Verification
                      </SelectItem>
                      <SelectItem value="all">All Subscribers</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="p-4 bg-neutral-50 border border-neutral-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">
                        Will be sent to:
                      </span>
                      <span className="text-2xl font-light text-black">
                        {getRecipientCount()}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">subscribers</p>
                  </div>

                  <div className="space-y-2 text-xs text-neutral-600">
                    <div className="flex items-center justify-between">
                      <span>Active</span>
                      <span className="font-medium">
                        {subscriberStats.active}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pending</span>
                      <span className="font-medium">
                        {subscriberStats.pending}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-neutral-200 pt-2">
                      <span>Total</span>
                      <span className="font-medium">
                        {subscriberStats.total}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scheduling */}
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg font-medium uppercase tracking-wider">
                    Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Send Time (Optional)
                    </label>
                    <Input
                      type="datetime-local"
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="border-neutral-300 focus:border-black rounded-none h-12 font-light"
                    />
                    <p className="text-xs text-neutral-500 mt-2">
                      Leave empty to send immediately
                    </p>
                  </div>

                  {scheduledFor && (
                    <div className="p-4 bg-blue-50 border border-blue-200">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-blue-900 font-medium">
                            Scheduled Send
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            {new Date(scheduledFor).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg font-medium uppercase tracking-wider">
                    Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-neutral-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Keep subject lines under 50 characters</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Personalize with merge tags</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Include a clear call-to-action</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Test on mobile devices</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Preview Dialog */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="sm:max-w-2xl rounded-none border-neutral-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black">
                Newsletter Preview
              </DialogTitle>
            </DialogHeader>

            <div className="border border-neutral-200 p-6 max-h-[500px] overflow-y-auto">
              <div className="mb-6">
                <p className="text-xs text-neutral-500 mb-2">Subject:</p>
                <h3 className="text-xl font-medium text-black">{subject}</h3>
              </div>

              <div className="prose prose-sm max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: content
                      .replace(
                        /{{first_name}}/g,
                        "<strong>[First Name]</strong>",
                      )
                      .replace(/{{email}}/g, "<strong>[Email]</strong>")
                      .replace(/\n/g, "<br />"),
                  }}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPreviewDialogOpen(false)}
                className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Send Confirmation Dialog */}
        <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-none border-neutral-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black">
                {scheduledFor ? "Schedule Newsletter" : "Send Newsletter"}
              </DialogTitle>
              <DialogDescription className="text-neutral-600 font-light pt-2">
                {scheduledFor
                  ? "This newsletter will be sent at the scheduled time."
                  : "This newsletter will be sent immediately to all selected recipients."}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 border-y border-neutral-200 my-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Recipients:</span>
                <span className="font-medium text-black">
                  {getRecipientCount()} subscribers
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Subject:</span>
                <span className="font-medium text-black truncate max-w-xs">
                  {subject}
                </span>
              </div>
              {scheduledFor && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Send Time:</span>
                  <span className="font-medium text-black">
                    {new Date(scheduledFor).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setSendDialogOpen(false)}
                disabled={sending}
                className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSend}
                disabled={sending}
                className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-10"
              >
                {sending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {scheduledFor ? "Scheduling..." : "Sending..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Confirm {scheduledFor ? "Schedule" : "Send"}
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-none border-neutral-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Success!
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <p className="text-neutral-600 font-light">
                {scheduledFor
                  ? "Your newsletter has been scheduled and will be sent at the specified time."
                  : "Your newsletter has been sent successfully to all subscribers."}
              </p>
            </div>

            <DialogFooter>
              <Button
                onClick={() => router.push("/dashboard/newsletters")}
                className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-10 w-full"
              >
                Back to Newsletters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminRoute>
  );
}

export default function CreateNewsletter() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <CreateNewsletterContent />
    </Suspense>
  );
}
