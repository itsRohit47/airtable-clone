import { ChevronDown, PlusIcon } from "lucide-react";
import clsx from "clsx";
import { useAppContext } from "../context";

export default function TableNav({
  tableNames,
  tableIds,
}: {
  tableNames: string[];
  tableIds: string[];
}) {
  const { thisTable, setThisTable, thisTableId, setThisTableId } =
    useAppContext();
  return (
    <div>
      <div className="flex h-max items-center justify-between gap-x-1 text-xs font-normal">
        <div className="flex w-full -translate-x-4 translate-y-2 items-center rounded-tr-md bg-[#C03D05] px-4 pb-1">
          {tableNames.map((table) => (
            <div
              key={table}
              className={clsx(
                "flex cursor-pointer items-center p-2 hover:bg-[#B63A05]",
                {
                  "rounded-t-md bg-white text-black hover:bg-white":
                    table === thisTable,
                },
              )}
              onClick={() => {
                setThisTable(table);
                const tableId = tableIds[tableNames.indexOf(table)];
                if (tableId) {
                  setThisTableId(tableId);
                }
              }}
            >
              {table}
              {table === thisTable && (
                <ChevronDown strokeWidth={1.5} size={18}></ChevronDown>
              )}
            </div>
          ))}
          <span className="px-2 font-thin text-gray-50/50">|</span>
          <ChevronDown strokeWidth={1.5} size={18}></ChevronDown>
          <span className="px-2 font-thin text-gray-50/50">|</span>
          <div className="flex cursor-pointer items-center gap-x-3 px-2 text-white/90 hover:text-white">
            {" "}
            <PlusIcon size={18}></PlusIcon>
            Add or import table
          </div>
        </div>
        <div className="flex translate-x-4 translate-y-2 items-center gap-x-10 rounded-tl-md bg-[#C03D05] p-2">
          <span>Extensions</span>
          <span className="flex items-center gap-x-3">
            Tools <ChevronDown strokeWidth={1.5} size={18}></ChevronDown>
          </span>
        </div>
      </div>
    </div>
  );
}
