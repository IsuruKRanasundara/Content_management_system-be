# Frontend Integration Guide for Dockerized Backend with RabbitMQ

## 📋 Overview

This guide explains how to integrate your React frontend with the dockerized backend that uses RabbitMQ for asynchronous processing.

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment file for your target environment:

```bash
# For local development
cp .env.example .env.local

# For production
cp .env.example .env.production
```

Update `.env.local` with your backend URL:
```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies

Make sure you have all required dependencies:
```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:3000` and automatically proxy API requests to your dockerized backend.

---

## 🏗️ Architecture

### System Flow

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   React     │─────▶│   Backend   │─────▶│  RabbitMQ    │
│   Frontend  │◀─────│   REST API  │◀─────│  (Workers)   │
└─────────────┘      └─────────────┘      └──────────────┘
     │                     │                      │
     │                     ├──────────────────────┤
     │                     │   Async Processing   │
     │◀────────────────────┤   (Polling/Updates)  │
     │                     └──────────────────────┘
```

### Key Components

1. **API Service** (`src/services/api.ts`)
   - Centralized Axios instance
   - Token management
   - Error handling

2. **Async Job Service** (`src/services/asyncJobService.ts`)
   - Job status polling
   - Job lifecycle management
   - Progress tracking

3. **React Hooks** (`src/hooks/useAsyncJob.ts`)
   - `useAsyncJobExecutor` - Execute and track single jobs
   - `useAsyncJobList` - List and manage multiple jobs
   - `useBatchAsyncJobs` - Handle batch operations

4. **UI Components** (`src/components/async/`)
   - Status badges
   - Progress bars
   - Job cards

5. **Toast System** (`src/components/notifications/`)
   - User notifications
   - Success/error alerts

---

## 💻 Usage Examples

### Example 1: Publish Content Asynchronously

```typescript
import { useAsyncJobExecutor } from '@/hooks/useAsyncJob';
import { JobType } from '@/services/asyncJobService';
import api from '@/services/api';

function PublishContentButton({ contentId }: { contentId: string }) {
  const { execute, loading, job } = useAsyncJobExecutor();

  const handlePublish = async () => {
    try {
      await execute(
        // Job creation function
        async () => {
          const response = await api.post(`/contents/${contentId}/publish-async`);
          return response.data; // Should return { jobId, message }
        },
        // Options
        {
          successMessage: 'Content Published',
          errorMessage: 'Failed to publish content',
          onProgress: (progress) => {
            console.log(`Publishing progress: ${progress}%`);
          },
        }
      );
    } catch (error) {
      console.error('Publish failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handlePublish} disabled={loading}>
        {loading ? 'Publishing...' : 'Publish Content'}
      </button>
      
      {job && (
        <div className="mt-2">
          <JobStatusBadge status={job.status} />
          {job.progress && <ProgressBar progress={job.progress} />}
        </div>
      )}
    </div>
  );
}
```

### Example 2: Track Job Status

```typescript
import { useAsyncJob } from '@/hooks/useAsyncJob';
import { AsyncJobCard } from '@/components/async/AsyncJobComponents';

function JobTracker({ jobId }: { jobId: string }) {
  const { job, loading, error } = useAsyncJob(jobId);

  if (loading) return <ProcessingIndicator message="Loading job status..." />;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!job) return null;

  return <AsyncJobCard job={job} />;
}
```

### Example 3: List All User Jobs

```typescript
import { useAsyncJobList } from '@/hooks/useAsyncJob';
import { AsyncJobCard } from '@/components/async/AsyncJobComponents';

function JobsDashboard() {
  const { jobs, loading, refresh, cancelJob } = useAsyncJobList(true, 5000);

  if (loading && jobs.length === 0) {
    return <ProcessingIndicator message="Loading jobs..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Jobs</h2>
        <button onClick={refresh} className="btn-primary">
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <AsyncJobCard
            key={job.id}
            job={job}
            onCancel={cancelJob}
          />
        ))}
      </div>

      {jobs.length === 0 && (
        <p className="text-gray-500 text-center py-8">No jobs found</p>
      )}
    </div>
  );
}
```

### Example 4: Batch Operations

```typescript
import { useBatchAsyncJobs } from '@/hooks/useAsyncJob';
import api from '@/services/api';

function BulkDeleteButton({ contentIds }: { contentIds: string[] }) {
  const { executeBatch, progress, isProcessing, completedCount, totalCount } = 
    useBatchAsyncJobs();

  const handleBulkDelete = async () => {
    const jobFunctions = contentIds.map((id) => async () => {
      const response = await api.delete(`/contents/${id}/async`);
      return response.data;
    });

    await executeBatch(jobFunctions, {
      onProgress: (completed, total) => {
        console.log(`Progress: ${completed}/${total}`);
      },
    });
  };

  return (
    <div>
      <button onClick={handleBulkDelete} disabled={isProcessing}>
        Delete {contentIds.length} Items
      </button>

      {isProcessing && (
        <div className="mt-3">
          <ProgressBar 
            progress={progress} 
            label={`${completedCount} of ${totalCount} completed`}
          />
        </div>
      )}
    </div>
  );
}
```

### Example 5: With Retry Logic

```typescript
import { useRetryableAsyncJob } from '@/hooks/useAsyncJob';
import api from '@/services/api';

function ImportDataButton() {
  const { executeWithRetry, loading, retryCount, maxRetries } = 
    useRetryableAsyncJob(3);

  const handleImport = async () => {
    try {
      const result = await executeWithRetry(
        async () => {
          const response = await api.post('/data/import-async', formData);
          return response.data;
        },
        {
          successMessage: 'Data imported successfully',
          errorMessage: 'Import failed after retries',
        }
      );
      
      console.log('Import result:', result);
    } catch (error) {
      console.error('Failed after all retries');
    }
  };

  return (
    <div>
      <button onClick={handleImport} disabled={loading}>
        Import Data
      </button>
      
      {loading && retryCount > 0 && (
        <p className="text-sm text-gray-600 mt-2">
          Retry attempt {retryCount} of {maxRetries}
        </p>
      )}
    </div>
  );
}
```

---

## 🎨 Using Toast Notifications

### Setup Toast Provider

Wrap your app with the `ToastProvider` in your main App component:

```typescript
import { ToastProvider, ToastContainer } from '@/components/notifications/ToastSystem';

function App() {
  return (
    <ToastProvider>
      <YourAppRoutes />
      <ToastContainer />
    </ToastProvider>
  );
}
```

### Using Toasts in Components

```typescript
import { useToast } from '@/components/notifications/ToastSystem';

function MyComponent() {
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  const handleAction = async () => {
    try {
      showInfo('Processing', 'Your request is being processed...');
      await someAsyncOperation();
      showSuccess('Success', 'Operation completed successfully!');
    } catch (error) {
      showError('Error', 'Something went wrong');
    }
  };

  return <button onClick={handleAction}>Do Something</button>;
}
```

---

## 🔧 Backend API Requirements

Your backend should expose these endpoints for async job management:

### Job Status Endpoint
```
GET /api/jobs/:jobId
Response: {
  id: string;
  type: string;
  status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Cancel Job Endpoint
```
POST /api/jobs/:jobId/cancel
Response: { message: string }
```

### List User Jobs Endpoint
```
GET /api/jobs?status=processing&type=content_publish
Response: AsyncJob[]
```

### Async Operation Endpoints
Each async operation should return:
```
POST /api/contents/:id/publish-async
Response: {
  jobId: string;
  message: string;
  estimatedTime?: number;
}
```

---

## 🌐 Environment Variables Reference

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` | `https://api.prod.com/api` |
| `VITE_API_TIMEOUT` | API request timeout (ms) | `30000` | `60000` |
| `VITE_POLL_INTERVAL` | Job polling interval (ms) | `2000` | `3000` |
| `VITE_MAX_POLL_ATTEMPTS` | Max polling attempts | `30` | `20` |
| `VITE_DEBUG_MODE` | Enable debug logging | `true` | `false` |
| `VITE_ENABLE_NOTIFICATIONS` | Enable toast notifications | `true` | `true` |

---

## 🔄 Async Workflow Patterns

### Pattern 1: Fire and Forget
User triggers action, system confirms queuing, user continues working.

```typescript
const handlePublish = async () => {
  const response = await api.post('/content/publish-async', data);
  toast.showInfo('Queued', 'Content publishing has been queued');
  // Don't wait for completion
};
```

### Pattern 2: Wait for Completion
User triggers action, UI shows progress, waits for result.

```typescript
const { execute, loading } = useAsyncJobExecutor();

const handleExport = async () => {
  const result = await execute(() => api.post('/data/export-async'));
  downloadFile(result.url);
};
```

### Pattern 3: Background Processing with Notification
Start job in background, notify user when complete.

```typescript
useEffect(() => {
  const jobId = localStorage.getItem('pendingJobId');
  if (jobId) {
    pollJobUntilComplete(jobId).then((result) => {
      toast.showSuccess('Job Complete!', 'Your export is ready');
      localStorage.removeItem('pendingJobId');
    });
  }
}, []);
```

---

## 🐛 Debugging

Enable debug mode in `.env.local`:
```env
VITE_DEBUG_MODE=true
```

This will log:
- API requests and responses
- Token attachment
- Job polling status
- Error details

Check browser console for detailed logs.

---

## 📦 Production Deployment

1. Update `.env.production` with production API URL
2. Build the application:
   ```bash
   npm run build
   ```
3. The built files in `dist/` can be served by any static file server
4. Ensure CORS is configured on your backend for production domain

---

## 🔐 Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use environment-specific configs** - Different settings for dev/prod
3. **Secure token storage** - Tokens are stored in localStorage (consider httpOnly cookies for production)
4. **HTTPS in production** - Always use HTTPS for production API calls
5. **CORS configuration** - Whitelist only your frontend domains

---

## 🆘 Troubleshooting

### Issue: API calls fail with CORS error
**Solution**: Ensure backend has proper CORS configuration:
```csharp
// In Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod());
});
```

### Issue: Jobs never complete (timeout)
**Solution**: Increase polling timeout:
```env
VITE_MAX_POLL_ATTEMPTS=60
VITE_POLL_INTERVAL=3000
```

### Issue: Multiple polling instances
**Solution**: Use cleanup in useEffect:
```typescript
useEffect(() => {
  // ... polling logic
  return () => {
    asyncJobService.stopAllPolling();
  };
}, []);
```

---

## 📚 Additional Resources

- [React Hooks Documentation](https://react.dev/reference/react)
- [Axios Documentation](https://axios-http.com/)
- [RabbitMQ Patterns](https://www.rabbitmq.com/getstarted.html)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Enable debug mode and check console logs
3. Review backend logs with `docker-compose logs -f cms-api`
4. Check RabbitMQ management UI at http://localhost:15672
