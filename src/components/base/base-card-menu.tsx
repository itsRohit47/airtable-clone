"use client";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Trash2Icon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useOutsideClick } from "@/lib/hooks/use-outside-click";

export default function BaseCardMenu({ baseId }: { baseId: string }) {
  const router = useRouter();
  const ctx = api.useUtils();
  const { mutate, isPending } = api.base.deleteBase.useMutation({
    onSuccess: () => {
      void ctx.base.getAllBases.invalidate();
    },
  });
  const [clicked, setClicked] = useState(false);
  const ref = useOutsideClick(() => {
    setClicked(true);
  });

  if (clicked) {
    return null;
  }

  return (
    <div className="absolute -right-10 top-12 z-10 flex flex-col gap-y-1 rounded-md border bg-white p-2 text-xs shadow-lg" ref={ref}>
      <div
        onClick={(e) => {
          e.stopPropagation();
          mutate({ baseId });
        }}
        className="flex cursor-pointer items-center gap-x-1 p-2 text-red-500 hover:bg-gray-100"
      >
        {isPending && <Loader2 size={12} strokeWidth={1.5} className="animate-spin"></Loader2>}<Trash2Icon size={12} strokeWidth={1.5}></Trash2Icon> Delete Base
      </div>
    </div>
  );
}
