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
}

export function EditableCell({
  value: initialValue,
  type,
  columnId,
  rowId,
  className
}: EditableCellProps) {
  const [value, setValue] = useState(initialValue);
  const debouncedInputValue = useDebounce(value, 1500);
  const [isInvalid, setIsInvalid] = useState(false);
  const ctx = api.useUtils();
  const { setLoading, setGlobalFilter, localCells, setLocalCells } =
    useAppContext();

  const { mutate } = api.table.updateCell.useMutation({
    onSuccess: () => {
      // void ctx.table.getData.invalidate();
      // void ctx.table.getTotalRowsGivenTableId.invalidate();
      setIsInvalid(false);
      setLoading(false);
    },
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
  }, [debouncedInputValue]);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);


  return (
    <input
      className={`flex h-full w-full cursor-default items-center truncate rounded-[1px] bg-transparent p-2 text-right text-xs outline-none transition duration-100  ease-linear focus:ring-2 ${isInvalid && value != '' ? "focus:ring-red-500" : "focus:ring-blue-500"} ${className}`}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      type="text"
    />
  );
}
