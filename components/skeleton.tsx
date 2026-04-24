export function Skeleton({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-lg animate-pulse ${className}`}
      style={{ background: "var(--color-border)", ...style }}
    />
  );
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="card space-y-4">
      <Skeleton style={{ height: "12px", width: "30%" }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton style={{ height: "10px", width: "20%" }} />
          <Skeleton style={{ height: "38px" }} />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card flex items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton style={{ height: "13px", width: "50%" }} />
            <Skeleton style={{ height: "11px", width: "30%" }} />
          </div>
          <div className="flex gap-2">
            <Skeleton style={{ height: "26px", width: "40px" }} />
            <Skeleton style={{ height: "26px", width: "50px" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
