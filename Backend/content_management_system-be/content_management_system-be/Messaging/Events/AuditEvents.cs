namespace CMS.Messaging.Events;

/// <summary>
/// Event for capturing audit logs
/// </summary>
public class AuditLogEvent : BaseEvent
{
    public int? UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public int? EntityId { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public Dictionary<string, object> OldValues { get; set; } = new();
    public Dictionary<string, object> NewValues { get; set; } = new();
    public bool Success { get; set; } = true;
    public string? ErrorMessage { get; set; }

    public AuditLogEvent()
    {
        EventType = nameof(AuditLogEvent);
    }
}

/// <summary>
/// Audit action types
/// </summary>
public static class AuditActions
{
    public const string Create = "Create";
    public const string Update = "Update";
    public const string Delete = "Delete";
    public const string View = "View";
    public const string Login = "Login";
    public const string Logout = "Logout";
    public const string FailedLogin = "FailedLogin";
    public const string PasswordChange = "PasswordChange";
    public const string RoleChange = "RoleChange";
    public const string Publish = "Publish";
    public const string Unpublish = "Unpublish";
}
