import {
  ListIcon,
  Grid2X2Icon,
  EyeClosed,
  FilterIcon,
  GroupIcon,
  ArrowUpDownIcon,
  PaintBucketIcon,
  Rows2Icon,
  ShareIcon,
  SearchIcon,
} from "lucide-react";
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
          <EyeClosed size={16} />
          <div>Hide</div>
        </div>
        <div className="flex cursor-pointer items-center gap-x-2 rounded-md p-2 hover:bg-gray-200/60">
          <FilterIcon size={16} />
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
        <div className="flex cursor-pointer items-center gap-x-2 rounded-md p-2 hover:bg-gray-200/60">
          <Rows2Icon size={16} />
          <div>Rows</div>
        </div>
        <div className="flex cursor-pointer items-center gap-x-2 rounded-md p-2 hover:bg-gray-200/60">
          <ShareIcon size={16} />
          <div>Share</div>
        </div>
      </div>
      <div>
        <div className="flex cursor-pointer items-center gap-x-2 rounded-md p-2 hover:bg-gray-200/60">
          <SearchIcon size={16} />
        </div>
      </div>
    </div>
  );
}
