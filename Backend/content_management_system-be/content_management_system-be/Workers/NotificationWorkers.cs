using CMS.Messaging.Configuration;
using CMS.Messaging.Consumers;
using CMS.Messaging.Events;
using Microsoft.Extensions.Options;

namespace CMS.Workers;

/// <summary>
/// Worker for processing email notifications
/// </summary>
public class EmailNotificationWorker : RabbitMQWorkerBase<EmailNotificationEvent>
{
    public EmailNotificationWorker(
        RabbitMQConnectionFactory connectionFactory,
        IOptions<RabbitMQSettings> settings,
        ILogger<EmailNotificationWorker> logger,
        IServiceProvider serviceProvider)
        : base(
            connectionFactory,
            settings,
            logger,
            serviceProvider,
            settings.Value.Queues.EmailNotifications,
            settings.Value.Exchanges.Notifications,
            "notification.email")
    {
    }

    protected override async Task ProcessMessageAsync(
        EmailNotificationEvent @event,
        IServiceProvider serviceProvider,
        CancellationToken cancellationToken)
    {
        var consumer = serviceProvider.GetRequiredService<EmailNotificationConsumer>();
        await consumer.HandleAsync(@event, cancellationToken);
    }
}

/// <summary>
/// Worker for processing push notifications
/// </summary>
public class PushNotificationWorker : RabbitMQWorkerBase<PushNotificationEvent>
{
    public PushNotificationWorker(
        RabbitMQConnectionFactory connectionFactory,
        IOptions<RabbitMQSettings> settings,
        ILogger<PushNotificationWorker> logger,
        IServiceProvider serviceProvider)
        : base(
            connectionFactory,
            settings,
            logger,
            serviceProvider,
            settings.Value.Queues.PushNotifications,
            settings.Value.Exchanges.Notifications,
            "notification.push")
    {
    }

    protected override async Task ProcessMessageAsync(
        PushNotificationEvent @event,
        IServiceProvider serviceProvider,
        CancellationToken cancellationToken)
    {
        var consumer = serviceProvider.GetRequiredService<PushNotificationConsumer>();
        await consumer.HandleAsync(@event, cancellationToken);
    }
}

/// <summary>
/// Worker for processing admin alerts
/// </summary>
public class AdminAlertWorker : RabbitMQWorkerBase<AdminAlertEvent>
{
    public AdminAlertWorker(
        RabbitMQConnectionFactory connectionFactory,
        IOptions<RabbitMQSettings> settings,
        ILogger<AdminAlertWorker> logger,
        IServiceProvider serviceProvider)
        : base(
            connectionFactory,
            settings,
            logger,
            serviceProvider,
            settings.Value.Queues.AdminAlerts,
            settings.Value.Exchanges.Notifications,
            "notification.admin")
    {
    }

    protected override async Task ProcessMessageAsync(
        AdminAlertEvent @event,
        IServiceProvider serviceProvider,
        CancellationToken cancellationToken)
    {
        var consumer = serviceProvider.GetRequiredService<AdminAlertConsumer>();
        await consumer.HandleAsync(@event, cancellationToken);
    }
}
