"use client";
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
  localTabes: {
    baseId: string;
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  setLocalTabes: React.Dispatch<
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
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [listView, setListView] = useState(false);
  const [tableTab, setTableTab] = useState("data");
  const [thisTable, setThisTable] = useState("data");
  const [thisTableId, setThisTableId] = useState("");
  const [editName, setEditName] = useState(false);
  const [flag, setFlag] = useState(false);
  const [recordCount, setRecordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [localColumns, setLocalColumns] = useState<Column[]>([]);
  const [localData, setLocalData] = useState<Record<string, string | number>[]>(
    [],
  );
  const [localTabes, setLocalTabes] = useState<
    {
      baseId: string;
      id: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
    }[]
  >([]);
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
    localTabes,
    setLocalTabes,
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
