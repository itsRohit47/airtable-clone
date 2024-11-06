"use client";
// ----------- import -----------
import { useState, useMemo, useEffect, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from "@tanstack/react-table";
import {
  Plus,
  LoaderIcon,
  CaseUpperIcon,
  HashIcon,
  ArrowDownAZIcon,
  ArrowUpZAIcon,
  ArrowUpDown,
} from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { api } from "@/trpc/react";
import { EditableCell } from "./editable-cell";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAppContext } from "../context";

export function TableView({ tableId }: { tableId: string }) {
  // ----------- useState -----------
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const { toast } = useToast();
  const {
    localColumns,
    setLocalColumns,
    localData,
    setLocalData,
    setRecordCount,
    recordCount,
  } = useAppContext();

  // ----------- fetch data -----------
  const { data: tableData, isLoading } = api.table.getData.useQuery({
    tableId,
  });

  // ----------- side effects -----------
  useEffect(() => {
    setLocalColumns(tableData?.columns ?? []);
    setLocalData(tableData?.data ?? []);
    setRecordCount(tableData?.data?.length ?? 0);
  }, [tableData, setLocalData, setLocalColumns]);
  // ----------- add column mutation -----------
  const addColumn = api.table.addField.useMutation({
    onMutate: async ({ type }) => {
      const newColumn = {
        id: "temp-id",
        name: "Untitled Column",
        type,
        tableId,
        order: localColumns.length,
        defaultValue: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setLocalColumns((prev) => [...prev, newColumn]);
    },
    onSuccess: (data) => {
      // Update the temporary column ID to the real ID returned from the backend
      setLocalColumns((prev) =>
        prev.map((col) =>
          col.id === "temp-id" ? { ...col, id: data.id } : col,
        ),
      );
    },
    onError: (_error) => {
      toast({
        title: "Error",
        description: "Failed to add column",
        variant: "destructive",
      });
    },
  });

  // ----------- add row mutation -----------
  const addRow = api.table.addRow.useMutation({
    onMutate: async () => {
      const newRow: Record<string, string> = { id: "temp-id" };
      setLocalData((prev) => [...prev, { ...newRow }]);
    },
    onSuccess: (data) => {
      setLocalData((prev) =>
        prev.map((row) =>
          row.id === "temp-id" ? { ...row, id: data.id } : row,
        ),
      );
    },
    onError: (_error) => {
      toast({
        title: "Error",
        description: "Failed to add row",
        variant: "destructive",
      });
    },
  });

  // ----------- columns -----------
  const columns = useMemo<ColumnDef<Record<string, string | number>>[]>(() => {
    return localColumns.map((col) => ({
      id: col.id,
      accessorKey: col.id,
      size: 200,
      minSize: 200,
      header: ({ column }) => (
        <span className="flex items-center justify-between gap-x-2 overflow-hidden">
          <div className="flex items-center gap-x-2">
            <span>
              {col.type === "text" ? (
                <CaseUpperIcon size={16} strokeWidth={1.5} />
              ) : (
                <HashIcon size={14} strokeWidth={1.5} />
              )}
            </span>
            <span className="text-nowrap"> {col.name}</span>
          </div>
          {column.getIsSorted() ? (
            column.getIsSorted() === "asc" ? (
              <ArrowDownAZIcon
                size={20}
                onClick={() => column.toggleSorting()}
                className="cursor-pointer rounded-md p-1 hover:bg-gray-200/60"
                strokeWidth={1.5}
              ></ArrowDownAZIcon>
            ) : (
              <ArrowUpZAIcon
                size={20}
                strokeWidth={1.5}
                onClick={() => column.toggleSorting()}
                className="cursor-pointer rounded-md p-1 hover:bg-gray-200/60"
              ></ArrowUpZAIcon>
            )
          ) : (
            <ArrowUpDown
              size={20}
              strokeWidth={1.5}
              onClick={() => column.toggleSorting()}
              className="cursor-pointer rounded-md p-1 hover:bg-gray-200/60"
            ></ArrowUpDown>
          )}
        </span>
      ),
      cell: ({ row, getValue }) => (
        <EditableCell
          rowId={String(row.original.id ?? "")}
          columnId={col.id}
          type={col.type as "text" | "number"}
          value={String(getValue() ?? "")}
        />
      ),
    }));
  }, [localColumns]);

  // ----------- react-table -----------
  const table = useReactTable({
    data: localData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
    state: {
      globalFilter,
      sorting,
    },
  });

  // ----------- add column handler -----------
  const handleAddRow = async () => {
    table.resetSorting();
    setRecordCount(recordCount + 1);
    await addRow.mutateAsync({ tableId });
  };

  // ----------- add column handler -----------
  const handleAddColumn = async ({ _type }: { _type: "text" | "number" }) => {
    table.resetSorting();
    await addColumn.mutateAsync({ tableId, type: _type });
  };

  // ----------- when loading -----------
  if (isLoading) {
    return (
      <div className="fixed top-0 flex h-svh w-screen items-center justify-center p-44">
        <LoaderIcon size={20} strokeWidth={1} className="animate-spin" />
      </div>
    );
  }

  // ----------- return -----------
  return (
    <main className="max-h-[90vh] max-w-[100vw] flex-grow overflow-auto">
      <table className="w-max border-l">
        <thead className="sticky top-0 z-10 flex">
          {table.getHeaderGroups().map((headerGroup) => (
            // ----------- header row -----------
            <tr key={headerGroup.id} className={cn("flex w-max items-center")}>
              {headerGroup.headers.map((header) => (
                <td
                  key={header.id}
                  style={{ width: header.getSize() }}
                  className={`relative border-b border-r border-gray-300 bg-[#F5F5F5] p-2 text-xs`}
                >
                  {typeof header.column.columnDef.header === "function"
                    ? header.column.columnDef.header(header.getContext())
                    : header.column.columnDef.header}

                  {/* ----------- add column button ----------- */}
                  <div
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    className={`absolute -right-0 top-2 z-20 h-5 w-[3px] translate-x-[2px] cursor-col-resize rounded-md bg-blue-500 opacity-0 hover:opacity-100 ${
                      header.column.getIsResizing()
                        ? "h-5 w-5 bg-blue-500 opacity-100"
                        : ""
                    }`}
                  />
                </td>
              ))}
            </tr>
          ))}{" "}
          <button
            className="border-b border-r border-gray-300 bg-[#F5F5F5] px-10 mr-28 text-xs"
            onClick={() => handleAddColumn({ _type: "text" })}
          >
            <Plus size={16} strokeWidth={1} />
          </button>
        </thead>
        <tbody className="">
          {table.getRowModel().rows.map((row, index) => (
            // data row
            <tr
              key={row.id}
              className={cn(
                "relative flex w-max items-center hover:bg-gray-100",
              )}
            >
              <div className="absolute text-xs text-gray-500 left-2">{index}</div>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  style={{ width: cell.column.getSize() }}
                  className="w-max border-b border-r p-[2px] text-xs"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className="mb-44 flex">
          {table.getFooterGroups().map((footerGroup) => (
            <button
              key={footerGroup.id}
              onClick={() => handleAddRow()}
              className="flex h-8 w-max -translate-x-[1px] items-center border-r hover:bg-gray-100"
            >
              {footerGroup.headers.map((column, index) => (
                <td
                  key={column.id}
                  style={{ width: column.getSize() }}
                  className="h-full w-max border-b p-2 text-xs"
                >
                  {index === 0 && <Plus size={16} strokeWidth={1} />}
                  {index !== 0 && <div className=""></div>}
                </td>
              ))}
            </button>
          ))}
        </tfoot>
      </table>
    </main>
  );
}
