import api from './api';

/**
 * Job Status Types
 * These represent the possible states of an async job processed by RabbitMQ
 */
export enum JobStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Job Type Categories
 * Different types of background jobs handled by the system
 */
export enum JobType {
  CONTENT_PUBLISH = 'content_publish',
  CONTENT_UNPUBLISH = 'content_unpublish',
  BULK_DELETE = 'bulk_delete',
  EXPORT_DATA = 'export_data',
  IMPORT_DATA = 'import_data',
  SEND_NOTIFICATION = 'send_notification',
  PROCESS_MEDIA = 'process_media',
}

/**
 * Job Response Interface
 */
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

/**
 * Job Creation Response
 */
export interface JobCreationResponse {
  jobId: string;
  message: string;
  estimatedTime?: number; // in seconds
}

/**
 * Polling Configuration
 */
const POLL_INTERVAL = parseInt(import.meta.env.VITE_POLL_INTERVAL || '2000');
const MAX_POLL_ATTEMPTS = parseInt(import.meta.env.VITE_MAX_POLL_ATTEMPTS || '30');

/**
 * Async Job Service
 * Handles communication with backend for async job management
 */
class AsyncJobService {
  private activePolls: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Check job status
   */
  async getJobStatus(jobId: string): Promise<AsyncJob> {
    const response = await api.get<AsyncJob>(`/jobs/${jobId}`);
    return response.data;
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<void> {
    await api.post(`/jobs/${jobId}/cancel`);
  }

  /**
   * Get all jobs for current user
   */
  async getUserJobs(filter?: { status?: JobStatus; type?: JobType }): Promise<AsyncJob[]> {
    const params = new URLSearchParams();
    if (filter?.status) params.append('status', filter.status);
    if (filter?.type) params.append('type', filter.type);
    
    const response = await api.get<AsyncJob[]>(`/jobs?${params.toString()}`);
    return response.data;
  }

  /**
   * Poll for job completion
   * Returns a promise that resolves when the job is complete or fails
   */
  async pollJobUntilComplete(
    jobId: string,
    options?: {
      onProgress?: (job: AsyncJob) => void;
      onStatusChange?: (status: JobStatus) => void;
      pollInterval?: number;
      maxAttempts?: number;
    }
  ): Promise<AsyncJob> {
    const pollInterval = options?.pollInterval || POLL_INTERVAL;
    const maxAttempts = options?.maxAttempts || MAX_POLL_ATTEMPTS;
    
    let attempts = 0;
    let lastStatus: JobStatus | null = null;

    return new Promise((resolve, reject) => {
      const pollFn = async () => {
        try {
          attempts++;
          
          if (attempts > maxAttempts) {
            this.stopPolling(jobId);
            reject(new Error(`Job polling timed out after ${maxAttempts} attempts`));
            return;
          }

          const job = await this.getJobStatus(jobId);
          
          // Notify progress callback
          if (options?.onProgress) {
            options.onProgress(job);
          }

          // Notify status change
          if (lastStatus !== job.status && options?.onStatusChange) {
            options.onStatusChange(job.status);
            lastStatus = job.status;
          }

          // Check if job is complete
          if (job.status === JobStatus.COMPLETED) {
            this.stopPolling(jobId);
            resolve(job);
            return;
          }

          // Check if job failed
          if (job.status === JobStatus.FAILED || job.status === JobStatus.CANCELLED) {
            this.stopPolling(jobId);
            reject(new Error(job.error || `Job ${job.status}`));
            return;
          }

          // Continue polling
        } catch (error) {
          console.error('Error polling job status:', error);
          
          // Don't fail immediately on network errors, retry
          if (attempts >= maxAttempts) {
            this.stopPolling(jobId);
            reject(error);
          }
        }
      };

      // Initial poll
      pollFn();

      // Set up interval
      const intervalId = setInterval(pollFn, pollInterval);
      this.activePolls.set(jobId, intervalId);
    });
  }

  /**
   * Stop polling for a specific job
   */
  stopPolling(jobId: string): void {
    const intervalId = this.activePolls.get(jobId);
    if (intervalId) {
      clearInterval(intervalId);
      this.activePolls.delete(jobId);
    }
  }

  /**
   * Stop all active polling
   */
  stopAllPolling(): void {
    this.activePolls.forEach((intervalId) => clearInterval(intervalId));
    this.activePolls.clear();
  }

  /**
   * Helper: Start a job and wait for completion
   */
  async executeAndWaitForJob<T = any>(
    executeJobFn: () => Promise<JobCreationResponse>,
    options?: Parameters<typeof this.pollJobUntilComplete>[1]
  ): Promise<T> {
    // Execute the job
    const { jobId } = await executeJobFn();

    // Wait for completion
    const completedJob = await this.pollJobUntilComplete(jobId, options);

    return completedJob.result as T;
  }
}

export const asyncJobService = new AsyncJobService();
export default asyncJobService;
