using CMS.Messaging.Configuration;
using CMS.Messaging.Consumers;
using CMS.Messaging.Events;
using Microsoft.Extensions.Options;

namespace CMS.Workers;

/// <summary>
/// Worker for processing content publishing workflow
/// Handles subscriber notifications
/// </summary>
public class ContentPublishingWorker : RabbitMQWorkerBase<ContentPublishedEvent>
{
    public ContentPublishingWorker(
        RabbitMQConnectionFactory connectionFactory,
        IOptions<RabbitMQSettings> settings,
        ILogger<ContentPublishingWorker> logger,
        IServiceProvider serviceProvider)
        : base(
            connectionFactory,
            settings,
            logger,
            serviceProvider,
            settings.Value.Queues.SubscriberNotifications,
            settings.Value.Exchanges.ContentPublishing,
            "content.published")
    {
    }

    protected override async Task ProcessMessageAsync(
        ContentPublishedEvent @event,
        IServiceProvider serviceProvider,
        CancellationToken cancellationToken)
    {
        var consumer = serviceProvider.GetRequiredService<SubscriberNotificationConsumer>();
        await consumer.HandleAsync(@event, cancellationToken);
    }
}

/// <summary>
/// Worker for indexing content for search
/// </summary>
public class ContentIndexingWorker : RabbitMQWorkerBase<ContentPublishedEvent>
{
    public ContentIndexingWorker(
        RabbitMQConnectionFactory connectionFactory,
        IOptions<RabbitMQSettings> settings,
        ILogger<ContentIndexingWorker> logger,
        IServiceProvider serviceProvider)
        : base(
            connectionFactory,
            settings,
            logger,
            serviceProvider,
            settings.Value.Queues.ContentIndexing,
            settings.Value.Exchanges.ContentPublishing,
            "content.*") // Listen to all content events
    {
    }

    protected override async Task ProcessMessageAsync(
        ContentPublishedEvent @event,
        IServiceProvider serviceProvider,
        CancellationToken cancellationToken)
    {
        var consumer = serviceProvider.GetRequiredService<ContentIndexingConsumer>();
        await consumer.HandleAsync(@event, cancellationToken);
    }
}

/// <summary>
/// Worker for generating AI summaries
/// </summary>
public class AISummaryWorker : RabbitMQWorkerBase<AISummaryEvent>
{
    public AISummaryWorker(
        RabbitMQConnectionFactory connectionFactory,
        IOptions<RabbitMQSettings> settings,
        ILogger<AISummaryWorker> logger,
        IServiceProvider serviceProvider)
        : base(
            connectionFactory,
            settings,
            logger,
            serviceProvider,
            settings.Value.Queues.AISummary,
            settings.Value.Exchanges.ContentPublishing,
            "content.published")
    {
    }

    protected override async Task ProcessMessageAsync(
        AISummaryEvent @event,
        IServiceProvider serviceProvider,
        CancellationToken cancellationToken)
    {
        var consumer = serviceProvider.GetRequiredService<AISummaryConsumer>();
        await consumer.HandleAsync(@event, cancellationToken);
    }
}

/// <summary>
/// Worker for updating application cache
/// </summary>
public class CacheUpdateWorker : RabbitMQWorkerBase<ContentPublishedEvent>
{
    public CacheUpdateWorker(
        RabbitMQConnectionFactory connectionFactory,
        IOptions<RabbitMQSettings> settings,
        ILogger<CacheUpdateWorker> logger,
        IServiceProvider serviceProvider)
        : base(
            connectionFactory,
            settings,
            logger,
            serviceProvider,
            settings.Value.Queues.CacheUpdate,
            settings.Value.Exchanges.ContentPublishing,
            "content.*")
    {
    }

    protected override async Task ProcessMessageAsync(
        ContentPublishedEvent @event,
        IServiceProvider serviceProvider,
        CancellationToken cancellationToken)
    {
        var consumer = serviceProvider.GetRequiredService<CacheUpdateConsumer>();
        await consumer.HandleAsync(@event, cancellationToken);
    }
}
