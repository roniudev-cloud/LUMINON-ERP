"use client";

import { useState } from "react";
import Link from "next/link";

import { formatDateTime, formatDate, formatVND } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, MapPin, Building, Hash, MessageCircle, Share2, Globe } from "lucide-react";
import { ActivityForm } from "./activity-form";

export function CustomerDetail({ customer }: { customer: any }) {
  const [activeTab, setActiveTab] = useState("activities");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const filteredActivities = customer.activities?.filter((act: any) => {
    const date = new Date(act.createdAt);
    if (fromDate && date < new Date(fromDate)) return false;
    if (toDate && date > new Date(toDate + "T23:59:59")) return false;
    return true;
  }) || [];

  const filteredQuotations = customer.quotations?.filter((q: any) => {
    const date = new Date(q.createdAt);
    if (fromDate && date < new Date(fromDate)) return false;
    if (toDate && date > new Date(toDate + "T23:59:59")) return false;
    return true;
  }) || [];

  const filteredContracts = customer.contracts?.filter((c: any) => {
    const date = new Date(c.createdAt);
    if (fromDate && date < new Date(fromDate)) return false;
    if (toDate && date > new Date(toDate + "T23:59:59")) return false;
    return true;
  }) || [];

  const filteredProjects = customer.projects?.filter((p: any) => {
    const date = new Date(p.createdAt);
    if (fromDate && date < new Date(fromDate)) return false;
    if (toDate && date > new Date(toDate + "T23:59:59")) return false;
    return true;
  }) || [];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Sidebar Info */}
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {customer.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{customer.name}</h2>
                <p className="text-sm text-muted-foreground">{customer.code}</p>
              </div>
              <StatusBadge status={customer.status?.id || "default"} />
            </div>

            <div className="mt-8 space-y-4 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span className="text-foreground">{customer.phone || "—"}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="text-foreground">{customer.email || "—"}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="text-foreground">
                  {[customer.address, customer.ward, customer.district, customer.city]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </span>
              </div>
              {customer.zalo && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span className="text-foreground">Zalo: {customer.zalo}</span>
                </div>
              )}
              {customer.facebook && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Share2 className="h-4 w-4 shrink-0" />
                  <span className="text-foreground">Facebook: {customer.facebook}</span>
                </div>
              )}
              {customer.website && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Globe className="h-4 w-4 shrink-0" />
                  <span className="text-foreground">{customer.website}</span>
                </div>
              )}
              {customer.taxCode && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Hash className="h-4 w-4 shrink-0" />
                  <span className="text-foreground">MST: {customer.taxCode}</span>
                </div>
              )}
              {customer.contactPerson && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Building className="h-4 w-4 shrink-0" />
                  <span className="text-foreground">
                    Đại diện: {customer.contactPerson}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Người phụ trách</span>
                <span className="font-medium">{customer.assignedTo?.fullName || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nguồn KH</span>
                <span className="font-medium">{customer.source?.name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày tạo</span>
                <span className="font-medium">{formatDateTime(customer.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <div className="md:col-span-2">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto flex-nowrap hide-scrollbar">
            <TabsTrigger
              value="activities"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 shrink-0"
            >
              Lịch sử hoạt động
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 shrink-0"
            >
              Ghi chú chung
            </TabsTrigger>
            <TabsTrigger
              value="quotations"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 shrink-0"
            >
              Báo giá
            </TabsTrigger>
            <TabsTrigger
              value="contracts"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 shrink-0"
            >
              Hợp đồng
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 shrink-0"
            >
              Công trình
            </TabsTrigger>
          </TabsList>
          
          {activeTab !== "notes" && (
            <div className="flex flex-wrap items-center gap-3 mt-4 bg-muted/40 p-3 rounded-lg border border-dashed text-xs">
              <span className="font-semibold text-muted-foreground">Lọc theo ngày tạo:</span>
              <div className="flex items-center gap-2">
                <span>Từ</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-background border rounded px-2 py-1 h-8 focus:outline-none focus:ring-1 focus:ring-primary w-[140px]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span>Đến</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-background border rounded px-2 py-1 h-8 focus:outline-none focus:ring-1 focus:ring-primary w-[140px]"
                />
              </div>
              {(fromDate || toDate) && (
                <button
                  onClick={() => {
                    setFromDate("");
                    setToDate("");
                  }}
                  className="text-primary hover:underline font-semibold ml-2"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          )}
          
          <div className={activeTab === "activities" ? "mt-6 block" : "hidden"}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dòng thời gian</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityForm customerId={customer.id} />

                {filteredActivities.length > 0 ? (
                  <div className="space-y-6">
                    {filteredActivities.map((activity: any) => (
                      <div key={activity.id} className="flex gap-4">
                        <div className="mt-1">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {activity.user?.fullName?.substring(0, 2).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium flex items-center gap-2">
                              {activity.user?.fullName || "Hệ thống"}
                              {activity.type && (
                                <span className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground font-normal">
                                  {activity.type === "call" ? "Gọi điện" : 
                                   activity.type === "meeting" ? "Gặp mặt" : 
                                   activity.type === "message" ? "Nhắn tin" : 
                                   activity.type === "note" ? "Ghi chú" :
                                   activity.type === "create" ? "Tạo mới" : activity.type}
                                </span>
                              )}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(activity.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Chưa có hoạt động nào.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className={activeTab === "notes" ? "mt-6 block" : "hidden"}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ghi chú chung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted/50 rounded-lg text-sm">
                  <p className="text-foreground whitespace-pre-wrap">
                    {customer.notes || "Không có ghi chú chung cho khách hàng này."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className={activeTab === "quotations" ? "mt-6 block" : "hidden"}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lịch sử Báo giá</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredQuotations.length > 0 ? (
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Mã</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Tiêu đề</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Trị giá</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Trạng thái</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Hạn hiệu lực</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {filteredQuotations.map((q: any) => (
                          <tr key={q.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle font-medium">
                              <Link href={`/quotations/${q.id}`} className="text-primary hover:underline font-mono">
                                {q.code}
                              </Link>
                            </td>
                            <td className="p-4 align-middle">{q.title}</td>
                            <td className="p-4 align-middle font-semibold">{formatVND(q.totalAmount)}</td>
                            <td className="p-4 align-middle">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                q.status === "approved" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                q.status === "converted" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" :
                                q.status === "sent" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                                q.status === "rejected" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                                "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                              }`}>
                                {q.status === "approved" ? "Đã duyệt" :
                                 q.status === "converted" ? "Đã chuyển đổi" :
                                 q.status === "sent" ? "Đã gửi" :
                                 q.status === "rejected" ? "Từ chối" : "Nháp"}
                              </span>
                            </td>
                            <td className="p-4 align-middle">{formatDate(q.validUntil)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Chưa có dữ liệu</p>
                      <p className="text-xs text-muted-foreground mt-1">Khách hàng chưa có báo giá nào.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className={activeTab === "contracts" ? "mt-6 block" : "hidden"}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lịch sử Hợp đồng</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredContracts.length > 0 ? (
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Mã HĐ</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Tên hợp đồng</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Tổng trị giá</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Đã trả</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Trạng thái</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Thời gian</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {filteredContracts.map((c: any) => (
                          <tr key={c.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle font-medium">
                              <Link href={`/contracts/${c.id}`} className="text-primary hover:underline font-mono">
                                {c.code}
                              </Link>
                            </td>
                            <td className="p-4 align-middle">{c.title}</td>
                            <td className="p-4 align-middle font-semibold">{formatVND(c.totalAmount)}</td>
                            <td className="p-4 align-middle text-emerald-600 font-semibold">{formatVND(c.paidAmount)}</td>
                            <td className="p-4 align-middle">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                c.status === "signed" || c.status === "in_progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                                c.status === "completed" || c.status === "liquidated" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                c.status === "cancelled" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                                "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                              }`}>
                                {c.status === "signed" ? "Đã ký" :
                                 c.status === "in_progress" ? "Đang thực hiện" :
                                 c.status === "completed" ? "Hoàn thành" :
                                 c.status === "liquidated" ? "Thanh lý" :
                                 c.status === "cancelled" ? "Đã hủy" : "Nháp"}
                              </span>
                            </td>
                            <td className="p-4 align-middle text-muted-foreground">
                              {formatDate(c.startDate)} - {formatDate(c.endDate)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Chưa có dữ liệu</p>
                      <p className="text-xs text-muted-foreground mt-1">Khách hàng chưa có hợp đồng nào.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className={activeTab === "projects" ? "mt-6 block" : "hidden"}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Các công trình liên quan</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredProjects.length > 0 ? (
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Mã dự án</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Tên dự án</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Giá trị</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Trạng thái</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Tiến độ</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {filteredProjects.map((p: any) => (
                          <tr key={p.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle font-medium">
                              <Link href={`/projects/${p.id}`} className="text-primary hover:underline font-mono">
                                {p.code}
                              </Link>
                            </td>
                            <td className="p-4 align-middle">{p.name}</td>
                            <td className="p-4 align-middle font-semibold">{formatVND(p.totalValue)}</td>
                            <td className="p-4 align-middle">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                p.status === "in_progress" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                                p.status === "completed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                p.status === "cancelled" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                                "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              }`}>
                                {p.status === "new" ? "Mới tạo" :
                                 p.status === "design" ? "Thiết kế" :
                                 p.status === "design_review" ? "Duyệt thiết kế" :
                                 p.status === "production" ? "Sản xuất" :
                                 p.status === "in_progress" ? "Đang thi công" :
                                 p.status === "completed" ? "Hoàn thành" :
                                 p.status === "cancelled" ? "Đã hủy" : p.status}
                              </span>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-secondary rounded-full h-2 overflow-hidden">
                                  <div className="bg-primary h-full rounded-full" style={{ width: `${p.progress}%` }}></div>
                                </div>
                                <span className="text-xs font-semibold">{p.progress}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Chưa có dữ liệu</p>
                      <p className="text-xs text-muted-foreground mt-1">Chưa có công trình nào liên kết với khách hàng này.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
