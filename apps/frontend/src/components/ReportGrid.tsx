import { Timer, Heading1, ImageOff, FileText, Type, AlignLeft } from "lucide-react";
import type { AnalyzeReport } from "@page-pulse/shared";
import { categorizeStatus } from "@page-pulse/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";

interface ReportGridProps {
  report: AnalyzeReport;
  requestedUrl: string;
}

function speedAccent(ms: number): "success" | "warning" | "danger" {
  if (ms < 500) return "success";
  if (ms < 1500) return "warning";
  return "danger";
}

function altAccent(count: number): "success" | "warning" | "danger" {
  if (count === 0) return "success";
  if (count <= 3) return "warning";
  return "danger";
}

export function ReportGrid({ report, requestedUrl }: ReportGridProps) {
  const statusCategory = categorizeStatus(report.httpStatus);
  const statusAccent = statusCategory === "success" ? "success" : statusCategory === "redirect" ? "info" : statusCategory === "clientError" ? "warning" : "danger";

  return (
    <div className="mx-auto w-full max-w-4xl animate-fade-up" aria-live="polite">
      <Card className="glass-strong mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wider">Audited page</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-0">
          <p className="truncate font-mono text-sm text-foreground" title={report.finalUrl}>
            {report.finalUrl || requestedUrl}
          </p>
          <StatusBadge status={report.httpStatus} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="HTTP status" icon={Timer} value={report.httpStatus} accent={statusAccent} hint="Response code from the origin server" />
        <MetricCard
          label="Response time"
          icon={Timer}
          value={`${report.responseTime} ms`}
          accent={speedAccent(report.responseTime)}
          hint="Time to first byte, end to end"
        />
        <MetricCard label="Page title" icon={Type} value={report.title ?? "Missing"} accent={report.title ? "success" : "warning"} hint={report.title ? undefined : "No <title> tag found"} />
        <MetricCard
          label="Meta description"
          icon={FileText}
          value={report.metaDescription ? "Present" : "Missing"}
          accent={report.metaDescription ? "success" : "warning"}
          hint={report.metaDescription ?? "No meta description found"}
        />
        <MetricCard label="H1 tags" icon={Heading1} value={report.h1Count} accent={report.h1Count === 1 ? "success" : "warning"} hint={report.h1Count === 1 ? "Ideal: exactly one" : "Ideal is exactly one H1"} />
        <MetricCard
          label="Images missing alt text"
          icon={ImageOff}
          value={report.imagesMissingAlt}
          accent={altAccent(report.imagesMissingAlt)}
          hint="Accessibility and SEO impact"
        />
        <MetricCard label="Word count" icon={AlignLeft} value={report.wordCount.toLocaleString()} accent="default" hint="Visible body text only" className="sm:col-span-2 lg:col-span-1" />
      </div>
    </div>
  );
}
