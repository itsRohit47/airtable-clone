import {
  HomeIcon,
  UsersIcon,
  BookOpen,
  ShoppingBagIcon,
  GlobeIcon,
  PlusIcon,
} from "lucide-react";
import { useAppContext } from "../context";

export default function SideBar() {
  const { sidebarOpen, setSidebarOpen } = useAppContext();
  return (
    <div
      className="fixed left-0 top-0 z-10 flex h-svh w-max flex-col items-center justify-between border-r-2 bg-white px-4 pt-20 hover:cursor-pointer"
      onMouseEnter={() => {
        setSidebarOpen(!sidebarOpen);
      }}
    >
      {/* home + workspace */}
      <div className="flex flex-col gap-y-5 border-b-2 pb-5">
        <HomeIcon strokeWidth={1.5} size={20} />
        <UsersIcon strokeWidth={1.5} size={20} />
      </div>
      {/* others */}
      <div className="flex -translate-y-5 flex-col gap-y-5 border-t-2 pt-5 text-gray-500">
        <BookOpen strokeWidth={1.5} size={16} />
        <ShoppingBagIcon strokeWidth={1.5} size={16} />
        <GlobeIcon strokeWidth={1.5} size={16} />
        <PlusIcon
          strokeWidth={1.5}
          size={16}
          className="rounded-sm border border-gray-400"
        />
      </div>
    </div>
  );
}
