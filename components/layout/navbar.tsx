"use client";

import { Bell } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

// Note: swap the placeholder user/role once Phase 2 auth context lands.
export function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <p className="text-sm font-medium">Fleet Manager</p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
