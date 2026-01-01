import React, { useState } from 'react';
import { useAsyncJobExecutor, useAsyncJobList, useBatchAsyncJobs } from'../hooks/useAsyncJob';
import {
  JobStatusBadge,
  ProgressBar,
  ProcessingIndicator,
  AsyncJobCard,
} from '../components/async/AsyncJobComponents';
import { useToast } from '../components/notifications/ToastSystem';
import api from '../services/api';

/**
 * Example Page: Async Operations Demo
 * 
 * This page demonstrates how to integrate async RabbitMQ-based operations
 * in your React frontend. It shows:
 * - Single job execution with progress tracking
 * - Job listing and management
 * - Batch operations
 * - Real-time status updates
 */
export default function AsyncOperationsExample() {
  const [selectedContentId, setSelectedContentId] = useState('example-content-1');
  const { showInfo } = useToast();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Async Operations Demo</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Single Job Execution */}
        <SingleJobExample contentId={selectedContentId} />

        {/* Batch Operations */}
        <BatchOperationsExample />
      </div>

      {/* Job List Dashboard */}
      <div className="mt-8">
        <JobListExample />
      </div>

      {/* Educational Section */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          ℹ️ How This Works
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>
            <strong>Step 1:</strong> Frontend sends request to backend API endpoint
            (e.g., POST /api/contents/:id/publish-async)
          </li>
          <li>
            <strong>Step 2:</strong> Backend immediately returns a Job ID and queues
            the task in RabbitMQ
          </li>
          <li>
            <strong>Step 3:</strong> Frontend polls GET /api/jobs/:jobId to check status
          </li>
          <li>
            <strong>Step 4:</strong> RabbitMQ worker processes the job in the background
          </li>
          <li>
            <strong>Step 5:</strong> When complete, frontend receives the result and
            shows notification
          </li>
        </ul>
        <button
          onClick={() => showInfo('Architecture', 'Check the console for detailed logs!')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Learn More
        </button>
      </div>
    </div>
  );
}

/**
 * Example 1: Single Job Execution
 * Demonstrates publishing content asynchronously
 */
function SingleJobExample({ contentId }: { contentId: string }) {
  const { execute, loading, job, error, result } = useAsyncJobExecutor();

  const handlePublish = async () => {
    try {
      await execute(
        async () => {
          // This would be your actual API call
          // Example: POST /api/contents/:id/publish-async
          const response = await api.post(`/contents/${contentId}/publish-async`);
          return response.data; // { jobId: string, message: string }
        },
        {
          successMessage: 'Content Published Successfully',
          errorMessage: 'Failed to publish content',
          onProgress: (progress) => {
            console.log(`Publishing progress: ${progress}%`);
          },
        }
      );
    } catch (err) {
      console.error('Publish failed:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Single Job Execution</h2>
      <p className="text-gray-600 text-sm mb-4">
        Execute a single async operation and track its progress
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content ID
          </label>
          <input
            type="text"
            value={contentId}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
          />
        </div>

        <button
          onClick={handlePublish}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Publishing...' : 'Publish Content'}
        </button>

        {loading && (
          <ProcessingIndicator message="Publishing content..." />
        )}

        {job && (
          <div className="p-4 bg-gray-50 rounded">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Job Status</span>
              <JobStatusBadge status={job.status} />
            </div>
            
            {job.progress !== undefined && (
              <ProgressBar progress={job.progress} showPercentage />
            )}

            <div className="mt-3 text-xs text-gray-600">
              <p>Job ID: {job.id}</p>
              <p>Type: {job.type}</p>
              <p>Created: {new Date(job.createdAt).toLocaleString()}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded text-sm text-green-800">
            <strong>Success!</strong> Job completed successfully.
            <pre className="mt-2 text-xs">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example 2: Batch Operations
 * Demonstrates processing multiple items at once
 */
function BatchOperationsExample() {
  const [itemCount, setItemCount] = useState(5);
  const { executeBatch, progress, isProcessing, completedCount, totalCount, jobs } =
    useBatchAsyncJobs();

  const handleBatchDelete = async () => {
    // Generate mock content IDs
    const contentIds = Array.from({ length: itemCount }, (_, i) => `content-${i + 1}`);

    const jobFunctions = contentIds.map((id) => async () => {
      // This would be your actual API call
      // Example: DELETE /api/contents/:id/async
      const response = await api.delete(`/contents/${id}/async`);
      return response.data;
    });

    await executeBatch(jobFunctions, {
      onProgress: (completed, total) => {
        console.log(`Batch progress: ${completed}/${total}`);
      },
      onJobComplete: (jobId, result) => {
        console.log(`Job ${jobId} completed:`, result);
      },
      onJobFail: (jobId, error) => {
        console.error(`Job ${jobId} failed:`, error);
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Batch Operations</h2>
      <p className="text-gray-600 text-sm mb-4">
        Process multiple items simultaneously
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Items: {itemCount}
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={itemCount}
            onChange={(e) => setItemCount(parseInt(e.target.value))}
            disabled={isProcessing}
            className="w-full"
          />
        </div>

        <button
          onClick={handleBatchDelete}
          disabled={isProcessing}
          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Processing...' : `Delete ${itemCount} Items`}
        </button>

        {isProcessing && (
          <div>
            <ProgressBar
              progress={progress}
              label={`Processing: ${completedCount} of ${totalCount}`}
              showPercentage
            />
            <ProcessingIndicator
              message={`${completedCount} completed, ${totalCount - completedCount} remaining`}
              className="mt-3"
            />
          </div>
        )}

        {jobs.length > 0 && (
          <div className="max-h-64 overflow-y-auto space-y-2">
            <h3 className="text-sm font-medium text-gray-700 sticky top-0 bg-white py-2">
              Job Status ({jobs.length})
            </h3>
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-xs text-gray-600">{job.id.substring(0, 8)}...</span>
                <JobStatusBadge status={job.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example 3: Job List Dashboard
 * Demonstrates listing and managing all user jobs
 */
function JobListExample() {
  const { jobs, loading, refresh, cancelJob } = useAsyncJobList(true, 5000);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredJobs = jobs.filter((job) => {
    if (filter === 'active') {
      return ['pending', 'queued', 'processing'].includes(job.status);
    }
    if (filter === 'completed') {
      return ['completed', 'failed', 'cancelled'].includes(job.status);
    }
    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Job Dashboard</h2>
        <button
          onClick={refresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded capitalize transition-colors ${
              filter === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab} ({jobs.filter(j => 
              tab === 'all' ? true :
              tab === 'active' ? ['pending', 'queued', 'processing'].includes(j.status) :
              ['completed', 'failed', 'cancelled'].includes(j.status)
            ).length})
          </button>
        ))}
      </div>

      {/* Job List */}
      <div className="space-y-3">
        {loading && filteredJobs.length === 0 && (
          <ProcessingIndicator message="Loading jobs..." />
        )}

        {filteredJobs.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <p>No jobs found</p>
            <p className="text-sm mt-2">Try executing an operation above</p>
          </div>
        )}

        {filteredJobs.map((job) => (
          <AsyncJobCard
            key={job.id}
            job={job}
            onCancel={cancelJob}
          />
        ))}
      </div>
    </div>
  );
}
