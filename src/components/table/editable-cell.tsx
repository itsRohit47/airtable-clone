"use client";
import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { useAppContext } from "../context";

interface EditableCellProps {
  value: string;
  rowId: string;
  columnId: string;
  className?: string;
  type: "text" | "number";
}

export function EditableCell({
  value: initialValue,
  type,
  columnId,
  rowId,
  className
}: EditableCellProps) {
  const [value, setValue] = useState(initialValue);
  const [isInvalid, setIsInvalid] = useState(false);
  const ctx = api.useUtils();
  const { setLoading, setGlobalFilter, localCells, setLocalCells } =
    useAppContext();

  const { mutate } = api.table.updateCell.useMutation({
    onMutate: async (newCell) => {
      setLoading(true);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

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
      className={`flex h-full w-full cursor-default items-center truncate rounded-[1px] bg-transparent p-2 text-right text-xs outline-none transition duration-100 ease-linear focus:ring-2 ${isInvalid ? "focus:ring-red-500" : "focus:ring-blue-500"} ${className}`}
      defaultValue={value}
      onChange={(e) => {
        setLoading(true);
        setValue(e.target.value);
        setIsInvalid(false);
        mutate({
          value: e.target.value,
          columnId,
          rowId,
        });
      }}
      onBlur={() => {
        setGlobalFilter("");
        setLoading(true);
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
