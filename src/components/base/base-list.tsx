import { BaseCard } from "./base-card";
import { GetBaseList } from "@/lib/actions/base";
import BaseSkeleton from "../skeletons";
import { Suspense } from "react";
import CreateBaseButton from "../dashboard/create-base-button";
import { useAppContext } from "../context";

export function BaseList() {
  const bases = GetBaseList();
  const { listView } = useAppContext();

  return (
    <Suspense fallback={<BaseSkeleton></BaseSkeleton>}>
      <div className="flex w-full flex-col items-start justify-center gap-3 lg:px-24">
        {listView && (
          <div className="mx-auto p-44">
            <div>coming soon, the UI</div>
          </div>
        )}
        {!listView && (
          <div className="flex w-full flex-wrap gap-3">
            {bases?.map((base) => (
              <BaseCard
                key={base.id}
                base={{
                  ...base,
                  firsTableId: base.tables[0]?.id ?? "",
                  color: base.color ?? "red",
                }}
              />
            )) ?? <BaseSkeleton />}
            {bases?.length === 0 && (
              <div className="flex w-full flex-col items-center justify-center p-44">
                <div className="text-lg">No bases found</div>
                <p className="text-sm text-gray-500">
                  Create a new base to get started or import a base from a CSV
                  file.
                </p>
                <CreateBaseButton className="mt-4 rounded-md border bg-white p-2 text-xs text-gray-600 hover:shadow-sm" />
              </div>
            )}
          </div>
        )}
      </div>
    </Suspense>
  );
}
