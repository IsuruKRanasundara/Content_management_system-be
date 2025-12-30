using CMS.Messaging.Events;

namespace CMS.Messaging.Producers;

/// <summary>
/// Interface for message producer
/// </summary>
public interface IMessageProducer
{
    /// <summary>
    /// Publish an event to a specific exchange with routing key
    /// </summary>
    Task PublishAsync<T>(T @event, string exchange, string routingKey) where T : BaseEvent;
    
    /// <summary>
    /// Publish to content publishing exchange
    /// </summary>
    Task PublishContentEventAsync<T>(T @event, string routingKey) where T : BaseEvent;
    
    /// <summary>
    /// Publish to notification exchange
    /// </summary>
    Task PublishNotificationAsync<T>(T @event, string routingKey) where T : BaseEvent;
    
    /// <summary>
    /// Publish to audit exchange
    /// </summary>
    Task PublishAuditLogAsync(AuditLogEvent @event);
    
    /// <summary>
    /// Publish to background processing exchange
    /// </summary>
    Task PublishBackgroundTaskAsync<T>(T @event, string routingKey) where T : BaseEvent;
}
