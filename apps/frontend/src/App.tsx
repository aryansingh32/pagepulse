import { useState } from "react";
import type { AnalyzeReport } from "@page-pulse/shared";
import { Activity } from "lucide-react";
import { Hero } from "@/components/Hero";
import { UrlForm } from "@/components/UrlForm";
import { ReportGrid } from "@/components/ReportGrid";
import { SkeletonReport } from "@/components/SkeletonReport";
import { ErrorState } from "@/components/ErrorState";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotFound } from "@/components/NotFound";
import { useTheme } from "@/hooks/useTheme";
import { analyzeUrl } from "@/lib/apiClient";

type Status = "idle" | "loading" | "success" | "error";

function Header() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="container flex items-center justify-between py-6">
      <a href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
        <Activity className="h-5 w-5 text-primary" aria-hidden="true" />
        Page Pulse
      </a>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
    </header>
  );
}

function AuditApp() {
  const [status, setStatus] = useState<Status>("idle");
  const [report, setReport] = useState<AnalyzeReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [requestedUrl, setRequestedUrl] = useState<string>("");

  async function handleSubmit(url: string) {
    setStatus("loading");
    setErrorMessage("");
    setRequestedUrl(url);

    const result = await analyzeUrl(url);

    if (result.ok) {
      setReport(result.data);
      setStatus("success");
    } else {
      setErrorMessage(result.error);
      setStatus("error");
    }
  }

  return (
    <>
      <Header />
      <main id="main-content">
        <Hero />
        <section className="container pb-24">
          <UrlForm onSubmit={handleSubmit} isLoading={status === "loading"} />

          <div className="mt-10">
            {status === "loading" && <SkeletonReport />}
            {status === "error" && <ErrorState message={errorMessage} />}
            {status === "success" && report && <ReportGrid report={report} requestedUrl={requestedUrl} />}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  const isKnownRoute = typeof window === "undefined" || window.location.pathname === "/";

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      {isKnownRoute ? (
        <AuditApp />
      ) : (
        <>
          <Header />
          <main className="flex-1">
            <NotFound />
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}
