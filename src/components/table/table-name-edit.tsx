"use client";
import { useAppContext } from "../context";
import { api } from "@/trpc/react";
import { useState } from "react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
export default function TableNameEdit({
  tableId,
  onCanceled,
  tableName,
  baseId,
}: Readonly<{
  tableId: string;
  onCanceled: () => void;
  tableName: string;
  baseId: string;
}>) {
  const [clicked, setClicked] = useState(false);
  const [newName, setNewName] = useState<string>(tableName);
  const ctx = api.useUtils();
  const ref = useOutsideClick(() => {
    setClicked(true); // Change to false to close the input on outside click
  });
  const router = useRouter();

  const tablesLength = api.table.getTablesByBaseId.useQuery({ baseId }).data?.length;

  const { mutate: deleteTable, isPending } = api.table.deleteTable.useMutation({
    onSettled: (data) => {
      void ctx.table.getTablesByBaseId.invalidate();
      router.push(`/${baseId}/${data?.latestTableId}/${data?.latestViewId}`);
    },
  });


  const { mutate: updateTable } = api.table.updateTableName.useMutation({
    onMutate: async (newData) => {
      onCanceled();
      setClicked(true);
      await ctx.table.getTablesByBaseId.cancel();
      const previousData = ctx.table.getTablesByBaseId.getData();
      ctx.table.getTablesByBaseId.setData({
        baseId: baseId,
      }, (old) => {
        if (!old) return old;
        return old.map(table =>
          table.id === newData.tableId ? { ...table, name: newData.name } : table
        );
      });
      return { previousData };
    },
    onError: (err, newData, context) => {
      if (context) {
        ctx.table.getTablesByBaseId.setData({ baseId: "" }, context.previousData);
      }
    },
    onSettled: () => {
      void ctx.table.getTablesByBaseId.invalidate();
    },
  });

  if (clicked) {
    return null;
  }


  return (
    <div className="flex w-60 flex-col gap-y-2 rounded-md border bg-white px-2 py-2 text-black shadow-lg text-xs absolute top-24 z-20" ref={ref}>
      <input
        className="rounded-md border-2 border-[#125FCC] p-2"
        defaultValue={tableName}
        onChange={(e) => {
          setNewName(e.target.value);
        }}
        autoFocus
        onFocus={(e) => e.target.select()}
      />
      {newName.length < 1 && (
        <div className="text-red-500">Table name cannot be empty</div>
      )}

      <div className="flex items-center justify-between gap-x-2">
        <button
          //disabled when length of tables is 1
          disabled={tablesLength === 1}
          onClick={() => {
            deleteTable({ tableId });
          }
          }
          className="rounded-md px-2 py-1 text-start bg-red-500 text-white hover:bg-red-600 flex items-center gap-x-1 disabled:opacity-50"
        >
          {isPending && <Loader2 className="animate-spin" size={12} />} Delete
        </button>
        <div>
          <button
            onClick={onCanceled}
            className="rounded-md px-2 py-1 text-start text-black hover:bg-gray-100"
          >
            cancel
          </button>
          <button
            className={`rounded-md px-2 py-1 text-white ${newName ? "bg-blue-500" : "cursor-not-allowed bg-gray-300"}`}
            disabled={!newName}
            onClick={() => {
              updateTable({
                name: newName,
                tableId,
              });
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}