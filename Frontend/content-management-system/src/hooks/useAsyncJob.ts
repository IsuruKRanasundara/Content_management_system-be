import { useState, useEffect, useCallback, useRef } from 'react';
import asyncJobService, { AsyncJob, JobStatus, JobCreationResponse } from '../services/asyncJobService';
import { useToast } from '../components/notifications/ToastSystem';

/**
 * Hook for tracking a single async job
 */
export function useAsyncJob(jobId: string | null) {
  const [job, setJob] = useState<AsyncJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    asyncJobService
      .pollJobUntilComplete(jobId, {
        onProgress: (updatedJob) => {
          if (mounted) {
            setJob(updatedJob);
          }
        },
      })
      .then((completedJob) => {
        if (mounted) {
          setJob(completedJob);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
      if (jobId) {
        asyncJobService.stopPolling(jobId);
      }
    };
  }, [jobId]);

  return { job, loading, error };
}

/**
 * Hook for executing async jobs with automatic polling
 */
export function useAsyncJobExecutor<T = any>() {
  const [job, setJob] = useState<AsyncJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const { showSuccess, showError, showInfo } = useToast();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      asyncJobService.stopAllPolling();
    };
  }, []);

  const execute = useCallback(
    async (
      jobFn: () => Promise<JobCreationResponse>,
      options?: {
        successMessage?: string;
        errorMessage?: string;
        onProgress?: (progress: number) => void;
      }
    ) => {
      try {
        setLoading(true);
        setError(null);
        setResult(null);
        setJob(null);

        // Show info toast that job is queued
        showInfo('Job Queued', 'Your request is being processed...');

        // Execute and poll for completion
        const completedResult = await asyncJobService.executeAndWaitForJob<T>(
          jobFn,
          {
            onProgress: (updatedJob) => {
              if (mountedRef.current) {
                setJob(updatedJob);
                if (options?.onProgress && updatedJob.progress !== undefined) {
                  options.onProgress(updatedJob.progress);
                }
              }
            },
          }
        );

        if (mountedRef.current) {
          setResult(completedResult);
          setLoading(false);
          showSuccess(
            options?.successMessage || 'Job Completed',
            'Your request has been processed successfully.'
          );
        }

        return completedResult;
      } catch (err: any) {
        if (mountedRef.current) {
          const errorMessage = err.message || 'An error occurred';
          setError(errorMessage);
          setLoading(false);
          showError(
            options?.errorMessage || 'Job Failed',
            errorMessage
          );
        }
        throw err;
      }
    },
    [showSuccess, showError, showInfo]
  );

  const reset = useCallback(() => {
    setJob(null);
    setLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    job,
    loading,
    error,
    result,
    execute,
    reset,
  };
}

/**
 * Hook for listing and managing multiple jobs
 */
export function useAsyncJobList(autoRefresh = true, refreshInterval = 5000) {
  const [jobs, setJobs] = useState<AsyncJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const jobList = await asyncJobService.getUserJobs();
      setJobs(jobList);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();

    if (autoRefresh) {
      intervalRef.current = setInterval(fetchJobs, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchJobs, autoRefresh, refreshInterval]);

  const cancelJob = useCallback(
    async (jobId: string) => {
      try {
        await asyncJobService.cancelJob(jobId);
        await fetchJobs(); // Refresh list
      } catch (err: any) {
        console.error('Failed to cancel job:', err);
      }
    },
    [fetchJobs]
  );

  return {
    jobs,
    loading,
    error,
    refresh: fetchJobs,
    cancelJob,
  };
}

/**
 * Hook for implementing retry logic
 */
export function useRetryableAsyncJob<T = any>(maxRetries = 3) {
  const [retryCount, setRetryCount] = useState(0);
  const executor = useAsyncJobExecutor<T>();

  const executeWithRetry = useCallback(
    async (
      jobFn: () => Promise<JobCreationResponse>,
      options?: Parameters<typeof executor.execute>[1]
    ) => {
      try {
        return await executor.execute(jobFn, options);
      } catch (err) {
        if (retryCount < maxRetries) {
          setRetryCount((prev) => prev + 1);
          console.log(`Retrying... Attempt ${retryCount + 1} of ${maxRetries}`);
          // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
          return executeWithRetry(jobFn, options);
        }
        throw err;
      }
    },
    [executor, retryCount, maxRetries]
  );

  const reset = useCallback(() => {
    setRetryCount(0);
    executor.reset();
  }, [executor]);

  return {
    ...executor,
    executeWithRetry,
    retryCount,
    maxRetries,
    reset,
  };
}

/**
 * Hook for batch job execution
 */
export function useBatchAsyncJobs() {
  const [jobs, setJobs] = useState<Map<string, AsyncJob>>(new Map());
  const [completedCount, setCompletedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const { showInfo, showSuccess, showError } = useToast();

  const executeBatch = useCallback(
    async (
      jobFunctions: Array<() => Promise<JobCreationResponse>>,
      options?: {
        onProgress?: (completed: number, total: number) => void;
        onJobComplete?: (jobId: string, result: any) => void;
        onJobFail?: (jobId: string, error: string) => void;
      }
    ) => {
      setTotalCount(jobFunctions.length);
      setCompletedCount(0);
      setFailedCount(0);
      
      showInfo('Batch Processing', `Starting ${jobFunctions.length} jobs...`);

      const results = await Promise.allSettled(
        jobFunctions.map(async (jobFn) => {
          try {
            const { jobId } = await jobFn();
            
            const result = await asyncJobService.pollJobUntilComplete(jobId, {
              onProgress: (job) => {
                setJobs((prev) => new Map(prev).set(jobId, job));
              },
            });

            setCompletedCount((prev) => prev + 1);
            options?.onJobComplete?.(jobId, result);
            options?.onProgress?.(completedCount + 1, totalCount);
            
            return result;
          } catch (err: any) {
            setFailedCount((prev) => prev + 1);
            options?.onJobFail?.(err.jobId, err.message);
            throw err;
          }
        })
      );

      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      if (failed === 0) {
        showSuccess('Batch Complete', `All ${succeeded} jobs completed successfully.`);
      } else if (succeeded === 0) {
        showError('Batch Failed', `All ${failed} jobs failed.`);
      } else {
        showSuccess(
          'Batch Partially Complete',
          `${succeeded} jobs succeeded, ${failed} jobs failed.`
        );
      }

      return results;
    },
    [showInfo, showSuccess, showError, completedCount, totalCount]
  );

  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return {
    jobs: Array.from(jobs.values()),
    executeBatch,
    progress,
    completedCount,
    failedCount,
    totalCount,
    isProcessing: totalCount > 0 && completedCount + failedCount < totalCount,
  };
}

export default {
  useAsyncJob,
  useAsyncJobExecutor,
  useAsyncJobList,
  useRetryableAsyncJob,
  useBatchAsyncJobs,
};
