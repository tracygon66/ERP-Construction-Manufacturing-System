using BuildingBlocks.Common.Security;
using ErpSystem.Api.Middlewares;
using ErpSystem.Infrastructure.Persistence;
using ErpSystem.Infrastructure.Persistence.Interceptors;
using ErpSystem.Modules.Projects.Domain;
using ErpSystem.Modules.Workflow.Domain;
using ErpSystem.Modules.Workflow.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Thêm Controllers & JSON Options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "ERP Construction & Manufacturing Core API",
        Version = "v1",
        Description = "Hệ thống lõi ERP với Modular Monolith, Row-Level Security và Dynamic Workflow Engine."
    });
});

// 2. Cấu hình CORS cho Frontend React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 3. Đăng ký Security & Interceptors
builder.Services.AddScoped<ICurrentUserContext, CurrentUserContext>();
builder.Services.AddScoped<AuditTrailInterceptor>();
builder.Services.AddScoped<OutboxInterceptor>();

// 4. Đăng ký Workflow Engine & Resolvers
builder.Services.AddScoped<IAssigneeResolver, DirectUserAssigneeResolver>();
builder.Services.AddScoped<IAssigneeResolver, ByRoleAssigneeResolver>();
builder.Services.AddScoped<IAssigneeResolver, DynamicProjectRoleAssigneeResolver>();
builder.Services.AddScoped<IWorkflowEngine, WorkflowEngine>();

// 5. Cấu hình DbContext (Hỗ trợ In-Memory cho dev nhanh và PostgreSQL cho Production)
var useInMemory = builder.Configuration.GetValue<bool>("UseInMemoryDatabase");
if (useInMemory)
{
    builder.Services.AddDbContext<AppDbContext>((sp, options) =>
    {
        options.UseInMemoryDatabase("ErpCoreDb");
    });
}
else
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    builder.Services.AddDbContext<AppDbContext>((sp, options) =>
    {
        options.UseNpgsql(connectionString);
    });
}

var app = builder.Build();

// 6. Pipeline Middlewares
app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ERP Core API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowFrontend");
app.UseMiddleware<CurrentUserMiddleware>();

app.UseAuthorization();
app.MapControllers();

// 7. Seed Initial Data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    if (!db.Projects.Any())
    {
        var tenantId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        var prj1Id = Guid.Parse("d1111111-1111-1111-1111-111111111111");
        var prj2Id = Guid.Parse("d2222222-2222-2222-2222-222222222222");

        var prj1 = new Project
        {
            Id = prj1Id,
            TenantId = tenantId,
            ProjectCode = "PRJ-LANDMARK-01",
            Name = "Tòa Nhà Hỗn Hợp Landmark Tower (Hà Nội)",
            Location = "Cầu Giấy, Hà Nội",
            TotalBudget = 150_000_000_000m, // 150 Tỷ
            TotalSpent = 35_000_000_000m,
            StartDate = DateTime.UtcNow.AddMonths(-3),
            ExpectedEndDate = DateTime.UtcNow.AddMonths(18),
            Status = "InProgress"
        };

        var prj2 = new Project
        {
            Id = prj2Id,
            TenantId = tenantId,
            ProjectCode = "PRJ-GRANDPARK-02",
            Name = "Khu Đô Thị Sinh Thái Grand Park (TP.HCM)",
            Location = "Quận 9, TP.HCM",
            TotalBudget = 320_000_000_000m, // 320 Tỷ
            TotalSpent = 120_000_000_000m,
            StartDate = DateTime.UtcNow.AddMonths(-8),
            ExpectedEndDate = DateTime.UtcNow.AddMonths(24),
            Status = "InProgress"
        };

        var boq1 = new ProjectBOQ
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ProjectId = prj1Id,
            BOQCode = "BOQ-LANDMARK-FOUNDATION-01",
            Name = "Dự toán phần móng và hầm cọc B1-B3",
            TotalEstimatedAmount = 28_500_000_000m, // 28.5 Tỷ
            RevisionNumber = 1,
            WorkflowStatus = WorkflowStatus.Draft
        };

        db.Projects.AddRange(prj1, prj2);
        db.ProjectBOQs.Add(boq1);
        db.SaveChanges();
    }
}

app.Run();
