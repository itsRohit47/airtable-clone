"use client";
import { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from "@tanstack/react-table";
import { Plus, LoaderCircleIcon } from "lucide-react";
import { api } from "@/trpc/react";
import { EditableCell } from "./editable-cell";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAppContext } from "../context";

interface TableViewProps {
  tableId: string;
}

export function TableView({ tableId }: TableViewProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const { setRecordCount } = useAppContext();
  const { toast } = useToast();
  const ctx = api.useUtils();

  // Get table data
  const { data: tableData, isLoading } = api.table.getData.useQuery({
    tableId,
  });

  // add column mutation
  const addColumn = api.table.addField.useMutation({
    onSuccess: () => {
      void ctx.table.getData.invalidate({ tableId });
      toast({
        title: "Success",
        description: "Column added successfully",
      });
    },
  });

  // Add row mutation
  const addRow = api.table.addRow.useMutation({
    onMutate: async () => {
      await ctx.table.getData.cancel({ tableId });
      const previousTableData = ctx.table.getData.getData({ tableId });

      const newRowData: Record<string, string | number> = {}; // Define newRowData appropriately
      ctx.table.getData.setData({ tableId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: [...old.data, { id: "temp-id", ...newRowData }],
        };
      });

      return { previousTableData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTableData) {
        ctx.table.getData.setData({ tableId }, context.previousTableData);
      }
      toast({
        title: "Error",
        description: "Failed to add row",
        variant: "destructive",
      });
    },
    onSettled: () => {
      void ctx.table.getData.invalidate({ tableId });
    },
  });

  // Delete row mutation
  const deleteRow = api.table.deleteRow.useMutation({
    onSuccess: () => {
      void ctx.table.getData.invalidate({ tableId });
      toast({
        title: "Success",
        description: "Row deleted successfully",
      });
    },
  });

  const autoSave = api.table.updateCell.useMutation({
    onMutate: async ({ rowId, columnId, value }) => {
      // Cancel any outgoing refetches
      await ctx.table.getData.cancel({ tableId });
      const previousData = ctx.table.getData.getData({ tableId });

      // Update immediately in the UI
      ctx.table.getData.setData({ tableId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((row) => {
            if (row.id === rowId) {
              return { ...row, [columnId]: value };
            }
            return row;
          }),
        };
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      // On error, revert back to the previous state
      if (context?.previousData) {
        ctx.table.getData.setData({ tableId }, context.previousData);
      }
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    },
  });

  const columns = useMemo<ColumnDef<Record<string, string | number>>[]>(() => {
    if (!tableData?.columns) return [];

    return tableData.columns.map((col) => ({
      id: col.id,
      accessorKey: col.id,
      size: 100,
      minSize: 100,
      header: col.name,
      cell: ({ row, getValue }) => (
        <EditableCell
          value={getValue() as string}
          onSave={async (value) => {
            await autoSave.mutateAsync({
              rowId: String(row.original.id),
              columnId: col.id,
              value,
            });
          }}
          type={col.type as "number" | "text"}
        />
      ),
    }));
  }, [autoSave, tableData?.columns]);

  const table = useReactTable({
    data: tableData?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: "onChange",
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  });

  useEffect(() => {
    setRecordCount(table.getRowModel().rows.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.getRowModel().rows.length, setRecordCount]);

  const handleAddRow = async () => {
    await addRow.mutateAsync({ tableId });
  };

  const handleDeleteRow = async (rowId: string) => {
    await deleteRow.mutateAsync({ tableId, rowId });
  };

  const handleAddColumn = async () => {
    await addColumn.mutateAsync({ tableId });
  };

  if (isLoading)
    return (
      <div className="fixed top-0 flex h-svh w-screen items-center justify-center p-44">
        <LoaderCircleIcon
          size={32}
          strokeWidth={1.5}
          className="animate-spin"
        ></LoaderCircleIcon>
      </div>
    );

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
                ></div>
              </div>
            ))}
            <button
              onClick={handleAddColumn}
              className="flex items-center justify-center border bg-white p-2 hover:bg-gray-100"
            >
              <Plus size={16} className=""></Plus>
            </button>
          </div>
        ))}
      </div>
      <div className="h-96">
        {table.getRowModel().rows.map((row) => (
          <div key={row.id} className="flex">
            {row.getVisibleCells().map((cell) => (
              <div
                key={cell.id}
                style={{ width: cell.column.getSize() }}
                className="w-max border-x border-b border-gray-300"
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ))}
          </div>
        ))}
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
