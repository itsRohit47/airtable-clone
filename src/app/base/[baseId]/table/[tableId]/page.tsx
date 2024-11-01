import { TableView } from "@/components/table/table-view";
import { useAppContext } from "@/components/context";
export default function TablePage({ params }: { params: { tableId: string } }) {
  const { tableTab, setTableTab } = useAppContext();
  return (
    <div className="p-6">
      <TableView tableId={params.tableId} />
      <div className="mt-44 text-black">
        {" "}
        {tableTab == "data" && <div>hi</div>}
        {tableTab == "auto" && <div>auto</div>}{" "}
      </div>
    </div>
  );
}
