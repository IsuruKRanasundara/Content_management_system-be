import api from './api';
import type { Comment, PagedResult } from '../types';

export interface CreateCommentPayload {
  contentId: number;
  text: string;
  parentId?: string | null;
}

export interface UpdateCommentPayload {
  text?: string;
  isModerated?: boolean;
}

export const fetchComments = async (contentId: number, page = 1, pageSize = 10) => {
  const response = await api.get<PagedResult<Comment>>(
    `/comments/content/${contentId}`,
    { params: { page, pageSize } }
  );
  return response.data;
};

export const createComment = async (payload: CreateCommentPayload) => {
  const response = await api.post<Comment>('/comments', payload);
  return response.data;
};

export const updateComment = async (id: string, payload: UpdateCommentPayload) => {
  const response = await api.put<Comment>(`/comments/${id}`, payload);
  return response.data;
};

export const deleteComment = async (id: string) => {
  await api.delete(`/comments/${id}`);
};
