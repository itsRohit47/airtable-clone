"use client";
import { api } from "@/trpc/react";

export function GetBaseList() {
  const { data } = api.base.getAllBases.useQuery();
  return data;
}
