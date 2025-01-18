"use client";
import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { useAppContext } from "../context";
import useDebounce from "@/hooks/use-debounce";

interface EditableCellProps {
  value: string;
  rowId: string;
  columnId: string;
  className?: string;
  type: "text" | "number";
  tableId: string;
}

export function EditableCell({
  value: initialValue,
  type,
  columnId,
  rowId,
  className,
  tableId
}: EditableCellProps) {
  const [value, setValue] = useState(initialValue);
  const debouncedInputValue = useDebounce(value, 500);
  const [isInvalid, setIsInvalid] = useState(false);
  const ctx = api.useUtils();
  const { setLoading, setGlobalFilter } = useAppContext();

  const { mutate } = api.table.updateCell.useMutation({
    onSuccess: (data) => {
      setIsInvalid(false);
      setLoading(false);
      void ctx.table.getData.invalidate();
    }
  });

  useEffect(() => {
    if (debouncedInputValue === initialValue) {
      return;
    }
    if (type === "number" && isNaN(Number(debouncedInputValue))) {
      setIsInvalid(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    mutate({
      value: debouncedInputValue,
      columnId,
      rowId,
    });
  }, [columnId, debouncedInputValue, initialValue, mutate, rowId, setLoading, type]);


  useEffect(() => {
    setValue(initialValue);
  }
    , [initialValue]);

  return (
    <input
      className={`flex h-full w-full cursor-default items-center truncate rounded-[1px] bg-transparent p-2 text-right text-xs outline-none transition duration-100  ease-linear focus:ring-2 ${isInvalid && value != '' ? "focus:ring-red-500" : "focus:ring-blue-500"} ${className}`}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      type={type}
    />
  );
}
