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
} from "lucide-react";
import { api } from "@/trpc/react";
import { useState, useEffect, use } from "react";
import { LineHeightIcon } from "@radix-ui/react-icons";
import { useAppContext } from "../context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TableHead({ tableId }: { tableId: string }) {
  const ctx = api.useUtils();
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [searchMenuOpen, setSearchMenuOpen] = useState(false);
  const [rowHeightMenuOpen, setRowHeightMenuOpen] = useState(false);
  const {
    isViewsOpen,
    setIsViewsOpen,
    selectedView,
    sortItems,
    setSortItems,
    sortViewOpen,
    setSortViewOpen,
  } = useAppContext();

  const viewSorts = api.table.getViewSorts.useQuery({
    viewId: selectedView?.id ?? "",
  });

  return (
    <div className="flex w-full items-center justify-between border-b border-gray-300 p-2 text-xs text-gray-700">
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
          <div>{selectedView?.name}</div>
        </button>
        <div>|</div>
        <div className="flex cursor-pointer items-center gap-x-2 rounded-sm p-2 hover:bg-gray-200/60">
          <EyeOffIcon size={16} />
          <div>Hide</div>
        </div>
        <div className="flex cursor-pointer items-center gap-x-2 rounded-sm p-2 hover:bg-gray-200/60">
          <ListFilterIcon size={16} />
          <div>Filter</div>
        </div>
        <div className="flex cursor-pointer items-center gap-x-2 rounded-sm p-2 hover:bg-gray-200/60">
          <GroupIcon size={16} />
          <div>Group</div>
        </div>
        <div className="relative">
          <button
            className={`flex cursor-pointer items-center justify-center gap-x-1 rounded-sm p-2 ${viewSorts.data && viewSorts.data.length > 0 ? "bg-blue-200/80 hover:bg-blue-200" : "hover:bg-gray-200/60"}`}
            onClick={() => {
              void ctx.table.getData.invalidate({ tableId });
              if (viewSorts.data && viewSorts.data.length > 0) {
                setSortViewOpen(!sortViewOpen);
                setSortItems(
                  viewSorts.data.map((sort) => (
                    <SortItem
                      key={sort.columnId}
                      colId={sort.columnId}
                      colName={sort.columnId}
                      colType={sort.columnId}
                    />
                  )),
                );
              }
              setSortMenuOpen(!sortMenuOpen);
            }}
          >
            <ArrowUpDownIcon size={16} />
            <div>
              {viewSorts.data && viewSorts.data.length > 0
                ? `Sorted by ${viewSorts.data.length} ${viewSorts.data.length > 1 ? "fields" : "field"}`
                : "Sort"}
            </div>
          </button>
          {sortMenuOpen && <SortMenu />}
        </div>
        <div className="flex cursor-pointer items-center gap-x-2 rounded-sm p-2 hover:bg-gray-200/60">
          <PaintBucketIcon size={16} />
          <div>Color</div>
        </div>
        <button
          className="relative flex cursor-pointer items-center justify-center gap-x-2 rounded-sm p-2 hover:bg-gray-200/60"
          onClick={() => {
            setRowHeightMenuOpen(!rowHeightMenuOpen);
          }}
        >
          <LineHeightIcon />
          {rowHeightMenuOpen && <RowHeightMenu />}
        </button>
        <div className="h- flex cursor-pointer items-center gap-x-2 rounded-sm p-2 hover:bg-gray-200/60">
          <ShareIcon size={16} />
          <div>Share</div>
        </div>
      </div>
      <div className="relative">
        <button
          className="h- flex cursor-pointer items-center gap-x-2 rounded-sm p-2 text-gray-500 hover:text-gray-900"
          onClick={() => {
            void ctx.table.getData.invalidate({ tableId });
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
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onItemSelect(item)}
            className="flex items-center gap-x-2 rounded-sm p-2 hover:bg-gray-200/60"
          >
            <div>{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SortMenu() {
  const {
    localColumns,
    sortViewOpen,
    setSortViewOpen,
    sortItems,
    setSortItems,
    selectedView,
  } = useAppContext();
  const ctx = api.useUtils();

  const { mutate: addSort } = api.table.addSort.useMutation({
    onMutate: async (variables) => {
      await ctx.table.getViewSorts.cancel();
      const previousSorts = ctx.table.getViewSorts.getData({
        viewId: selectedView?.id ?? "",
      });
      ctx.table.getViewSorts.setData(
        { viewId: selectedView?.id ?? "" },
        (old) => [
          ...(old ?? []),
          {
            ...variables,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      );
      return { previousSorts };
    },
    onError: (err, variables, context) => {
      ctx.table.getViewSorts.setData(
        { viewId: selectedView?.id ?? "" },
        context?.previousSorts,
      );
    },
    onSettled: () => {
      void ctx.table.getViewSorts.invalidate();
    },
  });

  return (
    <div className="absolute top-full z-40 mt-1 flex min-w-80 flex-col gap-y-3 rounded-sm border bg-white p-4 text-xs shadow-lg">
      <div className="border-b pb-2 text-xs font-semibold text-gray-600">
        Sort by
      </div>
      {!sortViewOpen && (
        <SearchableList
          items={localColumns}
          onItemSelect={(column) => {
            setSortViewOpen(!sortViewOpen);
            addSort({
              viewId: selectedView?.id ?? "",
              columnId: column.id,
              desc: false,
            });
            setSortItems([
              ...sortItems,
              <SortItem
                key={column.id}
                colId={column.id}
                colName={column.name}
                colType={column.type}
              />,
            ]);
          }}
        />
      )}
      {sortViewOpen && <SortView />}
    </div>
  );
}

function SortView() {
  const {
    setTempCol,
    localColumns,
    sortItems,
    setSortItems,
    flag,
    setFlag,
    selectedView,
  } = useAppContext();
  const ctx = api.useUtils();

  const { mutate: addSort } = api.table.addSort.useMutation({
    onMutate: async (variables) => {
      await ctx.table.getViewSorts.cancel();
      const previousSorts = ctx.table.getViewSorts.getData({
        viewId: selectedView?.id ?? "",
      });
      ctx.table.getViewSorts.setData(
        { viewId: selectedView?.id ?? "" },
        (old) => [
          ...(old ?? []),
          {
            ...variables,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      );
      return { previousSorts };
    },
    onError: (err, variables, context) => {
      ctx.table.getViewSorts.setData(
        { viewId: selectedView?.id ?? "" },
        context?.previousSorts,
      );
    },
    onSettled: () => {
      void ctx.table.getViewSorts.invalidate();
    },
  });

  return (
    <div className="flex h-max w-full flex-col gap-y-2">
      {sortItems.map((item, index) => (
        <SortItem
          key={index}
          colId={item.key ?? ""}
          colName={localColumns.find((col) => col.id === item.key)?.name ?? ""}
          colType={localColumns.find((col) => col.id === item.key)?.type ?? ""}
        />
      ))}
      <div className="flex w-full items-center justify-between gap-x-2">
        <button
          onClick={() => {
            const newTempCol = localColumns.find(
              (col) => !sortItems.find((item) => item.key === col.id),
            );
            addSort({
              viewId: selectedView?.id ?? "",
              columnId: newTempCol?.id ?? "",
              desc: false,
            });
            if (newTempCol) {
              setTempCol(newTempCol);
              setSortItems([
                ...sortItems,
                <SortItem
                  key={newTempCol.id}
                  colId={newTempCol.id}
                  colName={newTempCol.name}
                  colType={newTempCol.type}
                />,
              ]);
            }
            setFlag(!flag);
          }}
          className="flex w-max items-center gap-x-2 rounded-sm p-2 text-gray-500 hover:text-gray-700"
        >
          <PlusIcon size={16} />
          <div className="flex items-center gap-x-2">Add another sort</div>
        </button>
        <button
          className="flex w-max items-center gap-x-2 rounded-sm p-2 text-gray-500 hover:text-gray-700"
          onClick={() => {
            console.log("clear");
          }}
        >
          <XIcon size={16} />
          Clear all sorts
        </button>
      </div>
    </div>
  );
}

function SearchInput() {
  const { setGlobalFilter } = useAppContext();
  const ctx = api.useUtils();
  return (
    <div
      id="search-input"
      className="absolute right-0 top-full mt-2 bg-white shadow-sm"
    >
      <div className="flex w-80 items-center border p-2">
        <input
          className="h-full w-full text-xs focus:outline-none"
          placeholder="Find in view"
          onFocus={(e) => {
            setGlobalFilter("");
            void ctx.table.getData.invalidate();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              void ctx.table.getData.invalidate();
              setGlobalFilter("");
              (e.target as HTMLInputElement).value = "";
            }
          }}
          onChange={(e) => {
            setGlobalFilter(e.target.value);
          }}
        />
        <XIcon
          size={20}
          className="cursor-pointer text-gray-500 hover:text-gray-900"
          onClick={() => {
            const searchInput = document.getElementById("search-input");
            if (searchInput) {
              searchInput.classList.toggle("hidden");
            }
            setGlobalFilter("");
          }}
        />
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
          className={`flex cursor-pointer items-center gap-x-2 p-2 hover:bg-gray-200/60 ${
            rowHeight === 2 ? "text-blue-500" : ""
          }`}
          onClick={() => setRowHeight(2)}
        >
          <Rows4Icon size={16} />
          <div>Short</div>
        </div>
        <div
          className={`flex cursor-pointer items-center gap-x-2 p-2 hover:bg-gray-200/60 ${
            rowHeight === 4 ? "text-blue-500" : ""
          }`}
          onClick={() => setRowHeight(4)}
        >
          <Rows3Icon size={16} />
          <div>Medium</div>
        </div>
        <div
          className={`flex cursor-pointer items-center gap-x-2 p-2 hover:bg-gray-200/60 ${
            rowHeight === 6 ? "text-blue-500" : ""
          }`}
          onClick={() => setRowHeight(6)}
        >
          <Rows2Icon size={16} />
          <div>Tall</div>
        </div>
        <div
          className={`flex cursor-pointer items-center gap-x-2 p-2 hover:bg-gray-200/60 ${
            rowHeight === 8 ? "text-blue-500" : ""
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

function SortItem({
  colId,
  colName,
  colType,
}: {
  colId: string;
  colName: string;
  colType: string;
}) {
  const {
    sortViewOpen,
    setSortViewOpen,
    sortItems,
    sorting,
    setSortItems,
    selectedView,
    colsNotInSort,
  } = useAppContext();
  const [selectedColumn, setSelectedColumn] = useState({
    id: colId,
    name: colName,
    type: colType,
  });
  const [isColumnSelectOpen, setIsColumnSelectOpen] = useState(false);

  const ctx = api.useUtils();

  const { mutate: deleteSort } = api.table.deleteSort.useMutation({
    onMutate: async (variables) => {
      await ctx.table.getViewSorts.cancel();
      const previousSorts = ctx.table.getViewSorts.getData({
        viewId: selectedView?.id ?? "",
      });
      ctx.table.getViewSorts.setData(
        { viewId: selectedView?.id ?? "" },
        (old) =>
          old?.filter((sort) => sort.columnId !== variables.columnId) ?? [],
      );
      return { previousSorts };
    },
    onError: (err, variables, context) => {
      ctx.table.getViewSorts.setData(
        { viewId: selectedView?.id ?? "" },
        context?.previousSorts,
      );
    },
    onSettled: () => {
      void ctx.table.getViewSorts.invalidate({
        viewId: selectedView?.id ?? "",
      });
    },
  });

  const { mutate: addSort } = api.table.addSort.useMutation({
    onMutate: async (variables) => {
      await ctx.table.getViewSorts.cancel();
      const previousSorts = ctx.table.getViewSorts.getData({
        viewId: selectedView?.id ?? "",
      });
      ctx.table.getViewSorts.setData(
        { viewId: selectedView?.id ?? "" },
        (old) => [
          ...(old ?? []),
          {
            ...variables,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      );
      return { previousSorts };
    },
    onError: (err, variables, context) => {
      ctx.table.getViewSorts.setData(
        { viewId: selectedView?.id ?? "" },
        context?.previousSorts,
      );
    },
    onSettled: () => {
      void ctx.table.getViewSorts.invalidate();
    },
  });

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
            items={colsNotInSort}
            onItemSelect={(column) => {
              addSort({
                viewId: selectedView?.id ?? "",
                columnId: column.id,
                desc: false,
              });
              deleteSort({
                viewId: selectedView?.id ?? "",
                columnId: selectedColumn.id,
              });
              setSortItems(
                sortItems
                  .filter((item) => item.key !== colId)
                  .concat(
                    <SortItem
                      key={column.id}
                      colId={column.id}
                      colName={column.name}
                      colType={column.type}
                    />,
                  ),
              );
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-28 items-center justify-between gap-x-2 rounded-sm border p-2 hover:bg-gray-100">
            <button className="ga p-x-2 flex items-center rounded-sm hover:bg-gray-100">
              {sorting.find((sort) => sort.id === selectedColumn.id)?.desc
                ? selectedColumn.type === "number"
                  ? "9-0"
                  : "Z-A"
                : selectedColumn.type === "number"
                  ? "0-9"
                  : "A-Z"}
            </button>
            <ChevronDown size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {selectedColumn.type === "text" ? (
            <>
              <DropdownMenuItem
                onClick={() => {
                  console.log("sort");
                }}
              >
                A-Z
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  console.log("sort");
                }}
              >
                Z-A
              </DropdownMenuItem>
            </>
          ) : selectedColumn.type === "number" ? (
            <>
              <DropdownMenuItem
                onClick={() => {
                  console.log("sort");
                }}
              >
                0-9
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log("sort")}>
                9-0
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <button
        className="flex items-center gap-x-2 rounded-sm p-2 hover:bg-gray-100"
        onClick={() => {
          deleteSort({
            viewId: selectedView?.id ?? "",
            columnId: selectedColumn.id,
          });

          if (sortItems.length === 1) {
            setSortViewOpen(!sortViewOpen);
          }
        }}
      >
        <XIcon size={16} />
      </button>
    </div>
  );
}
