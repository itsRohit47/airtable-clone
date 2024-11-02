"use client";

import { useState, useRef, useEffect } from "react";

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
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleSave = async (newValue: string) => {
    if (newValue === initialValue) return;

    setIsLoading(true);
    try {
      await onSave(newValue);
    } catch (error) {
      setValue(initialValue); // Rollback on error
      console.error("Failed to save:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Validate number input
    if (type === "number" && newValue !== "") {
      const isValid = /^\d*\.?\d*$/.test(newValue);
      if (!isValid) return;
    }

    setValue(newValue);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      void handleSave(newValue);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Enter":
        if (!e.shiftKey) {
          e.preventDefault();
          // Clear timeout and save immediately
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          void handleSave(value);
          // Move to next cell
          const nextInput = inputRef.current
            ?.closest("td")
            ?.nextElementSibling?.querySelector("input");
          if (nextInput instanceof HTMLInputElement) nextInput.focus();
        }
        break;
      case "Escape":
        // Clear timeout and revert changes
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        setValue(initialValue);
        break;
      case "Tab":
        // Clear timeout and save immediately
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        void handleSave(value);
        break;
    }
  };

  return (
    <input
      ref={inputRef}
      className={`flex h-8 w-full cursor-text items-center truncate p-2 text-xs outline-none ${isLoading ? "bg-gray-50" : "bg-white"} ${type === "number" ? "text-right" : "text-left"} focus:ring-2 focus:ring-blue-500`}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={() => {
        // Clear timeout and save on blur if needed
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          void handleSave(value);
        }
      }}
      type="text"
      disabled={isLoading}
      autoComplete="off"
      spellCheck={false}
    />
  );
}
