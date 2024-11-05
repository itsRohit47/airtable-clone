export interface FilterCondition {
  id: string;
  columnId: string;
  field: string;
  operator: string;
  value: string;
  type: string;
  logic?: "and" | "or";
}

export interface FilterGroup {
  logic: "and" | "or";
  conditions: FilterCondition[];
}

export type FilterOperator =
  | "contains"
  | "does_not_contain"
  | "is"
  | "is_not"
  | "is_empty"
  | "is_not_empty"
  | "greater_than"
  | "less_than"
  | "equals"
  | "not_equals";
