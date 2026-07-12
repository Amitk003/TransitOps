"use client";

import { NavItems } from "./nav-items";

export function MobileSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      <NavItems onNavigate={onNavigate} />
    </nav>
  );
}
