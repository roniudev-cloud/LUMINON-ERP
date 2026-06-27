import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { users } from "@db/schema/auth";
import {
  customers,
  customerSources,
  customerStatuses,
  leads,
  leadSources,
  customerActivities,
} from "@db/schema/crm";
import {
  materials,
  suppliers,
  materialCategories,
  stockTickets,
  stockTicketItems,
} from "@db/schema/inventory";
import {
  projects,
  projectStatuses,
  projectTasks,
  projectLogs,
  projectCosts,
  projectWorkers,
} from "@db/schema/projects";
import {
  quotations,
  quotationItems,
  contracts,
  contractItems,
  contractPaymentTerms,
} from "@db/schema/sales";
import {
  receipts,
  payments,
  customerDebts,
  supplierDebts,
  vatInvoices,
} from "@db/schema/finance";
import {
  workers,
  workerRoles,
  workerAttendances,
  workerAdvances,
} from "@db/schema/workers";
import { eq, isNull } from "drizzle-orm";

export async function GET() {
  console.log("🌱 Starting seed via API...");
  try {
    // 1. Find admin user
    const adminUser = await db.query.users.findFirst({
      where: eq(users.email, "admin@luminon.vn"),
    });

    if (!adminUser) {
      return NextResponse.json({ error: "Admin user not found. Please run baseline db:seed first." }, { status: 404 });
    }

    const companyId = adminUser.companyId || null;
    const adminId = adminUser.id;
    console.log(`🏢 Company ID: ${companyId}, Admin ID: ${adminId}`);

    // Retrieve lookups
    const sources = await db.select().from(customerSources);
    const statuses = await db.select().from(customerStatuses);
    const projStatuses = await db.select().from(projectStatuses);
    const wRoles = await db.select().from(workerRoles);
    const matCats = await db.select().from(materialCategories);

    const facebookSourceId = sources.find((s) => s.name === "Facebook")?.id || sources[0]?.id;
    const websiteSourceId = sources.find((s) => s.name === "Website")?.id || sources[0]?.id;

    const wonStatusId = statuses.find((s) => s.name === "Đã chốt")?.id || statuses[0]?.id;
    const negotiatedStatusId = statuses.find((s) => s.name === "Đang đàm phán")?.id || statuses[0]?.id;

    const workerRoleThoChinhId = wRoles.find((r) => r.name === "Thợ chính")?.id || wRoles[0]?.id;
    const workerRoleThoPhuId = wRoles.find((r) => r.name === "Thợ phụ")?.id || wRoles[0]?.id;

    const woodCatId = matCats.find((c) => c.name === "Gỗ")?.id || matCats[0]?.id;
    const metalCatId = matCats.find((c) => c.name === "Kim loại")?.id || matCats[0]?.id;

    // Clear previous data created by seed to avoid key conflicts if run multiple times
    // Clear previous data created by seed to avoid key conflicts if run multiple times
    if (companyId === null) {
      await db.delete(stockTicketItems).where(isNull(stockTicketItems.companyId));
      await db.delete(stockTickets).where(isNull(stockTickets.companyId));
      await db.delete(vatInvoices).where(isNull(vatInvoices.companyId));
      await db.delete(receipts).where(isNull(receipts.companyId));
      await db.delete(payments).where(isNull(payments.companyId));
      await db.delete(customerDebts).where(isNull(customerDebts.companyId));
      await db.delete(supplierDebts).where(isNull(supplierDebts.companyId));
      await db.delete(projectTasks).where(isNull(projectTasks.companyId));
      await db.delete(projectLogs).where(isNull(projectLogs.companyId));
      await db.delete(projectCosts).where(isNull(projectCosts.companyId));
      await db.delete(projectWorkers).where(isNull(projectWorkers.companyId));
      await db.delete(workerAttendances).where(isNull(workerAttendances.companyId));
      await db.delete(projects).where(isNull(projects.companyId));
      await db.delete(contractItems).where(isNull(contractItems.companyId));
      await db.delete(contractPaymentTerms).where(isNull(contractPaymentTerms.companyId));
      await db.delete(contracts).where(isNull(contracts.companyId));
      await db.delete(quotationItems).where(isNull(quotationItems.companyId));
      await db.delete(quotations).where(isNull(quotations.companyId));
      await db.delete(customerActivities).where(isNull(customerActivities.companyId));
      await db.delete(leads).where(isNull(leads.companyId));
      await db.delete(customers).where(isNull(customers.companyId));
      await db.delete(materials).where(isNull(materials.companyId));
      await db.delete(suppliers).where(isNull(suppliers.companyId));
      await db.delete(workerAdvances).where(isNull(workerAdvances.companyId));
      await db.delete(workers).where(isNull(workers.companyId));
    } else {
      await db.delete(stockTicketItems).where(eq(stockTicketItems.companyId, companyId));
      await db.delete(stockTickets).where(eq(stockTickets.companyId, companyId));
      await db.delete(vatInvoices).where(eq(vatInvoices.companyId, companyId));
      await db.delete(receipts).where(eq(receipts.companyId, companyId));
      await db.delete(payments).where(eq(payments.companyId, companyId));
      await db.delete(customerDebts).where(eq(customerDebts.companyId, companyId));
      await db.delete(supplierDebts).where(eq(supplierDebts.companyId, companyId));
      await db.delete(projectTasks).where(eq(projectTasks.companyId, companyId));
      await db.delete(projectLogs).where(eq(projectLogs.companyId, companyId));
      await db.delete(projectCosts).where(eq(projectCosts.companyId, companyId));
      await db.delete(projectWorkers).where(eq(projectWorkers.companyId, companyId));
      await db.delete(workerAttendances).where(eq(workerAttendances.companyId, companyId));
      await db.delete(projects).where(eq(projects.companyId, companyId));
      await db.delete(contractItems).where(eq(contractItems.companyId, companyId));
      await db.delete(contractPaymentTerms).where(eq(contractPaymentTerms.companyId, companyId));
      await db.delete(contracts).where(eq(contracts.companyId, companyId));
      await db.delete(quotationItems).where(eq(quotationItems.companyId, companyId));
      await db.delete(quotations).where(eq(quotations.companyId, companyId));
      await db.delete(customerActivities).where(eq(customerActivities.companyId, companyId));
      await db.delete(leads).where(eq(leads.companyId, companyId));
      await db.delete(customers).where(eq(customers.companyId, companyId));
      await db.delete(materials).where(eq(materials.companyId, companyId));
      await db.delete(suppliers).where(eq(suppliers.companyId, companyId));
      await db.delete(workerAdvances).where(eq(workerAdvances.companyId, companyId));
      await db.delete(workers).where(eq(workers.companyId, companyId));
    }

    console.log("🧹 Previous seed data cleaned.");

    // 3. Create Customers
    const [cus1, cus2, cus3] = await db.insert(customers).values([
      {
        companyId,
        code: "KH-VINHOMES-001",
        name: "Công ty Cổ phần Đầu tư Đất Việt",
        email: "datviet@invest.vn",
        phone: "0904445556",
        address: "Tòa Park 3, Vinhomes Central Park",
        city: "Hồ Chí Minh",
        district: "Bình Thạnh",
        ward: "Phường 22",
        taxCode: "0314567890",
        contactPerson: "Nguyễn Văn Hùng (Giám đốc dự án)",
        sourceId: websiteSourceId,
        statusId: wonStatusId,
        assignedToId: adminId,
        createdBy: adminId,
        notes: "Khách hàng lớn, yêu cầu thi công nội thất văn phòng trọn gói cao cấp.",
      },
      {
        companyId,
        code: "KH-PRIVATE-002",
        name: "Trần Thị Ánh Tuyết",
        email: "anhtuyet.nguyen@gmail.com",
        phone: "0918889991",
        address: "Biệt thự số 15, Đường 8, Khu đô thị Sala",
        city: "Hồ Chí Minh",
        district: "Quận 2",
        ward: "An Lợi Đông",
        taxCode: null,
        contactPerson: "Trần Thị Ánh Tuyết",
        sourceId: facebookSourceId,
        statusId: wonStatusId,
        assignedToId: adminId,
        createdBy: adminId,
        notes: "Gia chủ kỹ tính, chuộng phong cách tân cổ điển.",
      },
      {
        companyId,
        code: "KH-RESTAURANT-003",
        name: "Chuỗi Nhà Hàng Phở Việt",
        email: "contact@phoviet.com.vn",
        phone: "0989991112",
        address: "128 Nguyễn Thị Minh Khai",
        city: "Hồ Chí Minh",
        district: "Quận 3",
        ward: "Võ Thị Sáu",
        taxCode: "0312223334",
        contactPerson: "Phạm Minh Hoàng (Trưởng chuỗi)",
        sourceId: websiteSourceId,
        statusId: negotiatedStatusId,
        assignedToId: adminId,
        createdBy: adminId,
        notes: "Đang đàm phán thiết kế chi nhánh thứ 5.",
      }
    ]).returning();

    // Activities
    await db.insert(customerActivities).values([
      {
        companyId,
        customerId: cus1.id,
        userId: adminId,
        type: "meeting",
        description: "Họp trực tiếp thống nhất phương án mặt bằng và vật liệu gỗ công nghiệp An Cường.",
      },
      {
        companyId,
        customerId: cus2.id,
        userId: adminId,
        type: "call",
        description: "Gọi điện tư vấn về báo giá chi tiết phần đá marble tự nhiên nhập khẩu.",
      }
    ]);

    // Leads
    await db.insert(leads).values([
      {
        companyId,
        name: "Lê Minh Tuấn",
        phone: "0905556667",
        email: "tuan.le@gmail.com",
        description: "Cần cải tạo căn hộ 3 phòng ngủ tại Masteri Thảo Điền.",
        status: "contacted",
        assignedToId: adminId,
        createdBy: adminId,
      },
      {
        companyId,
        name: "Hoàng Ngọc Mai",
        phone: "0932223334",
        email: "mai.hn@decor.vn",
        description: "Hỏi báo giá thi công tủ bếp acrylic cánh kính.",
        status: "new",
        assignedToId: adminId,
        createdBy: adminId,
      }
    ]);

    // Suppliers & Materials
    const [supplier1, supplier2] = await db.insert(suppliers).values([
      {
        companyId,
        code: "NCC-ANCUONG",
        name: "Công ty Cổ phần Gỗ An Cường",
        category: "material",
        contactPerson: "Lê Thị Thu",
        phone: "19006944",
        email: "info@ancuong.com",
        address: "702/1K Sư Vạn Hạnh, Quận 10, TP.HCM",
        taxCode: "0302876543",
        status: "active",
      },
      {
        companyId,
        code: "NCC-HAFELE",
        name: "Hafele Việt Nam",
        category: "accessory",
        contactPerson: "Nguyễn Văn Đức",
        phone: "02839977300",
        email: "info@hafele.com.vn",
        address: "350 Hoàng Văn Thụ, Tân Bình, TP.HCM",
        taxCode: "0305432109",
        status: "active",
      }
    ]).returning();

    const [mat1, mat2, mat3] = await db.insert(materials).values([
      {
        companyId,
        code: "VT-MDF-18L",
        name: "Gỗ MDF lõi xanh chống ẩm An Cường 18mm",
        categoryId: woodCatId,
        supplierId: supplier1.id,
        unit: "tấm",
        minStock: 20,
        currentStock: 120,
        unitPrice: "680000",
        description: "Mã MDF 101G Melamine tiêu chuẩn.",
      },
      {
        companyId,
        code: "VT-BANLE-IV",
        name: "Bản lề giảm chấn Hafele Inox 304",
        categoryId: metalCatId,
        supplierId: supplier2.id,
        unit: "cái",
        minStock: 100,
        currentStock: 450,
        unitPrice: "45000",
        description: "Bản lề thẳng giảm chấn lắp nhanh.",
      },
      {
        companyId,
        code: "VT-RAY-HF",
        name: "Ray trượt bi 3 tầng Hafele 450mm",
        categoryId: metalCatId,
        supplierId: supplier2.id,
        unit: "bộ",
        minStock: 50,
        currentStock: 80,
        unitPrice: "125000",
        description: "Ray trượt hộc tủ chịu lực 35kg.",
      }
    ]).returning();

    // Quotations
    const [quo1, quo2] = await db.insert(quotations).values([
      {
        companyId,
        code: "BG-2026-001",
        customerId: cus1.id,
        title: "Báo giá thi công nội thất văn phòng Đất Việt",
        subtotal: "420000000",
        discount: "10000000",
        discountType: "amount",
        vatRate: "10.00",
        vatAmount: "41000000",
        totalAmount: "451000000",
        status: "approved",
        validUntil: "2026-12-31",
        notes: "Giá đã bao gồm chi phí vận chuyển nội thành TP.HCM.",
        createdBy: adminId,
        approvedBy: adminId,
      },
      {
        companyId,
        code: "BG-2026-002",
        customerId: cus2.id,
        title: "Báo giá thi công tủ bếp & phòng khách Sala",
        subtotal: "285000000",
        discount: "5.00",
        discountType: "percent",
        vatRate: "10.00",
        vatAmount: "27075000",
        totalAmount: "297825000",
        status: "approved",
        validUntil: "2026-12-31",
        notes: "Thi công sử dụng sơn phủ men bóng cao cấp.",
        createdBy: adminId,
        approvedBy: adminId,
      }
    ]).returning();

    // Quotation Items
    await db.insert(quotationItems).values([
      {
        companyId,
        quotationId: quo1.id,
        name: "Vách ngăn văn phòng khung nhôm kính cường lực",
        description: "Kính cường lực 10mm Hải Long, khung nhôm Xingfa hệ 55",
        unit: "m2",
        quantity: "85.00",
        unitPrice: "1850000",
        amount: "157250000",
        sortOrder: 1,
      },
      {
        companyId,
        quotationId: quo1.id,
        name: "Bàn làm việc nhân viên cụm 4 người",
        description: "Gỗ MDF An Cường phủ Melamine, chân sắt hộp sơn tĩnh điện",
        unit: "bộ",
        quantity: "15.00",
        unitPrice: "12000000",
        amount: "180000000",
        sortOrder: 2,
      },
      {
        companyId,
        quotationId: quo1.id,
        name: "Tủ tài liệu văn phòng áp tường",
        description: "Cao 2m, rộng 3.2m, gỗ MDF An Cường chống ẩm",
        unit: "cái",
        quantity: "5.00",
        unitPrice: "16550000",
        amount: "82750000",
        sortOrder: 3,
      }
    ]);

    await db.insert(quotationItems).values([
      {
        companyId,
        quotationId: quo2.id,
        name: "Hệ tủ bếp chữ L Acrylic An Cường",
        description: "Thùng picomat chống nước, cánh MDF phủ Acrylic bóng gương",
        unit: "md",
        quantity: "8.50",
        unitPrice: "8500000",
        amount: "72250000",
        sortOrder: 1,
      },
      {
        companyId,
        quotationId: quo2.id,
        name: "Hệ vách tivi đá tự nhiên kết hợp gỗ trang trí",
        description: "Đá marble Vân Mây kết hợp tủ trang trí gỗ Veneer Sồi",
        unit: "trọn gói",
        quantity: "1.00",
        unitPrice: "212750000",
        amount: "212750000",
        sortOrder: 2,
      }
    ]);

    // Contracts
    const [contract1, contract2] = await db.insert(contracts).values([
      {
        companyId,
        code: "HĐ-2026-DATVIET",
        customerId: cus1.id,
        quotationId: quo1.id,
        title: "Hợp đồng thi công nội thất văn phòng Đất Việt",
        type: "interior",
        constructionAddress: "Tòa Park 3, Vinhomes Central Park",
        subtotal: "420000000",
        discount: "10000000",
        discountType: "amount",
        vatRate: "10.00",
        vatAmount: "41000000",
        totalAmount: "451000000",
        paidAmount: "250000000",
        status: "signed",
        signDate: "2026-06-01",
        startDate: "2026-06-05",
        endDate: "2026-07-20",
        paymentTermsContent: "Đợt 1: 50% khi ký Hợp đồng. Đợt 2: 40% khi bàn giao vật tư tại công trình. Đợt 3: 10% khi nghiệm thu quyết toán.",
        executionTerms: "Thời gian hoàn thành 45 ngày kể từ ngày nhận bàn giao mặt bằng thi công sạch.",
        warrantyTerms: "Bảo hành 12 tháng đối với gỗ, 24 tháng đối với phụ kiện Hafele.",
        createdBy: adminId,
      },
      {
        companyId,
        code: "HĐ-2026-SALA",
        customerId: cus2.id,
        quotationId: quo2.id,
        title: "Hợp đồng thi công tủ bếp & phòng khách biệt thự Sala",
        type: "interior",
        constructionAddress: "Biệt thự số 15, Đường 8, Sala",
        subtotal: "285000000",
        discount: "5",
        discountType: "percent",
        vatRate: "10.00",
        vatAmount: "27075000",
        totalAmount: "297825000",
        paidAmount: "150000000",
        status: "in_progress",
        signDate: "2026-06-10",
        startDate: "2026-06-12",
        endDate: "2026-08-10",
        paymentTermsContent: "Đợt 1: Tạm ứng 50% sau khi ký hợp đồng. Đợt 2: Thanh toán 40% khi lắp đặt phần thô gỗ. Đợt 3: Thanh toán 10% sau khi nghiệm thu.",
        createdBy: adminId,
      }
    ]).returning();

    // Contract Payment Terms
    await db.insert(contractPaymentTerms).values([
      {
        companyId,
        contractId: contract1.id,
        name: "Đợt 1: Tạm ứng ký hợp đồng (50%)",
        percentage: "50.00",
        amount: "225500000",
        dueDate: "2026-06-03",
        status: "paid",
      },
      {
        companyId,
        contractId: contract1.id,
        name: "Đợt 2: Bàn giao vật tư tại công trình (40%)",
        percentage: "40.00",
        amount: "180400000",
        dueDate: "2026-07-05",
        status: "pending",
      },
      {
        companyId,
        contractId: contract1.id,
        name: "Đợt 3: Nghiệm thu quyết toán (10%)",
        percentage: "10.00",
        amount: "45100000",
        dueDate: "2026-07-25",
        status: "pending",
      }
    ]);

    // Projects
    const [proj1, proj2] = await db.insert(projects).values([
      {
        companyId,
        code: "DA-DATVIET",
        name: "Văn phòng Đất Việt - Vinhomes",
        customerId: cus1.id,
        contractId: contract1.id,
        address: "Tòa Park 3, Vinhomes Central Park",
        totalValue: "451000000",
        expectedCost: "310000000",
        actualCost: "165000000",
        estimatedProfit: "141000000",
        status: "in_progress",
        progress: 45,
        startDate: "2026-06-05",
        expectedEndDate: "2026-07-20",
        managerId: adminId,
        createdBy: adminId,
        notes: "Cần tăng cường đội thợ chính vào giai đoạn lắp đặt vách nhôm kính từ ngày 01/07.",
      },
      {
        companyId,
        code: "DA-SALA",
        name: "Biệt thự Sala - Chị Tuyết",
        customerId: cus2.id,
        contractId: contract2.id,
        address: "Biệt thự số 15, Đường 8, Sala",
        totalValue: "297825000",
        expectedCost: "200000000",
        actualCost: "75000000",
        estimatedProfit: "97825000",
        status: "design_review",
        progress: 15,
        startDate: "2026-06-12",
        expectedEndDate: "2026-08-10",
        managerId: adminId,
        createdBy: adminId,
        notes: "Đang chốt màu Acrylic tủ bếp lần cuối với chủ nhà.",
      }
    ]).returning();

    // Project Logs
    await db.insert(projectLogs).values([
      {
        companyId,
        projectId: proj1.id,
        userId: adminId,
        date: "2026-06-06",
        phase: "pre_construction",
        title: "Bàn giao mặt bằng & đo đạc hiện trạng",
        content: "Mặt bằng bàn giao đúng hẹn. Tiến hành đo vẽ chi tiết các cột, góc tường nghiêng và các lỗ kỹ thuật để khớp bản vẽ sản xuất đồ gỗ.",
        weather: "Nắng tốt",
        status: "resolved",
      },
      {
        companyId,
        projectId: proj1.id,
        userId: adminId,
        date: "2026-06-15",
        phase: "in_progress",
        title: "Hoàn thiện đi đường điện âm tường & trần thạch cao",
        content: "Đã hoàn thành 100% đi dây điện động lực và dây mạng. Đội thạch cao đang tiến hành đóng khung xương trần.",
        weather: "Mây mưa nhẹ chiều",
        status: "resolved",
      }
    ]);

    // Project Tasks
    await db.insert(projectTasks).values([
      {
        companyId,
        projectId: proj1.id,
        name: "Khảo sát hiện trạng & đo đạc",
        description: "Đo kích thước chiều dài trần, tường, sàn và ghi nhận vị trí ổ cắm điện.",
        assignedToId: adminId,
        priority: "high",
        status: "completed",
        progress: 100,
        startDate: "2026-06-05",
        dueDate: "2026-06-07",
        completedDate: "2026-06-06",
      },
      {
        companyId,
        projectId: proj1.id,
        name: "Sản xuất tủ gỗ văn phòng tại xưởng",
        description: "Cắt ván MDF chống ẩm An Cường theo bản vẽ chi tiết tại File đính kèm tủ tài liệu.",
        assignedToId: adminId,
        priority: "normal",
        status: "in_progress",
        progress: 60,
        startDate: "2026-06-18",
        dueDate: "2026-07-05",
      },
      {
        companyId,
        projectId: proj1.id,
        name: "Lắp đặt kính vách ngăn & bàn nhân viên",
        description: "Lắp ráp hoàn thiện tại công trình Vinhomes.",
        assignedToId: adminId,
        priority: "high",
        status: "new",
        progress: 0,
        startDate: "2026-07-06",
        dueDate: "2026-07-15",
      }
    ]);

    // Project Costs
    await db.insert(projectCosts).values([
      {
        companyId,
        projectId: proj1.id,
        category: "material",
        description: "Mua gỗ MDF An Cường đợt 1 để sản xuất tủ tài liệu văn phòng",
        amount: "95000000",
        date: "2026-06-10",
        supplierId: supplier1.id,
        createdBy: adminId,
      },
      {
        companyId,
        projectId: proj1.id,
        category: "labor",
        description: "Chi phí nhân công thợ lắp đặt trần thạch cao văn phòng",
        amount: "45000000",
        date: "2026-06-16",
        createdBy: adminId,
      },
      {
        companyId,
        projectId: proj1.id,
        category: "transport",
        description: "Vận chuyển vật tư thô từ xưởng kho Quận 9 sang Vinhomes",
        amount: "25000000",
        date: "2026-06-06",
        createdBy: adminId,
      }
    ]);

    // Receipts
    await db.insert(receipts).values([
      {
        companyId,
        code: "PT-2026-DATVIET-01",
        customerId: cus1.id,
        projectId: proj1.id,
        contractId: contract1.id,
        amount: "250000000",
        type: "deposit",
        paymentMethod: "bank_transfer",
        date: "2026-06-03",
        submitterName: "Kế toán Công ty Đất Việt",
        description: "Tạm ứng ký hợp đồng thi công nội thất văn phòng Đất Việt (đợt 1)",
        createdBy: adminId,
      },
      {
        companyId,
        code: "PT-2026-SALA-01",
        customerId: cus2.id,
        projectId: proj2.id,
        contractId: contract2.id,
        amount: "150000000",
        type: "deposit",
        paymentMethod: "bank_transfer",
        date: "2026-06-11",
        submitterName: "Trần Thị Ánh Tuyết",
        description: "Tạm ứng 50% thi công tủ bếp Sala",
        createdBy: adminId,
      }
    ]);

    // Payments
    await db.insert(payments).values([
      {
        companyId,
        code: "PC-2026-ANCUONG-01",
        projectId: proj1.id,
        supplierId: supplier1.id,
        supplierName: supplier1.name,
        receiverName: "Kế toán Gỗ An Cường",
        category: "material",
        amount: "95000000",
        paymentMethod: "bank_transfer",
        date: "2026-06-10",
        description: "Thanh toán hóa đơn ván MDF đợt 1 - Dự án Đất Việt",
        createdBy: adminId,
      },
      {
        companyId,
        code: "PC-2026-THACHCAO",
        projectId: proj1.id,
        receiverName: "Nguyễn Văn Tuấn (Trưởng nhóm thạch cao)",
        category: "labor",
        amount: "45000000",
        paymentMethod: "cash",
        date: "2026-06-16",
        description: "Thanh toán dứt điểm tiền công thi công trần thạch cao",
        createdBy: adminId,
      }
    ]);

    // VAT Invoices
    await db.insert(vatInvoices).values([
      {
        companyId,
        code: "VAT-2026-0001",
        customerId: cus1.id,
        type: "outbound",
        amount: "227272727",
        vatRate: "10.00",
        vatAmount: "22727273",
        totalAmount: "250000000",
        issueDate: "2026-06-05",
        status: "issued",
        createdBy: adminId,
      },
      {
        companyId,
        code: "VAT-ANCUONG-IN",
        supplierId: supplier1.id,
        type: "inbound",
        amount: "86363636",
        vatRate: "10.00",
        vatAmount: "8636364",
        totalAmount: "95000000",
        issueDate: "2026-06-10",
        status: "issued",
        createdBy: adminId,
      }
    ]);

    // Customer Debts
    await db.insert(customerDebts).values([
      {
        companyId,
        customerId: cus1.id,
        contractId: contract1.id,
        projectId: proj1.id,
        totalAmount: "451000000",
        paidAmount: "250000000",
        remainingAmount: "201000000",
        status: "partial",
        dueDate: "2026-07-25",
        lastPaymentDate: "2026-06-03",
      },
      {
        companyId,
        customerId: cus2.id,
        contractId: contract2.id,
        projectId: proj2.id,
        totalAmount: "297825000",
        paidAmount: "150000000",
        remainingAmount: "147825000",
        status: "partial",
        dueDate: "2026-08-10",
        lastPaymentDate: "2026-06-11",
      }
    ]);

    // Supplier Debts
    await db.insert(supplierDebts).values([
      {
        companyId,
        supplierId: supplier1.id,
        supplierName: supplier1.name,
        totalAmount: "95000000",
        paidAmount: "95000000",
        remainingAmount: "0",
        status: "paid",
      }
    ]);

    // Workers
    const [worker1, worker2] = await db.insert(workers).values([
      {
        companyId,
        code: "THO-LUAN",
        name: "Phạm Văn Luân",
        phone: "0941112223",
        idNumber: "123456789012",
        roleId: workerRoleThoChinhId,
        dailyRate: "450000",
        isActive: true,
      },
      {
        companyId,
        code: "THO-HAST",
        name: "Nguyễn Duy Hải",
        phone: "0972223334",
        idNumber: "098765432109",
        roleId: workerRoleThoPhuId,
        dailyRate: "300000",
        isActive: true,
      }
    ]).returning();

    // Worker Attendances
    await db.insert(workerAttendances).values([
      {
        companyId,
        workerId: worker1.id,
        projectId: proj1.id,
        date: "2026-06-15",
        status: "present",
        note: "Lắp đặt khung xương thạch cao",
      },
      {
        companyId,
        workerId: worker1.id,
        projectId: proj1.id,
        date: "2026-06-16",
        status: "present",
        note: "Bắn tấm thạch cao trần",
      },
      {
        companyId,
        workerId: worker2.id,
        projectId: proj1.id,
        date: "2026-06-15",
        status: "present",
        note: "Phụ bưng ván thạch cao",
      },
      {
        companyId,
        workerId: worker2.id,
        projectId: proj1.id,
        date: "2026-06-16",
        status: "half_day",
        note: "Về sớm giải quyết việc cá nhân",
      }
    ]);

    // Worker Advances
    await db.insert(workerAdvances).values([
      {
        companyId,
        workerId: worker1.id,
        amount: "500000",
        date: "2026-06-17",
        note: "Ứng lương tiêu vặt giữa tháng",
        createdBy: adminId,
      }
    ]);

    // Stock Tickets
    const [ticketIn] = await db.insert(stockTickets).values([
      {
        companyId,
        code: "NK-2026-0001",
        type: "IN",
        date: "2026-06-08",
        supplierId: supplier1.id,
        delivererName: "Tài xế An Cường",
        receiverName: "Bùi Văn Kho",
        totalAmount: "68000000",
        notes: "Nhập ván gỗ kho chính chuẩn bị sản xuất.",
        createdBy: adminId,
      }
    ]).returning();

    await db.insert(stockTicketItems).values([
      {
        companyId,
        ticketId: ticketIn.id,
        materialId: mat1.id,
        quantity: 100,
        unitPrice: "680000",
        totalAmount: "68000000",
      }
    ]);

    console.log("🎉 Seed finished successfully!");
    return NextResponse.json({ success: true, message: "Dữ liệu ERP đồng bộ mẫu đã được nạp thành công!" });
  } catch (err: any) {
    console.error("❌ Seed failed:", err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
