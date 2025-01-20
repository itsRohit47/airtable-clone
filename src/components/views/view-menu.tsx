"use client";
import { useAppContext } from "../context";
import { SearchIcon, LayoutGrid, ChevronDown, Calendar1Icon, Layers2Icon, SheetIcon, PlusIcon, Grid2X2Icon, KanbanIcon, ChartNoAxesGantt, SquareChartGantt, ListIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import Image from 'next/image';
import cuid from "cuid";

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
  const [isCreateViewOpen, setIsCreateViewOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('isCreateViewOpen');
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });
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
      // Optimistically update the local data
      const optimisticView = {
        ...newView,
        id: newView.viewId,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: `Grid View ${(filteredViews?.length ?? 0) + 1}`,
      };

      // Store the previous data
      // Update the cache with optimistic data
      ctx.table.getViewsByTableId.setData(
        { tableId: _tableId },
        old => [...(old ?? []), optimisticView]
      );

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

        setSelectedView(data);
        ctx.table.getViewsByTableId.setData({ tableId: _tableId }, (old) =>
          old?.map((view) =>
            view.id === data.id ? { ...view, id: data.id } : view,
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

  useEffect(() => {
    localStorage.setItem('isCreateViewOpen', JSON.stringify(isCreateViewOpen));
  }, [isCreateViewOpen]);

  if (!isViewsOpen) {
    return null;
  }

  return (
    <div className="w-80 border-r border-gray-200 bg-white text-xs flex flex-col relative h-full">
      <div className="px-4 py-2">
        <div
          className={`flex items-center gap-x-2 border-b ${isInputFocused ? "border-blue-500" : "border-gray-200"}`}
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
      <div className={`px-4 py-2 flex-grow h-full  mb-24 overflow-auto ${isCreateViewOpen ? 'max-h-[30vh]' : ''}`}>
        {filteredViews.map((view) => (
          <div
            key={view.id}
            onClick={() => {
              setSelectedView(view);
              setSortItems([]);
              setSortViewOpen(false);
              router.push(`/${_baseId}/${_tableId}/${view.id}`);
            }}
            className={`flex cursor-pointer items-center gap-x-2 rounded-sm p-2 ${pathname.includes(view.id)
              ? "bg-blue-200/60 hover:bg-blue-200"
              : "hover:bg-gray-100"
              }`}
          >
            <SheetIcon size={16} strokeWidth={1} color="blue" />
            <div className="flex-grow">{view.name}</div>
          </div>
        ))}
      </div>
      <div className="w-full bg-white px-4 py-2 flex flex-col absolute bottom-0">
        <hr></hr>
        <div className="flex items-center gap-x-2 cursor-pointer justify-between p-2 py-4" onClick={() => setIsCreateViewOpen(!isCreateViewOpen)}>
          <div className="text-sm font-medium">Create...</div>
          {isCreateViewOpen ? <ChevronDown strokeWidth={1.5} size={18}></ChevronDown> : <ChevronDown className="rotate-180" strokeWidth={1.5} size={18}></ChevronDown>}
        </div>
        {isCreateViewOpen && (
          <>
            <button
              onClick={() => {
                const _viewId = cuid();
                router.push(`/${_baseId}/${_tableId}/${_viewId}`);
                addView({
                  tableId: _tableId,
                  viewId: _viewId
                });
              }}
              disabled={isPending}
              className="flex w-full items-center gap-x-2 rounded-sm hover:bg-gray-200/60 p-2 justify-between"
            >
              <div className="flex items-center gap-x-2">
                <SheetIcon size={16} strokeWidth={1} color="blue" />
                <div className="flex items-center gap-x-2">
                  <span>Grid</span>
                </div>
              </div>
              <PlusIcon size={16} strokeWidth={1} color="blue" />
            </button>
            <button
              className="flex w-full items-center gap-x-2 rounded-sm hover:bg-gray-200/60 p-2 justify-between"
            >
              <div className="flex items-center gap-x-2">
                <Calendar1Icon size={16} strokeWidth={1} color="red" />
                <div className="flex items-center gap-x-2">
                  <span>Calender</span>
                </div>
              </div>
              <PlusIcon size={16} strokeWidth={1} color="blue" />
            </button>
            <button
              className="flex w-full items-center gap-x-2 rounded-sm hover:bg-gray-200/60 p-2 justify-between"
            >
              <div className="flex items-center gap-x-2">
                <LayoutGrid size={16} strokeWidth={1} color="blue" />
                <div className="flex items-center gap-x-2">
                  <span>Gallery</span>
                </div>
              </div>
              <PlusIcon size={16} strokeWidth={1} color="blue" />
            </button>
            <button
              className="flex w-full items-center gap-x-2 rounded-sm hover:bg-gray-200/60 p-2 justify-between"
            >
              <div className="flex items-center gap-x-2">
                <KanbanIcon size={16} strokeWidth={1} color="green" />
                <div className="flex items-center gap-x-2">
                  <span>Kanban</span>
                </div>
              </div>
              <PlusIcon size={16} strokeWidth={1} color="blue" />
            </button>
            <button
              className="flex w-full items-center gap-x-2 rounded-sm hover:bg-gray-200/60 p-2 justify-between"
            >
              <div className="flex items-center gap-x-2">
                <ChartNoAxesGantt size={16} strokeWidth={1} color="red" />
                <div className="flex items-center gap-x-2">
                  <span>Timeline</span>
                </div>
              </div>
              <PlusIcon size={16} strokeWidth={1} color="blue" />
            </button>
            <button
              className="flex w-full items-center gap-x-2 rounded-sm hover:bg-gray-200/60 p-2 justify-between"
            >
              <div className="flex items-center gap-x-2">
                <ListIcon size={16} strokeWidth={1} color="purple" />
                <div className="flex items-center gap-x-2">
                  <span>List</span>
                </div>
              </div>
              <PlusIcon size={16} strokeWidth={1} color="blue" />
            </button> <button
              className="flex w-full items-center gap-x-2 rounded-sm hover:bg-gray-200/60 p-2 justify-between"
            >
              <div className="flex items-center gap-x-2">
                <SquareChartGantt size={16} strokeWidth={1} color="green" />
                <div className="flex items-center gap-x-2">
                  <span>Gantt</span>
                </div>
              </div>
              <PlusIcon size={16} strokeWidth={1} color="blue" />
            </button>

            <br></br>
            <hr></hr>
            <button
              className="flex w-full items-center gap-x-2 rounded-sm hover:bg-gray-200/60 p-2 justify-between my-2"
            >
              <div className="flex items-center gap-x-2">
                <Layers2Icon size={16} strokeWidth={1} color="green" />
                <div className="flex items-center gap-x-2">
                  <span>Form</span>
                </div>
              </div>
              <PlusIcon size={16} strokeWidth={1} color="blue" />
            </button>
          </>)}
      </div>
    </div >
  );
}
