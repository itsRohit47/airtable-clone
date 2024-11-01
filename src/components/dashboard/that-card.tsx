import {
  AudioLinesIcon,
  BoxIcon,
  ArrowUpIcon,
  TableCellsMergeIcon,
} from "lucide-react";
export default function ThatCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex w-full cursor-pointer flex-col items-start gap-3 rounded-md border border-gray-300 bg-white p-4 shadow-sm hover:shadow-md min-h-28">
      <div className="flex gap-x-3">
        {icon === "audio" && <AudioLinesIcon />}
        {icon === "box" && <BoxIcon />}
        {icon === "arrow" && <ArrowUpIcon />}
        {icon === "table" && <TableCellsMergeIcon />}
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
