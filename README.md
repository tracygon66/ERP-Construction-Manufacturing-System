# HỆ THỐNG ERP NGÀNH XÂY DỰNG & SẢN XUẤT (SKELETON SOLUTION)

> **Kiến trúc:** Modular Monolith kết hợp Clean Architecture & Domain-Driven Design (DDD)  
> **Backend:** .NET 8 / 9 Core Web API, EF Core, Outbox Pattern, Audit Trail Interceptor  
> **Frontend:** React 18, TypeScript, Vite, Enterprise Dark Theme  
> **Hạ tầng:** Docker Compose, PostgreSQL 16, Redis 7, RabbitMQ 3

---

## 1. TỔNG QUAN KIẾN TRÚC & NỀN TẢNG KỸ THUẬT

Dự án được thiết kế chuẩn mực dành cho team **3–5 kỹ sư**, giải quyết triệt để 2 bài toán hóc búa nhất của ERP:

### 1.1. Ma Trận Phân Quyền & Row-Level Security (RLS)
* **Cô lập Multi-Tenant:** Mọi thực thể kế thừa `ITenantScoped` đều được tự động áp dụng **EF Core Global Query Filter** (`WHERE TenantId = @currentTenantId`). Không một query nào có thể đọc chéo dữ liệu giữa các công ty thành viên.
* **Phân quyền hàng theo Dự án / Công trường (Data Scoping):** Mọi thực thể thuộc dự án kế thừa `IProjectScopedEntity`. Tầng Application sử dụng LINQ Extension chuẩn:
  ```csharp
  var boqs = await _dbContext.ProjectBOQs
      .ApplyProjectScope(_currentUserContext) // Tự động lọc theo quyền của Chỉ huy trưởng
      .Where(b => b.ProjectId == projectId)
      .ToListAsync(ct);
  ```

### 1.2. Dynamic Workflow Engine (Approval Matrix)
* **Bộ máy 4 bảng lõi:** `WorkflowDefinitions`, `WorkflowSteps`, `WorkflowInstances`, `WorkflowInstanceLogs`.
* **Cực kỳ dễ dàng cho dev:** Khi cần đưa một chứng từ nghiệp vụ vào quy trình phê duyệt (Ví dụ: `ProjectBOQ`, `MaterialRequest`, `WorkOrder`), chỉ cần kế thừa interface `IApprovableEntity`:
  ```csharp
  public class ProjectBOQ : BaseEntity<Guid>, ITenantScoped, IProjectScopedEntity, IApprovableEntity
  {
      public WorkflowStatus WorkflowStatus { get; set; } = WorkflowStatus.Draft;
      public Guid? CurrentWorkflowInstanceId { get; set; }
      public decimal GetApprovalAmount() => TotalEstimatedAmount;
  }
  ```
* Gọi qua Workflow Engine chỉ với 1 dòng:
  ```csharp
  await _workflowEngine.SubmitAsync(boq, _currentUserContext, ct);
  ```

### 1.3. Outbox Pattern & Audit Trail Bất Biến
* `AuditTrailInterceptor` tự động điền `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy` và ngăn chặn Hard-Delete (tự động chuyển thành `IsDeleted = true`).
* `OutboxInterceptor` gom toàn bộ Domain Events sinh ra trong thực thể và lưu vào bảng `OutboxMessages` trong **cùng 1 Database Transaction nguyên tử**.

---

## 2. CẤU TRÚC THƯ MỤC SOURCE CODE

```
erp-core-system/
├── docker-compose.yml              # PostgreSQL, Redis, RabbitMQ, Backend, Frontend
├── Dockerfile.backend              # Multi-stage build .NET 8
├── Dockerfile.frontend             # Multi-stage build React + Nginx
├── backend/
│   ├── ErpSystem.sln               # Solution file chuẩn
│   └── src/
│       ├── BuildingBlocks/
│       │   └── BuildingBlocks.Common/   # BaseEntity, Result, ITenantScoped, ICurrentUserContext
│       ├── Modules/
│       │   ├── Workflow/                # Dynamic Workflow Engine & State Machine
│       │   └── Projects/                # Domain Công trình Xây dựng, WBS, BOQ
│       ├── Infrastructure/              # AppDbContext, Interceptors, Outbox, PostgreSQL
│       └── Api/                         # ASP.NET Core Web API, Middlewares, Swagger
└── frontend/
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── components/Layout/           # Header, Sidebar, Role Switcher
        ├── components/Workflow/         # StatusBadge, ApprovalTimeline
        ├── pages/                       # DashboardPage, ProjectsPage, WorkflowApprovalsPage
        └── types/                       # TypeScript Data Contracts
```

---

## 3. HƯỚNG DẪN KHỞI CHẠY (QUICK START)

### Cách 1: Khởi chạy toàn bộ bằng Docker Compose (Khuyến nghị)
Chỉ với 1 câu lệnh duy nhất, toàn bộ hệ thống gồm Database, Cache, Message Broker, Backend và Frontend sẽ cùng khởi động:

```bash
cd /Users/macos/.gemini/antigravity-ide/scratch/erp-core-system
docker compose up --build -d
```

* **Frontend Portal:** `http://localhost:5173`
* **Backend Swagger API:** `http://localhost:5000/swagger`
* **RabbitMQ Dashboard:** `http://localhost:15672` (User: `erp_guest`, Pass: `erp_guest_2026`)
* **PostgreSQL Port:** `localhost:5433` (DB: `erp_core_db`)

---

### Cách 2: Chạy Frontend độc lập trên máy local
```bash
cd /Users/macos/.gemini/antigravity-ide/scratch/erp-core-system/frontend
npm install
npm run dev
```

Truy cập `http://localhost:5173` để trải nghiệm trực quan:
1. **Kiểm thử Row-Level Security (RLS):** Bấm nút góc trên bên phải để chuyển giữa *Chỉ huy trưởng* (chỉ thấy 1 dự án) và *SuperAdmin* (thấy toàn bộ dự án).
2. **Kiểm thử Workflow Engine:** Bấm *"Lập Dự Toán BOQ Mới"* ➔ Bấm *"Gửi Phê Duyệt"* ➔ Chuyển sang *"Hộp Thư Phê Duyệt"* để Duyệt hoặc Từ chối kèm lý do và xem dòng thời gian Audit Trail.
