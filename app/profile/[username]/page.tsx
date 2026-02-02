"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  User as UserIcon,
  Mail,
  Calendar,
  Globe,
  FileText,
  MessageSquare,
  Edit3,
  Camera,
  X,
  Save,
  Shield,
  Bookmark,
  Eye,
} from "lucide-react";
import api from "@/api/axios";

/**
 * Type definition matching your Django UserProfileSerializer
 * This ensures type safety throughout the component
 */
interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  profile_picture: string | null;
  website: string;
  created_at: string;
  is_staff: boolean;
  posts_count: number;
  comments_count: number;
  saved_posts_count: number; // Added for saved posts feature
}

/**
 * Type for the post data when viewing user's published posts
 */
interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  created_at: string;
  views: number;
  comments_count: number;
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);

  // State for the edit profile dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null,
  );
  const [profilePicturePreview, setProfilePicturePreview] =
    useState<string>("");

  // Form state for editing profile
  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    website: "",
  });

  /**
   * Check if the currently logged-in user is viewing their own profile.
   * This determines whether to show edit buttons and private information.
   */
  const isOwnProfile = currentUser?.username === username;

  /**
   * Load the user profile data from the Django backend.
   * Uses the username from the URL parameter to fetch the specific user's data.
   */
  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return;

      try {
        setLoading(true);
        // Your Django endpoint: /api/auth/users/{username}/
        const response = await api.get<UserProfile>(
          `/api/auth/users/${username}/`,
        );
        setProfile(response.data);

        // Initialize the edit form with current profile data
        setEditFormData({
          first_name: response.data.first_name || "",
          last_name: response.data.last_name || "",
          bio: response.data.bio || "",
          website: response.data.website || "",
        });

        // Set the current profile picture preview if one exists
        if (response.data.profile_picture) {
          setProfilePicturePreview(response.data.profile_picture);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        // If user not found, redirect to 404 or home
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username, router]);

  /**
   * Load the user's published posts from the Django backend.
   * Uses the custom action endpoint: /api/auth/users/{username}/posts/
   */
  useEffect(() => {
    const loadUserPosts = async () => {
      if (!username) return;

      try {
        setPostsLoading(true);
        // Your Django custom action endpoint
        const response = await api.get<Post[]>(
          `/api/auth/users/${username}/posts/`,
        );
        setUserPosts(response.data);
      } catch (error) {
        console.error("Failed to load user posts:", error);
      } finally {
        setPostsLoading(false);
      }
    };

    loadUserPosts();
  }, [username]);

  /**
   * Handles profile picture selection.
   * Creates a preview URL so the user can see their selection before saving.
   */
  const handleProfilePictureSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate that it's an image
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be smaller than 5MB");
        return;
      }

      setProfilePictureFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Removes the profile picture selection, reverting to the original or no picture.
   */
  const handleRemoveProfilePicture = () => {
    setProfilePictureFile(null);
    // Revert to original profile picture or empty
    setProfilePicturePreview(profile?.profile_picture || "");
  };

  /**
   * Handles the profile update submission.
   * Uses FormData to support file uploads (profile picture).
   * The Django backend endpoint is PATCH /api/auth/me/
   */
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      /**
       * Since we need to support file uploads (profile picture), we use FormData.
       * This is similar to how we handle featured images in blog posts.
       */
      const formData = new FormData();

      // Add all the text fields
      formData.append("first_name", editFormData.first_name);
      formData.append("last_name", editFormData.last_name);
      formData.append("bio", editFormData.bio);
      formData.append("website", editFormData.website);

      // Add the profile picture if a new one was selected
      if (profilePictureFile) {
        formData.append("profile_picture", profilePictureFile);
      }

      /**
       * Send PATCH request to update the current user's profile.
       * Django will automatically know which user to update because we're authenticated.
       */
      const response = await api.patch<UserProfile>("/api/auth/me/", formData);

      // Update the local profile state with the new data from the server
      setProfile(response.data);

      // Close the dialog and reset file state
      setEditDialogOpen(false);
      setProfilePictureFile(null);

      // Show success message
      alert("Profile updated successfully!");
    } catch (error: any) {
      console.error("Failed to update profile:", error);

      // Show detailed error messages if available
      if (error.response?.data) {
        const errors = error.response.data;
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${messages}`)
          .join("\n");
        alert(`Failed to update profile:\n\n${errorMessages}`);
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } finally {
      setEditLoading(false);
    }
  };

  /**
   * Format the date to a readable string.
   * This shows when the user joined the platform.
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /**
   * Get the user's full name, or fallback to username if not provided.
   */
  const getDisplayName = () => {
    if (!profile) return "";

    const fullName = `${profile.first_name} ${profile.last_name}`.trim();
    return fullName || profile.username;
  };

  /**
   * Get initials for the profile picture placeholder.
   * Uses the first letter of first name and last name, or username if not available.
   */
  const getInitials = () => {
    if (!profile) return "";

    if (profile.first_name && profile.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }

    return profile.username.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <UserIcon className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
          <h2 className="text-2xl font-light text-black mb-3">
            User Not Found
          </h2>
          <p className="text-neutral-600 font-light mb-8">
            The user you're looking for doesn't exist.
          </p>
          <Link href="/">
            <Button className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Profile Header */}
      <div className="border-b border-neutral-200">
        <div className="container mx-auto px-6 py-12 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Picture */}
            <div className="shrink-0">
              {profile.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt={`${profile.username}'s profile`}
                  className="w-32 h-32 object-cover border-2 border-neutral-200"
                />
              ) : (
                <div className="w-32 h-32 bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center">
                  <span className="text-4xl font-light text-neutral-400">
                    {getInitials()}
                  </span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-light text-black">
                      {getDisplayName()}
                    </h1>
                    {profile.is_staff && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 border border-black text-black text-xs uppercase tracking-wider">
                        <Shield className="h-3 w-3" />
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-neutral-600 font-light">
                    @{profile.username}
                  </p>
                </div>

                <div className="flex gap-2">
                  {isOwnProfile && (
                    <>
                      <Link href="/saved-posts">
                        <Button
                          variant="outline"
                          className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                        >
                          <Bookmark className="h-4 w-4 mr-2" />
                          Saved Posts
                        </Button>
                      </Link>
                      <Button
                        onClick={() => setEditDialogOpen(true)}
                        variant="outline"
                        className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-neutral-700 font-light leading-relaxed mb-6">
                  {profile.bio}
                </p>
              )}

              {/* Profile Meta Information */}
              <div className="flex flex-wrap gap-6 text-sm text-neutral-600">
                {profile.email && isOwnProfile && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="font-light">{profile.email}</span>
                  </div>
                )}

                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-black transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="font-light underline underline-offset-4">
                      Website
                    </span>
                  </a>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-light">
                    Joined {formatDate(profile.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats and Content */}
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card className="border-neutral-200 rounded-none shadow-none">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <FileText className="h-5 w-5 text-neutral-400" />
              </div>
              <div className="text-3xl font-light text-black mb-1">
                {profile.posts_count}
              </div>
              <div className="text-xs text-neutral-500 uppercase tracking-wider">
                Published Posts
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 rounded-none shadow-none">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <MessageSquare className="h-5 w-5 text-neutral-400" />
              </div>
              <div className="text-3xl font-light text-black mb-1">
                {profile.comments_count}
              </div>
              <div className="text-xs text-neutral-500 uppercase tracking-wider">
                Comments Made
              </div>
            </CardContent>
          </Card>

          {/* Saved Posts Card - Only visible to own profile */}
          {isOwnProfile && (
            <Link href="/saved-posts">
              <Card className="border-neutral-200 rounded-none shadow-none hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <Bookmark className="h-5 w-5 text-neutral-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="text-3xl font-light text-black mb-1 group-hover:text-blue-600 transition-colors">
                    {profile.saved_posts_count}
                  </div>
                  <div className="text-xs text-neutral-500 uppercase tracking-wider group-hover:text-black transition-colors">
                    Saved Posts
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          <Card className="border-neutral-200 rounded-none shadow-none">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <Eye className="h-5 w-5 text-neutral-400" />
              </div>
              <div className="text-3xl font-light text-black mb-1">
                {userPosts
                  .reduce((sum, post) => sum + post.views, 0)
                  .toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500 uppercase tracking-wider">
                Total Post Views
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User's Posts */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-black"></div>
              <h2 className="text-2xl font-light text-black">
                Published Posts by {profile.first_name || profile.username}
              </h2>
            </div>

            {isOwnProfile && profile.saved_posts_count > 0 && (
              <Link href="/saved-posts">
                <Button
                  variant="ghost"
                  className="text-neutral-600 hover:text-black font-light rounded-none h-10"
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  View Saved Posts ({profile.saved_posts_count})
                </Button>
              </Link>
            )}
          </div>

          {postsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="border border-neutral-200 p-16 text-center">
              <FileText className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
              <h3 className="text-xl font-light text-black mb-3">
                No posts yet
              </h3>
              <p className="text-neutral-600 font-light">
                {isOwnProfile
                  ? "You haven't published any posts yet. Start writing to share your thoughts with the world!"
                  : `${
                      profile.first_name || profile.username
                    } hasn't published any posts yet.`}
              </p>
              {isOwnProfile && (
                <Link href="/dashboard/new">
                  <Button className="mt-6 bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-8">
                    Create Your First Post
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {userPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.slug}`}
                  className="block border border-neutral-200 p-6 hover:border-black transition-colors group"
                >
                  <h3 className="text-xl font-light text-black mb-3 group-hover:text-neutral-700 transition-colors">
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="text-neutral-600 font-light text-sm mb-4 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span>{formatDate(post.created_at)}</span>
                    <span>•</span>
                    <span>{post.views} views</span>
                    <span>•</span>
                    <span>{post.comments_count} comments</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl rounded-none border-neutral-200">
          <form onSubmit={handleUpdateProfile}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black">
                Edit Profile
              </DialogTitle>
              <DialogDescription className="text-neutral-600 font-light pt-2">
                Update your profile information and profile picture.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-6">
              {/* Profile Picture Upload */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-black uppercase tracking-wider">
                  Profile Picture
                </Label>

                <div className="flex items-center gap-6">
                  {profilePicturePreview ? (
                    <div className="relative">
                      <img
                        src={profilePicturePreview}
                        alt="Profile preview"
                        className="w-24 h-24 object-cover border-2 border-neutral-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveProfilePicture}
                        className="absolute -top-2 -right-2 p-1 bg-black text-white hover:bg-neutral-800 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center">
                      <span className="text-2xl font-light text-neutral-400">
                        {getInitials()}
                      </span>
                    </div>
                  )}

                  <div>
                    <input
                      type="file"
                      id="profile-picture-input"
                      accept="image/*"
                      onChange={handleProfilePictureSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document
                          .getElementById("profile-picture-input")
                          ?.click()
                      }
                      className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Change Picture
                    </Button>
                    <p className="text-xs text-neutral-500 font-light mt-2">
                      Max size: 5MB. Formats: JPG, PNG, WebP
                    </p>
                  </div>
                </div>
              </div>

              {/* Name Fields */}
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
                    value={editFormData.first_name}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        first_name: e.target.value,
                      })
                    }
                    className="border-neutral-300 focus:border-black rounded-none h-10 font-light"
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
                    value={editFormData.last_name}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        last_name: e.target.value,
                      })
                    }
                    className="border-neutral-300 focus:border-black rounded-none h-10 font-light"
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label
                  htmlFor="bio"
                  className="text-sm font-medium text-black uppercase tracking-wider"
                >
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={editFormData.bio}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, bio: e.target.value })
                  }
                  rows={4}
                  className="border-neutral-300 focus:border-black rounded-none font-light resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label
                  htmlFor="website"
                  className="text-sm font-medium text-black uppercase tracking-wider"
                >
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={editFormData.website}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      website: e.target.value,
                    })
                  }
                  className="border-neutral-300 focus:border-black rounded-none h-10 font-light"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={editLoading}
                className="border-neutral-300 text-neutral-600 hover:border-black hover:text-black font-light rounded-none h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editLoading}
                className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-10"
              >
                {editLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
