"use client";
import { api } from "@/trpc/react";
import Image from "next/image";
import { LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
export default function CreateBaseButton({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();
  const ctx = api.useUtils();
  const { mutate, isPending } = api.base.createBase.useMutation({
    onSuccess: (data) => {
      void ctx.base.getAllBases.invalidate();
      void router.push(
        `/${data.base.id}/${data.firstTableId}/${data.firstViewId}`,
      );
    },
  });
  return (
    <button
      className={`${className} flex items-center justify-center gap-x-1`}
      onClick={() => {
        mutate();
      }}
    >
      Create Base
      {isPending && (
        <LoaderCircleIcon
          className="animate-spin"
          size={12}
          style={{ marginLeft: "0.5rem" }}
        />
      )}
    </button>
  );
}
