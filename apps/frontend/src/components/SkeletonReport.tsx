export function SkeletonReport() {
  return (
    <div className="mx-auto w-full max-w-4xl" role="status" aria-label="Analyzing page">
      <div className="glass mb-6 h-20 rounded-lg shimmer" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="glass h-28 rounded-lg shimmer" style={{ animationDelay: `${i * 0.05}s` }} />
        ))}
      </div>
      <span className="sr-only">Analyzing the page, please wait&hellip;</span>
    </div>
  );
}
