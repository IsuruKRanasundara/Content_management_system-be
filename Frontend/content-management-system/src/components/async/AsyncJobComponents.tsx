import React from 'react';
import { JobStatus } from '../../services/asyncJobService';

interface JobStatusBadgeProps {
  status: JobStatus;
  className?: string;
}

const statusConfig: Record<JobStatus, { label: string; color: string; icon: string }> = {
  [JobStatus.PENDING]: {
    label: 'Pending',
    color: 'bg-gray-100 text-gray-800',
    icon: '⏱️',
  },
  [JobStatus.QUEUED]: {
    label: 'Queued',
    color: 'bg-blue-100 text-blue-800',
    icon: '📋',
  },
  [JobStatus.PROCESSING]: {
    label: 'Processing',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⚙️',
  },
  [JobStatus.COMPLETED]: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    icon: '✅',
  },
  [JobStatus.FAILED]: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800',
    icon: '❌',
  },
  [JobStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800',
    icon: '🚫',
  },
};

export const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ status, className = '' }) => {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color} ${className}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-gray-600">{percentage}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface ProcessingIndicatorProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  message = 'Processing...',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin`}>
        <svg className="w-full h-full text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <span className="text-sm text-gray-700">{message}</span>
    </div>
  );
};

interface AsyncJobCardProps {
  job: {
    id: string;
    type: string;
    status: JobStatus;
    progress?: number;
    error?: string;
    createdAt: string;
  };
  onCancel?: (jobId: string) => void;
  onRetry?: (jobId: string) => void;
  className?: string;
}

export const AsyncJobCard: React.FC<AsyncJobCardProps> = ({
  job,
  onCancel,
  onRetry,
  className = '',
}) => {
  const isProcessing = job.status === JobStatus.PROCESSING || job.status === JobStatus.QUEUED;
  const isFailed = job.status === JobStatus.FAILED;
  const canCancel = isProcessing && onCancel;
  const canRetry = isFailed && onRetry;

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 capitalize">
            {job.type.replace(/_/g, ' ')}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(job.createdAt).toLocaleString()}
          </p>
        </div>
        <JobStatusBadge status={job.status} />
      </div>

      {job.progress !== undefined && isProcessing && (
        <ProgressBar progress={job.progress} className="mb-3" />
      )}

      {job.error && isFailed && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          {job.error}
        </div>
      )}

      {(canCancel || canRetry) && (
        <div className="flex gap-2">
          {canCancel && (
            <button
              onClick={() => onCancel(job.id)}
              className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
            >
              Cancel
            </button>
          )}
          {canRetry && (
            <button
              onClick={() => onRetry(job.id)}
              className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default {
  JobStatusBadge,
  ProgressBar,
  ProcessingIndicator,
  AsyncJobCard,
};
