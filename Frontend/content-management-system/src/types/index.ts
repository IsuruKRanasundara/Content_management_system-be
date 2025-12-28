export interface User {
  userId: number;
  username: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Writer';
  isActive: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Content {
  contentId: number;
  title: string;
  body: string;
  status: 'Draft' | 'Published';
  categoryId?: number;
}

export interface CreateContentRequest {
  title: string;
  body: string;
  categoryId?: number;
}

export interface UpdateContentRequest {
  title?: string;
  body?: string;
  status?: 'Draft' | 'Published';
  categoryId?: number;
}
