"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectOverviewTab } from "@/features/projects/project-overview-tab";
import { ProjectLogsTab } from "@/features/projects/project-logs-tab";
import { ProjectTasksTab } from "@/features/projects/project-tasks-tab";
import { ProjectFilesTab } from "@/features/projects/project-files-tab";
import { ProjectWorkersTab } from "@/features/projects/project-workers-tab";
import { ProjectMaterialsTab } from "@/features/projects/project-materials-tab";
import { ProjectCostsTab } from "@/features/projects/project-costs-tab";

interface ProjectDetailProps {
  project: any;
  users: any[];
  canEdit: boolean;
  canViewFinance: boolean;
  financials?: any;
  materialUsage?: any[];
  costs?: any[];
  workerCosts?: Record<string, number>;
  workerOptions?: any[];
  supplierOptions?: any[];
}

export function ProjectDetail({
  project,
  users,
  canEdit,
  canViewFinance,
  financials,
  materialUsage = [],
  costs = [],
  workerCosts = {},
  workerOptions = [],
  supplierOptions = [],
}: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const filteredLogs = (project.logs || []).filter((log: any) => {
    const date = new Date(log.createdAt);
    if (fromDate && date < new Date(fromDate)) return false;
    if (toDate && date > new Date(toDate + "T23:59:59")) return false;
    return true;
  });

  const filteredTasks = (project.tasks || []).filter((task: any) => {
    const date = new Date(task.createdAt);
    if (fromDate && date < new Date(fromDate)) return false;
    if (toDate && date > new Date(toDate + "T23:59:59")) return false;
    return true;
  });

  const filteredFiles = (project.files || []).filter((file: any) => {
    const date = new Date(file.createdAt);
    if (fromDate && date < new Date(fromDate)) return false;
    if (toDate && date > new Date(toDate + "T23:59:59")) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 h-auto">
          <TabsTrigger value="overview" className="py-2.5">Tổng quan</TabsTrigger>
          <TabsTrigger value="logs" className="py-2.5">Nhật ký ({project.logs?.length || 0})</TabsTrigger>
          <TabsTrigger value="tasks" className="py-2.5">Công việc ({project.tasks?.length || 0})</TabsTrigger>
          <TabsTrigger value="files" className="py-2.5">Files / Ảnh ({project.files?.length || 0})</TabsTrigger>
          <TabsTrigger value="workers" className="py-2.5">Nhân công ({project.workers?.length || 0})</TabsTrigger>
          <TabsTrigger value="materials" className="py-2.5">Vật tư</TabsTrigger>
          <TabsTrigger value="costs" className="py-2.5">Chi phí</TabsTrigger>
        </TabsList>
        
        {activeTab !== "overview" && (
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
        
        <div className={activeTab === "overview" ? "mt-6 block" : "hidden"}>
          <ProjectOverviewTab project={project} canEdit={canEdit} canViewFinance={canViewFinance} onSwitchTab={setActiveTab} financials={financials} />
        </div>
        
        <div className={activeTab === "logs" ? "mt-6 block" : "hidden"}>
          <ProjectLogsTab project={project} logs={filteredLogs} />
        </div>
        
        <div className={activeTab === "tasks" ? "mt-6 block" : "hidden"}>
          <ProjectTasksTab project={project} tasks={filteredTasks} users={users} />
        </div>
        
        <div className={activeTab === "files" ? "mt-6 block" : "hidden"}>
          <ProjectFilesTab project={project} files={filteredFiles} />
        </div>

        <div className={activeTab === "workers" ? "mt-6 block" : "hidden"}>
          <ProjectWorkersTab projectId={project.id} assignments={project.workers || []} workerOptions={workerOptions} costs={workerCosts} />
        </div>

        <div className={activeTab === "materials" ? "mt-6 block" : "hidden"}>
          <ProjectMaterialsTab usage={materialUsage} />
        </div>

        <div className={activeTab === "costs" ? "mt-6 block" : "hidden"}>
          <ProjectCostsTab projectId={project.id} costs={costs} suppliers={supplierOptions} />
        </div>
      </Tabs>
    </div>
  );
}
