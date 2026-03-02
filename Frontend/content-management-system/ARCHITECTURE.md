# Architecture Overview: RabbitMQ-Integrated CMS Frontend

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   UI Layer   │  │ State Layer  │  │Service Layer │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (.NET)                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  REST Endpoints        WebSocket           RabbitMQ          │
│  • POST /publish  ───▶ • Job updates  ◀──▶ • Content Queue  │
│  • GET /jobs/:id       • Real-time         • Notification Q  │
│  • POST /cancel        • Status push       • Worker Process  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Component Structure

### 1. **State Management Layer**

#### `AsyncJobContext`
- **Purpose**: Centralized state management for all background jobs
- **Features**:
  - Job storage and tracking
  - Polling coordination
  - Persistent state (localStorage)
  - Auto-refresh mechanism
- **Key Functions**:
  - `addJob()`, `updateJob()`, `removeJob()`
  - `startPolling()`, `stopPolling()`
  - `cancelJob()`, `retryJob()`

#### `ToastContext`
- **Purpose**: Non-blocking user notifications
- **Features**:
  - Auto-dismiss with configurable duration
  - Multiple toast types (success, error, warning, info)
  - Action buttons in toasts
  - Max toast limit

### 2. **Service Layer**

#### `asyncJobService`
- **Purpose**: API communication for job operations
- **Endpoints**:
  - `getJobStatus(jobId)` - Fetch current job status
  - `cancelJob(jobId)` - Cancel a running job
  - `getUserJobs()` - Get all jobs for current user
  - `pollJobUntilComplete()` - Poll until job finishes

#### `contentService`
- **Purpose**: Content operations that trigger async jobs
- **Methods**:
  - `publishContent()` → Returns `{ jobId }`
  - `unpublishContent()` → Returns `{ jobId }`
  - `bulkContentOperation()` → Returns `{ jobId }`

#### `webSocketService`
- **Purpose**: Real-time job updates (optional)
- **Features**:
  - Auto-reconnect with exponential backoff
  - Subscription management
  - Event handlers for connection states

### 3. **UI Components**

#### Job Status Components
- `JobStatusIndicator` - Floating widget showing active jobs
- `JobStatusItem` - Individual job display with progress
- `JobList` - Full job list with filtering
- `JobStatistics` - Job metrics dashboard

#### Feedback Components
- `LoadingButton` - Button with loading state (prevents double-submit)
- `ProgressBar` - Linear progress indicator
- `CircularProgress` - Circular progress indicator
- `StatusMessage` - Contextual alerts
- `InlineLoader` - Inline loading spinner
- `EmptyState` - Empty state placeholder

### 4. **Custom Hooks**

#### `useAsyncOperation`
```typescript
const { execute, loading, job, result } = useAsyncOperation({
  jobType: JobType.CONTENT_PUBLISH,
  successMessage: 'Published!',
  onSuccess: (result) => console.log(result),
});
```

#### `useJobPolling`
```typescript
const { job, polling, startPoll } = useJobPolling(jobId);
```

#### `useBatchOperation`
```typescript
const { executeBatch, operations } = useBatchOperation();
```

## 🔄 Data Flow

### Typical Async Operation Flow

```
1. User Action
   └─▶ Click "Publish Content"
   
2. Frontend initiates request
   └─▶ execute(() => publishContent({ contentId }))
   
3. Backend creates job
   └─▶ Returns: { jobId: "abc123", message: "Publishing..." }
   
4. Frontend adds job to state
   └─▶ addJob({ id: "abc123", status: "queued", ... })
   
5. Frontend starts polling
   └─▶ Poll /api/jobs/abc123 every 2s
   
6. Backend processes via RabbitMQ
   └─▶ Worker picks up job
   └─▶ Updates job status & progress
   
7. Frontend receives updates
   └─▶ updateJob("abc123", { status: "processing", progress: 50 })
   
8. UI reflects changes
   └─▶ Progress bar updates
   └─▶ Status badge changes
   
9. Job completes
   └─▶ Backend: { status: "completed", result: {...} }
   └─▶ Frontend: Toast notification
   └─▶ Stop polling
   └─▶ Execute onSuccess callback
```

## 🎯 Design Patterns

### 1. **Provider Pattern**
All contexts use React Context API for global state:
```tsx
<AsyncJobProvider>
  <ToastProvider>
    <App />
  </ToastProvider>
</AsyncJobProvider>
```

### 2. **Hook Pattern**
Custom hooks encapsulate complex logic:
- `useAsyncOperation` - Complete async workflow
- `useJobPolling` - Polling management
- `useBatchOperation` - Batch processing

### 3. **Service Pattern**
Services handle all API communication:
- Singleton instances
- Error handling
- Request/response transformation

### 4. **Observer Pattern**
Jobs are observed via:
- Polling (primary method)
- WebSocket (real-time, optional)
- Event callbacks

## 🔐 Security Considerations

### Authentication
- JWT tokens stored in localStorage
- Auto-attached to all API requests via Axios interceptor
- Auto-redirect on 401 responses

### Job Access Control
- Users can only see their own jobs
- Admin routes protected with role-based access
- Job operations require authentication

## ⚡ Performance Optimizations

### 1. **Polling Strategy**
- Configurable interval (default: 2s)
- Max attempts limit (default: 30)
- Automatic cleanup on completion
- Exponential backoff on errors

### 2. **State Persistence**
- Jobs saved to localStorage
- Survives page refresh
- Automatic cleanup of old jobs

### 3. **Batching**
- Multiple API calls can be made in parallel
- React concurrent rendering
- Debounced state updates

### 4. **Memoization**
- Computed values cached with useMemo
- Callback stability with useCallback
- Context value optimization

## 🧪 Testing Strategy

### Unit Tests
- Service functions
- Hook behavior
- Utility functions

### Integration Tests
- Context providers
- API interactions
- Polling mechanisms

### E2E Tests
- Complete user workflows
- Job lifecycle
- Error scenarios

## 🚀 Deployment Architecture

### Docker Configuration
```yaml
frontend:
  build: ./frontend
  environment:
    - VITE_API_URL=http://backend:5000/api
  ports:
    - "80:80"

backend:
  build: ./backend
  environment:
    - RabbitMQ__Host=rabbitmq
  depends_on:
    - rabbitmq

rabbitmq:
  image: rabbitmq:3-management
  ports:
    - "5672:5672"
    - "15672:15672"
```

### Environment-specific Configuration
- `.env.development` - Local development
- `.env.production` - Docker deployment
- `.env.test` - Testing environment

## 📊 Monitoring & Debugging

### Debug Mode
Enable with `VITE_DEBUG_MODE=true`:
- API request/response logging
- State change logging
- WebSocket message logging
- Polling activity tracking

### Admin Dashboard
- Real-time job monitoring
- Success/failure rates
- Average completion times
- Job type distribution
- Failed job alerts

## 🔮 Future Enhancements

1. **Server-Sent Events (SSE)** - Alternative to WebSocket
2. **Job Retry Strategies** - Automatic retry with backoff
3. **Job Dependencies** - Chain dependent jobs
4. **Priority Queue** - High-priority job processing
5. **Job Scheduling** - Schedule jobs for future execution
6. **Notification Preferences** - User-configurable notifications
7. **Job History** - Persistent job history database
8. **Metrics Dashboard** - Grafana/Prometheus integration

## 📚 Best Practices

### Component Guidelines
1. Keep components small and focused
2. Use composition over inheritance
3. Separate presentational from container components
4. Implement proper error boundaries

### State Management
1. Minimize global state
2. Use context for cross-cutting concerns
3. Keep derived state local
4. Implement proper cleanup

### API Integration
1. Always handle errors
2. Show loading states
3. Provide user feedback
4. Implement timeout handling

### Performance
1. Lazy load heavy components
2. Memoize expensive calculations
3. Debounce frequent operations
4. Optimize re-renders

## 🤝 Contributing Guidelines

1. Follow TypeScript strict mode
2. Add JSDoc comments for public APIs
3. Write tests for new features
4. Update documentation
5. Use semantic commit messages

---

**Maintainer**: GitHub Copilot  
**Last Updated**: January 2026
