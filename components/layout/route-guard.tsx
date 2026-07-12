"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, useRole } from "@/lib/auth/auth-context";
import { canAccessRoute } from "@/lib/auth/roles";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading } = useAuth();
  const role = useRole();

  useEffect(() => {
    if (isLoading) return;
    if (role && !canAccessRoute(role, pathname)) {
      router.push("/");
    }
  }, [isLoading, role, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
