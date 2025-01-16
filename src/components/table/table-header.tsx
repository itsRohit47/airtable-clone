"use client";
import {
  ListIcon,
  Grid2X2Icon,
  ListFilterIcon,
  GroupIcon,
  ArrowUpDownIcon,
  PaintBucketIcon,
  Rows2Icon,
  Rows4Icon,
  Rows3Icon,
  ShareIcon,
  SearchIcon,
  EyeOffIcon,
  XIcon,
  ChevronDown,
  PlusIcon,
  Trash2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  CaseUpperIcon,
  HashIcon,
  Loader2Icon,
} from "lucide-react";
import { api } from "@/trpc/react";
import { useState } from "react";
import { LineHeightIcon } from "@radix-ui/react-icons";
import { useAppContext } from "../context";
import { useEffect, useRef } from "react";


const useSortFilterManagement = (viewId: string) => {
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const ctx = api.useUtils();
  const { localColumns } = useAppContext();

  // get the view sorts and filters
  const viewSorts = api.table.getViewSorts.useQuery({ viewId });
  const viewFilters = api.table.getViewFilters.useQuery({ viewId });

  // get the columns that are not filtered
  const unfilteredColumns = localColumns.filter(
    (col) => !viewFilters.data?.find((filter) => filter.columnId === col.id),
  );

  // get the columns that are not sorted
  const unsortedColumns = localColumns.filter(
    (col) => !viewSorts.data?.find((sort) => sort.columnId === col.id),
  );

  // add sort mutation
  const { mutate: addSort } = api.table.addSort.useMutation({
    onMutate: async (variables) => {
      await ctx.table.getViewSorts.cancel();
      const previousSorts = ctx.table.getViewSorts.getData({ viewId });

      ctx.table.getViewSorts.setData({ viewId }, (old) => [
        ...(old ?? []),
        {
          ...variables,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      return { previousSorts };
    },
    onError: (err, variables, context) => {
      ctx.table.getViewSorts.setData({ viewId }, context?.previousSorts);
    },
    onSettled: () => {
      void ctx.table.getViewSorts.invalidate();
    },
  });

  // delete sort mutation
  const { mutate: deleteSort } = api.table.deleteSort.useMutation({
    onMutate: async (variables) => {
      await ctx.table.getViewSorts.cancel();
      const previousSorts = ctx.table.getViewSorts.getData({ viewId });

      ctx.table.getViewSorts.setData(
        { viewId },
        (old) =>
          old?.filter((sort) => sort.columnId !== variables.columnId) ?? [],
      );

      return { previousSorts };
    },
    onError: (err, variables, context) => {
      ctx.table.getViewSorts.setData({ viewId }, context?.previousSorts);
    },
    onSettled: () => {
      void ctx.table.getViewSorts.invalidate();
    },
  });

  // update sort mutation
  const { mutate: updateSort } = api.table.updateSort.useMutation({
    onMutate: async (variables) => {
      await ctx.table.getViewSorts.cancel();
      const previousSorts = ctx.table.getViewSorts.getData({ viewId });

      ctx.table.getViewSorts.setData(
        { viewId },
        (old) =>
          old?.map((sort) =>
            sort.columnId === variables.columnId
              ? { ...sort, ...variables }
              : sort,
          ) ?? [],
      );

      return { previousSorts };
    },
    onError: (err, variables, context) => {
      ctx.table.getViewSorts.setData({ viewId }, context?.previousSorts);
    },
    onSettled: () => {
      void ctx.table.getViewSorts.invalidate();
    },
  });

  // add filter mutation
  const { mutate: addFilter } = api.table.addFilter.useMutation({
    onMutate: async (variables) => {
      await ctx.table.getViewFilters.cancel();
      const previousFilters = ctx.table.getViewFilters.getData({ viewId });

      ctx.table.getViewFilters.setData({ viewId }, (old) => [
        ...(old ?? []),
        {
          ...variables,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      return { previousFilters };
    },
    onError: (err, variables, context) => {
      ctx.table.getViewFilters.setData({ viewId }, context?.previousFilters);
    },
    onSettled: () => {
      void ctx.table.getViewFilters.invalidate();
    },
  });

  // delete filter mutation
  const { mutate: deleteFilter } = api.table.deleteFilter.useMutation({
    onMutate: async (variables) => {
      await ctx.table.getViewFilters.cancel();
      const previousFilters = ctx.table.getViewFilters.getData({ viewId });

      ctx.table.getViewFilters.setData(
        { viewId },
        (old) =>
          old?.filter((filter) => filter.columnId !== variables.columnId) ?? [],
      );

      return { previousFilters };
    },
    onError: (err, variables, context) => {
      ctx.table.getViewFilters.setData({ viewId }, context?.previousFilters);
    },
    onSettled: () => {
      void ctx.table.getViewFilters.invalidate();
    },
  });

  // update filter mutation
  const { mutate: updateFilter } = api.table.updateFilter.useMutation({
    onMutate: async (variables) => {
      await ctx.table.getViewFilters.cancel();
      const previousFilters = ctx.table.getViewFilters.getData({ viewId });

      ctx.table.getViewFilters.setData(
        { viewId },
        (old) =>
          old?.map((filter) =>
            filter.columnId === variables.columnId
              ? { ...filter, ...variables, operator: variables.operator ?? filter.operator }
              : filter,
          ) ?? [],
      );
      return { previousFilters };
    },
    onError: (err, variables, context) => {
      ctx.table.getViewFilters.setData({ viewId }, context?.previousFilters);
    },
    onSettled: () => {
      void ctx.table.getViewFilters.invalidate();
    },
  });

  return {
    sortMenuOpen,
    setSortMenuOpen,
    filterMenuOpen,
    setFilterMenuOpen,
    viewSorts: viewSorts.data ?? [],
    viewFilters: viewFilters.data ?? [],
    addSort,
    deleteSort,
    updateSort,
    addFilter,
    deleteFilter,
    updateFilter,
    unfilteredColumns,
    unsortedColumns,
  };
};

export default function TableHead({ tableId }: { tableId: string }) {
  const ctx = api.useUtils();
  const [searchMenuOpen, setSearchMenuOpen] = useState(false);
  const [rowHeightMenuOpen, setRowHeightMenuOpen] = useState(false);
  const [hideMenuOpen, setHideMenuOpen] = useState(false);
  const { data: cols } = api.table.getColumnsByTableId.useQuery({ tableId });

  const { isViewsOpen, setIsViewsOpen, selectedView, localColumns, setLocalColumns, columnVisibility } =
    useAppContext();

  useEffect(() => {
    setLocalColumns(cols ?? []);
  }, [cols, setLocalColumns, tableId]);

  const {
    sortMenuOpen,
    setSortMenuOpen,
    viewSorts,
    viewFilters,
    filterMenuOpen,
    setFilterMenuOpen,
  } = useSortFilterManagement(selectedView?.id ?? "");

  const filterMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const rowHeightMenuRef = useRef<HTMLDivElement>(null);
  const searchMenuRef = useRef<HTMLDivElement>(null);
  const hideMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)
      ) {
        setFilterMenuOpen(false);
      }
      if (
        sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)
      ) {
        setSortMenuOpen(false);
      }
      if (
        rowHeightMenuRef.current && !rowHeightMenuRef.current.contains(e.target as Node)
      ) {
        setRowHeightMenuOpen(false);
      }
      if (
        searchMenuRef.current && !searchMenuRef.current.contains(e.target as Node)
      ) {
        setSearchMenuOpen(false);
      }
      if (
        hideMenuRef.current && !hideMenuRef.current.contains(e.target as Node)
      ) {
        setHideMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [filterMenuRef, sortMenuRef, rowHeightMenuRef, searchMenuRef, setFilterMenuOpen, setSortMenuOpen, setRowHeightMenuOpen, setSearchMenuOpen, setIsViewsOpen]);

  return (
    <div className="z-10 flex w-full items-center justify-between border-b border-gray-300 p-2 text-xs text-gray-700">
      <div className="flex items-center gap-x-3">
        <button
          onClick={() => {
            setIsViewsOpen(!isViewsOpen);
          }}
          style={{ backgroundColor: isViewsOpen ? "#f0f0f0" : "" }}
          className={`flex cursor-pointer items-center gap-x-2 rounded-sm border border-gray-200/10 p-2 hover:bg-gray-200/60 ${isViewsOpen ? "hover:border-gray-300" : ""}`}
        >
          {" "}
          <ListIcon size={16} />
          <div>View</div>
        </button>
        <button className="flex cursor-pointer items-center gap-x-2 rounded-sm p-2 hover:bg-gray-200/60">
          <Grid2X2Icon size={16} />
          <div>{selectedView ? selectedView.name : <div className="animate-pulse bg-gray-200 h-4 w-10 rounded-md"></div>}</div>
        </button>
        <div>|</div>
        <div className="relative rounded-sm hover:bg-gray-200/60" ref={hideMenuRef}>
          <button
            className={`flex cursor-pointer items-center justify-center gap-x-1 rounded-sm p-2 ${Object.values(columnVisibility).filter((visible) => !visible).length > 0 ? "bg-blue-200/80 hover:bg-blue-200" : "hover:bg-gray-200/60"}`}
            onClick={() => {
              setHideMenuOpen(!hideMenuOpen);
            }}
          >
            <EyeOffIcon size={16} />
            <div>
              {Object.values(columnVisibility).filter((visible) => !visible).length > 0
                ? `${Object.values(columnVisibility).filter((visible) => !visible).length} hidden fields`
                : "Hide fields"}
            </div>
          </button>
          {hideMenuOpen && <HideMenu />}
        </div>
        <div className="relative" ref={filterMenuRef}>
          <button
            className={`flex cursor-pointer items-center justify-center gap-x-1 rounded-sm p-2 ${viewFilters && viewFilters.length > 0 ? "bg-blue-200/80 hover:bg-blue-200" : filterMenuOpen ? "bg-gray-200" : "hover:bg-gray-200/60"}`}
            onClick={() => {
              setFilterMenuOpen(!filterMenuOpen);
            }}
          >
            <ListFilterIcon size={16} />
            <div>
              {viewFilters.length > 0 && viewFilters.length <= 3
                ? `Filtered by ${viewFilters.map((filter) => localColumns.find((col) => col.id === filter.columnId)?.name).join(", ")}`
                : viewFilters.length > 3
                  ? `Filtered by ${localColumns.find((col) => col.id === viewFilters[0]?.columnId)?.name} and ${viewFilters.length - 1} other fields`
                  : "Filters"}
            </div>
          </button>
          {filterMenuOpen && <FilterMenu />}
        </div>
        <div className="relative" ref={
          sortMenuRef
        }>
          <button
            className={`flex cursor-pointer items-center justify-center gap-x-1 rounded-sm p-2 ${viewSorts && viewSorts.length > 0 ? "bg-blue-200/80 hover:bg-blue-200" : sortMenuOpen ? "bg-gray-200" : "hover:bg-gray-200/60"}`}
            onClick={() => {
              setSortMenuOpen(!sortMenuOpen);
            }}
          >
            <ArrowUpDownIcon size={16} />
            <div>
              {viewSorts.length > 0
                ? `Sorted by ${viewSorts.length} ${viewSorts.length > 1 ? "fields" : "field"}`
                : "Sort"}
            </div>
          </button>
          {sortMenuOpen && viewSorts.length === 0 && <SortMenu />}
          {sortMenuOpen && (viewSorts.length ?? 0) > 0 && <SortView />}
        </div>
        <div
          className="relative flex cursor-pointer items-center justify-center gap-x-2 rounded-sm p-2 hover:bg-gray-200/60"
          ref={rowHeightMenuRef}
          onClick={() => {
            setRowHeightMenuOpen(!rowHeightMenuOpen);
          }}
        >
          <LineHeightIcon />
          {rowHeightMenuOpen && <RowHeightMenu />}
        </div>
      </div>
      <div className="relative" ref={searchMenuRef}>
        <button
          className="h- flex cursor-pointer items-center gap-x-2 rounded-sm p-2 text-gray-500 hover:text-gray-900"
          onClick={() => {
            setSearchMenuOpen(!searchMenuOpen);
          }}
        >
          <SearchIcon size={16} />
        </button>
        {searchMenuOpen && <SearchInput />}
      </div>
    </div>
  );
}

function RowHeightMenu() {
  const { setRowHeight, rowHeight } = useAppContext();
  return (
    <div className="absolute top-full mt-1">
      <div className="w-60 rounded-sm border bg-white shadow-sm">
        <div className="p-2">select a row height</div>
        <div
          className={`flex cursor-pointer items-center gap-x-2 p-2 hover:bg-gray-200/60 ${rowHeight === 2 ? "text-blue-500" : ""
            }`}
          onClick={() => setRowHeight(2)}
        >
          <Rows4Icon size={16} />
          <div>Short</div>
        </div>
        <div
          className={`flex cursor-pointer items-center gap-x-2 p-2 hover:bg-gray-200/60 ${rowHeight === 4 ? "text-blue-500" : ""
            }`}
          onClick={() => setRowHeight(4)}
        >
          <Rows3Icon size={16} />
          <div>Medium</div>
        </div>
        <div
          className={`flex cursor-pointer items-center gap-x-2 p-2 hover:bg-gray-200/60 ${rowHeight === 6 ? "text-blue-500" : ""
            }`}
          onClick={() => setRowHeight(6)}
        >
          <Rows2Icon size={16} />
          <div>Tall</div>
        </div>
        <div
          className={`flex cursor-pointer items-center gap-x-2 p-2 hover:bg-gray-200/60 ${rowHeight === 8 ? "text-blue-500" : ""
            }`}
          onClick={() => setRowHeight(8)}
        >
          <LineHeightIcon />
          <div>Extra Tall</div>
        </div>
      </div>
    </div>
  );
}

function HideMenu() {
  const { localColumns, columnVisibility, setColumnVisibility } = useAppContext();
  const [filteredColumns, setFilteredColumns] = useState(localColumns);
  return (
    <div className="absolute top-full mt-1">
      <div className="w-60 rounded-sm border bg-white shadow-sm p-2">

        {/* search bar to filter */}
        <div className="flex items-center gap-x-2">
          <input
            placeholder="Find a field"
            className="w-full p-1 focus:outline-none border-b-2 mb-2"
            onChange={(e) => {
              setFilteredColumns(
                localColumns.filter((col) =>
                  col.name.toLowerCase().includes(e.target.value.toLowerCase()),
                ),
              );
            }}
          />
        </div>
        {filteredColumns.map((col) => (
          <div key={col.id} className="flex items-center gap-x-2 px-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={columnVisibility[col.id] ?? true}
                onChange={() => {
                  setColumnVisibility({
                    ...columnVisibility,
                    [col.id]: !columnVisibility[col.id],
                  });
                }}
              />
              <div className="w-4 h-2 bg-gray-200 rounded-full peer peer-checked:bg-green-600 dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.1 after:left-[0px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-2 after:w-2 after:transition-all"></div>
            </label>
            <div>{col.name}</div>
          </div>
        ))}
        <div className="flex justify-between mt-2 gap-x-2">
          <button
            className="bg-gray-200/50 hover:bg-gray-200/70 w-full p-1 rounded-sm text-gray-500 hover:text-gray-700"
            onClick={() => {
              const newVisibility = localColumns.reduce((acc, col) => {
                acc[col.id] = false;
                return acc;
              }, {} as Record<string, boolean>);
              setColumnVisibility(newVisibility);
            }}
          >
            Hide All
          </button>
          <button
            className="bg-gray-200/50 hover:bg-gray-200/70 w-full p-1 rounded-sm text-gray-500 hover:text-gray-700"
            onClick={() => {
              const newVisibility = localColumns.reduce((acc, col) => {
                acc[col.id] = true;
                return acc;
              }, {} as Record<string, boolean>);
              setColumnVisibility(newVisibility);
            }}
          >
            Show All
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchableList({
  items,
  onItemSelect,
}: {
  items: { id: string; name: string; type: string }[];
  onItemSelect: (item: { id: string; name: string; type: string }) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex max-h-52 flex-col">
      <div className="flex items-center gap-x-2">
        <SearchIcon size={16} className="text-blue-500" />
        <input
          placeholder="Find a field"
          className="w-full p-2 focus:outline-none"
          autoFocus
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex max-h-80 flex-col overflow-auto">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onItemSelect(item)}
              className="flex items-center gap-x-2 rounded-sm p-2 hover:bg-gray-200/60 cursor-pointer"
            >
              {item.type === "text" ? <CaseUpperIcon size={16} /> : <HashIcon size={12} />} <div>{item.name}</div>
            </div>
          ))
        ) : (
          <div className="p-2 text-gray-500">No results</div>
        )}
      </div>
    </div>
  );
}

function SortMenu() {
  const { localColumns, selectedView } = useAppContext();
  const { addSort } = useSortFilterManagement(selectedView?.id ?? "");

  return (
    <div className="absolute top-full mt-1 flex min-w-80 flex-col gap-y-3 rounded-sm border bg-white p-4 text-xs shadow-lg">
      <div className="border-b pb-2 text-xs font-semibold text-gray-600">
        Sort by
      </div>
      <SearchableList
        items={localColumns}
        onItemSelect={(column) => {
          addSort({
            viewId: selectedView?.id ?? "",
            columnId: column.id,
            desc: false,
          });
        }}
      />
    </div>
  );
}

function SortView() {
  const { localColumns, selectedView } = useAppContext();
  const { viewSorts, addSort, unsortedColumns } = useSortFilterManagement(
    selectedView?.id ?? "",
  );

  return (
    <div className="absolute top-full z-40 mt-1 flex min-w-80 flex-col gap-y-3 rounded-sm border bg-white p-4 text-xs shadow-lg">
      <div className="border-b pb-2 text-xs font-semibold text-gray-600">
        Sort by
      </div>
      <div className="l flex w-full flex-col items-center justify-between gap-x-2 gap-y-2">
        {viewSorts
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          )
          .map((sort) => (
            <SortItem
              key={sort.columnId}
              colId={sort.columnId}
              colName={
                localColumns.find((col) => col.id === sort.columnId)?.name ?? ""
              }
              colType={
                localColumns.find((col) => col.id === sort.columnId)?.type ?? ""
              }
            />
          ))}
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (unsortedColumns.length > 0) {
              addSort({
                viewId: selectedView?.id ?? "",
                columnId: unsortedColumns[0]?.id ?? "",
                desc: false,
              });
            } else {
              alert("No more columns available to sort");
            }
          }}
          className="flex items-center justify-between gap-x-2 text-gray-500 hover:text-gray-700"
        >
          <PlusIcon size={16}></PlusIcon>
          <span>Add another sort</span>
        </button>
      </div>
    </div>
  );
}

function SearchInput() {
  const {
    globalFilter,
    setGlobalFilter,
    matchedCells,
    currentMatchIndex,
    goToNextMatch,
    goToPrevMatch,
    selectedView
  } = useAppContext(); // Or wherever these are exposed

  const { data: totalMatches, isLoading } = api.table.getTotalMatches.useQuery({
    tableId: selectedView?.tableId ?? "",
    search: globalFilter ?? undefined,
  }, {
    enabled: !!globalFilter
  });

  useEffect(() => {
    if (globalFilter) {
      setGlobalFilter(globalFilter);
    }
  }, [globalFilter, setGlobalFilter]);

  return (
    <div
      id="search-input"
      className="absolute right-0 top-full mt-2 bg-white shadow-sm flex"
    >
      <div className="flex w-80 items-center border p-2">
        <input
          className="h-full w-full text-xs focus:outline-none"
          placeholder="Find in view"
          autoFocus
          value={globalFilter ?? ""}
          onFocus={(e) => {
            setGlobalFilter(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setGlobalFilter("");
              (e.target as HTMLInputElement).value = "";
            }
          }}
          onChange={(e) => {
            setGlobalFilter(e.target.value);
          }}
        />
        {!!globalFilter && (isLoading ? (
          <div className="text-nowrap mr-2 text-gray-400 flex items-center animate-spin">
            <Loader2Icon size={16} />
          </div>
        ) : (totalMatches?.totalMatches ?? matchedCells.length) < 1 ? (
          <div className="text-nowrap mr-2 text-gray-400">No matches</div>
        ) : (
          <>
            <span className="text-nowrap mr-2 text-gray-400">
              {(totalMatches?.totalMatches ?? matchedCells.length) === 1
                ? "1 cell found"
                : `${totalMatches?.totalMatches ?? matchedCells.length} cells found`}
            </span>
            {/* <div className="flex items-center">
              <button onClick={goToPrevMatch} className="bg-gray-200 hover:bg-gray-200/70 p-1 rounded-[2px]" disabled={currentMatchIndex === 0}>
                <ChevronUpIcon size={12} />
              </button>
              <button onClick={goToNextMatch} className="bg-gray-200 hover:bg-gray-200/70 p-1 rounded-[2px]">
                <ChevronDownIcon size={12} />
              </button>
            </div> */}
          </>
        ))}
        <XIcon
          size={20}
          className="cursor-pointer text-gray-500 hover:text-gray-900 ml-2"
          onClick={() => {
            const searchInput = document.getElementById("search-input");
            if (searchInput) {
              searchInput.classList.toggle("hidden");
            }
            setGlobalFilter(null);
          }}
        />
      </div>
    </div>
  );
}

function SortItem({
  colId,
  colName,
  colType,
}: {
  colId: string;
  colName: string;
  colType: string;
}) {
  const { selectedView, localColumns } = useAppContext();
  const [selectedColumn, setSelectedColumn] = useState({
    id: colId,
    name: colName,
    type: colType,
  });
  const [isColumnSelectOpen, setIsColumnSelectOpen] = useState(false);
  const { viewSorts, addSort, deleteSort, updateSort } =
    useSortFilterManagement(selectedView?.id ?? "");

  return (
    <div className="relative flex w-full items-center gap-x-2">
      <button
        onClick={() => {
          setIsColumnSelectOpen(!isColumnSelectOpen);
        }}
        className="flex w-60 items-center justify-between gap-x-2 rounded-sm border p-2 hover:bg-gray-100"
      >
        <div>{selectedColumn.name}</div>
        <ChevronDown size={16} />
      </button>
      {isColumnSelectOpen && (
        <div className="absolute top-full z-20 mt-1 w-60 rounded-md border bg-white p-2 shadow-md">
          <SearchableList
            items={localColumns}
            onItemSelect={(column) => {
              // Do nothing if selected column is same as current column
              if (column.id === selectedColumn.id) {
                setIsColumnSelectOpen(false);
                return;
              }

              deleteSort({
                viewId: selectedView?.id ?? "",
                columnId: selectedColumn.id,
              });
              addSort({
                viewId: selectedView?.id ?? "",
                columnId: column.id,
                desc: false,
              });
              setIsColumnSelectOpen(!isColumnSelectOpen);
              setSelectedColumn({
                id: column.id,
                name: column.name,
                type: column.type,
              });
            }}
          />
        </div>
      )}
      <select
        className="flex w-28 items-center justify-between gap-x-2 rounded-sm border p-2 hover:bg-gray-100"
        value={
          viewSorts.find((sort) => sort.columnId === selectedColumn.id)?.desc
            ? "desc"
            : "asc"
        }
        onChange={(e) => {
          updateSort({
            columnId: selectedColumn.id,
            desc: e.target.value === "desc",
            viewId: selectedView?.id ?? "",
          });
        }}
      >
        {selectedColumn.type === "text" ? (
          <>
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </>
        ) : selectedColumn.type === "number" ? (
          <>
            <option value="asc">0-9</option>
            <option value="desc">9-0</option>
          </>
        ) : null}
      </select>
      <button
        className="flex items-center gap-x-2 rounded-sm p-2 hover:bg-gray-100"
        onClick={() => {
          deleteSort({
            viewId: selectedView?.id ?? "",
            columnId: selectedColumn.id,
          });
        }}
      >
        <XIcon size={16} />
      </button>
    </div>
  );
}

function FilterMenu() {
  const { localColumns, selectedView } = useAppContext();
  const { addFilter, viewFilters, unfilteredColumns } =
    useSortFilterManagement(selectedView?.id ?? "");
  return (
    <div className="absolute top-full mt-1 flex w-max min-w-96 rounded-sm border bg-white p-4 text-xs shadow-lg">
      <div className="relative flex h-full w-full flex-col gap-y-3 text-xs text-gray-500">
        {viewFilters.length === 0 ? (
          <span>No filter conditions are applied</span>
        ) : (
          <span>In this view, show records</span>
        )}
        {viewFilters
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) // Sort by createdAt to ensure order
          .map((filter) => (
            <FilterItem
              key={filter.columnId}
              colId={filter.columnId}
              colName={
                localColumns.find((col) => col.id === filter.columnId)?.name ?? ""
              }
              colType={
                localColumns.find((col) => col.id === filter.columnId)?.type ?? ""
              }
              value={filter.value ?? null}
            />
          ))}
        <div className="flex items-center gap-x-5">
          <button
            className="flex items-center gap-x-2 text-blue-500"
            onClick={() => {
              if (unfilteredColumns.length === 0) {
                alert("No more columns available to filter");
                return;
              } else {
                addFilter({
                  viewId: selectedView?.id ?? "",
                  columnId: unfilteredColumns[0]?.id ?? "",
                  operator: unfilteredColumns[0]?.type === "number" ? "eq" : "includesString",
                  value: "",
                });
              }
            }}
          >
            <PlusIcon size={16} />
            <span>Add condition</span>
          </button>
          <button
            className="flex items-center gap-x-2"
            onClick={() => {
              alert("Not implemented");
            }}
          >
            <PlusIcon size={16} />
            <span>Add condition group</span>
          </button>{" "}
        </div>
      </div>
    </div>
  );
}

function FilterItem({
  colId,
  colName,
  colType,
  value,
}: {
  colId: string;
  colName: string;
  colType: string;
  value: string | null;
}) {
  const { selectedView, localColumns } = useAppContext();
  const [selectedColumn, setSelectedColumn] = useState({
    id: colId,
    name: colName,
    type: colType,
  });

  const { viewFilters, addFilter, deleteFilter, updateFilter } =
    useSortFilterManagement(selectedView?.id ?? "");

  const [filterValue, setFilterValue] = useState(value);
  const [operator, setOperator] = useState('');
  const [isColumnSelectOpen, setIsColumnSelectOpen] = useState(false);

  useEffect(() => {
    const existingFilter = viewFilters.find((f) => f.columnId === colId);
    if (existingFilter?.operator) {
      setOperator(existingFilter.operator);
    } else {
      setOperator(selectedColumn.type === "number" ? "eq" : "includesString");
    }
  }, [colId, selectedColumn, viewFilters]);

  const handleFilterChange = (newValue: string) => {
    setFilterValue(newValue);
    updateFilter({
      columnId: selectedColumn.id,
      value: newValue,
      operator, // removed fallback
      viewId: selectedView?.id ?? "",
    });
  };

  const handleOperatorChange = (newOperator: string) => {
    setOperator(newOperator);
    const filter = {
      columnId: selectedColumn.id,
      value: filterValue,
      operator: newOperator,
      viewId: selectedView?.id ?? "",
    };
    updateFilter(filter as any);
  };

  return (
    <div className="flex w-full items-center">
      <span className="mr-2">{viewFilters.findIndex(filter => filter.columnId === colId) === 0 ? <span className="w-max p-2">where</span> : <select className="w-max border p-2"
      >
        <option value="or">or</option>
      </select>}</span>
      <div className="relative">
        <button
          onClick={() => setIsColumnSelectOpen(!isColumnSelectOpen)}
          className="flex w-60 items-center justify-between gap-x-2 border p-2 hover:bg-gray-100"
        >
          <div>{selectedColumn.name}</div>
          <ChevronDown size={16} />
        </button>
        {isColumnSelectOpen && (
          <div className="absolute top-full z-20 mt-1 w-60 rounded-md border bg-white p-2 shadow-md">
            <SearchableList
              items={localColumns}
              onItemSelect={(column) => {
                // Do nothing if selected column is same as current column
                if (column.id === selectedColumn.id) {
                  setIsColumnSelectOpen(false);
                  return;
                }

                deleteFilter({
                  viewId: selectedView?.id ?? "",
                  columnId: selectedColumn.id,
                });
                addFilter({
                  viewId: selectedView?.id ?? "",
                  columnId: column.id,
                  operator: column.type === "number" ? "eq" : "includesString",
                  value: "",
                });

                setIsColumnSelectOpen(!isColumnSelectOpen);
                setSelectedColumn({
                  id: column.id,
                  name: column.name,
                  type: column.type,
                });
                setFilterValue("");
              }}
            />
          </div>
        )}
      </div>
      <select
        className="w-32 border-y border-r p-2"
        value={operator || viewFilters.find(filter => filter.columnId === colId)?.operator}
        onChange={(e) => handleOperatorChange(e.target.value)}
      >
        {selectedColumn.type === "number" ? (
          <>
            <option value="eq">equals</option>
            <option value="gt">greater than</option>
            <option value="lt">less than</option>
            <option value="empty">is empty</option>
            <option value="notEmpty">is not empty</option>
          </>
        ) : (
          <>
            <option value="includesString">contains</option>
            <option value="empty2">is empty</option>
            <option value="notEmpty2">is not empty</option>
          </>
        )}
      </select>
      {operator !== 'empty' && operator !== 'notEmpty' ? (
        <input
          className="w-32 border-y border-r p-2"
          value={filterValue ?? ""}
          onChange={(e) => {
            handleFilterChange(e.target.value);
          }}
          placeholder="Enter value..."
        />
      ) :
        <div className="w-32 border-y border-r p-2 text-white">.</div>}
      <button
        className="flex w-max items-center justify-center border-y border-r p-2 text-gray-500"
        onClick={() => {
          deleteFilter({
            viewId: selectedView?.id ?? "",
            columnId: selectedColumn.id,
          });
        }}
      >
        <Trash2Icon size={16} strokeWidth={1} />
      </button>
    </div>
  );
}
