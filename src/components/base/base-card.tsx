"use client";
import { api } from "@/trpc/react";
import { StarIcon, Ellipsis } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BaseCardMenu from "@/components/base/base-card-menu";
import { cn } from "@/lib/utils";
import { useAppContext } from "../context";

interface BaseCardProps {
  base: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    firsTableId: string;
  };
}

export function BaseCard({ base }: BaseCardProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const router = useRouter();
  const ctx = api.useUtils();

  return (
    <div
      onClick={() => {
        router.push(`/base/${base.id}/table/${base.firsTableId}`);
        void ctx.table.getData.invalidate();
      }}
      className="group relative w-full max-w-96 cursor-pointer rounded-md border border-gray-300 bg-white p-4 shadow-none hover:shadow-md"
    >
      <div className="flex h-full gap-x-3">
        <div
          className={`flex h-full w-14 items-center justify-center rounded-md border bg-blue-500 text-white`}
        >
          {base.name.slice(0, 2)}
        </div>
        <div className="flex flex-col gap-y-3">
          <div className="text-sm">{base.name}</div>{" "}
          <div className="flex flex-col gap-y-3 text-xs text-gray-500">
            Base
          </div>
        </div>
        <div className="absolute right-3 top-2 hidden gap-x-2 group-hover:flex">
          {" "}
          <div
            onClick={(e) => {
              e.stopPropagation();
              alert("Not implemented yet ( ͡° ͜ʖ ͡°)");
            }}
            className="cursor-pointer py-4"
          >
            <StarIcon color="gray" size={16} />
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsMoreOpen(!isMoreOpen);
            }}
            className="cursor-pointer py-4"
          >
            <Ellipsis color="gray" size={16} />
          </div>
        </div>
      </div>
      {isMoreOpen && <BaseCardMenu baseId={base.id} />}
    </div>
  );
}
