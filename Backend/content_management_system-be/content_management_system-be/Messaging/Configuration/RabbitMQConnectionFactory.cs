using Microsoft.Extensions.Options;
using RabbitMQ.Client;

namespace CMS.Messaging.Configuration;

/// <summary>
/// Factory for creating and managing RabbitMQ connections
/// Thread-safe singleton connection management
/// </summary>
public class RabbitMQConnectionFactory : IDisposable
{
    private readonly RabbitMQSettings _settings;
    private IConnection? _connection;
    private readonly object _lock = new();
    private bool _disposed;

    public RabbitMQConnectionFactory(IOptions<RabbitMQSettings> settings)
    {
        _settings = settings.Value;
    }

    /// <summary>
    /// Gets or creates a connection to RabbitMQ
    /// </summary>
    public IConnection GetConnection()
    {
        if (_connection != null && _connection.IsOpen)
        {
            return _connection;
        }

        lock (_lock)
        {
            if (_connection != null && _connection.IsOpen)
            {
                return _connection;
            }

            _connection?.Dispose();

            var factory = new ConnectionFactory
            {
                HostName = _settings.HostName,
                Port = _settings.Port,
                UserName = _settings.UserName,
                Password = _settings.Password,
                VirtualHost = _settings.VirtualHost,
                AutomaticRecoveryEnabled = _settings.AutomaticRecoveryEnabled,
                RequestedHeartbeat = TimeSpan.FromSeconds(_settings.RequestedHeartbeat),
                NetworkRecoveryInterval = _settings.NetworkRecoveryInterval,
                DispatchConsumersAsync = true // Enable async consumers
            };

            _connection = factory.CreateConnection("CMS-API");
            return _connection;
        }
    }

    /// <summary>
    /// Creates a new channel from the connection
    /// </summary>
    public IModel CreateChannel()
    {
        var connection = GetConnection();
        return connection.CreateModel();
    }

    public void Dispose()
    {
        if (_disposed) return;

        _connection?.Close();
        _connection?.Dispose();
        _disposed = true;
    }
}
