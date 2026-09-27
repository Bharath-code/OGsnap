import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Grey → brand transition. Plays when `developed` flips on, or when an <InView> ancestor scrolls in.
export function Develop({
  before,
  after,
  developed,
  delay,
  className,
}: {
  before: ReactNode;
  after: ReactNode;
  developed?: boolean;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("develop", developed && "is-dev", className)}
      style={delay ? ({ "--delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      <div>{before}</div>
      <div className="develop-after">{after}</div>
    </div>
  );
}
