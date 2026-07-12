"use client";

import { NavItems } from "./nav-items";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-[#0B1220] md:flex md:flex-col">
      <div className="flex h-[70px] items-center gap-3 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-lg font-bold text-accent-foreground">
          T
        </div>
        <span className="text-base font-bold tracking-tight text-white">TransitOps</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        <NavItems />
      </nav>
    </aside>
  );
}
