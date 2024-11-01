"use client";
import { GetTableList } from "@/lib/actions/table";
import { api } from "@/trpc/react";
import TableTopNav from "@/components/table/table-top-nav";
import { useAppContext } from "@/components/context";
import TableTools from "@/components/table/table-tools";
import Image from "next/image";
export default function BasePage({ params }: { params: { baseId: string } }) {
  const tables = GetTableList({ baseId: params.baseId });
  const { tableTab, setThisTable } = useAppContext();
  const tableNames =
    tables?.map((table) => {
      return table.name;
    }) ?? [];

  const ctx = api.useUtils();

  return (
    <div className="">
      <TableTopNav
        baseName={params.baseId}
        tableNames={tableNames}
      ></TableTopNav>
      <div className="mt-16 py-2">
        {tableTab == "data" && <TableTools></TableTools>}
        {tableTab == "interfaces" && (
          <div>
            <div>
              <Image
                src="/interface.png"
                alt=""
                width={2000}
                height={2000}
                className="h-full w-full object-cover"
              ></Image>
            </div>
          </div>
        )}
        {tableTab == "auto" && (
          <div className="">
            <Image
              src="/automation.png"
              alt=""
              width={2000}
              height={2000}
              className="h-full w-full object-cover"
            ></Image>
          </div>
        )}
        {tableTab == "forms" && (
          <div className="">
            <Image
              src="/form.png"
              alt=""
              width={2000}
              height={2000}
              className="h-full w-full object-cover"
            ></Image>
          </div>
        )}
      </div>
    </div>
  );
}
