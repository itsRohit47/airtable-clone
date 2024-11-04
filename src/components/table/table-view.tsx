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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, LoaderCircleIcon, CaseUpperIcon, HashIcon } from "lucide-react";
import { api } from "@/trpc/react";
import { EditableCell } from "./editable-cell";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAppContext } from "../context";

export function TableView({ tableId }: { tableId: string }) {
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
    onMutate: async (_variables) => {
      await ctx.table.getData.cancel({ tableId });
      const previousTableData = ctx.table.getData.getData({ tableId });

      ctx.table.getData.setData({ tableId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          columns: [
            ...old.columns,
            {
              id: "temp-id",
              name: "Untitled Column",
              type: _variables.type,
              tableId: tableId,
              order: old.columns.length,
              defaultValue: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
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
        description: "Failed to add column",
        variant: "destructive",
      });
    },
    onSettled: () => {
      void ctx.table.getData.invalidate({ tableId });
    },
  });

  // Add row mutation
  const addRow = api.table.addRow.useMutation({
    onMutate: async () => {
      await ctx.table.getData.cancel({ tableId });
      const previousTableData = ctx.table.getData.getData({ tableId });

      const newRowData: Record<string, string | number> = {};
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

  const columns = useMemo<ColumnDef<Record<string, string | number>>[]>(() => {
    if (!tableData?.columns) return [];

    return tableData.columns.map((col) => ({
      id: col.id,
      accessorKey: col.id,
      size: 150,
      minSize: 150,
      header: () => (
        <span className="flex items-center gap-x-2 overflow-hidden">
          <span>
            {col.type === "text" ? (
              <CaseUpperIcon size={14} strokeWidth={1.5}></CaseUpperIcon>
            ) : (
              <HashIcon size={12} strokeWidth={1.5}></HashIcon>
            )}
          </span>
          <span className="text-nowrap"> {col.name}</span>
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
  }, [tableData?.columns]);

  const table = useReactTable({
    data: tableData?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
  });

  useEffect(() => {
    setRecordCount(table.getRowModel().rows.length);
    console.log(tableData?.rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.getRowModel().rows.length, setRecordCount]);

  const handleAddRow = async () => {
    await addRow.mutateAsync({ tableId });
  };

  const handleAddColumn = async ({ _type }: { _type: "text" | "number" }) => {
    await addColumn.mutateAsync({ tableId, type: _type });
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
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center border-r bg-[#F5F5F5] px-6 py-2 hover:bg-gray-200/60">
                <Plus size={16} className=""></Plus>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="flex flex-col gap-y-3 text-xs">
                <button
                  className="p-2 hover:bg-gray-100"
                  onClick={() => handleAddColumn({ _type: "text" })}
                >
                  <CaseUpperIcon></CaseUpperIcon>
                </button>
                <button
                  className="p-2 hover:bg-gray-100"
                  onClick={() => handleAddColumn({ _type: "number" })}
                >
                  <HashIcon></HashIcon>
                </button>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
      <div className="">
        <div>
          {table.getRowModel().rows.map((row) => (
            <div key={row.id}>
              <div key={row.id} className="flex">
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    style={{ width: cell.column.getSize() }}
                    className="w-max border-b border-r text-xs"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={handleAddRow}
            style={{ width: "150px" }}
            className="flex items-center justify-center border-x border-b bg-white px-6 py-2 hover:bg-gray-100/60"
          >
            <Plus size={16} className=""></Plus>
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
