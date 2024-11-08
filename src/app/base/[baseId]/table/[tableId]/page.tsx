"use client";
import TableTopNav from "@/components/table/table-top-nav";
import TableNav from "@/components/table/table-nav";
import { TableView } from "@/components/table/table-view";
import TableHead from "@/components/table/table-header";
import { useAppContext } from "@/components/context";
import ViewMenu from "@/components/views/view-menu";
import { api } from "@/trpc/react";
export default function Table({
  params,
}: Readonly<{ params: { tableId: string; baseId: string } }>) {
  const { tableTab, recordCount, isViewsOpen } = useAppContext();
  const { data, isLoading } = api.table.getTableCount.useQuery({
    tableId: params.tableId,
  });

  return (
    <div className="fixed flex min-h-dvh w-full flex-col">
      <TableTopNav baseId={params.baseId}></TableTopNav>
      {tableTab === "data" && (
        <>
          <TableNav baseId={params.baseId}></TableNav>
          <TableHead tableId={params.tableId}></TableHead>
          <div className="-z-10 flex h-full w-max flex-grow transition duration-150 ease-in-out">
            <ViewMenu _tableId={params.tableId}></ViewMenu>
            <TableView tableId={params.tableId}></TableView>
          </div>
        </>
      )}
      {["Automations", "Interfaces", "Forms"].includes(tableTab) && (
        <div className="m-auto">{tableTab} coming soon</div>
      )}
    </div>
  );
}
