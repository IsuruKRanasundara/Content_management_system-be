using CMS.DTOs;
using CMS.Messaging.Events;
using CMS.Messaging.Producers;
using CMS.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Controllers;

/// <summary>
/// Example controller showing RabbitMQ integration
/// This demonstrates how to publish events when content is created/updated
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ContentWithMessagingController : ControllerBase
{
    private readonly IContentService _contentService;
    private readonly IMessageProducer _messageProducer;
    private readonly ILogger<ContentWithMessagingController> _logger;

    public ContentWithMessagingController(
        IContentService contentService,
        IMessageProducer messageProducer,
        ILogger<ContentWithMessagingController> logger)
    {
        _contentService = contentService;
        _messageProducer = messageProducer;
        _logger = logger;
    }

    /// <summary>
    /// Create and publish new content
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateContent(ContentCreateDto dto)
    {
        try
        {
            // 1. Save content to database synchronously
            var created = await _contentService.CreateAsync(dto);

            // 2. Publish events to RabbitMQ asynchronously
            var contentPublishedEvent = new ContentPublishedEvent
            {
                ContentId = created.ContentId,
                Title = created.Title,
                Body = created.Body,
                AuthorId = int.Parse(User.FindFirst("sub")?.Value ?? "0"),
                AuthorName = User.Identity?.Name ?? "Unknown",
                Status = created.Status,
                Tags = new List<string>(), // Add tags if available
                Category = "" // Category not available in ContentReadDto
            };

            // Publish to content exchange - will be consumed by multiple workers
            await _messageProducer.PublishContentEventAsync(contentPublishedEvent, "published");

            // 3. Trigger background AI processing
            var aiSummaryEvent = new AISummaryEvent
            {
                ContentId = created.ContentId,
                Title = created.Title,
                Body = created.Body,
                MaxSummaryLength = 300
            };
            await _messageProducer.PublishBackgroundTaskAsync(aiSummaryEvent, "ai-summary");

            var autoTaggingEvent = new AutoTaggingEvent
            {
                ContentId = created.ContentId,
                Title = created.Title,
                Body = created.Body,
                MaxSuggestedTags = 5
            };
            await _messageProducer.PublishBackgroundTaskAsync(autoTaggingEvent, "tagging");

            // 4. Send notification to subscribers
            var emailEvent = new EmailNotificationEvent
            {
                Recipients = new List<string> { "subscribers@example.com" }, // Get from subscription service
                Subject = $"New Content: {created.Title}",
                Body = $"Check out the new content: {created.Title}",
                TemplateName = "new-content",
                Priority = NotificationPriority.Normal
            };
            await _messageProducer.PublishNotificationAsync(emailEvent, "email");

            _logger.LogInformation(
                "Created content {ContentId} and published events successfully",
                created.ContentId);

            return CreatedAtAction(nameof(GetContent), new { id = created.ContentId }, created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating content");
            
            // Publish admin alert for critical errors
            var alertEvent = new AdminAlertEvent
            {
                AlertType = "ContentCreationFailed",
                Title = "Content Creation Failed",
                Message = $"Failed to create content: {ex.Message}",
                Severity = AlertSeverity.Error,
                Metadata = new Dictionary<string, object>
                {
                    { "userId", User.FindFirst("sub")?.Value ?? "Unknown" },
                    { "error", ex.Message }
                }
            };
            await _messageProducer.PublishNotificationAsync(alertEvent, "admin");

            return StatusCode(500, "An error occurred while creating content");
        }
    }

    /// <summary>
    /// Update content and publish update events
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateContent(int id, ContentCreateDto dto)
    {
        try
        {
            var existing = await _contentService.GetByIdAsync(id);
            if (existing == null)
                return NotFound();

            var updated = await _contentService.UpdateAsync(id, dto);

            // Publish update event
            var updateEvent = new ContentUpdatedEvent
            {
                ContentId = id,
                Title = updated!.Title,
                Body = updated.Body,
                UpdatedBy = int.Parse(User.FindFirst("sub")?.Value ?? "0"),
                UpdatedByName = User.Identity?.Name ?? "Unknown",
                Changes = new Dictionary<string, object>
                {
                    { "title", updated.Title },
                    { "status", updated.Status }
                }
            };
            await _messageProducer.PublishContentEventAsync(updateEvent, "updated");

            // Trigger content re-classification if content changed significantly
            var classificationEvent = new ContentClassificationEvent
            {
                ContentId = id,
                Title = updated.Title,
                Body = updated.Body
            };
            await _messageProducer.PublishBackgroundTaskAsync(classificationEvent, "classification");

            return Ok(updated);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating content {ContentId}", id);
            return StatusCode(500, "An error occurred while updating content");
        }
    }

    /// <summary>
    /// Delete content and publish delete events
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteContent(int id)
    {
        try
        {
            var content = await _contentService.GetByIdAsync(id);
            if (content == null)
                return NotFound();

            await _contentService.DeleteAsync(id);

            // Publish delete event for cache invalidation and audit
            var deleteEvent = new ContentDeletedEvent
            {
                ContentId = id,
                Title = content.Title,
                DeletedBy = int.Parse(User.FindFirst("sub")?.Value ?? "0"),
                DeletedByName = User.Identity?.Name ?? "Unknown",
                Reason = "User deleted"
            };
            await _messageProducer.PublishContentEventAsync(deleteEvent, "deleted");

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting content {ContentId}", id);
            return StatusCode(500, "An error occurred while deleting content");
        }
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetContent(int id)
    {
        var content = await _contentService.GetByIdAsync(id);
        return content == null ? NotFound() : Ok(content);
    }
}
