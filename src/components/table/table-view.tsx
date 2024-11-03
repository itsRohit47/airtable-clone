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
      header: ({ column }) => {
        return (
          <div className="flex w-max items-center justify-between">
            <span className="text-xs font-normal">{col.name}</span>
          </div>
        );
      },
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
          column={{
            id: "",
            name: "",
          }}
          row={{
            id: "",
          }}
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
  }, [table.getRowModel().rows.length]);

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
      <div className="fixed top-0 flex h-svh w-screen items-center justify-center border p-44">
        <LoaderCircleIcon
          size={32}
          strokeWidth={1.5}
          className="animate-spin"
        ></LoaderCircleIcon>
      </div>
    );

  return (
    <div className="h-full">
      <table className="relative">
        <thead className="">
          <tr className="">
            {table.getFlatHeaders().map((header) => (
              <th
                key={header.id}
                className={cn(
                  "border-x border-b border-gray-300 bg-[#F5F5F5] p-2",
                  header.column.getCanSort() && "cursor-pointer select-none",
                )}
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="overflow-scroll">
          {table.getRowModel().rows.map((row, index) => (
            <tr key={row.id} className="">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border-x border-b border-gray-300">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className="flex w-full">
          {" "}
          <div
            className="w-full cursor-pointer border-b border-r border-gray-300 bg-white p-2 text-xs text-gray-500"
            onClick={handleAddRow}
          >
            <Plus size={16} strokeWidth={1.5}></Plus>
          </div>{" "}
        </tfoot>
      </table>
    </div>
  );
}
