"use client";
import { type RowSelectionState, type ColumnFiltersState, type SortingState, type VisibilityState } from "@tanstack/react-table";
import React, {
  createContext,
  useState,
  type ReactNode,
  useContext,
} from "react";

interface Column {
  id: string;
  name: string;
  type: string;
  tableId: string;
  order: number;
  defaultValue: string | null;
  createdAt: Date;
  updatedAt: Date;
}


interface View {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  tableId: string;
}

interface AppContextProps {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  listView: boolean;
  setListView: (value: boolean) => void;
  tableTab: string;
  setTableTab: (value: string) => void;
  thisTable: string;
  setThisTable: (value: string) => void;
  thisTableId: string;
  setThisTableId: (value: string) => void;
  flag: boolean;
  setFlag: (value: boolean) => void;
  recordCount: number;
  setRecordCount: (value: number) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  localTables: {
    baseId: string;
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  setLocalTables: React.Dispatch<
    React.SetStateAction<
      {
        baseId: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
      }[]
    >
  >;
  editName: boolean;
  setEditName: (value: boolean) => void;
  localColumns: Column[];
  setLocalColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  localData: Record<string, string | number>[];
  setLocalData: React.Dispatch<
    React.SetStateAction<Record<string, string | number>[]>
  >;
  globalFilter: string | null;
  setGlobalFilter: (value: string | null) => void;
  rowHeight: number;
  setRowHeight: (value: number) => void;
  baseColor: string;
  setBaseColor: (value: string) => void;
  localCells: Record<string, string | number>[];

  setLocalCells: React.Dispatch<
    React.SetStateAction<Record<string, string | number>[]>
  >;
  sorting: SortingState;
  setSorting: (value: SortingState) => void;
  sortViewOpen: boolean;
  setSortViewOpen: (value: boolean) => void;
  tempCol: { id: string; name: string; type: string };
  setTempCol: (value: { id: string; name: string; type: string }) => void;
  sortItems: JSX.Element[];
  setSortItems: (value: JSX.Element[]) => void;
  isViewsOpen: boolean;
  setIsViewsOpen: (value: boolean) => void;
  selectedView: View | null;
  setSelectedView: (value: View | null) => void;
  viewSorting: SortingState;
  setViewSorting: (value: SortingState) => void;
  colsNotInSort: Column[];
  setColsNotInSort: (value: Column[]) => void;
  columnFilters: ColumnFiltersState;
  setColumnFilters: (value: ColumnFiltersState) => void;
  rowSelection: RowSelectionState;
  setRowSelection: (value: RowSelectionState) => void;
  columnVisibility: VisibilityState;
  setColumnVisibility: (value: VisibilityState) => void;
  matchedCells: { rowIndex: number; colIndex: number }[];
  setMatchedCells: React.Dispatch<React.SetStateAction<{ rowIndex: number; colIndex: number }[]>>;
  currentMatchIndex: number;
  setCurrentMatchIndex: React.Dispatch<React.SetStateAction<number>>;
  goToNextMatch: () => void;
  goToPrevMatch: () => void;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [listView, setListView] = useState(true);
  const [tableTab, setTableTab] = useState("data");
  const [thisTable, setThisTable] = useState("data");
  const [thisTableId, setThisTableId] = useState("");
  const [editName, setEditName] = useState(false);
  const [flag, setFlag] = useState(false);
  const [recordCount, setRecordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [localColumns, setLocalColumns] = useState<Column[]>([]);
  const [globalFilter, setGlobalFilter] = useState<string | null>("");
  const [rowHeight, setRowHeight] = useState(2);
  const [baseColor, setBaseColor] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [sortViewOpen, setSortViewOpen] = useState(false);
  const [tempCol, setTempCol] = useState({ id: "", name: "", type: "" });
  const [sortItems, setSortItems] = useState<JSX.Element[]>([]);
  const [isViewsOpen, setIsViewsOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<View | null>(null);
  const [viewSorting, setViewSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [colsNotInSort, setColsNotInSort] = useState<Column[]>([]);
  const [localCells, setLocalCells] = useState<
    Record<string, string | number>[]
  >([]);
  const [localData, setLocalData] = useState<Record<string, string | number>[]>(
    [],
  );
  const [localTables, setLocalTables] = useState<
    {
      baseId: string;
      id: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
    }[]
  >([]);
  const [matchedCells, setMatchedCells] = useState<{ rowIndex: number; colIndex: number }[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const focusMatch = (rowI: number, colI: number) => {
    const selector = `[data-row-index='${rowI}'][data-col-index='${colI}']`;
    const cell = document.querySelector(selector);
    if (cell) {
      cell.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      (cell as HTMLElement).focus();
    }
  };

  const goToNextMatch = () => {
    if (!matchedCells.length) return;
    setCurrentMatchIndex((prev) => {
      const next = (prev + 1) % matchedCells.length;
      if (matchedCells[next]) {
        if (matchedCells[next]) {
          if (matchedCells[next]) {
            focusMatch(matchedCells[next].rowIndex, matchedCells[next].colIndex);
          }
        }
      }
      return next;
    });
  };

  const goToPrevMatch = () => {
    if (!matchedCells.length) return;
    setCurrentMatchIndex((prev) => {
      const next = (prev - 1 + matchedCells.length) % matchedCells.length;
      if (matchedCells[next])
        focusMatch(matchedCells[next].rowIndex, matchedCells[next].colIndex);
      return next;
    });
  };

  const value = {
    sidebarOpen,
    setSidebarOpen,
    listView,
    setListView,
    tableTab,
    setTableTab,
    thisTable,
    setThisTable,
    thisTableId,
    setThisTableId,
    editName,
    setEditName,
    flag,
    setFlag,
    recordCount,
    setRecordCount,
    loading,
    setLoading,
    localColumns,
    setLocalColumns,
    localData,
    setLocalData,
    globalFilter,
    setGlobalFilter,
    rowHeight,
    setRowHeight,
    baseColor,
    setBaseColor,
    localCells,
    setLocalCells,
    sorting,
    setSorting,
    sortViewOpen,
    setSortViewOpen,
    tempCol,
    setTempCol,
    sortItems,
    setSortItems,
    isViewsOpen,
    setIsViewsOpen,
    selectedView,
    setSelectedView,
    viewSorting,
    setViewSorting,
    colsNotInSort,
    setColsNotInSort,
    localTables,
    setLocalTables,
    columnFilters,
    setColumnFilters,
    rowSelection,
    setRowSelection,
    columnVisibility,
    setColumnVisibility,
    matchedCells,
    setMatchedCells,
    currentMatchIndex,
    setCurrentMatchIndex,
    goToNextMatch,
    goToPrevMatch,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("error in general result page context");
  }
  return context;
};
