import { Suspense } from "react";
import AuthGuard from "@/components/auth-guard";

export default function BasePage({ params }: { params: { baseId: string } }) {
  return (
    <AuthGuard>
      <div className="p-6">
        <Suspense fallback={<div>Loading tables...</div>}></Suspense>
        <div className="mt-6">
          <h1 className="text-2xl font-semibold">Tables</h1>
          <p className="text-muted-foreground">
            Manage the tables in your base
          </p>
          {params.baseId}
        </div>
      </div>
    </AuthGuard>
  );
}
