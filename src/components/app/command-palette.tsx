"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { MODULES, type ModuleId } from "@/lib/modules";
import { useAppStore } from "@/store/app-store";
import {
  Rocket,
  FileText,
  Search,
  Settings,
  Moon,
  Sun,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";

const QUICK_ACTIONS: { label: string; hint: string; icon: LucideIcon; action: string }[] = [
  { label: "Build Resume", hint: "Open the AI resume builder", icon: FileText, action: "resume-builder" },
  { label: "Ask AI Coach", hint: "Chat with your career AI", icon: Rocket, action: "coach" },
  { label: "Practice Coding", hint: "Open the coding IDE", icon: Search, action: "coding-practice" },
  { label: "Mock Interview", hint: "Start an AI mock interview", icon: Rocket, action: "mock-interview" },
  { label: "Go to Dashboard", hint: "View your career overview", icon: LayoutDashboard, action: "dashboard" },
];

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const setModule = useAppStore((s) => s.setModule);
  const { setTheme } = useTheme();

  React.useEffect(() => {
    const onToggle = () => setOpen((o) => !o);
    window.addEventListener("careeros:command-palette", onToggle);
    return () => window.removeEventListener("careeros:command-palette", onToggle);
  }, []);

  const go = (id: ModuleId) => {
    setModule(id);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search modules, actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          {QUICK_ACTIONS.map((a) => (
            <CommandItem
              key={a.action}
              onSelect={() => go(a.action as ModuleId)}
              className="gap-2"
            >
              <a.icon className="size-4 text-muted-foreground" />
              <span className="flex-1">{a.label}</span>
              <span className="text-xs text-muted-foreground">{a.hint}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Modules">
          {MODULES.filter((m) => m.id !== "admin").map((m) => {
            const Icon = m.icon;
            return (
              <CommandItem
                key={m.id}
                onSelect={() => go(m.id)}
                className="gap-2"
              >
                <Icon className="size-4 text-muted-foreground" />
                <span className="flex-1">{m.label}</span>
                <span className="text-xs text-muted-foreground">{m.description}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => { setTheme("light"); setOpen(false); }} className="gap-2">
            <Sun className="size-4 text-muted-foreground" /> Light Mode
          </CommandItem>
          <CommandItem onSelect={() => { setTheme("dark"); setOpen(false); }} className="gap-2">
            <Moon className="size-4 text-muted-foreground" /> Dark Mode
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
