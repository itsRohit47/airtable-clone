import { TableView } from "@/components/table/table-view";
import { useAppContext } from "@/components/context";
export default function TablePage({ params }: { params: { tableId: string } }) {
  const { tableTab, setTableTab } = useAppContext();
  return (
    <div className="p-6">
    </div>
  );
}
