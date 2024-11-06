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
      className={`flex h-6 w-full cursor-default items-center truncate rounded-[1px] p-2 text-xs outline-none transition duration-100 ease-linear ${loading ? "bg-gray-50" : "bg-transparent"} text-right focus:ring-2 focus:ring-blue-500`}
      value={value}
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
