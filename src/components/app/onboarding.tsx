"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Rocket, ArrowRight, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ROLES = [
  { id: "JOBSEEKER", label: "Job Seeker", desc: "Looking for my next role", icon: "🎯" },
  { id: "STUDENT", label: "Student", desc: "Preparing for placements", icon: "🎓" },
  { id: "PROFESSIONAL", label: "Professional", desc: "Growing my career", icon: "💼" },
  { id: "RECRUITER", label: "Recruiter / HR", desc: "Hiring talent", icon: "🧑‍💼" },
];

export function Onboarding() {
  const { update } = useSession();
  const [step, setStep] = React.useState(0);
  const [title, setTitle] = React.useState("");
  const [role, setRole] = React.useState("JOBSEEKER");
  const [loading, setLoading] = React.useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to complete onboarding");
      }
      // Update the client session so `onboarded` becomes true
      await update({ onboarded: true });
      toast.success("Welcome to CareerOS!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Onboarding failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3">
          <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-emerald-400 text-primary-foreground shadow-lg shadow-primary/20">
            <Rocket className="size-7" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Welcome to CareerOS</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Let&apos;s set up your account in seconds.
            </p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/40" : "w-4 bg-muted"
              )}
            />
          ))}
        </div>

        {/* Steps */}
        {step === 0 ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">What best describes you?</h2>
              <p className="text-sm text-muted-foreground">
                We&apos;ll tailor your experience accordingly.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-all hover:border-primary/40 hover:shadow-sm",
                    role === r.id && "border-primary bg-primary/5 ring-1 ring-primary"
                  )}
                >
                  <div className="text-2xl">{r.icon}</div>
                  <p className="mt-2 text-sm font-medium">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.desc}</p>
                  {role === r.id && (
                    <div className="mt-2 flex items-center gap-1 text-xs font-medium text-primary">
                      <Check className="size-3" /> Selected
                    </div>
                  )}
                </button>
              ))}
            </div>
            <Button className="w-full gap-1.5" onClick={() => setStep(1)}>
              Continue <ArrowRight className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">What&apos;s your professional title?</h2>
              <p className="text-sm text-muted-foreground">
                This helps us personalize your resume and dashboard.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Current or target title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="h-10"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button className="flex-1 gap-1.5" onClick={handleComplete} disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                Get started <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
