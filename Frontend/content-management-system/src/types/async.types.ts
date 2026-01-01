/**
 * Type Definitions for Async Operations
 * Centralized types for working with RabbitMQ-based async jobs
 */

// ==================== Job Types ====================

export enum JobStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum JobType {
  CONTENT_PUBLISH = 'content_publish',
  CONTENT_UNPUBLISH = 'content_unpublish',
  CONTENT_UPDATE = 'content_update',
  BULK_DELETE = 'bulk_delete',
  BULK_UPDATE = 'bulk_update',
  EXPORT_DATA = 'export_data',
  IMPORT_DATA = 'import_data',
  SEND_NOTIFICATION = 'send_notification',
  PROCESS_MEDIA = 'process_media',
  GENERATE_REPORT = 'generate_report',
}

export interface AsyncJob {
  id: string;
  type: JobType;
  status: JobStatus;
  progress?: number; // 0-100
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

export interface JobCreationResponse {
  jobId: string;
  message: string;
  estimatedTime?: number; // in seconds
}

// ==================== API Response Types ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==================== Content Types ====================

export interface Content {
  id: string;
  title: string;
  body: string;
  status: 'draft' | 'published' | 'archived';
  authorId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  tags?: string[];
}

export interface ContentWithJob extends Content {
  pendingJobId?: string;
  lastJobStatus?: JobStatus;
}

// ==================== Notification Types ====================

export enum NotificationType {
  JOB_COMPLETED = 'job_completed',
  JOB_FAILED = 'job_failed',
  CONTENT_PUBLISHED = 'content_published',
  SYSTEM_ALERT = 'system_alert',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: {
    jobId?: string;
    contentId?: string;
    actionUrl?: string;
  };
}

// ==================== Error Types ====================

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
}

export class AsyncJobError extends Error {
  constructor(
    message: string,
    public jobId?: string,
    public status?: JobStatus
  ) {
    super(message);
    this.name = 'AsyncJobError';
  }
}

// ==================== Hook Return Types ====================

export interface UseAsyncJobResult {
  job: AsyncJob | null;
  loading: boolean;
  error: string | null;
}

export interface UseAsyncJobExecutorResult<T = any> {
  job: AsyncJob | null;
  loading: boolean;
  error: string | null;
  result: T | null;
  execute: (
    jobFn: () => Promise<JobCreationResponse>,
    options?: ExecuteOptions
  ) => Promise<T>;
  reset: () => void;
}

export interface ExecuteOptions {
  successMessage?: string;
  errorMessage?: string;
  onProgress?: (progress: number) => void;
}

// ==================== Utility Types ====================

export type JobFilter = {
  status?: JobStatus | JobStatus[];
  type?: JobType | JobType[];
  dateFrom?: string;
  dateTo?: string;
};

export type SortDirection = 'asc' | 'desc';

export type JobSort = {
  field: 'createdAt' | 'updatedAt' | 'status' | 'type';
  direction: SortDirection;
};

// ==================== Configuration Types ====================

export interface ApiConfig {
  apiUrl: string;
  timeout: number;
  debugMode: boolean;
}

export interface PollingConfig {
  interval: number;
  maxAttempts: number;
  backoffMultiplier?: number;
}

export interface FeatureFlags {
  enableNotifications: boolean;
  enableRealTimeUpdates: boolean;
  enableBatchOperations: boolean;
  enableRetry: boolean;
}

// ==================== Component Props Types ====================

export interface JobStatusBadgeProps {
  status: JobStatus;
  className?: string;
}

export interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export interface ProcessingIndicatorProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface AsyncJobCardProps {
  job: AsyncJob;
  onCancel?: (jobId: string) => void;
  onRetry?: (jobId: string) => void;
  onViewDetails?: (job: AsyncJob) => void;
  className?: string;
}

// ==================== Context Types ====================

export interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ==================== Form Types ====================

export interface ContentPublishForm {
  contentId: string;
  publishDate?: string;
  sendNotification?: boolean;
  notificationRecipients?: string[];
}

export interface BulkOperationForm {
  contentIds: string[];
  operation: 'delete' | 'publish' | 'archive' | 'update';
  options?: Record<string, any>;
}

export interface ImportDataForm {
  file: File;
  format: 'json' | 'csv' | 'xml';
  options?: {
    skipDuplicates?: boolean;
    overwriteExisting?: boolean;
    validateOnly?: boolean;
  };
}

// ==================== Type Guards ====================

export function isJobComplete(status: JobStatus): boolean {
  return [JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED].includes(status);
}

export function isJobActive(status: JobStatus): boolean {
  return [JobStatus.PENDING, JobStatus.QUEUED, JobStatus.PROCESSING].includes(status);
}

export function isJobSuccessful(job: AsyncJob): boolean {
  return job.status === JobStatus.COMPLETED && !job.error;
}

export function hasJobFailed(job: AsyncJob): boolean {
  return job.status === JobStatus.FAILED || Boolean(job.error);
}

// ==================== Type Assertions ====================

export function assertJobCreationResponse(
  response: any
): asserts response is JobCreationResponse {
  if (!response || typeof response.jobId !== 'string') {
    throw new Error('Invalid job creation response');
  }
}

export function assertAsyncJob(job: any): asserts job is AsyncJob {
  if (!job || typeof job.id !== 'string' || !job.status || !job.type) {
    throw new Error('Invalid async job object');
  }
}
