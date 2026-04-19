import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
  style?: CSSProperties
}

function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      style={style}
    />
  )
}

export { Skeleton }
