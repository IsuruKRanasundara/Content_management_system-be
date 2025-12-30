using CMS.Messaging.Events;
using CMS.Messaging.Producers;
using Microsoft.AspNetCore.Http;

namespace CMS.Middleware;

/// <summary>
/// Middleware for capturing audit logs
/// Automatically logs API requests and user actions
/// </summary>
public class AuditLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AuditLoggingMiddleware> _logger;

    public AuditLoggingMiddleware(RequestDelegate next, ILogger<AuditLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, IMessageProducer messageProducer)
    {
        var startTime = DateTime.UtcNow;
        var originalBodyStream = context.Response.Body;

        try
        {
            await _next(context);

            // Log successful request
            if (ShouldLogRequest(context))
            {
                await LogAuditEvent(context, messageProducer, startTime, success: true);
            }
        }
        catch (Exception ex)
        {
            // Log failed request
            if (ShouldLogRequest(context))
            {
                await LogAuditEvent(context, messageProducer, startTime, success: false, ex.Message);
            }
            throw;
        }
    }

    private bool ShouldLogRequest(HttpContext context)
    {
        // Don't log health checks and static files
        var path = context.Request.Path.Value?.ToLower() ?? "";
        return !path.Contains("/health") && 
               !path.Contains("/swagger") &&
               !path.Contains("/uploads");
    }

    private async Task LogAuditEvent(
        HttpContext context,
        IMessageProducer messageProducer,
        DateTime startTime,
        bool success,
        string? errorMessage = null)
    {
        try
        {
            var userId = context.User?.FindFirst("sub")?.Value;
            var userName = context.User?.Identity?.Name ?? "Anonymous";

            var auditEvent = new AuditLogEvent
            {
                UserId = userId != null ? int.Parse(userId) : null,
                UserName = userName,
                Action = $"{context.Request.Method} {context.Request.Path}",
                EntityType = ExtractEntityType(context.Request.Path),
                IpAddress = context.Connection.RemoteIpAddress?.ToString() ?? "Unknown",
                UserAgent = context.Request.Headers["User-Agent"].ToString(),
                Success = success,
                ErrorMessage = errorMessage,
                Timestamp = startTime
            };

            await messageProducer.PublishAuditLogAsync(auditEvent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish audit log event");
        }
    }

    private string ExtractEntityType(PathString path)
    {
        var segments = path.Value?.Split('/', StringSplitOptions.RemoveEmptyEntries);
        return segments?.Length > 1 ? segments[1] : "Unknown";
    }
}
