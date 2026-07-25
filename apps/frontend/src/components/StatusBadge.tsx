import { categorizeStatus, type StatusCategory } from "@page-pulse/shared";
import { cn } from "@/lib/utils";

const STYLES: Record<StatusCategory, string> = {
  success: "bg-success/15 text-success border-success/30",
  redirect: "bg-info/15 text-info border-info/30",
  clientError: "bg-warning/15 text-warning border-warning/30",
  serverError: "bg-danger/15 text-danger border-danger/30",
  unknown: "bg-muted text-muted-foreground border-border",
};

const LABELS: Record<StatusCategory, string> = {
  success: "Success",
  redirect: "Redirect",
  clientError: "Client error",
  serverError: "Server error",
  unknown: "Unknown",
};

export function StatusBadge({ status }: { status: number }) {
  const category = categorizeStatus(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs font-semibold",
        STYLES[category]
      )}
    >
      {status} &middot; {LABELS[category]}
    </span>
  );
}
