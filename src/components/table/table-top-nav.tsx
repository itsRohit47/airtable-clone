import { BaseIdToName } from "@/lib/actions/base";
import TableNav from "@/components/table/table-nav";
import {
  HistoryIcon,
  CircleHelp,
  BoxIcon,
  Users2Icon,
  BellIcon,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useAppContext } from "../context";
import clsx from "clsx";

export default function TableTopNav({
  baseName,
  tableNames,
  tableIds,
}: {
  baseName: string;
  tableNames: string[];
  tableIds: string[];
}) {
  const { data: session } = useSession();
  const { tableTab, setTableTab } = useAppContext();
  const name = BaseIdToName({ baseId: baseName });
  return (
    <div className="fixed w-full bg-[#D54402] px-4 pb-2 pt-2 text-white">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-x-10">
          {/* logo + base name */}
          <div className="flex items-center gap-x-3">
            {" "}
            <BoxIcon size={20} strokeWidth={1.5} />
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
          <div className="flex items-center gap-x-2">
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
      {tableTab == "data" && (
        <TableNav tableNames={tableNames} tableIds={tableIds}></TableNav>
      )}
    </div>
  );
}
