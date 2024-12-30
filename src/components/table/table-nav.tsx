"use client";
import { ChevronDown, PlusIcon } from "lucide-react";
import clsx from "clsx";
import { api } from "@/trpc/react";
import { GetTableList } from "@/lib/actions/table";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import AddTableDialog from "./add-table-dialog";
import { useAppContext } from "../context";
import TableNameEdit from "./table-name-edit";

export default function TableNav({
  baseId,
  viewId,
}: {
  baseId: string;
  viewId: string;
}) {
  const ctx = api.useUtils();
  const tables = GetTableList({ baseId });
  const path = usePathname();
  const [isTableAddOpen, setIsTableAddOpen] = useState(false);
  const {
    thisTable,
    setThisTable,
    localTables,
    setLocalTables,
    editName,
    setEditName,
  } = useAppContext();

  useEffect(() => {
    if (tables) {
      setLocalTables(tables);
    }
  }, [setLocalTables, tables]);

  return (
    <div>
      <div className="z-0 flex h-max w-full items-center justify-between gap-x-3 bg-gray-500 text-xs font-normal text-white/90">
        <div className="border-[#C03D05 flex w-full items-center overflow-x-auto rounded-tr-md bg-gray-600 px-4">
          <div className="flex gap-x-2 overflow-x-scroll">
            {localTables.length > 0 &&
              localTables.map((table) => (
                <div className="" key={table.id}>
                  {table.baseId === baseId &&
                    (localTables.indexOf(table) === localTables.length - 1 ? (
                      <Link
                        href={`/${baseId}/${table.id}/${viewId}`}
                        key={table.id}
                        onClick={async () => {
                          setEditName(false);
                          setThisTable(table.id);
                          await ctx.table.getData.invalidate();
                        }}
                        className={clsx(
                          "flex w-full flex-nowrap items-center gap-x-1 p-2",
                          {
                            "rounded-t-md border border-white bg-white text-black":
                              table.id === thisTable || path.includes(table.id),
                          },
                        )}
                      >
                        <div className="text-nowrap">{table.name}</div>
                        {editName && (
                          <div className="absolute top-[100px] z-20 -translate-x-10">
                            <TableNameEdit
                              tableName={table.name}
                              tableId={table.id}
                            ></TableNameEdit>
                          </div>
                        )}
                      </Link>
                    ) : (
                      <Link
                        href={`/${baseId}/${table.id}/${viewId}`}
                        key={table.id}
                        onClick={() => {
                          setEditName(false);
                          setThisTable(table.id);
                        }}
                        className={clsx(
                          "flex w-full flex-nowrap items-center gap-x-1 p-2",
                          {
                            "rounded-t-md border border-white bg-white text-black":
                              table.id === thisTable || path.includes(table.id),
                          },
                        )}
                      >
                        <div className="text-nowrap">{table.name}</div>
                      </Link>
                    ))}
                </div>
              ))}
            {localTables.length === 0 && (
              <div className="flex items-center gap-x-3 p-2">
                <div className="animate-pulse bg-gray-400 h-4 w-10 rounded-md"></div>
                <div className="animate-pulse bg-gray-400 h-4 w-10 rounded-md"></div>
                <div className="animate-pulse bg-gray-400 h-4 w-10 rounded-md"></div>
                <div className="animate-pulse bg-gray-400 h-4 w-10 rounded-md"></div>
                <div className="animate-pulse bg-gray-400 h-4 w-10 rounded-md"></div>
                <div className="animate-pulse bg-gray-400 h-4 w-10 rounded-md"></div>

              </div>
            )
            }
          </div>
          <span className="p-2 font-thin text-gray-50/50">|</span>
          <ChevronDown strokeWidth={1.5} size={18}></ChevronDown>
          <span className="p-2 font-thin text-gray-50/50">|</span>
          <div className="">
            <div
              className="flex cursor-pointer items-center gap-x-3 text-nowrap p-2 hover:text-white"
              onClick={() => {
                setIsTableAddOpen(!isTableAddOpen);
                setEditName(false);
              }}
            >
              {isTableAddOpen && (
                <AddTableDialog
                  baseId={baseId}
                  classList={"absolute top-[100px]  z-20"}
                ></AddTableDialog>
              )}
              <PlusIcon size={18} className=""></PlusIcon> Add or import
            </div>
          </div>
        </div>
        <div className="flex items-center gap-x-10 rounded-tl-md bg-gray-600 p-2">
          <span>Extensions</span>
          <span className="flex items-center gap-x-3">
            Tools <ChevronDown strokeWidth={1.5} size={18}></ChevronDown>
          </span>
        </div>
      </div>
    </div>
  );
}
