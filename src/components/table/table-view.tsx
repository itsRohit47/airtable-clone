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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/trpc/react";
import { EditableCell } from "./editable-cell";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TableViewProps {
  tableId: string;
}

export function TableView({ tableId }: TableViewProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
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
          <div className="flex items-center justify-between">
            <span>{col.name}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                  Asc
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                  Desc
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
        pageSize: 2,
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search all columns..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleAddRow}>
          <Plus className="mr-2 h-4 w-4" />
          Add Row
        </Button>
        <Button onClick={handleAddColumn}>
          <Plus className="mr-2 h-4 w-4" />
          Add Column
        </Button>
      </div>

      <ScrollArea className="h-max rounded-md border">
        <table className="w-full">
          <thead className="sticky top-0 border-b bg-background">
            <tr>
              {table.getFlatHeaders().map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    "p-2 text-left",
                    header.column.getCanSort() && "cursor-pointer select-none",
                  )}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                <td className="p-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteRow(String(row.original.id))}
                  >
                    Delete {row.original.id}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
      </div>
    </div>
  );
}
