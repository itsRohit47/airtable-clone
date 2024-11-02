import {
  EyeOffIcon,
  MenuIcon,
  ListFilterIcon,
  ExternalLinkIcon,
} from "lucide-react";

export default function TableTools() {
  return (
    <div className="fixed mt-6 flex w-full gap-x-3 border-b bg-white p-2 text-sm">
      <div className="flex cursor-pointer items-center gap-x-2 rounded-sm px-3 py-1 hover:bg-gray-100">
        <MenuIcon size={14} strokeWidth={1.5}></MenuIcon>
        <span>Views</span>
      </div>
      <div className="flex cursor-pointer items-center gap-x-2 rounded-sm px-3 py-1 hover:bg-gray-100">
        <EyeOffIcon size={14} strokeWidth={1.5}></EyeOffIcon>
        <span>Hide Fields</span>
      </div>
      <div className="flex cursor-pointer items-center gap-x-2 rounded-sm px-3 py-1 hover:bg-gray-100">
        <ListFilterIcon size={14} strokeWidth={1.5}></ListFilterIcon>
        <span>Filters</span>
      </div>
      <div className="flex cursor-pointer items-center gap-x-2 rounded-sm px-3 py-1 hover:bg-gray-100">
        <ListFilterIcon size={14} strokeWidth={1.5}></ListFilterIcon>
        <span>Group</span>
      </div>{" "}
      <div className="flex cursor-pointer items-center gap-x-2 rounded-sm px-3 py-1 hover:bg-gray-100">
        <ListFilterIcon size={14} strokeWidth={1.5}></ListFilterIcon>
        <span>Sort</span>
      </div>
      <div className="flex cursor-pointer items-center gap-x-2 rounded-sm px-3 py-1 hover:bg-gray-100">
        <ListFilterIcon size={14} strokeWidth={1.5}></ListFilterIcon>
        <span>Color</span>
      </div>
      <div className="flex cursor-pointer items-center gap-x-2 rounded-sm px-1 py-1 hover:bg-gray-100">
        <ListFilterIcon size={14} strokeWidth={1.5}></ListFilterIcon>
      </div>
      <div className="flex cursor-pointer items-center gap-x-2 rounded-sm px-3 py-1 hover:bg-gray-100">
        <ExternalLinkIcon size={14} strokeWidth={1.5}></ExternalLinkIcon>
        <span>Share and sync</span>
      </div>
    </div>
  );
}
