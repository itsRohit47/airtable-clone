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
import { useState, useEffect } from "react";
import { LineHeightIcon } from "@radix-ui/react-icons";
import { useAppContext } from "../context";
import { useSortColumn } from "@/lib/utils";
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
    setSelectedView,
    sorting,
  } = useAppContext();
  const views = api.table.getViewsByTableId.useQuery({ tableId });
  setSelectedView(
    views.data?.find((view) => view.selected) ?? views.data?.[0] ?? null,
  );

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
            className={`flex cursor-pointer items-center justify-center gap-x-1 rounded-sm p-2 ${sorting.length > 0 ? "bg-blue-200/80 hover:bg-blue-200" : "hover:bg-gray-200/60"}`}
            onClick={() => {
              void ctx.table.getData.invalidate({ tableId });
              setSortMenuOpen(!sortMenuOpen);
            }}
          >
            <ArrowUpDownIcon size={16} />
            <div>
              {sorting.length > 0
                ? `Sorted by ${sorting.length} ${sorting.length > 1 ? "fields" : "field"}`
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
    tempCol,
    setTempCol,
    setSortItems,
  } = useAppContext();
  const [filteredColumns, setFilteredColumns] = useState(localColumns);
  const { toggleSort, setSort, clearSort } = useSortColumn();

  return (
    <div className="absolute top-full z-40 mt-1 flex min-w-80 flex-col gap-y-3 rounded-sm border bg-white p-4 text-xs shadow-lg">
      <div className="border-b pb-2 text-xs font-semibold text-gray-600">
        Sort by
      </div>
      {!sortViewOpen && (
        <SearchableList
          items={filteredColumns}
          onItemSelect={(column) => {
            setSortViewOpen(!sortViewOpen);
            setTempCol(column);
            setSortItems([<SortItem key={column.id} />]);
            setSort(column.id, "asc");
          }}
        />
      )}
      {sortViewOpen && (
        <SortView col={tempCol} filteredColumns={filteredColumns} />
      )}
    </div>
  );
}

function SortView({
  col,
  filteredColumns,
}: {
  col: { id: string; name: string; type: string };
  filteredColumns: { id: string; name: string; type: string }[];
}) {
  const {
    setTempCol,
    tempCol,
    localColumns,
    setLocalColumns,
    sortItems,
    setSortItems,
    flag,
    setFlag,
    sortViewOpen,
    setSortViewOpen,
  } = useAppContext();
  const { toggleSort, setSort, clearSort } = useSortColumn();

  return (
    <div className="flex h-max w-full flex-col gap-y-2">
      {sortItems.map((item, index) => (
        <SortItem key={index} />
      ))}
      <div className="flex w-full items-center justify-between gap-x-2">
        <button
          onClick={() => {
            const currentIndex = localColumns.findIndex(
              (col) => col.id === tempCol.id,
            );
            const newIndex = (currentIndex + 1) % localColumns.length;
            const newTempCol = localColumns[newIndex];
            if (newTempCol) {
              setTempCol(newTempCol);
            }
            if (!sortItems.some((item) => item.key === tempCol.id)) {
              setSortItems([...sortItems, <SortItem key={sortItems.length} />]);
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
            setSortItems([]);
            setTempCol({ id: "", name: "", type: "" });
            setFlag(!flag);
            setSortViewOpen(!sortViewOpen);
            clearSort();
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

function SortItem() {
  const {
    localColumns,
    sortViewOpen,
    setSortViewOpen,
    tempCol,
    setTempCol,
    sorting,
    setSorting,
    sortItems,
    setSortItems,
    flag,
    setFlag,
  } = useAppContext();
  const [filteredColumns, setFilteredColumns] = useState(localColumns);
  const [selectedColumn, setSelectedColumn] = useState(tempCol);
  const [isColumnSelectOpen, setIsColumnSelectOpen] = useState(false);
  const { toggleSort, setSort, clearSort } = useSortColumn();

  useEffect(() => {
    setSort(selectedColumn.id, "asc");
    console.log("sort item", selectedColumn.name);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flag]);

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
            items={filteredColumns.filter(
              (col) => !sorting.some((sort) => sort.id === col.id),
            )}
            onItemSelect={(column) => {
              sorting.pop();
              setSelectedColumn(column);
              setIsColumnSelectOpen(!isColumnSelectOpen);
              setSort(column.id, "asc");
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
                onClick={() => setSort(selectedColumn.id, "asc")}
              >
                A-Z
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSort(selectedColumn.id, "desc")}
              >
                Z-A
              </DropdownMenuItem>
            </>
          ) : selectedColumn.type === "number" ? (
            <>
              <DropdownMenuItem
                onClick={() => setSort(selectedColumn.id, "asc")}
              >
                0-9
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSort(selectedColumn.id, "desc")}
              >
                9-0
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <button
        className="flex items-center gap-x-2 rounded-sm p-2 hover:bg-gray-100"
        onClick={() => {
          sortItems.pop();
          sorting.pop();
          setSortItems([...sortItems]);
          if (sortItems.length === 0) {
            setSortViewOpen(!sortViewOpen);
          }
        }}
      >
        <XIcon size={16} />
      </button>
    </div>
  );
}
