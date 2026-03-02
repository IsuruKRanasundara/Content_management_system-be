import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { asyncJobService, AsyncJob, JobStatus, JobType } from '../services/asyncJobService';

/**
 * Centralized State Management for Async Jobs
 * Manages all background jobs across the application
 */

interface AsyncJobContextType {
  // Job State
  jobs: AsyncJob[];
  activeJobs: AsyncJob[];
  completedJobs: AsyncJob[];
  failedJobs: AsyncJob[];
  
  // Job Management
  addJob: (job: AsyncJob) => void;
  updateJob: (jobId: string, updates: Partial<AsyncJob>) => void;
  removeJob: (jobId: string) => void;
  cancelJob: (jobId: string) => Promise<void>;
  retryJob: (jobId: string) => void;
  clearCompletedJobs: () => void;
  clearAllJobs: () => void;
  
  // Job Queries
  getJob: (jobId: string) => AsyncJob | undefined;
  getJobsByType: (type: JobType) => AsyncJob[];
  getJobsByStatus: (status: JobStatus) => AsyncJob[];
  hasActiveJobs: () => boolean;
  
  // Loading States
  isLoading: boolean;
  error: string | null;
  
  // Polling Management
  startPolling: (jobId: string, options?: PollingOptions) => void;
  stopPolling: (jobId: string) => void;
  
  // Refresh
  refreshJobs: () => Promise<void>;
}

interface PollingOptions {
  onProgress?: (job: AsyncJob) => void;
  onComplete?: (job: AsyncJob) => void;
  onError?: (error: Error) => void;
}

const AsyncJobContext = createContext<AsyncJobContextType | undefined>(undefined);

interface AsyncJobProviderProps {
  children: ReactNode;
  autoRefreshInterval?: number; // Auto-refresh all jobs every N milliseconds
  persistState?: boolean; // Persist jobs to localStorage
}

export const AsyncJobProvider: React.FC<AsyncJobProviderProps> = ({
  children,
  autoRefreshInterval = 30000, // 30 seconds default
  persistState = true,
}) => {
  const [jobs, setJobs] = useState<AsyncJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingJobs, setPollingJobs] = useState<Set<string>>(new Set());

  // Load jobs from localStorage on mount
  useEffect(() => {
    if (persistState) {
      const savedJobs = localStorage.getItem('asyncJobs');
      if (savedJobs) {
        try {
          setJobs(JSON.parse(savedJobs));
        } catch (e) {
          console.error('Failed to parse saved jobs:', e);
        }
      }
    }
  }, [persistState]);

  // Save jobs to localStorage whenever they change
  useEffect(() => {
    if (persistState && jobs.length > 0) {
      localStorage.setItem('asyncJobs', JSON.stringify(jobs));
    }
  }, [jobs, persistState]);

  // Auto-refresh jobs periodically
  useEffect(() => {
    if (autoRefreshInterval > 0) {
      const interval = setInterval(() => {
        refreshJobs();
      }, autoRefreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval]);

  // Computed values
  const activeJobs = jobs.filter(job => 
    [JobStatus.PENDING, JobStatus.QUEUED, JobStatus.PROCESSING].includes(job.status)
  );
  
  const completedJobs = jobs.filter(job => job.status === JobStatus.COMPLETED);
  const failedJobs = jobs.filter(job => job.status === JobStatus.FAILED);

  // Add a job to state
  const addJob = useCallback((job: AsyncJob) => {
    setJobs(prev => {
      // Avoid duplicates
      if (prev.some(j => j.id === job.id)) {
        return prev.map(j => j.id === job.id ? job : j);
      }
      return [job, ...prev];
    });
  }, []);

  // Update a job
  const updateJob = useCallback((jobId: string, updates: Partial<AsyncJob>) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, ...updates, updatedAt: new Date().toISOString() } : job
    ));
  }, []);

  // Remove a job
  const removeJob = useCallback((jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
    asyncJobService.stopPolling(jobId);
  }, []);

  // Cancel a job
  const cancelJob = useCallback(async (jobId: string) => {
    try {
      await asyncJobService.cancelJob(jobId);
      updateJob(jobId, { status: JobStatus.CANCELLED });
      asyncJobService.stopPolling(jobId);
    } catch (err) {
      console.error('Failed to cancel job:', err);
      throw err;
    }
  }, [updateJob]);

  // Retry a failed job (placeholder - requires backend support)
  const retryJob = useCallback((jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      updateJob(jobId, { status: JobStatus.PENDING, error: undefined });
      startPolling(jobId);
    }
  }, [jobs, updateJob]);

  // Clear completed jobs
  const clearCompletedJobs = useCallback(() => {
    setJobs(prev => prev.filter(job => job.status !== JobStatus.COMPLETED));
  }, []);

  // Clear all jobs
  const clearAllJobs = useCallback(() => {
    asyncJobService.stopAllPolling();
    setJobs([]);
    if (persistState) {
      localStorage.removeItem('asyncJobs');
    }
  }, [persistState]);

  // Get a specific job
  const getJob = useCallback((jobId: string) => {
    return jobs.find(job => job.id === jobId);
  }, [jobs]);

  // Get jobs by type
  const getJobsByType = useCallback((type: JobType) => {
    return jobs.filter(job => job.type === type);
  }, [jobs]);

  // Get jobs by status
  const getJobsByStatus = useCallback((status: JobStatus) => {
    return jobs.filter(job => job.status === status);
  }, [jobs]);

  // Check if there are active jobs
  const hasActiveJobs = useCallback(() => {
    return activeJobs.length > 0;
  }, [activeJobs]);

  // Start polling for a job
  const startPolling = useCallback((jobId: string, options?: PollingOptions) => {
    if (pollingJobs.has(jobId)) {
      console.log(`Already polling job ${jobId}`);
      return;
    }

    setPollingJobs(prev => new Set(prev).add(jobId));

    asyncJobService.pollJobUntilComplete(jobId, {
      onProgress: (job) => {
        updateJob(jobId, job);
        options?.onProgress?.(job);
      },
      onStatusChange: (status) => {
        updateJob(jobId, { status });
      },
    })
    .then((completedJob) => {
      updateJob(jobId, completedJob);
      options?.onComplete?.(completedJob);
    })
    .catch((err) => {
      console.error(`Polling failed for job ${jobId}:`, err);
      updateJob(jobId, { 
        status: JobStatus.FAILED, 
        error: err.message 
      });
      options?.onError?.(err);
    })
    .finally(() => {
      setPollingJobs(prev => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    });
  }, [pollingJobs, updateJob]);

  // Stop polling for a job
  const stopPolling = useCallback((jobId: string) => {
    asyncJobService.stopPolling(jobId);
    setPollingJobs(prev => {
      const next = new Set(prev);
      next.delete(jobId);
      return next;
    });
  }, []);

  // Refresh all jobs from backend
  const refreshJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userJobs = await asyncJobService.getUserJobs();
      
      // Update existing jobs and add new ones
      setJobs(prev => {
        const jobMap = new Map(prev.map(j => [j.id, j]));
        
        userJobs.forEach(job => {
          jobMap.set(job.id, job);
        });
        
        return Array.from(jobMap.values());
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh jobs';
      setError(errorMessage);
      console.error('Failed to refresh jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AsyncJobContextType = {
    jobs,
    activeJobs,
    completedJobs,
    failedJobs,
    addJob,
    updateJob,
    removeJob,
    cancelJob,
    retryJob,
    clearCompletedJobs,
    clearAllJobs,
    getJob,
    getJobsByType,
    getJobsByStatus,
    hasActiveJobs,
    isLoading,
    error,
    startPolling,
    stopPolling,
    refreshJobs,
  };

  return (
    <AsyncJobContext.Provider value={value}>
      {children}
    </AsyncJobContext.Provider>
  );
};

// Custom hook to use the context
export const useAsyncJobs = (): AsyncJobContextType => {
  const context = useContext(AsyncJobContext);
  if (!context) {
    throw new Error('useAsyncJobs must be used within an AsyncJobProvider');
  }
  return context;
};

// Hook for executing a single job with automatic state management
export const useAsyncJobExecutor = () => {
  const { addJob, startPolling } = useAsyncJobs();
  const [executing, setExecuting] = useState(false);

  const execute = useCallback(async <T,>(
    jobFn: () => Promise<{ jobId: string; message: string }>,
    options?: {
      onProgress?: (job: AsyncJob) => void;
      onComplete?: (job: AsyncJob) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<T> => {
    setExecuting(true);
    
    try {
      // Execute the job
      const response = await jobFn();
      
      // Create initial job object
      const initialJob: AsyncJob = {
        id: response.jobId,
        type: JobType.CONTENT_PUBLISH, // Default, should be passed in
        status: JobStatus.QUEUED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      addJob(initialJob);
      
      // Start polling
      return new Promise((resolve, reject) => {
        startPolling(response.jobId, {
          onProgress: options?.onProgress,
          onComplete: (job) => {
            setExecuting(false);
            options?.onComplete?.(job);
            resolve(job.result as T);
          },
          onError: (error) => {
            setExecuting(false);
            options?.onError?.(error);
            reject(error);
          },
        });
      });
    } catch (error) {
      setExecuting(false);
      throw error;
    }
  }, [addJob, startPolling]);

  return { execute, executing };
};

export default AsyncJobContext;
