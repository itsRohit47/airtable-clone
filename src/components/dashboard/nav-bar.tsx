"use client";
import {
  MenuIcon,
  SearchIcon,
  CommandIcon,
  CircleHelp,
  BellIcon,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useAppContext } from "../context";
export default function NavBar() {
  const { data: session } = useSession();
  const { sidebarOpen, setSidebarOpen } = useAppContext();
  return (
    <div className="fixed top-0 z-30 flex h-[56px] w-full items-center justify-between border-b-2 bg-white px-4 text-sm">
      {/* hamburburger + logo */}
      <div className="flex items-center gap-x-3 text-gray-400">
        <button
          onClick={() => {
            setSidebarOpen(!sidebarOpen);
            console.log("sidebarOpen", sidebarOpen);
          }}
        >
          <MenuIcon strokeWidth={1.5} size={24} />
        </button>
        <div className="h-12">
          <Image
            src="/logo.jpg"
            width={120}
            height={30}
            alt=""
            className="h-full object-cover mix-blend-multiply"
          />
        </div>
      </div>
      {/* search bar */}
      <div className="flex items-center gap-x-3 rounded-full border-2 px-3 text-gray-500 shadow-sm hover:cursor-pointer hover:shadow-md">
        <SearchIcon size={20} strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Search..."
          className="w-full py-2 focus:outline-none"
        />
        <CommandIcon size={18} strokeWidth={1.5} />
        <span className="text-sm">K</span>
      </div>
      {/* help + notifications + account */}
      <div className="flex items-center gap-x-5">
        <div className="flex items-center gap-x-2">
          <CircleHelp size={20} strokeWidth={1.5} />
          <span>Help</span>
        </div>
        <div className="border-1 w-max rounded-full border p-2 shadow-sm">
          <BellIcon size={20} strokeWidth={1.5} />
        </div>
        <div>
          <Image
            src={`${session?.user?.image}`}
            width={30}
            height={30}
            className="rounded-full"
            alt=""
          />
        </div>
      </div>
    </div>
  );
}
