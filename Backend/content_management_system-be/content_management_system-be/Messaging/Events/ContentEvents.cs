namespace CMS.Messaging.Events;

/// <summary>
/// Event published when content is created or published
/// </summary>
public class ContentPublishedEvent : BaseEvent
{
    public int ContentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public int AuthorId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
    public string Category { get; set; } = string.Empty;

    public ContentPublishedEvent()
    {
        EventType = nameof(ContentPublishedEvent);
    }
}

/// <summary>
/// Event published when content is updated
/// </summary>
public class ContentUpdatedEvent : BaseEvent
{
    public int ContentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public int UpdatedBy { get; set; }
    public string UpdatedByName { get; set; } = string.Empty;
    public Dictionary<string, object> Changes { get; set; } = new();

    public ContentUpdatedEvent()
    {
        EventType = nameof(ContentUpdatedEvent);
    }
}

/// <summary>
/// Event published when content is deleted
/// </summary>
public class ContentDeletedEvent : BaseEvent
{
    public int ContentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int DeletedBy { get; set; }
    public string DeletedByName { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;

    public ContentDeletedEvent()
    {
        EventType = nameof(ContentDeletedEvent);
    }
}
