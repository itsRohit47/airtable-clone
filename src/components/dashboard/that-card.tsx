"use client";
import {
  AudioLinesIcon,
  BoxIcon,
  ArrowUpIcon,
  TableCellsMergeIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { useState } from "react";

export default function ThatCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div
      className="flex min-h-28 w-full cursor-pointer flex-col items-start gap-3 rounded-md border border-gray-300 bg-white p-4 shadow-sm hover:shadow-md"
      onClick={() => {
        if (onClick) {
          setIsLoading(true);
          onClick();
        }
      }}
    >
      <div className="flex items-center gap-x-3">
        {icon === "audio" && <AudioLinesIcon />}
        {icon === "box" && <BoxIcon />}
        {icon === "arrow" && <ArrowUpIcon />}
        {icon === "table" && <TableCellsMergeIcon />}
        <h3 className="font-medium">{title}</h3>
        {isLoading && (
          <LoaderCircleIcon
            className="animate-spin"
            size={16}
            style={{ marginLeft: "0.5rem" }}
          />
        )}
      </div>
      <p className="text-sm text-gray-500">{description} </p>
    </div>
  );
}
