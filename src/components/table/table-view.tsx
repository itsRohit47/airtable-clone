/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";
// ----------- import -----------
import { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { faker } from '@faker-js/faker';
import Image from "next/image";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useRouter } from "next/navigation";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type ColumnDef,
  flexRender,
  type filterFns,
  type ColumnFiltersState,
} from "@tanstack/react-table";

import {
  Plus,
  HashIcon,
  EditIcon,
  SaveIcon,
  CaseUpperIcon,
  Trash2Icon,
  Loader2,
} from "lucide-react";

import { api } from "@/trpc/react";
import { EditableCell } from "./editable-cell";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/components/context";
import { useVirtualizer, VirtualizerOptions } from "@tanstack/react-virtual";
import useDebounce from "@/hooks/use-debounce";



export function TableView({
  tableId,
  viewId,
}: {
  tableId: string;
  viewId: string;
}) {
  // ----------- useState -----------
  const { toast } = useToast();
  const router = useRouter();
  const {
    globalFilter,
    setGlobalFilter,
    rowHeight,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    rowSelection,
    setRowSelection,
    columnVisibility,
    setColumnVisibility,
    selectedView,
    setSelectedView,
    loading,
    setLoading,
    matchedCells,
    setMatchedCells,
    currentMatchIndex,
    setCurrentMatchIndex,
    goToNextMatch,
    goToPrevMatch,
    checks
  } = useAppContext();

  // Load global filter from localStorage on mount
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const savedGlobalFilter = localStorage.getItem('globalFilter');
      if (savedGlobalFilter) {
        setGlobalFilter(savedGlobalFilter);
      }
    }
  }, [setGlobalFilter]);

  // Save global filter to localStorage whenever it changes
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      if (globalFilter !== null) {
        localStorage.setItem('globalFilter', globalFilter);
      } else {
        localStorage.removeItem('globalFilter');
      }
    }
  }, [globalFilter]);

  const [isColNameEditing, setIsColNameEditing] = useState(false);
  const [editColId, setEditColId] = useState("");
  const [newColName, setNewColName] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [colType, setColType] = useState<"text" | "number" | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const addColumnButtonRef = useRef<HTMLButtonElement>(null);
  const debouncedColName = useDebounce(newColName, 100);
  const [isTutorialOpen, setIsTutorialOpen] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const savedState = localStorage.getItem('isTutorialOpen');
      return savedState ? JSON.parse(savedState) : false;
    }
    return false;
  });
  const [tutorialChecklist, setTutorialChecklist] = useState<string[]>(() => {
    if (typeof localStorage !== 'undefined') {
      const savedChecklist = localStorage.getItem('tutorialChecklist');
      return savedChecklist ? JSON.parse(savedChecklist) : [];
    }
    return [];
  });
  const tutorialRef = useRef<HTMLDivElement>(null);
  const [showChecklist, setShowChecklist] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const savedState = localStorage.getItem('showChecklist');
      return savedState ? JSON.parse(savedState) : false;
    }
    return false;
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        addColumnButtonRef.current && !addColumnButtonRef.current.contains(e.target as Node)
      ) {
        setIsAddColumnOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [addColumnButtonRef, setIsAddColumnOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tutorialRef.current &&
        !tutorialRef.current.contains(event.target as Node) &&
        !addColumnButtonRef.current?.contains(event.target as Node)
      ) {
        setIsTutorialOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tutorialRef, addColumnButtonRef]);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('tutorialChecklist', JSON.stringify(tutorialChecklist));
    }
  }, [tutorialChecklist]);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('isTutorialOpen', JSON.stringify(isTutorialOpen));
    }
  }, [isTutorialOpen]);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('showChecklist', JSON.stringify(showChecklist));
    }
  }, [showChecklist]);

  const handleChecklistChange = (item: string) => {
    setTutorialChecklist((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };

  const handleToggleTutorial = () => {
    setIsTutorialOpen(!isTutorialOpen);
    if (isTutorialOpen) {
      setShowChecklist(false);
    }
  };

  const { data: c, isLoading: isColsLoading } = api.table.getColumnsByTableId.useQuery({
    tableId,
  });

  const { mutate: deleteRow, isPending } = api.table.deleteRow.useMutation({
    onMutate: async ({ rowId }: { rowId: string }) => {
      setLoading(true);
      ctx.table.getTotalRowsGivenTableId.setData(
        { tableId },
        (old) => (old ?? 0) - 1
      );
    },
    onSettled: () => {
      setLoading(false);
      void ctx.table.getData.invalidate();
      void ctx.table.getTotalRowsGivenTableId.invalidate();
    }
  });

  const { mutate: updateColumnName } = api.table.updateColumnName.useMutation(
    {
      onMutate: async ({ columnId, name }) => {
        await ctx.table.getColumnsByTableId.cancel();
        const previousData = ctx.table.getColumnsByTableId.getData();
        ctx.table.getColumnsByTableId.setData({ tableId }, (old) => {
          if (!old) return old;
          return old.map((col) =>
            col.id === columnId ? { ...col, name } : col
          );
        });
        return { previousData };
      },
      onError: (err, { columnId, name }, context) => {
        if (context?.previousData) {
          ctx.table.getColumnsByTableId.setData({ tableId }, context.previousData);
        }
        toast({
          title: "Error",
          description: "Failed to update column name",
        });
      },
      onSettled: () => {
        void ctx.table.getColumnsByTableId.invalidate();
      },
    },
  );


  useEffect(() => {
    if (debouncedColName === "") {
      return;
    }
    updateColumnName({ columnId: editColId, name: debouncedColName });
  }, [debouncedColName, editColId, updateColumnName]);


  // Fetch view sorts
  const { data: viewSorts, isLoading: isViewSortsLoading } = api.table.getViewSorts.useQuery({
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
  const { data: viewFilters, isLoading: isViewFiltersLoading } = api.table.getViewFilters.useQuery({
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

  const { data: view, isLoading: isViewLoding } = api.table.getViewById.useQuery({
    viewId: viewId,
  });

  useEffect(() => {
    setSelectedView(view ?? null);
  }, [selectedView?.id, setSelectedView, view]);

  const ctx = api.useUtils();

  // ----------- fetch data -----------
  const {
    data: tableData,
    isLoading,
    isFetching,
    fetchNextPage,
  } = api.table.getData.useInfiniteQuery(
    {
      tableId,
      pageSize: 200,
      search: globalFilter ?? undefined, // Pass the global filter to the query
      filters: viewFilters?.map((f) => ({
        columnId: f.columnId,
        operator: f.operator,
        value: f.value ?? "",
      })) ?? [],
      sorts: sorting.map((s) => ({
        columnId: s.id,
        desc: s.desc,
      })),
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    },
  );


  // ----------- add column mutation -----------
  const addColumn = api.table.addField.useMutation({
    onMutate: async (data) => {
      setLoading(true);
      setColType(null);
      await ctx.table.getColumnsByTableId.cancel();
      const previousData = ctx.table.getColumnsByTableId.getData();
      ctx.table.getColumnsByTableId.setData({ tableId }, (old) => {
        if (!old) return old;
        return [...old, {
          id: "temp-id",
          name: "Untitled Column",
          tableId: tableId,
          defaultValue: null,
          type: data.type,
          order: old.length,
          createdAt: new Date(),
          updatedAt: new Date()
        }];
      });
      return { previousData };
    },
    onError: (err, newColumn, context) => {
      if (context?.previousData) {
        ctx.table.getColumnsByTableId.setData({ tableId }, context.previousData);
      }
      toast({
        title: "Error",
        description: "Failed to add column",
      });
    },
    onSettled: () => {
      setLoading(false);
      void ctx.table.getColumnsByTableId.invalidate();
    },
  });


  const flatData = useMemo(
    () => tableData?.pages?.flatMap((page) => page.data) ?? [],
    [tableData],
  );

  // ----------- add row mutation -----------
  const { mutate: add5kRow } = api.table.addRow.useMutation({
    onMutate: async () => {
      setLoading(true);
      setIsAdding(true);
      const previousData = ctx.table.getData.getInfiniteData();
      const previousTotalRows = ctx.table.getTotalRowsGivenTableId.getData();
      const lastRow = previousData?.pages.flatMap(page => page.data).sort((a, b) => (Number(b.order) ?? 0) - (Number(a.order) ?? 0)).pop();

      const newRows = Array.from({ length: 400 }).map((_, index) => ({
        id: `temp-id-${index}-${Date.now()}`, // Ensure unique temp IDs
        order: (Number(lastRow?.order) ?? -1) + index + 1,
        ...Object.fromEntries((c ?? []).map((col) => [col.id, ""])),
      }));

      // Optimistically update the infinite query data
      ctx.table.getData.setInfiniteData(
        {
          tableId, pageSize: 200,
          search: globalFilter ?? undefined,
          filters: viewFilters?.map((f) => ({
            columnId: f.columnId,
            operator: f.operator,
            value: f.value ?? "",
          })) ?? [],
          sorts: viewSorts?.map((s) => ({
            columnId: s.columnId,
            desc: s.desc,
          })) ?? []
        },
        (old) => {
          if (!old) return old;
          const newPages = [...old.pages];
          const lastPage = newPages[newPages.length - 1];
          if (lastPage) {
            newPages[newPages.length - 1] = {
              ...lastPage,
              data: [
                ...lastPage.data.filter(row => !String(row.id).startsWith('temp-id-')), // Remove old temp rows
                ...newRows,
              ],
            };
          }
          return { ...old, pages: newPages };
        }
      );

      // Optimistically update total rows count
      ctx.table.getTotalRowsGivenTableId.setData(
        { tableId },
        (old) => (old ?? 0) + 5000
      );

      return { previousData, previousTotalRows };
    },
    onError: (err, newRow, context) => {
      if (context?.previousData) {
        ctx.table.getData.setInfiniteData(
          { tableId, pageSize: 200 },
          context.previousData
        );
        ctx.table.getTotalRowsGivenTableId.setData(
          { tableId },
          context.previousTotalRows
        );
      }
      toast({
        title: "Error",
        description: err.message,
      });
    },
    onSuccess: (data, variables, context) => {
      setLoading(false);
      setIsAdding(false);
      toast({
        title: "Success",
        description: "Rows added successfully",
      });
      void ctx.table.getData.invalidate({ tableId });
      void ctx.table.getTotalRowsGivenTableId.invalidate({ tableId });
    },
  });

  const add1Row = api.table.add1Row.useMutation({
    onMutate: async (data) => {
      setLoading(true);
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await ctx.table.getData.cancel();

      // Snapshot the previous value
      const previousData = ctx.table.getData.getInfiniteData({
        tableId,
        pageSize: 200,
        search: globalFilter ?? undefined,
        filters: viewFilters?.map((f) => ({
          columnId: f.columnId,
          operator: f.operator,
          value: f.value ?? "",
        })) ?? [],
        sorts: viewSorts?.map((s) => ({
          columnId: s.columnId,
          desc: s.desc,
        })) ?? [],
      });

      // Get the highest order number from existing rows
      const lastRow = previousData?.pages.flatMap(page => page.data).sort((a, b) => (Number(b.order) ?? 0) - (Number(a.order) ?? 0))[0];

      // Create the new row with empty data
      const newRowData: Record<string, string | number> = {
        id: `temp-id-${Date.now()}`,
        order: (Number(lastRow?.order) ?? -1) + 1, // Continue from the last order
      };

      // Add empty cells for each column
      c?.forEach((col) => {
        newRowData[col.id] = typeof data.fakerData === 'string' || typeof data.fakerData === 'number' ? data.fakerData : "";
      });

      // Optimistically update the table data
      ctx.table.getData.setInfiniteData(
        {
          tableId,
          pageSize: 200,
          search: globalFilter ?? undefined,
          filters: viewFilters?.map((f) => ({
            columnId: f.columnId,
            operator: f.operator,
            value: f.value ?? "",
          })) ?? [],
          sorts: viewSorts?.map((s) => ({
            columnId: s.columnId,
            desc: s.desc,
          })) ?? [],
        },
        (old) => {
          if (!old) return old;
          const newPages = [...old.pages];
          const lastPage = newPages[newPages.length - 1];
          if (lastPage) {
            newPages[newPages.length - 1] = {
              ...lastPage,
              data: [
                ...lastPage.data,
                newRowData,
              ],
            };
          }
          return { ...old, pages: newPages };
        }
      );

      // Optimistically update the total rows count
      ctx.table.getTotalRowsGivenTableId.setData(
        { tableId },
        (old) => (old ?? 0) + 1
      );

      return { previousData };
    },
    onError: (err, newRow, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        ctx.table.getData.setInfiniteData(
          {
            tableId,
            pageSize: 200,
            filters: viewFilters?.map((f) => ({
              columnId: f.columnId,
              operator: f.operator,
              value: f.value ?? "",
            })) ?? [],
            sorts: viewSorts?.map((s) => ({
              columnId: s.columnId,
              desc: s.desc,
            })) ?? [],
          },
          context.previousData
        );
      }
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to add row",
      });
    },
    onSuccess: () => {
      setLoading(false);
      void ctx.table.getData.invalidate({ tableId });
      void ctx.table.getTotalRowsGivenTableId.invalidate({ tableId });
    },
    onSettled: () => {
      // Always refetch after error or success to sync with server
      void ctx.table.getData.invalidate({ tableId });
      void ctx.table.getTotalRowsGivenTableId.invalidate({ tableId });
    },
  });


  // ----------- total rows -----------
  const { data: totalRows, isLoading: isRowsLoading } = api.table.getTotalRowsGivenTableId.useQuery({
    tableId,
    filters: viewFilters?.map((f) => ({
      columnId: f.columnId,
      operator: f.operator,
      value: f.value ?? "",
    })) ?? [],
  });


  // ----------- columns -----------
  const columns = useMemo<ColumnDef<Record<string, string | number>>[]>(() => {
    function handleColumnUpdate(id: string) {
      setIsColNameEditing(false);
      setEditColId("");
    }

    return c
      ?.sort((a, b) => a.order - b.order) // Sort columns by order
      .map((col) => ({
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
        filterFn: (viewFilters?.find((filter) => filter.columnId === col.id)
          ?.operator as keyof typeof filterFns) ?? "eq",
        header: ({ column }) => (
          <span className="flex w-full items-center justify-between gap-x-2 overflow-hidden">
            <div className="flex items-center gap-x-2 justify-center mx-auto">

              <div className="w-max px-2 flex items-center gap-x-1">
                <span>
                  {col.type === "text" ? (
                    <CaseUpperIcon size={16} strokeWidth={1.5} />
                  ) : (
                    <HashIcon size={14} strokeWidth={1.5} />
                  )}
                </span>
                {isColNameEditing && editColId === col.id ? (
                  <input
                    type="text"
                    value={newColName}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setIsColNameEditing(false);
                      }
                    }
                    }
                    onBlur={() => setIsColNameEditing(false)}
                    onChange={(e) => {
                      setNewColName(e.target.value);
                    }}
                    autoFocus
                    onFocus={(e) => e.target.select()}
                    className="max-w-24 outline-none bg-transparent"
                  />
                ) : (
                  <span>{col.name}</span>
                )}
              </div>
            </div>
            <div>
              {isColNameEditing && editColId === col.id ? (
                <button
                  onClick={() => setIsColNameEditing(false)}
                >
                  <SaveIcon size={14} strokeWidth={1.5} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditColId(col.id);
                    setNewColName(col.name);
                    setIsColNameEditing(true);
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
            value={row.original[col.id] as string}
          />
        ),
      })) ?? [];
  }, [c, updateColumnName, newColName, isColNameEditing, editColId]);

  // ----------- add column handler -----------
  const handleAddRow = () => {
    add5kRow({ tableId });
  };

  const handleAdd1Row = () => {
    const fakerData = c?.map((col) => (col.type === "text" ? faker.lorem.word() : faker.number.int().toString())) ?? [];
    add1Row.mutate({ tableId, fakerData });
  };

  // ----------- add column handler -----------
  const handleAddColumn = ({ _type }: { _type: "text" | "number" }) => {
    table.resetSorting();
    addColumn.mutate({ tableId, type: _type });
    setIsAddColumnOpen(false);
  };



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
          totalFetched < (totalRows ?? 0)
        ) {
          void fetchNextPage();
        }
      }
    },
    [isFetching, totalFetched, totalRows, fetchNextPage],
  );

  //a check on mount and after a fetch to see if the table is already scrolled to the bottom and immediately needs to fetch more data
  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  // Add this useEffect to handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement.tagName !== "TD") return;

      const currentRow = activeElement.parentElement as HTMLTableRowElement;
      const currentCellIndex = Array.from(currentRow.children).indexOf(activeElement);
      const currentRowIndex = Array.from(currentRow.parentElement!.children).indexOf(currentRow);

      let nextCell: HTMLElement | null = null;

      switch (event.key) {
        case "ArrowRight":
          nextCell = currentRow.children[currentCellIndex + 1] as HTMLElement;
          break;
        case "ArrowLeft":
          nextCell = currentRow.children[currentCellIndex - 1] as HTMLElement;
          break;
        case "ArrowDown":
          const nextRowDown = currentRow.parentElement!.children[currentRowIndex + 1] as HTMLTableRowElement;
          if (nextRowDown) {
            nextCell = nextRowDown.children[currentCellIndex] as HTMLElement;
          }
          break;
        case "ArrowUp":
          const nextRowUp = currentRow.parentElement!.children[currentRowIndex - 1] as HTMLTableRowElement;
          if (nextRowUp) {
            nextCell = nextRowUp.children[currentCellIndex] as HTMLElement;
          }
          break;
      }

      if (nextCell) {
        nextCell.focus();
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    function handleFocusIn(e: FocusEvent) {
      const target = e.target as HTMLElement;
      if (target && target.tagName === "TD") {
        target.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    }
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, []);



  // ----------- react-table -----------
  const table = useReactTable({
    data: flatData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualSorting: true, // Enable manual sorting
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
    onSortingChange: (updaterOrValue) => {
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue;
      setSorting(newSorting);
    },
    onGlobalFilterChange: (updaterOrValue) => {
      setGlobalFilter(
        typeof updaterOrValue === "function"
          ? updaterOrValue(globalFilter)
          : updaterOrValue
      );
    },
  });

  useEffect(() => {
    if (!globalFilter) {
      setMatchedCells([]);
      setCurrentMatchIndex(0);
      return;
    }
    const newMatches: { rowIndex: number; colIndex: number }[] = [];
    const rows = table.getRowModel().rows;
    rows.forEach((r, rIndex) => {
      r.getVisibleCells().forEach((c, cIndex) => {
        const val = String(c.getValue()).toLowerCase();
        if (val.includes(globalFilter.toLowerCase())) {
          newMatches.push({ rowIndex: rIndex, colIndex: cIndex });
        }
      });
    });
    setMatchedCells(newMatches);
    setCurrentMatchIndex(0);
  }, [table, globalFilter, setMatchedCells, setCurrentMatchIndex]);

  // Update the virtualizer to use filtered and sorted rows
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
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
  if (isLoading || isColsLoading || isRowsLoading || isViewSortsLoading || isViewFiltersLoading || isViewLoding) {
    return (
      <div
        ref={tableContainerRef}
        className="min-w-screen z-0 max-h-[90vh] flex-grow overflow-auto"
      >
        <table className="mb-32 w-max">
          <thead className="sticky top-0 z-10 flex group">
            {Array.from({ length: 1 }).map((_, index) => (
              <tr key={index} className="flex w-max items-center bg-white">
                {table.getAllColumns().map((column) => (
                  <td
                    key={column.id}
                    style={{ width: column.getSize() }}
                    className="h-8 border-b border-r p-2 text-xs animate-pulse bg-gray-200"
                  ></td>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="relative w-max">
            {Array.from({ length: 6 }).map((_, index) => (
              <tr key={index} className="flex w-max items-center bg-white">
                {table.getAllColumns().map((column) => (
                  <td
                    key={column.id}
                    style={{ width: column.getSize() }}
                    className="h-8 border-b border-r p-2 text-xs animate-pulse bg-gray-100"
                  ></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } else {

    // ----------- return -----------
    return (
      <div
        ref={tableContainerRef}
        onScroll={(e) => fetchMoreOnBottomReached(e.target as HTMLDivElement)}
        className="min-w-screen z-0 max-h-[80vh] 2xl:max-h-[90vh] flex-grow overflow-auto"
      >
        <table className="mb-32 w-max">
          <thead className="sticky top-0 z-10 flex group">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className={cn("flex w-max items-center")}>
                <td className="absolute z-20  border-gray-300 p-2 text-xs bg-transparent">
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
                    className={cn(
                      "relative border-b border-r border-gray-300 p-2 text-xs bg-[#F5F5F5]",
                      {
                        "bg-blue-100": header.column.getIsSorted(),
                        "bg-purple-100": header.column.getFilterIndex() > -1,
                        "bg-indigo-100": header.column.getFilterIndex() > -1 && header.column.getIsSorted(),
                      }
                    )}
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
                  <div className="relative">
                    <button
                      className="border-b border-r border-gray-300 bg-[#F5F5F5] px-10 py-2 text-xs"
                      onClick={() => setIsAddColumnOpen(!isAddColumnOpen)}
                    >
                      <Plus size={18} strokeWidth={1.5} />
                    </button>
                    {isAddColumnOpen &&
                      (<div
                        className="absolute text-xs w-60 shadow-lg border p-3 bg-white rounded-md flex flex-col gap-2 z-50"
                      >
                        <div className="flex flex-col gap-1 p-2 bg-white border border-gray-200 rounded-md">
                          <button
                            onClick={() => setColType("text")}
                            className={cn("flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md", {
                              "bg-blue-50 hover:bg-blue-100": colType === "text"
                            })}
                          >
                            <CaseUpperIcon size={16} strokeWidth={1.5} />
                            Signle line text
                          </button>
                          <button
                            onClick={() => setColType("number")}
                            className={cn("flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md", {
                              "bg-blue-50 hover:bg-blue-100": colType === "number"
                            })}
                          >
                            <HashIcon size={16} strokeWidth={1.5} />
                            Number
                          </button>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setIsAddColumnOpen(false)}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => colType && handleAddColumn({ _type: colType })}
                            disabled={!colType}
                            className="flex items-center gap-2 p-2 rounded-md bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Create Field
                          </button>
                        </div>
                      </div>
                      )}
                  </div>
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
              {table.getRowModel().rows.length === 0 ? ( // Use getRowModel instead of getFilteredRowModel
                globalFilter && (
                  <div className="fixed top-0 flex w-screen items-center justify-center p-52 min-h-96 max-h-[100vh] -translate-y-32 flex-col gap-4">
                    <img src={'https://fsbauno90gkbhha8.public.blob.vercel-storage.com/TheL-yzAcc9yNUxSUgMZySW5JfqKhwASjOO.gif'} alt="" width={100} height={24} />
                    <div className="ml-2 text-sm text-gray-500 flex items-center gap-x-1">No records match <span className="px-2 py-1 text-xs bg-gray-100 border  rounded-md">{globalFilter}</span > try something else </div>
                  </div>
                )
              ) : (
                rowVirtualizer.getVirtualItems().map((virtualRow, index) => {
                  const row = table.getRowModel().rows[virtualRow.index]; // Use getRowModel instead of getFilteredRowModel
                  return (
                    <ContextMenu key={row?.id}>
                      <ContextMenuTrigger>
                        <tr
                          style={{ height: `${rowHeight}rem` }}
                          className={cn("flex w-max items-center bg-white hover:bg-gray-100 group transition-all duration-200", {
                            "bg-violet-100 hover:bg-violet-100/50": row?.getIsSelected(),
                          })}
                        >
                          {!row?.getIsSelected() && (
                            <div className="absolute left-2 text-xs text-gray-500">
                              {table.getVisibleLeafColumns().length > 0 && (Number(row?.original.order) ?? 0) + 1}
                            </div>
                          )}
                          <td className={cn("absolute z-20 p-2 text-xs", {
                            "block": row?.getIsSelected(),
                            "hidden group-hover:block": !row?.getIsSelected()
                          })}>
                            <input
                              type="checkbox"
                              className="form-checkbox"
                              checked={row?.getIsSelected()}
                              onChange={row ? row.getToggleSelectedHandler() : undefined}
                            />
                          </td>
                          {row?.getVisibleCells().map((cell, cIndex) => (
                            <td
                              key={cell.id}
                              data-row-index={virtualRow.index}
                              data-col-index={cIndex}
                              style={{ width: cell.column.getSize() }}
                              tabIndex={0}
                              className={cn(
                                "h-full w-max border-b border-r p-[2px] text-xs focus:border focus:border-blue-500 focus:outline-none border-gray-300",
                                {
                                  " border-dashed cursor-not-allowed pointer-events-none border-gray-300": String(row.original?.id)?.startsWith("temp-id") ?? false,
                                },
                                {
                                  "border-yellow-500 bg-yellow-300 text-yellow-800 hover:bg-yellow-400":
                                    globalFilter &&
                                    String(cell.getValue())
                                      .toLowerCase()
                                      .includes(globalFilter.toLowerCase()),
                                  "bg-blue-50/50": cell.column.getIsSorted(),
                                  "bg-purple-50/50": cell.column.getFilterIndex() > -1,
                                  "bg-indigo-50/50": cell.column.getFilterIndex() > -1 && cell.column.getIsSorted(),
                                },
                                {
                                  "border-yellow-500 bg-yellow-300 text-yellow-800 hover:bg-yellow-400":
                                    globalFilter &&
                                    String(cell.getValue())
                                      .toLowerCase()
                                      .includes(globalFilter.toLowerCase()),
                                }
                              )}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </td>
                          ))}
                        </tr>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem
                          className="text-xs cursor-pointer text-gray-500 hover:text-gray-700 flex items-center gap-2"
                          onClick={() => {
                            deleteRow({
                              tableId: tableId,
                              rowId: row?.original.id as string,
                            });
                          }}
                        >
                          <Trash2Icon size={14} strokeWidth={1.5} /> <span className="text-red-500 flex items-center gap-1">
                            {isPending ? <Loader2 size={14} strokeWidth={1.5} /> : null}
                            Delete record</span>
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })
              )}
              <div className="flex w-max border-r">
                {table.getFooterGroups().map((footerGroup) => (
                  <button
                    key={footerGroup.id}
                    onClick={() => handleAdd1Row()}
                    className="group flex items-center bg-white hover:bg-gray-100"
                  >
                    {footerGroup.headers.map((column, index) => (
                      <td
                        key={column.id}
                        style={{ width: column.getSize() }}
                        className="h-full w-max border-b p-2 text-xs"
                      >
                        {index === 0 && (
                          <div className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                            <Plus
                              size={20}
                              strokeWidth={1}
                              className="rounded-md p-1 group-hover:bg-gray-200"
                            />
                            Add 1 row
                          </div>
                        )}
                        {index !== 0 && <div className=""></div>}
                      </td>
                    ))}
                  </button>
                ))}
              </div>

            </div>
          </tbody>
          <div className="fixed bottom-10 ml-3 flex items-center">
            <button
              onClick={handleAddRow}
              disabled={isAdding}
              className="flex items-center justify-center gap-x-2 rounded-l-full border bg-white p-2 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add 5k rows {isAdding && <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />}
            </button>
            <button
              onClick={handleAdd1Row}
              className="flex items-center justify-center rounded-r-full border bg-white p-2 hover:bg-gray-100 text-xs"
            >
              Add 1 row
            </button>
          </div>
          <div className="fixed bottom-0 w-full border-t border-gray-300 bg-white p-2 text-xs text-gray-500 flex justify-between items-center">
            <div>
              {Object.keys(rowSelection).length > 0
                ? `${Object.keys(rowSelection).length} records selected`
                : viewFilters && viewFilters.length > 0
                  ? `${flatData.length} of ${totalRows} filtered ${totalRows === 1 ? "record" : "records"}`
                  : `${flatData.length} of ${totalRows} ${totalRows === 1 ? "record" : "records"}`
              }
            </div>
            <button
              onClick={handleToggleTutorial}
              className="ml-4 px-3 py-2 bg-violet-500 text-white rounded-md fixed bottom-10 right-4"
            >
              {isTutorialOpen ? "Close" : " Show Demo"}
            </button>
            {isTutorialOpen && (
              <div className="fixed bottom-20 right-4 w-max max-w-96 z-[10000] bg-white border border-gray-300 shadow-lg rounded-md p-4 grid gap-4 grid-cols-1">
                {showChecklist ? (
                  <div className="list-none">
                    <div className="flex flex-col">
                      {checks.map((item) => (
                        <span key={item} className="flex items-start gap-1">
                          <input
                            type="checkbox"
                            checked={tutorialChecklist.includes(item)}
                            onChange={() => handleChecklistChange(item)}
                          />{" "}
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-1">
                    <span >Basic Stuff</span>
                    <iframe className="w-full" src="https://www.loom.com/embed/6f42fd53d43b4d40a7dd71ef0615f084?sid=f9c29868-6626-4c44-a89b-e6a4397e3675" allowFullScreen ></iframe>
                    <span>Filters and sorts</span>
                    <iframe className="w-full" src="https://www.loom.com/embed/3ab7ccf6c0fe43a5b44dee0ccfef7c4b?sid=6c289733-baa4-41d0-b78c-77a99cd9ebd4" allowFullScreen ></iframe>
                  </div>
                )}
                <button
                  onClick={() => setShowChecklist(!showChecklist)}
                  className="px-3 py-2 bg-gray-200 text-black rounded-md"
                >
                  {showChecklist ? "Show Demo Video" : "What can i test?"}
                </button>
              </div>
            )}
          </div>
        </table >
      </div >
    );
  }
}

export default TableView;