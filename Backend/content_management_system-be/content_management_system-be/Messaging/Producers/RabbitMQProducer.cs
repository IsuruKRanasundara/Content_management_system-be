using CMS.Messaging.Configuration;
using CMS.Messaging.Events;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace CMS.Messaging.Producers;

/// <summary>
/// RabbitMQ message producer implementation
/// Handles publishing events to RabbitMQ exchanges
/// </summary>
public class RabbitMQProducer : IMessageProducer, IDisposable
{
    private readonly RabbitMQConnectionFactory _connectionFactory;
    private readonly RabbitMQSettings _settings;
    private readonly ILogger<RabbitMQProducer> _logger;
    private IModel? _channel;
    private readonly object _lock = new();
    private bool _disposed;

    public RabbitMQProducer(
        RabbitMQConnectionFactory connectionFactory,
        IOptions<RabbitMQSettings> settings,
        ILogger<RabbitMQProducer> logger)
    {
        _connectionFactory = connectionFactory;
        _settings = settings.Value;
        _logger = logger;
        InitializeChannel();
    }

    /// <summary>
    /// Initialize channel and declare exchanges
    /// </summary>
    private void InitializeChannel()
    {
        try
        {
            _channel = _connectionFactory.CreateChannel();
            
            // Declare exchanges with appropriate types
            // Topic exchange for content events (allows routing by pattern)
            _channel.ExchangeDeclare(
                exchange: _settings.Exchanges.ContentPublishing,
                type: ExchangeType.Topic,
                durable: true,
                autoDelete: false);

            // Fanout exchange for notifications (broadcast to all queues)
            _channel.ExchangeDeclare(
                exchange: _settings.Exchanges.Notifications,
                type: ExchangeType.Topic,
                durable: true,
                autoDelete: false);

            // Direct exchange for audit logs
            _channel.ExchangeDeclare(
                exchange: _settings.Exchanges.AuditLogs,
                type: ExchangeType.Direct,
                durable: true,
                autoDelete: false);

            // Topic exchange for background processing
            _channel.ExchangeDeclare(
                exchange: _settings.Exchanges.BackgroundProcessing,
                type: ExchangeType.Topic,
                durable: true,
                autoDelete: false);

            _logger.LogInformation("RabbitMQ exchanges declared successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize RabbitMQ channel and exchanges");
            throw;
        }
    }

    /// <summary>
    /// Generic publish method with retry logic
    /// </summary>
    public async Task PublishAsync<T>(T @event, string exchange, string routingKey) where T : BaseEvent
    {
        if (_channel == null || !_channel.IsOpen)
        {
            lock (_lock)
            {
                if (_channel == null || !_channel.IsOpen)
                {
                    InitializeChannel();
                }
            }
        }

        var maxRetries = 3;
        var retryCount = 0;

        while (retryCount < maxRetries)
        {
            try
            {
                var message = JsonSerializer.Serialize(@event, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });
                
                var body = Encoding.UTF8.GetBytes(message);

                var properties = _channel!.CreateBasicProperties();
                properties.Persistent = true; // Messages survive broker restart
                properties.ContentType = "application/json";
                properties.MessageId = @event.EventId.ToString();
                properties.Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds());
                properties.Type = @event.EventType;
                properties.Headers = new Dictionary<string, object>
                {
                    { "source", @event.Source },
                    { "timestamp", @event.Timestamp.ToString("o") }
                };

                _channel.BasicPublish(
                    exchange: exchange,
                    routingKey: routingKey,
                    basicProperties: properties,
                    body: body);

                _logger.LogInformation(
                    "Published event {EventType} with ID {EventId} to exchange {Exchange} with routing key {RoutingKey}",
                    @event.EventType, @event.EventId, exchange, routingKey);

                await Task.CompletedTask;
                return;
            }
            catch (Exception ex)
            {
                retryCount++;
                _logger.LogWarning(ex,
                    "Failed to publish event {EventType} (Attempt {RetryCount}/{MaxRetries})",
                    @event.EventType, retryCount, maxRetries);

                if (retryCount >= maxRetries)
                {
                    _logger.LogError(ex,
                        "Failed to publish event {EventType} after {MaxRetries} attempts",
                        @event.EventType, maxRetries);
                    throw;
                }

                await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, retryCount))); // Exponential backoff
                InitializeChannel(); // Recreate channel on error
            }
        }
    }

    /// <summary>
    /// Publish content event
    /// Routing keys: content.published, content.updated, content.deleted
    /// </summary>
    public Task PublishContentEventAsync<T>(T @event, string routingKey) where T : BaseEvent
    {
        return PublishAsync(@event, _settings.Exchanges.ContentPublishing, $"content.{routingKey}");
    }

    /// <summary>
    /// Publish notification event
    /// Routing keys: notification.email, notification.push, notification.admin
    /// </summary>
    public Task PublishNotificationAsync<T>(T @event, string routingKey) where T : BaseEvent
    {
        return PublishAsync(@event, _settings.Exchanges.Notifications, $"notification.{routingKey}");
    }

    /// <summary>
    /// Publish audit log event
    /// </summary>
    public Task PublishAuditLogAsync(AuditLogEvent @event)
    {
        return PublishAsync(@event, _settings.Exchanges.AuditLogs, "audit.log");
    }

    /// <summary>
    /// Publish background processing event
    /// Routing keys: background.moderation, background.classification, background.tagging
    /// </summary>
    public Task PublishBackgroundTaskAsync<T>(T @event, string routingKey) where T : BaseEvent
    {
        return PublishAsync(@event, _settings.Exchanges.BackgroundProcessing, $"background.{routingKey}");
    }

    public void Dispose()
    {
        if (_disposed) return;

        try
        {
            _channel?.Close();
            _channel?.Dispose();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error disposing RabbitMQ channel");
        }

        _disposed = true;
    }
}
