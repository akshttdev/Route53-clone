export function RecordLoading() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="h-12 animate-pulse rounded-lg bg-muted"
        />
      ))}
    </div>
  );
}