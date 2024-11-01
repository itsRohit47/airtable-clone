"use client";
import { api } from "@/trpc/react";
import Link from "next/link";
import { StarIcon } from "@radix-ui/react-icons";

function randomTailwindColor() {
  const colors = ["red", "yellow", "green", "blue", "indigo", "purple", "pink"];
  return colors[Math.floor(Math.random() * colors.length)];
}

interface BaseCardProps {
  base: {
    id: string;
    name: string;
    updatedAt: Date;
  };
}

export function BaseCard({ base }: BaseCardProps) {
  const ctx = api.useUtils();

  const { mutate } = api.base.deleteBase.useMutation({
    onSuccess: () => {
      console.log("deleted base");
      void ctx.base.getAllBases.invalidate();
    },
  });

  return (
    <Link
      href={`/base/${base.id}`}
      className="w-full max-w-96 cursor-pointer rounded-md border border-gray-300 bg-white p-4 shadow-none hover:shadow-md"
    >
      <div className="flex h-full gap-x-3">
        <div
          className={`flex h-full w-14 items-center justify-center rounded-md border bg-[#B63A05] text-white`}
        >
          {base.name.slice(0,2)}
        </div>
        <div className="flex flex-col gap-y-3">
          <div className="text-sm">{base.name}</div>{" "}
          <div className="flex flex-col gap-y-3 text-xs text-gray-500">
            Base
          </div>
        </div>
      </div>
    </Link>
  );
}
