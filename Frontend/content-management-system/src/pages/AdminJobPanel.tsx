import React, { useState, useEffect } from 'react';
import { useAsyncJobs } from '../../context/AsyncJobContext';
import { useToast } from '../../context/ToastContext';
import { 
  JobList, 
  JobStatistics, 
  JobStatusItem 
} from './JobStatusComponents';
import { 
  LoadingButton,
  StatusMessage 
} from './FeedbackComponents';
import { 
  AsyncJob, 
  JobStatus, 
  JobType 
} from '../../services/asyncJobService';
import {
  Activity,
  BarChart3,
  Clock,
  Filter,
  RefreshCw,
  Trash2,
  Download,
  Settings,
  Info,
} from 'lucide-react';

/**
 * Admin Panel for Job Monitoring
 * Comprehensive interface for viewing and managing all background jobs
 */

export const AdminJobPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'analytics'>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Management</h1>
          <p className="text-gray-600">Monitor and manage all background jobs</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity size={18} />
                  Overview
                </div>
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'jobs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  All Jobs
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} />
                  Analytics
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'jobs' && <JobsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  );
};

/**
 * Overview Tab
 */
const OverviewTab: React.FC = () => {
  const { 
    activeJobs, 
    completedJobs, 
    failedJobs, 
    clearCompletedJobs,
    refreshJobs,
    isLoading 
  } = useAsyncJobs();
  const { showSuccess } = useToast();

  const handleClearCompleted = () => {
    clearCompletedJobs();
    showSuccess('Cleared completed jobs', 'All completed jobs have been removed.');
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <JobStatistics />

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <LoadingButton
            onClick={refreshJobs}
            loading={isLoading}
            variant="primary"
            className="gap-2"
          >
            <RefreshCw size={18} />
            Refresh All Jobs
          </LoadingButton>

          <LoadingButton
            onClick={handleClearCompleted}
            variant="secondary"
            disabled={completedJobs.length === 0}
          >
            <Trash2 size={18} />
            Clear Completed ({completedJobs.length})
          </LoadingButton>
        </div>
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Active Jobs</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {activeJobs.slice(0, 5).map(job => (
              <div key={job.id} className="px-6 py-4">
                <JobStatusItem job={job} />
              </div>
            ))}
          </div>
          {activeJobs.length > 5 && (
            <div className="px-6 py-3 bg-gray-50 text-center text-sm text-gray-600">
              And {activeJobs.length - 5} more active jobs...
            </div>
          )}
        </div>
      )}

      {/* Failed Jobs Alert */}
      {failedJobs.length > 0 && (
        <StatusMessage
          type="error"
          title="Failed Jobs"
          message={`${failedJobs.length} job(s) have failed. Review and retry if needed.`}
        />
      )}
    </div>
  );
};

/**
 * Jobs Tab
 */
const JobsTab: React.FC = () => {
  return (
    <div>
      <JobList />
    </div>
  );
};

/**
 * Analytics Tab
 */
const AnalyticsTab: React.FC = () => {
  const { jobs } = useAsyncJobs();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Calculate analytics
  const analytics = React.useMemo(() => {
    const now = new Date();
    const cutoff = new Date();
    
    switch (timeRange) {
      case '24h':
        cutoff.setHours(now.getHours() - 24);
        break;
      case '7d':
        cutoff.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(now.getDate() - 30);
        break;
    }

    const relevantJobs = jobs.filter(job => 
      new Date(job.createdAt) >= cutoff
    );

    // Job type distribution
    const typeDistribution = relevantJobs.reduce((acc, job) => {
      acc[job.type] = (acc[job.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Success rate
    const completedCount = relevantJobs.filter(j => j.status === JobStatus.COMPLETED).length;
    const failedCount = relevantJobs.filter(j => j.status === JobStatus.FAILED).length;
    const totalFinished = completedCount + failedCount;
    const successRate = totalFinished > 0 ? (completedCount / totalFinished) * 100 : 0;

    // Average completion time (mock - would need actual data)
    const avgCompletionTime = relevantJobs
      .filter(j => j.completedAt && j.createdAt)
      .reduce((sum, job) => {
        const start = new Date(job.createdAt).getTime();
        const end = new Date(job.completedAt!).getTime();
        return sum + (end - start);
      }, 0) / (completedCount || 1);

    return {
      totalJobs: relevantJobs.length,
      typeDistribution,
      successRate: Math.round(successRate),
      avgCompletionTime: Math.round(avgCompletionTime / 1000), // seconds
      completedCount,
      failedCount,
    };
  }, [jobs, timeRange]);

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Time Range</h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Jobs"
          value={analytics.totalJobs}
          icon={<Activity className="text-blue-600" size={24} />}
        />
        <MetricCard
          title="Success Rate"
          value={`${analytics.successRate}%`}
          icon={<BarChart3 className="text-green-600" size={24} />}
        />
        <MetricCard
          title="Completed"
          value={analytics.completedCount}
          icon={<Clock className="text-green-600" size={24} />}
        />
        <MetricCard
          title="Failed"
          value={analytics.failedCount}
          icon={<Clock className="text-red-600" size={24} />}
        />
      </div>

      {/* Job Type Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Type Distribution</h3>
        <div className="space-y-3">
          {Object.entries(analytics.typeDistribution).map(([type, count]) => (
            <div key={type}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {type.replace(/_/g, ' ')}
                </span>
                <span className="text-sm text-gray-600">{count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${(count / analytics.totalJobs) * 100}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Average Completion Time */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Average Completion Time
        </h3>
        <p className="text-3xl font-bold text-blue-600">
          {analytics.avgCompletionTime}s
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Based on completed jobs in selected time range
        </p>
      </div>
    </div>
  );
};

/**
 * Metric Card Component
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
      </div>
    </div>
  );
};

export default AdminJobPanel;
