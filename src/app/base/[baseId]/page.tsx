"use client";
import { Suspense } from "react";
import { GetTableList } from "@/lib/actions/table";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function BasePage({ params }: { params: { baseId: string } }) {
  const tables = GetTableList({ baseId: params.baseId });
  const ctx = api.useUtils();
  const { mutate: addField } = api.table.addField.useMutation({
    onSuccess: () => {
      console.log("added field");
      void ctx.table.getTablesByBaseId.invalidate();
    },
  });

  const { mutate: addTable } = api.table.addTable.useMutation({
    onSuccess: () => {
      console.log("added table");
      void ctx.table.getTablesByBaseId.invalidate();
    },
  });

  const { mutate: deleteTable } = api.table.deleteTable.useMutation({
    onSuccess: () => {
      console.log("deleted table");
      void ctx.table.getTablesByBaseId.invalidate();
    },
  });

  const { mutate: deleteColumn } = api.table.deleteColumn.useMutation({
    onSuccess: () => {
      console.log("deleted column");
      void ctx.table.getTablesByBaseId.invalidate();
    },
  });

  return (
    <div className="p-6">
      <Suspense fallback={<div>Loading tables...</div>}></Suspense>
      <div className="mt-6 flex flex-col items-center gap-y-3 text-center">
        <p className="text-muted-foreground">Base ID: {params.baseId}</p>
        <h1 className="text-2xl font-semibold">Tables</h1>
        <Button
          onClick={() => {
            addTable({ baseId: params.baseId });
          }}
        >
          Add Table
        </Button>
        <br />
        <div className="grid gap-3 lg:flex lg:flex-wrap">
          {tables?.map((table) => (
            <div
              key={table.id}
              className="rounded-lg border bg-gray-100 p-4 shadow-sm"
            >
              <div className="flex flex-col items-center justify-center gap-x-3">
                <div>
                  <strong>{table.name}</strong>
                </div>
                <strong>{table.id}</strong>
                <Link href={`/base/${params.baseId}/table/${table.id}`} className="text-blue-500">
                  View Table
                </Link>
                <Button
                  variant={"destructive"}
                  size={"sm"}
                  onClick={() => {
                    deleteTable({ tableId: table.id });
                  }}
                >
                  delete table
                </Button>
              </div>
              <br />
              {table.columns.map((column, index) => (
                <div key={column.id} className="flex flex-col">
                  colums {index} : {column.id}
                  <Button
                    variant={"destructive"}
                    size={"sm"}
                    onClick={() => {
                      deleteColumn({ columnId: column.id });
                    }}
                  >
                    delete column {index}
                  </Button>
                </div>
              ))}
              <br />
              {table.rows?.length === 0 && <div>now rows yet</div>}
              <br />
              <Button
                onClick={() => {
                  addField({ tableId: table.id });
                }}
              >
                Add field
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
