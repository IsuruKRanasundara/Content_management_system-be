using CMS.Messaging.Events;

namespace CMS.Messaging.Consumers;

/// <summary>
/// Base interface for all message consumers
/// </summary>
public interface IMessageConsumer<T> where T : BaseEvent
{
    Task HandleAsync(T message, CancellationToken cancellationToken);
}
