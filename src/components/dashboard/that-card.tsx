"use client";
import {
  AudioLinesIcon,
  BoxIcon,
  ArrowUpIcon,
  TableCellsMergeIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export default function ThatCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  const ctx = api.useUtils();
  const router = useRouter();
  const { mutate, isPending } = api.base.createBase.useMutation({
    onSuccess: (data) => {
      void ctx.base.getAllBases.invalidate();
      void router.push(`/base/${data.base.id}/table/${data.firstTableId}`);
    },
  });
  return (
    <div
      className="flex min-h-28 w-full cursor-pointer flex-col items-start gap-3 rounded-md border border-gray-300 bg-white p-4 shadow-sm hover:shadow-md"
      onClick={() => {
        if (icon === "table") {
          mutate();
        }
      }}
    >
      <div className="flex items-center gap-x-3">
        {icon === "audio" && <AudioLinesIcon />}
        {icon === "box" && <BoxIcon />}
        {icon === "arrow" && <ArrowUpIcon />}
        {icon === "table" && <TableCellsMergeIcon />}
        <h3 className="font-medium">{title}</h3>
        {isPending && (
          <LoaderCircleIcon
            className="animate-spin"
            size={16}
            style={{ marginLeft: "0.5rem" }}
          />
        )}
      </div>
      <p className="text-sm text-gray-500">{description} </p>
    </div>
  );
}
