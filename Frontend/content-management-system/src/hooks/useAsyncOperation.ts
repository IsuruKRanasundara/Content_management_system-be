import { useState, useCallback } from 'react';
import { useAsyncJobs } from '../context/AsyncJobContext';
import { useToast } from '../context/ToastContext';
import { AsyncJob, JobStatus, JobType } from '../services/asyncJobService';

/**
 * Custom Hooks for Async Operations
 */

/**
 * Hook for executing async operations with full state management
 */
interface UseAsyncOperationOptions<T> {
  onSuccess?: (result: T, job: AsyncJob) => void;
  onError?: (error: Error, job?: AsyncJob) => void;
  successMessage?: string;
  errorMessage?: string;
  showToasts?: boolean;
  jobType?: JobType;
}

export const useAsyncOperation = <T = any,>(
  options?: UseAsyncOperationOptions<T>
) => {
  const { addJob, startPolling } = useAsyncJobs();
  const { showSuccess, showError, showInfo } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const [currentJob, setCurrentJob] = useState<AsyncJob | null>(null);

  const execute = useCallback(
    async (
      jobFn: () => Promise<{ jobId: string; message?: string; estimatedTime?: number }>
    ): Promise<T> => {
      setLoading(true);
      setError(null);
      setResult(null);

      try {
        // Execute the job creation
        const response = await jobFn();
        
        if (options?.showToasts !== false) {
          showInfo(
            'Job Started',
            response.message || 'Your request is being processed in the background.'
          );
        }

        // Create initial job object
        const initialJob: AsyncJob = {
          id: response.jobId,
          type: options?.jobType || JobType.CONTENT_PUBLISH,
          status: JobStatus.QUEUED,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            estimatedTime: response.estimatedTime,
          },
        };

        addJob(initialJob);
        setCurrentJob(initialJob);

        // Wait for completion
        return new Promise((resolve, reject) => {
          startPolling(response.jobId, {
            onProgress: (job) => {
              setCurrentJob(job);
            },
            onComplete: (job) => {
              setLoading(false);
              setCurrentJob(job);
              setResult(job.result as T);
              
              if (options?.showToasts !== false) {
                showSuccess(
                  'Completed',
                  options?.successMessage || 'Operation completed successfully.'
                );
              }
              
              options?.onSuccess?.(job.result as T, job);
              resolve(job.result as T);
            },
            onError: (err) => {
              setLoading(false);
              setError(err);
              
              if (options?.showToasts !== false) {
                showError(
                  'Failed',
                  options?.errorMessage || err.message
                );
              }
              
              options?.onError?.(err, currentJob || undefined);
              reject(err);
            },
          });
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setLoading(false);
        setError(error);
        
        if (options?.showToasts !== false) {
          showError('Failed', error.message);
        }
        
        options?.onError?.(error);
        throw error;
      }
    },
    [addJob, startPolling, showSuccess, showError, showInfo, options, currentJob]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResult(null);
    setCurrentJob(null);
  }, []);

  return {
    execute,
    loading,
    error,
    result,
    job: currentJob,
    reset,
  };
};

/**
 * Hook for polling a specific job
 */
export const useJobPolling = (jobId: string | null) => {
  const { getJob, startPolling, stopPolling } = useAsyncJobs();
  const [polling, setPolling] = useState(false);

  const job = jobId ? getJob(jobId) : null;

  const startPoll = useCallback(
    (options?: {
      onProgress?: (job: AsyncJob) => void;
      onComplete?: (job: AsyncJob) => void;
      onError?: (error: Error) => void;
    }) => {
      if (!jobId) return;
      
      setPolling(true);
      startPolling(jobId, {
        onProgress: options?.onProgress,
        onComplete: (job) => {
          setPolling(false);
          options?.onComplete?.(job);
        },
        onError: (error) => {
          setPolling(false);
          options?.onError?.(error);
        },
      });
    },
    [jobId, startPolling]
  );

  const stopPoll = useCallback(() => {
    if (!jobId) return;
    stopPolling(jobId);
    setPolling(false);
  }, [jobId, stopPolling]);

  return {
    job,
    polling,
    startPoll,
    stopPoll,
  };
};

/**
 * Hook for batch operations
 */
export const useBatchOperation = <T = any,>() => {
  const [operations, setOperations] = useState<Map<string, AsyncJob>>(new Map());
  const { addJob, startPolling } = useAsyncJobs();
  const { showSuccess, showError } = useToast();

  const executeBatch = useCallback(
    async (
      jobFns: Array<() => Promise<{ jobId: string; message?: string }>>
    ): Promise<T[]> => {
      setOperations(new Map());

      const promises = jobFns.map(async (jobFn) => {
        const response = await jobFn();
        
        const initialJob: AsyncJob = {
          id: response.jobId,
          type: JobType.BULK_DELETE,
          status: JobStatus.QUEUED,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        addJob(initialJob);
        setOperations(prev => new Map(prev).set(response.jobId, initialJob));

        return new Promise<T>((resolve, reject) => {
          startPolling(response.jobId, {
            onProgress: (job) => {
              setOperations(prev => new Map(prev).set(job.id, job));
            },
            onComplete: (job) => {
              setOperations(prev => new Map(prev).set(job.id, job));
              resolve(job.result as T);
            },
            onError: (err) => {
              reject(err);
            },
          });
        });
      });

      try {
        const results = await Promise.all(promises);
        showSuccess('Batch Complete', 'All operations completed successfully.');
        return results;
      } catch (error) {
        showError('Batch Failed', 'Some operations failed. Please review the results.');
        throw error;
      }
    },
    [addJob, startPolling, showSuccess, showError]
  );

  return {
    executeBatch,
    operations: Array.from(operations.values()),
    inProgress: Array.from(operations.values()).some(job => 
      [JobStatus.PENDING, JobStatus.QUEUED, JobStatus.PROCESSING].includes(job.status)
    ),
  };
};

/**
 * Hook for preventing duplicate submissions
 */
export const usePreventDuplicate = () => {
  const [submitting, setSubmitting] = useState(false);

  const withPreventDuplicate = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      if (submitting) {
        throw new Error('Operation already in progress');
      }

      setSubmitting(true);
      try {
        const result = await fn();
        return result;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting]
  );

  return {
    submitting,
    execute: withPreventDuplicate,
  };
};

export default {
  useAsyncOperation,
  useJobPolling,
  useBatchOperation,
  usePreventDuplicate,
};
