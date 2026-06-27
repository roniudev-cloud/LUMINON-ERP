import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileEditForm } from "@/features/profile/profile-edit-form";

export default async function ProfileEditPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Chỉnh sửa hồ sơ"
        description="Cập nhật thông tin liên lạc của bạn."
      />
      <ProfileEditForm user={user} />
    </div>
  );
}
