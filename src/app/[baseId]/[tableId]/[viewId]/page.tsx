"use client";
import TableTopNav from "@/components/table/table-top-nav";
import TableNav from "@/components/table/table-nav";
import { TableView } from "@/components/table/table-view";
import TableHead from "@/components/table/table-header";
import { useAppContext } from "@/components/context";
import ViewMenu from "@/components/views/view-menu";
export default function Table({
  params,
}: Readonly<{ params: { tableId: string; baseId: string; viewId: string } }>) {
  const { tableTab } = useAppContext();

  return (
    <div className="fixed flex min-h-dvh w-full flex-col h-full">
      <TableTopNav
        baseId={params.baseId}
      ></TableTopNav>
      {tableTab === "data" && (
        <>
          <TableNav baseId={params.baseId} viewId={params.viewId}></TableNav>
          <TableHead tableId={params.tableId}></TableHead>
          <div className="flex h-full">
            <div className="max-h-[100vh] h-full">
              <ViewMenu
                _tableId={params.tableId}
                _baseId={params.baseId}
              ></ViewMenu>
            </div>
            <TableView
              tableId={params.tableId}
              viewId={params.viewId}
            ></TableView>
          </div>
        </>
      )}
      {["Automations", "Interfaces", "Forms"].includes(tableTab) && (
        <div className="m-auto">{tableTab} coming soon</div>
      )}
    </div>
  );
}
