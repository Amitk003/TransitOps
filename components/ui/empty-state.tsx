import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = "No data found",
  description = "There are no records to display yet.",
  actionLabel,
  actionHref,
  onAction,
}: Props) {
  const btn = actionLabel ? (
    actionHref ? (
      <Link href={actionHref}>
        <Button>{actionLabel}</Button>
      </Link>
    ) : (
      <Button onClick={onAction}>{actionLabel}</Button>
    )
  ) : null;

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <Inbox className="h-12 w-12 text-muted-foreground" />
      <div className="text-center">
        <p className="text-base font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {btn}
    </div>
  );
}
