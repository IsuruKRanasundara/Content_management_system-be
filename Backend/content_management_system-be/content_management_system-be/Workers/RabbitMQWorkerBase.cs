using CMS.Messaging.Configuration;
using CMS.Messaging.Consumers;
using CMS.Messaging.Events;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace CMS.Workers;

/// <summary>
/// Base worker for consuming RabbitMQ messages
/// Handles connection management, queue declaration, and message processing with retry logic
/// </summary>
public abstract class RabbitMQWorkerBase<TEvent> : BackgroundService where TEvent : BaseEvent
{
    private readonly RabbitMQConnectionFactory _connectionFactory;
    protected readonly RabbitMQSettings Settings;
    protected readonly ILogger Logger;
    private readonly IServiceProvider _serviceProvider;
    private IModel? _channel;
    private readonly string _queueName;
    private readonly string _exchangeName;
    private readonly string _routingKey;

    protected RabbitMQWorkerBase(
        RabbitMQConnectionFactory connectionFactory,
        IOptions<RabbitMQSettings> settings,
        ILogger logger,
        IServiceProvider serviceProvider,
        string queueName,
        string exchangeName,
        string routingKey)
    {
        _connectionFactory = connectionFactory;
        Settings = settings.Value;
        Logger = logger;
        _serviceProvider = serviceProvider;
        _queueName = queueName;
        _exchangeName = exchangeName;
        _routingKey = routingKey;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        Logger.LogInformation("Starting RabbitMQ worker for queue: {QueueName}", _queueName);

        // Wait for RabbitMQ to be available
        await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);

        try
        {
            InitializeChannel();
            StartConsuming(stoppingToken);

            // Keep the worker running
            await Task.Delay(Timeout.Infinite, stoppingToken);
        }
        catch (OperationCanceledException)
        {
            Logger.LogInformation("Worker cancelled for queue: {QueueName}", _queueName);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Fatal error in worker for queue: {QueueName}", _queueName);
            throw;
        }
    }

    private void InitializeChannel()
    {
        _channel = _connectionFactory.CreateChannel();
        
        // Set QoS - process one message at a time
        _channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);

        // Declare queue with dead letter exchange for failed messages
        var arguments = new Dictionary<string, object>
        {
            { "x-dead-letter-exchange", $"{_exchangeName}.dlx" },
            { "x-dead-letter-routing-key", $"{_routingKey}.failed" }
        };

        _channel.QueueDeclare(
            queue: _queueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: arguments);

        // Bind queue to exchange
        _channel.QueueBind(
            queue: _queueName,
            exchange: _exchangeName,
            routingKey: _routingKey);

        // Declare dead letter queue
        _channel.QueueDeclare(
            queue: $"{_queueName}.dlq",
            durable: true,
            exclusive: false,
            autoDelete: false);

        Logger.LogInformation("Channel initialized for queue: {QueueName}", _queueName);
    }

    private void StartConsuming(CancellationToken stoppingToken)
    {
        var consumer = new AsyncEventingBasicConsumer(_channel);
        
        consumer.Received += async (model, ea) =>
        {
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);
            var messageId = ea.BasicProperties.MessageId;

            try
            {
                Logger.LogInformation(
                    "Received message {MessageId} from queue {QueueName}",
                    messageId, _queueName);

                var @event = JsonSerializer.Deserialize<TEvent>(message, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (@event == null)
                {
                    throw new InvalidOperationException("Failed to deserialize message");
                }

                // Process message using scoped service
                using var scope = _serviceProvider.CreateScope();
                await ProcessMessageAsync(@event, scope.ServiceProvider, stoppingToken);

                // Acknowledge successful processing
                _channel?.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
                
                Logger.LogInformation(
                    "Successfully processed message {MessageId}",
                    messageId);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex,
                    "Error processing message {MessageId} from queue {QueueName}",
                    messageId, _queueName);

                // Check retry count
                var retryCount = GetRetryCount(ea.BasicProperties);
                
                if (retryCount < 3) // Max 3 retries
                {
                    // Requeue with incremented retry count
                    RequeueMessage(ea, body, retryCount + 1);
                    _channel?.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
                }
                else
                {
                    // Move to dead letter queue
                    Logger.LogError(
                        "Message {MessageId} failed after {RetryCount} retries, moving to DLQ",
                        messageId, retryCount);
                    _channel?.BasicNack(deliveryTag: ea.DeliveryTag, multiple: false, requeue: false);
                }
            }
        };

        _channel?.BasicConsume(
            queue: _queueName,
            autoAck: false,
            consumer: consumer);

        Logger.LogInformation("Started consuming from queue: {QueueName}", _queueName);
    }

    protected abstract Task ProcessMessageAsync(
        TEvent @event,
        IServiceProvider serviceProvider,
        CancellationToken cancellationToken);

    private int GetRetryCount(IBasicProperties properties)
    {
        if (properties.Headers != null &&
            properties.Headers.TryGetValue("x-retry-count", out var value))
        {
            return Convert.ToInt32(value);
        }
        return 0;
    }

    private void RequeueMessage(BasicDeliverEventArgs ea, byte[] body, int retryCount)
    {
        var properties = _channel!.CreateBasicProperties();
        properties.Persistent = true;
        properties.Headers = new Dictionary<string, object>
        {
            { "x-retry-count", retryCount }
        };

        // Exponential backoff delay
        var delaySeconds = Math.Pow(2, retryCount) * 5;
        
        Logger.LogInformation(
            "Requeuing message (retry {RetryCount}) with {Delay}s delay",
            retryCount, delaySeconds);

        Task.Delay(TimeSpan.FromSeconds(delaySeconds)).Wait();

        _channel.BasicPublish(
            exchange: _exchangeName,
            routingKey: _routingKey,
            basicProperties: properties,
            body: body);
    }

    public override void Dispose()
    {
        _channel?.Close();
        _channel?.Dispose();
        base.Dispose();
    }
}
