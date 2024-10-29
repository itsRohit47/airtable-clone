"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "../ui/button";
import { api } from "@/trpc/react";

interface BaseCardProps {
  base: {
    id: string;
    name: string;
    updatedAt: Date;
  };
}

export function BaseCard({ base }: BaseCardProps) {
  const ctx = api.useUtils();

  const { mutate } = api.base.deleteBase.useMutation({
    onSuccess: () => {
      console.log("deleted base");
      void ctx.base.getAllBases.invalidate();
    },
  });

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>{base.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-3">
        <p className="text-sm text-muted-foreground">
          Last updated {formatDistanceToNow(new Date(base.updatedAt))} ago
        </p>
        <Link
          href={`/base/${base.id}`}
          className="text-sm text-primary hover:text-blue-500 hover:underline"
        >
          View base
        </Link>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            mutate({ baseId: base.id });
          }}
        >
          Delete base {base.id}
        </Button>
      </CardContent>
    </Card>
  );
}
