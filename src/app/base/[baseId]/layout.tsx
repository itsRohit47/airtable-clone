"use client";
import TableTopNav from "@/components/table/table-top-nav";
import TableNav from "@/components/table/table-nav";
import "@/styles/globals.css";
import { useAppContext } from "@/components/context";
import Image from "next/image";

export default function BaseLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: { baseId: string } }>) {
  const { tableTab, recordCount } = useAppContext();
  return (
    <>
      <div className="fixed flex w-full flex-col">
        <TableTopNav baseId={params.baseId}></TableTopNav>
        {tableTab === "data" && <TableNav baseId={params.baseId}></TableNav>}
        {tableTab === "data" && <div className="-z-10">{children}</div>}
        {tableTab === "data" && (
          <div className="fixed bottom-0 w-full border bg-white p-2 text-xs text-gray-500">
            {recordCount} records
          </div>
        )}
      </div>
    </>
  );
}
