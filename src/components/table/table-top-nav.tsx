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
}: {
  baseId: string;
}) {
  const { data: session } = useSession();
  const { tableTab, setTableTab, loading } = useAppContext();
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


  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = document.getElementById("saved");
      if (saved) {
        saved.style.display = "none";
      }
    }, 3000);
  }, [loading]);

  return (
    <div className="top-0 z-0 min-h-[56px] bg-[#176EE1] px-2  flex items-center justify-between text-white   flex-auto top-bar-text-light pl-[20px]">
      <div className="flex items-center gap-x-10">
        {/* logo + base name */}
        <div className="flex cursor-pointer items-center gap-x-2 w-max">
          {" "}
          <Link href="/dashboard" className="group relative inline-flex items-center">
            <Image
              src="/airtable.svg"
              width={26}
              height={30}
              alt=""
              className="p-1 transition-opacity duration-300 ease-in-out group-hover:opacity-0 opacity-100"
            />
            <ArrowLeftIcon
              size={24}
              strokeWidth={1.5}
              color="gray"
              className="absolute opacity-0 rounded-full bg-white p-1 transition-opacity duration-200 ease-in-out group-hover:block group-hover:opacity-100"
            />
          </Link>
          <div className="overflow-hidden">
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
                className=" max-w-36 bg-transparent text-base font-semibold  focus:ring-0 outline"
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
          <span className="text-white/30 px-3 py-2">|</span>
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
          <div className="flex items-center gap-x-1 text-xs text-white/70 translate-x-5">
            <Loader
              size={20}
              strokeWidth={1.5}
              className="animate-spin"
            ></Loader>
            <span>Saving...</span>
          </div>
        ) : (
          <div className="flex items-center gap-x-1 text-xs text-white/70 translate-x-5">
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
          <HistoryIcon size={14} strokeWidth={1.5} className="translate-x-5"></HistoryIcon>
        </span>
        <div className="flex cursor-pointer items-center gap-x-2 rounded-full px-3 py-2 hover:bg-gray-700/80">
          <CircleHelp size={14} strokeWidth={1.5} />
          <span>Help</span>
        </div>
        <div className="flex items-center gap-x-2 rounded-full bg-[#1352A9] px-3 py-2">
          <BoxIcon size={14} strokeWidth={1.5} />
          <span>Upgrade</span>
        </div>
        <div className="flex items-center gap-x-2 rounded-full bg-white px-3 py-2 text-gray-700">
          <Users2Icon size={14} strokeWidth={1.5} />
          <span>Share</span>
        </div>
        <div className="border-1 w-max rounded-full border bg-white p-2 text-gray-700">
          <BellIcon size={14} strokeWidth={1.5} />
        </div>
        <div className="rounded-full border-2 border-white">
          <Image
            src={session?.user?.image ?? "/logo.jpg"}
            width={26}
            height={30}
            className="rounded-full"
            alt=""
          />
        </div>
      </div>
    </div>
  );
}
