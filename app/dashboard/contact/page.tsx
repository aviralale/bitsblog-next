"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  Filter,
  Flag,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  PhoneCall,
  MessageSquare,
  Trash,
  Archive,
  Send,
  Mail,
  Calendar,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import AdminRoute from "@/components/AdminRoute";

/**
 * Contact message interface
 */
interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  category: string;
  category_display: string;
  message: string;
  status: "new" | "in_progress" | "resolved" | "closed";
  status_display: string;
  priority: "low" | "medium" | "high" | "urgent";
  priority_display: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  ip_address?: string;
  admin_notes?: string;
  replies_count: number;
}

/**
 * Contact reply interface
 */
interface ContactReply {
  id: number;
  contact_message: number;
  reply_message: string;
  replied_by_name: string;
  sent_via_email: boolean;
  created_at: string;
}

/**
 * Paginated API response
 */
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const ContactManagement = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>(
    [],
  );
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null,
  );
  const [replies, setReplies] = useState<ContactReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [replyLoading, setReplyLoading] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!user?.is_staff) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.is_staff) {
      loadMessages();
    }
  }, [user]);

  useEffect(() => {
    if (id && messages.length > 0) {
      const idStr = Array.isArray(id) ? id[0] : id;
      const message = messages.find((m) => m.id === parseInt(idStr));
      if (message) {
        handleViewDetails(message);
      }
    }
  }, [id, messages]);

  useEffect(() => {
    filterMessages();
  }, [messages, searchQuery, statusFilter, priorityFilter]);

  /**
   * Load all contact messages
   */
  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get<
        PaginatedResponse<ContactMessage> | ContactMessage[]
      >("/api/messages/?ordering=-created_at");

      if (response.data && typeof response.data === "object") {
        if ("results" in response.data) {
          setMessages(
            Array.isArray(response.data.results) ? response.data.results : [],
          );
        } else if (Array.isArray(response.data)) {
          setMessages(response.data);
        } else {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to load contact messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load replies for a specific message
   */
  const loadReplies = async (messageId: number) => {
    try {
      const response = await api.get<ContactReply[]>(
        `/api/contact/replies/?message_id=${messageId}`,
      );
      setReplies(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load replies:", error);
      setReplies([]);
    }
  };

  /**
   * Filter messages based on search and filters
   */
  const filterMessages = () => {
    let filtered = [...messages];

    if (statusFilter !== "all") {
      filtered = filtered.filter((msg) => msg.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((msg) => msg.priority === priorityFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (msg) =>
          msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.message.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredMessages(filtered);
  };

  /**
   * View message details
   */
  const handleViewDetails = async (message: ContactMessage) => {
    setSelectedMessage(message);
    await loadReplies(message.id);
    setDetailsDialogOpen(true);
  };

  /**
   * Update message status
   */
  const handleUpdateStatus = async (messageId: number, status: string) => {
    try {
      if (status === "resolved") {
        await api.post(`/api/contact/messages/${messageId}/mark_resolved/`);
      } else {
        await api.patch(`/api/contact/messages/${messageId}/`, { status });
      }

      // Reload messages
      await loadMessages();

      // Update selected message if it's currently open
      if (selectedMessage && selectedMessage.id === messageId) {
        const updated = messages.find((m) => m.id === messageId);
        if (updated) {
          setSelectedMessage({ ...updated, status: status as any });
        }
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
    }
  };

  /**
   * Open reply dialog
   */
  const handleReply = (message: ContactMessage) => {
    setSelectedMessage(message);
    setReplyMessage("");
    setSendViaEmail(true);
    setReplyDialogOpen(true);
  };

  /**
   * Send reply
   */
  const handleSendReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) {
      return;
    }

    setReplyLoading(true);
    try {
      await api.post("/api/contact/replies/", {
        contact_message: selectedMessage.id,
        reply_message: replyMessage,
        sent_via_email: sendViaEmail,
      });

      // Update message status to in_progress if it was new
      if (selectedMessage.status === "new") {
        await handleUpdateStatus(selectedMessage.id, "in_progress");
      }

      setReplyDialogOpen(false);
      setReplyMessage("");
      await loadMessages();

      alert(
        sendViaEmail
          ? "Reply sent successfully via email!"
          : "Reply saved successfully!",
      );
    } catch (error) {
      console.error("Failed to send reply:", error);
      alert("Failed to send reply");
    } finally {
      setReplyLoading(false);
    }
  };

  /**
   * Delete message
   */
  const handleDelete = async (messageId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this message? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await api.delete(`/api/contact/messages/${messageId}/`);
      await loadMessages();
      setDetailsDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("Failed to delete message");
    }
  };

  /**
   * Get status badge
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
            <AlertTriangle className="h-3 w-3" />
            New
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
            <Clock className="h-3 w-3" />
            In Progress
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
            <CheckCircle className="h-3 w-3" />
            Resolved
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-800 rounded">
            <XCircle className="h-3 w-3" />
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  /**
   * Get priority badge
   */
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold bg-red-600 text-white rounded">
            <Flag className="h-3 w-3" />
            Urgent
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
            High
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
            Medium
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 rounded">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Time ago helper
   */
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(dateString);
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
          <div className="container mx-auto px-6 py-12 max-w-7xl">
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard?tab=contact")}
                className="hover:bg-neutral-100 rounded-none h-10 w-10 p-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-12 bg-black"></div>
                  <span className="text-sm font-medium text-black uppercase tracking-wider">
                    Contact Management
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl font-light text-black mb-4 leading-tight">
                  All Messages
                </h1>
                <p className="text-lg text-neutral-600 font-light">
                  View and manage all contact form submissions
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-7xl">
          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  className="pl-12 border-neutral-300 focus:border-black rounded-none h-12 font-light"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 border-neutral-300 focus:border-black rounded-none h-12 font-light">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-48 border-neutral-300 focus:border-black rounded-none h-12 font-light">
                  <Flag className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Messages List */}
          {filteredMessages.length === 0 ? (
            <Card className="border-neutral-200 rounded-none shadow-none">
              <CardContent className="p-16 text-center">
                <PhoneCall className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
                <h3 className="text-2xl font-light text-black mb-3">
                  {messages.length === 0
                    ? "No messages yet"
                    : "No messages found"}
                </h3>
                <p className="text-neutral-600 font-light">
                  {messages.length === 0
                    ? "Contact messages will appear here when submitted"
                    : "Try adjusting your search or filters"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-neutral-200 rounded-none shadow-none">
                <CardContent className="p-0">
                  <div className="divide-y divide-neutral-200">
                    {filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className="p-6 hover:bg-neutral-50 transition-colors group cursor-pointer"
                        onClick={() => handleViewDetails(message)}
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              {getStatusBadge(message.status)}
                              {getPriorityBadge(message.priority)}
                              <span className="text-xs text-neutral-500 border border-neutral-300 px-2 py-1">
                                {message.category_display}
                              </span>
                              {message.replies_count > 0 && (
                                <span className="text-xs text-blue-600 border border-blue-300 bg-blue-50 px-2 py-1">
                                  {message.replies_count} replies
                                </span>
                              )}
                            </div>

                            <h3 className="text-xl font-medium text-black mb-2 group-hover:text-neutral-700 transition-colors">
                              {message.subject}
                            </h3>

                            <div className="flex items-center gap-4 text-sm text-neutral-600 mb-3">
                              <div className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5" />
                                <span>{message.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5" />
                                <span>{message.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{timeAgo(message.created_at)}</span>
                              </div>
                            </div>

                            <p className="text-neutral-600 font-light text-sm line-clamp-2 leading-relaxed">
                              {message.message}
                            </p>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReply(message);
                              }}
                              className="hover:bg-blue-50 hover:text-blue-600 rounded-none h-10 w-10 p-0"
                              title="Reply"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>

                            {message.status !== "resolved" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(message.id, "resolved");
                                }}
                                className="hover:bg-green-50 hover:text-green-600 rounded-none h-10 w-10 p-0"
                                title="Mark Resolved"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(message.id);
                              }}
                              className="hover:bg-red-50 hover:text-red-600 rounded-none h-10 w-10 p-0"
                              title="Delete"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8 text-center">
                <p className="text-sm text-neutral-500 font-light">
                  Showing {filteredMessages.length} of {messages.length}{" "}
                  messages
                </p>
              </div>
            </>
          )}
        </div>

        {/* Message Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-3xl rounded-none border-neutral-200 max-h-[90vh] overflow-y-auto">
            {selectedMessage && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between mb-4">
                    <DialogTitle className="text-2xl font-light text-black">
                      Message Details
                    </DialogTitle>
                    <div className="flex gap-2">
                      {getStatusBadge(selectedMessage.status)}
                      {getPriorityBadge(selectedMessage.priority)}
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 border border-neutral-200">
                    <div>
                      <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                        Name
                      </div>
                      <div className="font-medium text-black">
                        {selectedMessage.name}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                        Email
                      </div>
                      <div className="font-medium text-black">
                        {selectedMessage.email}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                        Category
                      </div>
                      <div className="font-medium text-black">
                        {selectedMessage.category_display}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                        Date
                      </div>
                      <div className="font-medium text-black">
                        {formatDate(selectedMessage.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
                      Subject
                    </div>
                    <h3 className="text-xl font-medium text-black">
                      {selectedMessage.subject}
                    </h3>
                  </div>

                  {/* Message */}
                  <div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
                      Message
                    </div>
                    <div className="p-4 bg-white border border-neutral-200">
                      <p className="text-neutral-700 font-light leading-relaxed whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>

                  {/* Replies */}
                  {replies.length > 0 && (
                    <div>
                      <div className="text-xs text-neutral-500 uppercase tracking-wider mb-3">
                        Replies ({replies.length})
                      </div>
                      <div className="space-y-3">
                        {replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="p-4 bg-blue-50 border border-blue-200"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-medium text-blue-900">
                                {reply.replied_by_name}
                              </span>
                              <span className="text-xs text-blue-600">
                                {formatDate(reply.created_at)}
                              </span>
                              {reply.sent_via_email && (
                                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                                  <Mail className="h-3 w-3 inline mr-1" />
                                  Sent via email
                                </span>
                              )}
                            </div>
                            <p className="text-neutral-700 font-light leading-relaxed">
                              {reply.reply_message}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Update */}
                  <div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider mb-3">
                      Update Status
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleUpdateStatus(selectedMessage.id, "in_progress")
                        }
                        disabled={selectedMessage.status === "in_progress"}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50 font-light rounded-none"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        In Progress
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleUpdateStatus(selectedMessage.id, "resolved")
                        }
                        disabled={selectedMessage.status === "resolved"}
                        className="border-green-300 text-green-700 hover:bg-green-50 font-light rounded-none"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resolved
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleUpdateStatus(selectedMessage.id, "closed")
                        }
                        disabled={selectedMessage.status === "closed"}
                        className="border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-light rounded-none"
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Close
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex-row gap-2 pt-6 border-t border-neutral-200">
                  <Button
                    variant="outline"
                    onClick={() => handleReply(selectedMessage)}
                    className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="border-red-300 text-red-600 hover:bg-red-50 font-light rounded-none h-10"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Reply Dialog */}
        <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
          <DialogContent className="sm:max-w-lg rounded-none border-neutral-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black">
                Send Reply
              </DialogTitle>
              <DialogDescription className="text-neutral-600 font-light pt-2">
                Reply to {selectedMessage?.name} ({selectedMessage?.email})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm text-neutral-700 font-medium mb-2 block">
                  Your Reply
                </label>
                <Textarea
                  value={replyMessage}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setReplyMessage(e.target.value)
                  }
                  placeholder="Type your response here..."
                  className="border-neutral-300 focus:border-black rounded-none font-light min-h-32"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={sendViaEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSendViaEmail(e.target.checked)
                  }
                  className="rounded border-neutral-300"
                />
                <label
                  htmlFor="sendEmail"
                  className="text-sm text-neutral-700 font-light"
                >
                  Send reply via email
                </label>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setReplyDialogOpen(false)}
                disabled={replyLoading}
                className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSendReply}
                disabled={replyLoading || !replyMessage.trim()}
                className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-10"
              >
                {replyLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Reply
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminRoute>
  );
};

export default ContactManagement;
