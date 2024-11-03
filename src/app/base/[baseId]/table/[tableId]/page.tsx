import { TableView } from "@/components/table/table-view";
export default function Table({
  params,
}: Readonly<{ params: { tableId: string } }>) {
  return (
    <div className="">
      <TableView tableId={params.tableId}></TableView>
    </div>
  );
}
