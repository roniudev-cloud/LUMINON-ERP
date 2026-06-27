import { getWorker } from "@/actions/workers";
import { getProjectOptions } from "@/actions/projects";
import { PageHeader } from "@/components/shared/page-header";
import { WorkerDetail } from "@/features/workers/worker-detail";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const worker = await getWorker(id);
    return { title: `${worker.name} | Nhân công` };
  } catch {
    return { title: "Không tìm thấy nhân công" };
  }
}

export default async function WorkerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let worker;
  let projects;
  try {
    [worker, projects] = await Promise.all([getWorker(id), getProjectOptions()]);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader title={worker.name} description={`Mã NC: ${worker.code} · ${worker.role?.name || "Chưa phân loại"}`} />
      <WorkerDetail worker={worker} projects={projects} />
    </div>
  );
}
