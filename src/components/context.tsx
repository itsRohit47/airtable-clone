"use client";
import React, {
  createContext,
  useState,
  type ReactNode,
  useContext,
} from "react";

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
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [listView, setListView] = useState(false);
  const [tableTab, setTableTab] = useState("data");
  const [thisTable, setThisTable] = useState("data");
  const [thisTableId, setThisTableId] = useState("");
  const [editName, setEditName] = useState(false);
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
