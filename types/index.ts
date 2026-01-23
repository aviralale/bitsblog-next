export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio?: string;
  profile_picture?: string;
  website?: string;
  created_at: string;
  posts_count?: number;
  comments_count?: number;
  is_staff?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  posts_count: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  posts_count: number;
}

export interface BlogComment {
  id: number;
  post: number;
  author: User;
  content: string;
  parent?: number;
  created_at: string;
  updated_at: string;
  replies: BlogComment[];
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  author: User;
  content: string;
  excerpt?: string;
  featured_image?: string;
  category?: Category;
  tags: Tag[];
  status: "draft" | "published";
  views: number;
  created_at: string;
  updated_at?: string;
  published_at?: string;
  comments_count: number;
  comments?: BlogComment[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
