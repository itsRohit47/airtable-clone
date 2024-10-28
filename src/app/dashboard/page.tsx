import { Suspense } from "react";
import { BaseList } from "@/components/base/base-list";
import AuthGuard from "@/components/auth-guard";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="p-6">
        <Suspense fallback={<div>Loading bases...</div>}>
          <BaseList />
        </Suspense>
      </div>
    </AuthGuard>
  );
}
