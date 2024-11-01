import {
  ChevronDown,
  Eye,
  Filter,
  FolderKanban,
  Grid,
  Palette,
  Search,
  Share2,
  MenuIcon,
  SortAsc,
} from "lucide-react";

export default function TableTools() {
  return (
    <div className="fixed mt-6 flex w-full gap-x-4 border-b bg-white p-2 text-sm">
      <div className="flex items-center gap-x-1">
        <MenuIcon size={18} strokeWidth={1.5}></MenuIcon>
        <span>Views</span>
      </div>
    </div>
  );
}
