"use client";
import { ChevronDown, PlusIcon } from "lucide-react";
import clsx from "clsx";
import { api } from "@/trpc/react";
import { GetTableList } from "@/lib/actions/table";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import AddTableDialog from "./add-table-dialog";

export default function TableNav({ baseId }: { baseId: string }) {
  const ctx = api.useUtils();
  const tables = GetTableList({ baseId });
  const path = usePathname();
  const [isTableAddOpen, setIsTableAddOpen] = useState(false);

  const { mutate: addTable } = api.table.addTable.useMutation({
    onMutate: async (newTable) => {
      await ctx.table.getTablesByBaseId.cancel({ baseId });

      const previousTables = ctx.table.getTablesByBaseId.getData({ baseId });

      ctx.table.getTablesByBaseId.setData({ baseId }, (old) => [
        ...(old ?? []),
        {
          ...newTable,
          id: uuidv4(),
          name: `Table ${previousTables ? previousTables.length + 1 : 1}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          columns: [],
          rows: [],
        },
      ]);

      return { previousTables };
    },
    onError: (err, newTable, context) => {
      if (context?.previousTables) {
        ctx.table.getTablesByBaseId.setData({ baseId }, context.previousTables);
      }
    },
    onSettled: () => {
      void ctx.table.getTablesByBaseId.invalidate({ baseId });
    },
  });

  return (
    <div>
      <div className="z-0 flex h-max w-full items-center justify-between gap-x-3 bg-[#D54402] text-xs font-normal text-white/90">
        <div className="border-[#C03D05 flex w-full items-center overflow-x-auto rounded-tr-md bg-[#C03D05] px-4">
          <div className="flex gap-x-2 overflow-x-scroll">
            {tables?.map((table, index) => (
              <Link
                href={`/base/${baseId}/table/${table.id}`}
                key={table.id}
                className={clsx(
                  "flex w-full flex-nowrap items-center gap-x-1 p-2",
                  {
                    "rounded-t-md border border-white bg-white text-black":
                      path.includes(table.id),
                  },
                )}
              >
                <div className="text-nowrap">{table.name}</div>
              </Link>
            ))}
          </div>
          <span className="p-2 font-thin text-gray-50/50">|</span>
          <ChevronDown strokeWidth={1.5} size={18}></ChevronDown>
          <span className="p-2 font-thin text-gray-50/50">|</span>
          <div className="">
            <div
              className="flex cursor-pointer items-center gap-x-3 text-nowrap p-2 hover:text-white"
              onClick={() => {
                setIsTableAddOpen(!isTableAddOpen);
                // addTable({ baseId });
              }}
            >
              {isTableAddOpen && (
                <AddTableDialog
                  baseId={baseId}
                  classList={"absolute top-[108px]"}
                ></AddTableDialog>
              )}
              <PlusIcon size={18} className=""></PlusIcon> Add or import
            </div>
          </div>
        </div>
        <div className="flex items-center gap-x-10 rounded-tl-md bg-[#C03D05] p-2">
          <span>Extensions</span>
          <span className="flex items-center gap-x-3">
            Tools <ChevronDown strokeWidth={1.5} size={18}></ChevronDown>
          </span>
        </div>
      </div>
    </div>
  );
}
