using CMS.Messaging.Events;
using CMS.Messaging.Producers;
using CMS.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Controllers;

/// <summary>
/// Example showing comment moderation with RabbitMQ
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CommentsWithMessagingController : ControllerBase
{
    private readonly ICommentService _commentService;
    private readonly IMessageProducer _messageProducer;
    private readonly ILogger<CommentsWithMessagingController> _logger;

    public CommentsWithMessagingController(
        ICommentService commentService,
        IMessageProducer messageProducer,
        ILogger<CommentsWithMessagingController> logger)
    {
        _commentService = commentService;
        _messageProducer = messageProducer;
        _logger = logger;
    }

    /// <summary>
    /// Create comment and trigger automated moderation
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateComment([FromBody] dynamic commentDto)
    {
        try
        {
            // Save comment (implement your actual DTO and service)
            // var comment = await _commentService.CreateAsync(commentDto);

            // Trigger automated comment moderation
            var moderationEvent = new CommentModerationEvent
            {
                CommentId = Guid.NewGuid().ToString(), // comment.CommentId
                ContentId = 1, // commentDto.ContentId
                UserId = int.Parse(User.FindFirst("sub")?.Value ?? "0"),
                CommentText = "Sample comment text", // commentDto.Text
                UserName = User.Identity?.Name ?? "Anonymous",
                UserEmail = User.FindFirst("email")?.Value ?? ""
            };

            await _messageProducer.PublishBackgroundTaskAsync(moderationEvent, "moderation");

            _logger.LogInformation("Comment created and sent for moderation");

            return Ok(new { message = "Comment created and sent for moderation" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating comment");
            return StatusCode(500, "An error occurred while creating comment");
        }
    }
}
