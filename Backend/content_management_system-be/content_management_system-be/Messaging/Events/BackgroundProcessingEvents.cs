namespace CMS.Messaging.Events;

/// <summary>
/// Event for comment moderation
/// </summary>
public class CommentModerationEvent : BaseEvent
{
    public string CommentId { get; set; } = string.Empty;
    public int ContentId { get; set; }
    public int UserId { get; set; }
    public string CommentText { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;

    public CommentModerationEvent()
    {
        EventType = nameof(CommentModerationEvent);
    }
}

/// <summary>
/// Event for content classification
/// </summary>
public class ContentClassificationEvent : BaseEvent
{
    public int ContentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public List<string> ExistingTags { get; set; } = new();

    public ContentClassificationEvent()
    {
        EventType = nameof(ContentClassificationEvent);
    }
}

/// <summary>
/// Event for auto-tagging content
/// </summary>
public class AutoTaggingEvent : BaseEvent
{
    public int ContentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public List<string> ExistingTags { get; set; } = new();
    public int MaxSuggestedTags { get; set; } = 5;

    public AutoTaggingEvent()
    {
        EventType = nameof(AutoTaggingEvent);
    }
}

/// <summary>
/// Event for generating AI summaries
/// </summary>
public class AISummaryEvent : BaseEvent
{
    public int ContentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public int MaxSummaryLength { get; set; } = 300;

    public AISummaryEvent()
    {
        EventType = nameof(AISummaryEvent);
    }
}
