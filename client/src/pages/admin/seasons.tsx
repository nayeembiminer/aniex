import { AdminLayout } from "@/components/layout/admin-layout";
import { SeasonManager } from "@/components/admin/season-manager";

export default function Seasons() {
  return (
    <AdminLayout title="Season Management">
      <SeasonManager />
    </AdminLayout>
  );
}