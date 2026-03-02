import React from 'react';
import { useAsyncOperation } from '../../hooks/useAsyncOperation';
import { publishContent, unpublishContent } from '../../services/contentService';
import { LoadingButton, ProgressBar, StatusMessage } from '../async/FeedbackComponents';
import { JobType } from '../../services/asyncJobService';

/**
 * Example: Content Publish Component
 * Demonstrates async operation with proper UX
 */

interface ContentPublishProps {
  contentId: string;
  onSuccess?: () => void;
}

export const ContentPublishButton: React.FC<ContentPublishProps> = ({
  contentId,
  onSuccess,
}) => {
  const { execute, loading, error, job } = useAsyncOperation({
    jobType: JobType.CONTENT_PUBLISH,
    successMessage: 'Content published successfully!',
    errorMessage: 'Failed to publish content.',
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const handlePublish = async () => {
    try {
      await execute(() => publishContent({ contentId }));
    } catch (err) {
      console.error('Publish failed:', err);
    }
  };

  return (
    <div>
      <LoadingButton
        onClick={handlePublish}
        loading={loading}
        disabled={loading}
        variant="primary"
      >
        {loading ? 'Publishing...' : 'Publish Content'}
      </LoadingButton>

      {job && job.progress !== undefined && (
        <ProgressBar
          progress={job.progress}
          label="Publishing progress"
          className="mt-4"
        />
      )}

      {error && (
        <StatusMessage
          type="error"
          message={error.message}
          className="mt-4"
        />
      )}
    </div>
  );
};

/**
 * Example: Bulk Operations Component
 */

interface BulkDeleteProps {
  contentIds: string[];
  onComplete?: () => void;
}

export const BulkDeleteButton: React.FC<BulkDeleteProps> = ({
  contentIds,
  onComplete,
}) => {
  const { execute, loading, error, job } = useAsyncOperation({
    jobType: JobType.BULK_DELETE,
    successMessage: `Successfully deleted ${contentIds.length} items`,
    onSuccess: () => {
      onComplete?.();
    },
  });

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${contentIds.length} items?`)) {
      return;
    }

    try {
      await execute(() => 
        fetch('/api/contents/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentIds }),
        }).then(res => res.json())
      );
    } catch (err) {
      console.error('Bulk delete failed:', err);
    }
  };

  return (
    <div>
      <LoadingButton
        onClick={handleBulkDelete}
        loading={loading}
        disabled={loading || contentIds.length === 0}
        variant="danger"
      >
        Delete {contentIds.length} Items
      </LoadingButton>

      {job && job.progress !== undefined && (
        <div className="mt-4">
          <ProgressBar
            progress={job.progress}
            label={`Deleting items (${Math.round((job.progress / 100) * contentIds.length)}/${contentIds.length})`}
          />
        </div>
      )}

      {error && (
        <StatusMessage
          type="error"
          title="Deletion Failed"
          message={error.message}
          className="mt-4"
        />
      )}
    </div>
  );
};

/**
 * Example: Export Data Component
 */

export const ExportDataButton: React.FC = () => {
  const { execute, loading, job } = useAsyncOperation({
    jobType: JobType.EXPORT_DATA,
    successMessage: 'Export completed! Download will start automatically.',
    onSuccess: (result) => {
      // Auto-download the exported file
      if (result?.downloadUrl) {
        window.location.href = result.downloadUrl;
      }
    },
  });

  const handleExport = async () => {
    try {
      await execute(() =>
        fetch('/api/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ format: 'csv' }),
        }).then(res => res.json())
      );
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div>
      <LoadingButton
        onClick={handleExport}
        loading={loading}
        disabled={loading}
        variant="secondary"
      >
        Export to CSV
      </LoadingButton>

      {job && job.progress !== undefined && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900 mb-2">Exporting data...</p>
          <ProgressBar progress={job.progress} showPercentage />
        </div>
      )}
    </div>
  );
};

export default {
  ContentPublishButton,
  BulkDeleteButton,
  ExportDataButton,
};
