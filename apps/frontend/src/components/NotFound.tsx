import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">This page has no pulse</h1>
      <p className="max-w-sm text-muted-foreground">
        The page you&rsquo;re looking for doesn&rsquo;t exist. Let&rsquo;s get you back to the audit tool.
      </p>
      <Button asChild>
        <a href="/">
          <Home className="h-4 w-4" aria-hidden="true" />
          Back to Page Pulse
        </a>
      </Button>
    </div>
  );
}
