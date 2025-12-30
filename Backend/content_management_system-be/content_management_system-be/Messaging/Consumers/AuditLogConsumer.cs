using CMS.Messaging.Events;

namespace CMS.Messaging.Consumers;

/// <summary>
/// Consumer for storing audit logs
/// </summary>
public class AuditLogConsumer : IMessageConsumer<AuditLogEvent>
{
    private readonly ILogger<AuditLogConsumer> _logger;
    // Inject your audit log repository
    // private readonly IAuditLogRepository _auditRepository;

    public AuditLogConsumer(ILogger<AuditLogConsumer> logger)
    {
        _logger = logger;
    }

    public async Task HandleAsync(AuditLogEvent message, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation(
                "Storing audit log: {Action} on {EntityType} by user {UserId}",
                message.Action, message.EntityType, message.UserId);

            // TODO: Implement audit log storage
            // Store in database, file system, or external logging service
            /*
            var auditLog = new AuditLog
            {
                UserId = message.UserId,
                UserName = message.UserName,
                Action = message.Action,
                EntityType = message.EntityType,
                EntityId = message.EntityId,
                Timestamp = message.Timestamp,
                IpAddress = message.IpAddress,
                UserAgent = message.UserAgent,
                OldValues = JsonSerializer.Serialize(message.OldValues),
                NewValues = JsonSerializer.Serialize(message.NewValues),
                Success = message.Success,
                ErrorMessage = message.ErrorMessage
            };
            
            await _auditRepository.CreateAsync(auditLog);
            */

            await Task.Delay(50, cancellationToken); // Simulate storage
            
            _logger.LogInformation(
                "Successfully stored audit log for {Action} on {EntityType}",
                message.Action, message.EntityType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error storing audit log for {Action} on {EntityType}",
                message.Action, message.EntityType);
            throw;
        }
    }
}
