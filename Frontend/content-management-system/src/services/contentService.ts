import api from './api';

/**
 * Content Service with Async Job Support
 * Handles content operations that trigger RabbitMQ background jobs
 */

export interface Content {
  id: string;
  title: string;
  body: string;
  status: 'draft' | 'published' | 'archived';
  authorId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface PublishContentRequest {
  contentId: string;
  publishDate?: string;
  sendNotification?: boolean;
}

export interface BulkOperationRequest {
  contentIds: string[];
  operation: 'publish' | 'unpublish' | 'delete' | 'archive';
}

/**
 * Publish content - Returns jobId for async tracking
 */
export const publishContent = async (request: PublishContentRequest) => {
  const response = await api.post('/contents/publish', request);
  return response.data; // { jobId, message, estimatedTime }
};

/**
 * Unpublish content - Returns jobId for async tracking
 */
export const unpublishContent = async (contentId: string) => {
  const response = await api.post(`/contents/${contentId}/unpublish`);
  return response.data;
};

/**
 * Bulk content operations - Returns jobId for async tracking
 */
export const bulkContentOperation = async (request: BulkOperationRequest) => {
  const response = await api.post('/contents/bulk', request);
  return response.data;
};

/**
 * Get all content (synchronous)
 */
export const getContents = async (filters?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

  const response = await api.get<Content[]>(`/contents?${params.toString()}`);
  return response.data;
};

/**
 * Get single content (synchronous)
 */
export const getContent = async (id: string) => {
  const response = await api.get<Content>(`/contents/${id}`);
  return response.data;
};

/**
 * Create content (synchronous)
 */
export const createContent = async (data: Partial<Content>) => {
  const response = await api.post<Content>('/contents', data);
  return response.data;
};

/**
 * Update content (synchronous)
 */
export const updateContent = async (id: string, data: Partial<Content>) => {
  const response = await api.put<Content>(`/contents/${id}`, data);
  return response.data;
};

/**
 * Delete content (synchronous)
 */
export const deleteContent = async (id: string) => {
  await api.delete(`/contents/${id}`);
};

export default {
  publishContent,
  unpublishContent,
  bulkContentOperation,
  getContents,
  getContent,
  createContent,
  updateContent,
  deleteContent,
};
