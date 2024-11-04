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
  const [value, setValue] = useState('');
  const { mutate } = api.table.updateCell.useMutation({
    onSuccess: () => {
      setLoading(false);
    },
  });
  const { loading, setLoading } = useAppContext();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <input
      className={`flex h-8 w-full cursor-text items-center truncate p-2 text-xs outline-none ${loading ? "bg-gray-50" : "bg-white"} ${type === "number" ? "text-right" : "text-left"} focus:ring-2 focus:ring-blue-500`}
      defaultValue={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      onBlur={() => {
        setLoading(true);
        mutate({
          value,
          columnId: columnId,
          rowId: rowId,
        });
      }}
      type={type}
    />
  );
}
