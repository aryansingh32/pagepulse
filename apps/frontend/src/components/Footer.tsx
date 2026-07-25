export function Footer() {
  return (
    <footer className="border-t border-border/60 py-8">
      <div className="container flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
        <p>&copy; {new Date().getFullYear()} Page Pulse. All rights reserved.</p>
        <p>
          Built for{" "}
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline decoration-primary/60 underline-offset-4 hover:text-primary"
          >
            Digital Heroes Training Task
          </a>
        </p>
      </div>
    </footer>
  );
}
