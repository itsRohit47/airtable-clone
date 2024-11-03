"use client";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Edit2Icon, Trash2Icon } from "lucide-react";

export default function BaseCardMenu({ baseId }: { baseId: string }) {
  const router = useRouter();
  const ctx = api.useUtils();
  const { mutate } = api.base.deleteBase.useMutation({
    onSuccess: () => {
      void ctx.base.getAllBases.invalidate();
    },
  });
  return (
    <div className="absolute -right-32 top-12 z-10 flex flex-col gap-y-1 rounded-md border bg-white p-2 text-xs shadow-lg">
      <div className="flex items-center gap-x-1 p-2">
        <Edit2Icon size={12} strokeWidth={1.5}></Edit2Icon>Rename base (coming)
      </div>
      <hr></hr>
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (confirm("Are you sure you want to delete this base?")) {
            mutate({ baseId });
          }
        }}
        className="flex cursor-pointer items-center gap-x-1 p-2 text-red-500 hover:bg-gray-100"
      >
        <Trash2Icon size={12} strokeWidth={1.5}></Trash2Icon>
        Delete Base
      </div>
    </div>
  );
}
