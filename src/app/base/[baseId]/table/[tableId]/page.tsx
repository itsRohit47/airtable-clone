"use client";
import TableTopNav from "@/components/table/table-top-nav";
import TableNav from "@/components/table/table-nav";
import { TableView } from "@/components/table/table-view";
import TableHead from "@/components/table/table-header";
import { useAppContext } from "@/components/context";
export default function Table({
  params,
}: Readonly<{ params: { tableId: string; baseId: string } }>) {
  const { tableTab, recordCount } = useAppContext();
  return (
    <div className="fixed flex min-h-dvh w-full flex-col">
      <TableTopNav baseId={params.baseId}></TableTopNav>
      <TableNav baseId={params.baseId}></TableNav>
      <TableHead tableId={params.tableId}></TableHead>
      <div className="-z-10 flex h-full w-max flex-grow flex-col">
        <TableView tableId={params.tableId}></TableView>
      </div>
      {tableTab === "data" && (
        <div className="fixed bottom-0 w-full border-t border-gray-300 bg-white p-2 text-xs text-gray-500">
          {recordCount} records
        </div>
      )}
    </div>
  );
}
