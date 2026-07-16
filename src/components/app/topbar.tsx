"use client";

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, Search, Bell, Plus, LogOut, User as UserIcon, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/store/app-store";
import { MODULE_MAP } from "@/lib/modules";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";

export function Topbar() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const active = useAppStore((s) => s.activeModule);
  const setModule = useAppStore((s) => s.setModule);
  const mod = MODULE_MAP[active];
  const { data: session } = useSession();

  const userName = session?.user?.name || "there";
  const firstName = userName.split(" ")[0];
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const plan = (session?.user as { plan?: string } | undefined)?.plan ?? "FREE";

  const quickActions: { label: string; id: Parameters<typeof setModule>[0] }[] = [
    { label: "Build Resume", id: "resume-builder" },
    { label: "ATS Review", id: "resume-review" },
    { label: "Ask Coach", id: "coach" },
  ];

  const openPalette = () => {
    window.dispatchEvent(new CustomEvent("careeros:command-palette"));
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={toggleSidebar}
        className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="hidden min-w-0 sm:block">
        <p className="text-sm font-semibold leading-tight">
          Welcome back, {firstName} 👋
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {mod.label} · {mod.description}
        </p>
      </div>

      {/* Search → opens command palette */}
      <button
        onClick={openPalette}
        className="relative ml-auto hidden max-w-xs flex-1 items-center md:flex"
      >
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <div className="h-9 w-full rounded-lg border border-border/60 pl-9 pr-16 text-left text-sm text-muted-foreground">
          Search or jump to…
        </div>
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 select-none rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline-block">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5 md:ml-3">
        <div className="mr-1 hidden items-center gap-1.5 lg:flex">
          {quickActions.map((a) => (
            <Button
              key={a.label}
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setModule(a.id)}
            >
              {a.label}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          className="hidden h-9 gap-1.5 sm:flex"
          onClick={() => setModule("resume-builder")}
        >
          <Plus className="size-4" /> New Resume
        </Button>
        <button className="relative grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent">
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
        </button>
        <ThemeToggle />
        <LanguageSwitcher />
        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-full p-0.5 hover:ring-2 hover:ring-primary/30">
              <Avatar className="size-8 border border-border">
                <AvatarImage src={session?.user?.image ?? undefined} alt={userName} />
                <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="size-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{userName}</span>
              <span className="text-xs text-muted-foreground">{session?.user?.email}</span>
              <span className="mt-1 inline-flex w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {plan} PLAN
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setModule("dashboard")} className="gap-2">
              <UserIcon className="size-4" /> Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setModule("admin")} className="gap-2">
              <Settings className="size-4" /> Admin Panel
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
