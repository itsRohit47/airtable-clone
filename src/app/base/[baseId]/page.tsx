"use client";
import { GetTableList } from "@/lib/actions/table";
import TableTopNav from "@/components/table/table-top-nav";
import { useAppContext } from "@/components/context";
import TableTools from "@/components/table/table-tools";
import Image from "next/image";
import { TableView } from "@/components/table/table-view";
export default function BasePage({ params }: { params: { baseId: string } }) {
  const tables = GetTableList({ baseId: params.baseId });

  const { tableTab, thisTableId } = useAppContext();
  const tableNames =
    tables?.map((table) => {
      return table.name;
    }) ?? [];

  const tableIds =
    tables?.map((table) => {
      return table.id;
    }) ?? [];

  return (
    <div className="">
      <TableTopNav
        baseId={params.baseId}
        tableNames={tableNames}
        tableIds={tableIds}
      ></TableTopNav>

      <div className="mt-16 py-2">
        {tableTab == "data" && (
          <div className="flex flex-col">
            <TableTools></TableTools>
            <TableView tableId={thisTableId}></TableView>
          </div>
        )}
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
