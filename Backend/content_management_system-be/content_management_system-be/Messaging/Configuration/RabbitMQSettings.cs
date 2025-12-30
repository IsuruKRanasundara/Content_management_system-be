namespace CMS.Messaging.Configuration;

/// <summary>
/// RabbitMQ connection and configuration settings
/// </summary>
public class RabbitMQSettings
{
    public string HostName { get; set; } = "localhost";
    public int Port { get; set; } = 5672;
    public string UserName { get; set; } = "guest";
    public string Password { get; set; } = "guest";
    public string VirtualHost { get; set; } = "/";
    public bool AutomaticRecoveryEnabled { get; set; } = true;
    public ushort RequestedHeartbeat { get; set; } = 60;
    public TimeSpan NetworkRecoveryInterval { get; set; } = TimeSpan.FromSeconds(10);
    
    /// <summary>
    /// Exchange configurations
    /// </summary>
    public ExchangeSettings Exchanges { get; set; } = new();
    
    /// <summary>
    /// Queue configurations
    /// </summary>
    public QueueSettings Queues { get; set; } = new();
}

/// <summary>
/// Exchange configuration
/// </summary>
public class ExchangeSettings
{
    public string ContentPublishing { get; set; } = "cms.content.events";
    public string Notifications { get; set; } = "cms.notifications";
    public string AuditLogs { get; set; } = "cms.audit";
    public string BackgroundProcessing { get; set; } = "cms.background";
}

/// <summary>
/// Queue configuration
/// </summary>
public class QueueSettings
{
    // Content Publishing Queues
    public string SubscriberNotifications { get; set; } = "cms.content.subscriber-notifications";
    public string ContentIndexing { get; set; } = "cms.content.indexing";
    public string AISummary { get; set; } = "cms.content.ai-summary";
    public string CacheUpdate { get; set; } = "cms.content.cache-update";
    
    // Notification Queues
    public string EmailNotifications { get; set; } = "cms.notifications.email";
    public string PushNotifications { get; set; } = "cms.notifications.push";
    public string AdminAlerts { get; set; } = "cms.notifications.admin";
    
    // Audit Log Queue
    public string AuditLogs { get; set; } = "cms.audit.logs";
    
    // Background Processing Queues
    public string CommentModeration { get; set; } = "cms.background.comment-moderation";
    public string ContentClassification { get; set; } = "cms.background.content-classification";
    public string AutoTagging { get; set; } = "cms.background.auto-tagging";
}
