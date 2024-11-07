"use client";
import { api } from "@/trpc/react";

export function GetBaseList() {
  const { data } = api.base.getAllBases.useQuery();
  console.log(data);
  return data;
}

export function BaseIdToNameAndColor({ baseId }: { baseId: string }) {
  const { data, isLoading } = api.base.baseIdToName.useQuery({ baseId });
  return { data, isLoading };
}
