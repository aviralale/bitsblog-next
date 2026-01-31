"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  User,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Send,
  FileText,
  MapPin,
  Monitor,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import api from "@/api/axios";
import AdminRoute from "@/components/AdminRoute";

interface Reply {
  id: number;
  reply_message: string;
  replied_by_name: string;
  sent_via_email: boolean;
  created_at: string;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  category: string;
  category_display: string;
  message: string;
  status: string;
  status_display: string;
  priority: string;
  priority_display: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  admin_notes?: string;
  assigned_to_name?: string;
  replies: Reply[];
}

export const ContactMessageDetail = () => {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [message, setMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Fetch message details
  useEffect(() => {
    fetchMessage();
  }, [id]);

  const fetchMessage = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/messages/${id}/`);

      setMessage(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark message as resolved
   */
  const handleMarkResolved = async () => {
    if (!message) return;

    try {
      await api.post(`/api/messages/${message.id}/mark_resolved/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      fetchMessage(); // Refresh data
    } catch (err) {
      console.error("Error marking as resolved:", err);
    }
  };

  /**
   * Send reply to user
   */
  const handleSendReply = async () => {
    if (!message || !replyText.trim()) return;

    try {
      setSendingReply(true);
      await api.post("/api/replies/", {
        contact_message: message.id,
        reply_message: replyText,
        sent_via_email: true,
      });

      setReplyText("");
      fetchMessage(); // Refresh to show new reply
    } catch (err) {
      console.error("Error sending reply:", err);
    } finally {
      setSendingReply(false);
    }
  };

  /**
   * Add admin note
   */
  const handleAddNote = async () => {
    if (!message || !adminNote.trim()) return;

    try {
      setAddingNote(true);
      await api.post(`/api/messages/${message.id}/add_note/`, {
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          note: adminNote,
        }),
      });

      setAdminNote("");
      fetchMessage(); // Refresh to show new note
    } catch (err) {
      console.error("Error adding note:", err);
    } finally {
      setAddingNote(false);
    }
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-red-100 text-red-800 border-red-200",
      in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      closed: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  /**
   * Get priority badge color
   */
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-blue-100 text-blue-800 border-blue-200",
      medium: "bg-cyan-100 text-cyan-800 border-cyan-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      urgent: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[priority] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Generate page title
  const pageTitle = message
    ? `Message #${message.id}: ${message.subject} | Admin`
    : loading
      ? "Loading Message... | Admin"
      : "Message Not Found | Admin";

  if (loading) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600 font-light">Loading message...</p>
          </div>
        </div>
      </AdminRoute>
    );
  }

  if (error || !message) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-6 py-16 max-w-4xl">
            <Card className="border-red-200 rounded-none shadow-none">
              <CardContent className="p-16 text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                <h2 className="text-2xl font-light text-black mb-3">
                  Message Not Found
                </h2>
                <p className="text-neutral-600 font-light mb-8">
                  {error || "The message you're looking for doesn't exist."}
                </p>
                <Button
                  onClick={() => router.push("/dashboard/contact")}
                  variant="outline"
                  className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-12 px-8"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Messages
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-6 py-8 max-w-6xl">
            <div className="flex items-center justify-between mb-4">
              <Button
                onClick={() => router.push("/dashboard/contact")}
                variant="ghost"
                className="font-light"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Messages
              </Button>
              <div className="flex items-center gap-3">
                <Badge
                  className={`${getStatusColor(message.status)} rounded-none`}
                >
                  {message.status_display}
                </Badge>
                <Badge
                  className={`${getPriorityColor(
                    message.priority,
                  )} rounded-none`}
                >
                  {message.priority_display}
                </Badge>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-light text-black">
              Message #{message.id}
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Message Details */}
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardHeader className="border-b border-neutral-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-medium text-black mb-2">
                        {message.subject}
                      </CardTitle>
                      <CardDescription className="text-neutral-600 font-light">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{message.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <a
                            href={`mailto:${message.email}`}
                            className="hover:underline"
                          >
                            {message.email}
                          </a>
                        </div>
                      </CardDescription>
                    </div>
                    {message.status !== "resolved" && (
                      <Button
                        onClick={handleMarkResolved}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white rounded-none"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="prose max-w-none">
                    <p className="text-neutral-700 font-light whitespace-pre-wrap leading-relaxed">
                      {message.message}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-black">
                    Message Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-neutral-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-neutral-500 font-light uppercase">
                          Received
                        </div>
                        <div className="text-sm text-black">
                          {formatDate(message.created_at)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Tag className="h-5 w-5 text-neutral-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-neutral-500 font-light uppercase">
                          Category
                        </div>
                        <div className="text-sm text-black">
                          {message.category_display}
                        </div>
                      </div>
                    </div>

                    {message.resolved_at && (
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <div className="text-xs text-neutral-500 font-light uppercase">
                            Resolved
                          </div>
                          <div className="text-sm text-black">
                            {formatDate(message.resolved_at)}
                          </div>
                        </div>
                      </div>
                    )}

                    {message.assigned_to_name && (
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-neutral-400 mt-0.5" />
                        <div>
                          <div className="text-xs text-neutral-500 font-light uppercase">
                            Assigned To
                          </div>
                          <div className="text-sm text-black">
                            {message.assigned_to_name}
                          </div>
                        </div>
                      </div>
                    )}

                    {message.ip_address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-neutral-400 mt-0.5" />
                        <div>
                          <div className="text-xs text-neutral-500 font-light uppercase">
                            IP Address
                          </div>
                          <div className="text-sm text-black font-mono">
                            {message.ip_address}
                          </div>
                        </div>
                      </div>
                    )}

                    {message.user_agent && (
                      <div className="flex items-start gap-3 md:col-span-2">
                        <Monitor className="h-5 w-5 text-neutral-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-xs text-neutral-500 font-light uppercase">
                            User Agent
                          </div>
                          <div className="text-xs text-neutral-600 break-all">
                            {message.user_agent}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Admin Notes */}
              {message.admin_notes && (
                <Card className="border-neutral-200 rounded-none shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium text-black flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Admin Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                        {message.admin_notes}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Add Note Form */}
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-black">
                    Add Admin Note
                  </CardTitle>
                  <CardDescription className="font-light">
                    Internal notes (not visible to the user)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Add a note about this message..."
                      className="min-h-24 border-neutral-300 focus:border-black rounded-none font-light"
                    />
                    <Button
                      onClick={handleAddNote}
                      disabled={!adminNote.trim() || addingNote}
                      className="bg-black text-white hover:bg-neutral-800 rounded-none"
                    >
                      {addingNote ? "Adding..." : "Add Note"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Replies */}
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-black flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Replies ({message.replies.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {message.replies.length > 0 ? (
                    <div className="space-y-4">
                      {message.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="border-l-4 border-neutral-300 pl-4 py-2"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-black">
                                {reply.replied_by_name}
                              </span>
                              {reply.sent_via_email && (
                                <Badge
                                  variant="outline"
                                  className="text-xs rounded-none"
                                >
                                  <Mail className="h-3 w-3 mr-1" />
                                  Sent via email
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-neutral-500">
                              {formatDate(reply.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-700 font-light whitespace-pre-wrap">
                            {reply.reply_message}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-500 font-light text-center py-8">
                      No replies yet
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Reply Form */}
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-black">
                    Send Reply
                  </CardTitle>
                  <CardDescription className="font-light">
                    Reply will be sent to {message.email}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      className="min-h-32 border-neutral-300 focus:border-black rounded-none font-light"
                    />
                    <Button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || sendingReply}
                      className="bg-black text-white hover:bg-neutral-800 rounded-none"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {sendingReply ? "Sending..." : "Send Reply"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-black">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-neutral-300 text-neutral-600 hover:border-black hover:text-black rounded-none"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Customer
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-neutral-300 text-neutral-600 hover:border-black hover:text-black rounded-none"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Assign to User
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-neutral-300 text-neutral-600 hover:border-black hover:text-black rounded-none"
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    Change Category
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-neutral-300 text-neutral-600 hover:border-black hover:text-black rounded-none"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Change Priority
                  </Button>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-black">
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-black rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium text-black">
                          Message Received
                        </div>
                        <div className="text-xs text-neutral-500">
                          {formatDate(message.created_at)}
                        </div>
                      </div>
                    </div>

                    {message.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div>
                          <div className="text-sm font-medium text-black">
                            Reply Sent
                          </div>
                          <div className="text-xs text-neutral-500">
                            {formatDate(reply.created_at)}
                          </div>
                        </div>
                      </div>
                    ))}

                    {message.resolved_at && (
                      <div className="flex gap-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                        <div>
                          <div className="text-sm font-medium text-black">
                            Resolved
                          </div>
                          <div className="text-xs text-neutral-500">
                            {formatDate(message.resolved_at)}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-neutral-300 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium text-black">
                          Last Updated
                        </div>
                        <div className="text-xs text-neutral-500">
                          {formatDate(message.updated_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
};

export default ContactMessageDetail;
