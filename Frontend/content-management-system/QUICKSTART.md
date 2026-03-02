# Quick Start: Using Async Operations

## 🚀 5-Minute Integration

### 1. Basic Publish Button

```tsx
import { useAsyncOperation } from './hooks/useAsyncOperation';
import { LoadingButton } from './components/async/FeedbackComponents';
import { publishContent } from './services/contentService';
import { JobType } from './services/asyncJobService';

function MyComponent({ contentId }) {
  const { execute, loading } = useAsyncOperation({
    jobType: JobType.CONTENT_PUBLISH,
    successMessage: 'Published successfully!',
  });

  return (
    <LoadingButton 
      onClick={() => execute(() => publishContent({ contentId }))}
      loading={loading}
    >
      Publish
    </LoadingButton>
  );
}
```

### 2. With Progress Bar

```tsx
function MyComponent({ contentId }) {
  const { execute, loading, job } = useAsyncOperation({
    jobType: JobType.CONTENT_PUBLISH,
    successMessage: 'Published!',
  });

  return (
    <div>
      <LoadingButton 
        onClick={() => execute(() => publishContent({ contentId }))}
        loading={loading}
      >
        Publish
      </LoadingButton>
      
      {job?.progress && (
        <ProgressBar progress={job.progress} className="mt-4" />
      )}
    </div>
  );
}
```

### 3. Custom Success Handler

```tsx
function MyComponent({ contentId, onComplete }) {
  const { execute, loading } = useAsyncOperation({
    jobType: JobType.CONTENT_PUBLISH,
    onSuccess: (result) => {
      console.log('Job completed:', result);
      onComplete?.();
    },
  });

  return (
    <LoadingButton 
      onClick={() => execute(() => publishContent({ contentId }))}
      loading={loading}
    >
      Publish
    </LoadingButton>
  );
}
```

## 📦 Available Components

### Buttons
```tsx
import { LoadingButton } from './components/async/FeedbackComponents';

<LoadingButton loading={isLoading} onClick={handleClick}>
  Submit
</LoadingButton>
```

### Progress
```tsx
import { ProgressBar, CircularProgress } from './components/async/FeedbackComponents';

<ProgressBar progress={50} label="Uploading..." />
<CircularProgress progress={75} size={64} />
```

### Messages
```tsx
import { StatusMessage } from './components/async/FeedbackComponents';

<StatusMessage 
  type="success" 
  title="Success!" 
  message="Operation completed"
/>
```

### Toasts
```tsx
import { useToast } from './context/ToastContext';

const { showSuccess, showError } = useToast();

showSuccess('Done!', 'Your content is published');
showError('Failed', 'Something went wrong');
```

## 🎯 Common Patterns

### Pattern 1: Simple Operation
```tsx
const { execute, loading } = useAsyncOperation();

const handleClick = () => {
  execute(() => myApiCall());
};
```

### Pattern 2: With Callbacks
```tsx
const { execute, loading } = useAsyncOperation({
  onSuccess: (result) => { /* success */ },
  onError: (error) => { /* error */ },
});
```

### Pattern 3: Custom Messages
```tsx
const { execute } = useAsyncOperation({
  successMessage: 'Content published!',
  errorMessage: 'Failed to publish',
  showToasts: true, // default
});
```

### Pattern 4: Prevent Duplicate Submissions
```tsx
import { usePreventDuplicate } from './hooks/useAsyncOperation';

const { submitting, execute } = usePreventDuplicate();

const handleSubmit = () => {
  execute(async () => {
    // Your async operation
    await saveData();
  });
};

<button disabled={submitting}>Submit</button>
```

## 🔧 Configuration

### Environment Variables
```env
VITE_API_URL=http://localhost:5000/api
VITE_POLL_INTERVAL=2000
VITE_MAX_POLL_ATTEMPTS=30
```

### Context Options
```tsx
<AsyncJobProvider 
  autoRefreshInterval={30000}  // Auto-refresh jobs every 30s
  persistState={true}          // Save to localStorage
>
  <App />
</AsyncJobProvider>
```

## 📱 Full Example: Content Editor

```tsx
import React, { useState } from 'react';
import { useAsyncOperation } from './hooks/useAsyncOperation';
import { useToast } from './context/ToastContext';
import { LoadingButton, ProgressBar } from './components/async/FeedbackComponents';
import { publishContent } from './services/contentService';
import { JobType } from './services/asyncJobService';

function ContentEditor({ contentId, initialData }) {
  const [content, setContent] = useState(initialData);
  const { showSuccess } = useToast();
  
  const { execute: publish, loading: publishing, job } = useAsyncOperation({
    jobType: JobType.CONTENT_PUBLISH,
    successMessage: 'Content published successfully!',
    onSuccess: () => {
      showSuccess('Published', 'Your content is now live');
    },
  });

  const handlePublish = () => {
    publish(() => publishContent({ 
      contentId,
      sendNotification: true 
    }));
  };

  return (
    <div className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-4 border rounded"
        rows={10}
      />

      <div className="flex gap-3">
        <LoadingButton
          onClick={handlePublish}
          loading={publishing}
          disabled={publishing}
          variant="primary"
        >
          Publish Content
        </LoadingButton>
      </div>

      {job?.progress !== undefined && (
        <div className="p-4 bg-blue-50 rounded">
          <ProgressBar 
            progress={job.progress} 
            label="Publishing..." 
          />
        </div>
      )}
    </div>
  );
}
```

## 🎨 Styling

All components use Tailwind CSS. Customize colors in your config:

```js
// tailwind.config.js
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

## 🔍 Debugging

Enable debug mode:
```env
VITE_DEBUG_MODE=true
```

This will log:
- API requests/responses
- Job status changes
- Polling activity
- State updates

## ⚠️ Common Mistakes

### ❌ Don't: Call execute in render
```tsx
// BAD
const { execute } = useAsyncOperation();
execute(() => api.call()); // Called every render!
```

### ✅ Do: Call in event handler
```tsx
// GOOD
const { execute } = useAsyncOperation();
const handleClick = () => {
  execute(() => api.call());
};
```

### ❌ Don't: Forget loading state
```tsx
// BAD - user can click multiple times
<button onClick={handleSubmit}>Submit</button>
```

### ✅ Do: Disable during loading
```tsx
// GOOD
<LoadingButton loading={loading} onClick={handleSubmit}>
  Submit
</LoadingButton>
```

## 📞 Need Help?

- Check [ASYNC_OPERATIONS_GUIDE.md](./ASYNC_OPERATIONS_GUIDE.md) for detailed docs
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Review example components in `src/components/examples/`

---

Ready to build? Start with the basic pattern above and expand from there! 🚀
