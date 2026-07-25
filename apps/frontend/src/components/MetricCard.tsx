import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  icon: LucideIcon;
  value: ReactNode;
  hint?: string;
  accent?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const ACCENT_ICON: Record<NonNullable<MetricCardProps["accent"]>, string> = {
  default: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
};

export function MetricCard({ label, icon: Icon, value, hint, accent = "default", className }: MetricCardProps) {
  return (
    <Card className={cn("glass transition-transform duration-200 hover:-translate-y-0.5", className)}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
        <CardTitle>{label}</CardTitle>
        <Icon className={cn("h-4 w-4", ACCENT_ICON[accent])} aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="font-mono text-2xl font-semibold text-foreground sm:text-3xl">{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
