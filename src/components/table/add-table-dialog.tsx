"use client";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
export default function AddTableDialog({
  baseId,
  classList,
}: {
  baseId: string;
  classList: string;
}) {
  const ctx = api.useUtils();
  const router = useRouter();
  const { mutate: addTable } = api.table.addTable.useMutation({
    onSettled: (data) => {
      void ctx.table.getTablesByBaseId.invalidate({ baseId });
      router.push(`/base/${baseId}/table/${data?.id}`);
    },
    onMutate: async (variables) => {
      await ctx.table.getTablesByBaseId.cancel({ baseId });

      const previousTables = ctx.table.getTablesByBaseId.getData({ baseId });

      ctx.table.getTablesByBaseId.setData({ baseId }, (old) => [
        ...(old ?? []),
        {
          id: `Table ${(old?.length ?? 0) + 1}`,
          name: `Table ${(old?.length ?? 0) + 1}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...variables,
        },
      ]);

      return { previousTables };
    },
    onError: (err, variables, context) => {
      if (context?.previousTables) {
        ctx.table.getTablesByBaseId.setData({ baseId }, context.previousTables);
      }
    },
  });
  return (
    <div
      className={`top-2 flex min-w-72 flex-col gap-y-2 rounded-md border bg-white p-4 text-black shadow-sm ${classList}`}
    >
      <span className="px-2 text-gray-500">Add a blank table</span>
      <button
        className="rounded-md bg-gray-100 p-2 text-start text-sm text-black"
        onClick={() => {
          addTable({ baseId });
        }}
      >
        Start from scratch
      </button>
    </div>
  );
}
