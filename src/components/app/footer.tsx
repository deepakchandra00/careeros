"use client";

import { Rocket, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background/60">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-4 py-4 text-sm sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="grid size-6 place-items-center rounded-md bg-gradient-to-br from-primary to-emerald-400 text-primary-foreground">
            <Rocket className="size-3.5" />
          </div>
          <span className="font-medium text-foreground">CareerOS</span>
          <span className="text-xs">·</span>
          <span className="text-xs">The Operating System for Your Career</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <a className="hover:text-foreground" href="#">Privacy</a>
          <a className="hover:text-foreground" href="#">Terms</a>
          <a className="hover:text-foreground" href="#">Docs</a>
          <Badge variant="secondary" className="gap-1 font-normal">
            v1.0 · Phase 1 MVP
          </Badge>
          <span className="hidden items-center gap-1 sm:flex">
            Built with <Heart className="size-3 fill-primary text-primary" /> in India
          </span>
        </div>
      </div>
    </footer>
  );
}
