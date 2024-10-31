import { TableView } from "@/components/table/table-view";
export default function TablePage({ params }: { params: { tableId: string } }) {
  return (
    <div className="p-6">
      <TableView tableId={params.tableId} />
    </div>
  );
}
