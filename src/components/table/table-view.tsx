"use client";
// ----------- import -----------
import { useMemo, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type ColumnDef,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import {
  Plus,
  LoaderIcon,
  CaseUpperIcon,
  HashIcon,
  ChevronDown,
} from "lucide-react";
import { api } from "@/trpc/react";
import { EditableCell } from "./editable-cell";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAppContext } from "../context";

export function TableView({ tableId }: { tableId: string }) {
  // ----------- useState -----------
  const { toast } = useToast();
  const {
    localColumns,
    setLocalColumns,
    localData,
    setLocalData,
    globalFilter,
    setGlobalFilter,
    recordCount,
    setRecordCount,
    rowHeight,
    sorting,
    setSorting,
  } = useAppContext();

  const { ref, inView } = useInView({});
  const { data: count } = api.table.getTableCount.useQuery({
    tableId,
  });

  // ----------- fetch data -----------
  const {
    data: tableData,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    status,
  } = api.table.getData.useInfiniteQuery(
    {
      tableId,
      pageSize: 18,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    },
  );

  // ----------- side effects -----------
  useEffect(() => {
    const allData = tableData?.pages.flatMap((page) => page.data) ?? [];
    setLocalColumns(tableData?.pages[0]?.columns ?? []);
    setLocalData(allData);
    setRecordCount(count ?? 0);
  }, [tableData, setLocalColumns, setLocalData, setRecordCount, count]);

  useEffect(() => {
    console.log("inView", inView);
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView]);

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
      enableSorting: true,
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
          <div>
            <ChevronDown size={16} strokeWidth={1.5} />
          </div>
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

  // ----------- add column handler -----------
  const handleAddRow = async () => {
    table.resetSorting();
    table.resetGlobalFilter();
    setRecordCount(recordCount + 1);
    await addRow.mutateAsync({ tableId });
  };

  // ----------- add column handler -----------
  const handleAddColumn = async ({ _type }: { _type: "text" | "number" }) => {
    table.resetSorting();
    await addColumn.mutateAsync({ tableId, type: _type });
  };

  // ----------- react-table -----------
  const table = useReactTable({
    data: localData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: (updaterOrValue) => {
      setSorting(updaterOrValue as SortingState);
    },
    onGlobalFilterChange: (newFilter) => {
      setGlobalFilter(typeof newFilter === "string" ? newFilter : "");
    },
  });

  // ----------- when loading -----------
  if (isLoading && status === "pending") {
    return (
      <div className="fixed top-0 flex h-svh w-screen items-center justify-center p-44">
        <LoaderIcon size={20} strokeWidth={1} className="animate-spin" />
      </div>
    );
  }

  // ------------ error block ------
  if (status === "error") {
    return (
      <div className="fixed top-0 flex h-svh w-screen items-center justify-center p-44 text-red-500">
        Error
      </div>
    );
  }

  // ----------- return -----------
  return (
    <div className="max-h-[90vh] max-w-[100vw] flex-grow overflow-auto">
      <table className="mb-20 w-max border-l">
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
              <button
                className="border-b border-r border-gray-300 bg-[#F5F5F5] px-10 py-2 text-xs"
                onClick={() => handleAddColumn({ _type: "text" })}
              >
                <Plus size={16} strokeWidth={1.5} />
              </button>
            </tr>
          ))}{" "}
        </thead>
        <tbody className="w-max">
          {table.getRowModel().rows.map((row, index) => (
            // data row
            <tr
              key={row?.id}
              style={{ height: `${rowHeight}rem` }}
              className={cn(
                "relative flex w-max items-center bg-white hover:bg-gray-100",
              )}
            >
              <div className="absolute left-2 text-xs text-gray-500">
                {index + 1}
              </div>
              {row?.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  style={{ width: cell.column.getSize() }}
                  className={cn(
                    "h-full w-max border-b border-r p-[2px] text-xs",
                    {
                      "border-yellow-500 bg-yellow-300 text-yellow-800 hover:bg-white":
                        globalFilter &&
                        String(cell.getValue()).includes(globalFilter),
                    },
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className="flex">
          {table.getFooterGroups().map((footerGroup) => (
            <button
              key={footerGroup.id}
              onClick={() => handleAddRow()}
              className="group flex w-max -translate-x-[1px] items-center border-r bg-white hover:bg-gray-100"
            >
              {footerGroup.headers.map((column, index) => (
                <td
                  key={column.id}
                  style={{ width: column.getSize() }}
                  className="h-full w-max border-b p-2 text-xs"
                >
                  {index === 0 && (
                    <Plus
                      size={20}
                      strokeWidth={1}
                      className="rounded-md p-1 group-hover:bg-gray-200"
                    />
                  )}
                  {index !== 0 && <div className=""></div>}
                </td>
              ))}
            </button>
          ))}
        </tfoot>
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
        <div
          ref={ref}
          className="mb-20 flex w-screen flex-col items-center justify-center p-2 text-xs text-gray-500"
        >
          <div> {isFetching ? "Loading..." : ""}</div>
          <div> {hasNextPage ? "" : " No more data"}</div>
        </div>
        <div className="fixed bottom-0 w-full border-t border-gray-300 bg-white p-2 text-xs text-gray-500">
          {isLoading ? "Loading..." : recordCount} records
        </div>
      </table>
    </div>
  );
}

export default TableView;
