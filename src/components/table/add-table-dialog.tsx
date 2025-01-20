"use client";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../context";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useOutsideClick } from "@/hooks/use-outside-click";
import cuid from "cuid";

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
  const { mutate: addTable } = api.table.addTable.useMutation({
    onMutate: async (newTable: { baseId: string; name?: string; id?: string; createdAt?: Date; updatedAt?: Date, tableId?: string, viewId?: string }) => {
      await ctx.table.getTablesByBaseId.cancel();
      const previousTables = ctx.table.getTablesByBaseId.getData();
      ctx.table.getTablesByBaseId.setData({ baseId }, (old) => [
        ...(old ?? []),
        {
          ...newTable,
          name: newTable.name ?? "Untitled Table",
          id: newTable.id ?? uuidv4(),
          tableId: newTable.tableId ?? cuid(),
          viewId: newTable.viewId ?? cuid(),
          createdAt: newTable.createdAt ?? new Date(),
          updatedAt: newTable.updatedAt ?? new Date(),
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
            const _tableId = cuid();
            const _viewId = cuid();
            router.push(`/${baseId}/${_tableId}/${_viewId}`);
            void ctx.table.getData.invalidate();
            addTable({
              baseId,
              tableId: _tableId,
              viewId: _viewId,
            });
          }}
        >
          Start from scratch
        </button>
      </div>
    );
  }
}
