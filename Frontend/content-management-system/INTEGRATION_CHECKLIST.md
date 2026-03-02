# Integration Checklist: RabbitMQ Frontend

## ✅ Installation & Setup

- [ ] Install dependencies: `npm install`
- [ ] Create environment files:
  - [ ] `.env.development` (local dev)
  - [ ] `.env.prod` (Docker/production)
- [ ] Update `VITE_API_URL` to match backend
- [ ] Set polling configuration (`VITE_POLL_INTERVAL`, `VITE_MAX_POLL_ATTEMPTS`)

## ✅ Integration Steps

### 1. Context Providers
- [x] `AsyncJobContext` - Job state management
- [x] `ToastContext` - Notifications
- [x] Added to `App.tsx` wrapper
- [x] `JobStatusIndicator` added to app

### 2. Backend API Endpoints Required

Ensure your backend implements these endpoints:

#### Job Management
- [ ] `GET /api/jobs` - Get all jobs for current user
- [ ] `GET /api/jobs/:jobId` - Get specific job status
- [ ] `POST /api/jobs/:jobId/cancel` - Cancel a job
- [ ] `DELETE /api/jobs/:jobId` - Delete a job record

#### Content Operations
- [ ] `POST /api/contents/publish` - Publish content (returns jobId)
- [ ] `POST /api/contents/:id/unpublish` - Unpublish content
- [ ] `POST /api/contents/bulk` - Bulk operations

#### Response Format
Job creation endpoints should return:
```json
{
  "jobId": "string",
  "message": "string",
  "estimatedTime": 30  // optional, in seconds
}
```

Job status endpoint should return:
```json
{
  "id": "string",
  "type": "content_publish",
  "status": "processing",
  "progress": 50,
  "result": null,
  "error": null,
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:01:00Z",
  "completedAt": null,
  "metadata": {}
}
```

### 3. Component Integration

#### Update Existing Components
- [ ] Replace synchronous operations with async ones
- [ ] Add loading states to buttons
- [ ] Show progress indicators
- [ ] Display toast notifications

Example transformation:
```tsx
// Before
const handlePublish = async () => {
  await publishContent(contentId);
  alert('Published!');
};

// After
const { execute, loading } = useAsyncOperation({
  jobType: JobType.CONTENT_PUBLISH,
  successMessage: 'Content published!',
});

const handlePublish = () => {
  execute(() => publishContent({ contentId }));
};
```

### 4. Router Updates
- [x] Admin job panel route added: `/admin/jobs`
- [ ] Add link to admin panel in navigation
- [ ] Protect with role-based access

### 5. Testing

#### Manual Testing
- [ ] Create content and publish
- [ ] Verify job appears in floating indicator
- [ ] Check progress updates in real-time
- [ ] Verify toast notifications appear
- [ ] Test job cancellation
- [ ] Test failed job retry
- [ ] Visit admin panel at `/admin/jobs`
- [ ] Test filtering and searching jobs
- [ ] Verify job persistence across page refresh

#### Error Scenarios
- [ ] Network failure during operation
- [ ] Backend returns 500 error
- [ ] Job timeout (max polling attempts)
- [ ] Invalid job ID
- [ ] Unauthorized access to jobs

### 6. Docker Integration

#### Update Docker Compose
```yaml
frontend:
  build: ./Frontend/content-management-system
  environment:
    - VITE_API_URL=http://backend:5000/api
  ports:
    - "3000:80"
  depends_on:
    - backend

backend:
  # ... existing config
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

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=http://backend:5000/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 7. Optional Enhancements

#### WebSocket Integration
- [ ] Backend implements WebSocket endpoint
- [ ] Frontend connects via `webSocketService`
- [ ] Real-time job updates without polling
- [ ] Test reconnection on disconnect

#### Advanced Features
- [ ] Job scheduling (future execution)
- [ ] Job dependencies (chain jobs)
- [ ] Batch operations UI
- [ ] Export job history
- [ ] Job notifications via email

## 📋 Verification Checklist

### Frontend
- [x] All components render without errors
- [x] TypeScript compiles without errors
- [ ] No console errors in browser
- [ ] Toast animations work smoothly
- [ ] Loading states show correctly
- [ ] Progress bars update properly

### Backend Integration
- [ ] API calls succeed
- [ ] Job IDs returned correctly
- [ ] Job status updates in real-time
- [ ] Error responses handled properly
- [ ] Authentication works

### User Experience
- [ ] Loading indicators clear and visible
- [ ] Success/error messages informative
- [ ] No duplicate submissions possible
- [ ] Jobs persist across refresh
- [ ] Admin panel accessible
- [ ] Responsive on mobile

## 🚀 Deployment Steps

1. **Build Frontend**
   ```bash
   npm run build
   ```

2. **Test Production Build**
   ```bash
   npm run preview
   ```

3. **Deploy with Docker**
   ```bash
   docker-compose up --build
   ```

4. **Verify Deployment**
   - [ ] Frontend loads at http://localhost:3000
   - [ ] Backend responds at http://localhost:5000
   - [ ] RabbitMQ management at http://localhost:15672
   - [ ] Test end-to-end job flow

## 🐛 Troubleshooting

### Common Issues

**Jobs not appearing:**
- Check `VITE_API_URL` in env file
- Verify backend job endpoints exist
- Check browser console for errors

**Polling not working:**
- Verify `VITE_POLL_INTERVAL` is set
- Check network tab for API calls
- Enable `VITE_DEBUG_MODE=true`

**Toast not showing:**
- Verify `ToastProvider` wraps app
- Check z-index conflicts
- Inspect console for errors

**Admin panel blank:**
- Check route protection
- Verify user has admin role
- Check for JavaScript errors

## 📚 Resources

- [ASYNC_OPERATIONS_GUIDE.md](./ASYNC_OPERATIONS_GUIDE.md) - Usage guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture documentation
- Backend API documentation
- RabbitMQ documentation

## ✅ Sign-off

- [ ] Frontend lead approved
- [ ] Backend integration tested
- [ ] QA verified all scenarios
- [ ] Documentation complete
- [ ] Ready for production

---

**Integration Date**: ___________  
**Completed By**: ___________  
**Verified By**: ___________
