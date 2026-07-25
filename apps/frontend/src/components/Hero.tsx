import { Activity } from "lucide-react";

export function Hero() {
  return (
    <section className="container pt-16 pb-10 sm:pt-24 sm:pb-14">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
          <Activity className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Live in seconds &mdash; no signup required
        </div>

        <h1 className="animate-fade-up font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Take any page&rsquo;s <span className="text-gradient">pulse</span>
        </h1>

        <p
          className="mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg animate-fade-up"
          style={{ animationDelay: "0.08s" }}
        >
          Drop in a URL and get a clean read on status, speed, and the SEO and accessibility basics &mdash;
          straight from the source, in one request.
        </p>

        {/* Signature element: an animated waveform standing in for a heartbeat monitor,
            reinforcing the "pulse" of the page being scanned. */}
        <div
          className="mt-10 w-full max-w-xl animate-fade-up"
          style={{ animationDelay: "0.16s" }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 600 80" fill="none" className="w-full text-primary">
            <path
              d="M0 40 H180 L205 8 L232 72 L255 26 L272 54 L292 40 H600"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1000}
              strokeDasharray={1000}
              className="animate-pulse-line"
            />
            <path
              d="M0 40 H180 L205 8 L232 72 L255 26 L272 54 L292 40 H600"
              stroke="currentColor"
              strokeOpacity="0.12"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
