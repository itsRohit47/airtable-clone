// Component code
"use client";
import { useState, useMemo, useEffect } from "react";
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
  LoaderCircleIcon,
  CaseUpperIcon,
  HashIcon,
  ArrowDownAZIcon,
  ArrowUpZAIcon,
  ArrowUpDown,
} from "lucide-react";
import { api } from "@/trpc/react";
import { EditableCell } from "./editable-cell";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAppContext } from "../context";

export function TableView({ tableId }: { tableId: string }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const { toast } = useToast();
  const ctx = api.useUtils();
  const {
    localColumns,
    setLocalColumns,
    localData,
    setLocalData,
    setRecordCount,
  } = useAppContext();

  // Fetch initial table data
  const { data: tableData, isLoading } = api.table.getData.useQuery({
    tableId,
  });

  useEffect(() => {
    // Initialize local data when tableData changes
    if (tableData) {
      setLocalColumns(tableData.columns);
      setLocalData(tableData.data);
    }
  }, [tableData]);

  // Column addition handler
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

  // Row addition handler
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

  const columns = useMemo<ColumnDef<Record<string, string | number>>[]>(() => {
    return localColumns.map((col) => ({
      id: col.id,
      accessorKey: col.id,
      size: 200,
      minSize: 200,
      header: ({ column }) => (
        <span className="flex items-center justify-between gap-x-2 overflow-hidden">
          <span>
            {col.type === "text" ? (
              <CaseUpperIcon size={14} strokeWidth={1.5} />
            ) : (
              <HashIcon size={12} strokeWidth={1.5} />
            )}
          </span>
          <span className="text-nowrap"> {col.name}</span>
          {column.getIsSorted() ? (
            column.getIsSorted() === "asc" ? (
              <ArrowDownAZIcon
                size={24}
                onClick={() => column.toggleSorting()}
                className="rounded-md p-1 hover:bg-gray-200/60"
                strokeWidth={1.5}
              ></ArrowDownAZIcon>
            ) : (
              <ArrowUpZAIcon
                size={24}
                strokeWidth={1.5}
                onClick={() => column.toggleSorting()}
                className="rounded-md p-1 hover:bg-gray-200/60"
              ></ArrowUpZAIcon>
            )
          ) : (
            <ArrowUpDown
              size={24}
              strokeWidth={1.5}
              onClick={() => column.toggleSorting()}
              className="rounded-md p-1 hover:bg-gray-200/60"
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

  const table = useReactTable({
    data: localData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
    meta: {
      addRow: addRow.mutate,
      addColumn: addColumn.mutate,
    },
  });

  useEffect(() => {
    setRecordCount(table.getRowModel().rows.length);
  }, [table.getRowModel().rows.length]);

  const handleAddRow = async () => {
    table.resetSorting();
    await addRow.mutateAsync({ tableId });
  };

  const handleAddColumn = async ({ _type }: { _type: "text" | "number" }) => {
    table.resetSorting();
    await addColumn.mutateAsync({ tableId, type: _type });
  };

  if (isLoading) {
    return (
      <div className="fixed top-0 flex h-svh w-screen items-center justify-center p-44">
        <LoaderCircleIcon
          size={32}
          strokeWidth={1.5}
          className="animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div>
        {table.getHeaderGroups().map((headerGroup) => (
          <div
            key={headerGroup.id}
            className={cn("flex items-center border-b border-gray-300")}
          >
            {headerGroup.headers.map((header) => (
              <div
                key={header.id}
                style={{ width: header.getSize() }}
                className={`relative border-x bg-[#F5F5F5] p-2 text-xs`}
              >
                {typeof header.column.columnDef.header === "function"
                  ? header.column.columnDef.header(header.getContext())
                  : header.column.columnDef.header}

                <div
                  onMouseDown={header.getResizeHandler()}
                  onTouchStart={header.getResizeHandler()}
                  className={`absolute -right-0 top-2 z-20 h-5 w-[3px] translate-x-[2px] cursor-col-resize rounded-md bg-blue-500 opacity-0 hover:opacity-100 ${
                    header.column.getIsResizing()
                      ? "h-5 w-5 bg-blue-500 opacity-100"
                      : ""
                  }`}
                />
              </div>
            ))}
            <button
              className="flex items-center border-r border-gray-300 p-2 hover:bg-gray-100"
              onClick={() => handleAddColumn({ _type: "text" })}
            >
              <CaseUpperIcon size={24} strokeWidth={1} />
            </button>
            <button
              className="flex items-center border-r border-gray-300 p-2 hover:bg-gray-100"
              onClick={() => handleAddColumn({ _type: "number" })}
            >
              <HashIcon size={24} strokeWidth={1} />
            </button>
          </div>
        ))}
      </div>
      <div className="max-h-[80vh] overflow-auto">
        <div className="mb-96">
          {table.getRowModel().rows.map((row) => (
            <div key={row.id} className="flex">
              {row.getVisibleCells().map((cell) => (
                <div
                  key={cell.id}
                  style={{ width: cell.column.getSize() }}
                  className="w-max border-b border-r border-gray-300 text-xs"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          ))}
          <button
            onClick={handleAddRow}
            style={{ width: "200px" }}
            className="flex items-center justify-center border-x border-b border-gray-300 bg-white px-6 py-2 hover:bg-gray-100/60"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      <div className="fixed bottom-10 left-3 flex items-center">
        <button
          onClick={handleAddRow}
          className="flex items-center justify-center rounded-l-full border bg-white p-2 hover:bg-gray-100"
        >
          <Plus size={16} className=""></Plus>
        </button>
        <span className="rounded-r-full border bg-white p-2 text-xs">
          Add...
        </span>
      </div>
    </div>
  );
}
