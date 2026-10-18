using System.ComponentModel.DataAnnotations;

namespace BuildingBlocks.Common.Primitives;

/// <summary>
/// Lớp cơ sở cho toàn bộ các thực thể (Entity) trong hệ thống ERP.
/// Hỗ trợ định danh, Audit Trail tự động, Soft Delete và kiểm soát xung đột (Concurrency Control).
/// </summary>
public abstract class BaseEntity<TKey>
{
    public TKey Id { get; protected set; } = default!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }

    /// <summary>
    /// Cờ đánh dấu xóa mềm, tự động được lọc qua EF Core Global Query Filter.
    /// </summary>
    public bool IsDeleted { get; set; } = false;

    /// <summary>
    /// Concurrency Token chống ghi đè dữ liệu đồng thời khi 2 người cùng sửa 1 bản ghi.
    /// </summary>
    [Timestamp]
    public byte[] RowVersion { get; set; } = [];

    private readonly List<IDomainEvent> _domainEvents = [];
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    public void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}
