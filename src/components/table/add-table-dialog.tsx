"use client";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../context";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useOutsideClick } from "@/hooks/use-outside-click";

export default function AddTableDialog({
  baseId,
  classList,
  viewId,
}: {
  baseId: string;
  classList: string;
  viewId: string;
}) {
  const [clicked, setClicked] = useState(false);
  const ctx = api.useUtils();
  const router = useRouter();
  const { setSelectedView } = useAppContext();
  const { mutate: addTable } = api.table.addTable.useMutation({
    onMutate: async (newTable: { baseId: string; name?: string; id?: string; createdAt?: Date; updatedAt?: Date }) => {
      await ctx.table.getTablesByBaseId.cancel();
      const previousTables = ctx.table.getTablesByBaseId.getData();
      ctx.table.getTablesByBaseId.setData({ baseId }, (old) => [
        ...(old ?? []),
        {
          ...newTable,
          name: newTable.name ?? "Untitled Table",
          id: newTable.id ?? uuidv4(),
          createdAt: newTable.createdAt ?? new Date(),
          updatedAt: newTable.updatedAt ?? new Date(),
          views: [],
        },
      ]);
      return { previousTables };
    },
    onError: (err, newTable, context) => {
      if (context?.previousTables) {
        ctx.table.getTablesByBaseId.setData({ baseId }, context.previousTables);
      }
    },
    onSuccess: (data) => {
      void ctx.table.getTablesByBaseId.invalidate();
      setSelectedView(data.view ?? null);
      if (data) {
        router.replace(`/${baseId}/${data.table.id}/${data.view?.id}`);
      }
    },
  });
  const ref = useOutsideClick(() => {
    setClicked(true);
  });

  if (clicked) {
    return null;
  } else {
    return (
      <div
        ref={ref}
        className={`flex min-w-72 flex-col gap-y-2 rounded-md border bg-white p-2 text-black shadow-sm ${classList}`}
      >
        <span className="px-2 text-xs text-gray-500">Add a blank table</span>
        <button
          className="rounded-sm bg-gray-100 p-2 text-start text-xs text-black"
          onClick={() => {
            addTable({
              baseId,
            });
          }}
        >
          Start from scratch
        </button>
      </div>
    );
  }
}
