# SPRINT 1 BACKLOG & KẾ HOẠCH PHÂN BỔ NHÂN SỰ
## DỰ ÁN: ERP XÂY DỰNG & SẢN XUẤT (ENTERPRISE ERP CORE)

> **Sprint Goal**: Hoàn thiện toàn bộ Nền tảng Xác thực Đa tầng (RLS), Quản lý Dự án & Bóc tách BOQ chi tiết, Động cơ Luồng Phê duyệt Động (Dynamic Workflow Engine) và Pipeline CI/CD tự động.  
> **Thời lượng Sprint**: 2 tuần (10 ngày làm việc)  
> **Quy mô Team**: 1 Tech Lead (50% hands-on) + 2 Backend Engineers + 2 Frontend/DevOps Engineers  
> **Tổng Story Points cam kết**: 48 Points (Tương đương 10 SP/người/sprint)

---

## 1. MA TRẬN PHÂN BỔ NHÂN SỰ & VAI TRÒ (RACI MATRIX)

| Vị trí | Nhân sự đề xuất | Trách nhiệm chính trong Sprint 1 | Story Points |
| :--- | :--- | :--- | :---: |
| **Tech Lead** | **Anh (Lead Architect)** | Thiết kế kiến trúc, Review PR, Outbox Worker, Core Workflow State Machine, Bảo mật RLS | **8 SP** |
| **Backend 1** | Senior .NET Engineer | Phân hệ Bóc tách Dự toán BOQ, Tính toán phân cấp (Hierarchy Tree), Parse file Excel BOQ | **11 SP** |
| **Backend 2** | Mid .NET Engineer | Phân hệ Quản lý Dự án (Projects CRUD), Phân quyền Ban Chỉ huy (Project Members), Unit Test | **10 SP** |
| **Frontend 1** | Senior React Engineer | Bảng Bóc tách BOQ ảo hóa (Virtual Tree Grid), Giao diện Luồng phê duyệt & Audit Timeline | **10 SP** |
| **DevOps / FE 2** | Mid React / DevOps | Giao diện Quản trị Dự án, Modal phân quyền, GitHub Actions CI/CD, Chuẩn hóa Docker | **9 SP** |

---

## 2. CHI TIẾT TỪNG TICKET CÔNG VIỆC (JIRA / AZURE DEVOPS TICKETS)

### TRACK 1: CORE ARCHITECTURE & INFRASTRUCTURE (Tech Lead & DevOps)

#### [ERP-SP1-001] Hoàn thiện GitHub Actions CI/CD Pipeline & Automated Quality Gate
* **Assignee:** DevOps / Mid FE (Tech Lead review)
* **Estimate:** 3 Story Points
* **Mô tả công việc:**
  * Xây dựng file `.github/workflows/ci.yml`.
  * Trigger: Mỗi khi tạo Pull Request vào nhánh `develop` hoặc `main`.
  * Bước 1: Build .NET Solution (`dotnet build --configuration Release`).
  * Bước 2: Run Unit Tests & Collect Code Coverage (`dotnet test /p:CollectCoverage=true`).
  * Bước 3: Lint & Build Frontend (`npm run lint` & `npm run build`).
  * Bước 4: Chặn Merge nếu Test bị fail hoặc coverage < 75%.
* **Definition of Done (DoD):**
  - [ ] GitHub Actions chạy thành công (màu xanh lá) trên PR mẫu.
  - [ ] Thời gian chạy CI dưới 3 phút.

---

#### [ERP-SP1-002] Hoàn thiện Transactional Outbox Background Worker với RabbitMQ
* **Assignee:** Tech Lead
* **Estimate:** 5 Story Points
* **Mô tả công việc:**
  * Xây dựng `IHostedService` (`OutboxProcessorWorker`) chạy định kỳ mỗi 5 giây.
  * Quét bảng `OutboxMessages` tìm các bản ghi có `ProcessedAt == null`.
  * Publish message sang RabbitMQ exchange tương ứng (ví dụ: `erp.events.exchange`).
  * Đánh dấu `ProcessedAt = DateTime.UtcNow`. Bổ sung cơ chế Retry 3 lần nếu RabbitMQ mất kết nối (Exponential Backoff).
* **Definition of Done (DoD):**
  - [ ] Khi tạo Dự án hoặc Phê duyệt BOQ, một dòng outbox được ghi vào Postgres.
  - [ ] Worker tự động đọc và đẩy sang RabbitMQ Web UI (`http://localhost:15672`) thấy message xuất hiện.
  - [ ] Unit test cho cơ chế Dead-letter queue / Retry.

---

### TRACK 2: PHÂN HỆ QUẢN LÝ DỰ ÁN & PHÂN QUYỀN BAN CHỈ HUY (Backend 2 & Frontend 2)

#### [ERP-SP1-003] Backend API Quản lý Dự án & Thành viên Ban Chỉ Huy (Project Members RBAC)
* **Assignee:** Backend 2 (Mid .NET)
* **Estimate:** 5 Story Points
* **Mô tả công việc:**
  * Viết CRUD API cho thực thể `Project` và `ProjectMember`.
  * Ráp nối bộ lọc bảo mật `ApplyProjectScope` để Kỹ sư chỉ xem được dự án mình là thành viên.
  * Hỗ trợ gán vai trò: `ProjectManager` (Chỉ huy trưởng), `SiteEngineer` (Kỹ sư công trình), `QSEngineer` (Kỹ sư QS/Dự toán), `SafetyOfficer` (An toàn viên).
* **API Specifications:**
  * `POST /api/v1/projects`: Tạo dự án mới (Yêu cầu quyền Admin hoặc Giám đốc khối).
  * `GET /api/v1/projects`: Lấy danh sách dự án (Tự động lọc theo RLS của User đang đăng nhập).
  * `GET /api/v1/projects/{id}`: Xem chi tiết dự án kèm danh sách Ban Chỉ Huy.
  * `POST /api/v1/projects/{id}/members`: Phân bổ nhân sự vào dự án:
    ```json
    {
      "userId": "33333333-3333-3333-3333-333333333333",
      "projectRole": "SiteEngineer",
      "assignedDate": "2026-10-19T00:00:00Z"
    }
    ```
* **Definition of Done (DoD):**
  - [ ] Viết đầy đủ FluentValidation (Tên dự án không được rỗng, Tổng mức đầu tư phải > 0).
  - [ ] Đạt tối thiểu 80% Unit Test coverage cho `ProjectsController` & Handlers.
  - [ ] Swagger API hiển thị đủ mô tả tiếng Việt và Response mẫu.

---

#### [ERP-SP1-004] Frontend Giao diện Quản lý Danh mục Dự án & Modal Phân Bổ Nhân Sự
* **Assignee:** Frontend 2 (Mid FE)
* **Estimate:** 5 Story Points
* **Mô tả công việc:**
  * Hoàn thiện màn hình Danh sách dự án (Grid view & List view).
  * Thẻ hiển thị trực quan: Tên dự án, Vị trí, Tiến độ hoàn thành (%), Tổng mức đầu tư, Đã chi tiêu.
  * Drawer/Modal tạo mới dự án kèm bộ lọc tìm kiếm theo trạng thái (`Planning`, `InProgress`, `Suspended`, `Completed`).
  * Modal "Phân bổ nhân sự vào Ban chỉ huy" (Chọn nhân viên ➔ Chọn vai trò ➔ Lưu).
* **Definition of Done (DoD):**
  - [ ] Form có validation báo đỏ các trường bắt buộc.
  - [ ] Tích hợp API chuẩn REST với Backend.
  - [ ] Responsive hiển thị chuẩn trên màn hình Laptop (13-15 inch) và Desktop (24 inch).

---

### TRACK 3: PHÂN HỆ BÓC TÁCH DỰ TOÁN BOQ CHUYÊN SÂU (Backend 1 & Frontend 1)

#### [ERP-SP1-005] Backend API Bóc tách Khối lượng BOQ Phân cấp (WBS Tree Hierarchy) & Excel Parser
* **Assignee:** Backend 1 (Senior .NET)
* **Estimate:** 6 Story Points
* **Mô tả công việc:**
  * Xây dựng bảng `ProjectBOQItem` hỗ trợ cấu trúc cây nhiều cấp (Cấp 1: Phần ngầm ➔ Cấp 2: Đào đất hố móng ➔ Cấp 3: Nhân công / Máy đào).
  * Viết thuật toán Rollup tự động: Giá trị tổng của mục cha = Tổng thành tiền các mục con.
  * Xây dựng Endpoint nhận file Excel dự toán (`.xlsx`) của các nhà thầu, sử dụng thư viện `ClosedXML` hoặc `MiniExcel` để bóc tách nhanh vào DB.
* **API Specifications:**
  * `GET /api/v1/projects/{projectId}/boqs/{boqId}/items`: Lấy toàn bộ cây bóc tách khối lượng.
  * `POST /api/v1/projects/{projectId}/boqs/{boqId}/items/batch`: Cập nhật/Thêm mới hàng loạt đầu việc.
  * `POST /api/v1/projects/{projectId}/boqs/{boqId}/import-excel`: Upload file Excel BOQ kèm preview kết quả.
* **Definition of Done (DoD):**
  - [ ] Import thử nghiệm file Excel BOQ 1.000 dòng mất dưới 1.5 giây.
  - [ ] Tính toán cộng dồn (Rollup sums) chính xác tuyệt đối không bị lệch số thập phân (Decimal precision).

---

#### [ERP-SP1-006] Frontend Bảng Bóc Tách Khối Lượng BOQ Ảo Hóa (Tree Grid with Inline Editing)
* **Assignee:** Frontend 1 (Senior React)
* **Estimate:** 6 Story Points
* **Mô tả công việc:**
  * Xây dựng component bảng dự toán đa cấp (Hierarchical Tree Table) với các cột:
    * Mã công việc, Nội dung công tác, Đơn vị tính, Khối lượng dự toán, Đơn giá, Thành tiền, Ghi chú.
  * Cho phép bấm sửa trực tiếp khối lượng / đơn giá ngay trên bảng (Inline Edit).
  * Tự động tính Thành tiền = Khối lượng x Đơn giá và nhảy số tổng lên cấp cha tức thì (Client-side instant calculation).
  * Tối ưu hiệu năng: Dùng kỹ thuật Virtual Scrolling để mở file BOQ hàng nghìn dòng không bị giật lag.
* **Definition of Done (DoD):**
  - [ ] Bảng cuộn mượt mà 60fps với 1.000 dòng dữ liệu.
  - [ ] Định dạng số tiền kiểu Việt Nam (ví dụ: `28.500.000.000 đ`).

---

### TRACK 4: ĐỘNG CƠ PHÊ DUYỆT ĐỘNG & AUDIT TRAIL (Tech Lead & Frontend 1)

#### [ERP-SP1-007] Backend State Machine Workflow Engine & Dynamic Role Assignee Resolver
* **Assignee:** Tech Lead
* **Estimate:** 3 Story Points
* **Mô tả công việc:**
  * Triển khai bộ phân giải người duyệt động (`DynamicProjectRoleAssigneeResolver`):
    * Khi bước duyệt yêu cầu `Chỉ huy trưởng dự án`, hệ thống tự động tìm đúng User có vai trò `ProjectManager` trong bảng `ProjectMembers` của công trình đó.
  * Xử lý Concurrency: Sử dụng `RowVersion` (Optimistic Concurrency) để tránh trường hợp 2 người cùng bấm duyệt một lúc gây sai lệch trạng thái.
* **API Specifications:**
  * `POST /api/v1/workflow/submit`: Gửi phiếu vào luồng duyệt.
  * `POST /api/v1/workflow/{instanceId}/approve`: Phê duyệt (Kèm comment).
  * `POST /api/v1/workflow/{instanceId}/reject`: Trả lại / Từ chối (Bắt buộc nhập lý do).
  * `GET /api/v1/workflow/my-pending-tasks`: Danh sách các hồ sơ đang chờ User hiện tại ký duyệt.
* **Definition of Done (DoD):**
  - [ ] Ngăn chặn triệt để tình trạng duyệt vượt cấp.
  - [ ] Ghi nhận toàn bộ vết lịch sử kiểm toán vào `WorkflowInstanceLogs`.

---

#### [ERP-SP1-008] Frontend Hộp Thư Phê Duyệt (Approval Inbox) & Timeline Kiểm Toán
* **Assignee:** Frontend 1 (Senior React)
* **Estimate:** 4 Story Points
* **Mô tả công việc:**
  * Màn hình "Hộp thư phê duyệt" (Inbox) hiển thị badge số lượng phiếu đang chờ xử lý.
  * Bộ lọc phiếu: Tất cả, Chờ tôi duyệt, Tôi đã gửi, Đã phê duyệt, Bị từ chối.
  * Drawer/Modal "Chi tiết phiếu trình duyệt":
    * Nửa trái: Thông tin hồ sơ (Bản vẽ, Dự toán BOQ, Số tiền đề xuất).
    * Nửa phải: Cây tiến trình (Workflow Stepper Timeline) hiển thị trực quan các bước: Bước nào đã xong (tích xanh), Bước nào đang chờ (chấm vàng nhấp nháy), Bước nào chưa tới (màu xám).
  * Nút bấm hành động: "Phê duyệt" (xanh lá), "Yêu cầu bổ sung hồ sơ" (cam), "Từ chối" (đỏ).
* **Definition of Done (DoD):**
  - [ ] Hiển thị đầy đủ avatar, tên người ký, chức danh và timestamp chính xác.
  - [ ] Bấm Duyệt / Từ chối cập nhật trạng thái ngay lập tức trên UI mà không cần tải lại toàn bộ trang.

---

## 3. TIÊU CHUẨN ĐỒNG THUẬN NGHIỆM THU (DEFINITION OF DONE - DoD TOÀN SPRINT)

Để một tính năng được coi là hoàn thành và merge vào nhánh `develop`:
1. **Code Quality:** Không có lỗi SonarLint / Linter; tuân thủ quy ước đặt tên C# và TypeScript đã định nghĩa trong `.editorconfig`.
2. **Automated Testing:**
   * Backend: Mọi Service / Handler cốt lõi phải có Unit Test (Coverage >= 80%).
   * Frontend: Không có console error / warning nào xuất hiện trên trình duyệt.
3. **API & Security:**
   * 100% Endpoint phải đi qua xác thực và gán Filter `TenantId` / `ProjectId`.
   * Swagger Documentation có đầy đủ mô tả trường và mã lỗi (400, 401, 403, 404, 500).
4. **Code Review:** Mọi Pull Request bắt buộc phải được **Tech Lead (Anh)** review và approve trước khi merge.

---

## 4. KẾ HOẠCH HỌP SPRINT & GIAO TIẾP HÀNG NGÀY

* **Daily Standup (15 phút mỗi sáng lúc 9:00 AM):**
  * Hôm qua đã làm xong ticket nào?
  * Hôm nay cam kết hoàn thành ticket nào?
  * Đang bị vướng mắc (blocker) gì về kiến trúc / DB / logic không?
* **Sprint Review & Live Demo (Cuối tuần thứ 2):**
  * Toàn bộ team demo trực tiếp kịch bản đầu cuối:
    * *Tạo dự án ➔ Nhập file BOQ ➔ Gửi phê duyệt ➔ Chỉ huy trưởng nhận thông báo duyệt ➔ Dữ liệu xuất hiện trên Dashboard điều hành.*
