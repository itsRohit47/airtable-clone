"use client";
import TableTopNav from "@/components/table/table-top-nav";
import TableNav from "@/components/table/table-nav";
import "@/styles/globals.css";
import { useAppContext } from "@/components/context";

export default function BaseLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: { baseId: string } }>) {
  const { tableTab } = useAppContext();
  return (
    <>
      <div className="fixed flex w-full flex-col">
        <TableTopNav baseId={params.baseId}></TableTopNav>
        <TableNav baseId={params.baseId}></TableNav>
        <div className="-z-10 overflow-y-scroll p-44">{children}</div>
        {tableTab === "data" && (
          <div className="fixed bottom-0 w-full border p-2 text-xs text-gray-500">
            0 records
          </div>
        )}
      </div>
    </>
  );
}
