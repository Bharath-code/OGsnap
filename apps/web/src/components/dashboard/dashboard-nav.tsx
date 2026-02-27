"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface DashboardNavItem {
  href: string;
  label: string;
}

interface DashboardNavProps {
  items: DashboardNavItem[];
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav({ items }: DashboardNavProps): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav className="rounded-xl border border-border/70 bg-card/70 p-2 backdrop-blur">
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative overflow-hidden rounded-md px-3 py-2 text-sm font-medium transition-all duration-250",
                "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300 before:content-['']",
                "before:bg-[linear-gradient(110deg,rgba(30,156,204,0.2),rgba(89,199,240,0.12))]",
                "hover:text-foreground hover:before:opacity-100",
                active
                  ? "scale-[1.01] text-foreground shadow-[inset_0_0_0_1px_rgba(30,156,204,0.35)] before:opacity-100"
                  : "text-muted-foreground",
              )}
              style={{ transitionDelay: `${Math.min(index * 25, 120)}ms` }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-all duration-300",
                    active ? "bg-primary shadow-[0_0_0_4px_rgba(30,156,204,0.18)]" : "bg-muted-foreground/45",
                  )}
                />
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
