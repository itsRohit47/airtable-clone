"use client";
import { useState, useMemo } from "react";
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
import { Plus, ArrowUpDown } from "lucide-react";
import { api } from "@/trpc/react";
import { EditableCell } from "./editable-cell";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAppContext } from "../context";
import { ScrollArea } from "../ui/scroll-area";

interface TableViewProps {
  tableId: string;
}

export function TableView({ tableId }: TableViewProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const { toast } = useToast();
  const ctx = api.useUtils();
  const { rowCounter, setRowCounter } = useAppContext();

  // Get table data
  const {
    data: tableData,
    isLoading,
    isSuccess,
  } = api.table.getData.useQuery({
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
    onSuccess: () => {
      void ctx.table.getData.invalidate({ tableId });
      toast({
        title: "Success",
        description: "Row added successfully",
      });
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

  // autosave cell mutation
  const autoSave = api.table.updateCell.useMutation({
    onSuccess: () => {
      void ctx.table.getData.invalidate({ tableId });
      toast({
        title: "Success",
        description: "Cell updated successfully",
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

  const handleAddRow = async () => {
    await addRow.mutateAsync({ tableId });
  };

  const handleDeleteRow = async (rowId: string) => {
    await deleteRow.mutateAsync({ tableId, rowId });
  };

  const handleAddColumn = async () => {
    await addColumn.mutateAsync({ tableId });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="fixed mt-16 h-full translate-y-[4px]">
      <table className="relative">
        <thead className="">
          <tr className="">
            {table.getFlatHeaders().map((header) => (
              <th
                key={header.id}
                className={cn(
                  "border bg-[#F5F5F5] p-2",
                  header.column.getCanSort() && "cursor-pointer select-none",
                )}
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </th>
            ))}
            <div
              className="w-full cursor-pointer bg-white px-10 border-r border-b border-t py-2 text-xs text-gray-500"
              onClick={handleAddColumn}
            >
              <Plus size={16} strokeWidth={1.5}></Plus>
            </div>
          </tr>
        </thead>

        <tbody className="overflow-scroll">
          {table.getRowModel().rows.map((row, index) => (
            <tr key={row.id} className="">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border-x border-b border-gray-100">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className="flex w-full">
          {" "}
          <div
            className="w-full cursor-pointer bg-white p-2 text-xs text-gray-500"
            onClick={handleAddRow}
          >
            <Plus size={16} strokeWidth={1.5}></Plus>
          </div>{" "}
        </tfoot>
      </table>
      <div className="w-screen border p-2 text-xs text-gray-500">
        {table.getRowCount()} records
      </div>
    </div>
  );
}
