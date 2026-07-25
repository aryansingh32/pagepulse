import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Top-level safety net. If any render-time error slips through the app,
 * this shows a recoverable screen instead of a blank page.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Page Pulse crashed:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertOctagon className="h-10 w-10 text-danger" aria-hidden="true" />
        <h1 className="font-display text-2xl font-semibold">Something went wrong</h1>
        <p className="max-w-sm text-muted-foreground">
          An unexpected error stopped the page from rendering. Reloading usually fixes it.
        </p>
        <Button onClick={() => window.location.reload()}>Reload page</Button>
      </div>
    );
  }
}
