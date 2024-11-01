"use client";
import { BaseCard } from "./base-card";
import { GetBaseList } from "@/lib/actions/base";

export function BaseList() {
  const bases = GetBaseList();

  return (
    <div>
      <div className="flex w-full flex-col items-start justify-center gap-3 lg:px-24">
        <div className="flex w-full gap-x-3">
          {bases?.map((base) => <BaseCard key={base.id} base={base} />) ?? (
            <div>Loading bases...</div>
          )}
          {bases?.length === 0 && <div>No bases found. Create one!</div>}
        </div>
      </div>
    </div>
  );
}
