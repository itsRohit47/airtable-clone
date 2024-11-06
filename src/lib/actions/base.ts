"use client";
import { api } from "@/trpc/react";

export function GetBaseList() {
  const { data } = api.base.getAllBases.useQuery();
  return data;
}

export function BaseIdToName({ baseId }: { baseId: string }) {
  const { data, isLoading } = api.base.baseIdToName.useQuery({ baseId });
  return isLoading ? "Loading..." : data?.name;
}
