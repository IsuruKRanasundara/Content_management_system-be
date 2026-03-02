import React, { useState } from 'react';
import { useAsyncJobs } from '../../context/AsyncJobContext';
import { useToast } from '../../context/ToastContext';
import { JobStatus, JobType, AsyncJob } from '../../services/asyncJobService';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader,
  X,
  RefreshCw,
  Trash2,
  Filter,
  Search
} from 'lucide-react';

/**
 * Job Status Indicator - Floating widget showing active jobs
 */
export const JobStatusIndicator: React.FC = () => {
  const { activeJobs, hasActiveJobs } = useAsyncJobs();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!hasActiveJobs()) return null;

  const processingCount = activeJobs.filter(j => j.status === JobStatus.PROCESSING).length;
  const queuedCount = activeJobs.filter(j => j.status === JobStatus.QUEUED).length;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-blue-600 text-white rounded-full shadow-lg p-4 hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <Loader className="animate-spin" size={20} />
        <span className="font-semibold">{activeJobs.length}</span>
      </button>

      {isExpanded && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-96 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Active Jobs</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="p-2">
            {activeJobs.map(job => (
              <JobStatusItem key={job.id} job={job} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Individual Job Status Item
 */
interface JobStatusItemProps {
  job: AsyncJob;
  compact?: boolean;
  onCancel?: (jobId: string) => void;
}

export const JobStatusItem: React.FC<JobStatusItemProps> = ({ 
  job, 
  compact = false,
  onCancel 
}) => {
  const statusIcons = {
    [JobStatus.PENDING]: <Clock className="text-gray-500" size={16} />,
    [JobStatus.QUEUED]: <Clock className="text-blue-500" size={16} />,
    [JobStatus.PROCESSING]: <Loader className="text-yellow-500 animate-spin" size={16} />,
    [JobStatus.COMPLETED]: <CheckCircle className="text-green-500" size={16} />,
    [JobStatus.FAILED]: <XCircle className="text-red-500" size={16} />,
    [JobStatus.CANCELLED]: <AlertCircle className="text-gray-500" size={16} />,
  };

  return (
    <div className={`${compact ? 'p-2' : 'p-4'} border-b border-gray-100 last:border-b-0`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{statusIcons[job.status]}</div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate capitalize">
            {job.type.replace(/_/g, ' ')}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(job.createdAt).toLocaleTimeString()}
          </p>
          
          {job.progress !== undefined && job.status === JobStatus.PROCESSING && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{job.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            </div>
          )}

          {job.error && (
            <p className="text-xs text-red-600 mt-1">{job.error}</p>
          )}
        </div>

        {onCancel && job.status === JobStatus.PROCESSING && (
          <button
            onClick={() => onCancel(job.id)}
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Job List Component - Full job management interface
 */
interface JobListProps {
  filter?: {
    status?: JobStatus[];
    type?: JobType[];
  };
  onJobClick?: (job: AsyncJob) => void;
}

export const JobList: React.FC<JobListProps> = ({ filter, onJobClick }) => {
  const { 
    jobs, 
    cancelJob, 
    removeJob, 
    retryJob, 
    refreshJobs, 
    isLoading 
  } = useAsyncJobs();
  const { showSuccess, showError } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    // Search filter
    if (searchQuery && !job.type.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && job.status !== statusFilter) {
      return false;
    }

    // External filter
    if (filter?.status && !filter.status.includes(job.status)) {
      return false;
    }
    if (filter?.type && !filter.type.includes(job.type)) {
      return false;
    }

    return true;
  });

  const handleCancel = async (jobId: string) => {
    try {
      await cancelJob(jobId);
      showSuccess('Job cancelled', 'The job has been cancelled successfully.');
    } catch (error) {
      showError('Failed to cancel job', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleRetry = (jobId: string) => {
    retryJob(jobId);
    showInfo('Job requeued', 'The job has been added back to the queue.');
  };

  const handleRemove = (jobId: string) => {
    removeJob(jobId);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Background Jobs</h2>
          <button
            onClick={refreshJobs}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value={JobStatus.PENDING}>Pending</option>
            <option value={JobStatus.QUEUED}>Queued</option>
            <option value={JobStatus.PROCESSING}>Processing</option>
            <option value={JobStatus.COMPLETED}>Completed</option>
            <option value={JobStatus.FAILED}>Failed</option>
          </select>
        </div>
      </div>

      {/* Job List */}
      <div className="divide-y divide-gray-100">
        {filteredJobs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No jobs found</p>
          </div>
        ) : (
          filteredJobs.map(job => (
            <div key={job.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => onJobClick?.(job)}
                >
                  <JobStatusItem job={job} />
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {job.status === JobStatus.PROCESSING && (
                    <button
                      onClick={() => handleCancel(job.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <X size={18} />
                    </button>
                  )}

                  {job.status === JobStatus.FAILED && (
                    <button
                      onClick={() => handleRetry(job.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Retry"
                    >
                      <RefreshCw size={18} />
                    </button>
                  )}

                  {[JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED].includes(job.status) && (
                    <button
                      onClick={() => handleRemove(job.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/**
 * Job Statistics Component
 */
export const JobStatistics: React.FC = () => {
  const { jobs, activeJobs, completedJobs, failedJobs } = useAsyncJobs();

  const stats = [
    {
      label: 'Total Jobs',
      value: jobs.length,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    {
      label: 'Active',
      value: activeJobs.length,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Completed',
      value: completedJobs.length,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Failed',
      value: failedJobs.length,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg shadow p-4">
          <div className={`${stat.bgColor} ${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3 font-bold text-xl`}>
            {stat.value}
          </div>
          <p className="text-sm font-medium text-gray-600">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

function showInfo(arg0: string, arg1: string) {
  // Implementation needed - use toast
}
