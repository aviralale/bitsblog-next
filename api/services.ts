import api from "./axios";
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  Post,
  Category,
  Tag,
  BlogComment,
  PaginatedResponse,
} from "../types";

// Auth Services
export const authAPI = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>("/api/auth/login/", credentials),
  register: (data: RegisterData) =>
    api.post<AuthResponse>("/api/auth/register/", data),
  logout: () => api.post("/api/auth/logout/"),
  getCurrentUser: () => api.get<User>("/api/auth/me/"),
  updateCurrentUser: (data: FormData | Partial<User>) =>
    api.patch<User>("/api/auth/me/", data),
  getUserProfile: (username: string) =>
    api.get<User>(`/api/auth/users/${username}/`),
  getUserPosts: (username: string) =>
    api.get<Post[]>(`/api/auth/users/${username}/posts/`),
};

// Post Services
export const postAPI = {
  getAll: (params?: Record<string, any>) =>
    api.get<PaginatedResponse<Post>>("/api/posts/", { params }),
  getBySlug: (slug: string) => api.get<Post>(`/api/posts/${slug}/`),
  create: (data: FormData | any) => api.post<Post>("/api/posts/", data),
  update: (slug: string, data: FormData | any) =>
    api.patch<Post>(`/api/posts/${slug}/`, data),
  delete: (slug: string) => api.delete(`/api/posts/${slug}/`),
  getPopular: () => api.get<Post[]>("/api/posts/popular/"),
  getMyPosts: () => api.get<Post[]>("/api/posts/my_posts/"),
  /**
   * Get blog archives organized by year and month.
   *
   * This endpoint returns a hierarchical structure of posts grouped by
   * their publication date, making it easy to browse content chronologically.
   *
   * @param params Optional query parameters:
   *   - year: number - Filter to specific year
   *   - month: number - Filter to specific month (requires year)
   *   - posts: 'true' | 'false' - Whether to include full post details
   *
   * @example
   * // Get archives structure without post details (faster)
   * postAPI.getArchives({ posts: 'false' })
   *
   * @example
   * // Get all posts from December 2024
   * postAPI.getArchives({ year: 2024, month: 12 })
   *
   * @example
   * // Get all archives with full post details
   * postAPI.getArchives()
   */
  getArchives: (params?: {
    year?: number;
    month?: number;
    posts?: "true" | "false";
  }) => api.get("/api/posts/archives/", { params }),
};

// Category Services
export const categoryAPI = {
  getAll: () => api.get<Category[]>("/api/categories/"),
  getBySlug: (slug: string) => api.get<Category>(`/api/categories/${slug}/`),
  create: (data: { name: string; description?: string }) =>
    api.post<Category>("/api/categories/", data),
};

// Tag Services
export const tagAPI = {
  getAll: () => api.get<any>("/api/tags/"),
  getBySlug: (slug: string) => api.get<Tag>(`/api/tags/${slug}/`),
  create: (data: { name: string }) => api.post<Tag>("/api/tags/", data),
  search: (query: string) =>
    api.get<any>("/api/tags/", {
      params: {
        search: query,
        limit: 100, // Get more results per page for search
      },
    }),
};

// Comment Services
export const commentAPI = {
  getAll: (postSlug?: string) =>
    api.get<BlogComment[]>("/api/comments/", {
      params: postSlug ? { post__slug: postSlug } : undefined,
    }),
  create: (data: { post: number; content: string; parent?: number }) =>
    api.post<BlogComment>("/api/comments/", data),
  update: (id: number, content: string) =>
    api.patch<BlogComment>(`/api/comments/${id}/`, { content }),
  delete: (id: number) => api.delete(`/api/comments/${id}/`),
};

// Advertisement type
export interface Advertisement {
  id: number;
  title: string;
  slug: string;
  ad_type: "image" | "video" | "html";
  ad_type_display: string;
  image?: string;
  image_alt?: string;
  video_url?: string;
  video_thumbnail?: string;
  html_content?: string;
  link_url: string;
  cta_text?: string;
  open_in_new_tab: boolean;
  placement: string;
  placement_display: string;
  priority: number;
  impressions: number;
  clicks: number;
  click_through_rate: number;
  is_active: boolean;
  created_at: string;
}

export interface AdImpressionData {
  post_slug?: string;
}

export interface AdClickData {
  post_slug?: string;
}

// Ad Services
export const adAPI = {
  // Get ads for a placement
  getByPlacement: (placement: string, postSlug?: string) => {
    const params = new URLSearchParams({ placement });
    if (postSlug) {
      params.append("post_slug", postSlug);
    }
    return api.get<Advertisement[]>(`/api/ads/?${params.toString()}`);
  },

  // Get all ads (with optional filters)
  getAll: (params?: { placement?: string; post_slug?: string }) => {
    return api.get<Advertisement[]>("/api/ads/", { params });
  },

  // Get single ad
  getBySlug: (slug: string) => {
    return api.get<Advertisement>(`/api/ads/${slug}/`);
  },

  // Record impression
  recordImpression: (slug: string, data: AdImpressionData) => {
    return api.post(`/api/ads/${slug}/impression/`, data);
  },

  // Record click
  recordClick: (slug: string, data: AdClickData) => {
    return api.post(`/api/ads/${slug}/click/`, data);
  },
};

export const newsletterAPI = {
  // Subscribe to newsletter
  subscribe: (data: { email: string; source?: string }) =>
    api.post("/api/newsletter/subscribe/", data),

  // Verify email
  verifyEmail: (token: string) => api.get(`/api/newsletter/verify/${token}/`),

  // Unsubscribe
  unsubscribe: (token: string) =>
    api.get(`/api/newsletter/unsubscribe/${token}/`),

  // Admin only - Get subscriber stats
  getSubscriberStats: () => api.get("/api/newsletter/subscribers/stats/"),

  // Admin only - Get recent subscribers
  getRecentSubscribers: (limit: number = 10) =>
    api.get(
      `/api/newsletter/subscribers/?ordering=-subscribed_at&limit=${limit}`,
    ),

  // Admin only - Get newsletter overview
  getNewsletterOverview: () => api.get("/api/newsletter/newsletters/overview/"),
};
