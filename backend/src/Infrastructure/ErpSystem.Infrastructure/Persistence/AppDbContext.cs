using System.Linq.Expressions;
using BuildingBlocks.Common.Primitives;
using BuildingBlocks.Common.Security;
using ErpSystem.Infrastructure.Persistence.Interceptors;
using ErpSystem.Infrastructure.Persistence.Outbox;
using ErpSystem.Modules.Projects.Domain;
using ErpSystem.Modules.Workflow.Domain;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    private readonly ICurrentUserContext _currentUserContext;
    private readonly AuditTrailInterceptor _auditTrailInterceptor;
    private readonly OutboxInterceptor _outboxInterceptor;

    public AppDbContext(
        DbContextOptions<AppDbContext> options,
        ICurrentUserContext currentUserContext,
        AuditTrailInterceptor auditTrailInterceptor,
        OutboxInterceptor outboxInterceptor) : base(options)
    {
        _currentUserContext = currentUserContext;
        _auditTrailInterceptor = auditTrailInterceptor;
        _outboxInterceptor = outboxInterceptor;
    }

    // Projects Module DbSets
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectBOQ> ProjectBOQs => Set<ProjectBOQ>();
    public DbSet<ProjectBOQItem> ProjectBOQItems => Set<ProjectBOQItem>();
    public DbSet<ProjectMember> ProjectMembers => Set<ProjectMember>();

    // Workflow Module DbSets
    public DbSet<WorkflowDefinition> WorkflowDefinitions => Set<WorkflowDefinition>();
    public DbSet<WorkflowStep> WorkflowSteps => Set<WorkflowStep>();
    public DbSet<WorkflowInstance> WorkflowInstances => Set<WorkflowInstance>();
    public DbSet<WorkflowInstanceLog> WorkflowInstanceLogs => Set<WorkflowInstanceLog>();

    // Outbox & System DbSets
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.AddInterceptors(_auditTrailInterceptor, _outboxInterceptor);
        base.OnConfiguring(optionsBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Áp dụng Global Query Filters tự động cho mọi Entity:
        // 1. Soft Delete Filter: WHERE IsDeleted = false
        // 2. Multi-tenancy Filter: WHERE TenantId = CurrentUserContext.TenantId
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var clrType = entityType.ClrType;

            var parameter = Expression.Parameter(clrType, "e");
            Expression? filterExpression = null;

            // Kiểm tra kế thừa BaseEntity<Guid> để filter IsDeleted
            if (typeof(BaseEntity<Guid>).IsAssignableFrom(clrType))
            {
                var isDeletedProp = Expression.Property(parameter, nameof(BaseEntity<Guid>.IsDeleted));
                var notDeletedExpr = Expression.Equal(isDeletedProp, Expression.Constant(false));
                filterExpression = notDeletedExpr;
            }

            // Kiểm tra kế thừa ITenantScoped để filter TenantId
            if (typeof(ITenantScoped).IsAssignableFrom(clrType))
            {
                var tenantProp = Expression.Property(parameter, nameof(ITenantScoped.TenantId));
                // Đọc TenantId từ _currentUserContext lúc runtime
                var currentTenantMethod = Expression.Property(
                    Expression.Constant(_currentUserContext),
                    nameof(ICurrentUserContext.TenantId));

                var tenantMatchExpr = Expression.Equal(tenantProp, currentTenantMethod);

                filterExpression = filterExpression == null
                    ? tenantMatchExpr
                    : Expression.AndAlso(filterExpression, tenantMatchExpr);
            }

            if (filterExpression != null)
            {
                var lambda = Expression.Lambda(filterExpression, parameter);
                entityType.SetQueryFilter(lambda);
            }
        }

        // Cấu hình quan hệ ProjectBOQ
        modelBuilder.Entity<ProjectBOQ>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasOne(x => x.Project)
             .WithMany(p => p.BOQs)
             .HasForeignKey(x => x.ProjectId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Cấu hình quan hệ Workflow
        modelBuilder.Entity<WorkflowDefinition>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasMany(x => x.Steps)
             .WithOne(s => s.WorkflowDefinition)
             .HasForeignKey(s => s.WorkflowDefinitionId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<WorkflowInstance>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasMany(x => x.Logs)
             .WithOne(l => l.WorkflowInstance)
             .HasForeignKey(l => l.WorkflowInstanceId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
