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
  // Add these props for keyboard navigation
  onNavigate?: (direction: "up" | "down" | "left" | "right") => void;
}

export function EditableCell({
  value: initialValue,
  onSave,
  type,
  column,
  row,
  onNavigate,
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

    // Handle navigation
    if (onNavigate) {
      switch (e.key) {
        case "Tab":
          e.preventDefault();
          onNavigate(e.shiftKey ? "left" : "right");
          break;
        case "ArrowUp":
          if (!isEditing) {
            e.preventDefault();
            onNavigate("up");
          }
          break;
        case "ArrowDown":
          if (!isEditing) {
            e.preventDefault();
            onNavigate("down");
          }
          break;
        case "ArrowLeft":
          if (!isEditing || inputRef.current?.selectionStart === 0) {
            e.preventDefault();
            onNavigate("left");
          }
          break;
        case "ArrowRight":
          if (
            !isEditing ||
            inputRef.current?.selectionEnd === inputRef.current?.value.length
          ) {
            e.preventDefault();
            onNavigate("right");
          }
          break;
      }
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

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        className={`h-8 w-full ${isLoading ? "opacity-50" : ""}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        type={type}
        disabled={isLoading}
        autoComplete="off"
      />
    );
  }

  return (
    <div
      className="flex h-8 cursor-text items-center truncate rounded px-2 hover:bg-accent hover:bg-opacity-50"
      onClick={() => setIsEditing(true)}
    >
      {value || "\u00A0"}
    </div>
  );
}
