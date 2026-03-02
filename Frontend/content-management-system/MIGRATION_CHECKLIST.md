# Migration Checklist - Updating Existing Components

## ✅ Pre-Migration Checklist

- [ ] Backend Docker containers are running (`docker-compose ps`)
- [ ] Frontend environment files are configured (`.env.local`)
- [ ] Dependencies are installed (`npm install`)
- [ ] Toast system is set up in App.tsx

---

## 🔄 Step-by-Step Migration Guide

### Step 1: Update App.tsx (5 minutes)

**Before:**
```typescript
function App() {
  return (
    <Router>
      <Routes>
        {/* your routes */}
      </Routes>
    </Router>
  );
}
```

**After:**
```typescript
import { ToastProvider, ToastContainer } from '@/components/notifications/ToastSystem';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* your routes */}
        </Routes>
      </Router>
      <ToastContainer />
    </ToastProvider>
  );
}
```

---

### Step 2: Update Content Publishing (10 minutes)

**Old Synchronous Approach:**
```typescript
// pages/ContentEdit.tsx (BEFORE)
const handlePublish = async () => {
  try {
    setLoading(true);
    await api.post(`/contents/${id}/publish`);
    alert('Published successfully!');
  } catch (error) {
    alert('Failed to publish');
  } finally {
    setLoading(false);
  }
};
```

**New Async Approach:**
```typescript
// pages/ContentEdit.tsx (AFTER)
import { useAsyncJobExecutor } from '@/hooks/useAsyncJob';
import { ProcessingIndicator, ProgressBar } from '@/components/async/AsyncJobComponents';

function ContentEdit() {
  const { execute, loading, job } = useAsyncJobExecutor();

  const handlePublish = async () => {
    try {
      await execute(
        () => api.post(`/contents/${id}/publish-async`),
        {
          successMessage: 'Content Published Successfully!',
          errorMessage: 'Failed to publish content',
          onProgress: (progress) => {
            console.log(`Publishing: ${progress}%`);
          }
        }
      );
      // Navigate or refresh data after completion
    } catch (error) {
      console.error('Publish error:', error);
    }
  };

  return (
    <div>
      <button onClick={handlePublish} disabled={loading}>
        {loading ? 'Publishing...' : 'Publish Content'}
      </button>

      {loading && job && (
        <div className="mt-4">
          <ProcessingIndicator message="Publishing your content..." />
          {job.progress && <ProgressBar progress={job.progress} />}
        </div>
      )}
    </div>
  );
}
```

---

### Step 3: Update Bulk Delete Operations (15 minutes)

**Old Approach:**
```typescript
// BEFORE: Synchronous bulk delete
const handleBulkDelete = async () => {
  setLoading(true);
  for (const id of selectedIds) {
    try {
      await api.delete(`/contents/${id}`);
    } catch (error) {
      console.error(`Failed to delete ${id}`);
    }
  }
  setLoading(false);
  alert('Deletion complete');
};
```

**New Approach:**
```typescript
// AFTER: Async batch delete with progress
import { useBatchAsyncJobs } from '@/hooks/useAsyncJob';

function ContentList() {
  const { executeBatch, progress, isProcessing, completedCount, totalCount } = 
    useBatchAsyncJobs();

  const handleBulkDelete = async () => {
    const jobFunctions = selectedIds.map(id => 
      async () => {
        const response = await api.delete(`/contents/${id}/async`);
        return response.data;
      }
    );

    await executeBatch(jobFunctions, {
      onProgress: (completed, total) => {
        console.log(`Deleted ${completed} of ${total}`);
      }
    });

    // Refresh list after completion
    await fetchContents();
  };

  return (
    <div>
      <button onClick={handleBulkDelete} disabled={isProcessing}>
        Delete Selected ({selectedIds.length})
      </button>

      {isProcessing && (
        <ProgressBar 
          progress={progress}
          label={`Deleting: ${completedCount} of ${totalCount}`}
        />
      )}
    </div>
  );
}
```

---

### Step 4: Add Job Dashboard (20 minutes)

Create a new component to show all user jobs:

```typescript
// components/JobMonitor.tsx (NEW FILE)
import { useAsyncJobList } from '@/hooks/useAsyncJob';
import { AsyncJobCard } from '@/components/async/AsyncJobComponents';

export function JobMonitor() {
  const { jobs, loading, refresh, cancelJob } = useAsyncJobList(true, 5000);

  const activeJobs = jobs.filter(j => 
    ['pending', 'queued', 'processing'].includes(j.status)
  );

  if (activeJobs.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Active Jobs ({activeJobs.length})</h3>
        <button onClick={refresh} className="text-sm text-blue-600">
          Refresh
        </button>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {activeJobs.map(job => (
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
```

Then add to your layout:

```typescript
// Layout.tsx or App.tsx
import { JobMonitor } from '@/components/JobMonitor';

function Layout() {
  return (
    <div>
      {/* Your existing layout */}
      <JobMonitor /> {/* Add this */}
    </div>
  );
}
```

---

### Step 5: Replace Alert/Confirm with Toasts (10 minutes)

**Old:**
```typescript
alert('Content saved!');
confirm('Are you sure?');
```

**New:**
```typescript
import { useToast } from '@/components/notifications/ToastSystem';

function MyComponent() {
  const { showSuccess, showWarning } = useToast();

  const handleSave = () => {
    showSuccess('Saved!', 'Content has been saved successfully');
  };

  const handleDelete = () => {
    showWarning(
      'Confirm Deletion',
      'This action cannot be undone'
    );
  };
}
```

---

### Step 6: Update Content Import/Export (15 minutes)

**For Long-Running Operations:**

```typescript
// BEFORE: Blocking import
const handleImport = async (file: File) => {
  setLoading(true);
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    await api.post('/contents/import', formData);
    alert('Import complete');
  } catch (error) {
    alert('Import failed');
  }
  setLoading(false);
};
```

```typescript
// AFTER: Async import with progress
import { useAsyncJobExecutor } from '@/hooks/useAsyncJob';

function ImportDialog() {
  const { execute, loading, job } = useAsyncJobExecutor();

  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await execute(
        () => api.post('/contents/import-async', formData),
        {
          successMessage: 'Import Completed',
          onProgress: (progress) => {
            console.log(`Importing: ${progress}%`);
          }
        }
      );

      console.log('Import result:', result);
      // Handle success (e.g., show summary, refresh list)
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleImport(e.target.files[0])} />
      
      {loading && job && (
        <div className="mt-4">
          <ProcessingIndicator message="Importing data..." />
          {job.progress && (
            <ProgressBar 
              progress={job.progress}
              label={`Processing: ${job.progress}%`}
            />
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 🔍 What Needs Backend Changes

### Backend Endpoints to Add

For each synchronous operation you want to make async, add a corresponding async endpoint:

```csharp
// Example: Add async publish endpoint
[HttpPost("{id}/publish-async")]
public async Task<IActionResult> PublishAsync(string id)
{
    // 1. Create job ID
    var jobId = Guid.NewGuid().ToString();
    
    // 2. Queue message in RabbitMQ
    await _messageProducer.PublishContentAsync(id, jobId);
    
    // 3. Return job ID immediately
    return Ok(new JobCreationResponse 
    { 
        JobId = jobId,
        Message = "Content publishing queued"
    });
}

// Add job status endpoint
[HttpGet("/api/jobs/{jobId}")]
public async Task<IActionResult> GetJobStatus(string jobId)
{
    var job = await _jobRepository.GetByIdAsync(jobId);
    if (job == null) return NotFound();
    
    return Ok(job);
}
```

---

## 🧪 Testing Your Migration

### Test Checklist

1. **Backend is Running**
   ```bash
   docker-compose ps
   # All services should be "Up" and "healthy"
   ```

2. **Frontend Can Reach Backend**
   ```bash
   curl http://localhost:5000/api/health
   # Should return 200 OK
   ```

3. **Test Toast Notifications**
   - Trigger any action
   - Verify toast appears in top-right
   - Verify auto-dismissal works

4. **Test Async Operation**
   - Start a publish operation
   - Verify loading state shows
   - Verify progress updates
   - Verify completion notification
   - Check backend logs: `docker-compose logs -f cms-api`

5. **Test Job Listing**
   - Navigate to jobs dashboard
   - Verify active jobs appear
   - Verify completed jobs are filtered correctly

6. **Test Batch Operations**
   - Select multiple items
   - Trigger batch delete
   - Verify progress bar updates
   - Verify all operations complete

---

## 📊 Migration Progress Tracker

Use this to track what you've updated:

### Components to Update

- [ ] App.tsx (Add ToastProvider)
- [ ] ContentEdit.tsx (Async publish)
- [ ] ContentList.tsx (Batch delete)
- [ ] MediaUpload.tsx (Async upload)
- [ ] ImportDialog.tsx (Async import)
- [ ] ExportDialog.tsx (Async export)
- [ ] Layout.tsx (Add JobMonitor)
- [ ] UserNotifications.tsx (Replace alerts with toasts)

### New Components to Add

- [ ] JobMonitor.tsx (Global job monitor)
- [ ] ContentPublishButton.tsx (Reusable publish button)
- [ ] BulkActionsToolbar.tsx (Batch operation controls)

### Backend Endpoints Needed

- [ ] POST /api/contents/:id/publish-async
- [ ] DELETE /api/contents/:id/async
- [ ] POST /api/contents/import-async
- [ ] POST /api/contents/export-async
- [ ] GET /api/jobs/:jobId
- [ ] GET /api/jobs (list user jobs)
- [ ] POST /api/jobs/:jobId/cancel

---

## 🎯 Quick Wins (Do These First)

1. **Add Toast System** (5 min)
   - Update App.tsx
   - Test with `showSuccess('Test', 'It works!')`

2. **Replace One Alert** (2 min)
   - Find any `alert()` call
   - Replace with `showSuccess()` or `showError()`

3. **Test Existing Backend** (3 min)
   - Verify backend is accessible
   - Test health endpoint

4. **Add Job Monitor** (10 min)
   - Copy JobMonitor component
   - Add to layout
   - Verify it shows up (even if empty)

---

## 💡 Best Practices During Migration

1. **Start Small**: Migrate one feature at a time
2. **Test Thoroughly**: Test each migration before moving on
3. **Keep Old Code**: Comment out old code instead of deleting (for rollback)
4. **Monitor Backend**: Keep `docker-compose logs -f` open while testing
5. **Use Debug Mode**: Set `VITE_DEBUG_MODE=true` to see detailed logs
6. **Check RabbitMQ**: Use management UI at http://localhost:15672 to verify messages

---

## 🆘 Rollback Plan

If something goes wrong:

1. **Revert Frontend Code**: Use git to revert changes
2. **Keep Backend Running**: Backend is backwards compatible
3. **Test Basic Functionality**: Verify synchronous endpoints still work
4. **Review Logs**: Check what went wrong before retrying

---

## ✅ When You're Done

After migration is complete:

- [ ] All synchronous operations replaced with async
- [ ] Toast notifications working throughout app
- [ ] Job monitoring dashboard visible
- [ ] No more `alert()` or `confirm()` calls
- [ ] Progress indicators on long operations
- [ ] Error handling improved
- [ ] User experience enhanced with real-time feedback

---

**Need Help?**
- Review `ASYNC_INTEGRATION_GUIDE.md` for detailed examples
- Check `AsyncOperationsExample.tsx` for working code
- Enable debug mode for detailed logging
- Check backend logs: `docker-compose logs -f cms-api`

**Happy Migrating!** 🚀
