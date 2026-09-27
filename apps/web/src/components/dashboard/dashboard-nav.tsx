"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface DashboardNavItem {
  href: string;
  label: string;
  also?: string[];
  quiet?: boolean;
}

const matches = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function DashboardNav({ items }: { items: DashboardNavItem[] }): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto lg:sticky lg:top-24 lg:flex-col">
      {items.map((item) => {
        const active = [item.href, ...(item.also ?? [])].some((href) => matches(pathname, href));
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors",
              item.quiet && "lg:mt-6",
              active ? "bg-card font-semibold text-foreground shadow-[0_0_0_1px_hsl(var(--border))]" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
