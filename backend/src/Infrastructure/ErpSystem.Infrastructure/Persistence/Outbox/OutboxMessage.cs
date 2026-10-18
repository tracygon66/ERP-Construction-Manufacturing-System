namespace ErpSystem.Infrastructure.Persistence.Outbox;

/// <summary>
/// Lưu trữ Domain Events trong cùng 1 Transaction với dữ liệu nghiệp vụ,
/// đảm bảo Outbox Pattern tuyệt đối không bao giờ mất tin nhắn hoặc sai lệch dữ liệu.
/// </summary>
public class OutboxMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string EventType { get; set; } = string.Empty;
    public string Payload { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedAt { get; set; }
    public string? Error { get; set; }
    public int RetryCount { get; set; } = 0;
}
