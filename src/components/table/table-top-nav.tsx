"use client";
import { BaseIdToNameAndColor } from "@/lib/actions/base";
import {
  HistoryIcon,
  CircleHelp,
  BoxIcon,
  Users2Icon,
  BellIcon,
  ArrowLeftIcon,
  Loader,
  EditIcon,
  SaveIcon,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useAppContext } from "../context";
import { useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { useEffect } from "react";
import { api } from "@/trpc/react";

export default function TableTopNav({
  baseId,
  tableId,
}: {
  baseId: string;
  tableId: string;
}) {
  const { data: session } = useSession();
  const { tableTab, setTableTab, loading, setLoading } = useAppContext();
  const base = BaseIdToNameAndColor({ baseId: baseId });
  const [isEditing, setIsEditing] = useState(false);
  const [baseName, setBaseName] = useState(base.data?.name);
  const ctx = api.useUtils();

  const { mutate } = api.base.updateBase.useMutation({
    onMutate: async (newBase) => {
      await ctx.base.baseIdToName.cancel({ baseId });

      const previousBase = ctx.base.baseIdToName.getData({ baseId });

      ctx.base.baseIdToName.setData({ baseId }, (old) =>
        old
          ? {
            ...old,
            name: newBase.name,
          }
          : old,
      );
      return { previousBase };
    },
    onError: (err, newBase, context) => {
      if (context?.previousBase) {
        ctx.base.baseIdToName.setData({ baseId }, context.previousBase);
      }
    },
    onSettled: (data) => {
      if (data) {
        ctx.base.baseIdToName.setData({ baseId }, (old) =>
          old
            ? {
              ...old,
              name: data.name,
            }
            : old,
        );
      }
    },
  });


  const { mutate: add10k } = api.table.add10kRows.useMutation({
  });


  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = document.getElementById("saved");
      if (saved) {
        saved.style.display = "none";
      }
    }, 3000);
  }, [loading]);

  return (
    <div className="top-0 z-0 min-h-[56px] bg-gray-500 p-2 text-white">
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
            <div className="max-w-32 overflow-hidden">
              {isEditing ? (
                <input
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (baseName) {
                        mutate({ baseId, name: baseName });
                      }
                      setIsEditing(false);
                    }
                    if (e.key === "Escape") {
                      setBaseName(base.data?.name);
                      setIsEditing(false);
                    }
                  }}
                  onChange={(e) => {
                    setBaseName(e.target.value);
                  }}
                  onFocus={(e) => {
                    e.target.select();
                  }}
                  defaultValue={base.data?.name}
                  className="w-max border-none bg-transparent text-base font-semibold focus:outline-none focus:ring-0"
                />
              ) : (
                <div className="w-max text-base font-semibold">
                  {base.isLoading ? "Loading..." : base.data?.name}
                </div>
              )}
            </div>
            {isEditing ? (
              <button
                onClick={async () => {
                  if (baseName) {
                    mutate({ baseId, name: baseName });
                  }
                  setIsEditing(false);
                }}
              >
                <SaveIcon size={16} strokeWidth={1.5} />
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                }}
              >
                {" "}
                <EditIcon size={16} strokeWidth={1.5} />
              </button>
            )}
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
                setTableTab("Automations");
              }}
              className={clsx("cursor-pointer px-3 py-2", {
                tabnav: tableTab == "Automations",
              })}
            >
              Automations
            </div>{" "}
            <div
              onClick={() => {
                setTableTab("Interfaces");
              }}
              className={clsx("cursor-pointer px-3 py-2", {
                tabnav: tableTab == "Interfaces",
              })}
            >
              Interfaces
            </div>{" "}
            <span className="text-white/70">|</span>
            <div
              onClick={() => {
                setTableTab("Forms");
              }}
              className={clsx("cursor-pointer px-3 py-2", {
                tabnav: tableTab == "Forms",
              })}
            >
              Forms
            </div>
          </div>
        </div>
        <div className="flex items-center gap-x-5 text-xs">
          {loading ? (
            <div className="flex items-center gap-x-1 text-xs text-white/70">
              <Loader
                size={20}
                strokeWidth={1.5}
                className="animate-spin"
              ></Loader>
              <span>Saving...</span>
            </div>
          ) : (
            <div className="flex items-center gap-x-1 text-xs text-white/70">
              {loading ? (
                <div className="flex items-center gap-x-1 text-xs text-white/70">
                  <Loader
                    size={20}
                    strokeWidth={1.5}
                    className="animate-spin"
                  ></Loader>
                  <span>Saving...</span>
                </div>
              ) : (
                <div
                  id="saved"
                  className="flex items-center gap-x-1 text-xs text-white/70"
                >
                  <span>All changes saved</span>
                </div>
              )}
            </div>
          )}

          <span className="flex cursor-pointer items-center gap-x-2 rounded-full px-3 py-2 hover:bg-gray-700/80">
            <HistoryIcon size={16} strokeWidth={1.5}></HistoryIcon>
          </span>
          <div onClick={() => {
            console.log("Help")
            add10k({ tableId });
          }} className="flex cursor-pointer items-center gap-x-2 rounded-full px-3 py-2 hover:bg-gray-700/80">
            <CircleHelp size={16} strokeWidth={1.5} />
            <span>Help</span>
          </div>
          <div className="flex items-center gap-x-2 rounded-full bg-gray-700 px-3 py-2">
            <BoxIcon size={16} strokeWidth={1.5} />
            <span>Upgrade</span>
          </div>
          <div className="flex items-center gap-x-2 rounded-full bg-white px-3 py-2 text-gray-700">
            <Users2Icon size={16} strokeWidth={1.5} />
            <span>Share</span>
          </div>
          <div className="border-1 w-max rounded-full border bg-white p-[6px] text-gray-700">
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
