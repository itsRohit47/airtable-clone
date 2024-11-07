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
} from "lucide-react";
import { LineHeightIcon, HeightIcon } from "@radix-ui/react-icons";
import { useAppContext } from "../context";
export default function TableHead({ tableId }: { tableId: string }) {
  return (
    <div className="flex w-full items-center justify-between border-b border-gray-300 p-2 text-xs text-gray-700">
      <div className="flex items-center gap-x-3">
        <div className="flex cursor-pointer items-center gap-x-2 rounded-md p-2 hover:bg-gray-200/60">
          {" "}
          <ListIcon size={16} />
          <div>View</div>
        </div>
        <div>|</div>
        <div className="flex cursor-pointer items-center gap-x-2 rounded-md p-2 hover:bg-gray-200/60">
          <Grid2X2Icon size={16} />
          <div>Grid</div>
        </div>
        <div className="flex cursor-pointer items-center gap-x-2 rounded-md p-2 hover:bg-gray-200/60">
          <EyeOffIcon size={16} />
          <div>Hide</div>
        </div>
        <div className="flex cursor-pointer items-center gap-x-2 rounded-md p-2 hover:bg-gray-200/60">
          <ListFilterIcon size={16} />
          <div>Filter</div>
        </div>
        <div className="flex cursor-pointer items-center gap-x-2 rounded-md p-2 hover:bg-gray-200/60">
          <GroupIcon size={16} />
          <div>Group</div>
        </div>
        <div className="flex cursor-pointer items-center gap-x-2 rounded-md p-2 hover:bg-gray-200/60">
          <ArrowUpDownIcon size={16} />
          <div>Sort</div>
        </div>
        <div className="flex cursor-pointer items-center gap-x-2 rounded-md p-2 hover:bg-gray-200/60">
          <PaintBucketIcon size={16} />
          <div>Color</div>
        </div>
        <div
          className="relative flex cursor-pointer items-center justify-center gap-x-2 rounded-md p-2 hover:bg-gray-200/60"
          onClick={() => {
            const rowHeightMenu = document.getElementById("row-height-menu");
            if (rowHeightMenu) {
              rowHeightMenu.classList.toggle("hidden");
            }
          }}
        >
          <HeightIcon />
          <RowHeightMenu />
        </div>
        <div className="h- flex cursor-pointer items-center gap-x-2 rounded-md p-2 hover:bg-gray-200/60">
          <ShareIcon size={16} />
          <div>Share</div>
        </div>
      </div>
      <div className="relative">
        <div
          className="h- flex cursor-pointer items-center gap-x-2 rounded-md p-2 text-gray-500 hover:text-gray-900"
          onClick={() => {
            const searchInput = document.getElementById("search-input");
            if (searchInput) {
              searchInput.classList.toggle("hidden");
              searchInput.querySelector("input")?.focus();
            }
          }}
        >
          <SearchIcon size={16} />
        </div>
        <SearchInput />
      </div>
    </div>
  );
}

function SearchInput() {
  const { setGlobalFilter } = useAppContext();
  return (
    <div
      id="search-input"
      className="absolute right-0 top-full mt-2 hidden bg-white shadow-sm"
    >
      <div className="flex w-80 items-center border p-2">
        <input
          className="h-full w-full text-xs focus:outline-none"
          placeholder="Find in view"
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
    <div className="absolute top-full mt-1 hidden" id="row-height-menu">
      <div className="w-60 rounded-sm border bg-white shadow-sm">
        <div className="p-2">select a row height</div>

        <div
          className={`flex cursor-pointer items-center gap-x-2 p-2 hover:bg-gray-200/60 ${
            rowHeight === 6 ? "text-blue-500" : ""
          }`}
          onClick={() => setRowHeight(6)}
        >
          <Rows4Icon size={16} />
          <div>Short</div>
        </div>
        <div
          className={`flex cursor-pointer items-center gap-x-2 p-2 hover:bg-gray-200/60 ${
            rowHeight === 8 ? "text-blue-500" : ""
          }`}
          onClick={() => setRowHeight(8)}
        >
          <Rows3Icon size={16} />
          <div>Medium</div>
        </div>
        <div
          className={`flex cursor-pointer items-center gap-x-2 p-2 hover:bg-gray-200/60 ${
            rowHeight === 12 ? "text-blue-500" : ""
          }`}
          onClick={() => setRowHeight(12)}
        >
          <Rows2Icon size={16} />
          <div>Tall</div>
        </div>
        <div
          className={`flex cursor-pointer items-center gap-x-2 p-2 hover:bg-gray-200/60 ${
            rowHeight === 20 ? "text-blue-500" : ""
          }`}
          onClick={() => setRowHeight(20)}
        >
          <LineHeightIcon />
          <div>Extra Tall</div>
        </div>
      </div>
    </div>
  );
}
