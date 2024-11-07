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
  const { mutate } = api.table.updateCell.useMutation({
    onSuccess: () => {
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
