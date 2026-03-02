# Frontend Async Operations - Quick Reference

## 🚀 Quick Start Checklist

- [ ] Copy `.env.example` to `.env.local`
- [ ] Update `VITE_API_URL` in `.env.local`
- [ ] Wrap app with `<ToastProvider>`
- [ ] Add `<ToastContainer />` to app root
- [ ] Start backend: `docker-compose up -d`
- [ ] Start frontend: `npm run dev`

---

## 📦 File Structure

```
src/
├── services/
│   ├── api.ts                    # Axios instance with config
│   └── asyncJobService.ts        # Job polling & management
├── hooks/
│   └── useAsyncJob.ts            # React hooks for async ops
├── components/
│   ├── async/
│   │   └── AsyncJobComponents.tsx # Status badges, progress bars
│   └── notifications/
│       └── ToastSystem.tsx        # Toast notifications
├── types/
│   └── async.types.ts            # TypeScript definitions
└── pages/
    └── AsyncOperationsExample.tsx # Example implementation
```

---

## 🎯 Common Patterns

### 1. Execute Single Async Job

```typescript
import { useAsyncJobExecutor } from '@/hooks/useAsyncJob';
import api from '@/services/api';

const { execute, loading, job } = useAsyncJobExecutor();

const handlePublish = async () => {
  await execute(
    () => api.post(`/contents/${id}/publish-async`),
    {
      successMessage: 'Published!',
      onProgress: (p) => console.log(p)
    }
  );
};
```

### 2. Track Existing Job

```typescript
import { useAsyncJob } from '@/hooks/useAsyncJob';

const { job, loading, error } = useAsyncJob(jobId);
```

### 3. List All Jobs

```typescript
import { useAsyncJobList } from '@/hooks/useAsyncJob';

const { jobs, loading, refresh, cancelJob } = useAsyncJobList(true);
```

### 4. Batch Operations

```typescript
import { useBatchAsyncJobs } from '@/hooks/useAsyncJob';

const { executeBatch, progress } = useBatchAsyncJobs();

await executeBatch(
  ids.map(id => () => api.delete(`/items/${id}/async`))
);
```

### 5. Show Toast Notification

```typescript
import { useToast } from '@/components/notifications/ToastSystem';

const { showSuccess, showError } = useToast();

showSuccess('Done!', 'Operation completed');
showError('Failed', 'Something went wrong');
```

---

## 🔌 Backend Integration

### Required Backend Endpoints

```typescript
// Start async job - returns job ID
POST /api/contents/:id/publish-async
Response: { jobId: string, message: string }

// Check job status
GET /api/jobs/:jobId
Response: { id, status, progress, result, error, ... }

// List user jobs
GET /api/jobs?status=processing&type=content_publish
Response: AsyncJob[]

// Cancel job
POST /api/jobs/:jobId/cancel
```

### Backend Response Format

```csharp
// Job Creation
public class JobCreationResponse
{
    public string JobId { get; set; }
    public string Message { get; set; }
    public int? EstimatedTime { get; set; }
}

// Job Status
public class AsyncJobResponse
{
    public string Id { get; set; }
    public string Type { get; set; }
    public string Status { get; set; } // pending|queued|processing|completed|failed
    public int? Progress { get; set; } // 0-100
    public object Result { get; set; }
    public string Error { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

---

## 🎨 UI Components

### Status Badge
```tsx
<JobStatusBadge status={job.status} />
```

### Progress Bar
```tsx
<ProgressBar 
  progress={75} 
  label="Processing..." 
  showPercentage 
/>
```

### Processing Indicator
```tsx
<ProcessingIndicator 
  message="Loading..." 
  size="md" 
/>
```

### Complete Job Card
```tsx
<AsyncJobCard 
  job={job}
  onCancel={cancelJob}
  onRetry={retryJob}
/>
```

---

## ⚙️ Configuration

### Environment Variables
```env
VITE_API_URL=http://localhost:5000/api
VITE_API_TIMEOUT=30000
VITE_POLL_INTERVAL=2000
VITE_MAX_POLL_ATTEMPTS=30
VITE_DEBUG_MODE=true
```

### Vite Config
```typescript
// vite.config.ts auto-configured
// Proxy enabled for /api and /uploads
```

---

## 🐛 Debugging

### Enable Debug Logs
```env
VITE_DEBUG_MODE=true
```

### Check Backend
```bash
docker-compose logs -f cms-api
```

### Check RabbitMQ
Open: http://localhost:15672
Login: cmsadmin / CmsSecurePassword123!

### Common Issues

**CORS Error**
- Check backend CORS config
- Verify `VITE_API_URL` is correct

**Jobs Never Complete**
- Increase `VITE_MAX_POLL_ATTEMPTS`
- Check backend worker logs
- Verify RabbitMQ is running

**Multiple Polling**
- Check useEffect cleanup
- Call `stopAllPolling()` on unmount

---

## 📊 Job Status Flow

```
PENDING → QUEUED → PROCESSING → COMPLETED
                                ↓
                             FAILED
                                ↓
                            CANCELLED
```

---

## 🔄 Polling Strategy

1. Frontend creates job → Gets jobId
2. Start polling GET /api/jobs/:jobId
3. Poll every 2 seconds (configurable)
4. Max 30 attempts = 60 seconds timeout
5. Stop on COMPLETED, FAILED, or CANCELLED
6. Show toast notification on completion

---

## 💡 Best Practices

✅ **DO:**
- Use `useAsyncJobExecutor` for new jobs
- Show loading states during processing
- Display progress when available
- Handle errors gracefully
- Clean up polling on unmount
- Show success/error toasts

❌ **DON'T:**
- Poll too frequently (< 1 second)
- Forget to stop polling
- Block UI during async operations
- Ignore error states
- Hardcode API URLs

---

## 📱 Example Implementations

See `src/pages/AsyncOperationsExample.tsx` for:
- ✅ Single job execution
- ✅ Batch operations
- ✅ Job listing dashboard
- ✅ Progress tracking
- ✅ Error handling
- ✅ Toast notifications

---

## 🆘 Getting Help

1. Check `ASYNC_INTEGRATION_GUIDE.md` for detailed docs
2. Review example page: `AsyncOperationsExample.tsx`
3. Enable debug mode for detailed logs
4. Check backend logs for API issues
5. Verify RabbitMQ is processing messages

---

## 🔗 Related Files

- **API Service**: `src/services/api.ts`
- **Job Service**: `src/services/asyncJobService.ts`
- **Hooks**: `src/hooks/useAsyncJob.ts`
- **Components**: `src/components/async/`
- **Types**: `src/types/async.types.ts`
- **Guide**: `ASYNC_INTEGRATION_GUIDE.md`

---

**Last Updated**: December 2025
**Version**: 1.0.0
