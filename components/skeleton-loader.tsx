interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-muted rounded ${className}`} />
  )
}

export function ResultSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex justify-between items-center p-3 bg-muted/70 rounded-lg border-2 border-muted">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  )
}
