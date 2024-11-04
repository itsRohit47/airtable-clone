"use client";
import { useAppContext } from "../context";
import { api } from "@/trpc/react";
import { useState } from "react";
export default function TableNameEdit({
  tableName,
  tableId,
}: Readonly<{
  tableName: string;
  tableId: string;
}>) {
  const { setEditName, localTabes, setThisTable } = useAppContext();
  const { mutate: updateTable } = api.table.updateTableName.useMutation({
    onMutate: () => {
      setEditName(false);
      const lastTable = localTabes[localTabes.length - 1];
      if (lastTable && lastTable.id === tableId) {
        lastTable.name = newName;
      }
    },
  });
  const [newName, setNewName] = useState(tableName);

  return (
    <div className="flex w-60 flex-col gap-y-2 rounded-md border bg-white px-2 py-2 text-black shadow-sm">
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
      <div className="flex items-center justify-end gap-x-2">
        <button
          className="rounded-md px-2 py-1 text-start text-sm text-black hover:bg-gray-100"
          onClick={() => {
            setEditName(false);
          }}
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
  );
}
