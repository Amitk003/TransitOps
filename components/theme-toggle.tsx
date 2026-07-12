"use client";

import * as React from "react";
import { Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Theme"
      title="bright theme not available, we built this for newer generation"
      className="text-[#94A3B8] hover:text-white cursor-default"
    >
      <Moon className="h-5 w-5" />
    </Button>
  );
}
