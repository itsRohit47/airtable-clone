"use client";
import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { useAppContext } from "../context";

interface EditableCellProps {
  value: string;
  rowId: string;
  columnId: string;
  type: "text" | "number";
}

export function EditableCell({
  value: initialValue,
  type,
  columnId,
  rowId,
}: EditableCellProps) {
  const [value, setValue] = useState(initialValue);
  const [isInvalid, setIsInvalid] = useState(false);
  const ctx = api.useUtils();
  const { mutate } = api.table.updateCell.useMutation({
    onMutate: async (newData) => {
      await ctx.table.getData.cancel();
      const previousData = ctx.table.getData.getData();
      ctx.table.getData.setData({ tableId: "temp-id" }, (old) =>
        old
          ? {
              ...old,
              data: old.data.map((row) =>
                row.id === newData.rowId
                  ? { ...row, [newData.columnId]: newData.value }
                  : row,
              ),
            }
          : old,
      );
      return { previousData };
    },
    onError: (err, newData, context) => {
      if (context) {
        ctx.table.getData.setData({ tableId: "temp-id" }, context.previousData);
      }
    },
    onSettled: () => {
      void ctx.table.getData.invalidate();
      setLoading(false);
    },
  });

  const { loading, setLoading, globalFilter, setGlobalFilter, rowHeight } =
    useAppContext();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" || e.key === "Enter" || e.key === "Tab") {
      setLoading(true);
      (e.target as HTMLInputElement).blur();
    } else if (
      type === "number" &&
      !/[0-9]/.test(e.key) &&
      e.key !== "Backspace"
    ) {
      e.preventDefault();
      setIsInvalid(true);
    }
  };

  return (
    <input
      className={`flex h-${rowHeight} w-full cursor-default items-center truncate rounded-[1px] bg-transparent p-2 text-right text-xs outline-none transition duration-100 ease-linear focus:ring-2 ${isInvalid ? "focus:ring-red-500" : "focus:ring-blue-500"}`}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        setIsInvalid(false);
      }}
      onBlur={() => {
        setLoading(true);
        setGlobalFilter("");
        mutate({
          value,
          columnId,
          rowId,
        });
      }}
      onKeyDown={handleKeyDown}
      type={type}
    />
  );
}
