using CMS.Messaging.Configuration;
using CMS.Messaging.Consumers;
using CMS.Messaging.Events;
using Microsoft.Extensions.Options;

namespace CMS.Workers;

/// <summary>
/// Worker for moderating comments
/// </summary>
public class CommentModerationWorker : RabbitMQWorkerBase<CommentModerationEvent>
{
    public CommentModerationWorker(
        RabbitMQConnectionFactory connectionFactory,
        IOptions<RabbitMQSettings> settings,
        ILogger<CommentModerationWorker> logger,
        IServiceProvider serviceProvider)
        : base(
            connectionFactory,
            settings,
            logger,
            serviceProvider,
            settings.Value.Queues.CommentModeration,
            settings.Value.Exchanges.BackgroundProcessing,
            "background.moderation")
    {
    }

    protected override async Task ProcessMessageAsync(
        CommentModerationEvent @event,
        IServiceProvider serviceProvider,
        CancellationToken cancellationToken)
    {
        var consumer = serviceProvider.GetRequiredService<CommentModerationConsumer>();
        await consumer.HandleAsync(@event, cancellationToken);
    }
}

/// <summary>
/// Worker for content classification
/// </summary>
public class ContentClassificationWorker : RabbitMQWorkerBase<ContentClassificationEvent>
{
    public ContentClassificationWorker(
        RabbitMQConnectionFactory connectionFactory,
        IOptions<RabbitMQSettings> settings,
        ILogger<ContentClassificationWorker> logger,
        IServiceProvider serviceProvider)
        : base(
            connectionFactory,
            settings,
            logger,
            serviceProvider,
            settings.Value.Queues.ContentClassification,
            settings.Value.Exchanges.BackgroundProcessing,
            "background.classification")
    {
    }

    protected override async Task ProcessMessageAsync(
        ContentClassificationEvent @event,
        IServiceProvider serviceProvider,
        CancellationToken cancellationToken)
    {
        var consumer = serviceProvider.GetRequiredService<ContentClassificationConsumer>();
        await consumer.HandleAsync(@event, cancellationToken);
    }
}

/// <summary>
/// Worker for auto-tagging content
/// </summary>
public class AutoTaggingWorker : RabbitMQWorkerBase<AutoTaggingEvent>
{
    public AutoTaggingWorker(
        RabbitMQConnectionFactory connectionFactory,
        IOptions<RabbitMQSettings> settings,
        ILogger<AutoTaggingWorker> logger,
        IServiceProvider serviceProvider)
        : base(
            connectionFactory,
            settings,
            logger,
            serviceProvider,
            settings.Value.Queues.AutoTagging,
            settings.Value.Exchanges.BackgroundProcessing,
            "background.tagging")
    {
    }

    protected override async Task ProcessMessageAsync(
        AutoTaggingEvent @event,
        IServiceProvider serviceProvider,
        CancellationToken cancellationToken)
    {
        var consumer = serviceProvider.GetRequiredService<AutoTaggingConsumer>();
        await consumer.HandleAsync(@event, cancellationToken);
    }
}
