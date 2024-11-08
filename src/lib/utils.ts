import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAppContext } from "@/components/context";
import { type SortingState } from "@tanstack/react-table";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const useSortColumn = () => {
  const { sorting, setSorting } = useAppContext();

  const toggleSort = (columnId: string) => {
    const currentSort = sorting.find((sort) => sort.id === columnId);

    if (!currentSort) {
      // If not currently sorting by this column, add ascending sort
      setSorting([...sorting, { id: columnId, desc: false }]);
    } else if (!currentSort.desc) {
      // If sorting ascending, change to descending
      setSorting(
        sorting.map((sort) =>
          sort.id === columnId ? { ...sort, desc: true } : sort,
        ),
      );
    } else {
      // If sorting descending, remove sort
      setSorting(sorting.filter((sort) => sort.id !== columnId));
    }
  };

  const setSort = (columnId: string, direction: "asc" | "desc" | "none") => {
    if (direction === "none") {
      setSorting(sorting.filter((sort) => sort.id !== columnId));
    } else {
      const newSort: SortingState = [
        { id: columnId, desc: direction === "desc" },
      ];
      setSorting([
        ...sorting.filter((sort) => sort.id !== columnId),
        ...newSort,
      ]);
    }
  };

  // clear all sorts
  const clearSort = () => setSorting([]);

  return { toggleSort, setSort, clearSort };
};
