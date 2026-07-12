"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { roleLabels } from "@/lib/auth/roles";

export function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  const displayName = user?.full_name || "User";
  const displayRole = user?.role ? roleLabels[user.role] || user.role : "";

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <p className="text-sm font-medium">{displayName}</p>
        {displayRole && (
          <p className="text-xs text-muted-foreground">{displayRole}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <ThemeToggle />
        <Button variant="ghost" size="icon" aria-label="Sign out" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
