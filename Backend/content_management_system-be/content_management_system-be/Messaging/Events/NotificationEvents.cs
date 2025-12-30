namespace CMS.Messaging.Events;

/// <summary>
/// Event for sending email notifications
/// </summary>
public class EmailNotificationEvent : BaseEvent
{
    public List<string> Recipients { get; set; } = new();
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string TemplateName { get; set; } = string.Empty;
    public Dictionary<string, string> TemplateData { get; set; } = new();
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;

    public EmailNotificationEvent()
    {
        EventType = nameof(EmailNotificationEvent);
    }
}

/// <summary>
/// Event for sending push notifications
/// </summary>
public class PushNotificationEvent : BaseEvent
{
    public List<int> UserIds { get; set; } = new();
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string ActionUrl { get; set; } = string.Empty;
    public Dictionary<string, string> Data { get; set; } = new();
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;

    public PushNotificationEvent()
    {
        EventType = nameof(PushNotificationEvent);
    }
}

/// <summary>
/// Event for admin alerts
/// </summary>
public class AdminAlertEvent : BaseEvent
{
    public string AlertType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public AlertSeverity Severity { get; set; } = AlertSeverity.Info;
    public Dictionary<string, object> Metadata { get; set; } = new();

    public AdminAlertEvent()
    {
        EventType = nameof(AdminAlertEvent);
    }
}

public enum NotificationPriority
{
    Low,
    Normal,
    High,
    Critical
}

public enum AlertSeverity
{
    Info,
    Warning,
    Error,
    Critical
}
