namespace CMS.Messaging.Events;

/// <summary>
/// Base event class for all messaging events
/// </summary>
public abstract class BaseEvent
{
    public Guid EventId { get; set; } = Guid.NewGuid();
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string EventType { get; set; } = string.Empty;
    public string Source { get; set; } = "CMS-API";
}
