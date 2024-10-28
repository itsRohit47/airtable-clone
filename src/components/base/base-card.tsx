import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface BaseCardProps {
  base: {
    id: string;
    name: string;
    updatedAt: Date;
  };
}

export function BaseCard({ base }: BaseCardProps) {
  return (
    <Link href={`/base/${base.id}`}>
      <Card className="cursor-pointer transition-all hover:border-primary">
        <CardHeader>
          <CardTitle>{base.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Last updated {formatDistanceToNow(new Date(base.updatedAt))} ago
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
