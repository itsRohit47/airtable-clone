import { useAppContext } from "../context";
import { BookOpen, ShoppingBagIcon, GlobeIcon, PlusIcon } from "lucide-react";
import CreateBaseButton from "./create-base-button";
import clsx from "clsx";
import { Button } from "../ui/button";
export default function SideMenu() {
  const { sidebarOpen, setSidebarOpen } = useAppContext();
  return (
    <div
      className={clsx(
        "fixed inset-0 right-0 z-20 h-svh w-96 border-r-2 bg-white shadow-md transition-transform duration-300",
        sidebarOpen ? "" : "-translate-x-full",
      )}
      onMouseLeave={() => setSidebarOpen(!sidebarOpen)}
    >
      {sidebarOpen && (
        <div className="flex h-full flex-col justify-between px-4 pt-20">
          <div>
            <div className="cursor-pointer rounded-md p-2 text-base font-medium hover:bg-gray-200">
              Home
            </div>
            <div className="cursor-pointer rounded-md p-2 text-base font-medium hover:bg-gray-200">
              All Workspaces
            </div>
          </div>
          <div className="flex -translate-y-5 flex-col gap-y-2 border-t pt-5 text-xs">
            <div className="flex cursor-pointer items-center gap-x-1 rounded-md p-2 hover:bg-gray-200">
              <BookOpen strokeWidth={1.5} size={16} />
              Template and apps
            </div>
            <div className="flex cursor-pointer items-center gap-x-1 rounded-md p-2 hover:bg-gray-200">
              <ShoppingBagIcon strokeWidth={1.5} size={16} />
              Marketplace
            </div>{" "}
            <div className="flex cursor-pointer items-center gap-x-1 rounded-md p-2 hover:bg-gray-200">
              <GlobeIcon strokeWidth={1.5} size={16} />
              Import
            </div>
            <CreateBaseButton className="bg-blue-500 text-white hover:bg-blue-600 p-2 rounded-md" />
          </div>
        </div>
      )}
    </div>
  );
}
