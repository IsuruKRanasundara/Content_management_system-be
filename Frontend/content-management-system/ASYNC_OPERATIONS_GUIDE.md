# RabbitMQ-Integrated CMS Frontend

A production-ready React frontend with comprehensive support for RabbitMQ-driven background jobs.

## 🚀 Features

### ✅ Async Job Management
- **Centralized State Management** - `AsyncJobContext` manages all background jobs
- **Automatic Job Tracking** - Track job status from creation to completion
- **Persistent State** - Jobs persist across page refreshes via localStorage
- **Auto-refresh** - Periodic job status updates

### ✅ Real-time Updates
- **WebSocket Support** - Real-time job status updates (optional)
- **Polling Fallback** - Reliable polling mechanism for job status
- **Progress Tracking** - Visual progress bars for long-running jobs

### ✅ User Feedback
- **Toast Notifications** - Non-blocking notifications for all operations
- **Loading States** - Loading buttons, spinners, and skeleton loaders
- **Progress Indicators** - Linear and circular progress bars
- **Status Messages** - Contextual success/error/warning messages

### ✅ Admin Dashboard
- **Job Monitoring** - View all background jobs with filtering
- **Analytics** - Job statistics and success rates
- **Bulk Operations** - Cancel, retry, or delete multiple jobs
- **Export Capabilities** - Export job data for analysis

### ✅ Developer Experience
- **Custom Hooks** - `useAsyncOperation`, `useJobPolling`, `useBatchOperation`
- **Type Safety** - Full TypeScript support with comprehensive type definitions
- **Clean Architecture** - Separation of concerns between services, UI, and state
- **Example Components** - Ready-to-use examples for common patterns

## 📁 Project Structure

```
src/
├── components/
│   ├── async/
│   │   ├── AsyncJobComponents.tsx      # Job UI components (legacy)
│   │   ├── JobStatusComponents.tsx     # Job status displays
│   │   └── FeedbackComponents.tsx      # Loading & feedback UI
│   ├── examples/
│   │   └── AsyncOperationExamples.tsx  # Example implementations
│   └── ...
├── context/
│   ├── AsyncJobContext.tsx             # Job state management
│   ├── ToastContext.tsx                # Toast notifications
│   ├── AuthContext.tsx                 # Authentication
│   └── ThemeContext.tsx                # Theme management
├── hooks/
│   └── useAsyncOperation.ts            # Custom async hooks
├── pages/
│   └── AdminJobPanel.tsx               # Admin dashboard
├── services/
│   ├── api.ts                          # Axios configuration
│   ├── asyncJobService.ts              # Job API service
│   ├── contentService.ts               # Content API service
│   └── webSocketService.ts             # WebSocket connection
└── types/
    ├── async.types.ts                  # Type definitions
    └── index.ts                        # Type exports
```

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create `.env.development` for local development:

```env
VITE_API_URL=http://localhost:5000/api
VITE_POLL_INTERVAL=2000
VITE_MAX_POLL_ATTEMPTS=30
VITE_DEBUG_MODE=true
```

For Docker deployment, use `.env.production`:

```env
VITE_API_URL=http://backend:5000/api
VITE_POLL_INTERVAL=3000
VITE_MAX_POLL_ATTEMPTS=50
VITE_DEBUG_MODE=false
```

### 3. Update App.tsx

Wrap your app with the necessary providers:

```tsx
import { AsyncJobProvider } from './context/AsyncJobContext';
import { ToastProvider } from './context/ToastContext';
import { JobStatusIndicator } from './components/async/JobStatusComponents';

function App() {
  return (
    <ToastProvider>
      <AsyncJobProvider>
        <YourApp />
        <JobStatusIndicator /> {/* Floating job indicator */}
      </AsyncJobProvider>
    </ToastProvider>
  );
}
```

## 📘 Usage Guide

### Basic Async Operation

```tsx
import { useAsyncOperation } from './hooks/useAsyncOperation';
import { LoadingButton } from './components/async/FeedbackComponents';
import { publishContent } from './services/contentService';
import { JobType } from './services/asyncJobService';

function PublishButton({ contentId }) {
  const { execute, loading, job } = useAsyncOperation({
    jobType: JobType.CONTENT_PUBLISH,
    successMessage: 'Content published!',
    onSuccess: () => console.log('Done!'),
  });

  const handlePublish = () => {
    execute(() => publishContent({ contentId }));
  };

  return (
    <>
      <LoadingButton onClick={handlePublish} loading={loading}>
        Publish
      </LoadingButton>
      
      {job?.progress && (
        <ProgressBar progress={job.progress} />
      )}
    </>
  );
}
```

### Manual Job Polling

```tsx
import { useAsyncJobs } from './context/AsyncJobContext';

function MyComponent({ jobId }) {
  const { getJob, startPolling } = useAsyncJobs();
  const job = getJob(jobId);

  useEffect(() => {
    if (jobId) {
      startPolling(jobId, {
        onComplete: (job) => console.log('Job done!', job),
      });
    }
  }, [jobId]);

  return <div>Status: {job?.status}</div>;
}
```

### Bulk Operations

```tsx
import { useBatchOperation } from './hooks/useAsyncOperation';

function BulkDelete({ contentIds }) {
  const { executeBatch, operations, inProgress } = useBatchOperation();

  const handleDelete = async () => {
    const jobFunctions = contentIds.map(id => 
      () => deleteContent(id)
    );
    
    await executeBatch(jobFunctions);
  };

  return (
    <LoadingButton onClick={handleDelete} loading={inProgress}>
      Delete {contentIds.length} items
    </LoadingButton>
  );
}
```

### Toast Notifications

```tsx
import { useToast } from './context/ToastContext';

function MyComponent() {
  const { showSuccess, showError, showWarning } = useToast();

  const handleAction = async () => {
    try {
      await someAsyncOperation();
      showSuccess('Success!', 'Operation completed');
    } catch (error) {
      showError('Failed', error.message);
    }
  };

  return <button onClick={handleAction}>Do Something</button>;
}
```

### Admin Panel

Add the admin panel to your routes:

```tsx
import AdminJobPanel from './pages/AdminJobPanel';

// In your router
<Route path="/admin/jobs" element={<AdminJobPanel />} />
```

## 🔌 Backend Integration

### Expected API Endpoints

The frontend expects these endpoints from your backend:

```
POST   /api/contents/publish        → { jobId, message, estimatedTime }
POST   /api/contents/bulk           → { jobId, message }
GET    /api/jobs                    → AsyncJob[]
GET    /api/jobs/:jobId             → AsyncJob
POST   /api/jobs/:jobId/cancel      → void
DELETE /api/jobs/:jobId             → void
```

### Job Response Format

```typescript
interface JobCreationResponse {
  jobId: string;
  message: string;
  estimatedTime?: number; // seconds
}

interface AsyncJob {
  id: string;
  type: JobType;
  status: JobStatus;
  progress?: number;      // 0-100
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}
```

## 🎨 Customization

### Styling

All components use Tailwind CSS classes. Customize the theme in `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        success: '#10b981',
        error: '#ef4444',
      },
    },
  },
};
```

### Polling Configuration

Adjust polling behavior via environment variables or context props:

```tsx
<AsyncJobProvider 
  autoRefreshInterval={30000}  // 30 seconds
  persistState={true}          // Save to localStorage
>
```

## 🔍 Debugging

Enable debug mode to see detailed logs:

```env
VITE_DEBUG_MODE=true
```

This will log:
- API requests and responses
- Job status changes
- WebSocket messages
- State updates

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 🚢 Production Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📚 Additional Resources

- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [React Context API](https://react.dev/reference/react/useContext)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Follow the existing code structure
2. Add TypeScript types for all new code
3. Include error handling for all async operations
4. Update documentation for new features

## 📄 License

MIT
