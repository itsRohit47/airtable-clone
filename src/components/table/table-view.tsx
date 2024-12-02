/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";
// ----------- import -----------
import { useMemo, useEffect, useState, useRef, useCallback } from "react";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type ColumnDef,
  flexRender,
  type filterFns,
  type ColumnFiltersState,
  FilterFn,
} from "@tanstack/react-table";

import {
  Plus,
  LoaderIcon,
  HashIcon,
  EditIcon,
  SaveIcon,
  CaseUpperIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { api } from "@/trpc/react";
import { EditableCell } from "./editable-cell";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAppContext } from "../context";
import { useVirtualizer } from "@tanstack/react-virtual";

export function TableView({
  tableId,
  viewId,
}: {
  tableId: string;
  viewId: string;
}) {
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
    setLoading,
    selectedView,
    setSelectedView,
    columnFilters,
    setColumnFilters,
    rowSelection,
    setRowSelection,
    columnVisibility,
    setColumnVisibility,
  } = useAppContext();
  const [isColNameEditing, setIsColNameEditing] = useState(false);
  const [editColId, setEditColId] = useState("");
  const { data: count } = api.table.getTableCount.useQuery({
    tableId,
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // ----------- fetch data -----------
  const {
    data: tableData,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    status,
  } = api.table.getData.useInfiniteQuery(
    {
      tableId,
      pageSize: 200,
      search: globalFilter,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    },
  );

  // Fetch view sorts
  const { data: viewSorts } = api.table.getViewSorts.useQuery({
    viewId: viewId,
  });


  // Effect to apply view sorts when view changes
  useEffect(() => {
    setSorting(
      viewSorts?.map((sort) => ({ id: sort.columnId, desc: sort.desc })) ?? [],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewSorts]);

  // Update useEffect to handle filters when view changes
  const { data: viewFilters } = api.table.getViewFilters.useQuery({
    viewId: viewId,
  });

  useEffect(() => {
    setColumnFilters(
      viewFilters?.map((filter) => ({
        id: filter.columnId,
        value: filter.value ?? "",
      })) ?? [],
    );
  }, [viewFilters, setColumnFilters]);

  // to update column name
  const { mutate: updateColName } = api.table.updateColumnName.useMutation({
    onMutate: async ({ columnId, name }) => {
      await ctx.table.getData.cancel();
      const previousColumns = localColumns;
      setLocalColumns((prev) =>
        prev.map((c) => (c.id === columnId ? { ...c, name } : c)),
      );
      return { previousColumns };
    },
    onError: (error, { columnId, name }, context) => {
      toast({
        title: "Error",
        description: "Failed to update column name",
        variant: "destructive",
      });
      if (context?.previousColumns) {
        setLocalColumns(context.previousColumns);
      }
    },
    onSettled: () => {
      void ctx.table.getData.invalidate();
    },
  });

  // to get view by id
  const { data: view } = api.table.getViewById.useQuery({
    viewId: viewId,
  });

  // ----------- side effects -----------
  useEffect(() => {
    const allData = tableData?.pages.flatMap((page) => page.data) ?? [];
    setLocalColumns(tableData?.pages[0]?.columns ?? []);
    setLocalData(allData);
    setRecordCount(count ?? 0);
    setSelectedView(view ?? null);
  }, [
    tableData,
    setLocalColumns,
    setLocalData,
    setRecordCount,
    count,
    sorting,
    selectedView?.id,
    view,
    setSelectedView,
  ]);

  const ctx = api.useUtils();

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
      setRecordCount(localData.length + 1);
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
      enableFilters: true,
      options: {
        enableColumnFilter: true,
        enableFilters: true,
      },
      filterFn: viewFilters?.find((filter) => filter.columnId === col.id)
        ?.operator as keyof typeof filterFns,
      header: ({ column }) => (
        <span className="flex w-full items-center justify-between gap-x-2 overflow-hidden">
          <div className="flex items-center gap-x-2">
            <span>
              {col.type === "text" ? (
                <CaseUpperIcon size={16} strokeWidth={1.5} />
              ) : (
                <HashIcon size={14} strokeWidth={1.5} />
              )}
            </span>
            <div className="w-max px-2">
              {isColNameEditing && editColId === col.id ? (
                <input
                  type="text"
                  defaultValue={col.name}
                  className={`w-max max-w-24 overflow-auto bg-transparent focus:outline-none focus:ring-0 ${isColNameEditing ? "text-red-500" : ""
                    }`}
                  autoFocus
                  onFocus={(e) => e.target.select()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setLoading(true);
                      updateColName({
                        columnId: col.id,
                        name: (e.target as HTMLInputElement).value,
                      });
                      setIsColNameEditing(false);
                    }
                    if (e.key === "Escape") {
                      setIsColNameEditing(false);
                    }
                  }}
                  onChange={(e) => {
                    setLoading(true);
                    updateColName({ columnId: col.id, name: e.target.value });
                    setLocalColumns((prev) =>
                      prev.map((c) =>
                        c.id === col.id ? { ...c, name: e.target.value } : c,
                      ),
                    );
                  }}
                  onBlur={() => {
                    setIsColNameEditing(false);
                    setLoading(false);
                  }}
                />
              ) : (
                <span>{col.name}</span>
              )}
            </div>
          </div>
          <div>
            {isColNameEditing && editColId === col.id ? (
              <button
                onClick={() => {
                  setEditColId(col.id);
                  setIsColNameEditing(!isColNameEditing);
                }}
              >
                <SaveIcon size={14} strokeWidth={1.5} />
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditColId(col.id);
                  setIsColNameEditing(!isColNameEditing);
                }}
              >
                <EditIcon size={14} strokeWidth={1.5} />
              </button>
            )}
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
  }, [editColId, isColNameEditing, localColumns, setLoading, setLocalColumns, updateColName, viewFilters]);

  // ----------- add column handler -----------
  const handleAddRow = async () => {
    table.resetSorting();
    table.resetGlobalFilter();
    setRecordCount(recordCount + 1);
    await addRow.mutateAsync({ tableId });
  };

  // ----------- add column handler -----------
  const handleAddColumn = ({ _type }: { _type: "text" | "number" }) => {
    table.resetSorting();
    addColumn.mutate({ tableId, type: _type });
  };

  const flatData = useMemo(
    () => tableData?.pages?.flatMap((page) => page.data) ?? [],
    [tableData],
  );

  const totalDBRowCount = count ?? 0;
  const totalFetched = flatData.length;

  //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        //once the user has scrolled within 500px of the bottom of the table, fetch more data if we can
        if (
          scrollHeight - scrollTop - clientHeight < 500 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          void fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount],
  );

  //a check on mount and after a fetch to see if the table is already scrolled to the bottom and immediately needs to fetch more data
  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);



  // ----------- react-table -----------
  const table = useReactTable({
    data: localData,
    columns,
    filterFns: {
      gt: (row, columnId, filterValue) => {
        return row.getValue<number>(columnId) > Number(filterValue);
      },
      lt: (row, columnId, filterValue) => {
        return row.getValue<number>(columnId) < Number(filterValue);
      },
      eq: (row, columnId, filterValue) => {
        const value = row.getValue(columnId);
        return filterValue === "" ? value === "" : value === filterValue;
      },
      empty: (row, columnId) => {
        return row.getValue(columnId) === null || row.getValue(columnId) === "";
      },
      notEmpty: (row, columnId) => {
        return row.getValue(columnId) !== null && row.getValue(columnId) !== "";
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableMultiRowSelection: true,
    columnResizeMode: "onChange",
    state: {
      sorting,
      globalFilter,
      columnFilters,
      rowSelection,
      columnVisibility,
    },
    onColumnVisibilityChange: (updaterOrValue) => {
      setColumnVisibility(
        typeof updaterOrValue === "function"
          ? updaterOrValue(columnVisibility)
          : updaterOrValue
      );
    },
    onRowSelectionChange: (updaterOrValue) => {
      setRowSelection(
        typeof updaterOrValue === "function"
          ? updaterOrValue(rowSelection)
          : updaterOrValue
      );
    },
    onColumnFiltersChange: (updaterOrValue: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
      setColumnFilters(
        typeof updaterOrValue === "function"
          ? updaterOrValue(columnFilters)
          : updaterOrValue
      );
    },
    onSortingChange: (updaterOrValue) => {
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue;
      setSorting(newSorting);
    },
    onGlobalFilterChange: (newFilter) => {
      setGlobalFilter(newFilter as string);
    },
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 33, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== "undefined" && !navigator.userAgent.includes("Firefox")
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  // ----------- when loading -----------
  if (isLoading && status === "pending") {
    return (
      <div className="fixed top-0 flex h-svh w-screen items-center justify-center p-44">
        <LoaderIcon size={20} className="animate-spin" />
        <div className="ml-2 animate-pulse text-xs text-gray-500">Loading...</div>
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
    <div
      ref={tableContainerRef}
      onScroll={(e) => fetchMoreOnBottomReached(e.target as HTMLDivElement)}
      className="min-w-screen z-0 max-h-[90vh] flex-grow overflow-auto"
    >
      <table className="mb-32 w-max">

        <thead className="sticky top-0 z-10 flex group">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className={cn("flex w-max items-center")}>
              <td className="hidden absolute z-20 group-hover:block border-gray-300 p-2 text-xs bg-[#F5F5F5]">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={table.getIsAllRowsSelected()}
                  onChange={table.getToggleAllRowsSelectedHandler()}
                />
              </td>
              {headerGroup.headers.map((header) => (
                <td
                  key={header.id}
                  style={{ width: header.getSize() }}
                  className={`relative border-b border-r border-gray-300 p-2 text-xs ${header.column.getIsSorted() ? "bg-blue-100" : "bg-[#F5F5F5]"
                    }`}
                >
                  <div className="flex items-center gap-1">
                    {typeof header.column.columnDef.header === "function"
                      ? header.column.columnDef.header(header.getContext())
                      : header.column.columnDef.header}

                    {header.column.getIsSorted() && (
                      <span className="text-blue-600">
                        {header.column.getIsSorted() === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>

                  <div
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    className={`absolute -right-0 top-2 z-20 h-5 w-[3px] translate-x-[2px] cursor-col-resize rounded-md bg-blue-500 opacity-0 hover:opacity-100 ${header.column.getIsResizing()
                      ? "h-5 w-5 bg-blue-500 opacity-100"
                      : ""
                      }`}
                  />
                </td>
              ))}
              {headerGroup.headers.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <button className="border-b border-r border-gray-300 bg-[#F5F5F5] px-10 py-2 text-xs">
                      <Plus size={18} strokeWidth={1.5} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="flex flex-col">
                    <button
                      className="flex w-full px-4 py-2 text-left text-xs hover:bg-gray-100"
                      onClick={() => handleAddColumn({ _type: "text" })}
                    >
                      <CaseUpperIcon size={16} strokeWidth={1.5} />
                      <span className="ml-2">Add Text Column</span>
                    </button>
                    <button
                      className="flex w-full px-4 py-2 text-left text-xs hover:bg-gray-100"
                      onClick={() => handleAddColumn({ _type: "number" })}
                    >
                      <HashIcon size={14} strokeWidth={1.5} />
                      <span className="ml-2">Add Number Column</span>
                    </button>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </tr>
          ))}
        </thead>

        <tbody
          className="relative w-max"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${rowVirtualizer.getVirtualItems()[0]?.start ?? 0}px)`,
            }}
          >
            {rows.length === 0 ? (
              <div className="fixed top-0 flex h-svh w-screen items-center justify-center p-44 -translate-y-28">
                <div className="ml-2 animate-pulse text-xs text-gray-500">No records match <strong>{globalFilter}</strong></div>
              </div>
            ) : (
              rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];

                return (
                  <tr
                    key={row?.id}
                    style={{ height: `${rowHeight}rem` }}
                    className={cn("flex w-max items-center bg-white hover:bg-gray-100 group", {
                      "bg-red-100/40 hover:bg-red-100/50": row?.getIsSelected(),
                    })}
                  >
                    <div className="absolute left-2 text-xs text-gray-500">
                      {table.getVisibleLeafColumns().length > 0 && (virtualRow.index + 1)}
                    </div>
                    <td className="hidden absolute z-20 group-hover:block  p-2 text-xs">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={row?.getIsSelected()}
                        onChange={row ? row.getToggleSelectedHandler() : undefined}
                      />
                    </td>

                    {row?.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                        className={cn(
                          "h-full w-max border-b border-r p-[2px] text-xs",
                          {
                            "border-yellow-500 bg-yellow-300 text-yellow-800 hover:bg-white":
                              globalFilter &&
                              String(cell.getValue())
                                .toLowerCase()
                                .includes(globalFilter.toLowerCase()),
                            "bg-blue-50":
                              cell.column.getIsSorted() ||
                              cell.column.getIsFiltered(),
                          },
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
            {rows.length > 0 && <div className="flex w-max border-r">
              {table.getFooterGroups().map((footerGroup) => (
                <button
                  key={footerGroup.id}
                  onClick={() => handleAddRow()}
                  className="group flex items-center bg-white hover:bg-gray-100"
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
            </div>}

          </div>
        </tbody>
        <div className="fixed bottom-10 ml-3 flex items-center">
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
        <div className="fixed bottom-0 w-full border-t border-gray-300 bg-white p-2 text-xs text-gray-500">
          {isLoading ? "Loading..." : recordCount} records
        </div>
      </table>
    </div>
  );
}

export default TableView;
