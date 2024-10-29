"use client";
import { api } from "@/trpc/react";

export function GetTableList({ baseId }: { baseId: string }) {
  const { data } = api.table.getTablesByBaseId.useQuery({ baseId });
  return data;
}
