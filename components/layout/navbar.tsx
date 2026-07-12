"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";

export function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  const displayName = user?.full_name || "User";

  return (
    <header className="flex h-[70px] items-center justify-between border-b border-border bg-[#111827] px-6">
      <div>
        <p className="text-sm text-[#94A3B8]">Welcome back</p>
        <p className="text-base font-bold text-white">{displayName}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications" className="text-[#94A3B8] hover:text-white">
          <Bell className="h-5 w-5" />
        </Button>
        <ThemeToggle />
        <Button variant="ghost" size="icon" aria-label="Sign out" onClick={handleSignOut} className="text-[#94A3B8] hover:text-white">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
