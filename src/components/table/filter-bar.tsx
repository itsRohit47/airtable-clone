"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";

interface FilterCondition {
  type: any;
  columnId: any;
  id: string;
  field: string;
  operator: string;
  value: string;
  logic?: "and" | "or";
}

interface Column {
  type: string;
  defaultValue: string | null;
  tableId: string;
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  order: number;
}

const OPERATORS = {
  text: [
    { value: "contains", label: "contains" },
    { value: "does_not_contain", label: "does not contain" },
    { value: "is", label: "is" },
    { value: "is_not", label: "is not" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
  ],
  number: [
    { value: "equals", label: "=" },
    { value: "not_equals", label: "≠" },
    { value: "greater_than", label: ">" },
    { value: "less_than", label: "<" },
    { value: "greater_than_or_equals", label: "≥" },
    { value: "less_than_or_equals", label: "≤" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
  ],
};

interface FilterBarProps {
  columns: Column[];
  onFilterChange: (filters: FilterCondition[]) => void;
}

export function FilterBar({ columns, onFilterChange }: FilterBarProps) {
  const [conditions, setConditions] = useState<FilterCondition[]>([]);

  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: Math.random().toString(36).substr(2, 9),
      field: columns[0]?.id || "",
      operator: "contains",
      value: "",
      logic: conditions.length > 0 ? "and" : undefined,
      type: undefined,
      columnId: undefined,
    };
    const newConditions = [...conditions, newCondition];
    setConditions(newConditions);
    onFilterChange(newConditions);
  };

  const removeCondition = (id: string) => {
    const newConditions = conditions.filter((c) => c.id !== id);
    setConditions(newConditions);
    onFilterChange(newConditions);
  };

  const updateCondition = (
    id: string,
    field: keyof FilterCondition,
    value: string,
  ) => {
    const newConditions = conditions.map((c) =>
      c.id === id
        ? {
            ...c,
            [field]: value,
            ...(field === "field" && {
              operator: getDefaultOperator(
                (columns.find((col) => col.id === value)?.type as
                  | "text"
                  | "number") || "text",
              ),
            }),
          }
        : c,
    );
    setConditions(newConditions);
    onFilterChange(newConditions);
  };

  const getDefaultOperator = (type: "text" | "number") => {
    return OPERATORS[type]?.[0]?.value ?? "contains";
  };

  const updateLogic = (index: number, logic: "and" | "or") => {
    const newConditions = conditions.map((condition, i) => {
      if (i === index) {
        return { ...condition, logic };
      }
      return condition;
    });
    setConditions(newConditions);
    onFilterChange(newConditions);
  };

  useEffect(() => {
    console.log(conditions);
  }, [conditions]);

  return (
    <div className="flex items-center gap-x-2 p-4">
      <Button variant="outline" size="sm" onClick={addCondition}>
        <Plus className="mr-2 h-4 w-4" />
        Add filter
      </Button>
      <div className="space-y-2">
        {conditions.map((condition, index) => (
          <div key={condition.id} className="space-y-2">
            {index > 0 && (
              <Select
                value={condition.logic}
                onValueChange={(value: "and" | "or") =>
                  updateLogic(index, value)
                }
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue defaultValue="and" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="and">AND</SelectItem>
                  <SelectItem value="or">OR</SelectItem>
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center gap-2">
              <Select
                value={condition.field}
                onValueChange={(value) =>
                  updateCondition(condition.id, "field", value)
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a field" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column.id} value={column.id}>
                      <div className="flex items-center gap-x-2 text-xs">
                        <span>{column.type === "number" ? "##'" : "Aa"}</span>
                        <span> {column.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={condition.operator}
                onValueChange={(value) =>
                  updateCondition(condition.id, "operator", value)
                }
              >
                <SelectTrigger className="w-[200px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS[
                    (columns.find((c) => c.id === condition.field)?.type as
                      | "text"
                      | "number") || "text"
                  ].map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {!["is_empty", "is_not_empty"].includes(condition.operator) && (
                <Input
                  value={condition.value}
                  onChange={(e) =>
                    updateCondition(condition.id, "value", e.target.value)
                  }
                  type={
                    columns.find((c) => c.id === condition.field)?.type ===
                    "number"
                      ? "number"
                      : "text"
                  }
                  placeholder="Enter a value"
                  className="w-[200px] text-xs"
                />
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCondition(condition.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
