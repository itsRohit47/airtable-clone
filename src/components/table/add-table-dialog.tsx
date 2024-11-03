"use client";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../context";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function AddTableDialog({
  baseId,
  classList,
}: {
  baseId: string;
  classList: string;
}) {
  const ctx = api.useUtils();
  const router = useRouter();
  const { localTabes, setThisTable, setEditName } = useAppContext();
  const [tempId, setTempId] = useState(uuidv4());
  const { mutate: addTable } = api.table.addTable.useMutation({
    onMutate: () => {
      setThisTable(tempId);
      localTabes.push({
        baseId,
        id: tempId,
        name: "Untitled Table",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      router.push(`/base/${baseId}/table/${tempId}`);
      setEditName(true);
    },
    onSuccess: (data) => {
      const latestTable = localTabes[localTabes.length - 1];
      if (latestTable) {
        latestTable.id = data.id;
      }
      router.push(`/base/${baseId}/table/${data.id}`);
      setEditName(false);
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
          addTable({
            baseId,
          });
        }}
      >
        Start from scratch
      </button>
    </div>
  );
}
