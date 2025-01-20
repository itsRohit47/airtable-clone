"use client";
import { ChevronDown, PlusIcon } from "lucide-react";
import clsx from "clsx";
import { api } from "@/trpc/react";
import { GetTableList } from "@/lib/actions/table";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import AddTableDialog from "./add-table-dialog";
import TableNameEdit from "./table-name-edit";

export default function TableNav({
  baseId,
  viewId,
}: {
  baseId: string;
  viewId: string;
}) {
  const { data: tables } = api.table.getTablesByBaseId.useQuery({ baseId });
  const [isTableAddOpen, setIsTableAddOpen] = useState(false);
  const [editName, setEditName] = useState<string | null>(null); // Change state to store table ID
  const [isEditing, setIsEditing] = useState(false);
  const pathname = usePathname();

  return (
    <div>
      <div className="z-0 flex h-max w-full items-center justify-between gap-x-3 bg-[#176EE1] text-xs font-normal text-white/90">
        <div className="border-[#C03D05] flex w-full items-center overflow-x-auto rounded-tr-md bg-[#1662CA] px-4">
          <div className="flex gap-x-2 overflow-x-scroll transition-all duration-100 ">
            {tables?.map((table) => (
              <div className="transition-all duration-100" key={table.id}>
                <Link
                  href={`/${baseId}/${table.id}/${table.views[0]?.id}`}
                  key={table.id}
                  onClick={() => {
                    if (pathname === `/${baseId}/${table.id}/${viewId}`) {
                      setEditName(table.id); // Set the table ID to edit
                      setIsEditing(!isEditing);
                    }
                  }}
                  className={clsx(
                    "flex w-full flex-nowrap items-center gap-x-1 p-2 transition-all duration-100 relative",
                    {
                      "rounded-t-md border border-white bg-white text-black":
                        pathname === `/${baseId}/${table.id}/${viewId}`,
                    },
                  )}
                >
                  <div className="text-nowrap">{table.name}</div>
                  {pathname === `/${baseId}/${table.id}/${viewId}` && (
                    <ChevronDown strokeWidth={1.5} size={12}></ChevronDown>
                  )}
                </Link>
                {editName === table.id && isEditing && (
                  <TableNameEdit
                    tableId={table.id}
                    tableName={table.name}
                    baseId={baseId}
                    onCanceled={() => {
                      setEditName(null); // Reset editName state
                    }}
                  ></TableNameEdit>
                )}
              </div>
            ))}
            {!tables && (
              <div className="flex items-center gap-x-3 p-2">
                <div className="animate-pulse bg-gray-400 h-4 w-10 rounded-md"></div>
                <div className="animate-pulse bg-gray-400 h-4 w-10 rounded-md"></div>
                <div className="animate-pulse bg-gray-400 h-4 w-10 rounded-md"></div>
                <div className="animate-pulse bg-gray-400 h-4 w-10 rounded-md"></div>
                <div className="animate-pulse bg-gray-400 h-4 w-10 rounded-md"></div>
                <div className="animate-pulse bg-gray-400 h-4 w-10 rounded-md"></div>
              </div>
            )}
          </div>
          <span className="p-2 font-thin text-gray-50/50">|</span>
          <ChevronDown strokeWidth={1.5} size={18}></ChevronDown>
          <span className="p-2 font-thin text-gray-50/50">|</span>
          <div className="">
            <div
              className="flex cursor-pointer items-center gap-x-3 text-nowrap p-2 hover:text-white"
              onClick={() => {
                setIsTableAddOpen(!isTableAddOpen);
              }}
            >
              {isTableAddOpen && (
                <AddTableDialog
                  viewId={viewId}
                  baseId={baseId}
                  classList={"absolute top-[100px]  z-20"}
                ></AddTableDialog>
              )}
              <PlusIcon size={18} className=""></PlusIcon> Add or import
            </div>
          </div>
        </div>
        <div className="flex items-center gap-x-10 rounded-tl-md bg-[#1662CA] p-2">
          <span>Extensions</span>
          <span className="flex items-center gap-x-3">
            Tools <ChevronDown strokeWidth={1.5} size={18}></ChevronDown>
          </span>
        </div>
      </div>
    </div >
  );
}
