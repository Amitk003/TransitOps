"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { MobileSidebar } from "./mobile-sidebar";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  const displayName = user?.full_name || "User";

  return (
    <>
      <header className="flex h-[70px] items-center justify-between border-b border-border bg-[#111827] px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#94A3B8] hover:text-white md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <p className="text-xs text-[#94A3B8] md:text-sm">Welcome back</p>
            <p className="text-sm font-bold text-white md:text-base">{displayName}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="icon" aria-label="Notifications" className="text-[#94A3B8] hover:text-white">
            <Bell className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Sign out" onClick={handleSignOut} className="text-[#94A3B8] hover:text-white">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-[#0B1220]">
            <div className="flex h-[70px] items-center justify-between border-b border-border px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-lg font-bold text-accent-foreground">
                  T
                </div>
                <span className="text-base font-bold tracking-tight text-white">TransitOps</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#94A3B8] hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <MobileSidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
