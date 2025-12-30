using CMS.Messaging.Configuration;
using CMS.Messaging.Consumers;
using CMS.Messaging.Events;
using Microsoft.Extensions.Options;

namespace CMS.Workers;

/// <summary>
/// Worker for processing audit logs
/// </summary>
public class AuditLogWorker : RabbitMQWorkerBase<AuditLogEvent>
{
    public AuditLogWorker(
        RabbitMQConnectionFactory connectionFactory,
        IOptions<RabbitMQSettings> settings,
        ILogger<AuditLogWorker> logger,
        IServiceProvider serviceProvider)
        : base(
            connectionFactory,
            settings,
            logger,
            serviceProvider,
            settings.Value.Queues.AuditLogs,
            settings.Value.Exchanges.AuditLogs,
            "audit.log")
    {
    }

    protected override async Task ProcessMessageAsync(
        AuditLogEvent @event,
        IServiceProvider serviceProvider,
        CancellationToken cancellationToken)
    {
        var consumer = serviceProvider.GetRequiredService<AuditLogConsumer>();
        await consumer.HandleAsync(@event, cancellationToken);
    }
}
