"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface EditableCellProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  type: "text" | "number";
  column: {
    id: string;
    name: string;
  };
  row: {
    id: string;
    [key: string]: string | number | null;
  };
}

export function EditableCell({
  value: initialValue,
  onSave,
  type,
  column,
  row,
}: EditableCellProps) {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with initial value if it changes externally
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle saves
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value === initialValue) {
        setIsEditing(false);
        return;
      }
      setIsLoading(true);
      try {
        await onSave(value);
        setIsEditing(false);
      } catch (error) {
        setValue(initialValue);
      } finally {
        setIsLoading(false);
      }
    }

    // Handle cancel
    if (e.key === "Escape") {
      setIsEditing(false);
      setValue(initialValue);
    }
  };

  const handleBlur = async () => {
    if (!isLoading && value !== initialValue) {
      setIsLoading(true);
      try {
        await onSave(value);
      } catch (error) {
        setValue(initialValue);
      } finally {
        setIsLoading(false);
      }
    }
    setIsEditing(false);
  };

  return (
    <input
      ref={inputRef}
      className="flex h-8 cursor-text items-center truncate p-2 text-xs"
      defaultValue={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      autoFocus={isEditing}
      type={type}
      disabled={isLoading}
      autoComplete="off"
    />
  );
}
