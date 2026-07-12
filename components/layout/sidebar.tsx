"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/auth/auth-context";
import { canAccessRoute } from "@/lib/auth/roles";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const allNavItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vehicles", label: "Vehicle Registry", icon: Truck },
  { href: "/drivers", label: "Drivers", icon: Users },
  { href: "/trips", label: "Trips", icon: Route },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/fuel-expenses", label: "Fuel & Expenses", icon: Fuel },
  { href: "/reports", label: "Reports & Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const role = useRole();

  const visibleItems = allNavItems.filter((item) => {
    if (item.href === "/") return true;
    return canAccessRoute(role, item.href);
  });

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-[#0B1220] md:flex md:flex-col">
      <div className="flex h-[70px] items-center gap-3 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-lg font-bold text-accent-foreground">
          T
        </div>
        <span className="text-base font-bold tracking-tight text-white">TransitOps</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white text-[#0B1220]"
                  : "text-[#94A3B8] hover:bg-[#111827] hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
