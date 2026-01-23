"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";

interface SavePostButtonProps {
  postId: number;
  postSlug: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
  className?: string;
}

export const SavePostButton = ({
  postId,
  postSlug,
  variant = "ghost",
  size = "sm",
  showText = true,
  className = "",
}: SavePostButtonProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if post is saved on mount
  useEffect(() => {
    if (user) {
      checkSavedStatus();
    }
  }, [user, postSlug]);

  /**
   * Check if the post is saved
   */
  const checkSavedStatus = async () => {
    try {
      const response = await api.get(`/api/saved-posts/check/${postSlug}/`);
      setIsSaved(response.data.is_saved);
    } catch (error) {
      console.error("Failed to check saved status:", error);
    }
  };

  /**
   * Toggle save status
   */
  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if button is inside a link

    // Redirect to login if not authenticated
    if (!user) {
      router.push(`/login?from=${encodeURIComponent(`/post/${postSlug}`)}`);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/saved-posts/toggle/", {
        post_id: postId,
      });
      setIsSaved(response.data.saved);
    } catch (error) {
      console.error("Failed to toggle save status:", error);
      alert("Failed to save post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={loading}
      className={`${className} ${
        isSaved ? "text-blue-600 hover:text-blue-700" : ""
      }`}
      title={isSaved ? "Remove from saved" : "Save for later"}
    >
      <Bookmark
        className={`h-4 w-4 ${showText ? "mr-2" : ""} ${
          isSaved ? "fill-current" : ""
        }`}
      />
      {showText && (isSaved ? "Saved" : "Save")}
    </Button>
  );
};

export default SavePostButton;
