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
  const debouncedInputValue = useDebounce(value, 100);
  const [isInvalid, setIsInvalid] = useState(false);
  const ctx = api.useUtils();
  const { setLoading, setGlobalFilter, localCells, setLocalCells } =
    useAppContext();

  const { mutate } = api.table.updateCell.useMutation({
    onMutate: async (newData) => {
      await ctx.table.getData.cancel();
      const previousData = ctx.table.getData.getData();

      ctx.table.getData.setData({ tableId: rowId }, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((row) => {
            if (row.id === rowId) {
              return {
                ...row,
                [columnId]: newData.value,
              };
            }
            return row;
          }),
        };
      });

      return { previousData };
    },
    onError: (err, newData, context) => {
      if (context?.previousData) {
        ctx.table.getData.setData({ tableId: rowId }, context.previousData);
      }
      setIsInvalid(true);
      setLoading(false);
    },
    onSettled: () => {
      void ctx.table.getData.invalidate();
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
        setLoading(true);
        setValue(e.target.value);
      }}
      type="text"
    />
  );
}
