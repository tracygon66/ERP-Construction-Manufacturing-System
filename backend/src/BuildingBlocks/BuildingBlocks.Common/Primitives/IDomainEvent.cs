namespace BuildingBlocks.Common.Primitives;

public interface IDomainEvent
{
    Guid EventId => Guid.NewGuid();
    DateTime OccurredOn => DateTime.UtcNow;
}
