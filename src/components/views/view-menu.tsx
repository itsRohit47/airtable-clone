"use client";
import { useAppContext } from "../context";
import { SearchIcon, Grid2x2Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { useRouter, usePathname } from "next/navigation";

interface View {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  tableId: string;
  selected?: boolean;
}

export default function ViewMenu({
  _tableId,
  _baseId,
}: {
  _tableId: string;
  _baseId: string;
}) {
  const {
    isViewsOpen,
    selectedView,
    setSelectedView,
    setSortItems,
    setSortViewOpen,
  } = useAppContext();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [filteredViews, setFilteredViews] = useState<View[]>([]);
  const [search, setSearch] = useState("");
  const ctx = api.useUtils();
  const router = useRouter();
  const pathname = usePathname();

  const data = api.table.getViewsByTableId.useQuery({
    tableId: _tableId,
  });

  const viewSorts = api.table.getViewSorts.useQuery({
    viewId: selectedView?.id ?? "",
  });

  const { mutate: addView, isPending } = api.table.addView.useMutation({
    onMutate: async (newView) => {
      await ctx.table.getViewsByTableId.cancel();
      const previousViews = ctx.table.getViewsByTableId.getData();
      ctx.table.getViewsByTableId.setData({ tableId: _tableId }, (old) => [
        ...(old ?? []),
        {
          ...newView,
          id: "temp-id",
          createdAt: new Date(),
          updatedAt: new Date(),
          name: `Grid View ${(filteredViews?.length ?? 0) + 1}`,
          selected: false,
        },
      ]);
      return { previousViews };
    },
    onError: (err, newView, context) => {
      if (context) {
        ctx.table.getViewsByTableId.setData(
          { tableId: _tableId },
          context.previousViews,
        );
      }
    },
    onSettled: (data) => {
      if (data) {
        ctx.table.getViewsByTableId.setData({ tableId: _tableId }, (old) =>
          old?.map((view) =>
            view.id === "temp-id" ? { ...view, id: data.id } : view,
          ),
        );
      }
    },
  });

  useEffect(() => {
    if (data.data) {
      setFilteredViews(
        data.data.filter((view) =>
          view.name.toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }
  }, [data.data, search]);

  if (!isViewsOpen) {
    return null;
  }

  return (
    <div className="relative flex max-h-[81vh] w-80 flex-grow flex-col border-r border-gray-200 bg-white text-xs">
      <div className="px-4 py-2">
        <div
          className={`mb-4 flex items-center gap-x-2 border-b ${isInputFocused ? "border-blue-500" : "border-gray-200"}`}
        >
          <SearchIcon className="" size={16} strokeWidth={1} />
          <input
            placeholder="Find a view"
            autoFocus
            onBlur={() => setIsInputFocused(false)}
            onFocus={() => setIsInputFocused(true)}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="w-full py-3 outline-none focus:outline-none"
          ></input>
        </div>
      </div>
      <div className="flex-grow overflow-auto px-4">
        {filteredViews.map((view) => (
          <div
            key={view.id}
            onClick={() => {
              setSelectedView(view);
              setSortItems([]);
              setSortViewOpen(false);
              router.push(`/${_baseId}/${_tableId}/${view.id}`);
            }}
            className={`flex cursor-pointer items-center gap-x-2 rounded-sm p-2 ${
              pathname.includes(view.id)
                ? "bg-blue-200/60 hover:bg-blue-200"
                : "hover:bg-gray-100"
            }`}
          >
            <Grid2x2Plus size={16} strokeWidth={1} color="blue" />
            <div className="flex-grow">{view.name}</div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 max-h-52 w-full border-t bg-white px-4 py-2">
        <button
          onClick={() => {
            addView({
              tableId: _tableId,
            });
          }}
          disabled={isPending}
          className="mt-auto flex w-full items-center gap-x-2 rounded-sm bg-blue-500 p-2 text-white active:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-500"
        >
          <Grid2x2Plus size={16} strokeWidth={1} />
          <div className="">
            {isPending ? "Adding view..." : "Create a new grid view"}
          </div>
        </button>
      </div>
    </div>
  );
}
