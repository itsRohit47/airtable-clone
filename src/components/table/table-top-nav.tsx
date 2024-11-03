"use client";
import { BaseIdToName } from "@/lib/actions/base";
import {
  HistoryIcon,
  CircleHelp,
  BoxIcon,
  Users2Icon,
  BellIcon,
  ChevronDown,
  ArrowLeftIcon,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useAppContext } from "../context";
import clsx from "clsx";
import Link from "next/link";

export default function TableTopNav({ baseId }: { baseId: string }) {
  const { data: session } = useSession();
  const { tableTab, setTableTab } = useAppContext();
  const name = BaseIdToName({ baseId: baseId });
  return (
    <div className="z-0 w-full bg-[#D54402] p-4 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-10">
          {/* logo + base name */}
          <div className="flex cursor-pointer items-center gap-x-3">
            {" "}
            <Link href="/dashboard" className="group">
              <BoxIcon
                size={28}
                strokeWidth={1.5}
                className="p-1 group-hover:hidden"
              />
              <ArrowLeftIcon
                size={28}
                strokeWidth={1.5}
                color="gray"
                className="k hidden rounded-full bg-white p-1 group-hover:block"
              ></ArrowLeftIcon>
            </Link>
            <div className="text-base font-semibold">{name}</div>
            <ChevronDown size={20} strokeWidth={1.5}></ChevronDown>
          </div>
          {/* links */}
          <div className="flex items-center gap-x-3 text-xs">
            <div
              onClick={() => {
                setTableTab("data");
              }}
              className={clsx("cursor-pointer px-3 py-2", {
                tabnav: tableTab == "data",
              })}
            >
              Data
            </div>
            <div
              onClick={() => {
                setTableTab("auto");
              }}
              className={clsx("cursor-pointer px-3 py-2", {
                tabnav: tableTab == "auto",
              })}
            >
              Automations
            </div>{" "}
            <div
              onClick={() => {
                setTableTab("interfaces");
              }}
              className={clsx("cursor-pointer px-3 py-2", {
                tabnav: tableTab == "interfaces",
              })}
            >
              Interfaces
            </div>{" "}
            <span className="text-white/70">|</span>
            <div
              onClick={() => {
                setTableTab("forms");
              }}
              className={clsx("cursor-pointer px-3 py-2", {
                tabnav: tableTab == "forms",
              })}
            >
              Forms
            </div>
          </div>
        </div>
        <div className="flex items-center gap-x-5 text-xs">
          <span>
            <HistoryIcon size={16} strokeWidth={1.5}></HistoryIcon>
          </span>
          <div className="flex cursor-pointer items-center gap-x-2 rounded-full px-3 py-2 hover:bg-[#A03305]/80">
            <CircleHelp size={16} strokeWidth={1.5} />
            <span>Help</span>
          </div>
          <div className="flex items-center gap-x-2 rounded-full bg-[#A03305] px-3 py-2">
            <BoxIcon size={16} strokeWidth={1.5} />
            <span>Upgrade</span>
          </div>
          <div className="flex items-center gap-x-2 rounded-full bg-white px-3 py-2 text-[#D54402]">
            <Users2Icon size={16} strokeWidth={1.5} />
            <span>Share</span>
          </div>
          <div className="border-1 w-max rounded-full border bg-white p-[6px] text-[#D54402]">
            <BellIcon size={16} strokeWidth={1.5} />
          </div>
          <div className="rounded-full border-2 border-white">
            <Image
              src={session?.user?.image ?? "/logo.jpg"}
              width={30}
              height={30}
              className="rounded-full"
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
  );
}
